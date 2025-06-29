import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, {
  RHFCheckbox,
  RHFMultiCheckbox,
  RHFTextField,
} from 'src/components/hook-form';
// mui
import { LoadingButton } from '@mui/lab';
// api

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { createWorkgroupApi, updateWorkgroupApi } from 'src/api/workgroup.api';
import { getStorage } from 'src/hooks/use-local-storage';
import { WORKSPACE_ID } from 'src/utils/constance';
import { enqueueSnackbar } from 'notistack';
import { useLocales } from 'src/locales';

const AddEditWorkgroupDialog = ({
  open,
  onClose,
  type,
  permissions,
  handleResetData,
  groupData,
  setCurrentGroup,
}) => {
  const { t } = useLocales();

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('validate.required')),
  });
  const [selectedIndex, setSelectedIndex] = useState('team');
  const workspaceId = getStorage(WORKSPACE_ID);

  const defaultValues = useMemo(
    () => ({
      name: groupData?.name || '',
      description: groupData?.description || '',
      ...(permissions &&
        permissions.reduce((acc, item) => {
          acc[`${item.key}_summary`] = false;
          if (item.options && item.options.length > 0) {
            acc[`${item.key}_options`] = [];
          }
          return acc;
        }, {})),
    }),
    [groupData, permissions]
  );

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const [indeterminate, setIndeterminate] = useState({});

  const handleSummaryChecked = (event) => {
    const mappings = {};

    permissions.forEach((item) => {
      if (item.options.length > 0) {
        mappings[`${item.key}_summary`] = {
          settingName: `${item.key}_options`,
          options: item.options,
        };
      }
    });

    const updateValue = (name, options, isChecked) => {
      setValue(name, isChecked ? options.map((option) => option.value) : []);
    };

    const { target } = event;
    const config = mappings[target.name];

    if (config) {
      updateValue(config.settingName, config.options, target.checked);
    }
  };

  const handleOptionsChecked = (button) => {
    const selectedValues = watch(`${button.key}_options`);
    if (selectedValues.length === 0) {
      setValue(`${button.key}_summary`, false);
    } else {
      setValue(`${button.key}_summary`, true);
      const allOptionValues = button.options.map((option) => option.value);
      setIndeterminate((prev) => ({
        ...prev,
        [button.key]: !allOptionValues.every((optionValue) => selectedValues.includes(optionValue)),
      }));
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { name, description } = data;
      let mergedArray = [];

      Object.keys(data).forEach((key) => {
        if (key.endsWith('_options') && Array.isArray(data[key])) {
          mergedArray = mergedArray.concat(data[key]);
        }
      });

      const payload = {
        name,
        description,
      };
      if (type === 'add') {
        const response = await createWorkgroupApi(workspaceId, {
          ...payload,
          permissions: mergedArray,
        });
        setCurrentGroup(response?.data?.data);
      } else {
        await updateWorkgroupApi(workspaceId, groupData?.id, payload);
      }
      enqueueSnackbar(
        type === 'add' ? t('systemNotify.success.add') : t('systemNotify.success.update'),
        {
          variant: 'success',
        }
      );
      handleResetData(false);
    } catch (error) {
      console.error(error);
      if (error?.error_fields) {
        const arrErrors = Object.values(error?.error_fields);
        if (arrErrors?.length > 0) {
          enqueueSnackbar(arrErrors[0][0], { variant: 'error' });
        }
      } else {
        enqueueSnackbar(t('systemNotify.error.title'), { variant: 'error' });
      }
    } finally {
      reset();
      onClose();
    }
  });

  useEffect(() => {
    if (permissions) {
      reset(defaultValues);
    }
  }, [defaultValues, permissions, reset]);

  const renderPermissionOptions = (
    <Grid
      container
      sx={{
        p: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'primary.dark',
      }}
    >
      <Grid
        item
        xs={4.5}
        sx={{
          height: '200px',
        }}
      >
        <Scrollbar
          sx={{
            height: 1,
            pr: 2,
          }}
        >
          <Stack>
            <List component="nav" aria-label="permission-options">
              {permissions.map((button) => (
                <ListItemButton
                  key={`${button.key}_summary`}
                  selected={selectedIndex === button.key}
                  onClick={() => setSelectedIndex(button.key)}
                  sx={{
                    borderRadius: 1,
                    py: 0,
                    '&.MuiButtonBase-root.MuiListItemButton-root': {
                      pr: 1,
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    width={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <ListItemText
                      sx={{
                        whiteSpace: 'nowrap',
                      }}
                      primary={
                        button.options.length === 0 ? (
                          <RHFCheckbox name={`${button.key}_summary`} label={button.label} />
                        ) : (
                          <Stack direction="row" spacing={0} alignItems="center">
                            <RHFCheckbox
                              name={`${button.key}_summary`}
                              onChange={handleSummaryChecked}
                              indeterminate={
                                watch(`${button.key}_options`)?.length === 0
                                  ? false
                                  : indeterminate[button.key]
                              }
                              sx={{
                                '&.MuiFormControlLabel-root': {
                                  mr: 0,
                                },
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 190,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {button.label}
                            </Typography>
                          </Stack>
                        )
                      }
                    />
                    <Iconify icon="mingcute:right-line" />
                  </Stack>
                </ListItemButton>
              ))}
            </List>
          </Stack>
        </Scrollbar>
      </Grid>
      <Grid
        item
        xs={7.5}
        sx={{
          height: '200px',
        }}
      >
        <Scrollbar
          sx={{
            height: 1,
            px: 2,
          }}
        >
          {permissions.map(
            (button) =>
              button.options.length > 0 &&
              selectedIndex === button.key && (
                <RHFMultiCheckbox
                  key={button.key}
                  onChange={() => handleOptionsChecked(button)}
                  spacing={1}
                  name={`${button.key}_options`}
                  options={button.options}
                />
              )
          )}
        </Scrollbar>
      </Grid>
    </Grid>
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4" marginRight="auto">
              {type === 'add'
                ? t('dialog.userGroup.addEdit.add')
                : t('dialog.userGroup.addEdit.edit')}
            </Typography>
            <IconButton onClick={onClose}>
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
            <EditTab title={t('dialog.userGroup.addEdit.fields.name')}>
              <RHFTextField
                size="small"
                name="name"
                placeholder={t('dialog.userGroup.addEdit.placeholder.name')}
              />
            </EditTab>
            <EditTab title={t('dialog.userGroup.addEdit.fields.note')}>
              <RHFTextField
                name="description"
                multiline
                rows={4}
                placeholder={t('dialog.userGroup.addEdit.placeholder.note')}
              />
            </EditTab>
            <EditTab title={t('dialog.userGroup.addEdit.fields.licensing')}>
              <Stack spacing={2}>
                <Typography>{t('dialog.userGroup.addEdit.placeholder.licensing')}</Typography>
                {type === 'add' && renderPermissionOptions}
                <Stack direction="row" spacing={2} mb={3} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      reset();
                      onClose();
                    }}
                  >
                    {t('dialog.userGroup.actions.cancel')}
                  </Button>
                  <LoadingButton
                    color="primary"
                    size="medium"
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                  >
                    {type === 'add'
                      ? t('dialog.userGroup.actions.create')
                      : t('dialog.userGroup.actions.update')}
                  </LoadingButton>
                </Stack>
              </Stack>
            </EditTab>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditWorkgroupDialog;

AddEditWorkgroupDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleResetData: PropTypes.func,
  setCurrentGroup: PropTypes.func,
  permissions: PropTypes.array,
  groupData: PropTypes.object,
  type: PropTypes.oneOf(['add', 'edit']),
};

//----------------------------------------------------------------

function EditTab({ title, children }) {
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

EditTab.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
};
