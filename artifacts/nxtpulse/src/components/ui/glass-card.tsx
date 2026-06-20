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
      "relative bg-card/60 backdrop-blur-xl border border-card-border rounded-lg overflow-hidden transition-all duration-300",
      glowing && "hover:border-primary hover:shadow-xs",
      className
    )}>
      {children}
    </div>
  );
}

export function NeonTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-lg font-bold tracking-widest uppercase text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]", className)}>
      {children}
    </h2>
  );
}
