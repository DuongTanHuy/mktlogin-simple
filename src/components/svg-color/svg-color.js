import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// @mui
import Box from '@mui/material/Box';
import { getStorage } from '../../hooks/use-local-storage';

// ----------------------------------------------------------------------

const SvgColor = forwardRef(({ src, sx, ...other }, ref) => {
  const resourcePath = process.env.NODE_ENV === 'development' ? '' : getStorage('resourcePath');

  return (
    <Box
      component="span"
      className="svg-color"
      ref={ref}
      sx={{
        width: 24,
        height: 24,
        display: 'inline-block',
        bgcolor: 'currentColor',
        mask: `url(${resourcePath + src}) no-repeat center / contain`,
        WebkitMask: `url(${resourcePath + src}) no-repeat center / contain`,
        ...sx,
      }}
      {...other}
    />
  );
});

SvgColor.propTypes = {
  src: PropTypes.any,
  sx: PropTypes.object,
};

export default SvgColor;
