import { useCallback, useMemo, useState } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR, { mutate } from 'swr';

export function useGetWorkspace(workspaceId, id) {
  const URL = workspaceId ? endpoints.workspace.get(workspaceId) : null;
  const [isRefetching, setIsRefetching] = useState(false);

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const refetchWorkspace = useCallback(async () => {
    setIsRefetching(true);
    await mutate(URL);
    setIsRefetching(false);
  }, [URL]);

  const memoizedValue = useMemo(
    () => ({
      workspace: data,
      workspaceLoading: isLoading || isRefetching,
      workspaceError: error,
      workspaceValidating: isValidating,
      refetchWorkspace,
    }),
    [data, error, isLoading, isRefetching, isValidating, refetchWorkspace]
  );

  return memoizedValue;
}

export const getListWorkspace = (params) => axiosInstance.get(endpoints.workspace.list, { params });

export const deleteListWorkspace = (workspaceId) =>
  axiosInstance.delete(endpoints.workspace.delete(workspaceId));

export const createWorkspace = (payload) => axiosInstance.post(endpoints.workspace.create, payload);

export const updateWorkspace = (workspaceId, payload) =>
  axiosInstance.put(endpoints.workspace.update(workspaceId), payload);

export const getAccountBalance = (workspaceId) =>
  axiosInstance.get(endpoints.workspace.assets_info(workspaceId));
