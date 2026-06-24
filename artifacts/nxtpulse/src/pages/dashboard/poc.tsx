import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { MetricCard } from "@/components/metric-card";
import { GlassCard } from "@/components/ui/glass-card";
import { 
  useGetUnderstudySimulation,
  useGetOutreachSuggestions
} from "@workspace/api-client-react";
import { Users, CheckCircle, Clock, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function POCDashboard() {
  return (
    <ProtectedRoute allowedRoles={["poc", "manager"]}>
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Trainee Monitoring</h1>
          <p className="text-muted-foreground text-sm mb-8">POC view — cohort progress and outreach</p>
          <DashboardContent />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { data: simulation, isLoading: simLoading } = useGetUnderstudySimulation();
  const { data: suggestions, isLoading: sugLoading } = useGetOutreachSuggestions();

  return (
    <div className="space-y-8">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {simLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg bg-card" />)
        ) : simulation ? (
          <>
            <MetricCard 
              title="Pending Actions" 
              value={simulation.pending_actions} 
              icon={<Clock className="text-chart-2" />} 
              className="border-chart-2/30"
            />
            <MetricCard 
              title="Assigned Trainees" 
              value={simulation.assigned_trainees} 
              icon={<Users />} 
            />
            <MetricCard 
              title="Resolved Today" 
              value={simulation.resolved_today} 
              icon={<CheckCircle className="text-chart-3" />} 
              trend={{ value: 12, label: "vs yesterday", positive: true }} 
            />
            <MetricCard 
              title="Drafts Ready" 
              value={simulation.drafts_ready} 
              icon={<Zap className="text-chart-1" />} 
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Understudy AI Command Center */}
        <GlassCard className="p-6 col-span-1 border-primary/20">
          <h3 className="text-sm font-medium text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Understudy AI Simulation
          </h3>
          {simLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : simulation ? (
            <div className="space-y-6">
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-muted-foreground text-sm uppercase mb-1">Handled Automatically</div>
                <div className="text-3xl font-bold text-chart-3">{simulation.handled_count}</div>
              </div>
              <div className="bg-background p-4 rounded-lg border border-border">
                <div className="text-muted-foreground text-sm uppercase mb-1">Escalated to Human</div>
                <div className="text-3xl font-bold text-chart-4">{simulation.escalated_count}</div>
              </div>
              <div className="bg-background p-4 rounded-lg border border-destructive/20">
                <div className="text-destructive/80 text-sm uppercase mb-1">Missed SLAs</div>
                <div className="text-3xl font-bold text-destructive">{simulation.missed_count}</div>
              </div>
            </div>
          ) : null}
        </GlassCard>

        {/* Suggested Outreach */}
        <GlassCard className="p-6 col-span-1 lg:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Suggested Outreach
          </h3>
          {sugLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : suggestions ? (
            <div className="space-y-4 max-h-[500px] overflow-auto pr-2">
              {suggestions.map(sug => (
                <div key={sug.id} className="p-4 rounded-md border border-border bg-background hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-foreground text-lg">{sug.trainee_name}</span>
                      <div className="text-sm text-muted-foreground mt-1">{sug.issue}</div>
                    </div>
                    <Badge variant="outline" className={
                      sug.priority === 'high' ? "border-destructive text-destructive bg-destructive/10" : 
                      sug.priority === 'medium' ? "border-chart-4 text-chart-4 bg-chart-4/10" :
                      "border-muted text-muted-foreground"
                    }>
                      {sug.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-primary/80 mt-3 p-3 bg-primary/5 rounded border border-primary/20">
                    <span className="font-semibold text-primary">AI Recommendation:</span> {sug.recommendation}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="border-chart-3/50 text-chart-3 hover:bg-chart-3/10 hover:text-chart-3">Acknowledge</Button>
                    <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">Resolve</Button>
                    <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">Dismiss</Button>
                  </div>
                </div>
              ))}
              {suggestions.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  No pending outreach suggestions.
                </div>
              )}
            </div>
          ) : null}
        </GlassCard>
      </div>
    </div>
  );
}
