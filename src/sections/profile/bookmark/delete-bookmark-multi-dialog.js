import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label, { CustomLabel } from 'src/components/label';
// api
import { ERROR_CODE, NUM_ID_DISPLAY } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { deleteMultiBookmarkApi } from 'src/api/profile.api';

const DeleteBookmarkMultiDialog = ({ open, onClose, profileIds, workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [numItem, setNumItem] = useState(NUM_ID_DISPLAY);
  const { t } = useLocales();
  const [deleteMode, setDeleteMode] = useState('all');
  const [urlFind, setUrlFind] = useState('');
  const [urlPattern, setUrlPattern] = useState('');
  const [validate, setValidate] = useState({
    urlFind: false,
    urlPattern: false,
  });

  const handleClose = () => {
    onClose();
    setNumItem(NUM_ID_DISPLAY);
    setDeleteMode('all');
    setUrlFind('');
    setUrlPattern('');
    setValidate({
      urlFind: false,
      urlPattern: false,
    });
  };

  const handleDeleteBookmark = async () => {
    try {
      if (deleteMode === 'by_url_find' && !urlFind) {
        setValidate({ ...validate, urlFind: true });
        return;
      }
      if (deleteMode === 'by_url_pattern' && !urlPattern) {
        setValidate({ ...validate, urlPattern: true });
        return;
      }
      setLoading(true);
      const payload = {
        profile_ids: profileIds,
        delete_mode: deleteMode,
        ...(deleteMode === 'by_url_find' && { url_find: urlFind }),
        ...(deleteMode === 'by_url_pattern' && { url_pattern: urlPattern }),
      };
      if (workspaceId) {
        await deleteMultiBookmarkApi(workspaceId, payload);
        enqueueSnackbar(t('systemNotify.success.delete'), { variant: 'success' });
      }
      handleClose();
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.profile.removeBookmark'), {
          variant: 'error',
        });
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={handleClose}
      title={t('dialog.deleteBookmark.header')}
      closeButtonName={t('dialog.deleteBookmark.actions.cancel')}
      content={
        <Stack spacing={3}>
          <Typography variant="body1">{t('dialog.deleteBookmark.subheader')}</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
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
          <Stack>
            <FormControl>
              <FormLabel id="delete-bookmark-mode">
                {t('dialog.deleteBookmark.labels.deleteMode')}
              </FormLabel>
              <RadioGroup
                aria-labelledby="delete-bookmark-mode"
                value={deleteMode}
                onChange={(event) => setDeleteMode(event.target.value)}
                sx={{
                  pl: 2,
                }}
              >
                <FormControlLabel
                  value="all"
                  control={<Radio />}
                  label={t('dialog.deleteBookmark.options.all')}
                  sx={{
                    width: 'fit-content',
                  }}
                />
                <FormControlLabel
                  value="by_url_find"
                  control={<Radio />}
                  label={t('dialog.deleteBookmark.options.deleteByContent')}
                  sx={{
                    width: 'fit-content',
                  }}
                />
                {deleteMode === 'by_url_find' && (
                  <TextField
                    error={validate.urlFind}
                    helperText={validate.urlFind && t('dialog.deleteBookmark.validate.content')}
                    label={t('dialog.deleteBookmark.labels.content')}
                    onChange={(event) => {
                      if (validate.urlFind) setValidate({ ...validate, urlFind: false });
                      setUrlFind(event.target.value);
                    }}
                    sx={{
                      ml: 2,
                      my: 1,
                    }}
                  />
                )}
                <FormControlLabel
                  value="by_url_pattern"
                  control={<Radio />}
                  label={t('dialog.deleteBookmark.options.deleteByUrlPattern')}
                  sx={{
                    width: 'fit-content',
                  }}
                />
                {deleteMode === 'by_url_pattern' && (
                  <>
                    <TextField
                      error={validate.urlPattern}
                      helperText={
                        validate.urlPattern && t('dialog.deleteBookmark.validate.urlPattern')
                      }
                      label={t('dialog.deleteBookmark.labels.urlPattern')}
                      onChange={(event) => {
                        if (validate.urlPattern) setValidate({ ...validate, urlPattern: false });
                        setUrlPattern(event.target.value);
                      }}
                      sx={{
                        ml: 2,
                        my: 1,
                      }}
                    />
                    <Stack spacing={0.6} mt={2}>
                      <Typography fontWeight="bold">
                        {t('dialog.deleteBookmark.example.title')}
                      </Typography>

                      <Typography variant="body2" fontWeight="bold">
                        *.example.com/*:{' '}
                        <Typography variant="body2" color="text.secondary" component="span">
                          {' '}
                          {t('dialog.deleteBookmark.example.example1')}
                        </Typography>
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        */products/*:{' '}
                        <Typography variant="body2" color="text.secondary" component="span">
                          {' '}
                          {t('dialog.deleteBookmark.example.example1')}
                        </Typography>
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        https://*.example.com/*:{' '}
                        <Typography variant="body2" color="text.secondary" component="span">
                          {' '}
                          {t('dialog.deleteBookmark.example.example1')}
                        </Typography>
                      </Typography>
                    </Stack>
                  </>
                )}
              </RadioGroup>
            </FormControl>
          </Stack>
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="error"
          onClick={handleDeleteBookmark}
        >
          {t('dialog.deleteProfile.actions.delete')}
        </LoadingButton>
      }
    />
  );
};

export default DeleteBookmarkMultiDialog;

DeleteBookmarkMultiDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  profileIds: PropTypes.array,
  workspaceId: PropTypes.string.isRequired,
};
