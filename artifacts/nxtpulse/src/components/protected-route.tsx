import { useEffect } from "react";
import { useLocation } from "wouter";
import { getAuthToken, getAuthRole } from "@/lib/auth";
import { UserRole } from "@workspace/api-client-react";

export function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const token = getAuthToken();
    const role = getAuthRole();

    if (!token || !role) {
      setLocation("/auth");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      setLocation("/");
      return;
    }
  }, [location, setLocation, allowedRoles]);

  const token = getAuthToken();
  if (!token) return null;

  return <>{children}</>;
}
