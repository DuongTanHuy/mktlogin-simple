import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Autocomplete,
  Card,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  tableCellClasses,
} from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSkeleton,
  useTable,
} from 'src/components/table';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { getNumSkeleton } from 'src/utils/commom';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { TableVirtuoso } from 'react-virtuoso';
import { getGeneralLogApi } from 'src/api/workspace-activity.api';
import { useDateRangePicker } from 'src/components/custom-date-range-picker';
import { fDate } from 'src/utils/format-time';
import Iconify from 'src/components/iconify';
import CustomDateRangePicker from 'src/components/custom-date-range-picker/custom-date-range-picker';
import debounce from 'lodash/debounce';
import GeneralLogTableHeader from '../generdal-log-table-header';
import GeneralLogTableRow from '../general-log-table-row';

// ----------------------------------------------------------------------

const ACTIVITY_OPTIONS = [
  'profile_creation',
  'profile_edit',
  'profile_renew',
  'profile_duplicate',
  'profile_transfer',
  'profile_move_group',
  'profile_delete',
  'profile_restore',
  'profile_update_proxy',
  'profile_update_note',
  'profile_move_workspace',
  'profile_update_browser_kernel',
  'profile_enable_auto_renew',
  'profile_disable_auto_renew',
  'profile_auto_renew',
  'delete_workspace',
  //
  'system_auto_delete',
  'profile_remove_proxy',
  'profile_clear_cookie',
  'profile_update_tag',
  'profile_add_tag',
  'profile_remove_tag',
  'profile_add_tab',
  'profile_remove_tab',
  'profile_add_bookmark',
  'profile_remove_bookmark',
];

const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer
      component={Paper}
      {...props}
      ref={ref}
      sx={{
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          boxShadow: 'none',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.32),
          borderRadius: '10px',
          border: '1px',
          backgroundClip: 'content-box',
        },
      }}
    />
  )),
  Table: (props) => <Table {...props} sx={{ minWidth: 1300 }} />,
  TableHead: React.forwardRef((props, ref) => (
    <TableHead
      {...props}
      ref={ref}
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
  )),
  TableRow: React.forwardRef((props, ref) => (
    <TableRow
      hover
      {...props}
      ref={ref}
      sx={{
        cursor: 'pointer',
      }}
    />
  )),
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};

