import { useRef, useState } from 'react';
import { cloneDeep, debounce } from 'lodash';
import PropTypes from 'prop-types';

// mui
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Slider,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Zoom,
  alpha,
} from '@mui/material';
// component
import Iconify from 'src/components/iconify';
import { isElectron } from 'src/utils/commom';
import { usePopover } from 'src/components/custom-popover';
import CustomPopover from 'src/components/custom-popover/custom-popover';
import { CustomTooltip } from 'src/components/custom-tooltip';
import { createRangeArray } from 'src/utils/format-number';
import { Editor } from '@monaco-editor/react';
import { LoadingScreen } from 'src/components/loading-screen';
import { useSettingsContext } from 'src/components/settings';

const InputTab = ({ variable, setVariable, t, workflow, inputValidate, setInputValidate }) => {
  const settings = useSettingsContext();
  const popover = usePopover();
  const [itemClicking, setItemClicking] = useState(null);
  const [jsonValueUpdate, setJsonValueUpdate] = useState({
    id: '',
    value: '[]',
  });

  const inputTextFileRef = useRef(null);
  const inputExcelFileRef = useRef(null);
  const inputJsonFileRef = useRef(null);
  const inputImageFileRef = useRef(null);
  const [listRange] = useState(
    variable?.map((item) => [
      Number(item?.defaultValue?.range?.min) ?? 0,
      Number(item?.defaultValue?.range?.max) ?? 0,
    ])
  );

  const updateVariable = (name, event, id) => {
    const _clone = cloneDeep(variable);
    const _find = _clone.findIndex((i) => i.id === id);

    if (name === 'jsonValue') {
      _clone[_find].jsonValue = event;
    } else if (_clone[_find].type === 'number') {
      if (event.target.value === '' || /^\d+$/.test(event.target.value)) {
        if (event.target.value === '') {
          _clone[_find][name] = '';
        } else {
          _clone[_find][name] = Number(event.target.value);
        }
      }
    } else if (_clone[_find].type === 'boolean') {
      _clone[_find][name] = event.target.checked;
    } else if (event.target.name === 'min' || event.target.name === 'max') {
      if (event.target.value === '' || /^\d+$/.test(event.target.value)) {
        if (_clone[_find].value === null) {
          _clone[_find].value = {};
        }
        if (event.target.value === '') {
          _clone[_find].value[event.target.name] = '';
        } else {
          _clone[_find].value[event.target.name] = Number(event.target.value);
        }
      }
    } else {
      _clone[_find][name] = event.target.value;
    }
    setVariable(_clone);
  };

  const handleChangeRange = (newValue, id) => {
    const _clone = cloneDeep(variable);
    const _find = _clone.findIndex((i) => i.id === id);
    const value = {
      min: newValue[0],
      max: newValue[1],
    };
    _clone[_find].value = value;
    setVariable(_clone);
  };

  const selectFile = (event, id) => {
    const file = event.target.files[0];
    const _clone = cloneDeep(variable);
    const _find = _clone.findIndex((i) => i.id === itemClicking);
    _clone[_find].value = isElectron() ? file?.path : file?.name;
    setInputValidate(inputValidate.filter((i) => i !== _clone[_find].id));
    setVariable(_clone);

    popover.onClose();
  };

  const selectFolder = async (event) => {
    if (isElectron()) {
      const _clone = cloneDeep(variable);
      const _find = _clone.findIndex((i) => i.id === itemClicking);
      const path_file = await window.ipcRenderer.invoke('open-directory-dialog');
      _clone[_find].value = path_file;
      setInputValidate(inputValidate.filter((i) => i !== _clone[_find].id));
      setVariable(_clone);
    }

    popover.onClose();
  };

  return (
    <>
      <Stack spacing={2.5} pt={1} pl={3} pr={1}>
        {variable && variable.length > 0 ? (
          variable.map((item, index) =>
            (() => {
              const error = inputValidate?.includes(item.id);
              switch (item.type) {
                case 'number':
                  return (
                    <TextField
                      key={item.id}
                      error={error}
                      helperText={error ? t('validate.required') : ''}
                      label={item?.label || item.key}
                      name="value"
                      size="small"
                      value={item.value}
                      placeholder={item?.description}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        width: { sm: 1 },
                        '& .MuiInputBase-root': {
                          pr: 1,
                          py: 0.5,
                        },
                        '& .MuiFormLabel-root.MuiInputLabel-root': {
                          color: 'text.primary',
                        },
                      }}
                      onChange={(e) => {
                        if (error) {
                          setInputValidate(inputValidate.filter((i) => i !== item.id));
                        }
                        updateVariable('value', e, item.id);
                      }}
                    />
                  );
                case 'boolean':
                  return (
                    <FormControlLabel
                      key={item.id}
                      label={item?.label || item.key}
                      control={
                        <Switch
                          name="value"
                          checked={item.value}
                          onChange={(e) => updateVariable('value', e, item.id)}
                        />
                      }
                      sx={{
                        '&.MuiFormControlLabel-root': {
                          width: 'fit-content',
                          ml: 0,
                        },
                      }}
                    />
                  );
                case 'range':
                  return (
                    <Stack key={item.id}>
                      <Typography mb={1}>{item?.label || item.key}</Typography>

                      {!!listRange?.[index]?.[0] || !!listRange?.[index]?.[1] ? (
                        <Box
                          sx={{
                            pt: 4,
                            px: 1,
                          }}
                        >
                          <Slider
                            min={listRange?.[index]?.[0]}
                            max={listRange?.[index]?.[1]}
                            marks={createRangeArray(
                              listRange?.[index]?.[0],
                              listRange?.[index]?.[1]
                            ).map((i) => ({ value: i, label: i }))}
                            value={[Number(item?.value?.min), Number(item?.value?.max)]}
                            onChange={(event, newValue) => handleChangeRange(newValue, item.id)}
                            valueLabelDisplay="on"
                          />
                        </Box>
                      ) : (
                        <Stack direction="row" spacing={2} width={0.6}>
                          <TextField
                            error={false}
                            label="Min"
                            onChange={(e) => updateVariable('min', e, item.id)}
                            size="small"
                            name="min"
                            value={item?.value?.min}
                          />
                          <TextField
                            error={false}
                            label="Max"
                            onChange={(e) => updateVariable('max', e, item.id)}
                            size="small"
                            name="max"
                            value={item?.value?.max}
                          />
                        </Stack>
                      )}
                    </Stack>
                  );
                case 'list':
                case 'object':
                  return (
                    <Stack key={item.id}>
                      <Typography mb={1}>{item?.label || item.key}</Typography>
                      <Box
                        sx={{
                          width: 1,
                          borderRadius: 2,
                          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                          boxShadow: (theme) => theme.customShadows.z8,
                          height: '100px',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
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
                          theme={`vs-${settings.themeMode}`}
                          value={item.jsonValue}
                          onChange={(value) => updateVariable('jsonValue', value, item.id)}
                          loading={<LoadingScreen />}
                        />
                      </Box>
                    </Stack>
                  );
                default:
                  return (
                    <TextField
                      key={item.id}
                      error={error}
                      helperText={error ? t('validate.required') : ''}
                      label={item?.label || item.key}
                      name="value"
                      size="small"
                      value={item.value}
                      placeholder={item?.description}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        width: { sm: 1 },
                        '& .MuiInputBase-root': {
                          pr: 1,
                          py: 0.5,
                        },
                        '& .MuiFormLabel-root.MuiInputLabel-root': {
                          color: 'text.primary',
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
                      onChange={(e) => {
                        if (error) {
                          setInputValidate(inputValidate.filter((i) => i !== item.id));
                        }
                        updateVariable('value', e, item.id);
                      }}
                    />
                  );
              }
            })()
          )
        ) : (
          <Typography textAlign="center" color="text.secondary">
            {workflow
              ? t('dialog.rpa.tabs.input.noData')
              : t('dialog.rpa.tabs.optional.labels.selectWorkflow')}
          </Typography>
        )}
      </Stack>
      <CustomPopover
        open={popover.open}
        onClose={(event) => {
          event.stopPropagation();
          popover.onClose();
        }}
        sx={{
          width: 'fit-content',
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
      >
        <DialogTitle
          sx={{
            typography: 'h5',
          }}
        >
          Json value
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
              theme={`vs-${settings.themeMode}`}
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
};

export default InputTab;

InputTab.propTypes = {
  variable: PropTypes.array,
  setVariable: PropTypes.func,
  t: PropTypes.func,
  workflow: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  inputValidate: PropTypes.array,
  setInputValidate: PropTypes.func,
};
