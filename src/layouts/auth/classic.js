import PropTypes from 'prop-types';
import { m } from 'framer-motion';

// @mui
import { alpha } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
//
import { MotionViewport, varBounce } from 'src/components/animate';
import { HeaderSimple as Header } from '../_common';

// ----------------------------------------------------------------------

export default function AuthClassicLayout({ children, displayHeader = true, sx }) {
  return (
    <>
      {displayHeader && <Header />}

      <Box
        component={MotionViewport}
        sx={{
          py: 12,
          display: 'flex',
          minHeight: '100vh',
          textAlign: 'center',
          px: { xs: 2, md: 0 },
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          '&:before': {
            width: 1,
            height: 1,
            zIndex: -1,
            content: "''",
            position: 'absolute',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.04),
            backgroundImage: 'url("/assets/background/background.svg")',
          },
        }}
      >
        <m.div variants={varBounce().inDown}>
          <Card
            sx={{
              py: 5,
              px: 3,
              width: 420,
              ...sx,
            }}
          >
            {children}
          </Card>
        </m.div>
      </Box>
    </>
  );
}

AuthClassicLayout.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
  displayHeader: PropTypes.bool,
};
