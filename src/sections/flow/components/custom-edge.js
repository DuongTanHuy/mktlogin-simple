/* eslint-disable react/prop-types */
import { IconButton } from '@mui/material';
import React, { memo, useCallback } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';
import Iconify from 'src/components/iconify';

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = useCallback(() => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  }, [id, setEdges]);

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -55%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <IconButton
            className="edgebutton"
            onClick={onEdgeClick}
            sx={{
              p: 0.5,
              width: 30,
              height: 30,
              opacity: 0,
              transition: 'opacity 0.2s linear',
              '&:hover': {
                opacity: 1,
              },
            }}
          >
            <Iconify icon="carbon:close-filled" color="error.main" />
          </IconButton>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
export default memo(
  CustomEdge,
  (prevProps, nextProps) =>
    prevProps.sourceX === nextProps.sourceX &&
    prevProps.sourceY === nextProps.sourceY &&
    prevProps.targetX === nextProps.targetX &&
    prevProps.targetY === nextProps.targetY
);
