import { createPortal } from 'react-dom';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cloneDeep, debounce } from 'lodash';
import PropTypes from 'prop-types';
// mui
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Popover,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
// api
import { openMultiProfileApi } from 'src/api/profile.api';
import { getListWorkFlowGroup } from 'src/api/workflow.api';
// components
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSkeleton,
  useTable,
} from 'src/components/table';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { alpha } from '@mui/material/styles';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import {
  DEFAULT_SHORTCUT,
  DEFAULT_SHORTCUT_RESOURCE,
  ERROR_CODE,
  ID_GROUP_ALL,
  IS_BROWSER_DOWNLOADING,
  PROFILE_COLUMN_SETTING,
  PROFILE_STATUS_ALL,
  PROFILES_ID_OPENING,
  RESOURCE_OPTIONS,
  ROWS_PER_PAGE_CONFIG,
  useRenderProfileStatus,
  useRenderResourceStatus,
} from 'src/utils/constance';
import SvgColor from 'src/components/svg-color';
import { enqueueSnackbar } from 'notistack';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import { paths } from 'src/routes/paths';
import { useBalanceContext } from 'src/account-balance/context/balance-context';
import { useLocales } from 'src/locales';
import { useResponsive } from 'src/hooks/use-responsive';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { usePopover } from 'src/components/custom-popover';
import {
  CircularProgressWithLabel,
  transformKernelVersionToBrowserName,
  updateSelectedProfiles,
} from 'src/utils/profile';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import { LoadingButton } from '@mui/lab';
import { list_profile_data, list_resource_data } from 'src/utils/mock';
import { getNumSkeleton, isElectron } from '../../utils/commom';
import RpaMultiFormDialog from './rpa/rpa-multi-form-dialog';
import DeleteMultiDialog from './delete/delete-multi-dialog';
import RenewMultiDialog from './renew/renew-multi-dialog';
import TransferMultiDialog from './transfer/transfer-multi-dialog';
import MoveMultiDialog from './move-group/move-multi-dialog';
import { useAuthContext } from '../../auth/hooks';
import SortProfileWindowsDialog from './sort/sort-windows-dialog';
import eventBus from '../script/event-bus';
import UpdateProxyDialog from './duplicate/update-proxy-dialog';
import ImportResourceDialog from './resource/import-resource-dialog';
import ColumnSettingDialog from './column-setting-dialog';
import ExportResourceDialog from './resource/export-resource-dialog';
import RenderRowPopup from './render-row-popup';
import UpdateMultiNoteDialog from './update-profile-field/update-multi-note-dialog';
import MoveMultiWorkspaceDialog from './workspace/move-multi-workspace-dialog';
import UpdateMultiBrowserKernelDialog from './update-profile-field/update-multi-browser-kernel-dialog';
import VirtualProfileTable from './virtual-profile-table';
import { addProfileOpen, removeAllProfileOpen } from '../../utils/local-storage';
import { getKernelVersionByIdApi } from '../../api/cms.api';
import AutoRenewMultiDialog from './renew/auto-renew-multi-dialog';
import AddBookmarkMultiDialog from './bookmark/add-bookmark-multi-dialog';
import DeleteBookmarkMultiDialog from './bookmark/delete-bookmark-multi-dialog';
import AddTabMultiDialog from './tabs/add-tab-multi-dialog';
import DeleteTabMultiDialog from './tabs/delete-tab-multi-dialog';
import AdvancedSearch from './advanced-search';
import ListTagDialog from './tags/list-tag-dialog';
import SetMultiTagDialog from './tags/set-multi-tag-dialog';
import RemoveMultiTagDialog from './tags/remove-multi-tag-dialog';
import CustomShortcutDialog from './custom-shortcut-dialog';
import RemoveMultiProxyDialog from './tags/remove-multi-proxy-dialog';
import DeleteMultiCookieDialog from './cookie/delete-multi-cookie-dialog';
import DeleteMultiCacheDialog from './cache/delete-multi-cache-dialog';

