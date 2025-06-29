import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

// mui
import {
  Alert,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Link,
  MenuItem,
  Stack,
  Switch,
  Typography,
  Zoom,
} from '@mui/material';
// apis
import {
  getExtensionOfWorkspaceApi,
  removeExtensionApiV2,
  turnOffExtensionApiV2,
  turnOnExtensionApiV2,
} from 'src/api/extension.api';
// components
import CustomPopover from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label from 'src/components/label';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import { enqueueSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import { getStorage } from 'src/hooks/use-local-storage';
import { WORKSPACE_ID } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { isElectron } from '../../utils/commom';

const ExtensionItem = ({ action, moreOptions, data, handleReload }) => {
  const { id, name, description, icon_url } = data;
  const { t } = useLocales();
  const popoverTimeoutRef = useRef();
  const [targetPopover, setTargetPopover] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('not_yet');
  const [enabled, setEnabled] = useState(data?.status === 'on');
  const workspaceId = getStorage(WORKSPACE_ID);
  const confirm = useMultiBoolean({
    delete: false,
    enable: false,
  });

  const handleRemoveExtension = async () => {
    try {
      setLoading(true);
      if (isElectron()) {
        const uninstallStatus = await window.ipcRenderer.invoke('uninstall-extension', data);
        if (uninstallStatus === 'success') {
          const listExtensionRes = await getExtensionOfWorkspaceApi(workspaceId, {});
          await window.ipcRenderer.send('change-list-extensions', listExtensionRes.data);
        } else {
          // handle download failed
        }
      }
      await removeExtensionApiV2(workspaceId, id);
      handleReload();
      enqueueSnackbar(t('systemNotify.success.delete'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('systemNotify.error.delete'), { variant: 'error' });
    } finally {
      setLoading(false);
      confirm.onFalse('delete');
    }
  };

  const handleActiveExtension = async () => {
    try {
      confirm.onFalse('enable');
      if (!enabled) {
        setEnabled(true);
        setDownloadStatus('downloading');
        const response = await turnOnExtensionApiV2(workspaceId, id);
        if (isElectron()) {
          const installStatus = await window.ipcRenderer.invoke(
            'install-extension',
            response.data?.data
          );
          if (installStatus === 'success') {
            setDownloadStatus('downloaded');
            const listExtensionRes = await getExtensionOfWorkspaceApi(workspaceId, {});
            window.ipcRenderer.send('change-list-extensions', listExtensionRes.data);
          } else {
            // handle download failed
          }
        }
      } else {
        await turnOffExtensionApiV2(workspaceId, id);
        setEnabled(false);
        if (isElectron()) {
          const listExtensionRes = await getExtensionOfWorkspaceApi(workspaceId, {});
          await window.ipcRenderer.send('change-list-extensions', listExtensionRes.data);
        }
      }
    } catch (error) {
      /* empty */
    }
  };

  useEffect(
    () => () => {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
    },
    []
  );

  const renderDialog = (
    <>
      <ConfirmDialog
        open={confirm.value.delete}
        onClose={() => confirm.onFalse('delete')}
        closeButtonName={t('dialog.extension.actions.close')}
        title={
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h4" marginRight="auto" marginLeft={1}>
                {t('dialog.extension.delete.title')}
              </Typography>
              <IconButton onClick={() => confirm.onFalse('delete')}>
                <Iconify icon="ic:round-close" />
              </IconButton>
            </Stack>
            <Divider />
          </Stack>
        }
        content={
          <Stack spacing={3}>
            <Alert variant="outlined" severity="warning">
              {t('dialog.extension.delete.warning')}
            </Alert>
            <Typography>{t('dialog.extension.delete.question')}</Typography>
            <Typography>
              {`${t('dialog.extension.extensionName')}: `}
              <Label
                sx={{
                  fontSize: 16,
                  p: 1,
                }}
                color="primary"
              >
                {name}
              </Label>
            </Typography>
          </Stack>
        }
        action={
          <LoadingButton
            loading={loading}
            variant="outlined"
            color="primary"
            onClick={handleRemoveExtension}
          >
            {t('dialog.extension.actions.ok')}
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={confirm.value.enable}
        onClose={() => confirm.onFalse('enable')}
        closeButtonName={t('dialog.extension.actions.close')}
        title={
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h4" marginRight="auto" marginLeft={1}>
                {!enabled
                  ? t('dialog.extension.enable.title')
                  : t('dialog.extension.disable.title')}
              </Typography>
              <IconButton onClick={() => confirm.onFalse('enable')}>
                <Iconify icon="ic:round-close" />
              </IconButton>
            </Stack>
            <Divider />
          </Stack>
        }
        content={
          <Stack spacing={3}>
            <Typography>
              {!enabled
                ? t('dialog.extension.enable.subTitle')
                : t('dialog.extension.disable.subTitle')}
            </Typography>
            <Typography>
              {`${t('dialog.extension.extensionName')}: `}
              <Label
                sx={{
                  fontSize: 14,
                  p: 1,
                }}
                color="primary"
              >
                {name}
              </Label>
            </Typography>
          </Stack>
        }
        action={
          <LoadingButton
            loading={loading}
            onClick={handleActiveExtension}
            variant="contained"
            color="primary"
          >
            {t('dialog.extension.actions.ok')}
          </LoadingButton>
        }
      />
    </>
  );

  return (
    <>
      <Card
        sx={{
          height: 1,
        }}
      >
        <CardHeader
          sx={{
            alignItems: 'start',
            '& .MuiCardHeader-action': {
              marginTop: 0,
            },
          }}
          avatar={
            <Avatar
              src={icon_url}
              variant="rounded"
              sx={{
                width: 50,
                height: 50,
              }}
            />
          }
          action={action || <Switch checked={enabled} onChange={() => confirm.onTrue('enable')} />}
          title={
            <>
              <Typography variant="button">{name}</Typography>
              {downloadStatus === 'downloading' && (
                <Typography variant="body2" sx={{ color: 'warning.main' }}>
                  Đang tải về ...
                </Typography>
              )}
              {downloadStatus === 'downloaded' && (
                <Typography variant="body2" sx={{ color: 'success.main' }}>
                  Tải về hoàn tất
                </Typography>
              )}
            </>
          }
          // subheader="0.1.5"
        />
        <CardContent
          sx={{
            mb: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
        <Stack
          direction="row"
          px={3}
          width={1}
          position="absolute"
          bottom={10}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle2">
            Provider:{' '}
            <Link noWrap variant="body2" sx={{ cursor: 'pointer' }}>
              Chrome Web Store
            </Link>
          </Typography>
          {moreOptions && (
            <>
              <IconButton
                aria-label="more options"
                onClick={(event) => {
                  setTargetPopover(event.currentTarget);
                }}
              >
                <Iconify icon="ri:more-fill" />
              </IconButton>
              <CustomPopover
                open={targetPopover}
                onClose={() => {
                  setTargetPopover(null);
                }}
                TransitionComponent={Zoom}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <MenuItem>
                  <Iconify icon="uil:edit" />
                  {t('extension.actions.update')}
                </MenuItem>

                <Divider />

                <MenuItem
                  sx={{
                    color: 'error.main',
                  }}
                  onClick={() => confirm.onTrue('delete')}
                >
                  <Iconify icon="fluent:delete-12-regular" />
                  {t('extension.actions.remove')}
                </MenuItem>
              </CustomPopover>
            </>
          )}
        </Stack>
      </Card>
      {renderDialog}
    </>
  );
};

export default ExtensionItem;

ExtensionItem.propTypes = {
  action: PropTypes.node,
  moreOptions: PropTypes.bool,
  data: PropTypes.object,
  handleReload: PropTypes.func,
};
