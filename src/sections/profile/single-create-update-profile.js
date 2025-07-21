import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import groupBy from 'lodash/groupBy';
import debounce from 'lodash/debounce';
// @mui
import FormProvider, { RHFTextField, RHFSelect, RHFCheckbox } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
// constants
import {
  ANDROID_VERSION,
  ERROR_CODE,
  HARDWARE_CONCURRENCY,
  IOS_VERSION,
  LINUX_VERSION,
  MACOS_VERSION,
  OS_DEFAULT,
  OS_VERSION_DEFAULT,
  WEBGL_UNMASKED_VENDORS,
  WINDOW_VERSION,
  useRenderTranslateValue,
} from 'src/utils/constance';
// api
import { useGetBrowserVersions, useGetKernelVersions } from 'src/api/cms.api';
import { createGroupProfileApi, getListGroupProfileApi } from 'src/api/profile-group.api';
import { randomFingerPrintApi, randomUserAgentApi } from 'src/api/random.api';
// @component
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import { BrowserButton } from 'src/components/custom-button';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/auth/hooks';
import { useLocales } from 'src/locales';
import AdvancedSetting from './advanced-setting';
import {
  getAudioContextLabel,
  getCanvasLabel,
  getClientRectsLabel,
  getDeviceNameLabel,
  getDoNotTrackLabel,
  getFlashLabel,
  getGpuModeLabel,
  getImagesLabel,
  getLocationDescription,
  getMacAddressLabel,
  getMediaDevicesLabel,
  getPortScanProtectionLabel,
  getScreenResolutionLabel,
  getSpeechVoiceLabel,
  getTimezoneLabel,
  getWebGPUData,
  getWebGpuLabel,
  getWebgMetadatalLabel,
  getWebglImageLabel,
  getWebrtcLabel,
  isValidBase64,
  randomHardwareConcurrency,
} from '../../utils/profile';
import { fonts } from '../../assets/data/fonts';
import { createProfileApi, updateProfileApi } from '../../api/profile.api';
import { useRouter, useSearchParams } from '../../routes/hooks';
import { isElectron } from '../../utils/commom';
import { generateRandomNumber } from '../../utils/random';

