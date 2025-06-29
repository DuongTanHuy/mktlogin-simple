import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';

import {
  Button,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { useFormContext } from 'react-hook-form';
import { isElectron } from 'src/utils/commom';
import { useLocales } from 'src/locales';

const TextTab = ({ isSyncing, profilesOpened, textGroup, setTextGroup }) => {
  const { watch } = useFormContext();
  const { t } = useLocales();

  const LIST_BUTTON = [
    { id: 'btn_clear_text', icon: 'icon-park-solid:clear', label: t('synchronizer.actions.clearText') },
    { id: 'btn_past_text', icon: 'bxs:paste', label: t('synchronizer.actions.pastText') },
  ];

  const watchClickDelay = watch('clickDelay');
  const watchTypingDelay = watch('typingDelay');

  const addNewTextGroup = () => {
    const _clone = cloneDeep(textGroup);
    _clone.push({ id: _clone.length + Math.random(), enterType: 'by_order', enterValue: '' });

    setTextGroup(_clone);
  };

  const updateTextGroup = (event, id) => {
    const _clone = cloneDeep(textGroup);
    const _find = _clone.findIndex((i) => i.id === id);
    _clone[_find][event.target.name] = event.target.value;

    if (event.target.value === 'designate') {
      _clone[_find].enterValue = profilesOpened.map((item) => '\n').join('');
    }
    setTextGroup(_clone);
  };

  const deleteTextGroup = (id) => {
    const _find = textGroup.findIndex((i) => i.id === id);
    const _clone = cloneDeep(textGroup);
    _clone.splice(_find, 1);
    setTextGroup(_clone);
  };

  const clearText = () => {
    if (isElectron()) {
      window.ipcRenderer.send('delete-profile-windows');
    }
  };

  const pasteText = () => {
    if (isElectron()) {
      window.ipcRenderer.send('paste-profile-windows');
    }
  };

  const handleRandom = () => {
    const formData = watch();
    formData.min = parseFloat(formData.min);
    formData.max = parseFloat(formData.max);
    const data = {
      ...formData,
      type: 'random_number',
    };
    if (isElectron()) {
      window.ipcRenderer.send('send-text-profile-windows', data);
    }
  };

  const typeTextAsHuman = () => {
    const formData = watch();
    const data = {
      ...formData,
      type: 'text',
    };
    if (isElectron()) {
      window.ipcRenderer.send('send-text-profile-windows', data);
    }
  };

  const typeTextListAsHuman = (index) => {
    if (!textGroup[index]) return;

    const formData = watch();
    const data = {
      ...formData,
      type: 'designate_text',
      list_text: textGroup[index]?.enterValue?.split('\n') || [],
      type_list: textGroup[index]?.enterType,
    };
    if (isElectron()) {
      window.ipcRenderer.send('send-text-profile-windows', data);
    }
  };

  return (
    <>
      <Stack
        spacing={2}
        direction="row"
        sx={{
          mt: 2,
        }}
      >
        {LIST_BUTTON.map((item) => (
          <Button
            key={item.id}
            startIcon={<Iconify icon={item.icon} />}
            variant="outlined"
            color="primary"
            fullWidth
            disabled={!isSyncing}
            sx={{
              '&.Mui-disabled': {
                pointerEvents: 'auto',
                cursor: 'not-allowed',
              },
            }}
            onClick={item.id === 'btn_clear_text' ? clearText : pasteText}
          >
            {item.label}
          </Button>
        ))}
      </Stack>
      <Stack
        spacing={1}
        sx={{
          mt: 4,
        }}
      >
        <Typography>{t('synchronizer.text.labels.simulateActions')}</Typography>
        <Grid container>
          <Grid item xs={6}>
            <Stack spacing={1}>
              <RHFSwitch
                name="clickDelay"
                label={
                  <Tooltip title={t('synchronizer.text.tooltip.click')}>
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                      <Typography>{t('synchronizer.text.labels.clickDelay')}</Typography>
                      <Iconify icon="system-uicons:warning-circle" />
                    </Stack>
                  </Tooltip>
                }
              />
              {watchClickDelay && (
                <RHFTextField
                  label={t('synchronizer.text.labels.delay')}
                  size="small"
                  type="number"
                  name="delay_click"
                  sx={{
                    width: 100,
                  }}
                />
              )}
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack spacing={1}>
              <RHFSwitch
                name="typingDelay"
                label={
                  <Tooltip title={t('synchronizer.text.tooltip.typing')}>
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                      <Typography>{t('synchronizer.text.labels.typingDelay')}</Typography>
                      <Iconify icon="system-uicons:warning-circle" />
                    </Stack>
                  </Tooltip>
                }
              />
              {watchTypingDelay && (
                <Stack direction="row" spacing={1}>
                  <RHFTextField
                    label={t('synchronizer.text.labels.speed')}
                    size="small"
                    type="number"
                    name="speed_type"
                    sx={{
                      width: 100,
                    }}
                  />
                  <RHFTextField
                    label={t('synchronizer.text.labels.delay')}
                    size="small"
                    type="number"
                    name="delay_type"
                    sx={{
                      width: 100,
                    }}
                  />
                </Stack>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
      <Stack spacing={1}>
        <Typography>{t('synchronizer.text.labels.randomNumber')}</Typography>
        <Stack
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          }}
        >
          <LittleTab title={t('synchronizer.text.labels.range')}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} width={0.6}>
                <RHFTextField type="number" size="small" name="min" />
                <RHFTextField type="number" size="small" name="max" />
              </Stack>
              <Button
                variant="outlined"
                color="primary"
                disabled={!isSyncing}
                sx={{
                  '&.Mui-disabled': {
                    pointerEvents: 'auto',
                    cursor: 'not-allowed',
                  },
                }}
                onClick={handleRandom}
              >
                {t('synchronizer.actions.random')}
              </Button>
            </Stack>
          </LittleTab>
        </Stack>
      </Stack>
      <Stack
        spacing={1}
        sx={{
          mt: 2,
        }}
      >
        <Typography>{t('synchronizer.text.labels.identicalText')}</Typography>
        <RHFTextField
          name="text"
          placeholder={t('synchronizer.text.placeholder.identicalText')}
          InputProps={{
            endAdornment: (
              <Button
                sx={{
                  flexShrink: 0,
                  '&.Mui-disabled': {
                    pointerEvents: 'auto',
                    cursor: 'not-allowed',
                  },
                }}
                disabled={!isSyncing}
                onClick={typeTextAsHuman}
              >
                {t('synchronizer.actions.typeAsHuman')}
              </Button>
            ),
          }}
        />
      </Stack>
      <Typography
        sx={{
          mt: 2,
        }}
      >
        {t('synchronizer.text.labels.designatedText')}
      </Typography>
      <Stack
        spacing={1}
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
        }}
      >
        {textGroup.map((item, index) => (
          <Stack key={item.id}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography>{`${t('synchronizer.text.labels.textGroup')} ${index + 1}`}</Typography>
              {textGroup.length > 1 && (
                <IconButton onClick={() => deleteTextGroup(item.id)}>
                  <Iconify icon="material-symbols-light:delete" />
                </IconButton>
              )}
            </Stack>
            <RadioGroup
              row
              aria-labelledby="radio-buttons-text-group"
              name="enterType"
              value={item.enterType}
              onChange={(event) => updateTextGroup(event, item.id)}
            >
              <FormControlLabel
                value="by_order"
                control={<Radio />}
                label={t('synchronizer.text.labels.enterInOrder')}
              />
              <FormControlLabel
                value="random"
                control={<Radio />}
                label={t('synchronizer.text.labels.enterRandomly')}
              />
              <FormControlLabel
                value="designate"
                control={<Radio />}
                label={t('synchronizer.text.labels.designated')}
              />
            </RadioGroup>
            {item.enterType === 'designate' ? (
              <Stack
                direction="row"
                spacing={1}
                p={1}
                pb={6}
                sx={{
                  border: '1px solid #E0E0E0',
                  borderRadius: 1,
                }}
              >
                <Stack width={120} height={1} spacing="1px">
                  {item.enterValue.split('\n').map(
                    (_, ind) =>
                      profilesOpened[ind]?.id &&
                      profilesOpened[ind]?.name && (
                        <Stack
                          key={ind}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography
                            color="text.secondary"
                            sx={{
                              fontSize: '0.875rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >{`${profilesOpened[ind]?.id || ''} | ${
                            profilesOpened[ind]?.name || ''
                          }`}</Typography>
                          <Iconify
                            icon="entypo:dots-two-vertical"
                            sx={{
                              flexShrink: 0,
                            }}
                          />
                        </Stack>
                      )
                  )}
                </Stack>

                <TextField
                  name="enterValue"
                  fullWidth
                  placeholder={t('synchronizer.text.placeholder.identicalText')}
                  multiline
                  minRows={3}
                  value={item.enterValue}
                  onChange={(event) => updateTextGroup(event, item.id)}
                  sx={{
                    position: 'relative',
                    lineHeight: '21px',
                    '& .MuiInputBase-root': {
                      p: 0,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '& ::-webkit-scrollbar': {
                      width: '3px',
                    },
                    '& ::-webkit-scrollbar-thumb': {
                      backgroundColor: (theme) => theme.palette.grey[700],
                      borderRadius: '4px',
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <Button
                        sx={{
                          flexShrink: 0,
                          position: 'absolute',
                          right: 0,
                          bottom: -40,
                          '&.Mui-disabled': {
                            pointerEvents: 'auto',
                            cursor: 'not-allowed',
                          },
                        }}
                        disabled={!isSyncing || !item.enterValue}
                        onClick={() => typeTextListAsHuman(index)}
                      >
                        {t('synchronizer.actions.typeAsHuman')}
                      </Button>
                    ),
                  }}
                />
              </Stack>
            ) : (
              <TextField
                name="enterValue"
                placeholder={t('synchronizer.text.placeholder.enterInOrder')}
                multiline
                rows={4}
                value={item.enterValue}
                onChange={(event) => updateTextGroup(event, item.id)}
                sx={{
                  position: 'relative',
                  '& ::-webkit-scrollbar': {
                    width: '3px',
                  },
                  '& ::-webkit-scrollbar-thumb': {
                    backgroundColor: (theme) => theme.palette.grey[700],
                    borderRadius: '4px',
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <Button
                      sx={{
                        flexShrink: 0,
                        position: 'absolute',
                        right: 10,
                        bottom: 10,
                        '&.Mui-disabled': {
                          pointerEvents: 'auto',
                          cursor: 'not-allowed',
                        },
                      }}
                      disabled={!isSyncing}
                      onClick={() => typeTextListAsHuman(index)}
                    >
                      {t('synchronizer.actions.typeAsHuman')}
                    </Button>
                  ),
                }}
              />
            )}
          </Stack>
        ))}
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Iconify icon="basil:add-solid" />}
          sx={{
            mt: 1,
          }}
          onClick={addNewTextGroup}
        >
          {t('synchronizer.actions.addMoreTextGroup')}
        </Button>
      </Stack>
    </>
  );
};

export default TextTab;

TextTab.propTypes = {
  isSyncing: PropTypes.bool,
  profilesOpened: PropTypes.array,
  textGroup: PropTypes.array,
  setTextGroup: PropTypes.func,
};

//-------------------------------------------------------------------------

function LittleTab({ title, children }) {
  return (
    <Grid container spacing={3} alignItems="center">
      <Grid item xs={2}>
        <Typography color="text.secondary">{title}</Typography>
      </Grid>
      <Grid item xs={10}>
        {children}
      </Grid>
    </Grid>
  );
}

LittleTab.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};
