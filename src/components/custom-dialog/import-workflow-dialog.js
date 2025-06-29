import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { importWorkflow } from 'src/api/workflow.api';
import { useAuthContext } from 'src/auth/hooks';
import { useLocales } from 'src/locales';
import { ERROR_CODE, OVERWRITE_ID } from 'src/utils/constance';
import { getStorage, removeStorage, setStorage } from 'src/hooks/use-local-storage';
import Label from '../label';

const ImportWorkflowDialog = ({ open, onClose, items, getListAfterImport }) => {
  const configId = getStorage(OVERWRITE_ID);
  const { t } = useLocales();
  const { workspace_id } = useAuthContext();
  const [importCode, setImportCode] = useState('');
  const [overwriteId, setOverwriteId] = useState(-1);
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (importCode) {
      try {
        setLoading(true);
        const payload = {
          activation_code: importCode,
          ...(overwriteId !== -1 && {
            overwrite_workflow_id: overwriteId,
          }),
        };
        await importWorkflow(workspace_id, payload);

        if (overwriteId !== -1) {
          setStorage(OVERWRITE_ID, overwriteId);
        } else {
          removeStorage(OVERWRITE_ID);
        }

        await getListAfterImport(workspace_id);

        enqueueSnackbar(t('systemNotify.success.add'), { variant: 'success' });
      } catch (error) {
        if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
          enqueueSnackbar(t('systemNotify.warning.notPermission.workflow.import'), {
            variant: 'error',
          });
        } else {
          const errorCode = error?.error_code;
          const activationError = error?.error_fields?.activation_code?.[0];

          if (errorCode) {
            const errorMessage = {
              [ERROR_CODE.ACTIVATION_CODE_EXPIRED]: 'systemNotify.error.code_expired',
              [ERROR_CODE.ACTIVATION_CODE_LIMITED]: 'systemNotify.error.code_limit',
            }[errorCode];

            enqueueSnackbar(t(errorMessage || 'systemNotify.error.add'), { variant: 'error' });
          } else if (activationError) {
            enqueueSnackbar(t(`systemNotify.error.${activationError}`), { variant: 'error' });
          } else {
            enqueueSnackbar(t('systemNotify.error.add'), { variant: 'error' });
          }
        }
      } finally {
        handleClose();
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    onClose();
    setImportCode('');
  };

  useEffect(() => {
    if (open) {
      const isExist = items.some((item) => item.id === configId);
      if (isExist) {
        setOverwriteId(configId);
      } else {
        setOverwriteId(-1);
      }
    }
  }, [configId, items, open]);

  return (
    <Dialog fullWidth maxWidth="xs" onClose={handleClose} open={open}>
      <DialogTitle
        sx={{
          pb: 0,
        }}
      >
        {t('workflow.script.dialog.import.title')}
      </DialogTitle>
      <DialogContent
        sx={{
          '&.MuiDialogContent-root': {
            pt: 3,
          },
        }}
      >
        <Stack spacing={2}>
          <TextField
            fullWidth
            size="small"
            value={importCode}
            label={t('workflow.script.dialog.import.label.code')}
            onChange={(event) => setImportCode(event.target.value)}
          />
          <TextField
            select
            fullWidth
            size="small"
            label={t('workflow.script.dialog.import.label.overwrite')}
            value={overwriteId}
            onChange={(event) => {
              setOverwriteId(event.target.value);
            }}
            sx={{
              '& .MuiInputBase-root > div span': {
                display: 'none',
              },
              '& .MuiInputBase-root > div p': {
                m: 0,
              },
            }}
          >
            <MenuItem value={-1} sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              {t('workflow.script.dialog.import.noOverwrite')}
            </MenuItem>
            <Divider sx={{ borderStyle: 'dashed' }} />
            {items.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                <Label
                  color={option.type === 'script' ? 'warning' : 'secondary'}
                  sx={{
                    flexShrink: 0,
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">{`${t(
                    `dialog.rpa.${option.type}`
                  )}`}</Typography>
                </Label>
                <Label
                  color={option.is_downloaded ? 'info' : 'primary'}
                  sx={{
                    flexShrink: 0,
                    ml: 1,
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">{`${
                    option.is_downloaded ? t('dialog.rpa.download') : t('dialog.rpa.mine')
                  }`}</Typography>
                </Label>
                <Typography
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    ml: 1,
                  }}
                >
                  {option.name}
                </Typography>
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={handleClose}>
            {t('workflow.script.actions.cancel')}
          </Button>
          <LoadingButton loading={loading} variant="contained" onClick={handleImport}>
            {t('workflow.script.actions.import')}
          </LoadingButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ImportWorkflowDialog;

ImportWorkflowDialog.propTypes = {
  open: PropTypes.bool,
  items: PropTypes.array,
  onClose: PropTypes.func,
  getListAfterImport: PropTypes.func,
};
