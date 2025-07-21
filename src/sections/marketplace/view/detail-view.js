import PropTypes from 'prop-types';
// mui
import {
  Box,
  Button,
  Container,
  Divider,
  Fab,
  Stack,
  Tab,
  Tabs,
  Typography,
  Zoom,
  alpha,
} from '@mui/material';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { useRouter } from 'src/routes/hooks';
import { fCurrencyVND } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';

import { useLocales } from 'src/locales';
import { downloadPublicWorkflowApi } from '../../../api/publish-workflow.api';
import { useAuthContext } from '../../../auth/hooks';
import { useMultiBoolean } from '../../../hooks/use-multiple-boolean';
import { useBalanceContext } from '../../../account-balance/context/balance-context';
import { updateNewVersion } from '../../../api/workflow.api';
import { ERROR_CODE } from '../../../utils/constance';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'readme',
    label: 'Read Me',
  },
  {
    value: 'changelog',
    label: 'Changelog',
  },
];

const LazyEditor = lazy(() => import('src/components/editor'));

// ----------------------------------------------------------------------

export default function MarketplaceDetailView({ currentData, reloadWorkflowData }) {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('readme');
  const scrollRef = useRef(null);
  const [show, setShow] = useState(false);
  const { workspace_id } = useAuthContext();
  const btnLoading = useMultiBoolean({
    download: false,
    update: false,
  });
  const { updateRefreshBalance } = useBalanceContext();
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleChangeTab = (_, newValue) => {
    setCurrentTab(newValue);
  };

  const handleScroll = useCallback(() => {
    if (scrollRef.current.scrollTop > 500) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, []);

  useEffect(() => {
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  const handleDownloadWorkflow = async () => {
    let has_refresh_balance = false;
    try {
      if (!currentData?.id) {
        throw new Error('Invalid data');
      }

      if (currentData.usage_fee > 0) {
        const isConfirm = window.confirm(
          `${t('marketplace.notify.subtracted.sentence1')} ${fCurrencyVND(
            currentData.usage_fee
          )} ${t('marketplace.notify.subtracted.sentence2')}`
        );
        if (!isConfirm) return;
        has_refresh_balance = true;
      }

      btnLoading.onTrue('download');
      await downloadPublicWorkflowApi(currentData.id, { workspace_id });

      enqueueSnackbar(t('marketplace.notify.download.success'), { variant: 'success' });

      if (has_refresh_balance) {
        updateRefreshBalance();
      }
      reloadWorkflowData();
      setIsDownloaded(true);
    } catch (error) {
      console.error(error.status);
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.workflow.download'), {
          variant: 'error',
        });
      } else if (error?.error_code === ERROR_CODE.INSUFFICIENT_BALANCE) {
        enqueueSnackbar(t('marketplace.notify.insufficient'), { variant: 'error' });
      } else {
        enqueueSnackbar(error?.message || t('marketplace.notify.download.error'), {
          variant: 'error',
        });
      }
    } finally {
      btnLoading.onFalse('download');
    }
  };

  const handleUpdateWorkflow = async () => {
    try {
      btnLoading.onTrue('update');
      await updateNewVersion(workspace_id, currentData?.downloaded_workflow);
      btnLoading.onFalse('update');
      enqueueSnackbar(t('marketplace.notify.update.success'), { variant: 'success' });
      reloadWorkflowData();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(t('marketplace.notify.update.error'), { variant: 'error' });
      btnLoading.onFalse('update');
    }
  };

  useEffect(() => {
    if (currentData?.is_downloaded) {
      setIsDownloaded(true);
    } else {
      setIsDownloaded(false);
    }
  }, [currentData?.is_downloaded]);

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        height: 'calc(100% - 24px)',
        px: '0px!important',
      }}
    >
      <Scrollbar
        ref={scrollRef}
        sxRoot={{
          overflow: 'unset',
        }}
        sx={{
          height: 1,
          pb: 3,
          '& .simplebar-track.simplebar-vertical': {
            position: 'absolute',
            right: -16,
            pointerEvents: 'auto',
          },
        }}
      >
        <Stack spacing={2}>
          <Button
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            onClick={router.back}
            size="small"
            sx={{
              maxWidth: 'fit-content',
            }}
            variant="outlined"
          >
            {t('marketplace.actions.back')}
          </Button>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'end', md: 'start' }}
          >
            <Stack
              direction="row"
              spacing={3}
              width={{
                xs: 1,
                md: 0.6,
              }}
            >
              <Box
                sx={{
                  height: 160,
                  width: 160,
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <Image
                  alt={currentData?.avatar_name}
                  src={currentData?.avatar_url}
                  sx={{
                    height: 1,
                    borderRadius: 1.5,
                    '&.component-image': {
                      width: 1,
                    },
                  }}
                />
              </Box>
              <Stack spacing={1}>
                <Typography variant="h4" textTransform="capitalize">
                  {currentData?.name}{' '}
                  <Label>{`V${
                    currentData?.public_workflow_versions &&
                    currentData?.public_workflow_versions[0].name
                  }`}</Label>
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.disabled" textTransform="capitalize">
                    {currentData?.publish_user?.username}
                  </Typography>
                  <Divider orientation="vertical" />
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      typography: 'body2',
                      color: 'text.disabled',
                    }}
                  >
                    <Iconify icon="material-symbols:download-sharp" width={16} sx={{ mr: 0.5 }} />
                    {currentData?.count_of_downloads || 0}
                  </Stack>
                  <Divider orientation="vertical" />
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      typography: 'body2',
                      color: 'text.disabled',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Iconify icon="mingcute:time-fill" width={16} sx={{ mr: 0.5 }} />
                    {`${t('marketplace.postDate')} ${fDate(
                      currentData?.created_at,
                      'dd/MM/yyyy H:mm'
                    )}`}
                  </Stack>
                  <Divider orientation="vertical" />
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      typography: 'body2',
                      color: 'text.disabled',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Iconify icon="ic:baseline-system-update" width={16} sx={{ mr: 0.5 }} />
                    {`${t('marketplace.lastUpdate')} ${fDate(
                      currentData?.public_workflow_versions?.[0].created_at,
                      'dd/MM/yyyy H:mm'
                    )}`}
                  </Stack>
                </Stack>
                <Typography variant="button" color="text.secondary">
                  {currentData?.description}
                </Typography>
              </Stack>
            </Stack>
            <Stack spacing={2} alignItems="end">
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="ic:round-report-problem" width={16} />}
                  sx={{
                    borderRadius: '4px',
                    color: 'text.secondary',
                    typography: 'caption',
                  }}
                >
                  {t('marketplace.actions.report')}
                </Button>
                {!isDownloaded && (
                  <LoadingButton
                    loading={btnLoading.value.download}
                    startIcon={<Iconify icon="solar:play-circle-bold" width={16} />}
                    variant="contained"
                    size="small"
                    sx={{
                      borderRadius: '4px',
                      boxShadow: (theme) => theme.customShadows.z8,
                      bgcolor: (theme) => theme.palette.grey[600],
                      color: 'white',
                      px: 1,
                      py: 0,
                      typography: 'caption',
                      '&:hover': {
                        bgcolor: (theme) => theme.palette.grey[700],
                        boxShadow: 'none',
                      },
                    }}
                    onClick={handleDownloadWorkflow}
                  >
                    {t('marketplace.actions.download')}
                  </LoadingButton>
                )}
                {isDownloaded && !currentData?.is_outdated && (
                  <Button
                    startIcon={<Iconify icon="carbon:view-filled" width={16} />}
                    variant="contained"
                    size="small"
                    sx={{
                      borderRadius: '4px',
                      boxShadow: (theme) => theme.customShadows.z8,
                      bgcolor: (theme) => theme.palette.grey[600],
                      color: 'white',
                      px: 1,
                      py: 0,
                      typography: 'caption',
                      '&:hover': {
                        bgcolor: (theme) => theme.palette.grey[700],
                        boxShadow: 'none',
                      },
                    }}
                    onClick={() => router.push(`/automation/${currentData?.type}/createOrEdit`)}
                  >
                    {t('marketplace.actions.view')}
                  </Button>
                )}
                {isDownloaded && currentData?.is_outdated && (
                  <LoadingButton
                    loading={btnLoading.value.update}
                    startIcon={
                      <Iconify icon="material-symbols:system-update-alt-sharp" width={16} />
                    }
                    variant="contained"
                    size="small"
                    sx={{
                      borderRadius: '4px',
                      boxShadow: (theme) => theme.customShadows.z8,
                      bgcolor: (theme) => theme.palette.grey[600],
                      color: 'white',
                      px: 1,
                      py: 0,
                      typography: 'caption',
                      '&:hover': {
                        bgcolor: (theme) => theme.palette.grey[700],
                        boxShadow: 'none',
                      },
                    }}
                    onClick={handleUpdateWorkflow}
                  >
                    {t('marketplace.actions.update')}
                  </LoadingButton>
                )}
              </Stack>
              <Typography variant="subtitle2" color="text.secondary">
                {`${t('marketplace.fee')}: `}
                <Typography component="span" color="primary" variant="inherit">
                  {fCurrencyVND(currentData?.usage_fee) || 0}
                </Typography>
                {` ${t('marketplace.unit')}`}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            mt: 1,
            mb: 3,
            zIndex: 10,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
          ))}
        </Tabs>

        {currentTab === 'readme' && (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyEditor
              sx={{
                backgroundColor: 'transparent',
                '& .ql-editor': {
                  p: 0,
                  backgroundColor: 'transparent',
                  maxHeight: 'fit-content',
                },
                border: 'none',
              }}
              id="simple-editor"
              value={currentData?.readme}
              readOnly
              placeholder={t('workflow.script.tab.noContent')}
            />
          </Suspense>
        )}
        {currentTab === 'changelog' &&
          currentData.public_workflow_versions?.length > 0 &&
          currentData.public_workflow_versions.map((version, index) => (
            <Box key={index}>
              <Typography variant="h6" sx={{ mt: 2 }}>
                {`V${version.name} (${fDate(version?.created_at, 'dd MM yyyy HH:mm:ss OOOO')})`}
              </Typography>
              {version.change_log.split('\n')?.length > 0 &&
                version.change_log.split('\n').map((log, _index) => (
                  <Typography sx={{ paddingLeft: 1 }} key={_index} variant="body2">
                    {log}
                  </Typography>
                ))}
              <Divider sx={{ my: 2 }} />
            </Box>
          ))}
      </Scrollbar>
      <Zoom in={show} timeout={300} unmountOnExit>
        <Fab
          aria-label="top-up"
          sx={{
            position: 'absolute',
            bottom: 30,
            right: 30,
            width: 40,
            height: 40,
          }}
          color="default"
          onClick={() => {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{
            transitionDelay: `${show ? 300 : 0}ms`,
          }}
        >
          <Iconify icon="mingcute:up-fill" />
        </Fab>
      </Zoom>
    </Container>
  );
}

MarketplaceDetailView.propTypes = {
  currentData: PropTypes.object,
  reloadWorkflowData: PropTypes.func,
};
