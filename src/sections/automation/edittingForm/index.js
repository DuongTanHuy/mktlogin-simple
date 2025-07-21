import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
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
import { formatErrors } from 'src/utils/format-errors';
import { updateWorkFlow } from 'src/api/workflow.api';
import cloneDeep from 'lodash/cloneDeep';
import { enqueueSnackbar } from 'notistack';
import { getStorage } from 'src/hooks/use-local-storage';
import { WORKSPACE_ID } from 'src/utils/constance';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function EditFormWorkFlow({
  onClose,
  formEdit,
  groups,
  updateWorkflowList,
  mode,
  ...other
}) {
  const { t } = useLocales();
  const workspaceId = getStorage(WORKSPACE_ID);
  const [errorMsg, setErrorMsg] = useState('');

  const reviewFormKey = useId();

  const ReviewSchema = Yup.object().shape({
    name: Yup.string().required(t('validate.required')),
    description: Yup.string(),
    category: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      name: '',
      description: '',
      category: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(ReviewSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (formEdit) {
      setValue('name', formEdit?.name || '');
      setValue('description', formEdit?.description || '');
      setValue('category', formEdit?.workflow_group || 0);
    }
  }, [formEdit, setValue]);

  const onCancel = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const submitForm = handleSubmit(async (data) => {
    try {
      const _clone = cloneDeep(formEdit);
      delete _clone.id;
      delete _clone.display;

      const payload = {
        ..._clone,
        name: data.name,
        description: data.description,
        workflow_group: data.category === '0' ? 0 : Number(data.category),
        type: mode,
      };

      // if (Number(data.category) === 0 || !data.category) {
      //   delete payload.workflow_group;
      // }

      const res = await updateWorkFlow(workspaceId, formEdit.id, payload);
      updateWorkflowList({
        ...res?.data?.data,
        workflow_group:
          res?.data?.data?.workflow_group === null ? 0 : res?.data?.data?.workflow_group,
      });
      onClose();

      enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
    } catch (error) {
      if (!error?.error_fields) {
        setErrorMsg(t('validate.someThingWentWrong'));
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
        <DialogTitle>{t('workflow.script.dialog.editInfo.title')}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={2}>
            <RHFTextField name="name" label={t('workflow.script.dialog.editInfo.label.name')} />
            <RHFTextField
              name="description"
              rows={6}
              multiline
              label={t('workflow.script.dialog.editInfo.label.description')}
              placeholder={t('workflow.script.dialog.editInfo.placeholder.description')}
            />
            <RHFSelect name="category" label={t('workflow.script.dialog.editInfo.label.group')}>
              {groups.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onCancel}>
            {t('workflow.script.actions.cancel')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {t('workflow.script.actions.update')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

EditFormWorkFlow.propTypes = {
  onClose: PropTypes.func,
  updateWorkflowList: PropTypes.func,
  formEdit: PropTypes.object,
  groups: PropTypes.array,
  mode: PropTypes.string,
};
