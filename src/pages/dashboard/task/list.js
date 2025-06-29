import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// sections
import { ListTaskView } from 'src/sections/task/view';

// ----------------------------------------------------------------------

export default function TaskPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <ListTaskView />
    </>
  );
}
