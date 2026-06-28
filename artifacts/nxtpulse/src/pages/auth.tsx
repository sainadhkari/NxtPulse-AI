import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, MonitorPlay, UserCheck, AlertCircle, ChevronRight } from "lucide-react";
import { useLogin, UserRole } from "@workspace/api-client-react";
import { setAuth } from "@/lib/auth";
import { NxtPulseLogo } from "@/components/nxtpulse-logo";

const DEMO_CREDENTIALS = [
  { label: "Manager", email: "manager@nxtpulse.ai", password: "manager123", role: "manager" as UserRole },
  { label: "POC",     email: "poc@nxtpulse.ai",     password: "poc123",     role: "poc" as UserRole },
  { label: "SDI",     email: "sdi@nxtpulse.ai",     password: "sdi123",     role: "sdi" as UserRole },
];

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [role, setSelectedRole] = useState<UserRole>("manager");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const login = useLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    login.mutate({ data: { email, password, role } }, {
      onSuccess: (data) => {
        setAuth(data.token, data.user.role);
        if (data.user.role === "manager") setLocation("/dashboard/manager");
        else if (data.user.role === "poc") setLocation("/dashboard/poc");
        else setLocation("/dashboard/sdi");
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Invalid email or password";
        setErrorMsg(msg);
      },
    });
  };

  const fillCredentials = (cred: typeof DEMO_CREDENTIALS[0]) => {
    setSelectedRole(cred.role);
    setEmail(cred.email);
    setPassword(cred.password);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left panel — branding */}
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
            {[
              { icon: ShieldAlert, label: "Real-time risk detection" },
              { icon: MonitorPlay, label: "Automated demo intelligence" },
              { icon: UserCheck,   label: "Predictive learner validation" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-white/90 text-sm">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs">© 2026 NxtPulse AI</p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex flex-col items-start gap-1 mb-8 md:hidden">
            <NxtPulseLogo size="md" />
            <span className="text-xs text-muted-foreground/60 font-medium">Powered by NxtWave</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Sign in</h2>
          <p className="text-muted-foreground text-sm mb-8">Select your role and enter your credentials.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role selector */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Role</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["manager", "poc", "sdi"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setSelectedRole(r); setErrorMsg(null); }}
                    className={`border rounded-lg py-2.5 text-sm font-medium transition-all ${
                      role === r
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {r === "manager" ? "Manager" : r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@nxtpulse.ai"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                className={errorMsg ? "border-destructive focus-visible:ring-destructive/30" : ""}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                className={errorMsg ? "border-destructive focus-visible:ring-destructive/30" : ""}
                required
              />
            </div>

            {/* Inline error */}
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/8 border border-destructive/20 px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive font-medium">{errorMsg}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          {/* Demo credentials — clickable to auto-fill */}
          <div className="mt-8 rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/50 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Demo credentials — click to fill
              </p>
            </div>
            <div className="divide-y divide-border">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => fillCredentials(cred)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/4 transition-colors group text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{cred.label}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {cred.email} / {cred.password}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
