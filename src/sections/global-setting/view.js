import * as Yup from 'yup';
// @mui
import { Card, CardHeader, Divider, IconButton, Stack, Typography, alpha } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { updateGlobalSetting, useGlobalSetting } from 'src/api/global-setting.api';
// components
import { useSettingsContext } from 'src/components/settings';
import { yupResolver } from '@hookform/resolvers/yup';
import { enqueueSnackbar } from 'notistack';
import { useLocales } from 'src/locales';
import FormProvider from 'src/components/hook-form/form-provider';
import Scrollbar from 'src/components/scrollbar';
import { LoadingButton } from '@mui/lab';
import { RHFRadioGroup, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { isElectron } from 'src/utils/commom';
import AlertDialogAdvanced from 'src/components/ask-before-leave-advanced';
import Iconify from 'src/components/iconify';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import { PROFILE_STORAGE_PATH } from 'src/utils/constance';

// ----------------------------------------------------------------------

export default function GlobalSettingView() {
  const { t } = useLocales();
  const themeSettings = useSettingsContext();
  const { globalSetting, refetchGlobalSetting } = useGlobalSetting();
  const [profileStateLocalStorage, setProfileStateLocalStorage] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  const FormSchema = Yup.object().shape({});

  const defaultValues = useMemo(
    () => ({
      sync_cookie: globalSetting?.sync_cookie || false,
      sync_indexed_db: globalSetting?.sync_indexed_db || false,
      sync_local_storage: globalSetting?.sync_local_storage || false,
      sync_bookmark: globalSetting?.sync_bookmark || false,
      sync_password: globalSetting?.sync_password || false,
      disable_notification: globalSetting?.disable_notification || false,
      disable_location: globalSetting?.disable_location || false,
      save_log_run_task: globalSetting?.save_log_run_task || false,
      profile_storage_path: profileStateLocalStorage || '',
      rpa_method: themeSettings?.local_rpa_method ?? 'script',
    }),
    [
      globalSetting?.sync_cookie,
      globalSetting?.sync_indexed_db,
      globalSetting?.sync_local_storage,
      globalSetting?.sync_bookmark,
      globalSetting?.sync_password,
      globalSetting?.disable_notification,
      globalSetting?.disable_location,
      globalSetting?.save_log_run_task,
      profileStateLocalStorage,
      themeSettings?.local_rpa_method,
    ]
  );

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  useEffect(() => {
    const getProfileStoragePath = async () => {
      let profileStoragePath = getStorage(PROFILE_STORAGE_PATH);

      if (!profileStoragePath && isElectron()) {
        profileStoragePath = await window.ipcRenderer.invoke('get-profile-storage-path');
      }

      setProfileStateLocalStorage(profileStoragePath);
    };

    getProfileStoragePath();
  }, []);

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, isDirty },
  } = methods;

  useEffect(() => {
    if (isElectron() && Object.keys(globalSetting).length > 0) {
      window.ipcRenderer.send('update-global-setting', {
        global_setting: globalSetting,
      });
    }
  }, [globalSetting]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const {
        sync_cookie,
        sync_indexed_db,
        sync_local_storage,
        sync_bookmark,
        sync_password,
        disable_notification,
        disable_location,
        save_log_run_task,
        profile_storage_path,
        rpa_method,
      } = data;

      themeSettings.onUpdate('local_rpa_method', rpa_method);
      const payload = {
        sync_cookie,
        sync_indexed_db,
        sync_local_storage,
        sync_bookmark,
        disable_notification,
        disable_location,
        sync_password,
        save_log_run_task,
        profile_storage_path,
      };

      themeSettings?.onUpdate('rpa_method', rpa_method);
      await updateGlobalSetting(payload);
      setStorage(PROFILE_STORAGE_PATH, profile_storage_path);

      if (isElectron()) {
        window.ipcRenderer.send('update-global-setting', {
          global_setting: payload,
        });
      }

      setIsBlocking(false);
      refetchGlobalSetting();
      enqueueSnackbar(t('systemNotify.success.update'), {
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(t('systemNotify.error.update'), {
        variant: 'error',
      });
      throw error;
    }
  });

  const selectFolder = async (event) => {
    if (isElectron()) {
      const path_file = await window.ipcRenderer.invoke('open-directory-dialog');
      if (path_file) {
        setValue('profile_storage_path', path_file.replace(/\\/g, '/'), { shouldDirty: true });
      }
    }
  };

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (isDirty) {
      setIsBlocking(true);
    }
  }, [isDirty]);

  return (
    <Container
      maxWidth={themeSettings.themeStretch ? 'lg' : 'md'}
      sx={{
        height: 1,
        pb: 1,
        px: '0px!important',
      }}
    >
      <AlertDialogAdvanced
        isBlocking={isBlocking}
        isSaveBeforeLeave
        onSave={() => {
          try {
            onSubmit();
            return true;
          } catch (error) {
            console.error(error);
            return false;
          }
        }}
        isSaving={isSubmitting}
      />
      <Card
        sx={{
          height: 'auto',
          maxHeight: 1,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
          boxShadow: 'none',
          borderRadius: 2,
          overflow: 'auto',
        }}
      >
        <Stack spacing={2} pt={2}>
          <CardHeader
            title={t('globalSetting.title')}
            sx={{
              p: 0,
              px: 2,
            }}
          />
          <Divider />
        </Stack>
        <FormProvider
          methods={methods}
          onSubmit={onSubmit}
          sx={{ overflow: 'hidden', height: '100%' }}
        >
          <Scrollbar
            sx={{
              height: 'calc(100% - 40px)',
              p: 2,
              pt: 1,
            }}
          >
            <Stack>
              <Typography variant="subtitle1">{t('globalSetting.browserSetting.title')}</Typography>
              <Stack ml={1} mt={0.5} spacing={1}>
                <RHFSwitch
                  name="sync_cookie"
                  label={t('globalSetting.browserSetting.label.syncCookie')}
                />
                <RHFSwitch
                  name="sync_indexed_db"
                  label={t('globalSetting.browserSetting.label.syncIndexedDB')}
                />
                <RHFSwitch
                  name="sync_local_storage"
                  label={t('globalSetting.browserSetting.label.syncLocalStorage')}
                />
                <RHFSwitch
                  name="sync_bookmark"
                  label={t('globalSetting.browserSetting.label.syncBookmark')}
                />
                <RHFSwitch
                  name="sync_password"
                  label={t('globalSetting.browserSetting.label.syncPassword')}
                />
                <RHFSwitch
                  name="disable_notification"
                  label={t('globalSetting.browserSetting.label.disableNotification')}
                />
                <RHFSwitch
                  name="disable_location"
                  label={t('globalSetting.browserSetting.label.disableLocation')}
                />
              </Stack>
            </Stack>
            <Stack mt={2}>
              <Typography variant="subtitle1">{t('globalSetting.taskSetting.title')}</Typography>
              <Stack ml={1} mt={0.5} spacing={1}>
                <RHFSwitch
                  name="save_log_run_task"
                  label={t('globalSetting.taskSetting.label.saveLogRunTask')}
                />
              </Stack>
            </Stack>
            <Stack mt={2}>
              <Typography variant="subtitle1">{t('workspaceSetting.createMode.title')}</Typography>
              <Stack ml={1} mt={2} spacing={1}>
                <RHFRadioGroup
                  name="rpa_method"
                  sx={{
                    width: 'fit-content',
                  }}
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
              </Stack>
            </Stack>
            <Stack mt={2}>
              <Typography variant="subtitle1">{t('globalSetting.appSetting.title')}</Typography>
              <Stack ml={1} mt={2} spacing={1}>
                <Stack direction="row" spacing={0}>
                  <RHFTextField
                    name="profile_storage_path"
                    label={t('globalSetting.appSetting.label.folderPath')}
                    readOnly
                    sx={{
                      maxWidth: 400,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                      },
                    }}
                  />
                  <IconButton
                    sx={{
                      width: 53,
                      height: 53,
                      flexShrink: 0,
                      borderRadius: 1,
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      border: '1px solid',
                      borderLeft: 'none',
                      borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.06),
                    }}
                    onClick={selectFolder}
                  >
                    <Iconify icon="line-md:folder-twotone" width={26} />
                  </IconButton>
                </Stack>
              </Stack>
            </Stack>
          </Scrollbar>
          <Stack direction="row" spacing={3} ml={3} my={2}>
            <LoadingButton
              color="primary"
              size="medium"
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={!isBlocking}
            >
              {t('globalSetting.actions.save')}
            </LoadingButton>
          </Stack>
        </FormProvider>
      </Card>
    </Container>
  );
}
