import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// localstorage
import { setStorage } from 'src/hooks/use-local-storage';
import { useLocales } from 'src/locales';
import { isElectron } from 'src/utils/commom';
import { PASSWORD, USER } from 'src/utils/constance';

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { t } = useLocales();
  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required(t('validate.required')),
    password: Yup.string().required(t('validate.required')),
  });

  const defaultValues = {
    username: 'huy1005.dev@gmail.com',
    password: 'User123456@',
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
      const { username, password: pass } = data;

      if (username === 'huy1005.dev@gmail.com' && pass === 'User123456@') {
        localStorage.setItem(USER, JSON.stringify(username));
        localStorage.setItem(PASSWORD, JSON.stringify(pass));

        setStorage('ticket', JSON.stringify('ticket'));

        return router.push(`${paths.auth.jwt.otp}${returnTo ? `?returnTo=${returnTo}` : ''}`);
      }
      throw new Error('Invalid username or password');
    } catch (error) {
      if (error?.has_otp && error?.ticket) {
        setStorage('ticket', JSON.stringify(error?.ticket));

        return router.push(`${paths.auth.jwt.otp}${returnTo ? `?returnTo=${returnTo}` : ''}`);
      }
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
      return false;
    }
  });

  // const generateGoogleLoginUrl = () => {
  //   const url = new URL('https://accounts.google.com/o/oauth2/auth');
  //   url.searchParams.append('client_id', process.env.REACT_APP_CLIENT_ID);
  //   url.searchParams.append('redirect_uri', process.env.REACT_APP_REDIRECT_URI_LOGIN);
  //   url.searchParams.append('response_type', 'code');
  //   url.searchParams.append('scope', 'openid email profile');
  //   url.searchParams.append('access_type', 'offline');
  //   return url.href;
  // };

  const handleGoogleLogin = () => {};

  useEffect(() => {
    document.body.style.overflowY = 'auto';

    return () => {
      document.body.style.overflowY = 'hidden';
    };
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4" color="primary">
        {t('login.header')}
      </Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">{t('login.newUser.link')}</Typography>

        <Link component={RouterLink} href={paths.auth.jwt.register} variant="subtitle2">
          {t('login.newUser.action')}
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <RHFTextField name="username" label={t('login.fields.user')} />

      <RHFTextField
        name="password"
        label={t('login.fields.pass')}
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

      <Link
        component={RouterLink}
        href={paths.auth.jwt.forgot_password}
        variant="body2"
        color="inherit"
        underline="always"
        sx={{ alignSelf: 'flex-end' }}
      >
        {t('login.actions.forgotPass')}
      </Link>

      <Stack spacing={2}>
        <LoadingButton
          fullWidth
          color="primary"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          {t('login.actions.submit')}
        </LoadingButton>
        <Divider>{t('login.label.or')}</Divider>
        <Button
          variant="outlined"
          size="large"
          startIcon={<Iconify icon="flat-color-icons:google" width={24} />}
          onClick={handleGoogleLogin}
        >
          {t('login.alternateLogin.googleLogin')}
        </Button>
      </Stack>
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        color: 'text.secondary',
        mt: 2.5,
        typography: 'caption',
        textAlign: 'center',
      }}
    >
      {`${t('login.terms.condition')} `}
      <Link
        underline="always"
        rel="noopener noreferrer"
        color="text.primary"
        onClick={(event) => {
          if (isElectron()) {
            event.preventDefault();
            window.ipcRenderer.send('open-external', 'https://app.mktlogin.com/terms-of-service');
          }
        }}
        target="_blank"
        href="/terms-of-service"
      >
        {t('login.terms.termsOfService')}
      </Link>
      {` ${t('login.terms.and')} `}
      <Link
        underline="always"
        target="_blank"
        rel="noopener noreferrer"
        href="/privacy-policy"
        color="text.primary"
        onClick={(event) => {
          if (isElectron()) {
            event.preventDefault();
            window.ipcRenderer.send('open-external', 'https://app.mktlogin.com/privacy-policy');
          }
        }}
      >
        {t('login.terms.privacyPolicy')}
      </Link>
      .
    </Typography>
  );

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderHead}
        {renderForm}
      </FormProvider>
      {renderTerms}
    </>
  );
}
