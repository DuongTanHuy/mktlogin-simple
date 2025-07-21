import Iconify from 'src/components/iconify';
import debounce from 'lodash/debounce';
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
  IconButton,
} = require('@mui/material');

const Slider = ({ template, updateItemByField, variableOptions }) => {
  const getId = () => Math.floor(100000 + Math.random() * 900000);

  const handleAddMark = () => {
    const newMarks = [...template.config.marks];
    newMarks.push({
      id: getId(),
      label: `Mark ${template.config.marks.length + 1}`,
      value: (template.config.maxLength + template.config.minLength) / 2,
    });
    updateItemByField(template, 'marks', newMarks);
  };

  const handleRemoveMarks = (id) => {
    const newMarks = template?.config.marks.filter((option) => option.id !== id);
    updateItemByField(template, 'marks', newMarks);
  };

  const handleUpdateMarks = (id, field, value) => {
    const newMarks = template?.config.marks.map((mark) => {
      if (mark.id === id) {
        return { ...mark, [field]: field === 'value' ? Number(value) : value };
      }
      return mark;
    });
    updateItemByField(template, 'marks', newMarks);
  };

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
      <CustomLabel nameLabel="Marks">
        <Stack spacing={2}>
          {template?.config?.marks.map((option, index) => (
            <Stack key={option.id} direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder="Enter label"
                defaultValue={option.label}
                onChange={debounce(
                  (e) => handleUpdateMarks(option.id, 'label', e.target.value),
                  500
                )}
              />

              <TextField
                type="number"
                size="small"
                placeholder="Enter value"
                defaultValue={option.value}
                onChange={debounce(
                  (e) => handleUpdateMarks(option.id, 'value', e.target.value),
                  500
                )}
              />

              <IconButton
                onClick={() => handleRemoveMarks(option.id)}
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

        <Button variant="text" startIcon={<Iconify icon="ic:round-add" />} onClick={handleAddMark}>
          Add mark
        </Button>
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
          label="Show Marks"
          control={
            <Switch
              name="showMarks"
              checked={template?.config?.showMarks}
              onChange={(e) => updateItemByField(template, 'showMarks', e.target.checked)}
            />
          }
        />
      </CustomLabel>
      <CustomLabel nameLabel="">
        <FormControlLabel
          label="Tooltip"
          control={
            <Switch
              name="tooltip"
              checked={template?.config?.tooltip}
              onChange={(e) => updateItemByField(template, 'tooltip', e.target.checked)}
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
      <CustomLabel nameLabel="Max Value">
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
      <CustomLabel nameLabel="Min Value">
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
};

Slider.propTypes = {
  template: PropTypes.object,
  updateItemByField: PropTypes.func,
  variableOptions: PropTypes.array,
};

export default Slider;
