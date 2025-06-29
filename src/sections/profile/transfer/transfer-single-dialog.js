import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
// mui
import { LoadingButton } from '@mui/lab';
import { Stack, TextField, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
// api
import { transferProfilesApi } from 'src/api/profile.api';
import { useLocales } from 'src/locales';
import { ERROR_CODE } from 'src/utils/constance';
import { formatErrorFields } from 'src/utils/format-errors';

const TransferSingleDialog = ({ open, onClose, id, workspaceId, handleResetData }) => {
  const [receiver, setReceiver] = useState('');
  const [errors, setErrors] = useState({
    receiver: '',
  });
  const { t } = useLocales();
  const [loading, setLoading] = useState(false);

  const handleSendProfile = async () => {
    if (receiver === '') {
      setErrors((prev) => ({ ...prev, receiver: t('dialog.transferProfile.errorMess') }));
      return;
    }
    try {
      setLoading(true);
      const payload = {
        profile_id: [id],
        username: receiver,
      };
      if (workspaceId) {
        await transferProfilesApi(workspaceId, payload);
        handleResetData();
        enqueueSnackbar(t('systemNotify.success.transfer'), { variant: 'success' });
      }
    } catch (error) {
      if (error?.error_code === ERROR_CODE.ONLY_ALLOW_TRANSFER_PROFILES_NOT_AUTHORIZED) {
        enqueueSnackbar(t('systemNotify.error.notAllowTransfer'), { variant: 'error' });
      } else if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.send'), { variant: 'error' });
      } else if (error?.error_fields) {
        formatErrorFields(error?.error_fields, (message) =>
          enqueueSnackbar(message, { variant: 'error' })
        );
      } else {
        enqueueSnackbar(error?.message || t('systemNotify.error.transfer'), { variant: 'error' });
      }
    } finally {
      setReceiver('');
      onClose();
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      closeButtonName={t('dialog.transferProfile.actions.cancel')}
      onClose={() => {
        setReceiver('');
        setErrors((prev) => ({ ...prev, receiver: '' }));
        onClose();
      }}
      title={t('dialog.transferProfile.header')}
      content={
        <Stack spacing={3}>
          <Typography variant="body1">{t('dialog.transferProfile.subheader1')}</Typography>
          <TextField
            required
            error={!!errors?.receiver}
            helperText={errors?.receiver}
            focused={!!errors?.receiver}
            label={t('dialog.transferProfile.label')}
            placeholder={t('dialog.transferProfile.placeholder')}
            defaultValue={receiver}
            onChange={debounce(
              (event) => {
                setErrors((prev) => ({ ...prev, receiver: '' }));
                setReceiver(event.target.value);
              },
              [500]
            )}
          />
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          onClick={handleSendProfile}
        >
          {t('dialog.transferProfile.actions.transfer')}
        </LoadingButton>
      }
    />
  );
};

export default TransferSingleDialog;

TransferSingleDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleResetData: PropTypes.func,
  id: PropTypes.number,
  workspaceId: PropTypes.string.isRequired,
};
