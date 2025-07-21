import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { Button, Stack, TextField, Typography, alpha } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label, { CustomLabel } from 'src/components/label';
// apis
import { ERROR_CODE, NUM_ID_DISPLAY } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import { addMultiBookmarkApi } from 'src/api/profile.api';

const AddBookmarkMultiDialog = ({ open, onClose, profileIds, workspaceId }) => {
  const { themeMode } = useSettingsContext();
  const getId = () => String(Date.now());
  const [listBookmark, setListBookmark] = useState([
    {
      id: getId(),
      name: '',
      url: '',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const { t } = useLocales();

  const handleAddBookmark = () => {
    const _clone = cloneDeep(listBookmark);
    _clone.push({
      id: getId(),
      name: '',
      url: '',
    });

    setListBookmark(_clone);
  };

  const handleUpdateBookmark = (id, key, value) => {
    const _clone = cloneDeep(listBookmark);
    const index = _clone.findIndex((item) => item.id === id);
    if (index === -1) return;
    _clone[index].error = false;
    _clone[index][key] = value;
    setListBookmark(_clone);
  };

  const handleDeleteBookmark = (id) => {
    const _clone = cloneDeep(listBookmark);
    const index = _clone.findIndex((item) => item.id === id);
    _clone.splice(index, 1);
    setListBookmark(_clone);
  };

  const handleClose = () => {
    onClose();
    setNumItem(NUM_ID_DISPLAY);
  };

  const handleSubmit = async () => {
    try {
      const validateBookmarkData = listBookmark.map((item) => {
        if (!item.name || !item.url)
          return {
            ...item,
            error: true,
          };
        return item;
      });

      const hasError = validateBookmarkData.some((item) => item.error);

      if (hasError) {
        setListBookmark(validateBookmarkData);
        return;
      }

      setLoading(true);
      const payload = {
        profile_ids: profileIds,
        bookmarks: listBookmark,
      };
      if (workspaceId) {
        await addMultiBookmarkApi(workspaceId, payload);
        // handleReLoadData();
        handleClose();
        setListBookmark([]);
        enqueueSnackbar(t('systemNotify.success.add'), { variant: 'success' });
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.addBookmark'), {
          variant: 'error',
        });
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        if (error_fields[keys[0]][0] === 'profile_list_invalid') {
          // handleReLoadData();
          enqueueSnackbar(t('systemNotify.error.invalidListProfile'), { variant: 'error' });
        } else {
          enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
        }
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      sx={{
        '& .MuiDialogContent-root': {
          ...(listBookmark.length > 4 && {
            pr: 2,
          }),
        },
      }}
      open={open}
      onClose={() => {
        handleClose();
      }}
      closeButtonName={t('dialog.addBookmark.actions.cancel')}
      title={t('dialog.addBookmark.header')}
      content={
        <Stack spacing={3}>
          <Typography variant="body1">{t('dialog.addBookmark.subheader')}</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" mb={1}>
            {profileIds.slice(0, numItem).map((profileId) => (
              <Label
                key={profileId}
                color="primary"
                sx={{
                  p: 2,
                }}
              >
                {profileId}
              </Label>
            ))}
            {profileIds.length > NUM_ID_DISPLAY && (
              <CustomLabel length={profileIds.length} numItem={numItem} setNumItem={setNumItem} />
            )}
          </Stack>

          <Stack
            sx={{
              border: '1px solid',
              borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
              padding: '12px',
              paddingTop: '4px',
              paddingBottom: '4px',
              borderRadius: 1,
              gap: 0,
            }}
            spacing={1}
            width={1}
            mr={-1}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                backgroundColor:
                  themeMode === 'light' ? '#ffffff' : (theme) => theme.palette.grey[800],
                py: 1,
              }}
            >
              <Typography>{t('dialog.addBookmark.list')}</Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                onClick={handleAddBookmark}
              >
                {t('dialog.addBookmark.actions.add')}
              </Button>
            </Stack>

            <Stack
              spacing={1}
              py={1}
              width={1}
              sx={{
                ...(listBookmark.length === 0 && {
                  display: 'none',
                }),
              }}
            >
              {listBookmark &&
                listBookmark.map((item) => (
                  <Stack
                    key={item.id}
                    spacing={2}
                    width={1}
                    sx={{
                      position: 'relative',
                      p: 2,
                      borderRadius: 1.5,
                      // bgcolor:
                      //   index % 2 === 0
                      //     ? (theme) => alpha(theme.palette.grey[400], 0.08)
                      //     : (theme) => alpha(theme.palette.grey[900], 0.08),
                      bgcolor: (theme) => alpha(theme.palette.grey[400], 0.08),
                      border: '1px solid',
                      borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                      zIndex: 10,
                      ...(item?.error && {
                        border: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.error.main, 0.32),
                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                      }),
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" sx={{ width: 0.14, ml: 1 }}>
                        {t('dialog.addBookmark.labels.name')}
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={t('dialog.addBookmark.placeholder.name')}
                        defaultValue={item.name}
                        onChange={debounce(
                          (event) => {
                            handleUpdateBookmark(item.id, 'name', event.target.value);
                          },
                          [200]
                        )}
                      />
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" sx={{ width: 0.14, ml: 1 }}>
                        {t('dialog.addBookmark.labels.url')}
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={t('dialog.addBookmark.placeholder.url')}
                        defaultValue={item.url}
                        onChange={debounce(
                          (event) => {
                            handleUpdateBookmark(item.id, 'url', event.target.value);
                          },
                          [200]
                        )}
                      />
                    </Stack>
                    <Iconify
                      onClick={() => handleDeleteBookmark(item.id)}
                      icon="carbon:close-filled"
                      sx={{
                        width: '35px',
                        color: 'text.disabled',
                        position: 'absolute',
                        top: -6,
                        right: -14,
                        '&:hover': { cursor: 'pointer', color: 'text.primary' },
                      }}
                    />

                    {item?.error && (
                      <Typography
                        variant="caption"
                        fontStyle="italic"
                        color="error"
                        sx={{
                          ml: 10,
                        }}
                      >
                        {t('systemNotify.error.fullFillData')}
                      </Typography>
                    )}
                  </Stack>
                ))}
            </Stack>
          </Stack>
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={listBookmark.length === 0}
        >
          Thêm
        </LoadingButton>
      }
    />
  );
};

export default AddBookmarkMultiDialog;

AddBookmarkMultiDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  profileIds: PropTypes.array,
  workspaceId: PropTypes.string.isRequired,
};
