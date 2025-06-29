import { Navigate, useRoutes } from 'react-router-dom';
//
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { mainRoutes } from './main';

import { authRoutes } from './auth';
import { DashboardRoutes } from './dashboard';
import { policyServiceRoutes } from './policy-service';
import { noLayoutServiceRoutes } from './no-layout';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to={PATH_AFTER_LOGIN} replace />,
    },

    // Dashboard routes
    ...DashboardRoutes(),

    // Auth routes
    ...authRoutes,

    // Main routes
    ...mainRoutes,

    // Policy & Services
    ...policyServiceRoutes,

    // No layout routes
    ...noLayoutServiceRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
