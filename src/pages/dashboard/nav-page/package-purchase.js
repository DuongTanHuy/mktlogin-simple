import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// components
import PackagePurchaseView from 'src/sections/nav-page/package-purchase/view';
import { profile_package_data, user_info } from 'src/utils/mock';

// ----------------------------------------------------------------------

export default function PackagePurchasePage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>
      <PackagePurchaseView
        data={[
          {
            id: 0,
            name: 'Free',
            profile_quantity: 5,
          },
          ...profile_package_data,
        ]}
        packageActive={user_info?.profile_package?.id}
      />
    </>
  );
}
