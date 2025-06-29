import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useId, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

// components
import FormProvider, { RHFSelect } from 'src/components/hook-form';
import { generateLogicScript } from 'src/utils/handle-bar-support';
import { useAuthContext } from 'src/auth/hooks';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function GetURL({ formData, onClose, applyForm, ...other }) {
  const { variableFlow } = useAuthContext();
  const reviewFormKey = useId();
  const { t } = useLocales();

  const ReviewSchema = Yup.object().shape({
    variable_name: Yup.string().required(t('validate.required')),
  });

  const defaultValues = useMemo(() => ({}), []);

  const methods = useForm({
    resolver: yupResolver(ReviewSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onCancel = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const submitForm = handleSubmit(async (data) => {
    try {
      const result = generateLogicScript(formData?.script_template, data);
      applyForm(result);
      reset();
      onClose();
    } catch (error) {
      console.log('error', error);
    }
  });

  console.log('11 variableFlow', variableFlow);

  return (
    <FormProvider keyForm={reviewFormKey} methods={methods} onSubmit={(event) => submitForm(event)}>
      <DialogTitle sx={{ paddingBottom: '10px' }}>{formData?.name}</DialogTitle>
      <Typography
        sx={{
          fontSize: 14,
          fontStyle: 'italic',
        }}
        px={3}
        color="text.secondary"
      >
        {formData?.description}
      </Typography>
      <DialogContent>
        <Stack spacing={2} mt={2}>
          <RHFSelect name="variable_name" label="Biến nhận giá trị">
            {variableFlow.list.map((item) => (
              <MenuItem key={item.id} value={item.key}>
                {item.key}
              </MenuItem>
            ))}
          </RHFSelect>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onCancel}>
          Đóng
        </Button>
        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          Xác nhận
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}

GetURL.propTypes = {
  onClose: PropTypes.func,
  formData: PropTypes.object,
  applyForm: PropTypes.func,
};
