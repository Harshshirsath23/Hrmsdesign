import { Employee } from "./mockData";
import { SidebarSection } from "./SidebarMenu";
import { EmployeeProfile } from "./sections/EmployeeProfile";
import { EducationDetails } from "./sections/EducationDetails";
import { BackgroundCheck } from "./sections/BackgroundCheck";
import { BankDetails } from "./sections/BankDetails";
import { FamilyDetails } from "./sections/FamilyDetails";
import { NomineeDetails } from "./sections/NomineeDetails";
import { InsuranceDetails } from "./sections/InsuranceDetails";
import { AssetManagement } from "./sections/AssetManagement";
import { PassportVisa } from "./sections/PassportVisa";
import { PositionHistory } from "./sections/PositionHistory";
import { WorkExperience } from "./sections/WorkExperience";
import { SalarySummary } from "./sections/SalarySummary";
import { AccessCardDetails } from "./sections/AccessCardDetails";
import { EmployeeDocumentsSection } from "./sections/EmployeeDocumentsSection";

interface Props {
  employee: Employee;
  activeSection: SidebarSection;
  showAddButtons?: boolean;
  disableBankEdit?: boolean;
  showAssetAccessActions?: boolean;
  showSalaryActions?: boolean;
  isFinalSubmitted?: boolean;
}

export function ContentSection({
  employee,
  activeSection,
  showAddButtons = true,
  disableBankEdit = false,
  showAssetAccessActions = true,
  showSalaryActions = true,
  isFinalSubmitted = false,
}: Props) {
  switch (activeSection) {
    case "profile":
      return <EmployeeProfile employee={employee} isFinalSubmitted={isFinalSubmitted || !!employee.profileLocked} showAddButtons={showAddButtons} />;
    case "bank":
      return <BankDetails employee={employee} disableEdit={disableBankEdit} showAddButton={showAddButtons} />;
    case "family":
      return <FamilyDetails employee={employee} showAddButton={showAddButtons} />;
    case "nominee":
      return <NomineeDetails employee={employee} showAddButton={showAddButtons} />;
    case "insurance":
      return <InsuranceDetails employee={employee} showAddButton={showAddButtons} />;
    case "assets":
      return <AssetManagement employee={employee} showActions={showAssetAccessActions} />;
    case "passport":
      return <PassportVisa employee={employee} showAddButton={showAddButtons} />;
    case "position":
      return <PositionHistory employee={employee} showAddButton={showAddButtons} />;
    case "work":
      return <WorkExperience employee={employee} showAddButton={showAddButtons} />;
    case "education":
      return <EducationDetails employee={employee} showAddButton={showAddButtons} />;
    case "background":
      return <BackgroundCheck employee={employee} showAddButton={showAddButtons} />;
    case "access":
      return <AccessCardDetails employee={employee} showActions={showAssetAccessActions} />;
    case "documents":
      return <EmployeeDocumentsSection employee={employee} showAddButton={showAddButtons} />;
    case "salary":
      return <SalarySummary employee={employee} showActions={showSalaryActions} />;
    default:
      return <EmployeeProfile employee={employee} />;
  }
}
