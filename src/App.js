import React, { useContext, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import { ThemeContext, ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { initAccessibility } from './utils/accessibilityUtils';
import { initPerformanceTracking } from './utils/performanceMonitoring';
import { applyCustomTheme } from './styles/custom-theme';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from './components/layout/DashboardLayout';
import BackgroundDecoration from './components/BackgroundDecoration';
import TicketSubmissionWidget from './components/TicketSubmissionWidget';

// Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HarmonyTracker = lazy(() => import('./pages/HarmonyTracker'));
const RelationshipChallengeForm = lazy(() => import('./pages/RelationshipChallengeForm'));
const EmotionInsightDashboard = lazy(() => import('./pages/EmotionInsightDashboard'));
const HarmonyGuidance = lazy(() => import('./pages/HarmonyGuidance'));
const Login = lazy(() => import('./pages/Login'));
const SystemHarmonyAdmin = lazy(() => import('./pages/SystemHarmonyAdmin'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const UserTypeSelection = lazy(() => import('./pages/UserTypeSelection'));
const ApplicationVerification = lazy(() => import('./pages/ApplicationVerification'));
const EmotionCheckInPage = lazy(() => import('./pages/EmotionCheckInPage'));
const ConflictInputPage = lazy(() => import('./pages/ConflictInputPage'));
const ProfessionalLogin = lazy(() => import('./pages/ProfessionalLogin'));
const Features = lazy(() => import('./pages/Features'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Resources = lazy(() => import('./pages/Resources'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));

// Dashboard Components
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/dashboard/SuperAdminDashboard'));
const ITAdminDashboard = lazy(() => import('./pages/dashboard/ITAdminDashboard'));
const SupportDashboard = lazy(() => import('./pages/dashboard/SupportDashboard'));
const ExecutiveDashboard = lazy(() => import('./pages/dashboard/ExecutiveDashboard'));
const TherapistDashboard = lazy(() => import('./pages/dashboard/TherapistDashboard'));
const PlatformAdminDashboard = lazy(() => import('./pages/dashboard/PlatformAdminDashboard'));

// Super Admin Sub-pages
const SuperAdminHome = lazy(() => import('./pages/super-admin/SuperAdminHome'));
const UsersManagement = lazy(() => import('./pages/super-admin/UsersManagement'));
const EmotionAnalysis = lazy(() => import('./pages/super-admin/EmotionAnalysis'));
const SessionsManagement = lazy(() => import('./pages/super-admin/SessionsManagement'));
const ModelManagement = lazy(() => import('./pages/super-admin/ModelManagement'));
const SecurityCenter = lazy(() => import('./pages/super-admin/SecurityCenter'));
const ReportsAnalytics = lazy(() => import('./pages/super-admin/ReportsAnalytics'));
const DataGovernance = lazy(() => import('./pages/super-admin/DataGovernance'));
const IntegrationsManagement = lazy(() => import('./pages/super-admin/IntegrationsManagement'));
const SystemSettings = lazy(() => import('./pages/super-admin/SystemSettings'));
const SupportEscalations = lazy(() => import('./pages/super-admin/SupportEscalations'));

const TherapistHome = lazy(() => import('./pages/therapist/TherapistHome'));
const MySessions = lazy(() => import('./pages/therapist/MySessions'));
const MyClients = lazy(() => import('./pages/therapist/MyClients'));

// Platform Admin Sub-pages
const PlatformAdminHome = lazy(() => import('./pages/platform-admin/PlatformAdminHome'));
const SystemHealth = lazy(() => import('./pages/platform-admin/SystemHealth'));
const AuditLogs = lazy(() => import('./pages/platform-admin/AuditLogs'));
const Configuration = lazy(() => import('./pages/platform-admin/Configuration'));
const UserManagement = lazy(() => import('./pages/platform-admin/UserManagement'));
const ConflictsAdmin = lazy(() => import('./pages/platform-admin/ConflictsAdmin'));
const Professionals = lazy(() => import('./pages/platform-admin/Professionals'));
const AnalyticsHub = lazy(() => import('./pages/platform-admin/AnalyticsHub'));
const NotificationCenter = lazy(() => import('./pages/platform-admin/NotificationCenter'));
const DatabaseManagement = lazy(() => import('./pages/platform-admin/DatabaseManagement'));

// Support Sub-pages
const SupportHome = lazy(() => import('./pages/support/SupportHome'));
const TicketDetail = lazy(() => import('./pages/support/TicketDetail'));

// Import onboarding components
import { useOnboarding } from './hooks/useOnboarding';
const OnboardingRouter = lazy(() => import('./pages/onboarding'));
const ClientOnboarding = lazy(() => import('./pages/onboarding/client/ClientOnboarding'));
const TherapistOnboarding = lazy(() => import('./pages/onboarding/therapist/TherapistOnboarding'));
const ProfessionalOnboarding = lazy(() => import('./pages/onboarding/professional/ProfessionalOnboarding'));
const AdminOnboarding = lazy(() => import('./pages/onboarding/admin/AdminOnboarding'));

// Import unified registration component
const UnifiedRegistration = lazy(() => import('./components/auth/UnifiedRegistration'));

const LoadingFallback = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      p: 3,
      bgcolor: 'background.default',
    }}
  >
    Loading...
  </Box>
);

const AuthenticatedLayout = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardLayout>
        <Routes>
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
              <Route path="/dashboard/super-admin" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<SuperAdminHome />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="emotion-analysis" element={<EmotionAnalysis />} />
                <Route path="sessions" element={<SessionsManagement />} />
                <Route path="models" element={<ModelManagement />} />
                <Route path="security" element={<SecurityCenter />} />
                <Route path="analytics" element={<ReportsAnalytics />} />
                <Route path="data-governance" element={<DataGovernance />} />
                <Route path="integrations" element={<IntegrationsManagement />} />
                <Route path="settings" element={<SystemSettings />} />
                <Route path="support" element={<SupportEscalations />} />
              </Route>
              <Route path="/dashboard/platform-admin" element={
                <ProtectedRoute allowedRoles={['platform_admin']}>
                  <PlatformAdminDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<PlatformAdminHome />} />
                <Route path="health" element={<SystemHealth />} />
                <Route path="logs" element={<AuditLogs />} />
                <Route path="config" element={<Configuration />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="conflicts" element={<ConflictsAdmin />} />
                <Route path="professionals" element={<Professionals />} />
                <Route path="analytics" element={<AnalyticsHub />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="database" element={<DatabaseManagement />} />
              </Route>
              <Route path="/dashboard/admin" element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin', 'it_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/it-admin" element={
                <ProtectedRoute allowedRoles={['it_admin']}>
                  <ITAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/support" element={
                <ProtectedRoute allowedRoles={['support', 'super_admin', 'admin']}>
                  <SupportDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<SupportHome />} />
                <Route path="tickets" element={<SupportHome />} />
                <Route path="tickets/:id" element={<TicketDetail />} />
              </Route>
              <Route path="/dashboard/executive" element={
                <ProtectedRoute allowedRoles={['executive']}>
                  <ExecutiveDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/therapist" element={
                <ProtectedRoute allowedRoles={['therapist']}>
                  <TherapistDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<TherapistHome />} />
                <Route path="sessions" element={<MySessions />} />
                <Route path="clients" element={<MyClients />} />
              </Route>
              <Route path="/dashboards/therapist" element={<Navigate to="/dashboard/therapist" replace />} />
              <Route path="/dashboards/admin" element={<Navigate to="/dashboard/admin" replace />} />
              <Route path="/dashboards/organization" element={<Navigate to="/dashboard/platform-admin" replace />} />
              <Route path="/harmony-hub" element={<HarmonyTracker />} />
              <Route path="/harmony-hub/new" element={<RelationshipChallengeForm />} />
              <Route path="/harmony-hub/edit/:id" element={<RelationshipChallengeForm />} />
              <Route path="/emotion-insights" element={<EmotionInsightDashboard />} />
              <Route path="/harmony-guidance" element={<HarmonyGuidance />} />
              <Route path="/emotion-checkin" element={<EmotionCheckInPage />} />
              <Route path="/conflict-input" element={<ConflictInputPage />} />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin', 'it_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/system-harmony" element={
                <ProtectedRoute adminOnly={true}>
                  <SystemHarmonyAdmin />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
      </DashboardLayout>
    </Suspense>
  );
};

const AppContent = () => {
  const { theme } = useContext(ThemeContext);
  const { completeOnboarding } = useOnboarding();
  
  useEffect(() => {
    initAccessibility();
    initPerformanceTracking();
    applyCustomTheme();
  }, []);

  const handleOnboardingComplete = async (onboardingData) => {
    try {
      // Mark onboarding as complete in user profile
      await completeOnboarding(onboardingData);

      // Force refresh to ensure all components get updated user data
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Error completing onboarding:', error);
      const message = error && error.message ? error.message : 'Unknown error';
      alert(`There was an error completing your onboarding: ${message}`);
    }
  };

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BackgroundDecoration />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth-select" element={<UserTypeSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/professional" element={<ProfessionalLogin />} />
          <Route path="/pro-login" element={<ProfessionalLogin />} />
          <Route path="/professional-login" element={<ProfessionalLogin />} />

          {/* Unified registration - replaces all individual registration routes */}
          <Route path="/register" element={<UnifiedRegistration />} />

          {/* Redirect all old registration paths to unified system */}
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/register/user" element={<Navigate to="/register" replace />} />
          <Route path="/register/company" element={<Navigate to="/register" replace />} />
          <Route path="/therapist-registration" element={<Navigate to="/register" replace />} />
          
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />

          <Route path="/verification" element={<ApplicationVerification />} />
          <Route path="/onboarding" element={<OnboardingRouter />} />
          <Route path="/onboarding/client" element={<ClientOnboarding />} />
          <Route path="/onboarding/therapist" element={<TherapistOnboarding />} />
          <Route path="/onboarding/professional" element={<ProfessionalOnboarding />} />
          <Route path="/onboarding/admin" element={<AdminOnboarding />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
      {/* Universal Ticket Submission Widget - Available on all authenticated pages */}
      <TicketSubmissionWidget />
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
