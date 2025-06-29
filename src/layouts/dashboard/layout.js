import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocales } from 'src/locales';
// @mui
import Box from '@mui/material/Box';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';
import { fCurrencyVND } from 'src/utils/format-number';
import Iconify from 'src/components/iconify';
import { useBalanceContext } from 'src/account-balance/context/balance-context';
import Main from './main';
import Header from './header';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';
import NavHorizontal from './nav-horizontal';
import BulletinBoard from './bulletin-board';
import SystemNotifyDialog from '../_common/system-notify-dialog';

// ----------------------------------------------------------------------

export default function DashboardLayout({ children }) {
  const { t } = useLocales();
  const settings = useSettingsContext();

  const {
    balanceInfo: { cash_balance, profile_balance, current_package, num_current_profile },
    updateRefreshBalance,
    loading,
  } = useBalanceContext();

  const balanceInfo = useMemo(
    () => [
      {
        label: t('balance.main'),
        value: `${fCurrencyVND(cash_balance) || 0} VND`,
        icon: <Iconify icon="mdi:account-balance-wallet-outline" />,
      },
      {
        label: t('balance.profile'),
        value: `${profile_balance} ${t('balance.unit')}`,
        icon: <Iconify icon="pepicons-pop:credit-card-circle" />,
      },
      {
        label: t('balance.current-package'),
        value: current_package || 'Free',
        icon: <Iconify icon="ph:package-fill" />,
      },
      {
        label: t('balance.existing'),
        value: `${num_current_profile} ${t('balance.unit')}`,
        icon: <Iconify icon="bi:browser-chrome" />,
      },
    ],
    [cash_balance, current_package, num_current_profile, profile_balance, t]
  );

  const lgUp = useResponsive('up', 'lg');

  const nav = useBoolean();

  const isHorizontal = settings.themeLayout === 'horizontal';

  const isMini = settings.themeLayout === 'mini';

  const renderNavMini = (
    <NavMini
      balanceInfo={balanceInfo}
      balanceLoading={loading}
      handleReloadBalance={updateRefreshBalance}
    />
  );

  const renderHorizontal = (
    <NavHorizontal
      balanceInfo={balanceInfo}
      balanceLoading={loading}
      handleReloadBalance={updateRefreshBalance}
    />
  );

  const renderNavVertical = (
    <NavVertical
      openNav={nav.value}
      onCloseNav={nav.onFalse}
      balanceInfo={balanceInfo}
      balanceLoading={loading}
      handleReloadBalance={updateRefreshBalance}
    />
  );

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     updateRefreshBalance();
  //   }, 180000);
  //   return () => clearInterval(timer);
  // }, [updateRefreshBalance]);

  if (isHorizontal) {
    return (
      <>
        <Header onOpenNav={nav.onTrue} />

        {lgUp ? renderHorizontal : renderNavVertical}

        <Main
          sx={{
            height: '100%',
          }}
        >
          {children}
        </Main>
        <BulletinBoard />
        <SystemNotifyDialog />
      </>
    );
  }

  if (isMini) {
    return (
      <>
        <Header onOpenNav={nav.onTrue} />

        <Box
          sx={{
            minHeight: 1,
            height: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
          }}
        >
          {lgUp ? renderNavMini : renderNavVertical}

          <Main>{children}</Main>
          <BulletinBoard />
        </Box>
        <SystemNotifyDialog />
      </>
    );
  }

  return (
    <>
      <Header onOpenNav={nav.onTrue} />

      <Box
        sx={{
          minHeight: 1,
          height: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        {renderNavVertical}

        <Main>{children}</Main>
        <BulletinBoard />
      </Box>
      <SystemNotifyDialog />
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};
