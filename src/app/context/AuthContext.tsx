import React, { createContext, useContext, useState } from "react";

export type UserRole = "admin" | "employee";

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
  initials: string;
  employeeId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const DUMMY_CREDENTIALS: Record<UserRole, { email: string; password: string; name: string; initials: string; employeeId?: string }> = {
  admin: {
    email: "admin@hrms.com",
    password: "Admin@123",
    name: "Admin User",
    initials: "AD",
  },
  employee: {
    email: "emp001@company.com",
    password: "Emp@123",
    name: "Arjun Sharma",
    initials: "AS",
    employeeId: "1",
  },
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("hrms_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string, role: UserRole) => {
    const cred = DUMMY_CREDENTIALS[role];
    if (email.trim().toLowerCase() === cred.email && password === cred.password) {
      const userData: AuthUser = {
        email: cred.email,
        role,
        name: cred.name,
        initials: cred.initials,
        employeeId: cred.employeeId,
      };
      setUser(userData);
      localStorage.setItem("hrms_user", JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: "Invalid email or password for the selected role." };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hrms_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
