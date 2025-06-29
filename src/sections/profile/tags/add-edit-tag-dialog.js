import PropTypes from 'prop-types';
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import { IconButton, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { ERROR_CODE } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import Iconify from 'src/components/iconify';
import { createTagApi, updateTagApi } from 'src/api/tags.api';
import { useAuthContext } from '../../../auth/hooks';
import { ConfirmDialog } from '../../../components/custom-dialog';

const AddEditTagDialog = ({ data, open, onClose, setTableData, handleReLoadData }) => {
  const { t } = useLocales();
  const [errors, setErrors] = useState('');
  const { workspace_id: workspaceId } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [tagName, setTagName] = useState('');

  useEffect(() => {
    if (data?.id) {
      setTagName(data?.name);
    }
  }, [data]);

  const handleSubmit = async () => {
    if (tagName === '') {
      setErrors(t('dialog.setTag.requiredName'));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: tagName,
      };
      const successMessage = data?.id
        ? t('systemNotify.success.update')
        : t('systemNotify.success.create');
      if (data?.id) {
        const response = await updateTagApi(workspaceId, data.id, payload);
        setTableData((prev) => {
          const index = prev.findIndex((item) => item.id === data.id);
          if (index !== -1) {
            prev[index] = { ...prev[index], ...response.data };
          }
          return [...prev];
        });
        handleReLoadData();
      } else {
        const response = await createTagApi(workspaceId, payload);
        setTableData((prev) => [
          ...prev,
          {
            ...response.data,
            display: true,
          },
        ]);
      }
      enqueueSnackbar(successMessage, { variant: 'success' });
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(
          data?.id
            ? t('systemNotify.warning.notPermission.profile.updateTag')
            : t('systemNotify.warning.notPermission.profile.addTag'),
          { variant: 'error' }
        );
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(false);
      handleClose();
      setTagName('');
    }
  };

  const handleClose = () => {
    setErrors('');
    setTagName('');
    onClose();
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={handleClose}
      title={
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" marginRight="auto">
            {data?.id ? t('dialog.setTag.editTag') : t('dialog.setTag.title')}
          </Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="ic:round-close" />
          </IconButton>
        </Stack>
      }
      closeButtonName={t('dialog.setTag.actions.cancel')}
      content={
        <Stack p={1} spacing={3}>
          <TextField
            label={t('dialog.setTag.tagName')}
            error={!!errors}
            focused={!!errors}
            helperText={errors}
            value={tagName}
            onChange={(event) => {
              setTagName(event.target.value);
              setErrors('');
            }}
          />
        </Stack>
      }
      action={
        <LoadingButton color="primary" variant="contained" loading={loading} onClick={handleSubmit}>
          {data?.id ? t('dialog.setTag.actions.update') : t('dialog.setTag.actions.create')}
        </LoadingButton>
      }
    />
  );
};
export default AddEditTagDialog;

AddEditTagDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
  setTableData: PropTypes.func,
  handleReLoadData: PropTypes.func,
};
