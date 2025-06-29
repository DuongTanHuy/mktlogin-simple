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

// components
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { generateLogicScript } from 'src/utils/handle-bar-support';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import PositionedMenu from 'src/components/list-click';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function TypingText({ formData, onClose, applyForm, ...other }) {
  const reviewFormKey = useId();
  const variableModal = useBoolean();
  const { t } = useLocales();

  const ReviewSchema = Yup.object().shape({
    xpath: Yup.string(),
    text: Yup.string().required(t('validate.required')),
    speed: Yup.string().required(t('validate.required')),
  });

  const defaultValues = useMemo(
    () => ({
      xpath: '',
      text: '',
      speed: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(ReviewSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = methods;

  const getVariable = (name, item) => {
    setValue(name, `\${${item.key}}`);
  };

  const onCancel = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const submitForm = handleSubmit(async (data) => {
    try {
      const result = generateLogicScript(formData?.script_template, data);
      applyForm(result);
    } catch (error) {
      console.log('error', error);
    }
  });

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
          <RHFTextField
            name="xpath"
            label="Bộ chọn phần tử (xpath)"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="xpath"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        </Stack>
        <Stack spacing={2} mt={2}>
          <RHFTextField
            name="text"
            label="Text"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="text"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        </Stack>
        <Stack spacing={2} mt={2}>
          <RHFTextField
            name="speed"
            label="Khoảng cách giữa các lần gõ (mili giây)"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="speed"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        </Stack>
        <Variables open={variableModal.value} onClose={variableModal.onFalse} />
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

TypingText.propTypes = {
  onClose: PropTypes.func,
  formData: PropTypes.object,
  applyForm: PropTypes.func,
};
