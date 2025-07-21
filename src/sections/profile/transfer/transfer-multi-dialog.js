import { useState } from 'react';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { Stack, TextField, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label, { CustomLabel } from 'src/components/label';
// apis
import { transferProfilesApi } from 'src/api/profile.api';
import { useLocales } from 'src/locales';
import { ERROR_CODE, NUM_ID_DISPLAY } from 'src/utils/constance';
import { formatErrorFields } from 'src/utils/format-errors';

const TransferMultiDialog = ({ open, onClose, profileIds, workspaceId, handleResetData }) => {
  const [receiver, setReceiver] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const { t } = useLocales();

  const handleClose = () => {
    onClose();
    setNumItem(NUM_ID_DISPLAY);
  };

  const handleSendProfiles = async () => {
    if (receiver === '') {
      setErrors((prev) => ({ ...prev, receiver: t('dialog.transferProfile.errorMess') }));
      return;
    }
    try {
      setLoading(true);
      const payload = {
        profile_id: profileIds,
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
      handleClose();
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
        handleClose();
      }}
      title={t('dialog.transferProfile.header')}
      content={
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="body1">{t('dialog.transferProfile.subheader')}</Typography>
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              sx={{
                typography: 'body2',
                color: 'error.main',
              }}
            >
              {profileIds?.length > 0
                ? profileIds.slice(0, numItem).map((profileId) => (
                    <Label
                      key={profileId}
                      color="primary"
                      sx={{
                        p: 2,
                      }}
                    >
                      {profileId}
                    </Label>
                  ))
                : t('quickAction.expiredProfile')}
              {profileIds.length > NUM_ID_DISPLAY && (
                <CustomLabel length={profileIds.length} numItem={numItem} setNumItem={setNumItem} />
              )}
            </Stack>
          </Stack>
          {/* <TextField
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
          /> */}
          <TextField
            fullWidth
            error={!!errors?.receiver}
            focused={!!errors?.receiver}
            helperText={errors?.receiver}
            label={t('dialog.transferProfile.label')}
            placeholder={t('dialog.transferProfile.placeholder')}
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
          onClick={handleSendProfiles}
          disabled={profileIds?.length === 0}
        >
          {t('dialog.transferProfile.actions.transfer')}
        </LoadingButton>
      }
    />
  );
};

export default TransferMultiDialog;

TransferMultiDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleResetData: PropTypes.func,
  profileIds: PropTypes.array,
  workspaceId: PropTypes.string.isRequired,
};
