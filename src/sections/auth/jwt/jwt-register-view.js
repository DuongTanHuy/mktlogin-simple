import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
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
import { Button, Divider } from '@mui/material';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFCheckbox, RHFTextField } from 'src/components/hook-form';
import { useLocales } from 'src/locales';
import { REFERER_CODE } from '../../../utils/constance';

// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useLocales();
  const { register } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailInvited = searchParams.get('email-invited');
  const referralCode = searchParams.get('referer') || localStorage.getItem(REFERER_CODE) || '';
  const [errorMsg, setErrorMsg] = useState('');
  const password = useBoolean();
  const rePassword = useBoolean();

  localStorage.setItem(REFERER_CODE, referralCode);

  const RegisterSchema = Yup.object().shape({
    username: Yup.string().required(t('validate.required')).max(20, t('validate.username')),
    email: Yup.string().required(t('validate.required')).email(t('validate.email')),
    password: Yup.string()
      .required(t('validate.required'))
      .min(10, t('validate.password.min'))
      .matches(/(?=.*?[A-Z])/, t('validate.password.uppercase'))
      .matches(/(?=.*?[a-z])/, t('validate.password.lowercase'))
      .matches(/(?=.*?[0-9])/, t('validate.password.number'))
      .matches(/(?=.*?[#?!@$%^&*-])/, t('validate.password.special')),
    rePassword: Yup.string()
      .required(t('validate.required'))
      .oneOf([Yup.ref('password'), null], t('validate.password.match')),
    ref_code: Yup.string(),
    terms: Yup.boolean().oneOf([true], t('validate.term')),
  });

  const defaultValues = {
    username: '',
    email: emailInvited || '',
    password: '',
    rePassword: '',
    ref_code: referralCode || '',
    terms: false,
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  useEffect(() => {
    document.body.style.overflowY = 'auto';

    return () => {
      document.body.style.overflowY = 'hidden';
    };
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setError,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await register?.(data.username, data.email, data.password, '', data.ref_code);
      enqueueSnackbar(t('systemNotify.success.register'), {
        variant: 'success',
        autoHideDuration: 3000,
      });

      router.push(paths.auth.jwt.login);
    } catch (error) {
      if (error?.error_fields) {
        Object.keys(error?.error_fields).forEach((key) => {
          console.log(key);
          setError(key, {
            type: 'manual',
            message: t(`formError.register.${key}.${error?.error_fields[key][0]}`),
          });
        });
      } else {
        setErrorMsg(t('validate.someThingWentWrong'));
      }
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h4" color="primary">
        {t('register.header')}
      </Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2"> {t('register.existingUser.question')} </Typography>

        <Link href={paths.auth.jwt.login} component={RouterLink} variant="subtitle2">
          {t('register.existingUser.signIn')}
        </Link>
      </Stack>
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        color: 'text.secondary',
        typography: 'caption',
        textAlign: 'start',
      }}
    >
      {`${t('register.terms.condition')} `}
      <Link
        underline="always"
        target="_blank"
        rel="noopener noreferrer"
        href="/terms-of-service"
        color="text.primary"
      >
        {t('register.terms.termsOfService')}
      </Link>
      {` ${t('register.terms.and')} `}
      <Link
        underline="always"
        target="_blank"
        rel="noopener noreferrer"
        href="/privacy-policy"
        color="text.primary"
      >
        {t('register.terms.privacyPolicy')}
      </Link>
      .
    </Typography>
  );

  const renderForm = (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <RHFTextField name="username" label={t('register.fields.user')} />
        <RHFTextField name="email" label={t('register.fields.email')} />

        <RHFTextField
          name="password"
          label={t('register.fields.pass')}
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
          name="rePassword"
          label={t('register.fields.passRepeat')}
          type={rePassword.value ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={rePassword.onToggle} edge="end">
                  <Iconify icon={rePassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <RHFTextField name="ref_code" label={t('register.fields.code')} />

        <Stack spacing={1} alignItems="start">
          <RHFCheckbox name="terms" label={renderTerms} />

          <LoadingButton
            fullWidth
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {t('register.actions.create')}
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );

  const renderAnotherLogin = (
    <Stack mt={2} spacing={2}>
      <Divider>{t('register.label.or')}</Divider>
      <Button
        variant="outlined"
        size="large"
        startIcon={<Iconify icon="flat-color-icons:google" width={24} />}
      >
        {t('register.actions.googleLogin')}
      </Button>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {renderForm}

      {renderAnotherLogin}
    </>
  );
}
