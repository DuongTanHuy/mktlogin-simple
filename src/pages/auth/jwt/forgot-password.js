import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
import { JwtForgotPasswordView } from 'src/sections/auth/jwt';
// sections

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <JwtForgotPasswordView />
    </>
  );
}
