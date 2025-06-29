import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// assets
import { UploadIllustration } from 'src/assets/illustrations';
//
import { Grid } from '@mui/material';
import Iconify from '../iconify';
//
import RejectionFiles from './errors-rejection-files';
import MultiFilePreview from './preview-multi-file';
import SingleFilePreview from './preview-single-file';

// ----------------------------------------------------------------------

export default function UploadV2({
  disabled,
  multiple = false,
  error,
  helperText,
  //
  file,
  onDelete,
  //
  files,
  thumbnail,
  onUpload,
  onRemove,
  onRemoveAll,
  sx,
  ...other
}) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple,
    disabled,
    ...other,
  });

  const hasFile = !!file && !multiple;

  const hasFiles = !!files && multiple && !!files.length;

  const hasError = isDragReject || !!error;

  const renderPlaceholder = (
    <Stack
      spacing={hasFiles ? 0 : 3}
      alignItems="center"
      justifyContent="center"
      direction={hasFiles ? 'row' : 'column'}
      width={1}
      height={1}
    >
      <UploadIllustration sx={{ width: hasFiles ? 1 : 0.3, height: 1 }} />
      {multiple && (
        <Stack spacing={1} sx={{ textAlign: 'center' }}>
          {!hasFiles && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Drop files here or click
              <Box
                component="span"
                sx={{
                  mx: 0.5,
                  color: 'primary.main',
                  textDecoration: 'underline',
                }}
              >
                browse
              </Box>
              thorough your machine
            </Typography>
          )}
        </Stack>
      )}
    </Stack>
  );

  const renderSinglePreview = (
    <SingleFilePreview imgUrl={typeof file === 'string' ? file : file?.preview} />
  );

  const removeSinglePreview = hasFile && onDelete && (
    <IconButton
      size="small"
      onClick={onDelete}
      sx={{
        top: 16,
        right: 16,
        zIndex: 9,
        position: 'absolute',
        color: (theme) => alpha(theme.palette.common.white, 0.8),
        bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
        },
      }}
    >
      <Iconify icon="mingcute:close-line" width={18} />
    </IconButton>
  );

  const renderMultiPreview = hasFiles && (
    <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
      {onRemoveAll && (
        <Button color="inherit" variant="outlined" size="small" onClick={onRemoveAll}>
          Remove All
        </Button>
      )}

      {onUpload && (
        <Button
          size="small"
          variant="contained"
          onClick={onUpload}
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
        >
          Upload
        </Button>
      )}
    </Stack>
  );

  return (
    <Box sx={{ width: 1, position: 'relative', ...sx }}>
      <Grid container>
        <Grid item xs={hasFiles ? 3 : 12}>
          <Box
            {...getRootProps()}
            sx={{
              p: 1,
              height: 1,
              outline: 'none',
              borderRadius: 1,
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
              border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
              transition: (theme) => theme.transitions.create(['opacity', 'padding']),
              '&:hover': {
                opacity: 0.72,
              },
              ...(isDragActive && {
                opacity: 0.72,
              }),
              ...(disabled && {
                opacity: 0.48,
                pointerEvents: 'none',
              }),
              ...(hasError && {
                color: 'error.main',
                borderColor: 'error.main',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
              }),
              ...(hasFile && {
                padding: '24% 0',
              }),
            }}
          >
            <input {...getInputProps()} />

            {hasFile ? renderSinglePreview : renderPlaceholder}
          </Box>
        </Grid>
        <Grid item xs={9}>
          {hasFiles && (
            <Box>
              <MultiFilePreview files={files} thumbnail={thumbnail} onRemove={onRemove} />
            </Box>
          )}
        </Grid>
      </Grid>

      {removeSinglePreview}

      {helperText && helperText}

      <RejectionFiles fileRejections={fileRejections} />

      {renderMultiPreview}
    </Box>
  );
}

UploadV2.propTypes = {
  disabled: PropTypes.object,
  error: PropTypes.bool,
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  files: PropTypes.array,
  helperText: PropTypes.object,
  multiple: PropTypes.bool,
  onDelete: PropTypes.func,
  onRemove: PropTypes.func,
  onRemoveAll: PropTypes.func,
  onUpload: PropTypes.func,
  sx: PropTypes.object,
  thumbnail: PropTypes.bool,
};
