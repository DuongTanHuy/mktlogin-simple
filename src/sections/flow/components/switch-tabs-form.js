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
import { Checkbox, FormControlLabel } from '@mui/material';

// ----------------------------------------------------------------------

export default function SwitchTabsForm({ formData, IdNode }) {
  const { dataFields } = formData;
  const variableModal = useBoolean();

  const handleChangeNumberSecond = (event) => {
    const { name, value, type, checked } = event.target;
    eventBus.emit('updateNode', {
      data: { [name]: type === 'checkbox' ? checked : value },
      idNode: IdNode,
    });
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
      <Stack spacing={3} mt={2}>
        <TextField
          select
          fullWidth
          name="find_by"
          label="Chuyển theo"
          onChange={handleChangeNumberSecond}
          // value={dataFields?.find_by || ''}
          value={dataFields?.find_by || 'match_pattern'}
        >
          <MenuItem value="match_pattern">Khớp với mẫu</MenuItem>
          <MenuItem value="match_title">Tiêu đề tab</MenuItem>
          <MenuItem value="next_tab">Tab bên phải</MenuItem>
          <MenuItem value="previous_tab">Tab bên trái</MenuItem>
          <MenuItem value="tab_order">Thứ tự tab</MenuItem>
        </TextField>
        {dataFields?.find_by === 'match_pattern' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={dataFields?.pattern || ''}
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
        {dataFields?.find_by === 'match_title' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={dataFields?.title || ''}
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
        {dataFields?.find_by === 'tab_order' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={dataFields?.order_number || ''}
            name="order_number"
            label="Thứ tự"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="order_number"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        <FormControlLabel
          name="is_active"
          control={<Checkbox checked={formData?.dataFields?.is_active || false} />}
          onChange={handleChangeNumberSecond}
          label="Đặt làm tab hoạt động"
          sx={{
            width: 'fit-content',
          }}
        />
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

SwitchTabsForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
