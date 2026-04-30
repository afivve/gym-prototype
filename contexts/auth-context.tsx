"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { type User, initialUsers } from "@/lib/mock/users";
import { generateId } from "@/lib/utils";
import type { RegisterInput } from "@/lib/validations";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => { success: boolean; message: string };
  logout: () => void;
  register: (data: RegisterInput) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = "gym_current_user";
const STORAGE_KEY_USERS = "gym_users";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted users or seed initial ones
  const getUsers = useCallback((): User[] => {
    if (typeof window === "undefined") return initialUsers;
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    if (stored) {
      try {
        return JSON.parse(stored) as User[];
      } catch {
        return initialUsers;
      }
    }
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(initialUsers));
    return initialUsers;
  }, []);

  const saveUsers = useCallback((users: User[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        try {
          const user = JSON.parse(stored) as User;
          // Re-validate user still exists
          const users = getUsers();
          const found = users.find((u) => u.id === user.id);
          if (found) setCurrentUser(found);
        } catch {
          localStorage.removeItem(STORAGE_KEY_USER);
        }
      }
    }
    setIsLoading(false);
  }, [getUsers]);

  const login = useCallback(
    (
      email: string,
      password: string,
    ): { success: boolean; message: string } => {
      const users = getUsers();
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password,
      );
      if (!user) {
        return { success: false, message: "Email atau password salah" };
      }
      setCurrentUser(user);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      }
      return { success: true, message: "Login berhasil" };
    },
    [getUsers],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, []);

  const register = useCallback(
    (data: RegisterInput): { success: boolean; message: string } => {
      const users = getUsers();
      const exists = users.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase(),
      );
      if (exists) {
        return { success: false, message: "Email sudah terdaftar" };
      }
      const newUser: User = {
        id: generateId("user"),
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "member",
        createdAt: new Date().toISOString(),
      };
      const updated = [...users, newUser];
      saveUsers(updated);
      setCurrentUser(newUser);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
      }
      return { success: true, message: "Registrasi berhasil" };
    },
    [getUsers, saveUsers],
  );

  return (
    <AuthContext.Provider
      value={{ currentUser, isLoading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
