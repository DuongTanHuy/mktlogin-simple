import { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { Autocomplete, Button, Chip, Divider, Stack, TextField, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label, { CustomLabel } from 'src/components/label';
// apis
import { ERROR_CODE, NUM_ID_DISPLAY } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { createTagApi, getListTagApi, setMultiProfileTagApi } from 'src/api/tags.api';
import Iconify from 'src/components/iconify';

const SetMultiTagDialog = ({ open, onClose, profileIds, handleReLoadData }) => {
  const { workspace_id } = useAuthContext();
  const [options, setOptions] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const { t } = useLocales();
  const [tagName, setTagName] = useState('');
  const [isAutocompleteMenuOpen, setIsAutocompleteMenuOpen] = useState(false);

  const handleClose = () => {
    onClose();
    setNumItem(NUM_ID_DISPLAY);
    setTags([]);
  };

  const handleAddTag = async () => {
    setLoading(true);
    try {
      const payload = {
        name: tagName,
      };

      const response = await createTagApi(workspace_id, payload);
      setOptions((prev) => [...prev, response.data]);
      setTags((prev) => [...prev, response.data]);
      setTagName('');
      enqueueSnackbar(t('systemNotify.success.add'), { variant: 'success' });
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.addTag'), {
          variant: 'error',
        });
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(false);
      setTagName('');
    }
  };

  const handleSetTagsProfiles = async () => {
    try {
      setLoading(true);
      const payload = {
        profile_ids: profileIds,
        tag_ids: tags.map((tag) => tag.id),
      };
      await setMultiProfileTagApi(workspace_id, payload);
      handleReLoadData();
      enqueueSnackbar(t('systemNotify.success.add'), { variant: 'success' });
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.addTag'), {
          variant: 'error',
        });
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
      } else enqueueSnackbar(error?.message || t('systemNotify.error.add'), { variant: 'error' });
    } finally {
      handleClose();
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleFetchOptions = async () => {
      try {
        const response = await getListTagApi(workspace_id);
        const { data: listTagData } = response;

        if (listTagData) {
          setOptions(listTagData);
        }
      } catch (error) {
        /* empty */
      }
    };

    if (open) {
      handleFetchOptions();
    }
  }, [open, workspace_id]);

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        if (!isAutocompleteMenuOpen) {
          handleClose();
        }
      }}
      closeButtonName={t('dialog.setTag.actions.cancel')}
      title={t('dialog.setTag.title')}
      content={
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="body1">{t('dialog.setTag.subTitle')}</Typography>
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              sx={{
                typography: 'body2',
                color: 'error.main',
              }}
            >
              {profileIds?.length > 0
                ? profileIds.slice(0, numItem).map((profileId) => (
                    <Label
                      key={profileId}
                      color="primary"
                      sx={{
                        p: 2,
                      }}
                    >
                      {profileId}
                    </Label>
                  ))
                : t('quickAction.expiredProfile')}
              {profileIds.length > NUM_ID_DISPLAY && (
                <CustomLabel length={profileIds.length} numItem={numItem} setNumItem={setNumItem} />
              )}
            </Stack>
          </Stack>
          <Autocomplete
            onOpen={() => {
              setIsAutocompleteMenuOpen(true);
            }}
            onClose={() => {
              const timeoutId = setTimeout(() => {
                setIsAutocompleteMenuOpen(false);
                clearTimeout(timeoutId);
              }, 300);
            }}
            multiple
            name="tags"
            disableCloseOnSelect
            options={options}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.name}
            renderOption={(props, tag) => (
              <Fragment key={tag.id}>
                <Stack
                  pt="14px"
                  pb={1}
                  sx={{
                    '&:not(:first-of-type)': {
                      display: 'none',
                    },
                  }}
                  spacing={1.5}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      value={tagName}
                      placeholder={t('dialog.setTag.subAddTag')}
                      InputProps={{
                        startAdornment: (
                          <Iconify
                            icon="formkit:add"
                            width={20}
                            sx={{ mr: 1 }}
                            color="primary.main"
                          />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '& input': {
                          color: 'primary.main',
                        },
                        ml: '2px',
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      endIcon={<Iconify icon="mi:enter" width={16} />}
                      sx={{
                        whiteSpace: 'nowrap',
                        width: '130px',
                        mr: '16px',
                      }}
                      onClick={handleAddTag}
                      disabled={!tagName}
                    >
                      {t('dialog.setTag.actions.setTag')}
                    </Button>
                  </Stack>
                  <Divider
                    sx={{
                      mx: 2,
                    }}
                  />
                </Stack>
                <Stack component="li" {...props} direction="row" justifyContent="flex-start" mx={1}>
                  {tag.name}
                </Stack>
              </Fragment>
            )}
            noOptionsText={
              <Stack spacing={1}>
                <Stack
                  sx={{
                    '&:not(:first-of-type)': {
                      display: 'none',
                    },
                  }}
                  spacing={1.5}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      value={tagName}
                      placeholder={t('dialog.setTag.subAddTag')}
                      InputProps={{
                        startAdornment: (
                          <Iconify
                            icon="formkit:add"
                            width={20}
                            sx={{ mr: 1 }}
                            color="primary.main"
                          />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '& input': {
                          color: 'primary.main',
                        },
                        '& .MuiInputBase-root': {
                          pl: 0,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      endIcon={<Iconify icon="mi:enter" width={16} />}
                      sx={{
                        whiteSpace: 'nowrap',
                        width: '130px',
                      }}
                      onClick={handleAddTag}
                      disabled={!tagName}
                    >
                      {t('dialog.setTag.actions.setTag')}
                    </Button>
                  </Stack>
                  <Divider />
                </Stack>
                <Typography variant="body2">No options</Typography>
              </Stack>
            }
            value={tags || []}
            onChange={(event, newValue) => {
              setTags(newValue);
              setTagName('');
            }}
            renderInput={(params) => (
              <TextField
                placeholder={t('dialog.setTag.label')}
                onChange={(event) => {
                  setTagName(event.target.value);
                }}
                onBlur={() => {
                  setTagName('');
                }}
                {...params}
              />
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={option.name}
                  size="small"
                  color="primary"
                  variant="soft"
                />
              ))
            }
          />
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          onClick={handleSetTagsProfiles}
          disabled={profileIds?.length === 0}
        >
          {t('dialog.setTag.actions.add')}
        </LoadingButton>
      }
    />
  );
};

export default SetMultiTagDialog;

SetMultiTagDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReLoadData: PropTypes.func,
  profileIds: PropTypes.array,
};
