import { Megaphone, Pin, Calendar, Users, Eye, Edit3, Trash2, Plus, Paperclip, PinOff, Copy, Archive } from "lucide-react";
import { KebabMenu } from "../../../../components/ui/KebabMenu";
import { toast } from "sonner";

interface Notice {
  id: string;
  title: string;
  content: string;
  department: string;
  date: string;
  isPinned: boolean;
  expiryDate: string;
}

const MOCK_NOTICES: Notice[] = [
  {
    id: "1",
    title: "Annual Townhall 2026",
    content: "All employees are requested to join the annual townhall meeting on Friday.",
    department: "All Departments",
    date: "2026-05-10",
    isPinned: true,
    expiryDate: "2026-05-15"
  },
  {
    id: "2",
    title: "New Policy Update: Remote Work",
    content: "The company has updated the remote work policy. Please check the attachment.",
    department: "HR & Operations",
    date: "2026-05-08",
    isPinned: false,
    expiryDate: "2026-06-01"
  }
];

export function BulletinBoardPage() {
  const [notices] = useState<Notice[]>(MOCK_NOTICES);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-orange-500" />
            Bulletin Board
          </h2>
          <p className="text-sm text-muted-foreground">Manage company-wide announcements and departmental notices.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-bold rounded-lg hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" />
          Post New Notice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor / List Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active Notices</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-secondary px-2 py-1 rounded-md border border-border">Total: {notices.length}</span>
            </div>
          </div>

          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                {notice.isPinned && (
                  <div className="absolute top-0 right-0 p-2 text-orange-500">
                    <Pin className="w-4 h-4 fill-current" />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-foreground">{notice.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {notice.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {notice.department}
                        </span>
                        <span className="flex items-center gap-1 text-orange-600 font-medium bg-orange-500/10 px-1.5 py-0.5 rounded">
                          Expires: {notice.expiryDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {notice.content}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium hover:bg-secondary rounded-lg transition-colors">
                        <Paperclip className="w-3.5 h-3.5" />
                        Attachment.pdf
                      </button>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <KebabMenu 
                        size="sm"
                        items={[
                          { label: "View Notice", icon: Eye, onClick: () => toast.info(`Viewing ${notice.title}`) },
                          { label: "Edit Notice", icon: Edit3, onClick: () => toast.info(`Editing ${notice.title}`) },
                          { label: notice.isPinned ? "Unpin Notice" : "Pin Notice", icon: notice.isPinned ? PinOff : Pin, onClick: () => toast.success(notice.isPinned ? "Unpinned" : "Pinned") },
                          { label: "Duplicate", icon: Copy, onClick: () => toast.info("Notice duplicated") },
                          { label: "Archive", icon: Archive, onClick: () => toast.info("Notice archived") },
                          { label: "Delete", icon: Trash2, variant: "destructive", separator: true, onClick: () => {
                            if (confirm(`Permanently delete "${notice.title}"?`)) toast.error("Notice deleted");
                          }},
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters / Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Filters</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Department</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                  <option>All Departments</option>
                  <option>Human Resources</option>
                  <option>Engineering</option>
                  <option>Sales & Marketing</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Status</label>
                <div className="flex flex-col gap-2">
                  {["Active", "Expired", "Pinned Only", "Scheduled"].map(status => (
                    <label key={status} className="flex items-center gap-2 text-sm text-foreground cursor-pointer group">
                      <div className="w-4 h-4 rounded border border-border group-hover:border-primary flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-sm opacity-0 group-hover:opacity-20" />
                      </div>
                      {status}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 space-y-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Pro-Tip</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pinned notices always stay at the top of the employee's dashboard until they expire or are manually unpinned.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
