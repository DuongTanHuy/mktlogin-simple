import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { FormHelperText, InputBase, inputBaseClasses } from '@mui/material';

// ----------------------------------------------------------------------

export default function RHFInputBase({ name, helperText, type, readOnly, sx, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <InputBase
            {...field}
            fullWidth
            type={type}
            autoComplete="off"
            sx={{
              [`&.${inputBaseClasses.root}`]: {
                px: 1,
                borderRadius: 1,
                typography: 'h6',
                borderWidth: 1,
                borderStyle: 'solid',
                transition: (theme) => theme.transitions.create(['padding-left', 'border-color']),
                [`&.${inputBaseClasses.focused}`]: {
                  pl: 1.5,
                  borderWidth: 2,
                  borderColor: 'text.primary',
                },
                ...(error && {
                  pl: 1.5,
                  borderColor: 'error.main',
                }),
              },
              [`& .${inputBaseClasses.input}`]: {
                typography: 'h6',
              },
              ...sx,
            }}
            value={type === 'number' && field.value === 0 ? '' : field.value}
            onChange={(event) => {
              if (type === 'number') {
                field.onChange(Number(event.target.value));
              } else {
                field.onChange(event.target.value);
              }
            }}
            inputProps={{
              readOnly,
            }}
            {...other}
          />
          {error && (
            <FormHelperText sx={{ px: 2 }} error>
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}

RHFInputBase.propTypes = {
  helperText: PropTypes.object,
  sx: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
  readOnly: PropTypes.bool,
};
