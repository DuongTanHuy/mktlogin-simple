import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
// utils
import { Checkbox, Divider, MenuItem, Stack, Tooltip, Zoom } from '@mui/material';
import Iconify from 'src/components/iconify';
import { useState } from 'react';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useLocales } from 'src/locales';
import TextMaxLine from 'src/components/text-max-line';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';
import { fDate } from 'src/utils/format-time';
// eslint-disable-next-line no-unused-vars

// ----------------------------------------------------------------------

export default function TrashTableRow({ row, selected, onSelectRow, no }) {
  const { t } = useLocales();
  const router = useRouter();
  const [targetPopover, setTargetPopover] = useState(null);
  const confirm = useBoolean();

  const { id, group_name, name, duration, created_at, deleted_at } = row;

  const [groupRef, showGroup] = useTooltipNecessity(false);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell
          sx={{
            typography: 'subtitle2',
          }}
          align="center"
        >
          {no}
        </TableCell>
        <TableCell
          sx={{
            typography: 'subtitle2',
          }}
          align="center"
        >
          {id}
        </TableCell>
        <TableCell
          align="center"
          sx={{
            typography: 'subtitle2',
          }}
        >
          <Tooltip title={showGroup ? name : ''}>
            <TextMaxLine ref={groupRef} line={1}>
              {group_name}
            </TextMaxLine>
          </Tooltip>
        </TableCell>
        <TableCell
          sx={{
            typography: 'subtitle2',
          }}
          align="center"
        >
          {name}
        </TableCell>
        <TableCell
          sx={{
            typography: 'subtitle2',
            color: Number(duration) < 0 ? 'error.main' : 'text.primary',
          }}
          align="center"
        >
          {`${duration} ${t('form.label.date')}`}
        </TableCell>

        <TableCell
          sx={{
            typography: 'subtitle2',
          }}
          align="center"
        >
          {created_at ? fDate(new Date(created_at), 'dd/MM/yyyy HH:ss') : ''}
        </TableCell>
        <TableCell
          sx={{
            typography: 'subtitle2',
          }}
          align="center"
        >
          {created_at ? fDate(new Date(deleted_at), 'dd/MM/yyyy HH:ss') : ''}
        </TableCell>
      </TableRow>
      <CustomPopover
        open={targetPopover}
        onClose={() => setTargetPopover(null)}
        sx={{
          width: 'fit-content',
        }}
        TransitionComponent={Zoom}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Stack>
          <MenuItem onClick={() => router.push(paths.task.edit(id))}>
            <Iconify icon="uil:edit" />
            {t('task.actions.edit')}
          </MenuItem>

          <Divider />

          <MenuItem
            sx={{
              color: 'error.main',
            }}
            onClick={confirm.onTrue}
          >
            <Iconify icon="fluent:delete-16-regular" />
            {t('task.actions.delete')}
          </MenuItem>
        </Stack>
      </CustomPopover>
    </>
  );
}

TrashTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onSelectRow: PropTypes.func,
  no: PropTypes.number,
};
