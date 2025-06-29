import React from 'react';

import {
  Box,
  Checkbox,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import Iconify from 'src/components/iconify';

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

export default function virtualProfileTableHeader({
  numSelected,
  rowCount,
  onSelectAllRows,
  headers,
  visibleColumn,
  confirm,
  t,
  order,
  onSort,
}) {
  return (
    <TableRow>
      <TableCell
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
      </TableCell>
      {headers.map(
        (headCell) =>
          !visibleColumn.includes(headCell.id) && (
            <TableCell
              variant="head"
              key={headCell.id}
              align={headCell.align || 'left'}
              // style={{ width: column.width }}
              sx={{
                backgroundColor: 'background.paper',
                minWidth: headCell.minWidth,
                maxWidth: headCell.maxWidth,
                width: headCell.width,
                whiteSpace: headCell.whiteSpace || 'nowrap',
              }}
            >
              {['id', 'name', 'date_expired', 'created_at'].includes(headCell.id) ? (
                <TableSortLabel
                  hideSortIcon
                  active
                  direction={order[headCell.id]}
                  onClick={() => onSort(headCell.id)}
                  sx={{
                    mr: '-18px',
                  }}
                >
                  {headCell.label}

                  <Box sx={{ ...visuallyHidden }}>
                    {order[headCell.id] === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                </TableSortLabel>
              ) : (
                headCell.label
              )}
            </TableCell>
          )
      )}
      <TableCell
        sx={{
          backgroundColor: 'background.paper',
          minWidth: 200,
          width: 200,
        }}
      >
        <Stack direction="row" justifyContent="space-between">
          {t('form.label.act')}
          <IconButton onClick={() => confirm.onTrue('columnSetting')}>
            <Iconify icon="uil:setting" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
