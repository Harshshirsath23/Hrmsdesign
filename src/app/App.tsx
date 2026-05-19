import { RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { appQueryClient } from "./queryClient";

import { EmployeeNotificationPanel } from "./components/ui/EmployeeNotificationPanel";

export default function App() {
  return (
    <QueryClientProvider client={appQueryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <EmployeeNotificationPanel />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
