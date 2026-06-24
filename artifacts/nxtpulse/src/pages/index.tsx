import { Shield, Brain, Activity, Zap, BarChart3, Users, AlertTriangle, Cpu, Target } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { NxtPulseLogo } from "@/components/nxtpulse-logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NxtPulseLogo size="md" />
            <span className="hidden sm:inline-block text-xs text-muted-foreground/60 border-l border-border pl-3 font-medium">
              Powered by NxtWave
            </span>
          </div>
          <Link href="/auth">
            <Button size="sm">Sign in</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="container mx-auto px-6 pt-20 pb-16 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
          AI-powered training intelligence
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-5 leading-tight tracking-tight">
          Training operations,<br />
          <span className="text-primary">made intelligent</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Catch struggling learners early, validate true comprehension, and automate training workflows — all in one platform.
        </p>
        <Link href="/auth">
          <Button size="lg" className="px-8 text-base h-12">
            Get access to your dashboard
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="border-y border-border" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}>
        <div className="container mx-auto px-6 py-14">
          <p className="text-center text-xs font-semibold text-blue-400/70 uppercase tracking-widest mb-8">Live Program Intelligence</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* SDI Trainees */}
            <div className="group relative rounded-2xl p-5 border border-blue-500/20 hover:border-blue-400/40 transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(145deg, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0.04) 100%)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(37,99,235,0.2)" }}>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-0.5 tabular-nums">4,882</div>
              <div className="text-xs text-blue-300/70 font-medium">SDI Trainees</div>
              <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            </div>
            {/* At Risk */}
            <div className="group relative rounded-2xl p-5 border border-red-500/20 hover:border-red-400/40 transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(145deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(239,68,68,0.2)" }}>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-0.5 tabular-nums">384</div>
              <div className="text-xs text-red-300/70 font-medium">At Risk</div>
              <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            </div>
            {/* AI Dependency */}
            <div className="group relative rounded-2xl p-5 border border-purple-500/20 hover:border-purple-400/40 transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(145deg, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0.04) 100%)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(124,58,237,0.2)" }}>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-0.5 tabular-nums">27%</div>
              <div className="text-xs text-purple-300/70 font-medium">AI Dependency Avg</div>
              <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            </div>
            {/* Prediction Accuracy */}
            <div className="group relative rounded-2xl p-5 border border-emerald-500/20 hover:border-emerald-400/40 transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(145deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 100%)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(16,185,129,0.2)" }}>
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-end gap-1.5 mb-0.5">
                <div className="text-3xl font-bold text-white tabular-nums">91</div>
                <div className="text-lg font-bold text-emerald-400 mb-0.5">%</div>
              </div>
              <div className="text-xs text-emerald-300/70 font-medium">Prediction Accuracy</div>
              {/* Mini arc indicator */}
              <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "91%", background: "linear-gradient(90deg, #10b981, #34d399)" }} />
              </div>
              <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Everything you need</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Four AI modules working together to give you full visibility into your training program.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {[
            {
              icon: <Shield className="w-5 h-5" />,
              color: "text-blue-600 bg-blue-50",
              title: "LearnGuard AI",
              desc: "Validates true comprehension beyond code copying. Measures AI dependency vs actual understanding."
            },
            {
              icon: <Brain className="w-5 h-5" />,
              color: "text-violet-600 bg-violet-50",
              title: "Demo Intelligence",
              desc: "Automated analysis of technical demos. Scores communication, confidence, and readiness."
            },
            {
              icon: <Activity className="w-5 h-5" />,
              color: "text-emerald-600 bg-emerald-50",
              title: "Silent Detector AI",
              desc: "Monitors telemetry to catch quiet quitters and undetected strugglers before they fail."
            },
            {
              icon: <Zap className="w-5 h-5" />,
              color: "text-amber-600 bg-amber-50",
              title: "Understudy AI",
              desc: "Simulates manager decision-making to handle routine interventions automatically."
            },
          ].map((f) => (
            <div key={f.title} className="flex gap-4 p-6 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${f.color}`}>
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border bg-muted/20">
        <div className="container mx-auto px-6 py-16 text-center">
          <BarChart3 className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">Sign in to access your training intelligence dashboard.</p>
          <Link href="/auth">
            <Button size="lg">Sign in to NxtPulse AI</Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8 text-center">
        <p className="text-sm text-muted-foreground font-medium">
          Built by <span className="text-foreground font-semibold">Team Gradient Descent Into Madness</span>
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1.5">
          Sainadh Kari &bull; Saicharan Vanam
        </p>
        <p className="text-xs text-muted-foreground/50 mt-3">© 2026 NxtPulse AI — Powered by NxtWave</p>
      </footer>
    </div>
  );
}
