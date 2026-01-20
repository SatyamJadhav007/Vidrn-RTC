import { PhoneIcon, PhoneOffIcon } from "lucide-react";
import { useVideoStore } from "../../store/useVideoStore";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import { getProfilePicUrl } from "../../lib/profilePic";

const IncomingCallModal = () => {
  const { incomingCall, callStatus, answerCall, rejectCall } = useVideoStore();
  const navigate = useNavigate();
  const [callerInfo, setCallerInfo] = useState(null);

  useEffect(() => {
    // Fetch caller info when there's an incoming call
    const fetchCallerInfo = async () => {
      if (incomingCall?.from) {
        try {
          const res = await axiosInstance.get(`/users/${incomingCall.from}`);
          setCallerInfo(res.data);
        } catch (error) {
          console.error("Error fetching caller info:", error);
        }
      }
    };

    fetchCallerInfo();
  }, [incomingCall?.from]);
  //Show modal only for incoming calls
  if (callStatus !== "incoming" || !incomingCall) return null;

  const handleAccept = () => {
    answerCall();
    navigate(`/call/${incomingCall.from}`);
  };

  const handleReject = () => {
    rejectCall();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-base-100 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-pulse-slow">
        <div className="text-center">
          {/* Caller avatar */}
          <div className="relative mx-auto w-24 h-24 mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-success ring-offset-2 ring-offset-base-100 animate-pulse">
              {callerInfo?.profilePic ? (
                <img
                  src={getProfilePicUrl(callerInfo.profilePic)}
                  alt={callerInfo.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <PhoneIcon className="w-10 h-10 text-primary-content" />
                </div>
              )}
            </div>
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 rounded-full ring-4 ring-success/50 animate-ping" />
          </div>

          {/* Caller name */}
          <h3 className="text-xl font-bold mb-1">
            {callerInfo?.fullName || "Unknown Caller"}
          </h3>
          <p className="text-base-content/70 mb-6">Incoming Video Call...</p>

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleReject}
              className="btn btn-circle btn-lg btn-error"
            >
              <PhoneOffIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleAccept}
              className="btn btn-circle btn-lg btn-success"
            >
              <PhoneIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
