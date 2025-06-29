import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
// utils
import { fCurrencyVND } from 'src/utils/format-number';
// assets
// components
import { Grid, alpha, useTheme } from '@mui/material';
import { useBalanceContext } from 'src/account-balance/context/balance-context';
import { useLocales } from 'src/locales';
import { bgGradient } from 'src/theme/css';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const AccountBalance = () => {
  const theme = useTheme();

  const {
    balanceInfo: { cash_balance, profile_balance, current_package, num_current_profile },
  } = useBalanceContext();
  const { t } = useLocales();

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <BalanceItem
          title={t('balance.main')}
          total={`${fCurrencyVND(cash_balance) || 0} VND`}
          icon="mdi:account-balance-wallet-outline"
          color={[theme.palette.primary.light, theme.palette.primary.main]}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <BalanceItem
          title={t('balance.profile')}
          total={`${profile_balance} ${t('balance.unit')}`}
          icon="pepicons-pop:credit-card-circle"
          color={[theme.palette.warning.light, theme.palette.warning.main]}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <BalanceItem
          title={t('balance.current-package')}
          total={current_package || 'Free'}
          icon="ph:package-fill"
          color={[theme.palette.info.light, theme.palette.info.main]}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <BalanceItem
          title={t('balance.existing')}
          total={`${num_current_profile} ${t('balance.unit')}`}
          icon="bi:browser-chrome"
          color={[theme.palette.error.light, theme.palette.error.main]}
        />
      </Grid>
    </Grid>
  );
};

export default AccountBalance;

function BalanceItem({ title, total, icon, color }) {
  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        pl: 3,
        position: 'relative',
        '&:before': {
          content: '""',
          width: '155px',
          height: '155px',
          position: 'absolute',
          borderRadius: 4,
          right: 0,
          transform: 'translate(50%, -18%) rotate(45deg)',
          zIndex: -1,
          ...bgGradient({
            direction: 'to top',
            startColor: alpha(color[0], 0.8),
            endColor: alpha(color[1], 0.8),
          }),
        },
      }}
    >
      <Box>
        <Box sx={{ mb: 1, typography: 'h3' }}>{total}</Box>
        <Box sx={{ color: 'text.secondary', typography: 'subtitle2' }}>{title}</Box>
      </Box>

      <Iconify
        icon={icon}
        width={30}
        sx={{
          position: 'absolute',
          right: 28,
          top: 24,
          color: 'white',
        }}
      />
    </Card>
  );
}

BalanceItem.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  title: PropTypes.string,
  color: PropTypes.array,
  total: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