export default function GeneralLogView() {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { workspace_id } = useAuthContext();
  const route = useRouter();

  const searchParams = useSearchParams();
  const activityParam = searchParams.get('activity_type');
  const usernameParam = searchParams.get('username');
  const profileParam = searchParams.get('profile');
  const pageNum = searchParams.get('page');
  const rowNum = searchParams.get('row');
  const [dateFilter, setDateFilter] = useState('30_ago');
  const rangeCalendarPicker = useDateRangePicker(null, null);

  const periodOptions = useMemo(
    () => [
      { id: 'op_01', value: 'yesterday', label: t('trash.options.yesterday') },
      { id: 'op_02', value: 'today', label: t('trash.options.today') },
      { id: 'op_05', value: '7_ago', label: t('trash.options.last7days') },
      { id: 'op_07', value: '30_ago', label: t('trash.options.last30days') },
    ],
    [t]
  );

  const handleChangeDateFilter = useCallback(() => {
    const today = new Date();
    let startDate;
    let endDate;
    function getFirstAndLastDayOfWeek(date) {
      const firstDay = new Date(date);
      firstDay.setDate(firstDay.getDate() - firstDay.getDay());
      const lastDay = new Date(firstDay);
      lastDay.setDate(lastDay.getDate() + 6);
      rangeCalendarPicker.setStartDate(new Date(firstDay));
      rangeCalendarPicker.setEndDate(new Date(lastDay));

      firstDay.setDate(firstDay.getDate() - 7);
      lastDay.setDate(lastDay.getDate() - 7);
    }

    function getFirstAndLastDayOfMonth(date) {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      rangeCalendarPicker.setStartDate(new Date(firstDay));
      rangeCalendarPicker.setEndDate(new Date(lastDay));

      firstDay.setMonth(firstDay.getMonth() - 1);
      lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
    }

    function getFirstAndLastDayOfYear(date) {
      const firstDay = new Date(date.getFullYear(), 0, 1);
      const lastDay = new Date(date.getFullYear(), 11, 31);
      rangeCalendarPicker.setStartDate(new Date(firstDay));
      rangeCalendarPicker.setEndDate(new Date(lastDay));

      firstDay.setFullYear(firstDay.getFullYear() - 1);
      lastDay.setFullYear(lastDay.getFullYear() - 1);
    }

    switch (dateFilter) {
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        rangeCalendarPicker.setStartDate(new Date(startDate));
        rangeCalendarPicker.setEndDate(new Date(startDate));

        startDate.setDate(startDate.getDate() - 1);

        break;
      case 'today':
        rangeCalendarPicker.setStartDate(today);
        rangeCalendarPicker.setEndDate(today);

        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);

        break;
      case 'week':
        getFirstAndLastDayOfWeek(today);
        break;
      case 'month':
        getFirstAndLastDayOfMonth(today);
        break;
      case 'year':
        getFirstAndLastDayOfYear(today);
        break;
      case '7_ago':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        endDate = new Date(today);
        endDate.setDate(today.getDate());
        rangeCalendarPicker.setStartDate(new Date(startDate));
        rangeCalendarPicker.setEndDate(new Date(endDate));

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() - 1);
        startDate.setDate(startDate.getDate() - 7);

        break;
      case '14_ago':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 14);
        endDate = new Date(today);
        endDate.setDate(today.getDate() - 1);
        rangeCalendarPicker.setStartDate(new Date(startDate));
        rangeCalendarPicker.setEndDate(new Date(endDate));

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() - 1);
        startDate.setDate(startDate.getDate() - 14);

        break;
      case '30_ago':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
        endDate = new Date(today);
        endDate.setDate(today.getDate());
        rangeCalendarPicker.setStartDate(new Date(startDate));
        rangeCalendarPicker.setEndDate(new Date(endDate));

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() - 1);
        startDate.setDate(startDate.getDate() - 30);

        break;
      case 'month_ago':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        rangeCalendarPicker.setStartDate(new Date(startDate));
        rangeCalendarPicker.setEndDate(new Date(endDate));

        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date(today.getFullYear(), today.getMonth() - 1, 0);

        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter]);

  const defaultFilters = useMemo(
    () => ({
      activity_type: activityParam || '',
      username: usernameParam || '',
      profile: profileParam || '',
    }),
    [activityParam, profileParam, usernameParam]
  );

  const [filters, setFilters] = useState(defaultFilters);

  const TABLE_HEAD = useMemo(
    () => [
      { id: 'action', label: t('generalLog.table.headers.action'), align: 'center' },
      { id: 'profile_id', label: t('generalLog.table.headers.profile_id'), align: 'center' },
      { id: 'profile_name', label: t('generalLog.table.headers.profile_name'), align: 'center' },
      { id: 'username', label: t('generalLog.table.headers.username') },
      { id: 'created_at', label: t('generalLog.table.headers.created_at'), align: 'center' },
    ],
    [t]
  );

  const table = useTable({
    defaultCurrentPage: Number(pageNum) || 0,
    defaultRowsPerPage: Number(rowNum) || 10,
  });
  const [tableData, setTableData] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [loading, setLoading] = useState(true);

  const notFound = !tableData.length && !loading;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));

      searchParams.set(name, value);

      searchParams.delete('page');
      route.push(`${paths.dashboard.general_log}?${searchParams}`);
    },
    [route, searchParams, table]
  );

  const handleFetchLogData = useCallback(
    async (signal) => {
      try {
        const { activity_type, username, profile } = filters;

        const params = {
          activity_type,
          username,
          profile,
          start_date: fDate(rangeCalendarPicker.startDate, 'yyyy-MM-dd'),
          end_date: fDate(rangeCalendarPicker.endDate, 'yyyy-MM-dd'),
          page_size: table.rowsPerPage,
          page_num: table.page + 1,
        };
        setLoading(true);
        const response = await getGeneralLogApi(workspace_id, params, signal);
        if (response?.data?.data) {
          setTableData(response?.data?.data);
          setTotalRecord(response.data.total_record);
        }
      } catch (error) {
        setTableData([]);
        setTotalRecord(0);
      } finally {
        setLoading(false);
      }
    },
    [
      filters,
      rangeCalendarPicker.endDate,
      rangeCalendarPicker.startDate,
      table.page,
      table.rowsPerPage,
      workspace_id,
    ]
  );

  useEffect(() => {
    const abortController = new AbortController();

    if (workspace_id) {
      handleFetchLogData(abortController.signal);
    }

    return () => {
      abortController.abort();
    };
  }, [handleFetchLogData, workspace_id]);

  useEffect(() => {
    handleChangeDateFilter();
  }, [handleChangeDateFilter]);

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        height: '100%',
        px: '0px!important',
      }}
    >
      <Stack height={1} spacing={2} pb={1}>
        <Stack direction="row" spacing={2}>
          <Autocomplete
            fullWidth
            size="small"
            value={filters.activity_type || null}
            options={ACTIVITY_OPTIONS}
            getOptionLabel={(option) => (option ? t(`generalLog.options.${option}`) : '')}
            renderInput={(params) => (
              <TextField {...params} label={t('generalLog.labels.action')} />
            )}
            onChange={(event, newValue) => {
              handleFilters('activity_type', newValue);
            }}
            sx={{
              minWidth: 236,
              maxWidth: 236,
            }}
          />

          <TextField
            type="search"
            size="small"
            placeholder={t('generalLog.labels.profileName')}
            defaultValue={filters.profile}
            onChange={debounce((event) => {
              handleFilters('profile', event.target.value);
            }, 500)}
            sx={{
              width: 236,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            type="search"
            size="small"
            placeholder={t('generalLog.labels.username')}
            defaultValue={filters.username}
            onChange={debounce((event) => {
              handleFilters('username', event.target.value);
            }, 500)}
            sx={{
              width: 236,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{
              width: 'fit-content',
              color: 'text.primary',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              pr: 1,
              pl: 2,
              borderRadius: 1,
              border: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
            onClick={rangeCalendarPicker.onOpen}
          >
            <Typography variant="subtitle2">{`${
              fDate(rangeCalendarPicker.startDate, 'dd/MM/yy') || 'DD/MM/YY'
            } - ${fDate(rangeCalendarPicker.endDate, 'dd/MM/yy') || 'DD/MM/YY'}`}</Typography>
            <IconButton>
              <Iconify icon="solar:calendar-bold" />
            </IconButton>
          </Stack>
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
            {loading || tableData.length === 0 ? (
              <TableContainer
                sx={{
                  overflow: 'unset',
                  position: 'relative',
                  height: 'calc(100% - 64px)',
                }}
              >
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
                      // rowCount={tableData.length}
                      // numSelected={table.selected.length}
                      // onSelectAllRows={(checked) =>
                      //   table.onSelectAllRows(
                      //     checked,
                      //     tableData.map((row) => row.id)
                      //   )
                      // }
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
                      {loading &&
                        [...Array(getNumSkeleton(table.rowsPerPage, tableData.length))].map(
                          (i, index) => (
                            <TableSkeleton
                              key={index}
                              cols={TABLE_HEAD.length}
                              hasAction={false}
                              sx={{ height: '70px' }}
                            />
                          )
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
            ) : (
              <Paper
                style={{
                  height: '100%',
                  width: '100%',
                  backgroundColor: 'transparent',
                }}
                sx={{
                  position: 'relative',
                  '& .MuiPaper-root': {
                    bgcolor: 'transparent',
                  },
                }}
              >
                <TableVirtuoso
                  data={tableData}
                  components={VirtuosoTableComponents}
                  fixedHeaderContent={() => (
                    <GeneralLogTableHeader
                      headLabel={TABLE_HEAD}
                      rowCount={tableData.length}
                      numSelected={table.selected.length}
                      onSelectAllRows={(checked) =>
                        table.onSelectAllRows(
                          checked,
                          tableData.map((row) => row.id)
                        )
                      }
                    />
                  )}
                  itemContent={(_index, row) => (
                    <GeneralLogTableRow
                      key={row.id}
                      row={row}
                      // selected={table.selected.includes(row.id)}
                      // onSelectRow={() => table.onSelectRow(row.id)}
                    />
                  )}
                />
              </Paper>
            )}
            <TablePaginationCustom
              count={totalRecord}
              page={totalRecord / table.rowsPerPage <= table.page ? 0 : table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={(event, newPage) => {
                table.onChangePage(event, newPage);
                route.push(
                  `${paths.dashboard.general_log}?row=${table.rowsPerPage}&page=${newPage}`
                );
              }}
              onRowsPerPageChange={(event) => {
                table.onChangeRowsPerPage(event);
                route.push(`${paths.dashboard.general_log}?row=${event.target.value}&page=0`);
              }}
              //
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />

            <CustomDateRangePicker
              title={t('trash.labels.selectTime')}
              variant="calendar"
              open={rangeCalendarPicker.open}
              startDate={rangeCalendarPicker.startDate}
              endDate={rangeCalendarPicker.endDate}
              onChangeStartDate={(value) => {
                rangeCalendarPicker.onChangeStartDate(value);
                setDateFilter('');
              }}
              onChangeEndDate={(value) => {
                rangeCalendarPicker.onChangeEndDate(value);
                setDateFilter('');
              }}
              onClose={rangeCalendarPicker.onClose}
              error={rangeCalendarPicker.error}
              options={() => (
                <ToggleButtonGroup
                  // orientation="vertical"
                  value={dateFilter}
                  exclusive
                  onChange={(event) => {
                    setDateFilter(event.target.value);
                  }}
                  sx={{
                    ml: 'auto',
                    width: 'fit-content',
                    borderRadius: 1.5,
                    border: (theme) => `solid 1px ${theme.palette.divider}`,
                  }}
                >
                  {periodOptions.map((option) => (
                    <ToggleButton
                      key={option.id}
                      value={option.value}
                      sx={{
                        py: 0.5,
                      }}
                    >
                      {option.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
            />
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
