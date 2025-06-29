import PropTypes from 'prop-types';
import { Rating } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

export default function RHFRating({ name, helperText, ...other }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Rating
          {...field}
          id={name}
          value={field.value}
          onChange={(event) => {
            field.onChange(Number(event.target.value));
          }}
          {...other}
        />
      )}
    />
  );
}

RHFRating.propTypes = {
  helperText: PropTypes.object,
  name: PropTypes.string,
};
