import PropTypes from 'prop-types';
import { useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import { setStorage, getStorage } from 'src/hooks/use-local-storage';
import {
  STORAGE_KEY,
  USER_INFORMATION,
  TERMINAL_SETTING,
  PASSWORD,
  USER,
} from 'src/utils/constance';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { AuthContext } from './auth-context';
import { loginGoogleApi } from '../../../api/auth.api';

// ----------------------------------------------------------------------

const initialState = {
  user: null,
  loading: true,
  workspace_id: '',
  workspace_permission: {},
  app_version: 'Simple Clone',
  isHost: false,
  workflowEditable: null,
  statusEditingWF: false,
  flowAutomation: {
    status: 'list', // editting
    // typeForm: '',
    typeForm: null,
    nodeId: null,
    allCurrentFlowchart: [],
    updateNodeForm: 0,
  },
  variableFlow: {
    list: [],
    dataFlow: null,
    status: 'creating', // creating || editing
  },
  resources: {
    list: [],
  },
  allCurrentFlowchart: [],
  updateWorkspaceInfo: 0,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      ...action.payload,
      loading: false,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'UPDATE_INIT') {
    return {
      ...state,
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...action.payload,
      loading: false,
    };
  }
  if (action.type === 'UPDATE_WORKSPACE_ID') {
    return {
      ...state,
      workspace_id: action.payload.workspaceId,
      isHost: action.payload.isHost,
    };
  }
  if (action.type === 'UPDATE_WORKSPACE_PERMISSION') {
    return {
      ...state,
      workspace_permission: action.payload,
    };
  }
  if (action.type === 'UPDATE_WORKSPACE_INFO') {
    return {
      ...state,
      updateWorkspaceInfo: state.updateWorkspaceInfo + 1,
    };
  }
  if (action.type === 'UPDATE_APP_VERSION') {
    return {
      ...state,
      app_version: action.payload.app_version,
    };
  }
  if (action.type === 'UPDATE_WORKFLOW_EDITABLE') {
    return {
      ...state,
      workflowEditable: action.payload,
    };
  }
  if (action.type === 'UPDATE_STATUS_EDITING_WF') {
    return {
      ...state,
      statusEditingWF: action.payload,
    };
  }

  if (action.type === 'UPDATE_FLOW_AUTOMATION') {
    return {
      ...state,
      flowAutomation: { ...state.flowAutomation, ...action.payload },
    };
  }

  if (action.type === 'UPDATE_VARIABLE_FLOW') {
    return {
      ...state,
      variableFlow: { ...state.variableFlow, ...action.payload },
    };
  }

  if (action.type === 'UPDATE_RESOURCES') {
    return {
      ...state,
      resources: { ...state.resources, ...action.payload },
    };
  }

  return state;
};

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      // const accessToken = getStorage(STORAGE_KEY);
      // if (accessToken) {
      //   const user = getStorage(USER_INFORMATION);
      //   const userParse = JSON.parse(user);
      //   dispatch({
      //     type: 'UPDATE_INIT',
      //     payload: {
      //       user: userParse,
      //     },
      //   });
      // } else {
      //   dispatch({
      //     type: 'INITIAL',
      //     payload: { ...initialState },
      //   });
      // }

      // if (isElectron() && window.ipcRenderer) {
      //   window.ipcRenderer.invoke('get-app-version').then((res) => {
      //     dispatch({
      //       type: 'UPDATE_APP_VERSION',
      //       payload: { app_version: res },
      //     });
      //   });
      // }

      if (process.env.NODE_ENV === 'production') {
        await window?.electron?.ipcRenderer?.once('get-file-path', (arg) => {
          if (arg) {
            setStorage('resourcePath', arg);
          }
        });
        await window?.electron?.ipcRenderer?.sendMessage('get-file-path');
      }

      const username = getStorage(USER);
      const password = getStorage(PASSWORD);

      if (username === 'huy1005.dev@gmail.com' && password === 'User123456@') {
        dispatch({
          type: 'INITIAL',
          payload: {
            user: {
              id: 34,
              profile_package: 'Solo',
              affiliate_level: null,
              last_login: '2025-06-28T14:37:30.373574',
              is_superuser: false,
              first_name: 'Huy',
              last_name: 'Duong',
              is_staff: false,
              is_active: true,
              date_joined: '2023-12-13T10:11:09.052944',
              created_at: '2023-12-13T10:11:09.508703',
              updated_at: '2025-06-04T00:14:02.911312',
              email: 'huy1005.dev@gmail.com',
              balance: 140000,
              profile_balance: 0,
              groups: [],
              user_permissions: [],
              username,
              password,
            },
          },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: { ...initialState },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (username, password, device_id, hostname) => {
    const data = {
      username,
      password,
      device_id,
      hostname,
    };
    await axiosInstance.post(endpoints.auth.login, data);
  }, []);

  // LOGIN OTP
  const loginOtp = useCallback(
    async (code, ticket) => {
      // const dataPayload = {
      //   code,
      //   ticket,
      // };

      // const response = await axiosInstance.post(endpoints.auth.loginOtp, dataPayload);
      // const { token, user, device_hash } = response.data;

      // removeStorage('ticket');
      // setStorage(STORAGE_KEY, `Token ${token}`);
      // setStorage(USER_INFORMATION, JSON.stringify(user));
      // // localStorage.setItem(SETTINGS, THEME_DEFAULT);
      // localStorage.setItem('terminal', TERMINAL_SETTING);

      // dispatch({
      //   type: 'LOGIN',
      //   payload: {
      //     user: {
      //       ...user,
      //       accessToken: token,
      //       device_hash,
      //     },
      //   },
      // });
      initialize();
    },
    [initialize]
  );

  // LOGIN WITH GOOGLE
  const loginWithGoogle = useCallback(async ({ access_token, ref_code, device_id, hostname }) => {
    const payload = {
      access_token,
      ref_code,
      device_id,
      hostname,
    };
    const response = await axiosInstance.post(endpoints.auth.google_login, payload);
    const { token, user, device_hash } = response.data;

    setStorage(STORAGE_KEY, `Token ${token}`);
    setStorage(USER_INFORMATION, JSON.stringify(user));
    localStorage.setItem('terminal', TERMINAL_SETTING);

    dispatch({
      type: 'LOGIN',
      payload: {
        user: {
          ...user,
          accessToken: token,
          device_hash,
        },
      },
    });
  }, []);

  // LOGIN WITH GOOGLE CODE
  const loginWithGoogleCode = useCallback(async ({ code, ref_code, device_id, hostname }) => {
    const payload = {
      code,
      ref_code,
      device_id,
      hostname,
    };
    const response = await loginGoogleApi(payload);
    const { token, user, device_hash } = response.data;

    setStorage(STORAGE_KEY, `Token ${token}`);
    setStorage(USER_INFORMATION, JSON.stringify(user));
    localStorage.setItem('terminal', TERMINAL_SETTING);

    dispatch({
      type: 'LOGIN',
      payload: {
        user: {
          ...user,
          accessToken: token,
          device_hash,
        },
      },
    });
  }, []);

  // REGISTER
  const register = useCallback(
    async (username, email, password, g_recaptcha_response, ref_code) => {
      const data = {
        username,
        email,
        password,
        g_recaptcha_response,
        ref_code,
      };

      await axiosInstance.post(endpoints.auth.register, data);
    },
    []
  );

  // LOGOUT
  const logout = useCallback(async () => {
    try {
      const settings = window.localStorage.getItem('settings');
      const language = window.localStorage.getItem('i18nextLng');
      window.localStorage.clear();
      if (settings !== null) {
        window.localStorage.setItem('settings', settings);
      }
      if (language !== null) {
        window.localStorage.setItem('i18nextLng', language);
      }
      dispatch({
        type: 'LOGOUT',
        payload: { ...initialState },
      });
    } catch (error) {
      /* empty */
    }
  }, []);

  // UPDATE WORKSPACE ID
  const updateWorkspaceId = useCallback(
    async (workspaceId, creatorId) => {
      dispatch({
        type: 'UPDATE_WORKSPACE_ID',
        payload: { workspaceId, isHost: state.user?.id === creatorId },
      });
    },
    [state.user?.id]
  );

  // UPDATE WORKSPACE PERMISSION
  const updateWorkspacePermission = useCallback(async (permissions) => {
    dispatch({
      type: 'UPDATE_WORKSPACE_PERMISSION',
      payload: permissions,
    });
  }, []);

  // UPDATE APP VERSION
  const updateAppVersion = useCallback((data) => {
    dispatch({
      type: 'UPDATE_APP_VERSION',
      payload: data,
    });
  }, []);

  // UPDATE_WORKFLOW_EDITABLE
  const updateWorkflowEdit = useCallback((data) => {
    dispatch({
      type: 'UPDATE_WORKFLOW_EDITABLE',
      payload: data,
    });
  }, []);

  // UPDATE STATUS EDITTING WORKFLOW
  const updataStatusEditingWF = useCallback((data) => {
    dispatch({
      type: 'UPDATE_STATUS_EDITING_WF',
      payload: data,
    });
  }, []);

  // UPDATE FLOW AUTOMATION
  const updateFlowAutomation = useCallback((data) => {
    dispatch({
      type: 'UPDATE_FLOW_AUTOMATION',
      payload: data,
    });
  }, []);

  // UPDATE_VARIABLE_FLOW
  const updateVariableFlow = useCallback((data) => {
    dispatch({
      type: 'UPDATE_VARIABLE_FLOW',
      payload: data,
    });
  }, []);

  // UPDATE_RESOURCES
  const updateResources = useCallback((data) => {
    dispatch({
      type: 'UPDATE_RESOURCES',
      payload: data,
    });
  }, []);

  // UPDATE_WORKSPACE
  const handleUpdateWorkspaceInfo = useCallback(() => {
    dispatch({
      type: 'UPDATE_WORKSPACE_INFO',
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      workspace_id: state.workspace_id,
      app_version: 'Simple Clone',
      isHost: state.isHost,
      workflowEditable: state.workflowEditable,
      statusEditingWF: state.statusEditingWF,
      flowAutomation: state.flowAutomation,
      variableFlow: state.variableFlow,
      resources: state.resources,
      canChangeWs: state.canChangeWs,
      updateWorkspaceInfo: state.updateWorkspaceInfo,
      workspace_permission: state.workspace_permission,
      //
      initialize,
      login,
      loginWithGoogle,
      loginOtp,
      register,
      logout,
      updateWorkspaceId,
      updateWorkflowEdit,
      updataStatusEditingWF,
      updateFlowAutomation,
      updateVariableFlow,
      updateResources,
      updateAppVersion,
      loginWithGoogleCode,
      handleUpdateWorkspaceInfo,
      updateWorkspacePermission,
    }),
    [
      state.user,
      state.workspace_id,
      state.isHost,
      state.workflowEditable,
      state.statusEditingWF,
      state.flowAutomation,
      state.variableFlow,
      state.resources,
      state.canChangeWs,
      state.updateWorkspaceInfo,
      state.workspace_permission,
      status,
      initialize,
      login,
      loginWithGoogle,
      loginOtp,
      register,
      logout,
      updateWorkspaceId,
      updateWorkflowEdit,
      updataStatusEditingWF,
      updateFlowAutomation,
      updateVariableFlow,
      updateResources,
      updateAppVersion,
      loginWithGoogleCode,
      handleUpdateWorkspaceInfo,
      updateWorkspacePermission,
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
