import { useState } from "react";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Wallet,
  FileText,
  Bell,
  Building2,
  LogOut,
  Menu,
  ChevronRight,
  Sun,
  Moon,
  ClipboardCheck,
  Settings2,
  Search,
  Mail,
  Megaphone,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { EmployeeProvider } from "../../context/EmployeeContext";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Employees", path: "/admin/employees" },
  { icon: Clock, label: "Attendance", path: "/admin/attendance" },
  { icon: CalendarDays, label: "Leave", path: "/admin/leave" },
  { icon: Wallet, label: "Payroll", path: "/admin/payroll" },
  { icon: Mail, label: "Letters & Policies", path: "/admin/letters-policies" },
  { icon: Megaphone, label: "Communication Center", path: "/admin/communication-center" },
  { icon: FileText, label: "Documents", path: "/admin/documents" },
  { icon: Settings2, label: "Settings", path: "/admin/settings" },
  { icon: ClipboardCheck, label: "Profile Requests", path: "/admin/profile-requests" },
];

export function AdminLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const isActive = (path: string) => {
    if (path === "/admin/employees") return location.pathname.startsWith("/admin/employees");
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  const currentPage = NAV_ITEMS.find((n) => isActive(n.path))?.label ?? "Dashboard";

  return (
    <div className="app-shell flex h-screen overflow-hidden bg-background text-foreground">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`app-sidebar flex flex-col flex-shrink-0 bg-card border-r border-border
          transition-all duration-200 ease-in-out overflow-hidden
          ${collapsed ? "w-[72px]" : "w-60"}`}
      >
        {/* Logo */}
        <div
          className={`app-sidebar-logo h-16 flex items-center flex-shrink-0 border-b border-border
          ${collapsed ? "justify-center px-0" : "px-5 gap-3"}`}
        >
          <div className="app-brand-mark w-8 h-8 bg-foreground rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground leading-tight">
                HR<span className="text-muted-foreground">MS</span>
              </p>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">
                Admin Console
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
                className={`app-nav-item ${active ? "active" : ""} w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group relative
                  ${
                    active
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }
                  ${collapsed ? "justify-center" : ""}`}
              >
                {active && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full shadow-[0_0_16px_rgba(108,99,255,.55)]" />
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
              text-muted-foreground hover:bg-secondary hover:text-foreground app-nav-item
              transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User */}
        <div className={`border-t border-border p-3 ${collapsed ? "" : ""}`}>
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
                <div className="premium-avatar w-8 h-8 rounded-lg bg-foreground text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {user?.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">Administrator</p>
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
        <header className="app-topbar h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
          <div>
            <h1 className="text-base font-semibold text-foreground">{currentPage}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="app-search hidden md:flex items-center gap-2 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                className="h-full flex-1 border-0 bg-transparent p-0 text-sm shadow-none outline-none placeholder:text-muted-foreground"
                placeholder="Search anything"
                aria-label="Global search"
              />
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="app-icon-button w-9 h-9 flex items-center justify-center rounded-lg border border-border
                text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <button
              className="app-icon-button w-9 h-9 flex items-center justify-center rounded-lg border border-border
              text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-foreground" />
            </button>

            <button
              className="app-icon-button w-9 h-9 flex items-center justify-center rounded-lg border border-border
              text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Calendar"
            >
              <CalendarDays className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-secondary border border-transparent
                  hover:border-border transition-all duration-150"
              >
                <div className="premium-avatar w-7 h-7 rounded-md bg-foreground text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {user?.initials}
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block">
                  {user?.name}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute top-12 right-0 w-52 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 flex items-center gap-3 text-sm text-foreground
                        hover:bg-secondary rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-muted-foreground" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="app-main flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <EmployeeProvider>
            <Outlet />
          </EmployeeProvider>
        </main>
      </div>

      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </div>
  );
}
