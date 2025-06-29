import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Scrollbar from 'src/components/scrollbar';
// import { TableHeadCustom } from 'src/components/table';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Pagination from '@mui/material/Pagination';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Iconify from 'src/components/iconify';
import { memo } from 'react';

function createData(name, timeline, duration, status) {
  return { name, timeline, duration, status };
}

const TABLE_DATA = [
  createData('Frozen yoghurt', '3 ngày trước', '0s', 'success'),
  createData('Ice cream sandwich', '3 ngày trước', '0s', 'success'),
  createData('Eclair', '3 ngày trước', '0s', 'success'),
  createData('Cupcake', '3 ngày trước', '0s', 'success'),
  createData('Gingerbread', '3 ngày trước', '0s', 'success'),
];

// ----------------------------------------------------------------------

function LogList({ onClose, ...other }) {
  return (
    <Dialog fullWidth maxWidth="xl" onClose={() => onClose()} {...other}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Logs</Typography>
          <Button
            size="small"
            variant="outlined"
            sx={{ width: '30px', minWidth: '30px', height: '30px' }}
            onClick={() => onClose()}
          >
            <Iconify icon="ri:close-fill" sx={{ fontSize: '13px' }} />
          </Button>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack>
          <TextField
            fullWidth
            type="search"
            placeholder="Search..."
            // onChange={debounce((event) => handleFilters('search', event.target.value), 500)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
                </InputAdornment>
              ),
              // endAdornment: <>{loading ? <Iconify icon="svg-spinners:8-dots-rotate" /> : null}</>,
            }}
            sx={{ maxWidth: '300px' }}
          />
        </Stack>
        <TableContainer sx={{ mt: 3, overflow: 'unset' }}>
          <Scrollbar autoHide={false}>
            <Table sx={{ minWidth: 800 }}>
              <TableBody>
                {TABLE_DATA.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1}>
                        <Iconify icon="ri:calendar-line" />
                        {row.timeline}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1}>
                        <Iconify icon="mdi:clock-outline" />
                        {row.duration}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Chip label="success" color={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
        <Pagination count={8} sx={{ my: 5, mx: 'auto' }} />
      </DialogContent>
    </Dialog>
  );
}

export default memo(LogList);

LogList.propTypes = {
  onClose: PropTypes.func,
};
