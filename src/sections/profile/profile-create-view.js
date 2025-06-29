import React, { useState } from 'react';
// mui
import { Container, Tab, Tabs } from '@mui/material';
// components
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import { useBalanceContext } from 'src/account-balance/context/balance-context';
import { useLocales } from 'src/locales';
import { useSearchParams } from 'src/routes/hooks';
import SingleCreateUpdateProfile from './single-create-update-profile';
import ImportFileProfile from './import-file-profile';
import BatchCreateProfile from './batch-create-profile';

const ProfileCreateView = () => {
  const { t } = useLocales();

  const searchParams = useSearchParams();
  const modeParam = searchParams.get('method');

  const TABS = [
    {
      value: 'single-create',
      label: t('create-method.new'),
    },

    {
      value: 'import-file',
      label: t('create-method.import-file'),
    },
    {
      value: 'batch-create',
      label: t('create-method.batch-create'),
    },
  ];

  const settings = useSettingsContext();
  const { updateRefreshBalance } = useBalanceContext();
  const [currentTab, setCurrentTab] = useState(modeParam ?? 'single-create');

  const handleChangeTab = (_, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        height: 1,
        pb: 1,
        px: '0px!important',
      }}
    >
      <Tabs value={currentTab} onChange={handleChangeTab}>
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>
      <Scrollbar
        sxRoot={{
          overflow: 'unset',
        }}
        sx={{
          height: 'calc(100% - 100px)',
          mt: 1,
          '& .simplebar-track.simplebar-vertical': {
            position: 'absolute',
            right: '-12px',
            pointerEvents: 'auto',
            width: 12,
          },
        }}
      >
        {currentTab === 'single-create' && (
          <SingleCreateUpdateProfile
            isUpdateMode={false}
            handleReloadBalance={updateRefreshBalance}
          />
        )}

        {currentTab === 'import-file' && <ImportFileProfile />}

        {currentTab === 'batch-create' && <BatchCreateProfile />}
      </Scrollbar>
    </Container>
  );
};

export default ProfileCreateView;
