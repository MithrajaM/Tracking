import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { RoleSelection } from "@/pages/RoleSelection";

// End User Pages
import { ScanPage } from "@/pages/enduser/ScanPage";
import { DeliveryPage } from "@/pages/enduser/DeliveryPage";
import { DeliveriesPage } from "@/pages/enduser/DeliveriesPage";

// Manufacturer Pages
import { TrackPage } from "@/pages/manufacturer/TrackPage";
import { BoxesPage } from "@/pages/manufacturer/BoxesPage";

// Admin Pages
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { UsersPage } from "@/pages/admin/UsersPage";
import { DeliveriesPage as AdminDeliveriesPage } from "@/pages/admin/DeliveriesPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <RoleSelection />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/scan" />} />

        {/* End User Routes */}
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/deliver/:boxId" element={<DeliveryPage />} />
        <Route path="/deliveries" element={<DeliveriesPage />} />

        {/* Manufacturer Routes */}
        <Route path="/track" element={<TrackPage />} />
        <Route path="/boxes" element={<BoxesPage />} />

        {/* Admin Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin/deliveries" element={<AdminDeliveriesPage />} />
        <Route path="/users" element={<UsersPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
