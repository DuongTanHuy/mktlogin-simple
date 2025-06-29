import React, { useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { yupResolver } from '@hookform/resolvers/yup';
import { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import FormProvider from 'src/components/hook-form/form-provider';
import { oauthGoogleLoginApi, oauthLoginApi } from 'src/api/auth.api';
import { useLocales } from 'src/locales';
import { useGoogleLogin } from '@react-oauth/google';

export default function OauthLoginView() {
  const router = useRouter();
  const { t } = useLocales();

  const [errorMsg, setErrorMsg] = useState('');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required(t('validate.required')),
    password: Yup.string().required(t('validate.required')),
  });

  const defaultValues = {
    username: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (tokenResponse?.access_token) {
        try {
          const payload = {
            access_token: tokenResponse.access_token,
          };
          const response = await oauthGoogleLoginApi(payload);
          const targetOrigin = process.env.REACT_APP_REDIRECT_OAUTH;
          window.opener.postMessage({ token: response?.data?.access_token }, targetOrigin);
          window.close();
        } catch (error) {
          console.log(typeof error === 'string' ? error : error.message);
        }
      }
    },
    onError: (errorResponse) => console.log(errorResponse),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        username: data.username,
        password: data.password,
      };
      const response = await oauthLoginApi(payload);
      if (response?.data?.is_authorized) {
        const targetOrigin = process.env.REACT_APP_REDIRECT_OAUTH;
        window.opener.postMessage({ token: response?.data?.access_token }, targetOrigin);
        window.close();
      } else {
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('ticket', response?.data?.ticket);
        router.push(paths.auth.oauth.permission);
      }
    } catch (error) {
      setErrorMsg(t('validate.invalidAccount'));
      return false;
    }
    return false;
  });

  const renderHead = (
    <Stack
      spacing={2}
      sx={{
        ...(!errorMsg && {
          mb: 5,
        }),
      }}
    >
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
      {!!errorMsg && (
        <Alert
          severity="error"
          sx={{
            mt: 1,
          }}
        >
          {errorMsg}
        </Alert>
      )}
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
          onClick={googleLogin}
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
        target="_blank"
        rel="noopener noreferrer"
        href="/terms-of-service"
        color="text.primary"
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
