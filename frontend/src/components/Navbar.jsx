import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import useNotifications from "../hooks/useNotifications";
import { useAuthStore } from "../store/useAuthStore";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { getProfilePicUrl } from "../lib/profilePic";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const { logoutMutation } = useLogout();
  const { hasNotifications } = useNotifications();
  const { socket } = useAuthStore();
  const queryClient = useQueryClient();

  // Listen for real-time friend request notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewFriendRequest = () => {
      // Invalidate the friendRequests query to refetch and update the indicator
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    };

    socket.on("new-friend-request", handleNewFriendRequest);

    return () => {
      socket.off("new-friend-request", handleNewFriendRequest);
    };
  }, [socket, queryClient]);

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="pl-5">
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
                  Vidrn
                </span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle relative">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                {/* Green dot indicator for pending notifications */}
                {hasNotifications && (
                  <span className="absolute top-1 right-1 size-2.5 rounded-full bg-success border-2 border-base-200" />
                )}
              </button>
            </Link>
          </div>
          {/* Theme Selector Component */}
          <ThemeSelector />

          <div className="avatar">
            <div className="w-9 rounded-full">
              <img
                src={getProfilePicUrl(authUser?.profilePic)}
                alt="User Avatar"
                rel="noreferrer"
              />
            </div>
          </div>

          {/* Logout button */}
          <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
