import axiosInstance, { endpoints } from 'src/utils/axios';

export const inviteMemberApi = (workspaceId, payload) =>
  axiosInstance.post(endpoints.invite.invite_member(workspaceId), payload);

export const getSendListApi = (workspaceId, params) =>
  axiosInstance.get(endpoints.invite.send_list(workspaceId), { params });

export const resendInviteApi = (workspaceId, inviteId) =>
  axiosInstance.post(endpoints.invite.resend(workspaceId, inviteId));

export const revokeInviteApi = (workspaceId, inviteId) =>
  axiosInstance.post(endpoints.invite.revoke(workspaceId, inviteId));

export const acceptInviteApi = (inviteId) => axiosInstance.post(endpoints.invite.accept(inviteId));

export const denyInviteApi = (inviteId) => axiosInstance.post(endpoints.invite.deny(inviteId));

export const getInviteDetailApi = (inviteId) => axiosInstance.get(endpoints.invite.detail(inviteId));
