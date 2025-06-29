import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label, { CustomLabel } from 'src/components/label';
// apis
import { ERROR_CODE, NUM_ID_DISPLAY } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { disableAutoRenewProfilesApi, enableAutoRenewProfilesApi } from 'src/api/profile.api';

const AutoRenewMultiDialog = ({
  open,
  onClose,
  profileIds,
  workspaceId,
  handleReLoadData,
  handleReloadBalance,
  autoRenew,
}) => {
  const [loading, setLoading] = useState(false);
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const { t } = useLocales();

  const handleClose = () => {
    onClose();
    setNumItem(NUM_ID_DISPLAY);
  };

  const handleRenewProfiles = async () => {
    try {
      setLoading(true);
      const payload = {
        profile_ids: profileIds,
      };
      if (workspaceId) {
        if (autoRenew) {
          await enableAutoRenewProfilesApi(workspaceId, payload);
        } else {
          await disableAutoRenewProfilesApi(workspaceId, payload);
        }
        enqueueSnackbar(t('systemNotify.success.title'), { variant: 'success' });
        handleReloadBalance();
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(
          t(`systemNotify.warning.notPermission.profile.renew.${autoRenew ? 'on' : 'off'}`),
          {
            variant: 'error',
          }
        );
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        if (error_fields[keys[0]][0] === 'profile_list_invalid') {
          handleReLoadData();
          enqueueSnackbar(t('systemNotify.error.invalidListProfile'), { variant: 'error' });
        } else {
          enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
        }
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      handleClose();
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={handleClose}
      closeButtonName={t('dialog.renewProfile.actions.cancel')}
      title={
        autoRenew
          ? t('dialog.renewProfile.enableAutoRenew.title')
          : t('dialog.renewProfile.disableAutoRenew.title')
      }
      content={
        <Stack spacing={3}>
          <Typography variant="body1">
            {autoRenew
              ? t('dialog.renewProfile.enableAutoRenew.subTitle')
              : t('dialog.renewProfile.disableAutoRenew.subTitle')}
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" mb={1}>
            {profileIds.slice(0, numItem).map((profileId) => (
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
            {profileIds.length > NUM_ID_DISPLAY && (
              <CustomLabel length={profileIds.length} numItem={numItem} setNumItem={setNumItem} />
            )}
          </Stack>
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          onClick={handleRenewProfiles}
        >
          {t('dialog.renewProfile.actions.confirm')}
        </LoadingButton>
      }
    />
  );
};

export default AutoRenewMultiDialog;

AutoRenewMultiDialog.propTypes = {
  open: PropTypes.bool,
  autoRenew: PropTypes.bool,
  onClose: PropTypes.func,
  profileIds: PropTypes.array,
  workspaceId: PropTypes.string.isRequired,
  handleReLoadData: PropTypes.func,
  handleReloadBalance: PropTypes.func,
};
