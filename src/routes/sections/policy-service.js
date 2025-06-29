import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
// layouts
// components
import { SplashScreen } from 'src/components/loading-screen';
import PolicySerViceLayout from 'src/layouts/auth/policy-service-layout';

// ----------------------------------------------------------------------

const PolicyPage = lazy(() => import('src/pages/policy-service/policy'));
const ServicePage = lazy(() => import('src/pages/policy-service/service'));

// ----------------------------------------------------------------------

const PolicyService = {
  path: '/',
  element: (
    <PolicySerViceLayout>
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    </PolicySerViceLayout>
  ),
  children: [
    {
      path: 'privacy-policy',
      element: <PolicyPage />,
    },
    {
      path: 'terms-of-service',
      element: <ServicePage />,
    },
  ],
};

export const policyServiceRoutes = [PolicyService];
