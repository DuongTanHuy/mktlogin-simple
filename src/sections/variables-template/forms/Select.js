import { useEffect, useState } from 'react';
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
  Button,
  Checkbox,
  IconButton,
} = require('@mui/material');

const Select = ({ template, updateItemByField, variableOptions }) => {
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
    if (!template?.config.isMulti) {
      const deleteOption = template?.config.options.find((option) => option.id === id);
      if (deleteOption.checked) {
        return;
      }
    }
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

  const handleSelectDefaultOption = (id, value) => {
    if (template?.config?.isMulti) {
      const newOptions = template?.config.options.map((option) => {
        if (option.id === id) {
          return { ...option, checked: value };
        }
        return option;
      });
      updateItemByField(template, 'options', newOptions);
    } else {
      const newOptions = template?.config.options.map((option) => {
        if (option.id === id) {
          return { ...option, checked: value };
        }
        return { ...option, checked: false };
      });
      updateItemByField(template, 'options', newOptions);
    }
  };

  useEffect(() => {
    updateItemByField(
      template,
      'defaultValue',
      template?.config.isMulti
        ? template?.config.options.filter((option) => option.checked).map((option) => option.value)
        : template?.config.options.find((option) => option.checked)?.value || ''
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.config.options, template?.config.isMulti]);

  const [updateOption, setUpdateOption] = useState(1);

  useEffect(() => {
    if (!template?.config?.isMulti) {
      updateItemByField(
        template,
        'options',
        template?.config.options.map((option) => ({
          ...option,
          checked: option.value === template?.config.defaultValue,
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateOption]);

  return (
    <Stack>
      <CustomLabel nameLabel="Select">
        <Chip size="small" label="Select" color="primary" sx={{ width: '80px' }} />
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
          options={
            variableOptions?.filter((item) => item?.type === 'text' || item?.type === 'number') ||
            []
          }
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
                onChange={(e) => handleSelectDefaultOption(option.id, e.target.checked)}
                sx={{
                  p: 0.5,
                  borderRadius: 1,
                }}
              />

              <TextField
                size="small"
                placeholder="Enter label"
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
          label="Is Multiple"
          control={
            <Switch
              name="isMulti"
              checked={template?.config?.isMulti}
              onChange={(e) => {
                updateItemByField(template, 'isMulti', e.target.checked);
                setUpdateOption((prev) => prev + 1);
              }}
            />
          }
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
      <CustomLabel nameLabel="">
        <FormControlLabel
          label="Is required"
          control={
            <Switch
              name="isRequired"
              checked={template?.config?.isRequired}
              onChange={(e) => updateItemByField(template, 'isRequired', e.target.checked)}
            />
          }
        />
      </CustomLabel>
      <CustomLabel nameLabel="Placeholder">
        <TextField
          size="small"
          name="placeholder"
          placeholder="Enter value"
          value={template?.config?.placeholder}
          onChange={(e) => updateItemByField(template, 'placeholder', e.target.value)}
          inputProps={{
            autoCorrect: 'off',
            spellCheck: 'false',
            autoCapitalize: 'none',
            'aria-autocomplete': 'none',
            'aria-expanded': false,
          }}
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

Select.propTypes = {
  template: PropTypes.object,
  updateItemByField: PropTypes.func,
  variableOptions: PropTypes.array,
};

export default Select;
