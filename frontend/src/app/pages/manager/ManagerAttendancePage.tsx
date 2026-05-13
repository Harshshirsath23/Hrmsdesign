import { useAuth } from "../../context/AuthContext";
import { MyAttendancePanel } from "../../components/attendance/MyAttendancePanel";

export function ManagerAttendancePage() {
  const { user } = useAuth();
  const mappedEmployeeId = user?.employeeId === "1" ? "EMP001" : "EMP001";
  return <MyAttendancePanel employeeId={mappedEmployeeId} />;
}
