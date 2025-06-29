import { useState } from 'react';
// @mui
import Container from '@mui/material/Container';
import { Tab, Tabs } from '@mui/material';
// components
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import { useLocales } from 'src/locales';
import TeamExtensionsTab from './team-extensions-tab';
import RecommendedExtensionsTab from './recommended-extensions-tab';

// ----------------------------------------------------------------------

export default function ExtensionView() {
  const { t } = useLocales();

  const TABS = [
    {
      value: 'team-extension',
      label: t('extension.team.title'),
    },
    {
      value: 'recommended-extension',
      label: t('extension.recommended.title'),
    },
  ];

  const settings = useSettingsContext();
  const [currentTab, setCurrentTab] = useState('team-extension');

  const handleChangeTab = (_, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        maxHeight: 'calc(100% - 80px)',
        px: '0px!important',
        position: 'relative',
      }}
    >
      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          position: 'sticky',
          top: 0,
          bgcolor: '#fff',
          ...(settings.themeMode === 'dark' && {
            bgcolor: (theme) => theme.palette.grey[900],
          }),
          mb: 3,
          zIndex: 10,
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>
      <Scrollbar
        sxRoot={{
          overflow: 'unset',
        }}
        sx={{
          height: 1,
          '& .simplebar-track.simplebar-vertical': {
            position: 'absolute',
            right: '-12px',
            pointerEvents: 'auto',
          },
        }}
      >
        {currentTab === 'team-extension' && <TeamExtensionsTab />}
        {currentTab === 'recommended-extension' && <RecommendedExtensionsTab />}
      </Scrollbar>
    </Container>
  );
}
