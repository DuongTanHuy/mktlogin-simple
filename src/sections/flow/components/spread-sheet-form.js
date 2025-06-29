import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import eventBus from 'src/sections/script/event-bus';
import Iconify from 'src/components/iconify';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { convertCSVToJson } from 'src/utils/format-file';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import PositionedMenu from 'src/components/list-click';
import { isElectron } from 'src/utils/commom';
import { useBoolean } from 'src/hooks/use-boolean';
import Variables from 'src/components/variable';
import { useAuthContext } from 'src/auth/hooks';
import { Autocomplete, FormControlLabel, alpha } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { cloneDeep } from 'lodash';

// ----------------------------------------------------------------------
const CONFIG_EDITER = {
  fontSize: 12,
  readOnly: true,
  minimap: { enabled: false },
};

export default function SpreadSheetForm({ formData, IdNode }) {
  const { dataFields } = formData;
  const { copy } = useCopyToClipboard();
  const { variableFlow } = useAuthContext();

  const [currentFile, setCurrentFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [toggleReview, setToggleReview] = useState(false);
  const [isReviewBtnLoading, setReviewBtnLoading] = useState(false);

  const [displayCopyTooltip, setDisplayCopyTooltip] = useState(false);

  const variableModal = useBoolean();
  const dataVariableModal = useBoolean();
  const nameVariableModal = useBoolean();
  const openVariableModal = () => {
    variableModal.onTrue();
  };

  const selectFileCSV = (event) => {
    const file = event.target.files[0];
    // setValue('file_path', file?.name);
    // eventBus.emit('updateNode', { data: { file_path: file?.name }, idNode: IdNode });
    eventBus.emit('updateNode', {
      data: {
        file_path: (isElectron() ? file?.path || '' : file?.name || '').replace(/\\/g, '/'),
      },
      idNode: IdNode,
    });
    setCurrentFile(file);
  };

  const handleCSVInputChange = (file, isFirstRow) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const csvData = e.target.result;
      const _jsonData = convertCSVToJson(csvData, isFirstRow);
      setJsonData(_jsonData);
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    if (currentFile) {
      handleCSVInputChange(currentFile, dataFields?.is_choose_first_rows_as_key);
    }
  }, [currentFile, dataFields?.is_choose_first_rows_as_key]);

  const showContent = useMemo(() => {
    let content = '';
    let item = 0;
    if (jsonData) {
      item = jsonData.length;
      content = `${JSON.stringify(jsonData, null, 2)}`;
    }

    return { item, content };
  }, [jsonData]);

  const handleChangeNumberSecond = (event) => {
    const { name, value, type, checked } = event.target;
    eventBus.emit('updateNode', {
      data: { [name]: type === 'checkbox' ? checked : value },
      idNode: IdNode,
    });
  };

  const referLink = (link) => {
    if (isElectron()) {
      window.ipcRenderer.send('open-external', link);
    } else {
      window.open(link, '_blank', 'noopener noreferrer');
    }
  };

  const selectGoogleCreden = async (event) => {
    if (isElectron()) {
      const file = event.target.files[0];
      eventBus.emit('updateNode', {
        data: {
          credentials_json: (isElectron() ? file?.path || '' : file?.name || '').replace(
            /\\/g,
            '/'
          ),
        },
        idNode: IdNode,
      });
      const credentialJson = await window.ipcRenderer.invoke('read-file-json', file?.path);
      eventBus.emit('updateNode', {
        data: { email_share: credentialJson.client_email },
        idNode: IdNode,
      });
    }
  };

  const getVariable = async (name, item) => {
    const { sheet_id, range, sheet_name } = dataFields;
    let newText = '';
    if (name === 'sheet_id') {
      newText = sheet_id.concat(`${`\${${item.key}}`}`);
    } else if (name === 'range') {
      newText = range.concat(`${`\${${item.key}}`}`);
    } else if (name === 'sheet_name') {
      newText = sheet_name.concat(`${`\${${item.key}}`}`);
    } else if (name === 'file_path') {
      newText = `${`\${${item.key}}`}`;
    } else if (name === 'credentials_json') {
      newText = `\${${item.key}}`;
      if (isElectron()) {
        const credentialJson = await window.ipcRenderer.invoke('read-file-json', item.value);
        eventBus.emit('updateNode', {
          data: { email_share: credentialJson.client_email },
          idNode: IdNode,
        });
      }
    } else {
      newText = `${`\${${item.key}}`}`;
    }
    eventBus.emit('updateNode', { data: { [name]: newText }, idNode: IdNode });
  };

  const fetchVariables = useMemo(() => {
    if (variableFlow?.list === null || variableFlow?.list?.length === 0) return [];

    return variableFlow?.list.map((i, index) => ({
      ...i,
      lastItem: index + 1 === variableFlow.list.length,
    }));
  }, [variableFlow?.list]);

  function getParameterValue(inputString, data) {
    if (!inputString.includes('${')) return inputString;
    return inputString.replace(/\$\{(\w+)\}/g, (match, key) => {
      const found = data.find((item) => item.key === key);
      return found ? found.value : match;
    });
  }

  const addNewDataUpdate = () => {
    const _clone = cloneDeep(dataFields.data_update);
    _clone.push({ id: _clone.length + Math.random(), key: '', value: '' });

    eventBus.emit('updateNode', { data: { data_update: _clone }, idNode: IdNode });
  };

  const editDataUpdate = (name, event, id) => {
    const _clone = cloneDeep(dataFields.data_update);
    const _find = _clone.findIndex((i) => i.id === id);
    _clone[_find][name] = event.target.value;

    eventBus.emit('updateNode', { data: { data_update: _clone }, idNode: IdNode });
  };

  const deleteDataUpdate = (id) => {
    const _find = dataFields.data_update.findIndex((i) => i.id === id);
    const _clone = cloneDeep(dataFields.data_update);
    _clone.splice(_find, 1);

    eventBus.emit('updateNode', { data: { data_update: _clone }, idNode: IdNode });
  };

  const getDataUpdateVariable = (name, value, id) => {
    if (value) {
      const _clone = cloneDeep(dataFields.data_update);
      const _find = _clone.findIndex((i) => i.id === id);
      _clone[_find][name] = value;

      eventBus.emit('updateNode', { data: { data_update: _clone }, idNode: IdNode });
    }
  };

  const handleReviewSheetData = async () => {
    setReviewBtnLoading(true);
    let sheetData = null;
    if (dataFields?.spreadsheet_type === 'excel') {
      if (isElectron()) {
        sheetData = await window.ipcRenderer.invoke('review-excel', {
          pathExcel: dataFields.file_path,
          options: {
            sheet_name: dataFields.sheet_name,
            range: dataFields.range,
            is_choose_first_rows_as_key: dataFields.is_choose_first_rows_as_key,
          },
        });
      }
    } else if (dataFields?.spreadsheet_type === 'google_sheet') {
      if (isElectron()) {
        const globalData = variableFlow?.list.map((item) => ({
          key: item.key,
          value: item.value,
        }));
        const path_credentials_json = getParameterValue(dataFields.credentials_json, globalData);
        const sheet_id = getParameterValue(dataFields.sheet_id, globalData);
        const sheet_name = getParameterValue(dataFields.sheet_name, globalData);
        const range = getParameterValue(dataFields.range, globalData);
        sheetData = await window.ipcRenderer.invoke('review-google-sheet', {
          path_credentials_json,
          sheet_id,
          options: {
            sheet_name,
            range,
            is_choose_first_rows_as_key: dataFields.is_choose_first_rows_as_key,
          },
        });
      }
      setToggleReview(true);
    }
    setJsonData(sheetData);
    setToggleReview(true);
    setReviewBtnLoading(false);
  };

  return (
    <Stack pb={2}>
      <Typography
        sx={{
          fontSize: 16,
          fontStyle: 'italic',
        }}
        color="text.secondary"
      >
        {formData?.data?.description}
      </Typography>
      <Stack spacing={3} mt={2}>
        <TextField
          select
          fullWidth
          name="spreadsheet_type"
          label="Loại bảng tính"
          value={dataFields?.spreadsheet_type ?? 'google_sheet'}
          onChange={handleChangeNumberSecond}
        >
          <MenuItem value="excel">Excel</MenuItem>
          <MenuItem value="google_sheet">Google Sheets</MenuItem>
        </TextField>

        {dataFields?.spreadsheet_type === 'excel' && (
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <TextField
                type="text"
                name="file_path"
                label="File Excel"
                value={dataFields?.file_path ?? ''}
                sx={{ width: '100%' }}
                onChange={handleChangeNumberSecond}
                InputProps={{
                  endAdornment: (
                    <PositionedMenu
                      name="file_path"
                      getVariable={getVariable}
                      openVariableModal={openVariableModal}
                    />
                  ),
                }}
              />
              <IconButton
                variant="outlined"
                component="label"
                sx={{
                  width: 53,
                  aspectRatio: 1,
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                }}
              >
                <Iconify icon="material-symbols:upload" width={28} />
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  hidden
                  onChange={(event) => selectFileCSV(event)}
                />
              </IconButton>
            </Stack>

            <TextField
              fullWidth
              type="text"
              name="sheet_name"
              label="Tên trang tính (Tùy chọn)"
              onChange={handleChangeNumberSecond}
              value={dataFields?.sheet_name ?? ''}
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

            <TextField
              select
              fullWidth
              name="action_type"
              label="Hành động"
              value={dataFields?.action_type ?? 'read'}
              onChange={handleChangeNumberSecond}
            >
              <MenuItem value="read">Đọc</MenuItem>
              <MenuItem value="write">Ghi</MenuItem>
              <MenuItem value="append">Ghi thêm</MenuItem>
              <MenuItem value="update">Cập nhật</MenuItem>
              <MenuItem value="clear">Xóa giá trị ô</MenuItem>
              <MenuItem value="delete_row">Xóa hàng</MenuItem>
            </TextField>

            {['read', 'clear'].includes(dataFields?.action_type) && (
              <TextField
                fullWidth
                type="text"
                name="range"
                label={`Range ${dataFields?.action_type === 'clear' ? '' : '(Tùy chọn)'}`}
                onChange={handleChangeNumberSecond}
                value={dataFields?.range ?? ''}
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
            )}

            {['write', 'append'].includes(dataFields?.action_type) && (
              <Autocomplete
                name="data"
                id="combo-box-demo"
                onChange={(_, newValue) => {
                  eventBus.emit('updateNode', {
                    data: { data: newValue?.key },
                    idNode: IdNode,
                  });
                }}
                value={dataFields?.data || null}
                getOptionLabel={(option) => option.key || option || ''}
                options={fetchVariables || []}
                isOptionEqualToValue={(option, value) => option.key === value}
                renderInput={(params) => <TextField label="Biến dữ liệu" {...params} />}
                renderOption={(props, option) => (
                  <Fragment key={option.id}>
                    <Stack component="li" {...props} direction="row" justifyContent="flex-start">
                      {option.key}
                    </Stack>
                    <Stack className="add-new-element-variable" p={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        width="100px"
                        onClick={() => {
                          dataVariableModal.onTrue();
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
                        dataVariableModal.onTrue();
                      }}
                      startIcon={<Iconify icon="ion:create-outline" />}
                    >
                      Tạo biến mới
                    </Button>
                  </Stack>
                }
              />
            )}

            {['read', 'write', 'append'].includes(dataFields?.action_type) && (
              <FormControlLabel
                name="is_choose_first_rows_as_key"
                control={
                  <Checkbox checked={formData?.dataFields?.is_choose_first_rows_as_key ?? true} />
                }
                onChange={handleChangeNumberSecond}
                label="Chọn hàng đầu tiên làm khóa"
                sx={{
                  width: 'fit-content',
                }}
              />
            )}

            {dataFields?.action_type === 'read' && (
              <Autocomplete
                name="variable_name"
                id="combo-box-demo"
                onChange={(_, newValue) => {
                  eventBus.emit('updateNode', {
                    data: { variable_name: newValue?.key },
                    idNode: IdNode,
                  });
                }}
                value={dataFields?.variable_name || null}
                getOptionLabel={(option) => option.key || option || ''}
                options={fetchVariables || []}
                isOptionEqualToValue={(option, value) => option.key === value}
                renderInput={(params) => <TextField label="Biến nhận dữ liệu" {...params} />}
                renderOption={(props, option) => (
                  <Fragment key={option.id}>
                    <Stack component="li" {...props} direction="row" justifyContent="flex-start">
                      {option.key}
                    </Stack>
                    <Stack className="add-new-element-variable" p={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        width="100px"
                        onClick={() => {
                          nameVariableModal.onTrue();
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
                        nameVariableModal.onTrue();
                      }}
                      startIcon={<Iconify icon="ion:create-outline" />}
                    >
                      Tạo biến mới
                    </Button>
                  </Stack>
                }
              />
            )}

            {['update', 'delete_row'].includes(dataFields?.action_type) && (
              <Stack spacing={3} direction="row">
                <TextField
                  fullWidth
                  type="text"
                  name="search_field"
                  label="Khoá tìm kiếm"
                  onChange={handleChangeNumberSecond}
                  value={dataFields?.search_field ?? ''}
                  InputProps={{
                    endAdornment: (
                      <PositionedMenu
                        name="search_field"
                        getVariable={getVariable}
                        openVariableModal={openVariableModal}
                      />
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  type="text"
                  name="search_value"
                  label="Giá trị tìm kiếm"
                  onChange={handleChangeNumberSecond}
                  value={dataFields?.search_value ?? ''}
                  InputProps={{
                    endAdornment: (
                      <PositionedMenu
                        name="search_value"
                        getVariable={getVariable}
                        openVariableModal={openVariableModal}
                      />
                    ),
                  }}
                />
              </Stack>
            )}

            {dataFields?.action_type === 'update' && (
              <Stack
                sx={{
                  border: '1px solid #eeeeee24',
                  padding: '8px',
                  borderRadius: '4px',
                  gap: 0,
                }}
                spacing={1}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Dữ liệu cập nhật</Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                    onClick={() => addNewDataUpdate()}
                  >
                    Thêm
                  </Button>
                </Stack>
                <Stack spacing={1} pt={dataFields?.data_update?.length > 0 ? 2 : 0}>
                  {dataFields?.data_update?.map((item) => (
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
                        width={1}
                      >
                        <TextField
                          fullWidth
                          value={item.key}
                          error={false}
                          label="Key"
                          onChange={(e) => editDataUpdate('key', e, item.id)}
                          size="small"
                        />
                        <TextField
                          fullWidth
                          value={item.value}
                          error={false}
                          label="Value"
                          onChange={(e) => editDataUpdate('value', e, item.id)}
                          size="small"
                          InputProps={{
                            endAdornment: (
                              <PositionedMenu
                                getVariable={(value) =>
                                  getDataUpdateVariable('value', value, item.id)
                                }
                                openVariableModal={variableModal.onTrue}
                              />
                            ),
                          }}
                        />
                        <Iconify
                          onClick={() => deleteDataUpdate(item.id)}
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
            )}
          </Stack>
        )}

        {dataFields?.spreadsheet_type === 'google_sheet' && (
          <Stack spacing={3}>
            <Stack>
              <Typography
                variant="caption"
                display="block"
                gutterBottom
                color="#919EAB"
                fontSize={14}
              >
                Vui lòng{' '}
                <Typography
                  component="span"
                  style={{
                    color: '#00aaff',
                    cursor: 'pointer',
                    display: 'inline-block',
                    fontSize: '12px',
                  }}
                  onClick={() =>
                    referLink('https://docs.mktlogin.com/guide/setup-google-sheet.html')
                  }
                >
                  click vào đây
                </Typography>{' '}
                để xem hướng dẫn tạo file json xác thực.
              </Typography>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <TextField
                  fullWidth
                  type="text"
                  name="credentials_json"
                  value={dataFields?.credentials_json ?? ''}
                  label="Đường dẫn file json xác thực"
                  onChange={handleChangeNumberSecond}
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
                <IconButton
                  variant="outlined"
                  component="label"
                  sx={{
                    width: 53,
                    aspectRatio: 1,
                    borderRadius: 1,
                    border: '1px dashed',
                    borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                  }}
                >
                  <Iconify icon="material-symbols:upload" width={28} />
                  <input
                    type="file"
                    accept=".json"
                    hidden
                    onChange={(event) => selectGoogleCreden(event)}
                  />
                </IconButton>
              </Stack>
            </Stack>

            <Stack>
              <Typography
                variant="caption"
                display="block"
                gutterBottom
                color="#919EAB"
                fontSize={14}
              >
                Hãy copy email dưới và share bảng tính của bạn cho email đã copy.{' '}
                <Typography
                  component="span"
                  style={{
                    color: '#00aaff',
                    cursor: 'pointer',
                    display: 'inline-block',
                    fontSize: '12px',
                  }}
                  onClick={() =>
                    referLink('https://docs.mktlogin.com/guide/how-to-share-sheetspread.html')
                  }
                >
                  Xem hướng dẫn
                </Typography>
              </Typography>
              <TextField
                type="text"
                name="email_share"
                value={dataFields?.email_share ?? ''}
                label="Email chia sẽ"
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
                          copy(dataFields?.email_share ?? '');
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

            <TextField
              type="text"
              name="sheet_id"
              label="ID Bảng tính"
              onChange={handleChangeNumberSecond}
              value={dataFields?.sheet_id ?? ''}
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

            <TextField
              fullWidth
              type="text"
              name="sheet_name"
              label="Tên trang tính (Tùy chọn)"
              onChange={handleChangeNumberSecond}
              value={dataFields?.sheet_name ?? ''}
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

            <TextField
              select
              fullWidth
              name="action_type"
              label="Hành động"
              value={dataFields?.action_type || 'read'}
              onChange={handleChangeNumberSecond}
            >
              <MenuItem value="read">Đọc</MenuItem>
              <MenuItem value="find_row">Tìm kiếm</MenuItem>
              <MenuItem value="write">Ghi</MenuItem>
              <MenuItem value="append">Ghi thêm</MenuItem>
              <MenuItem value="update">Cập nhật</MenuItem>
              <MenuItem value="clear">Xóa giá trị ô</MenuItem>
              <MenuItem value="delete_row">Xóa hàng</MenuItem>
            </TextField>

            {['write', 'append'].includes(dataFields?.action_type) && (
              <Autocomplete
                name="data"
                id="combo-box-demo"
                onChange={(_, newValue) => {
                  eventBus.emit('updateNode', {
                    data: { data: newValue?.key },
                    idNode: IdNode,
                  });
                }}
                value={dataFields?.data || null}
                getOptionLabel={(option) => option.key || option || ''}
                options={fetchVariables || []}
                isOptionEqualToValue={(option, value) => option.key === value}
                renderInput={(params) => <TextField label="Biến dữ liệu" {...params} />}
                renderOption={(props, option) => (
                  <Fragment key={option.id}>
                    <Stack component="li" {...props} direction="row" justifyContent="flex-start">
                      {option.key}
                    </Stack>
                    <Stack className="add-new-element-variable" p={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        width="100px"
                        onClick={() => {
                          dataVariableModal.onTrue();
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
                        dataVariableModal.onTrue();
                      }}
                      startIcon={<Iconify icon="ion:create-outline" />}
                    >
                      Tạo biến mới
                    </Button>
                  </Stack>
                }
              />
            )}

            {['read', 'write', 'clear'].includes(dataFields?.action_type) && (
              <TextField
                fullWidth
                type="text"
                name="range"
                label={`Range ${dataFields?.action_type === 'clear' ? '' : '(Tùy chọn)'}`}
                onChange={handleChangeNumberSecond}
                value={dataFields?.range ?? ''}
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
            )}

            {['read', 'write', 'append'].includes(dataFields?.action_type) && (
              <FormControlLabel
                name="is_choose_first_rows_as_key"
                control={
                  <Checkbox checked={formData?.dataFields?.is_choose_first_rows_as_key ?? true} />
                }
                onChange={handleChangeNumberSecond}
                label="Chọn hàng đầu tiên làm khóa"
                sx={{
                  width: 'fit-content',
                }}
              />
            )}

            {['update', 'delete_row', 'find_row'].includes(dataFields?.action_type) && (
              <Stack spacing={3} direction="row">
                <TextField
                  fullWidth
                  type="text"
                  name="search_field"
                  label="Khoá tìm kiếm"
                  onChange={handleChangeNumberSecond}
                  value={dataFields?.search_field ?? ''}
                  InputProps={{
                    endAdornment: (
                      <PositionedMenu
                        name="search_field"
                        getVariable={getVariable}
                        openVariableModal={openVariableModal}
                      />
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  type="text"
                  name="search_value"
                  label="Giá trị tìm kiếm"
                  onChange={handleChangeNumberSecond}
                  value={dataFields?.search_value ?? ''}
                  InputProps={{
                    endAdornment: (
                      <PositionedMenu
                        name="search_value"
                        getVariable={getVariable}
                        openVariableModal={openVariableModal}
                      />
                    ),
                  }}
                />
              </Stack>
            )}

            {['read', 'find_row'].includes(dataFields?.action_type) && (
              <Autocomplete
                name="variable_name"
                id="combo-box-demo"
                onChange={(_, newValue) => {
                  eventBus.emit('updateNode', {
                    data: { variable_name: newValue?.key },
                    idNode: IdNode,
                  });
                }}
                value={dataFields?.variable_name || null}
                getOptionLabel={(option) => option.key || option || ''}
                options={fetchVariables || []}
                isOptionEqualToValue={(option, value) => option.key === value}
                renderInput={(params) => <TextField label="Biến nhận dữ liệu" {...params} />}
                renderOption={(props, option) => (
                  <Fragment key={option.id}>
                    <Stack component="li" {...props} direction="row" justifyContent="flex-start">
                      {option.key}
                    </Stack>
                    <Stack className="add-new-element-variable" p={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        width="100px"
                        onClick={() => {
                          nameVariableModal.onTrue();
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
                        nameVariableModal.onTrue();
                      }}
                      startIcon={<Iconify icon="ion:create-outline" />}
                    >
                      Tạo biến mới
                    </Button>
                  </Stack>
                }
              />
            )}

            {dataFields?.action_type === 'update' && (
              <Stack
                sx={{
                  border: '1px solid #eeeeee24',
                  padding: '8px',
                  borderRadius: '4px',
                  gap: 0,
                }}
                spacing={1}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Dữ liệu cập nhật</Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                    onClick={() => addNewDataUpdate()}
                  >
                    Thêm
                  </Button>
                </Stack>
                <Stack spacing={1} pt={dataFields?.data_update?.length > 0 ? 2 : 0}>
                  {dataFields?.data_update?.map((item) => (
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
                        width={1}
                      >
                        <TextField
                          fullWidth
                          value={item.key}
                          error={false}
                          label="Key"
                          onChange={(e) => editDataUpdate('key', e, item.id)}
                          size="small"
                        />
                        <TextField
                          fullWidth
                          value={item.value}
                          error={false}
                          label="Value"
                          onChange={(e) => editDataUpdate('value', e, item.id)}
                          size="small"
                          InputProps={{
                            endAdornment: (
                              <PositionedMenu
                                getVariable={(value) =>
                                  getDataUpdateVariable('value', value, item.id)
                                }
                                openVariableModal={variableModal.onTrue}
                              />
                            ),
                          }}
                        />
                        <Iconify
                          onClick={() => deleteDataUpdate(item.id)}
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
            )}
          </Stack>
        )}

        <Stack direction="row" justifyContent="flex-start" spacing={2} alignItems="center">
          <LoadingButton
            variant="outlined"
            component="label"
            size="small"
            sx={{ maxWidth: '100px' }}
            color="primary"
            loading={isReviewBtnLoading}
            onClick={handleReviewSheetData}
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
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
      <Variables
        addOne
        open={nameVariableModal.value}
        onClose={nameVariableModal.onFalse}
        updateVariableAction={(key) => {
          eventBus.emit('updateNode', { data: { variable_name: key }, idNode: IdNode });
        }}
      />
      <Variables
        addOne
        open={dataVariableModal.value}
        onClose={dataVariableModal.onFalse}
        updateVariableAction={(key) => {
          eventBus.emit('updateNode', { data: { data: key }, idNode: IdNode });
        }}
      />
    </Stack>
  );
}

SpreadSheetForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
