import { createBrowserRouter, Navigate } from "react-router";
import { GlobalAssistantShell } from "./components/assistant/GlobalAssistantShell";

// Auth
import { LoginPage } from "./pages/LoginPage";

// Admin
import { AdminLayout } from "./pages/admin/AdminLayout";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { AttendancePage } from "./pages/admin/AttendancePage";
import { LeavePage } from "./pages/admin/LeavePage";
import { PayrollPage } from "./pages/admin/PayrollPage";
import { DocumentsPage } from "./pages/admin/DocumentsPage";
import { EmployeesShell } from "./pages/admin/employees/EmployeesShell";
import { AddEmployeePage } from "./pages/admin/employees/AddEmployeePage";

// Employee module components
import { EmployeeDirectory } from "./components/employees/EmployeeDirectory";
import { InformationLayout } from "./components/employees/InformationLayout";

// Employee portal
import { EmployeeLayout } from "./pages/employee/EmployeeLayout";
import { EmployeeDashboard } from "./pages/employee/EmployeeDashboard";
import { EmployeeAttendancePage } from "./pages/employee/EmployeeAttendancePage";
import { EmployeeLeavesPage } from "./pages/employee/EmployeeLeavesPage";
import { EmployeePayslipsPage } from "./pages/employee/EmployeePayslipsPage";
import { EmployeeDocumentsPage } from "./pages/employee/EmployeeDocumentsPage";
import { EmployeeCanteenPage } from "./pages/employee/EmployeeCanteenPage";
import { EmployeeProfilePage } from "./pages/employee/EmployeeProfilePage";
import { ProfileChangeRequestsPage } from "./pages/admin/ProfileChangeRequestsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: GlobalAssistantShell,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "admin",
        Component: AdminLayout,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: "dashboard", Component: DashboardPage },
          { path: "attendance", Component: AttendancePage },
          { path: "leave", Component: LeavePage },
          { path: "payroll", Component: PayrollPage },
          { path: "documents", Component: DocumentsPage },
          { path: "profile-requests", Component: ProfileChangeRequestsPage },
          {
            path: "employees",
            Component: EmployeesShell,
            children: [
              { index: true, Component: EmployeeDirectory },
              { path: "add", Component: AddEmployeePage },
              { path: "information/:id", Component: InformationLayout },
            ],
          },
        ],
      },
      {
        path: "employee",
        Component: EmployeeLayout,
        children: [
          { index: true, element: <Navigate to="/employee/dashboard" replace /> },
          { path: "dashboard", Component: EmployeeDashboard },
          { path: "profile", Component: EmployeeProfilePage },
          { path: "attendance", Component: EmployeeAttendancePage },
          { path: "leaves", Component: EmployeeLeavesPage },
          { path: "payslips", Component: EmployeePayslipsPage },
          { path: "documents", Component: EmployeeDocumentsPage },
          { path: "canteen", Component: EmployeeCanteenPage },
        ],
      },
      {
        path: "employees/*",
        element: <Navigate to="/admin/employees" replace />,
      },
    ],
  },
]);
