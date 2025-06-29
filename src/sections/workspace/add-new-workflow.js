import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { memo, useCallback, useEffect, useId, useMemo, useState } from 'react';
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
import { createWorkFlow, getListWorkFlowGroup } from 'src/api/workflow.api';
import { enqueueSnackbar } from 'notistack';
import { getStorage } from 'src/hooks/use-local-storage';
import { ERROR_CODE, WORKSPACE_ID } from 'src/utils/constance';
import { useAuthContext } from 'src/auth/hooks';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

function AddNewWorkflow({ onClose, payload, mode, resetData, onConfirmSave = () => {}, open }) {
  const { t } = useLocales();
  const { variableFlow, updataStatusEditingWF, resources } = useAuthContext();
  const [errorMsg, setErrorMsg] = useState('');
  const [groups, setGroups] = useState([]);

  const workspaceId = getStorage(WORKSPACE_ID);
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

  useEffect(() => {
    getGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getGroups = async () => {
    try {
      const response = await getListWorkFlowGroup(workspaceId);
      setGroups(response?.data?.data);
    } catch (error) {
      /* empty */
    }
  };

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
      const payloadCreate = {
        ...payload,
        name: data.name,
        description: data.description,
        workflow_group: data.category === '0' ? 0 : Number(data.category),
        type: mode,
        global_data: [...(variableFlow.list || [])],
        resources: [...(resources.list || [])],
      };

      const response = await createWorkFlow(workspaceId, payloadCreate);
      onConfirmSave(response?.data?.data);
      enqueueSnackbar(t('systemNotify.success.create'), {
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
        style: {
          minWidth: 'fit-content',
        },
        SnackbarProps: {
          style: {
            minWidth: 'fit-content',
          },
        },
      });
      if (mode === 'script') {
        updataStatusEditingWF(false);
        resetData();
      }
      onClose();
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.workflow.create'), {
          variant: 'error',
        });
      } else if (!error?.error_fields) {
        setErrorMsg(t('systemNotify.error.create'));
      } else {
        formatErrors(error?.error_fields, setError);
      }
    }
  });

  return (
    <Dialog fullWidth maxWidth="xs" onClose={() => onClose()} open={open}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <FormProvider
        keyForm={reviewFormKey}
        methods={methods}
        onSubmit={(event) => submitForm(event)}
      >
        <DialogTitle>{t('workflow.script.dialog.editInfo.addTitle')}</DialogTitle>

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
            {t('workflow.script.actions.confirm')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

export default memo(
  AddNewWorkflow,
  (prevProps, nextProps) =>
    prevProps.payload === nextProps.payload && prevProps.open === nextProps.open
);

AddNewWorkflow.propTypes = {
  onClose: PropTypes.func,
  payload: PropTypes.object,
  mode: PropTypes.string,
  resetData: PropTypes.func,
  onConfirmSave: PropTypes.func,
  open: PropTypes.bool,
};
