import PropTypes from 'prop-types';
import { useRef } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import eventBus from 'src/sections/script/event-bus';
import PositionedMenu from 'src/components/list-click';
import { useBoolean } from 'src/hooks/use-boolean';
import Variables from 'src/components/variable';
import { MenuItem } from '@mui/material';

// ----------------------------------------------------------------------

export default function OpenTabForm({ formData, IdNode }) {
  const variableModal = useBoolean();
  const inputRef = useRef(null);

  const handleChangeNumberSecond = (event) => {
    const { name, value } = event.target;
    eventBus.emit('updateNode', { data: { [name]: value }, idNode: IdNode });
  };

  const getVariable = (name, item) => {
    let finalValue = '';
    if (name === 'url') {
      const { selectionStart, selectionEnd } = inputRef.current;
      if (
        // selectionStart &&
        // selectionEnd &&
        selectionStart >= 0 &&
        selectionEnd <= formData?.dataFields?.url.length &&
        selectionStart <= selectionEnd
      ) {
        finalValue = `${formData?.dataFields?.url.slice(0, selectionStart)}\${${
          item.key
        }}${formData?.dataFields?.url.slice(selectionEnd)}`;
      } else {
        finalValue = `${formData?.dataFields?.url}\${${item.key}}`;
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
          name="url"
          label="Địa chỉ URL"
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.url || ''}
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="url"
                getVariable={getVariable}
                openVariableModal={variableModal.onTrue}
              />
            ),
          }}
        />
        <TextField
          select
          fullWidth
          name="mo_url"
          label="Đợi đến khi sự kiện được kích hoạt"
          value={formData?.dataFields?.mo_url || 'domcontentloaded'}
          onChange={handleChangeNumberSecond}
        >
          {[
            { label: 'Load', value: 'load' },
            { label: 'Dom Content Loaded', value: 'domcontentloaded' },
            { label: 'Networkidle0', value: 'networkidle0' },
            { label: 'Networkidle2', value: 'networkidle2' },
          ].map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
        <Stack spacing={1}>
          <TextField
            type="text"
            name="timeout"
            label="Thời gian chờ tối đa (số giây)"
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.timeout ?? ''}
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
          <Typography variant="caption" fontStyle="italic" color="text.secondary" fontSize={14}>
            * Thời gian chờ mặc định 0 là chờ đến khi trang được tải.
          </Typography>
        </Stack>
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

OpenTabForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
