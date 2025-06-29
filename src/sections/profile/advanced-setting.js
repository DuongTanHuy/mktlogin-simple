import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// mui
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Button,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Popover,
  Stack,
  styled,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import { RHFAutocomplete, RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { timezones } from 'src/assets/data';
import { GroupButton } from 'src/components/custom-button';
import { useFormContext } from 'react-hook-form';
import { useLocales } from 'src/locales';
import { cloneDeep, debounce } from 'lodash';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import {
  ALLOW_MODE,
  CUSTOM_MODE,
  DEVICE_MEMORY,
  HARDWARE_CONCURRENCY,
  PROXY_CONNECTION_TYPES,
  SCREEN_RESOLUTIONS,
  useRenderTranslateValue,
  WEBGL_UNMASKED_VENDORS,
} from '../../utils/constance';
import { isElectron } from '../../utils/commom';
import { useMultiBoolean } from '../../hooks/use-multiple-boolean';
import FingerprintLanguagesDialog from './edit/fingerprint-languages-dialog';
import { languages } from '../../assets/data/languages';
import { getLanguageLabel, isValidBase64 } from '../../utils/profile';

// ----------------------------------------------------------------------

const StyledTabs = styled((props) => (
  <Tabs {...props} TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }} />
))(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: theme.palette.primary.main,
  },
}));

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: theme.palette.text.primary,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}));

// ----------------------------------------------------------------------

