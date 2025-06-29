import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { useEffect, useMemo, useCallback, useState } from 'react';
// hooks
import { getStorage, useLocalStorage } from 'src/hooks/use-local-storage';
// utils
import { localStorageGetItem } from 'src/utils/storage-available';
//
import { WORKSPACE_ID } from 'src/utils/constance';
import { getWorkspaceSettingApi } from 'src/api/workspace-setting.api';
import { SettingsContext } from './settings-context';

// ----------------------------------------------------------------------

const STORAGE_KEY = 'settings';
const FLOW_SETTING_KEY = 'flowSetting';

export function SettingsProvider({ children, defaultSettings }) {
  const { state, update, reset } = useLocalStorage(STORAGE_KEY, defaultSettings);
  const { state: flowSettingState, update: updateFlowSetting } = useLocalStorage(FLOW_SETTING_KEY, {
    debugMode: false,
    animatedEdge: true,
  });

  const workspaceId = getStorage(WORKSPACE_ID);

  const [openDrawer, setOpenDrawer] = useState(false);

  const isArabic = localStorageGetItem('i18nextLng') === 'ar';

  const [settingSystem, setSettingSystem] = useState({});

  const getSetting = useCallback(async (workspace_id) => {
    try {
      if (workspace_id) {
        const res = await getWorkspaceSettingApi(workspace_id);
        setSettingSystem(res?.data || {});
      }
    } catch (error) {
      /* empty */
    }
  }, []);

  useEffect(() => {
    const themeColors = {
      cyan: { main: '#078DEE', light: '#68CDF9' },
      purple: { main: '#7635dc', light: '#B985F4' },
      blue: { main: '#2065D1', light: '#76B0F1' },
      orange: { main: '#fda92d', light: '#FED680' },
      red: { main: '#FF3030', light: '#FFC1AC' },
      default: { main: '#00A76F', light: '#5BE49B' },
    };
    function getThemeColors(preset) {
      return themeColors[preset] || themeColors.default;
    }
    const theme = getThemeColors(state.themeColorPresets);
    document.documentElement.style.setProperty('--theme-color-main', theme.main);
    document.documentElement.style.setProperty('--theme-color-light', theme.light);
    document.documentElement.style.setProperty('--theme-color-light-alpha', theme.light + 20);
  }, [state.themeColorPresets]);

  useEffect(() => {
    if (window.location.pathname !== '/synchronizer-operator') {
      getSetting(workspaceId);
    }
  }, [getSetting, workspaceId]);

  useEffect(() => {
    if (isArabic) {
      onChangeDirectionByLang('ar');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArabic]);

  // Direction by lang
  const onChangeDirectionByLang = useCallback(
    (lang) => {
      update('themeDirection', lang === 'ar' ? 'rtl' : 'ltr');
    },
    [update]
  );

  // Drawer
  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const canReset = !isEqual(state, defaultSettings);

  const memoizedValue = useMemo(
    () => ({
      ...state,
      ...flowSettingState,
      settingSystem,
      setSettingSystem,
      updateWsSettingInfo: getSetting,
      onUpdate: update,
      updateFlowSetting,
      // Direction
      onChangeDirectionByLang,
      // Reset
      canReset,
      onReset: reset,
      // Drawer
      open: openDrawer,
      onToggle: onToggleDrawer,
      onClose: onCloseDrawer,
    }),
    [
      state,
      flowSettingState,
      settingSystem,
      getSetting,
      update,
      updateFlowSetting,
      onChangeDirectionByLang,
      canReset,
      reset,
      openDrawer,
      onToggleDrawer,
      onCloseDrawer,
    ]
  );

  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>;
}

SettingsProvider.propTypes = {
  children: PropTypes.node,
  defaultSettings: PropTypes.object,
};
