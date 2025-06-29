/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Fragment, useCallback, useEffect, useId, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Editor from '@monaco-editor/react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

// components
import FormProvider, {
  RHFAutocomplete,
  RHFCheckbox,
  RHFSelect,
  RHFTextField,
} from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { getListAppAccountApi, refreshTokenAppAccountApi } from 'src/api/app-account.api';
import { generateLogicScript } from 'src/utils/handle-bar-support';
import { isElectron } from 'src/utils/commom';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { useBoolean } from 'src/hooks/use-boolean';
import Variables from 'src/components/variable';
import PositionedMenu from 'src/components/list-click';
import { setStorage } from 'src/hooks/use-local-storage';
import { useLocales } from 'src/locales';
import { readGoogleSheet } from '../../../api/google-sheet.api';
import { useAuthContext } from '../../../auth/hooks';

// ----------------------------------------------------------------------
const CONFIG_EDITER = {
  fontSize: 12,
  readOnly: true,
  minimap: { enabled: false },
};
export default function SpeadSheet({ formData, onClose, applyForm, ...other }) {
  const { t } = useLocales();
  const { copy } = useCopyToClipboard();
  const [displayCopyTooltip, setDisplayCopyTooltip] = useState(false);
  const { variableFlow } = useAuthContext();
  const reviewFormKey = useId();
  const [jsonData, setJsonData] = useState(null);
  const [toggleReview, setToggleReview] = useState(false);
  const [appAccounts, setAppAccounts] = useState([]);
  const [isReviewBtnLoading, setReviewBtnLoading] = useState(false);
  const variableModal = useBoolean();

  const openVariableModal = () => {
    variableModal.onTrue();
  };

  const ReviewSchema = Yup.object().shape({
    spreadsheet_type: Yup.string().required(t('validate.required')),

    // google sheet credentials
    email_share: Yup.string().when('spreadsheet_type', {
      is: (value) => value === 'google_sheet_credentials_json',
      then: (schema) => schema.required(t('validate.required')),
      otherwise: (schema) => schema,
    }),
    credentials_json: Yup.string().when('spreadsheet_type', {
      is: (value) => value === 'google_sheet_credentials_json',
      then: (schema) => schema.required(t('validate.required')),
      otherwise: (schema) => schema,
    }),

    // google sheet field
    api_key: Yup.string().when('spreadsheet_type', {
      is: (value) => value === 'google_sheet',
      then: (schema) => schema.required(t('validate.required')),
      otherwise: (schema) => schema,
    }),
    sheet_id: Yup.string().when('spreadsheet_type', {
      is: (value) => value === 'google_sheet',
      then: (schema) => schema.required(t('validate.required')),
      otherwise: (schema) => schema,
    }),

    // excel
    action_type: Yup.string().required(t('validate.required')),
    file_path: Yup.string().when('spreadsheet_type', {
      is: (value) => value === 'excel',
      then: (schema) => schema.required(t('validate.required')),
      otherwise: (schema) => schema,
    }),
    range: Yup.string(),
    sheet_name: Yup.string(),
    variable_name: Yup.object().required(t('validate.required')),
    is_choose_first_rows_as_key: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      spreadsheet_type: 'excel',
      api_key: '',
      action_type: 'read',
      file_path: '',
      credentials_json: '',
      email_share: '',
      range: '',
      sheet_name: '',
      variable_name: '',
      sheet_id: '',
      is_choose_first_rows_as_key: true,
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(ReviewSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (values.spreadsheet_type === 'google_sheet') {
      setJsonData(null);
      setToggleReview(false);
      getAppAccounts();
    }
  }, [values.spreadsheet_type]);

  const getAppAccounts = async () => {
    const result = await getListAppAccountApi();
    setAppAccounts(result?.data?.data || []);
  };

  const onCancel = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const submitForm = handleSubmit(async (data) => {
    try {
      const objectPayload = {
        spreadsheet_type: data.spreadsheet_type,
        action_type: data.action_type,
        range: data.range,
        sheet_name: data.sheet_name,
        variable_name: data?.variable_name?.key,
        is_choose_first_rows_as_key: data.is_choose_first_rows_as_key,
      };
      if (data.spreadsheet_type === 'excel') {
        objectPayload.file_path = data.file_path;
      }
      if (data.spreadsheet_type === 'google_sheet') {
        objectPayload.access_token = data.api_key;
        objectPayload.sheet_id = data.sheet_id;
      }
      if (data.spreadsheet_type === 'google_sheet_credentials_json') {
        objectPayload.sheet_id = data.sheet_id;
        objectPayload.credentials_json = data.credentials_json.replace(/\\/g, '/');
      }
      const result = generateLogicScript(formData?.script_template, objectPayload);
      applyForm(result);
    } catch (error) {
      console.log('error', error);
    }
  });

  const selectGoogleCreden = async (event) => {
    const file = event.target.files[0];
    setValue('credentials_json', isElectron() ? file?.path : file?.name);
    const credentialJson = await window.ipcRenderer.invoke('read-file-json', file?.path);
    setValue('email_share', credentialJson.client_email);
  };

  const selectFileCSV = (event) => {
    const file = event.target.files[0];

    setValue('file_path', isElectron() ? file?.path : file?.name);
  };

  function getParameterValue(inputString, data) {
    if (!inputString.includes('${')) return inputString;
    return inputString.replace(/\$\{(\w+)\}/g, (match, key) => {
      const found = data.find((item) => item.key === key);
      return found ? found.value : match;
    });
  }

  const handleReviewSheetData = async () => {
    setReviewBtnLoading(true);
    let sheetData = null;
    if (values?.spreadsheet_type === 'excel') {
      if (isElectron()) {
        sheetData = await window.ipcRenderer.invoke('review-excel', {
          pathExcel: values.file_path,
          options: {
            sheet_name: values.sheet_name,
            range: values.range,
            is_choose_first_rows_as_key: values.is_choose_first_rows_as_key,
          },
        });
      }
    } else if (values?.spreadsheet_type === 'google_sheet') {
      try {
        sheetData = await readGoogleSheet(values.sheet_id, values.api_key, {
          sheet_name: values.sheet_name,
          range: values.range,
          is_choose_first_rows_as_key: values.is_choose_first_rows_as_key,
        });
      } catch (error) {
        if (error?.response?.status === 401) {
          const appAccount = appAccounts.find((item) => item.access_token === values.api_key);
          const response = await refreshTokenAppAccountApi(appAccount.id);
          const { access_token } = response?.data || {};
          sheetData = await readGoogleSheet(values.sheet_id, access_token, {
            sheet_name: values.sheet_name,
            range: values.range,
            is_choose_first_rows_as_key: values.is_choose_first_rows_as_key,
          });
        }
      }
    } else if (values?.spreadsheet_type === 'google_sheet_credentials_json') {
      if (isElectron()) {
        const globalData = variableFlow?.list.map((item) => ({
          key: item.key,
          value: item.value,
        }));
        const path_credentials_json = getParameterValue(values.credentials_json, globalData);
        const sheet_id = getParameterValue(values.sheet_id, globalData);
        const sheet_name = getParameterValue(values.sheet_name, globalData);
        const range = getParameterValue(values.range, globalData);
        sheetData = await window.ipcRenderer.invoke('review-google-sheet', {
          path_credentials_json,
          sheet_id,
          options: {
            sheet_name,
            range,
            is_choose_first_rows_as_key: values.is_choose_first_rows_as_key,
          },
        });
      }
      setToggleReview(true);
    }
    setJsonData(sheetData);
    setToggleReview(true);
    setReviewBtnLoading(false);
  };

  const showContent = useMemo(() => {
    let content = '';
    let item = 0;
    if (jsonData) {
      item = jsonData.length;
      content = `${JSON.stringify(jsonData, null, 2)}`;
    }

    return { item, content };
  }, [jsonData]);

  const getVariable = async (name, item) => {
    const { sheet_id, range, sheet_name } = values;
    let newText = '';
    if (name === 'sheet_id') {
      newText = sheet_id.concat(`${`\${${item.key}}`}`);
    } else if (name === 'range') {
      newText = range.concat(`${`\${${item.key}}`}`);
    } else if (name === 'sheet_name') {
      newText = sheet_name.concat(`${`\${${item.key}}`}`);
    } else if (name === 'credentials_json') {
      newText = `\${${item.key}}`;
      if (isElectron()) {
        const credentialJson = await window.ipcRenderer.invoke('read-file-json', item.value);
        setValue('email_share', credentialJson.client_email);
      }
    }
    setValue(name, newText);
  };

  const referLink = (link) => {
    if (isElectron()) {
      window.ipcRenderer.send('open-external', link);
    } else {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const fetchVariables = useMemo(() => {
    if (variableFlow?.list === null || variableFlow?.list?.length === 0) return [];

    return variableFlow?.list.map((i, index) => ({
      ...i,
      lastItem: index + 1 === variableFlow.list.length,
    }));
  }, [variableFlow?.list]);

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
          <RHFSelect name="spreadsheet_type" label="Loại bảng tính">
            <MenuItem value="excel">Tệp excel</MenuItem>
            <MenuItem value="google_sheet">Google Sheets</MenuItem>
            <MenuItem value="google_sheet_credentials_json">
              Google Sheets (Credentials Json)
            </MenuItem>
          </RHFSelect>

          {/* google_sheet_credentials_json */}
          {values?.spreadsheet_type === 'google_sheet_credentials_json' && (
            <Stack>
              <Typography variant="caption" display="block" gutterBottom color="#919EAB">
                Hãy copy email dưới và share tài liệu của bạn cho email đã copy.
              </Typography>
              <RHFTextField
                type="text"
                name="email_share"
                label="Share to email"
                readOnly
                InputProps={{
                  endAdornment: (
                    <Tooltip
                      onClose={() => setDisplayCopyTooltip(false)}
                      open={displayCopyTooltip}
                      title="Copied"
                      placement="top"
                    >
                      <IconButton
                        onClick={() => {
                          setDisplayCopyTooltip(true);
                          copy('example@gmail.com');
                        }}
                        sx={{
                          marginLeft: 1,
                        }}
                      >
                        <Iconify icon="solar:copy-bold-duotone" />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
            </Stack>
          )}
          {values?.spreadsheet_type === 'google_sheet_credentials_json' && (
            <Stack>
              <Typography variant="caption" display="block" gutterBottom color="#919EAB">
                Thay đổi xác thực api google riêng của bạn. Tham khảo tại{' '}
                <span
                  style={{ color: '#00aaff', cursor: 'pointer' }}
                  onClick={() => referLink('https://youtube.com')}
                >
                  hướng dẫn này!
                </span>
              </Typography>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <RHFTextField
                  type="text"
                  name="credentials_json"
                  readOnly
                  label="Credentials Json"
                  InputProps={{
                    endAdornment: (
                      <PositionedMenu
                        name="credentials_json"
                        getVariable={getVariable}
                        openVariableModal={openVariableModal}
                      />
                    ),
                  }}
                />
                <Button variant="outlined" component="label" sx={{ maxHeight: '52px' }}>
                  <Iconify icon="tabler:upload" width={20} />
                  <input
                    type="file"
                    accept=".json"
                    hidden
                    onChange={(event) => selectGoogleCreden(event)}
                  />
                </Button>
              </Stack>
            </Stack>
          )}
          {values?.spreadsheet_type === 'google_sheet' && (
            <RHFSelect name="api_key" label="Chọn tài khoản">
              {appAccounts.map((item) => (
                <MenuItem
                  key={item.id}
                  value={item.access_token}
                  sx={{ textTransform: 'lowercase' }}
                >
                  {item.email}
                </MenuItem>
              ))}
            </RHFSelect>
          )}
          <RHFSelect name="action_type" label="Hành động">
            <MenuItem value="read">Đọc</MenuItem>
            <MenuItem value="write">Ghi</MenuItem>
            <MenuItem value="clear">Xóa giá trị ô</MenuItem>
          </RHFSelect>
          {(values?.spreadsheet_type === 'google_sheet' ||
            values?.spreadsheet_type === 'google_sheet_credentials_json') && (
            <RHFTextField
              type="text"
              name="sheet_id"
              label="ID Bảng tính"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="sheet_id"
                    getVariable={getVariable}
                    openVariableModal={openVariableModal}
                  />
                ),
              }}
            />
          )}
          {values?.spreadsheet_type === 'excel' && (
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <RHFTextField
                type="text"
                name="file_path"
                readOnly
                label="File path"
                // value={fileSelect?.name}
              />
              <Button variant="outlined" component="label" sx={{ maxHeight: '52px' }}>
                <Iconify icon="tabler:upload" width={20} />
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  hidden
                  onChange={(event) => selectFileCSV(event)}
                />
              </Button>
            </Stack>
          )}
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <RHFTextField
              type="text"
              name="range"
              label="Range"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="range"
                    getVariable={getVariable}
                    openVariableModal={openVariableModal}
                  />
                ),
              }}
            />
            <RHFTextField
              type="text"
              name="sheet_name"
              label="Tên bảng tính (Tùy chọn)"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="sheet_name"
                    getVariable={getVariable}
                    openVariableModal={openVariableModal}
                  />
                ),
              }}
            />
          </Stack>
          <RHFCheckbox name="is_choose_first_rows_as_key" label="Chọn hàng đầu tiên làm khóa" />
          <RHFAutocomplete
            name="variable_name"
            disablePortal
            id="combo-box-demo"
            getOptionLabel={(option) => option.key || ''}
            options={fetchVariables || []}
            isOptionEqualToValue={(option, value) => option.key === value.key}
            placeholder="Biến nhận dữ liệu"
            renderOption={(props, option) => (
              <Fragment key={option.id}>
                <Stack component="li" {...props} direction="row" justifyContent="flex-start">
                  {option.key}
                </Stack>
                <Stack className="add-new-element-variable">
                  <Button
                    variant="outlined"
                    size="small"
                    width="100px"
                    onClick={() => {
                      openVariableModal();
                      setStorage('input_focusing_current_form', 'variable_name');
                    }}
                    startIcon={<Iconify icon="ion:create-outline" />}
                  >
                    Tạo biến mới
                  </Button>
                </Stack>
              </Fragment>
            )}
            noOptionsText={
              <Stack spacing={1}>
                <Typography variant="body2">No options</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  width="100px"
                  onClick={() => {
                    openVariableModal();
                    setStorage('input_focusing_current_form', 'variable_name');
                  }}
                  startIcon={<Iconify icon="ion:create-outline" />}
                >
                  Tạo biến mới
                </Button>
              </Stack>
            }
          />
          <Stack direction="row" justifyContent="flex-start" spacing={2} alignItems="center">
            <LoadingButton
              variant="outlined"
              component="label"
              size="small"
              sx={{ maxWidth: '100px' }}
              color="primary"
              loading={isReviewBtnLoading}
              onClick={() => handleReviewSheetData()}
            >
              review
            </LoadingButton>
            <Typography variant="body2">{showContent?.item} items</Typography>
          </Stack>
          {toggleReview && (
            <Stack>
              <Editor
                minHeight="200px"
                maxHeight="500px"
                height="300px"
                language="javascript"
                theme="vs-dark"
                value={showContent?.content}
                options={CONFIG_EDITER}
              />
            </Stack>
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

SpeadSheet.propTypes = {
  onClose: PropTypes.func,
  formData: PropTypes.object,
  applyForm: PropTypes.func,
};
