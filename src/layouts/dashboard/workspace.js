import React, { useCallback, useEffect, useState } from 'react';
import {
  MenuItem,
  Stack,
  Menu,
  Typography,
  TextField,
  Button,
  Fade,
  IconButton,
  Skeleton,
} from '@mui/material';
import Iconify from 'src/components/iconify/iconify';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import { WORKSPACE_ID } from 'src/utils/constance';
import { useSettingsContext } from 'src/components/settings';
import AddNewWorkspace from 'src/sections/workspace/add-new-workspace';
import { useBoolean } from 'src/hooks/use-boolean';
import { cloneDeep } from 'lodash';
import { useSnackbar } from 'notistack';
import { useAuthContext } from 'src/auth/hooks';
import { useRouter } from 'src/routes/hooks';
import { useLocales } from 'src/locales';
import eventBus from 'src/sections/script/event-bus';
import { isElectron } from 'src/utils/commom';
import { workspace_data } from 'src/utils/mock';

// ----------------------------------------------------------------------

const BUTTONS = [
  { id: 'bt_05', path: '/workspace-setting', label: 'nav.workspace-setting' },
  { id: 'bt_02', path: '/recharge', label: 'header.recharge' },
  { id: 'bt_01', path: '/buy-package', label: 'header.price-list' },
  // { id: 'bt_03', path: '/api-docs', label: 'nav.api-doc' },
];

// ----------------------------------------------------------------------

