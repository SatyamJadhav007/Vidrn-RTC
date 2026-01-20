import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";
// STUN servers for NAT traversal(ICE candidates)
const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

export const useVideoStore = create((set, get) => ({
  localStream: null, // My own video/audio streams
  remoteStream: null, // The other user's video/audio streams
  callStatus: null, // null | 'outgoing' | 'incoming' | 'connected' | 'ended'
  peer: null, // RTCPeerConnection instance
  incomingCall: null, // { from, signal } when there's an incoming call
  iceCandidatesQueue: [], // Queue of ICE candidates received before remote description is set
  callTargetId: null, // Track who we're calling/in call with

  initializeMedia: async () => {
    //If already initialized,return the existing stream(No Permission prompt again)
    if (get().localStream) return get().localStream;

    try {
      // Request access to camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      // Save the local stream in the state
      set({ localStream: stream });
      console.log("📹 Local stream initialized");
      return stream;
    } catch (error) {
      toast.error("Cannot access camera/microphone. Please check permissions.");
      console.error("Media access error:", error);
      throw error;
    }
  },

  makeCall: async (userId) => {
    try {
      // Initialize local media First...
      const stream = await get().initializeMedia();
      // Then set up the peer connection and signaling
      const socket = useAuthStore.getState().socket;

      const peer = new RTCPeerConnection(iceServers); // current user's peer connection
      const remoteStream = new MediaStream();
      set({ remoteStream, peer });

      // Add local tracks to peer connection(Only transffered after media is initialized and Handshake is done)
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      // Handle incoming remote tracks(after handshake is done setting is remote streams)
      peer.ontrack = (event) => {
        set((state) => {
          const newStream = state.remoteStream || new MediaStream();
          event.streams[0]
            .getTracks()
            .forEach((track) => newStream.addTrack(track));
          return { remoteStream: newStream };
        });
      };

      // Send ICE candidates to the other peer
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: userId,
          });
        }
      };

      // Monitoring connection state
      peer.onconnectionstatechange = () => {
        console.log("🔗 Connection state:", peer.connectionState);
        if (peer.connectionState === "connected") {
          set({ callStatus: "connected" });
        } else if (
          peer.connectionState === "disconnected" ||
          peer.connectionState === "failed"
        ) {
          get().endCall(); // clean up on disconnection
        }
      };

      // ICE connection state monitoring
      peer.oniceconnectionstatechange = () => {
        console.log("❄️ ICE state:", peer.iceConnectionState);
        if (peer.iceConnectionState === "failed") {
          toast.error("Connection failed. Please try again.");
          get().endCall();
        }
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer); // setting the SDP details for me.

      const authUserId = useAuthStore.getState().authUserId;
      socket.emit("call-user", {
        to: userId,
        from: authUserId,
        signal: offer, // SDP details for the callee
      });
      //Changing the call status and tracking who we're calling
      set({ callStatus: "outgoing", callTargetId: userId });
      console.log("📞 Calling user:", userId);
    } catch (error) {
      toast.error("Failed to start call");
      console.error("Call error:", error);
      get().endCall();
    }
  },

  handleIncomingCall: async ({ from, signal }) => {
    try {
      // I am getting called,so initialize my media first
      const stream = await get().initializeMedia();
      set({
        incomingCall: { from, signal },
        callStatus: "incoming",
        localStream: stream,
      });
    } catch (error) {
      console.error("Error handling incoming call:", error);
      get().endCall();
    }
  },

  answerCall: async () => {
    //GET who is calling me(userID) and the offer(SDP details)
    const { incomingCall } = get();
    if (!incomingCall) return;

    try {
      // Initialize media first->Create peer connection instance and set the remote description(offer) and the peer object.
      const localStream = await get().initializeMedia();
      const peer = new RTCPeerConnection(iceServers);
      const remoteStream = new MediaStream();
      set({ remoteStream, peer });

      // Add local tracks
      localStream.getTracks().forEach((track) => {
        peer.addTrack(track, localStream);
      });

      // Handle remote tracks(After handshake is done setting is remote streams)
      peer.ontrack = (event) => {
        set((state) => {
          const newStream = state.remoteStream || new MediaStream();
          event.streams[0]
            .getTracks()
            .forEach((track) => newStream.addTrack(track));
          return { remoteStream: newStream };
        });
      };

      const socket = useAuthStore.getState().socket;

      peer.onicecandidate = (event) => {
        // sending ice from the callee to the caller
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: incomingCall.from,
          });
        }
      };

      peer.onconnectionstatechange = () => {
        console.log("🔗 Connection state:", peer.connectionState);
        if (peer.connectionState === "connected") {
          set({ callStatus: "connected" });
        } else if (
          peer.connectionState === "disconnected" ||
          peer.connectionState === "failed"
        ) {
          get().endCall();
        }
      };

      peer.oniceconnectionstatechange = () => {
        if (peer.iceConnectionState === "failed") {
          toast.error("Connection failed. Please try again.");
          get().endCall();
        }
      };

      // Set remote description (the offer)
      await peer.setRemoteDescription(
        new RTCSessionDescription(incomingCall.signal),
      );

      // Process queued ICE candidates
      const { iceCandidatesQueue } = get();
      for (const candidate of iceCandidatesQueue) {
        //adding the queued candidates for the remote description(curr peer)
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
      set({ iceCandidatesQueue: [] });

      // Create and send answer
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer); //This is my SDP details and i am sending this to the caller after setting up my remote description.
      //Sending the local description(Answer SDP) to the caller
      socket.emit("answer-call", {
        to: incomingCall.from,
        signal: answer,
      });

      // Track whose call we answered
      const callerId = incomingCall.from;

      set({
        callStatus: "connected",
        incomingCall: null,
        callTargetId: callerId,
      });
      console.log("✅ Call answered");
    } catch (error) {
      console.error("Error answering call:", error);
      get().endCall();
    }
  },

  handleCallAnswered: async ({ signal }) => {
    const { peer } = get();
    if (!peer) return;

    try {
      await peer.setRemoteDescription(new RTCSessionDescription(signal));

      // Process queued ICE candidates
      const { iceCandidatesQueue } = get();
      for (const candidate of iceCandidatesQueue) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
      set({ iceCandidatesQueue: [] });

      console.log("✅ Remote description set from answer");
    } catch (error) {
      console.error("Error setting remote description:", error);
    }
  },

  handleIceCandidate: async ({ candidate }) => {
    const { peer } = get();
    if (!peer || !candidate) return;

    try {
      if (!peer.remoteDescription) {
        // Queue candidate until remote description is set
        set((state) => ({
          iceCandidatesQueue: [...state.iceCandidatesQueue, candidate],
        }));
        console.log("⏸️ Queued ICE candidate");
      } else {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("❄️ Added ICE candidate");
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  },

  // the the callee is rejecting the call.
  rejectCall: () => {
    // Decline an incoming call
    const { incomingCall } = get();
    if (!incomingCall) return;

    const socket = useAuthStore.getState().socket;
    socket.emit("end-call", { to: incomingCall.from });

    get().endCall();
  },

  // Called when user actively ends the call - notifies the other peer(Done by the caller or callee)
  endCall: () => {
    const { peer, localStream, remoteStream, callTargetId, incomingCall } =
      get();
    const socket = useAuthStore.getState().socket;

    // Determine who to notify - could be the call target or the incoming caller
    const targetToNotify = callTargetId || incomingCall?.from;

    if (peer) {
      peer.close();
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    set({
      peer: null,
      localStream: null,
      remoteStream: null,
      callStatus: "ended",
      incomingCall: null,
      iceCandidatesQueue: [],
      callTargetId: null,
    });

    // Notify the other peer that we're ending the call
    if (targetToNotify && socket) {
      socket.emit("end-call", { to: targetToNotify });
      console.log("📴 Call ended, notified:", targetToNotify);
    } else {
      console.log("📴 Call ended (no peer to notify)");
    }
  },

  // Called when receiving call-ended socket event - does NOT emit back
  handleCallEnded: () => {
    const { peer, localStream, remoteStream } = get();

    if (peer) {
      peer.close();
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    set({
      peer: null,
      localStream: null,
      remoteStream: null,
      callStatus: "ended",
      incomingCall: null,
      iceCandidatesQueue: [],
      callTargetId: null,
    });

    console.log("📴 Call ended by remote peer");
  },

  // Reset call status to null (for navigating away from call page)
  resetCallStatus: () => {
    set({ callStatus: null });
  },

  //Mute/Unmute the audio track(caller and callee both can do this)
  toggleMute: () => {
    const { localStream } = get();
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  },

  toggleVideo: () => {
    const { localStream } = get();
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  },
}));
