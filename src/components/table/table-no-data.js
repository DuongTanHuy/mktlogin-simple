import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
//
import { Box } from '@mui/material';
import { useLocales } from 'src/locales';
import EmptyContent from '../empty-content';

// ----------------------------------------------------------------------

export default function TableNoData({
  notFound,
  title,
  imgUrl,
  description,
  sxCell,
  sx,
  cols = 12,
}) {
  const { t } = useLocales();
  return (
    <TableRow component={sxCell && Box}>
      {notFound ? (
        <TableCell component={sxCell && Box} colSpan={cols} sx={sxCell}>
          <EmptyContent
            filled
            title={title || t('noData')}
            description={description}
            imgUrl={imgUrl}
            sx={{
              py: 10,
              ...sx,
            }}
          />
        </TableCell>
      ) : (
        <TableCell component={sxCell && Box} colSpan={cols} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
}

TableNoData.propTypes = {
  notFound: PropTypes.bool,
  title: PropTypes.string,
  imgUrl: PropTypes.string,
  description: PropTypes.string,
  sx: PropTypes.object,
  sxCell: PropTypes.object,
  cols: PropTypes.number,
};
