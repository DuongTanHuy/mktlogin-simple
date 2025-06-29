import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// assets
import { PasswordIcon } from 'src/assets/icons';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { forgotPasswordApi } from 'src/api/auth.api';
import { enqueueSnackbar } from 'notistack';
import { useLocales } from 'src/locales';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export default function JwtForgotPasswordView() {
  const { t } = useLocales();
  const router = useRouter();

  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().required(t('validate.required')).email(t('validate.email')),
  });

  const defaultValues = {
    email: '',
  };

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
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
        email: data.email,
      };
      await forgotPasswordApi(payload);
      // enqueueSnackbar(t('systemNotify.success.forgotPass'), { variant: 'success' });

      router.push(paths.auth.jwt.login);
      enqueueSnackbar(t('systemNotify.success.forgotPass'), {
        variant: 'success',
        duration: 10000,
      });
    } catch (error) {
      console.error(error);
      if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
      } else {
        enqueueSnackbar(error?.detail || t('systemNotify.error.forgotPass'), { variant: 'error' });
      }
    } finally {
      reset();
    }
  });

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFTextField name="email" label={t('forgotPassword.fields.email')} />

      <LoadingButton
        fullWidth
        size="large"
        color="primary"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{ pl: 2, pr: 1.5 }}
      >
        {t('forgotPassword.actions.submit')}
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
        {t('forgotPassword.actions.back')}
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <PasswordIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">{t('forgotPassword.header')}</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('forgotPassword.subheader')}
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
