import axiosInstance, { endpoints } from 'src/utils/axios';

export const getAutomationScripts = () => axiosInstance.get(endpoints.automation.scripts());
