import { useEffect, useState } from 'react';
import { debounce } from 'lodash';

import {
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
  alpha,
  tableCellClasses,
} from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  TableSkeleton,
  useTable,
} from 'src/components/table';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useLocales } from 'src/locales';
import { getNumSkeleton } from 'src/utils/commom';
import { ROWS_PER_PAGE_CONFIG } from 'src/utils/constance';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import { list_schedule_data } from 'src/utils/mock';
import ScheduleTableRow from '../schedule-table-row';
import DeleteMultiDialog from '../delete-multi-dialog';
import UpdateScheduleDialog from '../update-schedule-dialog';

// ----------------------------------------------------------------------

export default function ListScheduleTaskView() {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { workspace_id } = useAuthContext();
  const deleteMultiForm = useBoolean();
  const [scheduleId, setScheduleId] = useState('');
  const rowNum = getStorage(ROWS_PER_PAGE_CONFIG)?.schedule;

  const TABLE_HEAD = [
    { id: 'name', label: t('schedule.table.header.name') },
    { id: 'task', label: t('schedule.table.header.task') },
    { id: 'note', label: t('schedule.table.header.note') },
    { id: 'status', label: t('schedule.table.header.status'), align: 'center', width: 120 },
    { id: 'datetime_start', label: t('schedule.table.header.startAt') },
    { id: 'datetime_end', label: t('schedule.table.header.endAt') },
    { id: 'last_run', label: t('schedule.table.header.lastRun') },
    { id: 'action', label: t('schedule.table.header.action'), align: 'center' },
  ];

  const table = useTable({
    defaultRowsPerPage: rowNum ?? 10,
  });
  const [tableData, setTableData] = useState([]);
  const [totalTask, setTotalTask] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reload, setReload] = useState(0);

  const notFound = !tableData.length && !loading;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          search,
          page_size: table.rowsPerPage,
          page_num: table.page + 1,
          fields: 'id,task_name,status,name,note,datetime_start,datetime_end',
        };
        console.log('params', params);
        setLoading(true);
        const response = list_schedule_data;
        if (response) {
          const { data, total_record } = response;
          table.setSelected(table.selected.filter((id) => data.map((row) => row.id).includes(id)));
          setTableData(data);
          setTotalTask(total_record);
        }
      } catch (error) {
        /* empty */
      } finally {
        setLoading(false);
      }
    };

    if (workspace_id) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, table.page, table.rowsPerPage, workspace_id, reload]);

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        height: '100%',
        px: '0px!important',
      }}
    >
      <Stack height={1} spacing={3} pb={1}>
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
                position: 'relative',
                overflow: 'unset',
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
                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={deleteMultiForm.onTrue}>
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
                            sx={{ height: '77px' }}
                          />
                        )
                      )
                    ) : (
                      <>
                        {tableData.map((row) => (
                          <ScheduleTableRow
                            key={row.id}
                            row={row}
                            workspaceId={workspace_id}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            handleReloadData={setReload}
                            handleUpdateSchedule={() => setScheduleId(row.id)}
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
                  schedule: event.target.value,
                });
              }}
              //
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Stack>
        </Card>
      </Stack>
      <DeleteMultiDialog
        open={deleteMultiForm.value}
        onClose={deleteMultiForm.onFalse}
        scheduleIds={table.selected}
        workspaceId={workspace_id}
        handleReLoadData={() => {
          table.setSelected([]);
          setReload((prev) => prev + 1);
        }}
      />

      <UpdateScheduleDialog
        open={!!scheduleId}
        onClose={() => setScheduleId('')}
        scheduleId={scheduleId}
        handleReLoadData={() => setReload((prev) => prev + 1)}
      />
    </Container>
  );
}
