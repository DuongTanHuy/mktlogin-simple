/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
import { useEffect, useState, useRef, useCallback } from 'react';
import { alpha } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
// sections
import ScriptList from 'src/sections/script/list-view';
import { ConfirmDialog } from 'src/components/custom-dialog';
import eventBus from 'src/sections/script/event-bus';

// components
import {
  Stack,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
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
import { useSettingsContext } from 'src/components/settings';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import DeleteGroupMemberDialog from 'src/sections/member/action-dialog/delete-workgroup';
// eslint-disable-next-line import/no-extraneous-dependencies
import SplitPane, { Pane } from 'split-pane-react';
import { getAutomationScripts } from 'src/api/automation.api';
import OptionsScriptForm from 'src/components/options-cript-form';
import { useBoolean } from 'src/hooks/use-boolean';
import Scrollbar from 'src/components/scrollbar';
import WorkGroupButton from 'src/pages/dashboard/member/work-group-button';
import { generateLogicScript } from 'src/utils/handle-bar-support';
import { useAuthContext } from 'src/auth/hooks';
import { useLocales } from 'src/locales';
// ----------------------------------------------------------------------

export default function Page() {
  const { t } = useLocales();
  const { app_version } = useAuthContext();
  const childScriptRef = useRef(null);
  const router = useRouter();
  const { settingSystem } = useSettingsContext();

  const searchParam = useSearchParams();
  // const sidebarRef = useRef(null);

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

  const [modeLayout, setModeLayout] = useState('list'); // list || createOrEdit

  const [listSuggestion, setListSuggestion] = useState([]);

  const [scriptSample, setScriptSample] = useState('');

  const [sizes, setSizes] = useState([224, 'auto']);

  const optionScriptForm = useBoolean();
  const [initDataOptionScript, setInitDataOptionScript] = useState(null);

  const handleFilterChange = debounce(
    (event) => {
      setPage(0);
      setName(event.target.value);
    },
    [500]
  );

  useEffect(() => {
    const getScriptOptions = async () => {
      const _res = await getAutomationScripts();
      const { data } = _res;
      const list = [];

      for (let i = 0; i < data.length; i++) {
        if (data[i].parent === null) {
          let item = data[i];
          const filterChild = data.filter((op) => op.parent === item.id);
          if (filterChild.length > 0) {
            item = {
              ...item,
              options: filterChild.map((chil) => ({ ...chil, display: true })),
            };
          }
          list.push(item);
        }
      }
      setListSuggestion(list);
    };

    getScriptOptions();
  }, []);

  useEffect(() => {
    if (settingSystem?.rpa_method !== 'script') {
      router.push('/profile');
    }
  }, [settingSystem, router]);

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
          fields: 'id,name,description,workflow_group,created_at',
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
          await updateWorkFlowGroup(workspaceId, payload, actionData?.id);
          enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
          confirm.onFalse('edit');
        } else {
          await createWorkFlowGroup(workspaceId, payload);
          enqueueSnackbar(t('systemNotify.success.add'), { variant: 'success' });
          confirm.onFalse('add');
        }
      } catch (error) {
        /* empty */
      } finally {
        getGroups(workspaceId);
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

  const handleFilters = (event) => {
    setScriptSample(event.target.value);
    const newList = [];
    for (let i = 0; i < listSuggestion.length; i++) {
      const item = { ...listSuggestion[i] };
      if (item?.options) {
        item.options = item?.options.map((op) => ({
          ...op,
          display: op.name.toLowerCase().includes(event.target.value.toLowerCase()),
        }));
      }
      newList.push(item);
    }
    setListSuggestion(newList);
  };

  const applyCodeToTerminal = (item) => {
    if (!item?.parameters) {
      const crossData = generateLogicScript(item?.script_template, '');

      submitOptionFormData(`${crossData}
      `);
      return false;
    }

    optionScriptForm.onTrue();
    setInitDataOptionScript(item);
    return true;
  };

  const submitOptionFormData = (data) => {
    eventBus.emit('applyToCode', data);
    optionScriptForm.onFalse();
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
      <Stack direction="row" spacing={2} ml={3} style={{ height: '100%' }}>
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
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                border: (theme) => `dashed 1px ${theme.palette.divider}`,
                height: 1,
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
                    p={2}
                  >
                    <Typography variant="h6">
                      {modeLayout === 'list' ? 'Nhóm' : 'Tùy chọn'}
                    </Typography>
                    {modeLayout === 'list' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                        onClick={() => {
                          confirm.onTrue('add');
                          setActionData({});
                        }}
                      >
                        Thêm
                      </Button>
                    )}
                  </Stack>
                  <Stack sx={{ height: 'calc(100% - 70px)' }}>
                    {modeLayout === 'list' && (
                      <Scrollbar
                        sx={{
                          px: 1,
                        }}
                      >
                        <List component="nav" aria-label="secondary mailbox folder" sx={{ p: 0 }}>
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
                    )}
                    {modeLayout === 'createOrEdit' && (
                      <Stack height={1}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          flexGrow={1}
                          sx={{ width: 1 }}
                          p={1}
                        >
                          <TextField
                            fullWidth
                            value={scriptSample}
                            onChange={handleFilters}
                            placeholder="Search..."
                            size="small"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <>
                                  {scriptSample ? (
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
                        </Stack>

                        <Scrollbar>
                          <Stack p={1}>
                            {listSuggestion.map((item) => (
                              <Accordion
                                key={item.id}
                                sx={{
                                  marginBottom: '5px',
                                  '&.Mui-expanded': {
                                    marginBottom: '2.5px',
                                  },
                                }}
                                defaultExpanded
                              >
                                <AccordionSummary
                                  expandIcon={<Iconify icon="icon-park-outline:down" width={20} />}
                                  aria-controls="panel1a-content"
                                  id="panel1a-header"
                                >
                                  <Typography variant="body2">{item.name}</Typography>
                                </AccordionSummary>
                                {item?.options?.length > 0 && (
                                  <AccordionDetails sx={{ padding: '0' }}>
                                    {item.options.map(
                                      (trig) =>
                                        trig.display && (
                                          <Stack
                                            onClick={() => applyCodeToTerminal(trig)}
                                            key={trig.id}
                                            direction="row"
                                            spacing={2}
                                            alignItems="center"
                                            sx={[
                                              { padding: '10px' },
                                              {
                                                '&:hover': {
                                                  backgroundColor: 'rgba(145, 158, 171, 0.08)',
                                                  cursor: 'pointer',
                                                },
                                              },
                                            ]}
                                          >
                                            <Iconify
                                              icon={trig?.icon || 'ion:options'}
                                              width={20}
                                            />
                                            <Typography>{trig?.name}</Typography>
                                          </Stack>
                                        )
                                    )}
                                  </AccordionDetails>
                                )}
                              </Accordion>
                            ))}
                          </Stack>
                        </Scrollbar>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </Stack>
              {initDataOptionScript && (
                <OptionsScriptForm
                  open={optionScriptForm.value}
                  onClose={optionScriptForm.onFalse}
                  submitOptionFormData={submitOptionFormData}
                  initData={initDataOptionScript}
                />
              )}
            </Stack>
          </Pane>
          <Pane style={{ height: '100%' }}>
            <ScriptList
              groupSelected={groupIdURL}
              listWorkFlow={listWorkFlow}
              groups={groups}
              setListWorkFlow={setListWorkFlow}
              getListAfterImport={getList}
              setModeLayout={setModeLayout}
              childScriptRef={childScriptRef}
              handleFilterChange={handleFilterChange}
              page={page}
              setPage={setPage}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              totalRecord={totalRecord}
            />
          </Pane>
        </SplitPane>
      </Stack>
      {renderDialog}
    </>
  );
}
