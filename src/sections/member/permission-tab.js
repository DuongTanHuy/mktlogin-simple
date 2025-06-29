import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import FormProvider, { RHFCheckbox, RHFMultiCheckbox } from 'src/components/hook-form';
import { Divider, Grid, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import Scrollbar from 'src/components/scrollbar';
import { useAuthContext } from 'src/auth/hooks';
import { updateWorkgroupApi, useGetWorkspacePermissions } from 'src/api/workgroup.api';
import { enqueueSnackbar } from 'notistack';
import { useLocales } from 'src/locales';

//----------------------------------------------------------------

const Permission = ({ permissions, currentGroup, editPermission }) => {
  const { t } = useLocales();
  const { workspace_id } = useAuthContext();
  const { permissions: permissionsActive } = useGetWorkspacePermissions(
    workspace_id,
    currentGroup?.id
  );
  const [indeterminate, setIndeterminate] = useState({});

  const FormSchema = Yup.object().shape({});

  const defaultValues = useMemo(
    () => ({
      ...(permissions &&
        permissions.reduce((accumulator, permission) => {
          if (permissionsActive.length === 0) {
            accumulator[`${permission.key}_options`] = [];
            accumulator[`${permission.key}_summary`] = false;
            return accumulator;
          }

          if (!permission.options || permission.options.length === 0) {
            return accumulator;
          }

          const matchingOptions = permission.options
            .filter((option) => permissionsActive.includes(option.value))
            .map((option) => option.value);

          const allMatched = matchingOptions.length === permission.options.length;
          const noneMatched = matchingOptions.length === 0;

          accumulator[`${permission.key}_options`] = matchingOptions;
          accumulator[`${permission.key}_summary`] = allMatched;

          if (!allMatched && !noneMatched) {
            setIndeterminate((prev) => ({ ...prev, [permission.key]: true }));
          }

          return accumulator;
        }, {})),
    }),
    [permissions, permissionsActive]
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
    formState: { isSubmitting, isDirty },
  } = methods;

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

    setIndeterminate((prev) => ({ ...prev, [target.name.replace('_summary', '')]: false }));

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

  useEffect(() => {
    if (permissions) {
      reset(defaultValues);
    }
  }, [defaultValues, permissions, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      let mergedArray = [];

      Object.keys(data).forEach((key) => {
        if (key.endsWith('_options') && Array.isArray(data[key])) {
          mergedArray = mergedArray.concat(data[key]);
        }
      });
      await updateWorkgroupApi(workspace_id, currentGroup?.id, {
        permissions: mergedArray,
      });
      // setCurrentTab('member');
      // refetchWorkspacePermissions();
      reset({
        ...defaultValues,
        ...data,
      });
      enqueueSnackbar(t('systemNotify.success.update'), {
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(t('systemNotify.error.update'), {
        variant: 'error',
      });
    }
  });

  return (
    <FormProvider
      methods={methods}
      onSubmit={onSubmit}
      sx={{ overflow: 'auto', height: '100%', maxHeight: 'calc(100% - 80px)' }}
    >
      <Scrollbar
        sx={{
          height: 1,
          pr: 2,
        }}
      >
        <Stack
          spacing={3}
          direction="column"
          divider={<Divider orientation="horizontal" flexItem sx={{ borderStyle: 'dashed' }} />}
        >
          {permissions.map((button) => (
            <PermissionTab
              key={button.key}
              title={
                button.options.length === 0 ? (
                  <RHFCheckbox
                    disabled={!editPermission}
                    name={`${button.key}_summary`}
                    label={button.label}
                  />
                ) : (
                  <RHFCheckbox
                    disabled={!editPermission}
                    name={`${button.key}_summary`}
                    label={button.label}
                    onChange={handleSummaryChecked}
                    indeterminate={
                      watch(`${button.key}_options`)?.length === 0
                        ? false
                        : indeterminate[button.key]
                    }
                  />
                )
              }
            >
              {button.options.length > 0 && (
                <RHFMultiCheckbox
                  row
                  disabled={!editPermission}
                  key={button.key}
                  onChange={() => handleOptionsChecked(button)}
                  spacing={3}
                  name={`${button.key}_options`}
                  options={button.options}
                />
              )}
            </PermissionTab>
          ))}
        </Stack>
      </Scrollbar>
      <Stack
        direction="row"
        spacing={3}
        mt={3}
        sx={{
          position: 'absolute',
          bottom: 20,
          zIndex: 10,
        }}
      >
        <LoadingButton
          color="primary"
          size="medium"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={!isDirty || !editPermission}
        >
          {t('member.actions.save')}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
};

export default Permission;

Permission.propTypes = {
  permissions: PropTypes.array,
  currentGroup: PropTypes.object,
  editPermission: PropTypes.bool,
};

//----------------------------------------------------------------

function PermissionTab({ title, children }) {
  return (
    <Grid
      container
      sx={{
        ml: 1,
      }}
    >
      <Grid
        item
        xs={3}
        textAlign="left"
        style={{
          display: 'flex',
          alignItems: 'center',
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

PermissionTab.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
};
