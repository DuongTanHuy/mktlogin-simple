import React from 'react';
import PropTypes from 'prop-types';
import { alpha, ListItemButton, ListItemText, Stack } from '@mui/material';
import { useFormContext } from 'react-hook-form';

const GroupButton = ({ name, buttons, sx }) => {
  const { watch, setValue } = useFormContext();

  return (
    <Stack
      direction="row"
      spacing={1}
      p={0.5}
      bgcolor={(theme) => alpha(theme.palette.grey[600], 0.04)}
      borderRadius={1}
      sx={sx}
    >
      {buttons.map((button, index) => (
        <ListItemButton
          key={button.id}
          selected={watch(name) === button.value}
          onClick={() => {
            setValue(name, button.value, { shouldDirty: true });
          }}
          sx={{
            borderRadius: 1,
            textAlign: 'center',
            py: 0.5,
          }}
        >
          <ListItemText primary={button.label} />
        </ListItemButton>
      ))}
    </Stack>
  );
};

export default GroupButton;

GroupButton.propTypes = {
  buttons: PropTypes.array.isRequired,
  name: PropTypes.string,
  sx: PropTypes.object,
};
