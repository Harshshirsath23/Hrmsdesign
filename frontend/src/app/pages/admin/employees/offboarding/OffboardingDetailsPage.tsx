import { useState } from "react";
import { 
  X, 
  ChevronRight, 
  FileText, 
  ShieldCheck, 
  Wallet, 
  MessageSquare, 
  History,
  Info,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

interface Props {
  onClose: () => void;
  record: any;
}

export function OffboardingDetailsPage({ onClose, record }: Props) {
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = [
    { name: "Overview", icon: Info },
    { name: "Resignation", icon: FileText },
    { name: "Clearance", icon: ShieldCheck },
    { name: "Finance", icon: Wallet },
    { name: "Exit Interview", icon: MessageSquare },
    { name: "Documents", icon: FileText },
    { name: "Activity Logs", icon: History },
  ];

  const workflow = [
    { name: "Resignation Submitted", status: "completed", date: "2024-05-01" },
    { name: "Manager Approval", status: "completed", date: "2024-05-02" },
    { name: "HR Approval", status: "completed", date: "2024-05-03" },
    { name: "Notice Period", status: "current", date: "Ongoing" },
    { name: "Clearance Process", status: "pending", date: "Pending" },
    { name: "Final Settlement", status: "pending", date: "Pending" },
    { name: "Exit Completed", status: "pending", date: "Pending" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-sm">
      <div className="bg-background w-full max-w-6xl h-full shadow-2xl flex flex-col border-l border-border animate-in slide-in-from-right duration-500">
        
        {/* Header */}
        <div className="px-8 py-4 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span>Offboarding</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Details</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">{record.name}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Profile Panel */}
          <div className="w-80 bg-secondary/20 border-r border-border p-8 flex flex-col gap-8 overflow-y-auto">
            <div className="flex flex-col items-center text-center gap-4">
              <div 
                className="w-32 h-32 rounded-3xl flex items-center justify-center text-white font-black text-4xl border-4 border-card shadow-2xl"
                style={{ backgroundColor: record.avatarColor }}
              >
                {record.initials}
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">{record.name}</h3>
                <p className="text-sm font-bold text-muted-foreground">{record.employeeId}</p>
              </div>
              <span className="text-[10px] px-3 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-full font-black uppercase tracking-widest">
                {record.exitStatus}
              </span>
            </div>

            <div className="space-y-6">
              {[
                { label: "Department", value: record.department, icon: User },
                { label: "Designation", value: record.designation, icon: ShieldCheck },
                { label: "Joining Date", value: "2020-01-15", icon: Calendar },
                { label: "Last Working Day", value: record.lastWorkingDay, icon: Clock },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-bold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto p-4 bg-primary/5 border border-primary/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                <p className="text-xs font-black text-primary uppercase tracking-widest">Notification</p>
              </div>
              <p className="text-xs font-medium text-foreground/80 leading-relaxed">
                Notice period ends in 12 days. Asset return pending for Laptop and ID Card.
              </p>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
            
            {/* Workflow Tracker */}
            <div className="px-8 py-6 border-b border-border bg-card/50 overflow-x-auto">
              <div className="flex items-center min-w-max">
                {workflow.map((step, idx) => (
                  <div key={step.name} className="flex items-center">
                    <div className="flex flex-col items-center gap-2 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        step.status === "completed" 
                          ? "bg-green-500 border-green-500 text-white" 
                          : step.status === "current"
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-secondary border-border text-muted-foreground"
                      }`}>
                        {step.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                      </div>
                      <div className="absolute top-10 flex flex-col items-center min-w-[100px] text-center">
                        <p className={`text-[10px] font-black uppercase tracking-tight ${step.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                          {step.name}
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground">{step.date}</p>
                      </div>
                    </div>
                    {idx < workflow.length - 1 && (
                      <div className={`h-0.5 w-16 mx-2 ${step.status === "completed" ? "bg-green-500" : "bg-border"}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="h-10" /> {/* Spacer for workflow labels */}
            </div>

            {/* Tabs Navigation */}
            <div className="px-8 flex items-center gap-8 border-b border-border bg-card">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`relative py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    activeTab === tab.name ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.name}
                  {activeTab === tab.name && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === "Overview" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flat-card bg-card p-6 space-y-4 col-span-full">
                      <h4 className="text-sm font-black uppercase tracking-widest text-primary">Resignation Summary</h4>
                      <p className="text-base font-medium leading-relaxed">
                        The employee has submitted their resignation on 2024-05-01 due to personal reasons. 
                        The notice period is being served and the last working day is set for 2024-06-01.
                      </p>
                    </div>
                    <div className="flat-card bg-card p-6 space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-primary">Clearance Status</h4>
                      <div className="space-y-3">
                        {["IT Clearance", "Finance Clearance", "Admin Clearance", "HR Clearance"].map(c => (
                          <div key={c} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <span className="text-sm font-bold">{c}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-yellow-500/10 text-yellow-500 font-bold rounded uppercase">Pending</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flat-card bg-card p-6 space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-primary">Pending Assets</h4>
                      <div className="space-y-3">
                        {[
                          { name: "Apple MacBook Pro", id: "AST-992" },
                          { name: "Employee ID Card", id: "EMP-001" },
                          { name: "Security Key", id: "SEC-12" }
                        ].map(a => (
                          <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div>
                              <p className="text-sm font-bold">{a.name}</p>
                              <p className="text-[10px] font-bold text-muted-foreground">{a.id}</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-500 font-bold rounded uppercase">Return Pending</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab !== "Overview" && (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tighter">{activeTab} Details</h3>
                    <p className="text-sm font-medium">Detailed data view for {activeTab} is being loaded...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
