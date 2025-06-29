import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
// sections
import WorkspaceSettingView from 'src/sections/workspace-setting/view';

// ----------------------------------------------------------------------

export default function WorkspaceSettingPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <WorkspaceSettingView />
    </>
  );
}
