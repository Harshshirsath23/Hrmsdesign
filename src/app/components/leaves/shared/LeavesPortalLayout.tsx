import { Outlet, useNavigate, useLocation } from "react-router";
import { leavePortalTabs } from "../../../modules/leaves/leavePortalConfig";

export function LeavesPortalLayout({ basePath }: { basePath: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = leavePortalTabs(basePath);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card border-b border-border px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto bg-background p-5 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
