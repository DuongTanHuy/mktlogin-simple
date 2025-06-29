import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import { IconButton, alpha } from '@mui/material';
import Iconify from 'src/components/iconify';
import { isElectron } from 'src/utils/commom';

// ----------------------------------------------------------------------

export default function ScreenshotForm({ formData, IdNode }) {
  const variableModal = useBoolean();

  const handleChangeNumberSecond = (event) => {
    const { name, value } = event.target;
    eventBus.emit('updateNode', { data: { [name]: value }, idNode: IdNode });
  };

  const getVariable = (name, item) => {
    eventBus.emit('updateNode', { data: { [name]: `\${${item.key}}` }, idNode: IdNode });
  };

  const selectFolder = async (event) => {
    if (isElectron()) {
      const path_file = await window.ipcRenderer.invoke('open-directory-dialog');
      eventBus.emit('updateNode', {
        data: { folder_output: path_file.replace(/\\/g, '/') },
        idNode: IdNode,
      });
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
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.file_name || ''}
          name="file_name"
          label="Tên tệp ảnh"
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

        <Stack direction="row" spacing={3}>
          <TextField
            fullWidth
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.folder_output || ''}
            name="folder_output"
            label="Đường dẫn lưu trữ"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="folder_output"
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

ScreenshotForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
