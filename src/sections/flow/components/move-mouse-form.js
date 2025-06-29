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
import { useRef } from 'react';

// ----------------------------------------------------------------------

export default function MoveMouseForm({ formData, IdNode }) {
  const variableModal = useBoolean();
  const inputRef = useRef(null);

  const handleChangeNumberSecond = (event) => {
    const { name, value } = event.target;
    eventBus.emit('updateNode', { data: { [name]: value }, idNode: IdNode });
  };

  const getVariable = (name, item) => {
    let finalValue = '';
    if (name === 'selector') {
      const { selectionStart, selectionEnd } = inputRef.current;
      if (
        selectionStart >= 0 &&
        selectionEnd <= formData?.dataFields?.selector.length &&
        selectionStart <= selectionEnd
      ) {
        finalValue = `${formData?.dataFields?.selector.slice(0, selectionStart)}\${${
          item.key
        }}${formData?.dataFields?.selector.slice(selectionEnd)}`;
      } else {
        finalValue = `${formData?.dataFields?.selector}\${${item.key}}`;
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
          select
          fullWidth
          name="target"
          label="Đích di chuyển"
          value={formData?.dataFields?.target || 'element'}
          onChange={handleChangeNumberSecond}
        >
          {[
            { label: 'Phần tử', value: 'element' },
            { label: 'Tọa độ', value: 'coordinates' },
          ].map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
        {formData?.dataFields?.target === 'element' && (
          <>
            <TextField
              select
              fullWidth
              name="selector_type"
              label="Loại bộ chọn"
              value={formData?.dataFields?.selector_type || 'xpath'}
              onChange={handleChangeNumberSecond}
            >
              {[
                { label: 'CSS', value: 'css' },
                { label: 'Xpath', value: 'xpath' },
              ].map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              inputRef={inputRef}
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.selector ?? ''}
              name="selector"
              label="Bộ chọn của phần tử"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="selector"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.timeout ?? 10}
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
          </>
        )}
        {formData?.dataFields?.target === 'coordinates' && (
          <Stack direction="row" spacing={3} alignItems="center">
            <TextField
              fullWidth
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.x_coordinates ?? 0}
              name="x_coordinates"
              label="Tọa độ X"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="x_coordinates"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <TextField
              fullWidth
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.y_coordinates ?? 0}
              name="y_coordinates"
              label="Tọa độ Y"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="y_coordinates"
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

MoveMouseForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
