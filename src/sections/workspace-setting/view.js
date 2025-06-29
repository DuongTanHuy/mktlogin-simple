import { useMemo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  alpha,
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Container from '@mui/material/Container';
// components
import FormProvider, { RHFRadioGroup } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import { getWorkspaceSettingApi, updateWorkspaceSettingApi } from 'src/api/workspace-setting.api';
import { useAuthContext } from 'src/auth/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSettingsContext } from 'src/components/settings';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { updateWorkspace, useGetWorkspace } from 'src/api/workspace.api';
import Iconify from 'src/components/iconify';
import DeleteWorkspaceDialog from './action-dialog/delete';
import UpdateWorkspaceNameDialog from './action-dialog/update-workspace-name-dialog';

// ----------------------------------------------------------------------

export default function WorkspaceSettingView() {
  const { workspace_id, updateWorkspaceId, handleUpdateWorkspaceInfo } = useAuthContext();
  const { t } = useLocales();
  const [workspaceSettings, setWorkspaceSettings] = useState({});
  const { workspace, refetchWorkspace } = useGetWorkspace(workspace_id);
  const themeSettings = useSettingsContext();
  const [editing, setEditing] = useState({
    name: false,
    description: false,
  });
  const [loading, setLoading] = useState(false);

  const FormSchema = Yup.object().shape({});
  const fetchSetting = useRef();
  const confirm = useBoolean();
  const open = useBoolean();

  const [value, setValue] = useState(0);

  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [errorMess, setErrorMess] = useState({});

  const handleUpdate = async () => {
    let continueSubmit = true;
    if (editing.name && !workspaceName) {
      setErrorMess((prev) => ({ ...prev, name: t('validate.required') }));
      continueSubmit = false;
    }
    if (editing.description && !workspaceDescription) {
      setErrorMess((prev) => ({ ...prev, description: t('validate.required') }));
      continueSubmit = false;
    }
    if (!continueSubmit) return;
    try {
      setLoading(true);
      const payload = {
        name: editing.name ? workspaceName : workspace?.name,
        description: editing.description ? workspaceDescription : workspace?.description,
      };
      await updateWorkspace(workspace_id, payload);
      handleUpdateWorkspaceInfo();
      refetchWorkspace();
      enqueueSnackbar(t('systemNotify.success.update'), {
        variant: 'success',
      });
      setEditing({
        name: false,
        description: false,
      });
    } catch (error) {
      if (error?.error_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.workspace.update'), {
          variant: 'error',
        });
      } else if (error?.error_code === ERROR_CODE.FOR_WORKSPACE_OWNER_ONLY) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.workspace.onlyOwner'), {
          variant: 'error',
        });
      } else
        enqueueSnackbar(t('systemNotify.error.title'), {
          variant: 'error',
        });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const defaultValues = useMemo(
    () => ({
      authorization_method: workspaceSettings?.authorization_method || '',
      // rpa_method: workspaceSettings?.rpa_method || '',
    }),
    [workspaceSettings?.authorization_method]
  );

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { authorization_method } = data;
      const payload = {
        authorization_method,
      };
      const resUpdated = await updateWorkspaceSettingApi(workspace_id, payload);
      themeSettings.setSettingSystem(resUpdated?.data?.data);
      setWorkspaceSettings(resUpdated?.data?.data);
      enqueueSnackbar(t('systemNotify.success.save'), {
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
      if (error?.error_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.workspace.setting'), {
          variant: 'error',
        });
      } else if (error?.error_code === ERROR_CODE.FOR_WORKSPACE_OWNER_ONLY) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.workspace.onlyOwner'), {
          variant: 'error',
        });
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
      } else enqueueSnackbar(error?.message || t('systemNotify.error.save'), { variant: 'error' });
    }
  });

  fetchSetting.current = async () => {
    try {
      if (workspace_id) {
        const response = await getWorkspaceSettingApi(workspace_id);
        setWorkspaceSettings(response.data);
      }
    } catch (error) {
      /* empty */
    }
  };

  useEffect(() => {
    fetchSetting.current();
    setEditing({
      name: false,
      description: false,
    });
    setWorkspaceName('');
    setWorkspaceDescription('');
  }, [workspace_id]);

  useEffect(() => {
    if (workspaceSettings) {
      reset(defaultValues);
    }
  }, [defaultValues, reset, workspaceSettings]);

  const renderDialog = (
    <>
      <DeleteWorkspaceDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        workspaceId={workspace_id}
        updateWorkspaceId={updateWorkspaceId}
      />
      <UpdateWorkspaceNameDialog
        open={open.value}
        onClose={open.onFalse}
        workspaceId={workspace_id}
        name={workspace?.name}
        handleReload={refetchWorkspace}
      />
    </>
  );

  return (
    <Container
      maxWidth={themeSettings.themeStretch ? 'lg' : 'md'}
      sx={{
        height: 1,
        pb: 1,
        px: '0px!important',
      }}
    >
      <FormProvider
        methods={methods}
        onSubmit={onSubmit}
        sx={{
          height: '100%',
        }}
      >
        <Grid
          container
          sx={{
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            border: (theme) => `dashed 1px ${theme.palette.divider}`,
            borderRadius: 2,
            px: 2,
            minHeight: 520,
          }}
        >
          <Grid
            item
            xs={2}
            sx={{
              borderRight: '1px solid',
              borderColor: (theme) => theme.palette.divider,
              pt: 2,
            }}
          >
            <Tabs
              orientation="vertical"
              value={value}
              onChange={handleChange}
              aria-label="Vertical tabs"
              sx={{
                borderRight: 1,
                borderColor: 'divider',
                '& .MuiButtonBase-root.MuiTab-root': {
                  marginRight: 2,
                  typography: 'subtitle1',
                  minHeight: 40,
                  justifyContent: 'flex-start',
                  pl: 2,
                },
                '& .MuiTabs-indicator': {
                  mr: 2,
                  width: 'calc(100% - 16px)',
                  borderRadius: 1,
                  boxShadow: (theme) => theme.customShadows.z4,
                  bgcolor: (theme) => alpha(theme.palette.grey[500], 0.2),
                },
              }}
            >
              <Tab
                icon={<Iconify icon="icon-park-outline:setting-config" />}
                label={t('workspaceSetting.tabs.general')}
                {...a11yProps(0)}
              />
              <Tab
                icon={<Iconify icon="mage:message-information-fill" />}
                label={t('workspaceSetting.tabs.information')}
                {...a11yProps(1)}
              />
            </Tabs>
          </Grid>
          <Grid
            item
            xs={10}
            sx={{
              pl: 2,
              position: 'relative',
            }}
          >
            <TabPanel value={value} index={0}>
              <Stack spacing={3}>
                <SettingTab id="tab2" title={t('workspaceSetting.authMethod.title')}>
                  <RHFRadioGroup
                    name="authorization_method"
                    options={[
                      {
                        value: 'group',
                        label: (
                          <Typography variant="body1">
                            {t('workspaceSetting.authMethod.options.byGroup')}
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              ml={3}
                            >
                              {t('workspaceSetting.authMethod.placeholder.byGroup')}
                            </Typography>
                          </Typography>
                        ),
                      },
                      {
                        value: 'profile',
                        label: (
                          <Typography variant="body1">
                            {t('workspaceSetting.authMethod.options.byProfile')}
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              ml={3}
                            >
                              {t('workspaceSetting.authMethod.placeholder.byProfile')}
                            </Typography>
                          </Typography>
                        ),
                      },
                    ]}
                  />
                </SettingTab>
                {/* <SettingTab id="tab3" title={t('workspaceSetting.createMode.title')}>
                  <RHFRadioGroup
                    name="rpa_method"
                    options={[
                      {
                        value: 'flowchart',
                        label: (
                          <Typography variant="body1">
                            {t('workspaceSetting.createMode.options.flowChart')}
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              ml={3}
                            >
                              {t('workspaceSetting.createMode.placeholder.flowChart')}
                            </Typography>
                          </Typography>
                        ),
                      },
                      {
                        value: 'script',
                        label: (
                          <Typography variant="body1">
                            {t('workspaceSetting.createMode.options.script')}
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              ml={3}
                            >
                              {t('workspaceSetting.createMode.placeholder.script')}
                            </Typography>
                          </Typography>
                        ),
                      },
                    ]}
                  />
                </SettingTab> */}
                <SettingTab
                  title={t('workspaceSetting.deleteWorkspace.title')}
                  sub={t('workspaceSetting.deleteWorkspace.placeholder')}
                >
                  <Box
                    sx={{
                      mt: 2,
                    }}
                  >
                    <Button variant="contained" onClick={confirm.onTrue} color="error">
                      {t('workspaceSetting.deleteWorkspace.title')}
                    </Button>
                  </Box>
                </SettingTab>
              </Stack>
              <Box
                sx={{
                  pt: 10,
                  pb: 2,
                }}
              >
                <LoadingButton
                  color="primary"
                  size="medium"
                  type="submit"
                  variant="contained"
                  disabled={!isDirty}
                  loading={isSubmitting}
                >
                  {t('workspaceSetting.actions.save')}
                </LoadingButton>
              </Box>
            </TabPanel>

            <TabPanel value={value} index={1}>
              <Stack id="tab1" spacing={1}>
                <Stack spacing={0}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6">
                      {t('workspaceSetting.workspaceName.title')}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {t('workspaceSetting.workspaceName.subTitle')}
                    </Typography>
                    <Iconify icon="charm:key" width={16} color="warning.main" />
                  </Stack>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    borderRadius: 1,
                    width: 'fit-content',
                  }}
                >
                  {workspace?.is_my_workspace && (
                    <Tooltip
                      title={t('workspaceSetting.workspaceName.defaultWorkspace')}
                      placement="top"
                    >
                      <Iconify
                        width={20}
                        icon="charm:key"
                        sx={{ cursor: 'pointer' }}
                        color="warning.main"
                      />
                    </Tooltip>
                  )}
                  {editing.name ? (
                    <TextField
                      size="small"
                      error={!!errorMess.name}
                      helperText={errorMess.name}
                      value={workspaceName}
                      onChange={(event) => {
                        if (errorMess) setErrorMess((prev) => ({ ...prev, name: '' }));
                        setWorkspaceName(event.target.value);
                      }}
                      placeholder={t('workspaceSetting.updateWorkspace.placeholder.name')}
                    />
                  ) : (
                    <Typography color="primary.main">{workspaceName || workspace?.name}</Typography>
                  )}
                  {!editing.name && (
                    <IconButton
                      onClick={() => {
                        setEditing((prev) => ({
                          ...prev,
                          name: true,
                        }));
                        setWorkspaceName(workspace?.name);
                      }}
                    >
                      <Iconify icon="solar:pen-bold-duotone" sx={{ cursor: 'pointer' }} />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
              <Stack mt={2} spacing={1}>
                <Stack spacing={0}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6">{t('workspaceSetting.workspaceDes.title')}</Typography>
                  </Stack>
                </Stack>

                <Stack
                  direction="row"
                  width={1}
                  spacing={1}
                  alignItems="center"
                  sx={{
                    borderRadius: 1,
                  }}
                >
                  {editing.description ? (
                    <TextField
                      rows={4}
                      multiline
                      fullWidth
                      error={!!errorMess.description}
                      helperText={errorMess.description}
                      value={workspaceDescription}
                      onChange={(event) => {
                        if (errorMess) setErrorMess((prev) => ({ ...prev, description: '' }));
                        setWorkspaceDescription(event.target.value);
                      }}
                      placeholder={t('workspaceSetting.updateWorkspace.placeholder.des')}
                    />
                  ) : (
                    <Box
                      dangerouslySetInnerHTML={{
                        __html: workspaceDescription || workspace?.description,
                      }}
                      sx={{
                        maxWidth: 0.6,
                        overflow: 'hidden',
                        color: 'text.secondary',
                        mb: 0.5,
                        '& p': { typography: 'body2', m: 0 },
                        '& a': { color: 'inherit', textDecoration: 'none' },
                        '& strong': { typography: 'subtitle2' },
                      }}
                    />
                  )}
                  {!editing.description && (
                    <IconButton
                      onClick={() => {
                        setEditing((prev) => ({
                          ...prev,
                          description: true,
                        }));
                        if (!workspaceDescription) {
                          setWorkspaceDescription(workspace?.description);
                        }
                      }}
                    >
                      <Iconify
                        icon="solar:pen-bold-duotone"
                        width={22}
                        sx={{ cursor: 'pointer' }}
                      />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 40,
                }}
              >
                <LoadingButton
                  color="primary"
                  size="medium"
                  variant="contained"
                  loading={loading}
                  onClick={handleUpdate}
                  disabled={
                    (!editing.name || workspaceName === workspace?.name) &&
                    (!editing.description || workspaceDescription === workspace?.description)
                  }
                >
                  {t('workspaceSetting.actions.save')}
                </LoadingButton>
              </Box>
            </TabPanel>
          </Grid>
        </Grid>
      </FormProvider>
      {renderDialog}
    </Container>
  );
}

//----------------------------------------------------------------

function SettingTab({ id, title, sub, children }) {
  return (
    <Stack id={id} spacing={1}>
      {sub ? (
        <Stack spacing={0}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {sub}
          </Typography>
        </Stack>
      ) : (
        <Typography variant="h6">{title}</Typography>
      )}
      {children}
    </Stack>
  );
}

SettingTab.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  sub: PropTypes.string,
  children: PropTypes.node,
};

// ----------------------------------------------------------------------

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}
