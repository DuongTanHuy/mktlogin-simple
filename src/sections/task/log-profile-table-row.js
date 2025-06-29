import {
  Box,
  Checkbox,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';

// mui
import { useBoolean } from 'src/hooks/use-boolean';
import { getLogColor, getLogStatus } from '../../utils/rpa';

const LogProfileTableRow = ({ row, selected, onSelectRow }) => {
  const { profile_id, profile_name, start_at, finishAt, duration, status, logs } = row;
  const collapse = useBoolean();

  const renderPrimary = (
    <TableRow hover selected={selected} key={profile_id}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell align="center">{profile_id}</TableCell>

      <TableCell>{profile_name}</TableCell>

      <TableCell>{start_at}</TableCell>

      <TableCell>{finishAt}</TableCell>

      <TableCell align="center">{duration}</TableCell>

      <TableCell align="center">
        <Label
          variant="soft"
          color={
            (status === 'completed' && 'success') ||
            (status === 'pending' && 'warning') ||
            (status === 'cancelled' && 'error') ||
            'default'
          }
        >
          {status}
        </Label>
      </TableCell>

      <TableCell align="center">
        <IconButton
          color={collapse.value ? 'inherit' : 'default'}
          onClick={collapse.onToggle}
          sx={{
            ...(collapse.value && {
              bgcolor: 'action.hover',
            }),
          }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderSecondary = logs.map(
    (log, index) =>
      collapse.value && (
        <TableRow key={log.id}>
          <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
            <Collapse
              in={collapse.value}
              timeout="auto"
              unmountOnExit
              sx={{ bgcolor: 'background.neutral' }}
            >
              <Box key={index}>
                <Typography
                  variant="body2"
                  sx={{
                    display: 'inline-block',
                    fontSize: '0.875rem',
                  }}
                >
                  {`[${log.created_at}]`}
                </Typography>
                &nbsp;
                <Typography
                  variant="body2"
                  sx={{
                    color: getLogColor(log.type),
                    display: 'inline-block',
                    fontSize: '0.875rem',
                  }}
                >
                  {`${getLogStatus(log.type)}`}
                </Typography>
                &nbsp;
                <Typography
                  variant="body2"
                  sx={{
                    display: 'inline-block',
                    fontSize: '0.875rem',
                  }}
                >
                  {`[${log.duration} ms] : ${log.status}`}
                </Typography>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )
  );
  return (
    <>
      {renderPrimary}

      {renderSecondary}
    </>
  );
};

export default LogProfileTableRow;

LogProfileTableRow.propTypes = {
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
