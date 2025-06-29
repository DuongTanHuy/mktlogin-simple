import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import FormHelperText from '@mui/material/FormHelperText';
//
import Editor from '../editor';

// ----------------------------------------------------------------------

export default function RHFEditor({ name, helperText, formatType, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Editor
          id={name}
          value={field.value}
          onChange={field.onChange}
          error={!!error}
          helperText={
            (!!error || helperText) && (
              <FormHelperText error={!!error} sx={{ px: 2 }}>
                {error ? error?.message : helperText}
              </FormHelperText>
            )
          }
          formatType={formatType}
          {...other}
        />
      )}
    />
  );
}

RHFEditor.propTypes = {
  helperText: PropTypes.string,
  name: PropTypes.string,
  formatType: PropTypes.string,
};
