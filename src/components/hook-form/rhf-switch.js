import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import Switch from '@mui/material/Switch';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';

// ----------------------------------------------------------------------

export default function RHFSwitch({ name, helperText, onChange = () => {}, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <FormControlLabel
            control={
              <Switch
                {...field}
                checked={field.value}
                onChange={(event) => {
                  field.onChange(event.target.checked);
                  onChange();
                }}
              />
            }
            {...other}
          />

          {(!!error || helperText) && (
            <FormHelperText error={!!error}>{error ? error?.message : helperText}</FormHelperText>
          )}
        </div>
      )}
    />
  );
}

RHFSwitch.propTypes = {
  helperText: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
};
