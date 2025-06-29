import PropTypes from 'prop-types';
// mui
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useLocales } from 'src/locales';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { RHFSwitch, RHFTextField } from '../hook-form';
import FormProvider from '../hook-form/form-provider';
import Iconify from '../iconify/iconify';

//----------------------------------------------------------------

const WorkflowConfigDialog = ({ open, onClose, scriptConfig, setScriptConfig }) => {
  const { t } = useLocales();

  const handleClose = () => {
    if (isDirty) {
      reset(defaultValues);
    }
    onClose();
  };

  const defaultValues = {
    windowWidth: 500,
    windowHeight: 640,
    scale: 0.8,
    isScriptRequest: false,
    isFixedScreenSize: false,
  };

  const methods = useForm({
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    reset,
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    const newDefaultValues = {
      windowWidth: scriptConfig?.windowWidth ?? 500,
      windowHeight: scriptConfig?.windowHeight ?? 640,
      scale: scriptConfig?.scale ?? 0.8,
      isScriptRequest: scriptConfig?.isScriptRequest ?? false,
      isFixedScreenSize: scriptConfig?.isFixedScreenSize ?? false,
    };
    reset(newDefaultValues);
  }, [scriptConfig, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const playload = {
      isFixedScreenSize: data.isFixedScreenSize,
      isScriptRequest: data.isScriptRequest,
    };

    if (data.isFixedScreenSize) {
      playload.windowWidth = data.windowWidth;
      playload.windowHeight = data.windowHeight;
      playload.scale = data.scale;
    }

    setScriptConfig(playload);
    onClose();
  });

  const handleScriptRequestValChange = () => {
    if (watch('isScriptRequest')) {
      methods.setValue('isFixedScreenSize', false);
    }
  };
  return (
    <Dialog
      fullWidth
      open={open}
      sx={{
        '& .MuiDialog-container': {
          '& .MuiPaper-root': {
            width: '600px',
            maxWidth: '100%',
          },
        },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{t('workflow.script.dialog.config.title')}</DialogTitle>
        <Stack spacing={3} p={3} py={0}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <RHFSwitch
                name="isFixedScreenSize"
                label={
                  <Tooltip title={t('workflow.script.dialog.config.tooltip.isFixedScreenSize')}>
                    <Typography variant="body2">
                      {t('workflow.script.dialog.config.label.fixedScreenSize')}
                      <Iconify
                        icon="bi:question-circle"
                        color="info"
                        width={18}
                        height={18}
                        sx={{
                          marginLeft: '5px',
                          verticalAlign: 'middle',
                        }}
                      />
                    </Typography>
                  </Tooltip>
                }
                disabled={watch('isScriptRequest')}
              />
            </Grid>
            {watch('isFixedScreenSize') && (
              <>
                <Grid item xs={6}>
                  <RHFTextField
                    label="Screen Width"
                    name="windowWidth"
                    size="small"
                    type="number"
                  />
                </Grid>
                <Grid item xs={6}>
                  <RHFTextField
                    label="Sreen Height"
                    name="windowHeight"
                    size="small"
                    type="number"
                  />
                </Grid>
                <Grid item xs={6}>
                  <RHFTextField label="Scale" name="scale" size="small" type="number" />
                </Grid>
              </>
            )}
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <RHFSwitch
                name="isScriptRequest"
                label={
                  <Tooltip title={t('workflow.script.dialog.config.tooltip.isScriptRequest')}>
                    <Typography variant="body2">
                      Script Request
                      <Iconify
                        icon="bi:question-circle"
                        color="info"
                        width={18}
                        height={18}
                        sx={{
                          marginLeft: '5px',
                          verticalAlign: 'middle',
                        }}
                      />
                    </Typography>
                  </Tooltip>
                }
                onChange={handleScriptRequestValChange}
              />
            </Grid>
          </Grid>
        </Stack>
        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            {t('workflow.script.actions.close')}
          </Button>
          <LoadingButton type="submit" variant="contained" color="primary">
            {t('workflow.script.actions.save')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default WorkflowConfigDialog;

WorkflowConfigDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  setScriptConfig: PropTypes.func,
  scriptConfig: PropTypes.object,
};
