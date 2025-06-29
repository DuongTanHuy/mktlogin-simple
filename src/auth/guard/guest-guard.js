import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
//
import { useAuthContext } from '../hooks';
import { isElectron } from '../../utils/commom';

// ----------------------------------------------------------------------

export default function GuestGuard({ children }) {
  const router = useRouter();

  const searchParams = useSearchParams();

  let returnTo = '';

  if (isElectron()) {
    returnTo = paths.dashboard.root;
  } else {
    returnTo = searchParams.get('returnTo') || paths.dashboard.root;
  }

  const { authenticated } = useAuthContext();

  const check = useCallback(() => {
    if (authenticated) {
      router.push(returnTo);
    }
  }, [authenticated, returnTo, router]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}

GuestGuard.propTypes = {
  children: PropTypes.node,
};
