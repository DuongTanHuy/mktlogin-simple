import * as React from 'react';
import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';
import { Divider, MenuItem, Stack, Zoom, alpha } from '@mui/material';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';
import { useLocales } from 'src/locales';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useAuthContext } from 'src/auth/hooks';
import { isElectron } from 'src/utils/commom';
import { transformKernelVersionToBrowserName } from 'src/utils/profile';
import { getKernelVersionByIdApi } from 'src/api/cms.api';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import { IS_BROWSER_DOWNLOADING, PROFILES_ID_OPENING } from 'src/utils/constance';
import virtualProfileTableHeader from './virtual-profile-table-header';
import virtualProfileTableRow from './virtual-profile-table-row';

export default function VirtualProfileTable({
  headers,
  rowCount,
  numSelected,
  onSelectAllRows,
  onShiftSelectAllRows,
  rows,
  visibleColumn = [],
  tableSelected,
  onSelectRow,
  openQuickEdit,
  confirm,
  rowConfirm,
  setProfileInfo,
  setBrowserDownloadName,
  onOpenDownloadProgress,
  showNotify,
  quickData,
  isProfileDisplay,
  updateProfileState,
  updateProfileLoading,
  order,
  onSort,
}) {
  const { t } = useLocales();
  const [groupRef, showGroup] = useTooltipNecessity(false);
  const [noteRef, showNote] = useTooltipNecessity(false);
  const [passRef, showPass] = useTooltipNecessity(false);
  const [usernameRef, showUsername] = useTooltipNecessity(false);
  const [emailRef, showEmail] = useTooltipNecessity(false);
  const [emailRecoveryRef, showEmailRecovery] = useTooltipNecessity(false);
  const [tokenRef, showToken] = useTooltipNecessity(false);
  const [cookieRef, showCookie] = useTooltipNecessity(false);

  const [targetPopover, setTargetPopover] = useState(null);
  const popoverTimeoutRef = useRef();
  const router = useRouter();
  const { workspace_id } = useAuthContext();
  const [targetProfile, setTargetProfile] = useState(null);

  const columnNameVisible = useMemo(
    () =>
      visibleColumn.reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {}),
    [visibleColumn]
  );

  const [lastChecked, setLastChecked] = useState(null);

  const handleSelectRow = useCallback(
    (event, row, index) => {
      if (event.shiftKey && lastChecked !== null && index !== undefined) {
        const start = Math.min(lastChecked, index);
        const end = Math.max(lastChecked, index);

        onShiftSelectAllRows(
          rows.slice(lastChecked > index ? start : start + 1, lastChecked > index ? end : end + 1)
        );
        setLastChecked(null);
      } else {
        onSelectRow(row);
        setLastChecked(index);
      }
    },
    [lastChecked, onSelectRow, onShiftSelectAllRows, rows]
  );

  const downloadBrowserIfNeeded = async (kenelVersion) => {
    const kenerVersionResponse = await getKernelVersionByIdApi(kenelVersion.id);
    if (kenerVersionResponse?.data) {
      window.ipcRenderer.send('download-browser', kenerVersionResponse.data);
      setStorage(IS_BROWSER_DOWNLOADING, 'yes');
    }
  };

  const openProfile = async (profile) => {
    window.ipcRenderer.invoke('profile-open', profile).then((res) => {
      if (res === 'opened') {
        updateProfileState([profile.id], 'open');
      }
    });
  };

  const handleOpenProfileFromElectron = async (profile) => {
    const isDownloaded = await window.ipcRenderer.invoke('check-browser-download', {
      browser_type: profile.kernel_version.type,
      kernel_version: profile.kernel_version.kernel,
    });

    if (isDownloaded) {
      await openProfile(profile);
    } else {
      updateProfileLoading([profile.id], false);
      setBrowserDownloadName(transformKernelVersionToBrowserName(profile.kernel_version));
      onOpenDownloadProgress();
      await downloadBrowserIfNeeded(profile.kernel_version);
    }
  };

  const closeProfile = async (profileId) => {
    const profilesOpened = getStorage(PROFILES_ID_OPENING);
    if (profilesOpened.includes(profileId)) {
      updateProfileState([profileId], 'syncing');
      window.ipcRenderer.send('profile-close', profileId);
    }
  };

  const handleClose = async (profileId) => {
    try {
      if (isElectron()) {
        closeProfile(profileId);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const handleDisplayWindow = async (profile_id) => {
    try {
      if (isElectron()) {
        window.ipcRenderer.send('show-profile', profile_id);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  useEffect(() => {
    if (targetPopover) {
      setTargetProfile(
        rows.find((item) => String(item?.id) === targetPopover?.getAttribute('profile-id'))
      );
    }
  }, [rows, targetPopover]);

  useEffect(
    () => () => {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
    },
    []
  );

  const virtuosoTableComponents = useMemo(
    () => ({
      // eslint-disable-next-line react/no-unstable-nested-components
      Scroller: React.forwardRef((props, ref) => (
        <TableContainer
          component={Paper}
          {...props}
          ref={ref}
          sx={{
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              boxShadow: 'none',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.32),
              borderRadius: '10px',
              border: '1px',
              backgroundClip: 'content-box',
            },
          }}
        />
      )),
      Table: (props) => {
        const settings = useSettingsContext();

        return (
          <Table
            {...props}
            sx={{
              minWidth: 1300,
              '& thead': {
                position: 'sticky',
                top: 0,
                zIndex: 1,
              },
              '& th': {
                color: 'text.primary',
                fontWeight: 'bold',
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
                  isProfileDisplay && {
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
              ...(!isProfileDisplay && {
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
                  right: 290,
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
          />
        );
      },
      // eslint-disable-next-line react/no-unstable-nested-components
      TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
      // eslint-disable-next-line react/no-unstable-nested-components
      TableRow: React.forwardRef((props, ref) => <TableRow hover {...props} ref={ref} />),
      // eslint-disable-next-line react/no-unstable-nested-components
      TableBody: React.forwardRef((props, ref) => (
        <TableBody
          {...props}
          ref={ref}
          sx={{
            '& tr': {
              bgcolor: 'background.default',
              px: 2,
              borderRadius: 1,
              cursor: 'pointer',
              height: 70,
              '&:hover .edit-btn': {
                opacity: 1,
              },
              '&:hover': {
                bgcolor: 'background.paper',
              },
              // transition: (theme) =>
              //   theme.transitions.create('opacity', {
              //     easing: theme.transitions.easing.easeInOut,
              //     duration: theme.transitions.duration.shorter,
              //   }),
            },
          }}
        />
      )),
    }),
    [isProfileDisplay]
  );

  return (
    <Paper
      id="virtual-profile-table"
      style={{
        height: '100%',
        width: '100%',
      }}
      sx={{
        position: 'relative',
        '& .MuiPaper-root': {
          bgcolor: 'background.default',
        },
        // '&::after': {
        //   content: '""',
        //   position: 'absolute',
        //   right: 0,
        //   bottom: 0,
        //   width: '8px',
        //   height: '8px',
        //   backgroundColor: 'background.default',
        // },
      }}
    >
      <TableVirtuoso
        data={rows}
        components={virtuosoTableComponents}
        fixedHeaderContent={() =>
          virtualProfileTableHeader({
            headers,
            visibleColumn,
            numSelected,
            rowCount,
            onSelectAllRows,
            confirm,
            t,
            order,
            onSort,
          })
        }
        // eslint-disable-next-line react/jsx-no-bind
        itemContent={(_index, row) =>
          virtualProfileTableRow({
            _index,
            row,
            isProfileDisplay,
            quickData,
            updateProfileLoading,
            workspace_id,
            handleOpenProfileFromElectron,
            handleClose,
            handleDisplayWindow,
            t,
            showNotify,
            tableSelected,
            handleSelectRow,
            columnNameVisible,
            showGroup,
            groupRef,
            openQuickEdit,
            showNote,
            noteRef,
            showUsername,
            usernameRef,
            showPass,
            passRef,
            showEmail,
            emailRef,
            showEmailRecovery,
            emailRecoveryRef,
            showToken,
            tokenRef,
            showCookie,
            cookieRef,
            setTargetPopover,
          })
        }
      />
      <CustomPopover
        open={targetPopover}
        onClose={() => setTargetPopover(null)}
        sx={{
          width: 'fit-content',
        }}
        TransitionComponent={Zoom}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Stack>
          <MenuItem
            onClick={() => {
              setTargetPopover(null);
              setTimeout(() => {
                router.push(paths.profile.edit(targetProfile?.id));
              }, 0);
            }}
            disabled={targetProfile?.profileIsExpired}
          >
            <Iconify icon="uil:edit" />
            {t('actions.edit')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              rowConfirm.onTrue('duplicate');
              setProfileInfo({
                ...targetProfile,
                ...(quickData.find((item) => item.id === targetProfile?.id) || {}),
              });
            }}
          >
            <Iconify icon="octicon:duplicate-16" />
            {t('actions.duplicate')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              rowConfirm.onTrue('renew');
              setProfileInfo({
                ...targetProfile,
                ...(quickData.find((item) => item.id === targetProfile?.id) || {}),
              });
            }}
          >
            <Iconify icon="gg:calendar-next" />
            {t('actions.renew')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              rowConfirm.onTrue('deleteCookie');
              setProfileInfo({
                ...targetProfile,
                ...(quickData.find((item) => item.id === targetProfile?.id) || {}),
              });
            }}
            disabled={targetProfile?.profileIsExpired}
          >
            <Iconify icon="material-symbols:cookie-off-outline-rounded" />
            {t('actions.deleteCookie')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              rowConfirm.onTrue('clearCache');
              setProfileInfo({
                ...targetProfile,
                ...(quickData.find((item) => item.id === targetProfile?.id) || {}),
              });
            }}
            disabled={targetProfile?.profileIsExpired}
          >
            <Iconify icon="hugeicons:row-delete" />
            {t('actions.clearCache')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              rowConfirm.onTrue('send');
              setProfileInfo({
                ...targetProfile,
                ...(quickData.find((item) => item.id === targetProfile?.id) || {}),
              });
            }}
            disabled={targetProfile?.profileIsExpired}
          >
            <Iconify icon="icon-park-outline:switch" />
            {t('actions.send')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              rowConfirm.onTrue('move');
              setProfileInfo({
                ...targetProfile,
                ...(quickData.find((item) => item.id === targetProfile?.id) || {}),
              });
            }}
            disabled={targetProfile?.profileIsExpired}
          >
            <Iconify icon="fluent:share-48-regular" />
            {t('actions.switch-group')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              rowConfirm.onTrue('switch_workspace');
              setProfileInfo({
                ...targetProfile,
                ...(quickData.find((item) => item.id === targetProfile?.id) || {}),
              });
            }}
            disabled={targetProfile?.profileIsExpired}
          >
            <Iconify icon="material-symbols-light:move-up" />
            {t('actions.switchWorkspace')}
          </MenuItem>

          <Divider />
          <MenuItem
            sx={{
              color: 'error.main',
            }}
            onClick={() => {
              rowConfirm.onTrue('delete');
              setProfileInfo({
                ...targetProfile,
                ...(quickData.find((item) => item.id === targetProfile?.id) || {}),
              });
            }}
          >
            <Iconify icon="fluent:delete-16-regular" />
            {t('actions.delete')}
          </MenuItem>
        </Stack>
      </CustomPopover>
    </Paper>
  );
}

VirtualProfileTable.propTypes = {
  headers: PropTypes.array,
  rows: PropTypes.array,
  visibleColumn: PropTypes.array,
  tableSelected: PropTypes.array,
  quickData: PropTypes.array,
  onSelectRow: PropTypes.func,
  openQuickEdit: PropTypes.func,
  rowCount: PropTypes.number,
  numSelected: PropTypes.number,
  onSelectAllRows: PropTypes.func,
  onShiftSelectAllRows: PropTypes.func,
  setProfileInfo: PropTypes.func,
  setBrowserDownloadName: PropTypes.func,
  onOpenDownloadProgress: PropTypes.func,
  showNotify: PropTypes.func,
  confirm: PropTypes.object,
  rowConfirm: PropTypes.object,
  isProfileDisplay: PropTypes.bool,
  updateProfileState: PropTypes.func,
  updateProfileLoading: PropTypes.func,
  order: PropTypes.object,
  onSort: PropTypes.func,
};
