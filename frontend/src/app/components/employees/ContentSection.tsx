import { Employee } from "./mockData";
import { SidebarSection } from "./SidebarMenu";
import { EmployeeProfile } from "./sections/EmployeeProfile";
import { EducationDetails } from "./sections/EducationDetails";
import { BackgroundCheck } from "./sections/BackgroundCheck";
import { BankDetails } from "./sections/BankDetails";
import { FamilyDetails } from "./sections/FamilyDetails";
import { PassportVisa } from "./sections/PassportVisa";
import { PositionHistory } from "./sections/PositionHistory";
import { WorkExperience } from "./sections/WorkExperience";
import { SalarySummary } from "./sections/SalarySummary";
import { PlaceholderSection } from "./sections/PlaceholderSection";
import { PendingRequestsPanel } from "../admin/PendingRequestsPanel";
import { AccessCardDetails } from "./sections/AccessCardDetails";
import { EmployeeDocumentsSection } from "./sections/EmployeeDocumentsSection";
import { LogOut, Key } from "lucide-react";

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
    case "work":
      return <WorkExperience employee={employee} />;
    case "education":
      return <EducationDetails employee={employee} />;
    case "background":
      return <BackgroundCheck employee={employee} />;
    case "separation":
      return (
        <PlaceholderSection
          title="Separation"
          description="Manage employee separation, exit interviews and clearance"
          icon={LogOut}
        />
      );
    case "access":
      return <AccessCardDetails employee={employee} />;
    case "documents":
      return <EmployeeDocumentsSection employee={employee} />;
    case "salary":
      return <SalarySummary employee={employee} />;
    case "requests":
      return <PendingRequestsPanel employeeId={employee.id} />;
    default:
      return <EmployeeProfile employee={employee} />;
  }
}
