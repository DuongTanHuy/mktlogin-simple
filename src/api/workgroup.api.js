import { useCallback, useMemo, useState } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR, { mutate } from 'swr';

export function useGetWorkspacePermissions(workspaceId, workgroupId) {
  const URL =
    workgroupId && workgroupId
      ? endpoints.workgroup.workgroup_info(workspaceId, workgroupId)
      : null;

  const [isRefetching, setIsRefetching] = useState(false);

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const refetchWorkspacePermissions = useCallback(async () => {
    setIsRefetching(true);
    await mutate(URL);
    setIsRefetching(false);
  }, [URL]);

  const memoizedValue = useMemo(
    () => ({
      permissions: data?.permissions || [],
      permissionsLoading: isLoading || isRefetching,
      permissionsError: error,
      permissionsValidating: isValidating,
      refetchWorkspacePermissions,
    }),
    [data, error, isLoading, isRefetching, isValidating, refetchWorkspacePermissions]
  );

  return memoizedValue;
}

export const getListWorkgroupApi = (workspaceId) =>
  axiosInstance.get(endpoints.workgroup.list(workspaceId));

export const getWorkgroupInfoApi = (workspaceId, workgroupId) =>
  axiosInstance.get(endpoints.workgroup.workgroup_info(workspaceId, workgroupId));

export const createWorkgroupApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.workgroup.create(workspaceId), payload);

export const deleteWorkgroupApi = (workspaceId, workgroupId) =>
  axiosInstance.delete(endpoints.workgroup.delete(workspaceId, workgroupId));

export const updateWorkgroupApi = (workspaceId, workgroupId, payload) =>
  axiosInstance.put(endpoints.workgroup.update(workspaceId, workgroupId), payload);

export const getWorkgroupMemberApi = (workspaceId, workgroupId) =>
  axiosInstance.get(endpoints.workgroup.list_member(workspaceId, workgroupId));
