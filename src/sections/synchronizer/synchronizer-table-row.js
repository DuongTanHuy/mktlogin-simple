import { Checkbox, TableCell, TableRow, Tooltip } from '@mui/material';
import { t } from 'i18next';
import PropTypes from 'prop-types';
import TextMaxLine from 'src/components/text-max-line';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';

const SynchronizerTableRow = ({ data, selected, onSelectRow }) => {
  const { id, profile_group, name } = data;
  const [nameRef, showName] = useTooltipNecessity(false);
  const [groupRef, showGroup] = useTooltipNecessity(false);

  return (
    <TableRow hover>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>
      <TableCell align="center">{id}</TableCell>

      <TableCell align="center">
        <Tooltip title={showName ? name : ''}>
          <TextMaxLine ref={nameRef} line={2}>
            {name}
          </TextMaxLine>
        </Tooltip>
      </TableCell>

      <TableCell align="center">
        <Tooltip title={showGroup ? profile_group.name : ''}>
          <TextMaxLine ref={groupRef} line={1}>
            {profile_group?.name ?? t('group.ungrouped')}
          </TextMaxLine>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default SynchronizerTableRow;

SynchronizerTableRow.propTypes = {
  data: PropTypes.object,
  selected: PropTypes.bool,
  onSelectRow: PropTypes.func,
};
