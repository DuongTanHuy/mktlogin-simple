import PropTypes from 'prop-types';

// mui
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
// api
// components
import { memo, useState } from 'react';
import { useLocales } from 'src/locales';
import { unpublishWorkFlowApi } from 'src/api/publish-workflow.api';
import { enqueueSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';

//----------------------------------------------------------------

const RejectedWorkflowDialog = ({ open, onClose, workflowInfo, handleReloadData }) => {
  const { t } = useLocales();
  const [loading, setLoading] = useState(false);

  const unpublishWorkflow = async () => {
    try {
      setLoading(true);
      await unpublishWorkFlowApi(workflowInfo?.public_workflow?.id);
      onClose();
      handleReloadData();
      enqueueSnackbar(t('systemNotify.success.title'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(true);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack>
          <Typography sx={{ pb: 1 }} variant="h6">
            {t('workflow.rejectedWorkflow.title')}
          </Typography>
          <Divider />
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography>{t('workflow.rejectedWorkflow.reason')}</Typography>
        <Typography sx={{ pb: 1.5, pl: 1, whiteSpace: 'pre-line' }}>
          {workflowInfo?.public_workflow?.reject_message || '- Error code'}
        </Typography>
        <Typography>{t('workflow.rejectedWorkflow.subTitle')}</Typography>
      </DialogContent>

      <DialogActions>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={onClose}>
            {t('workflow.script.actions.close')}
          </Button>
          <LoadingButton
            loading={loading}
            variant="contained"
            color="error"
            onClick={() => unpublishWorkflow()}
          >
            {t('dialog.publicWorkflow.actions.unpublish')}
          </LoadingButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

const areEqual = (prevProps, nextProps) => prevProps.open === nextProps.open;

export default memo(RejectedWorkflowDialog, areEqual);

RejectedWorkflowDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReloadData: PropTypes.func,
  workflowInfo: PropTypes.object,
};
