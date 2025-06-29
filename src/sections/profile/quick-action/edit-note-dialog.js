import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

import { LoadingButton } from '@mui/lab';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { updateProfileApi } from 'src/api/profile.api';
import { enqueueSnackbar } from 'notistack';
import { ERROR_CODE } from 'src/utils/constance';

const EditNoteDialog = ({ open, onClose, profileNote, profileId, handleUpdateAfterEdit }) => {
  const { workspace_id } = useAuthContext();
  const { t } = useLocales();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await updateProfileApi(workspace_id, profileId, { note });

      enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
      handleUpdateAfterEdit(profileId, 'note', note);
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.error.notPermission.updateNote'), { variant: 'error' });
      } else {
        enqueueSnackbar(t('systemNotify.error.update'), { variant: 'error' });
      }
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    setNote(profileNote);
  };

  useEffect(() => {
    setNote(profileNote || '');
  }, [profileNote, open]);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle sx={{ pb: 2 }}>{t('quickAction.note.title')}</DialogTitle>
      <DialogContent
        sx={{
          pt: '8px!important',
        }}
      >
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t('quickAction.note.label')}
          placeholder={t('quickAction.note.placeholder')}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          {t('quickAction.actions.close')}
        </Button>
        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={profileNote === note}
        >
          {t('quickAction.actions.update')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditNoteDialog;

EditNoteDialog.propTypes = {
  onClose: PropTypes.func,
  handleUpdateAfterEdit: PropTypes.func,
  open: PropTypes.bool,
  profileNote: PropTypes.string,
  profileId: PropTypes.number,
};
