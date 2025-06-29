import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import { Autocomplete, Button, Checkbox, FormControlLabel, MenuItem } from '@mui/material';
import PositionedMenu from 'src/components/list-click';
import { useAuthContext } from 'src/auth/hooks';
import { Fragment, useMemo } from 'react';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function RandomForm({ formData, IdNode }) {
  const variableModal = useBoolean();
  const { variableFlow } = useAuthContext();
  const dataVariableModal = useBoolean();

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
          name="random_type"
          value={formData?.dataFields?.random_type || 'number'}
          onChange={handleChangeNumberSecond}
          label="Loại dữ liệu"
        >
          <MenuItem value="number">Số</MenuItem>
          <MenuItem value="string">Chuỗi ký tự</MenuItem>
        </TextField>

        {formData?.dataFields?.random_type === 'number' ? (
          <Stack direction="row" spacing={3}>
            <TextField
              fullWidth
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.min ?? 0}
              name="min"
              label="Số tối thiểu"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="min"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />

            <TextField
              fullWidth
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.max ?? 10}
              name="max"
              label="Số tối đa"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="max"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </Stack>
        ) : (
          <>
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.length ?? 10}
              name="length"
              label="Độ dài"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="length"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <Stack direction="row" alignItems="center" spacing={3}>
              <FormControlLabel
                name="has_upper_case"
                control={<Checkbox checked={formData?.dataFields?.has_upper_case ?? true} />}
                onChange={handleChangeNumberSecond}
                label="A-Z"
                sx={{
                  width: 'fit-content',
                }}
              />
              <FormControlLabel
                name="has_lower_case"
                control={<Checkbox checked={formData?.dataFields?.has_lower_case ?? true} />}
                onChange={handleChangeNumberSecond}
                label="a-z"
                sx={{
                  width: 'fit-content',
                }}
              />
              <FormControlLabel
                name="has_number"
                control={<Checkbox checked={formData?.dataFields?.has_number ?? true} />}
                onChange={handleChangeNumberSecond}
                label="0-9"
                sx={{
                  width: 'fit-content',
                }}
              />
              <FormControlLabel
                name="has_special"
                control={<Checkbox checked={formData?.dataFields?.has_special ?? false} />}
                onChange={handleChangeNumberSecond}
                label="Ký tự đặc biệt"
                sx={{
                  width: 'fit-content',
                }}
              />
            </Stack>
          </>
        )}

        <Autocomplete
          name="variable_name"
          id="combo-box-demo"
          // ListboxProps={{
          //   style: {
          //     maxHeight: 200,
          //     overflow: 'auto',
          //   },
          // }}
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

RandomForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
