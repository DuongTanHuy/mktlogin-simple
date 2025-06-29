import axiosInstance, { endpoints } from 'src/utils/axios';

export const randomUserAgentApi = (payload) =>
  axiosInstance.post(endpoints.random.userAgent, payload);

export const randomFingerPrintApi = (payload) =>
  axiosInstance.post(endpoints.random.fingerPrint, payload);
