import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { GlassCard, NeonTitle } from "@/components/ui/glass-card";
import { 
  useGetWellnessMetrics,
  useGetWellnessSuggestions
} from "@workspace/api-client-react";
import { Activity, HeartPulse, Battery, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { Badge } from "@/components/ui/badge";

export default function WellnessPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-8">
          <NeonTitle className="text-3xl mb-8 flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" /> Wellness AI
          </NeonTitle>
          <WellnessContent />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function WellnessContent() {
  const { data: metrics, isLoading: metricsLoading } = useGetWellnessMetrics();
  const { data: suggestions, isLoading: sugLoading } = useGetWellnessSuggestions();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Indicators */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-chart-5" /> Current State
            </h3>
            {metricsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : metrics ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-card-border">
                  <div>
                    <div className="text-sm text-muted-foreground uppercase">Stress Level</div>
                    <div className="text-2xl font-bold text-white capitalize">{metrics.stress_level}</div>
                  </div>
                  <div className="text-chart-5 text-3xl font-mono">{metrics.stress_score}</div>
                </div>
                <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-card-border">
                  <div>
                    <div className="text-sm text-muted-foreground uppercase">Burnout Risk</div>
                    <div className="text-2xl font-bold text-white capitalize">{metrics.burnout_risk}</div>
                  </div>
                  <div className="text-destructive text-3xl font-mono">{metrics.burnout_score}</div>
                </div>
                <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-card-border">
                  <div>
                    <div className="text-sm text-muted-foreground uppercase">Motivation</div>
                    <div className="text-2xl font-bold text-white capitalize flex items-center gap-2">
                      {metrics.motivation_trend}
                      {metrics.motivation_trend === 'improving' ? <ArrowUpRight className="w-5 h-5 text-chart-3" /> : <ArrowDownRight className="w-5 h-5 text-destructive" />}
                    </div>
                  </div>
                  <div className="text-chart-3 text-3xl font-mono">{metrics.motivation_score}</div>
                </div>
              </div>
            ) : null}
          </GlassCard>
        </div>

        {/* Trend Chart */}
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <Battery className="w-4 h-4 text-primary" /> Energy vs Stress Timeline
          </h3>
          {metricsLoading ? (
            <Skeleton className="h-64 w-full mt-4" />
          ) : metrics ? (
            <TrendLineChart 
              data={metrics.weekly_trend}
              xAxisKey="day"
              lines={[
                { key: 'stress', color: 'hsl(var(--chart-5))', name: 'Stress' },
                { key: 'motivation', color: 'hsl(var(--chart-3))', name: 'Motivation' }
              ]}
            />
          ) : null}
        </GlassCard>
      </div>

      {/* AI Suggestions */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">AI Wellness Suggestions</h3>
        {sugLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : suggestions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map(sug => (
              <div key={sug.id} className="p-5 rounded-md border border-card-border bg-background/50">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className="border-primary/30 text-primary uppercase font-mono text-[10px]">
                    {sug.category}
                  </Badge>
                  <Badge variant="outline" className={
                    sug.priority === 'high' ? "border-chart-5 text-chart-5 bg-chart-5/10" : "border-muted text-muted-foreground"
                  }>
                    {sug.priority}
                  </Badge>
                </div>
                <div className="text-sm text-foreground/90 leading-relaxed">
                  {sug.suggestion}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
