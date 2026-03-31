/// <reference types="vite/client" />
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ─── Base URLs ────────────────────────────────────────────────────────────────
// In development (`npm run dev`), Vite proxies /api/admin, /api/parti, and
// /socket.io to the backend at port 5050. Using relative paths here means all
// requests are same-origin → no CORS header required.
//
// In production, set these env vars to the full backend URL:
//   VITE_ADMIN_API_URL=https://your-backend.com/api/admin
//   VITE_PARTI_API_URL=https://your-backend.com/api/parti
//   VITE_SOCKET_URL=https://your-backend.com
//
// Leave them unset during local dev — the proxy handles it automatically.
export const ADMIN_API = import.meta.env.VITE_ADMIN_API_URL || "/api/admin";
export const PARTI_API = import.meta.env.VITE_PARTI_API_URL || "/api/parti";
export const AUTH_API = import.meta.env.VITE_AUTH_API_URL || "/api/auth";
export const BASE_URL = import.meta.env.VITE_BASE_URL || "/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

export type Role = "organizer" | "participant" | null;

interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  isLoading: boolean;
  user: User | null;
}

export interface User {
  username: string;
  emojiUrl: string;
}

interface AuthContextType extends AuthState {
  checkStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    isLoading: true,
    user: null,
  });

  const checkStatus = async () => {
    try {
      const res = await fetch(`${AUTH_API}/status`, {
        credentials: "include",
      });
      const data = await res.json();
      setState({
        isAuthenticated: data.isAuthenticated ?? false,
        role: data.role ?? null,
        user: data.user ?? null,
        isLoading: false,
      });
    } catch {
      setState({
        isAuthenticated: false,
        role: null,
        isLoading: false,
        user: null,
      });
    }
  };

  const logout = async () => {
    try {
      await fetch(`${ADMIN_API}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setState({
        isAuthenticated: false,
        role: null,
        isLoading: false,
        user: null,
      });
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, checkStatus, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
