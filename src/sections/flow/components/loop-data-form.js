import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';

import {
  Autocomplete,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Link,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import { useBoolean } from 'src/hooks/use-boolean';
import eventBus from 'src/sections/script/event-bus';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { useLocales } from 'src/locales';
import { enqueueSnackbar } from 'notistack';
import { isElectron } from 'src/utils/commom';

export default function LoopDataForm({ formData, IdNode }) {
  const variableModal = useBoolean();
  const dataVariableModal = useBoolean();
  const { variableFlow } = useAuthContext();
  const { copy } = useCopyToClipboard();
  const { t } = useLocales();

  const fetchVariables = useMemo(() => {
    if (variableFlow?.list === null || variableFlow?.list?.length === 0) return [];

    return variableFlow?.list.map((i, index) => ({
      ...i,
      lastItem: index + 1 === variableFlow.list.length,
    }));
  }, [variableFlow?.list]);

  const getVariable = (name, item) => {
    eventBus.emit('updateNode', { data: { [name]: `\${${item.key}}` }, idNode: IdNode });
  };

  const handleChangeNumberSecond = (event) => {
    const { name, value, type, checked } = event.target;
    eventBus.emit('updateNode', {
      data: { [name]: type === 'checkbox' ? checked : value },
      idNode: IdNode,
    });
  };

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
          label="ID"
          name="loop_id"
          value={formData?.dataFields?.loop_id || ''}
          inputProps={{
            readOnly: true,
          }}
          InputProps={{
            endAdornment: (
              <Tooltip title={t('dialog.exportResource.actions.copy')} placement="top">
                <IconButton
                  onClick={() => {
                    copy(formData?.dataFields?.loop_id);
                    enqueueSnackbar(t('systemNotify.success.copied'));
                  }}
                  sx={{
                    marginLeft: 1,
                    pointerEvents: 'auto',
                  }}
                >
                  <Iconify icon="solar:copy-bold-duotone" />
                </IconButton>
              </Tooltip>
            ),
          }}
        />
        <TextField
          select
          fullWidth
          label="Dữ liệu lặp"
          name="loop_through"
          value={formData?.dataFields?.loop_through || 'numbers'}
          onChange={handleChangeNumberSecond}
        >
          <MenuItem value="numbers">Số</MenuItem>
          {/* <MenuItem value="googleSheet">Bảng tính Google</MenuItem> */}
          <MenuItem value="variable">Biến</MenuItem>
          {/* <MenuItem value="customData">Dữ liệu tùy chỉnh</MenuItem> */}
          <MenuItem value="elements">Danh sách phần tử HTML</MenuItem>
        </TextField>
        {formData?.dataFields?.loop_through === 'numbers' && (
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Số bắt đầu"
              name="from"
              value={formData?.dataFields?.from ?? 0}
              onChange={handleChangeNumberSecond}
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="from"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <TextField
              fullWidth
              label="Số kết thúc"
              name="to"
              value={formData?.dataFields?.to ?? 0}
              onChange={handleChangeNumberSecond}
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="to"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </Stack>
        )}
        {formData?.dataFields?.loop_through === 'googleSheet' && (
          <TextField
            fullWidth
            label="Reference key"
            name="refererce_key"
            value={formData?.dataFields?.refererce_key || ''}
            onChange={handleChangeNumberSecond}
            InputProps={{
              endAdornment: (
                <PositionedMenu
                  name="refererce_key"
                  getVariable={getVariable}
                  openVariableModal={variableModal.onTrue}
                />
              ),
            }}
          />
        )}

        {formData?.dataFields?.loop_through === 'variable' && (
          <Autocomplete
            name="variable_name"
            disablePortal
            id="combo-box-demo"
            onChange={(_, newValue) => {
              eventBus.emit('updateNode', {
                data: { variable_name: newValue?.key },
                idNode: IdNode,
              });
            }}
            value={formData?.dataFields?.variable_name || null}
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
        {formData?.dataFields?.loop_through === 'elements' && (
          <Stack spacing={1}>
            <TextField
              name="element_selector"
              label="Bộ chọn phần tử"
              placeholder="CSS Selector hoặc XPATH"
              value={formData?.dataFields?.element_selector || ''}
              onChange={handleChangeNumberSecond}
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="element_selector"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <FormControlLabel
              name="selector_switch"
              control={<Checkbox checked={formData?.dataFields?.selector_switch || false} />}
              onChange={handleChangeNumberSecond}
              label="Chờ phần tử"
              sx={{
                width: 'fit-content',
              }}
            />
            {formData?.dataFields?.selector_switch && (
              <TextField
                fullWidth
                label="Thời gian chờ tối đa (giây)"
                name="selector_timeout"
                value={formData?.dataFields?.selector_timeout ?? 0}
                onChange={handleChangeNumberSecond}
                InputProps={{
                  endAdornment: (
                    <PositionedMenu
                      name="selector_timeout"
                      getVariable={getVariable}
                      openVariableModal={variableModal.onTrue}
                    />
                  ),
                }}
              />
            )}
          </Stack>
        )}
        {formData?.dataFields?.loop_through !== 'numbers' && (
          <>
            <TextField
              label="Số lần lặp tối đa, mặc định 0 (không sử dụng)"
              name="max_loop"
              value={formData?.dataFields?.max_loop ?? 0}
              onChange={handleChangeNumberSecond}
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="max_loop"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
            <TextField
              label="Thứ tự bắt đầu"
              name="index_start"
              value={formData?.dataFields?.index_start ?? 1}
              onChange={handleChangeNumberSecond}
              InputProps={{
                endAdornment: (
                  <PositionedMenu
                    name="index_start"
                    getVariable={getVariable}
                    openVariableModal={variableModal.onTrue}
                  />
                ),
              }}
            />
          </>
        )}

        <Stack spacing={1}>
          <Divider
            sx={{
              mb: 2,
            }}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Lấy dữ liệu"
              value={
                formData?.dataFields?.loop_id
                  ? `{{loop.${formData?.dataFields?.loop_id}.data}}`
                  : ''
              }
              inputProps={{
                readOnly: true,
              }}
              InputProps={{
                endAdornment: (
                  <Tooltip title={t('dialog.exportResource.actions.copy')} placement="top">
                    <IconButton
                      onClick={() => {
                        copy(
                          formData?.dataFields?.loop_id
                            ? `{{loop.${formData?.dataFields?.loop_id}.data}}`
                            : ''
                        );
                        enqueueSnackbar(t('systemNotify.success.copied'));
                      }}
                      sx={{
                        marginLeft: 1,
                        pointerEvents: 'auto',
                      }}
                    >
                      <Iconify icon="solar:copy-bold-duotone" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Lấy số thứ tự"
              value={
                formData?.dataFields?.loop_id
                  ? `{{loop.${formData?.dataFields?.loop_id}.loop_order}}`
                  : ''
              }
              inputProps={{
                readOnly: true,
              }}
              InputProps={{
                endAdornment: (
                  <Tooltip title={t('dialog.exportResource.actions.copy')} placement="top">
                    <IconButton
                      onClick={() => {
                        copy(
                          formData?.dataFields?.loop_id
                            ? `{{loop.${formData?.dataFields?.loop_id}.loop_order}}`
                            : ''
                        );
                        enqueueSnackbar(t('systemNotify.success.copied'));
                      }}
                      sx={{
                        marginLeft: 1,
                        pointerEvents: 'auto',
                      }}
                    >
                      <Iconify icon="solar:copy-bold-duotone" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
          </Stack>
          <Link
            noWrap
            variant="caption"
            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => {
              if (isElectron()) {
                window.ipcRenderer.send(
                  'open-external',
                  'https://docs.mktlogin.com/expressions/loop.html'
                );
              } else {
                window.open(
                  'https://docs.mktlogin.com/expressions/loop.html',
                  '_blank',
                  'noopener noreferrer'
                );
              }
            }}
          >
            Nhấn để xem tài liệu đầy đủ
          </Link>
        </Stack>
      </Stack>
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

LoopDataForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
