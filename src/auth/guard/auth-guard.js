import PropTypes from 'prop-types';
import { useEffect, useCallback, useState } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
//
import { getStorage, removeStorage } from 'src/hooks/use-local-storage';
import { useAuthContext } from '../hooks';
import { isElectron } from '../../utils/commom';
// ----------------------------------------------------------------------

const loginPaths = {
  jwt: paths.auth.jwt.login,
};

// ----------------------------------------------------------------------

export default function AuthGuard({ children }) {
  const router = useRouter();
  const invite_code = getStorage('invite_code');

  const { authenticated, method, user } = useAuthContext();

  const [checked, setChecked] = useState(false);
  const check = useCallback(() => {
    if (!authenticated) {
      const searchParams = new URLSearchParams({
        returnTo: window.location.pathname,
      }).toString();

      const loginPath = loginPaths[method];

      if (isElectron()) {
        router.replace(loginPath);
      } else {
        router.replace(`${loginPath}?${searchParams}`);
      }
    } else {
      if (invite_code) {
        try {
          const [, emailInvited] = atob(invite_code).split(':');
          if (user?.email === emailInvited) {
            router.push(`/invite/${invite_code}`);
          }
        } catch (error) {
          removeStorage('invite_code');
        }
      }
      setChecked(true);
    }
  }, [authenticated, invite_code, method, router, user?.email]);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}

AuthGuard.propTypes = {
  children: PropTypes.node,
};
