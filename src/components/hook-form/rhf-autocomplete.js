import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

// ----------------------------------------------------------------------

export default function RHFAutocomplete({
  name,
  label,
  placeholder,
  helperText,
  selectAll = false,
  ...other
}) {
  const { control, setValue } = useFormContext();

  const handleSelectAll = (_, newValue, __, value) => {
    if (value?.option?.value === 'all') {
      setValue(name, [value.option], { shouldValidate: true });
    } else {
      const filteredValues = newValue.filter((item) => item.value !== 'all');
      setValue(name, filteredValues, { shouldValidate: true });
    }
  };

  const handleChange = (_, newValue) => setValue(name, newValue, { shouldValidate: true });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          onChange={selectAll ? handleSelectAll : handleChange}
          renderInput={(params) => (
            <TextField
              label={label}
              placeholder={placeholder}
              error={!!error}
              helperText={error ? error?.message : helperText}
              {...params}
            />
          )}
          {...other}
        />
      )}
    />
  );
}

RHFAutocomplete.propTypes = {
  helperText: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  selectAll: PropTypes.bool,
};
