import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import {
  Button,
  Card,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TextField,
  Tooltip,
  Typography,
  alpha,
  tableCellClasses,
} from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CircularProgressWithLabel } from 'src/utils/profile';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  TableSkeleton,
  useTable,
} from 'src/components/table';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import { getNumSkeleton, isElectron } from 'src/utils/commom';
import { useBoolean } from 'src/hooks/use-boolean';
import { enqueueSnackbar } from 'notistack';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import { IS_BROWSER_DOWNLOADING, ROWS_PER_PAGE_CONFIG } from 'src/utils/constance';
import { list_task_data } from 'src/utils/mock';
import TaskTableRow from '../task-table-row';
import DeleteTaskDialog from '../delete-task-dialog';
import LogsDialog from '../logs-dialog';
import UpdateTaskDialog from '../update-task-dialog';

// ----------------------------------------------------------------------

export default function ListTaskView() {
  const rowNum = getStorage(ROWS_PER_PAGE_CONFIG)?.task;
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { workspace_id } = useAuthContext();
  const confirm = useBoolean();
  const showLog = useBoolean();
  const [taskData, setTaskData] = useState({});
  const [logLoading, setLogLoading] = useState(true);
  const [taskLogData, setTaskLogData] = useState([]);
  const update = useBoolean();
  const [updateData, setUpdateData] = useState({});
  const [downloadProgressPercent, setDownloadProgressPercent] = useState(0);
  const [extractionStatus, setExtractionStatus] = useState('pending');
  const downloadBrowser = useBoolean();
  const [browserDownloadName, setBrowserDownloadName] = useState('');

  const TABLE_HEAD = [
    { id: 'name', label: t('task.table.header.name'), minWidth: 140 },
    { id: 'workflow', label: t('task.table.header.workflows'), align: 'center', minWidth: 140 },
    { id: 'profile', label: t('task.table.header.profile'), align: 'center' },
    { id: 'note', label: t('task.table.header.note'), minWidth: 300 },
    { id: 'created_at', label: t('task.table.header.createAt'), align: 'center' },
    { id: 'action', label: t('task.table.header.action'), whiteSpace: 'nowrap', minWidth: 240 },
  ];

  const table = useTable({
    defaultRowsPerPage: rowNum ?? 10,
  });
  const [tableData, setTableData] = useState([]);
  const [totalTask, setTotalTask] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const notFound = !tableData.length && !loading;

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
          downloadBrowser.onFalse();
          enqueueSnackbar(t('systemNotify.success.download'), { variant: 'success' });
          setStorage(IS_BROWSER_DOWNLOADING, 'no');
        }
      });
    }
    return () => {
      if (isElectron()) {
        window.ipcRenderer.removeAllListeners('update-browser-download-progress');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFetchTaskData = useCallback(async () => {
    try {
      const params = {
        search,
        page_size: table.rowsPerPage,
        page_num: table.page + 1,
      };
      console.log('params', params);

      setLoading(true);
      const response = list_task_data;
      if (response) {
        const listId = [];
        const modifiedData = response.data.map((item) => {
          listId.push(item.id);
          return {
            ...item,
            run_status: 'idle',
          };
        });

        table.setSelected(table.selected.filter((id) => listId.includes(id)));

        setTableData(modifiedData);
        setTotalTask(response.total_record);
        // get task running
        window.ipcRenderer.invoke('get-task-list-running').then((data) => {
          setTableData((currentTableData) =>
            currentTableData.map((row) =>
              data.includes(row.id) ? { ...row, run_status: 'running' } : row
            )
          );
        });
      }
    } catch (error) {
      /* empty */
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, table.page, table.rowsPerPage, workspace_id]);

  useEffect(() => {
    if (workspace_id) {
      handleFetchTaskData();
    }
  }, [handleFetchTaskData, workspace_id]);

  useEffect(() => {
    if (isElectron()) {
      window.ipcRenderer.on('task-status', (event, data) => {
        if (data?.status === 'stoped') {
          setTableData((currentTableData) =>
            currentTableData.map((row) =>
              row.id === data.id ? { ...row, run_status: 'idle' } : row
            )
          );
        }
        if (data?.status === 'running') {
          setTableData((currentTableData) =>
            currentTableData.map((row) =>
              row.id === data.id ? { ...row, run_status: 'running' } : row
            )
          );
        }
      });
    }

    return () => {
      if (isElectron()) {
        window.ipcRenderer.removeAllListeners('task-status');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunStatusChange = (id, status) => {
    setTableData((currentTableData) =>
      currentTableData.map((row) => (row.id === id ? { ...row, run_status: status } : row))
    );
  };

  const handleShowLogs = async (taskId) => {
    showLog.onTrue();
    try {
      if (isElectron()) {
        setLogLoading(true);
        const taskLogs = await window.ipcRenderer.invoke('get-task-details', taskId);
        setTaskLogData(taskLogs);
      }
    } catch (error) {
      /* empty */
    } finally {
      setLogLoading(false);
    }
  };

  const handleTaskLogDialogClose = () => {
    showLog.onFalse();
    // setTaskLogData([]);
  };

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        height: '100%',
        px: '0px!important',
      }}
    >
      <Stack height={1} spacing={3} pb={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="end"
          spacing={{ sm: 2, md: 0 }}
        >
          <TextField
            type="search"
            size="small"
            placeholder={`${t('actions.search')}...`}
            defaultValue={search}
            onChange={debounce((event) => {
              table.onResetPage();
              setSearch(event.target.value);
            }, 500)}
            sx={{
              width: {
                xs: 1,
                md: 0.4,
                lg: 0.3,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="tabler:reload" />}
            onClick={handleFetchTaskData}
            sx={{
              boxShadow: (theme) => theme.customShadows.z4,
            }}
          >
            {t('task.actions.reload')}
          </Button>
        </Stack>
        <Card
          sx={{
            height: 1,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            border: (theme) => `dashed 1px ${theme.palette.divider}`,
            boxShadow: 'none',
          }}
        >
          <Stack height={1} spacing={0} p={2} pb={0}>
            <TableContainer
              sx={{
                overflow: 'unset',
                position: 'relative',
                height: 'calc(100% - 64px)',
              }}
            >
              <TableSelectedAction
                numSelected={table.selected.length}
                rowCount={tableData.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row.id)
                  )
                }
                action={
                  <Tooltip title={t('task.actions.delete')}>
                    <IconButton color="primary" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                }
                sx={{
                  height: 56,
                  borderRadius: 1.5,
                  zIndex: 20,
                }}
              />
              <Scrollbar
                autoHide={false}
                sxRoot={{
                  overflow: 'unset',
                }}
                sx={{
                  height: 1,
                  ...(notFound && {
                    '& .simplebar-content': {
                      height: 1,
                    },
                  }),
                  '& .simplebar-track.simplebar-vertical': {
                    position: 'absolute',
                    right: '-12px',
                    pointerEvents: 'auto',
                  },
                  '& .simplebar-track.simplebar-horizontal': {
                    position: 'absolute',
                    bottom: '-10px',
                    pointerEvents: 'auto',
                  },
                }}
              >
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960, height: 1 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={tableData.length}
                    numSelected={table.selected.length}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        tableData.map((row) => row.id)
                      )
                    }
                    sx={{
                      position: 'sticky',
                      top: 0,
                      bgcolor: (theme) => alpha(theme.palette.grey[800], 1),
                      zIndex: 10,
                      [`& .${tableCellClasses.head}`]: {
                        '&:first-of-type': {
                          borderTopLeftRadius: 12,
                          borderBottomLeftRadius: 12,
                        },
                        '&:last-of-type': {
                          borderTopRightRadius: 12,
                          borderBottomRightRadius: 12,
                        },
                      },
                    }}
                  />

                  <TableBody>
                    {loading ? (
                      [...Array(getNumSkeleton(table.rowsPerPage, tableData.length))].map(
                        (i, index) => (
                          <TableSkeleton
                            key={index}
                            cols={TABLE_HEAD.length}
                            sx={{ height: '70px' }}
                          />
                        )
                      )
                    ) : (
                      <>
                        {tableData.map((row) => (
                          <TaskTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            runStatus={row.run_status}
                            onRunStatusChange={handleRunStatusChange}
                            workspaceId={workspace_id}
                            onResetData={handleFetchTaskData}
                            onShowLogs={handleShowLogs}
                            setTaskData={setTaskData}
                            onOpenDownloadProgress={() => downloadBrowser.onTrue()}
                            setBrowserDownloadName={setBrowserDownloadName}
                            handleUpdate={() => {
                              setUpdateData(row);
                              update.onTrue();
                            }}
                          />
                        ))}
                      </>
                    )}

                    <TableNoData
                      sx={{
                        py: 20,
                      }}
                      notFound={notFound}
                    />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={totalTask}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={(event) => {
                table.onChangeRowsPerPage(event);
                setStorage(ROWS_PER_PAGE_CONFIG, {
                  ...getStorage(ROWS_PER_PAGE_CONFIG),
                  task: event.target.value,
                });
              }}
              //
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Stack>
        </Card>
      </Stack>
      <LogsDialog
        open={showLog.value}
        onClose={handleTaskLogDialogClose}
        taskData={taskData}
        taskLogData={taskLogData}
        loading={logLoading}
      />
      <DeleteTaskDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        taskIds={table.selected}
        workspaceId={workspace_id}
        handleReLoadData={() => {
          table.setSelected([]);
          handleFetchTaskData();
        }}
      />

      <UpdateTaskDialog
        open={update.value}
        updateData={updateData}
        handleReLoadData={handleFetchTaskData}
        onClose={() => {
          setUpdateData({});
          update.onFalse();
        }}
      />
      <ConfirmDialog
        open={downloadBrowser.value}
        onClose={() => downloadBrowser.onFalse()}
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
    </Container>
  );
}
