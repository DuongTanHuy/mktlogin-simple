import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { Button, IconButton, Stack, TextField, Typography, alpha } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label, { CustomLabel } from 'src/components/label';
// apis
import { ERROR_CODE, NUM_ID_DISPLAY } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { cloneDeep, debounce } from 'lodash';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import { addMultiTabApi } from 'src/api/profile.api';

const AddTabMultiDialog = ({ open, onClose, profileIds, workspaceId }) => {
  const getId = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const { themeMode } = useSettingsContext();
  const [listTab, setListTab] = useState([
    {
      id: getId(),
      url: '',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const { t } = useLocales();

  const handleAddTab = () => {
    const _clone = cloneDeep(listTab);
    _clone.push({
      id: getId(),
      url: '',
    });

    setListTab(_clone);
  };

  const handleUpdateTab = (id, value) => {
    const _clone = cloneDeep(listTab);
    const index = _clone.findIndex((item) => item.id === id);
    _clone[index].url = value;
    _clone[index].error = false;
    setListTab(_clone);
  };

  const handleDeleteTab = (id) => {
    const _clone = cloneDeep(listTab);
    const index = _clone.findIndex((item) => item.id === id);
    _clone.splice(index, 1);
    setListTab(_clone);
  };

  const handleClose = () => {
    onClose();
    setNumItem(NUM_ID_DISPLAY);
  };

  const handleSubmit = async () => {
    try {
      const validateBookmarkData = listTab.map((item) => {
        if (!item.url)
          return {
            ...item,
            error: true,
          };
        return item;
      });

      const hasError = validateBookmarkData.some((item) => item.error);

      if (hasError) {
        setListTab(validateBookmarkData);
        return;
      }

      setLoading(true);
      const payload = {
        profile_ids: profileIds,
        url_tabs: listTab.map((item) => item.url),
      };

      if (workspaceId) {
        await addMultiTabApi(workspaceId, payload);
        handleClose();
        setListTab([]);
        enqueueSnackbar(t('systemNotify.success.add'), { variant: 'success' });
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.addTab'), {
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
      open={open}
      onClose={() => {
        handleClose();
      }}
      closeButtonName={t('dialog.addTab.actions.cancel')}
      title={t('dialog.addTab.header')}
      content={
        <Stack spacing={3}>
          <Typography variant="body1">{t('dialog.addTab.subheader')}</Typography>
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
              <Typography>{t('dialog.addTab.list')}</Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                onClick={handleAddTab}
              >
                {t('dialog.addTab.actions.add')}
              </Button>
            </Stack>

            <Stack
              spacing={1.5}
              py={1}
              width={1}
              sx={{
                ...(listTab.length === 0 && {
                  display: 'none',
                }),
              }}
            >
              {listTab &&
                listTab.map((item) => (
                  <Stack key={item.id} direction="row" alignItems="center" spacing={1.5}>
                    <TextField
                      error={item.error}
                      helperText={item.error ? t('dialog.addTab.validate') : ''}
                      fullWidth
                      size="small"
                      placeholder={t('dialog.addTab.placeholder')}
                      defaultValue={item.url}
                      onChange={debounce(
                        (event) => {
                          handleUpdateTab(item.id, event.target.value);
                        },
                        [200]
                      )}
                    />
                    <IconButton onClick={() => handleDeleteTab(item.id)}>
                      <Iconify icon="gg:remove" />
                    </IconButton>
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
          disabled={listTab.length === 0}
        >
          {t('dialog.addTab.actions.add')}
        </LoadingButton>
      }
    />
  );
};

export default AddTabMultiDialog;

AddTabMultiDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  profileIds: PropTypes.array,
  workspaceId: PropTypes.string.isRequired,
};
