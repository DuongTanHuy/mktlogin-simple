import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import PropTypes from 'prop-types';
// mui
import { LoadingButton } from '@mui/lab';
import { MenuItem, Stack, TextField, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
// api
import { renewProfilesApi } from 'src/api/profile.api';
import { ERROR_CODE, RENEW_OPTIONS } from 'src/utils/constance';
import { useLocales } from 'src/locales';

const RenewSingleDialog = ({
  open,
  onClose,
  id,
  workspaceId,
  handleResetData,
  handleReloadBalance,
}) => {
  const [nMonth, setNMonth] = useState(1);
  const [loading, setLoading] = useState(false);
  const { t } = useLocales();

  const handleRenewProfiles = async () => {
    try {
      setLoading(true);
      const payload = {
        profile_id: [id],
        n_month: nMonth,
      };
      if (workspaceId) {
        await renewProfilesApi(workspaceId, payload);
        handleResetData();
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
          handleResetData();
          enqueueSnackbar(t('systemNotify.error.invalidProfile'), { variant: 'error' });
        } else {
          enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
        }
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
      closeButtonName={t('dialog.renewProfile.actions.cancel')}
      title={t('dialog.renewProfile.header1')}
      content={
        <Stack spacing={3} mt={1}>
          <TextField
            select
            label={t('dialog.renewProfile.numOfDay')}
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
              {nMonth}
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

export default RenewSingleDialog;

RenewSingleDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReloadBalance: PropTypes.func,
  id: PropTypes.number,
  workspaceId: PropTypes.string.isRequired,
  handleResetData: PropTypes.func.isRequired,
};
