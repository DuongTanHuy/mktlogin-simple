import PropTypes from 'prop-types';
import { useEffect, useReducer, useCallback, useMemo, useState } from 'react';
import { getAccountBalance } from 'src/api/workspace.api';
// utils
import { useAuthContext } from 'src/auth/hooks';
import { BalanceContext } from './balance-context';

// ----------------------------------------------------------------------

const initialState = {
  balanceInfo: {
    cash_balance: 0,
    profile_balance: 0,
    current_package: 'Free',
    num_current_profile: 0,
  },
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      ...action.payload,
    };
  }
  if (action.type === 'UPDATE_INIT') {
    return {
      ...state,
      balanceInfo: action.payload.balanceInfo,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

export function BalanceProvider({ children }) {
  const { workspace_id } = useAuthContext();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(true);
  const [refreshBalance, setRefreshBalance] = useState(false);

  const updateRefreshBalance = useCallback((isLoading = false) => {
    setLoading(isLoading);
    setRefreshBalance((prev) => !prev);
  }, []);

  const initialize = useCallback(async () => {
    try {
      if (workspace_id) {
        const response = await getAccountBalance(workspace_id);
        dispatch({
          type: 'UPDATE_INIT',
          payload: {
            balanceInfo: {
              ...response.data,
            },
          },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: { ...initialState },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: { ...initialState },
      });
    } finally {
      setLoading(false);
    }
  }, [workspace_id]);

  useEffect(() => {
    initialize();
  }, [initialize, refreshBalance]);

  // ----------------------------------------------------------------------

  const memoizedValue = useMemo(
    () => ({
      balanceInfo: state.balanceInfo,
      loading,
      //
      updateRefreshBalance,
    }),
    [loading, state.balanceInfo, updateRefreshBalance]
  );

  return <BalanceContext.Provider value={memoizedValue}>{children}</BalanceContext.Provider>;
}

BalanceProvider.propTypes = {
  children: PropTypes.node,
};
