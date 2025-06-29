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
import { useBoolean } from 'src/hooks/use-boolean';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import { useLocales } from 'src/locales';
import { Link } from '@mui/material';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function SwitchTabs({ formData, onClose, applyForm, ...other }) {
  const reviewFormKey = useId();
  const variableModal = useBoolean();
  const { t } = useLocales();

  const ReviewSchema = Yup.object().shape({
    find_by: Yup.string().required(t('validate.required')),
    pattern: Yup.string().when('find_by', {
      is: (value) => value === 'match_pattern',
      otherwise: (schema) => schema,
    }),
    title: Yup.string().when('find_by', {
      is: (value) => value === 'match_title',
      otherwise: (schema) => schema,
    }),
    order_number: Yup.string().when('find_by', {
      is: (value) => value === 'tab_order',
      then: (schema) => schema.required(t('validate.required')),
      otherwise: (schema) => schema,
    }),
  });

  const defaultValues = useMemo(
    () => ({
      find_by: 'match_pattern',
      pattern: '',
      title: '',
      order_number: '',
      is_active: true,
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

  const getVariable = (name, item) => {
    setValue(name, `\${${item.key}}`);
  };

  const onCancel = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const values = watch();

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
      <DialogTitle sx={{ paddingBottom: '10px' }}>
        {formData?.name}
        <Link
          sx={{
            paddingLeft: 1,
          }}
          color="primary"
          target="_blank"
          rel="noopener noreferrer"
          href="https://docs.mktlogin.com/browser/switch-tab.html"
        >
          <Iconify icon="bi:question-circle" color="info" width={18} height={18} />
        </Link>
      </DialogTitle>
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
          <RHFSelect name="find_by" label="Click theo">
            <MenuItem value="match_pattern">Khớp với mẫu</MenuItem>
            <MenuItem value="match_title">Tiêu đề tab</MenuItem>
            <MenuItem value="next_tab">Tab bên phải</MenuItem>
            <MenuItem value="previous_tab">Tab bên trái</MenuItem>
            <MenuItem value="tab_order">Thứ tự tab</MenuItem>
          </RHFSelect>
          {values?.find_by === 'match_pattern' && (
            <RHFTextField
              name="pattern"
              label="Mẫu"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="pattern"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          )}
          {values?.find_by === 'match_title' && (
            <RHFTextField
              name="title"
              label="Tiêu đề"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="title"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          )}
          {values?.find_by === 'tab_order' && (
            <RHFTextField
              name="order_number"
              label="Thứ tự"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="order_number"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
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

SwitchTabs.propTypes = {
  onClose: PropTypes.func,
  formData: PropTypes.object,
  applyForm: PropTypes.func,
};
