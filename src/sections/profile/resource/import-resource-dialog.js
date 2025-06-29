import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Typography,
  Zoom,
} from '@mui/material';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import FormProvider from 'src/components/hook-form/form-provider';
import { LoadingButton } from '@mui/lab';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { importAccountResourceApi } from 'src/api/profile.api';
import { useAuthContext } from 'src/auth/hooks';
import Label, { CustomLabel } from 'src/components/label';
import { useLocales } from 'src/locales';
import { enqueueSnackbar } from 'notistack';
import { ERROR_CODE, NUM_ID_DISPLAY, RESOURCE_OPTIONS } from 'src/utils/constance';
import { useState } from 'react';

//----------------------------------------------------------------------

const KEYS = [
  { id: 'key_1', label: 'UID', value: 'uid' },
  { id: 'key_10', label: 'Username', value: 'username' },
  { id: 'key_2', label: 'Password', value: 'password' },
  { id: 'key_3', label: '2Fa', value: 'two_fa' },
  { id: 'key_4', label: 'Email', value: 'email' },
  { id: 'key_5', label: 'Email password', value: 'pass_email' },
  { id: 'key_6', label: 'Recovery email', value: 'mail_recovery' },
  { id: 'key_7', label: 'Token', value: 'token' },
  { id: 'key_8', label: 'Cookie', value: 'cookie' },
  { id: 'key_9', label: 'Phone', value: 'phone' },
  { id: 'key_none', label: 'None', value: '|' },
];

//----------------------------------------------------------------------

