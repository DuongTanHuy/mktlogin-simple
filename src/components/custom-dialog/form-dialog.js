import PropTypes from 'prop-types';
// @mui
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { useForm } from 'react-hook-form';
import FormProvider from '../hook-form';

// ----------------------------------------------------------------------

export default function FormDialog({
  title,
  content,
  open,
  onClose,
  defaultValues,
  handleSubmitForm,
  ...other
}) {
  const methods = useForm({
    defaultValues,
  });

  const { handleSubmit } = methods;

  const onSubmit = handleSubmit(async (data) => handleSubmitForm(data));
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      <DialogContent sx={{ typography: 'body2' }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          {content}
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

FormDialog.propTypes = {
  content: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  defaultValues: PropTypes.object.isRequired,
  handleSubmitForm: PropTypes.func.isRequired,
  open: PropTypes.bool,
  title: PropTypes.string,
};
