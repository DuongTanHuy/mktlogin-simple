import { m } from 'framer-motion';
import '../../assets/global/style.css';

// @mui
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
// assets
import { SeverErrorIllustration } from 'src/assets/illustrations';
// components
import { MotionContainer, varBounce } from 'src/components/animate';
import CompactLayout from 'src/layouts/compact';

// ----------------------------------------------------------------------

export default function Page500() {
  return (
    <CompactLayout>
      <MotionContainer>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            500 Internal Server Error
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>
            There was an error, please try again later.
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <SeverErrorIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
        </m.div>

        <Button
          size="large"
          variant="contained"
          onClick={() => {
            window.location.href = '/';
          }}
        >
          Go to Home
        </Button>
      </MotionContainer>
    </CompactLayout>
  );
}
