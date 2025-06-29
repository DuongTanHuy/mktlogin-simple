import { useCallback, useMemo, useState } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR, { mutate } from 'swr';

export function useGlobalSetting(workspaceId, id) {
  const URL = endpoints.global_setting.get;
  const [isRefetching, setIsRefetching] = useState(false);

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const refetchGlobalSetting = useCallback(async () => {
    setIsRefetching(true);
    await mutate(URL);
    setIsRefetching(false);
  }, [URL]);

  const memoizedValue = useMemo(
    () => ({
      globalSetting: data?.data || {},
      globalSettingLoading: isLoading || isRefetching,
      globalSettingError: error,
      globalSettingValidating: isValidating,
      refetchGlobalSetting,
    }),
    [data, error, isLoading, isRefetching, isValidating, refetchGlobalSetting]
  );

  return memoizedValue;
}

export const updateGlobalSetting = (payload) =>
  axiosInstance.put(endpoints.global_setting.update, payload);

export const getGlobalSetting = () => axiosInstance.get(endpoints.global_setting.get);
