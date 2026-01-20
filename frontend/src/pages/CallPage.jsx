import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useVideoStore } from "../store/useVideoStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getProfilePicUrl } from "../lib/profilePic";

import PageLoader from "../components/PageLoader";
import VideoPlayer from "../components/video/VideoPlayer";
import CallControls from "../components/video/CallControls";

const CallPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const { authUser, isLoading: authLoading } = useAuthUser();
  const { socket } = useAuthStore();
  const {
    localStream,
    remoteStream,
    callStatus,
    handleCallAnswered,
    handleIceCandidate,
    handleCallEnded,
    endCall,
    resetCallStatus,
  } = useVideoStore();

  const [targetUser, setTargetUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch target user info
  useEffect(() => {
    const fetchTargetUser = async () => {
      if (!targetUserId) return;

      try {
        const res = await axiosInstance.get("/users/friends");
        const friend = res.data.find((f) => f._id === targetUserId);
        if (friend) {
          setTargetUser(friend);
        }
      } catch (error) {
        console.error("Error fetching target user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTargetUser();
  }, [targetUserId]);

  // Set up socket listeners for call events
  useEffect(() => {
    if (!socket) return;

    socket.on("call-answered", handleCallAnswered);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", () => {
      toast.info("Call ended by remote user");
      handleCallEnded();
    });

    return () => {
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-ended");
    };
  }, [socket, handleCallAnswered, handleIceCandidate, handleCallEnded]);

  // Handle navigation after call ends
  useEffect(() => {
    if (callStatus === "ended") {
      const timeout = setTimeout(() => {
        resetCallStatus();
        navigate("/");
      }, 2000); // Show "Call ended" for 2 seconds before navigating
      return () => clearTimeout(timeout);
    }
  }, [callStatus, navigate, resetCallStatus]);

  if (authLoading || isLoading) return <PageLoader />;

  const getStatusText = () => {
    switch (callStatus) {
      case "outgoing":
        return "Calling...";
      case "incoming":
        return "Incoming call...";
      case "connected":
        return "Connected";
      case "ended":
        return "Call ended";
      default:
        return "Initializing...";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-base-300">
      {/* Header */}
      <div className="p-4 bg-base-200 border-b border-base-300">
        <div className="flex items-center gap-3">
          {targetUser && (
            <>
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img
                    src={getProfilePicUrl(targetUser.profilePic)}
                    alt={targetUser.fullName}
                  />
                </div>
              </div>
              <div>
                <h3 className="font-semibold">{targetUser.fullName}</h3>
                <p className="text-sm text-base-content/70">
                  {getStatusText()}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 p-4">
        <div className="flex flex-col md:flex-row gap-4 h-full">
          {/* Local video */}
          <div className="flex-1 h-1/2 md:h-full bg-black rounded-xl overflow-hidden">
            <VideoPlayer stream={localStream} muted={true} label="You" />
          </div>

          {/* Remote video */}
          <div className="flex-1 h-1/2 md:h-full bg-black rounded-xl overflow-hidden">
            <VideoPlayer
              stream={remoteStream}
              label={targetUser?.fullName || "Remote"}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-base-200 border-t border-base-300">
        <CallControls />
      </div>
    </div>
  );
};

export default CallPage;
