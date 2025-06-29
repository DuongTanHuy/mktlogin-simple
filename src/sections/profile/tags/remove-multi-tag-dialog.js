import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { Autocomplete, Chip, Stack, TextField, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label, { CustomLabel } from 'src/components/label';
// apis
import { ERROR_CODE, NUM_ID_DISPLAY } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import { getListTagApi, removeMultiProfileTagApi } from 'src/api/tags.api';

const RemoveMultiTagDialog = ({ open, onClose, profileIds, handleReLoadData }) => {
  const { workspace_id } = useAuthContext();
  const [options, setOptions] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const { t } = useLocales();
  const [isAutocompleteMenuOpen, setIsAutocompleteMenuOpen] = useState(false);

  const handleClose = () => {
    onClose();
    setNumItem(NUM_ID_DISPLAY);
    setTags([]);
  };

  const handleRemoveTagsProfiles = async () => {
    try {
      setLoading(true);
      const payload = {
        profile_ids: profileIds,
        tag_ids: tags.map((tag) => tag.id),
      };
      await removeMultiProfileTagApi(workspace_id, payload);
      handleReLoadData();
      enqueueSnackbar(t('systemNotify.success.remove'), { variant: 'success' });
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.removeTab'), {
          variant: 'error',
        });
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
      } else
        enqueueSnackbar(error?.message || t('systemNotify.error.remove'), { variant: 'error' });
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
      title={t('dialog.removeTag.title')}
      content={
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="body1">{t('dialog.removeTag.subTitle')}</Typography>
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
              <Stack
                key={tag.id}
                component="li"
                {...props}
                direction="row"
                justifyContent="flex-start"
                mx={1}
              >
                {tag.name}
              </Stack>
            )}
            noOptionsText={<Typography variant="body2">No options</Typography>}
            value={tags || []}
            onChange={(event, newValue) => {
              setTags(newValue);
            }}
            renderInput={(params) => (
              <TextField placeholder={t('dialog.setTag.label')} {...params} />
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
          onClick={handleRemoveTagsProfiles}
          disabled={profileIds?.length === 0}
        >
          {t('dialog.setTag.actions.confirm')}
        </LoadingButton>
      }
    />
  );
};

export default RemoveMultiTagDialog;

RemoveMultiTagDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReLoadData: PropTypes.func,
  profileIds: PropTypes.array,
};
