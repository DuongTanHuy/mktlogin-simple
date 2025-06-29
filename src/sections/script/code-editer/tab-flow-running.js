import React, { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { styled, alpha } from '@mui/material/styles';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Stack,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
} from '@mui/material';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
// theme
import { bgGradient } from 'src/theme/css';
import Iconify from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import { useSettingsContext } from 'src/components/settings';
import { isElectron } from 'src/utils/commom';
import { useAuthContext } from 'src/auth/hooks';
import { Virtuoso } from 'react-virtuoso';
import { useLocales } from 'src/locales';
import Scrollbar from '../../../components/scrollbar';
import { getLogColor, getLogStatus } from '../../../utils/rpa';
import { appendVariableState } from '../../../utils/local-storage';
import { getStorage } from '../../../hooks/use-local-storage';

const styleTab = {
  minWidth: 'auto',
  fontSize: '16px',
  fontWeight: 'inherit',
  textTransform: 'none',
  margin: '0',
  borderRadius: '0',
  borderLeft: '1px solid transparent',
  borderRight: '1px solid transparent',
  borderBottom: '1px solid transparent',
  marginRight: '15px',
};

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 12,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      ...bgGradient({
        startColor: theme.palette.primary.light,
        endColor: theme.palette.primary.main,
      }),
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      ...bgGradient({
        startColor: theme.palette.primary.light,
        endColor: theme.palette.primary.main,
      }),
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    borderRadius: 1,
    backgroundColor: theme.palette.divider,
  },
}));

