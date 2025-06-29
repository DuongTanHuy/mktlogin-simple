import PropTypes from 'prop-types';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// assets
import {
  PlanFreeIcon,
  PlanStarterIcon,
  PlanPremiumIcon,
  PlanBigTeamIcon,
  PlanScaleIcon,
  PlanResourcesIcon,
} from 'src/assets/icons';
// components
import Iconify from 'src/components/iconify';
import { fCurrencyVND } from 'src/utils/format-number';
import Label from 'src/components/label';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function PurchaseItem({ data, active, sx, currentUse, handleConfirm, ...other }) {
  const { t } = useLocales();
  const { id, name, price, profile_quantity } = data;
  const column = other.index;

  const renderIcon = (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Box sx={{ width: 48, height: 48 }}>
        {column === 0 && <PlanFreeIcon />}
        {column === 1 && <PlanStarterIcon />}
        {column === 2 && <PlanPremiumIcon />}
        {column === 3 && <PlanBigTeamIcon />}
        {column === 4 && <PlanScaleIcon />}
        {column === 5 && <PlanResourcesIcon />}
      </Box>

      {currentUse === id && <Label color="info">{t('packages.inUse')}</Label>}
    </Stack>
  );

  const renderPrice =
    name === 'Free' ? (
      <Typography variant="h3">Free</Typography>
    ) : (
      <Stack spacing={2}>
        <Typography variant="h3">{name}</Typography>

        <Stack direction="row">
          <Typography variant="h4" mr={1}>
            VND
          </Typography>

          <Typography variant="h3">{fCurrencyVND(price)}</Typography>

          <Typography
            component="span"
            sx={{
              alignSelf: 'center',
              color: 'text.disabled',
              ml: 1,
              typography: 'body2',
            }}
          >
            {`/ ${t('packages.unit')}`}
          </Typography>
        </Stack>
      </Stack>
    );

  const renderList = (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box component="span" sx={{ typography: 'overline' }}>
          {t('packages.features.title')}
        </Box>
      </Stack>
      {profile_quantity && (
        <Stack
          spacing={1}
          direction="row"
          alignItems="center"
          sx={{
            typography: 'body2',
          }}
        >
          <Iconify icon="eva:checkmark-fill" width={16} sx={{ mr: 1 }} />
          {`${profile_quantity} ${t('packages.features.profileBalance')}`}
        </Stack>
      )}
      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        sx={{
          typography: 'body2',
        }}
      >
        <Iconify icon="eva:checkmark-fill" width={16} sx={{ mr: 1 }} />
        {t('packages.features.allFeatures')}
      </Stack>
      {name === 'Free' && (
        <>
          <Stack
            spacing={1}
            direction="row"
            alignItems="center"
            sx={{
              typography: 'body2',
            }}
          >
            <Iconify icon="iconoir:cancel" width={16} sx={{ mr: 1 }} />
            Không thể chuyển hồ sơ
          </Stack>
          <Stack
            spacing={1}
            direction="row"
            alignItems="center"
            sx={{
              typography: 'body2',
            }}
          >
            <Iconify icon="iconoir:cancel" width={16} sx={{ mr: 1 }} />
            Không thể mời thành viên vào workspace
          </Stack>
        </>
      )}
    </Stack>
  );

  return (
    <Stack
      spacing={2}
      height={1}
      sx={{
        p: 5,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
        boxShadow: (theme) => ({
          xs: theme.customShadows.card,
          md: theme.customShadows.z8,
        }),
        ...sx,
      }}
      {...other}
    >
      {renderIcon}

      {renderPrice}

      <Divider sx={{ borderStyle: 'dashed', marginTop: 'auto' }} />

      {renderList}

      <Button
        fullWidth
        size="large"
        variant="contained"
        color={!active ? 'primary' : 'inherit'}
        disabled={name === 'Free'}
        onClick={handleConfirm}
      >
        {active && name !== 'Free'
          ? t('packages.actions.buyMore')
          : `${t('packages.actions.chose')} ${name}`}
      </Button>
    </Stack>
  );
}

PurchaseItem.propTypes = {
  data: PropTypes.object,
  active: PropTypes.bool,
  handleConfirm: PropTypes.func,
  currentUse: PropTypes.number,
  sx: PropTypes.object,
};
