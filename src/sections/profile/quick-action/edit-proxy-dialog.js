import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

import { ERROR_CODE, PROXY_CONNECTION_TYPES } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { updateProfileApi } from 'src/api/profile.api';
import { useAuthContext } from 'src/auth/hooks';
import { enqueueSnackbar } from 'notistack';
import { isValidBase64 } from 'src/utils/profile';
import Iconify from 'src/components/iconify';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { isElectron } from 'src/utils/commom';
import { Typography } from '@mui/material';

const EditProxyDialog = ({ open, onClose, proxy, profileId, handleUpdateAfterEdit }) => {
  const { copy } = useCopyToClipboard();
  const { workspace_id } = useAuthContext();
  const { t } = useLocales();
  const [proxyChecking, setProxyChecking] = useState(false);
  const [proxyInfo, setProxyInfo] = useState({});

  const ProxySchema = Yup.object().shape({
    proxy: Yup.object().when('proxy_type', {
      is: (val) => val !== 'none' && val !== 'token',
      then: (schema) =>
        schema.shape({
          host: Yup.string().required(t('quickAction.proxy.error.host')),
          port: Yup.string().required(t('quickAction.proxy.error.port')),
        }),
    }),
    proxy_token: Yup.string()
      .nullable()
      .when('proxy_type', {
        is: 'token',
        then: (schema) =>
          schema
            .required(t('formError.profile.proxyToken'))
            .test('is-base64', t('formError.profile.invalidBase64'), (value) =>
              value ? isValidBase64(value) : true
            ),
        otherwise: (schema) => schema.nullable(true),
      }),
  });

  const defaultValues = useMemo(
    () => ({
      proxy_type: proxy?.proxy_type || 'none',
      proxy: {
        host: proxy?.proxy_host || '',
        port: proxy?.proxy_port || '',
        username: proxy?.proxy_user || '',
        password: proxy?.proxy_password || '',
      },
      proxy_token: proxy?.proxy_token || '',
    }),
    [
      proxy?.proxy_host,
      proxy?.proxy_password,
      proxy?.proxy_port,
      proxy?.proxy_token,
      proxy?.proxy_type,
      proxy?.proxy_user,
    ]
  );

  const methods = useForm({
    resolver: yupResolver(ProxySchema),
    defaultValues,
  });

  const {
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;

  const watchProxyType = watch('proxy_type');
  const watchProxy = watch('proxy');
  const watchProxyToken = watch('proxy_token');

  const getProxyFields = useCallback((data) => {
    if (data.proxy_type === 'token') {
      return {
        proxy_token: data.proxy_token,
        proxy_host: '',
        proxy_port: '',
        proxy_user: '',
        proxy_password: '',
      };
    }

    if (data.proxy_type === 'none') {
      return {
        proxy_type: '',
        proxy_host: data.proxy.host,
        proxy_port: data.proxy.port,
        proxy_user: data.proxy.username,
        proxy_password: data.proxy.password,
        proxy_token: '',
      };
    }

    return {
      proxy_host: data.proxy.host,
      proxy_port: data.proxy.port,
      proxy_user: data.proxy.username,
      proxy_password: data.proxy.password,
      proxy_token: '',
    };
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        proxy_type: data.proxy_type,
        ...getProxyFields(data),
      };

      await updateProfileApi(workspace_id, profileId, payload);
      enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
      handleUpdateAfterEdit(profileId, 'proxy_host', {
        proxy_type: data.proxy_type,
        ...getProxyFields(data),
      });
      onClose();
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.proxy'), {
          variant: 'error',
        });
      } else {
        enqueueSnackbar(t('systemNotify.error.update'), { variant: 'error' });
      }
    }
  });

  const handlePasteProxy = (event) => {
    event.preventDefault();
    const pasteText = event.clipboardData.getData('text').trim();
    const text = pasteText.split(':');
    setValue('proxy.host', text[0] ?? '', {
      shouldDirty: true,
    });
    setValue('proxy.port', text[1] ?? '', {
      shouldDirty: true,
    });
    setValue('proxy.username', text[2] ?? '', {
      shouldDirty: true,
    });
    setValue('proxy.password', text[3] ?? '', {
      shouldDirty: true,
    });
  };

  const handleCheckProxy = async (proxyType) => {
    setProxyChecking(true);
    watchProxy.mode = proxyType;

    if (proxyType === 'token') {
      if (!isValidBase64(watchProxyToken)) {
        enqueueSnackbar(t('systemNotify.error.proxyInvalid'), { variant: 'error' });
        setProxyChecking(false);
        return;
      }
      watchProxy.mode = 'token';
      watchProxy.proxy_token = watchProxyToken;
    } else if (!watchProxy.host || !watchProxy.port) {
      enqueueSnackbar(t('systemNotify.error.proxyInvalid'), { variant: 'error' });
      setProxyChecking(false);
      return;
    }

    if (isElectron()) {
      try {
        const proxyResponse = await window.ipcRenderer.invoke('proxy-check', watchProxy);
        if (proxyResponse?.ip) {
          enqueueSnackbar(t('systemNotify.success.proxyWork'), { variant: 'success' });
          setProxyInfo(proxyResponse);
        } else {
          enqueueSnackbar(t('systemNotify.error.proxyWork'), { variant: 'error' });
          setProxyInfo({});
        }
        setProxyChecking(false);
      } catch (error) {
        console.log('check proxy error: ', error);
        setProxyChecking(false);
      }
    }
  };

  const handleClose = () => {
    setProxyInfo({});
    onClose();
    reset(defaultValues);
  };

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset, open]);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {t('quickAction.proxy.title')}
          <Button
            variant="outlined"
            startIcon={<Iconify icon="mingcute:copy-line" />}
            sx={{
              ...(['none', 'token'].includes(watchProxyType) && {
                display: 'none',
              }),
            }}
            onClick={() => {
              const text = `${watch('proxy.host')}:${watch('proxy.port')}:${watch(
                'proxy.username'
              )}:${watch('proxy.password')}`;
              copy(text);
              enqueueSnackbar(t('systemNotify.success.copied'), { variant: 'success' });
            }}
          >
            {t('dialog.exportResource.actions.copy')}
          </Button>
        </Stack>
      </DialogTitle>
      <DialogContent
        sx={{
          pt: '8px!important',
        }}
      >
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2}>
            <RHFSelect
              fullWidth
              name="proxy_type"
              label={t('quickAction.proxy.labels.type')}
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
            >
              {PROXY_CONNECTION_TYPES.map((option) => (
                <MenuItem key={option.id} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>
            {watchProxyType !== 'none' && watchProxyType !== 'token' && (
              <>
                <Grid container>
                  <Grid item xs={7}>
                    <RHFTextField name="proxy.host" label="Host" onPaste={handlePasteProxy} />
                  </Grid>
                  <Grid item xs={1} display="flex" alignItems="center" justifyContent="center">
                    :
                  </Grid>
                  <Grid item xs={4}>
                    <RHFTextField name="proxy.port" label="Port" />
                  </Grid>
                </Grid>
                <RHFTextField
                  name="proxy.username"
                  label={t('quickAction.proxy.labels.username')}
                />
                <RHFTextField
                  name="proxy.password"
                  label={t('quickAction.proxy.labels.password')}
                />
              </>
            )}
            {watchProxyType === 'token' && (
              <RHFTextField
                name="proxy_token"
                label="Proxy token"
                placeholder="Enter proxy token"
              />
            )}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent={
                ['none', 'token'].includes(watchProxyType) ? 'flex-end' : 'space-between'
              }
              pb={1}
            >
              <LoadingButton
                onClick={() => handleCheckProxy(watchProxyType)}
                loading={proxyChecking}
                variant="outlined"
                sx={{
                  height: '36px',
                  ...(['none', 'token'].includes(watchProxyType) && {
                    display: 'none',
                  }),
                }}
              >
                {t('form.action.check')}
              </LoadingButton>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button variant="contained" onClick={handleClose}>
                  {t('quickAction.actions.close')}
                </Button>
                <LoadingButton
                  loading={isSubmitting}
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={!isDirty}
                >
                  {t('quickAction.actions.update')}
                </LoadingButton>
              </Stack>
            </Stack>
            <Typography variant="body2" color="#00A76F" pb={proxyInfo?.ip ? 3 : 0}>
              {Object.entries(proxyInfo)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')}
            </Typography>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default EditProxyDialog;

EditProxyDialog.propTypes = {
  onClose: PropTypes.func,
  handleUpdateAfterEdit: PropTypes.func,
  open: PropTypes.bool,
  proxy: PropTypes.object,
  profileId: PropTypes.number,
};
