import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';
import { getGlobalSetting } from 'src/api/global-setting.api';
import { flowchartOptions, getFlowchartValue } from 'src/utils/flow-chart-optoins';
import { useAuthContext } from '../../auth/hooks';
import { InitialSettingContext } from './initial-setting-context';
import { isElectron } from '../../utils/commom';
import { getExtensionOfWorkspaceApi } from '../../api/extension.api';
import { getStorage, removeStorage, setStorage } from '../../hooks/use-local-storage';
import {
  DEVICE_ID_KEY,
  IS_SYNCING,
  IS_SYNC_OPERATOR_OPEN,
  PROFILES_ID_OPENING,
  PROFILE_IDS_SYNCING,
  PROFILE_STORAGE_PATH,
  STORAGE_KEY,
  WORKSPACE_ID,
} from '../../utils/constance';
import { addProfileOpen, removeAllProfileOpen, removeProfileOpen } from '../../utils/local-storage';
import { updateProfileCookieByIdApi } from '../../api/profile.api';
import eventBus from '../../sections/script/event-bus';
import WorkflowEngine from '../../sections/flow/workflow-engine';

export function InitialSettingProvider({ children }) {
  const [initialSetting, setInitialSetting] = useState({});
  const { authenticated, workspace_id, user, loginWithGoogleCode } = useAuthContext();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!workspace_id || !authenticated) return undefined;

    // remove last version local storage
    const profileStateLocalStorage = getStorage(PROFILES_ID_OPENING);

    if (profileStateLocalStorage?.open_ids || profileStateLocalStorage === null) {
      setStorage(PROFILES_ID_OPENING, []);
    }

    if (isElectron()) {
      const setupInitialSetting = async () => {
        const deviceId = await window.ipcRenderer.invoke('machine-id-get');
        setStorage(DEVICE_ID_KEY, deviceId);
        const accessToken = getStorage(STORAGE_KEY);
        const extensionResponse = await getExtensionOfWorkspaceApi(workspace_id, {});
        const globalSetting = await getGlobalSetting();
        globalSetting.data.data.profile_storage_path = getStorage(PROFILE_STORAGE_PATH);
        const settingData = await window.ipcRenderer.invoke('initital-setting', {
          extensions: extensionResponse.data,
          user,
          access_token: accessToken,
          global_setting: globalSetting.data.data,
          workspace_id,
        });
        setInitialSetting(settingData);
        window.ipcRenderer.send('change-workspace', workspace_id);

        // event listener profile state
        window.ipcRenderer.on('force-close-profile', async (event, data) => {
          const {
            profile_id,
            cookies,
            open_tabs,
            cookie_updated_time,
            cache_update_time,
            bookmarks,
            sync_bookmark_time,
            backup_passwords,
            sync_password_time,
            show_on_all_tabs,
          } = data;
          try {
            removeProfileOpen(profile_id);
            eventBus.emit('force-close-profile', profile_id);
            await updateProfileCookieByIdApi(getStorage(WORKSPACE_ID), profile_id, {
              cookies,
              open_tabs,
              cookie_updated_time,
              cache_update_time,
              bookmarks,
              sync_bookmark_time,
              backup_passwords,
              sync_password_time,
              show_on_all_tabs,
            });
          } catch (error) {
            console.log('updateProfileCookieByIdApi error', error);
          }
        });
        window.ipcRenderer.on('open-profile', async (event, data) => {
          const { profile_id } = data;
          addProfileOpen(profile_id);
          eventBus.emit('open-profile', profile_id);
        });

        window.ipcRenderer.invoke('check-profile-open-state').then((openIDs) => {
          if (openIDs.length === 0) {
            removeAllProfileOpen();
          }
          openIDs.forEach((profile_id) => {
            addProfileOpen(profile_id);
          });
        });

        window.ipcRenderer.on("get-script", (event, data) => {
          const nodes = data.nodes.map((node) => ({
            ...node,
            data: {
              ...(flowchartOptions.find((item) => item.alias === node.data.alias) || node.data),
              isHighlighted: false,
            },
            dataFields: {
              ...getFlowchartValue(node.data.alias),
              ...node.dataFields,
            },
            selected: false,
          }))
          const engine = new WorkflowEngine({
            drawflow: {
              nodes,
              edges: data.edges,
            },
            variables: data.global_data,
            debugMode: false,
            triggerId: null,
          });
          engine.init();
          window.ipcRenderer.send("get-script-reply", {
            workflow_id: data.workflow_id,
            script: engine.script,
          });

        });
      };
      setupInitialSetting();
    }
    return () => {
      setInitialSetting(null);
      if (isElectron()) {
        window.ipcRenderer.removeAllListeners('force-close-profile');
        window.ipcRenderer.removeAllListeners('open-profile');
      }
    };
  }, [authenticated, workspace_id, user]);

  useEffect(() => {
    if (isElectron() && window.ipcRenderer) {
      window.ipcRenderer.on('login-google', async (event, value) => {
        const device_id = await window.ipcRenderer.invoke('machine-id-get');
        const hostname = await window.ipcRenderer.invoke('get-hostname');
        loginWithGoogleCode({ ...value, device_id, hostname });
      });
    }

    if (!searchParams.get('is_sync_operator_page')) {
      removeStorage(IS_SYNC_OPERATOR_OPEN);
      removeStorage(IS_SYNCING);
      removeStorage(PROFILE_IDS_SYNCING);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <InitialSettingContext.Provider value={initialSetting}>
      {children}
    </InitialSettingContext.Provider>
  );
}

InitialSettingProvider.propTypes = {
  children: PropTypes.node,
};
