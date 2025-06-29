import React from 'react';
import { decryptProxyTokenMktCity, isValidBase64 } from 'src/utils/profile';
import { isElectron, isSpecialString } from 'src/utils/commom';
import { takeHostProxyToken } from 'src/utils/proxy';
import { getProfileByIdForOpenApi } from 'src/api/profile.api';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  IconButton,
  Stack,
  TableCell,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { some } from 'lodash';
import TextMaxLine from 'src/components/text-max-line';
import { fDate } from 'src/utils/format-time';
import { ERROR_CODE } from 'src/utils/constance';
import { enqueueSnackbar } from 'notistack';
import Label from 'src/components/label';

export default function virtualProfileTableRow({
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
}) {
  // profile
  let id;
  let group_name;
  let name;
  let note;
  let tags;
  let duration;
  let created_at;
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
      tags,
      duration,
      created_at,
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

  const dataUpdate = quickData.find((item) => item.id === id);

  const getProxyHostDisplay = () => {
    let proxy_host_display = '';

    if ((dataUpdate?.proxy_type ?? proxy_type) === 'token') {
      proxy_host_display = takeHostProxyToken(dataUpdate?.proxy_token ?? proxy_token);
    } else if ((dataUpdate?.proxy_type ?? proxy_type) === '') {
      proxy_host_display = '';
    } else if (dataUpdate?.proxy_host ?? proxy_host) {
      proxy_host_display = dataUpdate?.proxy_host ?? proxy_host;
    }

    return proxy_host_display;
  };

  const handleOpen = async (profileId) => {
    try {
      updateProfileLoading([profileId], true);
      const profileResponse = await getProfileByIdForOpenApi(workspace_id, profileId);

      if (isElectron()) {
        await handleOpenProfileFromElectron(profileResponse.data);
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.open'), { variant: 'error' });
      }
      updateProfileLoading([profileId], false);
      console.error('An error occurred:', error);
    }
  };

  const getBrowserIcon = () => {
    let icon;
    if (row.isLoading) {
      icon = 'eos-icons:bubble-loading';
    } else if (browser_type === 'cbrowser') {
      icon = 'ant-design:chrome-filled';
    } else {
      icon = 'mdi:firefox';
    }
    return icon;
  };

  const getButtonOpenClose = () => {
    if (row.state === 'syncing') {
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

    if (row.state === 'open') {
      return (
        <>
          <Button
            size="small"
            color="error"
            variant="contained"
            disabled={row.isLoading}
            startIcon={
              <Iconify
                icon={row.isLoading ? 'eos-icons:bubble-loading' : 'material-symbols:close'}
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
            disabled={row.isLoading || profileIsExpired}
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

  return (
    <>
      <TableCell>
        <Checkbox
          checked={some(tableSelected, { id })}
          onClick={(e) => handleSelectRow(e, row, _index)}
          onMouseEnter={(e) => {
            if (e.shiftKey && e.buttons === 1) {
              handleSelectRow(e, row);
            }
          }}
        />
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
                <Typography>{dataUpdate?.name ?? name}</Typography>
                {!profileIsExpired && (
                  <IconButton onClick={() => openQuickEdit('name', row)}>
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
                  title={showNote ? dataUpdate?.node ?? note : ''}
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
                      (dataUpdate?.note ?? note)?.includes(' ') ? '-webkit-box' : 'inline-block'
                    }
                  >
                    {dataUpdate?.note ?? note}
                  </TextMaxLine>
                </Tooltip>
                {!profileIsExpired && (
                  <IconButton onClick={() => openQuickEdit('note', row)}>
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
          {!columnNameVisible?.tags && (
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
                <Stack
                  flexWrap="wrap"
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  maxWidth={200}
                >
                  {(dataUpdate?.tags ?? tags ?? []).slice(0, 3).map((tag, index) => (
                    <Label
                      key={`tag?.id-${index}`}
                      sx={{
                        textTransform: 'none',
                        // '& > span': {
                        background: (theme) => alpha(theme.palette.primary.main, 0.2),
                        color: (theme) => alpha(theme.palette.primary.main, 1),
                        // },
                      }}
                    >
                      {tag?.name}
                    </Label>
                  ))}
                  {(dataUpdate?.tags ?? tags ?? []).length > 3 && (
                    <Tooltip
                      placement="top"
                      arrow
                      componentsProps={{
                        tooltip: {
                          sx: {
                            bgcolor: 'background.paper',
                            boxShadow: (theme) => theme.customShadows.z4,
                            '& .MuiTooltip-arrow': {
                              color: 'background.paper',
                            },
                          },
                        },
                      }}
                      title={
                        <Stack direction="row" spacing={1}>
                          {(dataUpdate?.tags ?? tags ?? []).map((tag, index) => (
                            <Label
                              key={`tag?.id-${index}`}
                              sx={{
                                textTransform: 'none',
                                // '& > span': {
                                background: (theme) => alpha(theme.palette.primary.main, 0.2),
                                color: (theme) => alpha(theme.palette.primary.main, 1),
                                // },
                              }}
                            >
                              {tag?.name}
                            </Label>
                          ))}
                        </Stack>
                      }
                    >
                      <Typography
                        variant="button"
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'underline',
                          ml: 0.5,
                          fontWeight: 'semibold',
                          '&:hover': {
                            cursor: 'pointer',
                          },
                        }}
                      >
                        +{(dataUpdate?.tags ?? tags ?? []).length - 3}
                      </Typography>
                    </Tooltip>
                  )}
                </Stack>
                {!profileIsExpired && (
                  <IconButton onClick={() => openQuickEdit('tags', row)}>
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
                  <IconButton onClick={() => openQuickEdit('proxy', row)}>
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
          {!columnNameVisible?.date_expired && (
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
          {!columnNameVisible?.created_at && (
            <TableCell
              align="center"
              sx={{
                whiteSpace: 'nowrap',
              }}
            >
              <Typography variant="body2">
                {created_at ? fDate(new Date(created_at), 'dd/MM/yyyy HH:ss') : ''}
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
                  {dataUpdate?.account_resources?.[0]?.uid ?? uid}
                </Typography>
                {!profileIsExpired && row?.account_resources?.length > 0 && (
                  <IconButton onClick={() => openQuickEdit('uid', row)}>
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
                    {dataUpdate?.account_resources?.[0]?.username ?? username}
                  </TextMaxLine>
                </Tooltip>
                {!profileIsExpired && row?.account_resources?.length > 0 && (
                  <IconButton onClick={() => openQuickEdit('username', row)}>
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
                    {dataUpdate?.account_resources?.[0]?.password ?? password}
                  </TextMaxLine>
                </Tooltip>
                {!profileIsExpired && row?.account_resources?.length > 0 && (
                  <IconButton onClick={() => openQuickEdit('password', row)}>
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
                    {dataUpdate?.account_resources?.[0]?.two_fa ?? two_fa}
                  </TextMaxLine>
                </Tooltip>
                {!profileIsExpired && row?.account_resources?.length > 0 && (
                  <IconButton onClick={() => openQuickEdit('twoFa', row)}>
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
                    {dataUpdate?.account_resources?.[0]?.email ?? email}
                  </TextMaxLine>
                </Tooltip>
                {!profileIsExpired && row?.account_resources?.length > 0 && (
                  <IconButton onClick={() => openQuickEdit('email', row)}>
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
                  {dataUpdate?.account_resources?.[0]?.pass_email ?? pass_email}
                </Typography>
                {!profileIsExpired && row?.account_resources?.length > 0 && (
                  <IconButton onClick={() => openQuickEdit('emailPass', row)}>
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
                    {dataUpdate?.account_resources?.[0]?.mail_recovery ?? mail_recovery}
                  </TextMaxLine>
                </Tooltip>
                {!profileIsExpired && row?.account_resources?.length > 0 && (
                  <IconButton onClick={() => openQuickEdit('emailRecovery', row)}>
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
                    {dataUpdate?.account_resources?.[0]?.token ?? token}
                  </TextMaxLine>
                </Tooltip>
                {!profileIsExpired && row?.account_resources?.length > 0 && (
                  <IconButton onClick={() => openQuickEdit('token', row)}>
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
                    {dataUpdate?.account_resources?.[0]?.cookie ?? cookie}
                  </TextMaxLine>
                </Tooltip>
                {!profileIsExpired && row?.account_resources?.length > 0 && (
                  <IconButton onClick={() => openQuickEdit('cookie', row)}>
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
                  {dataUpdate?.account_resources?.[0]?.phone ?? phone}
                </Typography>
                {!profileIsExpired && row?.account_resources?.length > 0 && (
                  <IconButton onClick={() => openQuickEdit('phone', row)}>
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

      <TableCell>
        <Stack direction="row" alignItems="center">
          {getButtonOpenClose()}
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={t('actions.moreAction')} placement="top">
            <IconButton
              onClick={(event) => setTargetPopover(event.currentTarget)}
              profile-id={id}
              sx={{
                marginRight: 4,
              }}
            >
              <Iconify icon="ri:more-2-fill" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </>
  );
}
