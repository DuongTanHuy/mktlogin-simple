import PropTypes from 'prop-types';
// mui
import { Grid, ListItemText, Stack, Typography } from '@mui/material';
import { RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { useEffect, useRef } from 'react';
import { useInitialSettingContext } from 'src/initial-setting/context/initial-setting-context';
import { useFormContext } from 'react-hook-form';

export default function RunConfigurationTab({ t }) {
  const appSettings = useInitialSettingContext();
  const { watch, setValue, getValues } = useFormContext();
  const originalWindowWidthRef = useRef(null);
  const watchNumberWindows = watch('rowLimitDisplay');
  const watchBrowserWidth = watch('windowWidth');
  const watchSpacing = watch('spacing');
  const watchScale = watch('scale');

  useEffect(() => {
    if (appSettings?.screen_size) {
      const screenWidth = appSettings.screen_size.width;
      const width = getValues('windowWidth');
      const space = getValues('spacing');
      const numWindows = Math.floor(screenWidth / (width + space));
      setValue('rowLimitDisplay', numWindows);
      setValue('screen_width', screenWidth);
    }
  }, [appSettings, getValues, setValue]);

  useEffect(() => {
    const screenWidth = getValues('screen_width');
    const spacing = getValues('spacing');
    const scale = getValues('scale');
    if (!screenWidth) return;
    const numWindows = Math.floor(
      screenWidth / (Number(watchBrowserWidth) * scale + Number(spacing))
    );
    setValue('rowLimitDisplay', numWindows);
    if (typeof watchBrowserWidth === 'string') {
      // nếu là string thì đây là thay đổi từ người dùng, number thì là thay đổi từ code
      originalWindowWidthRef.current = Number(watchBrowserWidth);
    }
  }, [watchBrowserWidth, getValues, setValue]);

  useEffect(() => {
    let spacing = 0;
    if (watchSpacing !== '') {
      spacing = Number(watchSpacing);
    }
    let browserWidth = originalWindowWidthRef.current;
    if (browserWidth === null) {
      originalWindowWidthRef.current = getValues('windowWidth');
      browserWidth = originalWindowWidthRef.current;
    }
    browserWidth -= spacing;
    setValue('windowWidth', browserWidth);
  }, [watchSpacing, getValues, setValue]);

  useEffect(() => {
    let scale = 0.8;
    if (watchScale !== '') {
      scale = Number(watchScale);
    }
    const screenWidth = getValues('screen_width');
    const spacing = getValues('spacing');
    const browserWidth = getValues('windowWidth');
    const numWindows = Math.floor(screenWidth / (Number(browserWidth) * scale + Number(spacing)));
    setValue('rowLimitDisplay', numWindows);
  }, [watchScale, getValues, setValue]);

  return (
    <Stack spacing={2}>
      <LittleTab title={t('dialog.rpa.tabs.runConfiguration.labels.numWindows')}>
        <Typography
          sx={{
            paddingLeft: 2,
          }}
        >
          {watchNumberWindows}
        </Typography>
      </LittleTab>

      <LittleTab title={t('dialog.rpa.tabs.runConfiguration.labels.windowSize')}>
        <Stack direction="row" spacing={3}>
          <RHFTextField
            name="windowWidth"
            size="small"
            type="number"
            placeholder={t('dialog.rpa.tabs.runConfiguration.fields.windowSize.width')}
          />
          <RHFTextField
            name="windowHeight"
            size="small"
            type="number"
            placeholder={t('dialog.rpa.tabs.runConfiguration.fields.windowSize.height')}
          />
        </Stack>
      </LittleTab>

      <LittleTab title={t('dialog.rpa.tabs.runConfiguration.labels.ratio')}>
        <RHFTextField
          name="scale"
          size="small"
          type="number"
          placeholder={t('dialog.rpa.tabs.runConfiguration.fields.scale')}
        />
      </LittleTab>

      <LittleTab title={t('dialog.rpa.tabs.runConfiguration.labels.spacing')}>
        <RHFTextField
          name="spacing"
          size="small"
          type="number"
          placeholder={t('dialog.rpa.tabs.runConfiguration.fields.spacing')}
        />
      </LittleTab>

      <LittleTab title={t('dialog.rpa.tabs.runConfiguration.labels.open_time_beetween_profiles')}>
        <ListItemText
          primary={
            <RHFTextField
              name="duration"
              size="small"
              type="number"
              placeholder={t('dialog.rpa.tabs.runConfiguration.fields.duration')}
            />
          }
          secondary="1000ms = 1s"
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled',
          }}
        />
      </LittleTab>

      <LittleTab title={t('dialog.rpa.tabs.runConfiguration.labels.num_thread')}>
        <ListItemText
          primary={
            <RHFTextField
              name="num_thread"
              size="small"
              type="number"
              placeholder={t('dialog.rpa.tabs.runConfiguration.fields.duration')}
            />
          }
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled',
          }}
        />
      </LittleTab>
      <LittleTab title={t('dialog.rpa.tabs.runConfiguration.labels.is_visual_mouse')}>
        <RHFSwitch
          name="is_visual_mouse"
        />
      </LittleTab>
    </Stack>
  );
}

RunConfigurationTab.propTypes = {
  t: PropTypes.func,
};

//----------------------------------------------------------------

function LittleTab({ title, children }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={3}>
        <Typography color="text.secondary" sx={{
          lineHeight: 2,
        }}>{title}</Typography>
      </Grid>
      <Grid item xs={9}>
        {children}
      </Grid>
    </Grid>
  );
}

LittleTab.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};
