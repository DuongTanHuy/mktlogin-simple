// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/',
};

// ----------------------------------------------------------------------

export const paths = {
  // AUTH
  auth: {
    jwt: {
      login: `/login`,
      otp: `/otp`,
      register: `/register`,
      forgot_password: `/forgot-password`,
    },
    oauth: {
      login: `/oauth/login`,
      permission: `/oauth/permission`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    profile: '/profile',
    automation: '/automation',
    marketplace: '/automation/marketplace',
    task: '/automation/task',
    schedule: '/automation/schedules',
    automation_createOrEdit: (id) => `flowchart/createOrEdit`,
    synchronizer: '/synchronizer',
    synchronizer_console: '/synchronizer-operator',
    extension: '/extension',
    api_doc: '/api-docs',
    trash: '/trash',
    general_log: '/general-log',
    member: '/member',
    recharge: '/pricing',
    workspace_setting: '/workspace-setting',
    setting: '/setting',
  },
  profile: {
    create: '/profile/create',
    edit: (id) => `/profile/edit/${id}`,
  },
  task: {
    root: '/automation/task',
    edit: (id) => `/automation/task/edit/${id}`,
    log: (taskId, id) => `/automation/task/${taskId}/logs/${id}`,
  },
};
