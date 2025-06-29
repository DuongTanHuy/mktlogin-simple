import PropTypes from 'prop-types';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { bgGradient } from 'src/theme/css';
import React, { useCallback, useState } from 'react';
import Iconify from 'src/components/iconify';
import PositionedMenu from 'src/components/list-click';
import Scrollbar from 'src/components/scrollbar';
import { useBoolean } from 'src/hooks/use-boolean';
import eventBus from 'src/sections/script/event-bus';
import { useAuthContext } from 'src/auth/hooks';
import { isElectron } from 'src/utils/commom';
import { debounce } from 'lodash';

const TABS = [
  {
    value: 'options',
    label: 'Options',
    icon: <Iconify icon="ion:options-sharp" width={24} />,
  },
  // {
  //   value: 'settings',
  //   label: 'Settings',
  //   icon: <Iconify icon="lets-icons:setting-alt-fill" width={24} />,
  // },
  {
    value: 'note',
    label: 'Note',
    icon: <Iconify icon="mage:note-text-fill" width={24} />,
  },
];

export default function GeneralFormDialog({ open, IdNode, OptionsTab, formData, ...other }) {
  const [currentTab, setCurrentTab] = useState('options');
  const theme = useTheme();
  const { flowAutomation, updateFlowAutomation } = useAuthContext();

  const [sleepTime, setSleepTime] = useState(0);
  const [timeout, setTimeout] = useState(30);
  const [nodeStatus, setNodeStatus] = useState(true);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const handleClose = () => {
    setCurrentTab('options');
    updateFlowAutomation({
      status: 'list',
      typeForm: null,
      nodeId: flowAutomation.nodeId,
      updateNodeForm: Math.random(),
    });
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{
                ...bgGradient({
                  direction: 'to top',
                  startColor: alpha(theme.palette.primary.light, 0.6),
                  endColor: alpha(theme.palette.primary.main, 0.6),
                }),
                width: 46,
                height: 46,
                borderRadius: 1,
              }}
            >
              <Iconify icon={formData?.data?.icon} width={26} />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Typography variant="h5">{formData?.data?.name}</Typography>

              {formData?.data?.guildUrl && (
                <Tooltip title="Nhấn để mở tài liệu">
                  <Iconify
                    color="text.secondary"
                    icon="mi:circle-warning"
                    width={18}
                    sx={{
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (isElectron()) {
                        window.ipcRenderer.send('open-external', formData?.data?.guildUrl);
                      } else {
                        window.open(formData?.data?.guildUrl, '_blank', 'noopener noreferrer');
                      }
                    }}
                  />
                </Tooltip>
              )}
            </Stack>
          </Stack>
          <IconButton onClick={handleClose}>
            <Iconify icon="ion:close" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mx: 3,
          mb: { xs: 2, md: 3 },
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {TABS.map((tab, index) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>
      <DialogContent
        sx={{
          typography: 'body2',
          px: 1,
          pb: 3,
          height: '500px',
        }}
      >
        <Scrollbar
          autoHide={false}
          sx={{
            px: 2,
            height: '100%',
          }}
        >
          {currentTab === 'options' &&
            (OptionsTab ? (
              <OptionsTab formData={formData || {}} IdNode={IdNode || ''} {...other} />
            ) : (
              <Typography color="text.secondary">No options</Typography>
            ))}

          {currentTab === 'settings' && (
            <Stack spacing={2}>
              <SettingInput
                name="sleep_time"
                label="Sleep time (seconds) before run this node (0 to disable)"
                value={sleepTime}
                onChange={(event) => setSleepTime(event.target.value)}
                IdNode={IdNode}
              />
              <SettingInput
                name="timeout"
                label="Timeout (seconds) runtime for this node (0 to disable)"
                value={timeout}
                onChange={(event) => setTimeout(event.target.value)}
                IdNode={IdNode}
              />
              <FormControl>
                <RadioGroup
                  row
                  value={nodeStatus}
                  onChange={(event) => setNodeStatus(event.target.value)}
                >
                  <FormControlLabel value="success" control={<Radio />} label="Success node" />
                  <FormControlLabel value="fail" control={<Radio />} label="Fail node" />
                </RadioGroup>
              </FormControl>
            </Stack>
          )}

          {currentTab === 'note' && (
            <Stack>
              <TextField
                onChange={debounce((event) => {
                  const { value } = event.target;
                  eventBus.emit('updateNode', { data: { note: value }, idNode: IdNode });
                }, 500)}
                defaultValue={formData?.dataFields?.note || ''}
                placeholder="Write your note here..."
                multiline
                rows={6}
              />
            </Stack>
          )}
        </Scrollbar>
      </DialogContent>
    </Dialog>
  );
}

GeneralFormDialog.propTypes = {
  IdNode: PropTypes.string,
  open: PropTypes.bool,
  OptionsTab: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
  formData: PropTypes.object,
};

function SettingInput({ name, label, value, onChange, IdNode, ...other }) {
  const variableModal = useBoolean();
  const getVariable = (n, item) => {
    eventBus.emit('updateNode', { data: { [n]: `\${${item.key}}` }, idNode: IdNode });
  };

  return (
    <Stack spacing={1}>
      <Typography color="text.secondary">{label}</Typography>
      <TextField
        onChange={onChange}
        value={value}
        InputProps={{
          endAdornment: (
            <PositionedMenu
              name={name}
              getVariable={getVariable}
              openVariableModal={variableModal.onTrue}
              handleSelectVariable={(variableName) =>
                onChange({ target: { name, value: `\${${variableName}}` } })
              }
            />
          ),
        }}
        {...other}
      />
    </Stack>
  );
}

SettingInput.propTypes = {
  name: PropTypes.string,
  IdNode: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.number,
  onChange: PropTypes.func,
};
