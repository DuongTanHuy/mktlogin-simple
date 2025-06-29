import {
  Box,
  IconButton,
  Table,
  TableBody,
  tableCellClasses,
  TableContainer,
  tablePaginationClasses,
  Tooltip,
  useTheme,
} from '@mui/material';
import PropTypes from 'prop-types';
import Iconify from 'src/components/iconify';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  TableSkeleton,
} from 'src/components/table';
import { getNumSkeleton } from 'src/utils/commom';
import Scrollbar from 'src/components/scrollbar';
import AccountLinkTableRow from './account-link-table-row';

// ----------------------------------------------------------------------

const AccountLinkTable = ({
  table,
  tableData = [],
  notFound,
  onDeleteRow,
  onOpenConfirm,
  count,
  dataLoading,
  t,
}) => {
  const TABLE_HEAD = [
    { id: 'name', label: t('accSetting.tabs.accLink.table.header.name') },
    { id: 'email', label: t('accSetting.tabs.accLink.table.header.email') },
    { id: 'app', label: t('accSetting.tabs.accLink.table.header.app'), width: 120 },
    {
      id: 'status',
      label: t('accSetting.tabs.accLink.table.header.status'),
      align: 'center',
      width: 140,
    },
    {
      id: 'link-data',
      label: t('accSetting.tabs.accLink.table.header.linkDate'),
      align: 'center',
      width: 140,
    },
    {
      id: 'action',
      label: t('accSetting.tabs.accLink.table.header.action'),
      align: 'center',
      whiteSpace: 'nowrap',
    },
  ];

  const theme = useTheme();

  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    //
    selected,
    onSelectRow,
    onSelectAllRows,
    //
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = table;

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          m: theme.spacing(-2, -3, -3, -3),
        }}
      >
        <TableSelectedAction
          dense={dense}
          numSelected={selected.length}
          rowCount={tableData.length}
          onSelectAllRows={(checked) =>
            onSelectAllRows(
              checked,
              tableData.map((row) => row.id)
            )
          }
          action={
            <Tooltip title="Delete">
              <IconButton color="primary" onClick={onOpenConfirm}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          }
          sx={{
            pl: 1,
            pr: 2,
            top: 16,
            left: 24,
            right: 24,
            width: 'auto',
            borderRadius: 1.5,
          }}
        />

        <TableContainer
          sx={{
            p: theme.spacing(0, 3, 0, 3),
          }}
        >
          <Scrollbar autoHide={false}>
            <Table
              size={dense ? 'small' : 'medium'}
              sx={{
                minWidth: 960,
                borderCollapse: 'separate',
                borderSpacing: '0 16px',
              }}
            >
              <TableHeadCustom
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={selected.length}
                onSelectAllRows={(checked) =>
                  onSelectAllRows(
                    checked,
                    tableData.map((row) => row.id)
                  )
                }
                sx={{
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
                {dataLoading ? (
                  [...Array(getNumSkeleton(table.rowsPerPage, tableData.length))].map(
                    (_, index) => <TableSkeleton key={index} />
                  )
                ) : (
                  <>
                    {tableData.map((row) => (
                      <AccountLinkTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onDeleteRow={() => onDeleteRow(row.id)}
                      />
                    ))}
                  </>
                )}

                <TableNoData
                  notFound={notFound}
                  title={t('accSetting.tabs.accLink.table.noData')}
                  sx={{
                    m: -2,
                    borderRadius: 1.5,
                    border: `dashed 1px ${theme.palette.divider}`,
                  }}
                />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Box>

      <TablePaginationCustom
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        //
        dense={dense}
        onChangeDense={onChangeDense}
        sx={{
          [`& .${tablePaginationClasses.toolbar}`]: {
            borderTopColor: 'transparent',
          },
          mb: 3,
        }}
      />
    </>
  );
};

export default AccountLinkTable;

AccountLinkTable.propTypes = {
  count: PropTypes.number,
  notFound: PropTypes.bool,
  dataLoading: PropTypes.bool,
  onDeleteRow: PropTypes.func,
  onOpenConfirm: PropTypes.func,
  t: PropTypes.func,
  table: PropTypes.object,
  tableData: PropTypes.array,
};
