import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import {
  IconButton,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  Zoom,
  Divider,
  Tooltip,
} from '@mui/material';
import CustomPopover from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import { useAuthContext } from 'src/auth/hooks';
import { CustomTooltip } from 'src/components/custom-tooltip';
import { getWorkgroupUserApi } from 'src/api/workgroup-user.api';
import { useLocales } from 'src/locales';
import TextMaxLine from 'src/components/text-max-line';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';
import Label from 'src/components/label';
import DeleteMemberDialog from './action-dialog/delete-member';
import AddEditMemberDialog from './action-dialog/add-edit-member';
import eventBus from '../script/event-bus';

const MemberTableRow = ({ data, handleRerender }) => {
  const { t } = useLocales();
  const { user: userAuth, workspace_id } = useAuthContext();
  const { id, member_name, user, role, note } = data;
  const [targetPopover, setTargetPopover] = useState(null);
  const popoverTimeoutRef = useRef();
  const [editData, setEditData] = useState(null);
  const confirm = useMultiBoolean({
    delete: false,
    edit: false,
  });
  const isCurrentUser = userAuth?.email === user;
  const [workspaceRole, setWorkspaceRole] = useState('member');

  const [nameRef, showName] = useTooltipNecessity(false);
  const [noteRef, showNote] = useTooltipNecessity(false);

  useEffect(
    () => () => {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
    },
    []
  );

  const handleEditMember = async () => {
    try {
      const response = await getWorkgroupUserApi(workspace_id, id);
      setEditData(response?.data);
      confirm.onTrue('edit');
      setTargetPopover(null);
    } catch (error) {
      /* empty */
    }
  };

  useEffect(() => {
    const handleEvent = (userRole) => {
      setWorkspaceRole(userRole);
    };

    eventBus.on('identifyRoles', handleEvent);

    return () => {
      eventBus.off('identifyRoles', handleEvent);
    };
  }, []);

  const renderDialog = (
    <>
      <DeleteMemberDialog
        userId={id}
        open={confirm.value.delete}
        onClose={() => confirm.onFalse('delete')}
        handleResetData={handleRerender}
        type={isCurrentUser ? 'leave' : 'delete'}
      />
      <AddEditMemberDialog
        currentData={editData}
        open={confirm.value.edit}
        onClose={() => {
          setEditData(null);
          confirm.onFalse('edit');
        }}
        handleResetData={handleRerender}
        workspaceRole={workspaceRole}
      />
    </>
  );

  return (
    <>
      <TableRow hover>
        <TableCell
          sx={{
            maxWidth: 160,
          }}
        >
          <Tooltip title={showName ? member_name : ''}>
            <TextMaxLine ref={nameRef} line={1}>
              {member_name}
            </TextMaxLine>
          </Tooltip>
        </TableCell>

        <TableCell>{user}</TableCell>

        <TableCell align="center">
          <Label color="primary">
            {(() => {
              let label;
              if (role === 'admin') {
                label = t('dialog.member.invite.options.admin');
              } else if (role === 'manager') {
                label = t('dialog.member.invite.options.manager');
              } else {
                label = t('dialog.member.invite.options.member');
              }
              return label;
            })()}
          </Label>
        </TableCell>

        <TableCell
          sx={{
            maxWidth: 260,
          }}
          align="left"
        >
          <Tooltip
            title={showNote ? note : ''}
            componentsProps={{
              tooltip: {
                sx: {
                  textAlign: 'justify',
                  typography: 'body2',
                },
              },
            }}
          >
            <TextMaxLine ref={noteRef} line={2}>
              {note}
            </TextMaxLine>
          </Tooltip>
        </TableCell>
        <TableCell align="center">
          <IconButton onClick={(event) => setTargetPopover(event.currentTarget)}>
            <Iconify icon="ri:more-2-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={targetPopover}
        onClose={() => setTargetPopover(null)}
        sx={{
          width: 'fit-content',
        }}
        TransitionComponent={Zoom}
        arrow="top-center"
      >
        <Stack>
          <CustomTooltip
            status={isCurrentUser}
            title={t('member.tooltips.notPermission')}
            placement="left"
          >
            <MenuItem disabled={isCurrentUser} onClick={handleEditMember}>
              <Iconify icon="uil:edit" />
              {t('popup.listMember.actions.edit')}
            </MenuItem>
          </CustomTooltip>

          <Divider />

          <MenuItem
            sx={{
              color: 'error.main',
            }}
            onClick={() => {
              confirm.onTrue('delete');
              setTargetPopover(null);
            }}
          >
            <Iconify icon={isCurrentUser ? 'tabler:logout' : 'fluent:delete-16-regular'} />
            {isCurrentUser
              ? t('popup.listMember.actions.leave')
              : t('popup.listMember.actions.delete')}
          </MenuItem>
        </Stack>
      </CustomPopover>
      {renderDialog}
    </>
  );
};

export default MemberTableRow;

MemberTableRow.propTypes = {
  data: PropTypes.object,
  handleRerender: PropTypes.func,
};
