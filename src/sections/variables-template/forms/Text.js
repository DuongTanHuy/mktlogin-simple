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
  MenuItem,
} = require('@mui/material');

const Text = ({ template, updateItemByField, variableOptions }) => (
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
        options={variableOptions || []}
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
        name="defaultValue"
        placeholder="Enter value"
        value={template?.config?.defaultValue}
        onChange={(e) => updateItemByField(template, 'defaultValue', e.target.value)}
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
        label="Custom Color"
        control={
          <Switch
            name="customColor"
            checked={template?.config?.customColor}
            onChange={(e) => updateItemByField(template, 'customColor', e.target.checked)}
          />
        }
      />
    </CustomLabel>

    {template?.config?.customColor && (
      <CustomLabel nameLabel="Color">
        <TextField
          size="small"
          name="color"
          placeholder="Enter value"
          value={template?.config?.color}
          onChange={(e) => updateItemByField(template, 'color', e.target.value)}
          inputProps={{
            autoCorrect: 'off',
            spellCheck: 'false',
            autoCapitalize: 'none',
            'aria-autocomplete': 'none',
            'aria-expanded': false,
          }}
        />
      </CustomLabel>
    )}

    <CustomLabel nameLabel="">
      <FormControlLabel
        label="Strong"
        control={
          <Switch
            name="strong"
            checked={template?.config?.strong}
            onChange={(e) => updateItemByField(template, 'strong', e.target.checked)}
          />
        }
      />
    </CustomLabel>

    <CustomLabel nameLabel="">
      <FormControlLabel
        label="Italic"
        control={
          <Switch
            name="italic"
            checked={template?.config?.italic}
            onChange={(e) => updateItemByField(template, 'italic', e.target.checked)}
          />
        }
      />
    </CustomLabel>

    <CustomLabel nameLabel="">
      <FormControlLabel
        label="Underline"
        control={
          <Switch
            name="underline"
            checked={template?.config?.underline}
            onChange={(e) => updateItemByField(template, 'underline', e.target.checked)}
          />
        }
      />
    </CustomLabel>

    <CustomLabel nameLabel="">
      <FormControlLabel
        label="Delete"
        control={
          <Switch
            name="delete"
            checked={template?.config?.delete}
            onChange={(e) => updateItemByField(template, 'delete', e.target.checked)}
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

    <CustomLabel nameLabel="Depth">
      <TextField
        select
        fullWidth
        size="small"
        onChange={(e) => updateItemByField(template, 'depth', e.target.value)}
        value={template?.config?.depth ?? ''}
      >
        <MenuItem value="1">1</MenuItem>
        <MenuItem value="2">2</MenuItem>
        <MenuItem value="3">3</MenuItem>
      </TextField>
    </CustomLabel>
  </Stack>
);

Text.propTypes = {
  template: PropTypes.object,
  updateItemByField: PropTypes.func,
  variableOptions: PropTypes.array,
};

export default Text;
