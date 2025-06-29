import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label, { CustomLabel } from 'src/components/label';
// api
import { deleteMultiProfileApi } from 'src/api/profile.api';
import { ERROR_CODE, NUM_ID_DISPLAY } from 'src/utils/constance';
import { useLocales } from 'src/locales';

const DeleteMultiDialog = ({ open, onClose, profileIds, workspaceId, handleReLoadData }) => {
  const [loading, setLoading] = useState(false);
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const { t } = useLocales();

  const handleClose = () => {
    onClose();
    setNumItem(NUM_ID_DISPLAY);
  };

  const handleDeleteProfiles = async () => {
    try {
      setLoading(true);
      const payload = {
        profile_id: profileIds,
      };
      if (workspaceId) {
        await deleteMultiProfileApi(workspaceId, payload);
        handleReLoadData();
        enqueueSnackbar(t('systemNotify.success.delete'), { variant: 'success' });
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.delete'), {
          variant: 'error',
        });
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      handleClose();
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={handleClose}
      title={t('dialog.deleteProfile.header')}
      closeButtonName={t('dialog.deleteProfile.actions.cancel')}
      content={
        <Stack spacing={3}>
          <Typography variant="body1">{t('dialog.deleteProfile.subheader')}</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {profileIds.slice(0, numItem).map((profileId) => (
              <Label
                key={profileId}
                color="primary"
                sx={{
                  p: 2,
                }}
              >
                {profileId}
              </Label>
            ))}
            {profileIds.length > NUM_ID_DISPLAY && (
              <CustomLabel length={profileIds.length} numItem={numItem} setNumItem={setNumItem} />
            )}
          </Stack>
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="error"
          onClick={handleDeleteProfiles}
        >
          {t('dialog.deleteProfile.actions.delete')}
        </LoadingButton>
      }
    />
  );
};

export default DeleteMultiDialog;

DeleteMultiDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReLoadData: PropTypes.func,
  profileIds: PropTypes.array,
  workspaceId: PropTypes.string.isRequired,
};
