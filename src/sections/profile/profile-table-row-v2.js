import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
// mui
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  Zoom,
} from '@mui/material';
// hooks
import CustomPopover from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// components
import { useLocales } from 'src/locales';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import { IS_BROWSER_DOWNLOADING, PROFILES_ID_OPENING } from 'src/utils/constance';
import TextMaxLine from 'src/components/text-max-line';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';
import {
  decryptProxyTokenMktCity,
  isValidBase64,
  transformKernelVersionToBrowserName,
} from 'src/utils/profile';
import { isElectron, isSpecialString } from '../../utils/commom';
// apis
import { getProfileByIdForOpenApi } from '../../api/profile.api';
import { getKernelVersionByIdApi } from '../../api/cms.api';
import { useAuthContext } from '../../auth/hooks';
import { takeHostProxyToken } from '../../utils/proxy';

const ProfileTableRow = React.memo(
  ({
    row,
    selected,
    onSelectRow,
    onOpenDownloadProgress,
    setBrowserDownloadName,
    isProfileDisplay,
    visibleColumn,
    confirm,
    setProfileInfo,
    openQuickEdit,
    quickData,
    showNotify,
  }) => {
    const { t } = useLocales();
    const { isHost } = useAuthContext();

    const columnNameVisible = useMemo(
      () =>
        visibleColumn.reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {}),
      [visibleColumn]
    );

    const isQuickEditResource = useMemo(
      () => row?.account_resources?.length > 0,
      [row.account_resources]
    );

    // profile
    let id;
    let group_name;
    let name;
    let note;
    let duration;
    let proxy_type;
    let proxy_host;
    let profileIsExpired;
    let browser_type;
    let proxy_token;

    // resource
    let uid;
    let username;
    let password;
    let two_fa;
    let email;
    let pass_email;
    let mail_recovery;
    let token;
    let cookie;
    let phone;
    let status;
    let activity_log;

    if (isProfileDisplay) {
      ({
        id,
        group_name,
        name,
        note,
        duration,
        proxy_type,
        proxy_host,
        profileIsExpired,
        browser_type,
        proxy_token,
      } = row);

      if (proxy_type === 'token' && proxy_token && isValidBase64(proxy_token)) {
        try {
          let proxy_token_decoded = atob(proxy_token);
          const proxy_arr = proxy_token_decoded.split(':');
          if (!isSpecialString(proxy_token_decoded)) {
            const proxy_host_array = proxy_arr[0].split('-');
            if (proxy_host_array.length >= 1) {
              proxy_host = proxy_host_array.pop();
            }
          } else {
            proxy_token_decoded = decryptProxyTokenMktCity(proxy_token);
            if (proxy_token_decoded.split('|').length === 3) {
              proxy_host = proxy_token_decoded.split('|')[1];
            }
          }
        } catch (error) {
          /* empty */
        }
      }
    } else if (row?.account_resources) {
      ({ id, name, profileIsExpired, browser_type } = row);
      if (row?.account_resources[0]?.created_at) {
        ({
          account_resources: [
            {
              uid,
              username,
              password,
              two_fa,
              email,
              pass_email,
              mail_recovery,
              token,
              cookie,
              phone,
              status,
              activity_log,
            },
          ],
        } = row);
      }
    }

    const [targetPopover, setTargetPopover] = useState(null);
    const [profileState, setProfileState] = useState(row.state);
    const { workspace_id: workspaceId } = useAuthContext();
    const router = useRouter();

    const [loading, setLoading] = useState({
      delete: false,
      send: false,
      renew: false,
      open: false,
    });

    const [, setIsHovering] = useState(false);
    const popoverTimeoutRef = useRef();

    const [groupRef, showGroup] = useTooltipNecessity(false);
    const [passRef, showPass] = useTooltipNecessity(false);
    const [usernameRef, showUsername] = useTooltipNecessity(false);
    const [noteRef, showNote] = useTooltipNecessity(false);
    const [emailRef, showEmail] = useTooltipNecessity(false);
    const [emailRecoveryRef, showEmailRecovery] = useTooltipNecessity(false);
    const [tokenRef, showToken] = useTooltipNecessity(false);
    const [cookieRef, showCookie] = useTooltipNecessity(false);

    const handleOpenProfileFromElectron = async (profile) => {
      const isDownloaded = await window.ipcRenderer.invoke('check-browser-download', {
        browser_type: profile.kernel_version.type,
        kernel_version: profile.kernel_version.kernel,
      });

      if (isDownloaded) {
        await openProfile(profile);
      } else {
        setLoading((prev) => ({
          ...prev,
          open: false,
        }));
        setBrowserDownloadName(transformKernelVersionToBrowserName(profile.kernel_version));
        onOpenDownloadProgress();
        await downloadBrowserIfNeeded(profile.kernel_version);
      }
    };

    const openProfile = async (profile) => {
      window.ipcRenderer.invoke('profile-open', profile).then((res) => {
        if (res === 'opened') {
          setLoading((prev) => ({
            ...prev,
            open: false,
          }));
          setProfileState('open');
        }
      });
    };

    const closeProfile = async (profileId) => {
      const profilesOpened = getStorage(PROFILES_ID_OPENING);
      if (profilesOpened.includes(profileId)) {
        setProfileState('syncing');
        window.ipcRenderer.send('profile-close', profileId);
      }
    };

    const downloadBrowserIfNeeded = async (kenelVersion) => {
      const kenerVersionResponse = await getKernelVersionByIdApi(kenelVersion.id);
      if (kenerVersionResponse?.data) {
        window.ipcRenderer.send('download-browser', kenerVersionResponse.data);
        setStorage(IS_BROWSER_DOWNLOADING, 'yes');
      }
    };

    const handleClose = async (profileId) => {
      try {
        setLoading((prev) => ({
          ...prev,
          open: true,
        }));
        if (isElectron()) {
          closeProfile(profileId);
        }
      } catch (error) {
        console.error('An error occurred:', error);
      } finally {
        setLoading((prev) => ({
          ...prev,
          open: false,
        }));
      }
    };

    const handleMouseEnter = (event) => {
      popoverTimeoutRef.current = setTimeout(() => {
        if (!targetPopover) {
          setTargetPopover(event.target);
        }
      }, 400);
    };

    const handleMouseMove = debounce(() => {
      setIsHovering((currentIsHovering) => {
        if (!currentIsHovering) {
          clearTimeout(popoverTimeoutRef.current);
          setTargetPopover(null);
        }
        return currentIsHovering;
      });
    }, 100);

    const handleSelectRow = useCallback(() => onSelectRow(row), [onSelectRow, row]);

    const handleOpen = async (profileId) => {
      try {
        setLoading((prev) => ({
          ...prev,
          open: true,
        }));
        const profileResponse = await getProfileByIdForOpenApi(workspaceId, profileId);

        if (isElectron()) {
          await handleOpenProfileFromElectron(profileResponse.data);
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

    const getBrowserIcon = () => {
      let icon;
      if (loading.open) {
        icon = 'eos-icons:bubble-loading';
      } else if (browser_type === 'cbrowser') {
        icon = 'ant-design:chrome-filled';
      } else {
        icon = 'mdi:firefox';
      }
      return icon;
    };

    const getButtonOpenClose = () => {
      if (profileState === 'syncing') {
        return (
          <Button
            size="small"
            color="primary"
            variant="contained"
            disabled
            startIcon={<Iconify icon="eos-icons:bubble-loading" />}
            onClick={() => handleOpen(id)}
            sx={{
              '&:disabled': {
                color: '#ccc',
                bgcolor: 'primary.dark',
              },
            }}
          >
            {t('actions.syncing')}
          </Button>
        );
      }

      if (profileState === 'open') {
        return (
          <>
            <Button
              size="small"
              color="error"
              variant="contained"
              disabled={loading.open}
              startIcon={
                <Iconify
                  icon={loading.open ? 'eos-icons:bubble-loading' : 'material-symbols:close'}
                />
              }
              onClick={() => handleClose(id)}
              sx={{
                '&:disabled': {
                  color: '#ccc',
                  bgcolor: 'error.dark',
                },
                width: 70,
              }}
            >
              {t('actions.close')}
            </Button>
            <IconButton
              sx={{
                marginLeft: 1,
              }}
              onClick={() => handleDisplayWindow(id)}
            >
              <Tooltip title={t('actions.displayWindow')}>
                <Iconify icon="material-symbols:nest-display-outline" />
              </Tooltip>
            </IconButton>
          </>
        );
      }

      return (
        <Tooltip title={profileIsExpired ? t('tooltip.profileExpired') : ''} placement="top" arrow>
          <span>
            <Button
              size="small"
              color="primary"
              variant="contained"
              disabled={loading.open || profileIsExpired}
              startIcon={
                <Badge
                  badgeContent={
                    profileIsExpired ? (
                      <Iconify icon="material-symbols:lock" color="error.main" width={14} />
                    ) : (
                      ''
                    )
                  }
                >
                  <Iconify icon={getBrowserIcon()} />
                </Badge>
              }
              onClick={() => {
                if (isElectron()) {
                  handleOpen(id);
                } else {
                  showNotify();
                }
              }}
              sx={{
                '&:disabled': {
                  color: '#ccc',
                  bgcolor: 'primary.dark',
                },
              }}
            >
              {t('actions.open')}
            </Button>
          </span>
        </Tooltip>
      );
    };

    const getProxyHostDisplay = () => {
      let proxy_host_display = '';

      if (quickData?.proxy_type === 'token') {
        proxy_host_display = takeHostProxyToken(quickData?.proxy_token);
      } else if (quickData?.proxy_host) {
        proxy_host_display = quickData?.proxy_host;
      } else {
        proxy_host_display = proxy_host;
      }

      return proxy_host_display;
    };

    useEffect(() => {
      setProfileState(row.state);
    }, [row.state]);

    useEffect(
      () => () => {
        if (popoverTimeoutRef.current) {
          clearTimeout(popoverTimeoutRef.current);
        }
      },
      []
    );

    return (
      <TableRow
        hover
        key={id}
        selected={selected}
        sx={{
          px: 2,
          borderRadius: 1,
          height: 70,
          '&:hover .edit-btn': {
            opacity: 1,
          },
          transition: (theme) =>
            theme.transitions.create('all', {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.shorter,
            }),
        }}
      >
        <TableCell>
          <Checkbox checked={selected} onClick={handleSelectRow} />
        </TableCell>
        {!columnNameVisible?.id && <TableCell align="center">{id}</TableCell>}
        {isProfileDisplay ? (
          <>
            {!columnNameVisible?.group && (
              <TableCell align="center">
                <Tooltip title={showGroup ? group_name : ''}>
                  <TextMaxLine ref={groupRef} line={1}>
                    {group_name}
                  </TextMaxLine>
                </Tooltip>
              </TableCell>
            )}
            {!columnNameVisible?.name && (
              <TableCell>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    whiteSpace: 'nowrap',
                    width: 1,
                  }}
                >
                  <Typography>{quickData?.name ?? name}</Typography>
                  {!profileIsExpired && (
                    <IconButton onClick={() => openQuickEdit('name')}>
                      <Iconify
                        icon="flowbite:edit-outline"
                        className="edit-btn"
                        sx={{
                          opacity: 0,
                        }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            )}
            {!columnNameVisible?.note && (
              <TableCell>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    width: 1,
                    maxWidth: 400,
                  }}
                >
                  <Tooltip
                    title={showNote ? quickData?.note || note : ''}
                    componentsProps={{
                      tooltip: {
                        sx: {
                          textAlign: 'justify',
                          typography: 'body2',
                          maxWidth: 364,
                        },
                      },
                    }}
                  >
                    <TextMaxLine
                      ref={noteRef}
                      display={
                        (quickData?.note || note)?.includes(' ') ? '-webkit-box' : 'inline-block'
                      }
                    >
                      {quickData?.note ?? note}
                    </TextMaxLine>
                  </Tooltip>
                  {!profileIsExpired && (
                    <IconButton onClick={() => openQuickEdit('note')}>
                      <Iconify
                        icon="flowbite:edit-outline"
                        className="edit-btn"
                        sx={{
                          opacity: 0,
                        }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            )}
            {!columnNameVisible?.proxy && (
              <TableCell
                sx={{
                  whiteSpace: 'nowrap',
                }}
              >
                <Stack
                  direction="row"
                  width="fit-content"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    ...(!profileIsExpired && {
                      transform: 'translateX(22px)',
                    }),
                    mx: 'auto',
                  }}
                >
                  <Typography>{getProxyHostDisplay()}</Typography>
                  {!profileIsExpired && (
                    <IconButton onClick={() => openQuickEdit('proxy')}>
                      <Iconify
                        icon="flowbite:edit-outline"
                        className="edit-btn"
                        sx={{
                          opacity: 0,
                        }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            )}
            {!columnNameVisible?.duration && (
              <TableCell
                align="center"
                sx={{
                  whiteSpace: 'nowrap',
                }}
              >
                <Typography variant="body2" color={profileIsExpired && 'error.main'}>
                  {`${duration} ${t('form.label.date')}`}
                </Typography>
              </TableCell>
            )}
          </>
        ) : (
          <>
            {!columnNameVisible?.uid && (
              <TableCell
                sx={{
                  whiteSpace: 'nowrap',
                }}
              >
                <Stack
                  direction="row"
                  width="fit-content"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    ...(!profileIsExpired && {
                      transform: 'translateX(22px)',
                    }),
                    mx: 'auto',
                  }}
                >
                  <Typography display="inline-block">
                    {quickData?.account_resources?.[0]?.uid ?? uid}
                  </Typography>
                  {!profileIsExpired && isQuickEditResource && (
                    <IconButton onClick={() => openQuickEdit('uid')}>
                      <Iconify
                        icon="flowbite:edit-outline"
                        className="edit-btn"
                        sx={{
                          opacity: 0,
                        }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            )}
            {!columnNameVisible?.username && (
              <TableCell>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    whiteSpace: 'nowrap',
                    width: 1,
                    maxWidth: 120,
                  }}
                >
                  <Tooltip
                    title={showUsername ? username : ''}
                    componentsProps={{
                      tooltip: {
                        sx: {
                          textAlign: 'justify',
                          typography: 'body2',
                        },
                      },
                    }}
                  >
                    <TextMaxLine ref={usernameRef} display="inline-block">
                      {quickData?.account_resources?.[0]?.username ?? username}
                    </TextMaxLine>
                  </Tooltip>
                  {!profileIsExpired && isQuickEditResource && (
                    <IconButton onClick={() => openQuickEdit('username')}>
                      <Iconify
                        icon="flowbite:edit-outline"
                        className="edit-btn"
                        sx={{
                          opacity: 0,
                        }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            )}
            {!columnNameVisible?.password && (
              <TableCell>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    whiteSpace: 'nowrap',
                    width: 1,
                    maxWidth: 120,
                  }}
                >
                  <Tooltip
                    title={showPass ? password : ''}
                    componentsProps={{
                      tooltip: {
                        sx: {
                          textAlign: 'justify',
                          typography: 'body2',
                        },
                      },
                    }}
                  >
                    <TextMaxLine ref={passRef} display="inline-block">
                      {quickData?.account_resources?.[0]?.password ?? password}
                    </TextMaxLine>
                  </Tooltip>
                  {!profileIsExpired && isQuickEditResource && (
                    <IconButton onClick={() => openQuickEdit('password')}>
                      <Iconify
                        icon="flowbite:edit-outline"
                        className="edit-btn"
                        sx={{
                          opacity: 0,
                        }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            )}
            {!columnNameVisible?._2fa && (
              <TableCell>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    whiteSpace: 'nowrap',
                    width: 1,
                    maxWidth: 120,
                  }}
                >
                  <Tooltip
                    title={showNote ? two_fa : ''}
                    componentsProps={{
                      tooltip: {
                        sx: {
                          textAlign: 'justify',
                          typography: 'body2',
                          maxWidth: 364,
                        },
                      },
                    }}
                  >
                    <TextMaxLine
                      ref={noteRef}
                      display={two_fa?.includes(' ') ? '-webkit-box' : 'inline-block'}
                    >
                      {quickData?.account_resources?.[0]?.two_fa ?? two_fa}
                    </TextMaxLine>
                  </Tooltip>
                  {!profileIsExpired && isQuickEditResource && (
                    <IconButton onClick={() => openQuickEdit('twoFa')}>
                      <Iconify
                        icon="flowbite:edit-outline"
                        className="edit-btn"
                        sx={{
                          opacity: 0,
                        }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            )}
            {!columnNameVisible?.email && (
              <TableCell>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    whiteSpace: 'nowrap',
                    width: 1,
                    maxWidth: 120,
                  }}
                >
                  <Tooltip
                    title={showEmail ? email : ''}
                    componentsProps={{
                      tooltip: {
                        sx: {
                          textAlign: 'justify',
                          typography: 'body2',
                        },
                      },
                    }}
                  >
                    <TextMaxLine ref={emailRef} display="inline-block">
                      {quickData?.account_resources?.[0]?.email ?? email}
                    </TextMaxLine>
                  </Tooltip>
                  {!profileIsExpired && isQuickEditResource && (
                    <IconButton onClick={() => openQuickEdit('email')}>
                      <Iconify
                        icon="flowbite:edit-outline"
                        className="edit-btn"
                        sx={{
                          opacity: 0,
                        }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            )}
            {!columnNameVisible?.pass_email && (
              <TableCell>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    whiteSpace: 'nowrap',
                    width: 1,
                  }}
                >
                  <Typography variant="body2">
                    {quickData?.account_resources?.[0]?.pass_email ?? pass_email}
                  </Typography>
                  {!profileIsExpired && isQuickEditResource && (
                    <IconButton onClick={() => openQuickEdit('emailPass')}>
                      <Iconify
                        icon="flowbite:edit-outline"
                        className="edit-btn"
                        sx={{
                          opacity: 0,
                        }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            )}
            {!columnNameVisible?.mail_recovery && (
              <TableCell>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    whiteSpace: 'nowrap',
                    width: 1,
                    maxWidth: 120,
                  }}
                >
                  <Tooltip
                    title={showEmailRecovery ? mail_recovery : ''}
                    componentsProps={{
                      tooltip: {
                        sx: {
                          textAlign: 'justify',
                          typography: 'body2',
                        },
                      },
                    }}
                  >
                    <TextMaxLine ref={emailRecoveryRef} display="inline-block">
                      {quickData?.account_resources?.[0]?.mail_recovery ?? mail_recovery}
                    </TextMaxLine>
                  </Tooltip>
                  {!profileIsExpired && isQuickEditResource && (
                    <IconButton onClick={() => openQuickEdit('emailRecovery')}>
                      <Iconify
                        icon="flowbite:edit-outline"
                        className="edit-btn"
                        sx={{
                          opacity: 0,
                        }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            )}
            {!columnNameVisible?.token && (
              <TableCell>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    whiteSpace: 'nowrap',
                    width: 1,
                    maxWidth: 120,
                  }}
                >
                  <Tooltip
                    title={showToken ? token : ''}
                    componentsProps={{
                      tooltip: {
                        sx: {
                          textAlign: 'justify',
                          typography: 'body2',
                        },
                      },
                    }}
                  >
                    <TextMaxLine ref={tokenRef} display="inline-block">
                      {quickData?.account_resources?.[0]?.token ?? token}
                    </TextMaxLine>
                  </Tooltip>
                  {!profileIsExpired && isQuickEditResource && (
                    <IconButton onClick={() => openQuickEdit('token')}>
                      <Iconify
                        icon="flowbite:edit-outline"
                        className="edit-btn"
                        sx={{
                          opacity: 0,
                        }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            )}
            {!columnNameVisible?.cookie && (
              <TableCell>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    whiteSpace: 'nowrap',
                    width: 1,
                    maxWidth: 120,
                  }}
                >
                  <Tooltip
                    title={showCookie ? token : ''}
                    componentsProps={{
                      tooltip: {
                        sx: {
                          textAlign: 'justify',
                          typography: 'body2',
                        },
                      },
                    }}
                  >
                    <TextMaxLine ref={cookieRef} display="inline-block">
                      {quickData?.account_resources?.[0]?.cookie ?? cookie}
                    </TextMaxLine>
                  </Tooltip>
                  {!profileIsExpired && isQuickEditResource && (
                    <IconButton onClick={() => openQuickEdit('cookie')}>
                      <Iconify
                        icon="flowbite:edit-outline"
                        className="edit-btn"
                        sx={{
                          opacity: 0,
                        }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            )}
            {!columnNameVisible?.phone && (
              <TableCell>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    whiteSpace: 'nowrap',
                    width: 1,
                  }}
                >
                  <Typography variant="body1">
                    {quickData?.account_resources?.[0]?.phone ?? phone}
                  </Typography>
                  {!profileIsExpired && isQuickEditResource && (
                    <IconButton onClick={() => openQuickEdit('phone')}>
                      <Iconify
                        icon="flowbite:edit-outline"
                        className="edit-btn"
                        sx={{
                          opacity: 0,
                        }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            )}
            <TableCell align="center">
              <Typography variant="body1" whiteSpace="nowrap" textTransform="capitalize">
                {status?.replace(/_/g, ' ')}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="body1" whiteSpace="nowrap" textTransform="capitalize">
                {activity_log}
              </Typography>
            </TableCell>
          </>
        )}

        <TableCell align="left">
          <Stack direction="row" alignItems="center">
            {getButtonOpenClose()}
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseMove}
              sx={{
                marginRight: 4,
              }}
            >
              <Iconify icon="ri:more-2-fill" />
            </IconButton>
            <CustomPopover
              open={targetPopover}
              style={{
                pointerEvents: 'none',
              }}
              sx={{
                width: 140,
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
              <Stack
                sx={{
                  pointerEvents: 'auto',
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => {
                  setIsHovering(false);
                  setTargetPopover(null);
                }}
              >
                <MenuItem
                  onClick={() => router.push(paths.profile.edit(id))}
                  disabled={profileIsExpired}
                >
                  <Iconify icon="uil:edit" />
                  {t('actions.edit')}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    confirm.onTrue('duplicate');
                    setProfileInfo({
                      ...row,
                      name: quickData?.name || name,
                      note: quickData?.note || note,
                      proxy_host: quickData?.proxy_host || proxy_host,
                    });
                  }}
                >
                  <Iconify icon="octicon:duplicate-16" />
                  {t('actions.duplicate')}
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    confirm.onTrue('renew');
                    setProfileInfo({
                      ...row,
                      name: quickData?.name || name,
                      note: quickData?.note || note,
                      proxy_host: quickData?.proxy_host || proxy_host,
                    });
                  }}
                >
                  <Iconify icon="gg:calendar-next" />
                  {t('actions.renew')}
                </MenuItem>

                {isHost && (
                  <MenuItem
                    onClick={() => {
                      confirm.onTrue('send');
                      setProfileInfo({
                        ...row,
                        name: quickData?.name || name,
                        note: quickData?.note || note,
                        proxy_host: quickData?.proxy_host || proxy_host,
                      });
                    }}
                    disabled={profileIsExpired}
                  >
                    <Iconify icon="icon-park-outline:switch" />
                    {t('actions.send')}
                  </MenuItem>
                )}
                <Divider />
                <MenuItem
                  sx={{
                    color: 'error.main',
                  }}
                  onClick={() => {
                    confirm.onTrue('delete');
                    setProfileInfo({
                      ...row,
                      name: quickData?.name || name,
                      note: quickData?.note || note,
                      proxy_host: quickData?.proxy_host || proxy_host,
                    });
                  }}
                >
                  <Iconify icon="fluent:delete-16-regular" />
                  {t('actions.delete')}
                </MenuItem>
              </Stack>
            </CustomPopover>
          </Stack>
        </TableCell>
      </TableRow>
    );
  },
  (prevProps, nextProps) =>
    prevProps.row === nextProps.row &&
    prevProps.selected === nextProps.selected &&
    prevProps.isProfileDisplay === nextProps.isProfileDisplay &&
    prevProps.workflowGroup === nextProps.workflowGroup &&
    prevProps.onSelectRow === nextProps.onSelectRow &&
    prevProps.visibleColumn === nextProps.visibleColumn &&
    prevProps.quickData === nextProps.quickData
);

export default ProfileTableRow;

ProfileTableRow.propTypes = {
  onSelectRow: PropTypes.func,
  onOpenDownloadProgress: PropTypes.func,
  setProfileInfo: PropTypes.func,
  openQuickEdit: PropTypes.func,
  row: PropTypes.object,
  confirm: PropTypes.object,
  selected: PropTypes.bool,
  isProfileDisplay: PropTypes.bool,
  visibleColumn: PropTypes.array,
  quickData: PropTypes.object,
  setBrowserDownloadName: PropTypes.func,
  showNotify: PropTypes.func,
};
