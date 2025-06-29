import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function TablePaginationCustom({
  dense,
  onChangeDense,
  rowsPerPageOptions = [10, 30, 50, 100, 300, 500, 1000],
  sx,
  children,
  ...other
}) {
  const { t } = useLocales();

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        {children}
      </div>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        labelRowsPerPage={t('table.pagination.rowPerPage')}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} ${t('table.pagination.of')} ${count}`
        }
        component="div"
        {...other}
        sx={{
          borderTopColor: 'transparent',
        }}
      />

      {/* {onChangeDense && (
        <FormControlLabel
          label="Dense"
          control={<Switch checked={dense} onChange={onChangeDense} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            position: {
              sm: 'absolute',
            },
          }}
        />
      )} */}
    </Box>
  );
}

TablePaginationCustom.propTypes = {
  dense: PropTypes.bool,
  onChangeDense: PropTypes.func,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  sx: PropTypes.object,
  children: PropTypes.node,
};
