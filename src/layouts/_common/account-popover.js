import { m } from 'framer-motion';
// @mui
import { alpha } from '@mui/material/styles';
// import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
// import Typography from '@mui/material/Typography';
// routes
import { useRouter } from 'src/routes/hooks';

// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import { varHover } from 'src/components/animate';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Avatar, Box, Tooltip } from '@mui/material';
import { useLocales } from 'src/locales';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';
import TextMaxLine from 'src/components/text-max-line';

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const router = useRouter();
  const { t } = useLocales();

  const { user, logout } = useAuthContext();

  const popover = usePopover();

  const [nameRef, showName] = useTooltipNecessity(false);
  const [emailRef, showEmail] = useTooltipNecessity(false);

  const handleLogout = async () => {
    try {
      await logout();
      popover.onClose();
      router.replace('/');
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickItem = (path) => {
    popover.onClose();
    router.push(path);
  };

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          // src={user?.photoURL || ''}
          alt={user?.first_name || user?.email}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {user?.first_name.charAt(0).toUpperCase() || user?.email.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Tooltip title={showName ? `${user?.first_name} ${user?.last_name}` : ''}>
            <TextMaxLine
              variant="subtitle2"
              ref={nameRef}
              line={1}
              sx={{
                width: 168,
              }}
            >{`${user?.first_name} ${user?.last_name}`}</TextMaxLine>
          </Tooltip>

          <Tooltip title={showEmail ? user?.email : ''}>
            <TextMaxLine
              display="inline-block"
              ref={emailRef}
              variant="body2"
              sx={{ color: 'text.secondary', width: 168 }}
              line={1}
            >
              {user?.email}
            </TextMaxLine>
          </Tooltip>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          <MenuItem onClick={() => handleClickItem('/account-settings')}>
            {t('accSetting.actions.setting')}
          </MenuItem>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          {t('accSetting.actions.logout')}
        </MenuItem>
      </CustomPopover>
    </>
  );
}
