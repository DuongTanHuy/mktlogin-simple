import axiosInstance, { endpoints } from 'src/utils/axios';

export const trackingClick = (url) =>
  axiosInstance.get(endpoints.tracking.click(), { params: { url } });
