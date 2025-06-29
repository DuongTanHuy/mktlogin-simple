import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// sections
import { JwtOtpView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export default function OTPPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <JwtOtpView />
    </>
  );
}
