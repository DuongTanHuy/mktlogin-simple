import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import eventBus from 'src/sections/script/event-bus';
import { useBoolean } from 'src/hooks/use-boolean';
import Variables from 'src/components/variable';
import PositionedMenu from 'src/components/list-click';
import { IconButton, MenuItem } from '@mui/material';
import { useRef } from 'react';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function TypingTextForm({ formData, IdNode }) {
  const { dataFields } = formData;
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
    <Stack pb={2}>
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
        <Stack spacing={1}>
          <TextField
            select
            fullWidth
            name="selector_type"
            label="Loại bộ chọn (tùy chọn)"
            value={formData?.dataFields?.selector_type ?? ''}
            onChange={handleChangeNumberSecond}
            sx={{
              '&:hover .clear-selector-type': {
                display: 'flex',
              },
            }}
            InputProps={{
              endAdornment: (
                <IconButton
                  className="clear-selector-type"
                  sx={{
                    mr: 2,
                    display: 'none',
                  }}
                  onClick={() =>
                    eventBus.emit('updateNode', {
                      data: { selector_type: '' },
                      idNode: IdNode,
                    })
                  }
                >
                  <Iconify icon="ic:round-clear" />
                </IconButton>
              ),
            }}
          >
            <MenuItem value="css">Css</MenuItem>
            <MenuItem value="xpath">Xpath</MenuItem>
          </TextField>

          <Typography variant="caption" fontStyle="italic" color="text.secondary" fontSize={14}>
            * Nếu không chọn &quot;Loại bộ chọn&quot;, ứng dụng sẽ nhập văn bản vào vị trí con trỏ
            hiện tại trên trình duyệt.
          </Typography>
        </Stack>

        {formData?.dataFields?.selector_type !== '' && (
          <TextField
            inputRef={inputRef}
            onChange={handleChangeNumberSecond}
            value={dataFields?.selector ?? ''}
            name="selector"
            label="Bộ chọn phần tử"
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
        )}
        <TextField
          multiline
          rows={4}
          onChange={handleChangeNumberSecond}
          value={dataFields?.text ?? ''}
          name="text"
          label="Văn bản"
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="text"
                getVariable={getVariable}
                openVariableModal={variableModal.onTrue}
              />
            ),
          }}
        />
        <TextField
          onChange={handleChangeNumberSecond}
          value={dataFields?.speed ?? 0.1}
          name="speed"
          label="Khoảng thời gian giữa các lần gõ (số giây)"
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="speed"
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

TypingTextForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
