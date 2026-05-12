import { Outlet } from "react-router";
import { EmployeeLeaveDataProvider } from "./EmployeeLeaveDataContext";

export function EmployeeLeavesLayout() {
  return (
    <EmployeeLeaveDataProvider>
      <div className="min-h-full w-full px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-6">
        <Outlet />
      </div>
    </EmployeeLeaveDataProvider>
  );
}

