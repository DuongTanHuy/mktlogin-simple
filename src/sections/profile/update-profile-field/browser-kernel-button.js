import PropTypes from 'prop-types';

import { Button, Grow, Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Iconify from 'src/components/iconify';

export default function BrowserKernelButton({
  label,
  options,
  version,
  setVersion,
  icon,
  button,
  error,
  resetErrors,
}) {
  const [anchor, setAnchor] = useState(null);
  const [width, setWidth] = useState(0);
  const open = Boolean(anchor);
  const [kernelVersion, setKernelVersion] = useState('');

  const handleOpen = (event) => {
    setAnchor(event.currentTarget);
  };

  useEffect(() => {
    if (anchor) {
      setWidth(anchor.clientWidth - (options.length > 5 ? 18 : 8));
    }
  }, [anchor, options.length]);

  return (
    <Stack width={1} spacing={1}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Button
        fullWidth
        variant="outlined"
        endIcon={
          options.length !== 0 && (
            <Iconify
              width={18}
              icon="icon-park-outline:up"
              color="#919EAB"
              sx={{
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'all 0.3s ease',
              }}
            />
          )
        }
        onClick={handleOpen}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderRadius: 8,
          ...(open && {
            borderColor: 'primary.main',
          }),
          ...(error && {
            borderColor: 'error.main',
          }),
          '&:hover': {
            borderColor: 'primary.light',
          },
        }}
      >
        <Stack direction="row" spacing={1} alignContent="center" justifyContent="center">
          <Iconify icon={icon} />
          {`${button} ${kernelVersion ? `${kernelVersion}` : ''}`}
        </Stack>
      </Button>
      <Typography variant="caption" color="error.main">
        {error}
      </Typography>
      <Menu
        id="chrome-menu"
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        TransitionComponent={Grow}
      >
        <Stack
          sx={{
            width,
            maxHeight: 200,
          }}
        >
          {options.map((item) => (
            <MenuItem
              key={item.id}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onClick={() => {
                if (error) {
                  resetErrors();
                }
                setVersion(item.id);
                setKernelVersion(item.kernel);
                setAnchor(null);
              }}
            >
              <Typography>{item.kernel}</Typography>
              {version === item.id && <Iconify icon={icon} color="primary.main" width={16} />}
            </MenuItem>
          ))}
        </Stack>
      </Menu>
    </Stack>
  );
}

BrowserKernelButton.propTypes = {
  label: PropTypes.string,
  version: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.string,
  button: PropTypes.string,
  error: PropTypes.string,
  options: PropTypes.array,
  resetErrors: PropTypes.func,
  setVersion: PropTypes.func,
};
