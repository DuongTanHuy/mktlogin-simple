import { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
// components
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { updateNewVersion } from 'src/api/workflow.api';

const UpdateTaskDialog = ({ open, onClose, updateData, handleReLoadData }) => {
  const { workspace_id } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const { t } = useLocales();
  const { last_version, workflow } = updateData;

  const handleUpdateTask = async () => {
    try {
      setLoading(true);

      await updateNewVersion(workspace_id, workflow?.id);

      handleReLoadData();
      enqueueSnackbar(t('marketplace.notify.update.success'), { variant: 'success' });
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.delete'), {
          variant: 'error',
        });
      }
      if (error?.detail === 'Not found.') {
        enqueueSnackbar(t('marketplace.notify.notFound'), {
          variant: 'error',
        });
      } else {
        enqueueSnackbar(error?.message || t('marketplace.notify.update.error'), {
          variant: 'error',
        });
      }
    } finally {
      onClose();
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: (theme) => theme.customShadows.z4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>{`${t('task.dialog.updateTask.title')} ${
        last_version?.name || ''
      } ?`}</DialogTitle>
      <DialogContent sx={{ typography: 'body2' }}>
        <Typography variant="subtitle1">{t('task.dialog.updateTask.content')}</Typography>
        <Typography
          variant="body2"
          fontStyle="italic"
          sx={{
            mt: 0.5,
          }}
        >
          {last_version?.change_log
            ? last_version?.change_log?.split('\n')?.map((item, index) => (
                <Fragment key={index}>
                  {item}
                  <br />
                </Fragment>
              ))
            : t('task.dialog.updateTask.notContent')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="inherit" onClick={onClose}>
          {t('task.actions.cancel')}
        </Button>
        <LoadingButton
          variant="contained"
          color="primary"
          loading={loading}
          onClick={handleUpdateTask}
        >
          {t('task.actions.update')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateTaskDialog;

UpdateTaskDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReLoadData: PropTypes.func,
  updateData: PropTypes.object,
};
