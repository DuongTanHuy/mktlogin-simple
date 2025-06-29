import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

// ----------------------------------------------------------------------

export default function ConfirmDialog({
  title,
  content,
  action,
  open,
  onClose,
  onlyButton = false,
  disableButtonAction = false,
  closeButtonName = 'Đóng',
  closeIcon,
  ...other
}) {
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={!onlyButton ? onClose : () => {}}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: (theme) => theme.customShadows.z4,
        },
      }}
      {...other}
    >
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>
      {closeIcon}
      {content && <DialogContent sx={{ typography: 'body2' }}> {content} </DialogContent>}

      <DialogActions>
        {!disableButtonAction && (
          <Button variant="contained" color="inherit" onClick={onClose}>
            {closeButtonName}
          </Button>
        )}
        {action}
      </DialogActions>
    </Dialog>
  );
}

ConfirmDialog.propTypes = {
  action: PropTypes.node,
  content: PropTypes.node,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  onlyButton: PropTypes.bool,
  closeButtonName: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  closeIcon: PropTypes.node,
  disableButtonAction: PropTypes.bool,
};
