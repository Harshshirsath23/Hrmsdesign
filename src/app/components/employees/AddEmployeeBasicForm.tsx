/**
 * Employee Basic Information Form - Modern Enterprise HRMS
 * Complete form rebuild with React Hook Form + Zod + Tailwind + Shadcn UI
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { motion } from 'motion';
import {
  ChevronRight, ArrowLeft, Save, FileText, Briefcase, Clock, CreditCard,
  Calendar, User, Shield, Upload, X, Check, AlertCircle, CheckCircle2,
  ChevronDown, Search, Eye, EyeOff, MapPin, Users, Building2, Loader2,
  ImageOff, Image, Bell, HelpCircle, Tag, MessageSquare, Mail, Phone,
  GraduationCap, Plus, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';

// ═══════════════════════════════════════════════════════════
// VALIDATION SCHEMA
// ═══════════════════════════════════════════════════════════

const validateAadhaar = (value: string) => /^\d{12}$/.test(value.replace(/\s/g, ''));
const validatePAN = (value: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
const validatePhone = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue.length >= 10 && cleanValue.length <= 15;
};

const formSchema = z.object({
  // LEFT COLUMN
  employeeNumberSeries: z.string().min(1, 'Required'),
  employeeId: z.string().min(1, 'Required'),
  firstName: z.string().min(2, 'At least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'At least 2 characters'),
  dateOfBirth: z.string().min(1, 'Required'),
  gender: z.enum(['male', 'female', 'other']),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  aadhaarNumber: z.string().refine(validateAadhaar, 'Must be 12 digits'),
  panNumber: z.string().refine(validatePAN, 'Invalid PAN format'),
  bloodGroup: z.string().min(1, 'Required'),
  nationality: z.string().min(1, 'Required'),
  personalEmail: z.string().email('Invalid email'),
  personalMobileNumber: z.string().refine(validatePhone, 'Invalid phone number'),
  emergencyContactName: z.string().min(2, 'At least 2 characters'),
  emergencyContactNumber: z.string().refine(validatePhone, 'Invalid phone number'),
  currentAddress: z.string().min(5, 'At least 5 characters'),
  permanentAddress: z.string().optional(),
  sameAsCurrent: z.boolean(),
  reportingManagerId: z.string().min(1, 'Required'),
  referredById: z.string().optional(),
  employeeStatus: z.enum(['active', 'probation', 'notice_period', 'resigned', 'terminated']),
  dateOfJoining: z.string().min(1, 'Required'),
  workLocationId: z.string().min(1, 'Required'),
  employeeCategory: z.enum(['full_time', 'intern', 'contract', 'consultant', 'freelancer']),
  allowEmployeeToFillInfo: z.boolean(),

  // RIGHT COLUMN
  probationPeriod: z.coerce.number().optional(),
  probationPeriodUnit: z.enum(['days', 'months']),
  confirmationDate: z.string().optional(),
  officialEmail: z.string().email('Invalid email'),
  officialMobileNumber: z.string().refine(validatePhone, 'Invalid phone number'),
  fathersName: z.string().optional(),
  mothersName: z.string().optional(),
  spouseName: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiryDate: z.string().optional(),
  uanNumber: z.string().optional(),
  esicNumber: z.string().optional(),
  disabilityStatus: z.boolean(),
  religion: z.string().optional(),
  languagesKnown: z.array(z.string()).optional(),
  shiftAssignmentId: z.string().optional(),
  attendanceTrackingType: z.enum(['biometrics', 'mobile_gps', 'web_login', 'hybrid']),
  deviceId: z.string().optional(),
  employeeTags: z.array(z.string()).optional(),
  hrNotes: z.string().max(1000, 'Max 1000 characters').optional(),
  internalNotes: z.string().max(1000, 'Max 1000 characters').optional(),

  // NEW SECTIONS
  educationDetails: z.array(z.object({
    educationLevel: z.string(),
    qualification: z.string(),
    specialization: z.string(),
    institutionName: z.string(),
    boardUniversity: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    grade: z.string(),
    modeOfStudy: z.string(),
    country: z.string(),
    certificateUrl: z.string().optional(),
  })).optional(),

  backgroundCheck: z.object({
    verificationStatus: z.enum(['Pending', 'In Progress', 'Verified', 'Failed', 'Not Required']),
    completedOn: z.string().optional(),
    agencyName: z.string().optional(),
    remarks: z.string().optional(),
    reportUrl: z.string().optional(),
    verifiedBy: z.string().optional(),
    referenceNumber: z.string().optional(),
  }).optional(),
}).refine(
  (data) => {
    if (!data.dateOfBirth || !data.dateOfJoining) return true;
    return new Date(data.dateOfJoining) >= new Date(data.dateOfBirth);
  },
  { message: 'DOJ cannot be before DOB', path: ['dateOfJoining'] }
).refine(
  (data) => !data.sameAsCurrent || (data.permanentAddress === data.currentAddress || !data.permanentAddress),
  { message: 'Required if different from current', path: ['permanentAddress'] }
);

type FormData = z.infer<typeof formSchema>;

// ═══════════════════════════════════════════════════════════
// OPTIONS DATA
// ═══════════════════════════════════════════════════════════

const SERIES_OPTIONS = [
  { value: 'EMP', label: 'EMP - Standard' },
  { value: 'TECH', label: 'TECH - Technology' },
  { value: 'SALES', label: 'SALES - Sales' },
  { value: 'HR', label: 'HR - Human Resources' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const NATIONALITIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan'];

const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'probation', label: 'Probation' },
  { value: 'notice_period', label: 'Notice Period' },
  { value: 'resigned', label: 'Resigned' },
  { value: 'terminated', label: 'Terminated' },
];

const EMPLOYEE_CATEGORY_OPTIONS = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'intern', label: 'Intern' },
  { value: 'contract', label: 'Contract' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'freelancer', label: 'Freelancer' },
];

const TRACKING_OPTIONS = [
  { value: 'biometrics', label: 'Biometrics' },
  { value: 'mobile_gps', label: 'Mobile GPS' },
  { value: 'web_login', label: 'Web Login' },
  { value: 'hybrid', label: 'Hybrid' },
];

const RELIGIONS = ['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Judaism', 'Sikhism', 'Other'];

const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin', 'Portuguese'];

const WORK_LOCATIONS = ['New York', 'San Francisco', 'London', 'Mumbai', 'Tokyo', 'Sydney'];

const MANAGERS = [
  { id: '1', name: 'Sarah Chen - VP Engineering' },
  { id: '2', name: 'Alex Kumar - CTO' },
  { id: '3', name: 'Maria Rodriguez - HR Director' },
  { id: '4', name: 'James Wilson - Engineering Manager' },
];

const SHIFTS = ['Day Shift', 'Night Shift', 'Rotating', 'Flexible'];

// ═══════════════════════════════════════════════════════════
// FORM UI COMPONENTS
// ═══════════════════════════════════════════════════════════

function SectionHeader({ title, icon: Icon, description }: { title: string; icon?: any; description?: string }) {
  return (
    <div className="flex flex-col gap-1 mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Icon size={18} strokeWidth={2.5} />
          </div>
        )}
        <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
      </div>
      {description && <p className="text-sm text-muted-foreground ml-11">{description}</p>}
      <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent mt-2" />
    </div>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

function FormField({ label, required, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 ml-0.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative group">
        {children}
        {error && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-red-500 font-bold animate-in slide-in-from-top-1 duration-200">
            <AlertCircle size={12} strokeWidth={3} />
            {error}
          </div>
        )}
        {!error && hint && <p className="text-[10px] text-muted-foreground/80 font-medium mt-1 ml-0.5">{hint}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PHOTO UPLOAD COMPONENT
// ═══════════════════════════════════════════════════════════

interface PhotoUploadProps {
  onChange: (file: File | null) => void;
  preview?: string;
}

function PhotoUpload({ onChange, preview }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>(preview || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLocalPreview(result);
      onChange(file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      {localPreview ? (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border bg-secondary">
          <img src={localPreview} alt="Profile" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => {
              setLocalPreview('');
              onChange(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground/50 hover:bg-secondary/30'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload size={20} className="text-muted-foreground" />
            <p className="text-xs font-medium">Drag & drop or click to upload</p>
            <p className="text-[10px] text-muted-foreground">JPG, PNG (Max 5MB)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.size <= 5242880) processFile(file);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SEARCHABLE SELECT
// ═══════════════════════════════════════════════════════════

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  searchable?: boolean;
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  searchable = true,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 h-11 text-sm text-left bg-white dark:bg-gray-800 border border-border/40 rounded-xl hover:border-primary/50 transition-all shadow-sm"
      >
        <span className={selectedLabel ? 'font-bold' : 'text-muted-foreground'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-border/40 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {searchable && (
              <div className="p-3 border-b border-border/40">
                <div className="relative">
                  <Input
                    placeholder="Search options..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 text-xs pl-9 bg-slate-50 dark:bg-slate-800 rounded-lg border-none"
                    autoFocus
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto p-1.5">
              {filtered.length > 0 ? (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs rounded-lg transition-all flex items-center justify-between ${
                      value === opt.value 
                        ? 'bg-primary text-primary-foreground font-black' 
                        : 'hover:bg-primary/5 text-foreground font-bold'
                    }`}
                  >
                    {opt.label}
                    {value === opt.value && <Check size={14} />}
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground font-medium">
                  No options found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP INDICATOR
// ═══════════════════════════════════════════════════════════

const STEPS = [
  { number: 1, label: 'Basic Information', icon: User },
  { number: 2, label: 'Employee Position', icon: Briefcase },
  { number: 3, label: 'Statutory Information', icon: FileText },
  { number: 4, label: 'Documents', icon: Upload },
  { number: 5, label: 'Bank Details', icon: CreditCard },
  { number: 6, label: 'System Access', icon: Shield },
];

function StepIndicator() {
  return (
    <div className="flex items-center justify-between max-w-5xl mx-auto w-full px-6 py-6 overflow-x-auto no-scrollbar">
      {STEPS.map((step, idx) => (
        <div key={step.number} className="flex items-center gap-3 relative group shrink-0">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-2xl text-sm font-black transition-all duration-500 border-2 ${
                step.number === 1
                  ? 'bg-primary border-primary text-primary-foreground shadow-[0_10px_25px_rgba(var(--primary-rgb),0.25)] scale-110'
                  : 'bg-white dark:bg-gray-900 border-border/50 text-muted-foreground'
              }`}
            >
              {step.number === 1 ? (
                <step.icon size={20} strokeWidth={2.5} className="animate-in zoom-in-50 duration-500" />
              ) : (
                <span>0{step.number}</span>
              )}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-300 ${
              step.number === 1 ? 'text-primary' : 'text-muted-foreground/60'
            }`}>
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className="w-16 h-[2px] mb-8 bg-border/30 relative overflow-hidden hidden md:block">
              <div className={`absolute inset-0 bg-primary/20 transition-transform duration-700 origin-left`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN FORM COMPONENT
// ═══════════════════════════════════════════════════════════

export default function AddEmployeeBasicForm() {
  const navigate = useNavigate();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeNumberSeries: 'EMP',
      employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      maritalStatus: 'single',
      aadhaarNumber: '',
      panNumber: '',
      bloodGroup: '',
      nationality: 'India',
      personalEmail: '',
      personalMobileNumber: '',
      emergencyContactName: '',
      emergencyContactNumber: '',
      currentAddress: '',
      permanentAddress: '',
      sameAsCurrent: false,
      reportingManagerId: '',
      referredById: '',
      employeeStatus: 'active',
      dateOfJoining: '',
      workLocationId: '',
      employeeCategory: 'full_time',
      allowEmployeeToFillInfo: false,
      probationPeriod: 90,
      probationPeriodUnit: 'days',
      confirmationDate: '',
      officialEmail: '',
      officialMobileNumber: '',
      fathersName: '',
      mothersName: '',
      spouseName: '',
      passportNumber: '',
      passportExpiryDate: '',
      uanNumber: '',
      esicNumber: '',
      disabilityStatus: false,
      religion: '',
      languagesKnown: [],
      shiftAssignmentId: '',
      attendanceTrackingType: 'biometrics',
      deviceId: '',
      employeeTags: [],
      hrNotes: '',
      internalNotes: '',
      educationDetails: [],
      backgroundCheck: {
        verificationStatus: 'Pending',
        agencyName: '',
        remarks: '',
      },
    },
    mode: 'onChange',
  });

  const { watch, setValue, formState: { errors, isDirty, isSubmitting } } = form;

  // Auto-calculate confirmation date
  const dateOfJoining = watch('dateOfJoining');
  const probationPeriod = watch('probationPeriod');
  const probationUnit = watch('probationPeriodUnit');
  const sameAsCurrent = watch('sameAsCurrent');

  useEffect(() => {
    if (dateOfJoining && probationPeriod) {
      const date = new Date(dateOfJoining);
      if (probationUnit === 'days') {
        date.setDate(date.getDate() + Number(probationPeriod));
      } else {
        date.setMonth(date.getMonth() + Number(probationPeriod));
      }
      setValue('confirmationDate', date.toISOString().split('T')[0]);
    }
  }, [dateOfJoining, probationPeriod, probationUnit, setValue]);

  // Auto-fill permanent address
  useEffect(() => {
    if (sameAsCurrent) {
      setValue('permanentAddress', watch('currentAddress'));
    }
  }, [sameAsCurrent, watch('currentAddress'), setValue]);

  // Auto-save functionality
  useEffect(() => {
    setUnsavedChanges(isDirty);
    clearTimeout(autoSaveTimerRef.current);
    if (isDirty) {
      autoSaveTimerRef.current = setTimeout(() => {
        handleDraftSave();
      }, 30000); // Auto-save every 30 seconds
    }
    return () => clearTimeout(autoSaveTimerRef.current);
  }, [isDirty, watch()]);

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  const handleDraftSave = async () => {
    setIsDrafting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const formData = form.getValues();
      localStorage.setItem('employee_draft', JSON.stringify(formData));
      toast.success('Draft saved successfully', { duration: 2000 });
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsDrafting(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Form data:', data, 'Photo:', photoFile);
      localStorage.removeItem('employee_draft');
      toast.success('Employee added successfully!');
      navigate('/admin/employees');
    } catch (error) {
      toast.error('Failed to save employee');
    }
  };

  const handleCancel = () => {
    if (unsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/admin/employees');
      }
    } else {
      navigate('/admin/employees');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] page-enter pb-32">
      {/* Top Header & Stepper */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl border-b border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <ArrowLeft size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
              <div>
                <h1 className="text-xl font-black text-foreground tracking-tight">Add New Employee</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-2 py-0 h-5 text-[10px] uppercase">Draft Mode</Badge>
                  <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Clock size={10} /> Last saved: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end mr-4 hidden sm:flex">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Completion</span>
                <div className="w-32 h-1.5 bg-secondary rounded-full mt-1 overflow-hidden border border-border/50">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000" 
                    style={{ width: '16%' }} 
                  />
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDraftSave}
                disabled={isDrafting}
                className="h-10 px-5 rounded-xl font-bold text-xs uppercase tracking-wider border-border/50 hover:bg-secondary"
              >
                {isDrafting ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                Save Draft
              </Button>
            </div>
          </div>
          <StepIndicator />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN - 7/12 */}
            <div className="lg:col-span-7 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-gray-800/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
              >
                <SectionHeader 
                  title="Basic Information" 
                  icon={User} 
                  description="Primary identity and personal contact details of the employee"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  <FormField label="Employee Number Series" required error={errors.employeeNumberSeries?.message}>
                    <SearchableSelect
                      value={watch('employeeNumberSeries')}
                      onChange={(value) => setValue('employeeNumberSeries', value)}
                      options={SERIES_OPTIONS}
                    />
                    <button type="button" className="text-[10px] font-bold text-primary hover:underline mt-1.5 flex items-center gap-1 uppercase tracking-wider">
                      Manage Employee Number Series <ChevronRight size={10} />
                    </button>
                  </FormField>

                  <FormField label="Employee ID" required hint="Admin editable only" error={errors.employeeId?.message}>
                    <div className="relative group">
                      <Input
                        {...form.register('employeeId')}
                        className="h-11 bg-slate-50/50 dark:bg-gray-800/50 border-border/50 focus:border-primary/50 rounded-xl px-4 text-sm font-bold tracking-tight transition-all"
                      />
                      <Shield size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                    </div>
                  </FormField>

                  <div className="sm:col-span-2 grid grid-cols-3 gap-4">
                    <FormField label="First Name" required error={errors.firstName?.message}>
                      <Input placeholder="E.g. John" {...form.register('firstName')} className="h-11 bg-white dark:bg-gray-800 rounded-xl px-4 text-sm font-medium border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                    </FormField>
                    <FormField label="Middle Name">
                      <Input placeholder="Optional" {...form.register('middleName')} className="h-11 bg-white dark:bg-gray-800 rounded-xl px-4 text-sm font-medium border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                    </FormField>
                    <FormField label="Last Name" required error={errors.lastName?.message}>
                      <Input placeholder="E.g. Doe" {...form.register('lastName')} className="h-11 bg-white dark:bg-gray-800 rounded-xl px-4 text-sm font-medium border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                    </FormField>
                  </div>

                  <div className="sm:col-span-2 py-4">
                    <FormField label="Profile Photo" hint="Drag and drop your photo here">
                      <div className="flex items-center gap-6 p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 group hover:border-primary/50 transition-all duration-300">
                        <PhotoUpload onChange={setPhotoFile} preview={undefined} />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Upload a professional headshot. <br /> 
                            <span className="font-bold text-foreground">PNG, JPG up to 5MB.</span>
                          </p>
                        </div>
                      </div>
                    </FormField>
                  </div>

                  <FormField label="Date of Birth" required error={errors.dateOfBirth?.message}>
                    <div className="relative">
                      <Input type="date" {...form.register('dateOfBirth')} className="h-11 bg-white dark:bg-gray-800 rounded-xl px-4 text-sm font-medium border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                      <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
                    </div>
                  </FormField>

                  <FormField label="Gender" required error={errors.gender?.message}>
                    <SearchableSelect
                      value={watch('gender')}
                      onChange={(v) => setValue('gender', v as any)}
                      options={GENDER_OPTIONS}
                      searchable={false}
                    />
                  </FormField>

                  <FormField label="Marital Status" required error={errors.maritalStatus?.message}>
                    <SearchableSelect
                      value={watch('maritalStatus')}
                      onChange={(v) => setValue('maritalStatus', v as any)}
                      options={MARITAL_STATUS_OPTIONS}
                      searchable={false}
                    />
                  </FormField>

                  <FormField label="Aadhaar Number" required error={errors.aadhaarNumber?.message}>
                    <Input placeholder="0000 0000 0000" {...form.register('aadhaarNumber')} className="h-11 bg-white dark:bg-gray-800 rounded-xl px-4 text-sm font-mono tracking-widest border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                  </FormField>

                  <FormField label="PAN Number" required error={errors.panNumber?.message}>
                    <Input placeholder="ABCDE1234F" {...form.register('panNumber')} className="h-11 bg-white dark:bg-gray-800 rounded-xl px-4 text-sm font-mono tracking-widest uppercase border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                  </FormField>

                  <FormField label="Blood Group" required error={errors.bloodGroup?.message}>
                    <SearchableSelect
                      value={watch('bloodGroup')}
                      onChange={(v) => setValue('bloodGroup', v)}
                      options={BLOOD_GROUPS.map(b => ({ value: b, label: b }))}
                      searchable={false}
                    />
                  </FormField>

                  <FormField label="Nationality" required error={errors.nationality?.message}>
                    <SearchableSelect
                      value={watch('nationality')}
                      onChange={(v) => setValue('nationality', v)}
                      options={NATIONALITIES.map(n => ({ value: n, label: n }))}
                    />
                  </FormField>

                  <FormField label="Personal Email" required error={errors.personalEmail?.message}>
                    <div className="relative">
                      <Input type="email" placeholder="personal@email.com" {...form.register('personalEmail')} className="h-11 bg-white dark:bg-gray-800 rounded-xl px-10 text-sm font-medium border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                    </div>
                  </FormField>

                  <FormField label="Personal Mobile" required error={errors.personalMobileNumber?.message}>
                    <div className="relative">
                      <Input placeholder="+91 00000 00000" {...form.register('personalMobileNumber')} className="h-11 bg-white dark:bg-gray-800 rounded-xl px-10 text-sm font-medium border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                    </div>
                  </FormField>

                  <div className="sm:col-span-2 grid grid-cols-2 gap-4 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <FormField label="Emergency Contact Name" required error={errors.emergencyContactName?.message}>
                      <Input placeholder="Full Name" {...form.register('emergencyContactName')} className="h-10 bg-white dark:bg-gray-800 rounded-lg px-3 text-sm border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                    </FormField>
                    <FormField label="Emergency Number" required error={errors.emergencyContactNumber?.message}>
                      <Input placeholder="+91..." {...form.register('emergencyContactNumber')} className="h-10 bg-white dark:bg-gray-800 rounded-lg px-3 text-sm border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                    </FormField>
                  </div>

                  <FormField label="Current Address" required className="sm:col-span-2" error={errors.currentAddress?.message}>
                    <Textarea {...form.register('currentAddress')} className="bg-white dark:bg-gray-800 rounded-xl min-h-[100px] text-sm p-4 resize-none border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                  </FormField>

                  <div className="sm:col-span-2 flex items-center gap-3 ml-1">
                    <Checkbox 
                      id="same-address"
                      checked={sameAsCurrent}
                      onCheckedChange={(v) => setValue('sameAsCurrent', !!v)}
                      className="w-5 h-5 rounded-md border-2 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                    />
                    <label htmlFor="same-address" className="text-sm font-bold text-foreground cursor-pointer select-none">
                      Permanent address is same as current address
                    </label>
                  </div>

                  {!sameAsCurrent && (
                    <FormField label="Permanent Address" className="sm:col-span-2" error={errors.permanentAddress?.message}>
                      <Textarea {...form.register('permanentAddress')} className="bg-white dark:bg-gray-800 rounded-xl min-h-[100px] text-sm p-4 resize-none border-border/40 focus:ring-4 focus:ring-primary/10 transition-all animate-in fade-in zoom-in-95 duration-300" />
                    </FormField>
                  )}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-gray-800/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
              >
                <SectionHeader title="Employment & Organization" icon={Briefcase} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField label="Reporting Manager" required error={errors.reportingManagerId?.message}>
                    <SearchableSelect
                      value={watch('reportingManagerId')}
                      onChange={(v) => setValue('reportingManagerId', v)}
                      options={MANAGERS.map(m => ({ value: m.id, label: m.name }))}
                    />
                  </FormField>
                  <FormField label="Referred By">
                    <SearchableSelect
                      value={watch('referredById') || ''}
                      onChange={(v) => setValue('referredById', v)}
                      options={MANAGERS.map(m => ({ value: m.id, label: m.name }))}
                    />
                  </FormField>
                  <FormField label="Employee Status" required>
                    <SearchableSelect
                      value={watch('employeeStatus')}
                      onChange={(v) => setValue('employeeStatus', v as any)}
                      options={EMPLOYEE_STATUS_OPTIONS}
                      searchable={false}
                    />
                  </FormField>
                  <FormField label="Date of Joining" required error={errors.dateOfJoining?.message}>
                    <div className="relative">
                      <Input type="date" {...form.register('dateOfJoining')} className="h-11 bg-white dark:bg-gray-800 rounded-xl px-4 text-sm font-medium border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                      <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
                    </div>
                  </FormField>
                  <FormField label="Work Location" required error={errors.workLocationId?.message}>
                    <SearchableSelect
                      value={watch('workLocationId')}
                      onChange={(v) => setValue('workLocationId', v)}
                      options={WORK_LOCATIONS.map(w => ({ value: w, label: w }))}
                    />
                  </FormField>
                  <FormField label="Employee Category" required>
                    <SearchableSelect
                      value={watch('employeeCategory')}
                      onChange={(v) => setValue('employeeCategory', v as any)}
                      options={EMPLOYEE_CATEGORY_OPTIONS}
                      searchable={false}
                    />
                  </FormField>
                  <div className="sm:col-span-2 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-3">
                    <Checkbox 
                      id="allow-fill"
                      checked={watch('allowEmployeeToFillInfo')}
                      onCheckedChange={(v) => setValue('allowEmployeeToFillInfo', !!v)}
                      className="w-5 h-5 rounded-md border-2 border-emerald-400/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <label htmlFor="allow-fill" className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      Allow employee to fill remaining information during onboarding
                  </div>
                </div>
              </motion.div>

              {/* ── Education Details Repeater ─────────────────── */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-gray-800/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
              >
                <SectionHeader title="Education Details" icon={GraduationCap} description="Academic qualifications and certifications" />
                
                <div className="space-y-6">
                  {(watch('educationDetails') || []).map((edu, index) => (
                    <div key={index} className="p-6 rounded-[2rem] border border-border bg-slate-50/50 dark:bg-slate-900/30 relative group/edu">
                      <button 
                        type="button"
                        onClick={() => {
                          const current = watch('educationDetails') || [];
                          setValue('educationDetails', current.filter((_, i) => i !== index));
                        }}
                        className="absolute right-4 top-4 p-2 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all opacity-0 group-hover/edu:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Level">
                          <Select value={edu.educationLevel} onValueChange={(v) => {
                            const current = [...(watch('educationDetails') || [])];
                            current[index].educationLevel = v;
                            setValue('educationDetails', current);
                          }}>
                            <SelectTrigger className="h-10 rounded-xl">
                              <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                            <SelectContent>
                              {['SSC', 'HSC', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD'].map(l => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormField>
                        <FormField label="Qualification / Degree">
                          <Input value={edu.qualification} onChange={(e) => {
                            const current = [...(watch('educationDetails') || [])];
                            current[index].qualification = e.target.value;
                            setValue('educationDetails', current);
                          }} className="h-10 rounded-xl" />
                        </FormField>
                        <FormField label="Field of Study">
                          <Input value={edu.specialization} onChange={(e) => {
                            const current = [...(watch('educationDetails') || [])];
                            current[index].specialization = e.target.value;
                            setValue('educationDetails', current);
                          }} className="h-10 rounded-xl" />
                        </FormField>
                        <FormField label="Institution Name">
                          <Input value={edu.institutionName} onChange={(e) => {
                            const current = [...(watch('educationDetails') || [])];
                            current[index].institutionName = e.target.value;
                            setValue('educationDetails', current);
                          }} className="h-10 rounded-xl" />
                        </FormField>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField label="Start Date">
                            <Input type="date" value={edu.startDate} onChange={(e) => {
                              const current = [...(watch('educationDetails') || [])];
                              current[index].startDate = e.target.value;
                              setValue('educationDetails', current);
                            }} className="h-10 rounded-xl text-xs" />
                          </FormField>
                          <FormField label="End Date">
                            <Input type="date" value={edu.endDate} onChange={(e) => {
                              const current = [...(watch('educationDetails') || [])];
                              current[index].endDate = e.target.value;
                              setValue('educationDetails', current);
                            }} className="h-10 rounded-xl text-xs" />
                          </FormField>
                        </div>
                        <FormField label="Grade / CGPA">
                          <Input value={edu.grade} onChange={(e) => {
                            const current = [...(watch('educationDetails') || [])];
                            current[index].grade = e.target.value;
                            setValue('educationDetails', current);
                          }} className="h-10 rounded-xl" />
                        </FormField>
                      </div>
                    </div>
                  ))}

                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      const current = watch('educationDetails') || [];
                      setValue('educationDetails', [...current, {
                        educationLevel: 'Bachelor\'s',
                        qualification: '',
                        specialization: '',
                        institutionName: '',
                        boardUniversity: '',
                        startDate: '',
                        endDate: '',
                        grade: '',
                        modeOfStudy: 'Regular',
                        country: 'India'
                      }]);
                    }}
                    className="w-full h-14 border-dashed border-2 hover:border-primary hover:bg-primary/5 rounded-[1.5rem] flex items-center justify-center gap-2 text-xs font-black text-muted-foreground hover:text-primary transition-all"
                  >
                    <Plus size={16} />
                    ADD EDUCATION RECORD
                  </Button>
                </div>
              </motion.div>

              {/* ── Background Check ───────────────────────────── */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-gray-800/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
              >
                <SectionHeader title="Background Check" icon={Shield} description="Verification status and agency details" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField label="Verification Status">
                    <Select 
                      value={watch('backgroundCheck.verificationStatus')} 
                      onValueChange={(v) => setValue('backgroundCheck.verificationStatus', v as any)}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Pending', 'In Progress', 'Verified', 'Failed', 'Not Required'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Agency Name">
                    <Input {...form.register('backgroundCheck.agencyName')} className="h-11 rounded-xl" placeholder="E.g. AuthBridge" />
                  </FormField>
                  <FormField label="Verified By">
                    <Input {...form.register('backgroundCheck.verifiedBy')} className="h-11 rounded-xl" placeholder="Auditor Name" />
                  </FormField>
                  <FormField label="Reference Number">
                    <Input {...form.register('backgroundCheck.referenceNumber')} className="h-11 rounded-xl" placeholder="Case ID" />
                  </FormField>
                  <FormField label="Remarks" className="sm:col-span-2">
                    <Textarea {...form.register('backgroundCheck.remarks')} className="rounded-xl min-h-[80px] resize-none" placeholder="Verification notes..." />
                  </FormField>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN - 5/12 */}
            <div className="lg:col-span-5 space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-gray-800/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
              >
                <SectionHeader title="Probation & Confirmation" icon={Clock} />
                <div className="space-y-6">
                  <div className="flex items-end gap-3">
                    <FormField label="Probation Period" className="flex-1">
                      <Input type="number" {...form.register('probationPeriod')} className="h-11 bg-white dark:bg-gray-800 rounded-xl px-4 text-sm font-bold border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                    </FormField>
                    <div className="w-24 pb-0.5">
                      <SearchableSelect
                        value={watch('probationPeriodUnit')}
                        onChange={(v) => setValue('probationPeriodUnit', v as any)}
                        options={[{ value: 'days', label: 'Days' }, { value: 'months', label: 'Months' }]}
                        searchable={false}
                      />
                    </div>
                  </div>
                  <FormField label="Confirmation Date" hint="Auto-calculated from DOJ + Probation">
                    <div className="relative">
                      <Input 
                        type="date" 
                        {...form.register('confirmationDate')} 
                        readOnly 
                        className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm font-bold opacity-80" 
                      />
                      <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                    </div>
                  </FormField>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-gray-800/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
              >
                <SectionHeader title="Official Information" icon={Shield} />
                <div className="space-y-6">
                  <FormField label="Official Email" required error={errors.officialEmail?.message}>
                    <div className="relative">
                      <Input type="email" placeholder="official@company.com" {...form.register('officialEmail')} className="h-11 bg-white dark:bg-gray-800 rounded-xl px-10 text-sm font-bold border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                      <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" />
                    </div>
                  </FormField>
                  <FormField label="Official Mobile" required error={errors.officialMobileNumber?.message}>
                    <div className="relative">
                      <Input placeholder="+91 00000 00000" {...form.register('officialMobileNumber')} className="h-11 bg-white dark:bg-gray-800 rounded-xl px-10 text-sm font-bold border-border/40 focus:ring-4 focus:ring-primary/10 transition-all" />
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" />
                    </div>
                  </FormField>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-gray-800/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
              >
                <SectionHeader title="Family & Identity" icon={Users} />
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Father's Name">
                      <Input {...form.register('fathersName')} className="h-10 bg-white dark:bg-gray-800 rounded-lg px-3 text-sm border-border/40" />
                    </FormField>
                    <FormField label="Mother's Name">
                      <Input {...form.register('mothersName')} className="h-10 bg-white dark:bg-gray-800 rounded-lg px-3 text-sm border-border/40" />
                    </FormField>
                  </div>
                  <FormField label="Spouse Name">
                    <Input {...form.register('spouseName')} className="h-10 bg-white dark:bg-gray-800 rounded-lg px-3 text-sm border-border/40" />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
                    <FormField label="Passport Number">
                      <Input {...form.register('passportNumber')} className="h-10 bg-white dark:bg-gray-800 rounded-lg px-3 text-sm font-mono border-border/40" />
                    </FormField>
                    <FormField label="Passport Expiry">
                      <Input type="date" {...form.register('passportExpiryDate')} className="h-10 bg-white dark:bg-gray-800 rounded-lg px-3 text-sm border-border/40" />
                    </FormField>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-gray-800/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
              >
                <SectionHeader title="Statutory & Compliance" icon={FileText} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="UAN Number">
                    <Input placeholder="12 Digits" {...form.register('uanNumber')} className="h-10 bg-white dark:bg-gray-800 rounded-lg px-3 text-sm font-mono border-border/40" />
                  </FormField>
                  <FormField label="ESIC Number">
                    <Input placeholder="17 Digits" {...form.register('esicNumber')} className="h-10 bg-white dark:bg-gray-800 rounded-lg px-3 text-sm font-mono border-border/40" />
                  </FormField>
                  <div className="col-span-2 py-2 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">Disability Status</span>
                      <span className="text-[10px] text-muted-foreground font-medium">Does the employee have any physical disability?</span>
                    </div>
                    <Checkbox 
                      checked={watch('disabilityStatus')} 
                      onCheckedChange={(v) => setValue('disabilityStatus', !!v)}
                      className="w-6 h-6 rounded-lg"
                    />
                  </div>
                  <FormField label="Religion">
                    <SearchableSelect
                      value={watch('religion') || ''}
                      onChange={(v) => setValue('religion', v)}
                      options={RELIGIONS.map(r => ({ value: r, label: r }))}
                    />
                  </FormField>
                  <FormField label="Languages Known">
                    <SearchableSelect
                      value=""
                      onChange={(v) => {
                        const current = watch('languagesKnown') || [];
                        if (!current.includes(v)) setValue('languagesKnown', [...current, v]);
                      }}
                      options={LANGUAGES.map(l => ({ value: l, label: l }))}
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {watch('languagesKnown')?.map(lang => (
                        <Badge key={lang} variant="secondary" className="bg-primary/5 text-primary border-primary/20 gap-1 px-2 py-0.5 text-[10px] font-bold uppercase">
                          {lang}
                          <X size={10} className="cursor-pointer" onClick={() => setValue('languagesKnown', watch('languagesKnown')?.filter(l => l !== lang))} />
                        </Badge>
                      ))}
                    </div>
                  </FormField>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-gray-800/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
              >
                <SectionHeader title="System & Attendance" icon={Clock} />
                <div className="space-y-5">
                  <FormField label="Shift Assignment">
                    <SearchableSelect
                      value={watch('shiftAssignmentId') || ''}
                      onChange={(v) => setValue('shiftAssignmentId', v)}
                      options={SHIFTS.map(s => ({ value: s, label: s }))}
                    />
                  </FormField>
                  <FormField label="Attendance Tracking">
                    <SearchableSelect
                      value={watch('attendanceTrackingType')}
                      onChange={(v) => setValue('attendanceTrackingType', v as any)}
                      options={TRACKING_OPTIONS}
                    />
                  </FormField>
                  <FormField label="Device / Biometric ID">
                    <Input {...form.register('deviceId')} className="h-10 bg-white dark:bg-gray-800 rounded-lg px-3 text-sm font-mono border-border/40" />
                  </FormField>
                  <FormField label="Employee Tags">
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-border/40 rounded-xl min-h-[44px]">
                      {watch('employeeTags')?.map(tag => (
                        <Badge key={tag} className="bg-slate-800 text-white gap-1 px-2 py-0.5 text-[10px] uppercase font-black tracking-widest">
                          {tag}
                          <X size={10} className="cursor-pointer" onClick={() => setValue('employeeTags', watch('employeeTags')?.filter(t => t !== tag))} />
                        </Badge>
                      ))}
                      <input 
                        className="bg-transparent border-none outline-none text-xs font-bold placeholder:text-muted-foreground/50 flex-1 min-w-[100px]" 
                        placeholder="Type and enter..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              const current = watch('employeeTags') || [];
                              if (!current.includes(val)) setValue('employeeTags', [...current, val]);
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </FormField>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-gray-800/40 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
              >
                <SectionHeader title="Notes" icon={MessageSquare} />
                <div className="space-y-4">
                  <FormField label="HR Notes">
                    <Textarea {...form.register('hrNotes')} className="bg-white dark:bg-gray-800 rounded-xl min-h-[80px] text-sm p-4 resize-none border-border/40" placeholder="Add confidential HR notes..." />
                  </FormField>
                  <FormField label="Internal Notes (Admin Only)">
                    <Textarea {...form.register('internalNotes')} className="bg-slate-50 dark:bg-slate-900 rounded-xl min-h-[80px] text-sm p-4 resize-none border-border/40" placeholder="Admin reference notes..." />
                  </FormField>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Sticky Action Footer */}
          <div className="fixed bottom-0 left-0 right-0 z-[60] p-6 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/90 to-transparent dark:from-[#0B0F19] dark:via-[#0B0F19]/90 flex justify-center pointer-events-none">
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] px-8 py-4 rounded-[2.5rem] flex items-center gap-6 pointer-events-auto"
            >
              <button 
                type="button" 
                onClick={handleCancel}
                className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                Cancel
              </button>
              <div className="w-px h-8 bg-border/50" />
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleDraftSave}
                  disabled={isDrafting}
                  className="h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-primary hover:bg-primary/5 transition-all"
                >
                  Save Draft
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="h-12 px-8 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <ChevronRight size={16} className="mr-2" />}
                  Save & Continue
                </Button>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
