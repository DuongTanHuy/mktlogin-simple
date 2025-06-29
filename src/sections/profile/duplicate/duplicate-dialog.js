import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';

// components
import FormProvider, { RHFMultiCheckbox, RHFSelect, RHFTextField } from 'src/components/hook-form';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { duplicateProfileApi } from 'src/api/profile.api';
import { enqueueSnackbar } from 'notistack';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';

const DuplicateDialog = ({
  open,
  onClose,
  id,
  name,
  workspaceId,
  handleResetData,
  handleReloadBalance,
}) => {
  const { t } = useLocales();

  const KEEP_PARAMS_OPTIONS = [
    {
      value: 'profile_group',
      label: (
        <Tooltip title={t('dialog.duplicateProfile.tooltip.groupProfile')} arrow placement="top">
          <span>{t('dialog.duplicateProfile.options.params.groupProfile')}</span>
        </Tooltip>
      ),
    },
    {
      value: 'bookmarks',
      label: (
        <Tooltip title={t('dialog.duplicateProfile.tooltip.bookmark')} arrow placement="top">
          <span>{t('dialog.duplicateProfile.options.params.bookmark')}</span>
        </Tooltip>
      ),
    },
    {
      value: 'timezone',
      label: (
        <Tooltip title={t('dialog.duplicateProfile.tooltip.timezone')} arrow placement="top">
          <span>{t('dialog.duplicateProfile.options.params.timezone')}</span>
        </Tooltip>
      ),
    },
    {
      value: 'location',
      label: (
        <Tooltip title={t('dialog.duplicateProfile.tooltip.location')} arrow placement="top">
          <span>{t('dialog.duplicateProfile.options.params.location')}</span>
        </Tooltip>
      ),
    },
    {
      value: 'user_agent',
      label: (
        <Tooltip title={t('dialog.duplicateProfile.tooltip.userAgent')} arrow placement="top">
          <span>{t('dialog.duplicateProfile.options.params.userAgent')}</span>
        </Tooltip>
      ),
    },
    {
      value: 'proxy',
      label: (
        <Tooltip title={t('dialog.duplicateProfile.tooltip.proxy')} arrow placement="top">
          <span>{t('dialog.duplicateProfile.options.params.proxy')}</span>
        </Tooltip>
      ),
    },
  ];

  const INSERT_MODE_OPTIONS = [
    { value: 1, label: t('dialog.duplicateProfile.options.insertMode.noRepeat') },
    { value: 2, label: t('dialog.duplicateProfile.options.insertMode.repeat') },
    { value: 3, label: t('dialog.duplicateProfile.options.insertMode.oneForAll') },
  ];

  const DuplicateSchema = Yup.object().shape({
    quantity: Yup.number()
      .integer(t('validate.quantity.integer'))
      .min(1, t('validate.quantity.min')),
  });

  const defaultValues = {
    quantity: 1,
    keep_params: [],
    proxy_insert_mode: -1,
    proxies: [],
  };

  const methods = useForm({
    resolver: yupResolver(DuplicateSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setError,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const watchQuantity = watch('quantity');
  const watchProxyInsertMode = watch('proxy_insert_mode');
  const watchKeepParams = watch('keep_params');

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const invalidProxies = [];
      const { quantity, keep_params, proxy_insert_mode, proxies } = data;

      const isValidFormat = (str) => {
        const regex = /^(http|https|socks4|socks5):([^:\s]+):([^:\s]+):([^:\s]+):([^:\s]+)$/;
        const match = str.match(regex);
        return match && ['http', 'socks4', 'socks5'].includes(match[1]);
      };

      const finalProxies =
        proxies.length > 0
          ? proxies.split('\n').reduce((validProxies, proxy) => {
              const trimmedProxy = proxy.trim();
              if (trimmedProxy?.length === 0) {
                return validProxies;
              }

              if (!isValidFormat(trimmedProxy)) {
                invalidProxies.push(trimmedProxy);
              } else {
                validProxies.push(trimmedProxy);
              }
              return validProxies;
            }, [])
          : [];

      if (invalidProxies.length > 0) {
        setError('proxies', {
          type: 'manual',
          message: `${t('validate.invalidProxy')}: ${invalidProxies.join(', ')}`,
        });
        return false;
      }

      const payload = {
        profile_id: id,
        quantity,
        keep_params,
        ...(!keep_params.includes('proxy') &&
          proxy_insert_mode !== -1 && {
            proxy_insert_mode,
            proxies: finalProxies,
          }),
      };
      await duplicateProfileApi(workspaceId, payload);
      handleResetData();
      handleClose();
      enqueueSnackbar(t('systemNotify.success.duplicate'), { variant: 'success' });
      handleReloadBalance();
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.duplicate'), {
          variant: 'error',
        });
        reset();
        onClose();
      } else if (error?.error_code === ERROR_CODE.INSUFFICIENT_PROFILE_BALANCE) {
        enqueueSnackbar(t('systemNotify.warning.notEnoughProfileBalance'), { variant: 'error' });
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
      <DialogTitle sx={{ pb: 2 }}>{t('dialog.duplicateProfile.header')}</DialogTitle>

      <DialogContent sx={{ typography: 'body2' }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Typography variant="body1">
              {`${t('dialog.duplicateProfile.header')}: `}
              <Typography component="span" color="primary" variant="subtitle1">
                {name}
              </Typography>
            </Typography>
            <RHFTextField
              name="quantity"
              type="number"
              label={t('dialog.duplicateProfile.labels.quantity')}
            />
            <RHFMultiCheckbox
              row
              name="keep_params"
              label={t('dialog.duplicateProfile.labels.keepPar')}
              options={KEEP_PARAMS_OPTIONS}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 0.3fr)',
              }}
            />
            {!watchKeepParams.includes('proxy') && (
              <>
                <RHFSelect
                  name="proxy_insert_mode"
                  label={t('dialog.duplicateProfile.labels.insertMode')}
                >
                  <MenuItem value={-1}>
                    {t('dialog.duplicateProfile.options.insertMode.dontInsert')}
                  </MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {INSERT_MODE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                {watchProxyInsertMode !== -1 && (
                  <RHFTextField
                    name="proxies"
                    label="Proxies (per proxy per row)"
                    placeholder="proxy_type:host:post:user:pass&#10;Example:&#10;http:192.1.1.201:9588:username:password&#10;https:192.1.1.201:9588:username:password&#10;socks4:192.1.1.201:9588:username:password&#10;socks5:192.1.1.201:9588:username:password&#10;"
                    multiline
                    rows={6}
                  />
                )}
              </>
            )}
            <Typography>
              {`${t('dialog.duplicateProfile.totalCost')}: `}
              <Typography component="span" color="primary">
                {watchQuantity}
              </Typography>
              {` (${t('dialog.duplicateProfile.profileBalance')})`}
            </Typography>
            <Stack direction="row" pb={3} justifyContent="end" spacing={2}>
              <Button variant="contained" color="inherit" onClick={handleClose}>
                {t('dialog.duplicateProfile.actions.cancel')}
              </Button>

              <LoadingButton
                loading={isSubmitting}
                variant="contained"
                color="primary"
                type="submit"
              >
                {t('dialog.duplicateProfile.actions.duplicate')}
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateDialog;

DuplicateDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReloadBalance: PropTypes.func,
  id: PropTypes.number,
  name: PropTypes.string,
  workspaceId: PropTypes.string.isRequired,
  handleResetData: PropTypes.func.isRequired,
};
