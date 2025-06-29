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
} = require('@mui/material');

const InputNumber = ({ template, updateItemByField, variableOptions }) => (
  <Stack>
    <CustomLabel nameLabel="InputTemplate">
      <Chip size="small" label="Input" color="primary" sx={{ width: '80px' }} />
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
        options={variableOptions?.filter((item) => item?.type === 'number') || []}
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
      <TextField
        size="small"
        type="number"
        name="defaultValue"
        placeholder="Enter value"
        value={template?.config?.defaultValue ?? ''}
        onChange={(e) => updateItemByField(template, 'defaultValue', Number(e.target.value))}
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
        label="Show Bordered"
        control={
          <Switch
            name="showBordered"
            checked={template?.config?.showBordered}
            onChange={(e) => updateItemByField(template, 'showBordered', e.target.checked)}
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
        label="Clearable"
        control={
          <Switch
            name="clearable"
            checked={template?.config?.clearable}
            onChange={(e) => updateItemByField(template, 'clearable', e.target.checked)}
          />
        }
      />
    </CustomLabel>
    <CustomLabel nameLabel="">
      <FormControlLabel
        label="Readonly"
        control={
          <Switch
            name="readOnly"
            checked={template?.config?.readOnly}
            onChange={(e) => updateItemByField(template, 'readOnly', e.target.checked)}
          />
        }
      />
    </CustomLabel>
    <CustomLabel nameLabel="">
      <FormControlLabel
        label="Show Button"
        control={
          <Switch
            name="showButton"
            checked={template?.config?.showButton}
            onChange={(e) => updateItemByField(template, 'showButton', e.target.checked)}
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
    <CustomLabel nameLabel="Max Length">
      <TextField
        type="number"
        size="small"
        name="maxLength"
        placeholder="Enter value"
        value={template?.config?.maxLength ?? ''}
        onChange={(e) => updateItemByField(template, 'maxLength', e.target.value)}
        inputProps={{
          autoCorrect: 'off',
          spellCheck: 'false',
          autoCapitalize: 'none',
          'aria-autocomplete': 'none',
          'aria-expanded': false,
        }}
      />
    </CustomLabel>
    <CustomLabel nameLabel="Min Length">
      <TextField
        type="number"
        size="small"
        name="minLength"
        placeholder="Enter value"
        value={template?.config?.minLength ?? ''}
        onChange={(e) => updateItemByField(template, 'minLength', e.target.value)}
        inputProps={{
          autoCorrect: 'off',
          spellCheck: 'false',
          autoCapitalize: 'none',
          'aria-autocomplete': 'none',
          'aria-expanded': false,
        }}
      />
    </CustomLabel>
    <CustomLabel nameLabel="Step">
      <TextField
        type="number"
        size="small"
        name="step"
        placeholder="Enter value"
        value={template?.config?.step ?? ''}
        onChange={(e) => updateItemByField(template, 'step', e.target.value)}
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

InputNumber.propTypes = {
  template: PropTypes.object,
  updateItemByField: PropTypes.func,
  variableOptions: PropTypes.array,
};

export default InputNumber;
