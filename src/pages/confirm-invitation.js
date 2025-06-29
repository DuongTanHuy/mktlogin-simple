import { useEffect, useMemo, useRef, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Grid, Link, Skeleton, Stack, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { acceptInviteApi, denyInviteApi, getInviteDetailApi } from 'src/api/invite.api';
import { AuthGuard } from 'src/auth/guard';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import { removeStorage, setStorage } from 'src/hooks/use-local-storage';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import AuthClassicLayout from 'src/layouts/auth/classic';
import { useParams, useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';
import Label, { CustomLabel } from 'src/components/label';
import { NUM_ID_DISPLAY } from 'src/utils/constance';

const ConfirmInvitation = () => {
  const { authenticated, user, app_version } = useAuthContext();
  const { t } = useLocales();

  const { invite_code } = useParams();
  const searchParams = useSearchParams();
  const inviteType = searchParams.get('invite_type');
  const [idInvited, emailInvited] = useMemo(() => {
    try {
      return atob(invite_code).split(':');
    } catch (error) {
      return [null, null];
    }
  }, [invite_code]);
  const [inviteData, setInviteData] = useState(null);
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const [countDown, setCountDown] = useState(6);
  const timer = useRef();

  const listAuth =
    inviteData?.authorization_method === 'profile'
      ? inviteData?.authorization_profiles
      : inviteData?.authorization_groups ?? [];

  const router = useRouter();

  const [status, setStatus] = useState('action');
  const loading = useMultiBoolean({
    fetching: false,
    accept: false,
    deny: false,
  });

  const handleCountDown = () => {
    timer.current = setInterval(() => {
      setCountDown((prev) => {
        if (prev === 0) {
          removeStorage('invite_code');
          window.location.href = `/`;
          return prev;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAcceptInvite = async () => {
    try {
      if (idInvited) {
        await acceptInviteApi(idInvited);
        setStatus('accept');
        removeStorage('invite_code');
        if (inviteData?.meta?.workspace?.id) {
          window.location.href = `mktlogin://accept_invite/?workspace_id=${inviteData?.meta?.workspace?.id}`;
        }
      }
    } catch (error) {
      setStatus('warning');
    } finally {
      loading.onFalse('accept');
      handleCountDown();
    }
  };

  const handleDenyInvite = async () => {
    try {
      loading.onTrue('deny');
      if (idInvited) {
        await denyInviteApi(idInvited);
        setStatus('deny');
        removeStorage('invite_code');
      }
    } catch (error) {
      setStatus('warning');
    } finally {
      loading.onFalse('deny');
      handleCountDown();
    }
  };

  const renderAccept = (
    <>
      <Iconify icon="lets-icons:check-fill" width={60} color="primary.main" />
      <Typography variant="h3" color="text.primary">
        {t('inviteMember.response.accept')}
      </Typography>
      <Typography variant="body1" color="text.primary" align="center">
        {`${t('inviteMember.subheader')} `}
        <Typography component="span" color="primary">{`${countDown}s`}</Typography>
      </Typography>
    </>
  );

  const renderDeny = (
    <>
      <Iconify icon="ph:x-circle-fill" width={60} color="error.main" />
      <Typography variant="h3" color="text.primary">
        {t('inviteMember.response.reject')}
      </Typography>
      <Typography variant="body1" color="text.primary" align="center">
        {`${t('inviteMember.subheader')} `}
        <Typography component="span" color="primary">{`${countDown}s`}</Typography>
      </Typography>
    </>
  );

  const renderWarning = (
    <>
      <Iconify icon="ph:warning-fill" width={60} color="warning.main" />
      <Typography variant="h3" color="text.primary">
        {t('inviteMember.response.expired')}
      </Typography>
      <Typography variant="body1" color="text.primary" align="center">
        {`${t('inviteMember.subheader')} `}
        <Typography component="span" color="primary">{`${countDown}s`}</Typography>
      </Typography>
    </>
  );

  const renderAction = (
    <>
      <Typography variant="h5" color="text.primary" width={1} textAlign="left">
        {t('inviteMember.header')}
      </Typography>
      <Stack alignItems="flex-start" width={1} spacing={0.5}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography
            color="text.secondary"
            sx={{
              whiteSpace: 'nowrap',
            }}
          >
            {t('inviteMember.workspaceName')}:
          </Typography>
          {loading.value.fetching ? (
            <Skeleton
              component="span"
              sx={{
                display: 'inline-block',
                width: 100,
                height: 16,
                borderRadius: 0.5,
              }}
            />
          ) : (
            <>
              {inviteData?.meta?.workspace?.name && (
                <Typography color="primary">{inviteData?.meta?.workspace?.name}</Typography>
              )}
            </>
          )}
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography
            color="text.secondary"
            sx={{
              whiteSpace: 'nowrap',
            }}
          >
            {t('inviteMember.workspaceRole')}:
          </Typography>
          {loading.value.fetching ? (
            <Skeleton
              component="span"
              sx={{
                display: 'inline-block',
                width: 100,
                height: 16,
                borderRadius: 0.5,
              }}
            />
          ) : (
            <>
              {inviteData?.meta?.role && (
                <Typography color="primary">
                  {t(`dialog.member.invite.options.${inviteData?.meta?.role}`)}
                </Typography>
              )}
            </>
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexWrap: 'wrap',
          }}
        >
          <Typography color="text.secondary">
            {t(
              `inviteMember.${
                inviteData?.authorization_method === 'profile' ? 'listProfileAuth' : 'listGroupAuth'
              }`
            )}
            :
          </Typography>
          {loading.value.fetching ? (
            [...Array(3)].map((_, index) => (
              <Skeleton
                key={index}
                sx={{
                  width: 55,
                  height: 24,
                  borderRadius: 1,
                }}
              />
            ))
          ) : (
            <>
              {listAuth.slice(0, numItem).map((item) => (
                <Label key={item?.id} color="primary">
                  {item?.name}
                </Label>
              ))}
              {listAuth.length > 14 && (
                <CustomLabel
                  length={listAuth.length}
                  numItem={numItem}
                  setNumItem={setNumItem}
                  sx={{
                    py: '6px',
                  }}
                  title={
                    inviteData?.authorization_method === 'profile'
                      ? t('inviteMember.profiles')
                      : t('inviteMember.groups')
                  }
                />
              )}
            </>
          )}
        </Stack>
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <LoadingButton
            loading={loading.value.accept}
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<Iconify icon="lets-icons:check-fill" />}
            onClick={handleAcceptInvite}
          >
            {t('inviteMember.actions.accept')}
          </LoadingButton>
        </Grid>
        <Grid item xs={12} md={6}>
          <LoadingButton
            loading={loading.value.deny}
            variant="contained"
            color="error"
            fullWidth
            startIcon={<Iconify icon="ph:x-circle-fill" />}
            onClick={handleDenyInvite}
          >
            {t('inviteMember.actions.reject')}
          </LoadingButton>
        </Grid>
      </Grid>
    </>
  );

  useEffect(() => () => clearInterval(timer.current), []);

  useEffect(() => {
    try {
      if (authenticated && emailInvited !== user?.email) {
        router.push('/404');
      }
    } catch (error) {
      /* empty */
    }
  }, [authenticated, emailInvited, router, user?.email]);

  useEffect(() => {
    const fetchInviteData = async () => {
      try {
        loading.onTrue('fetching');
        const response = await getInviteDetailApi(idInvited);
        setInviteData(response?.data);
      } catch (error) {
        setInviteData(null);
      } finally {
        loading.onFalse('fetching');
      }
    };

    if (idInvited && authenticated) {
      fetchInviteData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, idInvited]);

  if (inviteType === 'initial_email' && emailInvited) {
    setStorage('invite_code', invite_code);
    window.location.href = `${paths.auth.jwt.register}?email-invited=${emailInvited}`;
    return null;
  }

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>
      <AuthGuard>
        <AuthClassicLayout
          sx={{
            p: 3,
            width: { xs: 1, md: 550 },
          }}
        >
          <Stack spacing={3} alignItems="center">
            {status === 'action' && renderAction}
            {status === 'accept' && renderAccept}
            {status === 'deny' && renderDeny}
            {status === 'warning' && renderWarning}
            <Link
              onClick={() => {
                removeStorage('invite_code');
                router.push('/');
              }}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Iconify icon="ion:chevron-back" width={16} />
              <Typography variant="overline">{t('inviteMember.actions.back')}</Typography>
            </Link>
          </Stack>
        </AuthClassicLayout>
      </AuthGuard>
    </>
  );
};

export default ConfirmInvitation;
