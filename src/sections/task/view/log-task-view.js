import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
// mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Container,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { useLocales } from 'src/locales';
import { useParams } from 'react-router';

import OutputTab from '../output-tab';
import LogProfileTab from '../log-profile-tab';
import { getLogColor, getLogStatus } from '../../../utils/rpa';
import { isElectron } from '../../../utils/commom';

//----------------------------------

const LogTaskView = ({ taskData }) => {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const [currentTab, setCurrentTab] = useState('output');
  const [logByProfiles, setLogByProfiles] = useState([]);
  const [logsData, setLogsData] = useState([]);
  const [taskLogData, setTaskLogData] = useState({});
  const { id } = useParams();

  const refreshTaskLogData = useCallback(() => {
    window.ipcRenderer.invoke('get-data-detail', id).then((data) => {
      setTaskLogData(data.detail);
      setLogByProfiles(data.log_task_profile_detail);
      setLogsData(data.log_task_profile);
    });
  }, [id]);

  useEffect(() => {
    if (isElectron()) {
      refreshTaskLogData();
    }
  }, [refreshTaskLogData]);

  const displayStatus = (status) => {
    switch (status) {
      case 'Done':
        return (
          <Label
            variant="soft"
            color="success"
            sx={{
              padding: '16px 16px',
            }}
          >
            {t('task.editLog.status.success')}
          </Label>
        );
      case 'failed':
        return (
          <Label variant="soft" color="error">
            {t('task.editLog.status.failed')}
          </Label>
        );
      default:
        return (
          <Label variant="soft" color="info">
            {t('task.editLog.status.running')}
          </Label>
        );
    }
  };

  const TABS = [
    {
      value: 'output',
      label: t('task.editLog.output'),
    },
    {
      value: 'logs',
      label: t('task.editLog.logs'),
    },
    {
      value: 'profile',
      label: t('task.editLog.profile'),
    },
  ];

  const HEADER = [
    {
      header: t('task.editLog.table.header.result'),
      value: 0,
    },
    {
      header: t('task.editLog.table.header.profile'),
      value: '1 of 1 handled',
    },
    {
      header: t('task.editLog.table.header.startAt'),
      value: taskLogData.created_at,
    },
    {
      header: t('task.editLog.table.header.duration'),
      value: taskLogData?.duration ?? '0ms',
    },
    {
      header: t('task.editLog.table.header.status'),
      value: displayStatus(taskLogData.status),
    },
  ];

  const handleChangeTab = (_, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <>
      <Stack direction="row" alignItems="flex-start">
        <IconButton component={RouterLink} href={paths.task.root}>
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>

        <Stack spacing={0.5}>
          <Stack spacing={1} direction="row" alignItems="center">
            <Typography variant="h6">{taskData.name}</Typography>
            <Label variant="soft" color="primary">
              {t('task.editLog.log')}
            </Label>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            {taskLogData.created_at}
          </Typography>
        </Stack>
      </Stack>
      <Container
        maxWidth={settings.themeStretch ? false : 'lg'}
        sx={{
          height: '84vh',
          position: 'relative',
          '&.MuiContainer-root': {
            px: 5,
          },
        }}
      >
        <Stack
          sx={{
            mt: 2,
            height: 'calc(100% - 100px)',
            ...(currentTab !== 'output' && {
              height: 'calc(100% - 30px)',
            }),
          }}
          spacing={2}
        >
          <Card
            sx={{
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
              border: (theme) => `dashed 1px ${theme.palette.divider}`,
              boxShadow: 'none',
              flexShrink: 0,
            }}
          >
            {/* <CardHeader
              title={
                <Label variant="soft" color="primary">
                  Finished
                </Label>
              }
            /> */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              px={10}
              py={3}
            >
              {HEADER.map((item, index) => (
                <CustomColumn key={index} header={item.header} value={item.value} />
              ))}
            </Stack>
          </Card>
          <Card
            sx={{
              height: 1,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
              border: (theme) => `dashed 1px ${theme.palette.divider}`,
              boxShadow: 'none',
              p: 3,
              pb: 1,
              pt: 1,
              pr: 0,
            }}
          >
            <Tabs
              value={currentTab}
              onChange={handleChangeTab}
              sx={{
                boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
                mr: 3,
              }}
            >
              {TABS.map((tab) => (
                <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
              ))}
            </Tabs>
            <Stack
              sx={{
                mt: 2,
                height: 'calc(100% - 60px)',
              }}
            >
              {currentTab === 'output' && <OutputTab tableData={[]} />}

              {currentTab === 'logs' && (
                <Stack
                  sx={{
                    fontSize: '12px',
                    fontWeight: '200',
                    overflowY: 'auto',
                    paddingRight: '60px',
                  }}
                >
                  {logsData.map((log, index) => (
                    <Box key={index}>
                      <Typography
                        variant="body2"
                        sx={{
                          display: 'inline-block',
                          fontSize: '0.875rem',
                        }}
                      >
                        {`[${log.created_at}]`}
                      </Typography>
                      &nbsp;
                      <Typography
                        variant="body2"
                        sx={{
                          color: getLogColor(log.type),
                          display: 'inline-block',
                          fontSize: '0.875rem',
                        }}
                      >
                        {`${getLogStatus(log.type)}`}
                      </Typography>
                      &nbsp;
                      <Typography
                        variant="body2"
                        sx={{
                          display: 'inline-block',
                          fontSize: '0.875rem',
                        }}
                      >
                        {`[Hồ Sơ - ${log.profile_name}] : ${log.status}`}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}

              {currentTab === 'profile' && (
                <LogProfileTab
                  logByProfiles={logByProfiles}
                  setLogByProfiles={setLogByProfiles}
                  refreshTaskLogData={refreshTaskLogData}
                />
              )}
            </Stack>
          </Card>
          {currentTab === 'output' && (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                position: 'absolute',
                bottom: 24,
              }}
            >
              <LoadingButton
                type="submit"
                id="save-run"
                variant="contained"
                // loading={loading}
                color="primary"
                startIcon={<Iconify icon="uil:export" />}
              >
                {t('task.editLog.actions.export')}
              </LoadingButton>
              <LoadingButton
                type="submit"
                id="save"
                variant="outlined"
                startIcon={<Iconify icon="material-symbols:google-plus-reshare" />}
              >
                {t('task.editLog.actions.goToApp')}
              </LoadingButton>
            </Stack>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default LogTaskView;

LogTaskView.propTypes = {
  taskData: PropTypes.object,
};

function CustomColumn({ header, value }) {
  return (
    <Stack spacing={1}>
      <Typography color="text.secondary">{header}</Typography>
      <Typography variant="subtitle1">{value}</Typography>
    </Stack>
  );
}

CustomColumn.propTypes = {
  header: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.node]),
};
