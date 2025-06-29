import axiosInstance, { endpoints } from 'src/utils/axios';

export const getWorkgroupUserApi = (workspaceId, userId) =>
  axiosInstance.get(endpoints.workgroup_user.user_info(workspaceId, userId));

export const updateWorkgroupUserApi = (workspaceId, userId, payload) =>
  axiosInstance.put(endpoints.workgroup_user.update(workspaceId, userId), payload);

export const deleteWorkgroupUserApi = (workspaceId, userId) =>
  axiosInstance.delete(endpoints.workgroup_user.delete(workspaceId, userId));
