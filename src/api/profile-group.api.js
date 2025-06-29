import axiosInstance, { endpoints } from 'src/utils/axios';

export const getListGroupProfileApi = (workspaceId) =>
  axiosInstance.get(endpoints.group_profile.list(workspaceId));

export const createGroupProfileApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.group_profile.create(workspaceId), payload);

export const updateGroupProfileApi = (workspaceId, profileGroupId, payload) =>
  axiosInstance.put(endpoints.group_profile.update(workspaceId, profileGroupId), payload);

export const deleteProfileGroupApi = (workspaceId, profileGroupId) =>
  axiosInstance.delete(endpoints.group_profile.delete(workspaceId, profileGroupId));
