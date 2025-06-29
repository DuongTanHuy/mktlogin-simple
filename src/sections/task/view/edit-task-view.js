import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
// mui
import { Button, Container, Stack, Tab, Tabs, Typography, alpha } from '@mui/material';
import { useForm } from 'react-hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import { fDateTime } from 'src/utils/format-time';
import { LoadingButton } from '@mui/lab';
import { RHFTextField } from 'src/components/hook-form';
import { addTaskProfileApi, updateRpaApi } from 'src/api/task.api';
import { useAuthContext } from 'src/auth/hooks';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'src/routes/hooks';
import { useLocales } from 'src/locales';
import Preview from 'src/sections/variables-template/components/PreviewDialog';
import { findItemById } from 'src/sections/variables-template/utils';
import { contentMap, dfs } from 'src/sections/variables-template/create-template';
import { getValueRuleset } from 'src/utils/profile';
import ProfileTab from '../profile-tab';
import ConfigTab from '../config-tab';
import InputTab from '../input-tab';

//----------------------------------------------------------------

const EditTaskView = ({ currentData }) => {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { workspace_id } = useAuthContext();
  const router = useRouter();
  const [inputValidate, setInputValidate] = useState([]);

  const TABS = [
    {
      value: 'information',
      label: t('task.editTask.information.title'),
    },
    {
      value: 'input',
      label: t('task.editTask.input.title'),
    },
    {
      value: 'profile',
      label: t('task.editTask.profile.title'),
    },
    {
      value: 'config',
      label: t('task.editTask.config'),
    },
  ];

  const TaskSchema = Yup.object().shape({});

  const [currentTab, setCurrentTab] = useState('information');
  const [variable, setVariable] = useState([]);
  const [profile, setProfile] = useState([]);
  const [ruleset, setRuleset] = useState(null);

  const defaultValues = useMemo(
    () => ({
      name: currentData?.name || '',
      note: currentData?.note || '',
      rowLimitDisplay: currentData?.config?.window_number || 0,
      windowWidth: Number(currentData?.config?.window_size?.split('x')[0]) || 0,
      windowHeight: Number(currentData?.config?.window_size?.split('x')[1]) || 0,
      scale: currentData?.config?.scale || 0,
      spacing: currentData?.config?.row_spacing || 0,
      duration: currentData?.config?.delay || 0,
      num_thread: currentData?.config?.num_thread || 0,
      is_visual_mouse: currentData?.config?.is_visual_mouse || true,
      screen_width: null,
    }),
    [
      currentData?.config?.delay,
      currentData?.config?.num_thread,
      currentData?.config?.row_spacing,
      currentData?.config?.scale,
      currentData?.config?.window_number,
      currentData?.config?.window_size,
      currentData?.name,
      currentData?.note,
      currentData?.config?.is_visual_mouse,
    ]
  );

  const methods = useForm({
    resolver: yupResolver(TaskSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    if (!currentData?.id) return;
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
          if (config) {
            return {
              ...item,
              value: item?.type === 'number' ? Number(config?.defaultValue) : config?.defaultValue,
              ...(item?.type === 'range' && {
                value: {
                  min: Number(config?.defaultMin),
                  max: Number(config?.defaultMax),
                },
              }),
              rulesetId: config?.id,
              is_required: config?.isRequired,
            };
          }
          return {
            ...item,
            is_required: false,
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

      const {
        name,
        note,
        rowLimitDisplay,
        windowWidth,
        windowHeight,
        scale,
        spacing,
        duration,
        num_thread,
        is_visual_mouse,
      } = data;
      const payload = {
        name,
        note,
        global_data: (ruleset?.children?.length > 0 ? variableData : variable)?.map(
          ({ id, file, ...rest }) => rest
        ),
        // design_data: JSON.stringify(ruleset),
        config: {
          delay: duration,
          scale,
          row_spacing: spacing,
          window_size: `${windowWidth}x${windowHeight}`,
          window_number: rowLimitDisplay,
          num_thread,
          is_visual_mouse,
        },
      };
      const profilePayload = {
        profile_ids: profile.filter((item) => item.isNew).map((p) => p.id),
      };
      await Promise.all([
        updateRpaApi(workspace_id, currentData?.id, payload),
        addTaskProfileApi(workspace_id, currentData?.id, profilePayload),
      ]);

      enqueueSnackbar(t('systemNotify.success.save'), { variant: 'success' });
      router.push(paths.task.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(t('systemNotify.error.title'), { variant: 'error' });
    }
  });

  const handleChangeTab = (_, newValue) => {
    setCurrentTab(newValue);
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

  useEffect(() => {
    if (currentData?.id) {
      const {
        workflow: { global_data, design_data },
        global_data: variables,
        profiles,
      } = currentData;

      const updateVariable = global_data?.map((dataItem) => {
        const variableItem = variables.find((v) => v.key === dataItem.key);
        return {
          ...dataItem,
          ...(variableItem && { value: variableItem.value }),
        };
      });

      if (design_data) {
        const variableMap = updateVariable.reduce((acc, item) => {
          acc[item.id] = item.value;
          return acc;
        }, {});

        const designData = design_data;
        setRuleset({
          ...designData,
          children: designData?.children.map((item) => {
            if (item?.name === 'Group' && item?.children?.length > 0) {
              return {
                ...item,
                children: item.children.map((child) => ({
                  ...child,
                  config: {
                    ...child.config,
                    ...getValueRuleset(null, variableMap, child),
                  },
                })),
              };
            }
            if (item?.name === 'Grid' && item?.children?.length > 0) {
              return {
                ...item,
                children: item.children.map((child) => {
                  if (child?.name === 'Group' && child?.children?.length > 0) {
                    return {
                      ...child,
                      children: child.children.map((subChild) => ({
                        ...subChild,
                        config: {
                          ...subChild.config,
                          ...getValueRuleset(null, variableMap, subChild),
                        },
                      })),
                    };
                  }
                  return {
                    ...child,
                  };
                }),
              };
            }
            return {
              ...item,
              config: {
                ...item.config,
                ...getValueRuleset(null, variableMap, item),
              },
            };
          }),
        });
      } else {
        setRuleset(null);
      }

      setVariable(updateVariable);
      setProfile(profiles);

      const newDefaultValues = {
        name: currentData?.name,
        note: currentData?.note,
        rowLimitDisplay: currentData?.config?.window_number,
        windowWidth: Number(currentData?.config?.window_size?.split('x')[0]),
        windowHeight: Number(currentData?.config?.window_size?.split('x')[1]),
        scale: currentData?.config?.scale,
        spacing: currentData?.config?.row_spacing,
        duration: currentData?.config?.delay,
        num_thread: currentData?.config?.num_thread,
      };

      if (currentData?.config?.is_visual_mouse !== undefined) {
        newDefaultValues.is_visual_mouse = currentData?.config?.is_visual_mouse;
      } else {
        newDefaultValues.is_visual_mouse = true;
      }

      reset(newDefaultValues);
    }
  }, [currentData, reset]);

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        height: '100%',
        position: 'relative',
        '&.MuiContainer-root': {
          px: 5,
        },
        px: '6px!important',
      }}
    >
      <Stack spacing={3} direction={{ xs: 'column', md: 'row' }} mb={1}>
        <Stack spacing={0.5}>
          <Stack spacing={1} direction="row" alignItems="center">
            <Typography variant="h6">{`${currentData?.name} #${currentData?.id}`}</Typography>
            <Label variant="soft" color="primary">
              {t('task.editTask.task')}
            </Label>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {fDateTime(currentData?.created_at)}
          </Typography>
        </Stack>

        {/* <Stack
          flexGrow={1}
          spacing={1.5}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Button variant="contained" startIcon={<Iconify icon="solar:play-circle-bold" />}>
            {t('task.editTask.actions.runTask')}
          </Button>

          <IconButton>
            <Iconify icon="material-symbols:delete" />
          </IconButton>
        </Stack> */}
      </Stack>
      <FormProvider
        methods={methods}
        onSubmit={onSubmit}
        sx={{
          height: '100%',
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
          ))}
        </Tabs>
        {currentTab !== 'profile' ? (
          <Scrollbar
            autoHide={false}
            sxRoot={{
              overflow: 'unset',
            }}
            sx={{
              height: 'calc(100% - 160px)',
              pt: 3,
              '& .simplebar-track.simplebar-vertical': {
                position: 'absolute',
                right: '-12px',
                pointerEvents: 'auto',
                width: 10,
              },
            }}
          >
            {currentTab === 'information' && (
              <Stack spacing={2}>
                <RHFTextField name="name" label={t('task.editTask.information.name')} />
                <RHFTextField
                  name="note"
                  label={t('task.editTask.information.note')}
                  multiline
                  rows={6}
                />
              </Stack>
            )}

            {currentTab === 'input' && (
              <>
                {ruleset && ruleset?.children?.length > 0 ? (
                  <Stack>
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
                        {t('dialog.rpa.tabs.input.noData')}
                      </Typography>
                    )}
                  </Stack>
                ) : (
                  <InputTab
                    variable={variable}
                    setVariable={setVariable}
                    inputValidate={inputValidate}
                    setInputValidate={setInputValidate}
                  />
                )}
              </>
            )}

            {currentTab === 'config' && <ConfigTab />}
          </Scrollbar>
        ) : (
          <ProfileTab tableData={profile} setTableData={setProfile} taskId={currentData?.id} />
        )}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            position: 'absolute',
            bottom: 8,
          }}
        >
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} color="primary">
            {t('task.editTask.actions.save')}
          </LoadingButton>
          <Button variant="outlined" onClick={router.back}>
            {t('task.editTask.actions.cancel')}
          </Button>
        </Stack>
      </FormProvider>
    </Container>
  );
};

export default EditTaskView;

EditTaskView.propTypes = {
  currentData: PropTypes.object,
};
