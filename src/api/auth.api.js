import { useCallback, useMemo, useState } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR, { mutate } from 'swr';

export const forgotPasswordApi = (payload) =>
  axiosInstance.post(endpoints.auth.forgot_password, payload);

export const checkResetTokenApi = (payload) =>
  axiosInstance.post(endpoints.auth.check_reset_token, payload);

export const passwordResetApi = (payload) =>
  axiosInstance.post(endpoints.auth.password_reset, payload);

export const loginGoogleApi = (payload) => axiosInstance.post(endpoints.auth.login_google, payload);

// OAUTH LOGIN
export const oauthLoginApi = (payload) => axiosInstance.post(endpoints.auth.oauth_login, payload);

export const oauthGoogleLoginApi = (payload) =>
  axiosInstance.post(endpoints.auth.oauth_google_login, payload);

export const acceptOauthApi = (payload) => axiosInstance.post(endpoints.auth.oauth_accept, payload);

export const deniedOauthApi = (payload) => axiosInstance.post(endpoints.auth.oauth_denied, payload);

export const getGoogleAuthUrlApi = () => axiosInstance.get(endpoints.auth.google_auth_url);

export const logoutMultiDevice = (payload) =>
  axiosInstance.post(endpoints.auth.logout_multi_device, payload);

export const getListDeviceApi = () => axiosInstance.get(endpoints.auth.list_device);

export function useGetListDevice() {
  const URL = endpoints.auth.list_device;
  const [isRefetching, setIsRefetching] = useState(false);

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const refetchDeviceData = useCallback(async () => {
    setIsRefetching(true);
    await mutate(URL);
    setIsRefetching(false);
  }, [URL]);

  const memoizedValue = useMemo(
    () => ({
      deviceData: data?.data ?? [],
      deviceLoading: isLoading || isRefetching,
      deviceError: error,
      deviceValidating: isValidating,
      refetchDeviceData,
    }),
    [data, error, isLoading, isRefetching, isValidating, refetchDeviceData]
  );

  return memoizedValue;
}
