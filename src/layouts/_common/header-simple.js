// @mui
import { useTheme } from '@mui/material/styles';
// import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
// theme
import { bgBlur } from 'src/theme/css';
// hooks
import { useOffSetTop } from 'src/hooks/use-off-set-top';
// components
import Logo from 'src/components/logo';
// import { RouterLink } from 'src/routes/components';
//
import { HEADER } from '../config-layout';
import HeaderShadow from './header-shadow';
import SettingsButton from './settings-button';
import LanguagePopover from './language-popover';

// ----------------------------------------------------------------------

export default function HeaderSimple() {
  const theme = useTheme();

  const offsetTop = useOffSetTop(HEADER.H_DESKTOP);

  return (
    <AppBar>
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          height: {
            xs: HEADER.H_MOBILE,
            md: HEADER.H_DESKTOP,
          },
          transition: theme.transitions.create(['height'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
          ...(offsetTop && {
            ...bgBlur({
              color: theme.palette.background.default,
            }),
            height: {
              md: HEADER.H_DESKTOP_OFFSET,
            },
          }),
        }}
      >
        <Logo />

        <Stack direction="row" alignItems="center" spacing={2}>
          <LanguagePopover />

          <SettingsButton />
        </Stack>
      </Toolbar>

      {offsetTop && <HeaderShadow />}
    </AppBar>
  );
}
