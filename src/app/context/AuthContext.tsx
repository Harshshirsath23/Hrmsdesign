import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getAccessToken,
  setAccessToken,
  setCompanyId,
  syncCompanyIdFromToken,
  parseAccessTokenClaims,
} from "../../api/attendanceClient";
import {
  clearAuthStorage,
  getTenantSchema,
  loginWithBackend,
  refreshAccessToken,
  setTenantSchema,
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

function roleFromEmail(email: string, selectedRole: UserRole): UserRole {
  const e = email.toLowerCase();
  if (e === "admin@hrms.com") return "admin";
  if (e === "manager@hrms.com") return "manager";
  if (e === "emp001@company.com") return "employee";
  return selectedRole;
}

function displayName(email: string, tokenData: Record<string, unknown> | null): string {
  if (tokenData?.employee_code) {
    return String(tokenData.employee_code);
  }
  return email.split("@")[0].replace(/[._]/g, " ");
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("hrms_user");
      const token = localStorage.getItem("hrms_access_token");
      if (!stored || !token) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const schema = getTenantSchema();
    setTenantSchema(schema);

    const bootstrap = async () => {
      try {
        let token = getAccessToken();
        if (!token) return;

        let claims = parseAccessTokenClaims();
        const exp = typeof claims?.exp === "number" ? claims.exp : null;
        const isExpired = exp !== null && exp * 1000 < Date.now() + 60_000;

        if (isExpired) {
          const refresh = localStorage.getItem("hrms_refresh_token");
          if (refresh) {
            const next = await refreshAccessToken(refresh);
            if (!next) {
              clearAuthStorage();
              setUser(null);
              return;
            }
            token = next;
            claims = parseAccessTokenClaims();
          } else {
            clearAuthStorage();
            setUser(null);
            return;
          }
        }

        if (!claims) {
          clearAuthStorage();
          setUser(null);
          return;
        }

        setAccessToken(token);
        syncCompanyIdFromToken();
      } catch {
        clearAuthStorage();
        setUser(null);
      }
    };

    void bootstrap();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    const result = await loginWithBackend(email, password);

    if (!result.success || !result.data?.access) {
      return {
        success: false,
        message:
          result.message ||
          "Login failed. Ensure the backend is running and demo users are seeded (python manage.py seed_demo_users --schema acme).",
      };
    }

    const { access, refresh } = result.data;
    setAccessToken(access);
    localStorage.setItem("hrms_access_token", access);
    localStorage.setItem("hrms_refresh_token", refresh);

    const tokenData = parseAccessTokenClaims();
    const companyId = tokenData?.company_id ? String(tokenData.company_id) : undefined;
    const employeeId = tokenData?.employee_id ? String(tokenData.employee_id) : undefined;

    if (!companyId || !employeeId) {
      localStorage.removeItem("hrms_access_token");
      localStorage.removeItem("hrms_refresh_token");
      return {
        success: false,
        message:
          "Login succeeded but your account has no employee profile. Run: python manage.py seed_demo_users --schema acme",
      };
    }

    if (companyId) {
      setCompanyId(companyId);
      localStorage.setItem("hrms_company_id", companyId);
    }

    const resolvedRole = roleFromEmail(email, role);
    const userData: AuthUser = {
      email,
      role: resolvedRole,
      name: displayName(email, tokenData),
      initials: email.charAt(0).toUpperCase(),
      employeeId,
      companyId,
    };

    setUser(userData);
    localStorage.setItem("hrms_user", JSON.stringify(userData));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    clearAuthStorage();
  };

  const isAuthenticated = Boolean(user && getAccessToken());

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
