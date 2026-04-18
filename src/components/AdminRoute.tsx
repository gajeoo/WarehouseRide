import { useQuery } from "convex/react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Skeleton } from "./ui/skeleton";

export function AdminRoute() {
  const profile = useQuery(api.customers.getMyProfile);

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="w-64 h-8" />
      </div>
    );
  }

  if (!profile?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
