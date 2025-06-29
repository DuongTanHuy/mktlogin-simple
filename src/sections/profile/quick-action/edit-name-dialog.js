import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';

import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { updateProfileApi } from 'src/api/profile.api';
import { enqueueSnackbar } from 'notistack';

const EditNameDialog = ({ open, onClose, profileName, profileId, handleUpdateAfterEdit }) => {
  const { workspace_id } = useAuthContext();
  const { t } = useLocales();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [errorMessages, setErrorMessages] = useState('');

  const handleConfirm = async () => {
    if (name === '') {
      setErrorMessages(t('quickAction.name.error'));
      return;
    }
    try {
      setErrorMessages('');
      setLoading(true);
      await updateProfileApi(workspace_id, profileId, { name });

      handleUpdateAfterEdit(profileId, 'name', name);
      enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
    } catch (error) {
      console.log();
      enqueueSnackbar(t('systemNotify.error.update'), { variant: 'error' });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    setErrorMessages('');
    setName(profileName);
  };

  useEffect(() => {
    setName(profileName || '');
  }, [profileName, open]);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle sx={{ pb: 2 }}>{t('quickAction.name.title')}</DialogTitle>
      <DialogContent
        sx={{
          pt: '8px!important',
        }}
      >
        <TextField
          fullWidth
          label={t('quickAction.name.label')}
          placeholder={t('quickAction.name.placeholder')}
          error={!!errorMessages}
          helperText={errorMessages}
          value={name}
          onChange={(event) => setName(event.target.value)}
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
          disabled={profileName === name}
        >
          {t('quickAction.actions.update')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditNameDialog;

EditNameDialog.propTypes = {
  onClose: PropTypes.func,
  handleUpdateAfterEdit: PropTypes.func,
  open: PropTypes.bool,
  profileName: PropTypes.string,
  profileId: PropTypes.number,
};
