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
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-primary/70 w-5 h-5">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold text-foreground">
          {value}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-xs">
          <span className={cn("font-semibold mr-1.5", trend.positive ? "text-emerald-600" : "text-destructive")}>
            {trend.positive ? "▲" : "▼"} {Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </GlassCard>
  );
}
