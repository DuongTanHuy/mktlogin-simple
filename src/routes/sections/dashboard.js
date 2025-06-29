import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen, SplashScreen } from 'src/components/loading-screen';
import TabManagement from 'src/components/tab-management';
// ----------------------------------------------------------------------

// OVERVIEW
const Profile = lazy(() => import('src/pages/dashboard/profile'));
const Automation = lazy(() => import('src/pages/dashboard/automation'));
const AutomationCreateOrEdit = lazy(
  () => import('src/pages/dashboard/automation/script/create-edit')
);

const FlowCreate = lazy(() => import('src/sections/flow/create'));

const Marketplace = lazy(() => import('src/pages/dashboard/marketplace/list'));
const MarketplaceDetail = lazy(() => import('src/pages/dashboard/marketplace/detail'));
const Task = lazy(() => import('src/pages/dashboard/task/list'));
const SchedulesPage = lazy(() => import('src/pages/dashboard/schedule/list'));
const EditTask = lazy(() => import('src/pages/dashboard/task/edit'));
const TaskLog = lazy(() => import('src/pages/dashboard/task/log'));
const Synchronizer = lazy(() => import('src/pages/dashboard/synchronizer'));
const SynchronizerConsole = lazy(() => import('src/pages/synchronizer-console'));
const Extension = lazy(() => import('src/pages/dashboard/extension'));
// PROFILE
const NewProfile = lazy(() => import('src/pages/dashboard/profile/new'));
const Trash = lazy(() => import('src/pages/dashboard/trash'));
const GeneralLog = lazy(() => import('src/pages/dashboard/general-log'));
const EditProfile = lazy(() => import('src/pages/dashboard/profile/update'));
// WORKSPACE
const Member = lazy(() => import('src/pages/dashboard/member/member-view'));
const WorkspaceSetting = lazy(() => import('src/pages/dashboard/workspace-setting'));
// GLOBAL SETTING
const GlobalSettingPage = lazy(() => import('src/pages/dashboard/setting'));
// ACCOUNT
const Account = lazy(() => import('src/pages/dashboard/account'));
// PRICING
const PackagePurchase = lazy(() => import('src/pages/dashboard/nav-page/package-purchase'));
const Recharge = lazy(() => import('src/pages/dashboard/nav-page/recharge'));
const SupportGroupPage = lazy(() => import('src/pages/dashboard/nav-page/support-group'));
const AffiliateProgramPage = lazy(() => import('src/pages/dashboard/nav-page/affiliate-program'));

// ----------------------------------------------------------------------

export const DashboardRoutes = () =>
  // const { isHost } = useAuthContext();

  [
    {
      path: '',
      element: (
        <AuthGuard>
          <DashboardLayout>
            <Suspense fallback={<LoadingScreen />}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </AuthGuard>
      ),
      children: [
        {
          path: '/profile',
          children: [
            { element: <Profile />, index: true },
            { path: 'create', element: <NewProfile /> },
            { path: 'edit/:profileId', element: <EditProfile /> },
          ],
        },
        {
          path: '/automation',
          children: [
            { element: <Automation />, index: true },
            {
              path: 'script',
              children: [
                { path: 'createOrEdit', element: <AutomationCreateOrEdit /> },
                { path: 'createOrEdit/:id', element: <AutomationCreateOrEdit /> },
              ],
            },
            {
              path: 'flowchart',
              children: [
                {
                  path: 'createOrEdit',
                  element: <TabManagement FlowCreate={FlowCreate} />,
                },
                { path: 'createOrEdit/:id', element: <TabManagement FlowCreate={FlowCreate} /> },
              ],
            },
            {
              path: 'task',
              children: [
                { element: <Task />, index: true },
                {
                  path: 'edit/:taskId',
                  element: <EditTask />,
                },
                {
                  path: ':taskId/logs/:id',
                  element: <TaskLog />,
                },
              ],
            },
            {
              path: 'schedules',
              element: <SchedulesPage />,
            },
            {
              path: 'marketplace',
              children: [
                { element: <Marketplace />, index: true },
                {
                  path: ':id',
                  element: <MarketplaceDetail />,
                },
              ],
            },
          ],
        },

        { path: '/synchronizer', element: <Synchronizer /> },
        { path: '/extension', element: <Extension /> },
        { path: '/trash', element: <Trash /> },
        { path: '/general-log', element: <GeneralLog /> },
        { path: '/member', element: <Member /> },
        { path: '/workspace-setting', element: <WorkspaceSetting /> },
        { path: '/setting', element: <GlobalSettingPage /> },
        {
          path: '/account-settings',
          children: [{ element: <Account /> }],
        },
        { path: '/buy-package', element: <PackagePurchase /> },
        { path: '/recharge', element: <Recharge /> },
        { path: '/support-chanel', element: <SupportGroupPage /> },
        { path: '/affiliate-program', element: <AffiliateProgramPage /> },
      ],
    },
    {
      path: 'synchronizer-operator',
      element: (
        <Suspense fallback={<SplashScreen />}>
          <SynchronizerConsole />
        </Suspense>
      ),
    },
  ];
