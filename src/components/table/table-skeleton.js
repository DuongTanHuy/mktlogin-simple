import PropTypes from 'prop-types';

// @mui
import Skeleton from '@mui/material/Skeleton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

// ----------------------------------------------------------------------

export default function TableSkeleton({ hasAction = true, cols = 6, ...other }) {
  return (
    <TableRow {...other}>
      {hasAction && (
        <TableCell>
          <Skeleton sx={{ borderRadius: 0.6, width: 20, height: 20, flexShrink: 0, mx: 'auto' }} />
        </TableCell>
      )}
      {[...Array(cols)].map((_, index) => (
        <TableCell key={index}>
          <Skeleton sx={{ width: 1, height: 12 }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

TableSkeleton.propTypes = {
  hasAction: PropTypes.bool,
  cols: PropTypes.number,
};
