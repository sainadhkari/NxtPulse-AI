import React from "react";
import { cn } from "@/lib/utils";

export function GlassCard({ 
  className, 
  children,
  glowing = false
}: { 
  className?: string; 
  children: React.ReactNode;
  glowing?: boolean;
}) {
  return (
    <div className={cn(
      "bg-card border border-border rounded-xl shadow-xs transition-all duration-200",
      glowing && "hover:shadow-md hover:border-primary/40",
      className
    )}>
      {children}
    </div>
  );
}

export function NeonTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </h2>
  );
}
