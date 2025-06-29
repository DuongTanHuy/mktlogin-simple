import { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button, Dialog, DialogTitle, Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useLocales } from 'src/locales';
import { enqueueSnackbar } from 'notistack';
import { uploadNewVersionApi } from 'src/api/publish-workflow.api';
import { format } from 'date-fns';
import { LOCALES } from 'src/utils/constance';
import i18n from 'src/locales/i18n';
import { formatErrors } from 'src/utils/format-errors';
import { RHFTextField } from '../hook-form';
import FormProvider from '../hook-form/form-provider';

function UpdateVersionDialog({ open, onClose, currentVersion, publicWorkflowId, last_update }) {
  const [dataAfterUpdate, setDataAfterUpdate] = useState({
    created_at: '',
    version: '',
  });
  const { t } = useLocales();
  const FormSchema = Yup.object().shape({
    name: Yup.string()
      .required(t('validate.required'))
      .matches(/^\d+\.\d+\.\d+$/, t('validate.version')),
  });

  const defaultValues = {
    name: '',
    change_log: '',
  };

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await uploadNewVersionApi(publicWorkflowId, data);
      setDataAfterUpdate({
        created_at: response?.data?.data?.created_at,
        version: response?.data?.data?.name,
      });
      handleClose();
      enqueueSnackbar(t('dialog.publicWorkflowUploadNewVersion.message.uploadSuccess'), {
        variant: 'success',
      });
    } catch (error) {
      if (error?.error_fields) {
        formatErrors(error.error_fields, setError, t);
      } else {
        enqueueSnackbar(t('dialog.publicWorkflowUploadNewVersion.message.uploadFailed'), {
          variant: 'error',
        });
      }
    }
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle
          sx={{
            pb: 0,
          }}
        >
          {t('dialog.uploadVersion.title')}
        </DialogTitle>
        <Stack spacing={2} p={3}>
          <Stack spacing={1}>
            <RHFTextField
              name="name"
              label={t('dialog.uploadVersion.labels.version')}
              placeholder={t('dialog.uploadVersion.placeholder.version')}
            />
            <Typography variant="caption" fontStyle="italic" color="text.secondary" ml={1}>
              {`${t('dialog.uploadVersion.placeholder.currentVersion')}: ${
                dataAfterUpdate?.version || currentVersion
              }`}
            </Typography>
            {last_update && (
              <Typography ml={1} fontStyle="italic" variant="caption" color="text.secondary">{`${t(
                'dialog.uploadVersion.placeholder.lastUpdate'
              )} ${format(new Date(dataAfterUpdate?.created_at || last_update), 'dd/MM/yyyy H:mm', {
                locale: LOCALES[i18n.language],
              })}`}</Typography>
            )}
          </Stack>
          <RHFTextField
            name="change_log"
            multiline
            rows={5}
            label={t('dialog.uploadVersion.labels.changeLog')}
            placeholder={t('dialog.uploadVersion.placeholder.changeLog')}
          />
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="flex-end" p={3} pt={0}>
          <Button variant="outlined" onClick={handleClose}>
            {t('dialog.uploadVersion.actions.cancel')}
          </Button>
          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
            {t('dialog.uploadVersion.actions.upload')}
          </LoadingButton>
        </Stack>
      </FormProvider>
    </Dialog>
  );
}

export default memo(UpdateVersionDialog);

UpdateVersionDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  currentVersion: PropTypes.string,
  last_update: PropTypes.string,
  publicWorkflowId: PropTypes.number,
};
