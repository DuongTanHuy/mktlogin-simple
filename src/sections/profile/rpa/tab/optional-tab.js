import PropTypes from 'prop-types';
// mui
import {
  Button,
  ButtonGroup,
  Divider,
  Grid,
  ListItemText,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
// component
import {
  RHFAutocomplete,
  RHFDateTime,
  RHFRadioGroup,
  RHFSelect,
  RHFTextField,
  RHFTime,
} from 'src/components/hook-form';
import { useFormContext } from 'react-hook-form';
import { EXECUTION_FREQUENCY_OPTIONS, MONTH_OPTIONS, WEEKLY_OPTIONS } from 'src/utils/constance';
import { useEffect, useState } from 'react';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';

const OptionalTab = ({ listWorkflowGroup, listWorkflow, t, children, loading }) => {
  const { setValue, watch } = useFormContext();
  const watchTaskType = watch('taskType');
  const watchExecution = watch('execution');
  const watchWorkflow = watch('workflow');
  const [open, setOpen] = useState({
    executionTime: false,
    startTime: false,
    endTime: false,
  });
  const [options, setOptions] = useState([{ id: '', name: '' }]);

  useEffect(() => {
    if (listWorkflow.length > 0) {
      setOptions([{ id: '', name: '' }, ...listWorkflow]);
    }
  }, [listWorkflow, t]);

  return (
    <>
      {children}
      <LittleTab title={t('dialog.rpa.tabs.optional.labels.process')}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <RHFSelect
              fullWidth
              size="small"
              name="workflowGroup"
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
              <MenuItem value="all" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                All
              </MenuItem>

              <Divider sx={{ borderStyle: 'dashed' }} />

              {listWorkflowGroup.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </RHFSelect>
          </Grid>
          <Grid item xs={8}>
            <RHFAutocomplete
              fullWidth
              size="small"
              name="workflow"
              disableClearable
              options={loading ? [] : options}
              loading={loading}
              loadingText={
                <Stack alignItems="center">
                  <Iconify icon="eos-icons:bubble-loading" />
                </Stack>
              }
              getOptionLabel={(option) => option?.name}
              value={
                options.find((option) => option?.id === watchWorkflow) || {
                  id: '',
                  name: '',
                  // name: t('dialog.rpa.tabs.optional.labels.selectWorkflow'),
                }
              }
              // value={options.find((option) => option?.id === watchWorkflow)}
              placeholder={t('dialog.rpa.tabs.optional.labels.selectWorkflow')}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, newValue) => {
                setValue('workflow', newValue?.id || '', { shouldValidate: true });
                setValue('name', newValue?.name || '');
              }}
              renderOption={(props, option) => (
                <Stack
                  {...props}
                  key={option.id}
                  sx={{
                    ...(option.id === '' && {
                      display: 'none!important',
                    }),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}
                  spacing={1}
                >
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
                    }}
                  >
                    {option.name}
                  </Typography>
                </Stack>
              )}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  ...(watchWorkflow === '' && {
                    borderColor: 'warning.main',
                  }),
                },
              }}
            />
          </Grid>
        </Grid>
      </LittleTab>
      <LittleTab title={t('dialog.rpa.tabs.optional.labels.taskType')}>
        <ButtonGroup variant="outlined" color="inherit">
          <Button
            onClick={() => setValue('taskType', 'common')}
            sx={{
              '&.MuiButtonBase-root': {
                ...(watchTaskType === 'common' && {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  borderRightColor: 'primary.main',
                }),
              },
            }}
          >
            {t('dialog.rpa.tabs.optional.button.common')}
          </Button>
          <Button
            onClick={() => setValue('taskType', 'scheduled')}
            sx={{
              '&.MuiButtonBase-root': {
                ...(watchTaskType === 'scheduled' && {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  borderLeftColor: 'primary.main',
                }),
              },
            }}
          >
            {t('dialog.rpa.tabs.optional.button.scheduled')}
          </Button>
        </ButtonGroup>
      </LittleTab>
      {watchTaskType === 'scheduled' && (
        <>
          <LittleTab title={t('dialog.rpa.tabs.optional.labels.executionFrequency')}>
            <RHFRadioGroup row spacing={4} name="execution" options={EXECUTION_FREQUENCY_OPTIONS} />
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
                  primaryTypographyProps={{ typography: 'body2' }}
                  secondaryTypographyProps={{
                    component: 'span',
                    color: 'text.disabled',
                  }}
                />
              )}
              {watchExecution === 'everyday' && (
                <RHFTime
                  open={open.executionTime}
                  onClose={() => setOpen({ ...open, executionTime: false })}
                  onClick={() => setOpen({ ...open, executionTime: true })}
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
                        open={open.executionTime}
                        onClose={() => setOpen({ ...open, executionTime: false })}
                        onClick={() => setOpen({ ...open, executionTime: true })}
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
                        open={open.executionTime}
                        onClose={() => setOpen({ ...open, executionTime: false })}
                        onClick={() => setOpen({ ...open, executionTime: true })}
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
                  primaryTypographyProps={{ typography: 'body2' }}
                  secondaryTypographyProps={{
                    component: 'span',
                    color: 'text.disabled',
                  }}
                />
              )}
            </LittleTab>
          )}
          <LittleTab
            title={
              watchExecution === 'once'
                ? t('dialog.rpa.tabs.optional.labels.executionTime')
                : t('dialog.rpa.tabs.optional.labels.startingTime')
            }
          >
            <ListItemText
              primary={
                <RHFDateTime
                  open={open.startTime}
                  onClose={() => setOpen({ ...open, startTime: false })}
                  onClick={() => setOpen({ ...open, startTime: true })}
                  placeholder={t('form.label.startTime')}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 40,
                    },
                  }}
                  name="startTime"
                />
              }
              secondary={
                ['interval', 'everyday', 'weekly', 'monthly'].includes(watchExecution)
                  ? ''
                  : t('dialog.rpa.tabs.optional.descriptions.startingTime')
              }
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
                    open={open.endTime}
                    onClose={() => setOpen({ ...open, endTime: false })}
                    onClick={() => setOpen({ ...open, endTime: true })}
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
        </>
      )}
    </>
  );
};

export default OptionalTab;

OptionalTab.propTypes = {
  listWorkflowGroup: PropTypes.array,
  listWorkflow: PropTypes.array,
  t: PropTypes.func,
  children: PropTypes.node,
  loading: PropTypes.bool,
};

//----------------------------------------------------------------

function LittleTab({ title, children }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={3}>
        <Typography color="text.secondary">{title}</Typography>
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
