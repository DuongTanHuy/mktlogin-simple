import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// sections
import { JwtNewPasswordView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export default function NewPasswordPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <JwtNewPasswordView />
    </>
  );
}
