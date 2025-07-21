/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import eventBus from 'src/sections/script/event-bus';

import { useLocales } from 'src/locales';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import { useAuthContext } from 'src/auth/hooks';
import { isElectron } from 'src/utils/commom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Fade,
  FormControlLabel,
  Grid,
  InputAdornment,
  Skeleton,
  Switch,
  alpha,
} from '@mui/material';
import { Editor } from '@monaco-editor/react';
import Iconify from '../iconify/iconify';
import { usePopover } from '../custom-popover';
import CustomPopover from '../custom-popover/custom-popover';
import { CustomTooltip } from '../custom-tooltip';
import { useSettingsContext } from '../settings';
import { LoadingScreen } from '../loading-screen';

// ----------------------------------------------------------------------

const styleOptions = {
  border: '1px solid',
  borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
  padding: '8px',
  paddingTop: '0px',
  paddingBottom: '0px',
  borderRadius: '4px',
  gap: 0,
};

const TYPE_OPTIONS = [
  { label: 'String', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Range', value: 'range' },
  { label: 'List', value: 'list' },
  { label: 'Object', value: 'object' },
];

//----------------------------------------------------------------

function Variables({
  open,
  onClose,
  updateVariableAction,
  isFromMarket = false,
  addOne = false,
  hiddenUiSetting = false,
  defaultType = 'text',
  ...other
}) {
  const { themeMode } = useSettingsContext();
  const { variableFlow, updateVariableFlow } = useAuthContext();
  const { t } = useLocales();
  const [jsonValueUpdate, setJsonValueUpdate] = useState({
    id: '',
    value: '[]',
  });

  const popover = usePopover();
  const [variables, setVariables] = useState([]);
  const [itemClicking, setItemClicking] = useState(null);
  const [focus, setFocus] = useState(false);
  const [loading, setLoading] = useState(true);

  const onCancel = useCallback(() => {
    onClose();
    setFocus(false);
    setTimeout(() => {
      setVariables(variableFlow?.list);
      setLoading(true);
    }, 400);
  }, [onClose, variableFlow?.list]);

  const submitForm = async () => {
    const validateVariableData = variables.map((item) => ({
      ...item,
      error: item.key === '' ? 'Key is required' : item.error,
    }));

    const isContinue = !validateVariableData.some((item) => item.error !== '');

    if (isContinue) {
      const findIsNewItems = variables.filter((n) => n?.isNew === true);
      if (findIsNewItems.length > 0) {
        if (typeof updateVariableAction === 'function') {
          const lastNewItem = findIsNewItems.slice(-1)[0];
          if (defaultType === 'list') {
            if (lastNewItem?.type === 'list') {
              updateVariableAction(lastNewItem?.key);
            }
          } else {
            updateVariableAction(lastNewItem?.key);
          }
        } else {
          eventBus.emit('applyVariableAfterAdded', findIsNewItems.slice(-1));
        }
      }
      updateVariableFlow({ ...variableFlow, list: variables });
      // }
      onClose();
      setFocus(false);
    } else {
      setVariables(validateVariableData);
    }
  };

  // Variable
  const addNewVariable = () => {
    if (!focus) {
      setFocus(true);
    }
    const _clone = cloneDeep(variables);
    _clone.push({
      id: _clone.length + Math.random(),
      key: '',
      value: '',
      jsonValue: '[]',
      description: '',
      isNew: true,
      is_required: true,
      type: defaultType ?? 'text',
      defaultValue: '',
      label: '',
      error: '',
    });

    setVariables(_clone);
  };

  const updateVariable = (name, event, id) => {
    const _clone = cloneDeep(variables);
    const _find = _clone.findIndex((i) => i.id === id);
    if (_clone[_find].error !== '') {
      _clone[_find].error = '';
    }
    if (name === 'jsonValue') {
      _clone[_find].jsonValue = event;
    } else if (
      (event.target.name === 'value' || event.target.name === 'defaultValue') &&
      _clone[_find].type === 'number'
    ) {
      if (event.target.value === '' || /^\d+$/.test(event.target.value)) {
        if (event.target.value === '') {
          _clone[_find][name] = '';
        } else {
          _clone[_find][name] = Number(event.target.value);
        }
      }
    } else if (
      event.target.name === 'is_required' ||
      ((event.target.name === 'value' || event.target.name === 'defaultValue') &&
        _clone[_find].type === 'boolean')
    ) {
      _clone[_find][name] = event.target.checked;
    } else if (event.target.name === 'min' || event.target.name === 'max') {
      if (event.target.value === '' || /^\d+$/.test(event.target.value)) {
        if (event.target.value === '') {
          _clone[_find].value[event.target.name] = '';
        } else {
          _clone[_find].value[event.target.name] = Number(event.target.value);
        }
      }
    } else if (event.target.name === 'init' || event.target.name === 'range') {
      if (event.target.value === '' || /^\d+$/.test(event.target.value)) {
        if (event.target.value === '') {
          _clone[_find].defaultValue[event.target.name][name] = '';
        } else {
          _clone[_find].defaultValue[event.target.name][name] = Number(event.target.value);
        }
      }
    } else if (name === 'key') {
      const isExist = _clone.find((i) => i.key === event.target.value);
      if (isExist) {
        _clone[_find].error = 'Key is exist';
      }
      _clone[_find][name] = event.target.value;
    } else {
      _clone[_find][name] = event.target.value;

      if (event.target.name === 'type') {
        switch (event.target.value) {
          case 'text':
            _clone[_find].value = '';
            _clone[_find].defaultValue = '';
            break;
          case 'number':
            _clone[_find].value = 0;
            _clone[_find].defaultValue = 0;
            break;
          case 'boolean':
            _clone[_find].value = false;
            _clone[_find].defaultValue = false;
            _clone[_find].is_required = false;
            // _clone[_find].description = '';
            break;
          case 'object':
            _clone[_find].jsonValue = '{}';
            break;
          case 'list':
            _clone[_find].jsonValue = '[]';
            break;
          default:
            _clone[_find].value = { min: 0, max: 0 };
            _clone[_find].defaultValue = { init: { min: 0, max: 0 }, range: { min: 0, max: 0 } };
            _clone[_find].is_required = false;
            // _clone[_find].description = '';
            break;
        }
      }
    }

    setVariables(_clone);
  };

  const selectFile = (event, id) => {
    const file = event.target.files[0];
    const _clone = cloneDeep(variables);
    const _find = _clone.findIndex((i) => i.id === itemClicking);
    _clone[_find].value = isElectron() ? file?.path : file?.name;
    setVariables(_clone);

    const inputElement = document.getElementById(itemClicking);
    if (inputElement) {
      inputElement.value = isElectron() ? file?.path : file?.name;
      const inputEvent = new Event('input', { bubbles: true });

      inputElement.dispatchEvent(inputEvent);
    }

    popover.onClose();
  };

  const selectFolder = async (event) => {
    if (isElectron()) {
      const _clone = cloneDeep(variables);
      const _find = _clone.findIndex((i) => i.id === itemClicking);
      const path_file = await window.ipcRenderer.invoke('open-directory-dialog');
      _clone[_find].value = path_file;
      setVariables(_clone);

      const inputElement = document.getElementById(itemClicking);
      if (inputElement) {
        inputElement.value = path_file;
        const inputEvent = new Event('input', { bubbles: true });
        inputElement.dispatchEvent(inputEvent);
      }
    }

    popover.onClose();
  };

  const deleteVariable = (id) => {
    const _find = variables.findIndex((i) => i.id === id);
    const _clone = cloneDeep(variables);
    _clone.splice(_find, 1);
    setVariables(_clone);
  };

  const onDragEnd = useCallback(
    async ({ destination, source, draggableId, type }) => {
      if (!destination) {
        return;
      }

      if (destination.index === source.index) {
        return;
      }

      const _clone = cloneDeep(variables);
      const [removed] = _clone.splice(source.index, 1);
      _clone.splice(destination.index, 0, removed);

      setVariables(_clone);
    },
    [variables]
  );

  const inputTextFileRef = useRef(null);
  const inputExcelFileRef = useRef(null);
  const inputJsonFileRef = useRef(null);
  const inputImageFileRef = useRef(null);

  const [isVariableUpdated, setIsVariableUpdated] = useState(false);

  useEffect(() => {
    if (variableFlow?.list && open) {
      setVariables(
        [...variableFlow.list].map((i) => ({
          ...i,
          isNew: false,
          is_required: i.is_required ?? true,
          type: i?.type ?? 'text',
          defaultValue: i?.defaultValue ?? '',
          label: i?.label ?? '',
          error: '',
        }))
      );
      setIsVariableUpdated(true);
    }
  }, [variableFlow?.list, open]);

  useEffect(() => {
    if (addOne && open && isVariableUpdated) {
      addNewVariable();
      setIsVariableUpdated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addOne, open, isVariableUpdated]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      if (variables.length > 0) {
        requestAnimationFrame(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <Dialog fullWidth maxWidth="sm" open={open} {...other}>
        <DialogTitle sx={{ paddingBottom: '10px' }}>
          {t('workflow.script.dialog.variable.title')}
        </DialogTitle>
        <Stack direction="row" alignItems="center" pl={3}>
          <Iconify icon="lucide:asterisk" color="error.main" />
          <Typography
            sx={{
              fontSize: 14,
              fontStyle: 'italic',
            }}
          >
            {t('workflow.script.dialog.variable.subTitle')}
          </Typography>
        </Stack>
        <DialogContent
          sx={{
            ...(variables.length > 4 && {
              pr: 2,
            }),
          }}
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <Stack spacing={2} mt={2} width={1}>
              <Stack sx={styleOptions} spacing={1} width={1} mr={-1}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    backgroundColor:
                      themeMode === 'light' ? '#ffffff' : (theme) => theme.palette.grey[800],
                    py: 1,
                  }}
                >
                  <Typography variant="body2">
                    {t('workflow.script.dialog.variable.title')}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                    onClick={() => addNewVariable()}
                  >
                    {t('workflow.script.actions.add')}
                  </Button>
                </Stack>

                {loading ? (
                  <Stack spacing={1} py={1} width={1}>
                    {[...Array(Math.min(variables?.length || 3, 6))].map((_, index) => (
                      <Stack
                        key={index}
                        spacing={2}
                        width={1}
                        sx={{
                          p: 2,
                          height: '133px',
                          borderRadius: 1.5,
                          cursor: 'move',
                          bgcolor:
                            index % 2 === 0
                              ? (theme) => alpha(theme.palette.grey[400], 0.08)
                              : (theme) => alpha(theme.palette.grey[900], 0.08),
                          position: 'relative',
                          border: '1px solid',
                          borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                          zIndex: 10,
                        }}
                      >
                        <Stack direction="row" spacing={2}>
                          <Skeleton
                            sx={{
                              width: 1,
                              height: '39px',
                              borderRadius: 1,
                            }}
                          />
                          <Skeleton
                            sx={{
                              width: 1,
                              height: '39px',
                              borderRadius: 1,
                            }}
                          />
                        </Stack>
                        <Skeleton
                          sx={{
                            width: 1,
                            height: '39px',
                            borderRadius: 1,
                          }}
                        />
                      </Stack>
                    ))}
                  </Stack>
                ) : (
                  <Droppable droppableId="listVariable" type="LIST">
                    {(provided) => (
                      <Stack
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        spacing={1}
                        py={1}
                        width={1}
                        sx={{
                          ...(variables.length === 0 && {
                            display: 'none',
                          }),
                        }}
                      >
                        {variables &&
                          variables.map((item, index) => (
                            <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                              {(dragProvided, snapshot) => (
                                <Stack
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  // {...dragProvided.dragHandleProps}
                                  spacing={2}
                                  width={1}
                                  sx={{
                                    position: 'relative',
                                    p: 2,
                                    borderRadius: 1.5,
                                    bgcolor:
                                      index % 2 === 0
                                        ? (theme) => alpha(theme.palette.grey[400], 0.08)
                                        : (theme) => alpha(theme.palette.grey[900], 0.08),
                                    border: '1px solid',
                                    borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                                    zIndex: 10,
                                    ...(snapshot.isDragging && {
                                      boxShadow: (theme) => theme.customShadows.z8,
                                    }),
                                  }}
                                >
                                  <div
                                    {...dragProvided.dragHandleProps}
                                    style={{
                                      position: 'absolute',
                                      inset: 0,
                                    }}
                                  />
                                  {(() => {
                                    const isTextType = item.type === 'text';
                                    const isListType = item.type === 'list';
                                    const isObjectType = item.type === 'object';
                                    const isNumberType = item.type === 'number';
                                    const isBooleanType = item.type === 'boolean';
                                    const isRangeType = item.type === 'range';
                                    const isRangeError =
                                      item?.defaultValue?.range?.min >
                                      item?.defaultValue?.range?.max;
                                    const isInitError =
                                      item?.defaultValue?.init?.min > item?.defaultValue?.init?.max;
                                    const isMaxError = item?.value?.min > item?.value?.max;

                                    return (
                                      <>
                                        <VariableField
                                          item={item}
                                          index={index}
                                          updateVariable={updateVariable}
                                          focus={focus}
                                          variables={variables}
                                          setItemClicking={setItemClicking}
                                          popover={popover}
                                          isFromMarket={isFromMarket}
                                          isTextType={isTextType}
                                          isListType={isListType}
                                          isObjectType={isObjectType}
                                          isNumberType={isNumberType}
                                          isBooleanType={isBooleanType}
                                          isRangeType={isRangeType}
                                          isMaxError={isMaxError}
                                          t={t}
                                          themeMode={themeMode}
                                          setJsonValueUpdate={setJsonValueUpdate}
                                        />

                                        {!hiddenUiSetting && (
                                          <VariableAdvanceSetting
                                            item={item}
                                            updateVariable={updateVariable}
                                            setItemClicking={setItemClicking}
                                            popover={popover}
                                            isFromMarket={isFromMarket}
                                            addOne={addOne}
                                            t={t}
                                            isBooleanType={isBooleanType}
                                            isRangeType={isRangeType}
                                            isNumberType={isNumberType}
                                            isTextType={isTextType}
                                            isInitError={isInitError}
                                            isRangeError={isRangeError}
                                          />
                                        )}
                                      </>
                                    );
                                  })()}

                                  <Iconify
                                    onClick={() => deleteVariable(item.id)}
                                    icon="carbon:close-filled"
                                    sx={{
                                      width: '35px',
                                      color: 'text.disabled',
                                      position: 'absolute',
                                      top: -6,
                                      right: -14,
                                      '&:hover': { cursor: 'pointer', color: 'text.primary' },
                                    }}
                                  />
                                </Stack>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </Stack>
                    )}
                  </Droppable>
                )}
              </Stack>
            </Stack>
          </DragDropContext>
          <CustomPopover
            open={popover.open}
            onClose={(event) => {
              event.stopPropagation();
              popover.onClose();
            }}
            sx={{
              width: 180,
            }}
            TransitionComponent={Zoom}
            arrow="top-right"
          >
            <Stack>
              <CustomTooltip title="Not permission" placement="right">
                <MenuItem
                  onClick={() => {
                    inputTextFileRef.current.click();
                  }}
                >
                  <Iconify icon="gala:file-text" />
                  {t('workflow.script.actions.chooseTextFile')}
                  <input
                    type="file"
                    accept=".txt"
                    hidden
                    onChange={(event) => selectFile(event)}
                    ref={inputTextFileRef}
                  />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    inputExcelFileRef.current.click();
                  }}
                >
                  <Iconify icon="mdi:file-excel-outline" />
                  {t('workflow.script.actions.chooseExcelFile')}
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    hidden
                    onChange={(event) => selectFile(event)}
                    ref={inputExcelFileRef}
                  />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    inputJsonFileRef.current.click();
                  }}
                >
                  <Iconify icon="bi:filetype-json" />
                  {t('workflow.script.actions.chooseJsonFile')}
                  <input
                    type="file"
                    accept=".json"
                    hidden
                    onChange={(event) => selectFile(event)}
                    ref={inputJsonFileRef}
                  />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    inputImageFileRef.current.click();
                  }}
                >
                  <Iconify icon="ic:outline-image" />
                  {t('workflow.script.actions.chooseImageFile')}
                  <input
                    type="file"
                    accept=".png, .jpg, .jpeg, .gif, .svg"
                    hidden
                    onChange={(event) => selectFile(event)}
                    ref={inputImageFileRef}
                  />
                </MenuItem>
                <MenuItem onClick={selectFolder}>
                  <Iconify icon="ph:folder" />
                  {t('workflow.script.actions.chooseFolder')}
                </MenuItem>
              </CustomTooltip>
            </Stack>
          </CustomPopover>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onCancel}>
            {t('workflow.script.actions.close')}
          </Button>
          <LoadingButton type="submit" variant="contained" color="primary" onClick={submitForm}>
            {t('workflow.script.actions.saveChange')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={!!jsonValueUpdate.id}
        onClose={() => {
          setJsonValueUpdate({
            id: '',
            value: '[]',
          });
        }}
        sx={{
          '& .MuiPaper-root.MuiPaper-elevation': {
            position: 'relative',
            overflow: 'revert',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            pb: 1.5,
          }}
        >
          <IconButton
            onClick={() => {
              setJsonValueUpdate({
                id: '',
                value: '[]',
              });
            }}
            sx={{
              p: 1,
              bgcolor: (theme) => alpha(theme.palette.grey[themeMode === 'dark' ? 700 : 300], 1),
              // boxShadow: (theme) => theme.customShadows.z8,
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 1,
              transform: 'translate(40%, -40%)',
              color: 'text.primary',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.grey[themeMode === 'dark' ? 700 : 300], 1),
              },
            }}
          >
            <Iconify icon="ic:round-close" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            pb: 3,
          }}
        >
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
              defaultValue={jsonValueUpdate.value}
              onChange={debounce(
                (value) => updateVariable('jsonValue', value, jsonValueUpdate.id),
                200
              )}
              loading={<LoadingScreen />}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(Variables);

