import PropTypes from 'prop-types';
import {
  Divider,
  IconButton,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  Zoom,
} from '@mui/material';
import React, { useEffect, useMemo, useRef } from 'react';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { CustomTooltip } from 'src/components/custom-tooltip';
import { useLocales } from 'src/locales';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';

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

const WorkGroupButton = React.memo(
  ({
    currentGroup,
    setCurrentGroup,
    data,
    confirm,
    setActionData,
    handlePermissions,
    disableRole = false,
  }) => {
    const { t } = useLocales();
    const { name, id } = data;
    const popoverTimeoutRef = useRef();
    const popover = usePopover();
    const [nameRef, showName] = useTooltipNecessity(false);

    const actionsPermission = useMemo(
      () =>
        handlePermissions
          ? {
              canEditWorkgroup: handlePermissions('editWorkgroup'),
              canDeleteWorkgroup: handlePermissions('deleteWorkgroup'),
            }
          : {},
      [handlePermissions]
    );

    useEffect(
      () => () => {
        if (popoverTimeoutRef.current) {
          clearTimeout(popoverTimeoutRef.current);
        }
      },
      []
    );

    return (
      <ListItemButton
        selected={String(currentGroup) === String(data?.id)}
        onClick={setCurrentGroup}
        sx={{
          borderRadius: 1,
          py: 0,
          padding: '0 0 0 15px',
          minHeight: '40px',
        }}
      >
        <Tooltip title={showName ? name : ''}>
          <ListItemText
            primary={name}
            primaryTypographyProps={{ component: CustomTypography, ref: nameRef }}
          />
        </Tooltip>
        {String(id) !== '0' && (
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              popover.onOpen(event);
            }}
          >
            <Tooltip title="More action">
              <Iconify icon="mingcute:more-2-fill" />
            </Tooltip>
          </IconButton>
        )}
        <CustomPopover
          open={popover.open}
          onClose={(event) => {
            event.stopPropagation();
            popover.onClose();
          }}
          sx={{
            width: 140,
          }}
          TransitionComponent={Zoom}
          arrow="top-right"
        >
          <Stack>
            <CustomTooltip
              status={disableRole ? false : !actionsPermission?.canEditWorkgroup}
              title={t('member.tooltips.notPermission')}
              placement="right"
            >
              <MenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  setActionData(data);
                  popover.onClose();
                  confirm.onTrue('edit');
                }}
                disabled={disableRole ? false : !actionsPermission?.canEditWorkgroup}
              >
                <Iconify icon="uil:edit" />
                {t('popup.userGroup.actions.edit')}
              </MenuItem>
            </CustomTooltip>

            <Divider />

            <CustomTooltip
              status={disableRole ? false : !actionsPermission?.canDeleteWorkgroup}
              title={t('member.tooltips.notPermission')}
              placement="right"
            >
              <MenuItem
                sx={{
                  color: 'error.main',
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  setActionData(data);
                  popover.onClose();
                  confirm.onTrue('delete');
                }}
                disabled={disableRole ? false : !actionsPermission?.canDeleteWorkgroup}
              >
                <Iconify icon="fluent:delete-16-regular" />
                {t('popup.userGroup.actions.delete')}
              </MenuItem>
            </CustomTooltip>
          </Stack>
        </CustomPopover>
      </ListItemButton>
    );
  },
  (prevProps, nextProps) =>
    prevProps.data === nextProps.data && prevProps.currentGroup === nextProps.currentGroup
);

export default WorkGroupButton;

WorkGroupButton.propTypes = {
  data: PropTypes.object,
  confirm: PropTypes.object,
  currentGroup: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  setCurrentGroup: PropTypes.func,
  setActionData: PropTypes.func,
  handlePermissions: PropTypes.func,
  disableRole: PropTypes.bool,
};
