import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';

// sections
import ListScheduleTaskView from '../../../sections/schedule/view/list-schedule-view';

// ----------------------------------------------------------------------

export default function MarketplacePage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <ListScheduleTaskView />
    </>
  );
}
