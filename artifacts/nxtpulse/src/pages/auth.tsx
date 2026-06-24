import { useState } from "react";
import { useLocation } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, MonitorPlay, UserCheck } from "lucide-react";
import { useLogin, UserRole } from "@workspace/api-client-react";
import { setAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { NxtPulseLogo } from "@/components/nxtpulse-logo";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [role, setSelectedRole] = useState<UserRole>("manager");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ data: { email, password, role } }, {
      onSuccess: (data) => {
        setAuth(data.token, data.user.role);
        if (data.user.role === "manager") setLocation("/dashboard/manager");
        else if (data.user.role === "poc") setLocation("/dashboard/poc");
        else setLocation("/dashboard/sdi");
      },
      onError: () => {
        toast({
          title: "Authentication Failed",
          description: "Invalid credentials or system offline.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left side — branding panel */}
      <div className="hidden md:flex w-2/5 bg-primary flex-col justify-between p-12">
        <div className="flex flex-col gap-1.5">
          <NxtPulseLogo size="lg" variant="light" />
          <span className="text-xs text-white/50 mt-1 font-medium">Powered by NxtWave</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Intelligent Training Operations
          </h1>
          <p className="text-white/80 text-base leading-relaxed mb-10">
            Monitor learner progress, catch risk early, and automate training workflows — all from one place.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white/90 text-sm">
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              Real-time risk detection
            </div>
            <div className="flex items-center gap-3 text-white/90 text-sm">
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <MonitorPlay className="w-3.5 h-3.5" />
              </div>
              Automated demo intelligence
            </div>
            <div className="flex items-center gap-3 text-white/90 text-sm">
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              Predictive learner validation
            </div>
          </div>
        </div>

        <p className="text-white/40 text-xs">© 2026 NxtPulse AI</p>
      </div>

      {/* Right side — login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-start gap-1 mb-8 md:hidden">
            <NxtPulseLogo size="md" />
            <span className="text-xs text-muted-foreground/60 font-medium">Powered by NxtWave</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Sign in</h2>
          <p className="text-muted-foreground text-sm mb-8">Select your role and enter your credentials.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Role</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "manager", label: "Manager" },
                  { id: "poc", label: "POC" },
                  { id: "sdi", label: "SDI" }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id as UserRole)}
                    className={`border rounded-lg py-2.5 text-sm font-medium transition-all ${
                      role === r.id 
                        ? "border-primary bg-primary/8 text-primary" 
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@nxtpulse.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-lg bg-muted/60 border border-border">
            <p className="text-xs text-muted-foreground font-medium mb-2">Demo credentials</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>Manager: <span className="font-mono text-foreground">manager@nxtpulse.ai / manager123</span></div>
              <div>POC: <span className="font-mono text-foreground">poc@nxtpulse.ai / poc123</span></div>
              <div>SDI: <span className="font-mono text-foreground">sdi@nxtpulse.ai / sdi123</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
