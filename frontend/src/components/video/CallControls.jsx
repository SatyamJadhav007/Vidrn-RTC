import { useState } from "react";
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, PhoneOffIcon } from "lucide-react";
import { useVideoStore } from "../../store/useVideoStore";

const CallControls = () => {
  const { endCall, toggleMute, toggleVideo } = useVideoStore();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleToggleMute = () => {
    const isEnabled = toggleMute();
    setIsMuted(!isEnabled);
  };

  const handleToggleVideo = () => {
    const isEnabled = toggleVideo();
    setIsVideoOff(!isEnabled);
  };

  const handleEndCall = () => {
    endCall();
    // Navigation is handled by CallPage after callStatus changes to "ended"
  };

  return (
    <div className="flex items-center justify-center gap-4 p-4">
      {/* Mute toggle */}
      <button
        onClick={handleToggleMute}
        className={`btn btn-circle btn-lg ${isMuted ? "btn-warning" : "btn-ghost bg-base-300"}`}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <MicOffIcon className="w-6 h-6" />
        ) : (
          <MicIcon className="w-6 h-6" />
        )}
      </button>

      {/* Video toggle */}
      <button
        onClick={handleToggleVideo}
        className={`btn btn-circle btn-lg ${isVideoOff ? "btn-warning" : "btn-ghost bg-base-300"}`}
        title={isVideoOff ? "Turn on camera" : "Turn off camera"}
      >
        {isVideoOff ? (
          <VideoOffIcon className="w-6 h-6" />
        ) : (
          <VideoIcon className="w-6 h-6" />
        )}
      </button>

      {/* End call */}
      <button
        onClick={handleEndCall}
        className="btn btn-circle btn-lg btn-error"
        title="End call"
      >
        <PhoneOffIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default CallControls;
