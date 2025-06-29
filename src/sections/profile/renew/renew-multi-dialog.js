import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { MenuItem, Stack, TextField, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label, { CustomLabel } from 'src/components/label';
// apis
import { renewProfilesApi } from 'src/api/profile.api';
import { ERROR_CODE, NUM_ID_DISPLAY, RENEW_OPTIONS } from 'src/utils/constance';
import { useLocales } from 'src/locales';

const RenewMultiDialog = ({
  open,
  onClose,
  profileIds,
  workspaceId,
  handleReLoadData,
  handleReloadBalance,
}) => {
  const [nMonth, setNMonth] = useState(1);
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
        profile_id: profileIds,
        n_month: nMonth,
      };
      if (workspaceId) {
        await renewProfilesApi(workspaceId, payload);
        handleReLoadData();
        enqueueSnackbar(t('systemNotify.success.renew'), { variant: 'success' });
        handleReloadBalance();
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.renew'), {
          variant: 'error',
        });
      } else if (error?.error_code === ERROR_CODE.INSUFFICIENT_PROFILE_BALANCE) {
        enqueueSnackbar(t('systemNotify.warning.notEnoughProfileBalance'), { variant: 'error' });
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
      title={t('dialog.renewProfile.header')}
      content={
        <Stack spacing={3}>
          <Typography variant="body1">{t('dialog.renewProfile.subheader')}</Typography>
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
          <TextField
            select
            label={t('dialog.renewProfile.numOfMonth')}
            value={nMonth}
            fullWidth
            onChange={(event) => setNMonth(event.target.value)}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 200,
                  },
                },
              },
            }}
          >
            {RENEW_OPTIONS.map((option) => (
              <MenuItem key={option.id} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Typography>
            {`${t('dialog.renewProfile.totalCost')} `}
            <Typography component="span" color="primary">
              {profileIds.length * nMonth}
            </Typography>
            {` (${t('dialog.renewProfile.profileBalance')})`}
          </Typography>
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          onClick={handleRenewProfiles}
        >
          {t('dialog.renewProfile.actions.renew')}
        </LoadingButton>
      }
    />
  );
};

export default RenewMultiDialog;

RenewMultiDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  profileIds: PropTypes.array,
  workspaceId: PropTypes.string.isRequired,
  handleReLoadData: PropTypes.func,
  handleReloadBalance: PropTypes.func,
};
