import React from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Button, ListItemText, Stack } from '@mui/material';
import Iconify from 'src/components/iconify';
import { useLocales } from 'src/locales';
import AccountChangePasswordDialog from './account-change-password-dialog';
import LoginHistoryDialog from './login-history-dialog';

export default function AccountSecurity() {
  const { t } = useLocales();
  const changePassword = useBoolean();
  const loginActivity = useBoolean();

  return (
    <>
      <Stack spacing={3} justifyContent="flex-start">
        <Stack spacing={2}>
          <ListItemText
            primary={t('accSetting.tabs.security.pass')}
            secondary={t('accSetting.tabs.security.subPass')}
            primaryTypographyProps={{ typography: 'h6', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'body1',
            }}
          />
          <Button
            onClick={changePassword.onTrue}
            variant="outlined"
            endIcon={<Iconify icon="mingcute:right-line" />}
            sx={{
              justifyContent: 'space-between',
              padding: '10px 20px',
            }}
          >
            {t('accSetting.tabs.security.actions.changePass')}
          </Button>
        </Stack>

        <Stack spacing={2}>
          <ListItemText
            primary={t('accSetting.tabs.security.loginActivity')}
            secondary={t('accSetting.tabs.security.subLoginActivity')}
            primaryTypographyProps={{ typography: 'h6', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'body1',
            }}
          />
          <Button
            onClick={loginActivity.onTrue}
            variant="outlined"
            endIcon={<Iconify icon="mingcute:right-line" />}
            sx={{
              justifyContent: 'space-between',
              padding: '10px 20px',
            }}
          >
            {t('accSetting.tabs.security.actions.loginLocation')}
          </Button>
        </Stack>
      </Stack>
      <AccountChangePasswordDialog open={changePassword.value} onClose={changePassword.onFalse} />
      <LoginHistoryDialog open={loginActivity.value} onClose={loginActivity.onFalse} />
    </>
  );
}
