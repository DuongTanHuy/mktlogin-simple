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

export default function SwitchFrameForm({ formData, IdNode }) {
  const variableModal = useBoolean();
  const inputRef = useRef(null);

  const handleChangeNumberSecond = (event) => {
    const { name, value } = event.target;
    eventBus.emit('updateNode', { data: { [name]: value }, idNode: IdNode });
  };

  const getVariable = (name, item) => {
    let finalValue = '';
    if (name === 'selector_val') {
      const { selectionStart, selectionEnd } = inputRef.current;
      if (
        selectionStart >= 0 &&
        selectionEnd <= formData?.dataFields?.selector_val.length &&
        selectionStart <= selectionEnd
      ) {
        finalValue = `${formData?.dataFields?.selector_val.slice(0, selectionStart)}\${${
          item.key
        }}${formData?.dataFields?.selector_val.slice(selectionEnd)}`;
      } else {
        finalValue = `${formData?.dataFields?.selector_val}\${${item.key}}`;
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
          name="frame_type"
          label="Loại Frame"
          value={formData?.dataFields?.frame_type || 'sub'}
          onChange={handleChangeNumberSecond}
        >
          {[
            { label: 'Frame con', value: 'sub' },
            { label: 'Frame chính', value: 'main' },
          ].map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
        {formData?.dataFields?.frame_type === 'sub' && (
          <>
            <TextField
              select
              fullWidth
              name="choose_type"
              label="Kiểu chọn"
              value={formData?.dataFields?.choose_type || 'url'}
              onChange={handleChangeNumberSecond}
            >
              {[
                { label: 'URL', value: 'url' },
                { label: 'Thứ tự', value: 'order' },
                { label: 'Bộ chọn', value: 'selector' },
              ].map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
            {formData?.dataFields?.choose_type === 'url' && (
              <TextField
                onChange={handleChangeNumberSecond}
                value={formData?.dataFields?.url_char ?? ''}
                name="url_char"
                label="Chuỗi URL"
                InputProps={{
                  endAdornment: (
                    <PositionedMenu
                      name="url_char"
                      getVariable={getVariable}
                      openVariableModal={variableModal.onTrue}
                    />
                  ),
                }}
              />
            )}
            {formData?.dataFields?.choose_type === 'order' && (
              <TextField
                onChange={handleChangeNumberSecond}
                value={formData?.dataFields?.order_val ?? 1}
                name="order_val"
                label="Số thứ tự"
                InputProps={{
                  endAdornment: (
                    <PositionedMenu
                      name="order_val"
                      getVariable={getVariable}
                      openVariableModal={variableModal.onTrue}
                    />
                  ),
                }}
              />
            )}
            {formData?.dataFields?.choose_type === 'selector' && (
              <>
                <TextField
                  select
                  fullWidth
                  name="selector_type"
                  label="Kiểu chọn"
                  value={formData?.dataFields?.selector_type || 'css'}
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
                  value={formData?.dataFields?.selector_val ?? ''}
                  name="selector_val"
                  label="Bộ chọn"
                  InputProps={{
                    endAdornment: (
                      <PositionedMenu
                        name="selector_val"
                        getVariable={getVariable}
                        openVariableModal={variableModal.onTrue}
                      />
                    ),
                  }}
                />
              </>
            )}
          </>
        )}
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

SwitchFrameForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
