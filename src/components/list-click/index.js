import PropTypes from 'prop-types';
import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Iconify from 'src/components/iconify';
import Button from '@mui/material/Button';
import { useAuthContext } from 'src/auth/hooks';
import { setStorage, getStorage, removeStorage } from 'src/hooks/use-local-storage';
import eventBus from 'src/sections/script/event-bus';

let eventRegistered = false;

export default function PositionedMenu({
  name,
  getVariable,
  openVariableModal,
  handleSelectVariable,
  sx,
}) {
  const { variableFlow } = useAuthContext();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setAnchorEl(event.currentTarget);
    if (name) {
      setStorage('input_focusing_current_form', name);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = React.useCallback(
    (item) => {
      const inputFocusingCurrent = getStorage('input_focusing_current_form');
      const inputParsed = inputFocusingCurrent || '';

      if (handleSelectVariable) {
        handleSelectVariable(item.key);
      } else if (!name) {
        getVariable(`\${${item.key}}`);
      } else if (inputParsed) {
        getVariable(inputParsed, item);
      } else {
        getVariable(name, item);
      }
      setAnchorEl(null);
    },
    [getVariable, handleSelectVariable, name]
  );

  React.useEffect(() => {
    const handleSelectAfterAdded = (item) => {
      if (item?.length > 0) {
        handleSelect(item[0]);
      }
    };

    if (!eventRegistered) {
      eventBus.on('applyVariableAfterAdded', handleSelectAfterAdded);
      eventRegistered = true;
    }

    return () => {
      eventBus.removeListener('applyVariableAfterAdded', handleSelectAfterAdded);
      eventRegistered = false;
    };
  }, [handleSelect]);

  const getAttribute = (event) => {
    if (event?.currentTarget?.id) {
      setStorage('input_focusing_current_form', event?.currentTarget?.id);
    }
  };

  React.useEffect(() => {
    removeStorage('input_focusing_current_form');
    return () => {
      removeStorage('input_focusing_current_form');
    };
  }, []);

  return (
    <>
      <IconButton
        onClick={handleClick}
        edge="end"
        sx={{
          ...sx,
        }}
      >
        <Iconify icon="fluent:braces-variable-20-filled" />
      </IconButton>
      <Menu
        sx={{ width: '200px' }}
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem sx={{ width: '200px', overflow: 'hidden' }}>
          <Button
            variant="outlined"
            size="small"
            width="100%"
            id={name}
            onClick={(event) => {
              openVariableModal();
              setAnchorEl(null);
              getAttribute(event);
            }}
            startIcon={<Iconify icon="ion:create-outline" />}
          >
            Tạo biến mới
          </Button>
        </MenuItem>
        {variableFlow?.list &&
          variableFlow.list.map((item) => (
            <MenuItem
              sx={{ width: '200px', overflow: 'hidden' }}
              key={item.id}
              onClick={() => handleSelect(item)}
            >
              {item.key}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
}

PositionedMenu.propTypes = {
  getVariable: PropTypes.func,
  handleSelectVariable: PropTypes.func,
  openVariableModal: PropTypes.func,
  name: PropTypes.string,
  sx: PropTypes.object,
};
