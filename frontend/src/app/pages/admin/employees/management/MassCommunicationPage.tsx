import { Send, Mail, MessageSquare, Bell, Filter, Calendar, History, ChevronRight, FileText, RefreshCw, BarChart2, Trash2, Eye } from "lucide-react";
import { KebabMenu } from "../../../../components/ui/KebabMenu";
import { toast } from "sonner";

export function MassCommunicationPage() {
  const [channel, setChannel] = useState<"email" | "sms" | "push">("email");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-500" />
            Mass Communication
          </h2>
          <p className="text-sm text-muted-foreground">Broadcast messages across multiple channels to targeted employee groups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex border-b border-border">
              <button 
                onClick={() => setChannel("email")}
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                  channel === "email" ? "bg-background border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button 
                onClick={() => setChannel("sms")}
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                  channel === "sms" ? "bg-background border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                SMS
              </button>
              <button 
                onClick={() => setChannel("push")}
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                  channel === "push" ? "bg-background border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <Bell className="w-4 h-4" />
                Push Notification
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Subject Line</label>
                <input 
                  type="text" 
                  placeholder="Enter message subject..."
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Message Content</label>
                <textarea 
                  rows={8}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground text-xs font-bold rounded-lg hover:bg-secondary/80 transition-colors">
                    <Calendar className="w-3.5 h-3.5" />
                    Schedule
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground text-xs font-bold rounded-lg hover:bg-secondary/80 transition-colors">
                    <History className="w-3.5 h-3.5" />
                    Load Template
                  </button>
                </div>
                <button className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-md shadow-primary/20">
                  <Send className="w-4 h-4" />
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recipients & Logs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <Filter className="w-4 h-4 text-muted-foreground" />
              Target Audience
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-secondary/50 rounded-lg border border-border space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Department</p>
                <p className="text-xs font-medium">All Departments</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg border border-border space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Designation</p>
                <p className="text-xs font-medium">Any Designation</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 space-y-1">
                <p className="text-[10px] font-bold text-primary uppercase">Estimated Reach</p>
                <p className="text-lg font-bold text-primary">1,248 Employees</p>
              </div>
            </div>

            <button className="w-full py-2 border border-border text-xs font-bold rounded-lg hover:bg-secondary transition-colors">
              Edit Filters
            </button>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="text-sm font-bold text-foreground">Recent Deliveries</h3>
            </div>
            <div className="divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-secondary/30 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold truncate max-w-[120px]">Monthly Newsletter</p>
                      <p className="text-[10px] text-muted-foreground">May 11 • 98% Success</p>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <KebabMenu 
                      size="sm"
                      items={[
                        { label: "View Report", icon: FileText, onClick: () => toast.info("Viewing delivery report") },
                        { label: "View Content", icon: Eye, onClick: () => toast.info("Viewing message content") },
                        { label: "Resend Message", icon: RefreshCw, onClick: () => toast.success("Message queued for resending") },
                        { label: "Export Analytics", icon: BarChart2, onClick: () => toast.success("Analytics exported to PDF") },
                        { label: "Delete Log", icon: Trash2, variant: "destructive", separator: true, onClick: () => {
                          if (confirm("Permanently delete this delivery log?")) toast.error("Log deleted");
                        }},
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
