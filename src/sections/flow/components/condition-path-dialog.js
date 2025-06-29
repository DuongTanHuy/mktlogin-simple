import React, { Fragment, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import { cloneDeep } from 'lodash';
import eventBus from 'src/sections/script/event-bus';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import {
  LEFT_CONDITION_OPTIONS,
  OPERATOR_OPTIONS,
  RIGHT_CONDITION_OPTIONS,
} from 'src/utils/constance';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import { LoadingScreen } from 'src/components/loading-screen';
import { Editor } from '@monaco-editor/react';
import { useSettingsContext } from 'src/components/settings';
import { getStorage } from 'src/hooks/use-local-storage';
import { useLocales } from 'src/locales';

export default function ConditionPathDialog({
  open,
  onClose,
  conditionPath,
  IdNode,
  handleUpdatePath,
}) {
  const { t } = useLocales();
  const { themeMode } = useSettingsContext();
  const [conditions, setConditions] = useState([]);
  const [conditionPathName, setConditionPathName] = useState('');
  const variableModal = useBoolean();

  const getId = () => String(Date.now());
  const terminalDefault = getStorage('terminal');
  const [terminalSetting] = useState(
    terminalDefault
      ? {
          fontSize: terminalDefault.fontSize,
          minimap: { enabled: terminalDefault.minimap.enabled },
        }
      : {}
  );

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
            Phần tử văn bản{item.leftValue ? `(${item.leftValue})` : ''}{' '}
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

  const handleGetPathTitle = useCallback((value, item) => {
    if (!item.leftValue && !item.rightValue) {
      return '';
    }

    switch (value) {
      case 'value':
        return `${item.leftValue || 'Trống'} ${item.operator?.title || 'Trống'} ${
          ['is_truthy', 'is_falsy'].includes(item.operator?.value) ? '' : item.rightValue || 'Trống'
        }`;

      case 'code':
        return 'JS Code';

      case 'data_exists':
        return `Dữ liệu tồn tại (${item.leftValue})`;

      case 'data_not_exists':
        return `Dữ liệu không tồn tại (${item.leftValue})`;

      case 'element_text':
        return `Phần tử văn bản${item.leftValue ? `(${item.leftValue})` : ''} ${
          item.operator?.title || 'Trống'
        } ${
          ['is_truthy', 'is_falsy'].includes(item.operator?.value) ? '' : item.rightValue || 'Trống'
        }`;

      case 'element_exists':
        return `Phần tử tồn tại${item.leftValue ? `(${item.leftValue})` : ''}`;

      case 'element_not_exists':
        return `Phần tử không tồn tại${item.leftValue ? `(${item.leftValue})` : ''}`;

      case 'element_visible':
        return `element#visible${item.leftValue ? `(${item.leftValue})` : ''}`;

      case 'element_visible_in_screen':
        return `element#visibleScreen${item.leftValue ? `(${item.leftValue})` : ''}`;

      case 'element_hidden_in_screen':
        return `element#invisible${item.leftValue ? `(${item.leftValue})` : ''}`;

      case 'element_attribute_value':
        return `element#attribute${item.leftValue ? `(${item.leftValue})` : ''} ${
          item.operator?.title || 'Trống'
        } ${item.rightValue || 'Trống'}`;

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
  };

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
  };

  const getVariable = (name, item) => {
    eventBus.emit('updateNode', { data: { [name]: `\${${item?.key}}` }, idNode: IdNode });
  };

  const handleClose = () => {
    handleUpdatePath({ ...conditionPath, conditions, name: conditionPathName });
    onClose();
  };

  useEffect(() => {
    if (open && conditionPath?.conditions) {
      setConditions(conditionPath?.conditions);
      setConditionPathName(conditionPath?.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (conditions.length > 0) {
      let title = '';
      conditions.forEach((condition, ind) => {
        if (condition.conditions.length > 0 && condition.conditions?.[0]?.leftValue) {
          let sentence = '';
          condition.conditions.forEach((item, index) => {
            if (index === 0) {
              sentence = handleGetPathTitle(item.leftType?.value, item);
            } else {
              sentence += ` [VÀ] ${handleGetPathTitle(item.leftType?.value, item)}`;
            }
          });
          if (ind === 0) {
            if (conditions.length === 1) {
              title = sentence;
            } else {
              title = `(${sentence})`;
            }
          } else {
            title += ` [HOẶC] (${sentence})`;
          }
        }
      });
      if (title) {
        setConditionPathName(title);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditions]);

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root': {
          maxWidth: 700,
        },
      }}
    >
      <DialogTitle sx={{ px: 3, pb: 0, pt: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={3}>
          <TextField
            fullWidth
            title={conditionPathName}
            sx={{
              '& input.MuiInputBase-input': {
                px: 0,
                py: 2,
                typography: 'h6',
                fontWeight: 'bold',
                fontSize: 18,
                textOverflow: 'ellipsis',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
            value={conditionPathName}
            onChange={(event) => {
              setConditionPathName(event.target.value);
            }}
          />
          <IconButton onClick={handleClose}>
            <Iconify icon="ion:close" />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />
      </DialogTitle>
      <DialogContent
        sx={{
          typography: 'body2',
          px: 1,
          pb: 3,
          height: '600px',
        }}
      >
        <Scrollbar
          autoHide={false}
          sx={{
            px: 2,
            height: '100%',
          }}
        >
          <Stack spacing={2}>
            {conditions.length > 0 ? (
              conditions.map((condition, index) => (
                <Fragment key={condition.id}>
                  <Stack spacing={1} overflow="hidden">
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
                            defaultExpanded
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
                                    options={LEFT_CONDITION_OPTIONS}
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
        </Scrollbar>
      </DialogContent>
    </Dialog>
  );
}

ConditionPathDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  conditionPath: PropTypes.object,
  IdNode: PropTypes.string,
  handleUpdatePath: PropTypes.func,
};
