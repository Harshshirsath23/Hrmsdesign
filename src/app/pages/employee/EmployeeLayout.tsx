import { useState } from "react";
import { Outlet, useNavigate, Navigate, useLocation } from "react-router";
import {
  LayoutDashboard, Clock, CalendarDays, Wallet, Coffee,
  FileText, Bell, LogOut, Building2, ChevronRight, Menu, UserRoundCog,
  Sun, Moon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",  path: "/employee/dashboard" },
  { icon: UserRoundCog,    label: "My Profile", path: "/employee/profile"   },
  { icon: Clock,           label: "Attendance", path: "/employee/attendance" },
  { icon: CalendarDays,    label: "My Leaves",  path: "/employee/leaves"    },
  { icon: Wallet,          label: "Payslips",   path: "/employee/payslips"  },
  { icon: Coffee,          label: "Canteen",    path: "/employee/canteen"   },
  { icon: FileText,        label: "Documents",  path: "/employee/documents" },
];

export function EmployeeLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme }           = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!isAuthenticated || user?.role !== "employee") {
    return <Navigate to="/login" replace />;
  }

  const isActive   = (path: string) => location.pathname === path;
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };
  const currentPage = NAV_ITEMS.find((n) => isActive(n.path))?.label ?? "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`flex flex-col flex-shrink-0 bg-card border-r border-border
          transition-all duration-200 ease-in-out overflow-hidden
          ${collapsed ? "w-[72px]" : "w-60"}`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center flex-shrink-0 border-b border-border
          ${collapsed ? "justify-center px-0" : "px-5 gap-3"}`}>
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground leading-tight">
                HR<span className="text-muted-foreground">MS</span>
              </p>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">
                Employee Portal
              </p>
            </div>
          )}
        </div>

        {/* Nav section label */}
        {!collapsed && (
          <p className="px-5 pt-6 pb-2 text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">
            Navigation
          </p>
        )}

        {/* Nav items */}
        <nav className={`flex-1 overflow-y-auto space-y-0.5 ${collapsed ? "px-3 pt-4" : "px-3"}`}>
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 relative
                  ${active
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }
                  ${collapsed ? "justify-center" : ""}`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground rounded-r-full" />
                )}
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
                {!collapsed && active && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-3 pb-3 border-t border-border pt-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              text-muted-foreground hover:bg-secondary hover:text-foreground
              transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User */}
        <div className="border-t border-border p-3">
          {collapsed ? (
            <button
              onClick={handleLogout}
              title="Logout"
              className="w-full flex items-center justify-center py-2.5 rounded-lg
                text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          ) : (
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-foreground text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {user?.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">Employee</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-border transition-colors flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h1 className="text-base font-semibold text-foreground">{currentPage}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long", day: "2-digit", month: "long", year: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border
                text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border
              text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-foreground" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-border bg-secondary">
              <div className="w-7 h-7 rounded-md bg-foreground text-primary-foreground flex items-center justify-center text-xs font-bold">
                {user?.initials}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
