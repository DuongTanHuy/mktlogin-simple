import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
import OauthLoginView from 'src/sections/auth/oauth/oauth-login-view';

export default function OauthLoginPage() {
  const { app_version } = useAuthContext();

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <OauthLoginView />
    </>
  );
}
