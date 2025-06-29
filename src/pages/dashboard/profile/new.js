import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// sections
import ProfileCreateView from 'src/sections/profile/profile-create-view';

// ----------------------------------------------------------------------

export default function ProductCreatePage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <ProfileCreateView />
    </>
  );
}
