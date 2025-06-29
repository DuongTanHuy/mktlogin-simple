import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import { Checkbox, FormControlLabel, IconButton, MenuItem, alpha } from '@mui/material';
import Iconify from 'src/components/iconify';
import { isElectron } from 'src/utils/commom';
import { useRef } from 'react';

// ----------------------------------------------------------------------

export default function UploadFileForm({ formData, IdNode }) {
  const variableModal = useBoolean();
  const inputRef = useRef(null);

  const handleChangeNumberSecond = (event) => {
    const { name, value, type, checked } = event.target;
    eventBus.emit('updateNode', {
      data: {
        [name]: type === 'checkbox' ? checked : value,
        ...(name === 'is_upload_folder' && {
          path: '',
        }),
      },
      idNode: IdNode,
    });
  };

  const getVariable = (name, item) => {
    let finalValue = '';
    if (name === 'path') {
      const { selectionStart, selectionEnd } = inputRef.current;
      if (
        // selectionStart &&
        // selectionEnd &&
        selectionStart >= 0 &&
        selectionEnd <= formData?.dataFields?.path.length &&
        selectionStart <= selectionEnd
      ) {
        finalValue = `${formData?.dataFields?.path.slice(0, selectionStart)}\${${
          item.key
        }}${formData?.dataFields?.path.slice(selectionEnd)}`;
      } else {
        finalValue = `${formData?.dataFields?.path}\${${item.key}}`;
      }
    } else {
      finalValue = `\${${item.key}}`;
    }
    eventBus.emit('updateNode', { data: { [name]: finalValue }, idNode: IdNode });
  };

  const selectFolder = async (event) => {
    if (isElectron()) {
      const path_file = await window.ipcRenderer.invoke('open-directory-dialog');
      if (path_file)
        eventBus.emit('updateNode', {
          data: { path: path_file.replace(/\\/g, '/') },
          idNode: IdNode,
        });
    }
  };

  const selectGoogleCreden = async (event) => {
    if (isElectron()) {
      const file = event.target.files[0];
      const path = (isElectron() ? file?.path || '' : file?.name || '').replace(/\\/g, '/');
      eventBus.emit('updateNode', {
        data: { path },
        idNode: IdNode,
      });
    }
    event.target.value = null;
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
      <Stack spacing={2} mt={2}>
        <TextField
          select
          fullWidth
          name="selector_type"
          label="Loại bộ chọn"
          value={formData?.dataFields?.selector_type ?? 'xpath'}
          onChange={handleChangeNumberSecond}
        >
          {[
            { label: 'Xpath', value: 'xpath' },
            { label: 'CSS', value: 'css' },
          ].map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
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
          sx={{
            mt: 1,
          }}
        />

        <FormControlLabel
          name="is_upload_folder"
          control={<Checkbox checked={formData?.dataFields?.is_upload_folder ?? false} />}
          onChange={handleChangeNumberSecond}
          label="Tải tệp trong thư mục"
          sx={{
            width: 'fit-content',
          }}
        />

        {formData?.dataFields?.is_upload_folder ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                inputRef={inputRef}
                fullWidth
                onChange={handleChangeNumberSecond}
                value={formData?.dataFields?.path ?? ''}
                name="path"
                label="Đường dẫn thư mục"
                InputProps={{
                  endAdornment: (
                    <PositionedMenu
                      name="path"
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

            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.num_file ?? ''}
              name="num_file"
              label="Số lượng tệp tải lên"
              helperText="Nếu không nhập số lượng tệp thì sẽ tải lên tất cả các tệp trong thư mục, nếu có sẽ tải lên ngẫu theo số lượng tệp"
              sx={{
                '& .MuiFormHelperText-root': {
                  fontStyle: 'italic',
                  mb: 0.5,
                  fontSize: '14px',
                },
              }}
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="num_file"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </Stack>
        ) : (
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <TextField
              inputRef={inputRef}
              fullWidth
              type="text"
              name="path"
              value={formData?.dataFields?.path ?? ''}
              onChange={handleChangeNumberSecond}
              label="Đường dẫn tệp"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="path"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <IconButton
              variant="outlined"
              component="label"
              sx={{
                width: 53,
                aspectRatio: 1,
                borderRadius: 1,
                border: '1px dashed',
                borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
              }}
            >
              <Iconify icon="material-symbols:upload" width={28} />
              <input type="file" hidden onChange={(event) => selectGoogleCreden(event)} />
            </IconButton>
          </Stack>
        )}

        <FormControlLabel
          name="is_upload_by_dialog"
          control={<Checkbox checked={formData?.dataFields?.is_upload_by_dialog ?? false} />}
          onChange={handleChangeNumberSecond}
          label="Tải lên bằng dialog"
          sx={{
            width: 'fit-content',
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
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

UploadFileForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