Variables.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  updateVariableAction: PropTypes.func,
  isFromMarket: PropTypes.bool,
  addOne: PropTypes.bool,
  defaultType: PropTypes.string,
};

const VariableField = memo(
  ({
    item,
    index,
    updateVariable,
    focus,
    variables,
    setItemClicking,
    popover,
    isFromMarket,
    isTextType,
    isListType,
    isObjectType,
    isNumberType,
    isBooleanType,
    isRangeType,
    isMaxError,
    t,
    themeMode,
    setJsonValueUpdate,
  }) => (
    <Grid container spacing={2} pt={1}>
      <Grid item xs={isTextType || isListType || isObjectType ? 6 : 5}>
        <TextField
          select
          fullWidth
          label={t('workflow.script.dialog.variable.label.datatypes')}
          size="small"
          name="type"
          value={item?.type ?? 'text'}
          onChange={(e) => updateVariable('type', e, item.id)}
        >
          {TYPE_OPTIONS.map((i) => (
            <MenuItem key={i.value} value={i.value}>
              {i.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {!(isTextType || isListType || isObjectType) && <Grid item xs={7} />}

      <Grid item xs={isTextType || isListType || isObjectType ? 6 : 5}>
        <TextField
          fullWidth
          error={item.error !== ''}
          label={t('workflow.script.dialog.variable.label.key')}
          onChange={debounce((e) => updateVariable('key', e, item.id), 200)}
          size="small"
          name="key"
          defaultValue={item.key}
          helperText={item.error}
          autoFocus={focus && variables.length === index + 1}
        />
      </Grid>

      <Grid item xs={isTextType || isListType || isObjectType ? 12 : 7}>
        {isNumberType && (
          <TextField
            fullWidth
            error={false}
            label={t('workflow.script.dialog.variable.label.value')}
            onChange={(e) => updateVariable('value', e, item.id)}
            size="small"
            name="value"
            value={item.value}
            placeholder={isFromMarket ? item?.description : ''}
            InputLabelProps={{
              ...(isFromMarket && {
                shrink: true,
              }),
            }}
            sx={{
              '& .MuiInputBase-root': {
                pr: 1,
              },
            }}
          />
        )}

        {isTextType && (
          <TextField
            fullWidth
            error={false}
            label={t('workflow.script.dialog.variable.label.value')}
            onChange={debounce((e) => updateVariable('value', e, item.id), 200)}
            size="small"
            name="value"
            defaultValue={item.value}
            placeholder={isFromMarket ? item?.description : ''}
            InputLabelProps={{
              // ...(isFromMarket && {
              shrink: true,
              // }),
            }}
            sx={{
              '& .MuiInputBase-root': {
                pr: 1,
              },
            }}
            id={String(item.id)}
            // inputProps={{
            //   id: item.id,
            // }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={t('workflow.script.actions.moreAction')} value-index={item.id}>
                    <IconButton
                      onClick={(event) => {
                        event.stopPropagation();
                        setItemClicking(item.id);
                        popover.onOpen(event);
                      }}
                      sx={{
                        border: '1px solid #eeeeee24',
                        p: '2px',
                      }}
                    >
                      <Iconify icon="icon-park-outline:more" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        )}

        <Box
          sx={{
            width: 1,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            boxShadow: (theme) => theme.customShadows.z8,
            height: '100px',
            overflow: 'hidden',
            ...(!isListType &&
              !isObjectType && {
                display: 'none',
              }),
            position: 'relative',
          }}
          draggable={false}
        >
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 20,
              zIndex: 1,
              borderRadius: 1,
              padding: 0.5,
            }}
            onClick={() => {
              setJsonValueUpdate({
                id: item.id,
                value: item.jsonValue,
              });
            }}
          >
            <Iconify icon="mdi-light:fullscreen" />
          </IconButton>
          <Editor
            language="json"
            theme={`vs-${themeMode}`}
            value={item.jsonValue}
            onChange={(value) => updateVariable('jsonValue', value, item.id)}
            loading={<LoadingScreen />}
          />
        </Box>

        {isBooleanType && (
          <FormControlLabel
            label={item?.value ? 'True' : 'False'}
            control={
              <Switch
                name="value"
                checked={!!item?.value}
                onChange={(e) => updateVariable('value', e, item.id)}
              />
            }
            sx={{
              '&.MuiFormControlLabel-root': {
                width: 'fit-content',
              },
            }}
          />
        )}

        {isRangeType && (
          <Stack direction="row" spacing={2} width={1}>
            <Tooltip title={t('workflow.script.dialog.variable.tooltip.min')}>
              <TextField
                // type="number"
                fullWidth
                error={isMaxError}
                label="Min"
                onChange={(e) => updateVariable('min', e, item.id)}
                size="small"
                name="min"
                value={item?.value?.min}
              />
            </Tooltip>
            <Tooltip title={t('workflow.script.dialog.variable.tooltip.max')}>
              <TextField
                // type="number"
                fullWidth
                error={isMaxError}
                label="Max"
                onChange={(e) => updateVariable('max', e, item.id)}
                size="small"
                name="max"
                value={item?.value?.max}
              />
            </Tooltip>
          </Stack>
        )}
      </Grid>
    </Grid>
  )
);

const VariableAdvanceSetting = memo(
  ({
    item,
    updateVariable,
    setItemClicking,
    popover,
    isFromMarket,
    addOne,
    t,
    isBooleanType,
    isRangeType,
    isNumberType,
    isTextType,
    isInitError,
    isRangeError,
  }) => {
    const [expanded, setExpanded] = useState(false);
    return (
      !addOne &&
      !isFromMarket && (
        <Accordion
          slots={{ transition: Fade }}
          expanded={expanded}
          onChange={(_, value) => {
            setExpanded(value);
          }}
        >
          <AccordionSummary
            expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
            sx={{
              '& .MuiAccordionSummary-content': {
                mb: 0.5,
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">
                {t('workflow.script.dialog.variable.setting.title')}
              </Typography>
              <Tooltip
                title={t('workflow.script.dialog.variable.setting.subTitle')}
                placement="top"
              >
                <Iconify icon="ph:info" color="text.secondary" />
              </Tooltip>
            </Stack>
          </AccordionSummary>
          {expanded && (
            <AccordionDetails>
              <Stack spacing={2}>
                {!isBooleanType && !isRangeType && (
                  <FormControlLabel
                    label={t('workflow.script.dialog.variable.label.obligatory')}
                    control={
                      <Checkbox
                        name="is_required"
                        checked={item?.is_required ?? true}
                        onChange={(e) => updateVariable('is_required', e, item.id)}
                      />
                    }
                    sx={{ width: 'fit-content' }}
                  />
                )}

                <Stack direction="row" spacing={2}>
                  {!isBooleanType && !isRangeType && (
                    <TextField
                      error={false}
                      label="Label"
                      onChange={debounce((e) => updateVariable('label', e, item.id), 200)}
                      size="small"
                      name="label"
                      defaultValue={item.label ?? ''}
                      InputLabelProps={{
                        ...(isFromMarket && {
                          shrink: true,
                        }),
                      }}
                      sx={{
                        width: isFromMarket ? 0.6 : 0.6,
                        '& .MuiInputBase-root': {
                          pr: 1,
                        },
                      }}
                    />
                  )}

                  {isNumberType && (
                    <TextField
                      error={false}
                      label={t('workflow.script.dialog.variable.label.defaultValue')}
                      onChange={(e) => updateVariable('defaultValue', e, item.id)}
                      size="small"
                      name="defaultValue"
                      value={item.defaultValue}
                      placeholder={isFromMarket ? item?.description : ''}
                      InputLabelProps={{
                        ...(isFromMarket && {
                          shrink: true,
                        }),
                      }}
                      sx={{
                        width: isFromMarket ? 0.6 : 0.6,
                        '& .MuiInputBase-root': {
                          pr: 1,
                        },
                      }}
                    />
                  )}

                  {isTextType && (
                    <TextField
                      error={false}
                      label={t('workflow.script.dialog.variable.label.defaultValue')}
                      onChange={debounce((e) => updateVariable('defaultValue', e, item.id), 200)}
                      size="small"
                      name="defaultValue"
                      defaultValue={item.defaultValue}
                      placeholder={isFromMarket ? item?.description : ''}
                      InputLabelProps={{
                        ...(isFromMarket && {
                          shrink: true,
                        }),
                      }}
                      sx={{
                        width: isFromMarket ? 0.6 : 0.6,
                        '& .MuiInputBase-root': {
                          pr: 1,
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip
                              title={t('workflow.script.actions.moreAction')}
                              value-index={item.id}
                            >
                              <IconButton
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setItemClicking(item.id);
                                  popover.onOpen(event);
                                }}
                                sx={{
                                  border: '1px solid #eeeeee24',
                                  p: '2px',
                                }}
                              >
                                <Iconify icon="icon-park-outline:more" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}

                  {isBooleanType && (
                    <Stack>
                      <Typography variant="body2" color="text.secondary">
                        {t('workflow.script.dialog.variable.label.defaultValue')}
                      </Typography>
                      <FormControlLabel
                        label={item?.defaultValue ? 'True' : 'False'}
                        control={
                          <Switch
                            name="defaultValue"
                            checked={!!item?.defaultValue}
                            onChange={(e) => updateVariable('defaultValue', e, item.id)}
                          />
                        }
                        sx={{
                          width: 0.6,
                          '&.MuiFormControlLabel-root': {
                            width: 'fit-content',
                          },
                        }}
                      />
                    </Stack>
                  )}

                  {isRangeType && (
                    <Stack direction="row" spacing={2}>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          {t('workflow.script.dialog.variable.label.defaultValue')}
                        </Typography>
                        <Stack direction="row" spacing={1} width={1}>
                          <TextField
                            // type="number"
                            error={isInitError}
                            fullWidth
                            label="Min"
                            onChange={(e) => updateVariable('min', e, item.id)}
                            size="small"
                            name="init"
                            value={item?.defaultValue?.init?.min}
                          />
                          <TextField
                            // type="number"
                            error={isInitError}
                            fullWidth
                            label="Max"
                            onChange={(e) => updateVariable('max', e, item.id)}
                            size="small"
                            name="init"
                            value={item?.defaultValue?.init?.max}
                          />
                        </Stack>
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          {t('workflow.script.dialog.variable.label.limitedValue')}
                        </Typography>
                        <Stack direction="row" spacing={1} width={1}>
                          <TextField
                            // type="number"
                            error={isRangeError}
                            fullWidth
                            label="Min"
                            onChange={(e) => updateVariable('min', e, item.id)}
                            size="small"
                            name="range"
                            value={item?.defaultValue?.range?.min}
                          />
                          <TextField
                            // type="number"
                            error={isRangeError}
                            fullWidth
                            label="Max"
                            onChange={(e) => updateVariable('max', e, item.id)}
                            size="small"
                            name="range"
                            value={item?.defaultValue?.range?.max}
                          />
                        </Stack>
                      </Stack>
                    </Stack>
                  )}
                </Stack>

                {!isBooleanType && !isRangeType ? (
                  <TextField
                    error={false}
                    label={t('workflow.script.dialog.variable.label.description')}
                    onChange={debounce((e) => updateVariable('description', e, item.id), 200)}
                    size="small"
                    name="description"
                    defaultValue={item?.description}
                    sx={{ width: 1 }}
                  />
                ) : (
                  <TextField
                    error={false}
                    label="Label"
                    onChange={debounce((e) => updateVariable('label', e, item.id), 200)}
                    size="small"
                    name="label"
                    defaultValue={item.label ?? ''}
                    InputLabelProps={{
                      ...(isFromMarket && {
                        shrink: true,
                      }),
                    }}
                    sx={{
                      width: isFromMarket ? 1 : 1,
                      '& .MuiInputBase-root': {
                        pr: 1,
                      },
                    }}
                  />
                )}
              </Stack>
            </AccordionDetails>
          )}
        </Accordion>
      )
    );
  }
);
