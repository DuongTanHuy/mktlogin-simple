import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import eventBus from 'src/sections/script/event-bus';
import { useBoolean } from 'src/hooks/use-boolean';
import Variables from 'src/components/variable';
import PositionedMenu from 'src/components/list-click';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useRef } from 'react';

// ----------------------------------------------------------------------

export default function ClickMouseForm({ formData, IdNode }) {
  const { dataFields } = formData;
  const variableModal = useBoolean();
  const inputRef = useRef(null);

  const handleChangeNumberSecond = (event) => {
    const { name, value, type, checked } = event.target;
    eventBus.emit('updateNode', {
      data: { [name]: type === 'checkbox' ? checked : value },
      idNode: IdNode,
    });
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
          fontSize: 14,
          fontStyle: 'italic',
        }}
        px={3}
        color="text.secondary"
      >
        {formData?.description}
      </Typography>
      <Stack spacing={3} mt={2}>
        <TextField
          select
          fullWidth
          name="mode"
          label="Chế độ"
          onChange={handleChangeNumberSecond}
          value={dataFields?.mode || 'normal'}
        >
          <MenuItem value="normal">Nhấp chuột</MenuItem>
          <MenuItem value="press_hold">Nhấn giữ</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          name="button"
          label="Nút nhấn"
          onChange={handleChangeNumberSecond}
          value={dataFields?.button || 'left'}
        >
          <MenuItem value="left">Trái</MenuItem>
          <MenuItem value="middle">Giữa</MenuItem>
          <MenuItem value="right">Phải</MenuItem>
        </TextField>

        {dataFields?.mode === 'press_hold' && (
          <Stack spacing={2}>
            <TextField
              name="press_time"
              label="Thời gian nhấn giữ (số giây)"
              onChange={handleChangeNumberSecond}
              value={dataFields?.press_time ?? 0}
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="press_time"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />

            <FormControlLabel
              name="is_click_on_element"
              control={<Checkbox checked={formData?.dataFields?.is_click_on_element ?? false} />}
              onChange={handleChangeNumberSecond}
              label="Nhấn trên phần tử"
              sx={{
                width: 'fit-content',
              }}
            />

            {formData?.dataFields?.is_click_on_element && (
              <Stack spacing={3}>
                <TextField
                  select
                  fullWidth
                  name="select_by"
                  label="Kiểu chọn"
                  onChange={handleChangeNumberSecond}
                  value={dataFields?.select_by || 'selector'}
                >
                  <MenuItem value="selector">Bộ chọn</MenuItem>
                  <MenuItem value="coordinates">Tọa độ</MenuItem>
                </TextField>
                {dataFields?.select_by === 'selector' && (
                  <Stack spacing={3}>
                    <TextField
                      select
                      fullWidth
                      name="selector_type"
                      label="Loại bộ chọn"
                      onChange={handleChangeNumberSecond}
                      value={dataFields?.selector_type || 'css'}
                    >
                      <MenuItem value="css">Css</MenuItem>
                      <MenuItem value="xpath">Xpath</MenuItem>
                    </TextField>
                    <TextField
                      name="selector"
                      label="Bộ chọn của phần tử"
                      onChange={handleChangeNumberSecond}
                      value={dataFields?.selector || ''}
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
                      name="timeout"
                      label="Thời gian chờ tối đa (số giây)"
                      onChange={handleChangeNumberSecond}
                      value={dataFields?.timeout || 10}
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
                {dataFields?.select_by === 'coordinates' && (
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={3}
                  >
                    <TextField
                      fullWidth
                      name="x_coordinates"
                      label="Tọa độ X"
                      onChange={handleChangeNumberSecond}
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
                      name="y_coordinates"
                      label="Tọa độ Y"
                      onChange={handleChangeNumberSecond}
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
                )}
              </Stack>
            )}
          </Stack>
        )}

        {dataFields?.mode === 'normal' && (
          <Stack spacing={3}>
            <TextField
              select
              fullWidth
              name="select_by"
              label="Kiểu chọn"
              onChange={handleChangeNumberSecond}
              value={dataFields?.select_by || 'selector'}
            >
              <MenuItem value="selector">Bộ chọn</MenuItem>
              <MenuItem value="coordinates">Tọa độ</MenuItem>
            </TextField>
            {dataFields?.select_by === 'selector' && (
              <Stack spacing={3}>
                <TextField
                  select
                  fullWidth
                  name="selector_type"
                  label="Loại bộ chọn"
                  onChange={handleChangeNumberSecond}
                  value={dataFields?.selector_type || 'css'}
                >
                  <MenuItem value="css">Css</MenuItem>
                  <MenuItem value="xpath">Xpath</MenuItem>
                </TextField>
                <TextField
                  inputRef={inputRef}
                  name="selector"
                  label="Bộ chọn của phần tử"
                  onChange={handleChangeNumberSecond}
                  value={dataFields?.selector || ''}
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
                  name="timeout"
                  label="Thời gian chờ tối đa (số giây)"
                  onChange={handleChangeNumberSecond}
                  value={dataFields?.timeout ?? 10}
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
            {dataFields?.select_by === 'coordinates' && (
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
                <TextField
                  fullWidth
                  name="x_coordinates"
                  label="Tọa độ X"
                  onChange={handleChangeNumberSecond}
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
                  name="y_coordinates"
                  label="Tọa độ Y"
                  onChange={handleChangeNumberSecond}
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
            )}
          </Stack>
        )}
      </Stack>

      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

ClickMouseForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
