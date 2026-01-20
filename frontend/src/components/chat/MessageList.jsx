import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import useAuthUser from "../../hooks/useAuthUser";

const MessageList = ({ messages, isLoading }) => {
  // Ref to the end of messages for auto-scrolling back to bottom
  const messagesEndRef = useRef(null);
  const { authUser } = useAuthUser();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-base-content/50">
        <div className="text-6xl mb-4">💬</div>
        <p className="text-lg">No messages yet</p>
        <p className="text-sm">Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {messages.map((message) => (
        <MessageBubble
          key={message._id}
          message={message}
          isOwn={message.from === authUser?._id}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
