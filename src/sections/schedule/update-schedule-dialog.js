import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// mui
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// form
import FormProvider, {
  RHFDateTime,
  RHFRadioGroup,
  RHFSelect,
  RHFTextField,
  RHFTime,
} from 'src/components/hook-form';
// components
import Iconify from 'src/components/iconify';
import { EXECUTION_FREQUENCY_OPTIONS, MONTH_OPTIONS, WEEKLY_OPTIONS } from 'src/utils/constance';
import { useAuthContext } from 'src/auth/hooks';
import { convertTimeStringToDate, toLocalTimeISOString } from 'src/utils/format-time';
import { enqueueSnackbar } from 'notistack';
import { useLocales } from 'src/locales';
import { getDetailScheduleApi, updateScheduleApi } from 'src/api/schedule.api';
import { parseISO } from 'date-fns';

const UpdateScheduleDialog = ({ open, onClose, scheduleId, handleReLoadData }) => {
  const { workspace_id } = useAuthContext();
  const { t } = useLocales();
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(false);

  const [openPicker, setOpenPicker] = useState({
    executionTime: false,
    startTime: false,
    endTime: false,
  });

  const ScheduleSchema = Yup.object().shape({
    startTime: Yup.date().required(t('validate.required')),
    endTime: Yup.date()
      .nullable()
      .notRequired()
      .when('startTime', (startTime, schema) =>
        startTime[0] ? schema.min(startTime, t('validate.endTime')) : schema.notRequired()
      ),
  });

  const defaultValues = useMemo(
    () => ({
      name: schedule?.name || '',
      note: schedule?.note || '',
      execution: schedule?.run_type || 'once',
      startTime: parseISO(schedule?.datetime_start) || null,
      endTime: schedule?.datetime_end ? parseISO(schedule?.datetime_end) : null,
      intervalTime: schedule?.run_time_config?.interval_time || 1,
      executionTime: schedule?.run_time_config?.execution_time
        ? convertTimeStringToDate(schedule?.run_time_config?.execution_time)
        : null,
      weekly: schedule?.run_time_config?.day_of_week || 1,
      perMonth: schedule?.run_time_config?.day_of_month || 1,
    }),
    [
      schedule?.datetime_end,
      schedule?.datetime_start,
      schedule?.name,
      schedule?.note,
      schedule?.run_time_config?.day_of_month,
      schedule?.run_time_config?.day_of_week,
      schedule?.run_time_config?.execution_time,
      schedule?.run_time_config?.interval_time,
      schedule?.run_type,
    ]
  );

  const methods = useForm({
    resolver: yupResolver(ScheduleSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const watchExecution = watch('execution');

  const onSubmit = handleSubmit(async (data) => {
    try {
      const {
        name,
        note,
        execution,
        startTime,
        endTime,
        intervalTime,
        executionTime,
        weekly,
        perMonth,
      } = data;
      const payload = {
        name,
        note,
        run_time_config: {},
        datetime_start: toLocalTimeISOString(startTime),
        datetime_end: endTime ? toLocalTimeISOString(endTime) : null,
        run_type: execution,
      };

      let executionTimeStr = '';
      if (executionTime instanceof Date) {
        executionTimeStr = `${executionTime.getHours()}:${executionTime.getMinutes()}`;
      }

      const executionMapping = {
        once: () => {
          payload.datetime_end = null;
        },
        interval: () => {
          payload.run_time_config.interval_time = intervalTime;
        },
        everyday: () => {
          payload.run_time_config.execution_time = executionTimeStr;
        },
        weekly: () => {
          payload.run_time_config = {
            day_of_week: weekly,
            execution_time: executionTimeStr,
          };
        },
        monthly: () => {
          payload.run_time_config = {
            day_of_month: perMonth,
            execution_time: executionTimeStr,
          };
        },
      };

      if (executionMapping[execution]) executionMapping[execution]();

      await updateScheduleApi(workspace_id, scheduleId, payload);

      handleReLoadData();
      enqueueSnackbar(t('systemNotify.success.update'), {
        variant: 'success',
      });

      window.ipcRenderer.send('update-schedule', { workspace_id, schedule_id: scheduleId });
    } catch (error) {
      enqueueSnackbar(t('systemNotify.error.update'), {
        variant: 'error',
      });
    } finally {
      handleClose();
    }
  });

  const handleClose = () => {
    setSchedule({});
    onClose();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getDetailScheduleApi(workspace_id, scheduleId);
        if (response?.data?.data) {
          setSchedule(response.data.data);
        }
      } catch (error) {
        /* empty */
      } finally {
        setLoading(false);
      }
    };

    if (scheduleId) fetchData();
  }, [scheduleId, workspace_id]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle sx={{ pb: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">{t('task.schedule.title')}</Typography>
            <IconButton onClick={handleClose}>
              <Iconify icon="ic:round-close" />
            </IconButton>
          </Stack>
          <Divider />
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ typography: 'body2', pb: 0, mb: 1 }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <LittleTab title={t('task.schedule.taskName')}>
              <Typography>{schedule?.task_name}</Typography>
            </LittleTab>
            <LittleTab title={t('dialog.rpa.tabs.information.name')}>
              <RHFTextField size="small" name="name" disabled={loading} />
            </LittleTab>
            <LittleTab title={t('dialog.rpa.tabs.information.note')}>
              <RHFTextField name="note" multiline rows={4} disabled={loading} />
            </LittleTab>
            <LittleTab title={t('dialog.rpa.tabs.optional.labels.executionFrequency')}>
              <RHFRadioGroup
                row
                spacing={4}
                name="execution"
                options={EXECUTION_FREQUENCY_OPTIONS}
                disabled={loading}
              />
            </LittleTab>
            {watchExecution !== 'once' && (
              <LittleTab
                title={`${
                  watchExecution === 'interval'
                    ? t('dialog.rpa.tabs.optional.labels.intervalTime')
                    : t('dialog.rpa.tabs.optional.labels.executionTime')
                }`}
              >
                {watchExecution === 'interval' && (
                  <ListItemText
                    primary={<RHFTextField name="intervalTime" size="small" type="number" />}
                    secondary={t('dialog.rpa.tabs.optional.descriptions.intervalTime')}
                  />
                )}
                {watchExecution === 'everyday' && (
                  <RHFTime
                    open={openPicker.executionTime}
                    onClose={() => setOpenPicker({ ...openPicker, executionTime: false })}
                    onClick={() => setOpenPicker({ ...openPicker, executionTime: true })}
                    placeholder={t('form.label.executionTime')}
                    name="executionTime"
                    sx={{
                      '& .MuiInputBase-root': {
                        height: 40,
                      },
                    }}
                  />
                )}
                {watchExecution === 'weekly' && (
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={3}>
                        <RHFSelect
                          size="small"
                          name="weekly"
                          InputLabelProps={{ shrink: true }}
                          PaperPropsSx={{ textTransform: 'capitalize' }}
                          SelectProps={{
                            MenuProps: {
                              autoFocus: false,
                              PaperProps: {
                                sx: {
                                  maxHeight: 300,
                                  '&::-webkit-scrollbar': {
                                    width: '3px',
                                  },
                                  '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: (theme) => theme.palette.grey[500],
                                    borderRadius: '4px',
                                  },
                                },
                              },
                            },
                          }}
                        >
                          {WEEKLY_OPTIONS.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.label}
                            </MenuItem>
                          ))}
                        </RHFSelect>
                        <RHFTime
                          open={openPicker.executionTime}
                          onClose={() => setOpenPicker({ ...openPicker, executionTime: false })}
                          onClick={() => setOpenPicker({ ...openPicker, executionTime: true })}
                          placeholder={t('form.label.executionTime')}
                          name="executionTime"
                          sx={{
                            '& .MuiInputBase-root': {
                              height: 40,
                            },
                          }}
                        />
                      </Stack>
                    }
                    secondary={t('dialog.rpa.tabs.optional.descriptions.executionTime')}
                    primaryTypographyProps={{ typography: 'body2' }}
                    secondaryTypographyProps={{
                      component: 'span',
                      color: 'text.disabled',
                    }}
                  />
                )}
                {watchExecution === 'monthly' && (
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={3}>
                        <RHFSelect
                          size="small"
                          name="perMonth"
                          InputLabelProps={{ shrink: true }}
                          PaperPropsSx={{ textTransform: 'capitalize' }}
                          SelectProps={{
                            MenuProps: {
                              autoFocus: false,
                              PaperProps: {
                                sx: {
                                  maxHeight: 300,
                                  '&::-webkit-scrollbar': {
                                    width: '3px',
                                  },
                                  '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: (theme) => theme.palette.grey[500],
                                    borderRadius: '4px',
                                  },
                                },
                              },
                            },
                          }}
                        >
                          {MONTH_OPTIONS.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.label}
                            </MenuItem>
                          ))}
                        </RHFSelect>
                        <RHFTime
                          open={openPicker.executionTime}
                          onClose={() => setOpenPicker({ ...openPicker, executionTime: false })}
                          onClick={() => setOpenPicker({ ...openPicker, executionTime: true })}
                          placeholder={t('form.label.executionTime')}
                          name="executionTime"
                          sx={{
                            '& .MuiInputBase-root': {
                              height: 40,
                            },
                          }}
                        />
                      </Stack>
                    }
                    secondary={t('dialog.rpa.tabs.optional.descriptions.executionTime')}
                    primaryTypographyProps={{ typography: 'body2' }}
                    secondaryTypographyProps={{
                      component: 'span',
                      color: 'text.disabled',
                    }}
                  />
                )}
              </LittleTab>
            )}
            <LittleTab title={t('dialog.rpa.tabs.optional.labels.startingTime')}>
              <ListItemText
                primary={
                  <RHFDateTime
                    open={openPicker.startTime}
                    onClose={() => setOpenPicker({ ...openPicker, startTime: false })}
                    onClick={() => setOpenPicker({ ...openPicker, startTime: true })}
                    placeholder={t('form.label.startTime')}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: 40,
                      },
                    }}
                    name="startTime"
                    disabled={loading}
                  />
                }
                secondary={t('dialog.rpa.tabs.optional.descriptions.startingTime')}
                primaryTypographyProps={{ typography: 'body2' }}
                secondaryTypographyProps={{
                  component: 'span',
                  color: 'text.disabled',
                }}
              />
            </LittleTab>
            {watchExecution !== 'once' && (
              <LittleTab title={t('dialog.rpa.tabs.optional.labels.endTime')}>
                <ListItemText
                  primary={
                    <RHFDateTime
                      open={openPicker.endTime}
                      onClose={() => setOpenPicker({ ...openPicker, endTime: false })}
                      onClick={() => setOpenPicker({ ...openPicker, endTime: true })}
                      placeholder={t('form.label.startTime')}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: 40,
                        },
                      }}
                      name="endTime"
                    />
                  }
                  secondary={t('dialog.rpa.tabs.optional.descriptions.endTime')}
                  primaryTypographyProps={{ typography: 'body2' }}
                  secondaryTypographyProps={{
                    component: 'span',
                    color: 'text.disabled',
                  }}
                />
              </LittleTab>
            )}
          </Stack>
          <Stack spacing={3} mt={2}>
            <Stack direction="row" spacing={2} ml="auto" mb={3}>
              <Button size="medium" variant="outlined" onClick={handleClose}>
                {t('task.actions.close')}
              </Button>
              <LoadingButton
                color="primary"
                size="medium"
                type="submit"
                id="create-run"
                variant="contained"
                loading={isSubmitting}
                disabled={loading}
              >
                {t('task.actions.update')}
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateScheduleDialog;

UpdateScheduleDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReLoadData: PropTypes.func,
  scheduleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

//----------------------------------------------------------------

function LittleTab({ title, children }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={3}>
        <Typography
          color="text.secondary"
          align="right"
          sx={{
            mr: 3,
          }}
        >
          {title}
        </Typography>
      </Grid>
      <Grid item xs={9}>
        {children}
      </Grid>
    </Grid>
  );
}

LittleTab.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};
