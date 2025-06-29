/* eslint-disable no-plusplus */
import React from 'react';
import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import eventBus from 'src/sections/script/event-bus';
import { Autocomplete, Chip, TextField } from '@mui/material';
import { KEYBOARD } from 'src/utils/constance';

// ----------------------------------------------------------------------

export default function EnterKeyboardForm({ formData, IdNode, nodes }) {
  const { dataFields } = formData;

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
        {/* <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Click theo</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Click theo"
            onChange={handleChangeNumberSecond}
            value={dataFields?.keys || 'match_pattern'}
            name="keys"
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
            }}
          >
            <MenuItem value="match_pattern">Match Pattern</MenuItem>
            {allKeys.map((item) => (
              <MenuItem key={item.id} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}

        <Autocomplete
          multiple
          name="keys"
          disableCloseOnSelect
          options={KEYBOARD}
          isOptionEqualToValue={(option, value) => option === value}
          getOptionLabel={(option) => option}
          renderOption={(props, group) => (
            <li {...props} key={group} value={group}>
              {group}
            </li>
          )}
          value={dataFields?.keys || []}
          onChange={(event, newValue) => {
            eventBus.emit('updateNode', { data: { keys: newValue }, idNode: IdNode });
          }}
          renderInput={(params) => <TextField placeholder="+ Select key" {...params} />}
          renderTags={(selected, getTagProps) =>
            selected.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option}
                label={option}
                size="small"
                color="primary"
                variant="soft"
              />
            ))
          }
        />
      </Stack>
    </Stack>
  );
}

EnterKeyboardForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
  nodes: PropTypes.array,
};
