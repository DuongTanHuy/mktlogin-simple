import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useId, useMemo, useState } from 'react';
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
import TextField from '@mui/material/TextField';

import Iconify from 'src/components/iconify';

// components
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { cloneDeep } from 'lodash';
// import { formatErrors } from 'src/utils/format-errors';
import { convertedArray, generateLogicScript } from 'src/utils/handle-bar-support';
import PositionedMenu from 'src/components/list-click';
import { useBoolean } from 'src/hooks/use-boolean';
import Variables from 'src/components/variable';
import { Link, MenuItem } from '@mui/material';
import { METHOD_OPTIONS } from 'src/utils/constance';
import { useLocales } from 'src/locales';

const styleOptions = {
  border: '1px solid #eeeeee24',
  padding: '8px',
  borderRadius: '4px',
  gap: 0,
};

// ----------------------------------------------------------------------

export default function HttpRequestOption({ formData, onClose, applyForm, ...other }) {
  const reviewFormKey = useId();
  const variableModal = useBoolean();
  const { t } = useLocales();

  const ReviewSchema = Yup.object().shape({
    url: Yup.string().required(t('validate.required')),
    method: Yup.string().required(t('validate.required')),
  });

  const defaultValues = useMemo(
    () => ({
      url: '',
      method: '',
    }),
    []
  );

  const [paramsURL, setParamsURL] = useState([]);
  const [requestBody, setRequestBody] = useState([]);
  const [customerHeader, setCustomerHeader] = useState([]);

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

  const onCancel = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const openVariableModal = () => {
    variableModal.onTrue();
  };

  const getVariable = (name, item) => {
    setValue(name, `\${${item.key}}`);
  };

  const getURLParamVariable = (name, value, id) => {
    const _clone = cloneDeep(paramsURL);
    const _find = _clone.findIndex((i) => i.id === id);
    _clone[_find][name] = value;
    setParamsURL(_clone);
  };

  const getRequestVariable = (name, value, id) => {
    const _clone = cloneDeep(requestBody);
    const _find = _clone.findIndex((i) => i.id === id);
    _clone[_find][name] = value;
    setRequestBody(_clone);
  };

  const getCustomerVariable = (name, value, id) => {
    const _clone = cloneDeep(customerHeader);
    const _find = _clone.findIndex((i) => i.id === id);
    _clone[_find][name] = value;
    setCustomerHeader(_clone);
  };

  const submitForm = handleSubmit(async (data) => {
    try {
      const filterAndConvert = (array) => {
        const filtered = array.filter((item) => item.key !== '');
        return filtered.length ? convertedArray(filtered) : null;
      };

      const objectPayload = {
        url: data.url,
        method: data.method,
        params: filterAndConvert(paramsURL),
        data: filterAndConvert(requestBody),
        headers: filterAndConvert(customerHeader),
      };

      const result = generateLogicScript(formData?.script_template, objectPayload);

      applyForm(result);
    } catch (error) {
      console.log('error', error);
    }
    return false;
  });

  // PARAMS
  const addNewParam = () => {
    const _clone = cloneDeep(paramsURL);
    _clone.push({ id: _clone.length + Math.random(), key: '', value: '' });

    setParamsURL(_clone);
  };

  const updateParam = (name, event, id) => {
    const _clone = cloneDeep(paramsURL);
    const _find = _clone.findIndex((i) => i.id === id);
    _clone[_find][name] = event.target.value;
    // setValue(`param_${name}_${id}`, event.target.value);
    // if (event.target.value) {
    //   clearErrors(`param_${name}_${id}`);
    // }
    setParamsURL(_clone);
  };

  const deleteParam = (id) => {
    const _find = paramsURL.findIndex((i) => i.id === id);
    const _clone = cloneDeep(paramsURL);
    _clone.splice(_find, 1);
    setParamsURL(_clone);
  };

  // REQUEST
  const addNewRequest = () => {
    const _clone = cloneDeep(requestBody);
    _clone.push({ id: _clone.length + Math.random(), key: '', value: '' });
    setRequestBody(_clone);
  };

  const updateRequest = (name, event, id) => {
    const _clone = cloneDeep(requestBody);
    const _find = _clone.findIndex((i) => i.id === id);
    _clone[_find][name] = event.target.value;
    setRequestBody(_clone);
  };

  const deleteRequest = (id) => {
    const _find = requestBody.findIndex((i) => i.id === id);
    const _clone = cloneDeep(requestBody);
    _clone.splice(_find, 1);
    setRequestBody(_clone);
  };

  // REQUEST
  const addNewCustomerHeader = () => {
    const _clone = cloneDeep(customerHeader);
    _clone.push({ id: _clone.length + Math.random(), key: '', value: '' });
    setCustomerHeader(_clone);
  };

  const updateCustomerHeader = (name, event, id) => {
    const _clone = cloneDeep(customerHeader);
    const _find = _clone.findIndex((i) => i.id === id);
    _clone[_find][name] = event.target.value;
    setCustomerHeader(_clone);
  };

  const deleteCustomerHeader = (id) => {
    const _find = customerHeader.findIndex((i) => i.id === id);
    const _clone = cloneDeep(customerHeader);
    _clone.splice(_find, 1);
    setCustomerHeader(_clone);
  };

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
          href="https://docs.mktlogin.com/http-request.html"
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
          <RHFTextField
            type="text"
            name="url"
            label="URL"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="url"
                  getVariable={getVariable}
                  openVariableModal={openVariableModal}
                />
              ),
            }}
          />

          <RHFSelect
            fullWidth
            name="method"
            label="Method"
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
          >
            {METHOD_OPTIONS.map((item) => (
              <MenuItem key={item.id} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </RHFSelect>
          <Stack sx={styleOptions} spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">URL Parameter</Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                onClick={() => addNewParam()}
              >
                Thêm
              </Button>
            </Stack>
            <Stack spacing={1} pt={paramsURL.length > 0 ? 2 : 0}>
              {paramsURL.map((item) => (
                <Stack
                  gap={2}
                  key={item.id}
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                >
                  <Stack
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                  >
                    <TextField
                      error={false}
                      label="Key"
                      onChange={(e) => updateParam('key', e, item.id)}
                      size="small"
                    />
                    <TextField
                      error={false}
                      label="Value"
                      value={item.value}
                      onChange={(e) => updateParam('value', e, item.id)}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <PositionedMenu
                            getVariable={(value) => getURLParamVariable('value', value, item.id)}
                            openVariableModal={variableModal.onTrue}
                          />
                        ),
                      }}
                    />
                    <Iconify
                      onClick={() => deleteParam(item.id)}
                      icon="carbon:close-outline"
                      sx={{
                        width: '35px',
                        color: 'text.disabled',
                        '&:hover': { cursor: 'pointer', color: 'white' },
                      }}
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Stack sx={styleOptions} spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">Body</Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                onClick={() => addNewRequest()}
              >
                Thêm
              </Button>
            </Stack>
            <Stack spacing={1} pt={requestBody.length > 0 ? 2 : 0}>
              {requestBody.map((item) => (
                <Stack
                  gap={2}
                  key={item.id}
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                >
                  <Stack
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                  >
                    <TextField
                      error={false}
                      label="Key"
                      onChange={(e) => updateRequest('key', e, item.id)}
                      size="small"
                    />
                    <TextField
                      error={false}
                      label="Value"
                      value={item.value}
                      onChange={(e) => updateRequest('value', e, item.id)}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <PositionedMenu
                            getVariable={(value) => getRequestVariable('value', value, item.id)}
                            openVariableModal={variableModal.onTrue}
                          />
                        ),
                      }}
                    />
                    <Iconify
                      onClick={() => deleteRequest(item.id)}
                      icon="carbon:close-outline"
                      sx={{
                        width: '35px',
                        color: 'text.disabled',
                        '&:hover': { cursor: 'pointer', color: 'white' },
                      }}
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Stack sx={styleOptions} spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">Custom Header</Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                onClick={() => addNewCustomerHeader()}
              >
                Thêm
              </Button>
            </Stack>
            <Stack spacing={1} pt={customerHeader.length > 0 ? 2 : 0}>
              {customerHeader.map((item) => (
                <Stack
                  gap={2}
                  key={item.id}
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                >
                  <Stack
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                  >
                    <TextField
                      error={false}
                      label="Key"
                      onChange={(e) => updateCustomerHeader('key', e, item.id)}
                      size="small"
                    />
                    <TextField
                      error={false}
                      label="Value"
                      value={item.value}
                      onChange={(e) => updateCustomerHeader('value', e, item.id)}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <PositionedMenu
                            getVariable={(value) => getCustomerVariable('value', value, item.id)}
                            openVariableModal={variableModal.onTrue}
                          />
                        ),
                      }}
                    />
                    <Iconify
                      onClick={() => deleteCustomerHeader(item.id)}
                      icon="carbon:close-outline"
                      sx={{
                        width: '35px',
                        color: 'text.disabled',
                        '&:hover': { cursor: 'pointer', color: 'white' },
                      }}
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
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

HttpRequestOption.propTypes = {
  onClose: PropTypes.func,
  formData: PropTypes.object,
  applyForm: PropTypes.func,
};
