import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  User,
  Users,
  Clock,
  FileText,
  Building2,
  Lock,
  Mail,
  Moon,
  Sun,
} from "lucide-react";

import { useAuth, UserRole } from "../context/AuthContext";

/* =========================
   FOREST GREEN THEME
========================= */

const COLORS = {
  light: {
    bg: "#F6F7FB",
    panel: "rgba(255,255,255,.72)",
    soft: "rgba(243,244,250,.62)",
    primary: "#6C63FF",
    secondary: "#A78BFA",
    dark: "#6366F1",
    text: "#1f2937",
    muted: "#6B7280",
    border: "rgba(99,102,241,.1)",
  },

  dark: {
    bg: "#0F172A",
    panel: "rgba(30,41,59,.75)",
    soft: "rgba(30,41,59,.56)",
    primary: "#8B5CF6",
    secondary: "#6366F1",
    dark: "#7C3AED",
    text: "#F8FAFC",
    muted: "#CBD5E1",
    border: "rgba(196,181,253,.14)",
  },
};

const features = [
  {
    icon: Clock,
    label: "Attendance",
    desc: "Track employee check-ins",
  },
  {
    icon: FileText,
    label: "Payroll",
    desc: "Payslips & salary management",
  },
  {
    icon: Users,
    label: "Team",
    desc: "People & onboarding",
  },
  {
    icon: Building2,
    label: "Documents",
    desc: "Approvals & HR records",
  },
];

const ROLES: {
  value: UserRole;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "admin",
    label: "Admin",
    icon: <ShieldCheck size={14} />,
  },
  {
    value: "manager",
    label: "Manager",
    icon: <Users size={14} />,
  },
  {
    value: "employee",
    label: "Employee",
    icon: <User size={14} />,
  },
];

const DEMO: Record<
  UserRole,
  { email: string; password: string }
