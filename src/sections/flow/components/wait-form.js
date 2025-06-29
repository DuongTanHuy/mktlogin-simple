import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import { MenuItem } from '@mui/material';

// ----------------------------------------------------------------------

export default function WaitForm({ formData, IdNode }) {
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
      <Stack spacing={3} mt={2}>
        <TextField
          select
          fullWidth
          name="time_type"
          label="Đợi theo thời gian"
          value={formData?.dataFields?.time_type || 'fixed'}
          onChange={handleChangeNumberSecond}
        >
          {[
            { label: 'Cố định', value: 'fixed' },
            { label: 'Ngẫu nhiên', value: 'random' },
          ].map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
        {formData?.dataFields?.time_type === 'fixed' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.num_seconds || ''}
            name="num_seconds"
            label="Thời gian chờ (số giây)"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="num_seconds"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}
        {formData?.dataFields?.time_type === 'random' && (
          <Stack direction="row" spacing={3} alignItems="center">
            <TextField
              fullWidth
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.num_start || ''}
              name="num_start"
              label="Số bắt đầu (giây)"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="num_start"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <TextField
              fullWidth
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.num_end || ''}
              name="num_end"
              label="Số kết thúc (giây)"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="num_end"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </Stack>
        )}
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

WaitForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
