import { useState } from "react";
import { 
  User, 
  FileText, 
  CheckSquare, 
  Clock, 
  ClipboardCheck, 
  Wallet, 
  MessageSquare, 
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2
} from "lucide-react";
import { employees } from "../../../../components/employees/mockData";

interface Props {
  onClose: () => void;
  onSave: (data: any) => void;
}

export function AddOffboardingForm({ onClose, onSave }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    employeeId: "",
    resignationDate: "",
    lastWorkingDay: "",
    noticePeriod: "",
    type: "Voluntary",
    reason: "",
  });
  const totalSteps = 8;

  const selectedEmployee = employees.find(e => e.id === formData.employeeId);

  const steps = [
    { id: 1, title: "Employee Information", icon: User },
    { id: 2, title: "Resignation Details", icon: FileText },
    { id: 3, title: "Approval Workflow", icon: CheckSquare },
    { id: 4, title: "Notice Period", icon: Clock },
    { id: 5, title: "Clearance Checklist", icon: ClipboardCheck },
    { id: 6, title: "Financial Settlement", icon: Wallet },
    { id: 7, title: "Exit Interview", icon: MessageSquare },
    { id: 8, title: "Documents", icon: Upload },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => currentStep < totalSteps && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleSave = () => {
    if (!selectedEmployee) {
      alert("Please select an employee first.");
      setCurrentStep(1);
      return;
    }
    onSave({
      ...formData,
      name: selectedEmployee.name,
      initials: selectedEmployee.initials,
      avatarColor: selectedEmployee.avatarColor,
      department: selectedEmployee.department,
      designation: selectedEmployee.designation,
      reportingManager: selectedEmployee.reportingTo || "HR Manager",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-card w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/10 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-secondary/30">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Add New Offboarding</h2>
            <p className="text-sm text-muted-foreground font-medium mt-1">Fill in the details to initiate the employee exit process.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Steps */}
          <div className="w-72 bg-secondary/20 border-r border-border p-6 hidden lg:block overflow-y-auto">
            <div className="space-y-2">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    currentStep === step.id 
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                      : currentStep > step.id
                      ? "text-green-500 bg-green-500/5"
                      : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    currentStep === step.id ? "border-white/20 bg-white/10" : "border-current opacity-60"
                  }`}>
                    {(() => {
                      const Icon = currentStep > step.id ? CheckCircle2 : step.icon;
                      return <Icon className={currentStep > step.id ? "w-5 h-5" : "w-4 h-4"} />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Step {step.id}</p>
                    <p className="text-sm font-bold truncate">{step.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-card/50">
            <div className="max-w-2xl mx-auto space-y-8">
              
              {/* Progress for Mobile */}
              <div className="lg:hidden flex items-center justify-between mb-6">
                <span className="text-xs font-black uppercase tracking-widest text-primary">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm font-bold">{steps[currentStep-1].title}</span>
              </div>

              {/* Step 1: Employee Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Employee Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Employee Name</label>
                      <select 
                        value={formData.employeeId}
                        onChange={(e) => handleInputChange("employeeId", e.target.value)}
                        className="flat-input w-full px-4 py-3 text-sm font-bold"
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Employee ID</label>
                      <input type="text" readOnly className="flat-input w-full px-4 py-3 text-sm font-bold bg-secondary/50" value={selectedEmployee?.employeeId || ""} placeholder="Auto-filled" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Department</label>
                      <input type="text" readOnly className="flat-input w-full px-4 py-3 text-sm font-bold bg-secondary/50" value={selectedEmployee?.department || ""} placeholder="Auto-filled" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Designation</label>
                      <input type="text" readOnly className="flat-input w-full px-4 py-3 text-sm font-bold bg-secondary/50" value={selectedEmployee?.designation || ""} placeholder="Auto-filled" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Reporting Manager</label>
                      <input type="text" readOnly className="flat-input w-full px-4 py-3 text-sm font-bold bg-secondary/50" value={selectedEmployee?.reportingTo || "HR Manager"} placeholder="Auto-filled" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Date of Joining</label>
                      <input type="text" readOnly className="flat-input w-full px-4 py-3 text-sm font-bold bg-secondary/50" value={selectedEmployee?.joiningDate || ""} placeholder="Auto-filled" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Resignation Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Resignation Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Resignation Date</label>
                      <input 
                        type="date" 
                        value={formData.resignationDate}
                        onChange={(e) => handleInputChange("resignationDate", e.target.value)}
                        className="flat-input w-full px-4 py-3 text-sm font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Last Working Day</label>
                      <input 
                        type="date" 
                        value={formData.lastWorkingDay}
                        onChange={(e) => handleInputChange("lastWorkingDay", e.target.value)}
                        className="flat-input w-full px-4 py-3 text-sm font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Notice Period Days</label>
                      <input 
                        type="number" 
                        value={formData.noticePeriod}
                        onChange={(e) => handleInputChange("noticePeriod", e.target.value)}
                        className="flat-input w-full px-4 py-3 text-sm font-bold" 
                        placeholder="e.g. 30" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Resignation Type</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => handleInputChange("type", e.target.value)}
                        className="flat-input w-full px-4 py-3 text-sm font-bold"
                      >
                        <option value="Voluntary">Voluntary</option>
                        <option value="Termination">Termination</option>
                        <option value="Retirement">Retirement</option>
                        <option value="Contract End">Contract End</option>
                      </select>
                    </div>
                    <div className="col-span-full space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Reason for Leaving</label>
                      <textarea 
                        value={formData.reason}
                        onChange={(e) => handleInputChange("reason", e.target.value)}
                        className="flat-input w-full px-4 py-3 text-sm font-bold min-h-[100px]" 
                        placeholder="Detailed reason..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* Add more steps as needed... */}
              {currentStep > 2 && currentStep < 8 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                    {(() => {
                      const Icon = steps[currentStep-1].icon;
                      return <Icon className="w-10 h-10 text-muted-foreground opacity-30" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">{steps[currentStep-1].title}</h3>
                    <p className="text-sm text-muted-foreground font-medium mt-1">This section is being implemented with full logic...</p>
                  </div>
                </div>
              )}

              {/* Step 8: Documents */}
              {currentStep === 8 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Required Documents
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      "Resignation Letter",
                      "Clearance Form",
                      "Relieving Letter",
                      "Experience Letter",
                      "Settlement Copy"
                    ].map((doc) => (
                      <div key={doc} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{doc}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">PDF, JPG up to 10MB</p>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg transition-all">
                          <Upload className="w-3.5 h-3.5" />
                          Upload
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border flex items-center justify-between bg-secondary/10">
          <button 
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 text-sm font-black uppercase tracking-widest text-foreground bg-card border border-border rounded-xl hover:bg-secondary transition-all disabled:opacity-0"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={currentStep === totalSteps ? handleSave : nextStep}
              className="flex items-center gap-2 px-8 py-3 text-sm font-black uppercase tracking-widest text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
            >
              {currentStep === totalSteps ? "Finish & Save" : "Next Step"}
              {currentStep !== totalSteps && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
