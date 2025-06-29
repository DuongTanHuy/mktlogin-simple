import PropTypes from 'prop-types';

import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Zoom,
  alpha,
} from '@mui/material';
import { cloneDeep, debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { deleteWorkflow, updateNewVersion } from 'src/api/workflow.api';
import { useLocales } from 'src/locales';
import { enqueueSnackbar } from 'notistack';
import { TablePaginationCustom } from 'src/components/table';
import ImportWorkflowDialog from 'src/components/custom-dialog/import-workflow-dialog';
import { LoadingScreen } from 'src/components/loading-screen';
import { LoadingButton } from '@mui/lab';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import { ERROR_CODE, ROWS_PER_PAGE_CONFIG } from 'src/utils/constance';
import { paths } from 'src/routes/paths';
import Label from 'src/components/label';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import EditFormWorkFlow from '../automation/edittingForm';
import AutomationItem from './automation-item';

const ScriptListView = React.memo(
  ({
    groups,
    workspaceId,
    listWorkFlow,
    setListWorkFlow,
    totalRecord,
    setTotalRecord,
    page,
    type,
    name,
    setPage,
    setType,
    setName,
    rowsPerPage,
    setRowsPerPage,
    getList,
    gettingData,
  }) => {
    const searchParam = useSearchParams();

    const { t } = useLocales();
    const settings = useSettingsContext();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [formEditData, setFormEditData] = useState({});
    const [deleteItem, setDeleteItem] = useState(null);
    const [loading, setLoading] = useState(false);

    const [currentTab, setCurrentTab] = useState(getStorage('displayWorkflow') ?? 'myWorkflow');

    const importForm = useBoolean();
    const editForm = useBoolean();
    const deleteForm = useBoolean();
    const updateForm = useBoolean();
    const [updateWorkflowInfo, setUpdateWorkflowInfo] = useState(null);

    const [, setIsHovering] = useState(false);
    const popoverTimeoutRef = useRef();
    const [targetPopover, setTargetPopover] = useState(null);

    const handleMouseEnter = (event) => {
      popoverTimeoutRef.current = setTimeout(() => {
        if (!targetPopover) {
          setTargetPopover(event.target);
        }
      }, 0);
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

    const TABS = useMemo(
      () => [
        {
          value: 'myWorkflow',
          label: t('workflow.myWorkflow'),
        },
        {
          value: 'sharedWorkflow',
          label: t('workflow.downloadedWorkflow'),
        },
      ],
      [t]
    );

    const handleFilterChange = debounce(
      (event) => {
        setPage(0);
        setName(event.target.value);
        searchParam.set('name', event.target.value);
        router.replace(`${paths.dashboard.automation}?${searchParam.toString()}`);
      },
      [500]
    );

    const handleClick = (event) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const showCategory = (id) => {
      const condition = id === null ? 0 : id;
      const fil = groups.filter((i) => String(i.id) === String(condition));
      if (!fil) return '';
      return fil[0]?.name;
    };

    const openEditForm = () => {
      const findItem = listWorkFlow[currentTab].filter(
        (i) => String(i.id) === String(anchorEl.getAttribute('value-index'))
      );
      editForm.onTrue();
      setFormEditData(findItem[0]);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const updateWorkflowList = (item) => {
      const findIndex = listWorkFlow[currentTab].findIndex((i) => i.id === item.id);
      const cloneWF = cloneDeep(listWorkFlow[currentTab]);
      cloneWF[findIndex] = item;
      setListWorkFlow({
        ...listWorkFlow,
        [currentTab]: cloneWF,
      });
    };

    const handleDelete = async () => {
      if (deleteItem) {
        try {
          setLoading(true);
          await deleteWorkflow(workspaceId, deleteItem.id);
          const findIndex = listWorkFlow[currentTab].findIndex((i) => i.id === deleteItem.id);
          const cloneWF = cloneDeep(listWorkFlow[currentTab]);
          cloneWF.splice(findIndex, 1);
          setListWorkFlow({
            ...listWorkFlow,
            [currentTab]: cloneWF,
          });
          setTotalRecord({
            ...totalRecord,
            [currentTab]: totalRecord[currentTab] - 1,
          });

          enqueueSnackbar(t('systemNotify.success.delete'), { variant: 'success' });
        } catch (error) {
          if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
            enqueueSnackbar(t('systemNotify.warning.notPermission.workflow.delete'), {
              variant: 'error',
            });
          } else enqueueSnackbar(t('systemNotify.error.delete'), { variant: 'error' });
        } finally {
          setLoading(false);
          deleteForm.onFalse();
        }
      }
    };

    const handleUpdateWorkflow = async () => {
      try {
        setLoading(true);
        await updateNewVersion(workspaceId, updateWorkflowInfo?.id);
        enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
        if (updateWorkflowInfo.type === 'script') {
          router.push(`script/createOrEdit`);
        } else {
          router.push(paths.dashboard.automation_createOrEdit(updateWorkflowInfo.id));
        }
      } catch (error) {
        enqueueSnackbar(t('systemNotify.error.update'), { variant: 'error' });
      } finally {
        updateForm.onFalse();
        setLoading(false);
      }
    };

    const openConfirmDeleteWF = () => {
      const findItem = listWorkFlow[currentTab].filter(
        (i) => String(i.id) === String(anchorEl.getAttribute('value-index'))
      );
      setDeleteItem(findItem[0]);
      deleteForm.onTrue();
      handleClose();
    };

    useEffect(() => () => setStorage('displayWorkflow', currentTab), [currentTab]);

    return (
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        style={{ height: 'calc(100% - 8px)', paddingRight: 0 }}
      >
        <Stack
          height={1}
          sx={{
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            border: (theme) => `dashed 1px ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => {
              setPage(0);
              setCurrentTab(newValue);
            }}
            sx={{
              // width: 'fit-content',
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
              '& .MuiButtonBase-root.MuiTabScrollButton-root': {
                display: 'none',
              },
              px: 2,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={(tab.value === currentTab && 'filled') || 'soft'}
                    color={tab.value === 'myWorkflow' ? 'primary' : 'info'}
                  >
                    {totalRecord[tab.value]}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Stack direction="row" justifyContent="space-between" alignItems="center" px={2}>
            <Stack direction="row" spacing={2} width={500} mt={2}>
              <TextField
                fullWidth
                type="search"
                placeholder={`${t('workflow.script.actions.search')}...`}
                size="small"
                defaultValue={name}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                sx={{
                  width: 200,
                }}
                label={t('workflow.workflowType')}
                size="small"
                value={type}
                onChange={(event) => {
                  setType(event.target.value);
                  searchParam.set('type', event.target.value);
                  router.replace(`${paths.dashboard.automation}?${searchParam.toString()}`);
                }}
              >
                {[
                  {
                    value: 'all',
                    label: t('group.all'),
                  },
                  {
                    value: 'script',
                    label: t('workflow.tabsBar.actions.script'),
                  },
                  {
                    value: 'flowchart',
                    label: t('workflow.tabsBar.actions.flowchart'),
                  },
                ].map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="bx:import" width={20} />}
                onClick={importForm.onTrue}
              >
                {t('workflow.script.actions.import')}
              </Button>

              <ButtonGroup variant="contained" aria-label="Create button group">
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<Iconify icon="basil:add-outline" width={20} />}
                  onClick={() => {
                    if (settings?.local_rpa_method === 'flowchart') {
                      router.push(
                        paths.dashboard.automation_createOrEdit() + window.location.search
                      );
                    } else {
                      router.push(`script/createOrEdit`);
                    }
                  }}
                >
                  {t('workflow.script.actions.addWorkflow')}
                </Button>

                <Button size="small" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseMove}>
                  <Iconify icon="icon-park-outline:down" />
                </Button>
              </ButtonGroup>
            </Stack>
          </Stack>

          <Box
            sx={{
              width: 1,
              borderRadius: 2,
              // bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
              // border: (theme) => `dashed 1px ${theme.palette.divider}`,
              height: `calc(100% - 168px)`,
            }}
          >
            {gettingData ? (
              <LoadingScreen />
            ) : (
              (listWorkFlow[currentTab].length === 0 && listWorkFlow[currentTab].length === 0 && (
                <Stack justifyContent="center" alignItems="center" height={1} typography="h6">
                  {t('workflow.script.noData')}
                </Stack>
              )) || (
                <Scrollbar
                  sx={{
                    height: 1,
                    px: 2,
                    pt: 2,
                  }}
                >
                  <Grid container spacing={2}>
                    {listWorkFlow[currentTab].map((item) => (
                      <AutomationItem
                        key={item.id}
                        item={item}
                        showCategory={showCategory}
                        handleClick={handleClick}
                        setUpdateWorkflowInfo={() => {
                          setUpdateWorkflowInfo(item);
                          updateForm.onTrue();
                        }}
                      />
                    ))}
                  </Grid>
                </Scrollbar>
              )
            )}

            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
                // onMouseLeave: handleClose,
              }}
            >
              <MenuItem
                onClick={() => {
                  openEditForm();
                  handleClose();
                }}
              >
                <Iconify icon="ic:twotone-edit" width={16} mr={1} />
                {t('workflow.script.actions.editInfo')}
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={() => openConfirmDeleteWF()}
                sx={{
                  color: 'error.main',
                }}
              >
                <Iconify icon="material-symbols:delete-outline" width={16} mr={1} />
                {t('workflow.script.actions.delete')}
              </MenuItem>
            </Menu>
          </Box>

          <TablePaginationCustom
            count={totalRecord[currentTab]}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(__, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setPage(0);
              setRowsPerPage(event.target.value);
              setStorage(ROWS_PER_PAGE_CONFIG, {
                ...getStorage(ROWS_PER_PAGE_CONFIG),
                automation: event.target.value,
              });
            }}
            sx={{}}
          />
        </Stack>

        {editForm.value && (
          <EditFormWorkFlow
            open={editForm.value}
            onClose={editForm.onFalse}
            formEdit={formEditData}
            groups={groups}
            updateWorkflowList={updateWorkflowList}
            mode="script"
          />
        )}

        <ImportWorkflowDialog
          open={importForm.value}
          onClose={importForm.onFalse}
          items={listWorkFlow[currentTab]}
          getListAfterImport={async (workspace_id) => {
            await getList(workspace_id);
            setCurrentTab('myWorkflow');
          }}
        />

        <Dialog onClose={() => deleteForm.onFalse()} open={deleteForm.value}>
          <DialogTitle> {t('workflow.script.dialog.delete.title')}</DialogTitle>
          <DialogActions
            sx={{
              pt: 0,
            }}
          >
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={() => deleteForm.onFalse()}>
                {t('workflow.script.actions.back')}
              </Button>
              <LoadingButton
                loading={loading}
                variant="contained"
                color="error"
                onClick={() => handleDelete()}
              >
                {t('workflow.script.actions.delete')}
              </LoadingButton>
            </Stack>
          </DialogActions>
        </Dialog>

        <Dialog fullWidth maxWidth="sm" onClose={updateForm.onFalse} open={updateForm.value}>
          <DialogTitle sx={{ pb: 1 }}>
            <Stack>
              <Typography
                variant="h5"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Iconify
                  sx={{
                    mr: 1,
                  }}
                  icon="ic:baseline-system-update-alt"
                  width={30}
                  height={30}
                />
                {t('workflow.updateWorkflow.title')}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {t('workflow.updateWorkflow.subTitle')}
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography>{`${t('workflow.updateWorkflow.detail')} ${
              updateWorkflowInfo?.last_version?.name ?? ''
            }`}</Typography>

            <Typography
              sx={{
                whiteSpace: 'pre-line',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              variant="body2"
            >
              {updateWorkflowInfo?.last_version?.change_log}
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{
              pt: 0,
            }}
          >
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={updateForm.onFalse}>
                {t('workflow.script.actions.close')}
              </Button>
              <LoadingButton
                loading={loading}
                variant="contained"
                color="primary"
                onClick={() => handleUpdateWorkflow()}
              >
                <Iconify
                  sx={{
                    mr: 0.5,
                  }}
                  icon="ic:baseline-system-update-alt"
                  width={20}
                  height={20}
                />
                {t('workflow.script.actions.update')}
              </LoadingButton>
            </Stack>
          </DialogActions>
        </Dialog>

        <CustomPopover
          open={targetPopover}
          style={{
            pointerEvents: 'none',
          }}
          sx={{
            width: 'fit-content',
          }}
          TransitionComponent={Zoom}
          transitionDuration={100}
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
              onClick={() => {
                setTargetPopover(null);

                router.push(`script/createOrEdit`);
              }}
            >
              Tạo bằng mã JS
            </MenuItem>
            <MenuItem
              onClick={() => {
                setTargetPopover(null);

                router.push(paths.dashboard.automation_createOrEdit() + window.location.search);
              }}
            >
              Tạo bằng sơ đồ
            </MenuItem>
          </Stack>
        </CustomPopover>
      </Container>
    );
  },
  (prevProps, nextProps) =>
    prevProps.groups === nextProps.groups &&
    prevProps.listWorkFlow === nextProps.listWorkFlow &&
    prevProps.gettingData === nextProps.gettingData
);

export default ScriptListView;

ScriptListView.propTypes = {
  groups: PropTypes.array,
  workspaceId: PropTypes.string,
  listWorkFlow: PropTypes.object,
  setListWorkFlow: PropTypes.func,
  totalRecord: PropTypes.object,
  setTotalRecord: PropTypes.func,
  page: PropTypes.number,
  type: PropTypes.string,
  name: PropTypes.string,
  setPage: PropTypes.func,
  setType: PropTypes.func,
  setName: PropTypes.func,
  rowsPerPage: PropTypes.number,
  setRowsPerPage: PropTypes.func,
  getList: PropTypes.func,
  gettingData: PropTypes.bool,
};
