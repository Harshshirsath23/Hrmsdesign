import { useState } from "react";
import { Outlet, Navigate } from "react-router";
import {
    LayoutDashboard, Users, Calendar, FileText, Settings, LogOut,
    Bell, Search, Menu, X, ChevronDown, BarChart3, Clock,
    CheckCircle2, AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../components/ui/utils";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/manager/dashboard", badge: null },
    { icon: Users, label: "My Team", path: "/manager/team", badge: null },
    { icon: Calendar, label: "Attendance", path: "/manager/attendance", badge: null },
    { icon: FileText, label: "Leave Requests", path: "/manager/leaves", badge: "3" },
    { icon: BarChart3, label: "Reports", path: "/manager/reports", badge: null },
    { icon: Settings, label: "Settings", path: "/manager/settings", badge: null },
];

export function ManagerLayout() {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!user || user.role !== "manager") {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-[#F1F5F9]">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#1E293B] text-white transition-all duration-300",
                    sidebarOpen ? "w-64" : "w-20",
                    "lg:relative",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b border-[#334155]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">HR</span>
                        </div>
                        {sidebarOpen && (
                            <span className="font-bold text-lg tracking-tight">HRMS</span>
                        )}
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden text-[#94A3B8] hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-[#334155]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center font-bold">
                            {user.initials}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{user.name}</p>
                                <p className="text-xs text-[#94A3B8] truncate">Manager</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {sidebarItems.map((item) => (
                        <a
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                "text-[#94A3B8] hover:text-white hover:bg-[#334155]",
                                "group relative"
                            )}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen ? (
                                <>
                                    <span className="text-sm font-medium flex-1">{item.label}</span>
                                    {item.badge && (
                                        <span className="text-xs bg-[#3B82F6] text-white px-2 py-0.5 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <div className="absolute left-full ml-2 px-3 py-2 bg-[#0F172A] text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                    {item.label}
                                    {item.badge && (
                                        <span className="ml-2 bg-[#3B82F6] px-2 py-0.5 rounded-full text-xs">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            )}
                        </a>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-[#334155]">
                    <button
                        onClick={logout}
                        className={cn(
                            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors",
                            "text-[#94A3B8] hover:text-red-400 hover:bg-[#334155]"
                        )}
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden text-[#64748B] hover:text-[#0F172A]"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hidden lg:flex items-center text-[#64748B] hover:text-[#0F172A]"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 w-64 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative text-[#64748B] hover:text-[#0F172A]">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                                3
                            </span>
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-sm font-bold">
                                {user.initials}
                            </div>
                            <ChevronDown className="w-4 h-4 text-[#64748B]" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>

            {/* Mobile sidebar overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}