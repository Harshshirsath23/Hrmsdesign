import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2, Eye, EyeOff, Lock, Mail,
  ShieldCheck, User, ArrowRight,
} from "lucide-react";
import { useAuth, UserRole } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole]               = useState<UserRole>("admin");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  const fillDemo = () => {
    if (role === "admin") {
      setEmail("admin@hrms.com");
      setPassword("Admin@123");
    } else {
      setEmail("emp001@company.com");
      setPassword("Emp@123");
    }
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    setError("");
    const result = await login(email, password, role);
    setLoading(false);
    if (result.success) {
      navigate(role === "admin" ? "/admin/dashboard" : "/employee/dashboard", { replace: true });
    } else {
      setError(result.message || "Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-[#F8F9FA]">
      {/* ── Left Panel ─────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-[#212529] text-[#F8F9FA] p-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F8F9FA] rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-[#212529]" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            HR<span className="text-[#ADB5BD]">MS</span>
          </span>
        </div>

        {/* Middle copy */}
        <div>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[#F8F9FA] mb-6">
            Human Resource<br />Management<br />System
          </h1>
          <p className="text-[#ADB5BD] text-sm leading-relaxed font-medium max-w-[320px]">
            Streamline HR operations — from onboarding to payroll,
            attendance to performance analytics. Everything unified.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { label: "Employee Management" },
              { label: "Attendance & Leave Tracking" },
              { label: "Payroll Processing" },
              { label: "Document Management" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6C757D] flex-shrink-0" />
                <span className="text-sm font-medium text-[#CED4DA]">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#495057] text-xs font-medium tracking-widest uppercase">
          © 2026 HRMS. All rights reserved.
        </p>
      </div>

      {/* ── Right Panel ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-[#212529] rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#212529]">HRMS</span>
          </div>

          <h2 className="text-2xl font-bold text-[#212529] tracking-tight mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-[#6C757D] font-medium mb-8">
            Sign in to your workspace to continue
          </p>

          {/* Role toggle */}
          <div className="flex gap-2 p-1 bg-[#E9ECEF] rounded-lg mb-8">
            {(["admin", "employee"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(""); setEmail(""); setPassword(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all duration-150 ${
                  role === r
                    ? "bg-white text-[#212529] shadow-sm border border-[#DEE2E6]"
                    : "text-[#6C757D] hover:text-[#212529]"
                }`}
              >
                {r === "admin"
                  ? <ShieldCheck className="w-4 h-4" />
                  : <User className="w-4 h-4" />}
                {r === "admin" ? "Admin" : "Employee"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#495057] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADB5BD]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "admin" ? "admin@hrms.com" : "emp001@company.com"}
                  className="flat-input w-full pl-10 pr-4 py-3 text-sm"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#495057] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADB5BD]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="flat-input w-full pl-10 pr-12 py-3 text-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#ADB5BD] hover:text-[#495057] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#F8F9FA] border border-[#DEE2E6] rounded-lg text-sm text-[#495057]">
                <div className="w-2 h-2 rounded-full bg-[#6C757D] flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#212529] text-[#F8F9FA] rounded-lg text-sm font-semibold
                hover:bg-[#343A40] disabled:bg-[#ADB5BD] disabled:cursor-not-allowed
                transition-colors duration-150"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-[#F8F9FA]/30 border-t-[#F8F9FA] rounded-full animate-spin" />
              )}
              {loading ? "Signing in…" : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 border border-[#DEE2E6] rounded-lg bg-white">
            <p className="text-xs font-semibold text-[#6C757D] uppercase tracking-wider mb-3">
              Demo Credentials — {role === "admin" ? "Admin" : "Employee"}
            </p>
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6C757D]">Email</span>
                <span className="font-mono text-xs font-semibold text-[#212529] bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#DEE2E6]">
                  {role === "admin" ? "admin@hrms.com" : "emp001@company.com"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6C757D]">Password</span>
                <span className="font-mono text-xs font-semibold text-[#212529] bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#DEE2E6]">
                  {role === "admin" ? "Admin@123" : "Emp@123"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="w-full py-2 text-xs font-semibold text-[#495057] bg-[#F8F9FA] hover:bg-[#E9ECEF]
                border border-[#DEE2E6] rounded-md transition-colors duration-150"
            >
              Auto-fill credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
