import { Container, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
import Logo from 'src/components/logo';
import { useLocales } from 'src/locales';
// sections

// ----------------------------------------------------------------------

export default function LoginGooglePage() {
  const { app_version } = useAuthContext();
  const [reRender, setReRender] = useState(1);
  const { t } = useLocales();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const ref_code = urlParams.get('ref_code');
    window.location.href = `mktlogin://auth?code=${code}&ref_code=${ref_code}`;
  }, [reRender]);

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <Container
        sx={{
          height: 1,
          pb: 1,
          userSelect: 'none',
        }}
      >
        <Stack height={1} alignItems="center" justifyContent="center">
          <Logo
            disabledLink
            sx={{
              width: 240,
              height: 60,
              '& svg': {
                width: 240,
                height: 60,
                flexShrink: 0,
              },
            }}
            // hasSubLogo={false}
          />

          <Typography fontWeight={400}>{t('oauth_login.redirect')}</Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 3,
              textDecoration: 'underline',
              cursor: 'pointer',
              transition: 'all .2s',
              '&:hover': { color: 'primary.main' },
            }}
            onClick={() => setReRender((prev) => prev + 1)}
          >
            {t('oauth_login.actions.redirect')}
          </Typography>
        </Stack>
      </Container>
    </>
  );
}
