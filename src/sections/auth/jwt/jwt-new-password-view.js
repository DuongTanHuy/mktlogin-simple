import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// assets
import { SentIcon } from 'src/assets/icons';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'src/routes/hooks';
import { checkResetTokenApi, passwordResetApi } from 'src/api/auth.api';
import { enqueueSnackbar } from 'notistack';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function JwtNewPasswordView() {
  const router = useRouter();
  const password = useBoolean();
  const confirmPassword = useBoolean();
  const { token } = useParams();
  const { t } = useLocales();

  const NewPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .required(t('validate.required'))
      .min(10, t('validate.password.min'))
      .matches(/(?=.*?[A-Z])/, t('validate.password.uppercase'))
      .matches(/(?=.*?[a-z])/, t('validate.password.lowercase'))
      .matches(/(?=.*?[0-9])/, t('validate.password.number'))
      .matches(/(?=.*?[#?!@$%^&*-])/, t('validate.password.special')),
    confirmPassword: Yup.string()
      .required(t('validate.required'))
      .oneOf([Yup.ref('password')], t('validate.password.match')),
  });

  const defaultValues = {
    password: '',
    confirmPassword: '',
  };

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(NewPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        reset_token: token,
        new_password: data.password,
      };

      await passwordResetApi(payload);
      enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
      router.push(paths.auth.jwt.login);
    } catch (error) {
      console.error(error);
      if (error?.error_code === ERROR_CODE.INVALID_RESET_PASSWORD_TOKEN) {
        enqueueSnackbar(error.message, { variant: 'error' });
      } else {
        enqueueSnackbar(t('systemNotify.error.update'), {
          variant: 'error',
          autoHideDuration: 8000,
        });
      }
    } finally {
      reset();
    }
  });

  const check = useCallback(async () => {
    if (token) {
      try {
        const payload = {
          reset_token: token,
        };
        const response = await checkResetTokenApi(payload);
        if (!response?.data?.status) {
          router.push('/');
        }
      } catch (error) {
        /* empty */
      }
    }
  }, [router, token]);

  useEffect(() => {
    check();
  }, [check]);

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFTextField
        name="password"
        label={t('newPassword.fields.pass')}
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
      />

      <RHFTextField
        name="confirmPassword"
        label={t('newPassword.fields.passConfirm')}
        type={confirmPassword.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={confirmPassword.onToggle} edge="end">
                <Iconify
                  icon={confirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="primary"
        loading={isSubmitting}
      >
        {t('newPassword.actions.submit')}
      </LoadingButton>

      <Link
        component={RouterLink}
        href={paths.auth.jwt.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        {t('newPassword.actions.back')}
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <SentIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">{t('newPassword.header')}</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('newPassword.subheader')}
        </Typography>
      </Stack>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
