import { Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useSettingsContext } from '../settings';

// ----------------------------------------------------------------------

export default function RHFPhoneInput({ name, country = 'vn' }) {
  const { control } = useFormContext();
  const { themeMode } = useSettingsContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Stack spacing={1}>
          <PhoneInput
            inputStyle={{
              height: '53px',
              width: 'calc(100% - 12px)',
              borderRadius: '8px',
              border: error ? '1px solid rgb(255, 86, 48)' : '1px solid rgb(233, 236, 238)',
              marginLeft: '12px',
              ...(themeMode === 'dark' && {
                backgroundColor: 'transparent',
                color: 'white',
                borderColor: 'rgba(145, 158, 171, 0.2)',
              }),
            }}
            dropdownStyle={{
              borderRadius: '6px',
              ...(themeMode === 'dark' && {
                backgroundColor: '#161C24',
                color: 'white',
              }),
            }}
            buttonStyle={{
              border: error ? '1px solid rgb(255, 86, 48)' : '1px solid rgb(233, 236, 238)',
              ...(themeMode === 'dark' && {
                backgroundColor: '#161C24',
                border: error ? '1px solid rgb(255, 86, 48)' : '1px solid rgba(145, 158, 171, 0.2)',
              }),
            }}
            country={country}
            inputProps={{
              required: true,
            }}
            placeholder="Enter phone number"
            {...field}
          />
          {!!error && (
            <Typography variant="caption" color="error.main" ml={2}>
              {error?.message}
            </Typography>
          )}
        </Stack>
      )}
    />
  );
}

RHFPhoneInput.propTypes = {
  name: PropTypes.string,
  country: PropTypes.string,
};
