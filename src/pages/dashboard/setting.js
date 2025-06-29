import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
import GlobalSettingView from 'src/sections/global-setting/view';

export default function GlobalSettingPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <GlobalSettingView />
    </>
  );
}
