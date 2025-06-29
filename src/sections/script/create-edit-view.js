import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  ButtonGroup,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import AlertDialogAdvanced from 'src/components/ask-before-leave-advanced';
import Iconify from 'src/components/iconify';
import { useResponsive } from 'src/hooks/use-responsive';
import { useParams, useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import { isElectron } from 'src/utils/commom';
import { checkRunWorkflowPermissionApi, getProfileByIdApi } from 'src/api/profile.api';
import { updateWorkFlow, useGetWorkFlowDetail } from 'src/api/workflow.api';
import { useLocales } from 'src/locales';
import { enqueueSnackbar } from 'notistack';
import { paths } from 'src/routes/paths';
import TerminalView from 'src/sections/script/code-editer/terminal';
import PublishWorkflowDialog from 'src/components/custom-dialog/publish-workflow-dialog';
import TableDialog from 'src/components/custom-dialog/table-dialog';
import Variables from 'src/components/variable';
import Resource from 'src/components/resource';
import ShareWorkflowDialog from 'src/components/custom-dialog/share-workflow-dialog';
import UpdateVersionDialog from 'src/components/custom-dialog/update-version-dialog';
import { findLastLineBeforeEndOfFunction } from 'src/utils/rpa';
import WorkflowConfigDialog from 'src/components/custom-dialog/workflow-config-dialog';
import { useEventListener } from 'src/hooks/use-event-listener';
import { LoadingButton } from '@mui/lab';
import { ERROR_CODE, GROUP_INVISIBLE, IS_BROWSER_DOWNLOADING } from 'src/utils/constance';
import { generateLogicScript } from 'src/utils/handle-bar-support';
import { getAutomationScripts } from 'src/api/automation.api';
import SplitPane from 'split-pane-react/esm/SplitPane';
import { Pane } from 'split-pane-react';
import Scrollbar from 'src/components/scrollbar';
import OptionsScriptForm from 'src/components/options-cript-form';
import { useSettingsContext } from 'src/components/settings';
import PendingWorkflowDialog from 'src/components/custom-dialog/pending-workflow-dialog';
import RejectedWorkflowDialog from 'src/components/custom-dialog/rejected-workflow-dialog';
import RunningAutomation from '../automation/running';
import LogList from '../automation/log';
import VScodeSetting from './code-editer/theme/settings';
import AddNewWorkflow from '../workspace/add-new-workflow';
import eventBus from './event-bus';
import { initialGroup } from '../variables-template/mock';
import CreateVariablesTemplate from '../variables-template/create-template';
import {
  CircularProgressWithLabel,
  transformKernelVersionToBrowserName,
} from '../../utils/profile';
import { getKernelVersionByIdApi } from '../../api/cms.api';
import { ConfirmDialog } from '../../components/custom-dialog';

export default function CreateEditScriptView() {
  const params = useParams();
  const idScript = params?.id;

  const theme = useTheme();
  const settings = useSettingsContext();
  const { t } = useLocales();
  const lgUp = useResponsive('up', 'lg');
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [recordStatus, setRecordStatus] = useState('idle');
  const [runStatus, setRunStatus] = useState('idle');
  const [scriptConfig, setScriptConfig] = useState({
    isFixedScreenSize: false,
    isScriptRequest: false,
  });
  const [savingPayload, setSavingPayload] = useState(null);
  const terminalDefault = getStorage('terminal');
  const [terminalSetting, setTerminalSetting] = useState(
    terminalDefault
      ? {
          fontSize: terminalDefault.fontSize,
          minimap: { enabled: terminalDefault.minimap.enabled },
        }
      : {}
  );
  const [anchorMore, setAnchorElMore] = useState(null);
  const openMore = Boolean(anchorMore);

  const shareForm = useBoolean();
  const publishForm = useBoolean();
  const pendingForm = useBoolean();
  const rejectedForm = useBoolean();
  const uploadVersion = useBoolean();
  const tableForm = useBoolean();
  const configForm = useBoolean();
  const addForm = useBoolean();
  const logListForm = useBoolean();
  const recordModal = useBoolean();
  const runningModal = useBoolean();
  const resourceModal = useBoolean();
  const variableModal = useBoolean();
  const settingVSCode = useBoolean();

  const [variableTemplateMode, setVariableTemplateMode] = useState('editor');
  const [designData, setDesignData] = useState(initialGroup);
  const defaultGroupInVisible = getStorage(GROUP_INVISIBLE);
  const [inputValidate, setInputValidate] = useState([]);

  const {
    statusEditingWF,
    updataStatusEditingWF,
    workspace_id,
    updateVariableFlow,
    variableFlow,
    resources,
    updateResources,
  } = useAuthContext();

  const { workflowInfo, refetchWorkFlowDetail, workflowInfoLoading } = useGetWorkFlowDetail(
    workspace_id,
    idScript
  );

  const [table, setTable] = useState([]);
  const [sizes, setSizes] = useState(defaultGroupInVisible?.script ? [0, 'auto'] : [240, 'auto']);
  const [initDataOptionScript, setInitDataOptionScript] = useState(null);
  const [scriptContent, setScriptContent] = useState('');
  const [browserDownloadName, setBrowserDownloadName] = useState('');
  const [downloadProgressPercent, setDownloadProgressPercent] = useState(0);
  const [extractionStatus, setExtractionStatus] = useState('pending');
  const [downloading, setDownloading] = useState(false);

  const [scriptSample, setScriptSample] = useState('');
  const [listSuggestion, setListSuggestion] = useState([]);

  const optionScriptForm = useBoolean();

  useEffect(() => {
    if (isElectron()) {
      window.ipcRenderer.on('update-browser-download-progress', (event, value) => {
        const percent = Math.round((value.downloadedMb / value.fullMb) * 100);

        if (value.status === 'Downloading') {
          setDownloadProgressPercent(percent);
        } else if (value.status === 'Download completed') {
          setDownloadProgressPercent(100);
          setExtractionStatus('in_progress');
        } else if (value.status === 'Extract Completed') {
          setDownloadProgressPercent(0);
          setExtractionStatus('pending');
          setDownloading(false);
          enqueueSnackbar(t('systemNotify.success.download'), { variant: 'success' });
          setStorage(IS_BROWSER_DOWNLOADING, 'no');
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitOptionFormData = (data) => {
    eventBus.emit('applyToCode', data);
    optionScriptForm.onFalse();
  };

  const applyCodeToTerminal = (item) => {
    if (!item?.parameters) {
      const crossData = generateLogicScript(item?.script_template, '');

      submitOptionFormData(`${crossData}
      `);
      return false;
    }

    optionScriptForm.onTrue();
    setInitDataOptionScript(item);
    return true;
  };

  const handleFilters = (event) => {
    setScriptSample(event.target.value);
    const newList = [];
    for (let i = 0; i < listSuggestion.length; i += 1) {
      const item = { ...listSuggestion[i] };
      if (item?.options) {
        item.options = item?.options.map((op) => ({
          ...op,
          display: op.name.toLowerCase().includes(event.target.value.toLowerCase()),
        }));
      }
      newList.push(item);
    }
    setListSuggestion(newList);
  };

  const collapsedSidebar = useCallback(() => {
    setSizes([0, 'auto']);
    setStorage(GROUP_INVISIBLE, {
      ...defaultGroupInVisible,
      script: true,
    });
  }, [defaultGroupInVisible]);

  const handleExitTerminal = () => {
    router.back();
  };

  const openSettingVSCode = () => {
    settingVSCode.onTrue();
    setAnchorElMore(null);
  };

  const stopScript = async () => {
    if (isElectron()) {
      setRunStatus('loading');
      await window.ipcRenderer.invoke('stop-script-editor');
      setRunStatus('idle');
    }
  };

  const stopRecord = async () => {
    if (isElectron()) {
      setRecordStatus('loading');
      await window.ipcRenderer.invoke('stop-recoder');
      setRecordStatus('idle');
    }
  };

  const handleFormatCode = () => {
    eventBus.emit('formatCode');
    setAnchorElMore(null);
  };

  const handleOpenOutput = () => {
    eventBus.emit('openOutput');
    setAnchorElMore(null);
  };

  const showIconRunOrStop = () => {
    const commonIconButtonStyles = {
      borderRadius: 1,
      px: workflowInfo?.is_encrypted ? 3 : '8px',
    };

    switch (runStatus) {
      case 'loading':
        return (
          <Tooltip title={t('workflow.script.actions.starting')} arrow placement="top">
            <IconButton aria-label="starting" size="small" sx={commonIconButtonStyles}>
              <Iconify icon="line-md:loading-loop" color="text.primary" />
            </IconButton>
          </Tooltip>
        );
      case 'running':
        return (
          <Tooltip title={t('workflow.script.actions.stop')} arrow placement="top">
            <IconButton
              aria-label="stop"
              size="small"
              sx={commonIconButtonStyles}
              onClick={stopScript}
            >
              <Iconify icon="clarity:stop-solid" sx={{ color: 'red' }} />
            </IconButton>
          </Tooltip>
        );
      default:
        return (
          <Tooltip title={t('workflow.script.actions.run')} arrow placement="top">
            <IconButton
              aria-label="run"
              size="small"
              sx={commonIconButtonStyles}
              onClick={runningModal.onTrue}
            >
              <Iconify icon="ph:play-fill" color="text.primary" />
            </IconButton>
          </Tooltip>
        );
    }
  };

  const showIconRecordOrStop = () => {
    const commonIconButtonStyles = {
      borderRadius: 1,
      paddingX: '8px',
    };

    switch (recordStatus) {
      case 'loading':
        return (
          <Tooltip title={t('workflow.script.actions.starting')} arrow placement="top">
            <IconButton aria-label="starting" size="small" sx={commonIconButtonStyles}>
              <Iconify icon="line-md:loading-loop" color="text.primary" />
            </IconButton>
          </Tooltip>
        );
      case 'running':
        return (
          <Tooltip title={t('workflow.script.actions.stop')} arrow placement="top">
            <IconButton
              aria-label="stop"
              size="small"
              sx={commonIconButtonStyles}
              onClick={stopRecord}
            >
              <Iconify icon="fluent:record-stop-32-regular" sx={{ color: 'red' }} />
            </IconButton>
          </Tooltip>
        );
      default:
        return (
          <Tooltip title={t('workflow.script.actions.record')} arrow placement="top">
            <IconButton
              aria-label="record"
              size="small"
              sx={commonIconButtonStyles}
              onClick={recordModal.onTrue}
            >
              <Iconify icon="gg:record" color="text.primary" />
            </IconButton>
          </Tooltip>
        );
    }
  };

  const saveScript = useCallback(
    async (ruleset) => {
      let design_data = '';

      if (ruleset?.id) {
        design_data = ruleset;
      } else {
        design_data = designData;
      }

      let inputValidateError = [];
      let variableData = [];

      if (variableFlow?.dataFlow?.is_encrypted) {
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

        const rulesetMap = (design_data?.children || []).reduce((acc, item) => {
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

        variableData = variableFlow?.list.map((item) => {
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
          return item;
        });

        inputValidateError = variableData
          .map((item) =>
            item.is_required &&
            (typeof item.value === 'object' ? item.value.length === 0 : !item.value)
              ? item.rulesetId
              : ''
          )
          .filter((item) => item);
        setInputValidate(inputValidateError);
        if (inputValidateError.length > 0) return false;
      }

      if (workflowInfo?.id) {
        let payload = {};
        if (variableFlow?.dataFlow?.is_encrypted) {
          payload = {
            global_data:
              design_data?.children?.length > 0 ? variableData : variableFlow?.list || [],
          };
        } else {
          payload = {
            config: scriptConfig,
            name: workflowInfo?.name,
            content: scriptContent,
            workflow_group: Number(workflowInfo?.workflow_group),
            global_data: [...(variableFlow?.list || [])],
            resources: [...(resources?.list || [])],
            table,
            design_data,
          };
        }

        try {
          setLoading(true);
          await updateWorkFlow(workspace_id, workflowInfo?.id, payload);
          enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });

          if (variableFlow?.dataFlow?.is_encrypted) {
            updateVariableFlow({
              list: variableData,
            });
          }

          return true;
        } catch (error) {
          console.log('error', error);
          if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
            enqueueSnackbar(t('systemNotify.warning.notPermission.workflow.update'), {
              variant: 'error',
            });
          }
          return false;
        } finally {
          updataStatusEditingWF(false);
          setLoading(false);
        }
      } else {
        addForm.onTrue();
        setSavingPayload({
          config: scriptConfig,
          content: scriptContent,
          table,
          design_data,
        });
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      designData,
      resources?.list,
      scriptConfig,
      scriptContent,
      t,
      table,
      variableFlow?.list,
      workflowInfo?.id,
      workflowInfo?.name,
      workflowInfo?.workflow_group,
      workspace_id,
    ]
  );

  useEventListener('keydown', (event) => {
    if (event.ctrlKey && event.target.nodeName !== 'INPUT') {
      if (event.key === 's') {
        event.preventDefault();
        event.stopPropagation();
        saveScript();
      }
    }
  });

  const resetPage = async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    router.push(paths.dashboard.automation);
  };

  const handleRecord = async (data) => {
    if (isElectron()) {
      try {
        setRecordStatus('loading');
        recordModal.onFalse();
        setRecordStatus('running');
        await window.ipcRenderer.invoke('start-recoder', {
          profileId: parseInt(data?.profile, 10),
          workspace_id,
          scriptConfig,
        });
        setRecordStatus('idle');
      } catch (error) {
        console.log('error', error);
      }
    }
  };

  const downloadBrowserIfNeeded = async (kernelVersion) => {
    const kernelVersionResponse = await getKernelVersionByIdApi(kernelVersion.id);
    if (kernelVersionResponse?.data) {
      window.ipcRenderer.send('download-browser', kernelVersionResponse.data);
      setStorage(IS_BROWSER_DOWNLOADING, 'yes');
    }
  };

  const handleRun = async (data) => {
    if (isElectron()) {
      try {
        const response = await checkRunWorkflowPermissionApi(workspace_id);
        if (!response?.data?.status) {
          enqueueSnackbar(t('systemNotify.warning.notPermission.workflow.run'), {
            variant: 'error',
          });
          return;
        }

        const profileRespone = await getProfileByIdApi(workspace_id, data?.profile);
        const profile = profileRespone?.data;

        const isDownloaded = await window.ipcRenderer.invoke('check-browser-download', {
          browser_type: profile.kernel_version.type,
          kernel_version: profile.kernel_version.kernel,
        });

        if (!isDownloaded) {
          setBrowserDownloadName(transformKernelVersionToBrowserName(profile.kernel_version));
          setDownloading(true);
          await downloadBrowserIfNeeded(profile.kernel_version);
          return;
        }

        setRunStatus('loading');
        handleOpenOutput();
        let globalData = [];
        if (variableFlow?.list && variableFlow.list.length > 0) {
          globalData = variableFlow.list.map((i) => ({
            key: i.key,
            value: i.value,
            type: i.type,
            jsonValue: i.jsonValue,
            defaultValue: i.defaultValue,
          }));
        }
        runningModal.onFalse();
        setTimeout(() => {
          setRunStatus((prev) => (prev === 'loading' ? 'running' : 'idle'));
        }, 3000);

        window.ipcRenderer.send('run-script-editor', {
          profileData: profileRespone?.data,
          script: scriptContent,
          global_data: globalData,
          isEncrypted: workflowInfo?.is_encrypted,
          scriptConfig,
          isFlow: false,
          design_data: workflowInfo?.design_data,
        });
      } catch (error) {
        console.log('error', error);
        if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
          enqueueSnackbar(t('systemNotify.warning.notPermission.workflow.run'), {
            variant: 'error',
          });
        }
      }
    }
  };

  function getTooltipTitle() {
    let title = '';
    if (workflowInfo?.source_workflow) {
      title = t('workflow.script.tooltip.noAvailableForDownload');
    } else if (workflowInfo?.is_encrypted) {
      title = t('workflow.script.tooltip.noAvailableForEncrypt');
    }
    return title;
  }

  useEffect(() => {
    if (!workflowInfoLoading) {
      if (workflowInfo?.id) {
        if (workflowInfo?.content && Array.isArray(workflowInfo?.content)) {
          setScriptContent(workflowInfo?.content[0]);
        } else {
          setScriptContent(workflowInfo?.content);
        }

        setTable(workflowInfo?.table || []);

        if (workflowInfo?.design_data) {
          setDesignData(workflowInfo.design_data);
        }

        updateVariableFlow({
          ...variableFlow,
          list: workflowInfo?.global_data,
          dataFlow: workflowInfo,
          status: 'editting',
        });

        updateResources({
          ...resources,
          list: workflowInfo?.resources,
        });
      } else {
        setScriptContent(
          `async function startWorkflow() {
    const rpa = new rpaLib.Rpa();
    await rpa.connect($wsEndpoint);
    // code here

};`
        );
      }
    } else {
      setScriptContent('//Loading...');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowInfo, workflowInfoLoading]);

  useEffect(() => {
    const getScriptOptions = async () => {
      const _res = await getAutomationScripts();
      const { data } = _res;
      const list = [];

      for (let i = 0; i < data.length; i += 1) {
        if (data[i].parent === null) {
          let item = data[i];
          const filterChild = data.filter((op) => op.parent === item.id);
          if (filterChild.length > 0) {
            item = {
              ...item,
              options: filterChild.map((chil) => ({ ...chil, display: true })),
            };
          }
          list.push(item);
        }
      }
      setListSuggestion(list);
    };

    getScriptOptions();
  }, []);

  useEffect(() => {
    if (workflowInfo?.id) {
      setScriptConfig(workflowInfo.config);
    }
  }, [workflowInfo]);

  useEffect(() => {
    if (isElectron()) {
      window.ipcRenderer.on('profile-editor-close', () => {
        setRunStatus('idle');
      });
    }
    return () => {
      if (isElectron()) {
        window.ipcRenderer.removeAllListeners('profile-editor-close');
      }
    };
  }, []);

  useEffect(
    () => () => {
      updataStatusEditingWF(false);
      updateVariableFlow({
        list: [],
        dataFlow: null,
      });
      updateResources({
        list: [],
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <AlertDialogAdvanced
        isBlocking={statusEditingWF}
        isSaveBeforeLeave
        onSave={saveScript}
        isSaving={loading}
      />

      {(!idScript || (workflowInfo?.id && !workflowInfo?.is_encrypted)) && (
        <ToggleButtonGroup
          sx={{
            position: 'absolute',
            top: 7,
            right: {
              sm: `calc(50% - ${sizes[0] / 2}px)`,
              md: `calc(50% - ${sizes[0] / 2}px + ${idScript ? 100 : 40}px + ${
                workflowInfo?.is_public && workflowInfo?.public_workflow?.status === 'approved'
                  ? 16
                  : 0
              }px)`,
              xl: `calc(50% - ${sizes[0] / 2}px)`,
            },
            transform: 'translateX(50%)',
            zIndex: 99,
            borderRadius: '4px',
          }}
          value={variableTemplateMode}
          size="small"
          exclusive
          onChange={(_, newValue) => {
            if (newValue) {
              if (newValue === 'editor') {
                eventBus.emit('update_design_data');
              } else {
                eventBus.emit('update_ruleset_data', designData);
              }
              setVariableTemplateMode(newValue);
            }
          }}
          aria-label="text alignment"
        >
          <ToggleButton
            value="editor"
            sx={{
              py: 0.4,
              borderRadius: '4px!important',
            }}
          >
            <Iconify
              icon="fluent:flowchart-16-regular"
              width={18}
              height={18}
              sx={{
                mr: 0.5,
              }}
            />
            Editor
          </ToggleButton>
          <ToggleButton
            value="designer"
            sx={{
              py: 0.4,
              borderRadius: '4px!important',
            }}
          >
            <Iconify
              icon="fluent:pen-sparkle-16-filled"
              width={18}
              height={18}
              sx={{
                mr: 0.5,
              }}
            />
            Designer
          </ToggleButton>
        </ToggleButtonGroup>
      )}

      {!(workflowInfo?.id && workflowInfo?.is_encrypted) && (
        <CreateVariablesTemplate
          variableTemplateMode={variableTemplateMode}
          wfInfo={workflowInfo}
          saveFlowChart={saveScript}
          loading={loading}
          designData={designData}
          setDesignData={setDesignData}
          onShareModal={shareForm.onTrue}
          onPublishModal={publishForm.onTrue}
          onPendingModal={pendingForm.onTrue}
          onRejectedModal={rejectedForm.onTrue}
          onUploadModal={uploadVersion.onTrue}
          idWorkflow={idScript}
          onVariableModal={variableModal.onTrue}
        />
      )}

      <Stack
        direction="row"
        style={{ height: '100%', position: 'relative' }}
        sx={{
          pt: 1.2,
          ...(variableTemplateMode === 'editor' && {
            transform: `translateY(-100%)`,
            ...(workflowInfo?.id &&
              workflowInfo?.is_encrypted && {
                transform: `translateY(0)`,
              }),
          }),
        }}
      >
        {JSON.stringify(sizes) === JSON.stringify([0, 'auto']) && (
          <Stack sx={{ position: 'absolute', top: 70, left: 0, zIndex: 10 }}>
            <Tooltip title="Hiển thị thanh công cụ" arrow placement="top">
              <IconButton
                aria-label="share"
                size="small"
                sx={{
                  border: '1px solid',
                  borderLeft: 0,
                  borderRadius: 2,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  paddingX: '4px',
                  borderColor: alpha(theme.palette.grey[500], 0.32),
                  bgcolor: alpha(theme.palette.grey[600]),
                }}
                onClick={() => {
                  setSizes([240, 'auto']);
                  setStorage(GROUP_INVISIBLE, {
                    ...defaultGroupInVisible,
                    script: false,
                  });
                }}
              >
                <Iconify
                  icon="lsicon:double-arrow-right-outline"
                  color="text.primary"
                  width={24}
                  height={24}
                />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
        <SplitPane
          split="vertical"
          sizes={
            !idScript || (workflowInfo?.id && !workflowInfo?.is_encrypted) ? sizes : [0, 'auto']
          }
          onChange={(values) => {
            if (values?.[0] <= 120) {
              setSizes([0, 'auto']);
            } else if (values?.[0] >= 160) {
              setSizes(values);
            }
          }}
        >
          {!idScript || !workflowInfo?.id || (workflowInfo?.id && !workflowInfo?.is_encrypted) ? (
            <Pane maxSize="35%">
              <Stack
                sx={{
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                  border: `dashed 1px ${theme.palette.divider}`,
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                <Stack className="app-sidebar" height={1}>
                  <Stack direction="column" height={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap="wrap"
                      p={2}
                    >
                      <Typography variant="h6">{t('workflow.script.options')}</Typography>
                    </Stack>
                    <Stack sx={{ height: 'calc(100% - 70px)' }}>
                      <Stack height={1}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          flexGrow={1}
                          sx={{ width: 1 }}
                          px={1}
                        >
                          <TextField
                            fullWidth
                            value={scriptSample}
                            onChange={handleFilters}
                            placeholder={`${t('workflow.script.actions.search')}...`}
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <>
                                  {scriptSample ? (
                                    <Iconify
                                      onClick={() => handleFilters({ target: { value: '' } })}
                                      icon="carbon:close-outline"
                                      sx={{
                                        color: 'text.disabled',
                                        '&:hover': { cursor: 'pointer', color: 'white' },
                                      }}
                                    />
                                  ) : null}
                                </>
                              ),
                            }}
                          />

                          <Tooltip title="Thu gọn thanh công cụ" arrow placement="top">
                            <IconButton
                              aria-label="share"
                              size="small"
                              sx={{
                                border: '1px solid',
                                borderRadius: 1,
                                paddingX: '8px',
                                borderColor: alpha(theme.palette.grey[500], 0.32),
                              }}
                              onClick={collapsedSidebar}
                            >
                              <Iconify
                                icon="lsicon:double-arrow-left-outline"
                                color="text.primary"
                                width={24}
                                height={24}
                              />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        <Scrollbar>
                          <Stack p={1}>
                            {listSuggestion.map((item) => (
                              <Accordion
                                key={item.id}
                                sx={{
                                  marginBottom: '5px',
                                  '&.Mui-expanded': {
                                    marginBottom: '2.5px',
                                  },
                                }}
                                defaultExpanded
                              >
                                <AccordionSummary
                                  expandIcon={<Iconify icon="icon-park-outline:down" width={20} />}
                                  aria-controls="panel1a-content"
                                  id="panel1a-header"
                                >
                                  <Typography variant="body2">{item.name}</Typography>
                                </AccordionSummary>
                                {item?.options?.length > 0 && (
                                  <AccordionDetails sx={{ padding: '0' }}>
                                    {item.options.map(
                                      (trig) =>
                                        trig.display && (
                                          <Stack
                                            onClick={() => applyCodeToTerminal(trig)}
                                            key={trig.id}
                                            direction="row"
                                            spacing={2}
                                            alignItems="center"
                                            sx={[
                                              { padding: '10px' },
                                              {
                                                '&:hover': {
                                                  backgroundColor: 'rgba(145, 158, 171, 0.08)',
                                                  cursor: 'pointer',
                                                },
                                              },
                                            ]}
                                          >
                                            <Iconify
                                              icon={trig?.icon || 'ion:options'}
                                              width={20}
                                            />
                                            <Typography>{trig?.name}</Typography>
                                          </Stack>
                                        )
                                    )}
                                  </AccordionDetails>
                                )}
                              </Accordion>
                            ))}
                          </Stack>
                        </Scrollbar>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
                {initDataOptionScript && (
                  <OptionsScriptForm
                    open={optionScriptForm.value}
                    onClose={optionScriptForm.onFalse}
                    submitOptionFormData={submitOptionFormData}
                    initData={initDataOptionScript}
                  />
                )}
              </Stack>
            </Pane>
          ) : (
            <Pane minSize={0} maxSize="0%" />
          )}

          <Pane style={{ height: '100%' }}>
            <Stack
              sx={{
                width: 1,
                height: 1,
                position: 'relative',
                pl: 2,
              }}
              spacing={2}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Tooltip
                    title={lgUp ? '' : t('workflow.script.actions.back')}
                    arrow
                    placement="top"
                  >
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="gg:log-out" />}
                      onClick={() => handleExitTerminal()}
                      sx={{
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        columnGap: 1,
                        flexShrink: 0,
                        '& .MuiButton-startIcon': {
                          marginRight: 0,
                        },
                      }}
                    >
                      {lgUp && t('workflow.script.actions.back')}
                    </Button>
                  </Tooltip>
                  <Typography
                    variant="h6"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {workflowInfo?.name || ''}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2}>
                  {workflowInfo?.id && (
                    <Tooltip title={getTooltipTitle()} arrow placement="top">
                      <ButtonGroup
                        sx={{
                          border: '1px solid',
                          borderColor: alpha(theme.palette.grey[500], 0.32),
                          paddingX: '8px',
                          height: '36px',
                        }}
                      >
                        <Tooltip
                          title={
                            !workflowInfo?.source_workflow &&
                            !workflowInfo?.is_encrypted &&
                            t('workflow.script.actions.share')
                          }
                          arrow
                          placement="top"
                        >
                          <span
                            style={{
                              paddingTop: '2px',
                            }}
                          >
                            <IconButton
                              aria-label="share"
                              size="small"
                              sx={{
                                borderRadius: 1,
                                paddingX: '8px',
                                opacity:
                                  workflowInfo?.source_workflow ||
                                  (!workflowInfo?.source_workflow && workflowInfo?.is_encrypted)
                                    ? 0.5
                                    : 1,
                              }}
                              disabled={
                                workflowInfo?.source_workflow !== null ||
                                (!workflowInfo?.source_workflow && workflowInfo?.is_encrypted)
                              }
                              onClick={shareForm.onTrue}
                            >
                              <Iconify icon="material-symbols:share" color="text.primary" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            !workflowInfo?.source_workflow &&
                            !workflowInfo?.is_encrypted &&
                            // eslint-disable-next-line no-nested-ternary
                            (workflowInfo?.is_public
                              ? // eslint-disable-next-line no-nested-ternary
                                workflowInfo?.public_workflow?.status === 'pending'
                                ? t('workflow.script.actions.pending')
                                : workflowInfo?.public_workflow?.status === 'rejected'
                                  ? t('workflow.script.actions.rejected')
                                  : t('workflow.script.actions.published')
                              : t('workflow.script.actions.publish'))
                          }
                          arrow
                          placement="top"
                        >
                          <span
                            style={{
                              paddingTop: '2px',
                            }}
                          >
                            <IconButton
                              aria-label="publish"
                              size="small"
                              sx={{
                                borderRadius: 1,
                                paddingX: '8px',
                                opacity:
                                  workflowInfo?.source_workflow ||
                                  (!workflowInfo?.source_workflow && workflowInfo?.is_encrypted)
                                    ? 0.5
                                    : 1,
                              }}
                              disabled={
                                workflowInfo?.source_workflow !== null ||
                                (!workflowInfo?.source_workflow && workflowInfo?.is_encrypted)
                              }
                              onClick={() => {
                                if (workflowInfo?.public_workflow?.status === 'pending') {
                                  pendingForm.onTrue();
                                } else if (workflowInfo?.public_workflow?.status === 'rejected') {
                                  rejectedForm.onTrue();
                                } else {
                                  publishForm.onTrue();
                                }
                              }}
                            >
                              <Iconify
                                icon="material-symbols:publish"
                                color={
                                  // eslint-disable-next-line no-nested-ternary
                                  workflowInfo?.is_public
                                    ? // eslint-disable-next-line no-nested-ternary
                                      workflowInfo?.public_workflow?.status === 'pending'
                                      ? 'warning.main'
                                      : workflowInfo?.public_workflow?.status === 'rejected'
                                        ? 'error.main'
                                        : 'primary.main'
                                    : 'text.primary'
                                }
                              />
                            </IconButton>
                          </span>
                        </Tooltip>
                        {workflowInfo?.is_public &&
                          workflowInfo?.public_workflow?.status === 'approved' && (
                            <Tooltip
                              title={t('workflow.script.actions.uploadVersion')}
                              arrow
                              placement="top"
                            >
                              <IconButton
                                aria-label="update-version"
                                size="small"
                                sx={{
                                  borderRadius: 1,
                                  paddingX: '8px',
                                }}
                                onClick={uploadVersion.onTrue}
                              >
                                <Iconify icon="grommet-icons:cloud-upload" color="text.primary" />
                              </IconButton>
                            </Tooltip>
                          )}
                      </ButtonGroup>
                    </Tooltip>
                  )}

                  <ButtonGroup
                    sx={{
                      border: '1px solid',
                      borderColor: alpha(theme.palette.grey[500], 0.32),
                      paddingX: '8px',
                      height: '36px',
                    }}
                  >
                    <Tooltip title={t('workflow.script.actions.resource')} arrow placement="top">
                      <IconButton
                        aria-label="resource"
                        size="small"
                        sx={{
                          borderRadius: 1,
                          paddingX: '8px',
                        }}
                        onClick={resourceModal.onTrue}
                      >
                        <Iconify icon="ic:outline-source" color="text.primary" />
                      </IconButton>
                    </Tooltip>
                    {!idScript ? (
                      <Tooltip title={t('workflow.script.actions.variable')} arrow placement="top">
                        <IconButton
                          aria-label="variables"
                          size="small"
                          sx={{
                            borderRadius: 1,
                            paddingX: '8px',
                          }}
                          onClick={variableModal.onTrue}
                        >
                          <Iconify icon="fluent:braces-variable-20-filled" color="text.primary" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      workflowInfo?.id &&
                      !workflowInfo?.is_encrypted && (
                        <Tooltip
                          title={t('workflow.script.actions.variable')}
                          arrow
                          placement="top"
                        >
                          <IconButton
                            aria-label="variables"
                            size="small"
                            sx={{
                              borderRadius: 1,
                              paddingX: '8px',
                            }}
                            onClick={variableModal.onTrue}
                          >
                            <Iconify icon="fluent:braces-variable-20-filled" color="text.primary" />
                          </IconButton>
                        </Tooltip>
                      )
                    )}
                    <Tooltip title={t('workflow.script.actions.table')} arrow placement="top">
                      <IconButton
                        aria-label="table"
                        size="small"
                        sx={{
                          borderRadius: 1,
                          paddingX: '8px',
                        }}
                        onClick={tableForm.onTrue}
                      >
                        <Iconify icon="ri:table-3" color="text.primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('workflow.script.actions.config')} arrow placement="top">
                      <IconButton
                        aria-label="table"
                        size="small"
                        sx={{
                          borderRadius: 1,
                          paddingX: '8px',
                        }}
                        onClick={configForm.onTrue}
                      >
                        <Iconify
                          icon="ant-design:setting-filled"
                          color="text.primary"
                          sx={{ opacity: 0.9 }}
                        />
                      </IconButton>
                    </Tooltip>
                  </ButtonGroup>
                  <ButtonGroup
                    sx={{
                      border: '1px solid',
                      borderColor: alpha(theme.palette.grey[500], 0.32),
                      paddingX: workflowInfo?.is_encrypted ? 0 : 2,
                      height: '36px',
                    }}
                  >
                    {showIconRunOrStop()}
                    {!workflowInfo?.is_encrypted && showIconRecordOrStop()}
                  </ButtonGroup>
                  <IconButton
                    aria-label="more"
                    id="long-button"
                    aria-controls={openMore ? 'long-menu' : undefined}
                    aria-expanded={openMore ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={(event) => setAnchorElMore(event.currentTarget)}
                    sx={{
                      border: '1px solid',
                      borderColor: alpha(theme.palette.grey[500], 0.32),
                      bgcolor: alpha(
                        theme.palette.grey[settings.themeMode === 'dark' ? 900 : 300],
                        1
                      ),
                      p: 0.9,
                      borderRadius: 1,
                    }}
                  >
                    <Iconify icon="ri:more-2-fill" />
                  </IconButton>
                  <Menu
                    id="long-menu"
                    MenuListProps={{
                      'aria-labelledby': 'long-button',
                    }}
                    anchorEl={anchorMore}
                    open={openMore}
                    onClose={() => setAnchorElMore(null)}
                    sx={{ width: '300px' }}
                  >
                    <MenuItem onClick={() => openSettingVSCode()}>
                      <Stack direction="row" spacing={1}>
                        <Iconify icon="uil:setting" />
                        {t('workflow.script.actions.setting')}
                      </Stack>
                    </MenuItem>
                    <MenuItem onClick={() => handleFormatCode()}>
                      <Stack direction="row" spacing={1}>
                        <Iconify icon="gg:format-center" />
                        {t('workflow.script.actions.formatCode')}
                      </Stack>
                    </MenuItem>
                    <MenuItem onClick={() => handleOpenOutput()}>
                      <Stack direction="row" spacing={1}>
                        <Iconify icon="pajamas:log" />
                        {t('workflow.script.actions.displayOutput')}
                      </Stack>
                    </MenuItem>
                  </Menu>
                  <LoadingButton
                    loading={loading}
                    variant="contained"
                    startIcon={<Iconify icon="ri:save-line" width={20} />}
                    onClick={() => saveScript()}
                    sx={{
                      height: '34px',
                    }}
                  >
                    {workflowInfo?.id
                      ? t('workflow.script.actions.saveChange')
                      : t('workflow.script.actions.create')}
                  </LoadingButton>
                </Stack>
              </Stack>

              <Box
                sx={{
                  width: 1,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                  border: `dashed 1px ${theme.palette.divider}`,
                  height: '100%',
                  padding: '10px',
                  ...(workflowInfo?.is_encrypted && {
                    pt: 0,
                  }),
                }}
              >
                <TerminalView
                  setScriptContent={setScriptContent}
                  scriptContent={scriptContent}
                  settings={terminalSetting}
                  table={table}
                  readme={workflowInfo?.readme}
                  isEncrypted={workflowInfo?.is_encrypted}
                  hasDesignData={Boolean(
                    workflowInfo?.design_data && workflowInfo?.design_data?.children?.length > 0
                  )}
                  linePosition={findLastLineBeforeEndOfFunction(scriptContent, 'startWorkflow')}
                  ruleset={designData}
                  setRuleset={setDesignData}
                  inputValidate={inputValidate}
                  setInputValidate={setInputValidate}
                />
              </Box>
            </Stack>
          </Pane>
        </SplitPane>
      </Stack>

      {addForm.value && (
        <AddNewWorkflow
          open={addForm.value}
          onClose={addForm.onFalse}
          payload={savingPayload}
          onConfirmSave={() => {
            setStorage('displayWorkflow', 'myWorkflow');
          }}
          resetData={resetPage}
          mode="script"
        />
      )}

      {settingVSCode.value && (
        <VScodeSetting
          open={settingVSCode.value}
          onClose={settingVSCode.onFalse}
          terminalSetting={terminalSetting}
          setTerminalSetting={setTerminalSetting}
        />
      )}

      <PublishWorkflowDialog
        open={publishForm.value}
        onClose={publishForm.onFalse}
        workflowInfo={workflowInfo}
        handleReloadData={refetchWorkFlowDetail}
      />

      <PendingWorkflowDialog
        open={pendingForm.value}
        onClose={pendingForm.onFalse}
        workflowInfo={workflowInfo}
        handleReloadData={refetchWorkFlowDetail}
      />

      <RejectedWorkflowDialog
        open={rejectedForm.value}
        onClose={rejectedForm.onFalse}
        workflowInfo={workflowInfo}
        handleReloadData={refetchWorkFlowDetail}
      />

      <UpdateVersionDialog
        open={uploadVersion.value}
        onClose={uploadVersion.onFalse}
        currentVersion={workflowInfo?.public_workflow?.current_version}
        publicWorkflowId={workflowInfo?.public_workflow?.id}
        last_update={workflowInfo?.public_workflow?.last_update}
      />

      <ShareWorkflowDialog
        open={shareForm.value}
        onClose={shareForm.onFalse}
        shareItem={workflowInfo}
      />

      <LogList open={logListForm.value} onClose={logListForm.onFalse} />

      <RunningAutomation
        open={runningModal.value}
        onClose={runningModal.onFalse}
        handleSubmitForm={handleRun}
      />

      <RunningAutomation
        open={recordModal.value}
        onClose={recordModal.onFalse}
        handleSubmitForm={handleRecord}
      />

      <Resource open={resourceModal.value} onClose={resourceModal.onFalse} />

      <Variables
        open={variableModal.value}
        onClose={variableModal.onFalse}
        isFromMarket={Boolean(workflowInfo?.source_workflow)}
        hiddenUiSetting
      />
      <TableDialog
        open={tableForm.value}
        onClose={tableForm.onFalse}
        table={table}
        setTableData={setTable}
      />
      <ConfirmDialog
        open={downloading}
        onClose={() => setDownloading(false)}
        onlyButton
        content={
          <Stack direction="column" spacing={3} alignItems="center">
            <CircularProgressWithLabel value={downloadProgressPercent} variant="determinate" />
            <Typography variant="h6">
              {extractionStatus === 'pending'
                ? t('dialog.downloadBrowser.title', { browserName: browserDownloadName })
                : t('dialog.downloadBrowser.extracting')}
            </Typography>
          </Stack>
        }
      />
      <WorkflowConfigDialog
        open={configForm.value}
        onClose={configForm.onFalse}
        scriptConfig={scriptConfig}
        setScriptConfig={setScriptConfig}
      />
    </>
  );
}
