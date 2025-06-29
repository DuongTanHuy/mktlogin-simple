import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import FormProvider from 'src/components/hook-form';
// apis
import { getListWorkFlow, getWorkFlowDetail } from 'src/api/workflow.api';
import { createRpaApi } from 'src/api/task.api';

// mui
import Iconify from 'src/components/iconify';
import { useForm } from 'react-hook-form';
import Scrollbar from 'src/components/scrollbar';
import { useAuthContext } from 'src/auth/hooks';
import { ERROR_CODE } from 'src/utils/constance';
import { enqueueSnackbar } from 'notistack';
import { useLocales } from 'src/locales';
import InputTab from './tab/input-tab';
import RunConfigurationTab from './tab/run-configuration-tab';
import OptionalTab from './tab/optional-tab';
import InformationTab from './tab/information-tab';

//----------------------------------------------------------------

const TABS = [
  {
    value: 'optional',
    label: 'Tùy chọn',
    icon: <Iconify icon="bxs:customize" width={24} />,
  },
  {
    value: 'run-configuration',
    label: 'Cấu hình chạy',
    icon: <Iconify icon="eos-icons:configuration-file" width={24} />,
  },
  {
    value: 'input',
    label: 'Input',
    icon: <Iconify icon="streamline:input-box-solid" width={24} />,
  },
  {
    value: 'information',
    label: 'Thông tin',
    icon: <Iconify icon="mdi:information-box" width={24} />,
  },
];

//----------------------------------------------------------------

const RpaSingleFormDialog = ({ open, onClose, listWorkflowGroup = [], profileId }) => {
  const { t } = useLocales();
  const { workspace_id } = useAuthContext();
  const RpaSchema = Yup.object().shape({
    workflow: Yup.mixed().test('is-required', t('validate.required'), (value) => value !== ''),
    scale: Yup.number().min(0, t('validate.scale.min')).max(1, t('validate.windowSize.scale.max')),
  });

  const [currentTab, setCurrentTab] = useState('optional');
  const [listWorkflow, setListWorkflow] = useState([]);
  const [variable, setVariable] = useState([]);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const defaultValues = {
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
    executionTime: null,
    weekly: 1,
    perMonth: 1,
    //
    rowLimitDisplay: 0,
    windowWidth: 0,
    windowHeight: 0,
    scale: 0.8,
    spacing: 0,
    duration: 0,
  };

  const methods = useForm({
    resolver: yupResolver(RpaSchema),
    defaultValues,
  });

  const {
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const watchWorkflowGroup = watch('workflowGroup');
  const watchWorkflow = watch('workflow');
  const watchTaskType = watch('taskType');

  useEffect(() => {
    setValue('workflow', '');
    const fetchWorkflow = async () => {
      try {
        const params = {
          ...(watchWorkflowGroup !== 'all' && {
            workflow_group: watchWorkflowGroup,
          }),
        };
        const response = await getListWorkFlow(workspace_id, params);
        if (response?.data) {
          const { data } = response.data;
          setListWorkflow(data);
        }
      } catch (error) {
        /* empty */
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
          const { global_data } = response.data;
          setVariable(global_data);
        }
      } catch (error) {
        /* empty */
      }
    };

    if (watchWorkflow !== '') {
      fetchWorkflow();
    }
  }, [watchWorkflow, workspace_id]);

  const handleCreateRpa = async (payload) => {
    try {
      await createRpaApi(workspace_id, payload);
      handleClose();
      enqueueSnackbar(t('systemNotify.success.create'), { variant: 'success' });
    } catch (error) {
      throw error;
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();

    return handleSubmit(async (data) => {
      if (!profileId) return;
      try {
        const {
          workflow,
          rowLimitDisplay,
          windowWidth,
          windowHeight,
          scale,
          spacing,
          duration,
          name,
          note,
        } = data;
        const payload = {
          name,
          note,
          profiles: [profileId],
          config: {
            window_number: rowLimitDisplay,
            window_size: `${windowWidth}x${windowHeight}`,
            scale,
            row_spacing: spacing,
            delay: duration,
          },
          global_data: [variable?.map(({ file, id, ...rest }) => rest)],
          workflow,
        };
        if (watchTaskType === 'common') {
          if (event.nativeEvent.submitter.id === 'create') {
            await handleCreateRpa(payload);
          } else {
            console.log('create and run');
          }
        }
      } catch (error) {
        if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
          enqueueSnackbar(t('systemNotify.warning.notPermission.profile.rpa'), {
            variant: 'error',
          });
        } else
          enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
      }
    })();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle sx={{ pb: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">RPA</Typography>
            <IconButton onClick={handleClose}>
              <Iconify icon="ic:round-close" />
            </IconButton>
          </Stack>
          <Divider />
        </Stack>
      </DialogTitle>

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          ml: 3,
          mb: { xs: 2, md: 3 },
          // '& .MuiTabs-indicator': {
          //   ...(Object.keys(errors).length > 0 && {
          //     bgcolor: 'error.main',
          //   }),
          // },
        }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            icon={tab.icon}
            value={tab.value}
            // sx={{
            //   ...(Object.keys(errors).length > 0 && {
            //     color: 'error.main',
            //   }),
            // }}
          />
        ))}
      </Tabs>

      <DialogContent sx={{ typography: 'body2', pr: 1, pb: 0, mb: 1 }}>
        <Scrollbar
          sx={{
            pr: 2,
            maxHeight: 600,
          }}
        >
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack spacing={3}>
              {currentTab === 'optional' && (
                <GeneralTab>
                  <OptionalTab listWorkflowGroup={listWorkflowGroup} listWorkflow={listWorkflow} />
                </GeneralTab>
              )}

              {currentTab === 'run-configuration' && <RunConfigurationTab />}

              {currentTab === 'input' && <InputTab variable={variable} setVariable={setVariable} />}

              {currentTab === 'information' && (
                <GeneralTab
                  sx={{
                    pt: 1,
                  }}
                >
                  <InformationTab />
                </GeneralTab>
              )}

              <Stack direction="row" spacing={2} ml="auto" mb={3}>
                <Button size="medium" variant="outlined" onClick={handleClose}>
                  Đóng
                </Button>
                {watchTaskType === 'common' && (
                  <LoadingButton
                    size="medium"
                    type="submit"
                    id="create"
                    variant="contained"
                    loading={isSubmitting}
                  >
                    Tạo
                  </LoadingButton>
                )}
                <LoadingButton
                  color="primary"
                  size="medium"
                  type="submit"
                  id="create-run"
                  variant="contained"
                  loading={isSubmitting}
                >
                  {watchTaskType === 'common' ? 'Tạo và chạy' : 'Lên lịch'}
                </LoadingButton>
              </Stack>
            </Stack>
          </FormProvider>
        </Scrollbar>
      </DialogContent>
    </Dialog>
  );
};

export default RpaSingleFormDialog;

RpaSingleFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  listWorkflowGroup: PropTypes.array,
  profileId: PropTypes.number,
};

//----------------------------------------------------------------

function GeneralTab({ sx, children }) {
  return (
    <Stack
      spacing={2}
      sx={{
        ...sx,
      }}
    >
      {children}
    </Stack>
  );
}

GeneralTab.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};
