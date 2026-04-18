import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { AdminLayout } from "./components/AdminLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { PublicLayout } from "./components/PublicLayout";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  LandingPage,
  LoginPage,
  SignupPage,
  AboutPage,
  PricingPage,
  ServiceAreasPage,
  ContactPage,
  GetQuotePage,
  HelpPage,
  SafetyPage,
  PrivacyPage,
  TermsPage,
  DashboardPage,
  TrackVanPage,
  MyRoutesPage,
  InvoicesPage,
  SettingsPage,
  AdminDashboardPage,
  AdminCustomersPage,
  AdminFleetPage,
  AdminQuotesPage,
  AdminChatPage,
  AdminSettingsPage,
  AdminEmployeesPage,
  ActivatePage,
} from "./pages";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <Toaster />
        <Routes>
          {/* Public marketing pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/service-areas" element={<ServiceAreasPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/get-quote" element={<GetQuotePage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
          </Route>

          {/* Activation page (public, no auth required) */}
          <Route element={<PublicLayout />}>
            <Route path="/activate" element={<ActivatePage />} />
          </Route>

          {/* Customer portal (authenticated) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/track" element={<TrackVanPage />} />
              <Route path="/routes" element={<MyRoutesPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Admin dashboard (authenticated + admin) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/customers" element={<AdminCustomersPage />} />
                <Route path="/admin/employees" element={<AdminEmployeesPage />} />
                <Route path="/admin/fleet" element={<AdminFleetPage />} />
                <Route path="/admin/quotes" element={<AdminQuotesPage />} />
                <Route path="/admin/chat" element={<AdminChatPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
