import PropTypes from 'prop-types';

import {
  alpha,
  Stack,
  TableCell,
  tableCellClasses,
  TableRow,
  tableRowClasses,
  useTheme,
} from '@mui/material';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';

const AccountLinkTableRow = ({ row, affiliateLevel }) => {
  const { t } = useLocales();
  const { id, name, commissionPercentage, buyer } = row;
  const { user } = useAuthContext();

  const theme = useTheme();

  const defaultStyles = {
    borderTop: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    borderBottom: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    '&:first-of-type': {
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      borderLeft: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    },
    '&:last-of-type': {
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      borderRight: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    },
  };

  return (
    <TableRow
      sx={{
        borderRadius: 2,
        ...(((user?.affiliate_level === null && id === 1) || user?.affiliate_level?.id === id) && {
          backgroundColor: 'background.paper',
          boxShadow: theme.customShadows.z20,
        }),
        [`&.${tableRowClasses.selected}, &:hover`]: {
          backgroundColor: 'background.paper',
          boxShadow: theme.customShadows.z20,
          transition: theme.transitions.create(['background-color', 'box-shadow'], {
            duration: theme.transitions.duration.shortest,
          }),
          '&:hover': {
            backgroundColor: 'background.paper',
            boxShadow: theme.customShadows.z20,
          },
        },
        [`& .${tableCellClasses.root}`]: {
          ...defaultStyles,
          p: 1,
        },
      }}
    >
      <TableCell sx={{ whiteSpace: 'nowrap', padding: '12px' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {name}
          {affiliateLevel && <Iconify icon="lets-icons:check-fill" color="success.main" />}
        </Stack>
      </TableCell>

      <TableCell
        sx={{ whiteSpace: 'nowrap' }}
        align="center"
      >{`${commissionPercentage}%`}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }} align="center">{`${buyer} ${t(
        'affiliateProgram.buyers'
      )}`}</TableCell>
    </TableRow>
  );
};

export default AccountLinkTableRow;

AccountLinkTableRow.propTypes = {
  row: PropTypes.object,
  affiliateLevel: PropTypes.bool,
};
