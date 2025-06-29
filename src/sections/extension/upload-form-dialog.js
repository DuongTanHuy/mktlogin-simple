import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// mui
import { LoadingButton } from '@mui/lab';
import {
  alpha,
  Button,
  ButtonGroup,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  ListItemText,
  Stack,
  Tooltip,
  tooltipClasses,
  Typography,
} from '@mui/material';
// component
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField, RHFUpload } from 'src/components/hook-form';
import { styled } from '@mui/material/styles';
import {
  addExtensionApiV2,
  uploadFileExtensionApiV2,
  uploadUrlExtensionApiV2,
} from 'src/api/extension.api';
import { enqueueSnackbar } from 'notistack';
import { getStorage } from 'src/hooks/use-local-storage';
import { WORKSPACE_ID } from 'src/utils/constance';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------
const LightTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

const UploadFormDialog = ({ open, onClose, extensionInfo, handleReload }) => {
  const { t } = useLocales();
  const [currentTab, setCurrentTab] = useState(extensionInfo ? 'web-store' : 'upload-file');
  const [displayCopyTooltip, setDisplayCopyTooltip] = useState(false);
  const workspaceId = getStorage(WORKSPACE_ID);
  const [extensionFile, setExtensionFile] = useState(null);

  const UploadSchema = Yup.object().shape({
    introduction: Yup.string(),
    url: Yup.string().test('url-required', t('validate.required'), (value) => {
      if (currentTab === 'upload-file' || (currentTab === 'web-store' && value !== '')) {
        return true;
      }
      return false;
    }),
    icon: Yup.mixed()
      .nullable()
      .notRequired()
      .test('fileSize', t('validate.file.1mb'), (value) => !value || value.size < 1048576),
  });

  const defaultValues = useMemo(
    () => ({
      name: '',
      introduction: '',
      url: extensionInfo?.store_url || '',
      icon: null,
      fileZip: null,
    }),
    [extensionInfo?.store_url]
  );

  const methods = useForm({
    resolver: yupResolver(UploadSchema),
    defaultValues,
  });

  const {
    setValue,
    setError,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentTab === 'web-store') {
        if (extensionInfo?.id) {
          await addExtensionApiV2(workspaceId, extensionInfo.id);
        } else {
          await uploadUrlExtensionApiV2(workspaceId, {
            store_url: data.url,
          });
        }
      } else {
        let statusContinue = true;
        if (!data.icon?.preview) {
          setError('icon', {
            type: 'manual',
            message: '',
          });
          statusContinue = false;
        }
        if (!data.fileZip) {
          setError('fileZip', {
            type: 'manual',
            message: '',
          });
          statusContinue = false;
        }

        if (!data.name) {
          setError('name', {
            type: 'manual',
            message: '',
          });
          statusContinue = false;
        }

        if (!statusContinue) {
          return;
        }
        const formData = new FormData();
        formData.append('icon_file', data.icon);
        formData.append('name', data.name);
        formData.append('description', data.introduction);

        if (extensionFile) {
          const blob = new Blob([extensionFile], { type: 'application/zip' });
          const file = new File([blob], 'extension.zip', { type: 'application/zip' });
          formData.append('extension_file', file);
        } else {
          formData.append('extension_file', data.fileZip[0]);
        }

        await uploadFileExtensionApiV2(workspaceId, formData);
      }
      reset();
      onClose();
      handleReload();
      enqueueSnackbar(t('systemNotify.success.upload'), { variant: 'success' });
    } catch (error) {
      reset();
      onClose();

      try {
        const arrErrors = Object.values(error?.error_fields);
        if (arrErrors?.length > 0) {
          enqueueSnackbar(arrErrors[0][0], { variant: 'error' });
        }
      } catch {
        enqueueSnackbar(t('systemNotify.error.upload'), { variant: 'error' });
      }
    }
  });

  const handleDropSingleFile = (acceptedFiles) => {
    const file = acceptedFiles[0];

    const newFile = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });

    if (newFile) {
      setValue('icon', file, { shouldValidate: true });
    }
  };

  const handleDropFileZip = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const newFile = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });

    const response = await fetch(newFile.preview);
    const arrayBuffer = await response.arrayBuffer();
    const extInfo = await window.ipcRenderer.invoke('get-extension-info-from-file', arrayBuffer);
    if (!extInfo) {
      enqueueSnackbar('Tệp tải lên không phải tiện ích.', { variant: 'error' });
      return;
    }
    setValue('name', extInfo?.extensionName, { shouldValidate: true });
    setValue('introduction', extInfo?.extensionDescription, { shouldValidate: true });
    const iconBuffer = extInfo?.iconBuffer;
    const iconBlob = new Blob([iconBuffer], { type: 'image/png' });
    const iconFile = new File([iconBlob], 'icon.png', { type: 'image/png' });
    const newIconFile = Object.assign(iconFile, {
      preview: URL.createObjectURL(iconFile),
    });
    setValue('icon', newIconFile, { shouldValidate: true });

    if (extInfo.extensionFile) {
      setExtensionFile(extInfo.extensionFile);
    }

    if (newFile) {
      setValue('fileZip', [newFile], { shouldValidate: true });
    }
  };

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const renderUploadFile = (
    <>
      <UpdateTab title={t('dialog.extension.upload.uploadFile.labels.instPackage')}>
        <ListItemText
          primary={
            <RHFUpload
              name="fileZip"
              multiple
              maxSize={30000000}
              onDrop={handleDropFileZip}
              onRemove={() => {
                setValue('fileZip', null, { shouldValidate: true });
                reset();
              }}
              accept={{
                'application/zip': [],
              }}
              placeholder={
                <Stack
                  spacing={1}
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: 190,
                    color: 'text.secondary',
                    p: 1,
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                    border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
                    ...(errors?.fileZip && {
                      color: 'error.main',
                      borderColor: 'error.main',
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                    }),
                  }}
                >
                  <Iconify icon="tabler:cloud-up" width={30} />
                  <Typography variant="body2" whiteSpace="nowrap">
                    {t('dialog.extension.upload.uploadFile.fields.instPackage')}
                  </Typography>
                </Stack>
              }
              sx={{
                '& .MuiBox-root': {
                  bgcolor: 'transparent',
                  border: 'none',
                },
                '& .MuiStack-root': {
                  marginRight: 'auto',
                },
              }}
            />
          }
          secondary={t('dialog.extension.upload.uploadFile.placeholder.instPackage')}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled',
          }}
        />
      </UpdateTab>
      <UpdateTab title={t('dialog.extension.upload.uploadFile.labels.icon')}>
        <ListItemText
          primary={
            <RHFUpload
              name="icon"
              onDrop={handleDropSingleFile}
              onDelete={() => setValue('icon', null, { shouldValidate: true })}
              sx={{
                width: 100,
                height: 100,
                ...(errors?.icon && {
                  mb: 3,
                }),
                '& .MuiFormHelperText-root': {
                  position: 'absolute',
                  left: 0,
                  whiteSpace: 'nowrap',
                },
              }}
              placeholder={
                <Stack
                  spacing={1}
                  alignItems="center"
                  sx={{
                    color: 'text.secondary',
                    ...(errors?.icon && {
                      color: 'error.main',
                    }),
                  }}
                >
                  <Iconify icon="eva:cloud-upload-fill" width={30} />
                  <Typography variant="body2" whiteSpace="nowrap">
                    {t('dialog.extension.upload.uploadFile.fields.icon')}
                  </Typography>
                </Stack>
              }
            />
          }
          secondary={t('dialog.extension.upload.uploadFile.placeholder.icon')}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled',
            ml: 1,
          }}
        />
      </UpdateTab>
      <UpdateTab title={t('dialog.extension.upload.uploadFile.labels.extensionName')}>
        <RHFTextField
          size="small"
          name="name"
          placeholder={t('dialog.extension.upload.uploadFile.placeholder.extensionName')}
        />
      </UpdateTab>
      <UpdateTab title={t('dialog.extension.upload.uploadFile.labels.introduction')}>
        <RHFTextField
          multiline
          rows={3}
          name="introduction"
          placeholder={t('dialog.extension.upload.uploadFile.placeholder.introduction')}
        />
      </UpdateTab>
    </>
  );

  const renderWebStore = (
    <UpdateTab title={t('dialog.extension.upload.chromeStore.labels.url')}>
      <RHFTextField
        disabled={!!extensionInfo}
        size="small"
        name="url"
        placeholder={t('dialog.extension.upload.chromeStore.placeholder.url')}
        InputProps={{
          ...(!!extensionInfo && {
            endAdornment: (
              <LightTooltip
                onClose={() => setDisplayCopyTooltip(false)}
                open={displayCopyTooltip}
                title="Copied"
                placement="top"
              >
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(extensionInfo?.store_url);
                    setDisplayCopyTooltip(true);
                  }}
                  sx={{
                    marginLeft: 1,
                  }}
                >
                  <Iconify icon="solar:copy-bold-duotone" />
                </IconButton>
              </LightTooltip>
            ),
          }),
        }}
        sx={{
          '& .MuiInputBase-root': {
            paddingRight: 1,
          },
        }}
      />
      <Stack
        spacing={1}
        p={2}
        mt={3}
        borderRadius={2}
        bgcolor={(theme) => alpha(theme.palette.grey[500], 0.4)}
      >
        <Typography>{`${t('dialog.extension.upload.chromeStore.notes.title')}:`}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('dialog.extension.upload.chromeStore.notes.note1')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('dialog.extension.upload.chromeStore.notes.note2')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('dialog.extension.upload.chromeStore.notes.note3')}
        </Typography>
      </Stack>
    </UpdateTab>
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: (theme) => theme.customShadows.z4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4" marginRight="auto" marginLeft={1}>
              {t('dialog.extension.upload.title')}
            </Typography>
            <IconButton onClick={onClose}>
              <Iconify icon="ic:round-close" />
            </IconButton>
          </Stack>
          <Divider />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ typography: 'body2' }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <UpdateTab title={t('dialog.extension.upload.type')}>
              <ButtonGroup variant="outlined" color="inherit">
                <Button
                  disabled={!!extensionInfo}
                  onClick={() => setCurrentTab('upload-file')}
                  sx={{
                    '&.MuiButtonBase-root': {
                      ...(currentTab === 'upload-file' && {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        borderRightColor: 'primary.main',
                      }),
                    },
                  }}
                >
                  {t('dialog.extension.actions.upload')}
                </Button>
                <Button
                  onClick={() => setCurrentTab('web-store')}
                  sx={{
                    '&.MuiButtonBase-root': {
                      ...(currentTab === 'web-store' && {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        borderLeftColor: 'primary.main',
                      }),
                    },
                  }}
                >
                  {t('dialog.extension.actions.chromeStore')}
                </Button>
              </ButtonGroup>
            </UpdateTab>
            {currentTab === 'upload-file' ? renderUploadFile : renderWebStore}
            <Stack spacing={2} direction="row" alignItems="center" ml="auto" mb={3}>
              <Button variant="contained" color="inherit" onClick={onClose}>
                {t('dialog.extension.actions.cancel')}
              </Button>
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                variant="contained"
                color="primary"
              >
                {t('dialog.extension.actions.upload_to')}
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default UploadFormDialog;

UploadFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReload: PropTypes.func,
  extensionInfo: PropTypes.object,
};

//----------------------------------------------------------------

function UpdateTab({ title, children }) {
  return (
    <Grid container spacing={3}>
      <Grid
        item
        xs={3}
        textAlign="right"
        style={{
          paddingTop: '30px',
        }}
      >
        {title}
      </Grid>
      <Grid item xs={9}>
        {children}
      </Grid>
    </Grid>
  );
}

UpdateTab.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};
