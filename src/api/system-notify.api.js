import axiosInstance, { endpoints } from 'src/utils/axios';

export const getSystemNotifyApi = async () => axiosInstance.get(endpoints.system_notify.get);

export const hideSystemNotifyApi = async (notifyId) =>
  axiosInstance.post(endpoints.system_notify.hide(notifyId));
