import React, { createContext, useContext, useState } from "react";
import {
  clearAuthStorage,
  loginWithBackend,
  type LoginResponse,
} from "../../api/authClient";

export type UserRole = "admin" | "manager" | "employee";

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
  initials: string;
  employeeId?: string;
  companyId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const BACKEND_ROLE_TO_UI: Record<string, UserRole> = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "??";
  return parts
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function resolveBackendRole(data: LoginResponse, selectedRole: UserRole): UserRole | null {
  const fromType = data.user_type ? BACKEND_ROLE_TO_UI[data.user_type] : undefined;
  if (fromType) return fromType;

  const roleCodes = (data.roles ?? [])
    .map((r) => r.role_code)
    .filter(Boolean) as string[];

  if (roleCodes.includes("ADMIN")) return "admin";
  if (roleCodes.some((c) => c === "HR_MANAGER" || c === "MANAGER")) return "manager";
  if (roleCodes.includes("EMPLOYEE")) return "employee";

  if (selectedRole === "admin") return "admin";
  return "employee";
}

function buildAuthUser(
  data: LoginResponse,
  email: string,
  role: UserRole,
): AuthUser {
  const profile = data.user;
  const name =
    profile?.full_name?.trim() ||
    profile?.email ||
    email;

  return {
    email: profile?.email ?? email,
    role,
    name,
    initials: initialsFromName(name),
    employeeId: profile?.employee_code ?? profile?.employee_id,
    companyId: profile?.company_id,
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const token = localStorage.getItem("hrms_access_token");
      const stored = localStorage.getItem("hrms_user");
      if (!token || !stored) return null;
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string, role: UserRole) => {
    const result = await loginWithBackend(email, password);

    if (!result.success || !result.data) {
      return { success: false, message: result.message ?? "Login failed." };
    }

    const data = result.data;
    const backendRole = resolveBackendRole(data, role);

    if (!backendRole || backendRole !== role) {
      clearAuthStorage();
      const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
      return {
        success: false,
        message: `This account is not authorized as ${roleLabel}. Select the correct role or use another account.`,
      };
    }

    localStorage.setItem("hrms_access_token", data.access);
    localStorage.setItem("hrms_refresh_token", data.refresh);

    const userData = buildAuthUser(data, email.trim().toLowerCase(), role);
    if (userData.companyId) {
      localStorage.setItem("hrms_company_id", userData.companyId);
    }

    setUser(userData);
    localStorage.setItem("hrms_user", JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    clearAuthStorage();
  };

  const isAuthenticated =
    !!user && !!localStorage.getItem("hrms_access_token");

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
