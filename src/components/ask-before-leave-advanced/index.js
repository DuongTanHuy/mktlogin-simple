import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useBlocker, useNavigate, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useLocales } from 'src/locales';
import { Divider, IconButton, Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Iconify from '../iconify';

function AlertDialog({ isBlocking, isSaving, onSave, isSaveBeforeLeave }) {
  const { t } = useLocales();

  function useCallbackPrompt(when) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPrompt, setShowPrompt] = useState(false);
    const [lastLocation, setLastLocation] = useState(null);
    const [confirmedNavigation, setConfirmedNavigation] = useState(false);

    const cancelNavigation = useCallback(() => {
      setShowPrompt(false);
    }, []);

    const handleBlockedNavigation = useCallback(
      (nextLocation) => {
        if (!confirmedNavigation && nextLocation.location.pathname !== location.pathname && when) {
          console.log('set true ======> ', when);
          setShowPrompt(true);
          setLastLocation(nextLocation);
          return false;
        }
        return true;
      },
      [confirmedNavigation, location.pathname, when]
    );

    const confirmNavigation = useCallback(() => {
      setShowPrompt(false);
      setConfirmedNavigation(true);
    }, []);

    useEffect(() => {
      if (confirmedNavigation && lastLocation) {
        navigate(`${lastLocation.location.pathname + lastLocation.location.search}`);
      }
    }, [confirmedNavigation, lastLocation, navigate]);

    useBlocker(handleBlockedNavigation, when);

    return [showPrompt, setShowPrompt, confirmNavigation, cancelNavigation];
  }

  const [showPrompt, setShowPrompt, confirmNavigation, cancelNavigation] =
    useCallbackPrompt(isBlocking);
  return (
    <Dialog
      open={showPrompt}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle
        id="alert-dialog-title"
        sx={{
          pb: 1.5,
          pt: 2,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="si:warning-fill" color="warning.main" width={30} />
            <Typography variant="h6">
              {isSaveBeforeLeave
                ? t('dialog.saveBeforeLeave.title')
                : t('dialog.askBeforeLeave.title')}
            </Typography>
          </Stack>

          <IconButton
            onClick={() => setShowPrompt(false)}
            sx={{
              borderRadius: 1,
              p: 0.5,
            }}
          >
            <Iconify icon="mingcute:close-fill" />
          </IconButton>
        </Stack>

        <Divider sx={{ pt: 1 }} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {isSaveBeforeLeave
            ? t('dialog.saveBeforeLeave.subTitle')
            : t('dialog.askBeforeLeave.subTitle')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={confirmNavigation} variant="contained">
          {isSaveBeforeLeave
            ? t('dialog.saveBeforeLeave.actions.no')
            : t('dialog.askBeforeLeave.actions.leave')}
        </Button>
        <LoadingButton
          loading={isSaving}
          onClick={async () => {
            if (isSaveBeforeLeave) {
              const isContinue = await onSave();
              if (isContinue) {
                confirmNavigation();
              } else {
                setShowPrompt(false);
              }
            } else {
              cancelNavigation();
            }
          }}
          color="primary"
          variant="contained"
          autoFocus
        >
          {isSaveBeforeLeave
            ? t('dialog.saveBeforeLeave.actions.save')
            : t('dialog.askBeforeLeave.actions.stay')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

const areEqual = (prevProps, nextProps) =>
  prevProps.isBlocking === nextProps.isBlocking &&
  prevProps.isSaving === nextProps.isSaving &&
  prevProps.isSaveBeforeLeave === nextProps.isSaveBeforeLeave &&
  prevProps.saveFlowChart === nextProps.saveFlowChart;

export default memo(AlertDialog, areEqual);

AlertDialog.propTypes = {
  isBlocking: PropTypes.bool,
  isSaving: PropTypes.bool,
  isSaveBeforeLeave: PropTypes.bool,
  onSave: PropTypes.func,
};
