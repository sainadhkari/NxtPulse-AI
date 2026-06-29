import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useGetTelemetry } from "@workspace/api-client-react";
import type { TelemetryRow } from "@workspace/api-client-react";

type ExtTelemetryRow = TelemetryRow & { cohort?: string; attendance?: number; ai_dependency?: number };
import {
  Search, Filter, Eye, ShieldAlert, Video,
  TrendingUp, TrendingDown, UserCheck, Users,
  ChevronUp, ChevronDown,
} from "lucide-react";
import { Link } from "wouter";

type SortKey = "trainee_name" | "learning_score" | "attendance" | "ai_dependency" | "risk_level";
type SortDir = "asc" | "desc";

const RISK_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function riskColor(level: string) {
  if (level === "high") return "text-red-700 border-red-200 bg-red-50";
  if (level === "medium") return "text-amber-700 border-amber-200 bg-amber-50";
  return "text-emerald-700 border-emerald-200 bg-emerald-50";
}

function scoreColor(val: number) {
  if (val < 40) return "text-red-600";
  if (val < 65) return "text-amber-600";
  return "text-emerald-600";
}

function aiDepColor(val: number) {
  if (val > 75) return "text-red-600";
  if (val > 55) return "text-amber-600";
  return "text-muted-foreground";
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronUp className="w-3 h-3 opacity-20" />;
  return dir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
}

export default function MyTraineesPage() {
  return (
    <ProtectedRoute allowedRoles={["poc", "manager"]}>
      <Layout>
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <UserCheck className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">My Trainees</h1>
            </div>
            <p className="text-sm text-muted-foreground">All trainees assigned to you — Cohort-7</p>
          </div>
          <TraineesContent />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function TraineesContent() {
  const { data: telemetry, isLoading } = useGetTelemetry();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [sortKey, setSortKey] = useState<SortKey>("risk_level");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const trainees = useMemo(() => {
    if (!telemetry) return [];
    let list = telemetry.filter((t) => t.cohort === "Cohort-7");
    if (search) list = list.filter((t) => t.trainee_name.toLowerCase().includes(search.toLowerCase()) || t.track.toLowerCase().includes(search.toLowerCase()));
    if (riskFilter !== "all") list = list.filter((t) => t.risk_level === riskFilter);

    list = [...list].sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0;
      if (sortKey === "risk_level") { av = RISK_ORDER[a.risk_level] ?? 3; bv = RISK_ORDER[b.risk_level] ?? 3; }
      else if (sortKey === "trainee_name") { av = a.trainee_name; bv = b.trainee_name; }
      else { av = (a as Record<string, unknown>)[sortKey] as number; bv = (b as Record<string, unknown>)[sortKey] as number; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [telemetry, search, riskFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const stats = useMemo(() => {
    if (!trainees.length) return null;
    const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    return {
      total: trainees.length,
      high: trainees.filter((t) => t.risk_level === "high").length,
      medium: trainees.filter((t) => t.risk_level === "medium").length,
      low: trainees.filter((t) => t.risk_level === "low").length,
      avgScore: avg(trainees.map((t) => t.learning_score)),
      avgAttendance: avg(trainees.map((t) => t.attendance)),
    };
  }, [trainees]);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "High Risk", value: stats.high, color: "text-red-600" },
            { label: "Medium", value: stats.medium, color: "text-amber-600" },
            { label: "On Track", value: stats.low, color: "text-emerald-600" },
            { label: "Avg Score", value: `${stats.avgScore}%`, color: "text-primary" },
            { label: "Avg Attend", value: `${stats.avgAttendance}%`, color: stats.avgAttendance < 70 ? "text-amber-600" : "text-emerald-600" },
          ].map((s) => (
            <GlassCard key={s.label} className="p-3 text-center">
              <div className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search trainees or track..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {(["all", "high", "medium", "low"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                riskFilter === r
                  ? r === "all" ? "bg-primary text-white border-primary"
                    : r === "high" ? "bg-red-500 text-white border-red-500"
                    : r === "medium" ? "bg-amber-500 text-white border-amber-500"
                    : "bg-emerald-500 text-white border-emerald-500"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {[
                    { key: "trainee_name", label: "Name" },
                    { key: null, label: "Cohort" },
                    { key: "attendance", label: "Attendance" },
                    { key: "learning_score", label: "Demo Score" },
                    { key: null, label: "Teach Score" },
                    { key: "ai_dependency", label: "AI Dep" },
                    { key: "risk_level", label: "Risk" },
                    { key: null, label: "Actions" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      onClick={() => col.key && toggleSort(col.key as SortKey)}
                      className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide ${col.key ? "cursor-pointer hover:text-foreground select-none" : ""}`}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.key && <SortIcon active={sortKey === col.key} dir={sortDir} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trainees.map((t) => (
                  <tr key={t.trainee_id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          t.risk_level === "high" ? "bg-red-100 text-red-700" : t.risk_level === "medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {t.trainee_name.charAt(0)}
                        </div>
                        <div>
                          <Link href={`/poc/trainee/${t.trainee_id}`} className="font-semibold text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors">
                            {t.trainee_name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{t.track}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.cohort}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold tabular-nums ${scoreColor(t.attendance)}`}>{t.attendance}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden w-16">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${t.learning_score}%` }} />
                        </div>
                        <span className={`text-sm font-semibold tabular-nums ${scoreColor(t.learning_score)}`}>{t.learning_score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold tabular-nums ${scoreColor(t.demo_score)}`}>{t.demo_score}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm tabular-nums ${aiDepColor(t.ai_dependency)}`}>{t.ai_dependency}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-xs ${riskColor(t.risk_level)}`}>
                        {t.risk_level.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="View Profile" asChild>
                          <Link href={`/poc/trainee/${t.trainee_id}`}><Eye className="w-3.5 h-3.5" /></Link>
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Schedule Sync-up">
                          <Video className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" title="Create Intervention" asChild>
                          <Link href="/interventions"><ShieldAlert className="w-3.5 h-3.5" /></Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {trainees.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No trainees match the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
