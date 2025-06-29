import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
// utils
import {
  Button,
  Checkbox,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Tooltip,
  Zoom,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useEffect, useRef, useState } from 'react';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { enqueueSnackbar } from 'notistack';
import { isElectron } from 'src/utils/commom';
import { useLocales } from 'src/locales';
import TextMaxLine from 'src/components/text-max-line';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';
import { LoadingButton } from '@mui/lab';
import { IS_BROWSER_DOWNLOADING } from 'src/utils/constance';
import { getKernelVersionByIdApi } from 'src/api/cms.api';
import { setStorage } from 'src/hooks/use-local-storage';
import { transformKernelVersionToBrowserName } from 'src/utils/profile';
import { fDate } from 'src/utils/format-time';
import { deleteTaskByIdApi, getTaskByIdApi } from '../../api/task.api';
import ScheduleDialog from './schedule-dialog';

// ----------------------------------------------------------------------

export default function TaskTableRow({
  row,
  selected,
  onSelectRow,
  runStatus,
  onRunStatusChange,
  onOpenDownloadProgress,
  setBrowserDownloadName,
  workspaceId,
  onResetData,
  onShowLogs,
  setTaskData,
  handleUpdate,
}) {
  const { t } = useLocales();
  const popoverTimeoutRef = useRef();
  const router = useRouter();
  const [targetPopover, setTargetPopover] = useState(null);
  const confirm = useBoolean();
  const [loading, setLoading] = useState();

  const show = useMultiBoolean({
    logs: false,
    schedule: false,
  });

  const { id, name, workflow, profiles, note, created_at, has_new_version } = row;

  const [nameRef, showName] = useTooltipNecessity(false);
  const [noteRef, showNote] = useTooltipNecessity(false);
  const [workflowRef, showWorkflow] = useTooltipNecessity(false);

  useEffect(
    () => () => {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
    },
    []
  );

  const downloadBrowserIfNeeded = async (kernelVersion) => {
    const kernelVersionResponse = await getKernelVersionByIdApi(kernelVersion.id);
    if (kernelVersionResponse?.data) {
      window.ipcRenderer.send('download-browser', kernelVersionResponse.data);
      setStorage(IS_BROWSER_DOWNLOADING, 'yes');
    }
  };

  const handleRunTask = async (taskData) => {
    onRunStatusChange(taskData.id, 'starting');
    const response = await getTaskByIdApi(taskData.workspace, taskData.id);
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
          enqueueSnackbar(t('systemNotify.error.listProfileExpired'), { variant: 'error' });
          onRunStatusChange(taskData.id, 'idle');
          return;
        }

        const num_profile_expired = task.profiles.length - alive_profiles.length;

        if (num_profile_expired > 0) {
          enqueueSnackbar(t('systemNotify.warning.hasProfileExpired'), { variant: 'warning' });
        }

        setTimeout(() => {
          onRunStatusChange(taskData.id, 'running');
        }, 2000);

        task.profiles = alive_profiles;

        window.ipcRenderer.send('run-script', task);
      }
    } else {
      setTimeout(() => {
        onRunStatusChange(taskData.id, 'idle');
      }, 3000);
      setBrowserDownloadName(transformKernelVersionToBrowserName(kernelVersionDownload));
      onOpenDownloadProgress();
      await downloadBrowserIfNeeded(kernelVersionDownload);
    }
  };

  const handleStopTask = async (taskData) => {
    onRunStatusChange(taskData.id, 'stoping');
    if (isElectron()) {
      window.ipcRenderer.send('stop-script', { id: taskData.id });
    }
  };

  const handleDeleteTask = async () => {
    try {
      setLoading(true);
      await deleteTaskByIdApi(workspaceId, id);
      if (isElectron()) {
        window.ipcRenderer.send('remove-task', id);
      }
      onResetData();
      enqueueSnackbar(t('systemNotify.success.delete'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('systemNotify.error.delete'), { variant: 'error' });
    } finally {
      confirm.onFalse();
      setLoading(false);
    }
  };

  const renderDialog = (
    <ConfirmDialog
      open={confirm.value}
      onClose={confirm.onFalse}
      title={`${t('task.delete.title')}?`}
      content={t('task.delete.message')}
      closeButtonName={t('task.actions.close')}
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="error"
          onClick={handleDeleteTask}
        >
          {t('task.actions.delete')}
        </LoadingButton>
      }
    />
  );

  const renderActionButton = (status) => {
    if (has_new_version) {
      return (
        <Button
          size="small"
          color="warning"
          variant="contained"
          startIcon={<Iconify icon="material-symbols:system-update-alt-sharp" width={16} />}
          sx={{
            '&:disabled': {
              color: '#ccc',
              bgcolor: 'primary.dark',
            },
            mr: 1,
            whiteSpace: 'nowrap',
          }}
          onClick={handleUpdate}
        >
          {t('task.actions.update')}
        </Button>
      );
    }
    if (status === 'idle') {
      return (
        <Button
          size="small"
          color="primary"
          variant="contained"
          startIcon={<Iconify icon="solar:play-circle-bold" />}
          sx={{
            '&:disabled': {
              color: '#ccc',
              bgcolor: 'primary.dark',
            },
            mr: 1,
          }}
          onClick={() => handleRunTask(row)}
        >
          {t('task.actions.run')}
        </Button>
      );
    }
    if (status === 'starting') {
      return (
        <Button
          size="small"
          color="primary"
          variant="contained"
          startIcon={<Iconify icon="eos-icons:bubble-loading" />}
          disabled
          sx={{
            '&:disabled': {
              color: '#ccc',
              bgcolor: 'primary.dark',
            },
            mr: 1,
          }}
        >
          {t('task.actions.run')}
        </Button>
      );
    }
    if (status === 'stoping') {
      return (
        <Button
          size="small"
          color="error"
          variant="contained"
          startIcon={<Iconify icon="eos-icons:bubble-loading" />}
          disabled
          sx={{
            '&:disabled': {
              color: '#ccc',
              bgcolor: 'primary.dark',
            },
            mr: 1,
          }}
        >
          {t('task.actions.stop')}
        </Button>
      );
    }
    return (
      <Button
        size="small"
        color="error"
        variant="contained"
        startIcon={<Iconify icon="ion:stop" />}
        sx={{
          '&:disabled': {
            color: '#ccc',
            bgcolor: 'primary.dark',
          },
          mr: 1,
        }}
        onClick={() => handleStopTask(row)}
      >
        {t('task.actions.stop')}
      </Button>
    );
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell
          sx={{
            typography: 'subtitle2',
          }}
        >
          <Tooltip title={showName ? name : ''}>
            <TextMaxLine ref={nameRef} line={1}>
              {name}
            </TextMaxLine>
          </Tooltip>
        </TableCell>

        <TableCell
          sx={{
            typography: 'subtitle2',
          }}
          align="center"
        >
          <Tooltip title={showWorkflow ? workflow.name : ''}>
            <TextMaxLine ref={workflowRef} line={1}>
              {workflow.name}
            </TextMaxLine>
          </Tooltip>
        </TableCell>

        <TableCell
          sx={{
            typography: 'subtitle2',
          }}
          align="center"
        >
          {profiles?.length}
        </TableCell>
        <TableCell
          sx={{
            typography: 'subtitle2',
          }}
        >
          <Tooltip
            title={showNote ? note : ''}
            componentsProps={{
              tooltip: {
                sx: {
                  textAlign: 'justify',
                  typography: 'body2',
                },
              },
            }}
          >
            <TextMaxLine ref={noteRef}>{note}</TextMaxLine>
          </Tooltip>
        </TableCell>
        <TableCell
          sx={{
            typography: 'subtitle2',
          }}
          align="center"
        >
          {created_at ? fDate(new Date(created_at), 'dd/MM/yyyy HH:ss') : ''}
        </TableCell>
        <TableCell
          sx={{
            typography: 'subtitle2',
          }}
          align="center"
        >
          <Stack direction="row" spacing={1} justifyContent="space-between">
            {renderActionButton(runStatus)}
            <Tooltip title={t('task.actions.schedule')}>
              <IconButton onClick={() => show.onTrue('schedule')}>
                <Iconify icon="ri:calendar-schedule-line" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('task.actions.logs')}>
              <IconButton
                onClick={() => {
                  onShowLogs(id);
                  setTaskData(row);
                }}
              >
                <Iconify icon="ant-design:code-outlined" />
              </IconButton>
            </Tooltip>
            <IconButton onClick={(event) => setTargetPopover(event.currentTarget)}>
              <Iconify icon="ri:more-2-fill" />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
      {renderDialog}
      <CustomPopover
        open={targetPopover}
        onClose={() => setTargetPopover(null)}
        sx={{
          width: 'fit-content',
        }}
        TransitionComponent={Zoom}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Stack>
          <MenuItem onClick={() => router.push(paths.task.edit(id))}>
            <Iconify icon="uil:edit" />
            {t('task.actions.edit')}
          </MenuItem>

          <Divider />

          <MenuItem
            sx={{
              color: 'error.main',
            }}
            onClick={confirm.onTrue}
          >
            <Iconify icon="fluent:delete-16-regular" />
            {t('task.actions.delete')}
          </MenuItem>
        </Stack>
      </CustomPopover>
      <ScheduleDialog
        open={show.value.schedule}
        onClose={() => show.onFalse('schedule')}
        taskName={name}
        taskId={id}
      />
    </>
  );
}

TaskTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onSelectRow: PropTypes.func,
  runStatus: PropTypes.string,
  workspaceId: PropTypes.string,
  onRunStatusChange: PropTypes.func,
  onOpenDownloadProgress: PropTypes.func,
  onResetData: PropTypes.func,
  onShowLogs: PropTypes.func,
  setTaskData: PropTypes.func,
  handleUpdate: PropTypes.func,
  setBrowserDownloadName: PropTypes.func,
};