function TabFlowRunning({
  handleCloseOutput,
  handleFillScreen,
  sizes,
  outputLogs,
  clearOutputLogs,
  table,
  nodes = [],
  edges = [],
  onFocusNode,
  handleHighlightNode,
  nodeSelected,
  setNodeSelected,
  executeNode,
  onChangeExecuteNode,
  executeFinish,
  setExecuteFinish,
}) {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const { debugMode } = useSettingsContext();
  const scrollRef = useRef(null);
  const [value, setValue] = useState(debugMode ? 1 : 0);

  const { variableFlow } = useAuthContext();
  const [variableState, setVariableState] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (variableFlow?.list) {
      setVariableState(variableFlow.list);
    }
  }, [variableFlow?.list]);

  useEffect(() => {
    if (isElectron()) {
      window.ipcRenderer.on('log-node-running', (event, data) => {
        appendVariableState({
          node_id: data?.node_id,
          variable_states: data?.variable_states,
        });
        showVariableState(data?.variable_states);
        const currentNode = nodes.find((node) => node.id === data?.node_id);
        const variableStates = getStorage('variableState') || [];
        const variableStateLast = variableStates[variableStates.length - 2]; // ở trên append rồi nên lấy -2
        if (currentNode && variableStateLast?.node_id !== currentNode?.id) {
          onChangeExecuteNode((prev) => [...prev, currentNode]);
          handleHighlightNode(data?.node_id);
        }
      });
    }

    return () => {
      if (isElectron()) {
        window.ipcRenderer.removeAllListeners('log-node-running');
      }
    };
  }, [edges, handleHighlightNode, nodes, onChangeExecuteNode]);

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      scrollRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, [outputLogs]);

  const getVariable = (nodeIndex) => {
    const variableStates = getStorage('variableState') || [];
    const variableStateCurrent = variableStates.find((_, index) => index === nodeIndex);
    return variableStateCurrent?.variable_states || {};
  };

  const showVariableState = (data) => {
    if (!data) return;
    setVariableState((prev) => {
      const newState = prev.map((item) => {
        let _value = '';
        if (typeof data[item.key] === 'object') {
          _value = JSON.stringify(data[item.key]);
        } else {
          _value = data[item.key];
        }
        return {
          ...item,
          value: _value,
        };
      });
      return newState;
    });
  };

  const [activeStep] = useState(999999);

  // useEffect(() => {
  //   const nodeMap = {};
  //   nodes?.forEach((node) => {
  //     nodeMap[node.id] = node;
  //   });

  //   const edgeMap = {};
  //   edges?.forEach((edge) => {
  //     if (!edgeMap[edge.source]) {
  //       edgeMap[edge.source] = [];
  //     }
  //     edgeMap[edge.source].push(edge.target);
  //   });

  //   setSortedNodes(sortNode('start_node', nodeMap, edgeMap));
  // }, [edges, nodes]);

  const handleNextStep = () => {
    if (isElectron()) {
      window.ipcRenderer.send('next-step-runner');
    }
  };

  const handleResume = () => {
    if (isElectron()) {
      window.ipcRenderer.send('continue-runner');
    }
  };

  const handleStopBreakpoint = () => {
    if (isElectron()) {
      window.ipcRenderer.invoke('stop-script-editor');
    }
  };

  useEffect(() => {
    if (isElectron()) {
      window.ipcRenderer.on('workflow-end', (_, data) => {
        setExecuteFinish(true);
      });
    }
    return () => {
      if (isElectron()) {
        window.ipcRenderer.removeAllListeners('workflow-end');
      }
    };
  }, [setExecuteFinish]);

  return (
    <>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        sx={[
          {
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
            height: '25px',
            minHeight: '40px',
            paddingLeft: '15px',
            bgcolor: (theme) => theme.palette.grey[settings.themeMode === 'dark' ? 900 : 0],
            '.MuiTabs-scrollButtons': {
              display: 'none',
            },
          },
        ]}
      >
        <Tab label={t('workflow.log')} style={styleTab} />
        <Tab label={t('workflow.debug')} style={styleTab} />
      </Tabs>
      <Box
        sx={{
          position: 'absolute',
          top: '0',
          right: '0',
        }}
      >
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
          <IconButton
            style={{ borderRadius: 0 }}
            onClick={() => handleFillScreen(sizes[0] !== 0 ? 'full' : 'less')}
          >
            <Iconify width={17} icon={sizes[0] === 0 ? 'formkit:down' : 'formkit:up'} />
          </IconButton>
          <IconButton style={{ borderRadius: 0 }} onClick={handleCloseOutput}>
            <Iconify width={17} icon="iconamoon:close-fill" />
          </IconButton>
          {value === 0 && (
            <Button
              size="small"
              variant="outlined"
              sx={{
                width: '70px',
                position: 'absolute',
                top: '50px',
                right: '10px',
                zIndex: '999',
                color: 'text.secondary',
              }}
              onClick={clearOutputLogs}
            >
              Clear
            </Button>
          )}
        </Stack>
      </Box>
      <Scrollbar ref={scrollRef} sx={{ height: 'calc(100% - 48px)' }}>
        <Box px={2}>
          {value === 0 && (
            <Stack
              sx={{
                fontSize: '12px',
                fontWeight: '200',
                paddingRight: '60px',
                userSelect: 'text',
              }}
            >
              {outputLogs.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    fontSize: '13px',
                    whiteSpace: 'pre-line',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: getLogColor(item.type),
                      display: 'inline-block',
                    }}
                  >
                    {getLogStatus(item.type)}
                  </Typography>
                  &nbsp; &nbsp;{`${item.message}`}
                </Box>
              ))}
            </Stack>
          )}

          <Stack
            spacing={3}
            height="auto"
            pt={2}
            sx={{
              ...(value !== 1 && {
                display: 'none',
              }),
            }}
          >
            {debugMode && (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon="material-symbols:resume" color="primary.main" />}
                  onClick={handleResume}
                >
                  Resume
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon="fluent:arrow-next-16-filled" color="success.main" />}
                  onClick={handleNextStep}
                >
                  Next
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon="ic:round-stop" color="error.main" />}
                  onClick={handleStopBreakpoint}
                >
                  Stop
                </Button>
              </Stack>
            )}

            {executeNode.length !== 0 && (
              <ExecuteList
                executeNode={
                  executeFinish
                    ? [
                        ...executeNode,
                        {
                          ...executeNode[executeNode.length - 1],
                          data: {
                            name: 'Kết thúc',
                            icon: 'noto-v1:stop-sign',
                          },
                        },
                      ]
                    : executeNode
                }
                activeStep={activeStep}
                onFocusNode={onFocusNode}
                handleHighlightNode={handleHighlightNode}
                setNodeSelected={setNodeSelected}
                showVariableState={showVariableState}
                getVariable={getVariable}
                nodeSelected={nodeSelected}
              />
            )}

            <Stack
              sx={{
                borderRadius: 1,
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                padding: 2,
                overflow: 'auto',
              }}
              spacing={2}
            >
              <Typography>Giá trị của biến</Typography>

              <Box
                sx={{
                  display: 'grid',
                  whiteSpace: 'nowrap',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 2,
                }}
              >
                {variableState.map((item) =>
                  item.type === 'range' ? (
                    <Stack key={item.key} direction="row" spacing={1}>
                      <TextField size="small" label="Min" value={item?.value?.min ?? ''} />
                      <TextField size="small" label="Max" value={item?.value?.max ?? ''} />
                    </Stack>
                  ) : (
                    <TextField
                      key={item.key}
                      size="small"
                      label={item.key}
                      value={item?.value ?? ''}
                      title={item.value?.toString()}
                    />
                  )
                )}
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Scrollbar>
      <IconButton
        sx={{
          position: 'absolute',
          p: 0.5,
          bottom: 10,
          right: 18,
          ...(scrollRef.current?.scrollHeight === scrollRef.current?.clientHeight && {
            display: 'none',
          }),
        }}
        color="default"
        onClick={() => {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }}
      >
        <Iconify icon="ei:arrow-down" width={30} />
      </IconButton>
    </>
  );
}

