import React from 'react';
import PropTypes from 'prop-types';
import { Stack, TextField, Typography } from '@mui/material';
import eventBus from 'src/sections/script/event-bus';

export default function LoopBreakForm({ formData, IdNode }) {
  const handleChangeNumberSecond = (event) => {
    const { name, value } = event.target;
    eventBus.emit('updateNode', {
      data: { [name]: value },
      idNode: IdNode,
    });
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
      <Stack mt={2} spacing={1}>
        <TextField
          label="Loop ID"
          name="loop_id"
          value={formData?.dataFields?.loop_id || ''}
          onChange={handleChangeNumberSecond}
        />
      </Stack>
    </Stack>
  );
}

LoopBreakForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
