import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { GlassCard, NeonTitle } from "@/components/ui/glass-card";
import { MetricCard } from "@/components/metric-card";
import { 
  useGetInsightsSummary,
  useGetInsightsTrends,
  useGetRecommendedActions
} from "@workspace/api-client-react";
import { BarChart3, TrendingUp, AlertCircle, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function InsightsPage() {
  return (
    <ProtectedRoute allowedRoles={["manager", "poc"]}>
      <Layout>
        <div className="p-8">
          <NeonTitle className="text-3xl mb-8 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" /> Executive AI Insights
          </NeonTitle>
          <InsightsContent />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function InsightsContent() {
  const { data: summary, isLoading: sumLoading } = useGetInsightsSummary();
  const { data: trends, isLoading: trendsLoading } = useGetInsightsTrends();
  const { data: actions, isLoading: actionsLoading } = useGetRecommendedActions();

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sumLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg bg-card/60" />)
        ) : summary ? (
          <>
            <MetricCard 
              title="Student Health" 
              value={`${summary.student_health_score}/100`} 
              icon={<TrendingUp className="text-chart-3" />} 
              trend={{ value: 4.2, label: "MoM", positive: true }} 
            />
            <MetricCard 
              title="Learning Health" 
              value={`${summary.learning_health_score}/100`} 
              icon={<BarChart3 className="text-chart-2" />} 
              trend={{ value: 1.5, label: "MoM", positive: true }} 
            />
            <MetricCard 
              title="Manager Efficiency" 
              value={`${summary.manager_efficiency_score}/100`} 
              icon={<Zap className="text-primary" />} 
              trend={{ value: 12.4, label: "MoM", positive: true }} 
            />
            <MetricCard 
              title="Risk Forecast" 
              value={`${summary.risk_forecast_score}/100`} 
              icon={<AlertCircle className="text-destructive" />} 
              className="border-destructive/30"
              trend={{ value: 2.1, label: "MoM", positive: false }} 
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trend */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Cohort Risk Trend</h3>
          {trendsLoading ? (
            <Skeleton className="h-64 w-full mt-4" />
          ) : trends ? (
            <TrendLineChart 
              data={trends.risk_trend}
              xAxisKey="week"
              lines={[
                { key: 'value', color: 'hsl(var(--destructive))', name: 'At Risk' },
              ]}
            />
          ) : null}
        </GlassCard>

        {/* AI Dependency Trend */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">AI Dependency vs Demo Score</h3>
          {trendsLoading ? (
            <Skeleton className="h-64 w-full mt-4" />
          ) : trends ? (
            <TrendLineChart 
              data={trends.ai_dependency_trend.map((t, i) => ({
                week: t.week,
                ai_dependency: t.value,
                demo_score: trends.demo_trend[i]?.value || 0
              }))}
              xAxisKey="week"
              lines={[
                { key: 'ai_dependency', color: 'hsl(var(--chart-4))', name: 'AI Dependency %' },
                { key: 'demo_score', color: 'hsl(var(--primary))', name: 'Demo Score' }
              ]}
            />
          ) : null}
        </GlassCard>
      </div>

      {/* Recommended Actions */}
      <GlassCard className="p-6 border-primary/20">
        <h3 className="text-sm font-medium text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> Recommended Executive Actions
        </h3>
        {actionsLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : actions ? (
          <div className="space-y-4">
            {actions.map(action => (
              <div key={action.id} className="p-4 rounded-md border border-card-border bg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-card/80 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className={
                      action.priority === 'critical' ? "border-destructive text-destructive bg-destructive/10" : 
                      action.priority === 'high' ? "border-chart-4 text-chart-4 bg-chart-4/10" :
                      "border-muted text-muted-foreground"
                    }>
                      {action.priority.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground uppercase">{action.category}</span>
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/30">
                      Affects {action.affected_count} trainees
                    </span>
                  </div>
                  <div className="text-white font-medium">{action.action}</div>
                </div>
                <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">Execute Plan</Button>
              </div>
            ))}
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}

// Temporary icon mapping missing from lucide
function Zap(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
