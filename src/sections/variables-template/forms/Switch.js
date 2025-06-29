import CustomLabel from '../components/CustomLabel';

const PropTypes = require('prop-types');
const {
  Stack,
  Chip,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Autocomplete,
} = require('@mui/material');

const SwitchMode = ({ template, updateItemByField, variableOptions }) => (
  <Stack>
    <CustomLabel nameLabel="Switch">
      <Chip size="small" label="Switch" color="primary" sx={{ width: '80px' }} />
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
        options={variableOptions?.filter((item) => item?.type === 'boolean') || []}
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
      <FormControlLabel
        control={
          <Switch
            name="defaultValue"
            checked={template?.config?.defaultValue}
            onChange={(e) => updateItemByField(template, 'defaultValue', e.target.checked)}
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
    <CustomLabel nameLabel="">
      <FormControlLabel
        label="Loading"
        control={
          <Switch
            name="loading"
            checked={template?.config?.loading}
            onChange={(e) => updateItemByField(template, 'loading', e.target.checked)}
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

SwitchMode.propTypes = {
  template: PropTypes.object,
  updateItemByField: PropTypes.func,
  variableOptions: PropTypes.array,
};

export default SwitchMode;
