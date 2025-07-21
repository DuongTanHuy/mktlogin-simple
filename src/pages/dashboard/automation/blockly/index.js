import { useEffect, useRef, useState } from 'react';
import { alpha } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';

// sections
import AutomationList from 'src/sections/automation/list';
import { ConfirmDialog } from 'src/components/custom-dialog';

// components
import {
  Stack,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material';

// icons
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import cloneDeep from 'lodash/cloneDeep';
import {
  createWorkFlowGroup,
  getListWorkFlow,
  getListWorkFlowGroup,
  updateWorkFlowGroup,
} from 'src/api/workflow.api';
import { enqueueSnackbar } from 'notistack';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { getStorage } from 'src/hooks/use-local-storage';
import { WORKSPACE_ID } from 'src/utils/constance';
// import { useSettingsContext } from 'src/components/settings';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import DeleteGroupMemberDialog from 'src/sections/member/action-dialog/delete-workgroup';
import WorkGroupButton from 'src/pages/dashboard/member/work-group-button';
import { useLocales } from 'src/locales';
// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useLocales();
  const { app_version } = useAuthContext();
  const router = useRouter();
  // const { settingSystem } = useSettingsContext();

  const searchParam = useSearchParams();
  const sidebarRef = useRef(null);

  const workspaceId = getStorage(WORKSPACE_ID);
  const confirm = useMultiBoolean({
    add: false,
    edit: false,
    delete: false,
  });
  const [actionData, setActionData] = useState({});

  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupSelected, setGroupSelected] = useState('');

  const [nameGroup, setNameGroup] = useState('');

  const groupIdURL = searchParam.get('groupId');
  const [listWorkFlow, setListWorkFlow] = useState([]);

  // useEffect(() => {
  //   if (settingSystem?.rpa_method !== 'flowchart') {
  //     router.push('/profile');
  //   }
  // }, [settingSystem, router]);

  useEffect(() => {
    if (
      !String(groupIdURL) ||
      groupIdURL === null ||
      groups.filter((i) => String(i.id) === groupIdURL).length === 0
    ) {
      setGroupSelected('');
    } else {
      setGroupSelected(String(groupIdURL));
    }
  }, [groupIdURL, groups]);

  useEffect(() => {
    getList(workspaceId);
    getGroups(workspaceId);
  }, [workspaceId]);

  const getList = async (wsId) => {
    const res = await getListWorkFlow(wsId);

    const filterData = res?.data?.data.map((i) => ({
      ...i,
      workflow_group: i.workflow_group === null ? 0 : i.workflow_group,
    }));
    setListWorkFlow(filterData);
  };

  const getGroups = async (wsId) => {
    const response = await getListWorkFlowGroup(wsId);
    setGroups(response?.data?.data);
  };

  const handleCreateOrUpdateGroup = async () => {
    if (nameGroup) {
      setLoading(true);
      try {
        const payload = {
          name: nameGroup,
        };

        if (actionData?.id) {
          const _updating = await updateWorkFlowGroup(workspaceId, payload, actionData?.id);
          const _clone = cloneDeep(groups);
          const _index = _clone.findIndex((i) => i.id === actionData.id);
          _clone[_index] = _updating?.data?.data;
          setGroups(_clone);
          enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
          confirm.onFalse('edit');
        } else {
          const res = await createWorkFlowGroup(workspaceId, payload);
          const _clone = cloneDeep(groups);
          _clone.push(res?.data?.data);
          setGroups(_clone);
          enqueueSnackbar(t('systemNotify.success.add'), { variant: 'success' });
          confirm.onFalse('add');
        }
      } catch (error) {
        /* empty */
      } finally {
        setActionData({});
        setNameGroup('');
        setLoading(false);
      }
    }
  };

  const handleResetDataDelete = () => {
    const _clone = cloneDeep(groups);
    const newList = _clone.filter((i) => i.id !== actionData?.id);
    setGroups(newList);
    setActionData({});
    confirm.onFalse('delete');
  };

  const selectGroup = (item) => {
    setGroupSelected(item.id);
    return router.push(`${paths.dashboard.automation}?groupId=${item.id}`);
  };

  const renderDialog = (
    <>
      <ConfirmDialog
        open={confirm.value.add || confirm.value.edit}
        onClose={() => {
          if (confirm.value.add) {
            confirm.onFalse('add');
          } else if (confirm.value.edit) {
            confirm.onFalse('edit');
          }
        }}
        // eslint-disable-next-line no-nested-ternary
        title={confirm.value.add ? 'Tạo nhóm mới' : confirm.value.edit ? 'Sửa nhóm' : ''}
        content={
          <Stack pt={1}>
            <TextField
              label="Tên nhóm"
              defaultValue={actionData?.name}
              name="nameGroup"
              onChange={(event) => setNameGroup(event.target.value)}
            />
          </Stack>
        }
        action={
          <LoadingButton
            color="primary"
            variant="contained"
            loading={loading}
            onClick={() => handleCreateOrUpdateGroup()}
          >
            {confirm.value.add ? 'Tạo nhóm' : 'Cập nhật'}
          </LoadingButton>
        }
      />
      <DeleteGroupMemberDialog
        groupData={actionData}
        open={confirm.value.delete}
        onClose={() => confirm.onFalse('delete')}
        handleResetData={handleResetDataDelete}
        modeAPI="workflow"
      />
    </>
  );

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>
      <Stack direction="row" spacing={2}>
        <Stack
          sx={{
            flexBasis: '150px',
            padding: '10px',
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            border: (theme) => `dashed 1px ${theme.palette.divider}`,
            height: '100%',
            minHeight: '81vh',
          }}
        >
          <Stack>
            <Stack
              ref={sidebarRef}
              className="app-sidebar"
              style={{ width: '238px' }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6">Nhóm</Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                    onClick={() => {
                      confirm.onTrue('add');
                      setActionData({});
                    }}
                  >
                    Thêm nhóm
                  </Button>
                </Stack>
                <Stack>
                  <List component="nav" aria-label="secondary mailbox folder">
                    <ListItemButton
                      key="all"
                      selected={groupSelected === ''}
                      onClick={() => {
                        setGroupSelected('');
                        router.push(paths.dashboard.automation);
                      }}
                      sx={{
                        borderRadius: 1,
                      }}
                    >
                      <ListItemText primary="Tất cả" />
                    </ListItemButton>
                    {groups.length > 0 &&
                      groups.map((item) => (
                        <WorkGroupButton
                          key={item.id}
                          currentGroup={groupSelected}
                          setCurrentGroup={selectGroup}
                          data={item}
                          confirm={confirm}
                          setActionData={setActionData}
                          disableRole
                        />
                      ))}
                  </List>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        <Stack sx={{ width: '100%', overflow: 'hidden' }}>
          <AutomationList
            groupSelected={groupIdURL}
            listWorkFlow={listWorkFlow}
            groups={groups}
            getListAfterImport={getList}
            setListWorkFlow={setListWorkFlow}
          />
        </Stack>
      </Stack>
      {renderDialog}
    </>
  );
}
