import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { MetricCard } from "@/components/metric-card";
import { GlassCard } from "@/components/ui/glass-card";
import { 
  useGetGetMeQueryOptions,
  useGetLatestLearnGuardEvaluation,
  useGetTelemetry
} from "@workspace/api-client-react";
import { BookOpen, Target, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SDIDashboard() {
  return (
    <ProtectedRoute allowedRoles={["sdi", "manager", "poc"]}>
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">My Learning Dashboard</h1>
          <p className="text-muted-foreground text-sm mb-8">Your progress and upcoming milestones</p>
          <DashboardContent />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { data: evaluation, isLoading: evalLoading } = useGetLatestLearnGuardEvaluation();
  const { data: telemetry, isLoading: telLoading } = useGetTelemetry();

  return (
    <div className="space-y-8">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="CCBP Modules" 
          value={"42/50"} 
          icon={<BookOpen className="text-chart-2" />} 
          className="border-chart-2/30"
        />
        <MetricCard 
          title="Demo Score" 
          value={"8.5/10"} 
          icon={<Target />} 
          trend={{ value: 5, label: "improvement", positive: true }}
        />
        <MetricCard 
          title="Pending Demos" 
          value={2} 
          icon={<Clock className="text-chart-3" />} 
        />
        <MetricCard 
          title="Learning Risk" 
          value={"Low"} 
          icon={<AlertTriangle className="text-chart-3" />} 
          className="border-chart-3/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LearnGuard AI Evaluation */}
        <GlassCard className="p-6 col-span-1 lg:col-span-1 border-primary/20">
          <h3 className="text-sm font-medium text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Latest LearnGuard Evaluation
          </h3>
          {evalLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : evaluation ? (
            <div className="space-y-6">
              <div className="text-lg font-semibold text-foreground mb-4">{evaluation.topic}</div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground uppercase">Understanding</span>
                    <span className="font-mono text-chart-3">{evaluation.understanding_score}%</span>
                  </div>
                  <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                    <div className="bg-chart-3 h-full" style={{ width: `${evaluation.understanding_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground uppercase">Confidence</span>
                    <span className="font-mono text-chart-2">{evaluation.confidence_score}%</span>
                  </div>
                  <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                    <div className="bg-chart-2 h-full" style={{ width: `${evaluation.confidence_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground uppercase">AI Dependency</span>
                    <span className="font-mono text-destructive">{evaluation.ai_dependency_score}%</span>
                  </div>
                  <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                    <div className="bg-destructive h-full" style={{ width: `${evaluation.ai_dependency_score}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded border border-primary/20">
                <div className="text-xs uppercase text-primary mb-2 font-bold tracking-wider">AI Feedback</div>
                <p className="text-sm text-muted-foreground">{evaluation.ai_feedback}</p>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">No recent evaluations.</div>
          )}
        </GlassCard>

        {/* My Telemetry */}
        <GlassCard className="p-6 col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">My Telemetry History</h3>
            <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive">
              Raise Alert
            </Button>
          </div>
          {telLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : telemetry ? (
            <div className="overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="font-mono text-xs text-muted-foreground">Date</TableHead>
                    <TableHead className="font-mono text-xs text-muted-foreground">Track</TableHead>
                    <TableHead className="font-mono text-xs text-muted-foreground text-right">Learning Score</TableHead>
                    <TableHead className="font-mono text-xs text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Mocking personal telemetry data based on overall telemetry for demo */}
                  {telemetry.slice(0, 8).map((row, i) => (
                    <TableRow key={row.trainee_id + i} className="border-border hover:bg-card">
                      <TableCell className="text-muted-foreground text-sm">2023-10-{20-i}</TableCell>
                      <TableCell className="text-foreground font-medium">{row.track}</TableCell>
                      <TableCell className="text-right text-primary font-mono">{row.learning_score}%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-chart-3 text-chart-3 bg-chart-3/10">
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
    </div>
  );
}
