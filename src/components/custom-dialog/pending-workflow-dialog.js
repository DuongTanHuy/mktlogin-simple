import PropTypes from 'prop-types';

// mui
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
// api
// components
import { memo, useState } from 'react';
import { useLocales } from 'src/locales';
import { isElectron } from 'src/utils/commom';
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import { unpublishWorkFlowApi } from 'src/api/publish-workflow.api';

//----------------------------------------------------------------

const PendingWorkflowDialog = ({ open, onClose, workflowInfo, handleReloadData }) => {
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
      setLoading(false);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack>
          <Typography sx={{ pb: 1 }} variant="h6">
            {t('workflow.pendingWorkflow.title')}
          </Typography>
          <Divider />
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ pb: 1.5 }}>{t('workflow.pendingWorkflow.subTitle')}</Typography>
        <Typography sx={{ pb: 1.5 }}>
          Hotline 1 (8h00 - 17h30): <span style={{ fontWeight: 600 }}>0388.667.256</span> <br />
          Hotline 2 (19h00 - 23h00): <span style={{ fontWeight: 600 }}>0355.366.061</span>
          <br />
          Hotline 24/7: <span style={{ fontWeight: 600 }}>0935.322.178</span>
          <br />
        </Typography>
        <Typography>
          {t('workflow.pendingWorkflow.groupSupport')}:
          <br />
          <Link
            noWrap
            variant="body2"
            sx={{ cursor: 'pointer', fontWeight: 'bold!important' }}
            onClick={() => {
              if (isElectron()) {
                window.ipcRenderer.send('open-external', 'https://t.me/+WXzG2TKRmRk4N2Rl');
              } else {
                window.open('https://t.me/+WXzG2TKRmRk4N2Rl', '_blank', 'noopener noreferrer');
              }
            }}
          >
            https://t.me/+WXzG2TKRmRk4N2Rl
          </Link>
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          pt: 0,
        }}
      >
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
            {t('dialog.publicWorkflow.actions.cancelRequest')}
          </LoadingButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

const areEqual = (prevProps, nextProps) => prevProps.open === nextProps.open;

export default memo(PendingWorkflowDialog, areEqual);

PendingWorkflowDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  workflowInfo: PropTypes.object,
  handleReloadData: PropTypes.func,
};
