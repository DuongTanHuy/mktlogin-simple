import PropTypes from 'prop-types';
// @mui
import TableCell from '@mui/material/TableCell';
// utils
import { ListItemText } from '@mui/material';
import { useLocales } from 'src/locales';
import { format } from 'date-fns';
import { LOCALES } from 'src/utils/constance';
import i18n from 'src/locales/i18n';
import Label from 'src/components/label';
// eslint-disable-next-line no-unused-vars

// ----------------------------------------------------------------------

export default function GeneralLogTableRow({ row, selected, onSelectRow, no }) {
  const { t } = useLocales();

  const { profile, user, activity_type, created_at } = row;

  return (
    <>
      {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}
      <TableCell
        sx={{
          typography: 'subtitle2',
        }}
        align="center"
      >
        <Label color="primary">{t(`generalLog.options.${activity_type}`)}</Label>
      </TableCell>

      <TableCell
        align="center"
        sx={{
          typography: 'subtitle2',
        }}
      >
        {profile?.id}
      </TableCell>
      <TableCell
        sx={{
          typography: 'subtitle2',
        }}
        align="center"
      >
        {profile?.name}
      </TableCell>

      <TableCell>
        <ListItemText
          primary={user?.username ?? ''}
          secondary={user?.email ?? ''}
          primaryTypographyProps={{ typography: 'body2', whiteSpace: 'nowrap' }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>

      <TableCell
        sx={{
          typography: 'subtitle2',
        }}
        align="center"
      >
        {created_at && (
          <ListItemText
            primary={format(new Date(created_at), 'dd MMMM yyyy', {
              locale: LOCALES[i18n.language],
            })}
            secondary={format(new Date(created_at), 'p', {
              locale: LOCALES[i18n.language],
            })}
            primaryTypographyProps={{ typography: 'body2', whiteSpace: 'nowrap' }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        )}
      </TableCell>
    </>
  );
}

GeneralLogTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onSelectRow: PropTypes.func,
  no: PropTypes.number,
};
