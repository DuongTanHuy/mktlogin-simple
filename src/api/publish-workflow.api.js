import { useMemo } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR from 'swr';

export const getPublishWorkflowApi = (params) =>
  axiosInstance.get(endpoints.publishWorkflow.list, { params });

export function useGetPublishWorkflowDetail(workflowId, workspaceId = null) {
  let url = workflowId ? endpoints.publishWorkflow.detail(workflowId) : null;
  if (workspaceId) {
    url += `?workspace_id=${workspaceId}`;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetcher, OPTIONS_FETCH);

  const memoizedValue = useMemo(
    () => ({
      workflow: data || {},
      workflowLoading: isLoading,
      workflowError: error,
      workflowValidating: isValidating,
      reload: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

export const publishWorkflowApi = (workspaceId, workflowId, data) =>
  axiosInstance.post(endpoints.publishWorkflow.publish(workspaceId, workflowId), data);

export const updateWorkFlowApi = (workflowId, data) =>
  axiosInstance.put(endpoints.publishWorkflow.update(workflowId), data);

export const unpublishWorkFlowApi = (publicWorkflowId) =>
  axiosInstance.delete(endpoints.publishWorkflow.unpublish(publicWorkflowId));

export const uploadNewVersionApi = (publicWorkflowId, data) =>
  axiosInstance.post(endpoints.publishWorkflow.uploadNewVersion(publicWorkflowId), data);

export const downloadPublicWorkflowApi = (publicWorkflowId, data) =>
  axiosInstance.post(endpoints.publishWorkflow.download(publicWorkflowId), data);
