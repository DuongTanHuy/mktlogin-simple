import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
const { Stack, Typography, InputBase, alpha, inputBaseClasses } = require('@mui/material');

function InputRange({ type, value, onFilters }) {
  const min = value[0];

  const max = value[1];

  const handleBlurInputRange = useCallback(() => {
    if (min < 0) {
      onFilters('priceRange', [0, max]);
    }
    if (min > 1000) {
      onFilters('priceRange', [1000, max]);
    }
    if (max < 0) {
      onFilters('priceRange', [min, 0]);
    }
    if (max > 1000) {
      onFilters('priceRange', [min, 1000]);
    }
  }, [max, min, onFilters]);

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: 1 }}>
      <Typography
        variant="caption"
        sx={{
          flexShrink: 0,
          color: 'text.disabled',
          textTransform: 'capitalize',
          fontWeight: 'fontWeightSemiBold',
        }}
      >
        {`${type} ($)`}
      </Typography>

      <InputBase
        fullWidth
        value={type === 'min' ? min : max}
        onChange={(event) =>
          type === 'min'
            ? onFilters('priceRange', [Number(event.target.value), max])
            : onFilters('priceRange', [min, Number(event.target.value)])
        }
        onBlur={handleBlurInputRange}
        inputProps={{
          step: 10,
          min: 0,
          max: 1000,
          type: 'number',
          'aria-labelledby': 'input-slider',
        }}
        sx={{
          maxWidth: 48,
          borderRadius: 0.75,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
          [`& .${inputBaseClasses.input}`]: {
            pr: 1,
            py: 0.75,
            textAlign: 'right',
            typography: 'body2',
          },
        }}
      />
    </Stack>
  );
}

export default InputRange;

InputRange.propTypes = {
  onFilters: PropTypes.func,
  type: PropTypes.oneOf(['min', 'max']),
  value: PropTypes.arrayOf(PropTypes.number),
};