const areEqual = (prevProps, nextProps) =>
  prevProps.sizes === nextProps.sizes &&
  prevProps.outputLogs === nextProps.outputLogs &&
  prevProps.table === nextProps.table &&
  prevProps.nodes.length === nextProps.nodes.length &&
  prevProps.edges === nextProps.edges &&
  prevProps.executeNode === nextProps.executeNode &&
  prevProps.executeFinish === nextProps.executeFinish &&
  prevProps.nodeSelected === nextProps.nodeSelected;

export default memo(TabFlowRunning, areEqual);

TabFlowRunning.propTypes = {
  handleCloseOutput: PropTypes.func,
  handleFillScreen: PropTypes.func,
  sizes: PropTypes.array,
  outputLogs: PropTypes.array,
  table: PropTypes.array,
  onFocusNode: PropTypes.func,
  clearOutputLogs: PropTypes.func,
  handleHighlightNode: PropTypes.func,
  nodes: PropTypes.array,
  edges: PropTypes.array,
  nodeSelected: PropTypes.string,
  setNodeSelected: PropTypes.func,
  executeNode: PropTypes.array,
  onChangeExecuteNode: PropTypes.func,
  executeFinish: PropTypes.bool,
  setExecuteFinish: PropTypes.func,
};

// --------------------------------------------

const ExecuteList = React.memo(
  ({
    executeNode,
    activeStep,
    onFocusNode,
    handleHighlightNode,
    setNodeSelected,
    showVariableState,
    getVariable,
    nodeSelected,
  }) => (
    <Stack alignItems="start" py={0.5} overflow="auto" mx={-2}>
      <Virtuoso
        id="virtual-custom"
        components={{
          // eslint-disable-next-line react/no-unstable-nested-components
          List: React.forwardRef((props, ref) => (
            <Stepper
              alternativeLabel
              activeStep={activeStep}
              connector={<ColorlibConnector />}
              ref={ref}
              sx={{
                width: `${executeNode.length * 110}px`,
              }}
              {...props}
            />
          )),
          // eslint-disable-next-line react/no-unstable-nested-components
          Item: React.forwardRef((props, ref) => (
            <Step
              ref={ref}
              sx={{
                minWidth: '110px',
                width: '110px',
                px: '0px!important',
              }}
              {...props}
            />
          )),
        }}
        style={{
          width: '100%',
          height: '80px',
        }}
        horizontalDirection
        data={executeNode}
        itemContent={(index, node) => (
          <StepLabel
            key={index}
            StepIconComponent={(props) => (
              <ColorlibStepIcon
                onClick={() => {
                  onFocusNode(node?.id);
                  handleHighlightNode(node?.id);
                  setNodeSelected(`${node?.id}-${index}`);
                  showVariableState(getVariable(index));
                }}
                {...props}
                icon={node?.data?.icon}
              />
            )}
            sx={{
              '& .MuiStepLabel-label': {
                mt: '8px!important',
                color: `${node?.id}-${index}` === nodeSelected ? 'primary.main' : 'text.primary',
              },
            }}
          >
            {node?.data?.name}
          </StepLabel>
        )}
      />
    </Stack>
  ),
  (prevProps, nextProps) =>
    prevProps.executeNode === nextProps.executeNode &&
    prevProps.nodeSelected === nextProps.nodeSelected
);

ExecuteList.propTypes = {
  onFocusNode: PropTypes.func,
  handleHighlightNode: PropTypes.func,
  nodeSelected: PropTypes.string,
  setNodeSelected: PropTypes.func,
  executeNode: PropTypes.array,
  activeStep: PropTypes.number,
  showVariableState: PropTypes.func,
  getVariable: PropTypes.func,
};

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  zIndex: 1,
  width: 26,
  height: 26,
  padding: 6,
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.disabled,
  backgroundColor:
    theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
  ...(ownerState.active && {
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    color: theme.palette.common.white,
    ...bgGradient({
      startColor: theme.palette.primary.light,
      endColor: theme.palette.primary.main,
    }),
  }),
  ...(ownerState.completed && {
    color: theme.palette.common.white,
    ...bgGradient({
      startColor: theme.palette.primary.light,
      endColor: theme.palette.primary.main,
    }),
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon, onClick } = props;

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.1s linear',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      }}
    >
      <Iconify icon={icon} width={14} />
    </ColorlibStepIconRoot>
  );
}

ColorlibStepIcon.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  completed: PropTypes.bool,
  icon: PropTypes.string,
  onClick: PropTypes.func,
};
