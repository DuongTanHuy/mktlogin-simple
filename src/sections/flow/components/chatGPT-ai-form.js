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
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
} from '@mui/material';
import { Fragment, useEffect, useMemo, useState } from 'react';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { debounce } from 'lodash';

// ----------------------------------------------------------------------

const MODEL_OPTIONS = [
  {
    id: 1,
    label: 'GPT-3.5 Turbo',
    value: 'gpt-3.5-turbo',
  },
  {
    id: 2,
    label: 'GPT-4',
    value: 'gpt-4',
  },
  {
    id: 3,
    label: 'GPT-4 Turbo',
    value: 'gpt-4-turbo',
  },
  {
    id: 4,
    label: 'GPT-4o',
    value: 'gpt-4o',
  },
  {
    id: 5,
    label: 'GPT-4o Mini',
    value: 'gpt-4o-mini',
  },
  {
    id: 6,
    label: 'Tùy chỉnh',
    value: 'custom',
  },
];

export default function ChatGPTAiForm({ formData, IdNode }) {
  const { variableFlow } = useAuthContext();
  const variableModal = useBoolean();
  const dataVariableModal = useBoolean();
  const [data, setData] = useState({
    prompt: formData?.dataFields?.prompt ?? '',
    model_custom: formData?.dataFields?.model_custom ?? '',
  });
  const [focusField, setFocusField] = useState({
    prompt: false,
    model_custom: false,
  });

  const handleChangeNumberSecond = (event) => {
    const { name, value } = event.target;
    eventBus.emit('updateNode', { data: { [name]: value }, idNode: IdNode });
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
    if (['prompt', 'model_custom'].includes(name)) {
      document.getElementById(`${name}-gpt`).value = `\${${item.key}}`;
      setData({ ...data, [name]: `\${${item.key}}` });
    }
  };

  useEffect(
    () => () => {
      eventBus.emit('updateNode', { data: { ...data }, idNode: IdNode });
    },
    [IdNode, data]
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
          onChange={handleChangeNumberSecond}
          value={formData?.dataFields?.api_key ?? ''}
          name="api_key"
          label="API Key"
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="api_key"
                getVariable={getVariable}
                openVariableModal={variableModal.onTrue}
              />
            ),
          }}
        />

        <FormControl>
          <FormLabel>Dữ liệu trả về</FormLabel>
          <RadioGroup
            row
            name="output_type"
            value={formData?.dataFields?.output_type ?? 'text'}
            onChange={handleChangeNumberSecond}
          >
            <FormControlLabel value="text" control={<Radio />} label="Văn bản" />
            <FormControlLabel value="image" control={<Radio />} label="Hình ảnh" />
          </RadioGroup>
        </FormControl>

        {formData?.dataFields?.output_type === 'text' && (
          <>
            <TextField
              select
              fullWidth
              name="model"
              label="Model"
              value={formData?.dataFields?.model ?? 'gpt-3.5-turbo'}
              onChange={handleChangeNumberSecond}
            >
              {MODEL_OPTIONS.map((item) => (
                <MenuItem key={item.id} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>

            {formData?.dataFields?.model === 'custom' && (
              <TextField
                id="model_custom-gpt"
                InputLabelProps={{ shrink: !!data.model_custom || focusField.model_custom }}
                onFocus={() => setFocusField({ ...focusField, model_custom: true })}
                onBlur={() => setFocusField({ ...focusField, model_custom: false })}
                defaultValue={data.model_custom}
                onChange={debounce((event) => {
                  setData({ ...data, model_custom: event.target.value });
                }, 200)}
                name="model_custom"
                label="Model tùy chỉnh"
                InputProps={{
                  endAdornment: (
                    <PositionedMenu
                      name="model_custom"
                      getVariable={getVariable}
                      openVariableModal={variableModal.onTrue}
                    />
                  ),
                }}
              />
            )}
          </>
        )}

        <TextField
          id="prompt-gpt"
          multiline
          rows={4}
          InputLabelProps={{ shrink: !!data.prompt || focusField.prompt }}
          onFocus={() => setFocusField({ ...focusField, prompt: true })}
          onBlur={() => setFocusField({ ...focusField, prompt: false })}
          defaultValue={data.prompt}
          onChange={debounce((event) => {
            setData({ ...data, prompt: event.target.value });
          }, 200)}
          name="prompt"
          label="Văn bản lệnh"
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="prompt"
                getVariable={getVariable}
                openVariableModal={variableModal.onTrue}
              />
            ),
          }}
        />

        {formData?.dataFields?.output_type === 'image' && (
          <>
            <TextField
              select
              fullWidth
              name="image_size"
              label="Kích thước hình ảnh"
              value={formData?.dataFields?.image_size ?? '1024x1024'}
              onChange={handleChangeNumberSecond}
            >
              {[
                {
                  id: 1,
                  label: '1024 X 1024',
                  value: '1024x1024',
                },
                {
                  id: 2,
                  label: '1792 X 1024',
                  value: '1792x1024',
                },
                {
                  id: 3,
                  label: '1024 X 1792',
                  value: '1024x1792',
                },
              ].map((item) => (
                <MenuItem key={item.id} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>

            <FormControl>
              <FormLabel>Kiểu trả về</FormLabel>
              <RadioGroup
                row
                name="response_type"
                value={formData?.dataFields?.response_type ?? 'url'}
                onChange={handleChangeNumberSecond}
              >
                <FormControlLabel value="url" control={<Radio />} label="URL" />
                <FormControlLabel value="base64" control={<Radio />} label="Base64" />
              </RadioGroup>
            </FormControl>
          </>
        )}

        <Autocomplete
          name="variable_output"
          id="combo-box-demo"
          onChange={(_, newValue) => {
            eventBus.emit('updateNode', {
              data: { variable_output: newValue?.key },
              idNode: IdNode,
            });
          }}
          value={formData?.dataFields?.variable_output || null}
          getOptionLabel={(option) => option.key || option || ''}
          options={fetchVariables || []}
          isOptionEqualToValue={(option, value) => option.key === value}
          renderInput={(params) => <TextField label="Biến nhận giá trị" {...params} />}
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
          eventBus.emit('updateNode', { data: { variable_output: key }, idNode: IdNode });
        }}
      />
    </Stack>
  );
}

ChatGPTAiForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
