import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';
// api
import { deleteMultiCacheApi } from 'src/api/profile.api';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import Iconify from 'src/components/iconify';
import { isElectron } from '../../../utils/commom';

const DeleteSingleCacheDialog = ({ open, onClose, id, workspaceId, handleResetData }) => {
  const [loading, setLoading] = useState(false);
  const { t } = useLocales();

  const handleDeleteCache = async () => {
    try {
      setLoading(true);
      if (workspaceId) {
        const payload = {
          profile_ids: [id],
        };
        const response = await deleteMultiCacheApi();
        if (!response?.data?.status) {
          enqueueSnackbar(t('dialog.deleteCache.error'), {
            variant: 'error',
          });
          return;
        }
        if (isElectron()) {
          window.ipcRenderer.send('remove-cache', payload);
        }
        handleResetData();
        enqueueSnackbar(t('systemNotify.success.delete'), { variant: 'success' });
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.cookie'), {
          variant: 'error',
        });
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
      } else
        enqueueSnackbar(error?.message || t('systemNotify.error.delete'), { variant: 'error' });
    } finally {
      onClose();
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={t('dialog.deleteCache.title')}
      closeButtonName={t('dialog.deleteCache.actions.cancel')}
      content={
        <Stack spacing={1}>
          <Typography>{t('dialog.deleteCache.deleteSingle')}</Typography>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{
              color: 'error.main',
            }}
          >
            <Iconify icon="mi:warning" width={16} />
            <Typography variant="body1" fontWeight={500}>
              {t('dialog.deleteCache.note')}
            </Typography>
          </Stack>
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="error"
          onClick={handleDeleteCache}
        >
          {t('dialog.deleteCache.actions.delete')}
        </LoadingButton>
      }
    />
  );
};

export default DeleteSingleCacheDialog;

DeleteSingleCacheDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  id: PropTypes.number,
  workspaceId: PropTypes.string.isRequired,
  handleResetData: PropTypes.func,
};
