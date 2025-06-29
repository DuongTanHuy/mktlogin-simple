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
import { useRef } from 'react';

// ----------------------------------------------------------------------

export default function DeleteFileForm({ formData, IdNode }) {
  const variableModal = useBoolean();
  const inputRef = useRef(null);

  const handleChangeNumberSecond = (event) => {
    const { name, value } = event.target;
    eventBus.emit('updateNode', { data: { [name]: value }, idNode: IdNode });
  };

  const getVariable = (name, item) => {
    let finalValue = '';
    const { selectionStart, selectionEnd } = inputRef.current;
    if (
      // selectionStart &&
      // selectionEnd &&
      selectionStart >= 0 &&
      selectionEnd <= formData?.dataFields?.file_path.length &&
      selectionStart <= selectionEnd
    ) {
      finalValue = `${formData?.dataFields?.file_path.slice(0, selectionStart)}\${${
        item.key
      }}${formData?.dataFields?.file_path.slice(selectionEnd)}`;
    } else {
      finalValue = `${formData?.dataFields?.file_path}\${${item.key}}`;
    }
    eventBus.emit('updateNode', { data: { [name]: finalValue }, idNode: IdNode });
  };

  const selectGoogleCreden = async (event) => {
    if (isElectron()) {
      const file = event.target.files[0];
      const file_path = (isElectron() ? file?.path || '' : file?.name || '').replace(/\\/g, '/');
      eventBus.emit('updateNode', {
        data: { file_path },
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
      <Stack direction="row" justifyContent="space-between" spacing={2} mt={2}>
        <TextField
          inputRef={inputRef}
          fullWidth
          type="text"
          name="file_path"
          value={formData?.dataFields?.file_path || ''}
          onChange={handleChangeNumberSecond}
          label="Đường dẫn tệp"
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="file_path"
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
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

DeleteFileForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
