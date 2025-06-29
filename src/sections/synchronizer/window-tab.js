import PropTypes from 'prop-types';

import { Button, Grid, MenuItem, Stack, Typography, alpha } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RHFRadioGroup, RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { useFormContext } from 'react-hook-form';
import { useLocales } from 'src/locales';

const WindowTab = ({ displayScreens, isSyncing }) => {
  const { t } = useLocales();
  const { watch } = useFormContext();
  const watchAutoArrange = watch('autoArrange');

  const LAYOUT_OPTIONS = [
    { value: 'grid', label: t('synchronizer.window.labels.grid') },
    { value: 'overlapped', label: t('synchronizer.window.labels.overlapped') },
  ];

  return (
    <>
      <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
        <Button
          startIcon={<Iconify icon="el:resize-horizontal" />}
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
        >
          {t('synchronizer.actions.uniformSize')}
        </Button>
        <Button
          startIcon={<Iconify icon="material-symbols-light:view-cozy-sharp" />}
          variant="outlined"
          color="primary"
          fullWidth
        >
          {t('synchronizer.actions.viewWindow')}
        </Button>
      </Stack>
      <Stack spacing={1} sx={{ mt: 4 }}>
        <Typography>{t('synchronizer.window.labels.windowLayout')}</Typography>
        <Stack
          spacing={2}
          sx={{
            p: 3,
            borderRadius: 1,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          }}
        >
          <CustomTab title={t('synchronizer.window.labels.monitor')}>
            <RHFSelect name="monitor" size="small">
              {displayScreens?.map((item) => {
                if (item.type === 'primary') {
                  return (
                    <MenuItem key={item.id} value={item.id}>
                      {`Primary screen (${item.size.width}x${item.size.height})`}
                    </MenuItem>
                  );
                }
                if (item.type === 'extended') {
                  return (
                    <MenuItem key={item.id} value={item.id}>
                      {`Extended screen (${item.size.width}x${item.size.height})`}
                    </MenuItem>
                  );
                }
                return (
                  <MenuItem key={item.id} value={item.id}>
                    {`Built-in screen (${item.size.width}x${item.size.height})`}
                  </MenuItem>
                );
              })}
            </RHFSelect>
          </CustomTab>
          <CustomTab title="">
            <RHFSwitch name="autoArrange" label={t('synchronizer.window.text')} />
          </CustomTab>
          {watchAutoArrange ? (
            <CustomTab title={t('synchronizer.window.labels.layout')}>
              <RHFRadioGroup row spacing={4} name="layout" options={LAYOUT_OPTIONS} />
            </CustomTab>
          ) : (
            <Stack spacing={1}>
              <Typography color="text.secondary">
                {t('synchronizer.window.labels.layout')}
              </Typography>
              <Stack
                p={2}
                spacing={2}
                sx={{
                  p: 3,
                  borderRadius: 1,
                  bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                }}
              >
                <CustomTab title={t('synchronizer.window.labels.position')}>
                  <Stack direction="row" spacing={1}>
                    <RHFTextField name="x" size="small" label="X" />
                    <RHFTextField name="y" size="small" label="Y" />
                  </Stack>
                </CustomTab>
                <CustomTab title={t('synchronizer.window.labels.size')}>
                  <Stack direction="row" spacing={1}>
                    <RHFTextField name="w" size="small" label="W" />
                    <RHFTextField name="h" size="small" label="H" />
                  </Stack>
                </CustomTab>
                <CustomTab title={t('synchronizer.window.labels.space')}>
                  <Stack direction="row" spacing={1}>
                    <RHFTextField name="hs" size="small" label="HS" />
                    <RHFTextField name="vs" size="small" label="VS" />
                  </Stack>
                </CustomTab>
                <CustomTab title={t('synchronizer.window.labels.number')}>
                  <RHFTextField
                    name="row"
                    size="small"
                    label={t('synchronizer.window.labels.row')}
                  />
                </CustomTab>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
      <Button
        startIcon={<Iconify icon="icon-park-solid:pause-one" />}
        variant="contained"
        color="primary"
        type="submit"
      >
        {`${
          watchAutoArrange
            ? t('synchronizer.actions.titleWindow')
            : t('synchronizer.actions.customLayout')
        }`}
      </Button>
    </>
  );
};

WindowTab.propTypes = {
  displayScreens: PropTypes.array.isRequired,
  isSyncing: PropTypes.bool,
};

export default WindowTab;

//-------------------------------------------------------------------------

function CustomTab({ title, children }) {
  return (
    <Grid container spacing={3} justifyContent="center" alignItems="center">
      <Grid item xs={3}>
        <Typography color="text.secondary">{title}</Typography>
      </Grid>
      <Grid item xs={9}>
        {children}
      </Grid>
    </Grid>
  );
}

CustomTab.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
};
