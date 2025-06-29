import { useCallback, useEffect, useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';

// mui
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
// apis
import { getListWorkFlow, getWorkFlowDetail } from 'src/api/workflow.api';
import { createRpaApi, getTaskByIdApi } from 'src/api/task.api';
// hook
import { useAuthContext } from 'src/auth/hooks';

// components
import FormProvider from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import Label, { CustomLabel } from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import { enqueueSnackbar } from 'notistack';
import { ERROR_CODE, NUM_ID_DISPLAY, RUN_CONFIG_KEY } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { isElectron } from 'src/utils/commom';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import Preview from 'src/sections/variables-template/components/PreviewDialog';
import { findItemById } from 'src/sections/variables-template/utils';
import { contentMap, dfs } from 'src/sections/variables-template/create-template';
import { getValueRuleset } from 'src/utils/profile';
import { useBoolean } from 'src/hooks/use-boolean';
import Editor from 'src/components/editor/editor';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { toLocalTimeISOString } from '../../../utils/format-time';
import { createScheduleApi } from '../../../api/schedule.api';
import InformationTab from './tab/information-tab';
import RunConfigurationTab from './tab/run-configuration-tab';
import OptionalTab from './tab/optional-tab';
import InputTab from './tab/input-tab';

//----------------------------------------------------------------

const RpaMultiFormDialog = ({
  open,
  onClose,
  profileIds = [],
  listWorkflowGroup = [],
  hasFBrowser = false,
}) => {
  const { workspace_id } = useAuthContext();
  const { t } = useLocales();
  const router = useRouter();
  const [inputValidate, setInputValidate] = useState([]);

  const TABS = [
    {
      value: 'optional',
      label: t('dialog.rpa.tabs.optional.title'),
      icon: <Iconify icon="bxs:customize" width={24} />,
    },
    {
      value: 'run-configuration',
      label: t('dialog.rpa.tabs.runConfiguration.title'),
      icon: <Iconify icon="eos-icons:configuration-file" width={24} />,
    },
    {
      value: 'input',
      label: t('dialog.rpa.tabs.input.title'),
      icon: <Iconify icon="streamline:input-box-solid" width={24} />,
    },
    {
      value: 'information',
      label: t('dialog.rpa.tabs.information.title'),
      icon: <Iconify icon="mdi:information-box" width={24} />,
    },
  ];

  const RpaSchema = Yup.object().shape({
    workflow: Yup.mixed().test('is-required', t('validate.required'), (value) => value !== ''),
    scale: Yup.number()
      .min(0.1, t('validate.scale.min'))
      .max(1, t('validate.scale.max'))
      .typeError(t('validate.scale.number')),
    startTime: Yup.date().when('taskType', {
      is: (value) => value === 'scheduled',
      then: (schema) => schema.required(t('validate.required')),
      otherwise: (schema) => schema.optional().nullable(),
    }),
    windowWidth: Yup.number()
      .min(500, t('validate.windowSize.width.min'))
      .typeError(t('validate.windowSize.width.number')),
    windowHeight: Yup.number()
      .min(100, t('validate.windowSize.height.min'))
      .typeError(t('validate.windowSize.height.number')),
    spacing: Yup.number()
      .min(0, t('validate.windowSize.spacing.min'))
      .max(100, t('validate.windowSize.spacing.max'))
      .typeError(t('validate.windowSize.spacing.number')),
    duration: Yup.number()
      .min(1000, t('validate.windowSize.duration.min'))
      .typeError(t('validate.windowSize.duration.number')),
    num_thread: Yup.number()
      .min(1, t('validate.windowSize.num_thread.min'))
      .typeError(t('validate.windowSize.num_thread.number')),
  });

  const [currentTab, setCurrentTab] = useState('optional');
  const [listWorkflow, setListWorkflow] = useState([]);
  const [variable, setVariable] = useState([]);
  const [ruleset, setRuleset] = useState(null);
  const [readme, setReadme] = useState('');
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const [loading, setLoading] = useState(true);
  const rpa_config = JSON.parse(getStorage(RUN_CONFIG_KEY) || '{}');
  const openReadme = useBoolean();

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const defaultValues = useMemo(() => {
    const currentTime = new Date();

    const minutes = currentTime.getMinutes();
    let roundedMinutes = Math.ceil(minutes / 5) * 5;

    if (roundedMinutes >= 60) {
      currentTime.setHours(currentTime.getHours() + 1);
      roundedMinutes = 0;
    }
    currentTime.setMinutes(roundedMinutes);

    currentTime.setSeconds(0);
    currentTime.setMilliseconds(0);

    return {
      name: '',
      note: '',
      workflowGroup: 'all',
      workflow: '',
      taskType: 'common',
      priority: false,
      execution: 'once',
      startTime: null,
      endTime: null,
      intervalTime: 1,
      executionTime: currentTime,
      weekly: 1,
      perMonth: 1,
      //
      rowLimitDisplay: 0,
      windowWidth: 500,
      windowHeight: 640,
      scale: 0.8,
      spacing: 0,
      duration: 2000,
      num_thread: 5,
      screen_width: null,
      is_visual_mouse: true,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const methods = useForm({
    resolver: yupResolver(RpaSchema),
    defaultValues,
  });

  const {
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const watchWorkflow = watch('workflow');
  const watchTaskType = watch('taskType');
  const watchWorkflowGroup = watch('workflowGroup');
  const watchExecution = watch('execution');

  useEffect(() => {
    switch (watchExecution) {
      case 'once':
        {
          const currentTime = new Date();

          currentTime.setHours(currentTime.getHours() + 1);

          const minutes = currentTime.getMinutes();
          let roundedMinutes = Math.ceil(minutes / 5) * 5;

          if (roundedMinutes >= 60) {
            currentTime.setHours(currentTime.getHours() + 1);
            roundedMinutes = 0;
          }
          currentTime.setMinutes(roundedMinutes);

          setValue('startTime', currentTime);
        }
        break;
      case 'interval':
        {
          const currentTime = new Date();

          const minutes = currentTime.getMinutes();
          let roundedMinutes = Math.ceil(minutes / 5) * 5;

          if (roundedMinutes >= 60) {
            currentTime.setHours(currentTime.getHours() + 1);
            roundedMinutes = 0;
          }
          currentTime.setMinutes(roundedMinutes);

          setValue('startTime', currentTime);
        }
        break;
      default:
        {
          const currentTime = new Date();

          currentTime.setHours(0);

          currentTime.setMinutes(0);

          setValue('startTime', currentTime);
        }
        break;
    }
  }, [setValue, watchExecution]);

  useEffect(() => {
    setValue('workflow', '');
    setInputValidate([]);
    const fetchWorkflow = async () => {
      try {
        setLoading(true);
        const params = {
          ...(watchWorkflowGroup !== 'all' && {
            workflow_group: watchWorkflowGroup,
          }),
          page_size: 1000,
          fields: 'id,name,type,is_downloaded',
        };
        const response = await getListWorkFlow(workspace_id, params);
        if (response?.data) {
          const { data } = response.data;
          setListWorkflow(data);
        }
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };
    if (open && workspace_id) {
      fetchWorkflow();
    }
  }, [open, setValue, watchWorkflowGroup, workspace_id]);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const response = await getWorkFlowDetail(workspace_id, watchWorkflow);
        if (response?.data) {
          const { global_data, design_data, readme: readMe } = response.data;

          setReadme(readMe);

          if (design_data) {
            const variableMap = global_data.reduce((acc, item) => {
              acc[item.id] = item.value;
              return acc;
            }, {});

            const designData = design_data;
            setRuleset({
              ...designData,
              children: designData?.children.map((item) => {
                let rpaValue = null;
                if (item?.name === 'Group' && item?.children?.length > 0) {
                  return {
                    ...item,
                    children: item.children.map((child) => {
                      rpaValue = rpa_config?.[watchWorkflow]?.find(
                        (i) => i?.id === child?.config?.variable?.id
                      )?.value;

                      return {
                        ...child,
                        config: {
                          ...child.config,
                          ...getValueRuleset(rpaValue, variableMap, child),
                        },
                      };
                    }),
                  };
                }
                if (item?.name === 'Grid' && item?.children?.length > 0) {
                  return {
                    ...item,
                    children: item.children.map((child) => {
                      if (child?.name === 'Group' && child?.children?.length > 0) {
                        return {
                          ...child,
                          children: child.children.map((subChild) => {
                            rpaValue = rpa_config?.[watchWorkflow]?.find(
                              (i) => i?.id === subChild?.config?.variable?.id
                            )?.value;

                            return {
                              ...subChild,
                              config: {
                                ...subChild.config,
                                ...getValueRuleset(rpaValue, variableMap, subChild),
                              },
                            };
                          }),
                        };
                      }
                      return {
                        ...child,
                      };
                    }),
                  };
                }

                rpaValue = rpa_config?.[watchWorkflow]?.find(
                  (i) => i?.id === item?.config?.variable?.id
                )?.value;

                return {
                  ...item,
                  config: {
                    ...item.config,
                    ...getValueRuleset(rpaValue, variableMap, item),
                  },
                };
              }),
            });
          } else {
            setRuleset(null);
          }

          setVariable(
            global_data?.map((item) => {
              const rpaValue = rpa_config?.[watchWorkflow]?.find((i) => i?.id === item.id)?.value;

              let newValue;
              if (rpaValue !== undefined) {
                newValue = rpaValue;
              } else if (item?.value === '' || item?.value?.min === '' || item?.value?.max === '') {
                newValue = item?.type === 'range' ? item?.defaultValue?.init : item?.defaultValue;
              } else {
                newValue = item.value;
              }

              return {
                ...item,
                value: newValue,
              };
            })
          );
        }
      } catch (error) {
        // console.log(error);
      }
    };

    if (watchWorkflow !== '') {
      setInputValidate([]);
      fetchWorkflow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchWorkflow, workspace_id]);

  const handleCreateRpa = async (payload) => {
    try {
      const { data } = await createRpaApi(workspace_id, payload);
      handleClose();
      enqueueSnackbar(t('systemNotify.success.create'), { variant: 'success' });
      if (isElectron()) {
        window.ipcRenderer.send('add-task', data.data);
      }
      return data.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const handleCreateSchedule = async (payload) => {
    try {
      const { data } = await createScheduleApi(workspace_id, payload);
      if (isElectron()) {
        window.ipcRenderer.send('add-schedule', data.data);
      }
      handleClose();
      enqueueSnackbar(t('systemNotify.success.schedule'), { variant: 'success' });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();

    return handleSubmit(async (data) => {
      if (!profileIds) return;

      try {
        let inputValidateError = [];
        let variableData = [];

        if (ruleset?.children?.length > 0) {
          const addVariablesToMap = (children, acc) => {
            children.forEach((child) => {
              if (child.config?.variable?.id) {
                acc[child.config.variable.id] = {
                  ...child.config,
                  id: child.id,
                };
              }
            });
          };

          const handleGroupChildren = (group, acc) => {
            if (group.name === 'Group' && Array.isArray(group.children)) {
              addVariablesToMap(group.children, acc);
            }
          };

          const rulesetMap = (ruleset?.children || []).reduce((acc, item) => {
            if (item.name === 'Group' && Array.isArray(item.children)) {
              addVariablesToMap(item.children, acc);
            } else if (item.name === 'Grid' && Array.isArray(item.children)) {
              item.children.forEach((child) => handleGroupChildren(child, acc));
            } else if (item.config?.variable?.id) {
              acc[item.config.variable.id] = {
                ...item.config,
                id: item.id,
              };
            }
            return acc;
          }, {});

          variableData = variable.map((item) => {
            const config = rulesetMap[item.id];
            return {
              ...item,
              value:
                item?.type === 'number'
                  ? Number(config?.defaultValue ?? item.value)
                  : config?.defaultValue ?? item.value,
              ...(item?.type === 'range' && {
                value: {
                  min: Number(config?.defaultMin),
                  max: Number(config?.defaultMax),
                },
              }),
              rulesetId: config?.id,
              is_required: config?.isRequired,
            };
          });
        }

        inputValidateError = (ruleset?.children?.length > 0 ? variableData : variable)
          .map((item) =>
            item.is_required &&
            (typeof item.value === 'object' ? item.value.length === 0 : !item.value)
              ? item.rulesetId
              : ''
          )
          .filter((item) => item);
        setInputValidate(inputValidateError);
        if (inputValidateError.length > 0) return;

        const config = {
          window_number: data.rowLimitDisplay,
          window_size: `${data.windowWidth}x${data.windowHeight}`,
          scale: data.scale,
          row_spacing: data.spacing,
          delay: data.duration,
          num_thread: data.num_thread,
          is_visual_mouse: data.is_visual_mouse,
        };
        let payload = {
          name: data.name,
          note: data.note,
          profiles: profileIds,
          config,
          global_data: (ruleset?.children?.length > 0 ? variableData : variable)?.map(
            ({ file, id, ...rest }) => rest
          ),
          // design_data: JSON.stringify(ruleset),
          workflow: data.workflow,
        };

        if (data.taskType === 'scheduled') {
          payload = {
            ...payload,
            run_time_config: {},
            datetime_start: toLocalTimeISOString(data.startTime),
            datetime_end: data.endTime ? toLocalTimeISOString(data.endTime) : null,
            run_type: data.execution,
          };

          let executionTimeStr = '';
          if (data.executionTime instanceof Date) {
            executionTimeStr = `${data.executionTime.getHours()}:${data.executionTime.getMinutes()}`;
          }

          const executionMapping = {
            once: () => {
              payload.datetime_end = null;
            },
            interval: () => {
              payload.run_time_config.interval_time = data.intervalTime;
            },
            everyday: () => {
              payload.run_time_config.execution_time = executionTimeStr;
            },
            weekly: () => {
              payload.run_time_config = {
                day_of_week: data.weekly,
                execution_time: executionTimeStr,
              };
            },
            monthly: () => {
              payload.run_time_config = {
                day_of_month: data.perMonth,
                execution_time: executionTimeStr,
              };
            },
          };

          if (executionMapping[data.execution]) executionMapping[data.execution]();
        }

        if (watchTaskType === 'common') {
          if (event.nativeEvent.submitter.id === 'create') {
            const taskCreated = await handleCreateRpa(payload);
            if (isElectron()) {
              // Get task data and run it
              const response = await getTaskByIdApi(workspace_id, taskCreated.id);
              const task = response.data?.data;
              const kernelVersions = task.profiles.map((profile) => profile.kernel_version);
              const uniqueKernelVersions = Array.from(
                new Map(kernelVersions.map((item) => [item.type + item.kernel, item])).values()
              );

              const promise = uniqueKernelVersions.map(async (kernel_version) => {
                const isDownloaded = await window.ipcRenderer.invoke('check-browser-download', {
                  browser_type: kernel_version.type,
                  kernel_version: kernel_version.kernel,
                });
                return isDownloaded;
              });

              const isDownloads = await Promise.all(promise);
              console.log('isDownloads', isDownloads);
              console.log('uniqueKernelVersions', uniqueKernelVersions);
              let kernelVersionDownload;

              for (let i = 0; i < isDownloads.length; i += 1) {
                if (!isDownloads[i]) {
                  kernelVersionDownload = uniqueKernelVersions[i];
                  break;
                }
              }

              if (!kernelVersionDownload) {
                if (isElectron()) {
                  const alive_profiles = task.profiles.filter((profile) => profile.duration >= 0);

                  if (alive_profiles.length === 0) {
                    enqueueSnackbar(t('systemNotify.error.listProfileExpired'), {
                      variant: 'error',
                    });
                    return;
                  }

                  const num_profile_expired = task.profiles.length - alive_profiles.length;

                  if (num_profile_expired > 0) {
                    enqueueSnackbar(t('systemNotify.warning.hasProfileExpired'), {
                      variant: 'warning',
                    });
                  }

                  task.profiles = alive_profiles;
                  window.ipcRenderer.send('run-script', task);
                }
              } else {
                enqueueSnackbar('Trình duyệt chưa được tải về, vui lòng thử lại.', {
                  variant: 'warning',
                  duration: 7000,
                });
              }
            }
          }
          router.push(paths.dashboard.task);
        } else if (watchTaskType === 'scheduled') {
          await handleCreateSchedule(payload);
          router.push(paths.dashboard.schedule);
        }

        const currentKeys = Object.keys(rpa_config);
        if (currentKeys.length >= 100) {
          const keyToRemove = currentKeys[0];
          localStorage.removeItem(keyToRemove);
        }
        setStorage(
          RUN_CONFIG_KEY,
          JSON.stringify({
            ...rpa_config,
            [payload.workflow]: (ruleset?.children?.length > 0 ? variableData : variable)?.map(
              ({ id, value, ...rest }) => ({
                id,
                value,
              })
            ),
          })
        );
      } catch (error) {
        const errorMessage =
          error?.http_code === ERROR_CODE.NOT_PERMISSION
            ? t('systemNotify.warning.notPermission.profile.rpa')
            : error?.message || t('systemNotify.error.title');
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    })();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      reset();
      setNumItem(NUM_ID_DISPLAY);
      setVariable([]);
      setRuleset(null);
      setInputValidate([]);
      setCurrentTab('optional');
    }, 200);
  };

  const updateGroupOrder = (id, group, fieldId) => {
    if (fieldId) {
      setInputValidate((prevState) => prevState.filter((i) => i !== fieldId));
    }

    const _findParrent = findItemById(ruleset, id);

    if (_findParrent?.name === 'Group') {
      const checkAnyGrids = group.find((i) => i.name === 'Grid');
      if (checkAnyGrids) {
        enqueueSnackbar('The maximum number of grid is 1', { variant: 'warning' });
        return false;
      }
    }

    setRuleset((prevState) => {
      const newRuleset = { ...prevState }; // Sao chép state hiện tại

      const toUpdate = dfs(newRuleset, id); // Tìm nhóm cần cập nhật

      if (toUpdate?.type === 'GROUP') {
        toUpdate.children = group; // Cập nhật children của nhóm đó
      }

      return newRuleset; // Trả về state đã cập nhật
    });

    return true;
  };

  return (
    <>
      <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
        <DialogTitle sx={{ pb: 2 }}>Automation</DialogTitle>

        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            ml: 3,
            mb: { xs: 2, md: 3 },
          }}
        >
          {TABS.map((tab, index) => (
            <Tab
              key={tab.value}
              label={
                (Object.keys(errors).length > 0 && index === 0 && (
                  <Stack direction="row" justifyContent="center" alignItems="center">
                    <Typography>{tab.label}</Typography>
                    <Iconify icon="ci:warning" width={24} />
                  </Stack>
                )) ||
                (inputValidate.length > 0 && index === 2 && (
                  <Stack direction="row" justifyContent="center" alignItems="center">
                    <Typography>{tab.label}</Typography>
                    <Iconify icon="ci:warning" width={24} />
                  </Stack>
                )) ||
                tab.label
              }
              icon={tab.icon}
              value={tab.value}
              sx={{
                '&.MuiButtonBase-root.MuiTab-root': {
                  ...(((Object.keys(errors).length > 0 && index === 0) ||
                    (inputValidate.length > 0 && index === 2)) && {
                    color: 'error.main',
                  }),
                },
              }}
            />
          ))}
        </Tabs>

        <FormProvider methods={methods} onSubmit={onSubmit}>
          <DialogContent
            sx={{
              typography: 'body2',
              pr: 1,
              pb: 0,
              ...(currentTab === 'input' && {
                px: 0,
              }),
              minHeight: '400px',
              maxHeight: '40vh',
              mb: 10,
            }}
          >
            <Scrollbar
              autoHide={false}
              sx={{
                pr: 2,
                minHeight: '400px',
                maxHeight: '40vh',
              }}
            >
              <Stack spacing={3}>
                {currentTab === 'optional' && (
                  <GeneralTab>
                    <OptionalTab
                      listWorkflowGroup={listWorkflowGroup}
                      listWorkflow={listWorkflow}
                      t={t}
                      loading={loading}
                    >
                      <LittleTab
                        title={t('dialog.rpa.tabs.optional.labels.id')}
                        numProfile={profileIds.length}
                      >
                        <Stack
                          direction="row"
                          spacing={2}
                          flexWrap="wrap"
                          sx={{
                            typography: 'body2',
                            color: 'error.main',
                          }}
                        >
                          {profileIds?.length > 0
                            ? profileIds.slice(0, numItem).map((profileId) => (
                                <Label
                                  key={profileId}
                                  color="primary"
                                  sx={{
                                    p: 2,
                                  }}
                                >
                                  {profileId}
                                </Label>
                              ))
                            : !hasFBrowser && t('quickAction.expiredProfile')}
                          {profileIds?.length > 0 && profileIds.length > NUM_ID_DISPLAY && (
                            <CustomLabel
                              length={profileIds.length}
                              numItem={numItem}
                              setNumItem={setNumItem}
                            />
                          )}
                        </Stack>
                        {hasFBrowser && (
                          <Typography variant="caption" fontStyle="italic" color="text.secondary">
                            Automation không hỗ trợ cho các hồ sơ chạy trên Firerfox Browser
                          </Typography>
                        )}
                      </LittleTab>
                    </OptionalTab>
                  </GeneralTab>
                )}

                {currentTab === 'run-configuration' && <RunConfigurationTab t={t} />}

                {currentTab === 'input' && (
                  <>
                    {ruleset && ruleset?.children?.length > 0 ? (
                      <Stack
                        sx={{
                          pl: 2,
                        }}
                      >
                        {readme && (
                          <Typography
                            variant="subtitle1"
                            sx={{
                              color: 'primary.main',
                              cursor: 'pointer',
                              textAlign: 'right',
                              pr: 2.5,
                              textDecoration: 'underline',
                            }}
                            onClick={openReadme.onTrue}
                          >
                            {t('dialog.rpa.tabs.input.readme')}
                          </Typography>
                        )}
                        {ruleset?.id ? (
                          <Preview
                            group={ruleset}
                            contentMap={contentMap}
                            updateGroupOrder={updateGroupOrder}
                            inputValidate={inputValidate}
                            setInputValidate={setInputValidate}
                          />
                        ) : (
                          <Typography textAlign="center" color="text.secondary">
                            {watchWorkflow
                              ? t('dialog.rpa.tabs.input.noData')
                              : t('dialog.rpa.tabs.optional.labels.selectWorkflow')}
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <Stack spacing={1}>
                        {readme && (
                          <Typography
                            variant="subtitle1"
                            sx={{
                              color: 'primary.main',
                              cursor: 'pointer',
                              textAlign: 'right',
                              pr: 1,
                              textDecoration: 'underline',
                            }}
                            onClick={openReadme.onTrue}
                          >
                            {t('dialog.rpa.tabs.input.readme')}
                          </Typography>
                        )}
                        <InputTab
                          variable={variable}
                          setVariable={setVariable}
                          t={t}
                          workflow={watchWorkflow}
                          inputValidate={inputValidate}
                          setInputValidate={setInputValidate}
                        />
                      </Stack>
                    )}
                  </>
                )}

                {currentTab === 'information' && (
                  <GeneralTab
                    sx={{
                      pt: 1,
                    }}
                  >
                    <InformationTab t={t} />
                  </GeneralTab>
                )}
              </Stack>
            </Scrollbar>
          </DialogContent>
          <Stack
            direction="row"
            width={1}
            spacing={2}
            ml="auto"
            justifyContent="flex-end"
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 20,
              left: 0,
              pb: 3,
              zIndex: 1,
              ...(currentTab === 'input' && {
                pr: 1,
              }),
              backgroundColor: 'background.paper',
            }}
          >
            <Button size="medium" variant="outlined" onClick={handleClose}>
              {t('dialog.rpa.actions.close')}
            </Button>
            {watchTaskType === 'common' && (
              <LoadingButton
                color="primary"
                size="medium"
                type="submit"
                id="create"
                variant="contained"
                loading={isSubmitting}
                disabled={profileIds?.length === 0}
              >
                {t('dialog.rpa.actions.start')}
              </LoadingButton>
            )}
            {watchTaskType === 'scheduled' && (
              <LoadingButton
                color="primary"
                size="medium"
                type="submit"
                id="create-run"
                variant="contained"
                loading={isSubmitting}
                disabled={profileIds?.length === 0}
              >
                {t('dialog.rpa.actions.schedule')}
              </LoadingButton>
            )}
          </Stack>
        </FormProvider>
      </Dialog>

      <ConfirmDialog
        maxWidth="md"
        open={openReadme.value}
        onClose={openReadme.onFalse}
        closeButtonName={t('workflow.tabsBar.actions.close')}
        sx={{
          '& .MuiDialogTitle-root': {
            py: 1.5,
          },
        }}
        content={
          <Editor
            sx={{
              backgroundColor: 'transparent',
              '& .ql-editor': {
                p: 0,
                backgroundColor: 'transparent',
                maxHeight: 'fit-content',
              },
              border: 'none',
            }}
            id="simple-editor"
            value={readme}
            readOnly
            placeholder={t('workflow.script.tab.noContent')}
          />
        }
      />
    </>
  );
};

export default RpaMultiFormDialog;

RpaMultiFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  profileIds: PropTypes.array,
  listWorkflowGroup: PropTypes.array,
  hasFBrowser: PropTypes.bool,
};

//----------------------------------------------------------------

function LittleTab({ title, children, numProfile }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={3}>
        <Typography color="text.secondary">
          {title}
          <Label
            sx={{
              ml: 1,
            }}
          >
            {`${numProfile}`}
          </Label>
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
  numProfile: PropTypes.number,
};

//----------------------------------------------------------------

function GeneralTab({ children }) {
  return <Stack spacing={2}>{children}</Stack>;
}

GeneralTab.propTypes = {
  children: PropTypes.node,
};
