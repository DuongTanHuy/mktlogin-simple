import { useCallback, useMemo, useState } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR, { mutate } from 'swr';

export function useGetTaskById(workspaceId, taskId) {
  const URL = workspaceId && taskId ? endpoints.task.detail(workspaceId, taskId) : null;
  const [isRefetching, setIsRefetching] = useState(false);

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const refetchTaskDetail = useCallback(async () => {
    setIsRefetching(true);
    await mutate(URL);
    setIsRefetching(false);
  }, [URL]);

  const memoizedValue = useMemo(
    () => ({
      task: data?.data || {},
      taskLoading: isLoading || isRefetching,
      taskError: error,
      taskValidating: isValidating,
      refetchTaskDetail,
    }),
    [data?.data, error, isLoading, isRefetching, isValidating, refetchTaskDetail]
  );

  return memoizedValue;
}

export const createRpaApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.task.create(workspaceId), payload);

export const updateRpaApi = (workspaceId, taskId, payload) =>
  axiosInstance.put(endpoints.task.update(workspaceId, taskId), payload);

export const getListTaskApi = (workspaceId, params) =>
  axiosInstance.get(endpoints.task.list(workspaceId), { params });

export const getTaskByIdApi = (workspaceId, taskId) =>
  axiosInstance.get(endpoints.task.detail(workspaceId, taskId));

export const deleteTaskByIdApi = (workspaceId, taskId) =>
  axiosInstance.delete(endpoints.task.delete(workspaceId, taskId));

export const deleteMultiTaskApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.task.deleteMulti(workspaceId), payload);

export const scheduledTaskApi = (workspaceId, taskId, payload) =>
  axiosInstance.post(endpoints.task.schedule(workspaceId, taskId), payload);

export const addTaskProfileApi = (workspaceId, taskId, payload) =>
  axiosInstance.post(endpoints.task.profile.add(workspaceId, taskId), payload);

export const removeTaskProfileApi = (workspaceId, taskId, payload) =>
  axiosInstance.post(endpoints.task.profile.remove(workspaceId, taskId), payload);
