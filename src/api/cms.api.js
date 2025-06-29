import { useMemo } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR from 'swr';

// KERNEL VERSION
export const getKernelVersionsApi = (params) =>
  axiosInstance.get(endpoints.cms.listKernelVersions, { params });

export const getKernelVersionByIdApi = (id) =>
  axiosInstance.get(endpoints.cms.getKernelVersionById(id));

export const useGetKernelVersions = (params) => {
  const URL = endpoints.cms.listKernelVersions;

  const { data } = useSWR([URL, params], fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1000 * 60 * 60,
  });

  const memoizedValue = useMemo(
    () => ({
      kernelData: data?.data,
    }),
    [data]
  );

  return memoizedValue;
};

// BROWSER VERSION
export const getBrowserVersionsApi = (params) =>
  axiosInstance.get(endpoints.cms.listBrowserVersion, { params });

export const useGetBrowserVersions = (params) => {
  const URL = endpoints.cms.listBrowserVersion;
  const { data } = useSWR(params ? [URL, params] : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1000 * 60 * 60,
  });

  const memoizedValue = useMemo(
    () => ({
      browserVersionData: data?.data,
    }),
    [data]
  );

  return memoizedValue;
};

// WORK PERMISSIONS
export const getWorkPermissionsApi = () => axiosInstance.get(endpoints.cms.getWorkPermissions);

// PROFILE PACKAGES
export const getProfilePackagesApi = () => axiosInstance.get(endpoints.cms.getProfilePackage);

export const buyProfilePackagesApi = (payload) =>
  axiosInstance.post(endpoints.cms.buyProfilePackage, payload);

export function useGetProfilePackage() {
  const URL = endpoints.cms.getProfilePackage;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const memoizedValue = useMemo(
    () => ({
      packageData: data,
      packageLoading: isLoading,
      packageError: error,
      packageValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export const getListVoucherApi = () => axiosInstance.get(endpoints.cms.listVoucher);
