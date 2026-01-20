import { Trash2Icon } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

// This is the UI for each individual message bubble in the chat
const MessageBubble = ({ message, isOwn }) => {
  // deleteAction is tied to each message(Only for own messages)
  const { deleteMessage } = useChatStore();

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`group relative max-w-[70%] px-4 py-2 rounded-2xl ${
          isOwn
            ? "bg-primary text-primary-content rounded-br-md"
            : "bg-base-200 text-base-content rounded-bl-md"
        }`}
      >
        <p className="break-words">{message.text}</p>
        <div
          className={`flex items-center gap-2 mt-1 text-xs ${
            isOwn ? "text-primary-content/70" : "text-base-content/50"
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>

          {/* Delete button - only for own messages */}
          {isOwn && (
            <button
              onClick={() => deleteMessage(message._id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-error"
              title="Delete message"
            >
              <Trash2Icon className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
