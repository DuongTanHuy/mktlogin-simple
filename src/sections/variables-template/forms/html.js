import { useCallback, useMemo } from 'react';
import { Editor } from '@monaco-editor/react';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';
import { debounce } from 'lodash';
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { getStorage } from 'src/hooks/use-local-storage';
import CustomLabel from '../components/CustomLabel';

const PropTypes = require('prop-types');
const {
  Stack,
  Chip,
  TextField,
  FormControlLabel,
  Switch,
  Autocomplete,
  Typography,
  Box,
  alpha,
  IconButton,
  Dialog,
  DialogTitle,
  Divider,
  DialogContent,
} = require('@mui/material');

const Html = ({ template, updateItemByField, variableOptions }) => {
  const open = useBoolean();
  const { themeMode } = useSettingsContext();

  const terminalDefault = getStorage('terminal');
  const terminalSetting = useMemo(
    () => ({
      fontSize: terminalDefault?.fontSize ?? 12,
      minimap: { enabled: terminalDefault?.minimap?.enabled ?? false },
    }),
    [terminalDefault]
  );

  const renderEditor = useCallback(
    () => (
      <Editor
        options={terminalSetting}
        language="html"
        theme={`vs-${themeMode}`}
        value={template?.config?.defaultValue}
        onChange={debounce((value) => updateItemByField(template, 'defaultValue', value), 200)}
        loading={<LoadingScreen />}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [template?.config?.defaultValue, terminalSetting, themeMode]
  );

  return (
    <Stack>
      <CustomLabel nameLabel="InputTemplate">
        <Chip size="small" label="Input" color="primary" sx={{ width: '80px' }} />
      </CustomLabel>
      <CustomLabel nameLabel="Variables">
        <Autocomplete
          name="variable"
          disablePortal
          size="small"
          onChange={(_, newValue) => {
            updateItemByField(template, 'variable', newValue);
          }}
          value={template?.config?.variable || null}
          getOptionLabel={(option) => option.key || option || ''}
          options={variableOptions || []}
          isOptionEqualToValue={(option, value) => option.key === value.key}
          renderInput={(params) => <TextField placeholder="Select variable" {...params} />}
          renderOption={(props, option) => (
            <Stack
              key={option.id}
              component="li"
              {...props}
              direction="row"
              justifyContent="flex-start"
            >
              {option.key}
            </Stack>
          )}
          noOptionsText={<Typography variant="body2">No variable</Typography>}
        />
      </CustomLabel>
      <CustomLabel nameLabel="Name">
        <TextField
          size="small"
          name="name"
          placeholder="Enter value"
          value={template?.config?.name}
          onChange={(e) => updateItemByField(template, 'name', e.target.value)}
          inputProps={{
            autoCorrect: 'off',
            spellCheck: 'false',
            autoCapitalize: 'none',
            'aria-autocomplete': 'none',
            'aria-expanded': false,
          }}
        />
      </CustomLabel>

      <CustomLabel nameLabel="">
        <FormControlLabel
          label="Hide Label"
          control={
            <Switch
              name="hideLabel"
              checked={template?.config?.hideLabel}
              onChange={(e) => updateItemByField(template, 'hideLabel', e.target.checked)}
            />
          }
        />
      </CustomLabel>
      <CustomLabel nameLabel="Label Width">
        <TextField
          type="number"
          size="small"
          name="labelWidth"
          placeholder="Enter value"
          value={template?.config?.labelWidth}
          onChange={(e) => updateItemByField(template, 'labelWidth', e.target.value)}
          inputProps={{
            autoCorrect: 'off',
            spellCheck: 'false',
            autoCapitalize: 'none',
            'aria-autocomplete': 'none',
            'aria-expanded': false,
          }}
        />
      </CustomLabel>
      <CustomLabel nameLabel="Width">
        <TextField
          type="number"
          size="small"
          name="width"
          placeholder="Enter value"
          value={template?.config?.width ?? ''}
          onChange={(e) => updateItemByField(template, 'width', e.target.value)}
          inputProps={{
            autoCorrect: 'off',
            spellCheck: 'false',
            autoCapitalize: 'none',
            'aria-autocomplete': 'none',
            'aria-expanded': false,
          }}
        />
      </CustomLabel>
      <CustomLabel nameLabel="Height">
        <TextField
          type="number"
          size="small"
          name="height"
          placeholder="Enter value"
          value={template?.config?.height ?? ''}
          onChange={(e) => updateItemByField(template, 'height', e.target.value)}
          inputProps={{
            autoCorrect: 'off',
            spellCheck: 'false',
            autoCapitalize: 'none',
            'aria-autocomplete': 'none',
            'aria-expanded': false,
          }}
        />
      </CustomLabel>
      <CustomLabel nameLabel="Html Content">
        <Box
          sx={{
            width: 1,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            // border: (theme) => `solid 1px ${theme.palette.divider}`,
            boxShadow: (theme) => theme.customShadows.z8,
            height: '200px',
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
            onClick={open.onTrue}
          >
            <Iconify icon="mdi-light:fullscreen" width={24} />
          </IconButton>
          {renderEditor()}
        </Box>
      </CustomLabel>

      <Dialog open={open.value} onClose={open.onFalse} fullScreen>
        <DialogTitle>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h5">HTML Content</Typography>
              <IconButton onClick={open.onFalse}>
                <Iconify icon="ic:round-close" />
              </IconButton>
            </Stack>
            <Divider />
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Stack
            sx={{
              height: 1,
              borderRadius: 1,
              overflow: 'hidden',
              boxShadow: (theme) => theme.customShadows.z8,
            }}
          >
            {renderEditor()}
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

Html.propTypes = {
  template: PropTypes.object,
  updateItemByField: PropTypes.func,
  variableOptions: PropTypes.array,
};

export default Html;
