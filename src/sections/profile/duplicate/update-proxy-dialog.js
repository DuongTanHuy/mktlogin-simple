import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';

// components
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { updateProxyApi } from 'src/api/profile.api';
import { enqueueSnackbar } from 'notistack';
import { ERROR_CODE, NUM_ID_DISPLAY, PROXY_CONNECTION_TYPES } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import Label, { CustomLabel } from 'src/components/label';
import { useState } from 'react';
import { isValidBase64 } from '../../../utils/profile';

const UpdateProxyDialog = ({ open, onClose, profileIds, workspaceId, handleResetData }) => {
  const { t } = useLocales();
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);

  const INSERT_MODE_OPTIONS = [
    { value: 1, label: t('dialog.duplicateProfile.options.insertMode.noRepeat') },
    { value: 2, label: t('dialog.duplicateProfile.options.insertMode.repeat') },
    { value: 3, label: t('dialog.duplicateProfile.options.insertMode.oneForAll') },
  ];

  const InsertSchema = Yup.object().shape({
    // proxies: Yup.mixed().when('proxy_insert_mode', {
    //   is: (value) => value === 2,
    //   then: (schema) =>
    //     schema.test(
    //       'not-empty',
    //       t('validate.required'),
    //       (value) => value?.length > 0 && value !== ''
    //     ),
    //   otherwise: (schema) => schema,
    // }),
  });

  const defaultValues = {
    proxy_insert_mode: 1,
    proxy_type: 'http',
    proxies: [],
  };

  const methods = useForm({
    resolver: yupResolver(InsertSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setError,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const watchProxyInsertMode = watch('proxy_insert_mode');

  const handleClose = () => {
    reset();
    onClose();
    setNumItem(NUM_ID_DISPLAY);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      let continueSubmit = true;
      const { proxy_insert_mode, proxies, proxy_type } = data;
      const isValidFormat = (proxy_str, _proxy_type) => {
        if (_proxy_type === 'token') {
          return isValidBase64(proxy_str);
        }
        const regex = /^([^:\s]+):([^:\s]+)(?::([^:\s]+):([^:\s]+))?$/;
        const match = proxy_str.match(regex);
        return match;
      };

      const finalProxies =
        proxies.length > 0
          ? proxies.split('\n').reduce((validProxies, proxy) => {
              const trimmedProxy = proxy.trim();
              if (trimmedProxy?.length === 0) {
                return validProxies;
              }

              if (!isValidFormat(trimmedProxy, proxy_type)) {
                setError('proxies', {
                  type: 'manual',
                  message: `${t('validate.invalidProxy')}: ${trimmedProxy}`,
                });
                continueSubmit = false;
              } else {
                validProxies.push(trimmedProxy);
              }
              return validProxies;
            }, [])
          : [];

      if (!continueSubmit) return false;

      const payload = {
        profile_ids: profileIds,
        ...(proxy_insert_mode !== -1 && {
          proxy_insert_mode,
          proxies: finalProxies,
        }),
        proxy_type,
      };

      await updateProxyApi(workspaceId, payload);
      reset();
      onClose();
      handleResetData();
      enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.proxy'), {
          variant: 'error',
        });
        reset();
        onClose();
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    }
    return false;
  });

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
      <DialogTitle sx={{ pb: 2 }}>{t('dialog.updateProxy.title')}</DialogTitle>

      <DialogContent sx={{ typography: 'body2' }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography variant="body1">{t('dialog.updateProxy.subTitle')}</Typography>
              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                sx={{
                  typography: 'body2',
                  color: 'error.main',
                }}
              >
                {profileIds?.length > 0
                  ? profileIds.slice(0, numItem).map((profileId) => (
                      <Label
                        key={profileId}
                        color="primary"
                        sx={{
                          p: 2,
                        }}
                      >
                        {profileId}
                      </Label>
                    ))
                  : 'Profiles selected are expired!'}
                {profileIds.length > NUM_ID_DISPLAY && (
                  <CustomLabel
                    length={profileIds.length}
                    numItem={numItem}
                    setNumItem={setNumItem}
                  />
                )}
              </Stack>
            </Stack>
            <RHFSelect
              name="proxy_insert_mode"
              label={t('dialog.duplicateProfile.labels.insertMode')}
            >
              {INSERT_MODE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect name="proxy_type" label={t('dialog.duplicateProfile.labels.proxyType')}>
              {PROXY_CONNECTION_TYPES.slice(1).map((option) => (
                <MenuItem key={option.id} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>
            {watchProxyInsertMode !== -1 && (
              <RHFTextField
                name="proxies"
                label={`${t('dialog.updateProxy.label.proxy')}`}
                placeholder="host:port:user:pass&#10; hoặc &#10; host:port&#10;Ví dụ:&#10;192.1.1.201:9588:username:password&#10;192.1.1.201:9588:username:password&#10;192.1.1.201:9588&#10;192.1.1.201:9588&#10;"
                multiline
                rows={6}
              />
            )}
            <Stack direction="row" pb={3} justifyContent="end" spacing={2}>
              <Button variant="contained" color="inherit" onClick={handleClose}>
                {t('dialog.duplicateProfile.actions.cancel')}
              </Button>

              <LoadingButton
                loading={isSubmitting}
                disabled={profileIds?.length === 0}
                variant="contained"
                color="primary"
                type="submit"
              >
                {t('form.action.update')}
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProxyDialog;

UpdateProxyDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  profileIds: PropTypes.array,
  workspaceId: PropTypes.string.isRequired,
  handleResetData: PropTypes.func.isRequired,
};