export default function AdvancedSetting({ randomFingerprint }) {
  const { t } = useLocales();
  const getId = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const { copy } = useCopyToClipboard();

  const TABS = [
    {
      value: 'dont_use_proxy',
      label: t('form.proxy.noProxy'),
    },
    {
      value: 'common',
      label: 'Common proxy',
    },
    {
      value: 'token',
      label: 'Proxy token',
    },
  ];
  const {
    webrtc_modes,
    location_modes,
    resolution_mode,
    font_mode,
    canvas_mode,
    webgl_img_mode,
    webgl_meta_data_mode,
    web_gpu_mode,
    audio_mode,
    media_device_mode,
    client_rects_mode,
    device_name_mode,
    mac_address,
    do_not_track_mode,
    speech_switch_mode,
    plash_mode,
    scan_port_type,
    gpu_mode,
    image_mode,
    sounds_mode,
  } = useRenderTranslateValue();
  const { watch, setValue } = useFormContext();
  const [proxyChecking, setProxyChecking] = useState(false);
  const [proxyInfo, setProxyInfo] = useState({});
  const [currentTab, setCurrentTab] = useState('common');

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const confirm = useMultiBoolean({
    languages: false,
  });

  const watchProxyType = watch('proxy_type');
  const watchProxy = watch('proxy');
  const watchAutomaticTimezone = watch('automaticTimezone');
  const watchLocationSwitch = watch('locationSwitch');
  const watchLanguageSwitch = watch('languageSwitch');
  const watchAppLanguageSwitch = watch('appLanguageSwitch');
  const watchLanguages = watch('languages');
  const watchResolutionMode = watch('resolutionMode');
  const watchLocation = watch('location');
  const watchFontMode = watch('fontMode');
  const watchWebgl = watch('webgl');
  const watchDeviceNameSwitch = watch('deviceNameSwitch');
  const watchMacSwitch = watch('macSwitch');
  const watchScanPortType = watch('scanPortType');
  const watchProxyToken = watch('proxy_token');
  const watchOpenTabs = watch('open_tabs');

  const handleChangeTab = useCallback(
    (_, newValue) => {
      if (newValue === 'dont_use_proxy') {
        setValue('proxy_type', 'none');
      } else if (newValue === 'token') {
        setValue('proxy_type', 'token');
      } else {
        setValue('proxy_type', 'http');
      }
      setCurrentTab(newValue);
    },
    [setValue]
  );

  const handleProxyTypeChange = (event) => {
    const { value } = event.target;
    setValue('proxy_type', value, { shouldDirty: true });
  };

  const onRandomWebglRender = () => {
    randomFingerprint('webgl');
  };

  const onRandomDeviceName = () => {
    randomFingerprint('device_name');
  };

  const onRandomMacAddress = () => {
    randomFingerprint('mac_address');
  };

  const onRandomFonts = () => {
    randomFingerprint('fonts');
  };

  const handleChangeWebglVendor = (event) => {
    setValue('unmaskedVendor', event.target.value, { shouldDirty: true });
    randomFingerprint('webgl');
  };

  const handleCheckProxy = async (proxyType, proxy) => {
    setProxyChecking(true);
    proxy.mode = proxyType;

    if (proxyType === 'token') {
      if (!isValidBase64(watchProxyToken)) {
        enqueueSnackbar(t('systemNotify.error.proxyInvalid'), { variant: 'error' });
        setProxyChecking(false);
        return;
      }
      proxy.mode = 'token';
      proxy.proxy_token = watchProxyToken;
    } else if (!proxy.host || !proxy.port) {
      enqueueSnackbar(t('systemNotify.error.proxyInvalid'), { variant: 'error' });
      setProxyChecking(false);
      return;
    }

    if (isElectron()) {
      try {
        const proxyResponse = await window.ipcRenderer.invoke('proxy-check', proxy);
        if (proxyResponse?.ip) {
          enqueueSnackbar(t('systemNotify.success.proxyWork'), { variant: 'success' });
          setProxyInfo(proxyResponse);
        } else {
          enqueueSnackbar(t('systemNotify.error.proxyWork'), { variant: 'error' });
          setProxyInfo({});
        }
        setProxyChecking(false);
      } catch (error) {
        console.log('check proxy error: ', error);
        setProxyChecking(false);
      }
    }
  };

  const handlePasteProxy = (event) => {
    event.preventDefault();
    const pasteText = event.clipboardData.getData('text').trim();
    const proxy = pasteText.split(':');
    setValue('proxy.host', proxy[0] ?? '', { shouldDirty: true });
    setValue('proxy.port', proxy[1] ?? '', { shouldDirty: true });
    setValue('proxy.username', proxy[2] ?? '', { shouldDirty: true });
    setValue('proxy.password', proxy[3] ?? '', { shouldDirty: true });
  };

  const [deleteLang, setDeleteLang] = useState('');

  const handleOpenLanguageActions = (event, language) => {
    setAnchorEl(event.currentTarget);
    setDeleteLang(language);
  };

  const handleDeleteLanguage = (language) => {
    const newLanguages = watchLanguages.split(',').filter((item) => item !== language);
    setValue('languages', newLanguages.join(','));
    setAnchorEl(null);
  };

  const handleAddUrl = () => {
    setValue('open_tabs', [...watchOpenTabs, { id: getId(), url: '' }]);
  };

  const handleRemoveUrl = (urlId) => {
    const _clone = cloneDeep(watchOpenTabs);
    const _find = _clone.findIndex((i) => i.id === urlId);
    _clone.splice(_find, 1);
    setValue('open_tabs', _clone);
  };

  const handleUpdateUrl = (urlId, value) => {
    const _clone = cloneDeep(watchOpenTabs);
    const _find = _clone.findIndex((i) => i.id === urlId);
    _clone[_find].url = value;
    setValue('open_tabs', _clone);
  };

  const renderDialog = (
    <FingerprintLanguagesDialog
      open={confirm.value.languages}
      onClose={() => confirm.onFalse('languages')}
      languages={languages}
    />
  );

  useEffect(() => {
    if (watchProxyType === 'none') {
      setCurrentTab('dont_use_proxy');
    } else if (watchProxyType === 'token') {
      setCurrentTab('token');
    } else {
      setCurrentTab('common');
    }
  }, [watchProxyType]);

  return (
    <>
      <Accordion slots={{ transition: Fade }} defaultExpanded>
        <AccordionSummary expandIcon={<Iconify icon="fa:sort-down" />}>
          <Typography variant="subtitle1">Proxy</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            pt: 0,
          }}
        >
          <StyledTabs
            value={currentTab}
            onChange={handleChangeTab}
            sx={{
              mb: 2.5,
            }}
          >
            {TABS.map((tab) => (
              <StyledTab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </StyledTabs>
          {currentTab === 'dont_use_proxy' && (
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="left"
              sx={{
                width: 1,
                display: 'block',
                mb: 1,
              }}
            >
              {t('form.proxy.subTitle')}
            </Typography>
          )}
          {currentTab === 'token' && (
            <RHFTextField name="proxy_token" label="Proxy token" placeholder="Enter proxy token" />
          )}
          {currentTab === 'common' && (
            <Stack spacing={2}>
              <RHFSelect
                fullWidth
                name="proxy_type"
                label={t('form.label.proxy-type')}
                InputLabelProps={{ shrink: true }}
                PaperPropsSx={{ textTransform: 'capitalize' }}
                onChange={handleProxyTypeChange}
              >
                {PROXY_CONNECTION_TYPES.map((option) => (
                  <MenuItem
                    key={option.id}
                    value={option.value}
                    sx={{
                      ...((option.value === 'none' || option.value === 'token') && {
                        display: 'none',
                      }),
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              {watchProxyType !== 'none' && (
                <>
                  <Grid container>
                    <Grid item xs={7}>
                      <RHFTextField name="proxy.host" label="Host IP" onPaste={handlePasteProxy} />
                    </Grid>
                    <Grid item xs={1} display="flex" alignItems="center" justifyContent="center">
                      :
                    </Grid>
                    <Grid item xs={4}>
                      <RHFTextField name="proxy.port" label="Port" />
                    </Grid>
                  </Grid>
                  <RHFTextField name="proxy.username" label="Username" />
                  <RHFTextField name="proxy.password" label="Password" />
                </>
              )}
            </Stack>
          )}
          {currentTab !== 'dont_use_proxy' && (
            <Stack pt={2} spacing={1}>
              <Typography variant="body2" color="#00A76F">
                {Object.entries(proxyInfo)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')}
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="mingcute:copy-line" />}
                  onClick={() => {
                    const text = `${watch('proxy.host')}:${watch('proxy.port')}:${watch(
                      'proxy.username'
                    )}:${watch('proxy.password')}`;
                    copy(text);
                    console.log('copied', text);
                    enqueueSnackbar(t('systemNotify.success.copied'), { variant: 'success' });
                  }}
                >
                  {t('dialog.exportResource.actions.copy')}
                </Button>

                <LoadingButton
                  onClick={() => handleCheckProxy(watchProxyType, watchProxy)}
                  loading={proxyChecking}
                  variant="outlined"
                  sx={{
                    ml: 'auto',
                  }}
                >
                  {t('form.action.check')}
                </LoadingButton>
              </Stack>
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion slots={{ transition: Fade }} defaultExpanded>
        <AccordionSummary expandIcon={<Iconify icon="fa:sort-down" />}>
          <Typography>{t('form.openTab.title')}</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            pt: 0,
          }}
        >
          <Stack spacing={1.5}>
            {watchOpenTabs.map((tab, index) => (
              <Stack key={tab.id} direction="row" alignItems="center" spacing={2}>
                <TextField
                  defaultValue={tab.url}
                  onChange={debounce((event) => {
                    handleUpdateUrl(tab.id, event.target.value);
                  }, 500)}
                  fullWidth
                  placeholder={t('form.openTab.placeholder')}
                  size="small"
                  sx={{
                    '& input': {
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
                <IconButton onClick={index === 0 ? handleAddUrl : () => handleRemoveUrl(tab.id)}>
                  <Iconify icon={index === 0 ? 'gg:add' : 'gg:remove'} />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion slots={{ transition: Fade }}>
        <AccordionSummary expandIcon={<Iconify icon="fa:sort-down" />}>
          <Typography variant="subtitle1">{t('form.label.advanced-settings')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <SettingTab title={t('form.label.timezone')}>
              <Stack spacing={2}>
                <RHFSwitch name="automaticTimezone" label={t('form.value.timezone')} />
                {!watchAutomaticTimezone && (
                  <RHFAutocomplete
                    name="timezone"
                    label="Timezone"
                    options={timezones.map((country) => country.value)}
                    getOptionLabel={(option) =>
                      timezones.find((country) => country.value === option).label
                    }
                    renderOption={(props, option) => (
                      <li {...props} key={option}>
                        {option}
                      </li>
                    )}
                  />
                )}
              </Stack>
            </SettingTab>
            <SettingTab title="WebRTC">
              <Stack>
                <GroupButton
                  buttons={webrtc_modes}
                  name="webrtc"
                  sx={{
                    mr: 'auto',
                  }}
                />
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.location')}>
              <Stack spacing={2}>
                <GroupButton
                  buttons={location_modes}
                  name="location"
                  sx={{
                    mr: 'auto',
                  }}
                />
                {watchLocation !== 'disabled' && (
                  <>
                    <RHFSwitch name="locationSwitch" label={t('form.value.timezone')} />
                    {!watchLocationSwitch && (
                      <>
                        <RHFTextField
                          name="longitude"
                          label={t('form.value.options.longitude')}
                          type="number"
                        />
                        <RHFTextField
                          name="latitude"
                          label={t('form.value.options.latitude')}
                          type="number"
                        />
                        <RHFTextField
                          name="accuracy"
                          label={t('form.value.options.accuracy')}
                          type="number"
                        />
                      </>
                    )}
                  </>
                )}
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.language')}>
              <Stack spacing={2}>
                <RHFSwitch name="languageSwitch" label={t('form.label.based_on_ip')} />
                {!watchLanguageSwitch && (
                  <>
                    {!!watchLanguages &&
                      watchLanguages.split(',').map((language, index) => (
                        <Stack
                          key={index}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          borderBottom="1px dashed"
                          borderColor={(theme) => alpha(theme.palette.grey[500], 0.32)}
                        >
                          <Typography>{getLanguageLabel(language)}</Typography>
                          {watchLanguages.split(',').length > 0 && (
                            <IconButton
                              onClick={(event) => handleOpenLanguageActions(event, language)}
                            >
                              <Iconify icon="ri:more-2-fill" />
                            </IconButton>
                          )}
                        </Stack>
                      ))}
                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={() => {
                        setAnchorEl(null);
                        setDeleteLang('');
                      }}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                    >
                      <MenuItem onClick={() => handleDeleteLanguage(deleteLang)}>
                        <Iconify sx={{ mr: 1 }} icon="fluent:delete-16-regular" />
                        {t('actions.delete')}
                      </MenuItem>
                    </Popover>
                    <Button
                      sx={{
                        ml: 'auto',
                      }}
                      variant="outlined"
                      onClick={() => confirm.onTrue('languages')}
                    >
                      {t('form.label.add-languages')}
                    </Button>
                  </>
                )}
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.app_language')}>
              <Stack spacing={2}>
                <RHFSwitch name="appLanguageSwitch" label={t('form.label.based_on_language')} />
                {!watchAppLanguageSwitch && (
                  <RHFSelect
                    fullWidth
                    name="app_language"
                    InputLabelProps={{ shrink: true }}
                    PaperPropsSx={{ textTransform: 'capitalize' }}
                  >
                    {languages.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                )}
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.screen-resolution')}>
              <Stack spacing={2}>
                <GroupButton
                  buttons={resolution_mode}
                  name="resolutionMode"
                  sx={{
                    mr: 'auto',
                  }}
                />

                {watchResolutionMode === 'custom' && (
                  <RHFSelect
                    fullWidth
                    name="screenResolution"
                    placeholder="Resolution"
                    InputLabelProps={{ shrink: true }}
                    PaperPropsSx={{ textTransform: 'capitalize' }}
                  >
                    <MenuItem key="none" value="none">
                      {t('form.value.options.default')}
                    </MenuItem>
                    {SCREEN_RESOLUTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                )}
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.font')}>
              <Stack spacing={2}>
                <GroupButton
                  buttons={font_mode}
                  name="fontMode"
                  sx={{
                    mr: 'auto',
                  }}
                />
                {watchFontMode === 'custom' && (
                  <>
                    <RHFTextField name="fonts" multiline rows={10} disabled />
                    <Button
                      onClick={onRandomFonts}
                      variant="outlined"
                      startIcon={<Iconify icon="tabler:switch-3" />}
                      sx={{
                        ml: 'auto',
                      }}
                    >
                      {t('form.action.change')}
                    </Button>
                  </>
                )}
              </Stack>
            </SettingTab>
            <SettingTab title="Canvas">
              <Stack>
                <GroupButton
                  buttons={canvas_mode}
                  name="canvas"
                  sx={{
                    mr: 'auto',
                  }}
                />
              </Stack>
            </SettingTab>
            <SettingTab title="WebGL Image">
              <Stack>
                <GroupButton
                  buttons={webgl_img_mode}
                  name="webglImg"
                  sx={{
                    mr: 'auto',
                  }}
                />
              </Stack>
            </SettingTab>
            <SettingTab title="WebGL metadata">
              <Stack spacing={2}>
                <GroupButton
                  buttons={webgl_meta_data_mode}
                  name="webgl"
                  sx={{
                    mr: 'auto',
                  }}
                />
                {watchWebgl === CUSTOM_MODE && (
                  <>
                    <RHFSelect
                      fullWidth
                      name="unmaskedVendor"
                      label={t('form.value.options.unmaskedVendor')}
                      InputLabelProps={{ shrink: true }}
                      PaperPropsSx={{ textTransform: 'capitalize' }}
                      onChange={handleChangeWebglVendor}
                    >
                      {WEBGL_UNMASKED_VENDORS.map((option) => (
                        <MenuItem key={option.id} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                    <RHFTextField
                      name="unmaskedRenderer"
                      label={t('form.value.options.unmaskedRenderer')}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="start">
                            <IconButton onClick={onRandomWebglRender}>
                              <Iconify icon="tabler:switch-3" color="primary.main" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          padding: 0,
                        },
                      }}
                    />
                  </>
                )}
              </Stack>
            </SettingTab>
            <SettingTab title="WebGPU">
              <Stack>
                <GroupButton
                  buttons={web_gpu_mode}
                  name="web_gpu_mode"
                  sx={{
                    mr: 'auto',
                  }}
                />
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.audioContext')}>
              <Stack>
                <GroupButton
                  buttons={audio_mode}
                  name="audio"
                  sx={{
                    mr: 'auto',
                  }}
                />
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.mediaDevice')}>
              <Stack>
                <GroupButton
                  buttons={media_device_mode}
                  name="mediaDevices"
                  sx={{
                    mr: 'auto',
                  }}
                />
              </Stack>
            </SettingTab>
            <SettingTab title="ClientRects">
              <Stack>
                <GroupButton
                  buttons={client_rects_mode}
                  name="clientRects"
                  sx={{
                    mr: 'auto',
                  }}
                />
              </Stack>
            </SettingTab>
            <SettingTab title="SpeechVoices">
              <Stack>
                <GroupButton
                  buttons={speech_switch_mode}
                  name="speechSwitch"
                  sx={{
                    mr: 'auto',
                  }}
                />
              </Stack>
            </SettingTab>
            <SettingTab title="Hardware concurrency">
              <Stack>
                <RHFSelect
                  fullWidth
                  name="hardwareConcurrency"
                  InputLabelProps={{ shrink: true }}
                  PaperPropsSx={{ textTransform: 'capitalize' }}
                >
                  {HARDWARE_CONCURRENCY.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.device-memory')}>
              <Stack spacing={2}>
                <RHFSelect
                  fullWidth
                  name="deviceMemory"
                  InputLabelProps={{ shrink: true }}
                  PaperPropsSx={{ textTransform: 'capitalize' }}
                >
                  {DEVICE_MEMORY.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.device-name')}>
              <Stack spacing={2}>
                <GroupButton
                  buttons={device_name_mode}
                  name="deviceNameSwitch"
                  sx={{
                    mr: 'auto',
                  }}
                />
                {watchDeviceNameSwitch === CUSTOM_MODE && (
                  <RHFTextField
                    name="deviceName"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          <IconButton onClick={onRandomDeviceName}>
                            <Iconify icon="tabler:switch-3" color="primary.main" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        padding: 0,
                      },
                    }}
                  />
                )}
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.mac-address')}>
              <Stack spacing={2}>
                <GroupButton
                  buttons={mac_address}
                  name="macSwitch"
                  sx={{
                    mr: 'auto',
                  }}
                />
                {watchMacSwitch === CUSTOM_MODE && (
                  <RHFTextField
                    name="macAddress"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          <IconButton onClick={onRandomMacAddress}>
                            <Iconify icon="tabler:switch-3" color="primary.main" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        padding: 0,
                      },
                    }}
                  />
                )}
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.doNotTrack')}>
              <Stack>
                <GroupButton
                  buttons={do_not_track_mode}
                  name="doNotTrack"
                  sx={{
                    mr: 'auto',
                  }}
                />
              </Stack>
            </SettingTab>
            <SettingTab title="Flash">
              <Stack>
                <GroupButton
                  buttons={plash_mode}
                  name="flash"
                  sx={{
                    mr: 'auto',
                  }}
                />
              </Stack>
            </SettingTab>
            <SettingTab title="Port scan protection">
              <Stack spacing={2}>
                <GroupButton
                  buttons={scan_port_type}
                  name="scanPortType"
                  sx={{
                    mr: 'auto',
                  }}
                />
                {watchScanPortType === ALLOW_MODE && (
                  <RHFTextField
                    name="allowScanPorts"
                    size="small"
                    sx={{
                      mr: 'auto',
                    }}
                    placeholder={t('form.label.watch-scan-allow')}
                  />
                )}
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.hardware-acceleration')}>
              <Stack>
                <GroupButton
                  buttons={gpu_mode}
                  name="gpu"
                  sx={{
                    mr: 'auto',
                  }}
                />
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.display-image')}>
              <Stack>
                <GroupButton
                  buttons={image_mode}
                  name="images"
                  sx={{
                    mr: 'auto',
                  }}
                />
              </Stack>
            </SettingTab>
            <SettingTab title={t('form.label.sound')}>
              <Stack>
                <GroupButton
                  buttons={sounds_mode}
                  name="sounds"
                  sx={{
                    mr: 'auto',
                  }}
                />
              </Stack>
            </SettingTab>
          </Stack>
        </AccordionDetails>
      </Accordion>
      {renderDialog}
    </>
  );
}

AdvancedSetting.propTypes = {
  randomFingerprint: PropTypes.func,
};

//----------------------------------------------------------------
function SettingTab({ title, children }) {
  return (
    <Grid container spacing={3}>
      <Grid
        item
        xs={4}
        textAlign="center"
        style={{
          paddingTop: '30px',
        }}
      >
        {title}
      </Grid>
      <Grid item xs={8}>
        {children}
      </Grid>
    </Grid>
  );
}

SettingTab.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};
