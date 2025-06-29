import { useMemo } from 'react';
import { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR from 'swr';

export function useGetBanner() {
  const URL = endpoints.banner.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const memoizedValue = useMemo(
    () => ({
      banner: data?.data || [],
      bannerLoading: isLoading,
      bannerError: error,
      bannerValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
