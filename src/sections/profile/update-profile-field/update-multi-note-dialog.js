import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { Stack, TextField, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label, { CustomLabel } from 'src/components/label';
// apis
import { ERROR_CODE, NUM_ID_DISPLAY } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { updateMultiNoteApi } from 'src/api/profile.api';
import { useAuthContext } from 'src/auth/hooks';

const UpdateMultiNoteDialog = ({ open, onClose, profileIds, handleReLoadData }) => {
  const { workspace_id } = useAuthContext();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const { t } = useLocales();

  const handleClose = () => {
    onClose();
    setNote('');
    setNumItem(NUM_ID_DISPLAY);
  };

  const handleUpdateNote = async () => {
    try {
      setLoading(true);

      const payload = {
        profile_ids: profileIds,
        note,
      };

      await updateMultiNoteApi(workspace_id, payload);

      handleReLoadData();
      enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.group.move'), {
          variant: 'error',
        });
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={handleClose}
      closeButtonName={t('dialog.moveGroup.actions.cancel')}
      title={t('dialog.updateNote.title')}
      content={
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="body1">{t('dialog.updateNote.subTitle')}</Typography>
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              mb={1}
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
            fullWidth
            multiline
            rows={4}
            label={t('quickAction.note.label')}
            placeholder={t('quickAction.note.placeholder')}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          onClick={handleUpdateNote}
          disabled={profileIds?.length === 0}
        >
          {t('quickAction.actions.update')}
        </LoadingButton>
      }
    />
  );
};

export default UpdateMultiNoteDialog;

UpdateMultiNoteDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReLoadData: PropTypes.func,
  profileIds: PropTypes.array,
};
