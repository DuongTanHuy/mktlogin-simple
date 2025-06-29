import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

// components
import eventBus from 'src/sections/script/event-bus';
import PositionedMenu from 'src/components/list-click';
import { useBoolean } from 'src/hooks/use-boolean';
import Variables from 'src/components/variable';

// ----------------------------------------------------------------------

export default function CloseTabForm({ formData, IdNode }) {
  const { dataFields } = formData;
  const variableModal = useBoolean();

  const handleChangeNumberSecond = (event) => {
    const { name, value } = event.target;
    eventBus.emit('updateNode', { data: { [name]: value }, idNode: IdNode });
  };

  const getVariable = (name, item) => {
    eventBus.emit('updateNode', { data: { [name]: `\${${item.key}}` }, idNode: IdNode });
  };

  return (
    <Stack>
      <Typography
        sx={{
          fontSize: 16,
          fontStyle: 'italic',
        }}
        color="text.secondary"
      >
        {formData?.data?.description}
      </Typography>
      <Stack spacing={3} mt={4}>
        <TextField
          select
          fullWidth
          name="close_type"
          label="Đóng theo"
          onChange={handleChangeNumberSecond}
          value={dataFields?.close_type || 'current'}
        >
          <MenuItem value="current">Tab đang hoạt động</MenuItem>
          <MenuItem value="match_pattern">Tab khớp với mẫu</MenuItem>
          <MenuItem value="match_title">Tab khớp với tiêu đề</MenuItem>
          <MenuItem value="order">Tab có thứ tự</MenuItem>
          <MenuItem value="other_tabs">Trừ tab đang hoạt động</MenuItem>
        </TextField>
        {dataFields?.close_type === 'match_pattern' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={dataFields?.pattern}
            name="pattern"
            label="Mẫu"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="pattern"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}
        {dataFields?.close_type === 'match_title' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={dataFields?.title}
            name="title"
            label="Tiêu đề"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="title"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}
        {dataFields?.close_type === 'order' && (
          <TextField
            value={dataFields?.number_order || ''}
            onChange={handleChangeNumberSecond}
            name="number_order"
            label="Thứ tự"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="number_order"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

CloseTabForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
