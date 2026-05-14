import { Employee } from "../mockData";
import { 
  GraduationCap, 
  FileText, 
  Download, 
  Edit2, 
  Plus, 
  Trash2, 
  Eye,
  Calendar,
  Award,
  MapPin,
  BookOpen,
  Building2
} from "lucide-react";
import { format } from "date-fns";

interface Props {
  employee: Employee;
}

function SectionHeader({ title, icon: Icon, onAdd }: { title: string; icon: any; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">{title}</h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Academic History & Certifications</p>
        </div>
      </div>
      {onAdd && (
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 rounded-2xl text-xs font-black transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
          <Plus size={16} />
          ADD EDUCATION
        </button>
      )}
    </div>
  );
}

export function EducationDetails({ employee }: Props) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "MMM yyyy");
    } catch {
      return "-";
    }
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Education Details" icon={GraduationCap} onAdd={() => {}} />

      {!employee.education || employee.education.length === 0 ? (
        <div className="py-24 text-center bg-card/30 rounded-[3rem] border-2 border-dashed border-border/50 backdrop-blur-sm">
          <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <GraduationCap className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-black text-foreground mb-2">No education details available</h3>
          <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto">This employee hasn't added any academic qualifications yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {employee.education.map((edu, idx) => (
            <div key={idx} className="group relative bg-card hover:bg-secondary/20 border border-border rounded-[2.5rem] p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
              <div className="absolute right-8 top-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <button className="p-2.5 bg-background border border-border text-foreground hover:bg-primary hover:text-white hover:border-primary rounded-xl transition-all shadow-sm">
                  <Edit2 size={14} />
                </button>
                <button className="p-2.5 bg-background border border-border text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 rounded-xl transition-all shadow-sm">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <GraduationCap className="w-10 h-10 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-xl font-black text-foreground leading-tight">{edu.qualification}</h4>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                        {edu.educationLevel}
                      </span>
                    </div>
                    <p className="text-base font-bold text-muted-foreground flex items-center gap-2">
                      <BookOpen size={16} className="opacity-40" />
                      {edu.specialization}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Institution / College</p>
                      <p className="text-sm font-black flex items-center gap-2">
                        <Building2 size={14} className="text-primary/60" />
                        {edu.institutionName}
                      </p>
                      <p className="text-[11px] font-bold text-muted-foreground ml-5">{edu.university}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Duration & Mode</p>
                      <p className="text-sm font-black flex items-center gap-2">
                        <Calendar size={14} className="text-primary/60" />
                        {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                      </p>
                      <p className="text-[11px] font-bold text-muted-foreground ml-5 uppercase tracking-wider">{edu.modeOfStudy}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Grade / Result</p>
                      <p className="text-sm font-black text-primary flex items-center gap-2">
                        <Award size={14} className="text-primary" />
                        {edu.grade}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Location</p>
                      <p className="text-sm font-black flex items-center gap-2">
                        <MapPin size={14} className="text-primary/60" />
                        {edu.country}
                      </p>
                    </div>
                  </div>
                </div>

                {edu.certificateName && (
                  <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-border group/doc cursor-pointer hover:bg-secondary/50 transition-colors mt-2">
                    <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-sm group-hover/doc:scale-110 transition-transform">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 opacity-60">Marksheet / Certificate</p>
                      <p className="text-xs font-black truncate">{edu.certificateName}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-all" title="View Document">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-all" title="Download">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
