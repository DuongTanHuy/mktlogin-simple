import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
// api
import { deleteProfileApi } from 'src/api/profile.api';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';

const DeleteSingleDialog = ({ open, onClose, id, workspaceId, handleResetData }) => {
  const [loading, setLoading] = useState(false);
  const { t } = useLocales();

  const handleDeleteProfile = async () => {
    try {
      setLoading(true);
      if (workspaceId) {
        await deleteProfileApi(workspaceId, id);
        handleResetData();
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
      onClose();
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={t('dialog.deleteProfile.header1')}
      closeButtonName={t('dialog.deleteProfile.actions.cancel')}
      content={t('dialog.deleteProfile.subheader1')}
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="error"
          onClick={handleDeleteProfile}
        >
          {t('dialog.deleteProfile.actions.delete')}
        </LoadingButton>
      }
    />
  );
};

export default DeleteSingleDialog;

DeleteSingleDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleResetData: PropTypes.func,
  id: PropTypes.number,
  workspaceId: PropTypes.string.isRequired,
};
