import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthLayout } from "./components/auth/AuthLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { Toaster } from "react-hot-toast";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { LandingHero } from "./components/LandingHero";
import { LoginForm } from "./components/auth/LoginForm";
import { SignupForm } from "./components/auth/SignupForm";
import { VipFloatingButton } from "./components/VipFloatingButton";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TaskManagement } from "./components/admin/TaskManagement";
import {UserManagement} from "./components/admin/UserManagement";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
// Lazy load pages
const Overview = lazy(() => import("./pages/Overview"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Referrals = lazy(() => import("./pages/Referrals"));
const Earnings = lazy(() => import("./pages/Earnings"));
const Withdraw = lazy(() => import("./pages/Withdraw"));
const Settings = lazy(() => import("./pages/Settings"));
const TopEarners = lazy(() => import("./pages/TopEarners"));
const LoanPage = lazy(() => import("./pages/Loan"));
const AboutPage = lazy(() => import("./pages/About"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const WithdrawalsAndLoans = lazy(() => import("./pages/admin/WithdrawalsAndLoans"));
const ProfileSettings = lazy(() => import("./components/settings/ProfileSettings"));
const SecuritySettings = lazy(() => import("./components/settings/SecuritySettings"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingHero />,
  },
  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminLayout />
        </Suspense>
      </AdminProtectedRoute>
    ),
    children: [
      { 
        path: "", 
        element: <Suspense fallback={<LoadingSpinner />}><AdminDashboard /></Suspense> 
      },
      { 
        path: "tasks", 
        element: <TaskManagement />
      },
      { 
        path: "users", 
        element: <UserManagement />
      },
      { 
        path: "withdrawals-loans", 
        element: <Suspense fallback={<LoadingSpinner />}><WithdrawalsAndLoans /></Suspense> 
      },
    ],
  },
  {
    path: "/login",
    element: (
      <AuthLayout
        title='Welcome Back'
        subtitle='Sign in to access your account'>
        <LoginForm />
      </AuthLayout>
    ),
  },
  {
    path: "/signup",
    element: (
      <AuthLayout
        title='Create Account'
        subtitle='Join us and start earning rewards'>
        <SignupForm />
      </AuthLayout>
    ),
  },
  {
    path: "/overview",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Overview />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/tasks",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Tasks />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/referrals",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Referrals />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/earnings",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Earnings />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/withdraw",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Withdraw />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/topearners",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <TopEarners />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/loan",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <LoanPage />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Settings />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { element: <ProfileSettings />, index: true },
      { path: "profile", element: <ProfileSettings /> },
      { path: "security", element: <SecuritySettings /> },
    ],
  },
  {
    path: "/about",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <AboutPage />
      </Suspense>
    ),
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="relative min-h-screen">
          <RouterProvider router={router} />
          <Toaster />
          <VipFloatingButton />
        </div>
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
