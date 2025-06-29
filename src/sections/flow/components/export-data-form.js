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

export default function ExportDataForm({ formData, IdNode }) {
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
      <Stack spacing={2.5} mt={2}>
        <TextField
          select
          fullWidth
          name="type"
          label="Type"
          value={formData?.dataFields?.type || 'table'}
          onChange={handleChangeNumberSecond}
        >
          <MenuItem value="table">Table</MenuItem>
          <MenuItem value="google_sheets">Google sheets</MenuItem>
          <MenuItem value="variable">Variable</MenuItem>
        </TextField>

        {formData?.dataFields?.type === 'google_sheets' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.reference_key || ''}
            name="reference_key"
            label="Reference key"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="reference_key"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        {formData?.dataFields?.type === 'variable' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.variable_name || ''}
            name="variable_name"
            label="Variable name"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="variable_name"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        <TextField
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.file_name || ''}
          name="file_name"
          label="Filename"
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="file_name"
                getVariable={getVariable}
                openVariableModal={variableModal.onTrue}
              />
            ),
          }}
        />
        <TextField
          select
          fullWidth
          name="on_conflict"
          label="On conflict"
          value={formData?.dataFields?.on_conflict || 'uniquify'}
          onChange={handleChangeNumberSecond}
        >
          <MenuItem value="uniquify">Uniquify</MenuItem>
          <MenuItem value="overwrite">Overwrite</MenuItem>
          <MenuItem value="prompt">Prompt</MenuItem>
        </TextField>
        <TextField
          select
          fullWidth
          name="export_as"
          label="Export as"
          value={formData?.dataFields?.export_as || 'json'}
          onChange={handleChangeNumberSecond}
        >
          <MenuItem value="json">JSON</MenuItem>
          <MenuItem value="csv">CSV</MenuItem>
          <MenuItem value="plain_text">Plain text</MenuItem>
        </TextField>
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

ExportDataForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
