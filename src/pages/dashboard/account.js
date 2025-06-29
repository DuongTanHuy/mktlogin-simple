import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// sections
import AccountView from 'src/sections/account/view';

// ----------------------------------------------------------------------

export default function AccountPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <AccountView />
    </>
  );
}
