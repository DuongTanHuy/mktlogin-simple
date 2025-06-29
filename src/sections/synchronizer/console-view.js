import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form/form-provider';
import Scrollbar from 'src/components/scrollbar';
import { isElectron } from 'src/utils/commom';
import { SYNC_OPERATOR_DATA } from 'src/utils/constance';
import { getStorage, removeStorage } from 'src/hooks/use-local-storage';
import { useLocales } from 'src/locales';
import WindowTab from './window-tab';
import TextTab from './text-tab';
import TabsTab from './tabs-tab';

const ConsoleView = ({
  displayScreens,
  profilesOpened,
  isSyncing,
  isOperator = false,
  handleOpenSynchronizerWindow,
  formData = {},
  textGroupData = [],
  mode = 'inline',
  tabActive,
}) => {
  const { t } = useLocales();
  const [alignment, setAlignment] = useState(tabActive || 'windows');
  const [textGroup, setTextGroup] = useState([
    { id: Math.random(), enterType: 'by_order', enterValue: '' },
  ]);
  const [_isSyncing, setIsSyncing] = useState(isSyncing);
  const ConsoleSchema = Yup.object().shape({});

  const defaultValues = {
    monitor: '',
    autoArrange: true,
    layout: 'grid',
    clickDelay: false,
    delay_click: 100,
    typingDelay: true,
    speed_type: 200,
    delay_type: 100,
    width: 0.001,
    height: 0.001,
    min: 0.001,
    max: 0.009,
    text: '',
    visit: '',
    link: true,
    x: 0,
    y: 0,
    w: 500,
    h: 640,
    hs: 0,
    vs: 0,
    row: 0,
  };

  const methods = useForm({
    resolver: yupResolver(ConsoleSchema),
    defaultValues,
  });

  useEffect(() => {
    if (tabActive) {
      setAlignment(tabActive);
    }
  }, [tabActive]);

  useEffect(() => {
    if (textGroupData.length > 0) {
      setTextGroup(textGroupData);
    }
  }, [textGroupData]);

  useEffect(() => {
    setIsSyncing(isSyncing);
  }, [isSyncing]);

  const { handleSubmit, setValue, watch } = methods;

  useEffect(() => {
    if (isElectron() && mode === 'outline') {
      window.ipcRenderer.on('store-operator-data', (event, arg) => {
        const operatorData = {
          formData: watch(),
          textGroupData: textGroup,
          profilesOpened,
          tabActive: alignment,
        };
        localStorage.setItem(SYNC_OPERATOR_DATA, JSON.stringify(operatorData));
        window.ipcRenderer.send('restore-operator');
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textGroup]);

  useEffect(() => {
    if (isElectron() && mode === 'outline') {
      window.ipcRenderer.on('start-sync', (event, arg) => {
        setIsSyncing(true);
      });

      window.ipcRenderer.on('stop-sync', (event, arg) => {
        setIsSyncing(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const syncData = getStorage(SYNC_OPERATOR_DATA);
    if (syncData?.formData) {
      Object.keys(syncData.formData).forEach((key) => {
        setValue(key, syncData.formData[key]);
      });
    }
    if (syncData?.textGroupData) {
      setTextGroup(syncData.textGroupData);
    }
    if (syncData?.tabActive) {
      setAlignment(syncData.tabActive);
    }
    removeStorage(SYNC_OPERATOR_DATA);
  }, [setValue]);

  useEffect(() => {
    setValue('row', profilesOpened.length);
  }, [profilesOpened, setValue]);

  useEffect(() => {
    if (formData) {
      Object.keys(formData).forEach((key) => {
        setValue(key, formData[key]);
      });
    }
  }, [formData, setValue]);

  useEffect(() => {
    if (displayScreens.length) {
      setValue('monitor', displayScreens[0].id, { shouldValidate: true });
    }
  }, [displayScreens, setValue]);

  const onSubmit = handleSubmit((data) => {
    try {
      if (isElectron()) {
        const profilesHandels = profilesOpened.map((item) => item.windowHandle);
        window.ipcRenderer.send('sort-profile-windows', { ...data, profilesHandels });
      }
    } catch (error) {
      /* empty */
    }
  });

  const handleChangeTab = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  const openSynchronizerWindow = () => {
    const data = watch();
    handleOpenSynchronizerWindow({
      formData: data,
      textGroup,
      tabActive: alignment,
    });
  };

  return (
    <Card
      sx={{
        height: 1,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
        border: (theme) => `dashed 1px ${theme.palette.divider}`,
        boxShadow: 'none',
      }}
    >
      <CardHeader
        title="Console"
        action={
          !isOperator && (
            <IconButton onClick={openSynchronizerWindow}>
              <Iconify
                icon="tabler:window-minimize"
                color="primary.main"
                width={22}
                sx={{
                  opacity: 0.7,
                }}
              />
            </IconButton>
          )
        }
      />
      <Scrollbar
        sx={{
          height: 'calc(100% - 60px)',
        }}
      >
        <CardContent>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack spacing={1}>
              <ToggleButtonGroup
                color="primary"
                value={alignment}
                exclusive
                onChange={handleChangeTab}
                aria-label="Platform"
                size="small"
                sx={{
                  display: 'flex',
                }}
              >
                <ToggleButton
                  sx={{
                    flex: 1,
                  }}
                  value="windows"
                >
                  <Iconify
                    icon="teenyicons:screen-solid"
                    width={12}
                    sx={{
                      mr: 0.5,
                    }}
                  />
                  {t('synchronizer.window.title')}
                </ToggleButton>
                <ToggleButton
                  sx={{
                    flex: 1,
                  }}
                  value="text"
                >
                  <Iconify
                    icon="material-symbols:text-ad"
                    width={16}
                    sx={{
                      mr: 0.5,
                    }}
                  />
                  {t('synchronizer.text.title')}
                </ToggleButton>
                <ToggleButton
                  sx={{
                    flex: 1,
                  }}
                  value="tabs"
                >
                  <Iconify
                    icon="material-symbols-light:tab-group-rounded"
                    width={16}
                    sx={{
                      mr: 0.5,
                    }}
                  />
                  {t('synchronizer.tabs.title')}
                </ToggleButton>
              </ToggleButtonGroup>

              {alignment === 'windows' && (
                <WindowTab displayScreens={displayScreens} isSyncing={_isSyncing} />
              )}

              {alignment === 'text' && (
                <TextTab
                  isSyncing={_isSyncing}
                  profilesOpened={profilesOpened}
                  textGroup={textGroup}
                  setTextGroup={setTextGroup}
                />
              )}

              {alignment === 'tabs' && <TabsTab isSyncing={_isSyncing} />}
            </Stack>
          </FormProvider>
        </CardContent>
      </Scrollbar>
    </Card>
  );
};

ConsoleView.propTypes = {
  displayScreens: PropTypes.array.isRequired,
  isSyncing: PropTypes.bool,
  isOperator: PropTypes.bool,
  handleOpenSynchronizerWindow: PropTypes.func,
  profilesOpened: PropTypes.array,
  formData: PropTypes.object,
  textGroupData: PropTypes.array,
  mode: PropTypes.string,
  tabActive: PropTypes.string,
};

export default ConsoleView;
