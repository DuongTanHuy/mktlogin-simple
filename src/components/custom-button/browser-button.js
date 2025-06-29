import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
// mui
import { Button, Grow, Menu, MenuItem, Stack, Typography } from '@mui/material';
// component
import Iconify from '../iconify';

export default function BrowserButton({
  title,
  icon,
  active,
  setActive,
  name,
  options,
  type,
  onChange,
  size = 'large',
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [width, setWidth] = useState(320);
  const open = Boolean(anchorEl);

  const { setValue, getValues } = useFormContext();

  const handleClick = (event) => {
    if (options.length === 0) {
      setActive(title.value);
      onChange(active, title.value);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClickMenuItem = (item) => {
    let _value;
    if (type === 'browser') {
      _value = item.id;
      setValue('kernel', item.kernel);
    } else {
      _value = item.value;
    }

    setActive(title.value);
    setValue(name, _value, { shouldDirty: true });
    onChange(active, title.value);
    handleClose();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (anchorEl) {
      setWidth(anchorEl.offsetWidth - 8);
    }
  }, [anchorEl]);

  function isBrowserItemActive(item, itemValue) {
    return item.id === itemValue;
  }

  function isPlatformItemActive(item, itemValue) {
    return item?.value?.os === itemValue?.os && item?.value?.version === itemValue?.version;
  }

  function menuItemIsActived(item) {
    const itemValue = getValues(`${name}`);

    switch (type) {
      case 'browser':
        return isBrowserItemActive(item, itemValue);
      case 'platform':
        return isPlatformItemActive(item, itemValue);
      default:
        return false;
    }
  }

  function getMenuItemLabel(item) {
    if (type === 'browser') {
      return item.kernel;
    }
    if (type === 'platform') {
      return item?.label;
    }
    return '';
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center" width={1}>
      <Button
        ref={anchorEl}
        fullWidth
        size={size}
        variant="outlined"
        startIcon={<Iconify width={24} icon={icon} color="primary.main" />}
        endIcon={
          options.length !== 0 && (
            <Iconify
              width={18}
              icon={`icon-park-outline:${open ? 'up' : 'down'}`}
              color="#919EAB"
            />
          )
        }
        sx={{
          justifyContent: 'space-between',
          ...(active === title.value && {
            borderColor: 'primary.main',
          }),
          '&:hover': {
            borderColor: 'primary.light',
          },
        }}
        onClick={handleClick}
      >
        <Typography mr="auto">{title.label}</Typography>
      </Button>
      <Menu
        id="fade-menu"
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Grow}
      >
        <Stack
          sx={{
            width,
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
              onClick={() => handleClickMenuItem(item)}
            >
              <Typography>{getMenuItemLabel(item)}</Typography>
              {menuItemIsActived(item) && (
                <Iconify icon="solar:check-circle-linear" color="primary.main" width={16} />
              )}
            </MenuItem>
          ))}
        </Stack>
      </Menu>
    </Stack>
  );
}

BrowserButton.propTypes = {
  type: PropTypes.oneOf(['browser', 'platform']).isRequired,
  title: PropTypes.object,
  icon: PropTypes.string,
  active: PropTypes.string,
  size: PropTypes.string,
  name: PropTypes.string.isRequired,
  setActive: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};
