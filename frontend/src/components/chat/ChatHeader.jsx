import { ArrowLeftIcon, VideoIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useVideoStore } from "../../store/useVideoStore";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";
import { getProfilePicUrl } from "../../lib/profilePic";

const ChatHeader = ({ user, isOnline }) => {
  const navigate = useNavigate();
  const { makeCall, callStatus } = useVideoStore();
  const { isUserOnline } = useAuthStore();

  const handleVideoCall = () => {
    if (!isUserOnline(user._id)) {
      toast.error("User is offline. Cannot start a video call.");
      return;
    }
    
    makeCall(user._id);
    navigate(`/call/${user._id}`);
  };

  return (
    <div className="p-4 border-b border-base-300 bg-base-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <Link to="/" className="btn btn-ghost btn-sm btn-circle">
            <ArrowLeftIcon className="size-5" />
          </Link>

          {/* User avatar */}
          <div className="relative">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src={getProfilePicUrl(user.profilePic)} alt={user.fullName} />
              </div>
            </div>
            {/* Online indicator */}
            {isOnline && (
              <span className="absolute bottom-0 right-0 size-3 rounded-full bg-success border-2 border-base-200" />
            )}
          </div>

          {/* User info */}
          <div>
            <h3 className="font-semibold">{user.fullName}</h3>
            <p className={`text-xs ${isOnline ? "text-success" : "text-base-content/50"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Video call button */}
        <button
          onClick={handleVideoCall}
          disabled={!isOnline || callStatus !== null}
          className={`btn btn-circle ${isOnline ? "btn-primary" : "btn-disabled"}`}
          title={isOnline ? "Start video call" : "User is offline"}
        >
          <VideoIcon className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
