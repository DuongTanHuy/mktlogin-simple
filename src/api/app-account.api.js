import axiosInstance, { endpoints } from 'src/utils/axios';

export const linkToAppAccountApi = (payload) =>
  axiosInstance.post(endpoints.app_account.create, payload);

export const getListAppAccountApi = (params) =>
  axiosInstance.get(endpoints.app_account.list, { params });

export const deleteLinkAppAccountApi = (accountId) =>
  axiosInstance.delete(endpoints.app_account.delete(accountId));

export const refreshTokenAppAccountApi = (accountId) =>
  axiosInstance.post(endpoints.app_account.refreshToken(accountId));
