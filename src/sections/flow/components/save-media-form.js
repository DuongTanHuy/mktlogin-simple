import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import { IconButton, MenuItem, alpha } from '@mui/material';
import Iconify from 'src/components/iconify';
import { isElectron } from 'src/utils/commom';
import { useRef } from 'react';

// ----------------------------------------------------------------------

export default function SaveMediaForm({ formData, IdNode }) {
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

  const selectFolder = async (event) => {
    if (isElectron()) {
      const path_file = await window.ipcRenderer.invoke('open-directory-dialog');
      if (path_file) {
        eventBus.emit('updateNode', {
          data: { output_path: path_file.replace(/\\/g, '/') },
          idNode: IdNode,
        });
      }
    }
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
          name="media_type"
          label="Media lấy từ"
          value={formData?.dataFields?.media_type ?? ''}
          onChange={handleChangeNumberSecond}
        >
          <MenuItem value="url">URL</MenuItem>
          <MenuItem value="element">Phần tử</MenuItem>
        </TextField>

        {formData?.dataFields?.media_type === 'url' && (
          <TextField
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.url_string || ''}
            name="url_string"
            label="URL chứa Media"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="url_string"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        {formData?.dataFields?.media_type === 'element' && (
          <>
            <TextField
              select
              fullWidth
              name="selector_type"
              label="Loại bộ chọn"
              value={formData?.dataFields?.selector_type ?? 'xpath'}
              onChange={handleChangeNumberSecond}
            >
              <MenuItem value="css">CSS</MenuItem>
              <MenuItem value="xpath">XPATH</MenuItem>
            </TextField>
            <TextField
              inputRef={inputRef}
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.selector ?? ''}
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

            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.timeout ?? 30}
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
          </>
        )}
        <TextField
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.file_name || ''}
          name="file_name"
          label="Tên tệp (Tùy chọn)"
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="file_name"
                getVariable={getVariable}
                openVariableModal={variableModal.onTrue}
              />
            ),
          }}
        />
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.output_path ?? ''}
            name="output_path"
            label="Đường dẫn lưu trữ"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="output_path"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />

          <IconButton
            sx={{
              width: 53,
              aspectRatio: 1,
              borderRadius: 1,
              border: '1px dashed',
              borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
            }}
            onClick={selectFolder}
          >
            <Iconify icon="material-symbols:upload" width={28} />
          </IconButton>
        </Stack>
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

SaveMediaForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
