import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Zoom,
  alpha,
} from '@mui/material';
import { ERROR_CODE, EXAMPLE_IMPORT_PROFILE_FILE_URL } from 'src/utils/constance';
import React, { useCallback, useEffect, useState } from 'react';
import readXlsxFile from 'read-excel-file';
import Iconify from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { useBoolean } from 'src/hooks/use-boolean';
import { useLocales } from 'src/locales';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  deleteProfileConfigApi,
  getDetailProfileConfigApi,
  useGetProfileConfig,
} from 'src/api/profile-config.api';
import { enqueueSnackbar } from 'notistack';
import { importProfileApi } from 'src/api/profile.api';
import { useAuthContext } from 'src/auth/hooks';
import { paths } from 'src/routes/paths';
import { useBalanceContext } from 'src/account-balance/context/balance-context';
import { debounce } from 'lodash';
import { createGroupProfileApi, getListGroupProfileApi } from 'src/api/profile-group.api';
import CreateUpdateBrowserConfig from './create-update-browser-config';
import { isElectron } from '../../utils/commom';

const REGEX = /^(\d{1,3}(?:\.\d{1,3}){3}):([0-9]{1,5})(?::([^:]+):([^:]+))?$/;

const FORMAT_ROWS = [
  ['profile_name', 'proxy_type', 'proxy'],
  [
    'Tên hồ sơ',
    'Có các loại sau:http, https, socks4, socks5',
    'Định dạng:ip:port:username:password',
  ],
];

const slugify = (str) => str.replace(/\s+/g, '').replace(/\n/g, '').toLowerCase();

