import axiosInstance, { endpoints } from 'src/utils/axios';

export const getWorkflowCategoryApi = () => axiosInstance.get(endpoints.workflowCategory.list);
