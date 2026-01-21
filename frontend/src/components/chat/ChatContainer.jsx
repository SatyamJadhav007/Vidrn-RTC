import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatContainer = ({ user }) => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    setSelectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { isUserOnline } = useAuthStore();
  const isOnline = isUserOnline(user._id);

  //OnMount: set selected user,fetch messages and push the events to the other user if he is online.
  useEffect(() => {
    setSelectedUser(user);
    getMessages(user._id);
    subscribeToMessages();
    // cleanup on unmount(i.e. changing the chat)
    return () => {
      unsubscribeFromMessages();
    };
  }, [
    user._id,
    setSelectedUser,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-base-100">
      <ChatHeader user={user} isOnline={isOnline} />

      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isMessagesLoading} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
