import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
import { useMockedUser } from 'src/hooks/use-mocked-user';
// components
import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';
import { usePathname } from 'src/routes/hooks';
import { NavSectionVertical } from 'src/components/nav-section';
//
import {
  alpha,
  Button,
  Card,
  IconButton,
  ListItemText,
  Skeleton,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { NAV } from '../config-layout';
import { useNavData } from './config-navigation';
import { NavToggleButton } from '../_common';

// ----------------------------------------------------------------------

export default function NavVertical({
  openNav,
  onCloseNav,
  balanceInfo = [],
  balanceLoading,
  handleReloadBalance,
}) {
  const { user } = useMockedUser();
  const [show, setShow] = useState(true);
  const matches = useMediaQuery('(min-height:770px)');

  const pathname = usePathname();

  const lgUp = useResponsive('up', 'lg');

  const navData = useNavData();

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (matches) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [matches]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Logo sx={{ mt: 3, ml: 4, mb: 1 }} />

      <NavSectionVertical
        data={navData}
        config={{
          currentRole: user?.role || 'admin',
        }}
      />
    </Scrollbar>
  );

  const renderBalance = (
    <Tooltip title={show ? '' : 'Click để xem thông tin số dư'} arrow>
      <Stack
        component={Card}
        spacing={2}
        onClick={() => setShow(true)}
        sx={{
          mx: 'auto',
          mb: 2,
          p: 2,
          width: 'calc(100% - 32px)',
          height: '250px',
          flexShrink: 0,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
          ...(!show && {
            height: 50,
            cursor: 'pointer',
            pl: 8,
          }),
          transition: 'all 0.2s ease-in',
        }}
      >
        <Button
          sx={{
            width: 60,
            height: 10,
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translate(-50%,-50%)',
          }}
          onClick={(event) => {
            event.stopPropagation();
            setShow((prev) => !prev);
          }}
          variant="contained"
          color="primary"
        />
        {show && (
          <Tooltip title={balanceLoading ? '' : 'Làm mới'} arrow placement="top">
            <span
              style={{
                position: 'absolute',
                top: 3,
                right: 3,
              }}
            >
              <IconButton onClick={() => handleReloadBalance(true)} disabled={balanceLoading}>
                <Iconify
                  icon={balanceLoading ? 'eos-icons:bubble-loading' : 'solar:restart-bold'}
                />
              </IconButton>
            </span>
          </Tooltip>
        )}
        {balanceLoading
          ? balanceInfo.map((item) => (
              <Stack key={item.label} spacing={2} direction="row" mt={1}>
                <Skeleton sx={{ borderRadius: 0.6, width: 24, height: 20, flexShrink: 0 }} />
                <ListItemText
                  primary={<Skeleton sx={{ width: 0.5, height: 12 }} />}
                  secondary={<Skeleton sx={{ width: 1, height: 14 }} />}
                  primaryTypographyProps={{
                    mb: 1,
                    ...(!show && {
                      mb: 3,
                    }),
                  }}
                />
              </Stack>
            ))
          : balanceInfo.map((item) => (
              <Stack key={item.label} spacing={1.5} direction="row">
                {item.icon}
                <ListItemText
                  primary={show ? item.label : 'Số dư'}
                  secondary={show && item.value}
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
    </Tooltip>
  );

  return (
    <Box
      component="nav"
      id="nav-content"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
          {renderBalance}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
            },
          }}
        >
          {renderContent}
          {renderBalance}
        </Drawer>
      )}
    </Box>
  );
}

NavVertical.propTypes = {
  onCloseNav: PropTypes.func,
  handleReloadBalance: PropTypes.func,
  openNav: PropTypes.bool,
  balanceLoading: PropTypes.bool,
  balanceInfo: PropTypes.array,
};
