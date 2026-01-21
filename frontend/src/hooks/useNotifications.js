import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

/**
 * Hook to check if user has unread notifications (incoming friend requests only).
 * Accepted requests are informational and don't trigger the indicator.
 */
const useNotifications = () => {
  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
  });

  // Only incoming requests count as "unread" notifications
  const incomingRequests = friendRequests?.incomingReqs || [];
  const hasNotifications = incomingRequests.length > 0;

  return {
    hasNotifications,
    notificationCount: incomingRequests.length,
    isLoading,
  };
};

export default useNotifications;
