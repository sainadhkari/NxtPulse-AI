import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { MetricCard } from "@/components/metric-card";
import { RiskDonutChart } from "@/components/charts/RiskDonutChart";
import { GlassCard, NeonTitle } from "@/components/ui/glass-card";
import { 
  useGetTraineeStats, 
  useGetRiskDistribution,
  useGetTelemetry,
  useGetSilentDetectorAlerts,
  useGetInterventions
} from "@workspace/api-client-react";
import { AlertCircle, Activity, BrainCircuit, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagerDashboard() {
  return (
    <ProtectedRoute allowedRoles={["manager"]}>
      <Layout>
        <div className="p-8">
          <NeonTitle className="text-3xl mb-8">SDI Command Center</NeonTitle>
          
          <DashboardContent />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { data: stats, isLoading: statsLoading } = useGetTraineeStats();
  const { data: riskDist, isLoading: riskLoading } = useGetRiskDistribution();
  const { data: telemetry, isLoading: telLoading } = useGetTelemetry();
  const { data: alerts, isLoading: alertsLoading } = useGetSilentDetectorAlerts();

  return (
    <div className="space-y-8">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg bg-card/60" />)
        ) : stats ? (
          <>
            <MetricCard 
              title="Avg Learning Score" 
              value={`${stats.avg_learning_score}%`} 
              icon={<BrainCircuit />} 
              trend={{ value: 2.4, label: "vs last week", positive: true }} 
            />
            <MetricCard 
              title="High Risk Trainees" 
              value={stats.high_risk_count} 
              icon={<AlertCircle className="text-destructive" />} 
              className="border-destructive/30"
            />
            <MetricCard 
              title="Pending Demos" 
              value={stats.pending_demos} 
              icon={<Users />} 
            />
            <MetricCard 
              title="Active Interventions" 
              value={stats.active_interventions} 
              icon={<Activity />} 
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <GlassCard className="p-6 col-span-1">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Risk Distribution</h3>
          {riskLoading ? (
            <div className="h-64 flex items-center justify-center"><Skeleton className="h-48 w-48 rounded-full" /></div>
          ) : riskDist ? (
            <RiskDonutChart data={riskDist} />
          ) : null}
        </GlassCard>

        {/* High Risk Table */}
        <GlassCard className="p-6 col-span-1 lg:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6 text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Immediate Action Required
          </h3>
          {telLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : telemetry ? (
            <div className="overflow-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-card-border hover:bg-transparent">
                    <TableHead className="font-mono text-xs text-muted-foreground">Trainee</TableHead>
                    <TableHead className="font-mono text-xs text-muted-foreground">Track</TableHead>
                    <TableHead className="font-mono text-xs text-muted-foreground text-right">Learning Score</TableHead>
                    <TableHead className="font-mono text-xs text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {telemetry.filter(t => t.risk_level === 'high').slice(0, 5).map(row => (
                    <TableRow key={row.trainee_id} className="border-card-border hover:bg-card/80">
                      <TableCell className="font-medium text-white">{row.trainee_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{row.track}</TableCell>
                      <TableCell className="text-right text-destructive font-mono">{row.learning_score}%</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </GlassCard>
      </div>

      {/* Alerts */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Silent Detector AI Alerts</h3>
        {alertsLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : alerts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 rounded-md border border-card-border bg-background/50 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white">{alert.trainee_name}</span>
                  <Badge variant="outline" className={
                    alert.risk_level === 'high' ? "border-destructive text-destructive bg-destructive/10" : 
                    "border-chart-4 text-chart-4 bg-chart-4/10"
                  }>
                    {alert.risk_level.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">Signals: {alert.signals.join(", ")}</div>
                <div className="text-sm text-primary mt-2 border-l-2 border-primary pl-2">{alert.recommendation}</div>
              </div>
            ))}
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
