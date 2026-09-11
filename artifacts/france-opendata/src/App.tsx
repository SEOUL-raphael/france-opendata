import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatProvider } from "@/contexts/chat-context";

import { Shell } from "@/components/layout/shell";
import Home from "@/pages/home";
import DatasetDetail from "@/pages/dataset-detail";
import Organizations from "@/pages/organizations";
import OrganizationDetail from "@/pages/organization-detail";
import Dataservices from "@/pages/dataservices";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";
import MigrationNotice from "@/pages/migration-notice";

// GitHub Pages builds inject the Worker URL. Replit remains a lightweight
// migration notice rather than a second, separately-operated service.
const IS_STANDALONE_SITE = Boolean(import.meta.env.VITE_WORKER_URL);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/datasets/:id" component={DatasetDetail} />
        <Route path="/organizations" component={Organizations} />
        <Route path="/organizations/:id" component={OrganizationDetail} />
        <Route path="/dataservices" component={Dataservices} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  if (!IS_STANDALONE_SITE) {
    return <MigrationNotice />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChatProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </ChatProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
