import { Helmet } from 'react-helmet-async';
import { useGetSupportChanel } from 'src/api/system-config.api';
import { useAuthContext } from 'src/auth/hooks';
import { LoadingScreen } from 'src/components/loading-screen';
// components
import SupportGroupView from 'src/sections/nav-page/support-group/view';

// ----------------------------------------------------------------------

export default function SupportGroupPage() {
  const { app_version } = useAuthContext();

  const { chanel, chanelLoading } = useGetSupportChanel();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      {chanelLoading ? <LoadingScreen /> : <SupportGroupView chanelInfo={chanel} />}
    </>
  );
}
