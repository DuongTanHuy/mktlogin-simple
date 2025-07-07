import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';

// ----------------------------------------------------------------------

export default function RHFTime({ name, helperText, onClick = () => {}, placeholder, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DesktopTimePicker
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

RHFTime.propTypes = {
  helperText: PropTypes.object,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  onClick: PropTypes.func,
};
