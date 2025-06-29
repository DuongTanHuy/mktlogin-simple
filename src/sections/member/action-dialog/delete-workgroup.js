import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
// api

import { ConfirmDialog } from 'src/components/custom-dialog';
import { deleteWorkgroupApi } from 'src/api/workgroup.api';
import { getStorage } from 'src/hooks/use-local-storage';
import { WORKSPACE_ID } from 'src/utils/constance';
import { deleteWorkFlowGroup } from 'src/api/workflow.api';
import { useLocales } from 'src/locales';

const DeleteGroupMemberDialog = ({
  open,
  onClose,
  groupData,
  handleResetData,
  modeAPI,
  currentGroup,
}) => {
  const { t } = useLocales();
  const { id, name } = groupData;
  const [loading, setLoading] = useState(false);
  const workspaceId = getStorage(WORKSPACE_ID);

  const handleDelete = async () => {
    try {
      if (modeAPI === 'workgroup') {
        await deleteWorkgroupApi(workspaceId, id);
      }

      if (modeAPI === 'workflow') {
        await deleteWorkFlowGroup(workspaceId, id);
      }
      enqueueSnackbar(t('systemNotify.success.delete'), {
        variant: 'success',
      });
      handleResetData(currentGroup?.id === id);
    } catch (error) {
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
      closeButtonName={t('dialog.userGroup.actions.close')}
      title={t('dialog.userGroup.delete.title')}
      content={`${t('dialog.userGroup.actions.delete')} ${name}?`}
      action={
        <LoadingButton loading={loading} variant="contained" color="error" onClick={handleDelete}>
          {t('dialog.userGroup.actions.delete')}
        </LoadingButton>
      }
    />
  );
};

export default DeleteGroupMemberDialog;

DeleteGroupMemberDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleResetData: PropTypes.func,
  groupData: PropTypes.object,
  modeAPI: PropTypes.string,
  currentGroup: PropTypes.object,
};
