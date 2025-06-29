import { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, {
  RHFAutocomplete,
  RHFRadioGroup,
  RHFSelect,
  RHFTextField,
} from 'src/components/hook-form';
import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import { useGetWorkspaceSetting } from 'src/api/workspace-setting.api';
import { useAuthContext } from 'src/auth/hooks';
import { getListProfileApi } from 'src/api/profile.api';
import { inviteMemberApi } from 'src/api/invite.api';
import { enqueueSnackbar } from 'notistack';
import { getListGroupProfileApi } from 'src/api/profile-group.api';
import { getListWorkgroupApi } from 'src/api/workgroup.api';
import { updateWorkgroupUserApi } from 'src/api/workgroup-user.api';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';

//----------------------------------------------------------------

function filterObjectsByValues(arrObjects, arrNumbers) {
  return arrObjects.filter((obj) => arrNumbers.includes(obj.value));
}

//----------------------------------------------------------------

const AddEditMemberDialog = ({
  open,
  onClose,
  currentGroup,
  currentData,
  handleResetData,
  workspaceRole,
  handelChangeTabAfterInvite,
}) => {
  const { t } = useLocales();
  const { workspace_id, isHost } = useAuthContext();
  const [groupAuthOptions, setGroupAuthOptions] = useState([]);
  const [groupOPtions, setGroupOptions] = useState([]);
  const { setting } = useGetWorkspaceSetting(workspace_id);
  const FormSchema = Yup.object().shape({
    member_name: Yup.string().required(t('dialog.member.invite.placeholder.name')),
    email: Yup.string().required(t('dialog.member.invite.placeholder.email')),
    groupAuth: Yup.array(),
  });

  const defaultValues = useMemo(
    () => ({
      workgroup: currentData?.workgroup || '',
      member_name: currentData?.member_name || '',
      email: currentData?.user || '',
      role: currentData?.role || 'member',
      groupAuth: (() => {
        if (currentData?.workgroup) {
          const groupAuthValue =
            setting?.authorization_method === 'profile'
              ? currentData?.profile_workgroup_users
              : currentData?.profile_group_workgroup_users;
          const result = filterObjectsByValues(groupAuthOptions, groupAuthValue);
          return result.length === groupAuthOptions.length - 1
            ? [{ value: 'all', label: 'Tất cả' }]
            : result;
        }
        return [];
      })(),
      n_profile_limit: currentData?.n_profile_use_limit || '',
      note: currentData?.note || '',
    }),
    [currentData, groupAuthOptions, setting?.authorization_method]
  );

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = methods;

  const watchRole = watch('role');

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { member_name, email, role, n_profile_limit, groupAuth, note, workgroup } = data;
      const groupAuthSet = new Set(groupAuth.map((item) => item.value));

      const finalGroupAuth = groupAuthSet.has('all')
        ? groupAuthOptions.reduce((acc, option) => {
            if (option.value !== 'all') {
              acc.push(option.value);
            }
            return acc;
          }, [])
        : Array.from(groupAuthSet);

      if (currentData?.id) {
        const payload = {
          workgroup,
          user: email,
          member_name,
          note,
          role,
          ...(!!n_profile_limit && {
            n_profile_use_limit: n_profile_limit,
          }),
          ...(isHost && {
            profile_authorization:
              setting?.authorization_method === 'profile' ? finalGroupAuth : [],
            group_authorization: setting?.authorization_method === 'group' ? finalGroupAuth : [],
          }),
        };
        await updateWorkgroupUserApi(workspace_id, currentData.id, payload);
        handleResetData();
      } else {
        const payload = {
          workgroup_id: currentGroup?.id,
          member_name,
          email,
          role,
          note,
          ...(!!n_profile_limit && {
            n_profile_limit,
          }),
          profile_authorization: setting?.authorization_method === 'profile' ? finalGroupAuth : [],
          group_authorization: setting?.authorization_method === 'group' ? finalGroupAuth : [],
        };
        await inviteMemberApi(workspace_id, payload);
        handelChangeTabAfterInvite();
      }
      enqueueSnackbar(
        currentData?.id ? t('systemNotify.success.update') : t('systemNotify.success.send'),
        {
          variant: 'success',
        }
      );
    } catch (error) {
      console.error(error);
      if (error?.error_fields) {
        const arrErrors = Object.values(error?.error_fields);
        if (arrErrors?.length > 0) {
          enqueueSnackbar(arrErrors[0][0], { variant: 'error' });
        }
      } else if (error?.error_code === ERROR_CODE.INVITE_REQUEST_EXIST) {
        enqueueSnackbar(t('systemNotify.warning.send'), {
          variant: 'warning',
        });
        handelChangeTabAfterInvite();
      } else if (error?.error_code === ERROR_CODE.MEMBER_HAS_JOIN) {
        enqueueSnackbar(t('systemNotify.warning.hasJoin'), {
          variant: 'warning',
        });
      } else if (error?.error_code === ERROR_CODE.NOT_PURCHASED_PACKAGE) {
        enqueueSnackbar(t('systemNotify.warning.notPurchasePackage'), {
          variant: 'warning',
        });
      } else {
        enqueueSnackbar(t('systemNotify.error.title'), {
          variant: 'error',
        });
      }
    } finally {
      handleClose();
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    const fetchGroupAuthOptions = async () => {
      try {
        let response;
        if (setting?.authorization_method === 'profile') {
          response = await getListProfileApi(workspace_id, '?page_size=999999&fields=id,name');
        } else if (setting?.authorization_method === 'group') {
          response = await getListGroupProfileApi(workspace_id);
        }
        if (response?.data?.data) {
          const data = response.data.data.filter((item) => item?.name !== 'Ungrouped');
          setGroupAuthOptions([
            { value: 'all', label: 'Tất cả' },
            ...data.map((option) => ({
              value: option.id,
              label: option.name,
            })),
          ]);
        }
      } catch (error) {
        /* empty */
      }
    };

    if (open) {
      fetchGroupAuthOptions();
    }
  }, [open, setting?.authorization_method, workspace_id]);

  useEffect(() => {
    const fetchGroupOptions = async () => {
      try {
        const response = await getListWorkgroupApi(workspace_id);
        setGroupOptions(response?.data?.data);
      } catch (error) {
        /* empty */
      }
    };
    if (currentData?.id && open) {
      fetchGroupOptions();
    }
  }, [currentData?.id, open, workspace_id]);

  useEffect(() => {
    if (currentData?.id && groupAuthOptions.length > 0 && groupOPtions.length > 0) {
      reset(defaultValues);
    }
  }, [currentData?.id, defaultValues, groupAuthOptions.length, groupOPtions.length, reset]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle sx={{ pb: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4" marginRight="auto" marginLeft={1}>
              {currentData?.id ? t('dialog.member.invite.edit') : t('dialog.member.invite.invite')}
            </Typography>
            <IconButton onClick={handleClose}>
              <Iconify icon="ic:round-close" />
            </IconButton>
          </Stack>
          <Divider />
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ typography: 'body2' }}>
        <FormProvider
          methods={methods}
          onSubmit={onSubmit}
          sx={{ overflow: 'unset', height: '100%' }}
        >
          <Stack spacing={3}>
            <AddTab title={t('dialog.member.invite.fields.groupName')}>
              {currentData?.id ? (
                <RHFSelect
                  fullWidth
                  size="small"
                  name="workgroup"
                  InputLabelProps={{ shrink: true }}
                  PaperPropsSx={{ textTransform: 'capitalize' }}
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
                  {groupOPtions.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              ) : (
                currentGroup?.name
              )}
            </AddTab>
            <AddTab title={t('dialog.member.invite.fields.name')}>
              <RHFTextField
                // readOnly={!!currentData?.id}
                size="small"
                name="member_name"
                placeholder={t('dialog.member.invite.placeholder.name')}
              />
            </AddTab>
            <AddTab title={t('dialog.member.invite.fields.email')}>
              <RHFTextField
                size="small"
                type="email"
                name="email"
                placeholder={t('dialog.member.invite.placeholder.email')}
              />
            </AddTab>
            <AddTab title={t('dialog.member.invite.fields.identity')}>
              <ListItemText
                primary={
                  <RHFRadioGroup
                    row
                    // disabled={!!currentData?.id}
                    name="role"
                    spacing={4}
                    options={[
                      ...(isHost
                        ? [{ value: 'admin', label: t('dialog.member.invite.options.admin') }]
                        : []),
                      ...(isHost || workspaceRole === 'admin'
                        ? [{ value: 'manager', label: t('dialog.member.invite.options.manager') }]
                        : []),
                      { value: 'member', label: t('dialog.member.invite.options.member') },
                    ]}
                  />
                }
                secondary={(() => {
                  if (watchRole === 'admin')
                    return t('dialog.member.invite.placeholder.identity.admin');
                  if (watchRole === 'manager')
                    return t('dialog.member.invite.placeholder.identity.manager');
                  return t('dialog.member.invite.placeholder.identity.member');
                })()}
                primaryTypographyProps={{ typography: 'body2' }}
                secondaryTypographyProps={{
                  component: 'span',
                  color: 'text.disabled',
                }}
              />
            </AddTab>
            {(isHost || !currentData?.id) && (
              <AddTab
                title={
                  setting?.authorization_method === 'profile'
                    ? t('dialog.member.invite.fields.profileAuthorization')
                    : t('dialog.member.invite.fields.groupAuthorization')
                }
              >
                <RHFAutocomplete
                  selectAll
                  multiple
                  name="groupAuth"
                  placeholder={`+ ${
                    setting?.authorization_method === 'profile'
                      ? t('dialog.member.invite.placeholder.profile')
                      : t('dialog.member.invite.placeholder.group')
                  }`}
                  size="small"
                  disableCloseOnSelect
                  options={groupAuthOptions}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  renderOption={(props, group) => (
                    <li {...props} key={group.value}>
                      {group.label}
                    </li>
                  )}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, index) => (
                      <Chip
                        {...getTagProps({ index: option.value === 'all' ? option.value : index })}
                        key={option.value}
                        label={option.label}
                        size="small"
                        color="primary"
                        variant="soft"
                      />
                    ))
                  }
                />
              </AddTab>
            )}
            <AddTab title={t('dialog.member.invite.fields.limitInput')}>
              <RHFTextField
                size="small"
                type="number"
                name="n_profile_limit"
                placeholder={t('dialog.member.invite.placeholder.limitInput')}
              />
            </AddTab>
            <AddTab title={t('dialog.member.invite.fields.note')}>
              <RHFTextField
                name="note"
                placeholder={t('dialog.member.invite.placeholder.note')}
                multiline
                rows={4}
              />
            </AddTab>
            <Stack direction="row" justifyContent="end" spacing={3} mb={3}>
              <Button variant="outlined" onClick={handleClose}>
                {t('dialog.member.actions.cancel')}
              </Button>
              <LoadingButton
                color="primary"
                size="medium"
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                {t('dialog.member.actions.invite')}
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditMemberDialog;

AddEditMemberDialog.propTypes = {
  currentGroup: PropTypes.object,
  currentData: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleResetData: PropTypes.func,
  handelChangeTabAfterInvite: PropTypes.func,
  workspaceRole: PropTypes.string,
};

//----------------------------------------------------------------

function AddTab({ title, children }) {
  return (
    <Grid
      container
      sx={{
        ml: 1,
      }}
    >
      <Grid item xs={2} textAlign="left">
        {title}
      </Grid>
      <Grid item xs={10}>
        {children}
      </Grid>
    </Grid>
  );
}

AddTab.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
};
