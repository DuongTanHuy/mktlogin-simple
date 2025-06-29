import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
// api

import { ConfirmDialog } from 'src/components/custom-dialog';
import { Stack, Typography } from '@mui/material';
import { useLocales } from 'src/locales';
import { useAuthContext } from '../../auth/hooks';
import { deleteProfileGroupApi } from '../../api/profile-group.api';
import { ERROR_CODE, ID_UNGROUPED } from '../../utils/constance';

const ConfirmDeleteDialog = ({
  data,
  open,
  closeDialog,
  refreshProfileGroupList,
  setGroupSelected,
}) => {
  const { workspace_id: workspaceId } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const { t } = useLocales();

  const handleDeleteProfileGroup = async () => {
    try {
      setLoading(true);
      if (workspaceId) {
        await deleteProfileGroupApi(workspaceId, data.id);
        refreshProfileGroupList();
        setGroupSelected(ID_UNGROUPED);
        enqueueSnackbar(t('systemNotify.success.delete'), { variant: 'success' });
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.group.delete'), { variant: 'error' });
      } else
        enqueueSnackbar(t('systemNotify.error.delete'), {
          variant: 'error',
        });
    } finally {
      closeDialog();
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={closeDialog}
      title={`${t('dialog.profileGroup.delete.header')} ${data?.name}`}
      closeButtonName={t('dialog.profileGroup.actions.close')}
      content={
        <Stack>
          <Typography>{t('dialog.profileGroup.delete.subheader1')}</Typography>
          <Typography variant="body">{t('dialog.profileGroup.delete.subheader2')}</Typography>
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="error"
          onClick={handleDeleteProfileGroup}
        >
          {t('dialog.profileGroup.actions.delete')}
        </LoadingButton>
      }
    />
  );
};

export default ConfirmDeleteDialog;

ConfirmDeleteDialog.propTypes = {
  data: PropTypes.object,
  open: PropTypes.bool,
  closeDialog: PropTypes.func,
  refreshProfileGroupList: PropTypes.func,
  id: PropTypes.number,
  setGroupSelected: PropTypes.func,
};
