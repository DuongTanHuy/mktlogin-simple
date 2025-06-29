import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import { Autocomplete, Button, IconButton, MenuItem, alpha } from '@mui/material';
import Iconify from 'src/components/iconify';
import { isElectron } from 'src/utils/commom';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { debounce } from 'lodash';

// ----------------------------------------------------------------------

const MODEL_OPTIONS = [
  {
    id: 1,
    label: 'Text Embedding',
    value: 'text-embedding-004',
  },
  {
    id: 2,
    label: 'Gemini 1.5 Pro',
    value: 'gemini-1.5-pro',
  },
  {
    id: 3,
    label: 'Gemini 1.5 Flash-8B',
    value: 'gemini-1.5-flash-8b',
  },
  {
    id: 4,
    label: 'Gemini 1.5 Flash',
    value: 'gemini-1.5-flash',
  },
  {
    id: 5,
    label: 'Gemini 2.0 Flash-Lite',
    value: 'gemini-2.0-flash-lite',
  },
  {
    id: 6,
    label: 'Gemini 2.0 Flash',
    value: 'gemini-2.0-flash',
  },
  {
    id: 7,
    label: 'Tùy chỉnh',
    value: 'custom',
  },
];

export default function GeminiAiForm({ formData, IdNode }) {
  const { variableFlow } = useAuthContext();
  const variableModal = useBoolean();
  const dataVariableModal = useBoolean();
  const inputRef = useRef(null);
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
    let finalValue = '';
    const { selectionStart, selectionEnd } = inputRef.current;
    if (
      // selectionStart &&
      // selectionEnd &&
      selectionStart >= 0 &&
      selectionEnd <= formData?.dataFields?.image_attachment.length &&
      selectionStart <= selectionEnd
    ) {
      finalValue = `${formData?.dataFields?.image_attachment.slice(0, selectionStart)}\${${
        item.key
      }}${formData?.dataFields?.image_attachment.slice(selectionEnd)}`;
    } else {
      finalValue = `${formData?.dataFields?.image_attachment}\${${item.key}}`;
    }
    eventBus.emit('updateNode', { data: { [name]: finalValue }, idNode: IdNode });
    if (['prompt', 'model_custom'].includes(name)) {
      document.getElementById(`${name}-gemini`).value = `\${${item.key}}`;
      setData({ ...data, [name]: `\${${item.key}}` });
    }
  };

  const selectGoogleCreden = async (event) => {
    if (isElectron()) {
      const file = event.target.files[0];
      const image_attachment = (isElectron() ? file?.path || '' : file?.name || '').replace(
        /\\/g,
        '/'
      );
      eventBus.emit('updateNode', {
        data: { image_attachment },
        idNode: IdNode,
      });
    }
    event.target.value = null;
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

        <TextField
          select
          fullWidth
          name="model"
          label="Model"
          value={formData?.dataFields?.model ?? 'gemini-2.0-flash'}
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
            id="model_custom-gemini"
            InputLabelProps={{ shrink: !!data.model_custom || focusField.model_custom }}
            onFocus={() => setFocusField((prev) => ({ ...prev, model_custom: true }))}
            onBlur={() => setFocusField((prev) => ({ ...prev, model_custom: false }))}
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

        <TextField
          id="prompt-gemini"
          multiline
          rows={4}
          InputLabelProps={{ shrink: !!data.prompt || focusField.prompt }}
          onFocus={() => setFocusField((prev) => ({ ...prev, prompt: true }))}
          onBlur={() => setFocusField((prev) => ({ ...prev, prompt: false }))}
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

        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <TextField
            inputRef={inputRef}
            fullWidth
            type="text"
            name="image_attachment"
            value={formData?.dataFields?.image_attachment ?? ''}
            onChange={handleChangeNumberSecond}
            label="Tệp hình ảnh đính kèm (tùy chọn)"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="image_attachment"
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
              accept=".png, .jpg, .jpeg, .gif, .svg"
              hidden
              onChange={(event) => selectGoogleCreden(event)}
            />
          </IconButton>
        </Stack>

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

GeminiAiForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
