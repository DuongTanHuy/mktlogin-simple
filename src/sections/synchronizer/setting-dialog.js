import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFCheckbox, RHFMultiCheckbox, RHFTextField } from 'src/components/hook-form';
import { LoadingButton } from '@mui/lab';
import { ColorPicker } from 'src/components/color-utils';
import Scrollbar from 'src/components/scrollbar';
import { useLocales } from 'src/locales';

const SettingDialog = ({ open, onClose }) => {
  const { t } = useLocales();
  const SettingSchema = Yup.object().shape({});

  const defaultValues = {
    keyboard: true,
    mouse: [],
    typeFrom: 0,
    typeTo: 0,
    clickFrom: 0,
    clickTo: 0,
    colors: '',
    hkStart: '',
    hkStop: '',
    hkRestart: '',
    hkConsole: '',
    hkTitleWindow: '',
  };

  const methods = useForm({
    resolver: yupResolver(SettingSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { isSubmitting },
  } = methods;

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data);
    } catch (error) {
      /* empty */
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: (theme) => theme.customShadows.z4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4" marginRight="auto">
              {t('synchronizer.dialog.setting.title')}
            </Typography>
            <IconButton onClick={handleClose}>
              <Iconify icon="ic:round-close" />
            </IconButton>
          </Stack>
          <Divider />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ typography: 'body2', p: 0 }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Scrollbar
            sx={{
              maxHeight: 500,
              mb: 9,
              mx: 2,
              px: 2,
            }}
          >
            <Stack spacing={2}>
              <SettingTab title={t('synchronizer.dialog.setting.labels.keyboard')}>
                <RHFCheckbox
                  name="keyboard"
                  label={t('synchronizer.dialog.setting.labels.typeAtOnce')}
                />
              </SettingTab>
              <SettingTab title={t('synchronizer.dialog.setting.labels.mouse')}>
                <RHFMultiCheckbox
                  row
                  name="mouse"
                  options={[
                    { value: 'click', label: t('synchronizer.dialog.setting.labels.clickAtOnce') },
                    {
                      value: 'scroll',
                      label: t('synchronizer.dialog.setting.labels.scrollAtOnce'),
                    },
                    { value: 'move', label: t('synchronizer.dialog.setting.labels.moveAtOnce') },
                  ]}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 0.3fr)',
                  }}
                />
              </SettingTab>
              <SettingTab title={t('synchronizer.dialog.setting.labels.simulateActions')}>
                <Stack
                  spacing={1}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                  }}
                >
                  <ChildrenTab title={t('synchronizer.dialog.setting.labels.typingSpeed')}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        whiteSpace: 'nowrap',
                      }}
                      alignItems="center"
                      justifyContent="space-around"
                    >
                      {t('synchronizer.dialog.setting.labels.randomFrom')}
                      <RHFTextField
                        size="small"
                        type="number"
                        name="typeFrom"
                        sx={{
                          width: 160,
                        }}
                      />
                      {t('synchronizer.dialog.setting.labels.to')}
                      <RHFTextField
                        size="small"
                        type="number"
                        name="typeTo"
                        sx={{
                          width: 160,
                        }}
                      />
                      {t('synchronizer.dialog.setting.labels.ms')}
                    </Stack>
                  </ChildrenTab>
                  <ChildrenTab title="Click speed">
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        whiteSpace: 'nowrap',
                      }}
                      alignItems="center"
                      justifyContent="space-around"
                    >
                      {t('synchronizer.dialog.setting.labels.randomFrom')}
                      <RHFTextField
                        size="small"
                        type="number"
                        name="clickFrom"
                        sx={{
                          width: 160,
                        }}
                      />
                      {t('synchronizer.dialog.setting.labels.to')}
                      <RHFTextField
                        size="small"
                        type="number"
                        name="clickTo"
                        sx={{
                          width: 160,
                        }}
                      />
                      {t('synchronizer.dialog.setting.labels.ms')}
                    </Stack>
                  </ChildrenTab>
                </Stack>
              </SettingTab>
              <SettingTab
                title={
                  <Typography component="span">
                    {t('synchronizer.dialog.setting.labels.color')}
                  </Typography>
                }
              >
                <Controller
                  name="colors"
                  control={control}
                  render={({ field }) => (
                    <ColorPicker
                      colors={['#FFC107', '#3F51B5', '#4CAF50', '#F44336']}
                      selected={field.value}
                      onSelectColor={(color) => field.onChange(color)}
                    />
                  )}
                />
              </SettingTab>
              <SettingTab title={t('synchronizer.dialog.setting.labels.hotkey')}>
                <Stack
                  spacing={2}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                    width: 'fit-content',
                  }}
                >
                  {[
                    { value: 'hkStart', label: t('synchronizer.dialog.setting.labels.startSync') },
                    { value: 'hkStop', label: t('synchronizer.dialog.setting.labels.stopSync') },
                    { value: 'hkRestart', label: t('synchronizer.dialog.setting.labels.restart') },
                    { value: 'hkConsole', label: t('synchronizer.dialog.setting.labels.console') },
                    {
                      value: 'hkTitleWindow',
                      label: t('synchronizer.dialog.setting.labels.titleWindows'),
                    },
                  ].map((item) => (
                    <ChildrenTab key={item.value} width1={3} width2={9} title={item.label}>
                      <RHFTextField
                        name={item.value}
                        size="small"
                        onChange={(event) =>
                          setValue(
                            item.value,
                            event.target.value
                              .slice(-1)
                              .replace(/[^a-zA-Z\s]/g, '')
                              .toUpperCase()
                          )
                        }
                        InputProps={{
                          startAdornment: <Typography color="text.secondary">Ctrl+Alt+</Typography>,
                        }}
                      />
                    </ChildrenTab>
                  ))}
                </Stack>
              </SettingTab>
            </Stack>
          </Scrollbar>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              position: 'absolute',
              bottom: 24,
              right: 24,
            }}
          >
            <Button variant="contained" onClick={handleClose}>
              {t('synchronizer.actions.cancel')}
            </Button>
            <LoadingButton type="submit" loading={isSubmitting} variant="contained" color="primary">
              {t('synchronizer.actions.save')}
            </LoadingButton>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default SettingDialog;

SettingDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

//-------------------------------------------------------------------------

function SettingTab({ title, children }) {
  return (
    <Stack spacing={1}>
      <Typography color="text.secondary">{title}</Typography>
      {children}
    </Stack>
  );
}

SettingTab.propTypes = {
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  children: PropTypes.node,
};
//-------------------------------------------------------------------------

function ChildrenTab({ title, children, width1 = 2, width2 = 10 }) {
  return (
    <Grid container spacing={3} alignItems="center">
      <Grid item xs={width1} textAlign="left" whiteSpace="nowrap">
        {title}
      </Grid>
      <Grid item xs={width2}>
        {children}
      </Grid>
    </Grid>
  );
}

ChildrenTab.propTypes = {
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  children: PropTypes.node,
  width1: PropTypes.number,
  width2: PropTypes.number,
};
