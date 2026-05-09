import { createBrowserRouter, Navigate } from "react-router";

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
import { EmployeeLeavesLayout } from "./pages/employee/leaves/EmployeeLeavesLayout";
import { EmployeeLeaveDashboardPage } from "./pages/employee/leaves/EmployeeLeaveDashboardPage";
import { EmployeeLeaveApplyPage } from "./pages/employee/leaves/EmployeeLeaveApplyPage";
import { EmployeeLeaveApplicationsPage } from "./pages/employee/leaves/EmployeeLeaveApplicationsPage";
import { EmployeeLeaveBalancePage } from "./pages/employee/leaves/EmployeeLeaveBalancePage";
import { EmployeeLeaveHolidaysPage } from "./pages/employee/leaves/EmployeeLeaveHolidaysPage";
import { EmployeeLeaveTeamCalendarPage } from "./pages/employee/leaves/EmployeeLeaveTeamCalendarPage";
import { EmployeeLeavePolicyPage } from "./pages/employee/leaves/EmployeeLeavePolicyPage";
import { EmployeeLeaveNotificationsPage } from "./pages/employee/leaves/EmployeeLeaveNotificationsPage";
import { EmployeePayslipsPage } from "./pages/employee/EmployeePayslipsPage";
import { EmployeeDocumentsPage } from "./pages/employee/EmployeeDocumentsPage";
import { EmployeeCanteenPage } from "./pages/employee/EmployeeCanteenPage";
import { EmployeeProfilePage } from "./pages/employee/EmployeeProfilePage";
import { ProfileChangeRequestsPage } from "./pages/admin/ProfileChangeRequestsPage";

export const router = createBrowserRouter([
  // Root redirect
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  // Login
  {
    path: "/login",
    Component: LoginPage,
  },

  // Admin
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard",  Component: DashboardPage  },
      { path: "attendance", Component: AttendancePage },
      { path: "leave",      Component: LeavePage      },
      { path: "payroll",    Component: PayrollPage    },
      { path: "documents",  Component: DocumentsPage  },
      { path: "profile-requests", Component: ProfileChangeRequestsPage },
      {
        path: "employees",
        Component: EmployeesShell,
        children: [
          { index: true,               Component: EmployeeDirectory },
          { path: "add",               Component: AddEmployeePage   },
          { path: "information/:id",   Component: InformationLayout },
        ],
      },
    ],
  },

  // Employee portal
  {
    path: "/employee",
    Component: EmployeeLayout,
    children: [
      { index: true,         element: <Navigate to="/employee/dashboard" replace /> },
      { path: "dashboard",   Component: EmployeeDashboard },
      { path: "profile",     Component: EmployeeProfilePage },
      { path: "attendance",  Component: EmployeeAttendancePage },
      {
        path: "leaves",
        Component: EmployeeLeavesLayout,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", Component: EmployeeLeaveDashboardPage },
          { path: "apply", Component: EmployeeLeaveApplyPage },
          { path: "applications", Component: EmployeeLeaveApplicationsPage },
          { path: "balance", Component: EmployeeLeaveBalancePage },
          { path: "holidays", Component: EmployeeLeaveHolidaysPage },
          { path: "team", Component: EmployeeLeaveTeamCalendarPage },
          { path: "policy", Component: EmployeeLeavePolicyPage },
          { path: "notifications", Component: EmployeeLeaveNotificationsPage },
        ],
      },
      { path: "payslips",    Component: EmployeePayslipsPage },
      { path: "documents",   Component: EmployeeDocumentsPage },
      { path: "canteen",     Component: EmployeeCanteenPage },
    ],
  },

  // Legacy redirect
  {
    path: "/employees/*",
    element: <Navigate to="/admin/employees" replace />,
  },
]);
