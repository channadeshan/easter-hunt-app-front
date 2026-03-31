import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import ScannerPage from "./pages/ScannerPage";
import Spinner from "./components/Spinner";
import InstallPrompt from "./components/InstallPrompt";
import OfflineBanner from "./components/OfflineBanner";
import socket from "./socket";

// ─── Socket lifecycle manager ─────────────────────────────────────────────────
// Lives here — at the top of the app — so the connection is created ONCE and
// stays alive as the user navigates between pages. It is never re-created when
// tabs/components mount or unmount. This is the fix for ghost connections.
function SocketManager() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Connect only when the user is actually logged in
      if (!socket.connected) socket.connect();
    } else {
      // Disconnect cleanly when logged out / session expires
      if (socket.connected) socket.disconnect();
    }
    // No cleanup disconnect here — we WANT the socket to outlive this effect
    // and stay connected while the user is navigating the authenticated app.
  }, [isAuthenticated]);

  return null; // renders nothing — purely manages the socket lifecycle
}

// ─── Boot check + route guard ─────────────────────────────────────────────────
function AppRoutes() {
  const { isAuthenticated, role, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (role === "organizer") navigate("/admin", { replace: true });
      else if (role === "participant") navigate("/play", { replace: true });
    }
  }, [isLoading, isAuthenticated, role]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hunt-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-float">🥚</div>
          <Spinner size="md" />
          <p className="text-gray-500 font-body text-sm">Loading the hunt...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={role === "organizer" ? "/admin" : "/play"} replace />
          ) : (
            <LandingPage />
          )
        }
      />

      {/* Admin only */}
      <Route
        path="/admin"
        element={
          isAuthenticated && role === "organizer" ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Participant only */}
      <Route
        path="/play"
        element={
          isAuthenticated && role === "participant" ? (
            <ParticipantDashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/play/scan"
        element={
          isAuthenticated && role === "participant" ? (
            <ScannerPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <SocketManager />
        <OfflineBanner />
        <AppRoutes />
        <InstallPrompt />
      </BrowserRouter>
    </AuthProvider>
  );
}
