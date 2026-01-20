import { Navigate, Route, Routes } from "react-router";
import { useEffect } from "react";

// All Pages
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
//UI component(Toast)
import { Toaster } from "react-hot-toast";
// Hooks and Stores for the application
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import { useAuthStore } from "./store/useAuthStore.js";
import { useVideoStore } from "./store/useVideoStore.js";
import IncomingCallModal from "./components/video/IncomingCallModal.jsx";
//We are using WebSockets on application level to notify the login user about the video call notification
const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();
  const { socket, connectSocket, disconnectSocket } = useAuthStore();
  const { handleIncomingCall, callStatus } = useVideoStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  // Connect socket when user is authenticated
  useEffect(() => {
    if (authUser?._id) {
      connectSocket(authUser._id);
    }

    return () => {
      disconnectSocket();
    };
  }, [authUser?._id, connectSocket, disconnectSocket]);

  // Listen for incoming calls(Global listener)
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", handleIncomingCall);

    return () => {
      socket.off("incoming-call");
    };
  }, [socket, handleIncomingCall]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignUpPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <NotificationsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <CallPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      {/* Global incoming call modal */}
      {callStatus === "incoming" && <IncomingCallModal />}

      <Toaster />
    </div>
  );
};

export default App;
