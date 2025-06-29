import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { trackingClick } from 'src/api/tracking.api';
import { useAuthContext } from 'src/auth/hooks';
// sections
import { JwtRegisterView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export default function RegisterPage() {
  const { app_version } = useAuthContext();
  const [seachParams] = useSearchParams();

  useEffect(() => {
    if (seachParams.get('referer')) {
      trackingClick(window.location.href);
    }
  }, [seachParams]);

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <JwtRegisterView />
    </>
  );
}
