import axiosInstance, { endpoints } from 'src/utils/axios';

export const getListTagApi = (workspaceId) => axiosInstance.get(endpoints.tags.list(workspaceId));

export const createTagApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.tags.create(workspaceId), payload);

export const updateTagApi = (workspaceId, tagId, payload) =>
  axiosInstance.put(endpoints.tags.update(workspaceId, tagId), payload);

export const deleteTagApi = (workspaceId, tagId) =>
  axiosInstance.delete(endpoints.tags.delete(workspaceId, tagId));

export const setSingleProfileTagApi = (workspaceId, profileId, payload) =>
  axiosInstance.put(endpoints.tags.setSingleProfileTag(workspaceId, profileId), payload);

export const setMultiProfileTagApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.tags.setMultiProfileTag(workspaceId), payload);

export const removeMultiProfileTagApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.tags.removeMultiProfileTag(workspaceId), payload);
