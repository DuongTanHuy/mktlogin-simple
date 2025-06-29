import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// sections
import ProfileUpdateView from 'src/sections/profile/profile-update-view';

// ----------------------------------------------------------------------

export default function ProductUpdatePage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <ProfileUpdateView />
    </>
  );
}
