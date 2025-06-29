import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useForm } from 'react-hook-form';
import { MenuItem, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import { useLocales } from 'src/locales';
import { useEffect } from 'react';

import FormProvider from '../../../components/hook-form/form-provider';
import { RHFSelect, RHFTextField } from '../../../components/hook-form';
import { isElectron } from '../../../utils/commom';

// ----------------------------------------------------------------------

const SortProfileWindowsDialog = ({ displayScreens, open, onClose }) => {
  const { t } = useLocales();

  const FormSchema = Yup.object().shape({
    num_rows: Yup.string().required(t('validate.required')),
    num_column: Yup.string().required(t('validate.required')),
  });

  const defaultValues = {
    num_rows: '',
    num_column: '',
  };

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
    setValue,
  } = methods;

  useEffect(() => {
    if (displayScreens.length > 0) {
      setValue('monitor', displayScreens[0].id, { shouldDirty: true });
    }
  }, [setValue, displayScreens]);

  const onSubmit = handleSubmit(async (data) => {
    if (
      (data.num_column === '' && data.num_rows === '') ||
      (data.num_column === 0 && data.num_rows === 0)
    ) {
      enqueueSnackbar(t('systemNotify.warning.fillRowColumn'), { variant: 'warning' });
      return;
    }

    if (isElectron()) {
      window.ipcRenderer.send('sort-profile-windows-in-list', data);
    }
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: (theme) => theme.customShadows.z4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>Sắp xếp cửa các sổ hồ sơ</DialogTitle>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ typography: 'body2' }}>
          <Stack direction="row" spacing={3} marginTop={2}>
            <RHFSelect
              label="Màn hình"
              fullWidth
              size="small"
              name="monitor"
              InputLabelProps={{ shrink: true }}
              PaperPropsSx={{ textTransform: 'capitalize' }}
              SelectProps={{
                MenuProps: {
                  autoFocus: false,
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      '&::-webkit-scrollbar': {
                        width: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: (theme) => theme.palette.grey[500],
                        borderRadius: '4px',
                      },
                    },
                  },
                },
              }}
              sx={{
                bgColor: 'red',
              }}
            >
              {displayScreens?.map((item) => {
                if (item.type === 'primary') {
                  return (
                    <MenuItem key={item.id} value={item.id}>
                      {`Primary screen (${item.size.width}x${item.size.height})`}
                    </MenuItem>
                  );
                }
                if (item.type === 'extended') {
                  return (
                    <MenuItem key={item.id} value={item.id}>
                      {`Extended screen (${item.size.width}x${item.size.height})`}
                    </MenuItem>
                  );
                }
                return (
                  <MenuItem key={item.id} value={item.id}>
                    {`Built-in screen (${item.size.width}x${item.size.height})`}
                  </MenuItem>
                );
              })}
            </RHFSelect>
          </Stack>
          <Stack direction="row" spacing={3} marginTop={2}>
            <RHFTextField name="num_rows" type="number" label="Số hàng" />
            <RHFTextField name="num_column" type="number" label="Số cột" />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="inherit" onClick={handleClose}>
            Đóng
          </Button>
          <LoadingButton type="submit" loading={isSubmitting} variant="contained" color="primary">
            Sắp xếp
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default SortProfileWindowsDialog;

SortProfileWindowsDialog.propTypes = {
  displayScreens: PropTypes.array,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
