import PropTypes from 'prop-types';
import React, { memo, useState } from 'react';
import Popover from '@mui/material/Popover';
import { MenuItem, ListItemText, List, ListItem, Stack } from '@mui/material';

import Iconify from 'src/components/iconify';

const CustomMenuContext = ({ anchorEl, onClose, options, anchorPosition, ...other }) => {
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);
  const [currentSubmenu, setCurrentSubmenu] = useState(null);

  const popoverId = anchorEl ? 'node-popover' : undefined;

  const handleSubmenuOpen = (event, submenu) => {
    setSubmenuAnchorEl(event.currentTarget);
    setCurrentSubmenu(submenu);
  };

  const handleSubmenuClose = () => {
    setSubmenuAnchorEl(null);
    setCurrentSubmenu(null);
  };

  return (
    <>
      <Popover
        id={popoverId}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          pointerEvents: 'none',
        }}
        anchorPosition={anchorPosition}
        {...other}
      >
        <Stack
          sx={{
            pointerEvents: 'auto',
          }}
        >
          {options.map((option, index) => (
            <MenuItem
              disabled={option?.disabled}
              key={index}
              onClick={(event) => {
                event.stopPropagation();
                if (option.submenu) {
                  handleSubmenuOpen(event, option.submenu);
                } else {
                  option.action();
                  onClose();
                }
              }}
            >
              {option?.icon && <Iconify icon={option?.icon} sx={{ mr: '6px' }} />}
              <ListItemText primary={option.label} />
              {option.submenu && <Iconify icon="mingcute:right-line" />}
            </MenuItem>
          ))}
        </Stack>
      </Popover>

      {/* Popover cho submenu */}
      {currentSubmenu && (
        <Popover
          open={Boolean(submenuAnchorEl)}
          anchorEl={submenuAnchorEl}
          onClose={handleSubmenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <List>
            {currentSubmenu.map((subOption, subIndex) => (
              <ListItem
                button
                key={subIndex}
                onClick={(event) => {
                  event.stopPropagation();
                  subOption.action();
                  handleSubmenuClose();
                  onClose();
                }}
                sx={{ paddingLeft: '4px' }}
              >
                {subOption?.icon && <Iconify icon={subOption?.icon} sx={{ mr: '4px' }} />}
                <ListItemText primary={subOption.label} />
              </ListItem>
            ))}
          </List>
        </Popover>
      )}
    </>
  );
};

const areEqual = (prevProps, nextProps) =>
  prevProps.anchorEl === nextProps.anchorEl &&
  prevProps.anchorPosition === nextProps.anchorPosition;

export default memo(CustomMenuContext, areEqual);

CustomMenuContext.propTypes = {
  anchorEl: PropTypes.object,
  onClose: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.func,
      submenu: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          action: PropTypes.func.isRequired,
        })
      ),
    })
  ).isRequired,
  anchorPosition: PropTypes.object,
};
