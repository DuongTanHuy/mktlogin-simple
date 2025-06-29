import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import {
  IconButton,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  Zoom,
  Typography,
  Divider,
  Tooltip,
  ListItemText,
} from '@mui/material';
import CustomPopover from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import { resendInviteApi, revokeInviteApi } from 'src/api/invite.api';
import { useLocales } from 'src/locales';
import TextMaxLine from 'src/components/text-max-line';
import { fDate } from 'src/utils/format-time';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';
import Label from 'src/components/label';

const InvitedTableRow = ({ data, workspaceId, handleResetData }) => {
  const { t } = useLocales();
  const {
    id,
    meta: { member_name, email, role, note },
    updated_at,
  } = data;
  const [targetPopover, setTargetPopover] = useState(null);
  const confirm = useMultiBoolean({
    resend: false,
    revoke: false,
  });
  const [loading, setLoading] = useState(false);
  const popoverTimeoutRef = useRef();

  const [nameRef, showName] = useTooltipNecessity(false);
  const [noteRef, showNote] = useTooltipNecessity(false);

  const handleResend = async () => {
    try {
      setLoading(true);
      await resendInviteApi(workspaceId, id);
      enqueueSnackbar(t('systemNotify.success.invite'), {
        variant: 'success',
      });
    } catch (error) {
      if (error?.detail) {
        enqueueSnackbar(
          `${t('systemNotify.error.requestThrottled')} ${error?.detail?.match(/\d+/g)[0]}s!`,
          {
            variant: 'error',
          }
        );
      } else {
        enqueueSnackbar(error?.detail || t('systemNotify.error.invite'), {
          variant: 'error',
        });
      }
    } finally {
      setLoading(false);
      confirm.onFalse('resend');
    }
  };

  const handleRevoke = async () => {
    try {
      setLoading(true);
      await revokeInviteApi(workspaceId, id);
      handleResetData();
      enqueueSnackbar(t('systemNotify.success.recall'), {
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackbar(t('systemNotify.error.recall'), {
        variant: 'error',
      });
    } finally {
      setLoading(false);
      confirm.onFalse('revoke');
    }
  };

  useEffect(
    () => () => {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
    },
    []
  );

  const renderDialog = (
    <>
      <ConfirmDialog
        open={confirm.value.resend}
        onClose={() => confirm.onFalse('resend')}
        closeButtonName={t('dialog.member.actions.close')}
        title={
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h4">{t('dialog.member.resend.title')}</Typography>
              <IconButton onClick={() => confirm.onFalse('resend')}>
                <Iconify icon="ic:round-close" />
              </IconButton>
            </Stack>
            <Divider />
          </Stack>
        }
        content={t('dialog.member.resend.question')}
        action={
          <LoadingButton
            size="medium"
            variant="contained"
            color="primary"
            loading={loading}
            onClick={handleResend}
          >
            {t('dialog.member.actions.confirm')}
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={confirm.value.revoke}
        onClose={() => confirm.onFalse('revoke')}
        closeButtonName={t('dialog.member.actions.close')}
        title={
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h4">{t('dialog.member.recall.title')}</Typography>
              <IconButton onClick={() => confirm.onFalse('revoke')}>
                <Iconify icon="ic:round-close" />
              </IconButton>
            </Stack>
            <Divider />
          </Stack>
        }
        content={t('dialog.member.recall.question')}
        action={
          <LoadingButton
            size="medium"
            variant="contained"
            color="error"
            loading={loading}
            onClick={handleRevoke}
          >
            {t('dialog.member.actions.confirm')}
          </LoadingButton>
        }
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

        <TableCell>{email}</TableCell>

        <TableCell>
          <ListItemText
            primary={fDate(new Date(updated_at), "d 'tháng' M yyyy")}
            secondary={fDate(new Date(updated_at), 'p')}
            primaryTypographyProps={{ typography: 'subtitle2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

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
          <MenuItem
            onClick={() => {
              confirm.onTrue('resend');
              setTargetPopover(null);
            }}
          >
            <Iconify icon="mdi:email-resend-outline" />
            {t('popup.listInvited.actions.resend')}
          </MenuItem>

          <Divider />

          <MenuItem
            sx={{
              color: 'error.main',
            }}
            onClick={() => {
              confirm.onTrue('revoke');
              setTargetPopover(null);
            }}
          >
            <Iconify icon="fluent:archive-arrow-back-48-regular" />
            {t('popup.listInvited.actions.recall')}
          </MenuItem>
        </Stack>
      </CustomPopover>
      {renderDialog}
    </>
  );
};

export default InvitedTableRow;

InvitedTableRow.propTypes = {
  data: PropTypes.object,
  workspaceId: PropTypes.string,
  handleResetData: PropTypes.func,
};
