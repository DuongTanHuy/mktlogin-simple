import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { ConfirmDialog } from 'src/components/custom-dialog';
import Iconify from 'src/components/iconify';
import { enqueueSnackbar } from 'notistack';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { updateWorkspace } from 'src/api/workspace.api';

const UpdateWorkspaceNameDialog = ({ open, onClose, workspaceId, name, handleReload }) => {
  const { t } = useLocales();
  const [loading, setLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [errorMess, setErrorMess] = useState('');

  const handleUpdate = async () => {
    if (!workspaceName) {
      setErrorMess('Tên không gian làm việc không được để trống');
      return;
    }
    try {
      setLoading(true);

      await updateWorkspace(workspaceId, { name: workspaceName });

      handleReload();
      enqueueSnackbar(t('systemNotify.success.update'), {
        variant: 'success',
      });
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.workspace.update'), {
          variant: 'error',
        });
      } else
        enqueueSnackbar(t('systemNotify.error.title'), {
          variant: 'error',
        });
    } finally {
      handleClose();
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setWorkspaceName('');
    setErrorMess('');
  };

  useEffect(() => {
    setWorkspaceName(name);
  }, [name, open]);

  return (
    <ConfirmDialog
      open={open}
      onClose={handleClose}
      closeButtonName={t('dialog.deleteWorkspace.actions.close')}
      title={
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">{t('workspaceSetting.updateWorkspace.title')}</Typography>
            <IconButton onClick={handleClose}>
              <Iconify icon="ic:round-close" />
            </IconButton>
          </Stack>
          <Divider />
        </Stack>
      }
      content={
        <Stack spacing={3}>
          <TextField
            error={!!errorMess}
            helperText={errorMess}
            size="small"
            value={workspaceName}
            onChange={(event) => {
              if (errorMess) setErrorMess('');
              setWorkspaceName(event.target.value);
            }}
            placeholder={t('workspaceSetting.updateWorkspace.placeholder')}
          />
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          disabled={name === workspaceName}
        >
          {t('workspaceSetting.actions.update')}
        </LoadingButton>
      }
    />
  );
};

export default UpdateWorkspaceNameDialog;

UpdateWorkspaceNameDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReload: PropTypes.func,
  workspaceId: PropTypes.string,
  name: PropTypes.string,
};
