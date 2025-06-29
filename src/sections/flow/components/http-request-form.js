import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import Iconify from 'src/components/iconify';

// components
import { cloneDeep, debounce } from 'lodash';
import eventBus from 'src/sections/script/event-bus';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import { METHOD_OPTIONS } from 'src/utils/constance';
import {
  Autocomplete,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  IconButton,
} from '@mui/material';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { alpha, styled } from '@mui/material/styles';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary, { accordionSummaryClasses } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { Editor } from '@monaco-editor/react';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  backgroundColor: 'transparent',
  border: '1px solid #eeeeee24',
  borderRadius: '4px',
  '& .MuiAccordionSummary-content': {
    margin: 0,
  },
  '&.Mui-expanded': {
    margin: 0,
    boxShadow: 'none',
  },
  '& .MuiButtonBase-root.MuiAccordionSummary-root.Mui-expanded': {
    minHeight: '48px',
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary expandIcon={<Iconify icon="mingcute:right-line" />} {...props} />
))(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]: {
    transform: 'rotate(90deg)',
  },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

// ----------------------------------------------------------------------

export default function HttpRequestForm({ formData, IdNode }) {
  const { dataFields } = formData;
  const variableModal = useBoolean();
  const dataVariableModal = useBoolean();
  const { variableFlow } = useAuthContext();
  const { themeMode } = useSettingsContext();
  const open = useBoolean();
  const [script, setScript] = useState(formData?.dataFields?.json_string_data ?? '');

  const fetchVariables = useMemo(() => {
    if (variableFlow?.list === null || variableFlow?.list?.length === 0) return [];

    return variableFlow?.list.map((i, index) => ({
      ...i,
      lastItem: index + 1 === variableFlow.list.length,
    }));
  }, [variableFlow?.list]);

  // PARAMS
  const addNewParam = () => {
    const _clone = cloneDeep(dataFields.params);
    _clone.push({ id: _clone.length + Math.random(), key: '', value: '' });

    pushEventChange('params', _clone);
  };

  const updateParam = (name, event, id) => {
    const _clone = cloneDeep(dataFields.params);
    const _find = _clone.findIndex((i) => i.id === id);
    _clone[_find][name] = event.target.value;
    pushEventChange('params', _clone);
  };

  const getURLParamVariable = (name, value, id) => {
    if (value) {
      const _clone = cloneDeep(dataFields.params);
      const _find = _clone.findIndex((i) => i.id === id);
      _clone[_find][name] = value;
      pushEventChange('params', _clone);
    }
  };

  const deleteParam = (id) => {
    const _find = dataFields.params.findIndex((i) => i.id === id);
    const _clone = cloneDeep(dataFields.params);
    _clone.splice(_find, 1);
    pushEventChange('params', _clone);
  };

  // REQUEST
  const addNewRequest = () => {
    const _clone = cloneDeep(typeof dataFields.data === 'string' ? [] : dataFields.data);
    _clone.push({ id: _clone.length + Math.random(), key: '', value: '' });
    pushEventChange('data', _clone);
  };

  const updateRequest = (name, event, id) => {
    const _clone = cloneDeep(dataFields.data);
    const _find = _clone.findIndex((i) => i.id === id);
    _clone[_find][name] = event.target.value;
    pushEventChange('data', _clone);
  };

  const getRequestVariable = (name, value, id) => {
    if (value) {
      const _clone = cloneDeep(dataFields.data);
      const _find = _clone.findIndex((i) => i.id === id);
      _clone[_find][name] = value;
      pushEventChange('data', _clone);
    }
  };

  const deleteRequest = (id) => {
    const _find = dataFields.data.findIndex((i) => i.id === id);
    const _clone = cloneDeep(dataFields.data);
    _clone.splice(_find, 1);
    pushEventChange('data', _clone);
  };

  // REQUEST
  const addNewCustomerHeader = () => {
    const _clone = cloneDeep(dataFields.headers);
    _clone.push({ id: _clone.length + Math.random(), key: '', value: '' });
    pushEventChange('headers', _clone);
  };

  const updateCustomerHeader = (name, event, id) => {
    const _clone = cloneDeep(dataFields.headers);
    const _find = _clone.findIndex((i) => i.id === id);
    _clone[_find][name] = event.target.value;
    pushEventChange('headers', _clone);
  };

  const getCustomerVariable = (name, value, id) => {
    if (value) {
      const _clone = cloneDeep(dataFields.headers);
      const _find = _clone.findIndex((i) => i.id === id);
      _clone[_find][name] = value;
      pushEventChange('headers', _clone);
    }
  };

  const deleteCustomerHeader = (id) => {
    const _find = dataFields.headers.findIndex((i) => i.id === id);
    const _clone = cloneDeep(dataFields.headers);
    _clone.splice(_find, 1);
    pushEventChange('headers', _clone);
  };

  const handleChangeNumberSecond = (event) => {
    const { name, value } = event.target;
    if (name === 'response_type' && value === 'text') {
      eventBus.emit('updateNode', { data: { [name]: value, path_data: '' }, idNode: IdNode });
    } else {
      eventBus.emit('updateNode', { data: { [name]: value }, idNode: IdNode });
    }
  };

  const pushEventChange = (nameField, data) => {
    eventBus.emit('updateNode', { data: { [nameField]: data }, idNode: IdNode });
  };

  const getVariable = (name, item) => {
    eventBus.emit('updateNode', { data: { [name]: `\${${item.key}}` }, idNode: IdNode });
  };

  const editorRef = useRef(null);

  const handleDidMount = useCallback(
    (editor, monaco) => {
      const timer = setTimeout(() => {
        editorRef.current = editor;

        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: false,
        });

        monaco.languages.setMonarchTokensProvider('json', {
          tokenizer: {
            root: [
              [/\{\{[a-zA-Z0-9_]+\}\}/, 'custom-variable'],
              [/[{}]/, 'delimiter.bracket'],
              [/[,:]/, 'delimiter'],
              [/"[^"]*"/, 'string'],
              [/\s+/, 'white'],
            ],
          },
        });

        monaco.editor.defineTheme('customJsonTheme', {
          base: `vs${themeMode === 'light' ? '' : '-dark'}`,
          inherit: true,
          rules: [{ token: 'custom-variable', foreground: '00B8D9', fontStyle: 'bold' }],
          colors: {},
        });

        monaco.editor.setTheme('customJsonTheme');

        editor.onDidChangeCursorPosition(
          debounce(
            (e) => {
              const cursorPosition = editor.getPosition();
              setFocusPosition({
                startLineNumber: cursorPosition?.lineNumber,
                startColumn: cursorPosition?.column,
                endLineNumber: cursorPosition?.lineNumber,
                endColumn: cursorPosition?.column,
              });
            },
            [600]
          )
        );
      }, [10]);
      return () => clearTimeout(timer);
    },
    [themeMode]
  );

  const editorOptions = useMemo(
    () => ({
      formatOnPaste: true,
      formatOnType: true,
      minimap: { enabled: false },
      scrollbar: {
        handleMouseWheel: true,
        alwaysConsumeMouseWheel: false,
      },
    }),
    []
  );

  const [focusPosition, setFocusPosition] = useState({
    startLineNumber: 2,
    startColumn: 4,
    endLineNumber: 2,
    endColumn: 4,
  });

  const applyCodeAtPosition = (key, position) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const edits = [
        {
          range: position,
          text: `{{${key}}}`,
          forceMoveMarkers: false,
        },
      ];

      editor.executeEdits('my-source', edits);

      setFocusPosition((prev) => ({
        ...prev,
        startLineNumber: prev.startLineNumber,
        endLineNumber: prev.startLineNumber,
      }));

      setScript(editor.getValue());
    }
  };

  const renderEditor = useCallback(
    () => (
      <Editor
        language="json"
        theme={`vs-${themeMode}`}
        defaultValue={script ?? ''}
        onChange={debounce((value) => setScript(value), 600)}
        options={editorOptions}
        onMount={handleDidMount}
        loading={<LoadingScreen />}
      />
    ),
    [editorOptions, handleDidMount, script, themeMode]
  );

  useEffect(
    () => () => {
      eventBus.emit('updateNode', {
        data: { json_string_data: script },
        idNode: IdNode,
      });
    },
    [IdNode, script]
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
        <TextField
          type="text"
          name="url"
          label="URL"
          onChange={handleChangeNumberSecond}
          value={dataFields?.url ?? ''}
          InputProps={{
            endAdornment: (
              <PositionedMenu
                name="url"
                getVariable={getVariable}
                openVariableModal={variableModal.onTrue}
              />
            ),
          }}
        />

        <TextField
          select
          fullWidth
          name="method"
          label="Method"
          value={dataFields?.method ?? ''}
          onChange={handleChangeNumberSecond}
        >
          {METHOD_OPTIONS.map((item) => (
            <MenuItem key={item.id} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>

        <Accordion slots={{ transition: Fade }} defaultExpanded>
          <AccordionSummary>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              width={1}
              pl={0.5}
            >
              <Typography variant="body2">URL Parameter</Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  addNewParam();
                }}
              >
                Thêm
              </Button>
            </Stack>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              pt: 1,
              ...(dataFields?.params?.length === 0 && { p: 0 }),
            }}
          >
            <Stack spacing={1}>
              {dataFields?.params?.map((item) => (
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
                      onChange={(e) => updateParam('key', e, item.id)}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      value={item.value}
                      error={false}
                      label="Value"
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
          </AccordionDetails>
        </Accordion>

        <Accordion slots={{ transition: Fade }} defaultExpanded>
          <AccordionSummary>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              width={1}
              pl={0.5}
            >
              <Typography variant="body2">Custom Header</Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  addNewCustomerHeader();
                }}
              >
                Thêm
              </Button>
            </Stack>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              pt: 1,
              ...(dataFields?.headers?.length === 0 && { p: 0 }),
            }}
          >
            <Stack spacing={1}>
              {dataFields?.headers?.map((item) => (
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
                      onChange={(e) => updateCustomerHeader('key', e, item.id)}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      value={item.value}
                      error={false}
                      label="Value"
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
          </AccordionDetails>
        </Accordion>

        {['POST', 'PUT', 'PATCH'].includes(dataFields?.method) && (
          <>
            <TextField
              select
              fullWidth
              name="content_type"
              label="Content Type"
              value={dataFields?.content_type ?? 'json'}
              onChange={handleChangeNumberSecond}
            >
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="form_multipart">Form-Data</MenuItem>
              <MenuItem value="form_urlencoded">Form-Urlencoded</MenuItem>
              <MenuItem value="text">Text</MenuItem>
            </TextField>

            {dataFields?.content_type === 'json' && (
              <Stack spacing={1}>
                <Typography ml={1} color="text.secondary" variant="body2">
                  Body
                </Typography>
                <Box
                  sx={{
                    width: 1,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                    boxShadow: (theme) => theme.customShadows.z8,
                    height: '200px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {!open.value && (
                    <PositionedMenu
                      typeof
                      name="json_string_data"
                      handleSelectVariable={(key) => {
                        applyCodeAtPosition(key, focusPosition);
                      }}
                      openVariableModal={variableModal.onTrue}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 33,
                        zIndex: 1,
                        borderRadius: 1,
                        padding: 0.5,
                        width: 32,
                        height: 32,
                      }}
                    />
                  )}
                  {!open.value && renderEditor()}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 20,
                      zIndex: 1,
                      borderRadius: 1,
                      padding: 0.5,
                    }}
                    onClick={open.onTrue}
                  >
                    <Iconify icon="mdi-light:fullscreen" width={24} />
                  </IconButton>
                </Box>
              </Stack>
            )}
            {['text'].includes(dataFields?.content_type) && (
              <TextField
                multiline
                rows={4}
                type="text"
                name="data"
                label="Text"
                onChange={handleChangeNumberSecond}
                value={typeof dataFields?.data === 'object' ? '' : dataFields?.data}
                InputProps={{
                  endAdornment: (
                    <PositionedMenu
                      typeof
                      name="data"
                      getVariable={getVariable}
                      openVariableModal={variableModal.onTrue}
                    />
                  ),
                }}
              />
            )}

            {['form_multipart', 'form_urlencoded'].includes(dataFields?.content_type) && (
              <Accordion slots={{ transition: Fade }} defaultExpanded>
                <AccordionSummary>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    width={1}
                    pl={0.5}
                  >
                    <Typography variant="body2">
                      {dataFields?.content_type === 'form_multipart'
                        ? 'Form-Data'
                        : 'Form-Urlencoded'}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        addNewRequest();
                      }}
                    >
                      Thêm
                    </Button>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    pt: 1,
                    ...((typeof dataFields?.data === 'string' ||
                      dataFields?.data?.length === 0) && { p: 0 }),
                  }}
                >
                  <Stack spacing={1}>
                    {typeof dataFields?.data === 'object' &&
                      dataFields?.data?.length > 0 &&
                      dataFields?.data?.map((item) => (
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
                              onChange={(e) => updateRequest('key', e, item.id)}
                              size="small"
                            />
                            <TextField
                              fullWidth
                              value={item.value}
                              error={false}
                              label="Value"
                              onChange={(e) => updateRequest('value', e, item.id)}
                              size="small"
                              InputProps={{
                                endAdornment: (
                                  <PositionedMenu
                                    getVariable={(value) =>
                                      getRequestVariable('value', value, item.id)
                                    }
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
                </AccordionDetails>
              </Accordion>
            )}
          </>
        )}

        <TextField
          select
          fullWidth
          name="response_type"
          label="Response Type"
          value={dataFields?.response_type ?? ''}
          onChange={handleChangeNumberSecond}
        >
          <MenuItem value="json">JSON</MenuItem>
          <MenuItem value="text">Text</MenuItem>
          <MenuItem value="arraybuffer">ArrayBuffer</MenuItem>
        </TextField>

        {dataFields?.response_type === 'json' && (
          <TextField
            type="text"
            name="path_data"
            label="Data Path"
            placeholder="data.to.path"
            onChange={handleChangeNumberSecond}
            value={dataFields?.path_data ?? ''}
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="path_data"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        <Autocomplete
          name="variable_name"
          disablePortal
          id="combo-box-demo"
          onChange={(_, newValue) => {
            eventBus.emit('updateNode', { data: { variable_name: newValue?.key }, idNode: IdNode });
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
      </Stack>

      <Dialog open={open.value} onClose={open.onFalse} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h5">Body JSON</Typography>
              <IconButton onClick={open.onFalse}>
                <Iconify icon="ic:round-close" />
              </IconButton>
            </Stack>
            <Divider />
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pb: 3, height: '580px' }}>
          <Stack
            sx={{
              height: 1,
              borderRadius: 1,
              overflow: 'hidden',
              boxShadow: (theme) => theme.customShadows.z8,
              position: 'relative',
            }}
          >
            {open.value && (
              <PositionedMenu
                typeof
                name="json_string_data"
                handleSelectVariable={(key) => {
                  applyCodeAtPosition(key, focusPosition);
                }}
                openVariableModal={variableModal.onTrue}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 33,
                  zIndex: 1,
                  borderRadius: 1,
                  padding: 0.5,
                  width: 32,
                  height: 32,
                }}
              />
            )}
            {open.value && renderEditor()}
          </Stack>
        </DialogContent>
      </Dialog>

      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
      <Variables
        addOne
        open={dataVariableModal.value}
        onClose={dataVariableModal.onFalse}
        updateVariableAction={(key) => {
          eventBus.emit('updateNode', { data: { variable_name: key }, idNode: IdNode });
        }}
      />
    </Stack>
  );
}
HttpRequestForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