export default function ImportFileProfile() {
  const searchParams = useSearchParams();
  const groupParam = searchParams.get('defaultGroup');

  const { isHost, workspace_id } = useAuthContext();
  const { updateRefreshBalance } = useBalanceContext();
  const { t } = useLocales();
  const router = useRouter();
  const [value, setValue] = useState(null);
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  const numOfError = list.filter((obj) => obj.errors.some((e) => e === true)).length;
  const { profileConfig, refetchProfileConfig } = useGetProfileConfig();
  const [browserConfig, setBrowserConfig] = useState(0);
  const [profileConfigId, setProfileConfigId] = useState(0);
  const [profileConfigData, setProfileConfigData] = useState({});
  const [errorField, setErrorField] = useState({
    group: false,
    file: false,
  });

  const [groups, setGroups] = useState([{ id: 0, name: 'Ungrouped' }]);
  const [groupId, setGroupId] = useState('');
  const [groupName, setGroupName] = useState('');

  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isAutoRenew, setIsAutoRenew] = useState(false);

  const confirm = useBoolean();
  const show = useBoolean();
  const popover = usePopover();
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const handleDropFileZip = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setList([]);

    readXlsxFile(file).then((rows) => {
      const formattedRowsSlug = FORMAT_ROWS.map((line) => line.map((cell) => slugify(cell)));

      const firstRowSlugged = rows[0].map((cell) =>
        typeof cell === 'string' ? slugify(cell) : cell
      );
      const isFirstRowValid = formattedRowsSlug.some(
        (formatRow) =>
          formatRow.length === firstRowSlugged.length &&
          formatRow.every((val, i) => val === firstRowSlugged[i])
      );

      const isFirstTwoRowsValid =
        rows.length >= 2 &&
        formattedRowsSlug.every((formatRow, index) => {
          const rowSlugged = rows[index].map((cell) =>
            typeof cell === 'string' ? slugify(cell) : cell
          );
          return (
            formatRow.length === rowSlugged.length &&
            formatRow.every((val, i) => val === rowSlugged[i])
          );
        });

      if (!isFirstRowValid && !isFirstTwoRowsValid) {
        setList([{ errors: [true, true, true], data: rows[0] }]);
        return;
      }

      rows.forEach((row, index) => {
        if (index === 0 && isFirstRowValid) return;
        if (index <= 1 && isFirstTwoRowsValid) return;

        const sluggedRow = row.map((cell) => (typeof cell === 'string' ? slugify(cell) : cell));

        const isFormatRow = formattedRowsSlug.some(
          (formatRow) =>
            formatRow.length === sluggedRow.length &&
            formatRow.every((val, i) => val === sluggedRow[i])
        );

        if (isFormatRow) return;

        const data = {
          errors: [
            typeof row[0] === 'string' ? row[0]?.trim() === '' : false,
            typeof row[1] === 'string'
              ? !['http', 'https', 'socks4', 'socks5']?.includes(row[1]?.trim())
              : !(typeof row[1] !== 'number'),
            typeof row[2] === 'string' && row[1] !== null
              ? !row[2]?.trim().match(REGEX)
              : !(typeof row[2] !== 'number'),
          ],
          data: row,
        };
        setList((prev) => [...prev, data]);
        setErrorField((prev) => ({ ...prev, file: false }));
      });
    });

    const newFile = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });

    if (newFile) {
      setValue([newFile]);
    }
  };

  const fetchGroupData = useCallback(async () => {
    try {
      if (workspace_id) {
        const response = await getListGroupProfileApi(workspace_id);
        if (response.data) {
          setGroups(response.data.data);
          if (groupId === '') {
            if (response.data.data.some((group) => group.id === groupParam)) {
              // eslint-disable-next-line no-nested-ternary
              setGroupId(groupParam ? Math.max(Number(groupParam) || 0, 0) : isHost ? 0 : '');
            } else {
              setGroupId(isHost ? 0 : '');
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }, [groupId, groupParam, isHost, workspace_id]);

  const handleCreateGroup = async () => {
    if (!groupName) return;
    setLoading(true);
    try {
      const payload = {
        name: groupName,
        color_code: '#ccc',
      };
      if (workspace_id) {
        const response = await createGroupProfileApi(workspace_id, payload);
        setGroups((prev) => [...prev, response?.data?.data]);
        setGroupId(response?.data?.data?.id);
      }
    } catch (e) {
      console.log(e);
      if (e?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.group.create'), { variant: 'error' });
      } else if (e?.error_code === ERROR_CODE.CANT_CREATE_PROFILE_GROUP) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.group.createWhenAuthMode'), {
          variant: 'error',
        });
      } else enqueueSnackbar(e?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(false);
      setGroupName('');
    }
  };

  const handleSubmit = async () => {
    if (!value?.[0]) {
      setErrorField((prev) => ({ ...prev, file: true }));
      return;
    }
    try {
      setImportLoading(true);
      const formData = new FormData();
      formData.append('data_file', value[0]);
      formData.append('profile_config_id', browserConfig);
      formData.append('is_auto_renew', isAutoRenew);
      if (groupId) {
        formData.append('group_id', groupId);
      } else {
        formData.append('group_id', 0);
      }
      await importProfileApi(workspace_id, formData);
      enqueueSnackbar(t('systemNotify.success.create'), { variant: 'success' });
      updateRefreshBalance();
      router.push(paths.dashboard.profile);
    } catch (e) {
      setImportLoading(false);
      console.log(e);
      if (e?.error_code === ERROR_CODE.INSUFFICIENT_PROFILE_BALANCE) {
        enqueueSnackbar(t('systemNotify.warning.notEnoughProfileBalance'), { variant: 'error' });
      } else if (e?.error_fields) {
        // eslint-disable-next-line no-restricted-syntax
        for (const key in e?.error_fields) {
          if (key === 'group_id') {
            setErrorField((prev) => ({ ...prev, group: true }));
            break;
          }
        }
      } else enqueueSnackbar(e?.message || t('systemNotify.error.title'), { variant: 'error' });
    }
  };

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

  useEffect(() => {
    if (numOfError > 0) {
      setError('Invalid profile data');
    } else {
      setError('');
    }
  }, [numOfError]);

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

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  return (
    <Stack width={1} height={1} spacing={2} mt={2}>
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
            <Upload
              multiple
              files={value}
              error={!!error || !!errorField.file}
              maxSize={3145728}
              onDrop={handleDropFileZip}
              onRemove={() => {
                setValue(null);
                setList([]);
                setError('');
              }}
              accept={{
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
                'application/vnd.ms-excel': [],
              }}
              placeholder={
                <Stack
                  spacing={1}
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    color: 'text.secondary',
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                    border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
                    ...((error || !!errorField.file) && {
                      color: 'error.main',
                      borderColor: 'error.main',
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                    }),
                  }}
                >
                  <Iconify icon="tabler:cloud-up" width={30} />
                  <Typography variant="body2" whiteSpace="nowrap">
                    {t('profileImport.actions.uploadFile')}
                  </Typography>
                </Stack>
              }
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'start', md: 'center' },
                justifyContent: 'flex-start',
                width: 1,
                gap: 3,
                '& .MuiBox-root': {
                  bgcolor: 'transparent',
                  border: 'none',
                  my: 0,
                  maxWidth: 'fit-content',
                },
                '& .MuiStack-root': {
                  m: 0,
                },
              }}
              stylePreview={{
                height: '57px',
              }}
            />
            <Link
              component="a"
              download="example-file.xlsx"
              href="/assets/files/example-file.xlsx"
              sx={{
                display: 'inline-block',
                width: 1,
                textAlign: 'left',
                pl: 1,
                typography: 'caption',
              }}
              onClick={(event) => {
                if (isElectron()) {
                  event.preventDefault();
                  window.ipcRenderer.send('download-file', EXAMPLE_IMPORT_PROFILE_FILE_URL);
                }
              }}
            >
              {t('profileImport.actions.downloadTemplate')}
            </Link>

            <TextField
              select
              fullWidth
              name="group"
              label={t('form.label.group')}
              error={errorField.group}
              helperText={errorField.group ? t('formError.profile.group') : ''}
              value={groupId ?? ''}
              onChange={(event) => {
                if (errorField.group) setErrorField((prev) => ({ ...prev, group: false }));
                setGroupId(event.target.value);
              }}
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
              sx={{ mt: 3 }}
            >
              <Stack direction="row" spacing={3} my={2} alignItems="center">
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('form.tooltip.create-group')}
                  onClick={(event) => event.stopPropagation()}
                  onChange={debounce(
                    (event) => {
                      setGroupName(event.target.value);
                    },
                    [300]
                  )}
                />
                <LoadingButton variant="contained" loading={loading} onClick={handleCreateGroup}>
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
            </TextField>

            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

            <Stack
              spacing={2}
              alignItems="flex-start"
              sx={{ mt: 3, ml: 1, textAlign: 'right', typography: 'body2' }}
            >
              <Stack direction="row">
                <Box sx={{ color: 'text.secondary' }}>{t('profileImport.totalValid')}</Box>
                <Box sx={{ paddingLeft: 2, typography: 'subtitle2', color: 'success.main' }}>
                  {list.length - numOfError || 0}
                </Box>
              </Stack>

              <Stack direction="row">
                <Box sx={{ color: 'text.secondary' }}>{t('profileImport.totalInvalid')}</Box>
                <Box sx={{ paddingLeft: 2, typography: 'subtitle2', color: 'error.main' }}>
                  {numOfError || 0}
                </Box>
              </Stack>

              <Stack direction="row" sx={{ typography: 'subtitle1' }}>
                <Box>{t('profileImport.total')}</Box>
                <Box sx={{ paddingLeft: 2 }}>{list.length || 0}</Box>
              </Stack>
            </Stack>

            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{t('profileImport.browserConfig')}</Typography>
                <Button onClick={show.onTrue} startIcon={<Iconify icon="fluent:add-12-regular" />}>
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
                {[{ id: 0, name: t('profileImport.labels.default') }, ...(profileConfig || [])].map(
                  (item) => (
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
                  )
                )}
              </TextField>
            </Stack>

            <FormControlLabel
              label={t('dialog.renewProfile.enableAutoRenew.title')}
              control={
                <Checkbox
                  checked={isAutoRenew}
                  onChange={(event) => {
                    setIsAutoRenew(event.target.checked);
                  }}
                />
              }
              sx={{
                ml: 0.1,
                mt: 3,
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

            <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={2}>
              {list?.length > 0 ? (
                list.map((item, index) => (
                  <Stack
                    key={index}
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    sx={{ width: 1 }}
                    justifyContent="space-between"
                  >
                    <TextField
                      size="small"
                      label={t('profileImport.labels.profileName')}
                      value={item.data[0] ?? ''}
                      error={item.errors[0]}
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
                      value={item.data[1] ?? ''}
                      error={item.errors[1]}
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
                      value={item.data[2] ?? ''}
                      error={item.errors[2]}
                      inputProps={{
                        readOnly: true,
                      }}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        width: { xs: 1, md: 1 / 3 },
                      }}
                    />
                  </Stack>
                ))
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
          </Box>
        </Grid>
      </Grid>

      <CreateUpdateBrowserConfig
        open={show.value}
        onClose={() => {
          show.onFalse();
          if (profileConfigId) {
            setProfileConfigId(0);
            setProfileConfigData({});
            setIsUpdateMode(false);
          }
        }}
        handleReloadData={refetchProfileConfig}
        currentConfig={profileConfigData}
        profileConfigId={profileConfigId}
        setBrowserConfig={setBrowserConfig}
        isUpdateMode={isUpdateMode}
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

            setIsUpdateMode(true);
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
          disabled={!!error}
          loading={importLoading}
          onClick={handleSubmit}
        >
          {t('form.action.import')}
        </LoadingButton>
        <Button variant="outlined" onClick={() => router.back()}>
          {t('form.action.cancel')}
        </Button>
      </Stack>
    </Stack>
  );
}
