import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
} from '@mui/material';
import { Fragment, useMemo, useRef } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import PositionedMenu from 'src/components/list-click';

// ----------------------------------------------------------------------

const DATA_TYPES = [
  {
    value: 'position',
    label: 'Vị trí',
  },
  {
    value: 'size',
    label: 'Kích thước',
  },
  {
    value: 'attribute',
    label: 'Thuộc tính',
  },
];

export default function ElementDataForm({ formData, IdNode }) {
  const variableModal = useBoolean();
  const dataVariableModal = useBoolean();
  const { variableFlow } = useAuthContext();
  const inputRef = useRef(null);

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

  const handleChangeNumberSecond = (event) => {
    const { name, value, type, checked } = event.target;
    eventBus.emit('updateNode', {
      data: { [name]: type === 'checkbox' ? checked : value },
      idNode: IdNode,
    });
  };

  const fetchVariables = useMemo(() => {
    if (variableFlow?.list === null || variableFlow?.list?.length === 0) return [];

    return variableFlow?.list.map((i, index) => ({
      ...i,
      lastItem: index + 1 === variableFlow.list.length,
    }));
  }, [variableFlow?.list]);

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
          name="selector_type"
          value={formData?.dataFields?.selector_type ?? 'xpath'}
          onChange={handleChangeNumberSecond}
          label="Loại bộ chọn"
        >
          <MenuItem value="xpath">Xpath</MenuItem>
          <MenuItem value="css">CSS</MenuItem>
        </TextField>

        <TextField
          inputRef={inputRef}
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
        />

        <FormControl sx={{ width: 1 }}>
          <InputLabel id="demo-multiple-checkbox-label">Dữ liệu cần lấy</InputLabel>
          <Select
            fullWidth
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            multiple
            value={formData?.dataFields?.data_types ?? []}
            onChange={(event) => {
              const {
                target: { value },
              } = event;
              eventBus.emit('updateNode', {
                data: { data_types: typeof value === 'string' ? value.split(',') : value },
                idNode: IdNode,
              });
            }}
            input={<OutlinedInput label="Dữ liệu cần lấy" />}
            renderValue={(selected) =>
              DATA_TYPES.reduce((acc, item) => {
                if (selected.includes(item.value)) {
                  acc.push(item.label);
                }
                return acc;
              }, []).join(', ')
            }
            // MenuProps={MenuProps}
          >
            {DATA_TYPES.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                <Checkbox checked={formData?.dataFields?.data_types.includes(item.value)} />
                <ListItemText primary={item.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.data_path ?? ''}
          name="data_path"
          label="Data Path"
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="data_path"
                getVariable={getVariable}
                openVariableModal={variableModal.onTrue}
              />
            ),
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

        <TextField
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.timeout ?? 30}
          name="timeout"
          label="Thời gian chờ tìm phần tử (số giây)"
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

ElementDataForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