export default function Workspace() {
  const { t } = useLocales();
  const { themeMode, updateWsSettingInfo } = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const { user, workspace_id, updateWorkspaceId, updateWorkspaceInfo, updateWorkspacePermission } =
    useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const parts = window.location.href.split('/');
  const currentPath = parts[parts.length - 1];

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [workspaces, setWorkspaces] = useState([]);
  const [activation, setActivation] = useState(null);
  const [currentWs, setCurrentWs] = useState(null);
  const [invitedWorkspace, setInvitedWorkspace] = useState(null);

  const addForm = useBoolean();

  const getWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const dataWorkspaces = workspace_data.data;
      updateWorkspacePermission(
        dataWorkspaces?.reduce((permissions, workspace) => {
          permissions[workspace.id] = workspace.permissions;

          return permissions;
        }, {})
      );

      setWorkspaces(dataWorkspaces);
      if (dataWorkspaces?.length > 0) {
        if (invitedWorkspace) {
          const matchInvitedWorkspace = dataWorkspaces.some((i) => i.id === invitedWorkspace);
          if (matchInvitedWorkspace) {
            setStorage(WORKSPACE_ID, invitedWorkspace);
          }
          setInvitedWorkspace(null);
        } else {
          const isMyWorkspace = dataWorkspaces.find((i) => i.is_my_workspace === true);
          const _spaceId = getStorage(WORKSPACE_ID);

          setStorage(
            WORKSPACE_ID,
            _spaceId || (isMyWorkspace?.id ? isMyWorkspace?.id : dataWorkspaces[0]?.id || null)
          );
        }
      }
    } catch (error) {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [updateWorkspacePermission, invitedWorkspace]);

  useEffect(() => {
    getWorkspaces();
  }, [workspace_id, updateWorkspaceInfo, getWorkspaces]);

  useEffect(() => {
    const _spaceId = getStorage(WORKSPACE_ID);
    if (workspaces?.length > 0 && _spaceId) {
      setCurrentWs(_spaceId);

      const active = workspaces.filter((i) => i.id === _spaceId);
      if (active?.length > 0) {
        setActivation(active[0]);
      }

      updateWorkspaceId(_spaceId, active[0]?.user_creator?.id);
    }
  }, [workspaces, setActivation, setCurrentWs, updateWorkspaceId]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const createWorkspace = () => {
    addForm.onTrue();
  };

  const selectWorkspace = (item) => {
    setActivation(item);
    setCurrentWs(item.id);
    updateWorkspaceId(item.id, item?.user_creator?.id);
    setStorage(WORKSPACE_ID, item.id);
    updateWsSettingInfo(item.id);
    handleClose();
    enqueueSnackbar(t('systemNotify.success.change'), { variant: 'success' });

    if (parts.some((element) => ['createOrEdit', 'edit', 'create'].includes(element))) {
      router.back();
    }

    eventBus.emit('resetTablePage');
  };

  const updateWorkspaceList = (item) => {
    const cloneWS = cloneDeep(workspaces);
    cloneWS.push(item);
    setWorkspaces(cloneWS);
    enqueueSnackbar(t('systemNotify.success.add'), { variant: 'success' });
  };

  useEffect(() => {
    if (isElectron()) {
      window.ipcRenderer.on('accept-invite-done', (_, data) => {
        if (data?.workspace_id) {
          setInvitedWorkspace(data.workspace_id);
        }
      });
    }
    return () => {
      if (isElectron()) {
        window.ipcRenderer.removeAllListeners('accept-invite-done');
      }
    };
  }, []);

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Button
        id="fade-button"
        aria-controls={open ? 'fade-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        variant="outlined"
        sx={[
          {
            width: '200px',
            position: 'relative',
            rowGap: 1,

            '& .MuiButton-endIcon': {
              position: 'absolute',
              right: '16px',
            },
          },
          (theme) => ({
            '&:hover': {
              background: 'none',
            },
          }),
        ]}
        endIcon={<Iconify icon="solar:alt-arrow-down-line-duotone" width={16} />}
      >
        <Typography
          variant="body2"
          sx={[
            {
              position: 'absolute',
              top: '-10px',
              left: '10px',
              fontSize: '12px',
              background: themeMode === 'dark' ? '#161c24' : 'white',
            },
          ]}
        >
          {t('header.workspace')}
        </Typography>
        <Typography
          variant="body2"
          noWrap
          title={activation?.name}
          sx={{
            maxWidth: 150,
          }}
        >
          {activation?.name}
        </Typography>
        {/* <Iconify
          sx={{ position: 'absolute', right: '0px', top: '8px' }}
          icon="solar:alt-arrow-down-line-duotone"
          width={16}
          mr={1}
        /> */}
      </Button>
      <Menu
        id="fade-menu"
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <Stack
          sx={{
            width: '350px',
            padding: '10px',
          }}
        >
          <Stack direction="row" justifyContent="space-between" mb={2} alignItems="center">
            <Stack direction="row" spacing={1} mr={1} alignItems="center">
              <TextField
                id="outlined-select-currency"
                size="small"
                name="keyword"
                placeholder="Search workspace"
              />
              <IconButton
                onClick={getWorkspaces}
                sx={{
                  width: 33,
                  height: 33,
                }}
              >
                <Iconify icon="ooui:reload" width={16} />
              </IconButton>
            </Stack>
            <Button variant="contained" size="small" onClick={() => createWorkspace()}>
              {t('workspaceSetting.actions.createNew')}
            </Button>
          </Stack>
          {loading
            ? [...Array(workspaces?.length || 1)].map((_, index) => (
                <Stack
                  key={index}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  px={1}
                  height={34}
                  mb={workspaces?.length === index + 1 ? 0 : 0.5}
                >
                  <Skeleton sx={{ borderRadius: 0.6, width: 16, height: 16, flexShrink: 0 }} />
                  <Skeleton
                    sx={{
                      borderRadius: 0.6,
                      width: 'calc(100% - 28px)',
                      height: 12,
                      my: 'auto',
                      flexShrink: 0,
                    }}
                  />
                </Stack>
              ))
            : workspaces?.length > 0 &&
              workspaces.map((item) => (
                <MenuItem
                  key={item.id}
                  onClick={() => selectWorkspace(item)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  {item?.is_my_workspace && item?.user_creator?.id === user?.id && (
                    <Iconify
                      icon="charm:key"
                      color="warning.main"
                      width={12}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        transform: 'translate(-20%, -50%)',
                      }}
                    />
                  )}
                  <Stack direction="row" alignItems="center" pl={1}>
                    <Iconify icon="carbon:workspace" width={16} mr={1} />
                    {item.name}
                  </Stack>
                  {currentWs === item.id && (
                    <Iconify
                      icon="solar:check-circle-linear"
                      sx={{ color: 'green' }}
                      width={16}
                      mr={1}
                    />
                  )}
                </MenuItem>
              ))}
        </Stack>
      </Menu>
      <Stack direction="row" spacing={1.5}>
        {BUTTONS.map((button) => (
          <Button
            key={button.id}
            variant="text"
            sx={{
              boxSizing: 'border-box',
              whiteSpace: { md: 'normal', lg: 'nowrap' },
              ...(currentPath === button.path.split('/')[1] && {
                borderRadius: 0,
                borderBottom: '2px solid',
                borderColor: 'primary.main',
              }),
              textTransform: 'capitalize',
            }}
            onClick={() => router.push(button.path)}
          >
            {t(button.label)}
          </Button>
        ))}
      </Stack>
      <AddNewWorkspace
        open={addForm.value}
        onClose={addForm.onFalse}
        updateWorkspaceList={updateWorkspaceList}
        handleCloseWorkspace={handleClose}
      />
    </Stack>
  );
}
