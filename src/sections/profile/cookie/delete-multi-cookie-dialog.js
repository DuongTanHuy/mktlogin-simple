import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label, { CustomLabel } from 'src/components/label';
// apis
import { ERROR_CODE, NUM_ID_DISPLAY } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { deleteMultiCookieApi } from 'src/api/profile.api';
import Iconify from 'src/components/iconify';
import { isElectron } from '../../../utils/commom';

const DeleteMultiCookieDialog = ({ open, onClose, profileIds, handleReLoadData }) => {
  const { workspace_id } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const { t } = useLocales();

  const handleClose = () => {
    onClose();
    setNumItem(NUM_ID_DISPLAY);
  };

  const handleDeleteCookieProfiles = async () => {
    try {
      setLoading(true);
      const payload = {
        profile_ids: profileIds,
      };

      await deleteMultiCookieApi(workspace_id, payload);
      if (isElectron()) {
        window.ipcRenderer.send('clear-cookie', payload);
      }
      handleReLoadData();
      enqueueSnackbar(t('systemNotify.success.delete'), { variant: 'success' });
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
      handleClose();
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        handleClose();
      }}
      closeButtonName={t('dialog.deleteCookie.actions.cancel')}
      title={t('dialog.deleteCookie.title')}
      content={
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="body1">{t('dialog.deleteCookie.subTitle')}</Typography>
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              sx={{
                typography: 'body2',
                color: 'error.main',
              }}
            >
              {profileIds?.length > 0
                ? profileIds.slice(0, numItem).map((profileId) => (
                    <Label
                      key={profileId}
                      color="primary"
                      sx={{
                        p: 2,
                      }}
                    >
                      {profileId}
                    </Label>
                  ))
                : t('quickAction.expiredProfile')}
              {profileIds.length > NUM_ID_DISPLAY && (
                <CustomLabel length={profileIds.length} numItem={numItem} setNumItem={setNumItem} />
              )}
            </Stack>
          </Stack>
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
              {t('dialog.deleteCookie.note')}
            </Typography>
          </Stack>
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          onClick={handleDeleteCookieProfiles}
          disabled={profileIds?.length === 0}
        >
          {t('dialog.deleteCookie.actions.confirm')}
        </LoadingButton>
      }
    />
  );
};

export default DeleteMultiCookieDialog;

DeleteMultiCookieDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReLoadData: PropTypes.func,
  profileIds: PropTypes.array,
};
