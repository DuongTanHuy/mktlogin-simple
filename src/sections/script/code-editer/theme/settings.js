import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useId, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import InputAdornment from '@mui/material/InputAdornment';

// components
import FormProvider, { RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { setStorage } from 'src/hooks/use-local-storage';
import { TERMINAL_SETTING } from 'src/utils/constance';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function VScodeSetting({
  onClose,
  updateVScodeSetting,
  terminalSetting,
  setTerminalSetting,
  ...other
}) {
  const reviewFormKey = useId();
  const { t } = useLocales();

  const ReviewSchema = Yup.object().shape({
    fontSize: Yup.number()
      .required(t('validate.required'))
      .min(8, t('validate.fontSize.range'))
      .max(30, t('validate.fontSize.range')),
    minimap: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      fontSize: terminalSetting?.fontSize,
      minimap: terminalSetting?.minimap?.enabled,
    }),
    [terminalSetting]
  );

  const methods = useForm({
    resolver: yupResolver(ReviewSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onCancel = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const submitForm = handleSubmit(async (data) => {
    try {
      const payload = {
        fontSize: data.fontSize,
        minimap: { enabled: data.minimap },
      };

      setTerminalSetting(payload);
      setStorage('terminal', payload);
      onClose();
    } catch (error) {
      console.log('error', error);
    }
  });

  const resetValues = () => {
    const _def = JSON.parse(TERMINAL_SETTING);
    setValue('fontSize', _def.fontSize);
    setValue('minimap', _def.minimap.enabled);
  };

  return (
    <Dialog fullWidth maxWidth="xs" onClose={() => onClose()} {...other}>
      <FormProvider
        keyForm={reviewFormKey}
        methods={methods}
        onSubmit={(event) => submitForm(event)}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between">
            <Typography>{t('workflow.script.dialog.setting.title')}</Typography>
            <Button size="small" onClick={resetValues}>
              {t('workflow.script.dialog.setting.reset')}
            </Button>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack>
                <Typography variant="body2" mb={1}>
                  {t('workflow.script.dialog.setting.fontSize')}
                </Typography>
                <RHFTextField
                  size="small"
                  type="number"
                  name="fontSize"
                  label=""
                  style={{ width: '200px' }}
                  InputProps={{
                    endAdornment: <InputAdornment position="start">px</InputAdornment>,
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">{t('workflow.script.dialog.setting.minimap')}</Typography>
              <RHFSwitch name="minimap" />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onCancel}>
            {t('workflow.script.actions.close')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {t('workflow.script.actions.confirm')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

VScodeSetting.propTypes = {
  onClose: PropTypes.func,
  updateVScodeSetting: PropTypes.func,
  terminalSetting: PropTypes.object,
  setTerminalSetting: PropTypes.func,
};
