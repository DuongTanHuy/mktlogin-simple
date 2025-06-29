import {
  Button,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Pane } from 'split-pane-react';
import SplitPane from 'split-pane-react/esm/SplitPane';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingButton } from '@mui/lab';
import { createWorkFlowGroup, updateWorkFlowGroup } from 'src/api/workflow.api';
import { enqueueSnackbar } from 'notistack';
import { useLocales } from 'src/locales';
import DeleteGroupMemberDialog from 'src/sections/member/action-dialog/delete-workgroup';
import { cloneDeep } from 'lodash';
import WorkGroupButton from 'src/pages/dashboard/member/work-group-button';
import ScriptListView from 'src/sections/script/list-view';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import { GROUP_INVISIBLE, ROWS_PER_PAGE_CONFIG } from 'src/utils/constance';
import { workflow_create, workflow_download, workflow_group } from 'src/utils/mock';

export default function ScriptListPage() {
  const defaultGroupInVisible = getStorage(GROUP_INVISIBLE);
  const rowNum = getStorage(ROWS_PER_PAGE_CONFIG)?.automation;
  const searchParam = useSearchParams();
  const groupIdURL = searchParam.get('groupId');
  const [search, setSearch] = useState('');

  const { app_version, workspace_id } = useAuthContext();
  const router = useRouter();
  const { t } = useLocales();

  const [sizes, setSizes] = useState(
    defaultGroupInVisible?.automation ? [0, 'auto'] : [240, 'auto']
  );
  const confirm = useMultiBoolean({
    add: false,
    edit: false,
    delete: false,
  });

  const [actionData, setActionData] = useState({});
  const [groupSelected, setGroupSelected] = useState(groupIdURL || '');
  const [groups, setGroups] = useState([]);
  const [listSuggestion, setListSuggestion] = useState([]);
  const [nameGroup, setNameGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingData, setGettingData] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(rowNum ?? 30);
  const [totalRecord, setTotalRecord] = useState({
    myWorkflow: 0,
    sharedWorkflow: 0,
  });
  const [listWorkFlow, setListWorkFlow] = useState({
    myWorkflow: [],
    sharedWorkflow: [],
  });

  const typeParam = searchParam.get('type');
  const nameParam = searchParam.get('name');
  const [type, setType] = useState(typeParam ?? 'all');
  const [name, setName] = useState(nameParam ?? '');
  const [page, setPage] = useState(0);

  const selectGroup = (item) => {
    setPage(0);
    setGroupSelected(item.id);
    return router.push(`${paths.dashboard.automation}?groupId=${item.id}`);
  };

  const handleCreateOrUpdateGroup = async () => {
    if (nameGroup) {
      setLoading(true);
      try {
        const payload = {
          name: nameGroup,
        };

        if (actionData?.id) {
          await updateWorkFlowGroup(workspace_id, payload, actionData?.id);
          enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
          confirm.onFalse('edit');
        } else {
          const response = await createWorkFlowGroup(workspace_id, payload);
          const { data } = response.data;
          selectGroup(data);
          enqueueSnackbar(t('systemNotify.success.add'), { variant: 'success' });
          confirm.onFalse('add');
        }
      } catch (error) {
        /* empty */
      } finally {
        getGroups(workspace_id);
        setActionData({});
        setNameGroup('');
        setLoading(false);
      }
    }
  };

  const getList = useCallback(
    async (wsId) => {
      if (!wsId) return;
      try {
        setGettingData(true);
        const params = {
          name,
          fields:
            'id,name,description,workflow_group,created_at,updated_at,type,is_public,current_version,last_version,is_downloaded,is_encrypted',
          ...(groupSelected === '' ? {} : { workflow_group: groupSelected }),
          from: 'create',
          ...(type !== 'all' && {
            type,
          }),
          page_size: rowsPerPage,
          page_num: page + 1,
        };

        console.log('params', params);

        const createData = workflow_create;
        setTotalRecord((prev) => ({
          ...prev,
          myWorkflow: createData.total_record,
        }));
        setListWorkFlow((prev) => ({
          ...prev,
          myWorkflow: createData.data,
        }));

        const downloadData = workflow_download;
        setTotalRecord((prev) => ({
          ...prev,
          sharedWorkflow: downloadData.total_record,
        }));
        setListWorkFlow((prev) => ({
          ...prev,
          sharedWorkflow: downloadData.data,
        }));
      } catch (error) {
        /* empty */
      } finally {
        setGettingData(false);
      }
    },
    [groupSelected, name, page, rowsPerPage, type]
  );

  const getGroups = useCallback(async (wsId) => {
    if (!wsId) return;
    const response = workflow_group;
    setGroups(response?.data);
  }, []);

  const handleFilters = (event) => {
    setSearch(event.target.value);
    const newList = [];
    for (let i = 0; i < listSuggestion.length; i += 1) {
      const item = {
        ...listSuggestion[i],
        display: listSuggestion[i].name.toLowerCase().includes(event.target.value.toLowerCase()),
      };
      newList.push(item);
    }
    setListSuggestion(newList);
  };

  const handleResetDataDelete = () => {
    const _clone = cloneDeep(groups);
    const newList = _clone.filter((i) => i.id !== actionData?.id);
    setPage(0);
    setGroupSelected('');
    router.push(paths.dashboard.automation);
    setGroups(newList);
    setActionData({});
    confirm.onFalse('delete');
  };

  useEffect(() => {
    setListSuggestion(groups.slice(1).map((item) => ({ ...item, display: true })));
  }, [groups]);

  useEffect(() => {
    getGroups(workspace_id);
  }, [getGroups, workspace_id]);

  useEffect(() => {
    getList(workspace_id);
  }, [getList, workspace_id]);

  useEffect(() => {
    setGroupSelected('');
  }, [workspace_id]);

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
      <Stack
        direction="row"
        spacing={2}
        style={{ height: '100%', overflow: 'visible', position: 'relative' }}
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
                    automation: false,
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
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                border: (theme) => `dashed 1px ${theme.palette.divider}`,
                height: 'calc(100% - 8px)',
                overflow: 'hidden',
              }}
            >
              <Stack className="app-sidebar" height={1}>
                <Stack direction="column" height={1}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    p="10px"
                  >
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
                  <Stack sx={{ height: 'calc(100% - 70px)' }}>
                    <Scrollbar
                      sx={{
                        height: 1,
                        px: 1,
                        overflowX: 'hidden',
                      }}
                    >
                      <List component="nav" aria-label="secondary mailbox folder" sx={{ p: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} pt={2.5} pb={1}>
                          <TextField
                            size="small"
                            fullWidth
                            value={search}
                            onChange={handleFilters}
                            placeholder={`${t('actions.search')}...`}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <>
                                  {search ? (
                                    <Iconify
                                      onClick={() => handleFilters({ target: { value: '' } })}
                                      icon="carbon:close-outline"
                                      sx={{
                                        color: 'text.disabled',
                                        '&:hover': { cursor: 'pointer', color: 'white' },
                                      }}
                                    />
                                  ) : null}
                                </>
                              ),
                            }}
                          />

                          <Tooltip title="Ẩn danh sách nhóm" arrow placement="top">
                            <IconButton
                              aria-label="share"
                              size="small"
                              sx={{
                                border: '1px solid',
                                borderRadius: 1,
                                paddingX: '8px',
                                borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                              }}
                              onClick={() => {
                                setSizes([0, 'auto']);
                                setStorage(GROUP_INVISIBLE, {
                                  ...defaultGroupInVisible,
                                  automation: true,
                                });
                              }}
                            >
                              <Iconify
                                icon="lsicon:double-arrow-left-outline"
                                color="text.primary"
                                width={24}
                                height={24}
                              />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        <ListItemButton
                          key="all"
                          selected={groupSelected === ''}
                          onClick={() => {
                            setPage(0);
                            setGroupSelected('');
                            router.push(paths.dashboard.automation);
                          }}
                          sx={{
                            borderRadius: 1,
                          }}
                        >
                          <ListItemText primary="Tất cả" />
                        </ListItemButton>
                        {groups.slice(0, 1).map((item) => (
                          <Stack key={item.id}>
                            <WorkGroupButton
                              key={item.id}
                              currentGroup={groupSelected}
                              setCurrentGroup={() => selectGroup(item)}
                              data={item}
                              confirm={confirm}
                              setActionData={setActionData}
                              disableRole
                            />
                          </Stack>
                        ))}
                        {listSuggestion
                          .filter((item) => item.display)
                          .map((item) => (
                            <Stack key={item.id}>
                              <WorkGroupButton
                                key={item.id}
                                currentGroup={groupSelected}
                                setCurrentGroup={() => selectGroup(item)}
                                data={item}
                                confirm={confirm}
                                setActionData={setActionData}
                                disableRole
                              />
                            </Stack>
                          ))}
                      </List>
                    </Scrollbar>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Pane>
          <Pane style={{ height: '100%' }}>
            <ScriptListView
              groups={groups}
              workspaceId={workspace_id}
              listWorkFlow={listWorkFlow}
              setListWorkFlow={setListWorkFlow}
              totalRecord={totalRecord}
              setTotalRecord={setTotalRecord}
              page={page}
              type={type}
              name={name}
              setType={setType}
              setPage={setPage}
              setName={setName}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              getList={getList}
              gettingData={gettingData}
            />
          </Pane>
        </SplitPane>
      </Stack>
      {renderDialog}
    </>
  );
}
