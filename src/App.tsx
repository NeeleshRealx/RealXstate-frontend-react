import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation } from "react-router-dom";
import AllRoutes from "./routes/AllRoutes";
import ScrollToTop from "./components/ScrollToTop";
import "./aws/amplifyConfig";
import { AuthProvider } from './context/AuthContextRealxstate';
import HelpChat from "@/components/ui/HelpChat";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { BranchProvider } from './contexts/BranchContext';

const queryClient = new QueryClient();

// Component to conditionally render HelpChat
const ConditionalHelpChat = () => {
  const location = useLocation();
  const isPublicRoute = location.pathname.startsWith('/public');
  
  // Don't render HelpChat on public routes
  if (isPublicRoute) {
    return null;
  }
  
  return <HelpChat />;
};

// Component to conditionally render ThemeToggle
const ConditionalThemeToggle = () => {
  const location = useLocation();
  const isPublicRoute = location.pathname.startsWith('/public');
  
  // Don't render ThemeToggle on public routes
  if (isPublicRoute) {
    return null;
  }
  
  return <ThemeToggle />;
};

const App = () => {
  console.log('App component rendering...');
  
  return (
    <ThemeProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <BranchProvider>
                <div className="font-sans">
                  {/* <ConditionalThemeToggle /> */}
                  <ConditionalHelpChat />
                  {/* <AuthStatus /> */}
                  <Toaster />
                  <Sonner />
                  <ScrollToTop />
                  <AllRoutes />
                </div>
              </BranchProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
