import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import eventBus from 'src/sections/script/event-bus';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Fade,
  FormControlLabel,
  IconButton,
  MenuItem,
  alpha,
} from '@mui/material';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import PositionedMenu from 'src/components/list-click';
import cloneDeep from 'lodash/cloneDeep';
import {
  LEFT_CONDITION_OPTIONS,
  OPERATOR_OPTIONS,
  RIGHT_CONDITION_OPTIONS,
} from 'src/utils/constance';
import { Editor } from '@monaco-editor/react';
import { useSettingsContext } from 'src/components/settings';
import { getStorage } from 'src/hooks/use-local-storage';
import { LoadingScreen } from 'src/components/loading-screen';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function HandleVariableForm({ formData, IdNode }) {
  const { t } = useLocales();
  const getId = () => String(Date.now());
  const dataVariableModal = useBoolean();
  const { variableFlow } = useAuthContext();
  const variableModal = useBoolean();
  const [updateField, setUpdateField] = useState('');
  const [conditions, setConditions] = useState(formData?.dataFields?.conditions ?? []);
  const [listString, setListString] = useState(formData?.dataFields?.strings ?? []);

  const { themeMode } = useSettingsContext();
  const terminalDefault = getStorage('terminal');
  const [terminalSetting] = useState(
    terminalDefault
      ? {
          fontSize: terminalDefault.fontSize,
          minimap: { enabled: terminalDefault.minimap.enabled },
        }
      : {}
  );

  const handleChangeNumberSecond = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === 'data_type') {
      eventBus.emit('updateNode', {
        data: { method: '' },
        idNode: IdNode,
      });
    }

    if (name === 'default_data_type') {
      eventBus.emit('updateNode', {
        data: { default_value: '', custom_value: '' },
        idNode: IdNode,
      });
    }

    eventBus.emit('updateNode', {
      data: { [name]: type === 'checkbox' ? checked : value },
      idNode: IdNode,
    });
  };

  const getVariable = (name, item) => {
    eventBus.emit('updateNode', { data: { [name]: `\${${item.key}}` }, idNode: IdNode });
  };

  const fetchVariables = useMemo(() => {
    if (variableFlow?.list === null || variableFlow?.list?.length === 0) return [];

    return variableFlow?.list.map((i, index) => ({
      ...i,
      lastItem: index + 1 === variableFlow.list.length,
    }));
  }, [variableFlow?.list]);

  const handleGetAccTitle = useCallback((value, item) => {
    if (!item.leftValue && !item.rightValue) {
      return '';
    }

    switch (value) {
      case 'value':
        return (
          <Typography variant="body2">
            {item.leftValue || 'Trống'}{' '}
            <Typography component="span" variant="button">
              {item.operator?.title || 'Trống'}
            </Typography>{' '}
            {['is_truthy', 'is_falsy'].includes(item.operator?.value)
              ? ''
              : item.rightValue || 'Trống'}
          </Typography>
        );

      case 'code':
        return <Typography variant="body2">JS Code</Typography>;

      case 'data_exists':
        return <Typography variant="body2">{`Dữ liệu tồn tại (${item.leftValue})`}</Typography>;

      case 'data_not_exists':
        return (
          <Typography variant="body2">{`Dữ liệu không tồn tại (${item.leftValue})`}</Typography>
        );

      case 'element_text':
        return (
          <Typography variant="body2">
            PHần tử văn bản{item.leftValue ? `(${item.leftValue})` : ''}{' '}
            <Typography component="span" variant="button">
              {item.operator?.title || 'Trống'}
            </Typography>{' '}
            {['is_truthy', 'is_falsy'].includes(item.operator?.value)
              ? ''
              : item.rightValue || 'Trống'}
          </Typography>
        );

      case 'element_exists':
        return (
          <Typography variant="body2">
            Phần tử tồn tại{item.leftValue ? `(${item.leftValue})` : ''}
          </Typography>
        );

      case 'element_not_exists':
        return (
          <Typography variant="body2">
            Phần tử không tồn tại{item.leftValue ? `(${item.leftValue})` : ''}
          </Typography>
        );

      case 'element_visible':
        return (
          <Typography variant="body2">
            element#visible{item.leftValue ? `(${item.leftValue})` : ''}
          </Typography>
        );

      case 'element_visible_in_screen':
        return (
          <Typography variant="body2">
            element#visibleScreen{item.leftValue ? `(${item.leftValue})` : ''}
          </Typography>
        );

      case 'element_hidden_in_screen':
        return (
          <Typography variant="body2">
            element#invisible{item.leftValue ? `(${item.leftValue})` : ''}
          </Typography>
        );

      case 'element_attribute_value':
        return (
          <Typography variant="body2">
            element#attribute{item.leftValue ? `(${item.leftValue})` : ''}{' '}
            <Typography component="span" variant="button">
              {item.operator?.title || 'Trống'}
            </Typography>{' '}
            {item.rightValue || 'Trống'}
          </Typography>
        );

      default:
        return 'CSS selector hoặc XPath';
    }
  }, []);

  const handleDeleteCondition = (orConditionId, andConditionId) => {
    const _findOr = conditions.findIndex((i) => i.id === orConditionId);
    const _cloneOr = cloneDeep(conditions);

    const _findAnd = _cloneOr[_findOr].conditions.findIndex((i) => i.id === andConditionId);
    const _cloneAnd = cloneDeep(_cloneOr[_findOr].conditions);

    _cloneAnd.splice(_findAnd, 1);
    if (_cloneAnd.length === 0) {
      _cloneOr.splice(_findOr, 1);
    } else {
      _cloneOr[_findOr].conditions = _cloneAnd;
    }
    setConditions(_cloneOr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const handleUpdateCondition = (orConditionId, andConditionId, data) => {
    const _findOr = conditions.findIndex((i) => i.id === orConditionId);
    const _cloneOr = cloneDeep(conditions);

    const _findAnd = _cloneOr[_findOr].conditions.findIndex((i) => i.id === andConditionId);
    const _cloneAnd = cloneDeep(_cloneOr[_findOr].conditions);

    _cloneAnd[_findAnd] = {
      ..._cloneAnd[_findAnd],
      ...data,
    };

    if (['data_exists', 'data_not_exists'].includes(_cloneAnd[_findAnd].leftType?.value)) {
      const regexPattern = /^[a-zA-Z_]\w*(\.[a-zA-Z_]\w*)*$/;
      if (_cloneAnd[_findAnd].leftValue && !_cloneAnd[_findAnd].leftValue.match(regexPattern)) {
        _cloneAnd[_findAnd].error = true;
      } else {
        _cloneAnd[_findAnd].error = false;
      }
    } else {
      _cloneAnd[_findAnd].error = false;
    }

    _cloneOr[_findOr].conditions = _cloneAnd;

    setConditions(_cloneOr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const handleGetLabel = useCallback((value) => {
    switch (value) {
      case 'value':
        return 'Giá trị 1';

      case 'data_exists':
      case 'data_not_exists':
        return 'variableName hoặc variableName.key';

      default:
        return 'CSS selector hoặc XPath';
    }
  }, []);

  const handleAddAndCondition = (conditionId) => {
    const _clone = cloneDeep(conditions);
    const _find = _clone.findIndex((i) => i.id === conditionId);

    if (_find > -1) {
      _clone[_find].conditions.push({
        id: `and-${getId()}`,
        codeStatus: 'background',
        script_content: '\nreturn true;',
        left_attr_name: '',
        right_attr_name: '',
        leftValue: '',
        leftType: LEFT_CONDITION_OPTIONS[0],
        operator: OPERATOR_OPTIONS[0],
        rightValue: '',
        rightType: RIGHT_CONDITION_OPTIONS[0],
      });
    } else {
      _clone.push({
        id: `or-${getId()}`,
        conditions: [
          {
            id: `and-${getId()}`,
            codeStatus: 'background',
            script_content: '\nreturn true;',
            left_attr_name: '',
            right_attr_name: '',
            leftValue: '',
            leftType: LEFT_CONDITION_OPTIONS[0],
            operator: OPERATOR_OPTIONS[0],
            rightValue: '',
            rightType: RIGHT_CONDITION_OPTIONS[0],
          },
        ],
      });
    }

    setConditions(_clone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(
    () => () => {
      eventBus.emit('updateNode', {
        data: { conditions, strings: listString },
        idNode: IdNode,
      });
    },
    [IdNode, conditions, listString]
  );

  return (
    <Stack>
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
        <Autocomplete
          name="variable"
          disablePortal
          id="combo-box-demo"
          onChange={(_, newValue) => {
            eventBus.emit('updateNode', {
              data: { variable: newValue?.key },
              idNode: IdNode,
            });
          }}
          value={formData?.dataFields?.variable || null}
          getOptionLabel={(option) => option.key || option || ''}
          options={fetchVariables || []}
          isOptionEqualToValue={(option, value) => option.key === value}
          renderInput={(params) => <TextField label="Biến chứa dữ liệu" {...params} />}
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
                    setUpdateField('variable');
                    dataVariableModal.onTrue();
                  }}
                  startIcon={<Iconify icon="ion:create-outline" width={16} />}
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
                  setUpdateField('variable');
                  dataVariableModal.onTrue();
                }}
                startIcon={<Iconify icon="ion:create-outline" />}
              >
                Tạo biến mới
              </Button>
            </Stack>
          }
        />

        <TextField
          select
          fullWidth
          name="data_type"
          value={formData?.dataFields?.data_type ?? 'string'}
          onChange={handleChangeNumberSecond}
          label="Loại dữ liệu"
        >
          <MenuItem value="string">Chuỗi ký tự</MenuItem>
          <MenuItem value="array">Danh sách</MenuItem>
          <MenuItem value="object">Đối tượng</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          name="method"
          value={formData?.dataFields?.method ?? 'length'}
          onChange={handleChangeNumberSecond}
          label="Phương thức"
        >
          <MenuItem
            value="length"
            sx={{
              display: formData?.dataFields?.data_type !== 'object' ? 'block' : 'none',
            }}
          >
            {formData?.dataFields?.data_type === 'array' ? 'Lấy số lượng phần tử' : 'Lấy độ dài'}
          </MenuItem>
          <MenuItem
            value="get_property"
            sx={{
              display: formData?.dataFields?.data_type === 'object' ? 'block' : 'none',
            }}
          >
            Lấy thuộc tính
          </MenuItem>
          {[
            {
              id: 1,
              label: 'Chuyển thành chữ in hoa',
              value: 'to_upper_case',
            },
            {
              id: 2,
              label: 'Chuyển thành chữ thường',
              value: 'to_lower_case',
            },
            {
              id: 3,
              label: 'Loại bỏ khoảng trắng ở đầu và cuối chuỗi',
              value: 'trim',
            },
            {
              id: 4,
              label: 'Lấy một phần của chuỗi',
              value: 'substring',
            },
            {
              id: 5,
              label: 'Thay thế chuỗi',
              value: 'replace',
            },
            {
              id: 6,
              label: 'Tách chuỗi',
              value: 'split',
            },
            {
              id: 7,
              label: 'Nối chuỗi',
              value: 'concat',
            },
            {
              id: 8,
              label: 'Chuyển JSON String sang Javascript Object',
              value: 'json_parse',
            },
          ].map((item) => (
            <MenuItem
              key={item.id}
              value={item.value}
              sx={{
                display: formData?.dataFields?.data_type === 'string' ? 'block' : 'none',
              }}
            >
              {item.label}
            </MenuItem>
          ))}

          {[
            {
              id: 2,
              label: 'Lấy phần tử ngẫu nhiên',
              value: 'get_item_random',
            },
            {
              id: 3,
              label: 'Lấy phần tử theo thứ tự',
              value: 'get_item_by_order_number',
            },
            {
              id: 4,
              label: 'Xáo trộn',
              value: 'shuffle',
            },
            {
              id: 5,
              label: 'Lấy một phần của danh sách',
              value: 'slice',
            },
            {
              id: 6,
              label: 'Tìm kiếm',
              value: 'find',
            },
            {
              id: 7,
              label: 'Bộ lọc',
              value: 'filter',
            },
          ].map((item) => (
            <MenuItem
              key={item.id}
              sx={{
                display: formData?.dataFields?.data_type === 'array' ? 'block' : 'none',
              }}
              value={item.value}
            >
              {item.label}
            </MenuItem>
          ))}
        </TextField>

        {['find', 'filter'].includes(formData?.dataFields?.method) && (
          <Stack spacing={2}>
            {conditions.length > 0 ? (
              conditions.map((condition, index) => (
                <Fragment key={condition.id}>
                  <Stack spacing={1} overflow="hidden">
                    <Typography color="text.secondary" variant="caption" fontWeight={600}>
                      Điều kiện
                    </Typography>

                    <Typography color="text.secondary" variant="caption">
                      * Sử dụng $&#123;ITEM&#125; để lấy ra giá trị của item để so sánh. <br />* Nếu
                      ITEM là đối tượng bạn có thể truy cập thuộc tính bằng cách sử dụng :
                      $&#123;ITEM.ten_thuoc_tinh&#125;
                    </Typography>

                    <Stack
                      direction="row"
                      pl={condition?.conditions?.length === 1 ? 0 : 3}
                      spacing={2}
                      overflow="hidden"
                    >
                      <Stack
                        sx={{
                          position: 'relative',
                          borderTopLeftRadius: 8,
                          borderBottomLeftRadius: 8,
                          border: '2px solid',
                          borderColor: 'info.main',
                          borderRight: 'none',
                          width: 40,
                          display: condition?.conditions?.length === 1 ? 'none' : 'flex',
                          '&:before': {
                            content: '"VÀ"',
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            padding: 1,
                            borderRadius: 1,
                            bgcolor: 'info.main',
                            transform: 'translate(-50%, -50%)',
                          },
                        }}
                      />
                      <Stack width={1}>
                        {condition.conditions.map((item, ind) => (
                          <Accordion
                            key={ind}
                            slots={{ transition: Fade }}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover .delete-condition': {
                                visibility: 'visible',
                              },
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                width={1}
                                mr={1}
                              >
                                {handleGetAccTitle(item.leftType?.value, item)}
                                <IconButton
                                  className="delete-condition"
                                  sx={{
                                    visibility: 'hidden',
                                  }}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeleteCondition(condition.id, item.id);
                                  }}
                                >
                                  <Iconify icon="material-symbols:delete" color="error.main" />
                                </IconButton>
                              </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Stack spacing={1}>
                                <Stack direction="row" spacing={1}>
                                  <Autocomplete
                                    id={`left-value-${getId()}`}
                                    disableClearable
                                    size="small"
                                    value={item.leftType}
                                    options={LEFT_CONDITION_OPTIONS.filter(
                                      (option) => option.group === 'value'
                                    )}
                                    groupBy={(option) => option.group}
                                    getOptionLabel={(option) => option?.title}
                                    isOptionEqualToValue={(option, value) =>
                                      option.value === value.value
                                    }
                                    renderInput={(params) => <TextField {...params} />}
                                    onChange={(event, newValue) => {
                                      handleUpdateCondition(condition.id, item.id, {
                                        leftType: newValue,
                                      });
                                    }}
                                    sx={{
                                      width:
                                        item.leftType?.value === 'element_attribute_value'
                                          ? 0.5
                                          : 1,
                                    }}
                                  />
                                  {item.leftType?.value === 'code' ? (
                                    <TextField
                                      select
                                      size="small"
                                      fullWidth
                                      onChange={(event) => {
                                        handleUpdateCondition(condition.id, item.id, {
                                          codeStatus: event.target.value,
                                        });
                                      }}
                                      value={item.codeStatus}
                                    >
                                      <MenuItem value="background">Background</MenuItem>
                                      <MenuItem value="active_tab">Active tab</MenuItem>
                                    </TextField>
                                  ) : (
                                    <Stack
                                      width={1}
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                    >
                                      <TextField
                                        label={handleGetLabel(item.leftType?.value)}
                                        onChange={(event) => {
                                          handleUpdateCondition(condition.id, item.id, {
                                            leftValue: event.target.value,
                                          });
                                        }}
                                        value={item.leftValue}
                                        fullWidth
                                        size="small"
                                        error={item.error}
                                        helperText={
                                          item.error ? t('validate.invalidVariableName') : ''
                                        }
                                        InputProps={{
                                          endAdornment: item.leftType?.value === 'value' && (
                                            <PositionedMenu
                                              getVariable={getVariable}
                                              handleSelectVariable={(variableName) => {
                                                handleUpdateCondition(condition.id, item.id, {
                                                  leftValue: `\${${variableName}}`,
                                                });
                                              }}
                                              openVariableModal={variableModal.onTrue}
                                            />
                                          ),
                                        }}
                                      />
                                      {item.leftType?.group === 'element' && (
                                        <>
                                          <IconButton
                                            sx={{
                                              borderRadius: 1,
                                              background: (theme) =>
                                                alpha(theme.palette.grey[600], 0.2),
                                            }}
                                          >
                                            <Iconify icon="mdi:target" />
                                          </IconButton>
                                          <IconButton
                                            sx={{
                                              borderRadius: 1,
                                              background: (theme) =>
                                                alpha(theme.palette.grey[600], 0.2),
                                            }}
                                          >
                                            <Iconify icon="solar:check-read-linear" />
                                          </IconButton>
                                          {item.leftType?.value === 'element_attribute_value' && (
                                            <TextField
                                              label="Attribute name"
                                              onChange={(event) => {
                                                handleUpdateCondition(condition.id, item.id, {
                                                  left_attr_name: event.target.value,
                                                });
                                              }}
                                              value={item.left_attr_name}
                                              fullWidth
                                              size="small"
                                            />
                                          )}
                                        </>
                                      )}
                                    </Stack>
                                  )}
                                </Stack>

                                {item.leftType?.value === 'code' ? (
                                  <Stack
                                    width={1}
                                    height={100}
                                    overflow="hidden"
                                    borderRadius={1}
                                    mt={1}
                                  >
                                    <Editor
                                      language="javascript"
                                      theme={`vs-${themeMode}`}
                                      options={terminalSetting}
                                      value={item.script_content}
                                      // onMount={handleEditorDidMount}
                                      onChange={(value) => {
                                        handleUpdateCondition(condition.id, item.id, {
                                          script_content: value,
                                        });
                                      }}
                                      loading={<LoadingScreen />}
                                    />
                                  </Stack>
                                ) : (
                                  ['value', 'element_text', 'element_attribute_value'].includes(
                                    item.leftType?.value
                                  ) && (
                                    <>
                                      <Autocomplete
                                        id={`operator-${getId()}`}
                                        disableClearable
                                        fullWidth
                                        size="small"
                                        value={item.operator}
                                        options={OPERATOR_OPTIONS}
                                        groupBy={(option) => option.group}
                                        getOptionLabel={(option) => option?.title}
                                        isOptionEqualToValue={(option, value) =>
                                          option.value === value.value
                                        }
                                        renderInput={(params) => <TextField {...params} />}
                                        onChange={(event, newValue) => {
                                          handleUpdateCondition(condition.id, item.id, {
                                            operator: newValue,
                                          });
                                        }}
                                      />
                                      {!['is_truthy', 'is_falsy'].includes(
                                        item.operator?.value
                                      ) && (
                                        <Stack direction="row" spacing={1}>
                                          <Autocomplete
                                            id={`right-value-${getId()}`}
                                            disableClearable
                                            size="small"
                                            value={item.rightType}
                                            options={RIGHT_CONDITION_OPTIONS}
                                            groupBy={(option) => option.group}
                                            getOptionLabel={(option) => option?.title}
                                            isOptionEqualToValue={(option, value) =>
                                              option.value === value.value
                                            }
                                            renderInput={(params) => <TextField {...params} />}
                                            onChange={(event, newValue) => {
                                              handleUpdateCondition(condition.id, item.id, {
                                                rightType: newValue,
                                              });
                                            }}
                                            sx={{
                                              width:
                                                item.rightType?.value === 'element_attribute_value'
                                                  ? 0.5
                                                  : 1,
                                            }}
                                          />
                                          <Stack
                                            width={1}
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                          >
                                            <TextField
                                              label={
                                                item.rightType?.value === 'value'
                                                  ? 'Giá trị 2'
                                                  : 'CSS selector hoặc XPath'
                                              }
                                              value={item.rightValue}
                                              onChange={(event) => {
                                                handleUpdateCondition(condition.id, item.id, {
                                                  rightValue: event.target.value,
                                                });
                                              }}
                                              fullWidth
                                              size="small"
                                              InputProps={{
                                                endAdornment: item.rightType?.value === 'value' && (
                                                  <PositionedMenu
                                                    getVariable={getVariable}
                                                    handleSelectVariable={(variableName) => {
                                                      handleUpdateCondition(condition.id, item.id, {
                                                        rightValue: `\${${variableName}}`,
                                                      });
                                                    }}
                                                    openVariableModal={variableModal.onTrue}
                                                  />
                                                ),
                                              }}
                                            />
                                            {item.rightType?.group === 'element' && (
                                              <>
                                                <IconButton
                                                  sx={{
                                                    borderRadius: 1,
                                                    background: (theme) =>
                                                      alpha(theme.palette.grey[600], 0.2),
                                                  }}
                                                >
                                                  <Iconify icon="mdi:target" />
                                                </IconButton>
                                                <IconButton
                                                  sx={{
                                                    borderRadius: 1,
                                                    background: (theme) =>
                                                      alpha(theme.palette.grey[600], 0.2),
                                                  }}
                                                >
                                                  <Iconify icon="solar:check-read-linear" />
                                                </IconButton>
                                                {item.rightType?.value ===
                                                  'element_attribute_value' && (
                                                  <TextField
                                                    label="Attribute name"
                                                    onChange={(event) => {
                                                      handleUpdateCondition(condition.id, item.id, {
                                                        right_attr_name: event.target.value,
                                                      });
                                                    }}
                                                    value={item.right_attr_name}
                                                    fullWidth
                                                    size="small"
                                                  />
                                                )}
                                              </>
                                            )}
                                          </Stack>
                                        </Stack>
                                      )}
                                    </>
                                  )
                                )}
                              </Stack>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Stack>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        width: 'fit-content',
                        position: 'relative',
                        left: condition?.conditions?.length === 1 ? '0px' : '76px',
                      }}
                    >
                      <Button
                        startIcon={<Iconify icon="ic:round-add" />}
                        onClick={() => handleAddAndCondition(condition.id)}
                        variant="outlined"
                      >
                        VÀ
                      </Button>
                      {index === conditions.length - 1 && (
                        <Button
                          startIcon={<Iconify icon="ic:round-add" />}
                          onClick={handleAddAndCondition}
                          variant="outlined"
                        >
                          HOẶC
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                  {index !== conditions.length - 1 && (
                    <Stack
                      sx={{
                        width: 1,
                        height: '2px',
                        position: 'relative',
                        my: 2,
                        bgcolor: 'warning.main',
                        '&:before': {
                          content: '"HOẶC"',
                          position: 'absolute',
                          top: '50%',
                          padding: 1,
                          borderRadius: 1,
                          bgcolor: 'warning.main',
                          transform: 'translate(0%, -50%)',
                        },
                      }}
                    />
                  )}
                </Fragment>
              ))
            ) : (
              <Button startIcon={<Iconify icon="ic:round-add" />} onClick={handleAddAndCondition}>
                Thêm điều kiện
              </Button>
            )}
            <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
          </Stack>
        )}

        {formData?.dataFields?.method === 'get_item_by_order_number' && (
          <TextField
            fullWidth
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.order_number ?? ''}
            name="order_number"
            label="Số thứ tự"
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

        {['substring', 'slice'].includes(formData?.dataFields?.method) && (
          <Stack spacing={2} direction="row" mt={1}>
            <TextField
              fullWidth
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.start ?? 0}
              name="start"
              label="Vị trí bắt đầu"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="start"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <TextField
              fullWidth
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.end ?? ''}
              name="end"
              label="Vị trí kết thúc"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="end"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </Stack>
        )}

        {formData?.dataFields?.method === 'concat' && (
          <Stack
            spacing={2}
            sx={{
              border: '1px solid',
              borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
              padding: '8px',
              borderRadius: 1,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">Danh sách chuỗi</Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="ic:round-add" />}
                onClick={() => {
                  const _clone = cloneDeep(listString);
                  _clone.push('');
                  setListString(_clone);
                }}
              >
                Thêm chuỗi
              </Button>
            </Stack>

            {listString.length > 0 && (
              <Stack spacing={2}>
                {listString.map((item, index) => (
                  <Stack key={index} direction="row" alignItems="center" spacing={1}>
                    <TextField
                      fullWidth
                      size="small"
                      value={item}
                      onChange={(event) => {
                        const _clone = cloneDeep(listString);
                        _clone[index] = event.target.value;
                        setListString(_clone);
                      }}
                      label={`Chuỗi ${index + 1}`}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        const _clone = cloneDeep(listString);
                        _clone.splice(index, 1);
                        setListString(_clone);
                      }}
                    >
                      <Iconify icon="ic:round-close" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        )}

        {formData?.dataFields?.method === 'replace' && (
          <>
            <TextField
              fullWidth
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.search_value ?? ''}
              name="search_value"
              label="Chuỗi cần thay thế"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="search_value"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />

            <TextField
              fullWidth
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.new_value ?? ''}
              name="new_value"
              label="Chuỗi được thay thế"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="new_value"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />

            <FormControlLabel
              name="replace_all"
              control={<Checkbox checked={formData?.dataFields?.replace_all ?? false} />}
              onChange={handleChangeNumberSecond}
              label="Thay thế tất cả"
              sx={{
                width: 'fit-content',
              }}
            />
          </>
        )}

        {formData?.dataFields?.method === 'split' && (
          <TextField
            fullWidth
            onChange={handleChangeNumberSecond}
            value={formData?.dataFields?.separator ?? ''}
            name="separator"
            label="Ký tự phân tách"
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="separator"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        {formData?.dataFields?.method === 'get_property' && (
          <>
            <TextField
              onChange={handleChangeNumberSecond}
              value={formData?.dataFields?.path ?? ''}
              name="path"
              label="Đường dẫn đến thuộc tính"
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="path"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />

            <FormControlLabel
              name="is_return_default"
              control={<Checkbox checked={formData?.dataFields?.is_return_default ?? false} />}
              onChange={handleChangeNumberSecond}
              label="Trả về giá trị mặc định nếu không tìm thấy thuộc tính"
              sx={{
                width: 'fit-content',
              }}
            />

            {formData?.dataFields?.is_return_default && (
              <>
                <TextField
                  select
                  fullWidth
                  name="default_data_type"
                  value={formData?.dataFields?.default_data_type ?? ''}
                  onChange={handleChangeNumberSecond}
                  label="Kiểu dữ liệu"
                >
                  <MenuItem value="string">Text</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="object">Object</MenuItem>
                  <MenuItem value="list">List</MenuItem>
                </TextField>

                {formData?.dataFields?.default_data_type !== 'number' && (
                  <TextField
                    select
                    fullWidth
                    name="default_value"
                    value={formData?.dataFields?.default_value ?? ''}
                    onChange={handleChangeNumberSecond}
                    label="Giá trị"
                  >
                    <MenuItem
                      value="empty_string"
                      sx={{
                        display:
                          formData?.dataFields?.default_data_type === 'string' ? 'block' : 'none',
                      }}
                    >
                      Chuỗi rỗng
                    </MenuItem>
                    <MenuItem
                      value="empty_object"
                      sx={{
                        display:
                          formData?.dataFields?.default_data_type === 'object' ? 'block' : 'none',
                      }}
                    >
                      Đối tượng rỗng
                    </MenuItem>
                    <MenuItem
                      value="empty_list"
                      sx={{
                        display:
                          formData?.dataFields?.default_data_type === 'list' ? 'block' : 'none',
                      }}
                    >
                      Danh sách rỗng
                    </MenuItem>
                    <MenuItem value="custom">Tùy chỉnh</MenuItem>
                  </TextField>
                )}

                {formData?.dataFields?.default_data_type === 'string' &&
                  formData?.dataFields?.default_value === 'custom' && (
                    <TextField
                      onChange={handleChangeNumberSecond}
                      value={formData?.dataFields?.custom_value ?? ''}
                      name="custom_value"
                      label="Giá trị tùy chỉnh"
                      InputProps={{
                        endAdornment: (
                          <PositionedMenu
                            name="custom_value"
                            getVariable={getVariable}
                            openVariableModal={variableModal.onTrue}
                          />
                        ),
                      }}
                    />
                  )}

                {formData?.dataFields?.default_data_type === 'number' && (
                  <TextField
                    onChange={handleChangeNumberSecond}
                    value={formData?.dataFields?.custom_value ?? ''}
                    name="custom_value"
                    label="Giá trị"
                    InputProps={{
                      endAdornment: (
                        <PositionedMenu
                          name="custom_value"
                          getVariable={getVariable}
                          openVariableModal={variableModal.onTrue}
                        />
                      ),
                    }}
                  />
                )}

                {['object', 'list'].includes(formData?.dataFields?.default_data_type) &&
                  formData?.dataFields?.default_value === 'custom' && (
                    <Stack spacing={1}>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontStyle: 'italic',
                        }}
                        color="text.secondary"
                      >
                        Giá trị tùy chỉnh
                      </Typography>
                      <Box
                        sx={{
                          width: 1,
                          borderRadius: 2,
                          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                          boxShadow: (theme) => theme.customShadows.z8,
                          height: '400px',
                          overflow: 'hidden',
                        }}
                      >
                        <Editor
                          language="json"
                          theme={`vs-${themeMode}`}
                          value={formData?.dataFields?.custom_value ?? ''}
                          onChange={(value) => {
                            eventBus.emit('updateNode', {
                              data: { custom_value: value },
                              idNode: IdNode,
                            });
                          }}
                          loading={<LoadingScreen />}
                        />
                      </Box>
                    </Stack>
                  )}
              </>
            )}
          </>
        )}

        <Autocomplete
          name="variable_output"
          id="combo-box-demo"
          onChange={(_, newValue) => {
            eventBus.emit('updateNode', {
              data: { variable_output: newValue?.key },
              idNode: IdNode,
            });
          }}
          sx={{ mt: 1 }}
          value={formData?.dataFields?.variable_output || null}
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
                    setUpdateField('variable_output');
                    dataVariableModal.onTrue();
                  }}
                  startIcon={<Iconify icon="ion:create-outline" width={16} />}
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
                  setUpdateField('variable_output');
                  dataVariableModal.onTrue();
                }}
                startIcon={<Iconify icon="ion:create-outline" />}
              >
                Tạo biến mới
              </Button>
            </Stack>
          }
        />
      </Stack>
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
      <Variables
        addOne
        open={dataVariableModal.value}
        onClose={dataVariableModal.onFalse}
        updateVariableAction={(key) => {
          eventBus.emit('updateNode', { data: { [updateField]: key }, idNode: IdNode });
        }}
      />
    </Stack>
  );
}

HandleVariableForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
