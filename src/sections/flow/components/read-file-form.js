import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  alpha,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { isElectron } from 'src/utils/commom';
import { Fragment, useMemo, useRef } from 'react';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function ReadFileForm({ formData, IdNode }) {
  const variableModal = useBoolean();
  const dataVariableModal = useBoolean();
  const inputRef = useRef(null);
  const { variableFlow } = useAuthContext();

  const fetchVariables = useMemo(() => {
    if (variableFlow?.list === null || variableFlow?.list?.length === 0) return [];

    return variableFlow?.list.map((i, index) => ({
      ...i,
      lastItem: index + 1 === variableFlow.list.length,
    }));
  }, [variableFlow?.list]);

  const handleChangeNumberSecond = (event) => {
    const { name, value, type, checked } = event.target;
    eventBus.emit('updateNode', {
      data: { [name]: type === 'checkbox' ? checked : value },
      idNode: IdNode,
    });
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
      <Stack spacing={3} mt={2}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
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
            <input
              type="file"
              accept=".txt"
              hidden
              onChange={(event) => selectGoogleCreden(event)}
            />
          </IconButton>
        </Stack>

        <TextField
          select
          fullWidth
          name="mode"
          label="Chế độ đọc"
          value={formData?.dataFields?.mode ?? 'one_line'}
          onChange={handleChangeNumberSecond}
        >
          {[
            { label: 'Đọc một dòng', value: 'one_line' },
            { label: 'Đọc tất cả', value: 'all_line' },
          ].map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>

        {formData?.dataFields?.mode === 'one_line' && (
          <>
            <TextField
              select
              fullWidth
              name="line_position"
              label="Vị trí đọc dòng"
              value={formData?.dataFields?.line_position ?? 'random'}
              onChange={handleChangeNumberSecond}
            >
              {[
                { label: 'Ngẫu nhiên', value: 'random' },
                { label: 'Đầu tiên', value: 'first' },
                { label: 'Cuối cùng', value: 'last' },
              ].map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              name="is_delete_after_read"
              control={<Checkbox checked={formData?.dataFields?.is_delete_after_read || false} />}
              onChange={handleChangeNumberSecond}
              label="Xóa dòng sau khi đọc"
              sx={{
                width: 'fit-content',
              }}
            />
          </>
        )}

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
                  startIcon={<Iconify icon="ion:create-outline" />}
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

ReadFileForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
