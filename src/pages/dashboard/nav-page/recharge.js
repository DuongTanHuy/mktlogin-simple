import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// components
import RechargeView from 'src/sections/nav-page/recharge/view';

// ----------------------------------------------------------------------

export default function RechargePage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <RechargeView />
    </>
  );
}
