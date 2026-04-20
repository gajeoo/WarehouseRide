import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { DriverSidebar } from "./DriverSidebar";
import { Outlet } from "react-router-dom";
import { Separator } from "./ui/separator";

export function DriverLayout() {
  return (
    <SidebarProvider>
      <DriverSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm text-muted-foreground">Driver Portal</span>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
