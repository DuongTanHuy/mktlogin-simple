import { m } from 'framer-motion';
// @mui
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { varHover } from 'src/components/animate';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Stack,
  useTheme,
} from '@mui/material';
import Label from 'src/components/label';
import { useEffect, useRef, useState } from 'react';
import { isElectron } from 'src/utils/commom';
import { LoadingButton } from '@mui/lab';
import { useLocales } from 'src/locales';
// eslint-disable-next-line import/no-extraneous-dependencies
import { marked } from 'marked';
// theme

// ----------------------------------------------------------------------

export default function UpdateSystemPopover() {
  const { t } = useLocales();
  const locationRef = useRef();
  const popover = usePopover();
  const theme = useTheme();
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    if (isElectron()) {
      window.ipcRenderer.on('update-available', (event, _updateInfo) => {
        _updateInfo.releaseNotes = marked(_updateInfo.releaseNotes);
        setUpdateInfo(_updateInfo);
        popover.onOpen({
          currentTarget: locationRef.current,
        });
      });
    }
  }, [popover]);

  const downloadUpdate = () => {
    if (isElectron()) {
      setIsDownloading(true);
      window.ipcRenderer.send('download-new-version');
      window.ipcRenderer.on('download-progress', (event, progress) => {
        const progressPercent = Math.floor(progress.percent);
        setPercent(progressPercent);
      });
      window.ipcRenderer.on('update-downloaded', () => {
        setIsDownloading(false);
        setIsDownloaded(true);
      });
    }
  };

  const installUpdate = () => {
    if (isElectron()) {
      window.ipcRenderer.send('install-new-version');
    }
  };

  return (
    <>
      <IconButton
        ref={locationRef}
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={popover.open ? 'inherit' : 'default'}
        onClick={popover.onOpen}
        sx={{
          ...(popover.open && {
            bgcolor: theme.palette.action.selected,
          }),
        }}
      >
        <Badge badgeContent={updateInfo && 1} color="error">
          <Iconify icon="flowbite:download-solid" width={24} />
        </Badge>
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 460, p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" pr={3}>
          <Typography variant="h6" sx={{ p: 1 }}>
            {t('dialog.updateSystem.title')}
          </Typography>
          {/* <Button>Download all</Button> */}
        </Stack>

        <Scrollbar sx={{ maxHeight: 500 }}>
          {updateInfo ? (
            <Card
              variant="outlined"
              sx={{
                position: 'relative',
                mb: 2,
                border: 'none',
                borderRadius: 1,
              }}
            >
              <CardHeader
                title={
                  <Stack direction="row" spacing={1} justifyContent="start" alignContent="center">
                    <Typography>{t('dialog.updateSystem.appDownload')}</Typography>
                    <Label color="success">{t('dialog.updateSystem.new')}</Label>
                  </Stack>
                }
                subheader={`${t('dialog.updateSystem.version')}: ${updateInfo?.version || ''}`}
              />
              <CardContent
                sx={{
                  py: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  dangerouslySetInnerHTML={{ __html: updateInfo?.releaseNotes }}
                />
                <Typography color="error" variant="body2">
                  {t('dialog.updateSystem.note')}
                </Typography>
              </CardContent>
              <CardActions
                sx={{
                  justifyContent: 'flex-end',
                  mb: 1,
                }}
              >
                {!isDownloaded ? (
                  <LoadingButton
                    loading={isDownloading}
                    loadingPosition="start"
                    variant="contained"
                    color="primary"
                    sx={{
                      px: 2,
                      py: 0.5,
                    }}
                    startIcon={<Iconify icon="bx:bxs-download" width={16} />}
                    onClick={downloadUpdate}
                  >
                    {t('dialog.updateSystem.actions.download')} {isDownloading && `${percent}%`}
                  </LoadingButton>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    sx={{
                      px: 2,
                      py: 0.5,
                    }}
                    startIcon={<Iconify icon="teenyicons:tick-circle-outline" width={16} />}
                    onClick={installUpdate}
                  >
                    {t('dialog.updateSystem.actions.install')}
                  </Button>
                )}
              </CardActions>
              {isDownloading && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    bgcolor: 'primary.main',
                    width: `${percent}%`,
                    height: '4px',
                  }}
                />
              )}
            </Card>
          ) : (
            <Typography variant="h5" sx={{ color: 'text.secondary' }} textAlign="center" p={10}>
              {t('dialog.updateSystem.noAvailable')}
            </Typography>
          )}
        </Scrollbar>
      </CustomPopover>
    </>
  );
}
