import { useMemo } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR from 'swr';

export function useGetTaskById(workspaceId, taskId) {
  const URL = workspaceId && taskId ? endpoints.task.detail(workspaceId, taskId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const memoizedValue = useMemo(
    () => ({
      task: data?.data || {},
      taskLoading: isLoading,
      taskError: error,
      taskValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export const createScheduleApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.schedule.create(workspaceId), payload);

export const updateRpaApi = (workspaceId, taskId, payload) =>
  axiosInstance.put(endpoints.task.update(workspaceId, taskId), payload);

export const getListScheduleApi = (workspaceId, params) =>
  axiosInstance.get(endpoints.schedule.list(workspaceId), { params });

export const getDetailScheduleApi = (workspaceId, scheduleId) =>
  axiosInstance.get(endpoints.schedule.detail(workspaceId, scheduleId));

export function useGetScheduleById(workspaceId, scheduleId) {
  const URL = workspaceId && scheduleId ? endpoints.schedule.detail(workspaceId, scheduleId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const memoizedValue = useMemo(
    () => ({
      schedule: data?.data || {},
      scheduleLoading: isLoading,
      scheduleError: error,
      scheduleValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export const updateScheduleApi = (workspaceId, scheduleId, payload) =>
  axiosInstance.put(endpoints.schedule.update(workspaceId, scheduleId), payload);

export const deleteScheduleApi = (workspaceId, scheduleId) =>
  axiosInstance.delete(endpoints.schedule.delete(workspaceId, scheduleId));

export const deleteMultiScheduleApi = (workspaceId, payload) =>
  axiosInstance.delete(endpoints.schedule.deleteMulti(workspaceId), { data: payload });
