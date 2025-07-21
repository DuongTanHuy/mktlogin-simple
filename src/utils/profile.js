import CryptoJS from 'crypto-js';
import { Box, CircularProgress, Typography } from '@mui/material';
import { languages } from '../assets/data/languages';
import {
  ANDROID_VERSION,
  IOS_VERSION,
  LINUX_VERSION,
  LOCATION_MODES,
  MACOS_VERSION,
  WEBRTC_MODES,
  WEB_GPU_DATA,
  WINDOW_VERSION,
} from './constance';
import { fDate } from './format-time';
import { randomItem } from './random';

export function getWebrtcLabel(value, options = WEBRTC_MODES) {
  return options.find((item) => item.value === value)?.label;
}

export function getLocationModelLabel(value, options = LOCATION_MODES) {
  return options.find((item) => item.value === value)?.label;
}

export function getLocationCustomLabel(longitude, latitude, accuracy) {
  let label = ' ';

  if (longitude) {
    label += `longtitude : ${longitude}`;
  }

  if (latitude) {
    label += ` latitude : ${latitude}`;
  }

  if (accuracy) {
    label += ` accuracy : ${accuracy}`;
  }

  return label;
}

export function getLocationDescription(
  value,
  locationSwitch,
  longitude,
  latitude,
  accuracy,
  valueLocation = 'Kết hợp dựa trên IP',
  valueDisabled = '[Vô hiệu hóa]',
  options
) {
  let mode = '';
  let locationInfo = '';
  if (value === 'allow' || value === 'ask') {
    mode = `[${getLocationModelLabel(value, options)}]`;
    if (locationSwitch) {
      locationInfo = valueLocation;
    } else {
      locationInfo = getLocationCustomLabel(longitude, latitude, accuracy);
    }
  } else {
    mode = valueDisabled;
  }
  return `${mode} ${locationInfo}`;
}

export function getScreenResolutionLabel(
  value,
  screenResolution,
  valueRandom = 'Ngẫu nhiên',
  valueDefault = 'Mặc định'
) {
  switch (value) {
    case 'random':
      return valueRandom;
    case 'custom':
      return screenResolution === 'none' ? valueDefault : screenResolution;
    default:
      return '';
  }
}

export function randomHardwareConcurrency(options) {
  let result;

  do {
    result = randomItem(options);
  } while (parseInt(result, 10) < 8);

  return result;
}

export function getDoNotTrackLabel(
  value,
  defaultLabel = 'Mặc định',
  openLabel = 'Mở',
  closeLabel = 'Đóng'
) {
  switch (value) {
    case 'default':
      return defaultLabel;
    case '1':
      return openLabel;
    case '0':
      return closeLabel;
    default:
      return 'undefined';
  }
}

export function getGpuModeLabel(
  value,
  defaultLabel = 'Mặc định',
  openLabel = 'Mở',
  closeLabel = 'Đóng'
) {
  switch (value) {
    case '0':
      return defaultLabel;
    case '1':
      return openLabel;
    case '2':
      return closeLabel;
    default:
      return 'undefined';
  }
}

export function getMacAddressLabel(mode, macAddress, closeLabel = 'Đóng') {
  if (mode === '0') return closeLabel;
  return macAddress;
}

export function getDeviceNameLabel(mode, deviceName, closeLabel = 'Đóng') {
  if (mode === '0') return closeLabel;
  return deviceName;
}

export function getPortScanProtectionLabel(
  mode,
  allowPortScan,
  allowLabel = 'Cho phép',
  closeLabel = 'Đóng'
) {
  if (mode === '0') return closeLabel;
  return `[${allowLabel}] ${allowPortScan}`;
}

export function getFlashLabel(value, allowLabel = 'Cho phép', blockLabel = 'Đóng') {
  switch (value) {
    case 'allow':
      return allowLabel;
    case 'block':
      return blockLabel;
    default:
      return 'undefined';
  }
}

