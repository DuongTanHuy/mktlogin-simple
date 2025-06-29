import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

// components
import eventBus from 'src/sections/script/event-bus';
import { useBoolean } from 'src/hooks/use-boolean';
import Variables from 'src/components/variable';
import PositionedMenu from 'src/components/list-click';
import { Input, Slider } from '@mui/material';
import Iconify from 'src/components/iconify';
import { useRef } from 'react';

// ----------------------------------------------------------------------

export default function ScrollMouseForm({ formData, IdNode }) {
  const { dataFields } = formData;
  const variableModal = useBoolean();
  const inputRef = useRef(null);

  const handleChangeNumberSecond = (event) => {
    const { name, value } = event.target;
    eventBus.emit('updateNode', { data: { [name]: value }, idNode: IdNode });
  };

  const handleSliderChange = (_, newValue) => {
    eventBus.emit('updateNode', { data: { speed: newValue }, idNode: IdNode });
  };

  const handleInputChange = (event) => {
    eventBus.emit('updateNode', {
      data: { speed: event.target.value === '' ? 0 : Number(event.target.value) },
      idNode: IdNode,
    });
  };

  const handleBlur = () => {
    if (dataFields?.speed < 0) {
      eventBus.emit('updateNode', {
        data: { speed: 0 },
        idNode: IdNode,
      });
    } else if (dataFields?.speed > 10) {
      eventBus.emit('updateNode', {
        data: { speed: 10 },
        idNode: IdNode,
      });
    }
  };

  const getVariable = (name, item) => {
    let finalValue = '';
    if (name === 'element_selector') {
      const { selectionStart, selectionEnd } = inputRef.current;
      if (
        selectionStart >= 0 &&
        selectionEnd <= formData?.dataFields?.element_selector.length &&
        selectionStart <= selectionEnd
      ) {
        finalValue = `${formData?.dataFields?.element_selector.slice(0, selectionStart)}\${${
          item.key
        }}${formData?.dataFields?.element_selector.slice(selectionEnd)}`;
      } else {
        finalValue = `${formData?.dataFields?.element_selector}\${${item.key}}`;
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
          name="scroll_type"
          label="Cuộn chuột theo"
          onChange={handleChangeNumberSecond}
          value={dataFields?.scroll_type || 'coordinates'}
        >
          <MenuItem value="coordinates">Tọa độ</MenuItem>
          <MenuItem value="css_selector">Css selector</MenuItem>
          <MenuItem value="xpath">XPath</MenuItem>
        </TextField>
        {dataFields?.scroll_type !== 'coordinates' && (
          <Stack spacing={3}>
            <TextField
              inputRef={inputRef}
              value={dataFields?.element_selector || ''}
              onChange={handleChangeNumberSecond}
              name="element_selector"
              label="Bộ chọn phần tử"
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
              value={dataFields?.timeout ?? 30}
              onChange={handleChangeNumberSecond}
              name="timeout"
              label="Thời gian chờ tìm phần tử tối đa (số giây)"
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
        )}
        {dataFields?.scroll_type === 'coordinates' && (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
              <TextField
                select
                fullWidth
                onChange={handleChangeNumberSecond}
                name="direction"
                label="Hướng cuộn"
                value={dataFields?.direction || 'down'}
                style={{ width: '100%' }}
              >
                <MenuItem value="down">Cuộn xuống</MenuItem>
                <MenuItem value="up">Cuộn lên</MenuItem>
              </TextField>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <TextField
                fullWidth
                onChange={handleChangeNumberSecond}
                name="x_coordinates"
                label="Tọa độ X"
                value={dataFields?.x_coordinates ?? 0}
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
                name="y_coordinates"
                label="Tọa độ Y"
                value={dataFields?.y_coordinates ?? 0}
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

            <Stack spacing={0.5}>
              <Typography>Tốc độ cuộn</Typography>
              <Stack direction="row" spacing={2} alignItems="center" mx={0.5}>
                <Iconify icon="line-md:speed" width={24} color="text.secondary" />
                <Slider
                  name="speed"
                  value={dataFields?.speed ?? 5}
                  onChange={handleSliderChange}
                  marks
                  step={1}
                  min={1}
                  max={10}
                />
                <Input
                  value={dataFields?.speed ?? 5}
                  size="small"
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  inputProps={{
                    step: 1,
                    min: 1,
                    max: 10,
                    type: 'number',
                    'aria-labelledby': 'input-slider',
                  }}
                />
              </Stack>
            </Stack>
          </>
        )}
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

ScrollMouseForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
