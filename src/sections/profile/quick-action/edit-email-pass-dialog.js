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
import { enqueueSnackbar } from 'notistack';
import { updateAccountResourceApi } from 'src/api/profile.api';

const EditEmailPassDialog = ({
  open,
  onClose,
  profileEmailPass,
  profileId,
  handleUpdateAfterEdit,
  resourceType,
}) => {
  const { workspace_id } = useAuthContext();
  const { t } = useLocales();
  const [loading, setLoading] = useState(false);
  const [passEmail, setPassEmail] = useState('');

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const payload = {
        pass_email: passEmail,
      };
      await updateAccountResourceApi(workspace_id, profileId, resourceType, payload);

      handleUpdateAfterEdit(profileId, 'pass_email', passEmail);
      enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('systemNotify.error.update'), { variant: 'error' });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    setPassEmail(profileEmailPass);
  };

  useEffect(() => {
    setPassEmail(profileEmailPass || '');
  }, [profileEmailPass, open]);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle sx={{ pb: 2 }}>{t('quickAction.emailPass.title')}</DialogTitle>
      <DialogContent
        sx={{
          pt: '8px!important',
        }}
      >
        <TextField
          fullWidth
          label={t('quickAction.emailPass.label')}
          placeholder={t('quickAction.emailPass.placeholder')}
          value={passEmail}
          onChange={(event) => setPassEmail(event.target.value)}
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
          disabled={profileEmailPass === passEmail}
        >
          {t('quickAction.actions.update')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditEmailPassDialog;

EditEmailPassDialog.propTypes = {
  onClose: PropTypes.func,
  handleUpdateAfterEdit: PropTypes.func,
  open: PropTypes.bool,
  profileEmailPass: PropTypes.string,
  resourceType: PropTypes.string,
  profileId: PropTypes.number,
};
