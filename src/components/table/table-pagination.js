import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import { Pagination } from '@mui/material';

// ----------------------------------------------------------------------

export default function TablePaginationV2({ sx, totalRows, rowsPerPage, setCurrentPage }) {
  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <Pagination
        onChange={(event) => {
          setCurrentPage(event.target.textContent);
        }}
        count={Math.ceil(totalRows / rowsPerPage)}
      />
    </Box>
  );
}

TablePaginationV2.propTypes = {
  rowsPerPage: PropTypes.number,
  totalRows: PropTypes.number,
  setCurrentPage: PropTypes.func,
  sx: PropTypes.object,
};
