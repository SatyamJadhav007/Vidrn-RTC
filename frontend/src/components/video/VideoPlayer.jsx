import { useEffect, useRef } from "react";

const VideoPlayer = ({ stream, muted = false, label }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    //Assign stream to video element
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-base-300 rounded-xl overflow-hidden">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-base-content/50">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg mb-2" />
            <p>Connecting...</p>
          </div>
        </div>
      )}

      {label && (
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-lg text-sm text-white">
          {label}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
