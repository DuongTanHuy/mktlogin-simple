/* eslint-disable react/prop-types */
import { alpha, useTheme } from '@mui/material';
import React from 'react';
import { ReactFlow, Background, BackgroundVariant, Controls } from '@xyflow/react';

export default function FlowChartView({
  elementRef,
  customNodes,
  edges,
  handleNodesChange,
  onEdgesChange,
  onConnect,
  setReactFlowInstance,
  ConnectionLine,
  onDrop,
  onDragOver,
  nodeTypes,
  edgeTypes,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragStop,
  onSelectionDrag,
  onSelectionDragStop,
  onPaneClick,
  onNodeContextMenu,
  onSelectionContextMenu,
  handlePanelClick,
  onChartClick,
  onSelectionStart,
  onSelectionEnd,
  onSelectionChange,
  // onMouseMove,
}) {
  const theme = useTheme();

  return (
    <ReactFlow
      id="flow-chart"
      ref={elementRef}
      nodes={customNodes}
      edges={edges}
      onNodesChange={handleNodesChange}
      // onKeyDown={(event) => {
      //   if (event.key === 'Backspace' && event.target.nodeName === 'DIV') {
      //     event.preventDefault();
      //     event.stopPropagation();
      //   }
      //   if (event.key === 'Delete') {
      //     deleteNode('multiple');
      //   }
      // }}
      deleteKeyCode="Delete"
      multiSelectionKeyCode="Shift"
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={setReactFlowInstance}
      connectionLineComponent={ConnectionLine}
      onDrop={onDrop}
      onDragOver={onDragOver}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeDragStart={onNodeDragStart}
      onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      onPaneContextMenu={onPaneClick}
      onNodeContextMenu={onNodeContextMenu}
      onSelectionContextMenu={onSelectionContextMenu}
      onSelectionDrag={onSelectionDrag}
      onSelectionDragStop={onSelectionDragStop}
      onPaneClick={handlePanelClick}
      onClick={onChartClick}
      // onlyRenderVisibleElements
      selectNodesOnDrag={false}
      connectionRadius={30}
      onSelectionStart={onSelectionStart}
      onSelectionEnd={onSelectionEnd}
      onSelectionChange={onSelectionChange}
      // onMouseMove={onMouseMove}
    >
      <Controls />
      <Background
        color={alpha(theme.palette.grey[600], 0.2)}
        gap={30}
        variant={BackgroundVariant.Lines}
      />
    </ReactFlow>
  );
}
