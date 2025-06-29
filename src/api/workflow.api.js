import { useCallback, useMemo, useState } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR, { mutate } from 'swr';

export const getListWorkFlow = (workspaceId, params) =>
  axiosInstance.get(endpoints.workFlow.workFlowList(workspaceId), { params });

export function useGetWorkFlowDetail(workspaceId, id) {
  const URL = workspaceId && id ? endpoints.workFlow.workFlowDetail(workspaceId, id) : null;
  const [isRefetching, setIsRefetching] = useState(false);

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const refetchWorkFlowDetail = useCallback(async () => {
    setIsRefetching(true);
    await mutate(URL);
    setIsRefetching(false);
  }, [URL]);

  const memoizedValue = useMemo(
    () => ({
      workflowInfo: data,
      workflowInfoLoading: isLoading || isRefetching,
      workflowInfoError: error,
      workflowInfoValidating: isValidating,
      refetchWorkFlowDetail,
    }),
    [data, error, isLoading, isRefetching, isValidating, refetchWorkFlowDetail]
  );

  return memoizedValue;
}

export const getWorkFlowDetail = (workspaceId, id) =>
  axiosInstance.get(endpoints.workFlow.workFlowDetail(workspaceId, id));

export const createWorkFlow = (workspaceId, payload) =>
  axiosInstance.post(endpoints.workFlow.workFlowCreate(workspaceId), payload);

export const updateWorkFlow = (workspaceId, id, payload) =>
  axiosInstance.put(endpoints.workFlow.workFlowUpdate(workspaceId, id), payload);

export const getListWorkFlowGroup = (workspaceId, params) =>
  axiosInstance.get(endpoints.workFlow.workFlowGroupList(workspaceId), {
    params,
  });

export const createWorkFlowGroup = (workspaceId, payload) =>
  axiosInstance.post(endpoints.workFlow.workFlowGroupCreate(workspaceId), payload);

export const updateWorkFlowGroup = (workspaceId, payload, id) =>
  axiosInstance.put(endpoints.workFlow.workFlowGroupUpdate(workspaceId, id), payload);

export const deleteWorkFlowGroup = (workspaceId, id) =>
  axiosInstance.delete(endpoints.workFlow.workFlowGroupDelete(workspaceId, id));

export const deleteWorkflow = (workspaceId, id) =>
  axiosInstance.delete(endpoints.workFlow.deleteWorkflow(workspaceId, id));

export const shareWorkflow = (workspaceId, data, id) =>
  axiosInstance.post(endpoints.workFlow.shareWorkflow(workspaceId, id), data);

export const importWorkflow = (workspaceId, payload) =>
  axiosInstance.post(endpoints.workFlow.importWorkflow(workspaceId), payload);

export const updateNewVersion = (workspaceId, id) =>
  axiosInstance.post(endpoints.workFlow.updateNewVersion(workspaceId, id));
