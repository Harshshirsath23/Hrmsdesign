import { Outlet } from "react-router";
import { FloatingAssistant } from "./FloatingAssistant";

export function GlobalAssistantShell() {
  return (
    <>
      <Outlet />
      <FloatingAssistant />
    </>
  );
}
