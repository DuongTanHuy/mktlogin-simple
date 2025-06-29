import CustomLabel from '../components/CustomLabel';

const PropTypes = require('prop-types');
const { Stack, Chip, TextField, FormControlLabel, Switch } = require('@mui/material');

const Grid = ({ template, updateItemByField }) => (
  <Stack>
    <CustomLabel nameLabel="Grid">
      <Chip size="small" label="Grid" color="primary" sx={{ width: '80px' }} />
    </CustomLabel>
    <CustomLabel nameLabel="Name">
      <TextField
        size="small"
        placeholder="Enter value"
        value={template?.config?.name || ''}
        onChange={(e) => updateItemByField(template, 'name', e.target.value)}
      />
    </CustomLabel>
    <CustomLabel nameLabel="">
      <FormControlLabel
        label="Hide Label"
        control={
          <Switch
            name="value"
            checked={template?.config?.hideLabel}
            onChange={(e) => updateItemByField(template, 'hideLabel', e.target.checked)}
          />
        }
      />
    </CustomLabel>
    <CustomLabel nameLabel="">
      <FormControlLabel
        label="Show border"
        control={
          <Switch
            name="value"
            checked={template?.config?.showBorder}
            onChange={(e) => updateItemByField(template, 'showBorder', e.target.checked)}
          />
        }
      />
    </CustomLabel>
    <CustomLabel nameLabel="Label Width">
      <TextField
        type="number"
        size="small"
        placeholder="Enter value"
        value={template?.config?.labelWidth || ''}
        onChange={(e) =>
          updateItemByField(template, 'labelWidth', !e.target.value ? '' : Number(e.target.value))
        }
      />
    </CustomLabel>
    <CustomLabel nameLabel="Width">
      <TextField
        type="number"
        size="small"
        placeholder="Enter value"
        value={template?.config?.width || ''}
        onChange={(e) =>
          updateItemByField(template, 'width', !e.target.value ? '' : Number(e.target.value))
        }
      />
    </CustomLabel>
    <CustomLabel nameLabel="Height">
      <TextField
        type="number"
        size="small"
        placeholder="Enter value"
        value={template?.config?.height || ''}
        onChange={(e) =>
          updateItemByField(template, 'height', !e.target.value ? '' : Number(e.target.value))
        }
      />
    </CustomLabel>
    <CustomLabel nameLabel="Gap-x">
      <TextField
        type="number"
        size="small"
        value={template?.config?.gap || ''}
        placeholder="Enter value"
        onChange={(e) =>
          updateItemByField(template, 'gap', !e.target.value ? '' : Number(e.target.value))
        }
      />
    </CustomLabel>
  </Stack>
);

Grid.propTypes = {
  template: PropTypes.object,
  updateItemByField: PropTypes.func,
};
export default Grid;
