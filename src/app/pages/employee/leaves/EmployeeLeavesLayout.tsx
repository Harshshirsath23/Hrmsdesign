import { useState } from "react";
import { Outlet } from "react-router";
import { EmployeeLeaveSidebar } from "../../../components/leaves/employee/EmployeeLeaveSidebar";
import { EmployeeLeaveDataProvider } from "./EmployeeLeaveDataContext";

export function EmployeeLeavesLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <EmployeeLeaveDataProvider>
      <div className="flex min-h-full flex-col lg:flex-row">
        <EmployeeLeaveSidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
        <div className="flex-1 min-w-0 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-6">
          <Outlet />
        </div>
      </div>
    </EmployeeLeaveDataProvider>
  );
}
