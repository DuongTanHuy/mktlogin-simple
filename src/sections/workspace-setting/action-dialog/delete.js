import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { ConfirmDialog } from 'src/components/custom-dialog';
import Iconify from 'src/components/iconify';
import { debounce } from 'lodash';
import { deleteListWorkspace, getListWorkspace, useGetWorkspace } from 'src/api/workspace.api';
import { enqueueSnackbar } from 'notistack';
import { setStorage } from 'src/hooks/use-local-storage';
import { ERROR_CODE, WORKSPACE_ID } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

const DeleteWorkspaceDialog = ({ open, onClose, workspaceId, updateWorkspaceId }) => {
  const { t } = useLocales();
  const [loading, setLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);
  const router = useRouter();
  const { workspace } = useGetWorkspace(workspaceId);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setIsDisabled(true);

      await deleteListWorkspace(workspaceId);
      enqueueSnackbar(t('systemNotify.success.delete'), {
        variant: 'success',
      });

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
    } catch (error) {
      if (error?.error_code === ERROR_CODE.NOT_DELETE_WORKSPACE) {
        enqueueSnackbar(t('systemNotify.warning.deleteWorkspace'), {
          variant: 'error',
        });
      } else if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.workspace.delete'), {
          variant: 'error',
        });
      } else if (error?.error_code === ERROR_CODE.FOR_WORKSPACE_OWNER_ONLY) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.workspace.onlyOwner'), {
          variant: 'error',
        });
      } else
        enqueueSnackbar(t('systemNotify.error.title'), {
          variant: 'error',
        });
    } finally {
      handleClose();
      setLoading(false);
      setIsDisabled(false);
    }
  };

  const handleClose = () => {
    onClose();
    setWorkspaceName('');
  };

  useEffect(() => {
    if (workspaceName === workspace?.name) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [workspace?.name, workspaceName]);

  return (
    <ConfirmDialog
      open={open}
      onClose={handleClose}
      closeButtonName={t('dialog.deleteWorkspace.actions.close')}
      title={
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">{t('dialog.deleteWorkspace.title')}</Typography>
            <IconButton onClick={handleClose}>
              <Iconify icon="ic:round-close" />
            </IconButton>
          </Stack>
          <Divider />
        </Stack>
      }
      content={
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography>
              {t('dialog.deleteWorkspace.subTitle1')}
              <Typography component="span" variant="subtitle1" color="primary">
                {` "${workspace?.name}" `}
              </Typography>
              {t('dialog.deleteWorkspace.subTitle2')}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {t('dialog.deleteWorkspace.note')}
            </Typography>
          </Stack>
          <TextField
            size="small"
            defaultValue={workspaceName}
            onChange={debounce(
              (event) => {
                setWorkspaceName(event.target.value);
              },
              [100]
            )}
            placeholder={t('dialog.deleteWorkspace.placeholder')}
          />
        </Stack>
      }
      action={
        <LoadingButton
          disabled={isDisabled}
          loading={loading}
          variant="contained"
          color="error"
          onClick={handleDelete}
        >
          {t('dialog.deleteWorkspace.actions.delete')}
        </LoadingButton>
      }
    />
  );
};

export default DeleteWorkspaceDialog;

DeleteWorkspaceDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  workspaceId: PropTypes.string,
  updateWorkspaceId: PropTypes.func,
};
