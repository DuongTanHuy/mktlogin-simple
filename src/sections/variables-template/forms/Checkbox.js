import { useEffect } from 'react';
import Iconify from 'src/components/iconify';
import { debounce } from 'lodash';
import CustomLabel from '../components/CustomLabel';

const PropTypes = require('prop-types');
const {
  Stack,
  Chip,
  TextField,
  FormControlLabel,
  Switch,
  Autocomplete,
  Typography,
  IconButton,
  Checkbox,
  Button,
} = require('@mui/material');

const CheckboxTemplate = ({ template, updateItemByField, variableOptions }) => {
  const getId = () => Math.floor(100000 + Math.random() * 900000);

  const handleAddOption = () => {
    const newOptions = [...template.config.options];
    newOptions.push({
      id: getId(),
      checked: false,
      label: `Label ${template.config.options.length + 1}`,
      value: `value ${template.config.options.length + 1}`,
    });
    updateItemByField(template, 'options', newOptions);
  };

  const handleRemoveOption = (id) => {
    const newOptions = template?.config.options.filter((option) => option.id !== id);
    updateItemByField(template, 'options', newOptions);
  };

  const handleUpdateOption = (id, field, value) => {
    const newOptions = template?.config.options.map((option) => {
      if (option.id === id) {
        return { ...option, [field]: value };
      }
      return option;
    });
    updateItemByField(template, 'options', newOptions);
  };

  useEffect(() => {
    updateItemByField(
      template,
      'defaultValue',
      template?.config.options.filter((option) => option.checked)?.map((option) => option.value)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.config.options]);

  return (
    <Stack>
      <CustomLabel nameLabel="Type">
        <Chip size="small" label="Checkbox" color="primary" sx={{ width: '80px' }} />
      </CustomLabel>
      <CustomLabel nameLabel="Variables">
        <Autocomplete
          name="variable"
          disablePortal
          size="small"
          onChange={(_, newValue) => {
            updateItemByField(template, 'variable', newValue);
          }}
          value={template?.config?.variable || null}
          getOptionLabel={(option) => option.key || option || ''}
          options={variableOptions?.filter((item) => item?.type === 'list') || []}
          isOptionEqualToValue={(option, value) => option.key === value.key}
          renderInput={(params) => <TextField placeholder="Select variable" {...params} />}
          renderOption={(props, option) => (
            <Stack
              key={option.id}
              component="li"
              {...props}
              direction="row"
              justifyContent="flex-start"
            >
              {option.key}
            </Stack>
          )}
          noOptionsText={<Typography variant="body2">No variable</Typography>}
        />
      </CustomLabel>
      <CustomLabel nameLabel="Default Data">
        <Stack spacing={2}>
          {template?.config?.options.map((option, index) => (
            <Stack key={option.id} direction="row" spacing={1} alignItems="center">
              <Checkbox
                checked={option.checked}
                onChange={(e) => handleUpdateOption(option.id, 'checked', e.target.checked)}
                sx={{
                  p: 0.5,
                  borderRadius: 1,
                }}
              />

              <TextField
                size="small"
                placeholder="Enter value"
                defaultValue={option.label}
                onChange={debounce(
                  (e) => handleUpdateOption(option.id, 'label', e.target.value),
                  500
                )}
              />

              <TextField
                size="small"
                placeholder="Enter value"
                defaultValue={option.value}
                onChange={debounce(
                  (e) => handleUpdateOption(option.id, 'value', e.target.value),
                  500
                )}
              />

              <IconButton
                onClick={() => handleRemoveOption(option.id)}
                sx={{
                  p: 0.5,
                  borderRadius: 1,
                }}
              >
                <Iconify icon="ic:round-remove" />
              </IconButton>
            </Stack>
          ))}
        </Stack>

        <Button
          variant="text"
          startIcon={<Iconify icon="ic:round-add" />}
          onClick={handleAddOption}
        >
          Add option
        </Button>
      </CustomLabel>
      <CustomLabel nameLabel="Name">
        <TextField
          size="small"
          name="name"
          placeholder="Enter value"
          value={template?.config?.name}
          onChange={(e) => updateItemByField(template, 'name', e.target.value)}
          inputProps={{
            autoCorrect: 'off',
            spellCheck: 'false',
            autoCapitalize: 'none',
            'aria-autocomplete': 'none',
            'aria-expanded': false,
          }}
        />
      </CustomLabel>
      <CustomLabel nameLabel="">
        <FormControlLabel
          label="Hide Label"
          control={
            <Switch
              name="hideLabel"
              checked={template?.config?.hideLabel}
              onChange={(e) => updateItemByField(template, 'hideLabel', e.target.checked)}
            />
          }
        />
      </CustomLabel>
      <CustomLabel nameLabel="Label Width">
        <TextField
          type="number"
          size="small"
          name="labelWidth"
          placeholder="Enter value"
          value={template?.config?.labelWidth}
          onChange={(e) => updateItemByField(template, 'labelWidth', e.target.value)}
          inputProps={{
            autoCorrect: 'off',
            spellCheck: 'false',
            autoCapitalize: 'none',
            'aria-autocomplete': 'none',
            'aria-expanded': false,
          }}
        />
      </CustomLabel>
      <CustomLabel nameLabel="Width">
        <TextField
          type="number"
          size="small"
          name="width"
          placeholder="Enter value"
          value={template?.config?.width ?? ''}
          onChange={(e) => updateItemByField(template, 'width', e.target.value)}
          inputProps={{
            autoCorrect: 'off',
            spellCheck: 'false',
            autoCapitalize: 'none',
            'aria-autocomplete': 'none',
            'aria-expanded': false,
          }}
        />
      </CustomLabel>
      <CustomLabel nameLabel="Height">
        <TextField
          type="number"
          size="small"
          name="height"
          placeholder="Enter value"
          value={template?.config?.height ?? ''}
          onChange={(e) => updateItemByField(template, 'height', e.target.value)}
          inputProps={{
            autoCorrect: 'off',
            spellCheck: 'false',
            autoCapitalize: 'none',
            'aria-autocomplete': 'none',
            'aria-expanded': false,
          }}
        />
      </CustomLabel>
    </Stack>
  );
};

CheckboxTemplate.propTypes = {
  template: PropTypes.object,
  updateItemByField: PropTypes.func,
  variableOptions: PropTypes.array,
};

export default CheckboxTemplate;
