import PropTypes from 'prop-types';
import { memo, useEffect, useRef, useState } from 'react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';

import { cloneDeep } from 'lodash';
import { isElectron } from 'src/utils/commom';
import { enqueueSnackbar } from 'notistack';
import { useAuthContext } from 'src/auth/hooks';
import { useLocales } from 'src/locales';
import Iconify from '../iconify/iconify';
import { usePopover } from '../custom-popover';
import Image from '../image';

// ----------------------------------------------------------------------

function Resource({ onClose, ...other }) {
  const { t } = useLocales();
  const popover = usePopover();
  const [itemClicking, setItemClicking] = useState(null);
  const inputFileRef = useRef(null);
  const [resource, setResource] = useState([]);
  const { resources, updateResources } = useAuthContext();

  useEffect(() => {
    if (resources?.list) {
      setResource([...resources.list]);
    }
  }, [resources?.list]);

  const submitForm = async () => {
    if (resource?.length > 0) {
      const filteredData = resource.filter((item) => item.key !== '' || item.value !== '');
      updateResources({ ...resources, list: filteredData });
    }
    onClose();
  };

  const addNewResource = () => {
    const _clone = cloneDeep(resource);
    _clone.push({ id: _clone.length + Math.random(), key: '', value: '' });

    setResource(_clone);
  };

  const updateResource = (name, event, id) => {
    const _clone = cloneDeep(resource);
    const _find = _clone.findIndex((i) => i.id === id);
    _clone[_find][name] = event.target.value;
    setResource(_clone);
  };

  const selectFileImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const MAX_SIZE = 0.5 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      enqueueSnackbar('File size is too large, max size is 500KB', { variant: 'error' });
      return;
    }

    const _clone = cloneDeep(resource);
    const _find = _clone.findIndex((i) => i.id === itemClicking);

    const filename = isElectron() ? file?.path : file?.name;
    const parts = filename.split('.');
    const extension = parts.pop();
    const name = parts.join('.');
    const slug = name
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .toLowerCase();
    _clone[_find].key = `${slug}.${extension}`;

    const reader = new FileReader();
    reader.onloadend = () => {
      _clone[_find].value = reader.result;
      setResource(_clone);
    };
    reader.readAsDataURL(file);

    popover.onClose();
  };

  const deleteResource = (id) => {
    const _find = resource.findIndex((i) => i.id === id);
    const _clone = cloneDeep(resource);
    _clone.splice(_find, 1);
    setResource(_clone);
  };

  const onCancel = () => {
    onClose();
    setResource(resources?.list);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      {...other}
      sx={{
        '& .MuiDialog-container': {
          '& .MuiPaper-root': {
            width: '800px',
            maxWidth: '100%',
          },
        },
      }}
    >
      <DialogTitle sx={{ paddingBottom: '10px' }}>
        {t('workflow.script.dialog.resource.title')}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={2}>
          <Stack
            sx={{
              border: '1px solid #eeeeee24',
              padding: '8px',
              borderRadius: '4px',
              gap: 0,
            }}
            spacing={1}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">{t('workflow.script.dialog.resource.title')}</Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="solar:add-circle-linear" width={20} />}
                onClick={() => addNewResource()}
              >
                {t('workflow.script.actions.add')}
              </Button>
            </Stack>
            <Stack spacing={1} pt={resource?.length > 0 ? 2 : 0}>
              {resource &&
                resource.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={2}
                  >
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          error={false}
                          label={t('workflow.script.dialog.resource.label.key')}
                          onChange={(e) => updateResource('key', e, item.id)}
                          size="small"
                          name="key"
                          value={item.key}
                        />
                      </Grid>
                      <Grid item xs={9}>
                        <TextField
                          fullWidth
                          error={false}
                          label={t('workflow.script.dialog.resource.label.value')}
                          onChange={(e) => updateResource('value', e, item.id)}
                          size="small"
                          name="value"
                          value={item.value}
                          sx={{
                            '& .MuiInputBase-root': {
                              pr: 0,
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                onClick={(event) => {
                                  inputFileRef.current.click();
                                  setItemClicking(item.id);
                                }}
                                sx={{
                                  mx: 1,
                                }}
                              >
                                <Iconify icon="material-symbols:upload" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={(event) => selectFileImage(event)}
                                  ref={inputFileRef}
                                />
                              </IconButton>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Image
                      onClick={(event) => {
                        inputFileRef.current.click();
                        setItemClicking(item.id);
                      }}
                      alt={item.key}
                      src={item.value}
                      ratio="1/1"
                      sx={{
                        borderRadius: 0.5,
                        cursor: 'pointer',
                        width: '40px',
                        height: '36px',
                      }}
                    />
                    <Iconify
                      onClick={() => deleteResource(item.id)}
                      icon="carbon:close-outline"
                      sx={{
                        width: '35px',
                        color: 'text.disabled',
                        '&:hover': { cursor: 'pointer', color: 'white' },
                      }}
                    />
                  </Stack>
                ))}
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={onCancel}>
          {t('workflow.script.actions.close')}
        </Button>
        <LoadingButton type="submit" variant="contained" color="primary" onClick={submitForm}>
          {t('workflow.script.actions.confirm')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default memo(Resource);

Resource.propTypes = {
  onClose: PropTypes.func,
};