> = {
  admin: {
    email: "admin@hrms.com",
    password: "Admin@123",
  },
  manager: {
    email: "manager@hrms.com",
    password: "Manager@123",
  },
  employee: {
    email: "emp001@company.com",
    password: "Emp@123",
  },
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [theme, setTheme] = useState<"light" | "dark">(
    "light"
  );

  const c = COLORS[theme];

  const [role, setRole] =
    useState<UserRole>("admin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShapeMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();

      e.currentTarget.style.setProperty(
        "--mouse-x",
        `${e.clientX - rect.left}px`
      );
      e.currentTarget.style.setProperty(
        "--mouse-y",
        `${e.clientY - rect.top}px`
      );
      e.currentTarget.style.setProperty(
        "--glow-opacity",
        "1"
      );
    },
    []
  );

  const handleShapeMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.setProperty(
        "--glow-opacity",
        "0"
      );
    },
    []
  );

  const handleRootMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 24;
      const y = (e.clientY / window.innerHeight - 0.5) * 24;

      e.currentTarget.style.setProperty(
        "--parallax-x",
        `${x}px`
      );
      e.currentTarget.style.setProperty(
        "--parallax-y",
        `${y}px`
      );
    },
    []
  );

  const switchRole = (r: UserRole) => {
    setRole(r);
    setError("");
    setEmail("");
    setPassword("");
  };

  const fillDemo = () => {
    setEmail(DEMO[role].email);
    setPassword(DEMO[role].password);
    setError("");
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await login(
      email,
      password,
      role
    );

    setLoading(false);

    if (result.success) {
      navigate(
        role === "admin"
          ? "/admin/dashboard"
          : role === "manager"
          ? "/manager/dashboard"
          : "/employee/dashboard",
        { replace: true }
      );
    } else {
      setError(
        result.message || "Invalid credentials."
      );
    }
  };

  return (
    <>
      <style>{`

      *{
        box-sizing:border-box;
      }

      body{
        margin:0;
        font-family:Inter,sans-serif;
      }

      .login-root{
        min-height:100vh;
        background:${c.bg};
        background-image:
          radial-gradient(circle at calc(14% + var(--parallax-x, 0px)) calc(-4% + var(--parallax-y, 0px)), rgba(196,181,253,.44), transparent 34%),
          radial-gradient(circle at calc(86% - var(--parallax-x, 0px)) calc(8% - var(--parallax-y, 0px)), rgba(99,102,241,.22), transparent 32%),
          radial-gradient(circle at 52% 104%, rgba(221,214,254,.42), transparent 40%);
        position:relative;
        overflow:hidden;
        --parallax-x:0px;
        --parallax-y:0px;
      }

      .login-root::before{
        content:"";
        position:absolute;
        inset:0;
        background:
          linear-gradient(115deg, rgba(255,255,255,.42), transparent 36%),
          radial-gradient(circle at 50% 0%, rgba(255,255,255,.5), transparent 42%);
        pointer-events:none;
        animation:login-aurora 16s ease-in-out infinite alternate;
      }

      .login-root::after{
        content:"";
        position:absolute;
        inset:0;
        background-image:
          radial-gradient(circle, rgba(255,255,255,.58) 0 1px, transparent 1.5px),
          radial-gradient(circle, rgba(124,58,237,.22) 0 1px, transparent 1.5px);
        background-size:90px 90px, 140px 140px;
        background-position:12px 18px, 42px 54px;
        opacity:.42;
        pointer-events:none;
        animation:particles-drift 18s linear infinite;
      }

      /* ZOOM OUT EFFECT */
      .zoom-wrapper{
        transform:scale(.8);
        transform-origin:center;
        width:125%;
        margin-left:-12.5%;
      }

      /* BACKGROUND BLOCKS */

      .shape{
        position:absolute;
        border-radius:40px;
        --mouse-x:50%;
        --mouse-y:50%;
        --glow-opacity:0;
        overflow:visible;
        pointer-events:auto;
        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,0);
        transition:
          transform .35s ease,
          box-shadow .35s ease;
      }

      .shape::before{
        content:"";
        position:absolute;
        inset:0;
        border-radius:inherit;
        padding:2px;
        background:
          radial-gradient(
            160px circle at var(--mouse-x) var(--mouse-y),
            rgba(255,255,255,.95),
            rgba(196,181,253,.88) 24%,
            rgba(108,99,255,.74) 42%,
            transparent 66%
          ),
          linear-gradient(
            135deg,
            rgba(255,255,255,.16),
            rgba(167,139,250,.22) 34%,
            rgba(99,102,241,.2) 68%,
            rgba(255,255,255,.14)
          );
        opacity:var(--glow-opacity);
        pointer-events:none;
        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        -webkit-mask-composite:xor;
        mask-composite:exclude;
        transition:opacity .18s ease;
      }

      .shape::after{
        content:"";
        position:absolute;
        inset:-14px;
        border-radius:inherit;
        padding:16px;
        background:
          radial-gradient(
            190px circle at calc(var(--mouse-x) + 14px) calc(var(--mouse-y) + 14px),
            rgba(221,214,254,.88),
            rgba(108,99,255,.5) 36%,
            transparent 68%
          );
        opacity:var(--glow-opacity);
        filter:blur(10px);
        pointer-events:none;
        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        -webkit-mask-composite:xor;
        mask-composite:exclude;
        transition:opacity .18s ease;
      }

      .shape:hover{
        box-shadow:
          0 0 34px rgba(108,99,255,.22),
          inset 0 0 0 1px rgba(255,255,255,.18);
      }

      .shape-1{
        width:400px;
        height:400px;
        background:color-mix(in srgb, ${c.secondary} 26%, transparent);
        backdrop-filter:blur(14px);
        border:1px solid rgba(255,255,255,.32);
        top:-120px;
        left:-120px;
        transform:translate3d(calc(var(--parallax-x) * .35), calc(var(--parallax-y) * .35), 0);
      }

      .shape-2{
        width:320px;
        height:320px;
        background:color-mix(in srgb, ${c.primary} 22%, transparent);
        backdrop-filter:blur(14px);
        border:1px solid rgba(255,255,255,.28);
        right:0;
        bottom:0;
        border-radius:40px 0 0 0;
        transform:translate3d(calc(var(--parallax-x) * -.22), calc(var(--parallax-y) * -.22), 0);
      }

      .shape-3{
        width:220px;
        height:220px;
        background:color-mix(in srgb, ${c.dark} 12%, transparent);
        backdrop-filter:blur(12px);
        border:1px solid rgba(255,255,255,.24);
        left:45%;
        top:8%;
        transform:translate3d(calc(var(--parallax-x) * .18), calc(var(--parallax-y) * -.18), 0);
      }

      .login-container{
        position:relative;
        z-index:2;

        min-height:100vh;

        display:flex;
        align-items:center;
        justify-content:center;

        padding:40px;
      }

      .login-grid{
        width:100%;
        max-width:1240px;

        display:grid;
        grid-template-columns:1.1fr .9fr;

        background:${c.panel};

        border-radius:38px;

        overflow:hidden;

        border:1px solid ${c.border};
        backdrop-filter:blur(28px) saturate(145%);
        -webkit-backdrop-filter:blur(28px) saturate(145%);

        box-shadow:
          0 30px 80px rgba(76,29,149,.13),
          inset 0 1px 0 rgba(255,255,255,.75);

        animation:login-card-in .7s cubic-bezier(.2,.8,.2,1) both;
      }

      /* LEFT SIDE */

      .left-panel{
        background:${c.soft};
        padding:70px;
        position:relative;
        backdrop-filter:blur(22px);
        -webkit-backdrop-filter:blur(22px);
        border-right:1px solid rgba(255,255,255,.5);
        overflow:hidden;
      }

      .left-panel::before{
        content:"";
        position:absolute;
        right:-110px;
        bottom:-130px;
        width:360px;
        height:360px;
        border-radius:42% 58% 50% 50%;
        background:
          radial-gradient(circle at 34% 28%, rgba(255,255,255,.82), transparent 18%),
          linear-gradient(135deg, rgba(124,58,237,.72), rgba(99,102,241,.5), rgba(196,181,253,.62));
        filter:blur(.2px);
        opacity:.7;
        animation:liquid-blob 9s ease-in-out infinite;
      }

      .left-panel::after{
        content:"";
        position:absolute;
        right:84px;
        bottom:96px;
        width:118px;
        height:118px;
        border-radius:34px;
        background:rgba(255,255,255,.22);
        border:1px solid rgba(255,255,255,.42);
        backdrop-filter:blur(18px);
        -webkit-backdrop-filter:blur(18px);
        box-shadow:0 24px 56px rgba(76,29,149,.16);
        transform:rotate(12deg);
        animation:float-card 6s ease-in-out infinite;
      }

      .brand{
        display:flex;
        align-items:center;
        gap:14px;
        margin-bottom:50px;
      }

      .brand-icon{
        width:58px;
        height:58px;
        border-radius:18px;
        background:linear-gradient(135deg, ${c.primary}, ${c.secondary});
        color:white;

        display:flex;
        align-items:center;
        justify-content:center;

        font-size:20px;
        font-weight:800;
      }

      .brand-title{
        margin:0;
        font-size:18px;
        font-weight:800;
        color:${c.text};
      }

      .brand-sub{
        margin-top:3px;
        color:${c.muted};
        font-size:13px;
      }

      .headline{
        font-size:64px;
        line-height:1;
        font-weight:900;
        color:${c.text};
        margin:0;
      }

      .headline span{
        color:${c.primary};
      }

      .subtext{
        margin-top:22px;
        font-size:16px;
        line-height:1.8;
        color:${c.muted};
        max-width:520px;
      }

      .features{
        margin-top:50px;

        display:grid;
        grid-template-columns:1fr 1fr;
        gap:18px;
      }

      .feature-card{
        background:rgba(255,255,255,.42);

        border:1px solid ${c.border};

        border-radius:26px;

        padding:22px;

        backdrop-filter:blur(18px);
        -webkit-backdrop-filter:blur(18px);
        box-shadow:
          0 18px 40px rgba(76,29,149,.08),
          inset 0 1px 0 rgba(255,255,255,.65);

        transition:.3s ease;
      }

      .feature-card:hover{
        transform:translateY(-6px);
        background:rgba(255,255,255,.55);
        box-shadow:
          0 22px 48px rgba(76,29,149,.13),
          inset 0 1px 0 rgba(255,255,255,.82);
      }

      .feature-icon{
        width:48px;
        height:48px;

        border-radius:16px;

        background:linear-gradient(135deg, ${c.primary}, ${c.secondary});
        color:white;

        display:flex;
        align-items:center;
        justify-content:center;

        margin-bottom:16px;
      }

      .feature-title{
        margin:0;
        color:${c.text};
        font-weight:700;
      }

      .feature-desc{
        margin-top:6px;
        font-size:13px;
        color:${c.muted};
        line-height:1.6;
      }

      /* RIGHT PANEL */

      .right-panel{
        background:${c.panel};
        padding:60px;
        position:relative;
        backdrop-filter:blur(24px);
        -webkit-backdrop-filter:blur(24px);
      }

      .right-panel::before{
        content:"";
        position:absolute;
        inset:24px;
        border-radius:28px;
        border:1px solid rgba(255,255,255,.34);
        pointer-events:none;
        opacity:.5;
      }

      .theme-toggle{
        position:absolute;
        top:28px;
        right:28px;

        width:52px;
        height:52px;

        border:1px solid ${c.border};
        border-radius:16px;

        background:rgba(255,255,255,.38);

        color:${c.text};

        cursor:pointer;

        display:flex;
        align-items:center;
        justify-content:center;

        transition:.25s ease;
      }

      .theme-toggle:hover{
        transform:scale(1.05);
        background:rgba(255,255,255,.56);
      }

      .signin-label{
        font-size:12px;
        letter-spacing:2px;
        text-transform:uppercase;
        color:${c.primary};
        font-weight:700;
      }

      .signin-title{
        margin-top:14px;
        font-size:40px;
        font-weight:900;
        color:${c.text};
      }

      .signin-sub{
        margin-top:10px;
        color:${c.muted};
        font-size:15px;
      }

      /* ROLE TABS */

      .role-switch{
        margin-top:32px;

        display:flex;
        gap:10px;
      }

      .role-btn{
        flex:1;

        height:52px;

        border:none;
        border-radius:18px;

        background:rgba(255,255,255,.38);

        color:${c.muted};

        cursor:pointer;

        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;

        font-weight:700;

        transition:.25s ease;
      }

      .role-btn.active{
        background:linear-gradient(135deg, ${c.primary}, ${c.secondary});
        color:white;
        box-shadow:0 12px 26px rgba(108,99,255,.22);
      }

      /* FORM */

      .form-group{
        margin-top:20px;
      }

      .label{
        display:block;
        margin-bottom:10px;

        font-size:13px;
        font-weight:600;

        color:${c.text};
      }

      .input-wrap{
        position:relative;
      }

      .input-icon{
        position:absolute;
        left:16px;
        top:50%;
        transform:translateY(-50%);
        color:${c.muted};
      }

      .input{
        width:100%;
        height:58px;

        border-radius:18px;

        border:1px solid ${c.border};

        background:rgba(255,255,255,.4);

        color:${c.text};

        padding-left:48px;
        padding-right:16px;

        outline:none;

        font-size:14px;

        transition:.25s ease;
      }

      .input:focus{
        border-color:${c.primary};
        background:rgba(255,255,255,.58);
        box-shadow:0 0 0 4px rgba(108,99,255,.12);
      }

      .input::placeholder{
        color:${c.muted};
      }

      .password-input{
        padding-right:50px;
      }

      .pw-toggle{
        position:absolute;
        right:16px;
        top:50%;
        transform:translateY(-50%);

        border:none;
        background:none;

        cursor:pointer;

        color:${c.muted};
      }

      .extra{
        margin-top:18px;

        display:flex;
        justify-content:space-between;

        font-size:13px;
      }

      .remember{
        color:${c.muted};
      }

      .forgot{
        color:${c.primary};
        text-decoration:none;
        font-weight:600;
      }

      .error{
        margin-top:18px;

        background:#ffe7e7;

        color:#c53030;

        padding:14px;

        border-radius:14px;

        font-size:13px;
      }

      .submit-btn{
        width:100%;
        height:60px;

        margin-top:24px;

        border:none;
        border-radius:20px;

        background:linear-gradient(135deg, ${c.primary}, ${c.secondary});

        color:white;

        font-size:15px;
        font-weight:800;

        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;

        cursor:pointer;

        transition:.25s ease;
      }

      .submit-btn:hover{
        transform:translateY(-2px);
        box-shadow:0 18px 38px rgba(108,99,255,.28);
      }

      .demo-box{
        margin-top:28px;

        background:rgba(255,255,255,.38);

        border:1px solid ${c.border};

        border-radius:24px;

        padding:22px;
        backdrop-filter:blur(18px);
        -webkit-backdrop-filter:blur(18px);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.65),
          0 16px 38px rgba(76,29,149,.08);
      }

      .demo-title{
        margin:0 0 16px;
        color:${c.text};
        font-size:14px;
        font-weight:800;
      }

      .demo-row{
        display:flex;
        justify-content:space-between;

        margin-bottom:10px;

        font-size:13px;
      }

      .demo-key{
        color:${c.muted};
      }

      .demo-value{
        color:${c.primary};
        font-weight:700;
      }

      .demo-btn{
        width:100%;
        height:48px;

        margin-top:14px;

        border:none;
        border-radius:16px;

        background:linear-gradient(135deg, ${c.primary}, ${c.secondary});

        color:white;

        cursor:pointer;

        font-weight:700;
      }

      .spinner{
        width:18px;
        height:18px;

        border-radius:50%;

        border:2px solid rgba(255,255,255,.4);
        border-top-color:white;

        animation:spin .7s linear infinite;
      }

      @keyframes spin{
        to{
          transform:rotate(360deg);
        }
      }

      @keyframes login-card-in{
        from{
          opacity:0;
          transform:translateY(18px) scale(.98);
        }
        to{
          opacity:1;
          transform:translateY(0) scale(1);
        }
      }

      @keyframes login-aurora{
        from{
          transform:translate3d(-18px,-10px,0) scale(1);
        }
        to{
          transform:translate3d(18px,14px,0) scale(1.04);
        }
      }

      @keyframes particles-drift{
        to{
          background-position:102px 118px, -98px 174px;
        }
      }

      @keyframes liquid-blob{
        0%,100%{
          border-radius:42% 58% 50% 50%;
          transform:translateY(0) rotate(0deg);
        }
        50%{
          border-radius:58% 42% 46% 54%;
          transform:translateY(-16px) rotate(8deg);
        }
      }

      @keyframes float-card{
        0%,100%{
          transform:translateY(0) rotate(12deg);
        }
        50%{
          transform:translateY(-18px) rotate(6deg);
        }
      }

      @media(max-width:980px){

        .zoom-wrapper{
          transform:scale(1);
          width:100%;
          margin-left:0;
        }

        .login-grid{
          grid-template-columns:1fr;
        }

        .left-panel{
          display:none;
        }

        .right-panel{
          padding:40px 24px;
        }
      }

      `}</style>

      <div
        className="login-root"
        onMouseMove={handleRootMouseMove}
      >

        <div
          className="shape shape-1"
          onMouseMove={handleShapeMouseMove}
          onMouseLeave={handleShapeMouseLeave}
        />
        <div
          className="shape shape-2"
          onMouseMove={handleShapeMouseMove}
          onMouseLeave={handleShapeMouseLeave}
        />
        <div
          className="shape shape-3"
          onMouseMove={handleShapeMouseMove}
          onMouseLeave={handleShapeMouseLeave}
        />

        <div className="zoom-wrapper">

          <div className="login-container">

            <div className="login-grid">

              {/* LEFT */}

              <div className="left-panel">

                <div className="brand">

                  <div className="brand-icon">
                    HR
                  </div>

                  <div>
                    <p className="brand-title">
                      HRMS Portal
                    </p>

                    <p className="brand-sub">
                      Workforce Management Platform
                    </p>
                  </div>

                </div>

                <h1 className="headline">
                  Smart HR,
                  <br />
                  <span>simplified.</span>
                </h1>

                <p className="subtext">
                  Manage attendance, payroll,
                  onboarding and employee workflows
                  from one modern platform.
                </p>

                <div className="features">

                  {features.map(
                    ({ icon: Icon, label, desc }) => (
                      <div
                        className="feature-card"
                        key={label}
                      >
                        <div className="feature-icon">
                          <Icon size={20} />
                        </div>

                        <p className="feature-title">
                          {label}
                        </p>

                        <p className="feature-desc">
                          {desc}
                        </p>
                      </div>
                    )
                  )}

                </div>

              </div>

              {/* RIGHT */}

              <div className="right-panel">

                <button
                  className="theme-toggle"
                  onClick={() =>
                    setTheme(
                      theme === "light"
                        ? "dark"
                        : "light"
                    )
                  }
                >
                  {theme === "light" ? (
                    <Moon size={18} />
                  ) : (
                    <Sun size={18} />
                  )}
                </button>

                <div className="signin-label">
                  SECURE LOGIN
                </div>

                <div className="signin-title">
                  Welcome back
                </div>

                <div className="signin-sub">
                  Login to continue to your dashboard.
                </div>

                <div className="role-switch">

                  {ROLES.map(
                    ({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() =>
                          switchRole(value)
                        }
                        className={`role-btn ${
                          role === value
                            ? "active"
                            : ""
                        }`}
                      >
                        {icon}
                        {label}
                      </button>
                    )
                  )}

                </div>

                <form onSubmit={handleSubmit}>

                  <div className="form-group">

                    <label className="label">
                      Email Address
                    </label>

                    <div className="input-wrap">

                      <div className="input-icon">
                        <Mail size={16} />
                      </div>

                      <input
                        type="email"
                        className="input"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                      />

                    </div>

                  </div>

                  <div className="form-group">

                    <label className="label">
                      Password
                    </label>

                    <div className="input-wrap">

                      <div className="input-icon">
                        <Lock size={16} />
                      </div>

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        className="input password-input"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                      />

                      <button
                        type="button"
                        className="pw-toggle"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >
                        {showPassword ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>

                    </div>

                  </div>

                  <div className="extra">

                    <label className="remember">
                      <input type="checkbox" /> Remember me
                    </label>

                    <a
                      href="#"
                      className="forgot"
                    >
                      Forgot password?
                    </a>

                  </div>

                  {error && (
                    <div className="error">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                </form>

                <div className="demo-box">

                  <p className="demo-title">
                    Demo Credentials
                  </p>

                  <div className="demo-row">
                    <span className="demo-key">
                      Email
                    </span>

                    <span className="demo-value">
                      {DEMO[role].email}
                    </span>
                  </div>

                  <div className="demo-row">
                    <span className="demo-key">
                      Password
                    </span>

                    <span className="demo-value">
                      {DEMO[role].password}
                    </span>
                  </div>

                  <button
                    className="demo-btn"
                    onClick={fillDemo}
                  >
                    Auto Fill Credentials
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}
