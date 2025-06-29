import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import { Autocomplete, Button, Checkbox, FormControlLabel, IconButton, alpha } from '@mui/material';
import { Fragment, useMemo } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import PositionedMenu from 'src/components/list-click';
import { isElectron } from 'src/utils/commom';

// ----------------------------------------------------------------------

export default function ReadFolderForm({ formData, IdNode }) {
  const dataVariableModal = useBoolean();
  const { variableFlow } = useAuthContext();
  const variableModal = useBoolean();

  const handleChangeNumberSecond = (event) => {
    const { name, value, type, checked } = event.target;
    eventBus.emit('updateNode', {
      data: { [name]: type === 'checkbox' ? checked : value },
      idNode: IdNode,
    });
  };

  const getVariable = (name, item) => {
    eventBus.emit('updateNode', { data: { [name]: `\${${item.key}}` }, idNode: IdNode });
  };

  const fetchVariables = useMemo(() => {
    if (variableFlow?.list === null || variableFlow?.list?.length === 0) return [];

    return variableFlow?.list.map((i, index) => ({
      ...i,
      lastItem: index + 1 === variableFlow.list.length,
    }));
  }, [variableFlow?.list]);

  const selectFolder = async (event) => {
    if (isElectron()) {
      const path_file = await window.ipcRenderer.invoke('open-directory-dialog');
      if (path_file)
        eventBus.emit('updateNode', {
          data: { folder_path: path_file.replace(/\\/g, '/') },
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
      <Stack spacing={2} mt={2}>
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.folder_path ?? ''}
            name="folder_path"
            label="Đường dẫn thư mục"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="folder_path"
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

        <FormControlLabel
          name="include_subdirectories"
          control={<Checkbox checked={formData?.dataFields?.include_subdirectories ?? true} />}
          onChange={handleChangeNumberSecond}
          label="Bao gồm thư mục con"
          sx={{
            width: 'fit-content',
          }}
        />

        <Autocomplete
          name="variable_name"
          id="combo-box-demo"
          onChange={(_, newValue) => {
            eventBus.emit('updateNode', {
              data: { variable_name: newValue?.key },
              idNode: IdNode,
            });
          }}
          value={formData?.dataFields?.variable_name || null}
          getOptionLabel={(option) => option.key || option || ''}
          options={fetchVariables || []}
          isOptionEqualToValue={(option, value) => option.key === value}
          renderInput={(params) => <TextField label="Biến nhận dữ liệu" {...params} />}
          renderOption={(props, option) => (
            <Fragment key={option.id}>
              <Stack component="li" {...props} direction="row" justifyContent="flex-start">
                {option.key}
              </Stack>
              <Stack className="add-new-element-variable" p={1}>
                <Button
                  variant="outlined"
                  size="small"
                  width="100px"
                  onClick={() => {
                    dataVariableModal.onTrue();
                  }}
                  startIcon={<Iconify icon="ion:create-outline" width={16} />}
                >
                  Tạo biến mới
                </Button>
              </Stack>
            </Fragment>
          )}
          noOptionsText={
            <Stack spacing={1}>
              <Typography variant="body2">No options</Typography>
              <Button
                variant="outlined"
                size="small"
                width="100px"
                onClick={() => {
                  dataVariableModal.onTrue();
                }}
                startIcon={<Iconify icon="ion:create-outline" />}
              >
                Tạo biến mới
              </Button>
            </Stack>
          }
        />
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
      <Variables
        addOne
        open={dataVariableModal.value}
        onClose={dataVariableModal.onFalse}
        updateVariableAction={(key) => {
          eventBus.emit('updateNode', { data: { variable_name: key }, idNode: IdNode });
        }}
      />
    </Stack>
  );
}

ReadFolderForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
