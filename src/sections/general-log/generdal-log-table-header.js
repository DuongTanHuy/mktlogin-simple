import React from 'react';
import PropTypes from 'prop-types';

import { TableCell, TableRow } from '@mui/material';

export default function GeneralLogTableHeader({
  numSelected,
  rowCount,
  onSelectAllRows,
  headLabel,
}) {
  return (
    <TableRow>
      {/* <TableCell
        padding="checkbox"
        sx={{
          backgroundColor: 'background.paper',
          width: 54,
          zIndex: 99,
        }}
      >
        <Checkbox
          indeterminate={!!numSelected && numSelected < rowCount}
          checked={!!rowCount && numSelected === rowCount}
          onChange={(event) => onSelectAllRows(event.target.checked)}
        />
      </TableCell> */}
      {headLabel.map((headCell) => (
        <TableCell
          variant="head"
          key={headCell.id}
          align={headCell.align || 'left'}
          sx={{
            backgroundColor: 'background.paper',
            minWidth: headCell.minWidth,
            maxWidth: headCell.maxWidth,
            width: headCell.width,
            whiteSpace: headCell.whiteSpace || 'nowrap',
          }}
        >
          {headCell.label}
        </TableCell>
      ))}
    </TableRow>
  );
}

GeneralLogTableHeader.propTypes = {
  numSelected: PropTypes.number.isRequired,
  rowCount: PropTypes.number.isRequired,
  onSelectAllRows: PropTypes.func.isRequired,
  headLabel: PropTypes.array.isRequired,
};
