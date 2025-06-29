import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import { useLocales } from 'src/locales';
import Iconify from 'src/components/iconify';
import { ReactSortable } from 'react-sortablejs';
import { useSettingsContext } from 'src/components/settings';
import { setStorage } from 'src/hooks/use-local-storage';
import { DEFAULT_SHORTCUT, DEFAULT_SHORTCUT_RESOURCE } from 'src/utils/constance';
import SvgColor from 'src/components/svg-color';

export default function CustomShortcutDialog({
  displayMode,
  open,
  onClose,
  listButtonAction,
  values,
  setValues,
}) {
  const { themeMode } = useSettingsContext();
  const { t } = useLocales();
  const [shortcuts, setShortcuts] = useState([]);
  const [options, setOptions] = useState([]);

  const handleApply = () => {
    const newValues = [
      ...shortcuts.map((shortcut) => ({ id: shortcut.id, show: true })),
      ...options.map((option) => ({ id: option.id, show: false })),
    ];

    setStorage(
      displayMode === 'profile' ? 'custom-shortcut' : 'custom-shortcut-resource',
      newValues
    );
    setValues(newValues);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const handleReset = () => {
    const defaultShortcut =
      displayMode === 'profile' ? DEFAULT_SHORTCUT : DEFAULT_SHORTCUT_RESOURCE;
    setShortcuts(
      defaultShortcut
        .map((value) => listButtonAction.find((action) => action.id === value.id && value.show))
        .filter((action) => action?.id)
    );
    setOptions(
      defaultShortcut
        .map((value) => listButtonAction.find((action) => action.id === value.id && !value.show))
        .filter((action) => action?.id)
    );
  };

  useEffect(() => {
    setShortcuts(
      values
        .map((value) => listButtonAction.find((action) => action.id === value.id && action.show))
        .filter((action) => action?.id)
    );
    setOptions(
      values
        .map((value) => listButtonAction.find((action) => action.id === value.id && !action.show))
        .filter((action) => action?.id)
    );
  }, [listButtonAction, open, values]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: (theme) => theme.customShadows.z4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>{t('dialog.customShortcut.title')}</DialogTitle>

      <DialogContent sx={{ typography: 'body2' }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography color="text.secondary">{t('dialog.customShortcut.subTitle')}</Typography>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="mdi:refresh" color="primary.main" />}
              onClick={handleReset}
            >
              {t('dialog.customShortcut.reset')}
            </Button>
          </Stack>
          <Grid
            container
            spacing={2}
            sx={{
              height: '432px',
              overflowY: 'auto',
            }}
          >
            <Grid item xs={12} md={6}>
              <Stack p={2} spacing={2} borderRadius={1} bgcolor="background.neutral">
                <Typography>{t('dialog.customShortcut.shortcuts')}</Typography>
                <ReactSortable
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0,
                  }}
                  list={shortcuts ?? []}
                  setList={(newChildren) => {
                    if (newChildren.every((item) => item.id !== 'btn-more')) {
                      const moreAction = listButtonAction.find((item) => item.id === 'btn-more');
                      setShortcuts([
                        ...newChildren,
                        {
                          ...moreAction,
                          show: true,
                        },
                      ]);
                    } else {
                      setShortcuts(newChildren);
                    }
                  }}
                  group={{
                    name: 'nested',
                    pull: true,
                    put: true,
                  }}
                  animation={150}
                  fallbackOnBody
                  dragHandleClass="drag-handle"
                  swapThreshold={6.5}
                >
                  {shortcuts.map((action) => (
                    <Stack
                      key={action.id}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        width: 1,
                        cursor: 'move',
                        px: 1,
                        py: 0.5,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.grey[themeMode === 'dark' ? 800 : 400], 0.8),
                        borderRadius: '4px',
                        color: 'text.secondary',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          sx={{
                            p: 0.5,
                            cursor: action.label ? 'pointer' : 'not-allowed',
                            pointerEvents: action.label ? 'auto' : 'auto',
                          }}
                          onClick={() => {
                            if (action.label) {
                              setShortcuts((prev) => {
                                setOptions([...options, action]);
                                return prev.filter((item) => item.id !== action.id);
                              });
                            }
                          }}
                        >
                          <SvgColor
                            src="/assets/icons/components/ic_close.svg"
                            sx={{
                              width: 20,
                              height: 20,
                              color: action.label ? 'text.secondary' : 'text.disabled',
                            }}
                          />
                        </IconButton>
                        <Typography>{action.label ?? t('dialog.customShortcut.more')}</Typography>
                        {action.moreIcon}
                      </Stack>
                      <Iconify icon="akar-icons:drag-vertical" />
                    </Stack>
                  ))}
                </ReactSortable>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack p={2} spacing={2} borderRadius={1} bgcolor="background.neutral">
                <Typography>{t('dialog.customShortcut.options')}</Typography>
                <ReactSortable
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0,
                  }}
                  list={options ?? []}
                  setList={(newChildren) => {
                    setOptions(newChildren.filter((item) => !['btn-more'].includes(item.id)));
                  }}
                  group={{
                    name: 'nested',
                    pull: true,
                    put: true,
                  }}
                  animation={150}
                  fallbackOnBody
                  dragHandleClass="drag-handle"
                  swapThreshold={6.5}
                >
                  {options.map((action) => (
                    <Stack
                      key={action.id}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        width: 1,
                        cursor: 'move',
                        px: 1,
                        py: 0.5,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.grey[themeMode === 'dark' ? 800 : 400], 0.8),
                        borderRadius: '4px',
                        color: 'text.secondary',
                        display: action.label ? 'flex' : 'none',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          sx={{
                            p: 0.5,
                          }}
                          onClick={() => {
                            setOptions((prev) => {
                              setShortcuts([...shortcuts, action]);
                              return prev.filter((item) => item.id !== action.id);
                            });
                          }}
                        >
                          <SvgColor
                            src="/assets/icons/components/ic_add.svg"
                            sx={{
                              width: 20,
                              height: 20,
                              color: action.label ? 'text.secondary' : 'text.disabled',
                            }}
                          />
                        </IconButton>
                        <Typography>{action.label}</Typography>
                        {action.moreIcon}
                      </Stack>
                      <Iconify icon="akar-icons:drag-vertical" />
                    </Stack>
                  ))}
                </ReactSortable>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          {t('form.action.cancel')}
        </Button>
        <Button variant="contained" onClick={handleApply}>
          {t('form.action.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CustomShortcutDialog.propTypes = {
  displayMode: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  listButtonAction: PropTypes.array,
  values: PropTypes.array,
  setValues: PropTypes.func,
};
