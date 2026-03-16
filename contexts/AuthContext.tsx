'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pb";
import { toast } from "@/components/ui/use-toast";

export type UserRole = "admin" | "author" | "user";

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  role?: UserRole;
  avatar?: string;
  allowedCategories?: string[];
}

interface AuthContextType {
  ready: boolean;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthor: boolean;
  isStaff: boolean;
  loginWithPassword: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthUser(model: unknown): AuthUser | null {
  const m = model as Record<string, unknown> | null;
  if (!m) return null;
  if (!model) return null;
  return {
    id: String(m.id ?? ""),
    email: typeof m.email === "string" ? m.email : undefined,
    name: typeof m.name === "string" ? m.name : undefined,
    role: (m.role as UserRole | undefined),
    avatar: typeof m.avatar === "string" ? m.avatar : undefined,
    allowedCategories: Array.isArray(m.allowedCategories)
      ? (m.allowedCategories.filter((x) => typeof x === "string") as string[])
      : undefined,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Initialize user from authStore on mount (client-side only)
    setUser(pb.authStore.isValid ? toAuthUser(pb.authStore.model) : null);
    setReady(true);

    const unsub = pb.authStore.onChange(() => {
      setUser(pb.authStore.isValid ? toAuthUser(pb.authStore.model) : null);
    }, true);

    return () => {
      unsub();
    };
  }, []);

  const isAuthenticated = useMemo(() => !!user && pb.authStore.isValid, [user]);
  const isAdmin = useMemo(() => user?.role === "admin", [user?.role]);
  const isAuthor = useMemo(() => user?.role === "author", [user?.role]);
  const isStaff = useMemo(() => user?.role === "admin" || user?.role === "author", [user?.role]);

  const loginWithPassword = async (email: string, password: string) => {
    const authData = await pb.collection("users").authWithPassword(email, password);
    const nextUser = toAuthUser(authData.record) ?? toAuthUser(pb.authStore.model);
    if (!nextUser) throw new Error("Login failed");
    setUser(nextUser);
    // Persist auth to cookie so server components can read it
    document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
    return nextUser;
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
    // Clear auth cookie
    document.cookie = 'pb_auth=; path=/; max-age=0';
    router.push("/");
    toast({
      title: "Đã đăng xuất",
      description: "Hẹn gặp lại bạn.",
    });
  };

  return (
    <AuthContext.Provider value={{ ready, user, isAuthenticated, isAdmin, isAuthor, isStaff, loginWithPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
