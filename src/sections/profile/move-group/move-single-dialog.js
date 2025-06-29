import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { MenuItem, Stack, TextField, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
// api
import { moveGroupProfileApi } from 'src/api/profile.api';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { useBalanceContext } from 'src/account-balance/context/balance-context';
import { useAuthContext } from '../../../auth/hooks';

const MoveSingleDialog = ({ open, onClose, profileId, groupOption, handleResetData }) => {
  const { t } = useLocales();
  const [group, setGroup] = useState('');
  const [errorMess, setErrorMess] = useState('');
  const { workspace_id: workspaceId } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const { updateRefreshBalance } = useBalanceContext();

  const handleClose = () => {
    onClose();
    setGroup('');
    setErrorMess('');
  };

  const handleMoveGroupProfiles = async () => {
    if (group === '') {
      setErrorMess(t('dialog.moveGroup.error'));
      return;
    }
    try {
      setLoading(true);
      if (workspaceId) {
        const payload = {
          profile_id: [profileId],
          group_id: group,
        };
        await moveGroupProfileApi(workspaceId, payload);
        handleResetData();
        updateRefreshBalance();
        enqueueSnackbar(t('systemNotify.success.moveGroup'), { variant: 'success' });
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.group.move'), {
          variant: 'error',
        });
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
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
      closeButtonName={t('dialog.moveGroup.actions.cancel')}
      title={t('dialog.moveGroup.header')}
      content={
        <Stack spacing={3}>
          <Typography variant="body1">{t('dialog.moveGroup.singleMove')}</Typography>
          <TextField
            error={!!errorMess}
            helperText={errorMess}
            select
            fullWidth
            label={t('dialog.moveGroup.label')}
            value={group}
            onChange={(event) => {
              if (errorMess) setErrorMess('');
              setGroup(event.target.value);
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    '&::-webkit-scrollbar': {
                      width: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: (theme) => theme.palette.grey[500],
                      borderRadius: '4px',
                    },
                  },
                },
              },
            }}
          >
            {groupOption && groupOption.length > 0 ? (
              groupOption.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="">No group</MenuItem>
            )}
          </TextField>
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          onClick={handleMoveGroupProfiles}
        >
          {t('dialog.moveGroup.actions.move')}
        </LoadingButton>
      }
    />
  );
};

export default MoveSingleDialog;

MoveSingleDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  profileId: PropTypes.number,
  groupOption: PropTypes.array,
  handleResetData: PropTypes.func,
};
