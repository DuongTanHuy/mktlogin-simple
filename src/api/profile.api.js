import { useMemo } from 'react';
import axiosInstance, { axiosInstance_VN, endpoints, fetcher } from 'src/utils/axios';
import { OPTIONS_FETCH } from 'src/utils/constance';
import useSWR from 'swr';

export function useGetProfileById(workspaceId, profileId) {
  const URL = workspaceId && profileId ? endpoints.profile.getById(workspaceId, profileId) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, OPTIONS_FETCH);

  const memoizedValue = useMemo(
    () => ({
      profile: data,
      profileLoading: isLoading,
      profileError: error,
      profileValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------

export const createProfileApi = (workspaceId, data) =>
  axiosInstance.post(endpoints.profile.create(workspaceId), data);

export const importProfileApi = (workspaceId, data) =>
  axiosInstance.post(endpoints.profile.import(workspaceId), data);

export const batchCreateProfileApi = (workspaceId, data) =>
  axiosInstance.post(endpoints.profile.batchCreate(workspaceId), data);

export const updateProfileApi = (workspaceId, profileId, payload) =>
  axiosInstance.put(endpoints.profile.update(workspaceId, profileId), payload);

// export const getListProfileApi = (workspaceId, param, timeout = 60000, cancelToken) =>
//   axiosInstance.get(endpoints.profile.list(`${workspaceId}`, param), { timeout, cancelToken });

export const getListProfileApi = (workspaceId, param, abortSignal) =>
  axiosInstance.get(endpoints.profile.list(`${workspaceId}`, param), {
    ...(abortSignal ? { signal: abortSignal } : {}),
  });

export const openMultiProfileApi = (workspaceId, params) =>
  axiosInstance.get(endpoints.profile.openMulti(workspaceId), { params });

export const getListProfileApiVN = (workspaceId, param) =>
  axiosInstance_VN.get(endpoints.profile.list(workspaceId, param));

export const getProfileByIdApi = (workspaceId, profileId) =>
  axiosInstance.get(endpoints.profile.getById(workspaceId, profileId));

export const getProfileByIdForOpenApi = (workspaceId, profileId) =>
  axiosInstance.get(endpoints.profile.getByIdForOpen(workspaceId, profileId));

export const updateProfileCookieByIdApi = (workspaceId, profileId, dataUpdate) =>
  axiosInstance.put(endpoints.profile.updateCookieById(workspaceId, profileId), dataUpdate);

export const deleteProfileApi = (workspaceId, profileId) =>
  axiosInstance.delete(endpoints.profile.delete(workspaceId, profileId));

export const deleteMultiProfileApi = (workspaceId, payload) =>
  axiosInstance.delete(endpoints.profile.multiDelete(workspaceId), { data: payload });

export const renewProfilesApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.renew(workspaceId), payload);

export const autoRenewProfilesApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.autoRenew(workspaceId), payload);

export const enableAutoRenewProfilesApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.enableAutoRenew(workspaceId), payload);

export const disableAutoRenewProfilesApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.disableAutoRenew(workspaceId), payload);

export const transferProfilesApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.transfer(workspaceId), payload);

export const moveGroupProfileApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.moveGroup(workspaceId), payload);

export const duplicateProfileApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.duplicate(workspaceId), payload);

export const updateProxyApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.updateProxy(workspaceId), payload);

export const importAccountResourceApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.importAccountResource(workspaceId), payload);

export const updateMultiNoteApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.updateMultiNote(workspaceId), payload);

export const updateMultiKernelApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.updateMultiKernel(workspaceId), payload);

export const addMultiBookmarkApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.addMultiBookmark(workspaceId), payload);

export const deleteMultiBookmarkApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.deleteMultiBookmark(workspaceId), payload);

export const addMultiTabApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.addMultiTabApi(workspaceId), payload);

export const deleteMultiTabApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.deleteMultiTabApi(workspaceId), payload);

export const moveWorkspaceApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.moveWorkspace(workspaceId), payload);

// ACCOUNT RESOURCE

export const updateAccountResourceApi = (workspaceId, profileId, resourceType, payload) =>
  axiosInstance.put(
    endpoints.profile.updateAccountResource(workspaceId, profileId, resourceType),
    payload
  );

export const checkRunWorkflowPermissionApi = (workspaceId) =>
  axiosInstance.get(endpoints.profile.checkRunWorkflowPermission(workspaceId));

export const removeMultiProxyApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.removeMultiProxy(workspaceId), payload);

export const deleteMultiCookieApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.profile.deleteMultiCookie(workspaceId), payload);

export const deleteMultiCacheApi = () => axiosInstance.post(endpoints.profile.deleteMultiCache);
