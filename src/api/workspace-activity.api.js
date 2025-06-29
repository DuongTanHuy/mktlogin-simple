import axiosInstance, { endpoints } from 'src/utils/axios';

export const getGeneralLogApi = (workspaceId, params, signal) =>
  axiosInstance.get(endpoints.workspace_activity.list(workspaceId), {
    params,
    ...(signal && { signal }),
  });
