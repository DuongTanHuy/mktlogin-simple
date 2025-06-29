import SplitPane, { Pane } from 'split-pane-react';
import { useEffect, useState } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
// sections
import ProfileView from 'src/sections/profile/view';

// components
import { IconButton, Stack, Tooltip } from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';

// icons
import { GROUP_INVISIBLE, ID_GROUP_ALL } from 'src/utils/constance';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import eventBus from 'src/sections/script/event-bus';
import { useSearchParams } from 'src/routes/hooks';
import Iconify from 'src/components/iconify';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import ProfileGroupListView from '../../sections/profile/list/profile-group-list-view';
import MoveSingleDialog from '../../sections/profile/move-group/move-single-dialog';

// ----------------------------------------------------------------------

export default function Page() {
  const defaultGroupInVisible = getStorage(GROUP_INVISIBLE);

  const { app_version, workspace_id } = useAuthContext();
  const [sizes, setSizes] = useState(defaultGroupInVisible?.profile ? [0, 'auto'] : [240, 'auto']);

  const searchParams = useSearchParams();
  const groupParam = searchParams.get('group');

  const [listGroup, setListGroup] = useState([]);
  const confirm = useMultiBoolean({
    create: false,
    move: false,
  });
  const [groupSelected, setGroupSelected] = useState(
    groupParam ? Number(groupParam) : ID_GROUP_ALL
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [moveGroupPayload, setMoveGroupPayload] = useState({});

  useEffect(() => {
    setGroupSelected(ID_GROUP_ALL);
  }, [workspace_id]);

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          height: '100%',
          overflow: 'visible',
          position: 'relative',
        }}
      >
        {JSON.stringify(sizes) === JSON.stringify([0, 'auto']) && (
          <Stack sx={{ position: 'absolute', top: 70, left: { md: 0, lg: -17 }, zIndex: 10 }}>
            <Tooltip title="Hiển thị danh sách nhóm" arrow placement="top">
              <IconButton
                aria-label="share"
                size="small"
                sx={{
                  border: '1px solid',
                  borderLeft: 0,
                  borderRadius: 2,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  paddingX: '4px',
                  borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                  bgcolor: (theme) => alpha(theme.palette.grey[600]),
                }}
                onClick={() => {
                  setSizes([240, 'auto']);
                  setStorage(GROUP_INVISIBLE, {
                    ...defaultGroupInVisible,
                    profile: false,
                  });
                }}
              >
                <Iconify
                  icon="lsicon:double-arrow-right-outline"
                  color="text.primary"
                  width={24}
                  height={24}
                />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
        <SplitPane
          split="vertical"
          sizes={sizes}
          onChange={(values) => {
            if (values?.[0] <= 120) {
              setSizes([0, 'auto']);
            } else if (values?.[0] >= 160) {
              setSizes(values);
            }
          }}
        >
          <Pane maxSize="35%">
            <Stack
              sx={{
                flexBasis: '150px',
                padding: '10px',
                paddingRight: 0,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                border: (theme) => `dashed 1px ${theme.palette.divider}`,
                height: 'calc(100% - 8px)',
              }}
            >
              <ProfileGroupListView
                listGroup={listGroup}
                groupSelected={groupSelected}
                setGroupSelected={setGroupSelected}
                setListGroup={setListGroup}
                onResetPage={() => {
                  eventBus.emit('resetTablePage');
                }}
                setSidebarAble={setSizes}
                defaultGroupVisible={defaultGroupInVisible}
              />
            </Stack>
          </Pane>
          <Pane>
            <Stack sx={{ width: 1, height: 1, overflow: 'hidden' }}>
              <ProfileView
                listGroup={listGroup}
                groupSelected={groupSelected}
                refreshKey={refreshKey}
              />
            </Stack>
          </Pane>
        </SplitPane>
      </Stack>
      <MoveSingleDialog
        open={confirm.value.move}
        onClose={() => {
          setMoveGroupPayload({});
          confirm.onFalse('move');
        }}
        payload={moveGroupPayload}
        setRefreshKey={setRefreshKey}
      />
    </>
  );
}
