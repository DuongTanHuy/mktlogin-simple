import {
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableContainer,
  alpha,
  tableCellClasses,
} from '@mui/material';
import PropTypes from 'prop-types';
import Scrollbar from 'src/components/scrollbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  TableSkeleton,
} from 'src/components/table';
import { useLocales } from 'src/locales';
import { getNumSkeleton } from 'src/utils/commom';
import SynchronizerTableRow from './synchronizer-table-row';

const SynchronizerTable = ({ tableData, loading, notFound, table }) => {
  const { t } = useLocales();

  const TABLE_HEAD = [
    { id: 'no', label: t('synchronizer.table.header.no'), width: 100, align: 'center' },
    { id: 'profileName', label: t('synchronizer.table.header.profileName'), align: 'center' },
    { id: 'group', label: t('synchronizer.table.header.group'), width: 160, align: 'center' },
  ];

  return (
    <Card
      sx={{
        height: 1,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
        border: (theme) => `dashed 1px ${theme.palette.divider}`,
        boxShadow: 'none',
      }}
    >
      <CardContent
        sx={{
          height: 1,
          '&.MuiCardContent-root': {
            pb: 0,
            pr: 1,
          },
        }}
      >
        <Stack height={1} spacing={0}>
          <TableContainer
            sx={{
              position: 'relative',
              height: 1,
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
              sx={{
                height: 56,
                borderRadius: 1.5,
                zIndex: 20,
              }}
            />
            <Scrollbar
              autoHide={false}
              sx={{
                height: 1,
                ...(notFound && {
                  '& .simplebar-content': {
                    height: 1,
                  },
                }),
                '&.simplebar-scrollable-y': {
                  pr: 2,
                },
              }}
            >
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 820, height: 1 }}>
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
                      (i, index) => <TableSkeleton key={index} cols={5} />
                    )
                  ) : (
                    <>
                      {tableData
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row) => (
                          <SynchronizerTableRow
                            key={row.id}
                            data={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                          />
                        ))}
                    </>
                  )}
                  <TableNoData
                    sx={{
                      py: 21,
                    }}
                    notFound={notFound}
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
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SynchronizerTable;

SynchronizerTable.propTypes = {
  tableData: PropTypes.array,
  loading: PropTypes.bool,
  notFound: PropTypes.bool,
  table: PropTypes.object,
};
