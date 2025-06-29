import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
// api

import { ConfirmDialog } from 'src/components/custom-dialog';
import { Divider, IconButton, Stack, Typography } from '@mui/material';
import Iconify from 'src/components/iconify';
import { setStorage } from 'src/hooks/use-local-storage';
import { WORKSPACE_ID } from 'src/utils/constance';
import { deleteWorkgroupUserApi } from 'src/api/workgroup-user.api';
import { useLocales } from 'src/locales';
import { getListWorkspace } from 'src/api/workspace.api';
import { useAuthContext } from 'src/auth/hooks';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

const DeleteMemberDialog = ({ userId, open, onClose, handleResetData, type = 'delete' }) => {
  const { t } = useLocales();
  const [loading, setLoading] = useState(false);
  const { workspace_id: workspaceId, updateWorkspaceId } = useAuthContext();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteWorkgroupUserApi(workspaceId, userId);
      enqueueSnackbar(t('systemNotify.success.delete'), {
        variant: 'success',
      });

      if (type === 'leave') {
        const wsApi = await getListWorkspace();
        const dataWorkspaces = wsApi?.data?.data;
        if (dataWorkspaces?.length > 0) {
          const isMyWorkspace = dataWorkspaces.filter((i) => i.is_my_workspace === true);
          if (isMyWorkspace && isMyWorkspace[0]) {
            setStorage(WORKSPACE_ID, isMyWorkspace[0]?.id);
            updateWorkspaceId(isMyWorkspace[0]?.id, isMyWorkspace[0]?.user_creator?.id);
          }
        }
        router.push(paths.dashboard.profile);
      }

      handleResetData();
    } catch (error) {
      enqueueSnackbar(t('systemNotify.error.delete'), { variant: 'error' });
    } finally {
      onClose();
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      closeButtonName={t('dialog.member.actions.close')}
      title={
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">
              {type === 'leave'
                ? t('dialog.member.delete.leave')
                : t('dialog.member.delete.delete')}
            </Typography>
            <IconButton onClick={onClose}>
              <Iconify icon="ic:round-close" />
            </IconButton>
          </Stack>
          <Divider />
        </Stack>
      }
      content={
        type === 'leave'
          ? t('dialog.member.delete.leaveQues')
          : t('dialog.member.delete.deleteQues')
      }
      action={
        <LoadingButton loading={loading} variant="contained" color="error" onClick={handleDelete}>
          {type === 'leave' ? t('dialog.member.actions.leave') : t('dialog.member.actions.delete')}
        </LoadingButton>
      }
    />
  );
};

export default DeleteMemberDialog;

DeleteMemberDialog.propTypes = {
  type: PropTypes.oneOf(['leave', 'delete']),
  userId: PropTypes.number,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleResetData: PropTypes.func,
};
