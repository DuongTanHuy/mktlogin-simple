import axios from 'axios';
// config
import { HOST_API } from 'src/config-global';
import { getStorage, clearSession, clearStorage } from 'src/hooks/use-local-storage';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: HOST_API,
});

const axiosInstance_VN = axios.create({
  baseURL: 'https://net.cronpost.net',
});

axiosInstance.interceptors.request.use((config) => {
  const token = getStorage('accessToken');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

axiosInstance_VN.interceptors.request.use((config) => {
  const token = getStorage('accessToken');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isCancel(error)) {
      throw new axios.Cancel('Request canceled');
    }
    if (error?.response?.status === 401) {
      clearStorage();
      clearSession();
      if (error?.response?.config?.url) {
        const path = error.response.config.url;
        if (['login', 'request', 'approve', 'deny'].includes(path.split('/').pop())) {
          return Promise.reject((error.response && error.response.data) || 'Something went wrong');
        }
      }
      window.location.href = paths.auth.jwt.login;
      return false;
    }
    return Promise.reject((error.response && error.response.data) || 'Something went wrong');
  }
);

axiosInstance_VN.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      clearStorage();
      clearSession();
      if (error?.response?.config?.url) {
        const path = error.response.config.url;
        if (path.split('/').pop() === 'login') {
          return Promise.reject((error.response && error.response.data) || 'Something went wrong');
        }
      }
      window.location.href = paths.auth.jwt.login;
      return false;
    }
    return Promise.reject((error.response && error.response.data) || 'Something went wrong');
  }
);

