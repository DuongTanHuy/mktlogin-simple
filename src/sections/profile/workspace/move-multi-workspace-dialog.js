import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { MenuItem, Stack, TextField, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label, { CustomLabel } from 'src/components/label';
// apis
import { ERROR_CODE, NUM_ID_DISPLAY } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { getListWorkspace } from 'src/api/workspace.api';
import { moveWorkspaceApi } from 'src/api/profile.api';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';

const MoveMultiWorkspaceDialog = ({ open, onClose, profileIds, handleReLoadData }) => {
  const { workspace_id, user } = useAuthContext();
  const [options, setOptions] = useState([]);
  const [workspace, setWorkspace] = useState('');
  const [loading, setLoading] = useState(false);
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const { t } = useLocales();
  const [errorMess, setErrorMess] = useState('');

  const handleClose = () => {
    onClose();
    setNumItem(NUM_ID_DISPLAY);
    setWorkspace('');
    setErrorMess('');
  };

  const handleMoveGroupProfiles = async () => {
    if (workspace === '') {
      setErrorMess(t('dialog.switchWorkspace.error'));
      return;
    }
    try {
      setLoading(true);
      const payload = {
        profile_ids: profileIds,
        workspace,
      };
      await moveWorkspaceApi(workspace_id, payload);
      handleReLoadData();
      enqueueSnackbar(t('systemNotify.success.title'), { variant: 'success' });
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.group.move'), {
          variant: 'error',
        });
      } else if (error?.error_fields) {
        if (error.error_fields?.profile_ids?.[0] === 'only_allow_move_profiles_not_authorized') {
          enqueueSnackbar(t('systemNotify.error.notAllowTransfer'), { variant: 'error' });
        } else {
          const error_fields = error?.error_fields;
          const keys = Object.keys(error_fields);
          enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
        }
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      handleClose();
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleFetchOptions = async () => {
      try {
        const response = await getListWorkspace({
          is_get_owner_workspace: true,
        });
        const dataWorkspaces = response?.data?.data;
        setOptions(dataWorkspaces);
      } catch (error) {
        /* empty */
      }
    };

    if (open) {
      handleFetchOptions();
    }
  }, [open]);

  return (
    <ConfirmDialog
      open={open}
      onClose={handleClose}
      closeButtonName={t('dialog.switchWorkspace.actions.cancel')}
      title={t('dialog.switchWorkspace.header')}
      content={
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="body1">{t('dialog.switchWorkspace.subheader')}</Typography>
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
            label={t('dialog.switchWorkspace.label')}
            value={workspace}
            onChange={(event) => {
              if (errorMess) setErrorMess('');
              setWorkspace(event.target.value);
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
            sx={{
              '& .MuiSelect-select > svg': {
                display: 'none',
              },
            }}
          >
            {options && options.length > 0 ? (
              options.map((option) => (
                <MenuItem key={option.id} value={option.id} sx={{ px: 3 }}>
                  {option?.is_my_workspace && option?.user_creator?.id === user?.id && (
                    <Iconify
                      icon="charm:key"
                      color="warning.main"
                      width={12}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        transform: 'translate(40%, -50%)',
                      }}
                    />
                  )}
                  {option.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="">No workspace</MenuItem>
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
          {t('dialog.switchWorkspace.actions.switch')}
        </LoadingButton>
      }
    />
  );
};

export default MoveMultiWorkspaceDialog;

MoveMultiWorkspaceDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReLoadData: PropTypes.func,
  profileIds: PropTypes.array,
};
