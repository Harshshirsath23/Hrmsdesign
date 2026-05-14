import React from "react";
import { 
  FileText, 
  ChevronLeft, 
  Download, 
  Printer, 
  Share2, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Users,
  Calendar,
  Shield,
  Activity,
  MoreVertical,
  ExternalLink,
  Eye,
  RefreshCw,
  Plus,
  Send,
  Paperclip,
  File
} from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { KebabMenu } from "../../../../../components/ui/KebabMenu";
import { toast } from "sonner";
import { Badge } from "../../../../../components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../../../components/ui/table";
import { LetterBatch } from "./types";
import { employees } from "../../../../../components/employees/mockData";
import { format } from "date-fns";
import { cn } from "../../../../../components/ui/utils";

interface LetterDetailsProps {
  batch: LetterBatch;
  onBack: () => void;
}

export function LetterDetails({ batch, onBack }: LetterDetailsProps) {
  const selectedEmployees = employees.filter(e => batch.selectedEmployeeIds.includes(e.id));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="w-10 h-10 rounded-xl border border-border hover:bg-secondary"
          >
            <ChevronLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">{batch.subject}</h2>
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border-emerald-500/10 rounded-md">
                {batch.status}
              </Badge>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              Batch ID: {batch.id} • Created on {format(new Date(batch.createdAt), "dd MMM yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 rounded-xl text-xs font-black uppercase tracking-widest">
            <Download className="w-4 h-4 mr-2" /> Download ZIP
          </Button>
          <Button className="h-10 px-6 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">
            <RefreshCw className="w-4 h-4 mr-2" /> Re-generate All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoCard label="Letter Type" value={batch.letterType} Icon={FileText} />
            <InfoCard label="Effective Date" value={format(new Date(batch.effectiveDate), "dd MMM yyyy")} Icon={Calendar} />
            <InfoCard label="Workflow" value={batch.approvalWorkflow} Icon={Shield} />
            <InfoCard label="Publish Date" value={format(new Date(batch.publishDate), "dd MMM yyyy")} Icon={Clock} />
          </div>

          {/* Employee List */}
          <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Selected Employees ({selectedEmployees.length})
              </h3>
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest opacity-60">
                View All
              </Button>
            </div>
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-8">Employee</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pr-8 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedEmployees.map((emp) => (
                  <TableRow key={emp.id} className="border-border/50 group hover:bg-secondary/30 transition-colors">
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm", emp.avatarColor)}>
                          {emp.initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{emp.name}</p>
                          <p className="text-[10px] font-medium text-muted-foreground font-mono uppercase tracking-tighter">{emp.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest rounded-md bg-emerald-500/5 text-emerald-500 border-emerald-500/10">
                        Generated
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right" onClick={(e) => e.stopPropagation()}>
                      <KebabMenu 
                        size="sm"
                        items={[
                          { label: "Preview Letter", icon: Eye, onClick: () => toast.info(`Previewing for ${emp.name}`) },
                          { label: "Download PDF", icon: Download, onClick: () => toast.success("Download started") },
                          { label: "Print Letter", icon: Printer, onClick: () => window.print() },
                          { label: "Send to Employee", icon: Send, separator: true, onClick: () => toast.info("Sending email notification...") },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Remarks */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Batch Remarks
            </h3>
            <p className="text-sm font-bold text-muted-foreground leading-relaxed italic">
              "{batch.remarks || "No internal remarks provided for this batch."}"
            </p>
          </div>

          {/* Supporting Documents */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-primary" />
              Supporting Documents
            </h3>
            {batch.attachmentUrls && batch.attachmentUrls.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {batch.attachmentUrls.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl border border-border/50 group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-primary shadow-sm">
                        <File size={16} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-foreground">{file}</p>
                        <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">PDF Document • 1.2 MB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                        <Download size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                        <ExternalLink size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-secondary/10 rounded-2xl border border-dashed border-border/50">
                <p className="text-xs font-bold text-muted-foreground opacity-60">No supporting documents attached to this batch.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Approval & Timeline */}
        <div className="space-y-6">
          {/* Approval Timeline */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-8">Approval History</h4>
            <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border dashed" />
              
              <TimelineItem 
                title="Batch Created" 
                user={batch.createdBy} 
                time={format(new Date(batch.createdAt), "dd MMM, hh:mm a")} 
                status="completed"
                Icon={Plus}
              />
              
              <TimelineItem 
                title={batch.approvalWorkflow} 
                user="Pending Review" 
                time="--" 
                status="active"
                Icon={UserCheck}
              />
              
              <TimelineItem 
                title="Final Publication" 
                user="System" 
                time="--" 
                status="pending"
                Icon={Send}
              />
            </div>
          </div>

          {/* Activity Log */}
          <div className="p-8 rounded-[2.5rem] bg-secondary/30 border border-border">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Activity Log</h4>
            <div className="space-y-4">
              <ActivityRow icon={Clock} text="Batch created by Sarah Chen" time="2h ago" />
              <ActivityRow icon={CheckCircle2} text="Preview generated for 3 employees" time="1h ago" />
              <ActivityRow icon={Shield} text="Workflow set to 'HR Manager'" time="1h ago" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, Icon }: { label: string, value: string, Icon: any }) {
  return (
    <div className="bg-card border border-border p-6 rounded-[2rem] space-y-3 shadow-sm hover:border-primary/30 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-0.5">{label}</p>
        <p className="text-xs font-black text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function TimelineItem({ title, user, time, status, Icon }: { title: string, user: string, time: string, status: 'completed' | 'active' | 'pending', Icon: any }) {
  return (
    <div className="flex gap-6 relative z-10">
      <div className={cn(
        "w-6 h-6 rounded-lg flex items-center justify-center border transition-all",
        status === 'completed' ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
        status === 'active' ? "bg-primary border-primary text-white animate-pulse shadow-lg shadow-primary/20" :
        "bg-muted border-border text-muted-foreground"
      )}>
        <Icon size={12} />
      </div>
      <div className="flex-1 -mt-0.5">
        <p className={cn("text-xs font-black tracking-tight", status === 'pending' ? "text-muted-foreground" : "text-foreground")}>{title}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] font-bold text-muted-foreground">{user}</span>
          <span className="text-[10px] font-medium text-muted-foreground opacity-60">{time}</span>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ icon: Icon, text, time }: { icon: any, text: string, time: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={12} className="mt-1 text-primary/60" />
      <div className="flex-1">
        <p className="text-xs font-bold text-foreground leading-snug">{text}</p>
        <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{time}</p>
      </div>
    </div>
  );
}
