import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useLocales } from 'src/locales';

export default function AlertDialogBasic({ isOpen, onAction }) {
  const { t } = useLocales();

  return (
    <Dialog
      open={isOpen}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{t('dialog.askBeforeLeave.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {t('dialog.askBeforeLeave.subTitle')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onAction('yes')} color="primary">
          {t('dialog.askBeforeLeave.actions.leave')}
        </Button>
        <Button onClick={() => onAction('back')} color="primary" autoFocus>
          {t('dialog.askBeforeLeave.actions.stay')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AlertDialogBasic.propTypes = {
  isOpen: PropTypes.bool,
  onAction: PropTypes.func,
};
