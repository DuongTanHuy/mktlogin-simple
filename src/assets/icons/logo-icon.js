import { memo } from 'react';
// @mui
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material';

// ----------------------------------------------------------------------

function LogoIcon({ ...other }) {
  const theme = useTheme();

  const PRIMARY_MAIN = theme.palette.primary.light;

  const PRIMARY_DARK = theme.palette.primary.main;

  const PRIMARY_DARKER = theme.palette.primary.dark;
  return (
    <Box
      component="svg"
      height="20px"
      viewBox="0 0 512 512"
      width="20px"
      xmlns="http://www.w3.org/2000/svg"
      {...other}
    >
      <linearGradient id="a" x1="100%" x2="50%" y1="5.663%" y2="50%">
        <stop offset="0" stopColor={PRIMARY_DARKER} />
        <stop offset="1" stopColor={PRIMARY_DARK} />
      </linearGradient>
      <linearGradient id="b" x1="50%" x2="50%" y1="0%" y2="100%">
        <stop offset="0" stopColor={PRIMARY_MAIN} />
        <stop offset="1" stopColor={PRIMARY_DARK} />
      </linearGradient>
      <g fill="none" fillRule="evenodd" transform="translate(14 128)">
        <path
          d="m92.8065878 83.1065019c44.2888442 22.8889511 46.3079382 23.9345951 46.4006692 23.9799821.012248.008728.642121.333419 44.792743 23.152545-26.071507 48.53952-42.693165 77.265922-49.868472 86.179207-10.758587 13.369926-22.495227 23.492946-36.929824 29.333888-30.3458978 14.261953-68.070062 14.928791-97.201704-2.704011z"
          fill="url(#a)"
        />
        <g fill="url(#b)">
          <path d="m430.310491 101.726093c-46.270793-80.9559274-94.100378-157.2284394-149.043472-45.3437359-7.516227 14.3833977-12.994566 42.3366008-25.267019 42.3366008v-.1420279c-12.272453 0-17.749057-27.9532032-25.265283-42.3366009-54.94483-111.8847034-102.774415-35.6121915-149.0452076 45.3437359-3.4821132 6.105448-6.8270943 11.9321-9.6895094 16.99601 106.037811-67.1266136 97.11034 135.666494 184 137.277897v.142028c86.891396-1.611403 77.962189-204.4045106 184-137.27965-2.860679-5.062157-6.20566-10.888809-9.689509-16.994257" />
          <path d="m436 256c26.5088 0 48-21.4912 48-48s-21.4912-48-48-48-48 21.4912-48 48 21.4912 48 48 48" />
        </g>
      </g>
    </Box>
  );
}

export default memo(LogoIcon);
