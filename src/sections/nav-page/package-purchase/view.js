import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
//
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { useBalanceContext } from 'src/account-balance/context/balance-context';
import { useLocales } from 'src/locales';
import { useBoolean } from 'src/hooks/use-boolean';
import PurchaseItem from './purchase-item';
import PurchasePackageDialog from './purchase-package-dialog';

// ----------------------------------------------------------------------

export default function PackagePurchaseView({ data = [], packageActive }) {
  const { t } = useLocales();
  const { updateRefreshBalance } = useBalanceContext();
  const settings = useSettingsContext();
  const [currentUse, setCurrentUse] = useState(0);
  const confirm = useBoolean();
  const [packageSelected, setPackageSelected] = useState(null);

  useEffect(() => {
    if (packageActive) {
      setCurrentUse(packageActive);
    }
  }, [packageActive]);

  return (
    <Container
      maxWidth={settings.themeStretch ? 'xl' : 'lg'}
      sx={{
        height: 1,
        pt: 3,
        pb: 1,
        px: '0px!important',
      }}
    >
      <Scrollbar
        sxRoot={{
          overflow: 'unset',
        }}
        sx={{
          height: 1,
          '& .simplebar-track.simplebar-vertical': {
            position: 'absolute',
            right: '-8px',
            pointerEvents: 'auto',
            width: 12,
          },
        }}
      >
        <Typography variant="h3" align="center" sx={{ mb: 2 }}>
          {t('packages.title')}
        </Typography>

        <Box
          gap={{ xs: 3, md: 6 }}
          display="grid"
          alignItems={{ md: 'start' }}
          gridTemplateColumns={{ md: 'repeat(3, 2fr)' }}
          sx={{
            p: 10,
            pt: 3,
            pb: 0,
          }}
        >
          {data.length > 0 &&
            data.map((item, index) => (
              <PurchaseItem
                key={item.id}
                data={item}
                index={index}
                currentUse={currentUse}
                active={currentUse === item?.id}
                handleConfirm={() => {
                  setPackageSelected(item);
                  confirm.onTrue();
                }}
              />
            ))}
        </Box>
      </Scrollbar>
      <PurchasePackageDialog
        confirm={confirm}
        packageSelected={packageSelected}
        setCurrentUse={setCurrentUse}
        updateRefreshBalance={updateRefreshBalance}
      />
    </Container>
  );
}

PackagePurchaseView.propTypes = {
  data: PropTypes.array,
  packageActive: PropTypes.number,
};
