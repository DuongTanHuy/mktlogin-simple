import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import { Autocomplete, Button, Checkbox, FormControlLabel, MenuItem } from '@mui/material';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import PositionedMenu from 'src/components/list-click';
import { debounce } from 'lodash';

// ----------------------------------------------------------------------

export function transformObject(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {});
}

export default function ClipboardForm({ formData, IdNode }) {
  const dataVariableModal = useBoolean();
  const variableModal = useBoolean();
  const { variableFlow } = useAuthContext();
  const [text, setText] = useState(formData?.dataFields?.text || '');
  const [focusField, setFocusField] = useState(false);

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

  const getVariable = (name, item) => {
    eventBus.emit('updateNode', { data: { [name]: `\${${item.key}}` }, idNode: IdNode });
    if (name === 'text') {
      document.getElementById(name).value = `\${${item.key}}`;
      setText(`\${${item.key}}`);
    }
  };

  useEffect(
    () => () => {
      eventBus.emit('updateNode', { data: { text }, idNode: IdNode });
    },
    [IdNode, text]
  );

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
          name="action_type"
          value={formData?.dataFields?.action_type || 'get'}
          onChange={handleChangeNumberSecond}
        >
          <MenuItem value="get">Lấy dữ liệu</MenuItem>
          <MenuItem value="insert">Thêm dữ liệu vào</MenuItem>
        </TextField>

        {formData?.dataFields?.action_type === 'get' ? (
          <>
            <FormControlLabel
              name="assign_variable"
              control={<Checkbox checked={formData?.dataFields?.assign_variable ?? false} />}
              onChange={handleChangeNumberSecond}
              label="Biến nhận dữ liệu"
              sx={{
                width: 'fit-content',
              }}
            />
            {formData?.dataFields?.assign_variable && (
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
            )}
          </>
        ) : (
          <>
            {!formData?.dataFields?.is_from_selection && (
              <TextField
                id="text"
                multiline
                rows={4}
                InputLabelProps={{ shrink: !!text || focusField }}
                onFocus={() => setFocusField(true)}
                onBlur={() => setFocusField(false)}
                defaultValue={formData?.dataFields?.text ?? ''}
                onChange={debounce((event) => setText(event.target.value), 200)}
                name="text"
                label="Text"
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
            )}
            <FormControlLabel
              name="is_from_selection"
              control={<Checkbox checked={formData?.dataFields?.is_from_selection ?? false} />}
              onChange={handleChangeNumberSecond}
              label="Sử dụng văn bản được bôi đen trên trang"
              sx={{
                width: 'fit-content',
                // '& .MuiButtonBase-root': {
                //   padding: '2px',
                //   ml: 1,
                // },
              }}
            />
          </>
        )}
      </Stack>
      <Variables
        addOne
        open={dataVariableModal.value}
        onClose={dataVariableModal.onFalse}
        updateVariableAction={(key) => {
          eventBus.emit('updateNode', { data: { variable_name: key }, idNode: IdNode });
        }}
      />
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

ClipboardForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
