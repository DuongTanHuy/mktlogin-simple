import CustomLabel from '../components/CustomLabel';

const PropTypes = require('prop-types');
const { Stack, Chip, TextField, FormControlLabel, Switch, MenuItem } = require('@mui/material');

const Alert = ({ template, updateItemByField }) => (
  <Stack>
    <CustomLabel nameLabel="Alert">
      <Chip size="small" label="Alert" color="primary" sx={{ width: '80px' }} />
    </CustomLabel>
    <CustomLabel nameLabel="Alert Type">
      <TextField
        select
        fullWidth
        size="small"
        name="type"
        value={template?.config?.type ?? 'success'}
        onChange={(e) => updateItemByField(template, 'type', e.target.value)}
      >
        {[
          { value: 'success', label: 'Success' },
          { value: 'info', label: 'info' },
          { value: 'warning', label: 'Warning' },
          { value: 'error', label: 'Error' },
        ].map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </CustomLabel>
    <CustomLabel nameLabel="">
      <FormControlLabel
        label="Show Bordered"
        control={
          <Switch
            name="showBorder"
            checked={template?.config?.showBorder}
            onChange={(e) => updateItemByField(template, 'showBorder', e.target.checked)}
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
    <CustomLabel nameLabel="Title">
      <TextField
        size="small"
        name="title"
        placeholder="Enter value"
        value={template?.config?.title}
        onChange={(e) => updateItemByField(template, 'title', e.target.value)}
        inputProps={{
          autoCorrect: 'off',
          spellCheck: 'false',
          autoCapitalize: 'none',
          'aria-autocomplete': 'none',
          'aria-expanded': false,
        }}
      />
    </CustomLabel>
    <CustomLabel nameLabel="Content">
      <TextField
        size="small"
        name="content"
        placeholder="Enter value"
        value={template?.config?.content}
        onChange={(e) => updateItemByField(template, 'content', e.target.value)}
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

Alert.propTypes = {
  template: PropTypes.object,
  updateItemByField: PropTypes.func,
};

export default Alert;
