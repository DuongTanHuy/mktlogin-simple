import PropTypes from 'prop-types';
// mui
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  tableCellClasses,
} from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, useTable } from 'src/components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [{ id: '#', label: '#' }];

// ----------------------------------------------------------------------

const OutputTab = ({ tableData }) => {
  const table = useTable();

  const notFound = !tableData.length;

  return (
    <TableContainer
      sx={{
        position: 'relative',
        height: 1,
      }}
    >
      <Scrollbar
        autoHide={false}
        sx={{
          pr: 2,
        }}
      >
        <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
          <TableHeadCustom
            order={table.order}
            orderBy={table.orderBy}
            headLabel={TABLE_HEAD}
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
            {tableData.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell
                  sx={{
                    typography: 'subtitle2',
                  }}
                >
                  1
                </TableCell>
              </TableRow>
            ))}

            <TableNoData
              sx={{
                py: 10,
              }}
              notFound={notFound}
            />
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
};

export default OutputTab;

OutputTab.propTypes = {
  tableData: PropTypes.array,
};
