import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// sections
import { NotFoundView } from 'src/sections/error';

// ----------------------------------------------------------------------

export default function NotFoundPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <NotFoundView />
    </>
  );
}
