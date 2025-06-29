import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import eventBus from 'src/sections/script/event-bus';
import { useBoolean } from 'src/hooks/use-boolean';
import Variables from 'src/components/variable';
import PositionedMenu from 'src/components/list-click';
import { FormControlLabel, MenuItem, Switch } from '@mui/material';

// ----------------------------------------------------------------------

export default function ElementExistsForm({ formData, IdNode }) {
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
          fontSize: 14,
          fontStyle: 'italic',
        }}
        px={3}
        color="text.secondary"
      >
        {formData?.description}
      </Typography>
      <Stack spacing={2} mt={2}>
        <TextField
          select
          fullWidth
          name="type"
          label="Type"
          value={formData?.dataFields?.type || 'css_selector'}
          onChange={handleChangeNumberSecond}
        >
          <MenuItem value="css_selector">Css selector</MenuItem>
          <MenuItem value="xpath">Xpath</MenuItem>
        </TextField>
        <TextField
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.element_selector || ''}
          name="element_selector"
          label="Element selector"
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="element_selector"
                getVariable={getVariable}
                openVariableModal={variableModal.onTrue}
              />
            ),
          }}
        />
        <TextField
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.try_for || ''}
          name="try_for"
          label="Try for"
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="try_for"
                getVariable={getVariable}
                openVariableModal={variableModal.onTrue}
              />
            ),
          }}
        />
        <TextField
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.timeout || ''}
          name="timeout"
          label="Timeout"
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
        <FormControlLabel
          name="throw_error"
          control={<Switch checked={formData?.dataFields?.throw_error || false} />}
          onChange={handleChangeNumberSecond}
          label="Throw an error if doesn't exist"
          sx={{
            width: 'fit-content',
          }}
        />
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

ElementExistsForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
