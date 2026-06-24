import { Shield, Brain, Activity, Zap, BarChart3 } from "lucide-react";
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
      <div className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "4,882", label: "SDI Trainees" },
              { value: "384", label: "At Risk" },
              { value: "27%", label: "AI Dependency Avg" },
              { value: "91%", label: "Prediction Accuracy" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-foreground mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
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