export default function ImportResourceDialog({ open, onClose, profileIds, handleResetData }) {
  const { t } = useLocales();
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const { workspace_id } = useAuthContext();
  const formSchema = Yup.object().shape({
    format: Yup.string().required(t('validate.required')),
    resource: Yup.string().required(t('validate.required')),
  });
  const popover = usePopover();

  const defaultValues = {
    resource_type: 'facebook',
    format: '',
    resource: '',
  };

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    setValue,
    setError,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const watchFormat = watch('format');
  const watchResource = watch('resource');

  function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      let continueSubmit = true;
      const { resource_type, format, resource } = data;
      const keys = format.split('|').map((item) => item.trim());
      const validKeys = KEYS.map((item) => item.value);

      const isValidKey = keys.every((key) => [...validKeys, ''].includes(key));

      if (!isValidKey) {
        setError('format', {
          type: 'manual',
          message: t('validate.invalidKey'),
        });
        return;
      }

      const lines = resource.split('\n').filter((line) => line.trim() !== '');
      const finalData = lines.map((line) => {
        const parts = line.split('|').map((part) => part.trim());

        // if (parts.length !== keys.length) {
        //   setError('resource', {
        //     type: 'manual',
        //     message: `${line} ${t('validate.notMatchFormat')}: ${format}`,
        //   });
        //   continueSubmit = false;
        // }

        const obj = {};
        parts.forEach((part, index) => {
          if (index < keys.length) {
            if (
              (keys[index] === 'email' && !isValidEmail(part)) ||
              (keys[index] === 'mail_recovery' && !isValidEmail(part))
            ) {
              if (part !== '') {
                setError('resource', {
                  type: 'manual',
                  message: `${line} ${t('validate.invalidEmail')}`,
                });
                continueSubmit = false;
              }
            }
            if (keys[index] !== '') {
              obj[keys[index]] = part;
            }
          }
        });

        return obj;
      });

      if (finalData.length !== profileIds.length) {
        setError('resource', {
          type: 'manual',
          message: t('validate.invalidQuantity'),
        });
        return;
      }

      if (!continueSubmit) return;

      const payload = {
        resource_type,
        data: profileIds.map((profile_id, index) => ({
          profile_id,
          account_data: finalData[index],
        })),
      };

      await importAccountResourceApi(workspace_id, payload);
      handleClose();
      handleResetData();
      enqueueSnackbar(t('systemNotify.success.title'), { variant: 'success' });
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.resource'), {
          variant: 'error',
        });
      } else {
        enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
      }
      handleClose();
    }
  });

  const handleClose = () => {
    reset();
    onClose();
    setNumItem(NUM_ID_DISPLAY);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: (theme) => theme.customShadows.z4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>{t('dialog.addAccountResource.title')}</DialogTitle>

      <DialogContent sx={{ typography: 'body2' }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2} pt={1}>
            <Stack spacing={1} mb={1}>
              <Typography variant="body1">{t('dialog.addAccountResource.subTitle')}</Typography>
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
                  : t('quickAction.expiredProfile')}

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
              fullWidth
              name="resource_type"
              label={t('dialog.addAccountResource.label.resourceType')}
              SelectProps={{
                MenuProps: {
                  autoFocus: false,
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      '&::-webkit-scrollbar': {
                        width: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: (theme) => theme.palette.grey[500],
                        borderRadius: '4px',
                      },
                    },
                  },
                },
              }}
            >
              {RESOURCE_OPTIONS.map((item) => (
                <MenuItem key={item.id} value={item.value}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Iconify icon={item.icon} width={24} />
                    <Typography>{item.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField
              name="format"
              label={t('dialog.addAccountResource.label.format')}
              sx={{
                '&:hover #btn-delete-key': {
                  opacity: 1,
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton
                        id="btn-delete-key"
                        sx={{
                          opacity: 0,
                          transition: 'opacity 0.3s linear',
                          ...(watchFormat === '' && {
                            visibility: 'hidden',
                          }),
                        }}
                        onClick={() => {
                          const keys = watchFormat.split('|').map((item) => item.trim());
                          keys.pop();
                          setValue('format', keys.join('|'), {
                            shouldValidate: true,
                          });
                        }}
                      >
                        <Iconify icon="material-symbols:close-rounded" />
                      </IconButton>
                      <Button onClick={popover.onOpen}>
                        {t('dialog.addAccountResource.actions.addKey')}
                      </Button>
                    </Stack>
                  </InputAdornment>
                ),
              }}
            />

            <RHFTextField
              name="resource"
              label={t('dialog.addAccountResource.label.resourceData')}
              InputLabelProps={{ shrink: true }}
              placeholder={t('dialog.addAccountResource.placeholder.resourceData')}
              multiline
              rows={6}
              sx={{
                '& .MuiFormHelperText-root': {
                  // whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            />

            <Stack ml={1} color="text.secondary">
              <Typography>
                {t('dialog.addAccountResource.label.totalProfile')}
                <Typography component="span" color="primary">
                  {profileIds.length}
                </Typography>
              </Typography>

              <Typography>
                {t('dialog.addAccountResource.label.totalAccount')}
                <Typography component="span" color="primary">
                  {watchResource.split('\n').filter((line) => line.trim() !== '').length}
                </Typography>
              </Typography>
            </Stack>

            <Stack direction="row" pb={3} justifyContent="end" spacing={2}>
              <Button variant="contained" color="inherit" onClick={handleClose}>
                {t('dialog.addAccountResource.actions.cancel')}
              </Button>

              <LoadingButton
                loading={isSubmitting}
                disabled={profileIds?.length === 0}
                variant="contained"
                color="primary"
                type="submit"
              >
                {t('dialog.addAccountResource.actions.add')}
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </DialogContent>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        sx={{
          width: 160,
        }}
        TransitionComponent={Zoom}
        arrow="top-right"
      >
        <Stack>
          {KEYS.map((item) =>
            item.value === '|' ? (
              <Stack key={item.id}>
                <Divider />
                <MenuItem
                  onClick={() => {
                    if (
                      watchFormat
                        .split('|')
                        .map((i) => i.trim())
                        .includes(item.value)
                    )
                      return;
                    setValue('format', `${watchFormat}${item.value}`, {
                      shouldValidate: true,
                    });
                  }}
                >
                  <Typography>{item.label}</Typography>
                </MenuItem>
              </Stack>
            ) : (
              <MenuItem
                key={item.id}
                onClick={() => {
                  if (
                    watchFormat
                      .split('|')
                      .map((i) => i.trim())
                      .includes(item.value)
                  )
                    return;
                  setValue(
                    'format',
                    `${watchFormat}${watchFormat === '' ? '' : '|'}${item.value}`,
                    {
                      shouldValidate: true,
                    }
                  );
                }}
              >
                <Typography>{item.label}</Typography>
              </MenuItem>
            )
          )}
        </Stack>
      </CustomPopover>
    </Dialog>
  );
}

ImportResourceDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  profileIds: PropTypes.array,
  handleResetData: PropTypes.func,
};
