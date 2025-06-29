import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
// hooks
// components
import Iconify from 'src/components/iconify';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Skeleton,
  Typography,
} from '@mui/material';
import Label from 'src/components/label';
import { LoadingButton } from '@mui/lab';
import { getListDeviceApi, logoutMultiDevice } from 'src/api/auth.api';
import { getStorage } from 'src/hooks/use-local-storage';
import { DEVICE_ID_KEY } from 'src/utils/constance';
import { isElectron } from 'src/utils/commom';
import { enqueueSnackbar } from 'notistack';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------
const currentDeviceId = getStorage(isElectron() ? DEVICE_ID_KEY : 'browser_deivce_id');

export default function LoginHistoryDialog({ open, onClose }) {
  const { t } = useLocales();

  // const { deviceData, refetchDeviceData } = useGetListDevice();

  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState([]);
  const [prevNum, setPrevNum] = useState(1);

  const [currentDevice, setCurrentDevice] = useState({});
  const [otherDevices, setOtherDevices] = useState([]);
  const [reRender, setReRender] = useState(1);

  // const currentDevice = deviceData.find((device) => device?.device_hash === currentDeviceId);
  // const otherDevices = deviceData.filter((device) => device?.device_hash !== currentDeviceId);

  const handleLogoutMultiDevice = async () => {
    try {
      setLoading(true);
      await logoutMultiDevice({ device_ids: selectedDevice });
      setReRender((prev) => prev + 1);
      setSelectedDevice([]);
      setSelecting(false);
      enqueueSnackbar(t('systemNotify.success.logoutDevice'), { variant: 'success' });
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleLogoutDevice = async (deviceId) => {
    try {
      await logoutMultiDevice({ device_ids: [deviceId] });
      setReRender((prev) => prev + 1);
      enqueueSnackbar(t('systemNotify.success.logoutDevice'), { variant: 'success' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedDevice([]);
    setSelecting(false);
  };

  useEffect(() => {
    const handleFetchData = async () => {
      try {
        setFetching(true);
        const response = await getListDeviceApi();
        if (response?.data?.data) {
          const current = response.data.data.find(
            (device) => device?.device_hash === currentDeviceId
          );
          const others = response.data.data.filter(
            (device) => device?.device_hash !== currentDeviceId
          );

          setPrevNum(others.length);
          setCurrentDevice(current);
          setOtherDevices(others);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setFetching(false);
      }
    };

    if (open) {
      handleFetchData();
    }
  }, [reRender, open]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: (theme) => theme.customShadows.z4,
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1.5,
        }}
      >
        {t('dialog.loginActivity.title')}
      </DialogTitle>
      <Divider />
      <DialogContent
        sx={{
          py: 2,
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary">
              {t('dialog.loginActivity.labels.currentDevice')}
            </Typography>
            {fetching ? (
              <DeviceSkeleton />
            ) : (
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                  bgcolor: 'background.neutral',
                  p: '8px 20px',
                  borderRadius: 2,
                }}
              >
                <Iconify
                  icon={currentDevice?.os === 'windows' ? 'gg:windows' : 'qlementine-icons:mac-16'}
                  sx={{
                    width: 36,
                    height: 36,
                  }}
                />
                <Stack direction="row" justifyContent="space-between" width={1}>
                  <Stack>
                    <Typography
                      sx={{
                        typography: 'subtitle2',
                      }}
                    >
                      {t('dialog.loginActivity.labels.deviceName')}:{' '}
                      <Typography component="span" color="text.secondary">
                        {currentDevice?.hostname ?? t('dialog.loginActivity.labels.unknown')}
                      </Typography>
                    </Typography>
                    <Typography
                      sx={{
                        typography: 'subtitle2',
                      }}
                    >
                      {t('dialog.loginActivity.labels.os')}:{' '}
                      <Typography component="span" color="text.secondary">
                        {currentDevice?.os === 'windows' ? 'Windows' : 'macOS'}
                      </Typography>
                    </Typography>
                    <Typography
                      sx={{
                        typography: 'subtitle2',
                      }}
                    >
                      IP:{' '}
                      <Typography component="span" color="text.secondary">
                        {currentDevice?.ip}
                      </Typography>
                    </Typography>
                  </Stack>
                  <Label color="primary">{t('dialog.loginActivity.labels.current')}</Label>
                </Stack>
              </Stack>
            )}
          </Stack>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">
                {t('dialog.loginActivity.labels.otherDevices')}
              </Typography>
              {selecting && (
                <Button
                  color="primary"
                  sx={{
                    py: 0,
                  }}
                  onClick={() => {
                    if (otherDevices.length === selectedDevice.length) {
                      setSelectedDevice([]);
                    } else {
                      setSelectedDevice(otherDevices.map((device) => device?.id));
                    }
                  }}
                >
                  {otherDevices.length > 0 && otherDevices.length === selectedDevice.length
                    ? t('dialog.loginActivity.actions.unchoseAll')
                    : t('dialog.loginActivity.actions.choseAll')}
                </Button>
              )}
            </Stack>
            {fetching ? (
              Array.from(new Array(prevNum)).map((_, index) => <DeviceSkeleton key={index} />)
            ) : (
              <Stack spacing={1} sx={{ maxHeight: 450, overflow: 'auto' }}>
                {otherDevices.length ? (
                  otherDevices.map((device) => (
                    <Stack
                      key={device?.device_hash}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        bgcolor: 'background.neutral',
                        p: '8px 20px',
                        borderRadius: 2,
                        position: 'relative',
                      }}
                    >
                      <Iconify
                        icon={device?.os === 'windows' ? 'gg:windows' : 'qlementine-icons:mac-16'}
                        sx={{
                          width: 36,
                          height: 36,
                        }}
                      />
                      <Stack direction="row" justifyContent="space-between" width={1}>
                        <Stack>
                          <Typography
                            sx={{
                              typography: 'subtitle2',
                            }}
                          >
                            {t('dialog.loginActivity.labels.deviceName')}:{' '}
                            <Typography component="span" color="text.secondary">
                              {device?.hostname ?? t('dialog.loginActivity.labels.unknown')}
                            </Typography>
                          </Typography>
                          <Typography
                            sx={{
                              typography: 'subtitle2',
                            }}
                          >
                            {t('dialog.loginActivity.labels.os')}:{' '}
                            <Typography component="span" color="text.secondary">
                              {device?.os === 'windows' ? 'Windows' : 'macOS'}
                            </Typography>
                          </Typography>
                          <Typography
                            sx={{
                              typography: 'subtitle2',
                            }}
                          >
                            IP:{' '}
                            <Typography component="span" color="text.secondary">
                              {device?.ip}
                            </Typography>
                          </Typography>
                        </Stack>
                        {selecting && (
                          <FormControlLabel
                            name="is_from_selection"
                            control={<Checkbox checked={selectedDevice.includes(device?.id)} />}
                            onChange={() => {
                              if (selectedDevice.includes(device?.id)) {
                                setSelectedDevice(
                                  selectedDevice.filter((item) => item !== device?.id)
                                );
                              } else {
                                setSelectedDevice([...selectedDevice, device?.id]);
                              }
                            }}
                            sx={{
                              width: 'fit-content',
                              mr: 0,
                            }}
                          />
                        )}
                      </Stack>
                      <Button
                        sx={{
                          position: 'absolute',
                          right: 14,
                          top: 12,
                          typography: 'caption',
                          py: 0.2,
                          px: 0.5,
                          ...(selecting && {
                            display: 'none',
                          }),
                        }}
                        color="error"
                        onClick={() => handleLogoutDevice(device?.id)}
                        variant="outlined"
                      >
                        {t('dialog.loginActivity.actions.logout')}
                      </Button>
                    </Stack>
                  ))
                ) : (
                  <Typography
                    sx={{
                      typography: 'subtitle2',
                      color: 'text.secondary',
                      textAlign: 'center',
                    }}
                  >
                    {t('dialog.loginActivity.labels.noDevice')}
                  </Typography>
                )}
              </Stack>
            )}
            {selecting ? (
              <Stack direction="row" spacing={2} justifyContent="flex-end" mt={1.5}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelecting(false);
                    setSelectedDevice([]);
                  }}
                >
                  {t('dialog.loginActivity.actions.cancel')}
                </Button>
                <LoadingButton
                  color="error"
                  variant="contained"
                  onClick={handleLogoutMultiDevice}
                  disabled={!selectedDevice.length}
                  loading={loading}
                >
                  {`${t('dialog.loginActivity.actions.logout')} ${selectedDevice.length} ${t(
                    'dialog.loginActivity.actions.device'
                  )}`}
                </LoadingButton>
              </Stack>
            ) : (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setSelecting(true)}
                sx={{
                  ...(otherDevices.length === 0 && {
                    display: 'none',
                  }),
                  mt: 1.5,
                }}
              >
                {t('dialog.loginActivity.actions.chose')}
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

LoginHistoryDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

const DeviceSkeleton = () => <Skeleton sx={{ borderRadius: 2, width: 1, height: 88 }} />;
