import CustomLabel from '../components/CustomLabel';

const PropTypes = require('prop-types');
const { Stack, Chip, TextField, FormControlLabel, Switch } = require('@mui/material');

const Divider = ({ template, updateItemByField }) => (
  <Stack>
    <CustomLabel nameLabel="Divider">
      <Chip size="small" label="Divider" color="primary" sx={{ width: '80px' }} />
    </CustomLabel>
    <CustomLabel nameLabel="Name">
      <TextField
        size="small"
        name="name"
        value={template?.config?.name}
        onChange={(e) => updateItemByField(template, 'name', e.target.value)}
      />
    </CustomLabel>
    <CustomLabel nameLabel="">
      <FormControlLabel
        label="Is Dashed"
        control={
          <Switch
            name="isDashed"
            checked={template?.config?.isDashed}
            onChange={(e) => updateItemByField(template, 'isDashed', e.target.checked)}
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
      />
    </CustomLabel>
  </Stack>
);

Divider.propTypes = {
  template: PropTypes.object,
  updateItemByField: PropTypes.func,
};

export default Divider;
