import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Iconify from '../iconify';

// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

// ----------------------------------------------------------------------

export default function TableHeadCustom({
  order,
  orderBy,
  rowCount = 0,
  headLabel,
  numSelected = 0,
  onSort,
  onSelectAllRows,
  sx,
  visibleColumn = [],
  disabled = false,
}) {
  return (
    <TableHead sx={sx}>
      <TableRow
        sx={{
          ...(disabled && {
            cursor: 'not-allowed',
          }),
        }}
      >
        {onSelectAllRows && (
          <TableCell padding="checkbox">
            <Checkbox
              disabled={disabled}
              indeterminate={!!numSelected && numSelected < rowCount}
              checked={!!rowCount && numSelected === rowCount}
              onChange={(event) => onSelectAllRows(event.target.checked)}
            />
          </TableCell>
        )}

        {headLabel.map(
          (headCell) =>
            !visibleColumn.includes(headCell.id) && (
              <TableCell
                key={headCell.id}
                align={headCell.align || 'left'}
                sortDirection={orderBy === headCell.id ? order : false}
                sx={{
                  minWidth: headCell.minWidth,
                  maxWidth: headCell.maxWidth,
                  width: headCell.width,
                  whiteSpace: headCell.whiteSpace || 'nowrap',
                }}
              >
                {onSort ? (
                  <TableSortLabel
                    hideSortIcon
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={() => onSort(headCell.id)}
                    sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}
                  >
                    {headCell.label}

                    {orderBy === headCell.id ? (
                      <Box sx={{ ...visuallyHidden }}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                ) : (
                  (() => {
                    if (headCell?.icon) {
                      return (
                        <Stack direction="row" justifyContent="space-between">
                          {headCell.label}
                          <IconButton onClick={headCell?.onClick}>
                            <Iconify icon={headCell.icon} />
                          </IconButton>
                        </Stack>
                      );
                    }
                    return headCell.label;
                  })()
                )}
              </TableCell>
            )
        )}
      </TableRow>
    </TableHead>
  );
}

TableHeadCustom.propTypes = {
  sx: PropTypes.object,
  onSort: PropTypes.func,
  orderBy: PropTypes.string,
  headLabel: PropTypes.array,
  visibleColumn: PropTypes.array,
  rowCount: PropTypes.number,
  numSelected: PropTypes.number,
  onSelectAllRows: PropTypes.func,
  disabled: PropTypes.bool,
  order: PropTypes.oneOf(['asc', 'desc']),
};
