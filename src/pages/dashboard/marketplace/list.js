import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// sections
import { MarketplaceListView } from 'src/sections/marketplace/view';

// ----------------------------------------------------------------------

export default function MarketplacePage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <MarketplaceListView />
    </>
  );
}
