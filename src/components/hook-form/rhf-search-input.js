import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import TextField from '@mui/material/TextField';
import { InputAdornment } from '@mui/material';
import Iconify from '../iconify';

// ----------------------------------------------------------------------

export default function RHFSearchInput({
  name = 'search',
  placeholder = 'Search...',
  helperText,
  type = 'search',
  loading = true,
  ...other
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, InputProps, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type={type}
          value={field.value}
          placeholder={placeholder}
          onChange={(event) => {
            field.onChange(event.target.value);
          }}
          InputProps={{
            ...InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: <>{loading ? <Iconify icon="svg-spinners:8-dots-rotate" /> : null}</>,
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
        />
      )}
    />
  );
}

RHFSearchInput.propTypes = {
  helperText: PropTypes.object,
  placeholder: PropTypes.string,
  loading: PropTypes.bool,
  name: PropTypes.string,
  type: PropTypes.string,
};
