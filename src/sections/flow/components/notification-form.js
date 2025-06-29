import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export default function NotificationForm({ formData, IdNode }) {
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
      <Stack spacing={2} mt={2}>
        <TextField
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.title || ''}
          name="title"
          label="Title"
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
        <TextField
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.message || ''}
          name="message"
          label="Message"
          multiline
          rows={4}
        />
        <TextField
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.icon || ''}
          name="icon"
          label="Icon URL (optional)"
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="icon"
                getVariable={getVariable}
                openVariableModal={variableModal.onTrue}
              />
            ),
          }}
        />
        <TextField
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.image || ''}
          name="image"
          label="Image URL (optional)"
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="image"
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

NotificationForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
