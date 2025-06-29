import { useEffect, useState } from 'react';
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

const Range = ({ template, updateItemByField, variableOptions }) => {
  const [validate, setValidate] = useState(false);
  const [validateDefault, setValidateDefault] = useState(false);

  useEffect(() => {
    if (Number(template?.config?.rangeMin) > Number(template?.config?.rangeMax)) {
      setValidate(true);
    } else {
      setValidate(false);
    }
    if (Number(template?.config?.defaultMin) > Number(template?.config?.defaultMax)) {
      setValidateDefault(true);
    } else {
      setValidateDefault(false);
    }
  }, [
    template?.config?.defaultMax,
    template?.config?.defaultMin,
    template?.config?.rangeMax,
    template?.config?.rangeMin,
    template,
    updateItemByField,
  ]);

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
          options={variableOptions.filter((item) => item?.type === 'range') || []}
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
      <CustomLabel nameLabel="Range Data">
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            size="small"
            type="number"
            name="rangeMin"
            label="Range Min"
            placeholder="Enter value"
            value={template?.config?.rangeMin}
            onChange={(e) => {
              updateItemByField(template, 'rangeMin', e.target.value);
            }}
            inputProps={{
              autoCorrect: 'off',
              spellCheck: 'false',
              autoCapitalize: 'none',
              'aria-autocomplete': 'none',
              'aria-expanded': false,
            }}
            error={validate}
          />
          <TextField
            fullWidth
            size="small"
            type="number"
            name="rangeMax"
            label="Range Max"
            placeholder="Enter value"
            value={template?.config?.rangeMax}
            onChange={(e) => {
              updateItemByField(template, 'rangeMax', e.target.value);
            }}
            inputProps={{
              autoCorrect: 'off',
              spellCheck: 'false',
              autoCapitalize: 'none',
              'aria-autocomplete': 'none',
              'aria-expanded': false,
            }}
            error={validate}
          />
        </Stack>
        {validate && (
          <Typography
            variant="caption"
            sx={{
              fontStyle: 'italic',
              color: 'error.main',
            }}
          >
            Range Min must be less than Range Max
          </Typography>
        )}
      </CustomLabel>
      <CustomLabel nameLabel="Default Data">
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            size="small"
            type="number"
            name="defaultMin"
            label="Default Min"
            placeholder="Enter value"
            value={template?.config?.defaultMin}
            onChange={(e) => {
              updateItemByField(template, 'defaultMin', e.target.value);
            }}
            inputProps={{
              autoCorrect: 'off',
              spellCheck: 'false',
              autoCapitalize: 'none',
              'aria-autocomplete': 'none',
              'aria-expanded': false,
            }}
            error={validateDefault}
          />
          <TextField
            fullWidth
            size="small"
            type="number"
            name="defaultMax"
            label="Default Max"
            placeholder="Enter value"
            value={template?.config?.defaultMax}
            onChange={(e) => {
              updateItemByField(template, 'defaultMax', e.target.value);
            }}
            inputProps={{
              autoCorrect: 'off',
              spellCheck: 'false',
              autoCapitalize: 'none',
              'aria-autocomplete': 'none',
              'aria-expanded': false,
            }}
            error={validateDefault}
          />
        </Stack>
        {validateDefault && (
          <Typography
            variant="caption"
            sx={{
              fontStyle: 'italic',
              color: 'error.main',
            }}
          >
            Default Min must be less than Default Max
          </Typography>
        )}
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
          label="Show marks"
          control={
            <Switch
              name="marks"
              checked={template?.config?.marks}
              onChange={(e) => updateItemByField(template, 'marks', e.target.checked)}
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

Range.propTypes = {
  template: PropTypes.object,
  updateItemByField: PropTypes.func,
  variableOptions: PropTypes.array,
};

export default Range;
