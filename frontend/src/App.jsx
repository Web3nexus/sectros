import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { SEOHead } from './components/SEOHead'
import AppLockScreen from './components/common/AppLockScreen'

import RestrictedBuilderView from './pages/RestrictedBuilderView'
import { Dashboard } from './pages/Dashboard'
import { DashboardLayout } from './layouts/DashboardLayout'
import { SaaSAdminLayout } from './layouts/SaaSAdminLayout'
import SaaSDashboard from './pages/saas/SaaSDashboard'
import TenantManagementView from './pages/saas/TenantManagementView'
import SaaSSubscriptionsView from './pages/saas/SaaSSubscriptionsView'
import PlanManagementView from './pages/saas/PlanManagementView'
import SupportTicketsView from './pages/saas/SupportTicketsView'
import EmailManagementView from './pages/saas/EmailManagementView'
import AdminManagementView from './pages/saas/AdminManagementView'
import SaaSCMSView from './pages/saas/SaaSCMSView'
import SaaSThemeAdminView from './pages/saas/SaaSThemeAdminView'
import IntegrationsAdminView from './pages/saas/IntegrationsAdminView'
import VoiceProviderListView from './pages/saas/VoiceProviderListView'
import VoicePhoneNumberPool from './pages/saas/VoicePhoneNumberPool'
import VoiceAgentPlanListView from './pages/saas/VoiceAgentPlanListView'
import TranslationManagementView from './pages/saas/TranslationManagementView'
import SaaSSettingsView from './pages/saas/SaaSSettingsView'
import AccountSettingsView from './pages/AccountSettingsView'
import MessagingIntegrationView from './pages/MessagingIntegrationView'
import TenantLogin from './pages/TenantLogin'
import SecuregateLogin from './pages/SecuregateLogin'
import { MenuView } from './pages/MenuView'
import { TableView } from './pages/TableView'
import { POSView } from './pages/POSView'
import { ReservationsView } from './pages/ReservationsView'
import { CalendarView } from './pages/CalendarView'
import WebsiteDashboardView from './pages/WebsiteDashboardView'
import { StaffView } from './pages/StaffView'
import { BranchView } from './pages/BranchView'
import { FranchiseView } from './pages/FranchiseView'
import { WaitlistView } from './pages/WaitlistView'
import { IntegrationsView } from './pages/IntegrationsView'
import { FinancialsView } from './pages/FinancialsView'
import AutomationView from './pages/AutomationView'
import MessagesView from './pages/MessagesView'
import WorkspaceChannelsView from './pages/WorkspaceChannelsView'
import SettingsView from './pages/SettingsView'
import DomainSetupView from './pages/DomainSetupView'
import InventoryView from './pages/InventoryView'
import { OnlineOrderingView } from './pages/OnlineOrderingView'
import { ContentManager } from './pages/ContentManager'

import BillingView from './pages/BillingView'
import { OrderPortal } from './pages/OrderPortal'
import KioskView from './pages/KioskView'
import VoiceAgentOverview from './pages/voice-agent/VoiceAgentOverview'
import VoiceAgentSetupForm from './pages/voice-agent/VoiceAgentSetupForm'
import VoiceAgentKnowledgeBase from './pages/voice-agent/VoiceAgentKnowledgeBase'
import VoiceAgentCallLogs from './pages/voice-agent/VoiceAgentCallLogs'
import VoiceAgentUsageBilling from './pages/voice-agent/VoiceAgentUsageBilling'
import VoiceAgentSettings from './pages/voice-agent/VoiceAgentSettings'
import VoiceAgentPhoneNumber from './pages/voice-agent/VoiceAgentPhoneNumber'
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
import AccessDenied from './pages/AccessDenied'
import NotFound from './pages/public/NotFound'

import SolutionPage from './pages/public/SolutionPage'
import IntegrationsPage from './pages/public/IntegrationsPage'
import CaseStudiesPage from './pages/public/CaseStudiesPage'
import GuidesPage from './pages/public/GuidesPage'
import ApiDocsPage from './pages/public/ApiDocsPage'
import TermsPage from './pages/public/TermsPage'
import CareersPage from './pages/public/CareersPage'
import PartnersPage from './pages/public/PartnersPage'
import CookiePolicyPage from './pages/public/CookiePolicyPage'
import GdprPage from './pages/public/GdprPage'


