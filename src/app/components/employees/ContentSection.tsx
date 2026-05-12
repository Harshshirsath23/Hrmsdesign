import { Employee } from "./mockData";
import { SidebarSection } from "./SidebarMenu";
import { EmployeeProfile } from "./sections/EmployeeProfile";
import { BankDetails } from "./sections/BankDetails";
import { FamilyDetails } from "./sections/FamilyDetails";
import { PassportVisa } from "./sections/PassportVisa";
import { PositionHistory } from "./sections/PositionHistory";
import { PreviousEmployment } from "./sections/PreviousEmployment";
import { SalarySummary } from "./sections/SalarySummary";
import { PlaceholderSection } from "./sections/PlaceholderSection";
import {
  LogOut,
  Key,
  Award,
  FileText,
  FilePen,
} from "lucide-react";

interface Props {
  employee: Employee;
  activeSection: SidebarSection;
}

export function ContentSection({ employee, activeSection }: Props) {
  switch (activeSection) {
    case "profile":
      return <EmployeeProfile employee={employee} />;
    case "bank":
      return <BankDetails employee={employee} />;
    case "family":
      return <FamilyDetails employee={employee} />;
    case "passport":
      return <PassportVisa employee={employee} />;
    case "position":
      return <PositionHistory employee={employee} />;
    case "previous":
      return <PreviousEmployment employee={employee} />;
    case "separation":
      return (
        <PlaceholderSection
          title="Separation"
          description="Manage employee separation, exit interviews and clearance"
          icon={LogOut}
        />
      );
    case "access":
      return (
        <PlaceholderSection
          title="Access Card Details"
          description="Manage building access cards and security clearance"
          icon={Key}
        />
      );
    case "nomination":
      return (
        <PlaceholderSection
          title="Nomination Details"
          description="PF and gratuity nomination information"
          icon={Award}
        />
      );
    case "documents":
      return (
        <PlaceholderSection
          title="Employee Documents"
          description="ID proofs, certificates and other employee documents"
          icon={FileText}
        />
      );
    case "contracts":
      return (
        <PlaceholderSection
          title="Employee Contracts"
          description="Employment agreements, NDAs and offer letters"
          icon={FilePen}
        />
      );
    case "salary":
      return <SalarySummary employee={employee} />;
    default:
      return <EmployeeProfile employee={employee} />;
  }
}