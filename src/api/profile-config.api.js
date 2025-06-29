import { useCallback, useMemo, useState } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR, { mutate } from 'swr';

export function useGetProfileConfig() {
  const URL = endpoints.profile_config.list;
  const [isRefetching, setIsRefetching] = useState(false);

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const refetchProfileConfig = useCallback(async () => {
    setIsRefetching(true);
    await mutate(URL);
    setIsRefetching(false);
  }, [URL]);

  const memoizedValue = useMemo(
    () => ({
      profileConfig: data,
      profileConfigLoading: isLoading || isRefetching,
      profileConfigError: error,
      profileConfigValidating: isValidating,
      refetchProfileConfig,
    }),
    [data, error, isLoading, isRefetching, isValidating, refetchProfileConfig]
  );

  return memoizedValue;
}

export const crateProfileConfigApi = (payload) =>
  axiosInstance.post(endpoints.profile_config.create, payload);

export const getDetailProfileConfigApi = (configId) =>
  axiosInstance.get(endpoints.profile_config.detail(configId));

export const updateProfileConfigApi = (configId, payload) =>
  axiosInstance.put(endpoints.profile_config.update(configId), payload);

export const deleteProfileConfigApi = (configId) =>
  axiosInstance.delete(endpoints.profile_config.delete(configId));
