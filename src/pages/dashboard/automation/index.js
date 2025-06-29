import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';

// import { useSettingsContext } from 'src/components/settings';
// components
import ScriptComponent from './script/list';
// import FlowComponent from './flow';
// ----------------------------------------------------------------------

export default function Page() {
  // const { settingSystem } = useSettingsContext();
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>
      <ScriptComponent />
      {/* {settingSystem?.rpa_method === 'flowchart' && <FlowComponent />}
      {settingSystem?.rpa_method === 'script' && <ScriptComponent />} */}
    </>
  );
}
