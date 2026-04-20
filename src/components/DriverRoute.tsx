import { useQuery } from "convex/react";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "../../convex/_generated/api";

export function DriverRoute() {
  const profile = useQuery(api.customers.getMyProfile);

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || profile.role !== "driver") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
