import PropTypes from 'prop-types';

import {
  Autocomplete,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import React, { memo } from 'react';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { removeVietnameseTones } from 'src/utils/format-string';

//----------------------------------------------------------------------
function FlowButton({ nodes = [], wfInfo, onFocusNode, idFlowChart }) {
  const settings = useSettingsContext();
  const theme = useTheme();

  return (
    <Stack
      direction={{ sm: 'column', md: 'row' }}
      spacing={1}
      alignContent="center"
      justifyContent="space-between"
      sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        zIndex: 10,
      }}
    >
      <Stack direction="row" gap={1} sx={{ width: '100%' }}>
        {(!idFlowChart && !wfInfo?.id) || (wfInfo?.id && !wfInfo?.is_encrypted) ? (
          <Autocomplete
            // onChange={(_, newValue) => {
            //   onFocusNode(newValue?.id);
            // }}
            size="small"
            freeSolo
            fullWidth
            disablePortal
            disableClearable
            options={nodes.filter((node) => node.type !== 'group')}
            getOptionLabel={(option) => option?.data?.name ?? option}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  type: 'search',
                  placeholder: 'Tìm kiếm node...',
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                className="no-select"
              />
            )}
            renderOption={(props, option) => (
              <MenuItem
                {...props}
                key={option?.id}
                onClick={() => {
                  onFocusNode(option?.id);
                }}
              >
                {option?.data?.name}
              </MenuItem>
            )}
            sx={{
              borderRadius: 1,
              maxWidth: { sm: '100%', md: '300px' },
              borderColor: alpha(theme.palette.grey[500], 0.32),
              bgcolor: alpha(theme.palette.grey[settings.themeMode === 'dark' ? 900 : 300], 1),
              color: 'text.primary',
              '& .MuiInputBase-root.MuiOutlinedInput-root': {
                px: '8px!important',
              },
              '& .MuiAutocomplete-endAdornment': {
                display: 'none',
              },
            }}
            noOptionsText={<Typography variant="body2">No node</Typography>}
            filterOptions={(options, { inputValue }) =>
              options.filter((option) =>
                removeVietnameseTones(option?.data?.keyWord || option?.data?.name)
                  .toLowerCase()
                  .includes(removeVietnameseTones(inputValue).toLowerCase())
              )
            }
          />
        ) : (
          <Typography
            variant="h5"
            lineHeight="36px"
            className="no-select"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              pr: 2,
            }}
          >
            {wfInfo?.name}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

const areEqual = (prevProps, nextProps) =>
  prevProps.nodes.length === nextProps.nodes.length &&
  prevProps.wfInfo === nextProps.wfInfo &&
  prevProps.idFlowChart === nextProps.idFlowChart;

export default memo(FlowButton, areEqual);

FlowButton.propTypes = {
  nodes: PropTypes.array,
  wfInfo: PropTypes.object,
  onFocusNode: PropTypes.func,
  idFlowChart: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
