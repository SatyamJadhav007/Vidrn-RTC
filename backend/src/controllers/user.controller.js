import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import { getFromCache, setInCache, invalidateCache } from "../lib/redis.js";

// Cache TTLs (in seconds)
const CACHE_TTL = {
  RECOMMENDED_USERS: 5 * 60, // 5 minutes
  MY_FRIENDS: 10 * 60, // 10 minutes
  FRIEND_REQUESTS: 2 * 60, // 2 minutes
  OUTGOING_REQUESTS: 2 * 60, // 2 minutes
};

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const cacheKey = `recommended:${currentUserId}`;

    // Check cache first
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const currentUser = req.user;
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
        { isOnboarded: true },
      ],
    });

    // Cache the result
    await setInCache(cacheKey, recommendedUsers, CACHE_TTL.RECOMMENDED_USERS);

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const userId = req.user.id;
    const cacheKey = `friends:${userId}`;

    // Check cache first
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const user = await User.findById(userId)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage",
      );

    // Cache the result
    await setInCache(cacheKey, user.friends, CACHE_TTL.MY_FRIENDS);

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    // prevent sending req to yourself
    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // check if user is already friends
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    // check if a req already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({
          message: "A friend request already exists between you and this user",
        });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    // Invalidate caches for both users("to"'s outgoing reqs will change, "from"'s incoming reqs will change)
    await invalidateCache(
      `outgoing-reqs:${myId}`,
      `friend-reqs:${recipientId}`,
    );

    // Notify recipient in real-time if they are online
    const recipientSocketId = getReceiverSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("new-friend-request", { from: myId });
    }

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the other's friends array
    // $addToSet: adds elements to an array only if they do not already exist.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    const senderId = friendRequest.sender.toString();
    const recipientId = friendRequest.recipient.toString();

    // Invalidate caches for both users (friends lists, requests, recommended)
    await invalidateCache(
      `friends:${senderId}`,
      `friends:${recipientId}`,
      `friend-reqs:${recipientId}`,
      `outgoing-reqs:${senderId}`,
      `recommended:${senderId}`,
      `recommended:${recipientId}`,
    );

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const userId = req.user.id;
    const cacheKey = `friend-reqs:${userId}`;

    // Try cache first
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const incomingReqs = await FriendRequest.find({
      recipient: userId,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage",
    );

    const acceptedReqs = await FriendRequest.find({
      sender: userId,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    const result = { incomingReqs, acceptedReqs };

    // Cache the result
    await setInCache(cacheKey, result, CACHE_TTL.FRIEND_REQUESTS);

    res.status(200).json(result);
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const userId = req.user.id;
    const cacheKey = `outgoing-reqs:${userId}`;

    // Try cache first
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const outgoingRequests = await FriendRequest.find({
      sender: userId,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePic nativeLanguage learningLanguage",
    );

    // Cache the result
    await setInCache(cacheKey, outgoingRequests, CACHE_TTL.OUTGOING_REQUESTS);

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(
      "fullName profilePic nativeLanguage learningLanguage",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserById controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
