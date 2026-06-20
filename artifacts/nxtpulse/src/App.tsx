import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/index";
import AuthPage from "@/pages/auth";
import ManagerDashboard from "@/pages/dashboard/manager";
import POCDashboard from "@/pages/dashboard/poc";
import SDIDashboard from "@/pages/dashboard/sdi";
import WellnessPage from "@/pages/wellness";
import InsightsPage from "@/pages/insights";
import LearnGuardChat from "@/pages/learnguard-chat";
import InterventionsPage from "@/pages/interventions";
import CohortsPage from "@/pages/cohorts";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard/manager" component={ManagerDashboard} />
      <Route path="/dashboard/poc" component={POCDashboard} />
      <Route path="/dashboard/sdi" component={SDIDashboard} />
      <Route path="/wellness" component={WellnessPage} />
      <Route path="/insights" component={InsightsPage} />
      <Route path="/learnguard" component={LearnGuardChat} />
      <Route path="/interventions" component={InterventionsPage} />
      <Route path="/cohorts" component={CohortsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
