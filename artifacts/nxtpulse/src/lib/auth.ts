import { UserRole } from "@workspace/api-client-react";

export function getAuthToken(): string | null {
  return localStorage.getItem("nxtpulse_token");
}

export function getAuthRole(): UserRole | null {
  return localStorage.getItem("nxtpulse_role") as UserRole | null;
}

export function setAuth(token: string, role: UserRole) {
  localStorage.setItem("nxtpulse_token", token);
  localStorage.setItem("nxtpulse_role", role);
}

export function clearAuth() {
  localStorage.removeItem("nxtpulse_token");
  localStorage.removeItem("nxtpulse_role");
}
