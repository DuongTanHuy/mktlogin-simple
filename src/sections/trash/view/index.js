import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableContainer,
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
import Iconify from 'src/components/iconify';
import { getNumSkeleton } from 'src/utils/commom';
import { ERROR_CODE, useRenderProfileStatus } from 'src/utils/constance';
import AdvancedSearch from 'src/sections/profile/advanced-search';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { fDate } from 'src/utils/format-time';
import { paths } from 'src/routes/paths';
import { useDateRangePicker } from 'src/components/custom-date-range-picker';
import CustomDateRangePicker from 'src/components/custom-date-range-picker/custom-date-range-picker';
import { getListGroupProfileApi } from 'src/api/profile-group.api';
import { getListTrashApi } from 'src/api/trash.api';
import { debounce } from 'lodash';
import { useBoolean } from 'src/hooks/use-boolean';
import TrashTableRow from '../trash-table-row';
import RestoreMultiDialog from '../restore-multi-dialog';

// ----------------------------------------------------------------------

export default function ListTrashView() {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { workspace_id } = useAuthContext();
  const profileStatus = useRenderProfileStatus();
  const route = useRouter();
  const confirm = useBoolean();

  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search');
  const statusParam = searchParams.get('status');
  const groupParam = searchParams.get('group');
  const pageNum = searchParams.get('page');
  const rowNum = searchParams.get('row');
  const profileIdParam = searchParams.get('profile_id_in');
  const [dateFilter, setDateFilter] = useState('30_ago');
  const rangeCalendarPicker = useDateRangePicker(null, null);
  const [groupOptions, setGroupOptions] = useState([]);
  const [hasPermission, setHasPermission] = useState(true);
  const searchRef = useRef(null);

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

  const [advancedSearch, setAdvancedSearch] = useState(
    profileIdParam
      ? [
          {
            condition: '_in',
            type: 'profile_id',
            value: profileIdParam,
          },
        ]
      : []
  );

  const defaultFilters = useMemo(
    () => ({
      search: searchParam || '',
      status: statusParam || 'all',
      group: groupParam || 'all',
    }),
    [groupParam, searchParam, statusParam]
  );

  const [filters, setFilters] = useState(defaultFilters);

  const TABLE_HEAD = useMemo(
    () => [
      { id: 'stt', label: t('trash.table.header.stt'), align: 'center' },
      { id: 'id', label: t('trash.table.header.profileId'), align: 'center' },
      { id: 'group_name', label: t('trash.table.header.group'), align: 'center', minWidth: 140 },
      { id: 'name', label: t('trash.table.header.name'), align: 'center' },
      { id: 'duration', label: t('trash.table.header.duration'), align: 'center' },
      { id: 'created_at', label: t('trash.table.header.createdAt'), align: 'center' },
      {
        id: 'deleted_at',
        label: t('trash.table.header.deletedAt'),
        align: 'center',
        whiteSpace: 'nowrap',
      },
    ],
    [t]
  );

  const table = useTable({
    defaultCurrentPage: Number(pageNum) || 0,
    defaultRowsPerPage: Number(rowNum) || 10,
  });
  const [tableData, setTableData] = useState([]);
  const [totalTrash, setTotalTrash] = useState(0);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const notFound = !tableData.length && !loading;

  // const handleOpenSearchBar = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  const handleOpenSearchBar = () => {
    setAnchorEl(searchRef.current);
  };

  const handleCloseSearchBar = () => {
    setAnchorEl(null);
  };

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));

      searchParams.set(name, value);

      searchParams.delete('page');
      route.push(`${paths.dashboard.trash}?${searchParams}`);
    },
    [route, searchParams, table]
  );

  const handleFetchTrashData = useCallback(async () => {
    if (rangeCalendarPicker.startDate && rangeCalendarPicker.endDate) {
      try {
        const { search, status, group } = filters;

        const advancedSearchParams = advancedSearch.reduce((result, item) => {
          if (item.type && item.condition && item.value) {
            const key = `${item.type}${item.condition}`;
            const values = item.value
              .split(/[\s,;:.!?\-()]+/)
              .filter(Boolean)
              .join(',');
            result[key] = values;
          }
          return result;
        }, {});

        const params = {
          search,
          status,
          ...(group !== 'all' && { profile_group: group }),
          start_date: fDate(rangeCalendarPicker.startDate, 'yyyy-MM-dd'),
          end_date: fDate(rangeCalendarPicker.endDate, 'yyyy-MM-dd'),
          page_size: table.rowsPerPage,
          page_num: table.page + 1,
          ...advancedSearchParams,
        };
        setLoading(true);
        const response = await getListTrashApi(workspace_id, params);
        if (response?.data?.data) {
          table.setSelected(
            table.selected.filter((id) => response.data.data.map((row) => row.id).includes(id))
          );
          setTableData(response?.data?.data);
          setTotalTrash(response.data.total_record);
          setHasPermission(true);
        }
      } catch (error) {
        if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
          setHasPermission(false);
        }
      } finally {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    advancedSearch,
    filters,
    rangeCalendarPicker.endDate,
    rangeCalendarPicker.startDate,
    table.page,
    table.rowsPerPage,
    workspace_id,
  ]);

  useEffect(() => {
    if (workspace_id) {
      handleFetchTrashData();
    }
  }, [handleFetchTrashData, workspace_id]);

  useEffect(() => {
    const handleFetchGroupData = async () => {
      try {
        const response = await getListGroupProfileApi(workspace_id);
        if (response?.data?.data) {
          setGroupOptions((prev) => [...prev, ...response.data.data]);
        }
      } catch (error) {
        /* empty */
      }
    };

    if (workspace_id) {
      handleFetchGroupData();
    }
  }, [workspace_id]);

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
        <Stack alignItems="start" spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              ref={searchRef}
              type="search"
              defaultValue={filters.search}
              placeholder={`${t('actions.search')}...`}
              size="small"
              onChange={debounce((event) => handleFilters('search', event.target.value), 500)}
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      mr: 1,
                      display: 'flex',
                      alignItems: 'center',
                      maxWidth: 0.6,
                    }}
                  >
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
                    </InputAdornment>
                    {advancedSearch.map((item, index) => (
                      <Chip
                        key={index}
                        label={item.value}
                        onDelete={() =>
                          setAdvancedSearch((prev) => prev.filter((i) => i.value !== item.value))
                        }
                        sx={{
                          color: 'text.primary',
                          typography: 'caption',
                          height: '90%',
                          maxWidth: 0.8,
                          borderRadius: '6px',
                          backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.4),
                          '&:hover': {
                            backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.08),
                          },
                          '& .MuiChip-label': {
                            px: 0.5,
                          },
                          '& .MuiChip-deleteIcon': {
                            m: 0,
                            flexShrink: 0,
                          },
                        }}
                      />
                    ))}
                  </Box>
                ),
                endAdornment: (
                  <IconButton
                    onClick={handleOpenSearchBar}
                    sx={{
                      p: 1,
                    }}
                  >
                    <Iconify icon="oui:app-advanced-settings" width={16} />
                  </IconButton>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  px: 0.5,
                },
                minWidth: 300,
                maxWidth: 300,
              }}
            />
            {/* <Button
              variant="outlined"
              onClick={handleOpenSearchBar}
              startIcon={<Iconify icon="lets-icons:search-duotone" />}
              sx={{
                minWidth: 'fit-content',
                color: 'text.secondary',
              }}
            >
              {`${advancedSearch.length > 0 ? AdvancedSearch.length : ''} Filter`}
            </Button> */}

            <TextField
              fullWidth
              select
              value={filters.status}
              label={t('actions.status')}
              size="small"
              InputLabelProps={{ shrink: true }}
              onChange={(event) => handleFilters('status', event.target.value)}
              sx={{
                minWidth: 200,
                maxWidth: 200,
              }}
            >
              {profileStatus.map((item) => (
                <MenuItem key={item.id} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              value={filters.group}
              label={t('trash.labels.profileGroup')}
              size="small"
              InputLabelProps={{ shrink: true }}
              onChange={(event) => handleFilters('group', event.target.value)}
              sx={{
                minWidth: 200,
                maxWidth: 200,
              }}
            >
              {[
                {
                  id: 'all',
                  name: t('trash.options.all'),
                },
                ...groupOptions,
              ].map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>

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
                px: 1,
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

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            width={1}
          >
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="material-symbols:restore-page-rounded" />}
              onClick={confirm.onTrue}
              sx={{
                boxShadow: (theme) => theme.customShadows.z4,
              }}
              disabled={!table.selected.length}
            >
              {t('trash.actions.restore')}
            </Button>

            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="tabler:reload" />}
              onClick={handleFetchTrashData}
              sx={{
                boxShadow: (theme) => theme.customShadows.z4,
              }}
            >
              {t('task.actions.reload')}
            </Button>
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
                        {tableData.map((row, index) => (
                          <TrashTableRow
                            key={row.id}
                            no={index + 1 + table.page * table.rowsPerPage}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            workspaceId={workspace_id}
                            onResetData={handleFetchTrashData}
                          />
                        ))}
                      </>
                    )}

                    <TableNoData
                      notFound={notFound}
                      title={
                        hasPermission ? '' : t('systemNotify.warning.notPermission.profile.trash')
                      }
                      imgUrl={hasPermission ? '' : '/assets/icons/empty/ic_permission.svg'}
                      sx={{
                        py: 20,
                        ...(!hasPermission && {
                          '& img.MuiBox-root': {
                            color: 'text.secondary',
                            width: 120,
                          },
                        }),
                      }}
                    />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={totalTrash}
              page={totalTrash / table.rowsPerPage <= table.page ? 0 : table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={(event, newPage) => {
                table.onChangePage(event, newPage);
                route.push(`${paths.dashboard.trash}?row=${table.rowsPerPage}&page=${newPage}`);
              }}
              onRowsPerPageChange={(event) => {
                table.onChangeRowsPerPage(event);
                route.push(`${paths.dashboard.trash}?row=${event.target.value}&page=0`);
              }}
              //
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />

            <AdvancedSearch
              anchorEl={anchorEl}
              handleClose={handleCloseSearchBar}
              advancedSearch={advancedSearch}
              setAdvancedSearch={setAdvancedSearch}
              resetPage={table.onResetPage}
              path={paths.dashboard.trash}
              // onClear={() => {
              //   setAdvancedSearch([]);
              //   table.onResetPage();
              // }}
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

            <RestoreMultiDialog
              open={confirm.value}
              onClose={confirm.onFalse}
              profileIds={table.selected}
              workspaceId={workspace_id}
              handleReLoadData={() => {
                handleFetchTrashData();
                table.setSelected([]);
              }}
            />
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
