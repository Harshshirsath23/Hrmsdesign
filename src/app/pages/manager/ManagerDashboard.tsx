import { useState } from "react";
import {
    Users, Calendar, Clock, CheckCircle2, AlertCircle,
    TrendingUp, UserPlus, FileText, ChevronRight,
    BarChart3, AlertTriangle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const mockTeamStats = {
    totalMembers: 24,
    presentToday: 18,
    onLeave: 4,
    lateToday: 2,
    pendingLeaveRequests: 3,
};

const mockRecentLeaveRequests = [
    { id: 1, employee: "Rahul Kumar", type: "Sick Leave", dates: "May 14-15", status: "pending", avatarColor: "#3B82F6" },
    { id: 2, employee: "Sneha Patel", type: "Casual Leave", dates: "May 16", status: "pending", avatarColor: "#10B981" },
    { id: 3, employee: "Amit Singh", type: "Personal Leave", dates: "May 18-20", status: "pending", avatarColor: "#F59E0B" },
];

const mockAttendanceAlerts = [
    { id: 1, employee: "Priya Sharma", message: "Late arrival (45 min)", time: "Today, 10:15 AM", type: "late" },
    { id: 2, employee: "Vikram Patel", message: "Missing swipe - no punch out", time: "Yesterday", type: "missing" },
    { id: 3, employee: "Neha Gupta", message: "Early departure (1 hr)", time: "Yesterday, 5:00 PM", type: "early" },
];

const mockTeamMembers = [
    { id: 1, name: "Arjun Mehta", role: "Senior Developer", status: "active", avatarColor: "#3B82F6" },
    { id: 2, name: "Kavya Reddy", role: "UI Designer", status: "active", avatarColor: "#10B981" },
    { id: 3, name: "Rohan Das", role: "Backend Developer", status: "on_leave", avatarColor: "#F59E0B" },
    { id: 4, name: "Anjali Nair", role: "QA Engineer", status: "active", avatarColor: "#8B5CF6" },
];

export function ManagerDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F172A]">
                        Welcome back, {user?.name?.split(' ')[0] || 'Manager'}!
                    </h1>
                    <p className="text-sm text-[#64748B] mt-1">
                        Here's what's happening with your team today.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                    <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Team"
                    value={mockTeamStats.totalMembers}
                    icon={Users}
                    color="blue"
                    trend="+2 this month"
                />
                <StatCard
                    title="Present Today"
                    value={mockTeamStats.presentToday}
                    icon={CheckCircle2}
                    color="green"
                    trend={`${Math.round((mockTeamStats.presentToday / mockTeamStats.totalMembers) * 100)}% attendance`}
                />
                <StatCard
                    title="On Leave"
                    value={mockTeamStats.onLeave}
                    icon={Calendar}
                    color="orange"
                    trend="4 pending approvals"
                />
                <StatCard
                    title="Late Today"
                    value={mockTeamStats.lateToday}
                    icon={Clock}
                    color="red"
                    trend="-1 from yesterday"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Team Overview */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                        <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <ActionButton icon={UserPlus} label="Add Member" />
                            <ActionButton icon={FileText} label="View Reports" />
                            <ActionButton icon={Calendar} label="Schedule Meeting" />
                            <ActionButton icon={BarChart3} label="Analytics" />
                        </div>
                    </div>

                    {/* Attendance Alerts */}
                    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-[#0F172A]">Attendance Alerts</h2>
                            <a href="/manager/attendance" className="text-sm text-[#3B82F6] hover:underline flex items-center gap-1">
                                View all <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                        <div className="space-y-3">
                            {mockAttendanceAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]"
                                >
                                    <div className={`w-2 h-2 rounded-full mt-2 ${alert.type === 'late' ? 'bg-orange-500' : alert.type === 'missing' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[#0F172A]">{alert.employee}</p>
                                        <p className="text-xs text-[#64748B]">{alert.message}</p>
                                    </div>
                                    <span className="text-xs text-[#94A3B8]">{alert.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-[#0F172A]">Team Members</h2>
                            <a href="/manager/team" className="text-sm text-[#3B82F6] hover:underline flex items-center gap-1">
                                View all <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {mockTeamMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#3B82F6] transition-colors cursor-pointer"
                                >
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                        style={{ backgroundColor: member.avatarColor }}
                                    >
                                        {member.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#0F172A] truncate">{member.name}</p>
                                        <p className="text-xs text-[#64748B] truncate">{member.role}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {member.status === 'active' ? 'Active' : 'On Leave'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Leave Requests */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-[#0F172A]">Pending Leave Requests</h2>
                            <span className="px-2 py-1 bg-[#3B82F6] text-white text-xs rounded-full">
                                {mockRecentLeaveRequests.length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {mockRecentLeaveRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]"
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                            style={{ backgroundColor: request.avatarColor }}
                                        >
                                            {request.employee.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#0F172A] truncate">{request.employee}</p>
                                            <p className="text-xs text-[#64748B]">{request.type}</p>
                                            <p className="text-xs text-[#94A3B8] mt-1">{request.dates}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                                            Approve
                                        </button>
                                        <button className="flex-1 px-3 py-1.5 text-xs font-medium bg-[#E2E8F0] text-[#64748B] rounded-md hover:bg-[#CBD5E1] transition-colors">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <a
                            href="/manager/leaves"
                            className="mt-4 block text-center text-sm text-[#3B82F6] hover:underline"
                        >
                            View all requests
                        </a>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                        <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Upcoming</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                                <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-[#3B82F6]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#0F172A]">Team Meeting</p>
                                    <p className="text-xs text-[#64748B]">Tomorrow, 10:00 AM</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                                <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-[#10B981]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#0F172A]">Performance Review</p>
                                    <p className="text-xs text-[#64748B]">May 20, 2:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-green-50 text-green-600 border-green-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        red: "bg-red-50 text-red-600 border-red-100",
    };

    return (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-[#64748B] font-medium">{title}</p>
                    <p className="text-2xl font-bold text-[#0F172A] mt-1">{value}</p>
                    <p className="text-xs text-[#94A3B8] mt-2">{trend}</p>
                </div>
                <div className={`p-3 rounded-lg ${colors[color as keyof typeof colors]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}

function ActionButton({ icon: Icon, label }: any) {
    return (
        <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#E2E8F0] hover:border-[#3B82F6] hover:bg-[#3B82F6]/5 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] group-hover:bg-[#3B82F6]/10 flex items-center justify-center transition-colors">
                <Icon className="w-5 h-5 text-[#64748B] group-hover:text-[#3B82F6]" />
            </div>
            <span className="text-xs font-medium text-[#64748B] group-hover:text-[#3B82F6]">{label}</span>
        </button>
    );
}