import { Container } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';

import CreateEditScriptView from 'src/sections/script/create-edit-view';
import { useSettingsContext } from 'src/components/settings';

export default function CreateEditPage() {
  const settings = useSettingsContext();
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        style={{
          height: 'calc(100% - 8px)',
        }}
        sx={{
          px: '0px!important',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <CreateEditScriptView />
      </Container>
    </>
  );
}
