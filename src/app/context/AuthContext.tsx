import React, {
  createContext,
  useContext,
  useState,
} from "react";
 
export type UserRole = "admin" | "manager" | "employee";
 
export interface AuthUser {
  id?: number;
  email: string;
  role?: UserRole;
  name?: string;
  initials?: string;
  employeeId?: string;
  employeeCode?: string;
}
 
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (
    email: string,
    password: string,
    role?: UserRole
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}
 
const AuthContext = createContext<AuthContextType | null>(null);
 
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://acme.localhost:8000";
 
const AUTH_API_URL = `${API_BASE_URL}/api/employee`;
 
function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem("hrms_user");
  if (!raw) return null;
 
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem("hrms_user");
    return null;
  }
}
 
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split(".")[1];
    if (!payload) return {};
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return {};
  }
}
 
function stringClaim(
  claims: Record<string, unknown>,
  key: string
): string | undefined {
  const value = claims[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}
 
function initialsFromName(name: string): string {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
}
 
export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("hrms_access_token")
  );
  const [loading] = useState(false);
 
  const login = async (
    email: string,
    password: string,
    role?: UserRole
  ) => {
    try {
      const response = await fetch(`${AUTH_API_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });
 
      let data: any = {};
      try {
        data = await response.json();
      } catch {
        // ignore
      }
 
      if (!response.ok) {
        return {
          success: false,
          message:
            data?.detail ||
            (data?.message as string) ||
            "Invalid credentials",
        };
      }
 
      localStorage.setItem("hrms_access_token", data.access);
      localStorage.setItem("hrms_refresh_token", data.refresh);
      setToken(data.access);
 
      const claims = decodeJwtPayload(data.access);
      const employeeCode = stringClaim(claims, "employee_code");
      const employeeId = stringClaim(claims, "employee_id");
      const userId = Number(stringClaim(claims, "user_id"));
      const displayName = employeeCode ?? email.split("@")[0];
 
      const userData: AuthUser = {
        id: Number.isFinite(userId) ? userId : undefined,
        email: stringClaim(claims, "email") ?? email,
        role,
        name: displayName,
        initials: initialsFromName(displayName),
        employeeId,
        employeeCode,
      };
 
      setUser(userData);
      localStorage.setItem("hrms_user", JSON.stringify(userData));
 
      return { success: true };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Something went wrong",
      };
    }
  };
 
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("hrms_user");
    localStorage.removeItem("hrms_access_token");
    localStorage.removeItem("hrms_refresh_token");
  };
 
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
 
export function useAuth() {
  const context = useContext(AuthContext);
 
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
 
  return context;
}