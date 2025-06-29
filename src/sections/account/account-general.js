import * as Yup from 'yup';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// assets
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import { Divider } from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';
import { updateUserInfoApi } from 'src/api/user.api';
import { USER_INFORMATION } from 'src/utils/constance';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useLocales();

  const { user, initialize } = useAuthContext();

  const UpdateUserSchema = Yup.object().shape({
    username: Yup.string().required(t('validate.required')),
    email: Yup.string().required(t('validate.required')).email(t('validate.email')),
    photoURL: Yup.mixed().nullable().required(t('validate.required')),
    firstName: Yup.string().required(t('validate.required')),
    lastName: Yup.string().required(t('validate.required')),
  });

  const defaultValues = {
    username: user?.username || '',
    email: user?.email || '',
    photoURL: '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
  };

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { firstName, lastName } = data;
      const payload = {
        first_name: firstName,
        last_name: lastName,
      };
      await updateUserInfoApi(payload);

      const userInfo = {
        ...JSON.parse(getStorage(USER_INFORMATION)),
        ...payload,
      };
      setStorage(USER_INFORMATION, JSON.stringify(userInfo));
      initialize();
      enqueueSnackbar(t('systemNotify.success.update'));
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photoURL', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 3, pb: 5, px: 3, textAlign: 'center', height: 1 }}>
            <Stack spacing={1} mb={2}>
              <Typography variant="h6">{t('accSetting.tabs.general.avatar')}</Typography>
              <Divider />
            </Stack>
            <RHFUploadAvatar
              name="photoURL"
              maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  {t('accSetting.tabs.general.subheader')}
                </Typography>
              }
            />
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3, height: 1 }}>
            <Stack spacing={1} mb={6}>
              <Typography variant="h6">{t('accSetting.tabs.general.accInfo')}</Typography>
              <Divider />
            </Stack>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField
                name="username"
                label={t('accSetting.tabs.general.labels.name')}
                disabled
              />
              <RHFTextField
                name="email"
                label={t('accSetting.tabs.general.labels.email')}
                disabled
              />
              <RHFTextField name="lastName" label={t('accSetting.tabs.general.labels.lastName')} />
              <RHFTextField
                name="firstName"
                label={t('accSetting.tabs.general.labels.firstName')}
              />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {t('accSetting.tabs.general.actions.save')}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
