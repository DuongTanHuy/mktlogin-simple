import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  Container,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import { isElectron } from 'src/utils/commom';
import { LoadingButton } from '@mui/lab';
import { useTable } from 'src/components/table';
import { enqueueSnackbar } from 'notistack';
import { removeStorage, setStorage } from 'src/hooks/use-local-storage';
import { IS_SYNCING, IS_SYNC_OPERATOR_OPEN, PROFILE_IDS_SYNCING } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import SynchronizerTable from './synchronizer-table';
import FeedbackDialog from './feedback-dialog';
import SettingDialog from './setting-dialog';
import ConsoleView from './console-view';

const OPTIONS = [
  { id: 'sy_01', value: 'all', label: 'All groups' },
  { id: 'sy_02', value: 'ungrouped', label: 'Ungrouped' },
];

const SynchronizerView = ({ operator, isSyncing, profileIdsSyncing }) => {
  const { t } = useLocales();
  const settings = useSettingsContext();

  const [isOperator, setIsOperator] = useState(operator);
  const show = useMultiBoolean({
    feedback: false,
    setting: false,
  });
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  const syncStatus = useMultiBoolean({
    isStartingSync: false,
    isSyncing,
    isStoppingSync: false,
    isRestartingSync: false,
  });

  const [displayScreens, setDisplayScreens] = useState([]);

  const table = useTable({
    defaultSelected: profileIdsSyncing,
  });

  const notFound = !tableData.length && !loading;

  useEffect(() => {
    try {
      setLoading(true);
      if (isElectron()) {
        const getAllProfileOpened = async () => {
          const profilesOpened = await window.ipcRenderer.invoke('get-all-profiles-opened');
          if (!profilesOpened || !profilesOpened?.profiles) return;
          const updatedProfileOpened = profilesOpened.profiles.reduce((accumulator, item) => {
            accumulator.push({
              ...item,
              status: '',
            });
            return accumulator;
          }, []);

          let displayScreensTmp = [];
          if (profilesOpened?.primaryDisplay) {
            displayScreensTmp.push({ ...profilesOpened.primaryDisplay, type: 'primary' });
          }
          if (profilesOpened?.displaysExtends) {
            displayScreensTmp = [
              ...displayScreensTmp,
              ...profilesOpened.displaysExtends.map((item) => ({ ...item, type: 'extended' })),
            ];
          }
          setDisplayScreens(displayScreensTmp);
          setTableData(updatedProfileOpened);
        };
        getAllProfileOpened();
      }
      setTableData([]);
    } catch (error) {
      /* empty */
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isElectron() && window.ipcRenderer) {
      window.ipcRenderer.on('close-sync-operator', (event, value) => {
        setIsOperator(false);
        removeStorage(IS_SYNC_OPERATOR_OPEN);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderDialog = (
    <>
      <FeedbackDialog open={show.value.feedback} onClose={() => show.onFalse('feedback')} />
      <SettingDialog open={show.value.setting} onClose={() => show.onFalse('setting')} />
    </>
  );

  const handleStartSync = async () => {
    if (table.selected.length === 0) {
      enqueueSnackbar('Please select at least one profile', { variant: 'warning' });
      return;
    }

    syncStatus.onTrue('isStartingSync');
    const profilesHandels = tableData
      .filter((item) => table.selected.includes(item.id))
      .map((item) => item.windowHandle);
    if (profilesHandels.length > 0 && isElectron()) {
      await window.ipcRenderer.invoke('start-synchronize', { profilesHandels });
      syncStatus.onFalse('isStartingSync');
      syncStatus.onTrue('isSyncing');
      setStorage(IS_SYNCING, true);
      setStorage(PROFILE_IDS_SYNCING, table.selected);
      window.ipcRenderer.send('start-sync');
    }
  };

  const handleRestartSync = async () => {
    const profilesHandels = tableData.map((item) => item.windowHandle);
    if (profilesHandels.length > 0 && isElectron()) {
      syncStatus.onTrue('isRestartingSync');
      await window.ipcRenderer.invoke('restart-synchronize');
      syncStatus.onFalse('isRestartingSync');
    }
  };

  const handleStopSync = async () => {
    syncStatus.onTrue('isStoppingSync');
    if (isElectron()) {
      await window.ipcRenderer.invoke('stop-synchronize');
      syncStatus.onFalse('isStoppingSync');
      syncStatus.onFalse('isSyncing');
      removeStorage(IS_SYNCING);
      removeStorage(PROFILE_IDS_SYNCING);
      window.ipcRenderer.send('stop-sync');
    }
  };

  const handleOpenSynchronizerWindow = (data) => {
    if (isElectron() && window.ipcRenderer) {
      window.ipcRenderer.send('open-operator', {
        displayScreens,
        profilesOpened: tableData,
        isSyncing: syncStatus.value.isSyncing,
        formData: data.formData,
        textGroupData: data.textGroup,
        tabActive: data.tabActive,
      });
      setIsOperator(true);
      setStorage(IS_SYNC_OPERATOR_OPEN, true);
    }
  };

  const handleRestoreSynchronizerWindow = () => {
    if (isElectron() && window.ipcRenderer) {
      window.ipcRenderer.send('prepare-restore-operator');
    }
  };

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        height: '100%',
        overflow: 'hidden',
        px: '0px!important',
      }}
    >
      <Stack spacing={2} height={1} pt={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2}>
            <TextField select fullWidth size="small" name="method" defaultValue="all">
              {OPTIONS.map((item) => (
                <MenuItem key={item.id} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
            {syncStatus.value.isSyncing ? (
              <LoadingButton
                loading={syncStatus.value.isStoppingSync}
                loadingPosition="start"
                variant="contained"
                color="error"
                startIcon={<Iconify icon="material-symbols:not-started-rounded" />}
                sx={{
                  flexShrink: 0,
                }}
                onClick={handleStopSync}
              >
                {t('synchronizer.actions.stopSync')}
              </LoadingButton>
            ) : (
              <LoadingButton
                loading={syncStatus.value.isStartingSync}
                loadingPosition="start"
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="material-symbols:not-started-rounded" />}
                sx={{
                  flexShrink: 0,
                }}
                onClick={handleStartSync}
              >
                {t('synchronizer.actions.startSync')}
              </LoadingButton>
            )}
            <LoadingButton
              loading={syncStatus.value.isRestartingSync}
              variant="outlined"
              startIcon={<Iconify icon="solar:restart-circle-bold" />}
              sx={{
                flexShrink: 0,
              }}
              onClick={handleRestartSync}
            >
              {t('synchronizer.actions.restart')}
            </LoadingButton>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="text"
              startIcon={<Iconify icon="ic:baseline-feedback" />}
              onClick={() => show.onTrue('feedback')}
            >
              {t('synchronizer.actions.submitFeedback')}
            </Button>
            <IconButton onClick={() => show.onTrue('setting')}>
              <Iconify icon="ant-design:setting-filled" />
            </IconButton>
          </Stack>
        </Stack>
        <Grid
          container
          spacing={2}
          sx={{
            height: 1,
            overflow: 'hidden',
            pb: 1,
          }}
        >
          <Grid item md={isOperator ? 10 : 8} height={1}>
            <SynchronizerTable
              tableData={tableData}
              loading={loading}
              notFound={notFound}
              table={table}
            />
          </Grid>
          <Grid item md={isOperator ? 2 : 4} height={1}>
            {isOperator ? (
              <Card
                sx={{
                  height: 1,
                  bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                  border: (theme) => `dashed 1px ${theme.palette.divider}`,
                  boxShadow: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 2,
                  rowGap: 2,
                }}
              >
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={handleRestoreSynchronizerWindow}
                >
                  {t('synchronizer.actions.restore')}
                </Button>
                <Typography color="text.secondary" textAlign="center">
                  {t('synchronizer.restoreNote')}
                </Typography>
              </Card>
            ) : (
              <ConsoleView
                displayScreens={displayScreens}
                isOperator={isOperator}
                handleOpenSynchronizerWindow={handleOpenSynchronizerWindow}
                isSyncing={syncStatus.value.isSyncing}
                profilesOpened={tableData}
              />
            )}
          </Grid>
        </Grid>
      </Stack>
      {renderDialog}
    </Container>
  );
};

SynchronizerView.propTypes = {
  operator: PropTypes.bool,
  isSyncing: PropTypes.bool,
  profileIdsSyncing: PropTypes.array,
};

export default SynchronizerView;
