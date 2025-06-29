import PropTypes from 'prop-types';
import {
  Divider,
  Fade,
  IconButton,
  ListItemButton,
  ListItemText,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { useLocales } from 'src/locales';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';
import Iconify from '../../../components/iconify';
import { ID_GROUP_ALL, ID_UNGROUPED } from '../../../utils/constance';
import CustomPopover from '../../../components/custom-popover/custom-popover';
import { usePopover } from '../../../components/custom-popover';

const CustomTypography = React.forwardRef((props, ref) => (
  <Typography
    {...props}
    ref={ref}
    sx={{
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: '0.875rem!important',
      fontWeight: '600!important',
    }}
  />
));

const ProfileGroupItem = ({
  profileGroup,
  groupSelected,
  setGroupSelected,
  handleClickEditProfileGroup,
  handleClickDeleteProfileGroup,
}) => {
  const { t } = useLocales();
  const popover = usePopover();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isShowTooltip, setIsShowTooltip] = useState(false);
  const [nameRef, showName] = useTooltipNecessity();
  const groupName =
    (profileGroup?.id === 0 && t('group.ungrouped')) ||
    (profileGroup?.name === 'group.all' && t('group.all')) ||
    profileGroup?.name;

  const handleChangeGroup = (value) => {
    setGroupSelected(value.id);
    searchParams.delete('page');
    searchParams.set('group', value.id);
    router.push(`${paths.dashboard.profile}?${searchParams}`);
  };

  const handleClickMoreAction = (event) => {
    event.stopPropagation();
    popover.onOpen(event);
    setIsShowTooltip(false);
  };

  return (
    <>
      <ListItemButton
        key={profileGroup.id}
        selected={groupSelected === profileGroup.id}
        onClick={() => handleChangeGroup(profileGroup)}
        sx={{
          borderRadius: 1,
          py: 0,
          padding: '0 0 0 15px',
          minHeight: '40px',
        }}
      >
        <Tooltip title={showName ? groupName : ''}>
          <ListItemText
            primary={groupName}
            primaryTypographyProps={{ component: CustomTypography, ref: nameRef }}
          />
        </Tooltip>
        {![ID_GROUP_ALL, ID_UNGROUPED].includes(profileGroup.id) && (
          <Tooltip
            open={isShowTooltip}
            title="More actions"
            disableInteractive
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 600 }}
          >
            <IconButton
              color={popover.open ? 'inherit' : 'default'}
              onClick={handleClickMoreAction}
              onMouseEnter={() => {
                setIsShowTooltip(true);
              }}
              onMouseLeave={() => setIsShowTooltip(false)}
            >
              <Iconify
                sx={{
                  width: 16,
                  height: 16,
                }}
                icon="ri:more-2-fill"
              />
            </IconButton>
          </Tooltip>
        )}
      </ListItemButton>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        sx={{ width: 140 }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            handleClickEditProfileGroup(profileGroup);
          }}
        >
          <Iconify icon="uil:edit" />
          {t('popup.profileGroup.actions.edit')}
        </MenuItem>
        <Divider />
        <MenuItem
          sx={{
            color: 'error.main',
          }}
          onClick={() => {
            popover.onClose();
            handleClickDeleteProfileGroup(profileGroup);
          }}
        >
          <Iconify icon="fluent:delete-16-regular" />
          {t('popup.profileGroup.actions.delete')}
        </MenuItem>
      </CustomPopover>
    </>
  );
};

export default ProfileGroupItem;

ProfileGroupItem.propTypes = {
  profileGroup: PropTypes.object.isRequired,
  groupSelected: PropTypes.number.isRequired,
  setGroupSelected: PropTypes.func.isRequired,
  handleClickEditProfileGroup: PropTypes.func.isRequired,
  handleClickDeleteProfileGroup: PropTypes.func.isRequired,
};
