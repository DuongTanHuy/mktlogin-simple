import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
//
import Scrollbar from 'src/components/scrollbar';
import { useLocales } from 'src/locales';
import AccountGeneral from './account-general';
import AccountBalance from './account-balance';
import AccountLink from './account-link';
import AccountSecurity from './account-security';

// ----------------------------------------------------------------------

export default function AccountView() {
  const settings = useSettingsContext();
  const { t } = useLocales();

  const TABS = [
    {
      value: 'general',
      label: t('accSetting.tabs.general.title'),
      icon: <Iconify icon="solar:user-id-bold" width={24} />,
    },
    {
      value: 'balance',
      label: t('balance.title'),
      icon: <Iconify icon="mingcute:balance-fill" width={24} />,
    },
    {
      value: 'security',
      label: t('accSetting.tabs.security.title'),
      icon: <Iconify icon="ic:round-vpn-key" width={24} />,
    },
    // {
    //   value: 'app-link',
    //   label: t('accSetting.tabs.accLink.title'),
    //   icon: <Iconify icon="fluent:contact-card-link-16-filled" width={24} />,
    // },
  ];

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container
      maxWidth={settings.themeStretch ? 'lg' : 'md'}
      sx={{
        height: '100%',
        pr: '0px!important',
      }}
    >
      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 2 },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>
      <Scrollbar
        sx={{
          height: 1,
          pr: 2,
          pt: 2,
        }}
      >
        {currentTab === 'general' && <AccountGeneral />}

        {currentTab === 'balance' && <AccountBalance />}

        {currentTab === 'security' && <AccountSecurity />}

        {currentTab === 'app-link' && <AccountLink />}
      </Scrollbar>
    </Container>
  );
}
