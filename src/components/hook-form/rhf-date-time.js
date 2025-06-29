import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';

// ----------------------------------------------------------------------

export default function RHFDateTime({
  name,
  helperText,
  onClick = () => {},
  placeholder,
  ...other
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DesktopDateTimePicker
          {...field}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!error,
              helperText: error?.message,
              onClick,
              ...(placeholder && { placeholder }),
            },
          }}
          {...other}
          inputProps={{ size: 'small' }}
        />
      )}
    />
  );
}

RHFDateTime.propTypes = {
  helperText: PropTypes.object,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  onClick: PropTypes.func,
};
