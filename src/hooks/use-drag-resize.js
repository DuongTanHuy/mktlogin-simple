import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const ResizeHook = ({ children }) => {
  const [width, setWidth] = useState(200); // Initial width
  const [height, setHeight] = useState(150); // Initial height
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;

    const newWidth = width + e.clientX - startX;
    const newHeight = height + e.clientY - startY;

    setWidth(newWidth);
    setHeight(newHeight);

    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const divStyle = {
    width: `${width}px`,
    height: `${height}px`,
  };

  return (
    <Box
      className="resizable-div"
      style={divStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {children}
    </Box>
  );
};

export default ResizeHook;

ResizeHook.propTypes = {
  children: PropTypes.node,
};
