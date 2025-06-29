import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// sections
import GeneralLogView from 'src/sections/general-log/view';

// ----------------------------------------------------------------------

export default function GeneralLogPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <GeneralLogView />
    </>
  );
}
