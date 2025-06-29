import { useEffect } from 'react';
import PropTypes from 'prop-types';

// @mui
import { Box } from '@mui/material';
//
import Header from '../_common/header';

// ----------------------------------------------------------------------

export default function PolicySerViceLayout({ children }) {
  useEffect(() => {
    document.body.style.overflowY = 'auto';

    return () => {
      document.body.style.overflowY = 'hidden';
    };
  });
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
      <Header />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 8, md: 10 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

PolicySerViceLayout.propTypes = {
  children: PropTypes.node,
};
