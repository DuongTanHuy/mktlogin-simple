import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
import { getStorage } from 'src/hooks/use-local-storage';
// sections
import SynchronizerView from 'src/sections/synchronizer/view';
import { IS_SYNCING, IS_SYNC_OPERATOR_OPEN, PROFILE_IDS_SYNCING } from 'src/utils/constance';

// ----------------------------------------------------------------------

export default function SynchronizerPage() {
  const { app_version } = useAuthContext();
  const operator = getStorage(IS_SYNC_OPERATOR_OPEN) === true;
  const isSyncing = getStorage(IS_SYNCING) === true;
  const profileIdsSyncing = getStorage(PROFILE_IDS_SYNCING) || [];

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <SynchronizerView
        operator={operator}
        isSyncing={isSyncing}
        profileIdsSyncing={profileIdsSyncing}
      />
    </>
  );
}