export function getSpeechVoiceLabel(value, noiseLabel = 'Noise', closeLabel = 'Đóng') {
  switch (value) {
    case '1':
      return noiseLabel;
    case '0':
      return closeLabel;
    default:
      return 'undefined';
  }
}

export function getClientRectsLabel(value, noiseLabel = 'Noise', closeLabel = 'Đóng') {
  switch (value) {
    case '1':
      return noiseLabel;
    case '0':
      return closeLabel;
    default:
      return 'undefined';
  }
}

export function getMediaDevicesLabel(value, noiseLabel = 'Noise', closeLabel = 'Đóng') {
  switch (value) {
    case '1':
      return noiseLabel;
    case '0':
      return closeLabel;
    default:
      return 'undefined';
  }
}

export function getAudioContextLabel(value, noiseLabel = 'Noise', closeLabel = 'Đóng') {
  switch (value) {
    case '1':
      return noiseLabel;
    case '0':
      return closeLabel;
    default:
      return 'undefined';
  }
}

export function getWebgMetadatalLabel(mode, render, closeLabel = 'Đóng') {
  if (mode === '0') return closeLabel;
  return render;
}

export function getWebGpuLabel(
  mode,
  matchLabel = 'Match WebGL',
  realLabel = 'Real',
  disableLabel = 'Disable'
) {
  if (mode === '1') return matchLabel;
  if (mode === '2') return realLabel;
  return disableLabel;
}

