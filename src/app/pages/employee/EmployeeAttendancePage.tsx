import { useAuth } from "../../context/AuthContext";
import { MyAttendancePanel } from "../../components/attendance/MyAttendancePanel";

export function EmployeeAttendancePage() {
  const { user } = useAuth();
  const mappedEmployeeId = user?.employeeId === "1" ? "EMP-001" : "EMP-001";
  return <MyAttendancePanel employeeId={mappedEmployeeId} />;
}
