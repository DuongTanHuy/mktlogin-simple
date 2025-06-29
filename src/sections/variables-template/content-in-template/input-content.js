import { IconButton, Stack, TextField, Typography, alpha } from '@mui/material';
import Iconify from 'src/components/iconify';
import { isElectron } from 'src/utils/commom';
import WithSectionAction from '../components/WithSelectionAction';

const PropTypes = require('prop-types');

const InputContent = ({
  data,
  selectingItem,
  onDuplicate,
  onDelete,
  updateItemByField,
  validateError,
}) => {
  const selectFolder = async (event) => {
    if (isElectron() && updateItemByField) {
      const path_file = await window.ipcRenderer.invoke('open-directory-dialog');
      if (path_file) updateItemByField(data, 'defaultValue', path_file.replace(/\\/g, '/'));
    }
  };

  const selectGoogleCreden = async (event) => {
    if (isElectron() && updateItemByField) {
      const file = event.target.files[0];
      const file_path = (isElectron() ? file?.path || '' : file?.name || '').replace(/\\/g, '/');
      if (file_path) updateItemByField(data, 'defaultValue', file_path);
    }
    event.target.value = null;
  };

  return (
    <WithSectionAction
      data={data}
      isActive={data.id === selectingItem?.id}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
    >
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        sx={{
          ...data?.styleDefault,
          width: '100%',
          overflow: 'hidden',
          height: `${data?.config?.height}px`,
          transition: 'all 0.3s',
        }}
      >
        {!data?.config?.hideLabel && (
          <Typography
            sx={{
              minWidth: '100px',
              width: `${data?.config?.labelWidth}px`,
              transition: 'all 0.3s',
              flexShrink: 0,
            }}
          >
            {data?.config?.name}
          </Typography>
        )}
        <Stack
          direction="row"
          spacing={0}
          sx={{
            transition: 'all 0.3s',
            width: '100%',
            ...(data?.config?.width && {
              width: `${data?.config?.width}px`,
            }),
          }}
        >
          <TextField
            value={data?.config?.defaultValue}
            onChange={(e) => {
              updateItemByField(data, 'defaultValue', e.target.value);
            }}
            error={validateError}
            size="small"
            sx={{
              width: '100%',

              ...(data?.config?.rightButton && {
                width: 'calc(100% - 37.13px)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }),
            }}
            inputProps={{
              readOnly: !updateItemByField,
            }}
            placeholder={data?.config?.placeholder}
            InputProps={{
              endAdornment: (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    ...(!data?.config?.showTextCount && {
                      display: 'none',
                    }),
                  }}
                >{`${data?.config?.defaultValue.length}/${
                  data?.config?.maxLength ?? 0
                }`}</Typography>
              ),
            }}
          />
          {data?.config?.rightButton && data?.config?.acceptType === 'folder' && (
            <IconButton
              sx={{
                width: 37.13,
                height: 37.13,
                flexShrink: 0,
                borderRadius: 1,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                border: '1px solid',
                borderLeft: 'none',
                borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.06),
              }}
              onClick={selectFolder}
              disabled={!updateItemByField}
            >
              <Iconify icon="line-md:folder-twotone" width={26} />
            </IconButton>
          )}
          {data?.config?.rightButton && data?.config?.acceptType !== 'folder' && (
            <IconButton
              variant="outlined"
              component="label"
              sx={{
                width: 37.13,
                height: 37.13,
                flexShrink: 0,
                borderRadius: 1,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                border: '1px solid',
                borderLeft: 'none',
                borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.06),
              }}
              disabled={!updateItemByField}
            >
              <Iconify icon="line-md:folder-twotone" width={26} />
              <input
                type="file"
                accept={data?.config?.acceptType}
                hidden
                onChange={selectGoogleCreden}
              />
            </IconButton>
          )}
        </Stack>
      </Stack>
    </WithSectionAction>
  );
};

InputContent.propTypes = {
  data: PropTypes.object,
  selectingItem: PropTypes.object,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
  updateItemByField: PropTypes.func,
  validateError: PropTypes.bool,
};

export default InputContent;
