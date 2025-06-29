import axiosInstance, { endpoints } from 'src/utils/axios';

export const getListTrashApi = (workspaceId, params) =>
  axiosInstance.get(endpoints.trash.list(workspaceId), { params });

export const restoreProfilesApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.trash.restore(workspaceId), payload);
