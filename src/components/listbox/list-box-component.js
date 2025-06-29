import PropTypes from 'prop-types';
import React from 'react';
// @mui
import { Button, Stack } from '@mui/material';
import Iconify from '../iconify';

const CustomListboxComponent = React.forwardRef(({ children, onClick, ...props }, ref) => {
  const customNode = (
    <Stack p={2}>
      <Button
        variant="outlined"
        size="small"
        width="100px"
        onClick={onClick}
        startIcon={<Iconify icon="ion:create-outline" />}
      >
        Tạo biến mới
      </Button>
    </Stack>
  );

  return (
    <ul ref={ref} {...props}>
      {customNode}
      {children}
    </ul>
  );
});

export default CustomListboxComponent;

CustomListboxComponent.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
};
