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

export default function WaitLoadForm({ formData, IdNode }) {
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
          name="wait_until"
          label="Đợi đến khi sự kiện được kích hoạt"
          value={formData?.dataFields?.wait_until || 'load'}
          onChange={handleChangeNumberSecond}
        >
          {[
            {
              id: 1,
              label: 'load',
              value: 'load',
            },
            {
              id: 2,
              label: 'domcontentloaded',
              value: 'domcontentloaded',
            },
            {
              id: 3,
              label: 'networkidle0',
              value: 'networkidle0',
            },
            {
              id: 4,
              label: 'networkidle2',
              value: 'networkidle2',
            },
          ].map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.timeout || ''}
          name="timeout"
          label="Thời gian chờ tối đa (số giây)"
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="timeout"
                getVariable={getVariable}
                openVariableModal={variableModal.onTrue}
              />
            ),
          }}
        />
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

WaitLoadForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
