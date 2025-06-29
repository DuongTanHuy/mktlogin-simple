import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// sections
import { JwtLoginView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export default function LoginPage() {
  const { app_version } = useAuthContext();
  console.log('LoginPage app_version:', app_version);

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <JwtLoginView />
    </>
  );
}
