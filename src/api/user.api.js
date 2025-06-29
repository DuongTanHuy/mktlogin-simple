import { useMemo } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR from 'swr';

export const changePasswordApi = (payload) =>
  axiosInstance.post(endpoints.auth.change_password, payload);

export const updateUserInfoApi = (payload) => axiosInstance.put(endpoints.auth.me, payload);

export function useGetUserInfo() {
  const URL = endpoints.auth.me;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const memoizedValue = useMemo(
    () => ({
      userInfo: data,
      userInfoLoading: isLoading,
      userInfoError: error,
      userInfoValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
