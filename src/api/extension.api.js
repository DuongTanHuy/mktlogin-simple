import axiosInstance, { endpoints } from 'src/utils/axios';

export const getListExtensionAPi = (workspaceId, params) =>
  axiosInstance.get(endpoints.extension.list(workspaceId), { params });

export const getListUserExtensionAPi = (params) =>
  axiosInstance.get(endpoints.extension.list_of_user, { params });

export const addExtensionApi = (id) => axiosInstance.post(endpoints.extension.add(id));

export const removeExtensionApi = (id) => axiosInstance.post(endpoints.extension.remove(id));

export const turnOnExtensionApi = (id) => axiosInstance.post(endpoints.extension.on(id));

export const turnOffExtensionApi = (id) => axiosInstance.post(endpoints.extension.off(id));

export const uploadUrlExtensionApi = (payload) =>
  axiosInstance.post(endpoints.extension.uploadUrl, payload);

export const uploadFileExtensionApi = (formData) =>
  axiosInstance.post(endpoints.extension.uploadFile, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

// V2
export const getExtensionOfWorkspaceApi = (workspaceId, params) =>
  axiosInstance.get(endpoints.extension.list_of_workspace(workspaceId), { params });

export const addExtensionApiV2 = (workspaceId, extensionId) =>
  axiosInstance.post(endpoints.extension.addV2(workspaceId, extensionId));

export const removeExtensionApiV2 = (workspaceId, extensionId) =>
  axiosInstance.post(endpoints.extension.removeV2(workspaceId, extensionId));

export const turnOnExtensionApiV2 = (workspaceId, extensionId) =>
  axiosInstance.post(endpoints.extension.turnOn(workspaceId, extensionId));

export const turnOffExtensionApiV2 = (workspaceId, extensionId) =>
  axiosInstance.post(endpoints.extension.turnOff(workspaceId, extensionId));

export const uploadUrlExtensionApiV2 = (workspaceId, payload) =>
  axiosInstance.post(endpoints.extension.uploadUrlV2(workspaceId), payload);

export const uploadFileExtensionApiV2 = (workspaceId, formData) =>
  axiosInstance.post(endpoints.extension.uploadFileV2(workspaceId), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
