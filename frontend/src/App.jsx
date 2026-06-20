import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './layouts/DashboardLayout'
import { Dashboard } from './pages/Dashboard'
import BillingView from './pages/BillingView'
import { MenuView } from './pages/MenuView'
import { StaffView } from './pages/StaffView'
import { BranchView } from './pages/BranchView'
import { OnlineOrderingView } from './pages/OnlineOrderingView'
import { FranchiseView } from './pages/FranchiseView'
import { WaitlistView } from './pages/WaitlistView'
import { IntegrationsView } from './pages/IntegrationsView'
import { TableView } from './pages/TableView'
import { POSView } from './pages/POSView'
import { ReservationsView } from './pages/ReservationsView'
import { CalendarView } from './pages/CalendarView'
import { FinancialsView } from './pages/FinancialsView'
import ErrorBoundary from './components/ErrorBoundary'
import { OrderPortal } from './pages/OrderPortal'
import AutomationView from './pages/AutomationView'
import MessagesView from './pages/MessagesView'
import SettingsView from './pages/SettingsView'
import OnboardingView from './pages/OnboardingView'
import AccountSettingsView from './pages/AccountSettingsView'
import SecuregateLogin from './pages/SecuregateLogin'
import TenantLogin from './pages/TenantLogin'
import AccessDenied from './pages/AccessDenied'
import RestrictedBuilderView from './pages/RestrictedBuilderView'
import WebsiteDashboardView from './pages/WebsiteDashboardView'
import DomainSetupView from './pages/DomainSetupView'
import { SaaSAdminLayout } from './layouts/SaaSAdminLayout'
import TenantManagementView from './pages/saas/TenantManagementView'
import SaaSSettingsView from './pages/saas/SaaSSettingsView'
import SaaSSubscriptionsView from './pages/saas/SaaSSubscriptionsView'
import AdminManagementView from './pages/saas/AdminManagementView'
import SaaSDashboard from './pages/saas/SaaSDashboard'
import SupportTicketsView from './pages/saas/SupportTicketsView'
import EmailManagementView from './pages/saas/EmailManagementView'
import SaaSCMSView from './pages/saas/SaaSCMSView'
import TranslationManagementView from './pages/saas/TranslationManagementView'
import PlanManagementView from './pages/saas/PlanManagementView'
import SaaSThemeAdminView from './pages/saas/SaaSThemeAdminView'
import IntegrationsAdminView from './pages/saas/IntegrationsAdminView'
import ComingSoonView from './pages/ComingSoonView'
import { ContentManager } from './pages/ContentManager'
import InventoryView from './pages/InventoryView'
import DirectoryPage from './pages/public/DirectoryPage'
import DirectoryDetailPage from './pages/public/DirectoryDetailPage'
import ProtectedRoute from './components/ProtectedRoute'
import { PublicLayout } from './layouts/PublicLayout'
import LandingPage from './pages/public/LandingPage'
import PricingPage from './pages/public/PricingPage'
import FeaturesPage from './pages/public/FeaturesPage'
import BlogPage from './pages/public/BlogPage'
import CustomerStoriesPage from './pages/public/CustomerStoriesPage'
import DocumentationPage from './pages/public/DocumentationPage'
import HelpCenterPage from './pages/public/HelpCenterPage'
import AboutUsPage from './pages/public/AboutUsPage'
import CommunityPage from './pages/public/CommunityPage'
import BlogDetailPage from './pages/public/BlogDetailPage'
import CustomerStoryDetailPage from './pages/public/CustomerStoryDetailPage'
import DynamicPrivacyPolicy from './pages/public/DynamicPrivacyPolicy'
import ReservationsPublicView from './pages/public/ReservationsPublicView'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import NotFound from './pages/public/NotFound'

import SolutionPage from './pages/public/SolutionPage'
import IntegrationsPage from './pages/public/IntegrationsPage'

import { useWebsiteTheme } from './context/WebsiteThemeContext'
import { ModernPublicLayout } from './components/themes/modern-business-os/ModernPublicLayout'
import ModernHome from './components/themes/modern-business-os/ModernHome'
import ModernPricing from './components/themes/modern-business-os/ModernPricing'
import ModernFeatures from './components/themes/modern-business-os/ModernFeatures'
import ModernSolutions from './components/themes/modern-business-os/ModernSolutions'
import ModernIntegrations from './components/themes/modern-business-os/ModernIntegrations'
import ModernAbout from './components/themes/modern-business-os/ModernAbout'
import ModernContact from './components/themes/modern-business-os/ModernContact'
import ModernBlog from './components/themes/modern-business-os/ModernBlog'

function ThemedPage({ classic, modern }) {
  const { isModernBusinessOS } = useWebsiteTheme();
  return isModernBusinessOS ? (modern || classic) : classic;
}

function ThemeAwarePublicLayout() {
  const { isModernBusinessOS } = useWebsiteTheme();
  return isModernBusinessOS ? <ModernPublicLayout /> : <PublicLayout />;
}

