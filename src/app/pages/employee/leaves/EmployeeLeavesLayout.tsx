import { Outlet } from "react-router";
import { EmployeeLeaveDataProvider } from "./EmployeeLeaveDataContext";

export function EmployeeLeavesLayout() {
  return (
    <EmployeeLeaveDataProvider>
      <div className="flex min-h-full">
        <div className="flex-1 min-w-0 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-6">
          <Outlet />
        </div>
      </div>
    </EmployeeLeaveDataProvider>
  );
}