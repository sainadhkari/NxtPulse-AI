import { useState } from "react";
import { useLocation } from "wouter";
import { GlassCard, NeonTitle } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, UserCheck, ShieldAlert, MonitorPlay } from "lucide-react";
import { useLogin, UserRole } from "@workspace/api-client-react";
import { setAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

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
    <div className="min-h-screen bg-background flex flex-col md:flex-row dark">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-0"></div>
      
      {/* Left side */}
      <div className="w-full md:w-1/2 p-12 flex flex-col justify-center relative z-10 border-r border-card-border bg-card/30 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <Target className="w-10 h-10 text-primary shadow-xs" />
            <span className="font-bold text-3xl tracking-tighter uppercase text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">NxtPulse AI</span>
          </div>
          <NeonTitle className="text-4xl mb-6">Initialize Uplink</NeonTitle>
          <p className="text-lg text-muted-foreground mb-8">
            Access the high-stakes command center for SDI excellence. Select your operational role to begin.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <ShieldAlert className="w-5 h-5 text-destructive" /> Real-time risk detection
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <MonitorPlay className="w-5 h-5 text-secondary" /> Automated demo intelligence
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <UserCheck className="w-5 h-5 text-chart-3" /> Predictive learner validation
            </div>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="w-full md:w-1/2 p-12 flex flex-col justify-center relative z-10">
        <div className="max-w-md mx-auto w-full">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { id: "manager", label: "Manager" },
                { id: "poc", label: "POC" },
                { id: "sdi", label: "SDI" }
              ].map((r) => (
                <div 
                  key={r.id}
                  onClick={() => setSelectedRole(r.id as UserRole)}
                  className={`cursor-pointer border rounded-lg p-4 text-center transition-all ${
                    role === r.id 
                      ? "border-primary bg-primary/10 shadow-xs text-primary" 
                      : "border-card-border bg-card/50 text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <div className="font-mono text-sm uppercase">{r.label}</div>
                </div>
              ))}
            </div>

            <GlassCard className="p-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="uppercase font-mono text-xs text-muted-foreground">Operator ID (Email)</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="operator@nxtpulse.ai" 
                    className="font-mono bg-background/50 border-input focus-visible:ring-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="uppercase font-mono text-xs text-muted-foreground">Access Code</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    className="font-mono bg-background/50 border-input focus-visible:ring-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full mt-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest"
                disabled={login.isPending}
              >
                {login.isPending ? "Authenticating..." : "Initialize"}
              </Button>
            </GlassCard>
          </form>
        </div>
      </div>
    </div>
  );
}
