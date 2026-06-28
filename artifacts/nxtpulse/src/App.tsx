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
import TraineeProfile from "@/pages/trainee-profile";
import UnderstudyPage from "@/pages/understudy";
import MyTraineesPage from "@/pages/poc/my-trainees";
import AttendancePage from "@/pages/poc/attendance";
import StandupsPage from "@/pages/poc/standups";
import POCCohortsPage from "@/pages/poc/cohorts";
import POCInterventionsPage from "@/pages/poc/interventions";
import POCUnderstudyPage from "@/pages/poc/understudy";
import POCLearnGuardPage from "@/pages/poc/learnguard";
import POCSyncUpsPage from "@/pages/poc/syncups";
import POCCalendarPage from "@/pages/poc/calendar";
import POCNotificationsPage from "@/pages/poc/notifications";
import POCTraineeProfile from "@/pages/poc/trainee-profile";

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
      <Route path="/trainee/:id" component={TraineeProfile} />
      <Route path="/understudy" component={UnderstudyPage} />
      <Route path="/poc/my-trainees" component={MyTraineesPage} />
      <Route path="/poc/attendance" component={AttendancePage} />
      <Route path="/poc/standups" component={StandupsPage} />
      <Route path="/poc/cohorts" component={POCCohortsPage} />
      <Route path="/poc/interventions" component={POCInterventionsPage} />
      <Route path="/poc/understudy" component={POCUnderstudyPage} />
      <Route path="/poc/learnguard" component={POCLearnGuardPage} />
      <Route path="/poc/syncups" component={POCSyncUpsPage} />
      <Route path="/poc/calendar" component={POCCalendarPage} />
      <Route path="/poc/notifications" component={POCNotificationsPage} />
      <Route path="/poc/trainee/:id" component={POCTraineeProfile} />
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
