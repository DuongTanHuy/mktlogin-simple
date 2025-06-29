import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useAuthContext } from 'src/auth/hooks';
// sections
import ConsoleView from 'src/sections/synchronizer/console-view';

// ----------------------------------------------------------------------

export default function SynchronizerConsolePage() {
  const { app_version } = useAuthContext();
  const [searchParams] = useSearchParams();
  const [displayScreens, setDisplayScreens] = useState([]);
  const [profilesOpened, setProfilesOpened] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState({});
  const [textGroup, setTextGroup] = useState([]);
  const [tabActive, setTabActive] = useState();

  useEffect(() => {
    const data = JSON.parse(searchParams.get('data'));
    setDisplayScreens(data.displayScreens);
    setProfilesOpened(data.profilesOpened);
    setIsSyncing(data.isSyncing);
    setFormData(data.formData);
    setTextGroup(data.textGroupData);
    setTabActive(data.tabActive);
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>
      {tabActive && (
        <ConsoleView
          displayScreens={displayScreens}
          isOperator
          isSyncing={isSyncing}
          profilesOpened={profilesOpened}
          formData={formData}
          textGroupData={textGroup}
          mode="outline"
          tabActive={tabActive}
        />
      )}
    </>
  );
}
