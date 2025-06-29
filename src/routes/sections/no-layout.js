import { lazy } from 'react';

// ----------------------------------------------------------------------

const LoginGooglePage = lazy(() => import('src/pages/auth/login-google'));

// ----------------------------------------------------------------------

const NoLayoutService = {
  path: '/login/google',
  element: <LoginGooglePage />,
};

export const noLayoutServiceRoutes = [NoLayoutService];
