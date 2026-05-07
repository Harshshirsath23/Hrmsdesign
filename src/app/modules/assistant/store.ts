import { create } from "zustand";

type RoleTone = "admin" | "employee" | "general";

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
};

type AssistantState = {
  isOpen: boolean;
  unreadCount: number;
  activeModule: string;
  activeRoleTone: RoleTone;
  suggestions: string[];
  messages: AssistantMessage[];
  isTyping: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setContext: (pathname: string) => void;
  sendMessage: (text: string) => void;
};

const defaultSuggestions = [
  "Who is absent today?",
  "Show my leave balance",
  "Late arrivals this week",
  "Generate attendance report",
];

const moduleRules: Array<{
  match: (pathname: string) => boolean;
  moduleName: string;
  roleTone: RoleTone;
  suggestions: string[];
}> = [
  {
    match: (pathname) => pathname.includes("/attendance"),
    moduleName: "Attendance",
    roleTone: "admin",
    suggestions: ["Who is absent today?", "Late arrivals this week", "Show missing punch alerts", "Generate attendance report"],
  },
  {
    match: (pathname) => pathname.includes("/payroll") || pathname.includes("/payslips"),
    moduleName: "Payroll",
    roleTone: "admin",
    suggestions: ["Explain this month payroll run", "What deductions changed?", "Payroll processing checklist", "Download salary report"],
  },
  {
    match: (pathname) => pathname.includes("/leave") || pathname.includes("/leaves"),
    moduleName: "Leave",
    roleTone: "employee",
    suggestions: ["Show my leave balance", "Policy on casual leave", "Who is on leave today?", "Leave approval reminders"],
  },
  {
    match: (pathname) => pathname.includes("/profile") || pathname.includes("/employees/information"),
    moduleName: "Profile",
    roleTone: "employee",
    suggestions: ["How do I update my profile?", "Help with bank details", "Request profile change", "Show pending profile requests"],
  },
];

const buildAssistantReply = (text: string, moduleName: string, roleTone: RoleTone) => {
  const normalized = text.toLowerCase();
  if (normalized.includes("leave balance")) {
    return "Your current leave overview is available in the Leave module. I can help break it down by leave type and upcoming holidays.";
  }
  if (normalized.includes("absent") || normalized.includes("late")) {
    return "I can summarize today's attendance anomalies and late arrivals for quick review. Would you like a team-wise or department-wise view?";
  }
  if (normalized.includes("payroll")) {
    return "Payroll assistance is ready. I can guide you through processing steps, common exceptions, and report exports for this cycle.";
  }
  if (normalized.includes("policy")) {
    return "I can explain HR policies in simple steps and point you to the exact section relevant to your question.";
  }
  if (roleTone === "admin") {
    return `You're in ${moduleName}. I can help with approvals, anomalies, and high-level HR insights so you can act faster.`;
  }
  if (roleTone === "employee") {
    return `You're in ${moduleName}. I can guide you on profile updates, leave planning, and attendance clarity in a few steps.`;
  }
  return `You're in ${moduleName}. Ask me anything about attendance, leaves, payroll, policies, or profile updates.`;
};

const makeMessage = (role: "user" | "assistant", text: string): AssistantMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  text,
  timestamp: Date.now(),
});

export const useAssistantStore = create<AssistantState>((set, get) => ({
  isOpen: false,
  unreadCount: 1,
  activeModule: "HR Workspace",
  activeRoleTone: "general",
  suggestions: defaultSuggestions,
  isTyping: false,
  messages: [
    makeMessage(
      "assistant",
      "Hello, I am your HRMS AI Assistant. I can help with attendance, leave balance, payroll, policies, and profile guidance.",
    ),
  ],
  open: () => set({ isOpen: true, unreadCount: 0 }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen, unreadCount: state.isOpen ? state.unreadCount : 0 })),
  setContext: (pathname) => {
    const matched = moduleRules.find((rule) => rule.match(pathname));
    const moduleName = matched?.moduleName ?? "HR Workspace";
    const roleTone = matched?.roleTone ?? "general";
    const suggestions = matched?.suggestions ?? defaultSuggestions;
    set((state) => {
      const shouldNotify = !state.isOpen && state.activeModule !== moduleName;
      return {
        activeModule: moduleName,
        activeRoleTone: roleTone,
        suggestions,
        unreadCount: shouldNotify ? Math.max(1, state.unreadCount + 1) : state.unreadCount,
      };
    });
  },
  sendMessage: (text) => {
    if (!text.trim()) return;
    const userMessage = makeMessage("user", text.trim());
    set((state) => ({
      messages: [...state.messages, userMessage],
      isTyping: true,
    }));
    const { activeModule, activeRoleTone } = get();
    window.setTimeout(() => {
      const reply = makeMessage("assistant", buildAssistantReply(text, activeModule, activeRoleTone));
      set((state) => ({
        messages: [...state.messages, reply],
        isTyping: false,
      }));
    }, 900);
  },
}));
