import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
import AffiliateProgramView from 'src/sections/nav-page/affiliate-program/view';
// components

// ----------------------------------------------------------------------

export default function AffiliateProgramPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <AffiliateProgramView />
    </>
  );
}
