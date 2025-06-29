import PropTypes from 'prop-types';
import { alpha, Stack, Table, TableBody, tableCellClasses, TableContainer } from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSkeleton,
  useTable,
} from 'src/components/table';
import { useLocales } from 'src/locales';
import { getNumSkeleton } from 'src/utils/commom';
import { ROWS_PER_PAGE_CONFIG } from 'src/utils/constance';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import MemberTableRow from './member-table-row';

// ----------------------------------------------------------------------

const List = ({ loading, tableData, fetchData }) => {
  const { t } = useLocales();
  const rowNum = getStorage(ROWS_PER_PAGE_CONFIG)?.list_member;

  const TABLE_HEAD = [
    { id: 'name', label: t('member.list.headers.name'), whiteSpace: 'nowrap' },
    { id: 'email', label: t('member.list.headers.email'), whiteSpace: 'nowrap' },
    {
      id: 'permission',
      label: t('member.list.headers.role'),
      whiteSpace: 'nowrap',
      align: 'center',
    },
    { id: 'note', label: t('member.list.headers.note'), whiteSpace: 'nowrap', align: 'left' },
    {
      id: 'action',
      label: t('member.list.headers.actions'),
      whiteSpace: 'nowrap',
      align: 'center',
      width: 60,
    },
  ];

  const table = useTable({
    defaultOrderBy: 'name',
    defaultOrder: 'asc',
    defaultRowsPerPage: rowNum ?? 50,
  });

  return (
    <Stack justifyContent="space-between" height={1}>
      <TableContainer sx={{ position: 'relative', overflow: 'auto', height: 1 }}>
        <Scrollbar
          autoHide={false}
          sx={{
            height: 1,
            pr: 2,
            ...(tableData.length === 0 &&
              !loading && {
                '& .simplebar-content': {
                  height: 1,
                },
              }),
          }}
        >
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960, height: 1 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
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
                [...Array(getNumSkeleton(table.rowsPerPage, tableData.length))].map((i, index) => (
                  <TableSkeleton hasAction={false} key={index} cols={5} sx={{ height: '68px' }} />
                ))
              ) : (
                <>
                  {tableData
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <MemberTableRow key={row.id} data={row} handleRerender={fetchData} />
                    ))}
                </>
              )}

              <TableNoData
                sx={{
                  py: 20,
                }}
                notFound={tableData.length === 0 && !loading}
              />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <TablePaginationCustom
        count={tableData.length}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={(event) => {
          table.onChangeRowsPerPage(event);
          setStorage(ROWS_PER_PAGE_CONFIG, {
            ...getStorage(ROWS_PER_PAGE_CONFIG),
            list_member: event.target.value,
          });
        }}
        //
        dense={table.dense}
        onChangeDense={table.onChangeDense}
      />
    </Stack>
  );
};

export default List;

List.propTypes = {
  loading: PropTypes.bool,
  tableData: PropTypes.array,
  fetchData: PropTypes.func,
};
