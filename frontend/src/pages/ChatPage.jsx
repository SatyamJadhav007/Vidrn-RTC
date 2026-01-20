import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import ChatContainer from "../components/chat/ChatContainer";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const { authUser } = useAuthUser();
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTargetUser = async () => {
      if (!targetUserId) return;

      try {
        // Fetch user from friends endpoint
        const res = await axiosInstance.get("/users/friends");
        const friend = res.data.find((f) => f._id === targetUserId);

        if (friend) {
          setTargetUser(friend);
        } else {
          toast.error("User not found in your friends list");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Could not load user. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTargetUser();
  }, [targetUserId]);

  if (loading || !authUser) return <ChatLoader />;

  // For invalid user ids
  if (!targetUser) {
    return (
      <div className="h-[93vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">User not found</p>
          <a href="/" className="btn btn-primary">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return <ChatContainer user={targetUser} />;
};

export default ChatPage;
