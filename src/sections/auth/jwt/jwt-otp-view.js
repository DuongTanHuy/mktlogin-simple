import { useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
// import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import FormProvider, { RHFTextField } from 'src/components/hook-form';

// auth
import { useAuthContext } from 'src/auth/hooks';
// routes
import { RouterLink } from 'src/routes/components';

// localstorage
import { getStorage } from 'src/hooks/use-local-storage';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { enqueueSnackbar } from 'notistack';
import Iconify from 'src/components/iconify';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function JwtOtpView() {
  const { loginOtp } = useAuthContext();
  const ticket = getStorage('ticket');
  const { t } = useLocales();
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const LoginSchema = Yup.object().shape({
    otp: Yup.string().required(t('validate.required')),
  });

  const defaultValues = {
    otp: '123456',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await loginOtp?.(data.otp, JSON.parse(ticket));
    } catch (error) {
      reset();
      if (error?.error_code === ERROR_CODE.INVALID_AUTH_TICKET) {
        router.push(paths.auth.jwt.login);
        enqueueSnackbar(t('systemNotify.warning.invalidCode'), {
          variant: 'error',
        });
      } else if (error?.error_code === ERROR_CODE.INVALID_OTP_CODE) {
        reset();
        setErrorMsg(t('systemNotify.error.invalidOtpCode'));
      } else {
        setErrorMsg(typeof error === 'string' ? error : error.message);
      }
    }
  });

  const handleResendOtp = async () => {
    try {
      const payload = {
        ticket: JSON.parse(ticket),
      };
      await axiosInstance.post(endpoints.auth.resend_otp, payload);
      enqueueSnackbar(t('systemNotify.success.send'));
    } catch (error) {
      if (error?.availableIn) {
        enqueueSnackbar(`${t('systemNotify.warning.limitRequest')} ${error.availableIn}!`, {
          variant: 'error',
        });
      } else if (error?.error_code === ERROR_CODE.INVALID_AUTH_TICKET) {
        enqueueSnackbar(t('systemNotify.warning.invalidCode'), {
          variant: 'error',
        });
      }
    }
  };

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4" color="primary">
        {t('otpVerify.header')}
      </Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">{t('otpVerify.label.question')}</Typography>

        <Link component={RouterLink} href="#" variant="subtitle2" onClick={handleResendOtp}>
          {t('otpVerify.actions.reSend')}
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack>
      <Stack spacing={2.5}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        <RHFTextField name="otp" label={t('otpVerify.fields.otp')} />
        <LoadingButton
          fullWidth
          color="primary"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          {t('otpVerify.actions.submit')}
        </LoadingButton>
      </Stack>
      <Link
        href={paths.auth.jwt.login}
        sx={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          transform: 'translateY(100%)',
        }}
        color="inherit"
      >
        <Iconify icon="ion:chevron-back" width={16} />
        <Typography variant="overline">{t('otpVerify.actions.back')}</Typography>
      </Link>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}
      {renderForm}
    </FormProvider>
  );
}
