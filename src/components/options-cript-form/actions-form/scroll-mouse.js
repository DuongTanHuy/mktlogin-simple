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
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { generateLogicScript } from 'src/utils/handle-bar-support';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import PositionedMenu from 'src/components/list-click';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function ScrollMouse({ formData, onClose, applyForm, ...other }) {
  const reviewFormKey = useId();
  const variableModal = useBoolean();
  const { t } = useLocales();

  const ReviewSchema = Yup.object().shape({
    scroll_type: Yup.string().required(t('validate.required')),
    direction: Yup.string().required(t('validate.required')),
    element_selector: Yup.string().when('scroll_type', {
      is: (value) => value === 'xpath',
      then: (schema) => schema.required(t('validate.required')),
      otherwise: (schema) => schema,
    }),
    x_coordinates: Yup.string().when('scroll_type', {
      is: (value) => value === 'coordinates',
      then: (schema) => schema.required(t('validate.required')),
      otherwise: (schema) => schema,
    }),
    y_coordinates: Yup.string().when('scroll_type', {
      is: (value) => value === 'coordinates',
      then: (schema) => schema.required(t('validate.required')),
      otherwise: (schema) => schema,
    }),
  });

  const defaultValues = useMemo(
    () => ({
      scroll_type: 'coordinates',
      direction: 'down',
      x_coordinates: '',
      y_coordinates: '',
      element_selector: '',
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
    watch,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

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
          <RHFSelect name="scroll_type" label="Cuộn chuột theo">
            <MenuItem value="coordinates">Tọa độ</MenuItem>
            <MenuItem value="xpath">XPath</MenuItem>
          </RHFSelect>
          {values.scroll_type === 'xpath' && (
            <Stack>
              <RHFTextField
                name="element_selector"
                label="Bộ chọn phần tử"
                size="small"
                InputProps={{
                  endAdornment: (
                    <PositionedMenu
                      name="element_selector"
                      getVariable={getVariable}
                      openVariableModal={variableModal.onTrue}
                    />
                  ),
                }}
              />
            </Stack>
          )}
          {values.scroll_type === 'coordinates' && (
            <>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <RHFSelect name="direction" label="Hướng cuộn">
                  <MenuItem value="down">Cuộn xuống</MenuItem>
                  <MenuItem value="up">Cuộn lên</MenuItem>
                </RHFSelect>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <RHFTextField
                  name="x_coordinates"
                  label="Tọa độ X"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <PositionedMenu
                        name="x_coordinates"
                        getVariable={getVariable}
                        openVariableModal={variableModal.onTrue}
                      />
                    ),
                  }}
                />
                <RHFTextField
                  name="y_coordinates"
                  label="Tọa độ Y"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <PositionedMenu
                        name="y_coordinates"
                        getVariable={getVariable}
                        openVariableModal={variableModal.onTrue}
                      />
                    ),
                  }}
                />
              </Stack>
            </>
          )}
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

ScrollMouse.propTypes = {
  onClose: PropTypes.func,
  formData: PropTypes.object,
  applyForm: PropTypes.func,
};
