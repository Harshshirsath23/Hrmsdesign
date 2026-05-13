import { useState } from "react";
import { Outlet } from "react-router";
import { ManagerLeaveSidebar } from "../../../components/leaves/manager/ManagerLeaveSidebar";
import { ManagerLeaveDataProvider } from "./ManagerLeaveDataContext";

export function ManagerLeavesLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ManagerLeaveDataProvider>
      <div className="flex min-h-full flex-col lg:flex-row">
        <ManagerLeaveSidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
        <div className="flex-1 min-w-0 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-6">
          <Outlet />
        </div>
      </div>
    </ManagerLeaveDataProvider>
  );
}
