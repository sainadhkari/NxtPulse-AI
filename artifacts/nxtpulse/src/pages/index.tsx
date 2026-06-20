import { GlassCard, NeonTitle } from "@/components/ui/glass-card";
import { Shield, Brain, Activity, Target, Zap, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-10"></div>
      
      {/* Decorative grids/lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="container mx-auto px-4 py-20 relative z-20">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-primary shadow-xs" />
            <span className="font-bold text-2xl tracking-tighter uppercase text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">NxtPulse AI</span>
          </div>
          <Link href="/auth">
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/20 hover:text-primary">
              Access Command Center
            </Button>
          </Link>
        </div>

        <div className="text-center max-w-4xl mx-auto mb-24">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            AI COMMAND CENTER FOR <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-[0_0_20px_rgba(0,240,255,0.8)]">
              SDI EXCELLENCE
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            A high-stakes operational dashboard to catch struggling learners early, validate learning quality, and automate training operations at scale.
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 shadow-md">
              Enter Command Center <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {[
            { title: "Current Reality", desc: "60+ Trainees per Manager", val: "Overloaded" },
            { title: "The Problem", desc: "Manual Tracking", val: "Inefficient" },
            { title: "The Consequence", desc: "Hidden Strugglers", val: "High Risk" },
            { title: "The Outcome", desc: "Late Intervention", val: "Failure" }
          ].map((item, i) => (
            <GlassCard key={i} className="p-6 border-destructive/20 bg-destructive/5" glowing={false}>
              <h3 className="text-destructive font-mono text-sm mb-2">{item.title}</h3>
              <p className="text-lg font-bold">{item.desc}</p>
              <div className="mt-4 text-xs font-mono px-2 py-1 bg-destructive/20 text-destructive inline-block rounded">STATUS: {item.val}</div>
            </GlassCard>
          ))}
        </div>

        <div className="mb-24">
          <NeonTitle className="text-center text-3xl mb-12">Powered by Advanced AI Modules</NeonTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard className="p-8 group">
              <Shield className="w-12 h-12 text-primary mb-6 group-hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] transition-all" />
              <h3 className="text-2xl font-bold mb-4">LearnGuard AI</h3>
              <p className="text-muted-foreground">Validates true comprehension beyond code copying. Measures AI dependency vs actual understanding.</p>
            </GlassCard>
            <GlassCard className="p-8 group">
              <Brain className="w-12 h-12 text-secondary mb-6 group-hover:drop-shadow-[0_0_15px_rgba(0,68,255,0.8)] transition-all" />
              <h3 className="text-2xl font-bold mb-4">Demo Intelligence</h3>
              <p className="text-muted-foreground">Automated analysis of technical demos. Scores communication, confidence, and readiness.</p>
            </GlassCard>
            <GlassCard className="p-8 group">
              <Activity className="w-12 h-12 text-chart-4 mb-6 group-hover:drop-shadow-[0_0_15px_rgba(153,0,255,0.8)] transition-all" />
              <h3 className="text-2xl font-bold mb-4">Silent Detector AI</h3>
              <p className="text-muted-foreground">Monitors telemetry to catch quiet quitters and undetected strugglers before they fail.</p>
            </GlassCard>
            <GlassCard className="p-8 group">
              <Zap className="w-12 h-12 text-chart-3 mb-6 group-hover:drop-shadow-[0_0_15px_rgba(0,255,170,0.8)] transition-all" />
              <h3 className="text-2xl font-bold mb-4">Understudy AI</h3>
              <p className="text-muted-foreground">Simulates manager decision-making to handle routine interventions automatically.</p>
            </GlassCard>
          </div>
        </div>

        <div className="border-t border-card-border pt-24 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] mb-2">4,882</div>
              <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest">SDI Trainees</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-destructive drop-shadow-[0_0_10px_rgba(255,50,50,0.5)] mb-2">384</div>
              <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest">At Risk</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-chart-4 drop-shadow-[0_0_10px_rgba(150,50,255,0.5)] mb-2">27%</div>
              <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest">AI Dependency</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary drop-shadow-[0_0_10px_rgba(0,240,255,0.5)] mb-2">91%</div>
              <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Prediction Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
