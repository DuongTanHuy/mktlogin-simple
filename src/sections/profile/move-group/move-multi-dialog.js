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
import { moveGroupProfileApi } from 'src/api/profile.api';
import { ERROR_CODE, NUM_ID_DISPLAY } from 'src/utils/constance';
import { useLocales } from 'src/locales';

const MoveMultiDialog = ({
  open,
  onClose,
  profileIds,
  listButton,
  workspaceId,
  handleReLoadData,
  handleReloadBalance,
}) => {
  const [group, setGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const { t } = useLocales();
  const [errorMess, setErrorMess] = useState('');

  const handleClose = () => {
    onClose();
    setNumItem(NUM_ID_DISPLAY);
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
      const payload = {
        profile_id: profileIds,
        group_id: group,
      };
      if (workspaceId) {
        await moveGroupProfileApi(workspaceId, payload);
        handleReLoadData();
        handleReloadBalance();
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
          <Stack spacing={1}>
            <Typography variant="body1">{t('dialog.moveGroup.subheader')}</Typography>
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
            {listButton && listButton.length > 0 ? (
              listButton.map((option) => (
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
          disabled={profileIds?.length === 0}
        >
          {t('dialog.moveGroup.actions.move')}
        </LoadingButton>
      }
    />
  );
};

export default MoveMultiDialog;

MoveMultiDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReLoadData: PropTypes.func,
  handleReloadBalance: PropTypes.func,
  profileIds: PropTypes.array,
  listButton: PropTypes.array,
  workspaceId: PropTypes.string.isRequired,
};
