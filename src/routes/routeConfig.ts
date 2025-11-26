import { lazy } from 'react';
import React from 'react';

// Lazy load components for better performance
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const Analytics = lazy(() => import('@/features/analytics/pages/Analytics'));
const SettingsHubPage = lazy(() => import('@/features/settings/pages/SettingsHubPage'));
const BusinessProfilePage = lazy(() => import('@/features/settings/pages/BusinessProfilePage'));
const BranchesPage = lazy(() => import('@/features/settings/pages/BranchesPage'));
const OpeningHoursPage = lazy(() => import('@/features/settings/pages/OpeningHoursPage'));
const Login = lazy(() => import('@/features/auth/pages/Login'));
const SignUp = lazy(() => import('@/features/auth/pages/SignUp'));
const VerifyEmail = lazy(() => import('@/features/auth/pages/VerifyEmail'));
const OtpVerification = lazy(() => import('@/features/auth/pages/OtpVerification'));
const VerificationSuccess = lazy(() => import('@/features/auth/pages/VerificationSuccess'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword'));

// Menu pages
const MenuItems = lazy(() => import('@/features/menu/pages/MenuItems'));
const MenuCategories = lazy(() => import('@/features/menu/pages/MenuCategories'));

// Orders pages
const Orders = lazy(() => import('@/features/orders/pages/Orders'));
const ManualOrderEntry = lazy(() => import('@/features/orders/pages/ManualOrderEntry'));

// Settings pages
const QRCodeManagement = lazy(() => import('@/features/settings/pages/QRCodeManagement'));
const TableSetup = lazy(() => import('@/features/settings/pages/TableSetup'));
const AccountSettingsPage = lazy(() => import('@/features/settings/pages/AccountSettingsPage'));
const NotificationsPage = lazy(() => import('@/features/settings/pages/NotificationsPage'));
const IntegrationsPage = lazy(() => import('@/features/settings/pages/IntegrationsPage'));
const Profile = lazy(() => import('@/features/settings/pages/Profile'));
const TimezoneDemo = lazy(() => import('@/features/settings/pages/TimezoneDemo'));

// Public content component
const PublicContent: React.FC = () => React.createElement('div', null, 'Public Content');

// Public routes (no authentication required)
export const publicRoutes = [
  // {
  //   path: '/login',
  //   component: Login,
  // },
  {
    path: 'login',
    component: Login,
  },
  {
    path: '/auth/signup',
    component: SignUp,
  },
  {
    path: '/auth/verify-email',
    component: VerifyEmail,
  },
  {
    path: '/auth/verify-otp',
    component: OtpVerification,
  },
  {
    path: '/auth/verification-success',
    component: VerificationSuccess,
  },
  {
    path: '/auth/forgot-password',
    component: ForgotPassword,
  },
  {
    path: '/public/*',
    component: PublicContent,
  },
];

// Protected routes (authentication required)
export const authProtectedRoutes = [
  {
    path: '/dashboard',
    component: Dashboard,
  },
  {
    path: '/menu',
    component: MenuItems,
  },
  {
    path: '/menu/categories',
    component: MenuCategories,
  },
  {
    path: '/orders',
    component: Orders,
  },
  {
    path: '/orders/manual-entry',
    component: ManualOrderEntry,
  },
  {
    path: '/analytics',
    component: Analytics,
  },
  {
    path: '/settings',
    component: SettingsHubPage, // Use the new settings hub page
  },
  {
    path: '/settings/business-profile',
    component: BusinessProfilePage,
  },
  {
    path: '/settings/branches',
    component: BranchesPage,
  },
  {
    path: '/settings/opening-hours',
    component: OpeningHoursPage,
  },
  {
    path: '/settings/qr-codes',
    component: QRCodeManagement,
  },
  {
    path: '/timezone-demo',
    component: TimezoneDemo,
  },
  {
    path: '/settings/table-setup',
    component: TableSetup,
  },
  {
    path: '/settings/account',
    component: AccountSettingsPage,
  },
  {
    path: '/settings/notifications',
    component: NotificationsPage,
  },
  {
    path: '/settings/integrations',
    component: IntegrationsPage,
  },
  {
    path: '/profile',
    component: Profile,
  },
];
