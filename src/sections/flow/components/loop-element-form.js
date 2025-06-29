import React from 'react';
import PropTypes from 'prop-types';

import {
  Checkbox,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import eventBus from 'src/sections/script/event-bus';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';

export default function LoopElementForm({ formData, IdNode }) {
  const variableModal = useBoolean();

  const getVariable = (name, item) => {
    eventBus.emit('updateNode', { data: { [name]: `\${${item.key}}` }, idNode: IdNode });
  };

  const handleChangeNumberSecond = (event) => {
    const { name, value, type, checked } = event.target;
    eventBus.emit('updateNode', {
      data: { [name]: type === 'checkbox' ? checked : value },
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
      <Stack spacing={3} mt={2}>
        <TextField
          label="Loop ID"
          name="loop_id"
          value={formData?.dataFields?.loop_id || ''}
          onChange={handleChangeNumberSecond}
        />
        <Stack spacing={1}>
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
            name="element_selector"
            label="Element selector"
            value={formData?.dataFields?.element_selector || ''}
            onChange={handleChangeNumberSecond}
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="element_selector"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
            sx={{
              mt: 2,
            }}
          />
          <FormControlLabel
            name="selector_switch"
            control={<Checkbox checked={formData?.dataFields?.selector_switch || false} />}
            onChange={handleChangeNumberSecond}
            label="Wait for selector"
            sx={{
              width: 'fit-content',
            }}
          />
          {formData?.dataFields?.selector_switch && (
            <TextField
              fullWidth
              label="Selector timeout (ms)"
              name="selector_timeout"
              value={formData?.dataFields?.selector_timeout ?? 0}
              onChange={handleChangeNumberSecond}
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="selector_timeout"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          )}
        </Stack>
        <Stack spacing={1}>
          <TextField
            label="Max data to loop (0 to disable)"
            name="max_loop"
            value={formData?.dataFields?.max_loop ?? 0}
            onChange={handleChangeNumberSecond}
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="max_loop"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
          <FormControlLabel
            name="reverse_order"
            control={<Checkbox checked={formData?.dataFields?.reverse_order || false} />}
            onChange={handleChangeNumberSecond}
            label="Reverse loop order"
            sx={{
              width: 'fit-content',
            }}
          />
        </Stack>
      </Stack>
      <Stack spacing={1} mt={2}>
        <Divider />
        <Typography
          variant="body2"
          sx={{
            mb: 1,
          }}
          color="text.secondary"
        >
          Load more elements
        </Typography>
        <TextField
          select
          fullWidth
          name="action"
          label="Action"
          value={formData?.dataFields?.action || 'none'}
          onChange={handleChangeNumberSecond}
        >
          <MenuItem value="none">None</MenuItem>
          <MenuItem value="click_element">Click an element</MenuItem>
          <MenuItem value="click_link">Click a link</MenuItem>
          <MenuItem value="scroll_down">Scroll down</MenuItem>
          <MenuItem value="scroll_up">Scroll up</MenuItem>
        </TextField>
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

LoopElementForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
