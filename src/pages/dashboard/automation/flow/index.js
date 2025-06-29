import { useCallback, useEffect, useRef, useState } from 'react';
import { alpha } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
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
import { cloneDeep, debounce } from 'lodash';
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
import { useAuthContext } from 'src/auth/hooks';
import { useLocales } from 'src/locales';
import SplitPane, { Pane } from 'split-pane-react';
import Scrollbar from 'src/components/scrollbar';

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

  const [name, setName] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [totalRecord, setTotalRecord] = useState(0);

  const groupIdURL = searchParam.get('groupId');
  const [listWorkFlow, setListWorkFlow] = useState([]);

  const [sizes, setSizes] = useState([285, 'auto']);

  const handleFilterChange = debounce(
    (event) => {
      setPage(0);
      setName(event.target.value);
    },
    [500]
  );

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

  const getList = useCallback(
    async (wsId) => {
      try {
        const params = {
          name,
          fields: 'id,name,description,workflow_group,created_at,type',
          page_size: rowsPerPage,
          page_num: page + 1,
        };
        const res = await getListWorkFlow(wsId, params);
        setTotalRecord(res?.data?.total_record);
        const filterData = res?.data?.data.map((i) => ({
          ...i,
          workflow_group: i.workflow_group === null ? 0 : i.workflow_group,
        }));
        setListWorkFlow(filterData);
      } catch (error) {
        setTotalRecord(0);
        setPage(0);
        setListWorkFlow([]);
      }
    },
    [name, page, rowsPerPage]
  );

  useEffect(() => {
    getGroups(workspaceId);
  }, [workspaceId]);

  useEffect(() => {
    getList(workspaceId);
  }, [getList, workspaceId]);

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
    console.log('handleResetData', actionData);
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
          setNameGroup('');
        }}
        title={(() => {
          if (confirm.value.add) {
            return t('workflow.tabsBar.dialog.add.title');
          }
          if (confirm.value.edit) {
            return t('workflow.tabsBar.dialog.edit');
          }
          return '';
        })()}
        closeButtonName={t('workflow.tabsBar.actions.close')}
        content={
          <Stack pt={1}>
            <TextField
              label={t('workflow.tabsBar.dialog.add.label')}
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
            disabled={!nameGroup}
            onClick={() => handleCreateOrUpdateGroup()}
          >
            {confirm.value.add
              ? t('workflow.tabsBar.actions.createGroup')
              : t('workflow.tabsBar.actions.update')}
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
      <Stack direction="row" spacing={2} style={{ height: '100%' }}>
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
                marginLeft: 3,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                border: (theme) => `dashed 1px ${theme.palette.divider}`,
                height: 1,
              }}
            >
              <Stack height={1}>
                <Stack
                  height={1}
                  ref={sidebarRef}
                  className="app-sidebar"
                  style={{ minWidth: '238px' }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Stack height={1} spacing={1}>
                    <Stack direction="row" justifyContent="space-between" p={2}>
                      <Typography variant="h6">{t('workflow.tabsBar.title')}</Typography>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                        onClick={() => {
                          confirm.onTrue('add');
                          setActionData({});
                        }}
                      >
                        {t('workflow.tabsBar.actions.add')}
                      </Button>
                    </Stack>
                    <Stack
                      sx={{
                        height: 'calc(100% - 72px)',
                      }}
                    >
                      <Scrollbar
                        sx={{
                          px: 2,
                        }}
                      >
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
                                setCurrentGroup={() => {
                                  selectGroup(item);
                                  setPage(0);
                                }}
                                data={item}
                                confirm={confirm}
                                setActionData={setActionData}
                                disableRole
                              />
                            ))}
                        </List>
                      </Scrollbar>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Pane>
          <Pane>
            <Stack sx={{ height: '100%', overflow: 'hidden' }}>
              <AutomationList
                groupSelected={groupIdURL}
                listWorkFlow={listWorkFlow}
                groups={groups}
                getListAfterImport={getList}
                setListWorkFlow={setListWorkFlow}
                handleFilterChange={handleFilterChange}
                page={page}
                setPage={setPage}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                totalRecord={totalRecord}
              />
            </Stack>
          </Pane>
        </SplitPane>
      </Stack>
      {renderDialog}
    </>
  );
}
