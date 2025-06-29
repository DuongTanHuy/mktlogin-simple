import React from 'react';
import {
  Avatar,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import Logo from 'src/components/logo';
import { useRouter } from 'src/routes/hooks';
import { acceptOauthApi, deniedOauthApi } from 'src/api/auth.api';
import { useLocales } from 'src/locales';
import { enqueueSnackbar } from 'notistack';

export default function AuthenticateView() {
  const { t } = useLocales();
  const router = useRouter();
  const username = sessionStorage.getItem('username');
  const ticket = sessionStorage.getItem('ticket');
  const localeLanguage = localStorage.getItem('i18nextLng');

  if (!ticket || !username) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  const handleAccept = async () => {
    try {
      const response = await acceptOauthApi({
        ticket,
      });
      const targetOrigin = process.env.REACT_APP_REDIRECT_OAUTH;
      window.opener.postMessage({ token: response?.data?.access_token }, targetOrigin);
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('ticket');
      window.close();
    } catch (error) {
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('ticket');
      enqueueSnackbar(t('validate.authFailed'), { variant: 'error' });
      router.back();
    }
  };

  const handleDenied = async () => {
    try {
      await deniedOauthApi({
        ticket,
      });
    } catch (error) {
      /* empty */
    } finally {
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('ticket');
      router.back();
    }
  };

  return (
    <>
      <CardHeader
        title={
          <Stack pt={1}>
            <Stack direction="row" spacing={3} justifyContent="flex-start" alignItems="center">
              <Logo
                sx={{
                  width: 30,
                  height: 30,
                  '& svg': {
                    flexShrink: 0,
                  },
                }}
                hasSubLogo={false}
              />
              <Typography color="text.secondary">{t('oauth_login.subTitle')}</Typography>
            </Stack>
            <Divider />
          </Stack>
        }
        sx={{
          p: 0,
        }}
      />
      <CardContent>
        <Stack
          width={1}
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Stack width={{ xs: 1, md: 0.5 }} spacing={{ xs: 0, md: 2 }} alignItems="start">
            <Typography variant="h2" fontWeight={500} textAlign="left">
              {t('oauth_login.title')}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center" py={{ xs: 1, md: 0 }}>
              <Avatar
                src=""
                alt="avatar"
                sx={{
                  width: 26,
                  height: 26,
                  border: (theme) => `solid 2px ${theme.palette.background.default}`,
                  fontSize: 12,
                }}
              >
                {(username || 'an').charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="button">{username}</Typography>
            </Stack>
          </Stack>

          <Stack pl={{ xs: 0, md: 1.5 }} width={{ xs: 1, md: 0.5 }} spacing={2}>
            <Typography
              textAlign="left"
              variant="subtitle1"
              color="text.secondary"
              lineHeight={1.6}
            >
              {t('oauth_login.sentence1')}
              <Link
                underline="always"
                target="_blank"
                rel="noopener noreferrer"
                href="/terms-of-service"
                color="primary"
              >
                {t('login.terms.termsOfService')}
              </Link>
              {` ${t('login.terms.and')} `}
              <Link
                underline="always"
                target="_blank"
                rel="noopener noreferrer"
                href="/privacy-policy"
                color="primary"
              >
                {t('login.terms.privacyPolicy')}
              </Link>
              {localeLanguage === 'vi' && t('oauth_login.sentence2')}
            </Typography>
          </Stack>
        </Stack>

        <Stack width={1} direction="row" spacing={2} mt={3}>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: 12,
            }}
            onClick={handleDenied}
          >
            {t('oauth_login.actions.cancel')}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: 12,
            }}
            onClick={handleAccept}
          >
            {t('oauth_login.actions.continue')}
          </Button>
        </Stack>
      </CardContent>
    </>
  );
}