export function getWebglImageLabel(value, noiseLabel = 'Noise', closeLabel = 'Đóng') {
  switch (value) {
    case '1':
      return noiseLabel;
    case '0':
      return closeLabel;
    default:
      return 'undefined';
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function getWebGPUData(webgl_vendor) {
  let vendor;
  switch (webgl_vendor) {
    case 'ARM':
      vendor = 'arm';
      break;
    case 'Qualcomm':
      vendor = 'qualcomm';
      break;
    case 'Apple Inc.':
      vendor = 'apple';
      break;
    case 'Google Inc. (Apple)':
      vendor = 'apple';
      break;
    case 'Google Inc. (ATI Technologies Inc.)':
      vendor = 'apple';
      break;
    case 'Google Inc. (Intel Inc.)':
      vendor = 'intel';
      break;
    case 'Google Inc. (AMD)':
      vendor = 'amd';
      break;
    case 'Google Inc. (Intel)':
      vendor = 'intel';
      break;
    case 'Google Inc. (NVIDIA)':
      vendor = 'nvidia';
      break;
    default:
      vendor = 'intel';
  }

  const web_gpu_data_list = shuffleArray(WEB_GPU_DATA);
  const web_gpu_data = web_gpu_data_list.find(
    (item) => item.webgpu.gpu_adapterinfo_vendor === vendor
  );
  return web_gpu_data.webgpu;
}

export function getCanvasLabel(value, noiseLabel = 'Noise', closeLabel = 'Đóng') {
  switch (value) {
    case '1':
      return noiseLabel;
    case '0':
      return closeLabel;
    default:
      return 'undefined';
  }
}

export function getTimezoneLabel(
  isAutomatic,
  timezone,
  valueAutomatic = 'Kết hợp dựa trên IP',
  valueLocal = 'Múi giờ địa phương'
) {
  if (isAutomatic) return valueAutomatic;

  if (timezone === 'local') return valueLocal;

  return timezone;
}

export function getImagesLabel(value, allowLabel = 'Cho phép', blockLabel = 'Đóng') {
  switch (value) {
    case '1':
      return allowLabel;
    case '0':
      return blockLabel;
    default:
      return 'undefined';
  }
}

export function getLanguageLabel(value) {
  return languages.find((item) => item.value === value)?.label;
}

export function translateTimeSinceLastOpen(timeSince, language) {
  if (language === 'VN') {
    let timeSinceTranslated = timeSince
      .replace('hours', 'tiếng')
      .replace('hour', 'tiếng')
      .replace('minutes', 'phút')
      .replace('minute', 'phút')
      .replace('seconds', 'giây')
      .replace('second', 'giây')
      .replace('days', 'ngày')
      .replace('day', 'ngày')
      .replace('months', 'tháng')
      .replace('month', 'tháng')
      .replace('years', 'năm')
      .replace('year', 'năm');
    if (timeSinceTranslated) {
      timeSinceTranslated = `${timeSinceTranslated} trước`;
    }
    return timeSinceTranslated;
  }
  return timeSince;
}

export function getOsVersionId(os, version) {
  const OS_VERSION_MAP = {
    windows: WINDOW_VERSION,
    mac_os: MACOS_VERSION,
    linux: LINUX_VERSION,
    android: ANDROID_VERSION,
    ios: IOS_VERSION,
  };
  const versionArray = OS_VERSION_MAP[os];
  return versionArray?.find((item) => item.value.version === version)?.id || '';
}

export const isValidBase64 = (str) => {
  if (typeof str !== 'string') {
    return false;
  }

  const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;

  return str.length % 4 === 0 && base64Pattern.test(str);
};

export const decryptProxyTokenMktCity = (token) => {
  const salt = 'M!K!T@C!TY';
  const digest = CryptoJS.MD5(salt).toString();

  const combinedBytes = CryptoJS.enc.Base64.parse(token);

  const nonce = CryptoJS.lib.WordArray.create(combinedBytes.words.slice(0, 4), 16);
  const encryptedBytes = CryptoJS.lib.WordArray.create(
    combinedBytes.words.slice(4),
    combinedBytes.sigBytes - 16
  );

  const decryptedBytes = CryptoJS.AES.decrypt(
    { ciphertext: encryptedBytes },
    CryptoJS.enc.Hex.parse(digest),
    {
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.NoPadding,
      iv: nonce,
    }
  );

  const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

  return decryptedText;
};

export const exportResourceToFile = (data) => {
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `resource_${fDate(new Date(), 'HH-mm-dd-MM-yyyy')}.txt`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export function updateSelectedProfiles(selectedProfiles, updatedProfiles) {
  return selectedProfiles.map((profile) => {
    const updatedProfile = updatedProfiles.find((updated) => updated.id === profile.id);

    if (updatedProfile) {
      return updatedProfile;
    }

    return profile;
  });
}

export function transformKernelVersionToBrowserName(kernelVersion) {
  let name = '';
  if (kernelVersion.type === 'cbrowser') {
    name = `Chrome ${kernelVersion.kernel}`;
  } else {
    name = `Firefox ${kernelVersion.kernel}`;
  }
  return name;
}

// ----------------------------------------------------------------------

// eslint-disable-next-line react/prop-types
export function CircularProgressWithLabel({ value }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Box
        component="span"
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          border: '11px solid #333d49',
          borderRadius: '50%',
        }}
      />
      <CircularProgress variant="determinate" value={value} size={130} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography fontWeight={600} component="div">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export function getValueRuleset(rpaValue, variableMap, child) {
  if (rpaValue !== null && rpaValue !== undefined) {
    if (child.name === 'Range') {
      return {
        defaultMin: rpaValue.min,
        defaultMax: rpaValue.max,
      };
    }
    return {
      defaultValue: rpaValue,
    };
  }

  switch (child.name) {
    case 'Select':
      return {
        defaultValue: child?.config?.options.some(
          (option) => option.value === variableMap[child?.config?.variable?.id]
        )
          ? variableMap[child?.config?.variable?.id]
          : child?.config?.defaultValue || '',
      };

    case 'Range':
      return {
        defaultMin: variableMap[child?.config?.variable?.id]?.min,
        defaultMax: variableMap[child?.config?.variable?.id]?.max,
        ...(!variableMap[child?.config?.variable?.id]?.max &&
          !variableMap[child?.config?.variable?.id]?.min && {
            defaultMin: child?.config?.defaultMin,
            defaultMax: child?.config?.defaultMax,
          }),
      };

    default:
      return {
        defaultValue: variableMap[child?.config?.variable?.id] ?? child?.config?.defaultValue,
      };
  }
}
