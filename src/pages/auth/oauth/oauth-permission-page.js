import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
import OauthPermissionView from 'src/sections/auth/oauth/oauth-permission-view';

export default function OauthPermissionPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <OauthPermissionView />
    </>
  );
}
