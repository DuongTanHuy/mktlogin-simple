/* eslint-disable no-plusplus */
import React, { memo } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Handle, Position } from '@xyflow/react';
import { useAuthContext } from 'src/auth/hooks';
import { alpha, useTheme } from '@mui/material';
import { bgGradient } from 'src/theme/css';
import Iconify from 'src/components/iconify';

const DEFAULT_HANDLE_STYLE = {
  width: 9,
  height: 9,
  bottom: -5,
};

function CustomLoopNode({ data, id, type, selected }) {
  const { updateFlowAutomation } = useAuthContext();
  const theme = useTheme();

  const handleonDoubleClick = (event) => {
    if (!event.ctrlKey) {
      updateFlowAutomation({
        status: 'editting',
        typeForm: data,
        nodeId: id,
      });
    }
  };

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      sx={{
        bgcolor: () => {
          if (theme.palette.mode === 'light') {
            return '#ffffff';
          }
          return '#161616';
        },
        padding: '10px',
        boxShadow: theme.customShadows.z8,
        width: '80px',
        aspectRatio: 1,
        borderRadius: '50%',
        gap: '6px',
      }}
      onClick={handleonDoubleClick}
    >
      <Stack
        sx={{
          borderRadius: '2px',
          padding: '3px',
          ...bgGradient({
            direction: 'to top',
            startColor: alpha(theme.palette.primary.light, 0.6),
            endColor: alpha(theme.palette.primary.main, 0.6),
          }),
        }}
      >
        <Iconify width={12} icon={data?.icon} color="white" />
      </Stack>
      <Typography variant="body1" sx={{ fontSize: '10px' }}>
        {data?.name}
      </Typography>

      <Handle
        type="source"
        id="success"
        position={Position.Right}
        style={{
          ...DEFAULT_HANDLE_STYLE,
          background: '#00A76F',
          border: '1px solid',
          borderColor: 'white',
          top: '36%',
          transform: 'translateY(-50%)',
        }}
      />
      <Handle
        type="source"
        id="error"
        position={Position.Right}
        style={{
          ...DEFAULT_HANDLE_STYLE,
          background: '#FF5630',
          border: '1px solid',
          borderColor: 'white',
          top: '64%',
          transform: 'translateY(-50%)',
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="blue"
        style={{ ...DEFAULT_HANDLE_STYLE, background: theme.palette.primary.main }}
      />
      <Handle
        type="source"
        id="loop"
        position={Position.Bottom}
        style={{
          ...DEFAULT_HANDLE_STYLE,
          background: '#FFAB00',
          border: '1px solid',
          borderColor: 'white',
          left: '36%',
          transform: 'translate(-50%, -40%)',
        }}
      />
      <Handle
        type="target"
        id="loop"
        position={Position.Bottom}
        style={{
          ...DEFAULT_HANDLE_STYLE,
          background: '#FFAB00',
          border: '1px solid',
          borderColor: 'white',
          left: '64%',
          transform: 'translate(-50%, -40%)',
        }}
      />
    </Stack>
  );
}

export default memo(CustomLoopNode);

CustomLoopNode.propTypes = {
  data: PropTypes.object,
  id: PropTypes.string,
  type: PropTypes.string,
  selected: PropTypes.bool,
};
