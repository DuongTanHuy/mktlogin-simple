import { useCallback, useEffect, useState } from 'react';
import { Upload } from 'src/components/upload';
import { useBoolean } from 'src/hooks/use-boolean';
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
  Card,
  CardContent,
  FormHelperText,
} = require('@mui/material');

const Image = ({ template, updateItemByField, variableOptions }) => {
  const [error, setError] = useState(false);
  const preview = useBoolean();
  const [files, setFiles] = useState([]);

  const handleDropMultiFile = useCallback(
    (acceptedFiles) => {
      setFiles([
        ...files,
        ...acceptedFiles.map((newFile) =>
          Object.assign(newFile, {
            preview: URL.createObjectURL(newFile),
          })
        ),
      ]);
    },
    [files]
  );

  const handleRemoveFile = (inputFile) => {
    const filesFiltered = files.filter((fileFiltered) => fileFiltered !== inputFile);
    setFiles(filesFiltered);
  };

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  useEffect(() => {
    setFiles(template?.config?.files || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => {
      setError(files.some((file) => file?.size > 2097152));
      updateItemByField(
        template,
        'files',
        files.filter((file) => file?.size < 2097152)
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files]
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
      <Card
        sx={{
          bgcolor: 'transparent',
          boxShadow: 'none',
          p: 0,
          borderRadius: 1,
          overflow: 'visible',
        }}
      >
        <CardContent
          sx={{
            p: '0px!important',
            pt: 1,
          }}
        >
          <FormControlLabel
            control={<Switch checked={preview.value} onClick={preview.onToggle} />}
            label="Show Thumbnail"
          />
          <Upload
            accept={{ 'image/*': [] }}
            error={!!error}
            helperText={
              !!error && (
                <FormHelperText error={!!error} sx={{ px: 2 }}>
                  Image size must be less than 2MB
                </FormHelperText>
              )
            }
            multiple
            thumbnail={preview.value}
            files={files}
            onDrop={handleDropMultiFile}
            onRemove={handleRemoveFile}
            onRemoveAll={handleRemoveAllFiles}
            sx={{
              '&.MuiBox-root h6': {
                maxWidth: 200,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
            stylePreview={{
              '& .MuiListItemText-root span': {
                maxWidth: 200,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
              ...(preview.value && {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, 80px)',
                gap: '8px',
              }),
            }}
            placeholder={
              <Typography
                variant="h6"
                sx={{
                  py: 2,
                }}
              >
                Drop or Select image
              </Typography>
            }
          />
        </CardContent>
      </Card>
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
    </Stack>
  );
};

Image.propTypes = {
  template: PropTypes.object,
  updateItemByField: PropTypes.func,
  variableOptions: PropTypes.array,
};

export default Image;
