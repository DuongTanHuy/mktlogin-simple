import { useMemo } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR from 'swr';

export function useGetWorkspaceSetting(workspaceId) {
  const URL = workspaceId ? endpoints.workspace_setting.get(workspaceId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const memoizedValue = useMemo(
    () => ({
      setting: data,
      settingLoading: isLoading,
      settingError: error,
      settingValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export const getWorkspaceSettingApi = (workspaceId) =>
  axiosInstance.get(endpoints.workspace_setting.get(workspaceId));

export const updateWorkspaceSettingApi = (workspaceId, payload) =>
  axiosInstance.put(endpoints.workspace_setting.update(workspaceId), payload);
