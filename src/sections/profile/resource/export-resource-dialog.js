import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
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
import { RHFCheckbox, RHFTextField } from 'src/components/hook-form';
import { usePopover } from 'src/components/custom-popover';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import Label, { CustomLabel } from 'src/components/label';
import { useLocales } from 'src/locales';
import { enqueueSnackbar } from 'notistack';
import { FORMAT_KEY, NUM_ID_DISPLAY, SAVE_FORMAT_KEY } from 'src/utils/constance';
import { useEffect, useMemo, useState } from 'react';
import { exportResourceToFile } from 'src/utils/profile';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import Iconify from 'src/components/iconify';

//----------------------------------------------------------------------

const KEYS = [
  { id: 'key_1', label: 'UId', value: 'uid' },
  { id: 'key_10', label: 'Username', value: 'username' },
  { id: 'key_2', label: 'Password', value: 'password' },
  { id: 'key_3', label: '2Fa', value: 'two_fa' },
  { id: 'key_4', label: 'Email', value: 'email' },
  { id: 'key_5', label: 'Email password', value: 'pass_email' },
  { id: 'key_6', label: 'Recovery email', value: 'mail_recovery' },
  { id: 'key_7', label: 'Token', value: 'token' },
  { id: 'key_8', label: 'Cookie', value: 'cookie' },
  { id: 'key_9', label: 'Phone', value: 'phone' },
];

//----------------------------------------------------------------------

export default function ExportResourceDialog({ open, onClose, profiles, mode = 'export' }) {
  const { t } = useLocales();
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const formSchema = Yup.object().shape({
    format: Yup.string().required(t('validate.required')),
  });
  const popover = usePopover();

  const DEFAULT_FORMAT = JSON.parse(getStorage(FORMAT_KEY)) || '';
  const DEFAULT_SAVE_FORMAT = JSON.parse(getStorage(SAVE_FORMAT_KEY)) || false;

  const defaultValues = useMemo(
    () => ({
      format: DEFAULT_FORMAT,
      resource: '',
      remember: DEFAULT_SAVE_FORMAT,
    }),
    [DEFAULT_FORMAT, DEFAULT_SAVE_FORMAT]
  );

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

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { format, resource, remember } = data;

      const keys = format.split('|').map((item) => item.trim());
      const validKeys = KEYS.map((item) => item.value);

      const isValidKey = keys.every((key) => validKeys.includes(key));

      if (!isValidKey) {
        setError('format', {
          type: 'manual',
          message: t('validate.invalidKey'),
        });
        return;
      }

      setStorage(SAVE_FORMAT_KEY, JSON.stringify(remember));
      if (remember) {
        setStorage(FORMAT_KEY, JSON.stringify(format));
      }

      if (mode === 'export') {
        exportResourceToFile(resource);
      } else {
        await navigator.clipboard.writeText(resource);
      }

      handleClose();
      enqueueSnackbar(
        mode === 'export' ? t('systemNotify.success.title') : t('systemNotify.success.copied'),
        { variant: 'success' }
      );
    } catch (error) {
      enqueueSnackbar(
        error?.message || mode === 'export'
          ? t('systemNotify.error.title')
          : t('systemNotify.error.copied'),
        { variant: 'error' }
      );
      handleClose();
    }
  });

  const handleClose = () => {
    // reset(defaultValues);
    onClose();
    setNumItem(NUM_ID_DISPLAY);
  };

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [defaultValues, reset, open]);

  useEffect(() => {
    const processResources = (resources, keys) => {
      if (keys[0] === '') {
        const allKeysDefault = KEYS.map(() => '').join('|');
        return resources.map(() => allKeysDefault);
      }
      return resources.map((resource) => keys.map((key) => resource[key] || '').join('|'));
    };

    if (watchFormat === '') {
      setValue('resource', '');
      return;
    }

    const keys = watchFormat.split('|').map((item) => item.trim());

    const resource = profiles
      ?.map((item) => processResources(item?.account_resources || [], keys).join('\n'))
      .filter((item) => item !== '')
      .join('\n');

    setValue('resource', resource);
  }, [profiles, setValue, watchFormat, open]);

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
      <DialogTitle sx={{ pb: 2 }}>
        {mode === 'export'
          ? t('dialog.exportResource.title.export')
          : t('dialog.exportResource.title.copy')}
      </DialogTitle>

      <DialogContent sx={{ typography: 'body2' }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2} pt={1}>
            <Stack spacing={1} mb={1}>
              <Typography variant="body1">
                {mode === 'export'
                  ? t('dialog.exportResource.subTitle.export')
                  : t('dialog.exportResource.subTitle.copy')}
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                sx={{
                  typography: 'body2',
                  color: 'error.main',
                }}
              >
                {profiles?.length > 0
                  ? profiles.slice(0, numItem).map(({ id }) => (
                      <Label
                        key={id}
                        color="primary"
                        sx={{
                          p: 2,
                        }}
                      >
                        {id}
                      </Label>
                    ))
                  : t('quickAction.expiredProfile')}

                {profiles.length > NUM_ID_DISPLAY && (
                  <CustomLabel length={profiles.length} numItem={numItem} setNumItem={setNumItem} />
                )}
              </Stack>
            </Stack>

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

            <RHFCheckbox name="remember" label={t('dialog.exportResource.label.saveFormat')} />

            <RHFTextField
              name="resource"
              label={t('dialog.exportResource.label.preview')}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                readOnly: true,
              }}
              placeholder={t('dialog.exportResource.label.content')}
              multiline
              rows={6}
            />

            <Stack direction="row" pb={3} justifyContent="end" spacing={2}>
              <Button variant="contained" color="inherit" onClick={handleClose}>
                {t('dialog.addAccountResource.actions.cancel')}
              </Button>

              <LoadingButton
                loading={isSubmitting}
                variant="contained"
                color="primary"
                type="submit"
              >
                {mode === 'export'
                  ? t('dialog.exportResource.actions.export')
                  : t('dialog.exportResource.actions.copy')}
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </DialogContent>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        sx={{
          width: 'fit-content',
        }}
        TransitionComponent={Zoom}
        arrow="top-right"
      >
        <Stack>
          {KEYS.map((item) => (
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
                setValue('format', `${watchFormat}${watchFormat === '' ? '' : '|'}${item.value}`, {
                  shouldValidate: true,
                });
              }}
            >
              <Typography>{item.label}</Typography>
            </MenuItem>
          ))}
        </Stack>
      </CustomPopover>
    </Dialog>
  );
}

ExportResourceDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  profiles: PropTypes.array,
  mode: PropTypes.string,
};
