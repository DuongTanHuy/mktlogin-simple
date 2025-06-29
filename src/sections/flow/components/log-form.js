import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRef } from 'react';

// ----------------------------------------------------------------------

export default function LogForm({ formData, IdNode }) {
  const variableModal = useBoolean();
  const inputRef = useRef(null);

  const handleChangeNumberSecond = (event) => {
    const { name, value } = event.target;
    eventBus.emit('updateNode', { data: { [name]: value }, idNode: IdNode });
  };

  const getVariable = (name, item) => {
    let finalValue = '';
    if (name === 'message') {
      const { selectionStart, selectionEnd } = inputRef.current;

      if (
        selectionStart > 0 &&
        selectionEnd <= formData?.dataFields?.message.length &&
        selectionStart <= selectionEnd
      ) {
        finalValue = `${formData?.dataFields?.message.slice(0, selectionStart)}\${${
          item.key
        }}${formData?.dataFields?.message.slice(selectionEnd)}`;
      } else {
        finalValue = `${formData?.dataFields?.message}\${${item.key}}`;
      }
    } else {
      finalValue = `\${${item.key}}`;
    }
    eventBus.emit('updateNode', { data: { [name]: finalValue }, idNode: IdNode });
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
          inputRef={inputRef}
          type="text"
          name="message"
          label="Nội dung hiển thị"
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.message || ''}
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="message"
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

LogForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
