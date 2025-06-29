import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Zoom,
} from '@mui/material';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

import React, { useCallback, useEffect, useState } from 'react';
import {
  deleteProfileConfigApi,
  getDetailProfileConfigApi,
  useGetProfileConfig,
} from 'src/api/profile-config.api';
import { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useLocales } from 'src/locales';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingButton } from '@mui/lab';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { enqueueSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFCheckbox, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { ERROR_CODE, PROXY_CONNECTION_TYPES } from 'src/utils/constance';
import { useAuthContext } from 'src/auth/hooks';
import { debounce } from 'lodash';
import { createGroupProfileApi, getListGroupProfileApi } from 'src/api/profile-group.api';
import { isValidBase64 } from 'src/utils/profile';
import { batchCreateProfileApi } from 'src/api/profile.api';
import { useBalanceContext } from 'src/account-balance/context/balance-context';
import CreateUpdateBrowserConfig from './create-update-browser-config';

const isValidFormat = (proxy_str, _proxy_type) => {
  if (_proxy_type === 'token') {
    return isValidBase64(proxy_str);
  }
  const regex = /^([^:\s]+):([^:\s]+)(?::([^:\s]+):([^:\s]+))?$/;
  const match = proxy_str.match(regex);
  return match;
};

export default function BatchCreateProfile() {
  const { isHost, workspace_id } = useAuthContext();
  const { updateRefreshBalance } = useBalanceContext();
  const searchParams = useSearchParams();
  const groupParam = searchParams.get('defaultGroup');
  const router = useRouter();
  const { t } = useLocales();
  const show = useBoolean();
  const popover = usePopover();
  const [list, setList] = useState([]);
  const confirm = useBoolean();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([{ id: 0, name: 'Ungrouped' }]);
  const [limit, setLimit] = useState(10);

  const [browserConfig, setBrowserConfig] = useState(0);
  const { profileConfig, refetchProfileConfig } = useGetProfileConfig();
  const [profileConfigId, setProfileConfigId] = useState(0);
  const [profileConfigData, setProfileConfigData] = useState({});

  const INSERT_MODE_OPTIONS = [
    { value: 1, label: t('dialog.duplicateProfile.options.insertMode.noRepeat') },
    { value: 2, label: t('dialog.duplicateProfile.options.insertMode.repeat') },
    { value: 3, label: t('dialog.duplicateProfile.options.insertMode.oneForAll') },
  ];

  const formSchema = Yup.object().shape({
    amount: Yup.number('Nhập giá trị đúng')
      .min(1, 'Số lượng phải lớn hơn 1')
      .typeError('Nhập đúng giá trị')
      .required(),
    name: Yup.string().required('Tên tiền tố không được để trống'),
    start_number: Yup.number().min(1, 'Số bắt đầu phải lớn hơn 1').required(),
  });

  const defaultValues = {
    amount: 1,
    name: '',
    group: '',
    groupName: '',
    start_number: 1,
    proxy_insert_mode: 1,
    proxy_type: 'none',
    proxies: [],
    is_auto_renew: false,
  };

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues,
  });

  const {
    watch,
    setError,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const watchGroupName = watch('groupName');
  const watchGroupId = watch('group');
  const watchName = watch('name');
  const watchAmount = watch('amount');
  const watchInsertMode = watch('proxy_insert_mode');
  const watchProxyType = watch('proxy_type');
  const watchProxies = watch('proxies');
  const watchStartNumber = watch('start_number');

  const onSubmit = handleSubmit(async (data) => {
    try {
      let continueSubmit = true;
      const {
        name,
        group,
        amount,
        proxy_insert_mode,
        start_number,
        proxies,
        proxy_type,
        is_auto_renew,
      } = data;

      const finalProxies =
        proxies.length > 0
          ? proxies.split('\n').reduce((validProxies, proxy) => {
              const trimmedProxy = proxy.trim();
              if (trimmedProxy?.length === 0) {
                return validProxies;
              }

              if (!isValidFormat(trimmedProxy, proxy_type)) {
                setError('proxies', {
                  type: 'manual',
                  message: `${t('validate.invalidProxy')}: ${trimmedProxy}`,
                });
                continueSubmit = false;
              } else {
                validProxies.push(trimmedProxy);
              }
              return validProxies;
            }, [])
          : [];

      if (!continueSubmit) return false;

      const payload = {
        profile_quantity: amount,
        profile_name_prefix: name,
        group_id: group === '' ? 0 : group,
        ...(proxy_type !== 'none' && {
          proxy_insert_mode,
          proxy_type,
          proxies: finalProxies,
        }),
        profile_config_id: browserConfig,
        number_start: start_number,
        is_auto_renew,
      };

      await batchCreateProfileApi(workspace_id, payload);
      enqueueSnackbar(t('systemNotify.success.create'), { variant: 'success' });
      router.back();
      updateRefreshBalance();
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.create'), {
          variant: 'error',
        });
      } else if (error?.error_code === ERROR_CODE.INSUFFICIENT_PROFILE_BALANCE) {
        enqueueSnackbar(t('systemNotify.warning.notEnoughProfileBalance'), { variant: 'error' });
      } else if (error?.error_fields) {
        // eslint-disable-next-line no-restricted-syntax
        for (const key in error?.error_fields) {
          if (key === 'group_id') {
            setError('group', {
              type: 'manual',
              message: t('formError.profile.group'),
            });
            break;
          }
        }
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    }
    return true;
  });

  const handleDeleteProfileConfig = async () => {
    try {
      setLoading(true);
      await deleteProfileConfigApi(profileConfigId);
      confirm.onFalse();
      if (browserConfig === profileConfigId) {
        setBrowserConfig(0);
      }
      refetchProfileConfig();
      setProfileConfigId(0);
      setProfileConfigData({});
      enqueueSnackbar(t('systemNotify.success.delete'), { variant: 'success' });
    } catch (e) {
      console.log(e);
      enqueueSnackbar(t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupData = useCallback(async () => {
    try {
      if (workspace_id) {
        const response = await getListGroupProfileApi(workspace_id);
        if (response.data) {
          setGroups(response.data.data);
          if (watchGroupId === '') {
            if (response.data.data.some((group) => group.id === groupParam)) {
              setValue(
                'group',
                // eslint-disable-next-line no-nested-ternary
                groupParam ? Math.max(Number(groupParam) || 0, 0) : isHost ? 0 : '',
                { shouldValidate: true }
              );
            } else {
              setValue('group', isHost ? 0 : '', { shouldValidate: true });
            }
          }
        }
      }
    } catch (error) {
      /* empty */
    }
  }, [groupParam, isHost, setValue, watchGroupId, workspace_id]);

  const handleCreateGroup = async () => {
    if (!watchGroupName) return;
    setLoading(true);
    try {
      const payload = {
        name: watchGroupName,
        color_code: '#ccc',
      };
      if (workspace_id) {
        const response = await createGroupProfileApi(workspace_id, payload);
        setGroups((prev) => [...prev, response?.data?.data]);
        setValue('group', response?.data?.data?.id, { shouldValidate: true });
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.group.create'), { variant: 'error' });
      } else if (error?.error_code === ERROR_CODE.CANT_CREATE_PROFILE_GROUP) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.group.createWhenAuthMode'), {
          variant: 'error',
        });
      } else if (error?.error_fields) {
        enqueueSnackbar(error?.error_fields?.name[0], { variant: 'error' });
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(false);
      setValue('groupName', '');
    }
  };

  useEffect(() => {
    const handleFetchProfileConfig = async () => {
      try {
        const response = await getDetailProfileConfigApi(profileConfigId);
        setProfileConfigData(response.data);
      } catch (e) {
        console.log(e);
      }
    };

    if (profileConfigId) {
      handleFetchProfileConfig();
    }
  }, [profileConfigId]);

  const getProxyIndex = useCallback((index, type, length) => {
    switch (type) {
      case 1:
        return index;
      case 2:
        return index % length;
      case 3:
        return 0;
      default:
        return 0;
    }
  }, []);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  useEffect(() => {
    if (watchAmount > 0) {
      const newList = [];

      const finalProxies =
        watchProxies.length > 0
          ? watchProxies.split('\n').reduce((validProxies, proxy) => {
              const trimmedProxy = proxy.trim();
              if (trimmedProxy?.length === 0) {
                return validProxies;
              }

              if (!isValidFormat(trimmedProxy, watchProxyType)) {
                validProxies.push({
                  proxy: trimmedProxy,
                  error: true,
                });
              } else {
                validProxies.push({
                  proxy: trimmedProxy,
                  error: false,
                });
              }
              return validProxies;
            }, [])
          : [];

      Array.from({ length: watchAmount }).forEach((_, index) => {
        newList.push({
          id: index,
          data: [
            `${watchName} ${index + Number(watchStartNumber)}`,
            watchProxyType,
            watchProxyType !== 'none'
              ? finalProxies[getProxyIndex(index, watchInsertMode, finalProxies.length)]
              : null,
          ],
        });
      });

      setList(newList);
    }
  }, [
    getProxyIndex,
    setError,
    t,
    watchAmount,
    watchInsertMode,
    watchName,
    watchProxies,
    watchProxyType,
    watchStartNumber,
  ]);

  return (
    <>
      <Stack width={1} height={1} spacing={2} mt={2}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid
            container
            spacing={6}
            sx={{
              position: 'relative',
            }}
          >
            <Grid
              item
              order={{ xs: 1, md: 1 }}
              xs={12}
              md={6}
              pr={3}
              sx={{
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'sticky',
                  top: 20,
                }}
              >
                <Stack spacing={3}>
                  <RHFTextField type="number" name="amount" label="Số lượng hồ sơ" />

                  <Stack direction="row" spacing={3}>
                    <RHFTextField name="name" label="Tên tiền tố" />

                    <RHFTextField name="start_number" type="number" label="Số bắt đầu" />
                  </Stack>

                  <RHFSelect
                    fullWidth
                    name="group"
                    label={t('form.label.group')}
                    PaperPropsSx={{ textTransform: 'capitalize' }}
                    SelectProps={{
                      MenuProps: {
                        autoFocus: false,
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                          },
                        },
                      },
                    }}
                  >
                    <Stack direction="row" spacing={3} my={2} alignItems="center">
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={t('form.tooltip.create-group')}
                        onClick={(event) => event.stopPropagation()}
                        onChange={debounce(
                          (event) => setValue('groupName', event.target.value),
                          [300]
                        )}
                      />
                      <LoadingButton
                        variant="contained"
                        loading={loading}
                        onClick={handleCreateGroup}
                      >
                        {t('form.action.create')}
                      </LoadingButton>
                    </Stack>
                    {groups.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        <TextField
                          fullWidth
                          size="small"
                          value={option.name}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                            '& .MuiInputBase-input': {
                              padding: 0,
                              cursor: 'pointer',
                            },
                          }}
                        />
                      </MenuItem>
                    ))}
                  </RHFSelect>
                </Stack>

                {/* <Divider sx={{ my: 3, borderStyle: 'dashed' }} /> */}

                <Stack spacing={3} mt={3}>
                  <RHFSelect
                    name="proxy_type"
                    label={t('dialog.duplicateProfile.labels.proxyType')}
                  >
                    {PROXY_CONNECTION_TYPES.map((option) => (
                      <MenuItem key={option.id} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </RHFSelect>

                  {watchProxyType !== 'none' && (
                    <>
                      <RHFSelect
                        name="proxy_insert_mode"
                        label={t('dialog.duplicateProfile.labels.insertMode')}
                      >
                        {INSERT_MODE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                      <RHFTextField
                        name="proxies"
                        label={`${t('dialog.updateProxy.label.proxy')}`}
                        placeholder="host:port:user:pass&#10; hoặc &#10; host:port&#10;Ví dụ:&#10;192.1.1.201:9588:username:password&#10;192.1.1.201:9588:username:password&#10;192.1.1.201:9588&#10;192.1.1.201:9588&#10;"
                        multiline
                        rows={6}
                      />
                    </>
                  )}
                </Stack>

                <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

                <Stack spacing={1} mt={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{t('profileImport.browserConfig')}</Typography>
                    <Button
                      onClick={show.onTrue}
                      startIcon={<Iconify icon="fluent:add-12-regular" />}
                    >
                      {t('profileImport.actions.add')}
                    </Button>
                  </Stack>
                  <TextField
                    select
                    fullWidth
                    variant="standard"
                    label={t('profileImport.labels.yourConfig')}
                    value={browserConfig}
                    onChange={(event) => setBrowserConfig(event.target.value)}
                    sx={{
                      '& .MuiButtonBase-root.MuiIconButton-root': {
                        display: 'none',
                      },
                    }}
                    SelectProps={{
                      MenuProps: {
                        autoFocus: false,
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            '&::-webkit-scrollbar': {
                              width: '3px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: (theme) => theme.palette.grey[500],
                              borderRadius: '4px',
                            },
                          },
                        },
                      },
                    }}
                  >
                    {[
                      { id: 0, name: t('profileImport.labels.default') },
                      ...(profileConfig || []),
                    ].map((item) => (
                      <MenuItem
                        value={item.id}
                        key={item.id}
                        sx={{
                          pr: 0,
                          py: 0.5,
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          width={1}
                          px={1}
                        >
                          <Typography variant="body2">{item.name}</Typography>
                          {item.id !== 0 && (
                            <IconButton
                              value-index={item.id}
                              sx={{
                                p: 0.5,
                              }}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                popover.onOpen(event);
                              }}
                            >
                              <Iconify icon="mingcute:more-2-line" />
                            </IconButton>
                          )}
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>

                <RHFCheckbox
                  name="is_auto_renew"
                  label={t('dialog.renewProfile.enableAutoRenew.title')}
                  sx={{
                    ml: 0.1,
                    pt: 3,
                  }}
                />
              </Box>
            </Grid>
            <Grid item order={{ xs: 2, md: 2 }} xs={12} md={6}>
              <Box
                sx={{
                  width: 1,
                }}
              >
                <Typography variant="h5" sx={{ color: 'text.primary', mb: 3 }}>
                  {t('profileImport.listProfile')}
                </Typography>

                <Stack spacing={3} alignItems="center" justifyContent="space-between">
                  <Stack
                    divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}
                    spacing={2}
                    width={1}
                  >
                    {list?.length > 0 ? (
                      list
                        .slice(0, limit)
                        .map((item, index) => <ProfileItem key={item.id} item={item} />)
                    ) : (
                      <Typography
                        textAlign="center"
                        color="text.secondary"
                        variant="caption"
                        sx={{
                          my: 3,
                        }}
                      >
                        {t('profileImport.nodata')}
                      </Typography>
                    )}
                  </Stack>

                  {limit < watchAmount && (
                    <Button
                      sx={{
                        width: 'fit-content',
                      }}
                      startIcon={<Iconify icon="ion:reload" />}
                      onClick={() => setLimit((prev) => prev + 10)}
                    >
                      Load more
                    </Button>
                  )}
                </Stack>
              </Box>
            </Grid>
          </Grid>

          <Stack
            direction="row"
            spacing={3}
            mt={3}
            sx={{
              position: 'fixed',
              bottom: 8,
              zIndex: 10,
            }}
          >
            <LoadingButton
              color="primary"
              size="medium"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              {t('create-method.batch-create')}
            </LoadingButton>
            <Button variant="outlined" onClick={() => router.back()}>
              {t('form.action.cancel')}
            </Button>
          </Stack>
        </FormProvider>
      </Stack>

      <CreateUpdateBrowserConfig
        open={show.value}
        onClose={() => {
          show.onFalse();
          if (profileConfigId) {
            setProfileConfigId(0);
            setProfileConfigData({});
          }
        }}
        handleReloadData={refetchProfileConfig}
        currentConfig={profileConfigData}
        profileConfigId={profileConfigId}
        setBrowserConfig={setBrowserConfig}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
        }}
        title={t('browserConfig.question')}
        closeButtonName={t('form.action.cancel')}
        content={t('browserConfig.subQuestion')}
        action={
          <LoadingButton
            loading={loading}
            variant="contained"
            color="error"
            onClick={handleDeleteProfileConfig}
          >
            {t('actions.delete')}
          </LoadingButton>
        }
      />

      <CustomPopover
        open={popover.open}
        onClose={(event) => {
          event.stopPropagation();
          popover.onClose();
        }}
        sx={{
          width: 'fit-content',
        }}
        TransitionComponent={Zoom}
        arrow="top-right"
      >
        <MenuItem
          onClick={() => {
            setProfileConfigId(Number(popover.open.getAttribute('value-index')));

            popover.onClose();
            show.onTrue();
          }}
        >
          <Iconify icon="fluent:edit-24-filled" />
          {t('actions.edit')}
        </MenuItem>

        <Divider />

        <MenuItem
          sx={{
            color: 'error.main',
          }}
          onClick={() => {
            setProfileConfigId(Number(popover.open.getAttribute('value-index')));

            popover.onClose();
            confirm.onTrue();
          }}
        >
          <Iconify icon="fluent:delete-32-filled" />
          {t('actions.delete')}
        </MenuItem>
      </CustomPopover>
    </>
  );
}

function ProfileItem({ item }) {
  const { t } = useLocales();

  return (
    <Stack
      key={item.id}
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ width: 1 }}
      justifyContent="space-between"
    >
      <TextField
        size="small"
        label={t('profileImport.labels.profileName')}
        value={item.data[0]}
        inputProps={{
          readOnly: true,
        }}
        InputLabelProps={{ shrink: true }}
        sx={{
          width: { xs: 1, md: 1 / 3 },
        }}
      />

      <TextField
        size="small"
        label={t('profileImport.labels.proxyType')}
        value={item.data[1] === 'none' ? '' : item.data[1]}
        inputProps={{
          readOnly: true,
        }}
        InputLabelProps={{ shrink: true }}
        sx={{
          width: { xs: 1, md: 1 / 3 },
        }}
      />

      <TextField
        size="small"
        label={t('profileImport.labels.proxy')}
        value={item.data[2]?.proxy ?? ''}
        error={item.data[2]?.error}
        inputProps={{
          readOnly: true,
        }}
        InputLabelProps={{ shrink: true }}
        sx={{
          width: { xs: 1, md: 1 / 3 },
        }}
      />
    </Stack>
  );
}

ProfileItem.propTypes = {
  item: PropTypes.object,
};
