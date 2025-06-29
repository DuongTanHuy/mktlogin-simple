import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// mui
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  inputBaseClasses,
  inputClasses,
} from '@mui/material';
// api
import { getWorkflowCategoryApi } from 'src/api/workflow-category.api';
import {
  publishWorkflowApi,
  unpublishWorkFlowApi,
  updateWorkFlowApi,
} from 'src/api/publish-workflow.api';
// components
import FormProvider, {
  RHFEditor,
  RHFRadioGroup,
  RHFSelect,
  RHFTextField,
  RHFUpload,
} from 'src/components/hook-form';
import { memo, useEffect, useMemo, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import { useAuthContext } from 'src/auth/hooks';
import { useLocales } from 'src/locales';
import { useBoolean } from 'src/hooks/use-boolean';
import { getFileFromUrl } from 'src/utils/commom';
import { ERROR_CODE } from 'src/utils/constance';
import Iconify from '../iconify';

//----------------------------------------------------------------

const PublishWorkflowDialog = ({ open, onClose, workflowInfo, handleReloadData }) => {
  const { t } = useLocales();
  const { workspace_id } = useAuthContext();
  const confirm = useBoolean();
  const [loading, setLoading] = useState(false);

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('validate.required')),
    workflow_category: Yup.string().test(
      'not-none',
      t('validate.required'),
      (value) => value !== 'none'
    ),
    description: Yup.string().required(t('validate.required')),
    readme: Yup.string().test('readmeContent', t('validate.required'), (value) => {
      if (value === '<p><br></p>' || value === '') {
        return false;
      }
      return true;
    }),
    usage_fee: Yup.number(t('validate.usage_fee.number'))
      .transform((value, originalValue) => (originalValue === '' ? 0 : value))
      .required(t('validate.required'))
      .integer(t('validate.usage_fee.integer'))
      .min(0, t('validate.usage_fee.min')),
    avatar: Yup.mixed()
      .nullable()
      .notRequired()
      .test('fileSize', t('validate.file.2mb'), (value) => {
        if (!value) {
          return true;
        }
        if (typeof value === 'object') {
          return value.size < 2097152;
        }
        return true;
      }),
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [autoUpdateAvatar, setAutoUpdateAvatar] = useState(true);

  const defaultValues = useMemo(
    () => ({
      name: workflowInfo?.public_workflow?.name || '',
      workflow_category: workflowInfo?.public_workflow?.workflow_category || 'none',
      is_encrypted: workflowInfo?.public_workflow?.is_encrypted === 'True' || true,
      usage_fee: workflowInfo?.public_workflow?.usage_fee || 0,
      description: workflowInfo?.public_workflow?.description || '',
      readme: workflowInfo?.public_workflow?.readme || '',
      avatar: workflowInfo?.public_workflow?.avatar_url || null,
    }),
    [
      workflowInfo?.public_workflow?.description,
      workflowInfo?.public_workflow?.is_encrypted,
      workflowInfo?.public_workflow?.name,
      workflowInfo?.public_workflow?.readme,
      workflowInfo?.public_workflow?.usage_fee,
      workflowInfo?.public_workflow?.workflow_category,
      workflowInfo?.public_workflow?.avatar_url,
    ]
  );

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const watchCategory = watch('workflow_category');

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { name, workflow_category, description, readme, avatar, is_encrypted, usage_fee } =
        data;

      const formData = new FormData();
      formData.append('name', name);
      if (workflow_category !== 'other') {
        formData.append('workflow_category', workflow_category);
      }
      if (avatar && avatar instanceof File) {
        formData.append('avatar', avatar);
      }
      formData.append('description', description);
      formData.append('readme', readme);
      formData.append('is_encrypted', is_encrypted);
      formData.append('usage_fee', usage_fee);

      let res = null;
      if (workflowInfo?.is_public) {
        res = await updateWorkFlowApi(workflowInfo?.public_workflow?.id, formData);
      } else {
        res = await publishWorkflowApi(workspace_id, workflowInfo.id, formData);
      }

      handleReloadData();
      if (workflowInfo?.is_public) {
        enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
      } else if (res?.data?.status === 'pending') {
        enqueueSnackbar(t('systemNotify.success.publishWorkflow'), { variant: 'warning' });
      } else {
        enqueueSnackbar(t('systemNotify.success.title'), { variant: 'success' });
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.workflow.publish'), {
          variant: 'error',
        });
      } else enqueueSnackbar(t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      handleClose();
    }
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleDropSingleFile = (acceptedFiles) => {
    const file = acceptedFiles[0];

    const newFile = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });

    if (newFile) {
      setAutoUpdateAvatar(false);
      setValue('avatar', file, { shouldValidate: true });
    }
  };

  useEffect(() => {
    if (workflowInfo) {
      reset(defaultValues);
    }
  }, [defaultValues, reset, workflowInfo]);

  useEffect(() => {
    const handleGetAvatar = async () => {
      const categoryName =
        watchCategory === 'other'
          ? 'other'
          : categoryOptions.find((item) => item.id === watchCategory)?.name ?? '';
      if (categoryName) {
        const file = await getFileFromUrl(
          `/logo/categories/icons-${categoryName.toLowerCase().replace(/\s+/g, '-')}.png`,
          `icons-${categoryName.toLowerCase().replace(/\s+/g, '-')}.png`
        );

        if (file) {
          setValue('avatar', file, { shouldValidate: true });
        }
      } else {
        setValue('avatar', null, { shouldValidate: true });
      }
    };

    if (autoUpdateAvatar) {
      handleGetAvatar();
    }
  }, [categoryOptions, setValue, watchCategory, autoUpdateAvatar]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await getWorkflowCategoryApi();
        if (response?.data) {
          const { data } = response;
          setCategoryOptions(data);
        }
      } catch (error) {
        /* empty */
      }
    };
    fetchCategory();
  }, []);

  const unpublishWorkflow = async () => {
    try {
      setLoading(true);
      await unpublishWorkFlowApi(workflowInfo?.public_workflow?.id);
      onClose();
      handleReloadData();
      enqueueSnackbar(t('systemNotify.success.title'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(false);
      confirm.onFalse();
    }
  };

  return (
    <>
      <Dialog fullWidth maxWidth="md" open={open}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <DialogTitle
            sx={{
              pb: 0,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1">{t('dialog.publicWorkflow.title')}</Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={handleClose}>
                  {t('dialog.publicWorkflow.actions.cancel')}
                </Button>
                {workflowInfo?.is_public ? (
                  <Button variant="contained" color="error" onClick={confirm.onTrue}>
                    {t('dialog.publicWorkflow.actions.unpublish')}
                  </Button>
                ) : (
                  <LoadingButton type="submit" loading={isSubmitting} variant="contained">
                    {t('dialog.publicWorkflow.actions.publish')}
                  </LoadingButton>
                )}
                {workflowInfo?.is_public && (
                  <LoadingButton type="submit" loading={isSubmitting} variant="contained">
                    {t('dialog.publicWorkflow.actions.update')}
                  </LoadingButton>
                )}
              </Stack>
            </Stack>
          </DialogTitle>
          <DialogContent
            sx={{
              '&.MuiDialogContent-root': {
                py: 3,
              },
            }}
          >
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={9}>
                  <RHFTextField
                    name="name"
                    label={t('dialog.publicWorkflow.labels.title')}
                    placeholder={t('dialog.publicWorkflow.placeholder.title')}
                    size="small"
                    sx={{
                      [`& .${inputBaseClasses.input}`]: {
                        typography: 'h6',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <RHFSelect
                    fullWidth
                    size="small"
                    name="workflow_category"
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
                    sx={{
                      bgColor: 'red',
                    }}
                  >
                    <MenuItem value="none" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      {t('dialog.publicWorkflow.labels.category')}
                    </MenuItem>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {categoryOptions.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}

                    <MenuItem value="other">{t('dialog.publicWorkflow.options.other')}</MenuItem>
                  </RHFSelect>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2}>
                <RHFTextField
                  name="description"
                  rows={3}
                  multiline
                  label={t('dialog.publicWorkflow.labels.description')}
                  placeholder={t('dialog.publicWorkflow.placeholder.description')}
                />
                <RHFUpload
                  name="avatar"
                  onDrop={handleDropSingleFile}
                  onDelete={() => {
                    setAutoUpdateAvatar(true);
                    setValue('avatar', null, { shouldValidate: true });
                  }}
                  sx={{
                    width: 100,
                    height: 100,
                    flexShrink: 0,
                    ...(errors?.avatar && {
                      mb: 3,
                    }),
                    '& .MuiFormHelperText-root': {
                      position: 'absolute',
                      right: 0,
                      whiteSpace: 'nowrap',
                    },
                  }}
                  placeholder={
                    <Stack
                      spacing={1}
                      alignItems="center"
                      sx={{
                        color: 'text.secondary',
                        ...(errors?.avatar && {
                          color: 'error.main',
                          borderColor: 'error.main',
                        }),
                      }}
                    >
                      <Iconify icon="eva:cloud-upload-fill" width={30} />
                      <Typography variant="body2" whiteSpace="nowrap">
                        {t('dialog.publicWorkflow.labels.avatar')}
                      </Typography>
                    </Stack>
                  }
                />
              </Stack>

              <Stack>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <RHFRadioGroup
                    row
                    spacing={4}
                    name="is_encrypted"
                    label={t('dialog.publicWorkflow.labels.encrypted')}
                    options={[
                      { value: true, label: t('dialog.publicWorkflow.options.encrypted.yes') },
                      { value: false, label: t('dialog.publicWorkflow.options.encrypted.no') },
                    ]}
                  />

                  <Tooltip title={t('dialog.publicWorkflow.labels.notAvailable')}>
                    <span>
                      <RHFTextField
                        name="usage_fee"
                        disabled
                        label={t('dialog.publicWorkflow.labels.usageFee')}
                        placeholder={t('dialog.publicWorkflow.placeholder.usageFee')}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                        type="number"
                        inputProps={{
                          step: 100,
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="start">
                              <Box component="span" sx={{ color: 'text.disabled', ml: 2 }}>
                                VND
                              </Box>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          width: 1,
                          [`& .${inputClasses.input}`]: {
                            p: 0,
                            typography: 'body1',
                          },
                        }}
                      />
                    </span>
                  </Tooltip>
                </Stack>

                <Typography
                  variant="caption"
                  textAlign="end"
                  color="text.disabled"
                  fontStyle="italic"
                >
                  {t('dialog.publicWorkflow.note.usageFee')}
                </Typography>
              </Stack>

              <Stack>
                <RHFEditor
                  simple={false}
                  name="readme"
                  formatType="base64"
                  placeholder={t('dialog.publicWorkflow.placeholder.guide')}
                />
              </Stack>
            </Stack>
          </DialogContent>
        </FormProvider>
      </Dialog>

      <Dialog onClose={() => confirm.onFalse()} open={confirm.value}>
        <DialogTitle>{t('dialog.publicWorkflow.unpublish')}</DialogTitle>
        <DialogActions
          sx={{
            pt: 0,
          }}
        >
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => confirm.onFalse()}>
              {t('workflow.script.actions.back')}
            </Button>
            <LoadingButton
              loading={loading}
              variant="contained"
              color="error"
              onClick={() => unpublishWorkflow()}
            >
              {t('dialog.publicWorkflow.actions.unpublish')}
            </LoadingButton>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
};

const areEqual = (prevProps, nextProps) =>
  prevProps.open === nextProps.open && prevProps.workflowInfo === nextProps.workflowInfo;

export default memo(PublishWorkflowDialog, areEqual);

PublishWorkflowDialog.propTypes = {
  open: PropTypes.bool,
  workflowInfo: PropTypes.object,
  onClose: PropTypes.func,
  handleReloadData: PropTypes.func,
};
