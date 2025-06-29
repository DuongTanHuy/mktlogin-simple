import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// sections
import ListTrashView from 'src/sections/trash/view';

// ----------------------------------------------------------------------

export default function TrashPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <ListTrashView />
    </>
  );
}
