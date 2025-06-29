import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// theme
import { hideScroll } from 'src/theme/css';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// components
import Logo from 'src/components/logo';
import { NavSectionMini } from 'src/components/nav-section';
//
import Iconify from 'src/components/iconify';
import { IconButton, ListItemText, Popover, Skeleton, Tooltip } from '@mui/material';
import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import { NavToggleButton } from '../_common';

// ----------------------------------------------------------------------

export default function NavMini({ balanceInfo = [], balanceLoading, handleReloadBalance }) {
  const navRef = useRef(null);
  const { user } = useMockedUser();
  const [open, setOpen] = useState(false);
  const navData = useNavData();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Box
        component="nav"
        id="nav-content"
        sx={{
          flexShrink: { lg: 0 },
          width: { lg: NAV.W_MINI },
        }}
      >
        <NavToggleButton
          sx={{
            top: 22,
            left: NAV.W_MINI - 12,
          }}
        />

        <Stack
          sx={{
            pb: 2,
            height: 1,
            position: 'fixed',
            width: NAV.W_MINI,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
            ...hideScroll.x,
          }}
        >
          <Logo sx={{ mx: 'auto', my: 2 }} />

          <NavSectionMini
            data={navData}
            config={{
              currentRole: user?.role || 'admin',
            }}
          />
          <Stack spacing={2} m={1} mt="auto" alignItems="center">
            <Stack
              ref={navRef}
              onMouseEnter={handleOpen}
              onMouseLeave={handleClose}
              spacing={0}
              alignItems="center"
              sx={{
                cursor: 'pointer',
                py: 1,
                width: 1,
                borderRadius: 1,
                '&.MuiStack-root:hover': {
                  bgcolor: (theme) => theme.palette.divider,
                },
                transition: 'all 0.1s linear',
              }}
            >
              <Iconify icon="fa6-solid:money-check" color={!open && 'text.secondary'} />
              <ListItemText
                primary="Số dư"
                primaryTypographyProps={{
                  noWrap: true,
                  fontSize: 10,
                  lineHeight: '16px',
                  textAlign: 'center',
                  fontWeight: open ? 'fontWeightBold' : 'fontWeightSemiBold',
                  color: open ? 'text.primary' : 'text.secondary',
                }}
              />
            </Stack>
          </Stack>
        </Stack>
      </Box>
      <Popover
        open={open}
        anchorEl={navRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
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

NavMini.propTypes = {
  balanceInfo: PropTypes.array,
  balanceLoading: PropTypes.bool,
  handleReloadBalance: PropTypes.func,
};
