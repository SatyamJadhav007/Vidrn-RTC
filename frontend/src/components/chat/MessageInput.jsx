import { useState } from "react";
import { SendIcon } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

// This is the input box at the bottom of the chat for sending messages
const MessageInput = () => {
  // Didn't used react-query(Mutation to be precise) as the message sending is supposed to be real-time.
  const [text, setText] = useState("");
  const { sendMessage, selectedUser } = useChatStore();
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser || isSending) return;

    setIsSending(true);
    try {
      await sendMessage({ text: text.trim() });
      setText("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 border-t border-base-300 bg-base-200">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="input input-bordered flex-1 focus:outline-none"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="btn btn-primary btn-circle"
        >
          {isSending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <SendIcon className="size-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