function AppContent() {
  return (
    <Routes>
      {/* Public Website */}
      <Route element={<ThemeAwarePublicLayout />}>
        <Route path="/" element={<ThemedPage classic={<LandingPage />} modern={<ModernHome />} />} />
        <Route path="/pricing" element={<ThemedPage classic={<PricingPage />} modern={<ModernPricing />} />} />
        <Route path="/features" element={<ThemedPage classic={<FeaturesPage />} modern={<ModernFeatures />} />} />
        <Route path="/blog" element={<ThemedPage classic={<BlogPage />} modern={<ModernBlog />} />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/customers" element={<CustomerStoriesPage />} />
        <Route path="/customers/:slug" element={<CustomerStoryDetailPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/about" element={<ThemedPage classic={<AboutUsPage />} modern={<ModernAbout />} />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/privacy" element={<DynamicPrivacyPolicy />} />
        <Route path="/book" element={<ReservationsPublicView />} />
        <Route path="/solutions" element={<ThemedPage classic={<SolutionPage />} modern={<ModernSolutions />} />} />
        <Route path="/solutions/:slug" element={<ThemedPage classic={<SolutionPage />} modern={<ModernSolutions />} />} />
        <Route path="/integrations" element={<ThemedPage classic={<IntegrationsPage />} modern={<ModernIntegrations />} />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/directory/:slug" element={<DirectoryDetailPage />} />
        <Route path="/contact" element={<ThemedPage classic={null} modern={<ModernContact />} />} />
      </Route>

      {/* Tenant Login / Register */}
      <Route path="/login" element={<TenantLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* SaaS Super Admin (Central Domain) */}
      <Route path="/securegate" element={<SecuregateLogin />} />

      <Route element={<ProtectedRoute allowedRoles={['admin']} redirectPath="/securegate" />}>
        <Route path="/securegate/*" element={<SaaSAdminLayout />}>
          <Route path="dashboard" element={<SaaSDashboard />} />
          <Route path="tenants" element={<TenantManagementView />} />
          <Route path="subscriptions" element={<SaaSSubscriptionsView />} />
          <Route path="plans" element={<PlanManagementView />} />
          <Route path="tickets" element={<SupportTicketsView />} />
          <Route path="email-templates" element={<EmailManagementView />} />
          <Route path="admins" element={<AdminManagementView />} />
          <Route path="cms" element={<SaaSCMSView />} />
          <Route path="website-themes" element={<SaaSThemeAdminView />} />
          <Route path="integrations" element={<IntegrationsAdminView />} />
          <Route path="translations" element={<TranslationManagementView />} />
          <Route path="settings" element={<SaaSSettingsView />} />
          <Route path="account" element={<AccountSettingsView />} />
        </Route>
      </Route>

      {/* Public Customer View */}
      <Route path="/order" element={<OrderPortal />} />

      {/* Admin/Business Dashboard */}
      <Route element={<ProtectedRoute redirectPath="/login" />}>
          <Route path="/builder/:slug?" element={<RestrictedBuilderView />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="billing" element={<BillingView />} />
            <Route path="menu" element={<MenuView />} />
          <Route path="tables" element={<TableView />} />
          <Route path="pos" element={<POSView />} />
          <Route path="reservations" element={<ReservationsView />} />
          <Route path="calendar" element={<CalendarView />} />

          {/* Owner-Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['owner']} redirectPath="/access-denied" />}>
            <Route path="website" element={<WebsiteDashboardView />} />
            <Route path="staff" element={<StaffView />} />
            <Route path="branches" element={<BranchView />} />
            <Route path="franchises" element={<FranchiseView />} />
            <Route path="waitlist" element={<WaitlistView />} />
            <Route path="integrations" element={<IntegrationsView />} />
            <Route path="financials" element={<FinancialsView />} />
            <Route path="automation" element={<AutomationView />} />
            <Route path="messages" element={<MessagesView />} />
             <Route path="settings" element={<SettingsView />} />
             <Route path="domain" element={<DomainSetupView />} />
              <Route path="onboarding" element={<OnboardingView />} />
              <Route path="account" element={<AccountSettingsView />} />
              <Route path="inventory" element={<InventoryView />} />
              <Route path="online-ordering" element={<OnlineOrderingView />} />
              {/* Content Management */}
              <Route path="reviews" element={<ContentManager contentType="reviews" />} />
              <Route path="gallery" element={<ContentManager contentType="gallery" />} />
              <Route path="rooms" element={<ContentManager contentType="rooms" />} />
              <Route path="services" element={<ContentManager contentType="services" />} />
              <Route path="blog" element={<ContentManager contentType="blog" />} />
              <Route path="team" element={<ContentManager contentType="team" />} />
           </Route>
        </Route>
        <Route path="/access-denied" element={<AccessDenied />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return <AppContent />
}

export default App