// Sectros Portals & Modules
import TaxAdvisorLogin from './pages/tax-advisor/TaxAdvisorLogin'
import TaxAdvisorDashboard from './pages/tax-advisor/TaxAdvisorDashboard'
import EmployeePortal from './pages/employee/EmployeePortal'
import ChefDashboard from './pages/ChefDashboard'
import CashRegisterView from './pages/CashRegisterView'
import ProcurementView from './pages/ProcurementView'
import WalkInCheckInKiosk from './pages/kiosk/WalkInCheckInKiosk'
import KioskMenuManager from './pages/kiosk/KioskMenuManager'
import TimeClockKiosk from './pages/kiosk/TimeClockKiosk'

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
  const { isModernBusinessOS, loading } = useWebsiteTheme();
  if (loading) return null;
  return isModernBusinessOS ? (modern || classic) : classic;
}

function SEO({ title, description, path, children }) {
  return (
    <>
      <SEOHead title={title} description={description} path={path} />
      {children}
    </>
  );
}

function ThemeAwarePublicLayout() {
  const { isModernBusinessOS, loading } = useWebsiteTheme();
  if (loading) return null;
  return isModernBusinessOS ? <ModernPublicLayout /> : <PublicLayout />;
}

function AppContent() {
  return (
    <>
      <AppLockScreen />
      <Routes>
        {/* Public Website */}
        <Route element={<ThemeAwarePublicLayout />}>
          <Route path="/" element={<SEO path="/"><ThemedPage classic={<LandingPage />} modern={<ModernHome />} /></SEO>} />
          <Route path="/pricing" element={<SEO title="Pricing" path="/pricing"><ThemedPage classic={<PricingPage />} modern={<ModernPricing />} /></SEO>} />
          <Route path="/features" element={<SEO title="Features" path="/features"><ThemedPage classic={<FeaturesPage />} modern={<ModernFeatures />} /></SEO>} />
          <Route path="/blog" element={<SEO title="Blog" path="/blog"><ThemedPage classic={<BlogPage />} modern={<ModernBlog />} /></SEO>} />
          <Route path="/blog/:slug" element={<SEO title="Blog" path="/blog"><BlogDetailPage /></SEO>} />
          <Route path="/customers" element={<SEO title="Customer Stories" path="/customers"><CustomerStoriesPage /></SEO>} />
          <Route path="/customers/:slug" element={<SEO title="Customer Stories" path="/customers"><CustomerStoryDetailPage /></SEO>} />
          <Route path="/docs" element={<SEO title="Documentation" path="/docs"><DocumentationPage /></SEO>} />
          <Route path="/help" element={<SEO title="Help Center" path="/help"><HelpCenterPage /></SEO>} />
          <Route path="/about" element={<SEO title="About Us" path="/about"><ThemedPage classic={<AboutUsPage />} modern={<ModernAbout />} /></SEO>} />
          <Route path="/community" element={<SEO title="Community" path="/community"><CommunityPage /></SEO>} />
          <Route path="/privacy" element={<SEO title="Privacy Policy" path="/privacy"><DynamicPrivacyPolicy /></SEO>} />
          <Route path="/book" element={<SEO title="Reservations" path="/book"><ReservationsPublicView /></SEO>} />
          <Route path="/solutions" element={<SEO title="Solutions" path="/solutions"><ThemedPage classic={<SolutionPage />} modern={<ModernSolutions />} /></SEO>} />
          <Route path="/solutions/:slug" element={<SEO title="Solutions" path="/solutions"><ThemedPage classic={<SolutionPage />} modern={<ModernSolutions />} /></SEO>} />
          <Route path="/integrations" element={<SEO title="Integrations" path="/integrations"><ThemedPage classic={<IntegrationsPage />} modern={<ModernIntegrations />} /></SEO>} />
          <Route path="/directory" element={<SEO title="Business Directory" path="/directory"><DirectoryPage /></SEO>} />
          <Route path="/directory/:slug" element={<SEO title="Business Directory" path="/directory"><DirectoryDetailPage /></SEO>} />
          <Route path="/contact" element={<SEO title="Contact Us" path="/contact"><ThemedPage classic={null} modern={<ModernContact />} /></SEO>} />
          <Route path="/case-studies" element={<SEO title="Case Studies" path="/case-studies"><CaseStudiesPage /></SEO>} />
          <Route path="/guides" element={<SEO title="Guides" path="/guides"><GuidesPage /></SEO>} />
          <Route path="/api-docs" element={<SEO title="API Documentation" path="/api-docs"><ApiDocsPage /></SEO>} />
          <Route path="/terms" element={<SEO title="Terms of Service" path="/terms"><TermsPage /></SEO>} />
          <Route path="/careers" element={<SEO title="Careers" path="/careers"><CareersPage /></SEO>} />
          <Route path="/partners" element={<SEO title="Partners" path="/partners"><PartnersPage /></SEO>} />
          <Route path="/cookies" element={<SEO title="Cookie Policy" path="/cookies"><CookiePolicyPage /></SEO>} />
          <Route path="/gdpr" element={<SEO title="GDPR & Data Privacy" path="/gdpr"><GdprPage /></SEO>} />
        </Route>

        {/* Dedicated Role Portals */}
        <Route path="/tax-advisor/login" element={<TaxAdvisorLogin />} />
        <Route path="/tax-advisor/register" element={<TaxAdvisorLogin />} />
        <Route path="/tax-advisor" element={<TaxAdvisorDashboard />} />
        
        <Route path="/employee" element={<EmployeePortal />} />
        <Route path="/ChefDashboard" element={<ChefDashboard />} />
        <Route path="/chef-dashboard" element={<ChefDashboard />} />

        {/* Dedicated Kiosk Terminals */}
        <Route path="/kiosk" element={<WalkInCheckInKiosk />} />
        <Route path="/kiosk-order" element={<OrderPortal />} />
        <Route path="/TimeClockKiosk" element={<TimeClockKiosk />} />
        <Route path="/KioskMenuManager" element={<KioskMenuManager />} />

        {/* Tenant Login / Register */}
        <Route path="/login" element={<TenantLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* SaaS Super Admin (Central Domain) */}
        <Route path="/securegate" element={<SecuregateLogin />} />
        <Route path="/admin/login" element={<SecuregateLogin />} />

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
            <Route path="voice-providers" element={<VoiceProviderListView />} />
            <Route path="voice-phone-numbers" element={<VoicePhoneNumberPool />} />
            <Route path="voice-agent-plans" element={<VoiceAgentPlanListView />} />
            <Route path="translations" element={<TranslationManagementView />} />
            <Route path="settings" element={<SaaSSettingsView />} />
            <Route path="messaging-integration" element={<MessagingIntegrationView />} />
            <Route path="account" element={<AccountSettingsView />} />
          </Route>
        </Route>

        {/* Public Customer View */}
        <Route path="/order" element={<OrderPortal />} />
        <Route path="/kiosk/:tenantId" element={<KioskView />} />

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
            <Route path="cash-register" element={<CashRegisterView />} />
            <Route path="procurement" element={<ProcurementView />} />
            <Route path="kiosk-menu" element={<KioskMenuManager />} />

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
              <Route path="channels" element={<WorkspaceChannelsView />} />
              <Route path="settings" element={<SettingsView />} />
              <Route path="domain" element={<DomainSetupView />} />

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
              {/* AI Voice Agent */}
              <Route path="voice-agent" element={<VoiceAgentOverview />} />
              <Route path="voice-agent/setup" element={<VoiceAgentSetupForm />} />
              <Route path="voice-agent/knowledge-base" element={<VoiceAgentKnowledgeBase />} />
              <Route path="voice-agent/calls" element={<VoiceAgentCallLogs />} />
              <Route path="voice-agent/usage" element={<VoiceAgentUsageBilling />} />
              <Route path="voice-agent/settings" element={<VoiceAgentSettings />} />
              <Route path="voice-agent/phone-number" element={<VoiceAgentPhoneNumber />} />
            </Route>
          </Route>
          <Route path="/access-denied" element={<AccessDenied />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

function App() {
  return <AppContent />
}

export default App
