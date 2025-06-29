import { memo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

// @mui
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
// theme
import { bgBlur } from 'src/theme/css';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// components
import { NavSectionHorizontal } from 'src/components/nav-section';
//
import { IconButton, ListItemText, Popover, Skeleton, Stack, Tooltip } from '@mui/material';
import Iconify from 'src/components/iconify';
import { HEADER } from '../config-layout';
import { useNavData } from './config-navigation';
import { HeaderShadow } from '../_common';

// ----------------------------------------------------------------------

function NavHorizontal({ balanceInfo = [], balanceLoading, handleReloadBalance }) {
  const theme = useTheme();

  const navRef = useRef(null);
  const { user } = useMockedUser();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const navData = useNavData();

  return (
    <>
      <AppBar
        component="nav"
        sx={{
          top: HEADER.H_DESKTOP_OFFSET,
        }}
      >
        <Toolbar
          sx={{
            ...bgBlur({
              color: theme.palette.background.default,
            }),
          }}
        >
          <NavSectionHorizontal
            data={navData}
            config={{
              currentRole: user?.role || 'admin',
            }}
          />
          <Stack spacing={2} m={1} alignItems="center" position="absolute" right={20}>
            <Stack
              ref={navRef}
              onMouseEnter={handleOpen}
              onMouseLeave={handleClose}
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                cursor: 'pointer',
                p: 1,
                width: 1,
                borderRadius: 1,
                '&.MuiStack-root:hover': {
                  bgcolor: theme.palette.divider,
                },
                transition: 'all 0.1s linear',
              }}
            >
              <Iconify icon="fa6-solid:money-check" color={!open && 'text.secondary'} />
              <ListItemText
                primary="Số Dư"
                primaryTypographyProps={{
                  noWrap: true,
                  fontSize: 12,
                  lineHeight: '16px',
                  textAlign: 'center',
                  fontWeight: open ? 'fontWeightBold' : 'fontWeightSemiBold',
                  color: open ? 'text.primary' : 'text.secondary',
                }}
              />
            </Stack>
          </Stack>
        </Toolbar>

        <HeaderShadow />
      </AppBar>
      <Popover
        open={open}
        anchorEl={navRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            onMouseEnter: handleOpen,
            onMouseLeave: handleClose,
            sx: {
              width: 200,
              ...(open && {
                pointerEvents: 'auto',
              }),
            },
          },
        }}
        sx={{
          pointerEvents: 'none',
        }}
      >
        <Tooltip title={balanceLoading ? '' : 'Làm mới'} arrow placement="top">
          <span
            style={{
              position: 'absolute',
              top: 3,
              right: 3,
            }}
          >
            <IconButton disabled={balanceLoading} onClick={() => handleReloadBalance(true)}>
              <Iconify icon={balanceLoading ? 'eos-icons:bubble-loading' : 'solar:restart-bold'} />
            </IconButton>
          </span>
        </Tooltip>
        <Stack spacing={1} p={2}>
          {balanceLoading
            ? balanceInfo.map((item) => (
                <Stack key={item.label} spacing={2} direction="row" mt={1}>
                  <Skeleton sx={{ borderRadius: 0.6, width: 24, height: 20, flexShrink: 0 }} />
                  <ListItemText
                    primary={<Skeleton sx={{ width: 0.5, height: 12 }} />}
                    secondary={<Skeleton sx={{ width: 1, height: 14 }} />}
                    primaryTypographyProps={{
                      mb: 1,
                    }}
                  />
                </Stack>
              ))
            : balanceInfo.map((item) => (
                <Stack key={item.label} spacing={1.5} direction="row">
                  {item.icon}
                  <ListItemText
                    primary={item.label}
                    secondary={item.value}
                    primaryTypographyProps={{
                      typography: 'body2',
                      color: 'text.secondary',
                    }}
                    secondaryTypographyProps={{
                      typography: 'subtitle2',
                      color: 'text.primary',
                      component: 'span',
                    }}
                  />
                </Stack>
              ))}
        </Stack>
      </Popover>
    </>
  );
}

export default memo(NavHorizontal);

NavHorizontal.propTypes = {
  balanceInfo: PropTypes.array,
  balanceLoading: PropTypes.bool,
  handleReloadBalance: PropTypes.func,
};