const ProfilePage = React.memo(
  ({ listGroup, groupSelected, refreshKey }) => {
    const { t } = useLocales();
    const localShortcut = getStorage('custom-shortcut') ?? DEFAULT_SHORTCUT;
    const localShortcutResource =
      getStorage('custom-shortcut-resource') ?? DEFAULT_SHORTCUT_RESOURCE;

    const profileStatus = useRenderProfileStatus();
    const resourceStatus = useRenderResourceStatus();

    const COLUMN_VISIBLE = useMemo(() => getStorage(PROFILE_COLUMN_SETTING), []);

    const xxlUp = useResponsive('up', 'xxl');
    // const xlUp = useResponsive('up', 'xl');
    const mdUp = useResponsive('up', 'md');
    const searchParams = useSearchParams();
    const nameParam = searchParams.get('search');
    const statusParam = searchParams.get('status');
    const displayParam = searchParams.get('display');
    const pageNum = searchParams.get('page');
    const rowNum = getStorage(ROWS_PER_PAGE_CONFIG)?.profile ?? searchParams.get('row');

    const table = useTable({
      defaultOrderBy: 'id',
      defaultOrder: 'desc',
      defaultCurrentPage: Number(pageNum) || 0,
      defaultRowsPerPage: Number(rowNum) || 10,
    });

    const defaultFilters = useMemo(
      () => ({
        search: nameParam || '',
        status: statusParam || 'all',
        display: COLUMN_VISIBLE?.display || displayParam || 'profile',
      }),
      [COLUMN_VISIBLE?.display, displayParam, nameParam, statusParam]
    );

    const [filters, setFilters] = useState(defaultFilters);
    const { copy } = useCopyToClipboard();

    const confirm = useMultiBoolean({
      progress: false,
      delete: false,
      renew: false,
      send: false,
      rpa: false,
      move: false,
      sort: false,
      proxy: false,
      resource: false,
      exportResource: false,
      copyResource: false,
      columnSetting: false,
      updateNote: false,
      updateBrowserKernel: false,
      switch_workspace: false,
      enableAutoRenew: false,
      disableAutoRenew: false,
      addBookmark: false,
      deleteBookmark: false,
      addTab: false,
      deleteTab: false,
      tags: false,
      profileTags: false,
      deleteCookie: false,
      clearCache: false,
      removeTags: false,
      removeProxy: false,
      customShortcut: false,
    });

    const notify = useBoolean();
    const actionNotify = useBoolean();

    const rowConfirm = useMultiBoolean({
      renew: false,
      delete: false,
      send: false,
      rpa: false,
      duplicate: false,
      deleteCookie: false,
      clearCache: false,
      move: false,
      switch_workspace: false,
    });
    const [profileInfo, setProfileInfo] = useState({});

    const quickEdit = useMultiBoolean({
      name: false,
      note: false,
      tags: false,
      proxy: false,
      uid: false,
      username: false,
      password: false,
      twoFa: false,
      email: false,
      emailPass: false,
      emailRecovery: false,
      token: false,
      cookie: false,
      phone: false,
    });
    const [quickActionId, setQuickActionId] = useState();

    const [quickActionData, setQuickActionData] = useState([]);

    const [anchorEl, setAnchorEl] = useState(null);

    const [isHovering, setIsHovering] = useState(false);
    const createButton = useRef(null);

    const handleOpenSearchBar = () => {
      setAnchorEl(searchRef.current);
    };

    const handleCloseSearchBar = () => {
      setAnchorEl(null);
    };

    const searchRef = useRef(null);
    const [advancedSearch, setAdvancedSearch] = useState([]);

    const [displayScreens, setDisplayScreens] = useState([]);

    const [browserDownloadName, setBrowserDownloadName] = useState('');

    const TABLE_HEAD = useMemo(
      () => [
        { id: 'id', label: 'Profile ID', align: 'center' },
        ...(filters.display === 'profile'
          ? [
              {
                id: 'group',
                label: t('form.label.group'),
                align: 'center',
                whiteSpace: 'nowrap',
                minWidth: 120,
              },
              {
                id: 'name',
                label: t('form.label.name'),
                whiteSpace: 'nowrap',
              },
              { id: 'note', label: t('form.label.note'), whiteSpace: 'nowrap' },
              { id: 'tags', label: t('dialog.setTag.tag'), whiteSpace: 'nowrap' },
              { id: 'proxy', label: 'Proxy', align: 'center', whiteSpace: 'nowrap' },
              {
                id: 'date_expired',
                label: t('form.label.duration'),
                align: 'center',
                whiteSpace: 'nowrap',
              },
              {
                id: 'created_at',
                label: t('form.label.created_at'),
                align: 'center',
                whiteSpace: 'nowrap',
              },
            ]
          : [
              {
                id: 'uid',
                label: 'UId',
                align: 'center',
              },
              {
                id: 'username',
                label: t('form.label.username'),
              },
              {
                id: 'password',
                label: t('form.label.password'),
              },
              {
                id: '_2fa',
                label: '2Fa',
              },

              {
                id: 'email',
                label: 'Email',
              },
              {
                id: 'pass_email',
                label: t('form.label.emailPassword'),
              },
              {
                id: 'mail_recovery',
                label: t('form.label.recoveryEmail'),
              },
              {
                id: 'token',
                label: 'Token',
              },
              {
                id: 'cookie',
                label: 'Cookie',
              },
              {
                id: 'phone',
                label: t('form.label.phone'),
              },
              {
                id: 'status',
                label: t('form.label.status'),
                align: 'center',
                minWidth: 120,
                width: 120,
              },
              {
                id: 'activity_log',
                label: 'Active log',
                align: 'center',
                minWidth: 90,
                width: 90,
              },
            ]),
        // {
        //   id: 'action',
        //   label: t('form.label.act'),
        //   align: 'left',
        //   whiteSpace: 'nowrap',
        //   minWidth: 200,
        //   width: 200,
        //   icon: 'uil:setting',
        //   onClick: () => confirm.onTrue('columnSetting'),
        // },
      ],
      [filters.display, t]
    );

    const [visibleColumn, setVisibleColumn] = useState(
      COLUMN_VISIBLE?.data?.[COLUMN_VISIBLE?.display] || []
    );

    const { isHost, workspace_id: workspaceId } = useAuthContext();
    const { updateRefreshBalance } = useBalanceContext();
    const settings = useSettingsContext();
    const [downloadProgressPercent, setDownloadProgressPercent] = useState(0);
    const [extractionStatus, setExtractionStatus] = useState('pending');
    const [tableData, setTableData] = useState([]);
    const [workflowGroup, setWorkflowGroup] = useState([]);
    const [profileStatusToFilter, setFilterProfileStatus] = useState(PROFILE_STATUS_ALL);
    const [totalProfiles, setTotalProfiles] = useState(0);
    const [orderBy, setOrderBy] = useState('');
    const [order, setOrder] = useState({
      id: 'desc',
      name: 'desc',
      date_expired: 'desc',
      created_at: 'desc',
    });

    const [loading, setLoading] = useState({
      fetch: true,
      search: false,
      open_multiple: false,
      close_multiple: false,
      reload: false,
    });

    const router = useRouter();
    const popover = usePopover();

    useEffect(() => {
      if (isElectron()) {
        const handleSync = (event, value) => {
          setTableData((prevData) =>
            prevData.map((item) => ({
              ...item,
              state: value.profile_id === item.id ? 'syncing' : item.state,
            }))
          );
        };

        window.ipcRenderer.on('sync-profile-data', handleSync);
      }

      return () => {
        if (isElectron()) {
          window.ipcRenderer.removeAllListeners('sync-profile-data');
        }
      };
    }, [tableData]);

    useEffect(() => {
      if (isElectron()) {
        window.ipcRenderer.on('update-browser-download-progress', (event, value) => {
          const percent = Math.round((value.downloadedMb / value.fullMb) * 100);

          if (value.status === 'Downloading') {
            setDownloadProgressPercent(percent);
          } else if (value.status === 'Download completed') {
            setDownloadProgressPercent(100);
            setExtractionStatus('in_progress');
          } else if (value.status === 'Extract Completed') {
            setDownloadProgressPercent(0);
            setExtractionStatus('pending');
            confirm.onFalse('progress');
            enqueueSnackbar(t('systemNotify.success.download'), { variant: 'success' });
            setStorage(IS_BROWSER_DOWNLOADING, 'no');
          }
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApplySetting = (data) => {
      const currentColumn = getStorage(PROFILE_COLUMN_SETTING)?.data || {};
      setVisibleColumn(data);
      setStorage(PROFILE_COLUMN_SETTING, {
        display: filters.display,
        data: {
          ...currentColumn,
          [filters.display]: data,
        },
      });
    };

    const handleFilters = useCallback(
      (name, value) => {
        table.onResetPage();
        setFilters((prevState) => ({
          ...prevState,
          [name]: value,
        }));
        if (name === 'status') {
          setFilterProfileStatus(value);
        } else if (name === 'display') {
          if (filters.display === 'profile') {
            setFilters((prev) => ({
              ...prev,
              status: 'all',
            }));
          } else if (value === 'profile') {
            setFilters((prev) => ({
              ...prev,
              status: 'all',
            }));
          }
          const currentColumn = getStorage(PROFILE_COLUMN_SETTING) || [];
          setVisibleColumn(currentColumn?.data?.[value] || []);
          setStorage(PROFILE_COLUMN_SETTING, {
            ...currentColumn,
            display: value,
          });
        }
        searchParams.set(name, value);
        searchParams.delete('page');
        router.push(`${paths.dashboard.profile}?${searchParams}`);
      },
      [filters.display, router, searchParams, table]
    );

    // const callApiSequentially = async (apiFunctions, queryString, timeout, maxAttempts) => {
    //   const tryApiCall = async (index, attempt) => {
    //     if (index >= apiFunctions.length) {
    //       index = 0; // Restart with the first API function if all have been tried
    //       attempt += 1;
    //     }
    //     if (attempt >= maxAttempts) {
    //       throw new Error('All attempts failed');
    //     }

    //     try {
    //       const response = await apiFunctions[index](
    //         workspaceId,
    //         queryString,
    //         timeout,
    //         cancelTokenRef.current.token
    //       );

    //       if (response) {
    //         return response;
    //       }
    //     } catch (error) {
    //       if (index === 0 && error?.detail === 'Not found.') {
    //         table.onResetPage();
    //         searchParams.delete('page');
    //         router.push(`${paths.dashboard.profile}?${searchParams}`);
    //         throw new Error(`Request to function ${index} failed: ${error.detail}`);
    //       }
    //       if (error?.code === 'ERR_CANCELED') {
    //         throw new axios.Cancel('Request canceled');
    //       }
    //       console.log(`Request to function ${index} failed: ${error.message}`);
    //     }

    //     return tryApiCall(index + 1, attempt);
    //   };

    //   return tryApiCall(0, 0);
    // };

    const handleFetchData = async (signal) => {
      if (!workspaceId) return;

      if (isElectron()) {
        // sync profile state
        window.ipcRenderer.invoke('check-profile-open-state').then((openIDs) => {
          if (openIDs.length === 0) {
            removeAllProfileOpen();
          }
          openIDs.forEach((profile_id) => {
            addProfileOpen(profile_id);
          });
        });
        // end sync profile state
      }

      setLoading((prev) => ({ ...prev, fetch: true }));

      const { search, status, display } = filters;
      const fields =
        display === 'profile'
          ? 'id,group_name,name,note,tags,duration,proxy_type,proxy_host,proxy_port,proxy_user,proxy_password,browser_type,proxy_token,created_at'
          : 'id,name,account_resources,duration,browser_type';
      const resource_type = display === 'profile' ? '' : display;

      const advancedSearchParams = advancedSearch.reduce((result, item) => {
        if (item.type && item.condition && item.value) {
          const key = `${item.type}${item.condition}`;
          let values;
          if (item.type === 'profile_id') {
            values = item.value
              .split(/[\s,;:.!?\-()]+/)
              .filter(Boolean)
              .join(',');
          } else {
            values = item.value.map((value) => value.id).join(',');
          }
          result[key] = values;
        }
        return result;
      }, {});

      const params = {
        search,
        ...(display === 'profile'
          ? { status }
          : {
              account_resource_status: status,
            }),
        page_size: table.rowsPerPage,
        page_num: table.page + 1,
        profile_group: groupSelected !== ID_GROUP_ALL ? groupSelected : undefined,
        fields,
        resource_type,
        ...(orderBy && {
          order_by: orderBy,
          order: order[orderBy],
        }),
        ...advancedSearchParams,
      };
      console.log(params);

      try {
        // <<<=== START Loadbalance ===>>>
        // const timeout = 5000;
        // const maxAttempts = 5;
        // const apiFunctions = [getListProfileApi, getListProfileApiVN];

        // const response = await callApiSequentially(apiFunctions, queryString, timeout, maxAttempts);

        const response = display === 'profile' ? list_profile_data : list_resource_data;
        // <<<=== END Loadbalance ===>>>

        if (response && response.data) {
          const profileData = response;
          if (profileData) {
            processProfileData(profileData);
            setTableData(profileData.data);
            setQuickActionData([]);
            if (table.selected.length > 0) {
              const updatedSelectedProfiles = profileData.data.filter((profile) =>
                table.selected.some((selectedProfile) => selectedProfile.id === profile.id)
              );

              table.setSelected(updatedSelectedProfiles);
            }
          }
        } else {
          throw new Error('All requests failed');
        }
        setLoading((prev) => ({ ...prev, fetch: false }));
      } catch (error) {
        setTableData([]);
        setQuickActionData([]);
        if (error?.code !== 'ERR_CANCELED') {
          setLoading((prev) => ({ ...prev, fetch: false }));
        }
      }
    };

    const hanldeSortProfileWindow = () => {
      const profileIdsOpening = getStorage(PROFILES_ID_OPENING) || [];
      if (profileIdsOpening.length === 0) {
        enqueueSnackbar(t('systemNotify.warning.profileOpen'), { variant: 'warning' });
      } else {
        confirm.onTrue('sort');
      }
    };

    const processProfileData = (profileData) => {
      const profileIdsOpening = getStorage(PROFILES_ID_OPENING);
      profileData.data.forEach((item) => {
        const isOpen = profileIdsOpening?.includes(item.id);
        item.state = isOpen ? 'open' : 'close';
        item.isLoading = false;
        item.profileIsExpired = item.duration < 0;
      });

      setTotalProfiles(profileData.total_record);

      const updatedSelectedProfiles = table.selected.filter((profile) =>
        profileData.data.some((item) => item.id === profile.id)
      );
      table.setSelected(updatedSelectedProfiles);
    };

    useEffect(() => {
      const handleResetFilter = () => {
        table.onResetPage();
        setAdvancedSearch([]);
        setFilters({
          search: '',
          status: 'all',
          display: 'profile',
        });
        const searchElement = document.getElementById('search-profile');
        if (searchElement) {
          searchElement.value = '';
        }
        router.push(`${paths.dashboard.profile}`);
      };
      eventBus.on('resetTablePage', handleResetFilter);
      return () => {
        eventBus.removeListener('resetTablePage', handleResetFilter);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    useEffect(() => {
      const abortController = new AbortController();

      handleFetchData(abortController.signal);

      return () => {
        abortController.abort();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      filters,
      order,
      table.rowsPerPage,
      table.page,
      workspaceId,
      refreshKey,
      groupSelected,
      // listGroup,
      advancedSearch,
    ]);

    useEffect(() => {
      const featWorkFlowData = async () => {
        if (!workspaceId) return;
        try {
          const response = await getListWorkFlowGroup(workspaceId);
          if (response?.data) {
            const { data } = response.data;
            setWorkflowGroup(data);
          }
        } catch (error) { /* empty */ }
      };

      featWorkFlowData();

      // table.onResetPage();
      // searchParams.delete('page');
      // router.push(`${paths.dashboard.profile}?${searchParams}`);
    }, [router, workspaceId]);

    const updateProfile = (profileIds, updates) => {
      setTableData((prevData) =>
        prevData.map((item) => {
          if (profileIds.includes(item.id)) {
            return { ...item, ...updates };
          }
          return item;
        })
      );
    };

    const updateProfileState = useCallback((profileIds, state) => {
      const updates = { state };
      if (state === 'open') {
        updates.isLoading = false;
      }
      updateProfile(profileIds, updates);
    }, []);

    const updateProfileLoading = useCallback((profileIds, isLoading) => {
      updateProfile(profileIds, { isLoading });
    }, []);

    useEffect(() => {
      eventBus.on('force-close-profile', (profileId) => {
        updateProfileState([profileId], 'close');
      });
      eventBus.on('open-profile', (profileId) => {
        updateProfileState([profileId], 'open');
      });
      return () => {
        eventBus.removeListener('force-close-profile', (profileId) => {
          updateProfileState([profileId], 'close');
        });
        eventBus.removeListener('open-profile', (profileId) => {
          updateProfileState([profileId], 'open');
        });
      };
    }, [updateProfileState]);

    useEffect(() => {
      if (isElectron()) {
        window.ipcRenderer.invoke('get-monitors').then((monitors) => {
          let displayScreensTmp = [];
          if (monitors?.primaryDisplay) {
            displayScreensTmp.push({ ...monitors.primaryDisplay, type: 'primary' });
          }
          if (monitors?.displaysExtends) {
            displayScreensTmp = [
              ...displayScreensTmp,
              ...monitors.displaysExtends.map((item) => ({ ...item, type: 'extended' })),
            ];
          }
          setDisplayScreens(displayScreensTmp);
        });
      }
    }, []);

    const downloadBrowserIfNeeded = async (kernelVersion) => {
      const kernelVersionResponse = await getKernelVersionByIdApi(kernelVersion.id);
      if (kernelVersionResponse?.data) {
        window.ipcRenderer.send('download-browser', kernelVersionResponse.data);
        setStorage(IS_BROWSER_DOWNLOADING, 'yes');
      }
    };

    const handleOpenProfileMultiple = useCallback(async () => {
      try {
        setLoading((prev) => ({ ...prev, open_multiple: true }));
        const profileIds = table.selected.map((item) => item.id);
        const response = await openMultiProfileApi(workspaceId, {
          profile_ids: profileIds.join(','),
        });
        const profiles = response.data;
        if (profiles.length === 0) {
          setLoading((prev) => ({ ...prev, open_multiple: false }));
          return;
        }
        const profileValidIds = profiles
          .filter((profile) => profile.duration >= 0)
          .map((profile) => profile.id);
        const kernelVersions = profiles.map((profile) => profile.kernel_version);
        const uniqueKernelVersions = Array.from(
          new Map(kernelVersions.map((item) => [item.type + item.kernel, item])).values()
        );

        const promise = uniqueKernelVersions.map(async (kernel_version) => {
          const isDownloaded = await window.ipcRenderer.invoke('check-browser-download', {
            browser_type: kernel_version.type,
            kernel_version: kernel_version.kernel,
          });
          return isDownloaded;
        });

        const isDownloads = await Promise.all(promise);
        let kernelVersionDownload;

        for (let i = 0; i < isDownloads.length; i += 1) {
          if (!isDownloads[i]) {
            kernelVersionDownload = uniqueKernelVersions[i];
            break;
          }
        }

        if (kernelVersionDownload) {
          setLoading((prev) => ({ ...prev, open_multiple: false }));
          setBrowserDownloadName(transformKernelVersionToBrowserName(kernelVersionDownload));
          confirm.onTrue('progress');
          await downloadBrowserIfNeeded(kernelVersionDownload);
        } else {
          updateProfileLoading(profileValidIds, true);
          if (isElectron()) {
            window.ipcRenderer.invoke('profile-open-multiple', {
              data_profiles: profiles,
              workspace_id: workspaceId,
            });
          }
        }
      } catch (error) {
        if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
          enqueueSnackbar(t('systemNotify.warning.notPermission.profile.open'), {
            variant: 'error',
          });
        }
        setLoading((prev) => ({ ...prev, open_multiple: false }));
      }
    }, [confirm, t, table.selected, updateProfileLoading, workspaceId]);

    const handleCloseProfileMultiple = useCallback(() => {
      setLoading((prev) => ({ ...prev, close_multiple: true }));
      const profileIds = table.selected.map((item) => item.id);
      if (isElectron()) {
        window.ipcRenderer.invoke('profile-close-multiple', {
          profile_ids: profileIds,
          workspace_id: workspaceId,
        });
      }
    }, [table.selected, workspaceId]);

    useEffect(() => {
      const handleProfileOpenMultipleSuccess = (event, data) => {
        setLoading((prev) => ({ ...prev, open_multiple: false }));
        const { profile_ids } = data;
        updateProfileState(profile_ids, 'open');
      };

      const handleProfileCloseMultipleSuccess = () => {
        setTimeout(() => {
          setLoading((prev) => ({ ...prev, close_multiple: false }));
        }, 3000);
      };

      if (isElectron()) {
        window.ipcRenderer.on('profile-open-multiple-success', handleProfileOpenMultipleSuccess);
        window.ipcRenderer.on('profile-close-multiple-success', handleProfileCloseMultipleSuccess);
      }

      return () => {
        if (isElectron()) {
          window.ipcRenderer.removeAllListeners('profile-open-multiple-success');
          window.ipcRenderer.removeAllListeners('profile-close-multiple-success');
        }
      };
    }, [updateProfileState]);

    const renderTable = (
      <>
        {loading.fetch || tableData.length === 0 ? (
          <TableContainer
            sx={{ position: 'relative', overflow: 'auto', height: 'calc(100% - 64px)', pr: 1 }}
          >
            {/* <Scrollbar
              ref={tableContainerRef}
              autoHide={false}
              sxRoot={{
                overflow: 'unset',
              }}
              sx={{
                height: 1,
                '& .simplebar-content': {
                  height: 1,
                },
                '& .simplebar-track.simplebar-vertical': {
                  position: 'absolute',
                  right: '-8px',
                  pointerEvents: 'auto',
                  width: 12,
                },
                '& .simplebar-track.simplebar-horizontal': {
                  position: 'absolute',
                  bottom: '-10px',
                  pointerEvents: 'auto',
                  height: 12,
                },
              }}
            > */}
            <Table
              size={table.dense ? 'small' : 'medium'}
              sx={{
                minWidth: 1300,
                height: 1,
                '& thead': {
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                },
                '& th': {
                  backgroundColor: '#fff',
                  ...(settings.themeMode === 'dark' && {
                    bgcolor: (theme) => theme.palette.grey[900],
                  }),
                },
                '& th:first-of-type, td:first-of-type': {
                  position: 'sticky',
                  left: 0,
                  bgcolor: '#fff',
                  ...(settings.themeMode === 'dark' && {
                    bgcolor: (theme) => theme.palette.grey[900],
                  }),
                  ...(true && {
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      width: '10px',
                      boxShadow: `5px 0px 5px rgba(0, 0, 0, ${
                        settings.themeMode === 'dark' ? 0.6 : 0.1
                      })`,
                    },
                  }),
                  p: '8px',
                },
                '& th:last-child > .MuiStack-root': {
                  alignItems: 'center',
                },
                '& th:last-child, td:last-child': {
                  maxWidth: 170,
                  position: 'sticky',
                  right: 0,
                  bgcolor: '#fff',
                  ...(settings.themeMode === 'dark' && {
                    bgcolor: (theme) => theme.palette.grey[900],
                  }),
                  ...(true &&
                    filters.display === 'profile' && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: '10px',
                        boxShadow: `-5px 0px 5px rgba(0, 0, 0, ${
                          settings.themeMode === 'dark' ? 0.6 : 0.1
                        })`,
                      },
                    }),
                  p: '8px',
                },
                ...(filters.display !== 'profile' && {
                  '& th:nth-last-of-type(2), td:nth-last-of-type(2)': {
                    maxWidth: 170,
                    position: 'sticky',
                    right: 200,
                    bgcolor: '#fff',
                    ...(settings.themeMode === 'dark' && {
                      bgcolor: (theme) => theme.palette.grey[900],
                    }),
                    p: '8px',
                  },
                  '& th:nth-last-of-type(3), td:nth-last-of-type(3)': {
                    maxWidth: 170,
                    position: 'sticky',
                    right: 281,
                    bgcolor: '#fff',
                    ...(settings.themeMode === 'dark' && {
                      bgcolor: (theme) => theme.palette.grey[900],
                    }),
                    ...(true && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: '10px',
                        boxShadow: `-5px 0px 5px rgba(0, 0, 0, ${
                          settings.themeMode === 'dark' ? 0.6 : 0.1
                        })`,
                      },
                    }),
                    p: '8px',
                  },
                }),
              }}
            >
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={[
                  ...TABLE_HEAD,
                  {
                    id: 'action',
                    label: t('form.label.act'),
                    align: 'left',
                    whiteSpace: 'nowrap',
                    minWidth: 200,
                    width: 200,
                    icon: 'uil:setting',
                    onClick: () => confirm.onTrue('columnSetting'),
                  },
                ]}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSelectAllRows={(checked) => table.onSelectAllRows(checked, tableData)}
                scrollRight
                scrollLeft
                visibleColumn={visibleColumn}
              />

              <TableBody>
                {loading.fetch &&
                  [...Array(getNumSkeleton(table.rowsPerPage, tableData.length))].map(
                    (i, index) => (
                      <TableSkeleton
                        key={index}
                        cols={Math.max(1, TABLE_HEAD.length + 1 - visibleColumn.length)}
                        sx={{ height: 70 }}
                      />
                    )
                  )}
                <TableNoData
                  sx={{
                    py: 20,
                  }}
                  cols={TABLE_HEAD.length + 2}
                  notFound={tableData.length === 0 && !loading.fetch}
                />
              </TableBody>
            </Table>
            {/* </Scrollbar> */}
          </TableContainer>
        ) : (
          <VirtualProfileTable
            headers={TABLE_HEAD}
            rowCount={tableData.length}
            numSelected={table.selected.length}
            onSelectAllRows={(checked, data) => table.onSelectAllRows(checked, tableData)}
            onShiftSelectAllRows={(data) => table.onShiftSelectAllRows(data)}
            visibleColumn={visibleColumn}
            rows={tableData}
            tableSelected={table.selected}
            onSelectRow={table.onSelectRow}
            openQuickEdit={(name, row) => {
              setQuickActionData((prev) => {
                const _clone = cloneDeep(prev);
                const _find = _clone.findIndex((i) => i.id === row.id);
                if (_find === -1) {
                  _clone.push(row);
                }
                return _clone;
              });
              setQuickActionId(row.id);
              quickEdit.onTrue(name);
            }}
            confirm={confirm}
            rowConfirm={rowConfirm}
            setProfileInfo={setProfileInfo}
            setBrowserDownloadName={setBrowserDownloadName}
            onOpenDownloadProgress={() => confirm.onTrue('progress')}
            showNotify={notify.onTrue}
            quickData={quickActionData}
            isProfileDisplay={filters.display === 'profile'}
            updateProfileState={updateProfileState}
            updateProfileLoading={updateProfileLoading}
            order={order}
            onSort={(headerName) => {
              setOrderBy(headerName);
              setOrder((prev) => ({
                ...prev,
                [headerName]: prev[headerName] === 'asc' ? 'desc' : 'asc',
              }));
            }}
          />
        )}
      </>
    );

    const renderPagination = (
      <TablePaginationCustom
        count={totalProfiles}
        page={totalProfiles / table.rowsPerPage <= table.page ? 0 : table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={(event, page) => {
          searchParams.set('page', page);
          router.push(`${paths.dashboard.profile}?${searchParams.toString()}`);
          table.onChangePage(event, page);
        }}
        onRowsPerPageChange={(event) => {
          setStorage(ROWS_PER_PAGE_CONFIG, {
            ...getStorage(ROWS_PER_PAGE_CONFIG),
            profile: event.target.value,
          });
          searchParams.set('row', event.target.value);
          searchParams.set('page', 0);
          router.push(`${paths.dashboard.profile}?${searchParams.toString()}`);
          table.setPage(0);
          table.onChangeRowsPerPage(event);
        }}
        //
        dense={table.dense}
        onChangeDense={table.onChangeDense}
      />
    );

    const [anchorSubPopover, setAnchorSubPopover] = useState(null);
    const [targetAnchorSub, setTargetAnchorSub] = useState('');

    const [opening, setOpening] = useState(false);

    const [customShortcut, setCustomShortcut] = useState(localShortcut);

    const [subPopoverPosition, setSubPopoverPosition] = useState('inter');

    const handleSubPopoverOpen = useCallback(
      (event) => {
        if (!opening && (popover.open || subPopoverPosition === 'outer')) {
          setTargetAnchorSub(event.currentTarget.getAttribute('menu-id'));
          setAnchorSubPopover(event.currentTarget);
        }
      },
      [opening, popover.open, subPopoverPosition]
    );

    const handleSubPopoverClose = () => {
      setAnchorSubPopover(null);
    };

    const list_button_action = useMemo(() => {
      const options = [
        {
          id: 'btn-automation',
          color: 'primary',
          disabled: table.selected.length === 0 || profileStatusToFilter === 'expired',
          icon: <SvgColor src="/assets/icons/navbar/ic_automation.svg" />,
          onClick: () => {
            if (isElectron()) {
              confirm.onTrue('rpa');
            } else {
              actionNotify.onTrue();
            }
          },
          label: 'Automation',
          show: true,
        },
        {
          id: 'btn-open',
          disabled:
            table.selected.length === 0 ||
            profileStatusToFilter === 'expired' ||
            loading.open_multiple,
          icon: (
            <Iconify
              icon={loading.open_multiple ? 'eos-icons:bubble-loading' : 'solar:play-bold'}
              color={
                table.selected.length === 0 || profileStatusToFilter === 'expired' ? '' : '#00A76F'
              }
            />
          ),
          onClick: () => {
            if (isElectron()) {
              handleOpenProfileMultiple();
            } else {
              actionNotify.onTrue();
            }
          },
          label: t('actions.open'),
          show: true,
        },
        {
          id: 'btn-close',
          disabled:
            table.selected.length === 0 ||
            profileStatusToFilter === 'expired' ||
            loading.close_multiple,
          icon: (
            <Iconify
              icon={loading.close_multiple ? 'eos-icons:bubble-loading' : 'ion:stop'}
              color={
                table.selected.length === 0 || profileStatusToFilter === 'expired' ? '' : '#FF5630'
              }
            />
          ),
          onClick: () => {
            if (isElectron()) {
              handleCloseProfileMultiple();
            } else {
              actionNotify.onTrue();
            }
          },
          label: t('actions.close'),
          show: true,
        },
        {
          id: 'btn-proxy',
          disabled: table.selected.length === 0 || profileStatusToFilter === 'expired',
          icon: <Iconify icon="solar:global-linear" />,
          onClick: () => confirm.onTrue('proxy'),
          label: t('actions.proxyUpdate'),
          show: true,
        },
        {
          id: 'btn-resource',
          disabled: table.selected.length === 0 || profileStatusToFilter === 'expired',
          icon: <Iconify icon="mdi:folder-account-outline" />,
          onClick: () => confirm.onTrue('resource'),
          label: t('actions.addResource'),
          show: true,
        },
        {
          id: 'btn-delete',
          color: 'error',
          disabled: table.selected.length === 0,
          icon: <Iconify icon="fluent:delete-12-regular" />,
          onClick: () => confirm.onTrue('delete'),
          label: t('actions.delete'),
          show: true,
        },
        {
          id: 'btn-more',
          icon: <Iconify icon="ri:more-fill" />,
          onClick: (e) => {
            popover.onOpen(e);
            setOpening(true);
            const timer = setTimeout(() => {
              setOpening(false);
            }, 300);
            return () => clearTimeout(timer);
          },
          sx: {
            minWidth: '36px',
            '& .MuiButton-startIcon': {
              mx: 0,
            },
          },
          show: true,
        },
        {
          id: 'btn-move',
          disabled: table.selected.length === 0 || profileStatusToFilter === 'expired',
          icon: <Iconify icon="fluent:share-48-regular" />,
          onClick: () => {
            confirm.onTrue('move');
            popover.onClose();
          },
          label: t('actions.switch-group'),
          show: false,
        },
        {
          id: 'btn-renew',
          disabled: table.selected.length === 0,
          icon: <Iconify icon="gg:calendar-next" />,
          onClick: () => {
            confirm.onTrue('renew');
            popover.onClose();
          },
          label: t('actions.renew'),
          show: false,
        },
        {
          id: 'btn-enableAutoRenew',
          disabled: table.selected.length === 0,
          icon: <Iconify icon="mdi:autorenew" />,
          onClick: () => {
            confirm.onTrue('enableAutoRenew');
            popover.onClose();
          },
          label: t('actions.enableAutoRenew'),
          show: false,
        },
        {
          id: 'btn-disableAutoRenew',
          disabled: table.selected.length === 0,
          icon: <Iconify icon="mdi:autorenew-off" />,
          onClick: () => {
            confirm.onTrue('disableAutoRenew');
            popover.onClose();
          },
          label: t('actions.disableAutoRenew'),
          show: false,
        },
        {
          id: 'btn-switch-workspace',
          disabled: table.selected.length === 0,
          icon: <Iconify icon="material-symbols-light:move-up" />,
          onClick: () => {
            confirm.onTrue('switch_workspace');
            popover.onClose();
          },
          label: t('actions.switchWorkspace'),
          show: false,
          sx: isHost ? {} : { display: 'none' },
        },
        {
          id: 'btn-send',
          disabled: table.selected.length === 0 || profileStatusToFilter === 'expired',
          icon: <Iconify icon="icon-park-outline:switch" />,
          onClick: () => {
            confirm.onTrue('send');
            popover.onClose();
          },
          label: t('actions.send'),
          show: false,
        },
        {
          id: 'btn-profile',
          disabled: table.selected.length === 0,
          icon: <Iconify icon="ic:outline-note-alt" />,
          onClick: handleSubPopoverOpen,
          label: t('task.editLog.profile'),
          moreIcon: (
            <Iconify
              icon="mingcute:right-line"
              sx={{
                mr: '0px!important',
                ml: 'auto',
              }}
            />
          ),
          menuId: 'update',
          show: false,
        },
        {
          id: 'btn-copy',
          disabled: table.selected.length === 0,
          icon: <Iconify icon="heroicons:document-duplicate" />,
          menuId: 'copy',
          onClick: handleSubPopoverOpen,
          moreIcon: (
            <Iconify
              icon="mingcute:right-line"
              sx={{
                mr: '0px!important',
                ml: 'auto',
              }}
            />
          ),
          label: t('dialog.exportResource.actions.copy'),
          show: false,
        },
      ];
      return customShortcut.map((item) => ({
        ...options.find((action) => action.id === item.id),
        show: item.show,
      }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      customShortcut,
      handleCloseProfileMultiple,
      handleOpenProfileMultiple,
      handleSubPopoverOpen,
      isHost,
      loading.close_multiple,
      loading.open_multiple,
      profileStatusToFilter,
      t,
      table.selected.length,
    ]);

    const [customShortcutResource, setCustomShortcutResource] = useState(localShortcutResource);

    const list_button_resource_action = useMemo(() => {
      const options = [
        {
          id: 'btn-automation',
          color: 'primary',
          disabled: table.selected.length === 0 || profileStatusToFilter === 'expired',
          icon: <SvgColor src="/assets/icons/navbar/ic_automation.svg" />,
          onClick: () => {
            if (isElectron()) {
              confirm.onTrue('rpa');
            } else {
              actionNotify.onTrue();
            }
          },
          label: 'Automation',
          show: true,
        },
        {
          id: 'btn-addResource',
          disabled: table.selected.length === 0 || profileStatusToFilter === 'expired',
          icon: <Iconify icon="mdi:folder-account-outline" />,
          onClick: () => confirm.onTrue('resource'),
          label: t('actions.addResource'),
          show: true,
        },
        {
          id: 'btn-copyResource',
          disabled: table.selected.length === 0 || profileStatusToFilter === 'expired',
          icon: <Iconify icon="akar-icons:copy" />,
          onClick: () => confirm.onTrue('copyResource'),
          label: t('actions.copyResource'),
          show: true,
        },
        {
          id: 'btn-exportResource',
          disabled: table.selected.length === 0 || profileStatusToFilter === 'expired',
          icon: <Iconify icon="ph:export-duotone" />,
          onClick: () => confirm.onTrue('exportResource'),
          label: t('actions.exportResource'),
          show: true,
        },
        {
          id: 'btn-more',
          icon: <Iconify icon="ri:more-fill" />,
          onClick: popover.onOpen,
          sx: {
            minWidth: '36px',
            '& .MuiButton-startIcon': {
              mx: 0,
            },
          },
          show: true,
        },
        {
          id: 'btn-move',
          disabled: table.selected.length === 0 || profileStatusToFilter === 'expired',
          icon: <Iconify icon="fluent:share-48-regular" />,
          onClick: () => {
            confirm.onTrue('move');
            popover.onClose();
          },
          label: t('actions.switch-group'),
          show: false,
        },
        {
          id: 'btn-renew',
          disabled: table.selected.length === 0,
          icon: <Iconify icon="gg:calendar-next" />,
          onClick: () => {
            confirm.onTrue('renew');
            popover.onClose();
          },
          label: t('actions.renew'),
          show: false,
        },
        {
          id: 'btn-enableAutoRenew',
          disabled: table.selected.length === 0,
          icon: <Iconify icon="mdi:autorenew" />,
          onClick: () => {
            confirm.onTrue('enableAutoRenew');
            popover.onClose();
          },
          label: t('actions.enableAutoRenew'),
          show: false,
        },
        {
          id: 'btn-disableAutoRenew',
          disabled: table.selected.length === 0,
          icon: <Iconify icon="mdi:autorenew-off" />,
          onClick: () => {
            confirm.onTrue('disableAutoRenew');
            popover.onClose();
          },
          label: t('actions.disableAutoRenew'),
          show: false,
        },
        {
          id: 'btn-switch-workspace',
          disabled: table.selected.length === 0,
          icon: <Iconify icon="material-symbols-light:move-up" />,
          onClick: () => {
            confirm.onTrue('switch_workspace');
            popover.onClose();
          },
          label: t('actions.switchWorkspace'),
          show: false,
          sx: isHost ? {} : { display: 'none' },
        },
        {
          id: 'btn-send',
          disabled: table.selected.length === 0 || profileStatusToFilter === 'expired',
          icon: <Iconify icon="icon-park-outline:switch" />,
          onClick: () => {
            confirm.onTrue('send');
            popover.onClose();
          },
          label: t('actions.send'),
          show: false,
        },
        {
          id: 'btn-proxy',
          disabled: table.selected.length === 0 || profileStatusToFilter === 'expired',
          icon: <Iconify icon="solar:global-linear" />,
          onClick: () => {
            confirm.onTrue('proxy');
            popover.onClose();
          },
          label: t('actions.proxyUpdate'),
          show: false,
        },
        {
          id: 'btn-copy',
          disabled: table.selected.length === 0,
          icon: <Iconify icon="tdesign:file-copy" />,
          onClick: () => {
            copy(table.selected.map((item) => item.id).join('\n'));
            enqueueSnackbar(t('systemNotify.success.copied'), { variant: 'success' });
            popover.onClose();
          },
          label: t('actions.copyId'),
          show: false,
        },
      ];
      return customShortcutResource.map((item) => ({
        ...options.find((action) => action.id === item.id),
        show: item.show,
      }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customShortcutResource, isHost, profileStatusToFilter, t, table.selected]);

    const renderSubPopover = (
      <Popover
        open={Boolean(anchorSubPopover)}
        anchorEl={anchorSubPopover}
        onMouseLeave={handleSubPopoverClose}
        disableRestoreFocus
        anchorOrigin={
          subPopoverPosition === 'inter'
            ? {
                vertical: 'top',
                horizontal: 'right',
              }
            : {
                vertical: 'bottom',
                horizontal: 'left',
              }
        }
        transformOrigin={
          subPopoverPosition === 'inter'
            ? {
                vertical: 'top',
                horizontal: 'left',
              }
            : {
                vertical: 'top',
                horizontal: 'left',
              }
        }
        sx={{
          pointerEvents: 'none',
          '& .MuiButtonBase-root.MuiMenuItem-root': {
            mb: '0px',
          },
        }}
      >
        {targetAnchorSub === 'copy' && (
          <>
            <MenuItem
              sx={{ pointerEvents: 'auto' }}
              onClick={() => {
                copy(table.selected.map((item) => item.id).join('\n'));
                enqueueSnackbar(t('systemNotify.success.copied'), { variant: 'success' });
                popover.onClose();
                setAnchorSubPopover(null);
              }}
            >
              {/* <Iconify icon="heroicons:document-duplicate" /> */}
              {t('actions.copyId')}
            </MenuItem>
            <MenuItem
              sx={{ pointerEvents: 'auto' }}
              onClick={() => {
                copy(
                  table.selected
                    .map((item) => {
                      if (item?.proxy_type === 'token') {
                        return item?.proxy_token;
                      }
                      if (item?.proxy_type !== '') {
                        return `${item?.proxy_host}:${item?.proxy_port}:${item?.proxy_user || ''}:${
                          item?.proxy_password || ''
                        }`;
                      }
                      return '';
                    })
                    .join('\n')
                );
                enqueueSnackbar(t('systemNotify.success.copied'), { variant: 'success' });
                popover.onClose();
                setAnchorSubPopover(null);
              }}
            >
              {/* <Iconify icon="material-symbols-light:tab-duplicate-outline-rounded" /> */}
              {t('actions.copyProxy')}
            </MenuItem>
          </>
        )}
        {targetAnchorSub === 'update' && (
          <>
            <MenuItem
              sx={{ pointerEvents: 'auto' }}
              onClick={() => {
                confirm.onTrue('profileTags');
                popover.onClose();
                setAnchorSubPopover(null);
              }}
            >
              {t('dialog.setTag.actions.setTag')}
            </MenuItem>
            <MenuItem
              sx={{ pointerEvents: 'auto' }}
              onClick={() => {
                confirm.onTrue('removeTags');
                popover.onClose();
                setAnchorSubPopover(null);
              }}
            >
              {t('dialog.removeTag.title')}
            </MenuItem>
            <MenuItem
              sx={{ pointerEvents: 'auto' }}
              onClick={() => {
                confirm.onTrue('addTab');
                popover.onClose();
                setAnchorSubPopover(null);
              }}
            >
              {t('actions.addTabs')}
            </MenuItem>
            <MenuItem
              sx={{ pointerEvents: 'auto' }}
              onClick={() => {
                confirm.onTrue('deleteTab');
                popover.onClose();
                setAnchorSubPopover(null);
              }}
            >
              {t('actions.deleteTabs')}
            </MenuItem>
            <MenuItem
              sx={{ pointerEvents: 'auto' }}
              onClick={() => {
                confirm.onTrue('addBookmark');
                popover.onClose();
                setAnchorSubPopover(null);
              }}
            >
              {t('actions.addBookmark')}
            </MenuItem>
            <MenuItem
              sx={{ pointerEvents: 'auto' }}
              onClick={() => {
                confirm.onTrue('deleteBookmark');
                popover.onClose();
                setAnchorSubPopover(null);
              }}
            >
              {t('actions.deleteBookmark')}
            </MenuItem>
            <Divider sx={{ px: '4px!important', margin: '0px!important' }} />
            <MenuItem
              sx={{ pointerEvents: 'auto' }}
              onClick={() => {
                confirm.onTrue('updateNote');
                popover.onClose();
                setAnchorSubPopover(null);
              }}
            >
              {t('actions.updateNote')}
            </MenuItem>
            <MenuItem
              sx={{ pointerEvents: 'auto' }}
              onClick={() => {
                confirm.onTrue('updateBrowserKernel');
                popover.onClose();
                setAnchorSubPopover(null);
              }}
            >
              {t('actions.updateKernel')}
            </MenuItem>
            <MenuItem
              sx={{ pointerEvents: 'auto' }}
              onClick={() => {
                confirm.onTrue('removeProxy');
                popover.onClose();
                setAnchorSubPopover(null);
              }}
            >
              {t('dialog.removeProxy.title')}
            </MenuItem>
            <MenuItem
              sx={{ pointerEvents: 'auto' }}
              onClick={() => {
                confirm.onTrue('deleteCookie');
                popover.onClose();
                setAnchorSubPopover(null);
              }}
            >
              {t('actions.deleteCookie')}
            </MenuItem>
            <MenuItem
              sx={{ pointerEvents: 'auto' }}
              onClick={() => {
                confirm.onTrue('clearCache');
                popover.onClose();
                setAnchorSubPopover(null);
              }}
            >
              {t('actions.clearCache')}
            </MenuItem>
          </>
        )}
      </Popover>
    );

    const renderButton = (
      <>
        <Grid container spacing={2} paddingTop={0.6}>
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              id="search-profile"
              ref={searchRef}
              fullWidth
              type="search"
              defaultValue={filters.search}
              placeholder={`${t('actions.search')}...`}
              size="small"
              onChange={debounce((event) => handleFilters('search', event.target.value), 200)}
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      mr: 1,
                      display: 'flex',
                      alignItems: 'center',
                      maxWidth: 0.6,
                    }}
                  >
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
                    </InputAdornment>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      maxWidth={0.8}
                      sx={{
                        overflowY: 'hidden',
                        overflowX: 'auto',
                        '&::-webkit-scrollbar': {
                          height: '2px',
                        },
                      }}
                    >
                      {advancedSearch.map((item) => (
                        <Chip
                          key={item.id}
                          label={
                            typeof item.value === 'string'
                              ? item.value
                              : item.value.map((i) => i.name).join(', ')
                          }
                          onDelete={() => {
                            setAdvancedSearch((prev) => prev.filter((i) => i.id !== item.id));
                          }}
                          sx={{
                            color: 'text.primary',
                            typography: 'caption',
                            height: '90%',
                            borderRadius: '6px',
                            backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.4),
                            '&:hover': {
                              backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.08),
                            },
                            '& .MuiChip-label': {
                              px: 0.5,
                            },
                            '& .MuiChip-deleteIcon': {
                              m: 0,
                              flexShrink: 0,
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                ),
                endAdornment: (
                  <IconButton
                    onClick={handleOpenSearchBar}
                    sx={{
                      p: 1,
                    }}
                  >
                    <Iconify icon="oui:app-advanced-settings" width={16} />
                  </IconButton>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  px: 0.5,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={3} lg={2}>
            <TextField
              fullWidth
              select
              value={filters.status}
              label={
                filters.display === 'profile' ? t('actions.status') : t('actions.resourceStatus')
              }
              size="small"
              InputLabelProps={{ shrink: true }}
              onChange={(event) => handleFilters('status', event.target.value)}
            >
              {(filters.display === 'profile' ? profileStatus : resourceStatus).map((item) => (
                <MenuItem key={item.id} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3} lg={2}>
            <TextField
              fullWidth
              select
              value={filters.display}
              label={t('actions.displayMode')}
              size="small"
              InputLabelProps={{ shrink: true }}
              onChange={(event) => {
                setQuickActionData([]);
                handleFilters('display', event.target.value);
              }}
            >
              <MenuItem value="profile">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Iconify
                    icon="bxl:chrome"
                    color="primary.main"
                    sx={{
                      flexShrink: 0,
                      width: 22,
                      height: 22,
                    }}
                  />
                  <Typography>{t('actions.profile')}</Typography>
                </Stack>
              </MenuItem>
              <Divider />
              {RESOURCE_OPTIONS.map((item, index) => (
                <MenuItem key={item.id} value={item.value}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Iconify
                      icon={item.icon}
                      sx={{
                        flexShrink: 0,
                      }}
                    />
                    <Typography>{item.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            overflowY: 'hidden',
            overflowX: 'auto',
            minHeight: '42px',
            maxHeight: '42px',
            pb: '4px',
            scrollbarColor: 'auto',
            '&::-webkit-scrollbar': {
              height: '4px',
            },
          }}
        >
          <Stack direction="row" spacing={1} mr={1}>
            {[...(filters.display === 'profile' ? list_button_action : list_button_resource_action)]
              .filter((item) => item.show)
              .map((item) => (
                <Tooltip key={item.id} title={xxlUp ? '' : item.label}>
                  <span>
                    <Button
                      size="small"
                      color={item.color ? item.color : 'inherit'}
                      disabled={item.disabled}
                      variant={item.label ? 'contained' : 'outlined'}
                      startIcon={item.icon}
                      onClick={item.onClick}
                      onMouseEnter={() => {
                        if (item?.moreIcon) {
                          setSubPopoverPosition('outer');
                        }
                      }}
                      menu-id={item?.menuId ? item.menuId : ''}
                      sx={{
                        ...(!xxlUp &&
                          item.label && {
                            '& .MuiButton-startIcon': {
                              m: 0,
                            },
                          }),
                        ...(!item.label && {
                          ...item.sx,
                        }),
                      }}
                    >
                      {xxlUp && item.label}
                    </Button>
                  </span>
                </Tooltip>
              ))}

            <CustomPopover
              open={popover.open}
              onClose={() => {
                setAnchorSubPopover(null);
                popover.onClose();
              }}
              disableRestoreFocus
              sx={{
                width: 'fit-content',
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              {[
                ...(filters.display === 'profile'
                  ? list_button_action
                  : list_button_resource_action),
              ]
                .filter((item) => !item.show)
                .map((item) => (
                  <MenuItem
                    key={item.id}
                    onClick={item?.moreIcon ? () => {} : item.onClick}
                    disabled={item.disabled}
                    onMouseEnter={(event) => {
                      if (item?.moreIcon) {
                        setSubPopoverPosition('inter');
                        item.onClick(event);
                      } else {
                        handleSubPopoverClose();
                      }
                    }}
                    menu-id={item?.menuId ? item.menuId : ''}
                    sx={item?.sx ? item.sx : {}}
                  >
                    {item.icon}
                    {item.label}
                    {item?.moreIcon}
                  </MenuItem>
                ))}
              <Divider />
              <MenuItem
                onMouseEnter={handleSubPopoverClose}
                onClick={() => {
                  confirm.onTrue('customShortcut');
                  popover.onClose();
                }}
              >
                <Iconify icon="fluent:button-16-regular" />
                {t('actions.customShortcut')}
              </MenuItem>
            </CustomPopover>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Label
              variant="outlined"
              sx={{
                ml: 1,
                whiteSpace: 'nowrap',
                color: 'primary.main',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'primary.main',
                height: 30,
                minWidth: 'fit-content',
                px: 1,
                '&::first-letter': {
                  textTransform: 'uppercase',
                },
                opacity: table.selected.length > 0 ? 1 : 0,
                transition: 'opacity 0.1s ease-in-out',
              }}
            >{`${t('table.selected')} ${table.selected.length}/${table.rowsPerPage}`}</Label>

            <Tooltip title={<Typography variant="body2">{t('dialog.setTag.tag')}</Typography>}>
              <Button
                onClick={() => confirm.onTrue('tags')}
                size="small"
                variant="contained"
                sx={{
                  ...(!mdUp && {
                    '& .MuiButton-startIcon': {
                      m: 0,
                    },
                  }),
                  paddingX: 2,
                }}
              >
                <Iconify icon="tabler:tags" />
              </Button>
            </Tooltip>
            <Tooltip title={<Typography variant="body2">{t('tooltip.arrange')}</Typography>}>
              <Button
                onClick={hanldeSortProfileWindow}
                size="small"
                variant="contained"
                sx={{
                  ...(!mdUp && {
                    '& .MuiButton-startIcon': {
                      m: 0,
                    },
                  }),
                  paddingX: 2,
                }}
              >
                <Iconify icon="akar-icons:sort" />
              </Button>
            </Tooltip>
            <Tooltip title={<Typography variant="body2">{t('tooltip.reload')}</Typography>}>
              <LoadingButton
                onClick={async () => {
                  setLoading((prev) => ({
                    ...prev,
                    reload: true,
                  }));
                  await handleFetchData();
                  setLoading((prev) => ({
                    ...prev,
                    reload: false,
                  }));
                }}
                size="small"
                variant="contained"
                sx={{
                  ...(!mdUp && {
                    '& .MuiButton-startIcon': {
                      m: 0,
                    },
                  }),
                  paddingX: 2,
                }}
                loading={loading.reload}
              >
                <Iconify icon="mdi:reload" />
              </LoadingButton>
            </Tooltip>
            <ButtonGroup variant="contained" aria-label="Create button group">
              <Tooltip title={mdUp ? '' : t('actions.create')}>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  startIcon={<Iconify icon="basil:add-outline" />}
                  onClick={() =>
                    router.push(`${paths.profile.create}?defaultGroup=${groupSelected}`)
                  }
                  sx={{
                    whiteSpace: 'nowrap',
                    ...(!mdUp && {
                      '& .MuiButton-startIcon': {
                        m: 0,
                      },
                    }),
                  }}
                >
                  {mdUp && t('actions.create')}
                </Button>
              </Tooltip>
              <Button
                size="small"
                ref={createButton}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <Iconify icon="icon-park-outline:down" />
              </Button>
            </ButtonGroup>
          </Stack>
        </Stack>

        {createPortal(
          <Stack
            sx={{
              position: 'fixed',
              // eslint-disable-next-line no-unsafe-optional-chaining
              top: `${createButton?.current?.getBoundingClientRect()?.bottom + window.scrollY}px`,
              left: `${
                // eslint-disable-next-line no-unsafe-optional-chaining
                createButton?.current?.getBoundingClientRect()?.left +
                window.scrollX -
                94 +
                // eslint-disable-next-line no-unsafe-optional-chaining
                createButton?.current?.getBoundingClientRect()?.width
              }px`,
              zIndex: 9999,
              borderRadius: 1,
              p: 0.5,
              backgroundColor: 'rgba(33, 43, 54, 0.9)',
              backgroundImage: 'url(/assets/cyan-blur.png), url(/assets/red-blur.png)',
              backdropFilter: 'blur(20px)',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top right, left bottom',
              backgroundSize: '50% 50%',
              transformOrigin: 'top right',
              transform: isHovering ? 'scale(1)' : 'scale(0)',
              transition: 'transform 0.2s ease-in-out',
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <MenuItem
              onClick={() => {
                setTimeout(() => {
                  router.push(
                    `${paths.profile.create}?defaultGroup=${groupSelected}&method=import-file`
                  );
                }, [0]);
              }}
            >
              {t('create-method.import-file')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setTimeout(() => {
                  router.push(
                    `${paths.profile.create}?defaultGroup=${groupSelected}&method=batch-create`
                  );
                }, [0]);
              }}
            >
              {t('create-method.batch-create')}
            </MenuItem>
          </Stack>,
          document.body
        )}

        <AdvancedSearch
          anchorEl={anchorEl}
          handleClose={handleCloseSearchBar}
          advancedSearch={advancedSearch}
          setAdvancedSearch={setAdvancedSearch}
          resetPage={table.onResetPage}
        />
      </>
    );

    const renderDialog = (
      <>
        <RpaMultiFormDialog
          open={confirm.value.rpa}
          onClose={() => confirm.onFalse('rpa')}
          profileIds={table.selected
            .filter((profile) => !profile.profileIsExpired && profile.browser_type !== 'fbrowser')
            .map((profile) => profile.id)}
          listWorkflowGroup={workflowGroup}
          hasFBrowser={table.selected.some((profile) => profile.browser_type === 'fbrowser')}
        />
        <DeleteMultiDialog
          open={confirm.value.delete}
          onClose={() => confirm.onFalse('delete')}
          handleReLoadData={handleFetchData}
          profileIds={table.selected.map((profile) => profile.id)}
          workspaceId={workspaceId}
        />
        <RenewMultiDialog
          open={confirm.value.renew}
          onClose={() => confirm.onFalse('renew')}
          profileIds={table.selected.map((profile) => profile.id)}
          workspaceId={workspaceId}
          handleReLoadData={handleFetchData}
          handleReloadBalance={updateRefreshBalance}
        />
        <AutoRenewMultiDialog
          open={confirm.value.enableAutoRenew}
          onClose={() => confirm.onFalse('enableAutoRenew')}
          profileIds={table.selected.map((profile) => profile.id)}
          workspaceId={workspaceId}
          handleReLoadData={handleFetchData}
          handleReloadBalance={updateRefreshBalance}
          autoRenew
        />
        <AutoRenewMultiDialog
          open={confirm.value.disableAutoRenew}
          onClose={() => confirm.onFalse('disableAutoRenew')}
          profileIds={table.selected.map((profile) => profile.id)}
          workspaceId={workspaceId}
          handleReLoadData={handleFetchData}
          handleReloadBalance={updateRefreshBalance}
          autoRenew={false}
        />
        <TransferMultiDialog
          open={confirm.value.send}
          onClose={() => confirm.onFalse('send')}
          profileIds={table.selected
            .filter((profile) => !profile.profileIsExpired)
            .map((profile) => profile.id)}
          workspaceId={workspaceId}
          handleResetData={handleFetchData}
        />

        <MoveMultiDialog
          open={confirm.value.move}
          onClose={() => confirm.onFalse('move')}
          listButton={listGroup.filter((option) => option.id !== -1)}
          handleReLoadData={handleFetchData}
          profileIds={table.selected
            .filter((profile) => !profile.profileIsExpired)
            .map((profile) => profile.id)}
          workspaceId={workspaceId}
          handleReloadBalance={updateRefreshBalance}
        />

        <UpdateMultiNoteDialog
          open={confirm.value.updateNote}
          onClose={() => confirm.onFalse('updateNote')}
          handleReLoadData={handleFetchData}
          profileIds={table.selected
            .filter((profile) => !profile.profileIsExpired)
            .map((profile) => profile.id)}
        />

        <UpdateMultiBrowserKernelDialog
          open={confirm.value.updateBrowserKernel}
          onClose={() => confirm.onFalse('updateBrowserKernel')}
          handleReLoadData={handleFetchData}
          cProfileIds={table.selected
            .filter((profile) => !profile.profileIsExpired && profile.browser_type === 'cbrowser')
            .map((profile) => profile.id)}
          fProfileIds={table.selected
            .filter((profile) => !profile.profileIsExpired && profile.browser_type === 'fbrowser')
            .map((profile) => profile.id)}
        />

        <UpdateProxyDialog
          open={confirm.value.proxy}
          onClose={() => confirm.onFalse('proxy')}
          handleResetData={handleFetchData}
          profileIds={table.selected
            .filter((profile) => !profile.profileIsExpired)
            .map((profile) => profile.id)}
          workspaceId={workspaceId}
        />

        <AddBookmarkMultiDialog
          open={confirm.value.addBookmark}
          onClose={() => confirm.onFalse('addBookmark')}
          profileIds={table.selected.map((profile) => profile.id)}
          workspaceId={workspaceId}
        />

        <DeleteBookmarkMultiDialog
          open={confirm.value.deleteBookmark}
          onClose={() => confirm.onFalse('deleteBookmark')}
          profileIds={table.selected.map((profile) => profile.id)}
          workspaceId={workspaceId}
        />

        <AddTabMultiDialog
          open={confirm.value.addTab}
          onClose={() => confirm.onFalse('addTab')}
          profileIds={table.selected.map((profile) => profile.id)}
          workspaceId={workspaceId}
        />

        <DeleteTabMultiDialog
          open={confirm.value.deleteTab}
          onClose={() => confirm.onFalse('deleteTab')}
          profileIds={table.selected.map((profile) => profile.id)}
          workspaceId={workspaceId}
        />

        <ConfirmDialog
          open={confirm.value.progress}
          onClose={() => confirm.onFalse('progress')}
          onlyButton
          content={
            <Stack direction="column" spacing={3} alignItems="center">
              <CircularProgressWithLabel value={downloadProgressPercent} variant="determinate" />
              <Typography variant="h6">
                {extractionStatus === 'pending'
                  ? t('dialog.downloadBrowser.title', { browserName: browserDownloadName })
                  : t('dialog.downloadBrowser.extracting')}
              </Typography>
            </Stack>
          }
        />

        <SortProfileWindowsDialog
          displayScreens={displayScreens}
          open={confirm.value.sort}
          onClose={() => confirm.onFalse('sort')}
        />

        <ImportResourceDialog
          open={confirm.value.resource}
          onClose={() => confirm.onFalse('resource')}
          profileIds={table.selected
            .filter((profile) => !profile.profileIsExpired)
            .map((profile) => profile.id)}
          handleResetData={handleFetchData}
        />

        <ColumnSettingDialog
          open={confirm.value.columnSetting}
          onClose={() => confirm.onFalse('columnSetting')}
          options={TABLE_HEAD.slice(1, TABLE_HEAD.length - (filters.display === 'profile' ? 0 : 2))}
          values={visibleColumn}
          setValues={handleApplySetting}
        />

        <CustomShortcutDialog
          displayMode={filters.display}
          open={confirm.value.customShortcut}
          onClose={() => confirm.onFalse('customShortcut')}
          listButtonAction={
            filters.display === 'profile' ? list_button_action : list_button_resource_action
          }
          values={filters.display === 'profile' ? customShortcut : customShortcutResource}
          setValues={(value) => {
            if (filters.display === 'profile') {
              setCustomShortcut(value);
            } else {
              setCustomShortcutResource(value);
            }
          }}
        />

        <MoveMultiWorkspaceDialog
          open={confirm.value.switch_workspace}
          onClose={() => confirm.onFalse('switch_workspace')}
          handleReLoadData={handleFetchData}
          profileIds={table.selected.map((profile) => profile.id)}
        />

        {filters.display !== 'profile' && (
          <ExportResourceDialog
            open={confirm.value.exportResource || confirm.value.copyResource}
            onClose={() =>
              confirm.onFalse(
                (confirm.value.exportResource && 'exportResource') ||
                  (confirm.value.copyResource && 'copyResource')
              )
            }
            profiles={updateSelectedProfiles(table.selected, quickActionData)}
            mode={
              (confirm.value.exportResource && 'export') ||
              (confirm.value.copyResource && 'copy') ||
              ''
            }
          />
        )}

        <SetMultiTagDialog
          open={confirm.value.profileTags}
          onClose={() => confirm.onFalse('profileTags')}
          profileIds={table.selected.map((profile) => profile.id)}
          handleReLoadData={handleFetchData}
        />

        <DeleteMultiCookieDialog
          open={confirm.value.deleteCookie}
          onClose={() => confirm.onFalse('deleteCookie')}
          profileIds={table.selected.map((profile) => profile.id)}
          handleReLoadData={handleFetchData}
        />

        <DeleteMultiCacheDialog
          open={confirm.value.clearCache}
          onClose={() => confirm.onFalse('clearCache')}
          profileIds={table.selected.map((profile) => profile.id)}
          handleReLoadData={handleFetchData}
        />

        <RemoveMultiTagDialog
          open={confirm.value.removeTags}
          onClose={() => confirm.onFalse('removeTags')}
          profileIds={table.selected.map((profile) => profile.id)}
          handleReLoadData={handleFetchData}
        />

        <RemoveMultiProxyDialog
          open={confirm.value.removeProxy}
          onClose={() => confirm.onFalse('removeProxy')}
          profileIds={table.selected.map((profile) => profile.id)}
          handleReLoadData={handleFetchData}
        />

        <ListTagDialog
          open={confirm.value.tags}
          onClose={() => confirm.onFalse('tags')}
          handleReLoadData={handleFetchData}
        />
      </>
    );

    return (
      <Container
        maxWidth={settings.themeStretch ? false : 'lg'}
        sx={{
          height: 1,
          pb: 1,
          pr: '0px!important',
        }}
      >
        <Stack spacing={2} height={1}>
          {renderButton}
          {renderSubPopover}
          <Stack
            height={1}
            boxShadow={(theme) => theme.customShadows.z4}
            overflow="hidden"
            sx={{
              borderRadius: 2,
            }}
          >
            {renderTable}
            {renderPagination}
          </Stack>
        </Stack>
        {renderDialog}
        <ConfirmDialog
          open={notify.value || actionNotify.value}
          disableButtonAction
          sx={{
            '& h2': {
              display: 'none',
            },
            '& .MuiDialogContent-root': {
              padding: 0,
            },
            '& .MuiDialogActions-root': {
              display: 'none',
            },
          }}
          content={
            <Stack direction="row" alignItems="center" spacing={3} p={2} px={3}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  flexShrink: 0,
                  borderRadius: '100%',
                  boxShadow: '0 0 0 6px rgb(255, 171, 0, 0.6)',
                  mx: 1,
                }}
              >
                <Iconify icon="ep:warning-filled" color="warning.main" width={1} />
              </Box>
              <Stack>
                <Typography variant="h6">
                  {(notify.value && t('openProfile.title')) ||
                    (actionNotify.value && t('openProfile.actionTitle'))}
                </Typography>
                <Typography color="text.secondary">{t('openProfile.detail')}</Typography>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      notify.onFalse();
                      actionNotify.onFalse();
                    }}
                  >
                    {t('openProfile.action.later')}
                  </Button>
                  <Button
                    component={Link}
                    color="primary"
                    size="small"
                    variant="contained"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://mktlogin.com/tai-ve"
                  >
                    {t('openProfile.action.download')}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          }
          onClose={() => {
            notify.onFalse();
            actionNotify.onFalse();
          }}
        />
        <RenderRowPopup
          confirm={rowConfirm}
          groupOption={listGroup.filter((option) => option.id !== -1)}
          profileInfo={profileInfo}
          setProfileInfo={setProfileInfo}
          handleResetData={handleFetchData}
          quickActionId={quickActionId}
          quickActionData={quickActionData}
          setQuickActionData={setQuickActionData}
          quickEdit={quickEdit}
          resourceType={filters.display}
        />
      </Container>
    );
  },
  (prevProps, nextProps) =>
    prevProps.listGroup === nextProps.listGroup &&
    prevProps.groupSelected === nextProps.groupSelected &&
    prevProps.refreshKey === nextProps.refreshKey
);

ProfilePage.propTypes = {
  listGroup: PropTypes.array,
  groupSelected: PropTypes.number,
  refreshKey: PropTypes.number,
};

export default ProfilePage;
