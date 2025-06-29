import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import { Autocomplete, Button, MenuItem } from '@mui/material';
import { Fragment, useMemo } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function GetTimeForm({ formData, IdNode }) {
  const dataVariableModal = useBoolean();
  const { variableFlow } = useAuthContext();

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
          name="format_return"
          label="Định dạng trả về"
          value={formData?.dataFields?.format_return ?? ''}
          onChange={handleChangeNumberSecond}
        >
          {[
            {
              id: 1,
              label: 'Timestamp',
              value: 'timestamp',
            },
            {
              id: 2,
              label: 'DD/MM/YYYY',
              value: 'DD_MM_YYYY',
            },
            {
              id: 3,
              label: 'DD/MM/YYYY HH:mm:ss',
              value: 'DD_MM_YYYY_HH_mm_ss',
            },
            {
              id: 4,
              label: 'YYYY-MM-DD',
              value: 'YYYY_MM_DD',
            },
            {
              id: 5,
              label: 'YYYY-MM-DD HH:mm:ss',
              value: 'YYYY_MM_DD_HH_mm_ss',
            },
            {
              id: 6,
              label: 'HH:mm:ss',
              value: 'HH_mm_ss',
            },
          ].map((item) => (
            <MenuItem value={item.value} key={item.id}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>

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

GetTimeForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
