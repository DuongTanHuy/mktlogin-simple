import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';

// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { changePasswordApi } from 'src/api/user.api';
import { formatErrors } from 'src/utils/format-errors';
import { Button, Dialog, DialogContent, DialogTitle, Divider } from '@mui/material';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function AccountChangePasswordDialog({ open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useLocales();

  const password = useBoolean();

  const ChangePassWordSchema = Yup.object().shape({
    old_password: Yup.string().required(t('validate.required')),
    new_password: Yup.string()
      .required(t('validate.required'))
      .min(10, t('validate.password.min'))
      .matches(/(?=.*?[A-Z])/, t('validate.password.uppercase'))
      .matches(/(?=.*?[a-z])/, t('validate.password.lowercase'))
      .matches(/(?=.*?[0-9])/, t('validate.password.number'))
      .matches(/(?=.*?[#?!@$%^&*-])/, t('validate.password.special')),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('new_password')], t('validate.password.match')),
  });

  const defaultValues = {
    user_name: 'current user',
    old_password: '',
    new_password: '',
    confirmNewPassword: '',
  };

  const methods = useForm({
    resolver: yupResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        old_password: data.old_password,
        new_password: data.new_password,
      };
      await changePasswordApi(payload);
      reset();
      enqueueSnackbar(t('systemNotify.success.change'));
    } catch (error) {
      console.error(error);
      if (error?.error_code === ERROR_CODE.PASSWORD_INCORRECT) {
        setError('old_password', {
          type: 'manual',
          message: t('validate.wrongOldPassword'),
        });
      }
      if (error?.error_fields) {
        formatErrors(error.error_fields, setError);
      }
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

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
        {t('accSetting.tabs.security.header')}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3} sx={{ py: 3 }}>
            <RHFTextField
              name="user_name"
              sx={{
                display: 'none',
              }}
            />
            <RHFTextField
              name="old_password"
              type={password.value ? 'text' : 'password'}
              label={t('accSetting.tabs.security.fields.oldPassword')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={password.onToggle} edge="end">
                      <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <RHFTextField
              name="new_password"
              label={t('accSetting.tabs.security.fields.newPassword')}
              type={password.value ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={password.onToggle} edge="end">
                      <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText={
                <Stack component="span" direction="row" alignItems="center">
                  <Iconify icon="eva:info-fill" width={16} sx={{ mr: 0.5 }} />{' '}
                  {t('accSetting.tabs.security.subheader')}
                </Stack>
              }
            />

            <RHFTextField
              name="confirmNewPassword"
              type={password.value ? 'text' : 'password'}
              label={t('accSetting.tabs.security.fields.confirmPassword')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={password.onToggle} edge="end">
                      <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
              <Button onClick={handleClose} variant="contained">
                {t('accSetting.tabs.security.actions.cancel')}
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                {t('accSetting.tabs.security.actions.save')}
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

AccountChangePasswordDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
