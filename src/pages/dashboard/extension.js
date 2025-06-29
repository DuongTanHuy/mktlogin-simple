import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// sections
import ExtensionView from 'src/sections/extension/view';

// ----------------------------------------------------------------------

export default function ExtensionPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <ExtensionView />
    </>
  );
}
