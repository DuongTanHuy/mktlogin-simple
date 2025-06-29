import i18n from 'src/locales/i18n';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  ListItemText,
  MenuItem,
  Stack,
  Switch,
  Tooltip,
  Zoom,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Iconify from 'src/components/iconify';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import TextMaxLine from 'src/components/text-max-line';
import { useBoolean } from 'src/hooks/use-boolean';
import { enqueueSnackbar } from 'notistack';
import { ERROR_CODE, LOCALES } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';
import { deleteScheduleApi, updateScheduleApi } from '../../api/schedule.api';
import { isElectron } from '../../utils/commom';

// ----------------------------------------------------------------------

export default function ScheduleTableRow({
  row,
  selected,
  onSelectRow,
  handleReloadData,
  workspaceId,
  handleUpdateSchedule,
}) {
  const { t } = useLocales();
  const [targetPopover, setTargetPopover] = useState(null);
  const [activeStatus, setActiveStatus] = useState(row.status);
  const { id, name, task_name, note, datetime_start, datetime_end } = row;
  const deleteForm = useBoolean();
  const [loading, setLoading] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);

  const [nameRef, showName] = useTooltipNecessity(false);
  const [noteRef, showNote] = useTooltipNecessity(false);
  const [taskRef, showTask] = useTooltipNecessity(false);

  useEffect(() => {
    setActiveStatus(row.status);
  }, [row.status, setActiveStatus]);

  const handleChangeStatus = async (taskId, taskStatus) => {
    try {
      setSwitchLoading(true);
      await updateScheduleApi(workspaceId, taskId, { status: taskStatus });
      setActiveStatus(taskStatus);
      enqueueSnackbar(
        taskStatus === 'enabled' ? t('schedule.notify.enable') : t('schedule.notify.disable')
      );
    } catch (error) {
      enqueueSnackbar(t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setTimeout(() => {
        setSwitchLoading(false);
      }, 3000);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await deleteScheduleApi(workspaceId, id);
      handleReloadData((prev) => prev + 1);
      enqueueSnackbar(response?.data?.data, {
        variant: 'success',
      });
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.schedule.delete'), {
          variant: 'error',
        });
      } else
        enqueueSnackbar(error?.message || t('systemNotify.error.delete'), { variant: 'error' });
    } finally {
      setLoading(false);
      deleteForm.onFalse();
      if (isElectron()) {
        window.ipcRenderer.send('disable-schedule', id);
      }
    }
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
        >
          <Tooltip title={showTask ? task_name : ''}>
            <TextMaxLine ref={taskRef} line={2}>
              {task_name}
            </TextMaxLine>
          </Tooltip>
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
            <TextMaxLine ref={noteRef} line={2}>
              {note}
            </TextMaxLine>
          </Tooltip>
        </TableCell>

        <TableCell
          align="center"
          sx={{
            typography: 'subtitle2',
          }}
        >
          <Tooltip
            title={
              activeStatus === 'enabled'
                ? t('schedule.tooltip.disable')
                : t('schedule.tooltip.enable')
            }
            placement="top"
          >
            <FormControlLabel
              label={
                activeStatus === 'enabled'
                  ? t('schedule.actions.enable')
                  : t('schedule.actions.disable')
              }
              control={
                <Switch
                  disabled={switchLoading}
                  checked={activeStatus === 'enabled'}
                  onChange={(event) => {
                    if (event.target.checked) {
                      handleChangeStatus(id, 'enabled');
                      if (isElectron()) {
                        window.ipcRenderer.send('enable-schedule', {
                          schedule_id: row.id,
                          workspace_id: workspaceId,
                        });
                      }
                    } else {
                      handleChangeStatus(id, 'disabled');
                      if (isElectron()) {
                        window.ipcRenderer.send('disable-schedule', id);
                      }
                    }
                  }}
                />
              }
            />
          </Tooltip>
        </TableCell>
        <TableCell>
          <ListItemText
            primary={format(new Date(datetime_start), 'dd MMMM yyyy', {
              locale: LOCALES[i18n.language],
            })}
            secondary={format(new Date(datetime_start), 'p', {
              locale: LOCALES[i18n.language],
            })}
            primaryTypographyProps={{ typography: 'body2', whiteSpace: 'nowrap' }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>
        <TableCell>
          {datetime_end && (
            <ListItemText
              primary={format(new Date(datetime_end), 'dd MMMM yyyy', {
                locale: LOCALES[i18n.language],
              })}
              secondary={format(new Date(datetime_end), 'p', {
                locale: LOCALES[i18n.language],
              })}
              primaryTypographyProps={{ typography: 'body2', whiteSpace: 'nowrap' }}
              secondaryTypographyProps={{
                mt: 0.5,
                component: 'span',
                typography: 'caption',
              }}
            />
          )}
        </TableCell>
        <TableCell>
          {/* <ListItemText
            primary={format(new Date(last_run_duration), 'dd MMM yyyy')}
            secondary={format(new Date(last_run_duration), 'p')}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          /> */}
        </TableCell>
        <TableCell
          sx={{
            typography: 'subtitle2',
          }}
          align="center"
        >
          <IconButton onClick={(event) => setTargetPopover(event.currentTarget)}>
            <Iconify icon="ri:more-2-fill" />
          </IconButton>
        </TableCell>
      </TableRow>
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
          <MenuItem onClick={handleUpdateSchedule}>
            <Iconify icon="uil:edit" />
            {t('schedule.actions.edit')}
          </MenuItem>
          <Divider />
          <MenuItem
            sx={{
              color: 'error.main',
            }}
            onClick={deleteForm.onTrue}
          >
            <Iconify icon="fluent:delete-16-regular" />
            {t('schedule.actions.delete')}
          </MenuItem>
        </Stack>
      </CustomPopover>

      <Dialog onClose={() => deleteForm.onFalse()} open={deleteForm.value}>
        <DialogTitle>{t('schedule.delete.title')}</DialogTitle>
        <DialogActions>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => deleteForm.onFalse()}>
              {t('schedule.actions.back')}
            </Button>
            <LoadingButton
              loading={loading}
              variant="contained"
              color="error"
              onClick={handleDelete}
            >
              {t('schedule.actions.delete')}
            </LoadingButton>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

ScheduleTableRow.propTypes = {
  onSelectRow: PropTypes.func,
  handleReloadData: PropTypes.func,
  handleUpdateSchedule: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  workspaceId: PropTypes.string,
};
