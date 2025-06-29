/* eslint-disable no-plusplus */
import React, { memo } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Handle, Position } from '@xyflow/react';
import { useTheme } from '@mui/material';
import { bgGradient } from 'src/theme/css';
import eventBus from 'src/sections/script/event-bus';

const DEFAULT_HANDLE_STYLE = {
  width: 9,
  height: 9,
  bottom: -5,
};

function CustomStartNode({ data, id }) {
  const theme = useTheme();

  const handleonDoubleClick = () => {
    eventBus.emit('clickNode', {
      status: 'editting',
      typeForm: data,
      nodeId: id,
    });
  };

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{
        ...bgGradient({
          startColor: theme.palette.primary.main,
          endColor: theme.palette.primary.main,
        }),
        color: 'white',
        padding: '10px',
        boxShadow: theme.customShadows.z8,
        width: '60px',
        aspectRatio: 1,
        borderRadius: '50%',
        fontSize: '14px',
        fontWeight: 'semibold',
      }}
      onClick={(event) => {
        if (!event.shiftKey) {
          event.preventDefault();
          event.stopPropagation();
        }
        handleonDoubleClick(event);
      }}
    >
      <Typography variant="body2">{data?.name}</Typography>

      <Handle
        type="source"
        id="success"
        position={Position.Right}
        style={{
          ...DEFAULT_HANDLE_STYLE,
          background: '#00A76F',
          border: '1px solid',
          borderColor: 'white',
        }}
      />
    </Stack>
  );
}

export default memo(
  CustomStartNode,
  (prevProps, nextProps) =>
    prevProps.data === nextProps.data && prevProps.selected === nextProps.selected
);

CustomStartNode.propTypes = {
  data: PropTypes.object,
  id: PropTypes.string,
};
