import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
  glowing?: boolean;
}

export function MetricCard({ title, value, icon, trend, className, glowing = true }: MetricCardProps) {
  return (
    <GlassCard className={cn("p-6", className)} glowing={glowing}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-primary opacity-80">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold tracking-tighter text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
          {value}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs">
          <span className={cn("font-medium mr-2", trend.positive ? "text-green-500" : "text-destructive")}>
            {trend.positive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </GlassCard>
  );
}
