import { useMemo } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR from 'swr';

export const getListSupportChanel = () => axiosInstance.get(endpoints.system_config.list);

export function useGetSupportChanel() {
  const URL = endpoints.system_config.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const memoizedValue = useMemo(
    () => ({
      chanel: data || {},
      chanelLoading: isLoading,
      chanelError: error,
      chanelValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