export default axiosInstance;
export { axiosInstance_VN };

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, params] = Array.isArray(args) ? args : [args];
  if (!url) {
    return null;
  }

  const res = await axiosInstance.get(url, {
    baseURL: HOST_API,
    params,
  });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/api/v1/me',
    login: '/api/v1/auth/login',
    google_login: '/api/v1/auth/login/google',
    login_google: '/api/v1/auth/google/authenticate',
    loginOtp: '/api/v1/auth/otp',
    resend_otp: '/api/v1/auth/otp/resend',
    register: '/api/v1/auth/register',
    logout: '/api/v1/auth/logout',
    change_password: '/api/v1/auth/change-password',
    forgot_password: '/api/v1/auth/forgot',
    check_reset_token: '/api/v1/auth/reset-token',
    password_reset: '/api/v1/auth/password-reset',
    oauth_login: '/api/v1/o/request',
    oauth_google_login: '/api/v1/o/google',
    oauth_accept: '/api/v1/o/approve',
    oauth_denied: '/api/v1/o/deny',
    google_auth_url: '/api/v1/auth/login/google-link',
    list_device: '/api/v1/devices',
    logout_multi_device: '/api/v1/devices/logout',
  },
  profile: {
    create: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles`,
    import: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/bulk-import`,
    batchCreate: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/batch-create`,
    update: (workspaceId, profileId) => `/api/v1/workspaces/${workspaceId}/profiles/${profileId}`,
    list: (workspaceId, param) => `/api/v1/workspaces/${workspaceId}/profiles${param || ''}`,
    openMulti: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/open`,
    getById: (workspaceId, profileId) => `/api/v1/workspaces/${workspaceId}/profiles/${profileId}`,
    getByIdForOpen: (workspaceId, profileId) =>
      `/api/v1/workspaces/${workspaceId}/profiles/${profileId}/open`,
    updateCookieById: (workspaceId, profileId) =>
      `/api/v1/workspaces/${workspaceId}/profiles/${profileId}/cookie`,
    delete: (workspaceId, profileId) => `/api/v1/workspaces/${workspaceId}/profiles/${profileId}`,
    multiDelete: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/remove`,
    renew: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/renew`,
    autoRenew: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/bulk-update-auto-renew`,
    enableAutoRenew: (workspaceId) =>
      `/api/v1/workspaces/${workspaceId}/profiles/enable-auto-renew`,
    disableAutoRenew: (workspaceId) =>
      `/api/v1/workspaces/${workspaceId}/profiles/disable-auto-renew`,
    transfer: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/transfer`,
    moveGroup: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/move-group`,
    duplicate: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/duplicate`,
    updateProxy: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/bulk-update-proxy`,
    importAccountResource: (workspaceId) =>
      `/api/v1/workspaces/${workspaceId}/profiles/import-account-resource`,
    updateAccountResource: (workspaceId, profileId, resourceType) =>
      `/api/v1/workspaces/${workspaceId}/profiles/${profileId}/account-resource/${resourceType}`,
    updateMultiNote: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/bulk-update-note`,
    updateMultiKernel: (workspaceId) =>
      `/api/v1/workspaces/${workspaceId}/profiles/bulk-update-browser-kernel`,
    moveWorkspace: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/move-workspace`,
    addMultiBookmark: (workspaceId) =>
      `/api/v1/workspaces/${workspaceId}/profiles/bulk-add-bookmark`,
    deleteMultiBookmark: (workspaceId) =>
      `/api/v1/workspaces/${workspaceId}/profiles/bulk-delete-bookmark`,
    addMultiTabApi: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/bulk-add-tab`,
    deleteMultiTabApi: (workspaceId) =>
      `/api/v1/workspaces/${workspaceId}/profiles/bulk-delete-tab`,
    checkRunWorkflowPermission: (workspaceId) =>
      `/api/v1/workspaces/${workspaceId}/workflows/check-permission-run`,
    removeMultiProxy: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/remove-proxy`,
    deleteMultiCookie: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/clear-cookie`,
    deleteMultiCache: '/api/v1/profiles/remove-cache',
  },
  trash: {
    list: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/trash`,
    restore: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/restore`,
  },
  group_profile: {
    list: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profile-groups`,
    create: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profile-groups`,
    update: (workspaceId, profileGroupId) =>
      `/api/v1/workspaces/${workspaceId}/profile-groups/${profileGroupId}`,
    delete: (workspaceId, profileGroupId) =>
      `/api/v1/workspaces/${workspaceId}/profile-groups/${profileGroupId}`,
  },
  workspace: {
    list: '/api/v1/workspaces',
    create: '/api/v1/workspaces',
    get: (workspaceId) => `/api/v1/workspaces/${workspaceId}`,
    delete: (workspaceId) => `/api/v1/workspaces/${workspaceId}`,
    assets_info: (workspaceId) => `/api/v1/workspaces/${workspaceId}/assets-info`,
    update: (workspaceId) => `/api/v1/workspaces/${workspaceId}`,
  },
  workspace_setting: {
    get: (workspaceId) => `/api/v1/workspaces/${workspaceId}/setting`,
    update: (workspaceId) => `/api/v1/workspaces/${workspaceId}/setting`,
  },
  cms: {
    listKernelVersions: '/api/v1/cms/kernel-versions',
    listBrowserVersion: '/api/v1/cms/browser-versions',
    getKernelVersionById: (id) => `/api/v1/cms/kernel-versions/${id}`,
    getWorkPermissions: '/api/v1/cms/work-permissions',
    getProfilePackage: '/api/v1/cms/profile-packages',
    buyProfilePackage: '/api/v1/profile-packages/buy',
    listVoucher: '/api/v1/vouchers',
  },
  random: {
    userAgent: '/api/v1/random/useragent-v3',
    fingerPrint: '/api/v1/random/fingerprint',
  },
  invite: {
    invite_member: (workspaceId) => `/api/v1/workspaces/${workspaceId}/invite-requests`,
    send_list: (workspaceId) => `/api/v1/workspaces/${workspaceId}/invite-requests/sent`,
    resend: (workspaceId, inviteId) =>
      `/api/v1/workspaces/${workspaceId}/invite-requests/${inviteId}/resend`,
    revoke: (workspaceId, inviteId) =>
      `/api/v1/workspaces/${workspaceId}/invite-requests/${inviteId}/revoke`,
    accept: (inviteId) => `/api/v1/invite-requests/${inviteId}/accept`,
    deny: (inviteId) => `/api/v1/invite-requests/${inviteId}/deny`,
    detail: (inviteId) => `/api/v1/invite-requests/${inviteId}`,
  },
  // /api/v1/workspaces/{{workspace_id}}/workflows
  workFlow: {
    workFlowGroupCreate: (workspaceId) => `/api/v1/workspaces/${workspaceId}/workflow-groups`,
    workFlowGroupUpdate: (workspaceId, id) =>
      `/api/v1/workspaces/${workspaceId}/workflow-groups/${id}`,
    workFlowGroupDelete: (workspaceId, id) =>
      `/api/v1/workspaces/${workspaceId}/workflow-groups/${id}`,
    workFlowGroupList: (workspaceId) => `/api/v1/workspaces/${workspaceId}/workflow-groups`,
    workFlowCreate: (workspaceId) => `/api/v1/workspaces/${workspaceId}/workflows`,
    workFlowUpdate: (workspaceId, id) => `/api/v1/workspaces/${workspaceId}/workflows/${id}`,
    workFlowList: (workspaceId) => `/api/v1/workspaces/${workspaceId}/workflows`,
    workFlowDetail: (workspaceId, id) => `/api/v1/workspaces/${workspaceId}/workflows/${id}`,
    deleteWorkflow: (workspaceId, id) => `/api/v1/workspaces/${workspaceId}/workflows/${id}`,
    shareWorkflow: (workspaceId, id) =>
      `/api/v1/workspaces/${workspaceId}/workflows/${id}/generate-activation-code`,
    importWorkflow: (workspaceId) => `/api/v1/workspaces/${workspaceId}/workflows/import`,
    updateNewVersion: (workspaceId, id) =>
      `/api/v1/workspaces/${workspaceId}/workflows/${id}/update-new-version`,
  },
  workflowCategory: {
    list: '/api/v1/rpa/workflow-categories',
  },
  publishWorkflow: {
    list: '/api/v1/public-workflows',
    detail: (workflowId) => `/api/v1/public-workflows/${workflowId}`,
    publish: (workspaceId, workflowId) =>
      `/api/v1/workspaces/${workspaceId}/workflows/${workflowId}/publish`,
    update: (workflowId) => `/api/v1/public-workflows/${workflowId}`,
    unpublish: (workflowId) => `/api/v1/public-workflows/${workflowId}`,
    uploadNewVersion: (workflowId) => `/api/v1/public-workflows/${workflowId}/upload-new-version`,
    download: (workflowId) => `/api/v1/public-workflows/${workflowId}/download`,
  },
  workgroup: {
    workgroup_info: (workspaceId, workgroupId) =>
      `/api/v1/workspaces/${workspaceId}/workgroups/${workgroupId}`,
    list: (workspaceId) => `/api/v1/workspaces/${workspaceId}/workgroups`,
    list_member: (workspaceId, workgroupId) =>
      `/api/v1/workspaces/${workspaceId}/workgroups/${workgroupId}/members`,
    create: (workspaceId) => `/api/v1/workspaces/${workspaceId}/workgroups`,
    delete: (workspaceId, workgroupId) =>
      `/api/v1/workspaces/${workspaceId}/workgroups/${workgroupId}`,
    update: (workspaceId, workgroupId) =>
      `/api/v1/workspaces/${workspaceId}/workgroups/${workgroupId}`,
  },
  workgroup_user: {
    user_info: (workspaceId, userId) =>
      `/api/v1/workspaces/${workspaceId}/workgroup-users/${userId}`,
    update: (workspaceId, userId) => `/api/v1/workspaces/${workspaceId}/workgroup-users/${userId}`,
    delete: (workspaceId, userId) => `/api/v1/workspaces/${workspaceId}/workgroup-users/${userId}`,
  },
  extension: {
    list: (workspaceId) => `/api/v1/workspaces/${workspaceId}/extensions`,
    list_of_user: '/api/v1/user-extensions',
    add: (id) => `/api/v1/extensions/${id}/add`,
    remove: (id) => `/api/v1/user-extensions/${id}/remove`,
    on: (id) => `/api/v1/extensions/${id}/on`,
    off: (id) => `/api/v1/extensions/${id}/off`,
    uploadUrl: '/api/v1/user-extensions/url',
    uploadFile: '/api/v1/user-extensions/file',
    // V2
    list_of_workspace: (workspaceId) => `/api/v1/workspaces/${workspaceId}/workspace-extensions`,
    addV2: (workspaceId, extensionId) =>
      `/api/v1/workspaces/${workspaceId}/extensions/${extensionId}/add`,
    removeV2: (workspaceId, extensionId) =>
      `/api/v1/workspaces/${workspaceId}/workspace-extensions/${extensionId}/remove`,
    turnOn: (workspaceId, extensionId) =>
      `/api/v1/workspaces/${workspaceId}/extensions/${extensionId}/on`,
    turnOff: (workspaceId, extensionId) =>
      `/api/v1/workspaces/${workspaceId}/extensions/${extensionId}/off`,
    uploadUrlV2: (workspaceId) => `/api/v1/workspaces/${workspaceId}/workspace-extensions/url`,
    uploadFileV2: (workspaceId) => `/api/v1/workspaces/${workspaceId}/workspace-extensions/file`,
  },
  automation: {
    scripts: () => `/api/v1/rpa/automation-scripts`,
  },
  app_account: {
    create: '/api/v1/rpa/app-accounts',
    list: '/api/v1/rpa/app-accounts',
    delete: (accountId) => `/api/v1/rpa/app-accounts/${accountId}`,
    refreshToken: (accountId) => `/api/v1/rpa/app-accounts/${accountId}/refresh`,
  },
  task: {
    create: (workspaceId) => `/api/v1/workspaces/${workspaceId}/tasks`,
    update: (workspaceId, taskId) => `/api/v1/workspaces/${workspaceId}/tasks/${taskId}`,
    list: (workspaceId) => `/api/v1/workspaces/${workspaceId}/tasks`,
    detail: (workspaceId, taskId) => `/api/v1/workspaces/${workspaceId}/tasks/${taskId}`,
    delete: (workspaceId, taskId) => `/api/v1/workspaces/${workspaceId}/tasks/${taskId}`,
    deleteMulti: (workspaceId) => `/api/v1/workspaces/${workspaceId}/tasks/remove`,
    schedule: (workspaceId, taskId) => `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/schedule`,
    profile: {
      add: (workspaceId, taskId) => `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/add-profile`,
      remove: (workspaceId, taskId) =>
        `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/remove-profile`,
    },
    logs: (workspaceId, taskId) => `/api/v1/workspaces/${workspaceId}/tasks/${taskId}/logs`,
  },
  schedule: {
    list: (workspaceId) => `/api/v1/workspaces/${workspaceId}/task-schedules`,
    detail: (workspaceId, scheduleId) =>
      `/api/v1/workspaces/${workspaceId}/task-schedules/${scheduleId}`,
    create: (workspaceId) => `/api/v1/workspaces/${workspaceId}/task-schedules`,
    update: (workspaceId, scheduleId) =>
      `/api/v1/workspaces/${workspaceId}/task-schedules/${scheduleId}`,
    delete: (workspaceId, scheduleId) =>
      `/api/v1/workspaces/${workspaceId}/task-schedules/${scheduleId}`,
    deleteMulti: (workspaceId) => `/api/v1/workspaces/${workspaceId}/task-schedules/remove`,
  },
  tracking: {
    click: () => `api/v1/track/click`,
  },
  system_config: {
    list: '/api/v1/system-config',
  },
  system_notify: {
    get: '/api/v1/system-notification/latest',
    hide: (notifyId) => `/api/v1/system-notification/${notifyId}/hide`,
  },
  global_setting: {
    get: '/api/v1/global-setting',
    update: '/api/v1/global-setting',
  },
  profile_config: {
    list: '/api/v1/profile-configs',
    create: '/api/v1/profile-configs',
    detail: (configId) => `/api/v1/profile-configs/${configId}`,
    update: (configId) => `/api/v1/profile-configs/${configId}`,
    delete: (configId) => `/api/v1/profile-configs/${configId}`,
  },
  affiliate: {
    analytic_summary: '/api/v1/affiliate/app-analytics-summary',
  },
  workspace_activity: {
    list: (workspaceId) => `/api/v1/workspaces/${workspaceId}/general-log`,
  },
  tags: {
    list: (workspaceId) => `/api/v1/workspaces/${workspaceId}/tags`,
    create: (workspaceId) => `/api/v1/workspaces/${workspaceId}/tags`,
    update: (workspaceId, tagId) => `/api/v1/workspaces/${workspaceId}/tags/${tagId}`,
    delete: (workspaceId, tagId) => `/api/v1/workspaces/${workspaceId}/tags/${tagId}`,
    setSingleProfileTag: (workspaceId, profileId) =>
      `/api/v1/workspaces/${workspaceId}/profiles/${profileId}/tags`,
    setMultiProfileTag: (workspaceId) => `/api/v1/workspaces/${workspaceId}/profiles/add-tags`,
    removeMultiProfileTag: (workspaceId) =>
      `/api/v1/workspaces/${workspaceId}/profiles/remove-tags`,
  },
  banner: {
    list: '/api/v1/banners',
  },
};
