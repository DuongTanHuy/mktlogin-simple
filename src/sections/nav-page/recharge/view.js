import { useState } from 'react';
// @mui
import Container from '@mui/material/Container';
//
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { Alert, alpha, Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';

// ----------------------------------------------------------------------

import { styled } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import { BANK_ACCOUNT } from 'src/utils/constance';
import { useAuthContext } from 'src/auth/hooks';
import { getQrCodeApi } from 'src/api/common.api';
import { useLocales } from 'src/locales';
import { useGetWorkspace } from 'src/api/workspace.api';
import QRDialog from './qr-dialog';

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  borderRadius: '10px',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    width: '100% !important',
    height: 100,
  },
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15,
    },
    '& .MuiImageMarked-root': {
      opacity: 0,
    },
    '& .MuiTypography-root': {
      border: '4px solid currentColor',
    },
  },
}));

const ImageSrc = styled('span')({
  position: 'absolute',
  left: 20,
  right: 20,
  top: 20,
  bottom: 20,
  backgroundPosition: 'center',
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
});

const ImageBackdrop = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.common.black,
  opacity: 0,
  transition: theme.transitions.create('opacity'),
}));

export default function RechargeView() {
  const settings = useSettingsContext();
  const { t } = useLocales();
  const { workspace_id } = useAuthContext();
  const { workspace } = useGetWorkspace(workspace_id);

  const [qrImage, setQrImage] = useState('');

  const confirm = useMultiBoolean({
    acb: false,
    vietcombank: false,
  });
  const images = [
    {
      url: '/assets/images/bank/Logo-ACB.png',
      title: 'ACB',
      width: '300px',
      onClick: async () => {
        if (!workspace?.user_creator?.username) return;
        try {
          confirm.onTrue('acb');
          const payload = {
            ...BANK_ACCOUNT,
            ...BANK_ACCOUNT.type.acb,
            addInfo: `mktlogin ${workspace.user_creator.username}`,
          };
          const response = await getQrCodeApi(payload);
          setQrImage(response?.data?.data?.qrDataURL);
        } catch (error) {
          console.error(error);
        }
      },
    },
    // {
    //   url: '/assets/images/bank/Logo-Vietcombank.png',
    //   title: 'Vietcombank',
    //   width: '300px',
    //   onClick: async () => {
    //     if (!email) return;
    //     try {
    //       confirm.onTrue('vietcombank');
    //       const payload = {
    //         ...BANK_ACCOUNT,
    //         ...BANK_ACCOUNT.type.vietcombank,
    //         addInfo: `mktlogin ${email.split('@')[0]}`,
    //       };
    //       const response = await getQrCodeApi(payload);
    //       setQrImage(response?.data?.data?.qrDataURL);
    //     } catch (error) {
    //       console.error(error);
    //     }
    //   },
    // },
  ];

  const renderDialog = (
    <>
      <QRDialog
        type="acb"
        qr={qrImage}
        open={confirm.value.acb}
        onClose={() => {
          setQrImage('');
          confirm.onFalse('acb');
        }}
        username={workspace?.user_creator?.username}
      />
      <QRDialog
        type="vietcombank"
        qr={qrImage}
        open={confirm.value.vietcombank}
        onClose={() => {
          setQrImage('');
          confirm.onFalse('vietcombank');
        }}
      />
    </>
  );

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? 'lg' : 'md'}
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
          <Card>
            <CardHeader title={<Typography variant="h5">{t('recharge.title')}</Typography>} />
            <CardContent sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
              <Stack spacing={4}>
                <Stack direction="row" spacing={2} height="126px">
                  {images.map((image) => (
                    <ImageButton
                      focusRipple
                      key={image.url}
                      style={{
                        width: image.width,
                      }}
                      sx={{
                        boxShadow: (theme) => theme.customShadows.z8,
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.01),
                        border: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                      }}
                      onClick={image.onClick}
                    >
                      <ImageSrc style={{ backgroundImage: `url(${image.url})` }} />
                      <ImageBackdrop className="MuiImageBackdrop-root" />
                    </ImageButton>
                  ))}
                </Stack>
                <Stack spacing={2}>
                  {/* <Alert severity="warning">
                    <Typography>{t('recharge.warning')}</Typography>
                  </Alert> */}
                  <Alert severity="info">
                    <Typography>{t('recharge.info')}</Typography>
                  </Alert>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Scrollbar>
      </Container>
      {renderDialog}
    </>
  );
}
