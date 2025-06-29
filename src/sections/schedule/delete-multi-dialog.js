import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label from 'src/components/label';
// api
import { deleteMultiScheduleApi } from 'src/api/schedule.api';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';

const DeleteMultiDialog = ({ open, onClose, scheduleIds, workspaceId, handleReLoadData }) => {
  const { t } = useLocales();
  const [loading, setLoading] = useState(false);

  const handleDeleteSchedules = async () => {
    try {
      setLoading(true);
      const payload = {
        task_schedule_ids: scheduleIds,
      };
      if (workspaceId) {
        await deleteMultiScheduleApi(workspaceId, payload);
        handleReLoadData((prev) => prev + 1);
        enqueueSnackbar(t('systemNotify.success.deleteSchedule'), { variant: 'success' });
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.schedule.delete'), {
          variant: 'error',
        });
      } else enqueueSnackbar(t('systemNotify.error.delete'), { variant: 'error' });
    } finally {
      onClose();
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Xóa lịch trình?"
      content={
        <Stack spacing={3}>
          <Typography variant="body1">Các lịch trình có id sau sẽ bị xóa:</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {scheduleIds.map((profileId) => (
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
          onClick={handleDeleteSchedules}
        >
          Xóa ngay
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
  scheduleIds: PropTypes.array,
  workspaceId: PropTypes.string.isRequired,
};
