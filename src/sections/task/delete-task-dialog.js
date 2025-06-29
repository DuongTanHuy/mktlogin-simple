import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label from 'src/components/label';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { deleteMultiTaskApi } from 'src/api/task.api';

const DeleteTaskDialog = ({ open, onClose, taskIds, workspaceId, handleReLoadData }) => {
  const [loading, setLoading] = useState(false);
  const { t } = useLocales();

  const handleDeleteProfiles = async () => {
    try {
      setLoading(true);
      const payload = {
        task_ids: taskIds,
      };
      await deleteMultiTaskApi(workspaceId, payload);
      handleReLoadData();
      enqueueSnackbar(t('systemNotify.success.delete'), { variant: 'success' });
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
      title={t('task.deleteMulti.title')}
      closeButtonName={t('task.actions.close')}
      content={
        <Stack spacing={3}>
          <Typography variant="body1">{t('task.deleteMulti.message')}</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {taskIds.map((profileId) => (
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
          {t('task.actions.delete')}
        </LoadingButton>
      }
    />
  );
};

export default DeleteTaskDialog;

DeleteTaskDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReLoadData: PropTypes.func,
  taskIds: PropTypes.array,
  workspaceId: PropTypes.string.isRequired,
};
