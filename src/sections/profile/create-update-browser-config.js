import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import { useLocales } from 'src/locales';
import { enqueueSnackbar } from 'notistack';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Popover,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import FormProvider from 'src/components/hook-form/form-provider';
import { BrowserButton, GroupButton } from 'src/components/custom-button';
import {
  ALLOW_MODE,
  ANDROID_VERSION,
  DEVICE_MEMORY,
  HARDWARE_CONCURRENCY,
  IOS_VERSION,
  LINUX_VERSION,
  MACOS_VERSION,
  OS_DEFAULT,
  OS_VERSION_DEFAULT,
  SCREEN_RESOLUTIONS,
  WEBGL_UNMASKED_VENDORS,
  WINDOW_VERSION,
  useRenderTranslateValue,
} from 'src/utils/constance';
import { LoadingButton } from '@mui/lab';
import { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { timezones } from 'src/assets/data';
import { getLanguageLabel, getWebGPUData } from 'src/utils/profile';
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { languages } from 'src/assets/data/languages';
import { randomFingerPrintApi, randomUserAgentApi } from 'src/api/random.api';
import { fonts } from 'src/assets/data/fonts';
import { useGetKernelVersions } from 'src/api/cms.api';
import groupBy from 'lodash/groupBy';
import Scrollbar from 'src/components/scrollbar';
import { crateProfileConfigApi, updateProfileConfigApi } from 'src/api/profile-config.api';
import { generateRandomNumber } from 'src/utils/random';
import FingerprintLanguagesDialog from './edit/fingerprint-languages-dialog';

export default function CreateUpdateBrowserConfig({
  open,
  onClose,
  currentConfig,
  handleReloadData,
  profileConfigId,
  setBrowserConfig,
  isUpdateMode,
}) {
  const {
    user_agent_modes,
    webrtc_modes,
    location_modes,
    resolution_mode,
    font_mode_browser,
    canvas_mode,
    webgl_img_mode,
    webgl_meta_data_mode_browser,
    web_gpu_mode,
    audio_mode,
    media_device_mode,
    client_rects_mode,
    speech_switch_mode,
    hardware_concurrency_mode,
    device_memory_mode,
    device_name_mode_browser,
    mac_address_browser,
    do_not_track_mode,
    plash_mode,
    scan_port_type,
    gpu_mode,
    image_mode,
    sounds_mode,
  } = useRenderTranslateValue();
  const { kernelData } = useGetKernelVersions();
  const { t } = useLocales();
  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('formError.browserConfig.name')),
    user_agent: Yup.string().when('user_agent_mode', {
      is: 'custom',
      then: (schema) => schema.required(t('formError.browserConfig.userAgent')),
      otherwise: (schema) => schema.nullable(true),
    }),
    unmasked_renderer: Yup.string().when('webgl_media_mode', {
      is: 'custom',
      then: (schema) => schema.required(t('formError.browserConfig.unmaskedRenderer')),
      otherwise: (schema) => schema.nullable(true),
    }),
    device_name: Yup.string().when('device_name_mode', {
      is: 'custom',
      then: (schema) => schema.required(t('formError.browserConfig.deviceName')),
      otherwise: (schema) => schema.nullable(true),
    }),
    mac_address: Yup.string().when('mac_address_mode', {
      is: 'custom',
      then: (schema) => schema.required(t('formError.browserConfig.macAddress')),
      otherwise: (schema) => schema.nullable(true),
    }),
  });

  const [browserActive, setBrowserActive] = useState();
  const [platformActive, setPlatformActive] = useState();
  const [chromeOptions, setChromeOption] = useState([]);
  const [firefoxOptions, setFirefoxOptions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const randomUserAgent = useRef();
  const randomFingerPrint = useRef();
  const openLanguagePopover = Boolean(anchorEl);
  const id = openLanguagePopover ? 'simple-popover' : undefined;
  const [userInitiatedChange, setUserInitiatedChange] = useState(false); // to mark that the user has changed the parameters of the user agent

  const showLanguage = useBoolean();

  const defaultValues = useMemo(
    () => ({
      name: currentConfig?.name ?? '',
      kernel_version_id: currentConfig?.kernel_version?.id ?? 0,
      os_version: {
        os: currentConfig?.os?.os ?? OS_DEFAULT,
        version: currentConfig?.os?.os_version[0]?.toString() ?? OS_VERSION_DEFAULT,
      },
      platform: currentConfig?.fingerprint_config?.platform ?? '',
      _platform: currentConfig?.fingerprint_config?._platform ?? '',
      emulation: currentConfig?.fingerprint_config?.emulation ?? '',
      user_agent_mode: currentConfig?.user_agent_mode ?? 'random',
      user_agent: currentConfig?.user_agent ?? '',
      automatic_timezone: currentConfig?.fingerprint_config?.automatic_timezone ?? true,
      time_zone: currentConfig?.fingerprint_config?.time_zone ?? '',
      webrtc: currentConfig?.fingerprint_config?.webrtc ?? 'disabled',
      location: currentConfig?.fingerprint_config?.location ?? 'ask',
      location_switch: currentConfig?.fingerprint_config?.location_switch ?? true,
      longitude: currentConfig?.fingerprint_config?.longitude ?? 0,
      latitude: currentConfig?.fingerprint_config?.latitude ?? 0,
      accuracy: currentConfig?.fingerprint_config?.accuracy ?? 1000,
      languages: currentConfig?.fingerprint_config?.language ?? 'en-US,en',
      language_switch: currentConfig?.fingerprint_config?.language_switch ?? true,
      app_language_switch: currentConfig?.fingerprint_config?.app_language_switch ?? true,
      app_language: currentConfig?.fingerprint_config?.app_language ?? 'vi',
      screen_resolution: currentConfig?.fingerprint_config?.screen_resolution ?? 'none',
      screen_resolution_mode: currentConfig?.screen_resolution_mode ?? 'custom',
      font_mode: currentConfig?.font_mode ?? 'random',
      fonts,
      canvas: currentConfig?.fingerprint_config?.canvas ?? '1',
      webgl_image: currentConfig?.fingerprint_config?.webgl_image ?? '1',
      webgl_media_mode: currentConfig?.webgl_media_mode ?? 'random',
      web_gpu_mode: currentConfig?.fingerprint_config?.web ?? '1',
      unmasked_vendor: currentConfig?.fingerprint_config?.webgl_config?.unmasked_vendor ?? 'ARM',
      unmasked_renderer: currentConfig?.fingerprint_config?.webgl_config?.unmasked_renderer ?? '',
      audio: currentConfig?.fingerprint_config?.audio ?? '1',
      media_devices: currentConfig?.fingerprint_config?.media_devices ?? '1',
      client_rects: currentConfig?.fingerprint_config?.client_rects ?? '1',
      speech_switch: currentConfig?.fingerprint_config?.speech_switch ?? '1',
      hardware_concurrency: currentConfig?.fingerprint_config?.hardware_concurrency ?? 'default',
      device_memory: currentConfig?.fingerprint_config?.device_memory ?? 'default',
      device_name_mode: currentConfig?.device_memory_mode ?? 'random',
      device_name: currentConfig?.fingerprint_config?.device_name ?? '',
      mac_address_mode: currentConfig?.mac_address_mode ?? 'random',
      mac_address: currentConfig?.fingerprint_config?.mac_address_config?.address ?? '',
      do_not_track: currentConfig?.fingerprint_config?.do_not_track ?? 'default',
      flash: currentConfig?.fingerprint_config?.flash ?? 'allow',
      scan_port_type: currentConfig?.fingerprint_config?.scan_port_type ?? '1',
      allow_scan_ports: currentConfig?.fingerprint_config?.allow_scan_ports ?? '',
      gpu: currentConfig?.fingerprint_config?.gpu ?? '0',
      images: currentConfig?.fingerprint_config?.images ?? '1',
      sounds: currentConfig?.fingerprint_config?.sounds ?? '1',
      hardware_concurrency_mode: currentConfig?.hardware_concurrency_mode ?? 'random',
      device_memory_mode: currentConfig?.device_memory_mode ?? 'random',
    }),
    [
      currentConfig?.device_memory_mode,
      currentConfig?.fingerprint_config?._platform,
      currentConfig?.fingerprint_config?.accuracy,
      currentConfig?.fingerprint_config?.allow_scan_ports,
      currentConfig?.fingerprint_config?.app_language,
      currentConfig?.fingerprint_config?.app_language_switch,
      currentConfig?.fingerprint_config?.audio,
      currentConfig?.fingerprint_config?.automatic_timezone,
      currentConfig?.fingerprint_config?.canvas,
      currentConfig?.fingerprint_config?.client_rects,
      currentConfig?.fingerprint_config?.device_memory,
      currentConfig?.fingerprint_config?.device_name,
      currentConfig?.fingerprint_config?.do_not_track,
      currentConfig?.fingerprint_config?.emulation,
      currentConfig?.fingerprint_config?.flash,
      currentConfig?.fingerprint_config?.gpu,
      currentConfig?.fingerprint_config?.hardware_concurrency,
      currentConfig?.fingerprint_config?.images,
      currentConfig?.fingerprint_config?.language,
      currentConfig?.fingerprint_config?.language_switch,
      currentConfig?.fingerprint_config?.latitude,
      currentConfig?.fingerprint_config?.location,
      currentConfig?.fingerprint_config?.location_switch,
      currentConfig?.fingerprint_config?.longitude,
      currentConfig?.fingerprint_config?.mac_address_config?.address,
      currentConfig?.fingerprint_config?.media_devices,
      currentConfig?.fingerprint_config?.platform,
      currentConfig?.fingerprint_config?.scan_port_type,
      currentConfig?.fingerprint_config?.screen_resolution,
      currentConfig?.fingerprint_config?.sounds,
      currentConfig?.fingerprint_config?.speech_switch,
      currentConfig?.fingerprint_config?.time_zone,
      currentConfig?.fingerprint_config?.web,
      currentConfig?.fingerprint_config?.webgl_config?.unmasked_renderer,
      currentConfig?.fingerprint_config?.webgl_config?.unmasked_vendor,
      currentConfig?.fingerprint_config?.webgl_image,
      currentConfig?.fingerprint_config?.webrtc,
      currentConfig?.font_mode,
      currentConfig?.hardware_concurrency_mode,
      currentConfig?.kernel_version?.id,
      currentConfig?.mac_address_mode,
      currentConfig?.name,
      currentConfig?.os?.os,
      currentConfig?.os?.os_version,
      currentConfig?.screen_resolution_mode,
      currentConfig?.user_agent,
      currentConfig?.user_agent_mode,
      currentConfig?.webgl_media_mode,
    ]
  );

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const watchUserAgentMode = watch('user_agent_mode');
  const watchUserAgent = watch('user_agent');
  const watchTimezone = watch('automatic_timezone');
  const watchLocation = watch('location');
  const watchLocationSwitch = watch('location_switch');
  const watchLanguages = watch('languages');
  const watchLanguageSwitch = watch('language_switch');
  const watchScreenResolutionMode = watch('screen_resolution_mode');
  const watchWebglMediaMode = watch('webgl_media_mode');
  const watchScanPortType = watch('scan_port_type');
  const watchAppLanguageSwitch = watch('app_language_switch');
  const watchDeviceNameMode = watch('device_name_mode');
  const watchMacAddressMode = watch('mac_address_mode');
  const watchHardwareConcurrencyMode = watch('hardware_concurrency_mode');
  const watchDeviceMemoryMode = watch('device_memory_mode');
  const watchOsVersion = watch('os_version');

  randomUserAgent.current = async () => {
    try {
      const os_version = getValues('os_version');
      let system = os_version?.os;
      let system_version = os_version?.version;

      if (browserActive === 'Firefox') {
        system = platformActive;
        system_version = '';
      }

      if (system && browserActive) {
        const payload = {
          system,
          system_version,
          browser: browserActive.toLowerCase(),
          browser_version: '',
        };

        if (payload?.system === 'linux') {
          payload.system_version = '';
        }

        const response = await randomUserAgentApi(payload);
        if (response.data) {
          setValue('user_agent', response.data.user_agent);
        }
      }
    } catch (error) {
      /* empty */
    }
  };

  randomFingerPrint.current = async (
    fingerprint_list = 'webgl,device_name,product_type,fonts,mac_address,platform,_platform,emulator'
  ) => {
    try {
      const userAgentStr = watchUserAgent;
      if (userAgentStr === '') return;
      const unmasked_vendor = getValues('unmasked_vendor');
      const system =
        WEBGL_UNMASKED_VENDORS.find((item) => item.value === unmasked_vendor)?.system ??
        getValues('os_version.os');
      const payload = {
        useragent: userAgentStr,
        fingerprint_list,
        webgl_config: { system, unmasked_vendor },
      };

      const response = await randomFingerPrintApi(payload);
      const data = response.data?.data;

      const {
        disabled_fonts,
        webgl,
        device_name,
        mac_address,
        product_type,
        platform,
        _platform,
        emulator,
      } = data;

      if (disabled_fonts) {
        const fontFiltered = fonts.filter((font) => !disabled_fonts.includes(font));
        setValue('fonts', fontFiltered);
        setValue('disabled_fonts', disabled_fonts);
      }

      if (webgl) {
        setValue('unmasked_vendor', webgl.unmasked_vendor);
        setValue('unmasked_renderer', webgl.unmasked_renderer);
      }

      if (device_name) setValue('device_name', device_name);
      if (mac_address) setValue('mac_address', mac_address);
      if (platform) setValue('platform', platform);
      if (_platform) setValue('_platform', _platform);
      if (product_type) setValue('product_type', product_type);
      if (emulator) setValue('emulation', emulator);
    } catch (error) {
      /* empty */
    }
  };

  useEffect(() => {
    /*
      - in update mode, only rerun random useragent when the user changes the user agent parameters.
      - in the case where the user agent parameters are changed due to the setting of profile data into the form,
      the random useragent will not be rerun.
    */
    if (open) {
      if (isUpdateMode && userInitiatedChange) {
        randomUserAgent.current();
        return;
      }

      if (!isUpdateMode) {
        randomUserAgent.current();
      }
    }
  }, [
    open,
    browserActive,
    platformActive,
    watchOsVersion?.os,
    watchOsVersion?.version,
    userInitiatedChange,
    isUpdateMode,
  ]);

  useEffect(() => {
    if (isUpdateMode && userInitiatedChange) {
      randomFingerPrint.current();
      return;
    }

    if (!isUpdateMode) {
      randomFingerPrint.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchUserAgent, isUpdateMode]);

  const handleBrowserKernelChange = (preValue, value) => {
    setUserInitiatedChange(true);
    if (preValue !== value) {
      setPlatformActive(OS_DEFAULT);

      if (value === 'Chrome') {
        setValue('os_version', { os: OS_DEFAULT, version: OS_VERSION_DEFAULT });
      }
    }
  };

  useEffect(() => {
    if (!platformActive) return;
    if ((isUpdateMode && userInitiatedChange) || !isUpdateMode) {
      let os = '';
      if (platformActive === 'android' || platformActive === 'linux') {
        os = 'android';
      } else {
        os = platformActive;
      }
      const res = WEBGL_UNMASKED_VENDORS.filter((item) => item.system === os);
      const randomVendor = res[generateRandomNumber(0, res.length - 1)];
      setValue('unmaskedVendor', randomVendor?.value);
    }
  }, [isUpdateMode, platformActive, setValue, userInitiatedChange]);

  const handleOSVersionChange = async () => {
    setUserInitiatedChange(true);
  };

  const handleOpenLanguageActions = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDeleteLanguage = (language) => {
    const newLanguages = watchLanguages.split(',').filter((item) => item !== language);
    setValue('languages', newLanguages.join(','));
    setAnchorEl(null);
  };

  const handleChangeWebglVendor = (event) => {
    setValue('unmasked_vendor', event.target.value, { shouldDirty: true });
    randomFingerPrint.current('webgl');
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        name: data.name,
        kernel_version: data.kernel_version_id,
        user_agent_mode: data.user_agent_mode,
        user_agent: data.user_agent,
        device_memory_mode: data.device_memory_mode,
        device_name_mode: data.device_name_mode,
        font_mode: data.font_mode,
        hardware_concurrency_mode: data.hardware_concurrency_mode,
        mac_address_mode: data.mac_address_mode,
        screen_resolution_mode: data.screen_resolution_mode,
        webgl_media_mode: data.webgl_media_mode,
        fingerprint_config: {
          dpr: 2,
          automatic_timezone: data.automatic_timezone,
          time_zone: data.time_zone,
          languages: data.languages,
          language_switch: data.language_switch,
          app_language_switch: data.app_language_switch,
          app_language: data.app_language,
          flash: data.flash,
          scan_port_type: data.scan_port_type,
          allow_scan_ports: data.allow_scan_ports,
          location: data.location,
          location_switch: data.location_switch,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          device_name_switch: data.device_name_switch,
          device_name: data.device_name,
          product_type: data.product_type,
          speech_switch: data.speech_switch,
          screen_resolution: data.screen_resolution,
          mac_address_config: {
            address: data.mac_address,
          },
          disabled_fonts: data.disabledFonts,
          media_devices: data.media_devices,
          canvas: data.canvas,
          client_rects: data.client_rects,
          webgl_config: {
            unmasked_vendor: data.unmasked_vendor,
            unmasked_renderer: data.unmasked_renderer,
          },
          webgl_image: data.webgl_image,
          web_gpu_mode: data.web_gpu_mode,
          audio: data.audio,
          webrtc: data.webrtc,
          do_not_track: data.do_not_track,
          hardware_concurrency: data.hardware_concurrency,
          device_memory: data.device_memory,
          gpu: data.gpu,
          platform: data.platform,
          _platform: data._platform,
          system_version: data.os_version.version,
          images: data.images,
          sounds: data.sounds,
          automation_controlled: data.automation_controlled,
          emulation: data.emulation,
        },
      };

      if (data.web_gpu_mode === '1') {
        const webgpu = getWebGPUData(data.unmasked_vendor);
        payload.fingerprint_config.webgpu = webgpu;
      }

      let response;

      if (isUpdateMode) {
        response = await updateProfileConfigApi(profileConfigId, payload);
        enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
      } else {
        response = await crateProfileConfigApi(payload);
        enqueueSnackbar(t('systemNotify.success.create'), { variant: 'success' });
      }
      handleReloadData();
      setBrowserConfig(response.data.id);
      handleClose();
    } catch (error) {
      enqueueSnackbar(t('systemNotify.error.title'), { variant: 'error' });
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    async function fetchBrowserData() {
      try {
        if (kernelData) {
          const grouped = groupBy(kernelData, 'type');
          const chromeKernels = grouped.cbrowser || [];
          const firefoxKernels = grouped.fbrowser || [];
          setChromeOption([...chromeKernels].sort((a, b) => b.id - a.id));
          setFirefoxOptions([...firefoxKernels].sort((a, b) => b.id - a.id));
          const latestChromeKernel = chromeKernels.find((item) => item.is_last);
          if (latestChromeKernel && !isUpdateMode) {
            const { id: kernelId } = latestChromeKernel;
            setValue('kernel_version_id', kernelId);
            setBrowserActive('Chrome');
          }
        }
      } catch (error) {
        console.error('Error fetching kernel versions:', error);
      }
    }

    if (open) {
      fetchBrowserData();
    }
  }, [setValue, open, isUpdateMode, kernelData]);

  useEffect(() => {
    if (isUpdateMode && open) {
      const browserType = currentConfig?.kernel_version?.type;
      const browserMap = {
        cbrowser: 'Chrome',
        fbrowser: 'Firefox',
      };
      const os = currentConfig?.os?.os;
      if (browserType && os) {
        setBrowserActive(browserMap[browserType]);
        setPlatformActive(os);
      }
    } else {
      setBrowserActive('Chrome');
      setPlatformActive(OS_DEFAULT);
    }
  }, [currentConfig?.kernel_version?.type, currentConfig?.os?.os, isUpdateMode, open, setValue]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    const firstError = Object.values(errors)?.[0];
    if (firstError?.message) {
      enqueueSnackbar(firstError.message, { variant: 'error' });
    } else if (typeof firstError === 'object') {
      const childrenError = Object.values(firstError)?.[0];
      if (childrenError?.message) {
        enqueueSnackbar(childrenError.message, { variant: 'error' });
      }
    }
  }, [errors]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: (theme) => theme.customShadows.z4,
          position: 'relative',
        },
      }}
    >
      {((isUpdateMode && !currentConfig?.name) || chromeOptions.length === 0) && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            WebkitTapHighlightColor: 'transparent',
            backgroundColor: 'rgba(22, 28, 36, 0.8)',
            cursor: 'not-allowed',
            zIndex: 10,
          }}
        />
      )}
      <DialogTitle sx={{ pb: 2 }}>
        {isUpdateMode ? t('browserConfig.update') : t('browserConfig.create')}
      </DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={onSubmit}
          sx={{
            height: '100%',
            position: 'relative',
          }}
        >
          <Scrollbar
            autoHide={false}
            sxRoot={{
              overflow: 'unset',
            }}
            sx={{
              height: 'calc(100vh - 200px)',
              '& .simplebar-track.simplebar-vertical': {
                position: 'absolute',
                right: '-12px',
                pointerEvents: 'auto',
                width: 10,
              },
            }}
          >
            <Stack spacing={3} pt={2}>
              <RHFTextField name="name" label={t('browserConfig.label.name')} size="small" />
              <Block label="Browser Kernel">
                <Stack direction="row" spacing={2}>
                  <BrowserButton
                    size="medium"
                    name="kernel_version_id"
                    type="browser"
                    title={{ label: 'ChromeBrowser', value: 'Chrome' }}
                    icon="teenyicons:chrome-solid"
                    active={browserActive}
                    setActive={setBrowserActive}
                    setPlatformActive={setPlatformActive}
                    options={chromeOptions}
                    onChange={handleBrowserKernelChange}
                  />
                  <BrowserButton
                    size="medium"
                    name="kernel_version_id"
                    type="browser"
                    title={{ label: 'FirefoxBrowser', value: 'Firefox' }}
                    icon="devicon-plain:firefox"
                    active={browserActive}
                    setActive={setBrowserActive}
                    setPlatformActive={setPlatformActive}
                    options={firefoxOptions}
                    onChange={handleBrowserKernelChange}
                  />
                </Stack>
              </Block>

              <Block label={t('form.label.operating-system')}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <BrowserButton
                      size="medium"
                      name="os_version"
                      type="platform"
                      title={{ label: 'Windows', value: 'windows' }}
                      icon="ph:windows-logo-fill"
                      active={platformActive}
                      setActive={setPlatformActive}
                      options={browserActive === 'Chrome' ? WINDOW_VERSION : []}
                      onChange={handleOSVersionChange}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <BrowserButton
                      size="medium"
                      name="os_version"
                      type="platform"
                      title={{ label: 'macOS', value: 'mac_os' }}
                      icon="ph:apple-logo-fill"
                      active={platformActive}
                      setActive={setPlatformActive}
                      options={browserActive === 'Chrome' ? MACOS_VERSION : []}
                      onChange={handleOSVersionChange}
                    />
                  </Grid>
                  {browserActive === 'Chrome' && (
                    <>
                      <Grid item xs={4}>
                        <BrowserButton
                          size="medium"
                          name="os_version"
                          type="platform"
                          title={{ label: 'Linux', value: 'linux' }}
                          icon="uiw:linux"
                          active={platformActive}
                          setActive={setPlatformActive}
                          options={LINUX_VERSION}
                          onChange={handleOSVersionChange}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <BrowserButton
                          size="medium"
                          name="os_version"
                          type="platform"
                          title={{ label: 'Android', value: 'android' }}
                          icon="uil:android"
                          active={platformActive}
                          setActive={setPlatformActive}
                          options={ANDROID_VERSION}
                          onChange={handleOSVersionChange}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <BrowserButton
                          size="medium"
                          name="os_version"
                          type="platform"
                          title={{ label: 'IOS', value: 'ios' }}
                          icon="mdi:apple-ios"
                          active={platformActive}
                          setActive={setPlatformActive}
                          options={IOS_VERSION}
                          onChange={handleOSVersionChange}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Block>

              <Block label="User agent">
                <Stack width={0.5}>
                  <GroupButton
                    name="user_agent_mode"
                    buttons={user_agent_modes}
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
                {watchUserAgentMode === 'custom' && (
                  <RHFTextField name="user_agent" label="User Agent" size="small" />
                )}
              </Block>

              <Block label={t('form.label.timezone')}>
                <Stack spacing={2}>
                  <RHFSwitch name="automatic_timezone" label={t('form.label.based_on_ip')} />
                  {!watchTimezone && (
                    <RHFSelect
                      fullWidth
                      size="small"
                      name="time_zone"
                      placeholder="Timezone"
                      InputLabelProps={{ shrink: true }}
                      PaperPropsSx={{ textTransform: 'capitalize' }}
                    >
                      {timezones.map((option) => (
                        <MenuItem key={option.id} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  )}
                </Stack>
              </Block>

              <Block label="Web RTC">
                <Stack>
                  <GroupButton
                    buttons={webrtc_modes}
                    name="webrtc"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>

              <Block label={t('form.label.location')}>
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
                      <RHFSwitch name="location_switch" label={t('form.label.based_on_ip')} />
                      {!watchLocationSwitch && (
                        <>
                          <RHFTextField
                            size="small"
                            name="longitude"
                            label="Longitude"
                            type="number"
                          />
                          <RHFTextField
                            size="small"
                            name="latitude"
                            label="Latitude"
                            type="number"
                          />
                          <RHFTextField
                            size="small"
                            name="accuracy"
                            label="Accuracy (m)"
                            type="number"
                          />
                        </>
                      )}
                    </>
                  )}
                </Stack>
              </Block>

              <Block label={t('form.label.language')}>
                <Stack spacing={2}>
                  <RHFSwitch name="language_switch" label={t('form.label.based_on_ip')} />
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
                            {watchLanguages.split(',').length > 1 && (
                              <>
                                <IconButton onClick={handleOpenLanguageActions}>
                                  <Iconify icon="ri:more-2-fill" />
                                </IconButton>
                                <Popover
                                  id={id}
                                  open={openLanguagePopover}
                                  anchorEl={anchorEl}
                                  onClose={() => setAnchorEl(null)}
                                  anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                  }}
                                >
                                  <MenuItem onClick={() => handleDeleteLanguage(language)}>
                                    <Iconify icon="fluent:delete-16-regular" />
                                    Delete
                                  </MenuItem>
                                </Popover>
                              </>
                            )}
                          </Stack>
                        ))}
                      <Button
                        sx={{
                          ml: 'auto',
                        }}
                        variant="outlined"
                        onClick={showLanguage.onTrue}
                      >
                        {t('form.label.add-languages')}
                      </Button>
                    </>
                  )}
                </Stack>
              </Block>

              <Block label={t('browserConfig.label.browserLanguage')}>
                <Stack spacing={2}>
                  <RHFSwitch name="app_language_switch" label={t('form.label.based_on_language')} />
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
              </Block>

              <Block label={t('form.label.screen-resolution')}>
                <Stack spacing={2}>
                  <Stack width={0.5}>
                    <GroupButton
                      buttons={resolution_mode}
                      name="screen_resolution_mode"
                      sx={{
                        mr: 'auto',
                      }}
                    />
                  </Stack>

                  {watchScreenResolutionMode === 'custom' && (
                    <RHFSelect
                      size="small"
                      fullWidth
                      name="screen_resolution"
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
              </Block>

              <Block label={t('form.label.font')}>
                <Stack spacing={2}>
                  <GroupButton
                    buttons={font_mode_browser}
                    name="font_mode"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>

              <Block label="Canvas">
                <Stack width={0.5}>
                  <GroupButton
                    buttons={canvas_mode}
                    name="canvas"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>

              <Block label="WebGL image">
                <Stack width={0.5}>
                  <GroupButton
                    buttons={webgl_img_mode}
                    name="webgl_image"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>

              <Block label="WebGL metadata">
                <Stack spacing={2}>
                  <Stack>
                    <GroupButton
                      buttons={webgl_meta_data_mode_browser}
                      name="webgl_media_mode"
                      sx={{
                        mr: 'auto',
                      }}
                    />
                  </Stack>
                  {watchWebglMediaMode === 'custom' && (
                    <>
                      <RHFSelect
                        size="small"
                        fullWidth
                        name="unmasked_vendor"
                        label="Unmasked Vendor"
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
                        size="small"
                        name="unmasked_renderer"
                        label="Unmasked Renderer"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="start">
                              <IconButton onClick={() => randomFingerPrint.current('webgl')}>
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
              </Block>

              <Block label="WebGPU">
                <Stack>
                  <GroupButton
                    buttons={web_gpu_mode}
                    name="web_gpu_mode"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>

              <Block label={t('form.label.audioContext')}>
                <Stack width={0.5}>
                  <GroupButton
                    buttons={audio_mode}
                    name="audio"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>

              <Block label={t('form.label.mediaDevice')}>
                <Stack width={0.5}>
                  <GroupButton
                    buttons={media_device_mode}
                    name="media_devices"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>

              <Block label="Client Rects">
                <Stack width={0.5}>
                  <GroupButton
                    buttons={client_rects_mode}
                    name="client_rects"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>

              <Block label="Speech voices">
                <Stack width={0.5}>
                  <GroupButton
                    buttons={speech_switch_mode}
                    name="speech_switch"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>

              <Block label="Hardware concurrency">
                <Stack spacing={2}>
                  <Stack width={0.5}>
                    <GroupButton
                      buttons={hardware_concurrency_mode}
                      name="hardware_concurrency_mode"
                      sx={{
                        mr: 'auto',
                      }}
                    />
                  </Stack>
                  {watchHardwareConcurrencyMode === 'custom' && (
                    <RHFSelect
                      fullWidth
                      size="small"
                      name="hardware_concurrency"
                      InputLabelProps={{ shrink: true }}
                      PaperPropsSx={{ textTransform: 'capitalize' }}
                    >
                      {HARDWARE_CONCURRENCY.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  )}
                </Stack>
              </Block>

              <Block label={t('form.label.device-memory')}>
                <Stack spacing={2}>
                  <Stack width={0.5}>
                    <GroupButton
                      buttons={device_memory_mode}
                      name="device_memory_mode"
                      sx={{
                        mr: 'auto',
                      }}
                    />
                  </Stack>
                  {watchDeviceMemoryMode === 'custom' && (
                    <RHFSelect
                      fullWidth
                      size="small"
                      name="device_memory"
                      InputLabelProps={{ shrink: true }}
                      PaperPropsSx={{ textTransform: 'capitalize' }}
                    >
                      {DEVICE_MEMORY.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  )}
                </Stack>
              </Block>

              <Block label={t('form.label.device-name')}>
                <Stack spacing={2}>
                  <GroupButton
                    buttons={device_name_mode_browser}
                    name="device_name_mode"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                  {watchDeviceNameMode === 'custom' && (
                    <RHFTextField
                      size="small"
                      label={t('form.label.device-name')}
                      name="device_name"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="start">
                            <IconButton onClick={() => randomFingerPrint.current('device_name')}>
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
              </Block>

              <Block label={t('form.label.mac-address')}>
                <Stack spacing={2}>
                  <GroupButton
                    buttons={mac_address_browser}
                    name="mac_address_mode"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                  {watchMacAddressMode === 'custom' && (
                    <RHFTextField
                      size="small"
                      name="mac_address"
                      label={t('form.label.mac-address')}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="start">
                            <IconButton onClick={() => randomFingerPrint.current('mac_address')}>
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
              </Block>

              <Block label={t('form.label.doNotTrack')}>
                <Stack>
                  <GroupButton
                    buttons={do_not_track_mode}
                    name="do_not_track"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>

              <Block label="Flash">
                <Stack width={0.5}>
                  <GroupButton
                    buttons={plash_mode}
                    name="flash"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>

              <Block label="Port scan protection">
                <Stack spacing={2}>
                  <Stack width={0.5}>
                    <GroupButton
                      buttons={scan_port_type}
                      name="scan_port_type"
                      sx={{
                        mr: 'auto',
                      }}
                    />
                  </Stack>
                  {watchScanPortType === ALLOW_MODE && (
                    <RHFTextField
                      name="allow_scan_ports"
                      size="small"
                      placeholder={t('form.label.watch-scan-allow')}
                    />
                  )}
                </Stack>
              </Block>

              <Block label="Hardware acceleration">
                <Stack>
                  <GroupButton
                    buttons={gpu_mode}
                    name="gpu"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>

              <Block label={t('form.label.display-image')}>
                <Stack width={0.5}>
                  <GroupButton
                    buttons={image_mode}
                    name="images"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>
              <Block label={t('form.label.sound')}>
                <Stack width={0.5}>
                  <GroupButton
                    buttons={sounds_mode}
                    name="sounds"
                    sx={{
                      mr: 'auto',
                    }}
                  />
                </Stack>
              </Block>
            </Stack>
          </Scrollbar>
          <Stack direction="row" justifyContent="flex-end" spacing={3} mb={3}>
            <Button variant="outlined" onClick={handleClose}>
              {t('browserConfig.actions.cancel')}
            </Button>

            <LoadingButton
              color="primary"
              size="medium"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              {isUpdateMode ? t('browserConfig.actions.update') : t('browserConfig.actions.create')}
            </LoadingButton>
          </Stack>

          <FingerprintLanguagesDialog
            open={showLanguage.value}
            onClose={showLanguage.onFalse}
            languages={languages}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

CreateUpdateBrowserConfig.propTypes = {
  open: PropTypes.bool,
  isUpdateMode: PropTypes.bool,
  onClose: PropTypes.func,
  currentConfig: PropTypes.object,
  handleReloadData: PropTypes.func,
  setBrowserConfig: PropTypes.func,
  profileConfigId: PropTypes.number,
};

//----------------------------------------------------------------
function Block({ label, sx, children }) {
  return (
    <Stack spacing={1} sx={{ width: 1, ...sx }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {children}
    </Stack>
  );
}

Block.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  sx: PropTypes.object,
};