const SingleCreateUpdateProfile = ({
  currentProfile,
  isUpdateMode,
  handleReloadBalance = () => {},
}) => {
  const searchParams = useSearchParams();
  const groupParam = searchParams.get('defaultGroup');
  const { webrtc_modes, location_modes } = useRenderTranslateValue();
  const { t } = useLocales();
  const { isHost, workspace_id, workspace_permission } = useAuthContext();
  const { settingSystem } = useSettingsContext();
  const { themeMode } = useSettingsContext();
  const { kernelData } = useGetKernelVersions();
  const [browserVersionParams, setBrowserVersionParams] = useState(null);
  const { browserVersionData } = useGetBrowserVersions(browserVersionParams);

  const FormSchema = Yup.object().shape({
    name: Yup.string().required(t('formError.profile.name')),
    group: Yup.mixed().test('group-required', t('formError.profile.group'), (value) => {
      if (
        isHost ||
        isUpdateMode ||
        (!isHost && !!value) ||
        (!isHost && settingSystem?.authorization_method === 'profile')
      ) {
        return true;
      }
      return false;
    }),
    agentDes: Yup.string().required(t(t('formError.profile.agentDes'))),
    kernelVersionId: Yup.string().required(t(t('formError.profile.kernelVersion'))),
    proxy_type: Yup.string().required(t('formError.profile.proxyType')),
    proxy: Yup.object().when('proxy_type', {
      is: (proxy_type) => proxy_type !== 'none' && proxy_type !== 'token',
      then: (schema) =>
        schema.shape({
          host: Yup.string().required(t('formError.profile.proxyHost')),
          port: Yup.string().required(t('formError.profile.proxyPort')),
        }),
    }),
    proxy_token: Yup.string()
      .nullable()
      .when('proxy_type', {
        is: 'token',
        then: (schema) =>
          schema
            .required(t('formError.profile.proxyToken'))
            .test('is-base64', t('formError.profile.invalidBase64'), (value) =>
              value ? isValidBase64(value) : true
            ),
        otherwise: (schema) => schema.nullable(true),
      }),
  });
  const [groups, setGroups] = useState([{ id: 0, name: 'Ungrouped' }]);
  const [loading, setLoading] = useState(false);
  const [chromeOptions, setChromeOption] = useState([]);
  const [firefoxOptions, setFirefoxOptions] = useState([]);
  const [userAgentOptions, setUserAgentOptions] = useState([]);
  const [browserActive, setBrowserActive] = useState();
  const [platformActive, setPlatformActive] = useState();
  const fetchGroupData = useRef();
  const randomUserAgent = useRef();
  const randomFingerPrint = useRef();
  const router = useRouter();
  const [userInitiatedChange, setUserInitiatedChange] = useState(false); // to mark that the user has changed the parameters of the user agent
  const [openModal, setOpenModal] = useState(true);
  const getId = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;

  const defaultValues = useMemo(
    () => ({
      name: currentProfile?.name || '',
      group:
        // eslint-disable-next-line no-nested-ternary
        currentProfile?.profile_group || groupParam
          ? Math.max(Number(groupParam) || 0, 0)
          : isHost
            ? 0
            : '',
      kernelVersionId: currentProfile?.kernel_version_id || 0,
      kernel: currentProfile?.kernel_version?.kernel || '',
      osVersion: {
        os: currentProfile?.os?.os || OS_DEFAULT,
        version:
          currentProfile?.profile_preference?.system_version.toString() || OS_VERSION_DEFAULT,
      },
      groupName: '',
      agent: currentProfile?.os?.browser_version[0]?.toString() || '',
      agentDes: currentProfile?.user_agent || '',
      open_tabs:
        JSON.parse(currentProfile?.open_tabs || '[{"url":""}]')?.length === 0
          ? [{ url: '', id: getId() }]
          : JSON.parse(currentProfile?.open_tabs || '[{"url":""}]')?.map((tab) => ({
              id: getId(),
              url: tab.url,
            })),
      cookies: currentProfile?.cookies || '',
      note: currentProfile?.note || '',
      proxy_token: currentProfile?.proxy_token || '',
      proxy_type:
        currentProfile?.proxy_type !== 'token' ? currentProfile?.proxy_type || 'none' : 'token',
      proxy: {
        host: currentProfile?.proxy_host || '',
        port: currentProfile?.proxy_port || '',
        username: currentProfile?.proxy_user || '',
        password: currentProfile?.proxy_password || '',
      },
      productType: currentProfile?.profile_preference?.product_type || '',
      platform: currentProfile?.profile_preference?.platform || '',
      _platform: currentProfile?.profile_preference?._platform || '',
      automaticTimezone:
        !currentProfile?.profile_preference?.automatic_timezone ||
        currentProfile?.profile_preference?.automatic_timezone === '1',
      timezone: currentProfile?.profile_preference?.time_zone || '',
      webrtc: currentProfile?.profile_preference?.webrtc || 'disabled',
      location: currentProfile?.profile_preference?.location || 'ask',
      locationSwitch:
        !currentProfile?.profile_preference?.location_switch ||
        currentProfile?.profile_preference?.location_switch === '1',
      longitude: currentProfile?.profile_preference?.longitude || 0,
      latitude: currentProfile?.profile_preference?.latitude || 0,
      accuracy: currentProfile?.profile_preference?.accuracy || 1000,
      languageSwitch:
        !currentProfile?.profile_preference?.language_switch ||
        currentProfile?.profile_preference?.language_switch === '1',
      appLanguageSwitch:
        !currentProfile?.profile_preference?.app_language_switch ||
        currentProfile?.profile_preference?.app_language_switch === '1',
      languages: currentProfile?.profile_preference?.languages || 'en-US,en',
      app_language: currentProfile?.profile_preference?.app_language || 'vi',
      resolutionMode: currentProfile?.profile_preference?.screen_resolution_mode || 'custom',
      screenResolution: currentProfile?.profile_preference?.screen_resolution || 'none',
      fontMode: currentProfile?.profile_preference?.font_mode || 'custom',
      disabledFonts: currentProfile?.profile_preference?.disabled_fonts || [],
      fonts: fonts.filter(
        (font) => !(currentProfile?.profile_preference?.disabled_fonts || []).includes(font)
      ),
      canvas: currentProfile?.profile_preference?.canvas || '1',
      webglImg: currentProfile?.profile_preference?.webgl_image || '1',
      webgl: currentProfile?.profile_preference?.webgl || '1',
      audio: currentProfile?.profile_preference?.audio || '1',
      mediaDevices: currentProfile?.profile_preference?.media_devices || '1',
      clientRects: currentProfile?.profile_preference?.client_rects || '1',
      speechSwitch: currentProfile?.profile_preference?.speech_switch || '1',
      unmaskedVendor: currentProfile?.profile_preference?.webgl_config?.unmasked_vendor || '',
      unmaskedRenderer: currentProfile?.profile_preference?.webgl_config?.unmasked_renderer || '',
      hardwareConcurrency:
        currentProfile?.profile_preference?.hardware_concurrency ||
        randomHardwareConcurrency(HARDWARE_CONCURRENCY.slice(1)),
      deviceMemory: currentProfile?.profile_preference?.device_memory || '8',
      deviceNameSwitch: currentProfile?.profile_preference?.device_name_switch || '1',
      deviceName: currentProfile?.profile_preference?.device_name || '',
      macSwitch: currentProfile?.profile_preference?.mac_address_config?.model || '1',
      macAddress: currentProfile?.profile_preference?.mac_address_config?.address || '',
      doNotTrack: currentProfile?.profile_preference?.do_not_track || 'default',
      web_gpu_mode: currentProfile?.profile_preference?.web_gpu_mode || '1',
      flash: currentProfile?.profile_preference?.flash || 'block',
      scanPortType: currentProfile?.profile_preference?.scan_port_type || '1',
      allowScanPorts: currentProfile?.profile_preference?.allow_scan_ports || '',
      gpu: currentProfile?.profile_preference?.gpu || '0',
      images: currentProfile?.profile_preference?.images || '1',
      sounds: currentProfile?.profile_preference?.sounds || '1',
      emulation: currentProfile?.profile_preference?.emulation || '',
      is_auto_renew: currentProfile?.is_auto_renew ?? true,
    }),
    [currentProfile, isHost, groupParam]
  );

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isSubmitting, errors },
  } = methods;

  const watchAutomaticTimezone = watch('automaticTimezone');
  const watchLocation = watch('location');
  const watchLocationSwitch = watch('locationSwitch');
  const watchLanguageSwitch = watch('languageSwitch');
  const watchLanguages = watch('languages');
  const watchAgent = watch('agent');
  const watchOsVersion = watch('osVersion');
  const watchAgentDes = watch('agentDes');
  const watchTimezoneDes = watch('timezone');
  const watchWebrtc = watch('webrtc');
  const watchLongitude = watch('longitude');
  const watchLatitude = watch('latitude');
  const watchAccuracy = watch('accuracy');
  const watchFont = watch('fonts');
  const watchCanvas = watch('canvas');
  const watchWebglImg = watch('webglImg');
  const watchWebgl = watch('webgl');
  const watchAudio = watch('audio');
  const watchMediaDevices = watch('mediaDevices');
  const watchClientRects = watch('clientRects');
  const watchDoNotTrack = watch('doNotTrack');
  const watchFlash = watch('flash');
  const watchGroupName = watch('groupName');
  const watchSpeechSwitch = watch('speechSwitch');
  const watchUnmaskedRenderer = watch('unmaskedRenderer');
  const watchResolutionMode = watch('resolutionMode');
  const watchScreenResolution = watch('screenResolution');
  const watchHardwareConcurrency = watch('hardwareConcurrency');
  const watchDeviceMemory = watch('deviceMemory');
  const watchScanPortType = watch('scanPortType');
  const watchMacAddress = watch('macAddress');
  const watchAllowScanPorts = watch('allowScanPorts');
  const watchGpu = watch('gpu');
  const watchDeviceName = watch('deviceName');
  const watchMacSwitch = watch('macSwitch');
  const watchDeviceNameSwitch = watch('deviceNameSwitch');
  const watchImages = watch('images');
  const watchSounds = watch('sounds');
  const watchWebGpu = watch('web_gpu_mode');
  const watchKernel = watch('kernel');
  const watchAutoRenew = watch('is_auto_renew');

  const OVERVIEW_INFO = [
    {
      id: 'in_01',
      title: 'Browser Kernel',
      des: `${browserActive}Browser [${browserActive} ${watchKernel}]`,
    },
    { id: 'in_02', title: 'User-Agent', des: watchAgentDes },
    {
      id: 'in_03',
      title: t('form.label.timezone'),
      des: getTimezoneLabel(
        watchAutomaticTimezone,
        watchTimezoneDes,
        t('form.value.timezone'),
        t('form.value.local')
      ),
    },
    { id: 'in_04', title: 'WebRTC', des: getWebrtcLabel(watchWebrtc, webrtc_modes) },
    {
      id: 'in_05',
      title: t('form.label.location'),
      des: getLocationDescription(
        watchLocation,
        watchLocationSwitch,
        watchLongitude,
        watchLatitude,
        watchAccuracy,
        t('form.value.timezone'),
        `[${t('form.value.options.disable')}]`,
        location_modes
      ),
    },
    {
      id: 'in_06',
      title: t('form.label.language'),
      des: watchLanguageSwitch ? t('form.value.timezone') : watchLanguages,
    },
    {
      id: 'in_07',
      title: t('form.label.screen-resolution'),
      des: getScreenResolutionLabel(
        watchResolutionMode,
        watchScreenResolution,
        t('form.value.options.random'),
        t('form.value.options.default')
      ),
    },
    { id: 'in_08', title: t('form.label.font'), des: watchFont?.length },
    {
      id: 'in_09',
      title: 'Canvas',
      des: getCanvasLabel(watchCanvas, t('form.value.options.noise'), t('form.value.options.real')),
    },
    {
      id: 'in_10',
      title: 'WebGL Image',
      des: getWebglImageLabel(
        watchWebglImg,
        t('form.value.options.noise'),
        t('form.value.options.real')
      ),
    },
    {
      id: 'in_11',
      title: 'WebGL metadata',
      des: getWebgMetadatalLabel(watchWebgl, watchUnmaskedRenderer, t('form.value.options.real')),
    },
    {
      id: 'in_12',
      title: 'WebGPU',
      des: getWebGpuLabel(
        watchWebGpu,
        t('form.value.options.matchWebGl'),
        t('form.value.options.real'),
        t('form.value.options.disable')
      ),
    },
    {
      id: 'in_13',
      title: 'AudioContext',
      des: getAudioContextLabel(
        watchAudio,
        t('form.value.options.noise'),
        t('form.value.options.real')
      ),
    },
    {
      id: 'in_14',
      title: t('form.label.media-device'),
      des: getMediaDevicesLabel(
        watchMediaDevices,
        t('form.value.options.noise'),
        t('form.value.options.real')
      ),
    },
    {
      id: 'in_15',
      title: 'ClientRects',
      des: getClientRectsLabel(
        watchClientRects,
        t('form.value.options.noise'),
        t('form.value.options.real')
      ),
    },
    {
      id: 'in_16',
      title: 'SpeechVoice',
      des: getSpeechVoiceLabel(
        watchSpeechSwitch,
        t('form.value.options.noise'),
        t('form.value.options.real')
      ),
    },
    { id: 'in_17', title: 'Hardware concurrency', des: watchHardwareConcurrency },
    { id: 'in_18', title: t('form.label.device-memory'), des: watchDeviceMemory },
    {
      id: 'in_19',
      title: t('form.label.device-name'),
      des: getDeviceNameLabel(watchDeviceNameSwitch, watchDeviceName, t('form.value.options.real')),
    },
    {
      id: 'in_20',
      title: t('form.label.mac-address'),
      des: getMacAddressLabel(watchMacSwitch, watchMacAddress, t('form.value.options.real')),
    },
    {
      id: 'in_21',
      title: 'Do not Track',
      des: getDoNotTrackLabel(
        watchDoNotTrack,
        t('form.value.options.default'),
        t('form.value.options.open'),
        t('form.value.options.close')
      ),
    },
    {
      id: 'in_22',
      title: 'Flash',
      des: getFlashLabel(watchFlash, t('form.value.options.allow'), t('form.value.options.block')),
    },
    {
      id: 'in_23',
      title: 'Port scan protection',
      des: getPortScanProtectionLabel(
        watchScanPortType,
        watchAllowScanPorts,
        t('form.value.options.allow'),
        t('form.value.options.block')
      ),
    },
    {
      id: 'in_24',
      title: t('form.label.hardware-acceleration'),
      des: getGpuModeLabel(
        watchGpu,
        t('form.value.options.default'),
        t('form.value.options.open'),
        t('form.value.options.close')
      ),
    },
    {
      id: 'in_25',
      title: t('form.label.display-image'),
      des: getImagesLabel(
        watchImages,
        t('form.value.options.allow'),
        t('form.value.options.block')
      ),
    },
    {
      id: 'in_26',
      title: t('form.label.sound'),
      des: getImagesLabel(
        watchSounds,
        t('form.value.options.allow'),
        t('form.value.options.block')
      ),
    },
    {
      id: 'in_27',
      title: t('dialog.renewProfile.enableAutoRenew.title'),
      des: watchAutoRenew ? t('schedule.actions.enable') : t('schedule.actions.disable'),
    },
  ];

  const getProxyFields = useCallback((data) => {
    if (data.proxy_type === 'token') {
      return {
        proxy_token: data.proxy_token,
        proxy_host: '',
        proxy_port: '',
        proxy_user: '',
        proxy_password: '',
      };
    }

    if (data.proxy_type === 'none') {
      return {
        proxy_type: '',
        proxy_host: data.proxy.host,
        proxy_port: data.proxy.port,
        proxy_user: data.proxy.username,
        proxy_password: data.proxy.password,
        proxy_token: '',
      };
    }

    return {
      proxy_host: data.proxy.host,
      proxy_port: data.proxy.port,
      proxy_user: data.proxy.username,
      proxy_password: data.proxy.password,
      proxy_token: '',
    };
  }, []);

  const getChangedFields = useCallback((payload, prevData) => {
    const changes = {};

    function compareObjects(newObj, oldObj, path = '', resultObj) {
      // eslint-disable-next-line no-restricted-syntax
      for (const key in newObj) {
        if (
          Object.prototype.hasOwnProperty.call(newObj, key) &&
          Object.prototype.hasOwnProperty.call(oldObj, key)
        ) {
          if (
            typeof newObj[key] === 'object' &&
            newObj[key] !== null &&
            oldObj[key] !== undefined
          ) {
            if (Array.isArray(newObj[key]) && Array.isArray(oldObj[key])) {
              if (JSON.stringify(newObj[key]) !== JSON.stringify(oldObj[key])) {
                resultObj[key] = newObj[key];
              }
            } else {
              resultObj[key] = {};
              compareObjects(
                newObj[key],
                oldObj[key],
                path ? `${path}.${key}` : key,
                resultObj[key]
              );
              if (Object.keys(resultObj[key]).length === 0) {
                delete resultObj[key];
              }
            }
          } else {
            // eslint-disable-next-line no-lonely-if
            if (key === 'open_tabs') {
              const oldTabs = oldObj[key].replace(/\n/g, '');
              if (newObj[key] !== oldTabs) {
                resultObj[key] = newObj[key];
              }
            } else if (newObj[key] !== oldObj[key]) {
              resultObj[key] = newObj[key];
            }
          }
        } else if (['sounds'].includes(key)) {
          resultObj[key] = newObj[key];
        }
      }
    }

    compareObjects(payload, prevData, '', changes);
    const fingerprintConfigChanges = {};
    compareObjects(
      payload.fingerprint_config,
      prevData.profile_preference,
      'fingerprint_config',
      fingerprintConfigChanges
    );

    if (Object.keys(fingerprintConfigChanges).length > 0) {
      changes.fingerprint_config = payload.fingerprint_config;
    }

    return changes;
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    let cookies = '';

    if (isElectron()) {
      cookies = await window.ipcRenderer.invoke('encrypt-cookie', data.cookies);
    }

    try {
      const payload = {
        name: data.name,
        note: data.note,
        ...(isElectron() && { cookies }),
        open_tabs: JSON.stringify(
          data.open_tabs.reduce((acc, tab) => {
            const trimmedTab = tab?.url?.trim();
            if (trimmedTab) {
              acc.push({ url: trimmedTab });
            }
            return acc;
          }, [])
        ),
        proxy_type: data.proxy_type,
        ...getProxyFields(data),
        kernel_version_id: Number(data.kernelVersionId),
        user_agent: data.agentDes,
        fingerprint_config: {
          dpr: 2,
          automatic_timezone: data.automaticTimezone ? '1' : '0',
          time_zone: data.timezone,
          languages: data.languages,
          language_switch: data.languageSwitch ? '1' : '0',
          app_language_switch: data.appLanguageSwitch ? '1' : '0',
          app_language: data.app_language,
          flash: data.flash,
          scan_port_type: data.scanPortType,
          allow_scan_ports: data.allowScanPorts,
          location: data.location,
          location_switch: data.locationSwitch ? '1' : '0',
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          device_name_switch: data.deviceNameSwitch,
          device_name: data.deviceName,
          product_type: data.productType,
          speech_switch: data.speechSwitch,
          screen_resolution: data.screenResolution,
          screen_resolution_mode: data.resolutionMode,
          mac_address_config: {
            model: data.macSwitch,
            address: data.macAddress,
          },
          font_mode: data.fontMode,
          disabled_fonts: data.disabledFonts,
          media_devices: data.mediaDevices,
          canvas: data.canvas,
          client_rects: data.clientRects,
          webgl: data.webgl,
          webgl_config: {
            unmasked_vendor: data.unmaskedVendor,
            unmasked_renderer: data.unmaskedRenderer,
          },
          webgl_image: data.webglImg,
          web_gpu_mode: data.web_gpu_mode,
          audio: data.audio,
          webrtc: data.webrtc,
          do_not_track: data.doNotTrack,
          hardware_concurrency: data.hardwareConcurrency,
          device_memory: data.deviceMemory,
          gpu: data.gpu,
          platform: data.platform,
          _platform: data._platform,
          system_version: data.osVersion.version,
          images: data.images,
          sounds: data.sounds,
          automation_controlled: '',
          emulation: data.emulation,
        },
        is_auto_renew: data.is_auto_renew,
      };
      if (data.group !== 0 && isUpdateMode === false) {
        // group là Ungrouped thì không cần gửi lên
        payload.profile_group = data.group;
      }
      if (isUpdateMode) {
        // cập nhật trạng thái disable || real sang match_webgl
        if (data.web_gpu_mode === '1' && currentProfile.profile_preference?.web_gpu_mode !== '1') {
          const webgpu = getWebGPUData(data.unmaskedVendor);
          payload.fingerprint_config.webgpu = webgpu;
        }
        const finalPayload = getChangedFields(payload, currentProfile);
        await updateProfileApi(workspace_id, currentProfile?.id, finalPayload);
        enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
      } else {
        if (data.web_gpu_mode === '1') {
          const webgpu = getWebGPUData(data.unmaskedVendor);
          payload.fingerprint_config.webgpu = webgpu;
        }
        await createProfileApi(workspace_id, payload);
        enqueueSnackbar(t('systemNotify.success.create'), { variant: 'success' });
      }
      router.back();
      handleReloadBalance();
    } catch (error) {
      console.error(error);
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        if (error?.resource_key) {
          if (
            ['kernel_version_id', 'browser_type', 'kernel_version', 'user_agent'].includes(
              error.resource_key
            )
          ) {
            enqueueSnackbar(t('systemNotify.warning.notPermission.profile.fingerprint_config'), {
              variant: 'error',
            });
          } else if (
            ['proxy_host', 'proxy_port', 'proxy_user', 'proxy_password', 'proxy_type'].includes(
              error.resource_key
            )
          ) {
            enqueueSnackbar(t('systemNotify.warning.notPermission.profile.proxy'), {
              variant: 'error',
            });
          } else {
            enqueueSnackbar(t(`systemNotify.warning.notPermission.profile.${error.resource_key}`), {
              variant: 'error',
            });
          }
        } else {
          enqueueSnackbar(
            currentProfile?.id
              ? t('systemNotify.warning.notPermission.profile.update')
              : t('systemNotify.warning.notPermission.profile.create'),
            { variant: 'error' }
          );
        }
      } else if (error?.error_code === ERROR_CODE.INSUFFICIENT_PROFILE_BALANCE) {
        enqueueSnackbar(t('systemNotify.warning.notEnoughProfileBalance'), { variant: 'error' });
      } else if (error?.error_fields) {
        const error_fields = error?.error_fields;
        const keys = Object.keys(error_fields);
        enqueueSnackbar(error_fields[keys[0]][0], { variant: 'error' });
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    }
  });

  const handleCreateGroup = async () => {
    if (!watchGroupName) return;
    setLoading(true);
    try {
      const payload = {
        name: watchGroupName,
        color_code: '#ccc',
      };
      if (workspace_id) {
        const response = await createGroupProfileApi(workspace_id, payload);
        setValue('group', response?.data?.data?.id, { shouldValidate: true });
        fetchGroupData.current();
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.group.create'), { variant: 'error' });
      } else if (error?.error_fields) {
        enqueueSnackbar(error?.error_fields?.name[0], { variant: 'error' });
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(false);
      setValue('groupName', '');
    }
  };

  fetchGroupData.current = async () => {
    try {
      if (workspace_id) {
        const response = await getListGroupProfileApi(workspace_id);
        if (response.data) {
          setGroups(response.data.data);
        }
      }
    } catch (error) {
      /* empty */
    }
  };

  useEffect(() => {
    if (isUpdateMode) {
      const browserType = currentProfile?.kernel_version?.type;
      const browserMap = {
        cbrowser: 'Chrome',
        fbrowser: 'Firefox',
      };
      const os = currentProfile?.os?.os;
      if (browserType && os) {
        setBrowserActive(browserMap[browserType]);
        setPlatformActive(os);
      }
    } else {
      setBrowserActive('Chrome');
      setPlatformActive(OS_DEFAULT);
    }
  }, [isUpdateMode, currentProfile, setValue]);

  useEffect(() => {
    if (browserVersionData) {
      const useragentOptions = browserVersionData
        .map((item) => item.major_version)
        .filter((version, index, self) => self.indexOf(version) === index)
        .sort((a, b) => b - a);
      setUserAgentOptions(useragentOptions);
    }
  }, [browserVersionData]);

  useEffect(() => {
    async function fetchUserAgentData() {
      try {
        const osVersion = getValues('osVersion');
        let params = {};
        if (browserActive === 'Firefox') {
          params = {
            browser: 'firefox',
            system: platformActive,
          };
        } else {
          params = {
            system: osVersion?.os,
            system_version: osVersion?.version,
          };
        }

        if (params?.system === 'linux') {
          params.system_version = '';
        }
        setBrowserVersionParams(params);
      } catch (error) {
        console.error('Error fetching user agent data:', error);
      }
    }
    if (browserActive && platformActive) {
      fetchUserAgentData();
    }
  }, [platformActive, browserActive, setValue, getValues, watchOsVersion]);

  useEffect(() => {
    if (userAgentOptions.length === 0 || !watchKernel) return;

    if (userAgentOptions.includes(parseInt(watchKernel, 10))) {
      setValue('agent', watchKernel);
    } else {
      setValue('agent', 'all');
    }
  }, [setValue, userAgentOptions, watchKernel]);

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
      setValue('unmaskedVendor', randomVendor.value);
    }
  }, [platformActive, setValue, isUpdateMode, userInitiatedChange]);

  useEffect(() => {
    if (currentProfile) {
      if (isElectron()) {
        const decryptCookie = async () => {
          try {
            const cookies = await window.ipcRenderer.invoke(
              'decrypt-cookie',
              currentProfile.cookies
            );
            setValue('cookies', cookies);
          } catch (error) {
            console.error('Error decrypting cookies:', error);
            setValue('cookies', '');
          }
        };
        decryptCookie();
      }
    }
  }, [currentProfile, setValue]);

  useEffect(() => {
    async function fetchBrowserData() {
      try {
        if (!kernelData) return;
        const grouped = groupBy(kernelData, 'type');
        const chromeKernels = grouped.cbrowser || [];
        const firefoxKernels = grouped.fbrowser || [];
        setChromeOption([...chromeKernels].sort((a, b) => b.id - a.id));
        setFirefoxOptions([...firefoxKernels].sort((a, b) => b.id - a.id));
        const latestChromeKernel = chromeKernels.find((item) => item.is_last);
        if (latestChromeKernel && isUpdateMode === false) {
          const { id, kernel } = latestChromeKernel;
          setValue('kernelVersionId', id);
          setValue('kernel', kernel);
        }
      } catch (error) {
        console.error('Error fetching kernel versions:', error);
      }
    }

    fetchBrowserData();
  }, [setValue, kernelData, isUpdateMode]);

  useEffect(() => {
    fetchGroupData.current();
  }, [workspace_id]);

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

  randomUserAgent.current = async (type) => {
    try {
      const osVersion = getValues('osVersion');
      let system = osVersion?.os;
      let system_version = osVersion?.version;

      if (browserActive === 'Firefox') {
        system = platformActive;
        system_version = '';
      }

      if (system && browserActive && watchAgent) {
        const payload = {
          system,
          system_version,
          browser: browserActive.toLowerCase(),
          browser_version: watchAgent === 'all' ? '' : watchAgent,
        };

        if (payload?.system === 'linux') {
          payload.system_version = '';
        }

        const response = await randomUserAgentApi(payload);
        if (response.data) {
          setValue('agentDes', response.data.user_agent);
          if (type !== 'only_useragent') {
            randomFingerPrint.current();
          }
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
      const userAgentStr = getValues('agentDes');
      if (userAgentStr === '') return;
      const unmasked_vendor = getValues('unmaskedVendor');
      const system =
        WEBGL_UNMASKED_VENDORS.find((item) => item.value === unmasked_vendor)?.system ??
        getValues('osVersion.os');
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
        setValue('disabledFonts', disabled_fonts);
      }

      if (webgl) {
        setValue('unmaskedVendor', webgl.unmasked_vendor);
        setValue('unmaskedRenderer', webgl.unmasked_renderer);
      }

      if (device_name) setValue('deviceName', device_name);
      if (mac_address) setValue('macAddress', mac_address);
      if (platform) setValue('platform', platform);
      if (_platform) setValue('_platform', _platform);
      if (product_type) setValue('productType', product_type);
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
    if (isUpdateMode && userInitiatedChange) {
      randomUserAgent.current();
    }
  }, [
    browserActive,
    platformActive,
    watchAgent,
    watchOsVersion?.os,
    watchOsVersion?.version,
    userInitiatedChange,
    isUpdateMode,
  ]);

  useEffect(() => {
    if (!isUpdateMode) {
      randomUserAgent.current();
    }
  }, [
    browserActive,
    platformActive,
    watchAgent,
    watchOsVersion?.os,
    watchOsVersion?.version,
    isUpdateMode,
  ]);

  useEffect(() => {
    if (isUpdateMode) {
      reset(defaultValues);
    }
  }, [isUpdateMode, defaultValues, reset]);

  useEffect(() => {
    if (chromeOptions?.length > 0 && firefoxOptions?.length > 0 && userAgentOptions?.length > 0) {
      setOpenModal(false);
    } else {
      setOpenModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chromeOptions?.length, firefoxOptions?.length, userAgentOptions?.length]);

  const handleBrowserKernelChange = (preValue, value) => {
    setUserInitiatedChange(true);
    if (preValue !== value) {
      setPlatformActive(OS_DEFAULT);
      if (value === 'Chrome') {
        setValue('osVersion', { os: OS_DEFAULT, version: OS_VERSION_DEFAULT });
      }
    }
  };

  const handleOSVersionChange = async () => {
    setUserInitiatedChange(true);
  };

  const handleRandomUserAgent = () => {
    randomUserAgent.current('only_useragent');
  };

  const renderOverview = (
    <Card
      sx={{
        position: 'sticky',
        top: 0,
        width: 1,
        height: `calc(100vh - ${currentProfile?.id ? 156 : 196}px)`,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.6),
          borderRadius: '4px',
          border: 'none',
        },
        '&::-webkit-scrollbar-track': {
          boxShadow: 'none',
        },
      }}
    >
      <CardHeader
        title={t('nav.overview')}
        sx={{
          position: 'sticky',
          top: 0,
          '&.MuiCardHeader-root': {
            bgcolor: '#212B36',
            ...(themeMode === 'light' && {
              bgcolor: '#fff',
            }),
          },
          pb: 2,
        }}
        action={
          <Button
            variant="outlined"
            onClick={() => {
              randomUserAgent.current();
              randomFingerPrint.current();
            }}
            startIcon={<Iconify icon="tabler:switch-3" />}
          >
            {t('form.label.new-fingerprint')}
          </Button>
        }
      />
      <CardContent
        sx={{
          '&.MuiCardContent-root': {
            pb: 2,
          },
          pt: 1,
        }}
      >
        <Stack spacing={1}>
          {OVERVIEW_INFO?.map((item) => (
            <OverviewItem key={item.id} title={item.title} des={item.des} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  const renderForm = (
    <Stack spacing={3}>
      <RHFTextField name="name" label={t('form.label.name')} />
      {isUpdateMode === false &&
        (!(settingSystem?.authorization_method === 'profile') || isHost) && (
          <RHFSelect
            fullWidth
            name="group"
            label={t('form.label.group')}
            SelectProps={{
              MenuProps: {
                autoFocus: false,
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                  },
                },
              },
            }}
          >
            <Stack direction="row" spacing={3} my={2} alignItems="center">
              <TextField
                fullWidth
                size="small"
                placeholder={t('form.tooltip.create-group')}
                onClick={(event) => event.stopPropagation()}
                onChange={debounce((event) => setValue('groupName', event.target.value), [300])}
              />
              <LoadingButton variant="contained" loading={loading} onClick={handleCreateGroup}>
                {t('form.action.create')}
              </LoadingButton>
            </Stack>
            {groups.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                <TextField
                  fullWidth
                  size="small"
                  value={option.name}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '& .MuiInputBase-input': {
                      padding: 0,
                      cursor: 'pointer',
                    },
                  }}
                />
              </MenuItem>
            ))}
          </RHFSelect>
        )}
      <Block label="Browser Kernel">
        <Stack direction="row" spacing={2}>
          <BrowserButton
            name="kernelVersionId"
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
            name="kernelVersionId"
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
              name="osVersion"
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
              name="osVersion"
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
                  name="osVersion"
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
                  name="osVersion"
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
                  name="osVersion"
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
      <Grid container spacing={2}>
        <Grid
          item
          xs={4}
          sx={{
            '& .MuiFormControl-root': {
              width: 1,
            },
          }}
        >
          <RHFSelect
            fullWidth
            name="agent"
            label="User Agent"
            InputLabelProps={{ shrink: true }}
            PaperPropsSx={{ textTransform: 'capitalize' }}
            SelectProps={{
              MenuProps: {
                autoFocus: false,
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    '&::-webkit-scrollbar': {
                      width: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: (theme) => theme.palette.grey[500],
                      borderRadius: '4px',
                    },
                  },
                },
              },
            }}
          >
            <MenuItem key="all" value="all" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              All
            </MenuItem>

            <Divider sx={{ borderStyle: 'dashed' }} />

            {userAgentOptions.map((item) => (
              <MenuItem key={item} value={item}>
                {`UA ${item}`}
              </MenuItem>
            ))}
          </RHFSelect>
        </Grid>
        <Grid item xs={8}>
          <RHFTextField
            name="agentDes"
            readOnly
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <IconButton onClick={handleRandomUserAgent}>
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
        </Grid>
      </Grid>
      {isElectron() && (
        <RHFTextField
          name="cookies"
          label="Cookies"
          placeholder="Cookie hỗ trợ định dạng JSON/Netscape/Name=Value"
          multiline
          rows={4}
        />
      )}
      {(isHost || workspace_permission?.[workspace_id]?.includes('show-profile-note')) && (
        <RHFTextField
          name="note"
          label={t('form.label.note')}
          placeholder="Vui lòng nhập ghi chú"
          multiline
          rows={4}
        />
      )}
      <AdvancedSetting randomFingerprint={randomFingerPrint.current} />

      <RHFCheckbox
        name="is_auto_renew"
        label={t('dialog.renewProfile.enableAutoRenew.title')}
        sx={{
          ml: 0.5,
          pb: 2.5,
        }}
      />
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Dialog
        open={openModal}
        sx={{
          cursor: 'not-allowed',
        }}
      />

      <Grid container>
        <Grid
          item
          xs={6}
          sx={{
            mt: 3,
          }}
        >
          {renderForm}
          <Stack
            direction="row"
            spacing={3}
            mt={3}
            sx={{
              position: 'fixed',
              bottom: 8,
              zIndex: 10,
            }}
          >
            <LoadingButton
              color="primary"
              size="medium"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              {isUpdateMode ? t('form.action.update') : t('form.action.create')}
            </LoadingButton>
            <Button variant="outlined" onClick={() => router.back()}>
              {t('form.action.cancel')}
            </Button>
          </Stack>
        </Grid>
        <Grid item xs={2} />
        <Grid item xs={4}>
          {renderOverview}
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default SingleCreateUpdateProfile;

SingleCreateUpdateProfile.propTypes = {
  currentProfile: PropTypes.object,
  isUpdateMode: PropTypes.bool,
  handleReloadBalance: PropTypes.func,
};

//----------------------------------------------------------------
function Block({ label, sx, children }) {
  return (
    <Stack spacing={1} sx={{ width: 1, ...sx }}>
      <Typography variant="body2">{label}</Typography>
      {children}
    </Stack>
  );
}

Block.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  sx: PropTypes.object,
};

//----------------------------------------------------------------
function OverviewItem({ title, des }) {
  return (
    <Stack direction="row" spacing={6}>
      <Typography
        variant="subtitle2"
        sx={{
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        ml="auto"
        sx={{
          textAlign: 'right',
        }}
      >
        {des}
      </Typography>
    </Stack>
  );
}

OverviewItem.propTypes = {
  title: PropTypes.string,
  des: PropTypes.any,
};
