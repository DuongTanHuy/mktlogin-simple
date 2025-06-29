import PropTypes from 'prop-types';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { RHFSwitch, RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { useLocales } from 'src/locales';
import { isElectron } from '../../utils/commom';

const TabsTab = ({ isSyncing }) => {
  const { t } = useLocales();

  const LIST_BUTTON = [
    { id: 'btn_same_tab', icon: 'ph:folder-fill', label: t('synchronizer.actions.sameTabs') },
    {
      id: 'btn_close_other_tab',
      icon: 'fa-solid:paste',
      label: t('synchronizer.actions.closeOtherTabs'),
    },
    {
      id: 'btn_close_current_tab',
      icon: 'typcn:location',
      label: t('synchronizer.actions.closeCurrentTab'),
    },
    {
      id: 'btn_close_blank_tab',
      icon: 'jam:screen-f',
      label: t('synchronizer.actions.closeBlankTabs'),
    },
  ];

  const sameTab = () => {
    if (isElectron()) {
      window.ipcRenderer.send('sam_tabs');
    }
  };

  const closeOtherTabs = () => {
    if (isElectron()) {
      window.ipcRenderer.send('close_other_tabs');
    }
  };

  const closeCurrentTab = () => {
    if (isElectron()) {
      window.ipcRenderer.send('close_current_tab');
    }
  };

  const closeBlankTabs = () => {
    if (isElectron()) {
      window.ipcRenderer.send('close_empty_tabs');
    }
  };

  const handleOpenUrl = (visitValue, linkValue) => {
    const links = visitValue.split("\n").map((link) => link.trim()).filter((link) => link !== '');
    if (isElectron()) {
      window.ipcRenderer.send('open-urls', {
        urls: links,
        is_newtab: linkValue
       });
    }
  }

  return (
    <>
      <Alert severity="info">{t('synchronizer.tabs.infoMess')}</Alert>
      <Stack spacing={1} flexWrap="wrap" direction="row">
        {LIST_BUTTON.map((item) => (
          <Button
            key={item.id}
            startIcon={<Iconify icon={item.icon} />}
            variant="outlined"
            color="primary"
            fullWidth
            disabled={!isSyncing}
            sx={{
              width: 'calc(50% - 8px)',
              '&.Mui-disabled': {
                pointerEvents: 'auto',
                cursor: 'not-allowed',
              },
            }}
            onClick={() => {
              if (item.id === 'btn_same_tab') {
                sameTab();
              } else if (item.id === 'btn_close_other_tab') {
                closeOtherTabs();
              } else if (item.id === 'btn_close_current_tab') {
                closeCurrentTab();
              } else if (item.id === 'btn_close_blank_tab') {
                closeBlankTabs();
              }
            }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>
      <Stack spacing={1}>
        <Typography>{t('synchronizer.tabs.labels.visitWebsite')}</Typography>
        <RHFTextField
          name="visit"
          placeholder={t('synchronizer.tabs.placeholder.visitWebsite')}
          multiline
          rows={4}
          sx={{
            '& ::-webkit-scrollbar': {
              width: '3px',
            },
            '& ::-webkit-scrollbar-thumb': {
              backgroundColor: (theme) => theme.palette.grey[700],
              borderRadius: '4px',
            },
          }}
        />
      </Stack>
      <RHFSwitch name="link" label={t('synchronizer.tabs.labels.toggle')} />
      <Button
        fullWidth
        variant="contained"
        color="primary"
        startIcon={<Iconify icon="ion:open" />}
        disabled={!isSyncing}
        sx={{
          '&.Mui-disabled': {
            pointerEvents: 'auto',
            cursor: 'not-allowed',
          },
        }}
        onClick={() => {
          const visitValue = document.querySelector('textarea[name="visit"]').value;
          const linkValue = document.querySelector('input[name="link"]').checked;
          handleOpenUrl(visitValue, linkValue);
        }}
      >
        {t('synchronizer.actions.open')}
      </Button>
    </>
  );
};

export default TabsTab;

TabsTab.propTypes = {
  isSyncing: PropTypes.bool,
};
