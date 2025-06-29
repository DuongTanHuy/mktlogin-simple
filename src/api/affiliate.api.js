import { useMemo } from 'react';
import { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR from 'swr';

export function useGetAnalyticsSummary() {
  const URL = endpoints.affiliate.analytic_summary;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const memoizedValue = useMemo(
    () => ({
      analyticData: data?.data || {},
      analyticLoading: isLoading,
      analyticError: error,
      analyticValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
