import PropTypes from 'prop-types';
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import { Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { createGroupProfileApi, updateGroupProfileApi } from '../../../api/profile-group.api';
import { useAuthContext } from '../../../auth/hooks';
import { ConfirmDialog } from '../../../components/custom-dialog';

const AddEditProfileGroupDialog = ({ data, open, closeDialog, refreshProfileGroupList }) => {
  const { t } = useLocales();
  const [errors, setErrors] = useState({ name: '' });
  const { workspace_id: workspaceId } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (data?.id) {
      setGroupName(data?.name);
    }
  }, [data]);

  const handleSubmit = async () => {
    if (groupName === '') {
      setErrors((prev) => ({
        ...prev,
        name: t('validate.enterGroupName'),
      }));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: groupName,
        color_code: '#ccc',
      };
      const successMessage = data?.id
        ? t('systemNotify.success.update')
        : t('systemNotify.success.create');
      if (data?.id) {
        await updateGroupProfileApi(workspaceId, data.id, payload);
      } else {
        await createGroupProfileApi(workspaceId, payload);
      }
      refreshProfileGroupList();
      enqueueSnackbar(successMessage, { variant: 'success' });
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(
          data?.id
            ? t('systemNotify.warning.notPermission.group.update')
            : t('systemNotify.warning.notPermission.group.create'),
          { variant: 'error' }
        );
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(false);
      closeDialog();
      setGroupName('');
    }
  };

  const handleClose = () => {
    setErrors((prev) => ({
      ...prev,
      name: '',
    }));
    setGroupName('');
    closeDialog();
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={handleClose}
      title={
        data?.id
          ? t('dialog.profileGroup.addEdit.title.edit')
          : t('dialog.profileGroup.addEdit.title.create')
      }
      closeButtonName={t('dialog.profileGroup.actions.close')}
      content={
        <Stack pt={1}>
          <TextField
            label={t('dialog.profileGroup.addEdit.fields.name')}
            required
            error={!!errors?.name}
            focused={!!errors?.name}
            helperText={errors?.name}
            defaultValue={data?.name}
            onChange={(event) => {
              setGroupName(event.target.value);
              setErrors((prev) => ({
                ...prev,
                name: '',
              }));
            }}
          />
        </Stack>
      }
      action={
        <LoadingButton color="primary" variant="contained" loading={loading} onClick={handleSubmit}>
          {data?.id
            ? t('dialog.profileGroup.actions.update')
            : t('dialog.profileGroup.actions.create')}
        </LoadingButton>
      }
    />
  );
};
export default AddEditProfileGroupDialog;

AddEditProfileGroupDialog.propTypes = {
  open: PropTypes.bool,
  closeDialog: PropTypes.func,
  data: PropTypes.object,
  refreshProfileGroupList: PropTypes.func,
};
