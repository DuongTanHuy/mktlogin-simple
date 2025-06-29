import PropTypes from 'prop-types';

import {
  alpha,
  Button,
  Checkbox,
  IconButton,
  ListItemText,
  Stack,
  TableCell,
  tableCellClasses,
  TableRow,
  tableRowClasses,
  Typography,
  useTheme,
} from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { format } from 'date-fns';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

const AccountLinkTableRow = ({ row, selected, onSelectRow, onDeleteRow }) => {
  const { name, email, app_type, status, created_at } = row;

  const theme = useTheme();

  const confirm = useBoolean();

  const defaultStyles = {
    borderTop: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    borderBottom: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    '&:first-of-type': {
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
      borderLeft: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    },
    '&:last-of-type': {
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      borderRight: `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
    },
  };

  const handleDeleteAppAccount = async () => {
    try {
      onDeleteRow();
      confirm.onFalse();
    } catch (error) {
      /* empty */
    }
  };

  return (
    <>
      <TableRow
        selected={selected}
        sx={{
          borderRadius: 2,
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
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onDoubleClick={() => console.info('ON DOUBLE CLICK')}
            onClick={onSelectRow}
          />
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography
              noWrap
              variant="inherit"
              sx={{
                maxWidth: 200,
              }}
            >
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{email}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{app_type}</TableCell>

        <TableCell align="center">{status}</TableCell>

        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
          <ListItemText
            primary={format(new Date(created_at), 'dd MMM yyyy')}
            secondary={format(new Date(created_at), 'p')}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        <TableCell
          align="center"
          sx={{
            px: 1,
          }}
        >
          <IconButton onClick={confirm.onTrue}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Xóa tài khoản"
        content="Bạn chắc chắn muốn xóa tài khoản này?"
        action={
          <Button variant="contained" color="error" onClick={handleDeleteAppAccount}>
            Xóa
          </Button>
        }
      />
    </>
  );
};

export default AccountLinkTableRow;

AccountLinkTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
