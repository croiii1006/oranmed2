import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { TikTokInspirationProvider } from "@/contexts/TikTokInspirationContext";
import { ReplicatePrefillProvider } from "@/contexts/ReplicatePrefillContext";
import { OranGenPrefillProvider } from "@/contexts/OranGenPrefillContext";
import { OranSimulationPrefillProvider } from "@/contexts/OranSimulationPrefillContext";
import { CreditsProvider } from "@/contexts/CreditsContext";
import { InviteProvider } from "@/contexts/InviteContext";
import Index from "./pages/Index";
import CreatorPortal from "./pages/CreatorPortal";
import RegisterDemo from "./pages/RegisterDemo";
import NotFound from "./pages/NotFound";
import { DEFAULT_PATH, getDefaultPathForModule, getPathForModuleItem, isKnownModule } from "@/navigation";

const queryClient = new QueryClient();

function ModuleRedirect() {
  const { module } = useParams();

  if (!module || !isKnownModule(module)) {
    return <NotFound />;
  }

  return <Navigate to={getDefaultPathForModule(module)} replace />;
}

function OranGenRedirect() {
  try {
    localStorage.removeItem("skills-active-history-id");
  } catch {
    // Ignore storage failures and continue redirecting.
  }

  return <Navigate to={getPathForModuleItem("ai-toolbox", "skills") ?? DEFAULT_PATH} replace />;
}

function ModulePage() {
  const { module, item } = useParams();

  if (!module || !item || !isKnownModule(module) || !getPathForModuleItem(module, item)) {
    return <NotFound />;
  }

  return <Index />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CreditsProvider>
        <InviteProvider>
        <TikTokInspirationProvider>
          <ReplicatePrefillProvider>
            <OranSimulationPrefillProvider>
              <OranGenPrefillProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Navigate to={DEFAULT_PATH} replace />} />
                    <Route path="/register" element={<RegisterDemo />} />
                    <Route path="/creator-portal" element={<CreatorPortal />} />
                    <Route
                      path="/ai-toolbox/oran-gen"
                      element={<OranGenRedirect />}
                    />
                    <Route
                      path="/ai-toolbox/reference-to-video"
                      element={<Navigate to={getPathForModuleItem("ai-toolbox", "replicate-video") ?? DEFAULT_PATH} replace />}
                    />
                    <Route path="/:module" element={<ModuleRedirect />} />
                    <Route path="/:module/:item" element={<ModulePage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </OranGenPrefillProvider>
            </OranSimulationPrefillProvider>
          </ReplicatePrefillProvider>
        </TikTokInspirationProvider>
        </InviteProvider>
      </CreditsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
