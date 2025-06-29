import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';

// components
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { createWorkspace } from 'src/api/workspace.api';
import { formatErrors } from 'src/utils/format-errors';
import { useAuthContext } from 'src/auth/hooks';
import { setStorage } from 'src/hooks/use-local-storage';
import { WORKSPACE_ID } from 'src/utils/constance';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function AddNewWorkspace({
  onClose,
  updateWorkspaceList,
  handleCloseWorkspace,
  ...other
}) {
  const { t } = useLocales();
  const [errorMsg, setErrorMsg] = useState('');
  const { updateWorkspaceId } = useAuthContext();

  const reviewFormKey = useId();

  const ReviewSchema = Yup.object().shape({
    name: Yup.string().required(t('validate.required')),
    authorization_method: Yup.string().required(t('validate.required')),
  });

  const defaultValues = useMemo(
    () => ({
      name: '',
      description: '',
      authorization_method: 'group',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(ReviewSchema),
    defaultValues,
  });

  const {
    // setValue,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = methods;

  const onCancel = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const submitForm = handleSubmit(async (data) => {
    try {
      const response = await createWorkspace(data);
      if (response?.data) {
        const { data: workspaceInfo } = response.data;
        updateWorkspaceList(workspaceInfo);
        updateWorkspaceId(workspaceInfo?.id, workspaceInfo?.user_creator?.id);
        setStorage(WORKSPACE_ID, workspaceInfo?.id);
        reset();
        onClose();
        handleCloseWorkspace();
      }
    } catch (error) {
      if (!error?.error_fields) {
        setErrorMsg(t('validate.soneThingWrong'));
      } else {
        formatErrors(error?.error_fields, setError);
      }
    }
  });

  return (
    <Dialog fullWidth maxWidth="xs" onClose={() => onClose()} {...other}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <FormProvider
        keyForm={reviewFormKey}
        methods={methods}
        onSubmit={(event) => submitForm(event)}
      >
        <DialogTitle>{t('workspaceSetting.createWorkspace.title')}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={2}>
            <RHFTextField name="name" label={t('workspaceSetting.createWorkspace.label.name')} />
            <RHFTextField
              name="description"
              rows={6}
              multiline
              label={t('workspaceSetting.createWorkspace.label.des')}
            />
            <RHFSelect
              name="authorization_method"
              label={t('workspaceSetting.createWorkspace.label.authMethod')}
            >
              <MenuItem value="profile">
                {t('workspaceSetting.authMethod.options.byProfile')}
              </MenuItem>
              <MenuItem value="group">{t('workspaceSetting.authMethod.options.byGroup')}</MenuItem>
            </RHFSelect>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onCancel}>
            {t('workspaceSetting.actions.close')}
          </Button>
          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
            {t('workspaceSetting.actions.create')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

AddNewWorkspace.propTypes = {
  onClose: PropTypes.func,
  handleCloseWorkspace: PropTypes.func,
  updateWorkspaceList: PropTypes.func,
};
