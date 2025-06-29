import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { GuestGuard } from 'src/auth/guard';
// layouts
import AuthClassicLayout from 'src/layouts/auth/classic';
// components
import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// JWT
const JwtLoginPage = lazy(() => import('src/pages/auth/jwt/login'));
const JwtRegisterPage = lazy(() => import('src/pages/auth/jwt/register'));
const JwtOtpPage = lazy(() => import('src/pages/auth/jwt/otp'));
const JwtForgotPasswordPage = lazy(() => import('src/pages/auth/jwt/forgot-password'));
const JwtNewPasswordPage = lazy(() => import('src/pages/auth/jwt/new-password'));

// CONFIRM_INVITATION
const ConfirmInvitation = lazy(() => import('src/pages/confirm-invitation'));

// OAUTH LOGIN
const OauthLoginPage = lazy(() => import('src/pages/auth/oauth/oauth-login-page'));
const OauthPermissionPage = lazy(() => import('src/pages/auth/oauth/oauth-permission-page'));

// ----------------------------------------------------------------------

const authJwt = {
  path: '/',
  element: (
    <GuestGuard>
      <Suspense fallback={<SplashScreen />}>
        <AuthClassicLayout
          sx={{
            width: { xs: 420, lg: 500 },
          }}
        >
          <Outlet />
        </AuthClassicLayout>
      </Suspense>
    </GuestGuard>
  ),
  children: [
    {
      path: 'login',
      element: <JwtLoginPage />,
    },
    {
      path: 'register',
      element: <JwtRegisterPage />,
    },
    {
      path: 'otp',
      element: <JwtOtpPage />,
    },
    { path: 'forgot-password', element: <JwtForgotPasswordPage /> },
    { path: 'new-password/:token', element: <JwtNewPasswordPage /> },
  ],
};

const confirmInvitation = {
  path: 'invite',
  element: (
    <Suspense fallback={<SplashScreen />}>
      <Outlet />
    </Suspense>
  ),
  children: [
    {
      path: ':invite_code',
      element: <ConfirmInvitation />,
    },
  ],
};

const oauthLogin = {
  path: 'oauth/',
  element: (
    <Suspense fallback={<SplashScreen />}>
      <Outlet />
    </Suspense>
  ),
  children: [
    {
      path: 'login',
      element: (
        <AuthClassicLayout
          displayHeader={false}
          sx={{
            width: 1,
            maxWidth: 460,
          }}
        >
          <OauthLoginPage />
        </AuthClassicLayout>
      ),
    },
    {
      path: 'permission',
      element: (
        <AuthClassicLayout
          displayHeader={false}
          sx={{
            width: { xs: 460, md: '90vw' },
            maxWidth: 1100,
            mx: { xs: 0, md: 10 },
            py: 0,
          }}
        >
          <OauthPermissionPage />
        </AuthClassicLayout>
      ),
    },
  ],
};

export const authRoutes = [authJwt, oauthLogin, confirmInvitation];
