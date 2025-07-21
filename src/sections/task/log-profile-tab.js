import { useCallback } from 'react';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
// mui
import {
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TextField,
  Tooltip,
  alpha,
  tableCellClasses,
} from '@mui/material';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  useTable,
} from 'src/components/table';
import { useLocales } from 'src/locales';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import LogProfileTableRow from './log-profile-table-row';

// ----------------------------------------------------------------------

const PROFILE_STATUSES = [
  {
    id: 'ps_01',
    label: 'All',
    value: 'all',
  },
  {
    id: 'ps_02',
    label: 'Running',
    value: 'running',
  },
  {
    id: 'ps_03',
    label: 'Success',
    value: 'success',
  },
  {
    id: 'ps_04',
    label: 'Failed',
    value: 'failed',
  },
];

const LogProfileTab = ({ logByProfiles, setLogByProfiles, refreshTaskLogData }) => {
  const { t } = useLocales();
  const table = useTable();
  const notFound = !logByProfiles.length;

  const TABLE_HEAD = [
    { id: 'profileId', label: t('task.logs.table.header.profileId'), align: 'center', width: 60 },
    { id: 'name', label: t('task.logs.table.header.name') },
    { id: 'startAt', label: t('task.logs.table.header.startAt') },
    { id: 'finishedAt', label: t('task.logs.table.header.endAt') },
    { id: 'duration', label: t('task.logs.table.header.duration'), align: 'center' },
    { id: 'status', label: t('task.logs.table.header.status'), align: 'center' },
    { id: 'logs', label: t('task.editLog.log'), align: 'center' },
  ];

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      if (name === 'search') {
        if (value === '') {
          refreshTaskLogData();
        } else {
          const logFiltered = logByProfiles.filter(
            (row) =>
              row.profile_name.toLowerCase().includes(value.toLowerCase()) ||
              row.profile_id.toString().includes(value)
          );
          setLogByProfiles(logFiltered);
        }
      }
    },
    [table, setLogByProfiles, logByProfiles, refreshTaskLogData]
  );

  return (
    <Stack height={1}>
      <Stack
        direction="row"
        mb={2}
        spacing={2}
        justifyContent="flex-start"
        alignItems="center"
        width={{
          xs: 1,
          md: 0.5,
        }}
      >
        <TextField
          type="search"
          fullWidth
          size="small"
          placeholder="Search..."
          onChange={debounce((event) => handleFilters('search', event.target.value), 500)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          fullWidth
          defaultValue="all"
          label="Status"
          size="small"
          InputLabelProps={{ shrink: true }}
          onChange={(event) => handleFilters('status', event.target.value)}
        >
          {PROFILE_STATUSES.map((item) => (
            <MenuItem key={item.id} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <TableContainer
        sx={{
          position: 'relative',
          height: 1,
        }}
      >
        <TableSelectedAction
          dense={table.dense}
          numSelected={table.selected.length}
          rowCount={logByProfiles.length}
          onSelectAllRows={(checked) =>
            table.onSelectAllRows(
              checked,
              logByProfiles.map((row) => row.id)
            )
          }
          action={
            <Tooltip title="Return">
              <IconButton color="primary">
                <Iconify icon="ph:key-return-fill" />
              </IconButton>
            </Tooltip>
          }
          sx={{
            width: 'calc(100% - 24px)',
            height: 56,
            borderRadius: 1.5,
            zIndex: 20,
          }}
        />
        <Scrollbar
          autoHide={false}
          sx={{
            pr: 2,
            mr: 1,
          }}
        >
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={logByProfiles.length}
              numSelected={table.selected.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  logByProfiles.map((row) => row.id)
                )
              }
              sx={{
                [`& .${tableCellClasses.head}`]: {
                  position: 'sticky',
                  top: 0,
                  bgcolor: (theme) => alpha(theme.palette.grey[800], 1),
                  zIndex: 10,
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
              {logByProfiles.map((row, index) => (
                <LogProfileTableRow
                  key={row.profile_id}
                  row={row}
                  selected={table.selected.includes(row.id)}
                  onSelectRow={() => table.onSelectRow(row.id)}
                />
              ))}

              <TableNoData
                sx={{
                  py: 2,
                }}
                notFound={notFound}
              />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
      <TablePaginationCustom
        count={logByProfiles.length}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        //
        dense={table.dense}
        onChangeDense={table.onChangeDense}
      />
    </Stack>
  );
};

LogProfileTab.propTypes = {
  logByProfiles: PropTypes.array,
  setLogByProfiles: PropTypes.func,
  refreshTaskLogData: PropTypes.func,
};

export default LogProfileTab;
