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
import Alert from '@mui/material/Alert';

// components
import FormProvider, { RHFAutocomplete } from 'src/components/hook-form';
// import { createWorkspace } from 'src/api/workspace.api';
// import { formatErrors } from 'src/utils/format-errors';
import { getListProfileApi } from 'src/api/profile.api';
import { getStorage } from 'src/hooks/use-local-storage';
import { WORKSPACE_ID } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { objectToQueryString } from 'src/utils/commom';
import { removeVietnameseTones } from 'src/utils/format-string';

// ----------------------------------------------------------------------

function RunningAutomation({ onClose, handleSubmitForm, open }) {
  const workspaceId = getStorage(WORKSPACE_ID);
  const [errorMsg] = useState('');
  const [profiles, setProfiles] = useState([]);
  const { t } = useLocales();

  const reviewFormKey = useId();

  const ReviewSchema = Yup.object().shape({});

  const defaultValues = useMemo(
    () => ({
      profile: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(ReviewSchema),
    defaultValues,
  });

  useEffect(() => {
    const getProfile = async () => {
      try {
        const params = {
          fields: 'id,name,duration,browser_type',
          page_size: 1000,
          page_num: 1,
        };

        const queryString = objectToQueryString(params);

        const response = await getListProfileApi(workspaceId, queryString);
        setProfiles(response?.data?.data);
      } catch (error) {
        /* empty */
      }
    };

    if (open && profiles.length === 0) {
      getProfile();
    }
  }, [open, profiles.length, workspaceId]);

  const {
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
    if (!data.profile?.id) {
      setError('profile', {
        type: 'manual',
        message: t('validate.profile.run'),
      });
      return;
    }
    await handleSubmitForm({
      profile: data.profile.id,
    });
  });

  return (
    <Dialog fullWidth maxWidth="xs" onClose={onCancel} open={open}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <FormProvider
        keyForm={reviewFormKey}
        methods={methods}
        onSubmit={(event) => submitForm(event)}
      >
        <DialogTitle>{t('workflow.script.dialog.run.title')}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={2}>
            <RHFAutocomplete
              name="profile"
              label={t('workflow.script.dialog.run.label')}
              placeholder={t('workflow.script.dialog.run.placeholder')}
              options={[{ id: '', name: '' }, ...profiles.filter(({ duration }) => duration >= 0)]}
              getOptionLabel={({ name }) => name ?? ''}
              isOptionEqualToValue={(option, value) => {
                const optionId = String(option.id);
                const valueId = value?.id ? String(value.id) : String(value);
                return optionId === valueId;
              }}
              renderOption={(props, { id, name }) => (
                <li
                  {...props}
                  key={id}
                  value={id}
                  style={{ display: id === '' ? 'none' : 'block' }}
                >
                  {name}
                </li>
              )}
              filterOptions={(options, { inputValue }) => {
                const normalizedInput = removeVietnameseTones(inputValue).toLowerCase();
                return options.filter(({ id, name }) => {
                  const normalizedName = removeVietnameseTones(name).toLowerCase();
                  return (
                    normalizedName.includes(normalizedInput) ||
                    String(id).includes(String(inputValue))
                  );
                });
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onCancel}>
            {t('workflow.script.actions.close')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {t('workflow.script.actions.confirm')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

const areEqual = (prevProps, nextProps) => prevProps.open === nextProps.open;

export default memo(RunningAutomation, areEqual);

RunningAutomation.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleSubmitForm: PropTypes.func,
};
