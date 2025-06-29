import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import dagre from 'dagre';
import { alpha, useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { generateRandomString, isElectron } from 'src/utils/commom';
import { useSettingsContext } from 'src/components/settings';
import {
  NodeFlowchartValidation,
  generateFields,
  getConnectedNodes,
  sortEdgesForLayoutAttempt,
} from 'src/utils/handle-bar-support';
import PropTypes from 'prop-types';

import CreateVariablesTemplate from 'src/sections/variables-template/create-template';

import {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import {
  ERROR_CODE,
  GROUP_INVISIBLE,
  IS_BROWSER_DOWNLOADING,
  WORKFLOW_CONFIG,
  WORKSPACE_ID,
} from 'src/utils/constance';
import { getWorkFlowDetail, updateWorkFlow } from 'src/api/workflow.api';
import { getStorage, removeStorage, setStorage } from 'src/hooks/use-local-storage';
import { enqueueSnackbar } from 'notistack';
import { useResponsive } from 'src/hooks/use-responsive';

import { useBoolean } from 'src/hooks/use-boolean';
import { useLocales } from 'src/locales';
import { Pane } from 'split-pane-react';
import SplitPane from 'split-pane-react/esm/SplitPane';
import {
  IconButton,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useEventListener } from 'src/hooks/use-event-listener';
import useUndoRedoFlow from 'src/hooks/use-undo-redo-flow';
import { flowchartOptions, getFlowchartValue } from 'src/utils/flow-chart-optoins';

import { LoadingScreen } from 'src/components/loading-screen';
import CustomMenuContext from 'src/components/custom-popover/custom-menu-context';
import { useAuthContext } from 'src/auth/hooks';
import ShareWorkflowDialog from 'src/components/custom-dialog/share-workflow-dialog';
import PublishWorkflowDialog from 'src/components/custom-dialog/publish-workflow-dialog';
import PendingWorkflowDialog from 'src/components/custom-dialog/pending-workflow-dialog';
import RejectedWorkflowDialog from 'src/components/custom-dialog/rejected-workflow-dialog';
import UpdateVersionDialog from 'src/components/custom-dialog/update-version-dialog';
import DownloadDialog from 'src/components/custom-dialog/download-dialog';
import Resource from 'src/components/resource';
import Variables from 'src/components/variable';
import TableDialog from 'src/components/custom-dialog/table-dialog';
import LogList from '../automation/log';
import RunningAutomation from '../automation/running';
import SettingAutomation from '../automation/setting';
import CustomNode from './components/custom-node';
import ConnectionLine from './components/connectionLine';

import eventBus from '../script/event-bus';
import CustomEdge from './components/custom-edge';
import customStartNode from './components/custom-start-node';
import customLoopNodeV2 from './components/custom-loop-node-v2';
import customLoopBreak from './components/custom-end-loop';
import customConditionNode from './components/custom-condition-node';
import customElementExistNode from './components/custom-element-exist-node';
import WorkflowEngine from './workflow-engine';
import FlowChartView from './flow-view';
import TabFlowRunning from '../script/code-editer/tab-flow-running';
import AddNewWorkflow from '../workspace/add-new-workflow';
import Sidebar from './components/sidebar';
import FlowButton from './flow-button';
import { checkRunWorkflowPermissionApi, getProfileByIdApi } from '../../api/profile.api';
import customConditionLoopNode from './components/custom-condition-loop-node';
import customCookieNode from './components/custom-cookie-node';
import ReadmeTab from '../script/readme-tab';
import WorkflowRunningConfig from './workflow-running-config';
import RunConfigTab from '../script/run-config-tab';
import { transformKernelVersionToBrowserName } from '../../utils/profile';
import { getKernelVersionByIdApi } from '../../api/cms.api';
import { initialGroup } from '../variables-template/mock';
import ButtonBar from './button-bar';
import './style.css';

// ----------------------------------------------------------------------

const isElectronEnv = isElectron();

const startNode = {
  id: 'start_node',
  type: 'start',
  data: { name: 'Start', icon: 'solar:play-bold', alias: 'start_node' },
  position: { x: 100, y: document.body.clientHeight / 2 - 80 },
};

const nodeTypes = {
  custom: CustomNode,
  start: customStartNode,
  // loop: customLoopNode,
  cookies: customCookieNode,
  condition_loop: customConditionLoopNode,
  loop: customLoopNodeV2,
  // while_loop: customWhileLoopNode,
  end_loop: customLoopBreak,
  conditions: customConditionNode,
  element_exists: customElementExistNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const getId = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;

export default function FlowView({ tabData, tabId }) {
  const sidebarFlowchart = getStorage('sidebar-size');
  const defaultGroupInVisible = getStorage(GROUP_INVISIBLE);
  const { t } = useLocales();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgressPercent, setDownloadProgressPercent] = useState(0);
  const [extractionStatus, setExtractionStatus] = useState('pending');
  const [browserDownloadName, setBrowserDownloadName] = useState('');
  const [fetching, setFetching] = useState(false);

  const settings = useSettingsContext();
  const { animatedEdge, debugMode } = useSettingsContext();
  const [nodeSelected, setNodeSelected] = useState('');
  const [executeNode, setExecuteNode] = useState([]);
  const [executeFinish, setExecuteFinish] = useState(false);

  const [triggerId, setTriggerId] = useState(null);

  const workspaceId = getStorage(WORKSPACE_ID);

  const {
    variableFlow,
    updateFlowAutomation,
    updateWorkflowEdit,
    workflowEditable,
    updataStatusEditingWF,
    updateVariableFlow,
    updateResources,
    // flowAutomation,
  } = useAuthContext();

  const [runStatus, setRunStatus] = useState('idle');
  const [scriptConfig] = useState({
    isFixedScreenSize: false,
    isScriptRequest: false,
  });

  const settingVSCode = useBoolean();

  const openSettingVSCode = useCallback(() => {
    settingVSCode.onTrue();
    setAnchorElMore(null);
  }, [settingVSCode]);

  const logListModal = useBoolean();
  const runningModal = useBoolean();
  const recordModal = useBoolean();
  const [variableTemplateMode, setVariableTemplateMode] = useState('editor');

  const shareModal = useBoolean();
  const publishModal = useBoolean();
  const pendingModal = useBoolean();
  const rejectedModal = useBoolean();
  const uploadModal = useBoolean();

  const resourceModal = useBoolean();

  const variableModal = useBoolean();

  const tableModal = useBoolean();
  const [table, setTable] = useState(tabData?.table ?? []);
  const [inputValidate, setInputValidate] = useState([]);
  const [designData, setDesignData] = useState(tabData?.designData ?? initialGroup);

  const [anchorMore, setAnchorElMore] = useState(null);

  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(tabData?.nodes ?? [startNode]);

  const [edges, setEdges, onEdgesChange] = useEdgesState(tabData?.edges ?? []);

  const {
    initHistory,
    canUndo,
    canRedo,
    set: setHistory,
    undo,
    redo,
    elementRef,
  } = useUndoRedoFlow(
    {
      nodes: tabData?.nodes ?? [startNode],
      edges: [],
    },
    setNodes,
    setEdges,
    variableTemplateMode
  );

  const handleChangeSetExecuteNode = (data) => {
    setExecuteNode(data);
  };

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const addForm = useBoolean();
  const [savingPayload, setSavingPayload] = useState(null);

  const [openOutput, setOpenOutput] = useState(false);

  const xlUp = useResponsive('up', 'xl');
  const [sizes, setSizes] = useState(['100%', 0]);
  const [sidebarAble, setSidebarAble] = useState(
    defaultGroupInVisible?.flow ? [0, 'auto'] : sidebarFlowchart?.flowchart ?? [300, 'auto']
  );

  useEffect(() => {
    if (!defaultGroupInVisible?.flow && !sidebarFlowchart?.flowchart) {
      if (!xlUp) {
        setSidebarAble([200, 'auto']);
      } else {
        setSidebarAble([300, 'auto']);
      }
    }
  }, [defaultGroupInVisible?.flow, sidebarFlowchart?.flowchart, xlUp]);

  const [outputLogs, setOutputLogs] = useState(tabData?.outputLogs ?? []);
  const [wfInfo, setWfInfo] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElPane, setAnchorElPane] = useState(null);
  const [anchorElSelect, setAnchorElSelect] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const [copiedNode, setCopiedNode] = useState(null);
  const [copiedEdge, setCopiedEdge] = useState(null);

  useEffect(() => {
    if (isElectron()) {
      window.ipcRenderer.on('update-browser-download-progress', (event, value) => {
        const percent = Math.round((value.downloadedMb / value.fullMb) * 100);

        if (value.status === 'Downloading') {
          setDownloadProgressPercent(percent);
        } else if (value.status === 'Download completed') {
          setDownloadProgressPercent(100);
          setExtractionStatus('in_progress');
        } else if (value.status === 'Extract Completed') {
          setDownloadProgressPercent(0);
          setExtractionStatus('pending');
          setDownloading(false);
          enqueueSnackbar(t('systemNotify.success.download'), { variant: 'success' });
          setStorage(IS_BROWSER_DOWNLOADING, 'no');
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const TABS = useMemo(
    () => [
      {
        value: 'run_config',
        label: t('workflow.script.tab.runConfig'),
      },
      ...(wfInfo?.readme
        ? [
            {
              value: 'readme',
              label: t('workflow.script.tab.readme'),
            },
          ]
        : []),
    ],
    [t, wfInfo?.readme]
  );
  const [currentTab, setCurrentTab] = useState('run_config');

  const handleChangeTab = (_, newValue) => {
    setCurrentTab(newValue);
  };

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();

    if (node.id === 'start_node') {
      return;
    }
    setAnchorEl(event.currentTarget);
    setAnchorElPane(null);
    setAnchorElSelect(null);
    setContextMenuPosition({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  }, []);

  const onClickOutsideNode = useCallback(() => {
    setAnchorEl(null);
    setContextMenuPosition(null);
  }, []);

  const onSelectClick = useCallback((event) => {
    event.preventDefault();

    setAnchorElSelect(event.currentTarget);
    setAnchorElPane(null);
    setAnchorEl(null);
    setContextMenuPosition({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  }, []);

  const onClickOutsideSelect = useCallback(() => {
    setAnchorElSelect(null);
    setContextMenuPosition(null);
  }, []);

  const onPaneClick = useCallback((event) => {
    event.preventDefault();

    setAnchorElPane(event.currentTarget);
    setAnchorEl(null);
    setAnchorElSelect(null);
    setContextMenuPosition({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  }, []);

  const onChartClick = useCallback((event) => {
    setContextMenuPosition({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  }, []);

  const onClickOutsidePane = useCallback(() => {
    setAnchorElPane(null);
    setContextMenuPosition(null);
  }, []);

  const handlePanelClick = useCallback(() => {
    setAnchorEl(null);
    setAnchorElSelect(null);
    setAnchorElPane(null);
    const selectedNodes = reactFlowInstance.getNodes().filter((node) => node.selected);
    if (selectedNodes.length > 0) {
      selectedNodes.forEach((node) => {
        reactFlowInstance.updateNode(node.id, (prevData) => ({
          ...prevData,
          selected: false,
        }));
      });
    }

    if (runStatus === 'running') return;

    const highlightNode = reactFlowInstance?.getNodes().find((item) => item.data?.isHighlighted);
    if (highlightNode?.id) {
      setNodeSelected('');
      reactFlowInstance?.updateNode(highlightNode.id, (prevData) => ({
        ...prevData,
        data: {
          ...prevData.data,
          isHighlighted: false,
        },
      }));
    }
  }, [reactFlowInstance, runStatus]);

  const handleCopyNode = useCallback(
    (type = 'simple') => {
      const copyNodes = (nodesToCopy) => {
        setCopiedNode(nodesToCopy);
      };
      const copiedEdges = (edgesToCopy) => {
        setCopiedEdge(edgesToCopy);
      };

      if (type === 'simple') {
        const nodeId = String(anchorEl.getAttribute('data-id'));
        const node = reactFlowInstance?.getNodes().find((i) => String(i.id) === nodeId);

        if (!node) return;

        copyNodes(node);
      } else {
        const selectedNodes = reactFlowInstance
          ?.getNodes()
          .filter((node) => node.selected && node.id !== 'start_node' && node.type !== 'group');

        if (selectedNodes.length === 0) return;

        copyNodes(selectedNodes);

        const selectedEdges = reactFlowInstance?.getEdges().filter((edge) => edge.selected);

        if (selectedEdges.length > 0) copiedEdges(selectedEdges);
      }
    },
    [anchorEl, reactFlowInstance]
  );

  const handlePasteNode = useCallback(
    () => {
      if (!copiedNode || !reactFlowInstance) return;

      const basePosition = reactFlowInstance.screenToFlowPosition({
        x: contextMenuPosition?.mouseX ?? document.body.clientHeight / 2 - 160,
        y: contextMenuPosition?.mouseY ?? document.body.clientWidth / 2 - 80,
      });

      let prevNodePosition = null;

      const createPastedNode = (node, initPosition, newParentId, positionOffset) => {
        reactFlowInstance.updateNode(node.id, (prevData) => ({
          ...prevData,
          selected: false,
        }));

        const _id = getId();

        const position = {
          x:
            initPosition.x +
            (prevNodePosition?.x ? node.position.x - prevNodePosition.x : 0) -
            (positionOffset?.x || 0),
          y:
            initPosition.y +
            (prevNodePosition?.y ? node.position.y - prevNodePosition.y : 0) -
            (positionOffset?.y || 0),
        };

        if (prevNodePosition === null) {
          prevNodePosition = { x: node.position.x, y: node.position.y };
        }

        return {
          ...node,
          data: { ...node.data, nodeOrder: _id, isHighlighted: false },
          ...(node.type === 'loop' && {
            dataFields: {
              ...node.dataFields,
              loop_id: generateRandomString(),
            },
          }),
          ...(node.type === 'end_loop' && {
            dataFields: {
              ...node.dataFields,
              loop_id: '',
            },
          }),
          selected: true,
          draggable: true,
          dragging: false,
          id: node.type === 'group' ? `group_${_id}` : _id,
          position,
          parentId: undefined,
          extent: undefined,
          className: '',
          ...(newParentId
            ? {
                parentId: newParentId,
                extent: 'parent',
                // draggable: false,
                className: 'group-node',
              }
            : {}),
        };
      };

      const createNewEdge = (edge, newNodesMap) => {
        if (newNodesMap?.[edge?.source] && newNodesMap?.[edge?.target]) {
          const newEdge = { ...edge };
          newEdge.source = newNodesMap[edge.source];
          newEdge.target = newNodesMap[edge.target];
          newEdge.id = getId();
          return newEdge;
        }
        return null;
      };

      if (Array.isArray(copiedNode)) {
        reactFlowInstance.updateNode('start_node', (prevData) => ({
          ...prevData,
          selected: false,
        }));

        const newNodesMap = {};
        const newNodes = [];
        let newEdges = [];

        const duplicatedGroupsMap = {};
        const newGroupPosition = {};

        const selectedGroupNodes = copiedNode.filter((node) => node.type === 'group');

        const newGroupNodes = selectedGroupNodes.map((groupNode) => {
          if (groupNode?.parentId) {
            const listNodes = reactFlowInstance.getNodes();
            const parentNode = listNodes.find((item) => item.id === groupNode.parentId);
            if (parentNode) {
              reactFlowInstance.updateNode(parentNode.id, (prevData) => ({
                ...prevData,
                selected: false,
              }));
            }
          }
          const newGroupNode = createPastedNode(groupNode, basePosition);
          newNodesMap[groupNode.id] = newGroupNode.id;
          duplicatedGroupsMap[groupNode.id] = newGroupNode.id;
          newGroupPosition[groupNode.id] = newGroupNode.position;
          return newGroupNode;
        });

        newNodes.push(...newGroupNodes);

        copiedNode
          .filter((node) => node.parentId && copiedNode.find((n) => n.id === node.parentId))
          .forEach((childNode) => {
            const originalParentId = childNode.parentId;
            const newParentId = duplicatedGroupsMap[originalParentId];
            const newParentPosition = newGroupPosition[originalParentId];
            const originalParentNode = nodes.find((n) => n.id === originalParentId);
            const newParentNode = newNodes.find((n) => n.id === newParentId);

            if (newParentId && originalParentNode && newParentNode) {
              const newChildNode = createPastedNode(childNode, basePosition, newParentId, {
                x: newParentPosition.x - originalParentNode.position.x,
                y: newParentPosition.y - originalParentNode.position.y,
              });
              newNodesMap[childNode.id] = newChildNode.id;
              newNodes.push(newChildNode);
            }
          });

        const topLevelNodesToDuplicate = copiedNode
          .filter((node) => !node.parentId || !copiedNode.find((n) => n.id === node.parentId))
          .filter((node) => node.type !== 'group');

        const newTopLevelNodes = topLevelNodesToDuplicate.map((node) => {
          const newNode = createPastedNode(node, basePosition);
          newNodesMap[node.id] = newNode.id;
          return newNode;
        });
        newNodes.push(...newTopLevelNodes);

        if (copiedEdge?.length > 0) {
          newEdges = copiedEdge
            .map((edge) => createNewEdge(edge, newNodesMap))
            .filter((edge) => edge !== null);
        }

        if (newNodes.length > 0) {
          reactFlowInstance?.setNodes((nds) => [...nds, ...newNodes]);
        }
        if (newEdges.length > 0) {
          reactFlowInstance?.setEdges((eds) => [...eds, ...newEdges]);
        }

        if (newNodes.length > 0 || newEdges.length > 0) {
          setHistory({
            nodes: [...nodes, ...newNodes],
            edges: [...edges, ...newEdges],
          });
          updataStatusEditingWF(true);
        }
      } else if (copiedNode?.id.split('_')[0] === 'group') {
        const childNodes = reactFlowInstance
          ?.getNodes()
          .filter((node) => node.parentId === copiedNode.id && node.type !== 'group');

        const groupedNodeIds = childNodes.map((node) => node.id);
        const childEdges = reactFlowInstance
          ?.getEdges()
          .filter(
            (edge) => groupedNodeIds.includes(edge.source) && groupedNodeIds.includes(edge.target)
          );

        const newNodesMap = {};
        const newNodes = [];
        let newEdges = [];

        const newGroupNode = createPastedNode(copiedNode, basePosition);
        newNodesMap[copiedNode.id] = newGroupNode.id;

        newNodes.push(newGroupNode);

        childNodes.forEach((childNode) => {
          const originalParentId = childNode.parentId;
          const newParentId = newGroupNode.id;
          const newParentPosition = newGroupNode.position;
          const originalParentNode = nodes.find((n) => n.id === originalParentId);
          const newParentNode = newNodes.find((n) => n.id === newParentId);

          if (newParentId && originalParentNode && newParentNode) {
            const newChildNode = createPastedNode(childNode, basePosition, newParentId, {
              x: newParentPosition.x - originalParentNode.position.x,
              y: newParentPosition.y - originalParentNode.position.y,
            });
            newNodesMap[childNode.id] = newChildNode.id;
            newNodes.push(newChildNode);
          }
        });

        if (childEdges?.length > 0) {
          newEdges = childEdges
            .map((edge) => createNewEdge(edge, newNodesMap))
            .filter((edge) => edge !== null);
        }

        if (newNodes.length > 0) {
          reactFlowInstance?.setNodes((nds) => [...nds, ...newNodes]);
        }
        if (newEdges.length > 0) {
          reactFlowInstance?.setEdges((eds) => [...eds, ...newEdges]);
        }

        if (newNodes.length > 0 || newEdges.length > 0) {
          setHistory({
            nodes: [...nodes, ...newNodes],
            edges: [...edges, ...newEdges],
          });
          updataStatusEditingWF(true);
        }
      } else {
        const newNode = createPastedNode(copiedNode, basePosition);
        reactFlowInstance?.setNodes((nds) => [...nds, newNode]);

        setHistory({
          nodes: [...nodes, newNode],
          edges,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contextMenuPosition, copiedEdge, copiedNode, edges, nodes, reactFlowInstance]
  );

  const duplicateNode = useCallback(
    (type = 'simple') => {
      const createNewNode = (node, randomPosition, offset = 50, newParentId, positionOffset) => {
        reactFlowInstance.updateNode(node.id, (prevData) => ({
          ...prevData,
          selected: false,
        }));

        const position = {
          x: node.position.x + offset + randomPosition - (positionOffset?.x || 0),
          y: node.position.y + offset + randomPosition - (positionOffset?.y || 0),
        };
        const _id = getId();

        return {
          ...node,
          data: { ...node.data, nodeOrder: _id, isHighlighted: false },
          ...(node.type === 'loop' && {
            dataFields: {
              ...node.dataFields,
              loop_id: generateRandomString(),
            },
          }),
          ...(node.type === 'end_loop' && {
            dataFields: {
              ...node.dataFields,
              loop_id: '',
            },
          }),
          selected: type === 'multiple',
          draggable: true,
          dragging: false,
          id: node.type === 'group' ? `group_${_id}` : _id,
          position,
          parentId: undefined,
          extent: undefined,
          className: '',
          ...(newParentId
            ? {
                parentId: newParentId,
                extent: 'parent',
                // draggable: false,
                className: 'group-node',
              }
            : {}),
        };
      };

      const createNewEdge = (edge, newNodesMap) => {
        if (newNodesMap?.[edge?.source] && newNodesMap?.[edge?.target]) {
          const newEdge = { ...edge };
          newEdge.source = newNodesMap[edge.source];
          newEdge.target = newNodesMap[edge.target];
          newEdge.id = getId();
          return newEdge;
        }
        return null;
      };

      const randomPosition = Math.floor(Math.random() * 51);
      const newNodesMap = {};
      let newNodes = [];
      let newEdges = [];

      if (type === 'simple') {
        const nodeId = anchorEl.getAttribute('data-id');
        const targetNode = nodes.find((i) => String(i.id) === nodeId);

        if (targetNode) {
          if (targetNode?.id.split('_')[0] === 'group') {
            const childNodes = reactFlowInstance
              ?.getNodes()
              .filter((node) => node.parentId === targetNode.id && node.type !== 'group');

            const groupedNodeIds = childNodes.map((node) => node.id);
            const childEdges = reactFlowInstance
              ?.getEdges()
              .filter(
                (edge) =>
                  groupedNodeIds.includes(edge.source) && groupedNodeIds.includes(edge.target)
              );

            reactFlowInstance.updateNode('start_node', (prevData) => ({
              ...prevData,
              selected: false,
            }));

            const newGroupNode = createNewNode(targetNode, randomPosition, 100);
            newNodesMap[targetNode.id] = newGroupNode.id;

            newNodes.push(newGroupNode);

            childNodes.forEach((childNode) => {
              const originalParentId = childNode.parentId;
              const newParentId = newGroupNode.id;
              const newParentPosition = newGroupNode.position;
              const originalParentNode = nodes.find((n) => n.id === originalParentId);
              const newParentNode = newNodes.find((n) => n.id === newParentId);

              if (newParentId && originalParentNode && newParentNode) {
                const newChildNode = createNewNode(childNode, randomPosition, 100, newParentId, {
                  x: newParentPosition.x - originalParentNode.position.x,
                  y: newParentPosition.y - originalParentNode.position.y,
                });
                newNodesMap[childNode.id] = newChildNode.id;
                newNodes.push(newChildNode);
              }
            });

            if (childEdges.length > 0) {
              newEdges = childEdges
                .map((edge) => createNewEdge(edge, newNodesMap))
                .filter((edge) => edge !== null);
            }
          } else {
            const newNode = createNewNode(targetNode, randomPosition);
            newNodes = [newNode];
          }
        }
      } else {
        const selectedNodes = nodes.filter((node) => node.selected && node.id !== 'start_node');

        reactFlowInstance.updateNode('start_node', (prevData) => ({
          ...prevData,
          selected: false,
        }));

        if (selectedNodes.length > 0) {
          const duplicatedGroupsMap = {};
          const newGroupPosition = {};

          const selectedGroupNodes = selectedNodes.filter((node) => node.type === 'group');

          const newGroupNodes = selectedGroupNodes.map((groupNode) => {
            const newGroupNode = createNewNode(groupNode, randomPosition, 100);
            newNodesMap[groupNode.id] = newGroupNode.id;
            duplicatedGroupsMap[groupNode.id] = newGroupNode.id;
            newGroupPosition[groupNode.id] = newGroupNode.position;
            return newGroupNode;
          });

          newNodes.push(...newGroupNodes);

          selectedNodes
            .filter((node) => node.parentId && selectedNodes.find((n) => n.id === node.parentId))
            .forEach((childNode) => {
              const originalParentId = childNode.parentId;
              const newParentId = duplicatedGroupsMap[originalParentId];
              const newParentPosition = newGroupPosition[originalParentId];
              const originalParentNode = nodes.find((n) => n.id === originalParentId);
              const newParentNode = newNodes.find((n) => n.id === newParentId);

              if (newParentId && originalParentNode && newParentNode) {
                const newChildNode = createNewNode(childNode, randomPosition, 100, newParentId, {
                  x: newParentPosition.x - originalParentNode.position.x,
                  y: newParentPosition.y - originalParentNode.position.y,
                });
                newNodesMap[childNode.id] = newChildNode.id;
                newNodes.push(newChildNode);
              }
            });

          const topLevelNodesToDuplicate = selectedNodes
            .filter((node) => !node.parentId || !selectedNodes.find((n) => n.id === node.parentId))
            .filter((node) => node.type !== 'group');

          const newTopLevelNodes = topLevelNodesToDuplicate.map((node) => {
            const newNode = createNewNode(node, randomPosition, 100);
            newNodesMap[node.id] = newNode.id;
            return newNode;
          });
          newNodes.push(...newTopLevelNodes);

          const selectedEdges = edges.filter((edge) => edge.selected);

          if (selectedEdges.length > 0) {
            newEdges = selectedEdges
              .map((edge) => createNewEdge(edge, newNodesMap))
              .filter((edge) => edge !== null);
          }
        }
      }

      if (newNodes.length > 0) {
        reactFlowInstance?.setNodes((nds) => [...nds, ...newNodes]);
      }
      if (newEdges.length > 0) {
        reactFlowInstance?.setEdges((eds) => [...eds, ...newEdges]);
      }
      if (newNodes.length > 0 || newEdges.length > 0) {
        setHistory({
          nodes: [...nodes, ...newNodes],
          edges: [...edges, ...newEdges],
        });
        updataStatusEditingWF(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [anchorEl, edges, nodes, reactFlowInstance]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const alignNodes = (direction) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = applyDagreLayoutOnSelectedNodes(
      nodes,
      edges,
      direction
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);

    setHistory({
      nodes: [...layoutedNodes],
      edges: [...layoutedEdges],
    });
  };

  const deleteNode = useCallback(
    (type = 'simple') => {
      const deleteNodesAndEdges = (nodeIdsToDelete) => {
        setNodes((listNode) => {
          const newNodes = listNode.filter((node) => !nodeIdsToDelete.has(String(node.id)));
          setHistory({
            nodes: newNodes,
            edges,
          });
          return newNodes;
        });
        setEdges((listEdge) =>
          listEdge.filter(
            (edge) =>
              !nodeIdsToDelete.has(String(edge.source)) && !nodeIdsToDelete.has(String(edge.target))
          )
        );
      };

      if (type === 'simple') {
        const nodeId = String(anchorEl.getAttribute('data-id'));
        deleteNodesAndEdges(new Set([nodeId]));
      } else {
        const selectedNodeIds = new Set(
          nodes.filter((node) => node.selected).map((node) => String(node.id))
        );

        selectedNodeIds.delete('start_node');

        if (selectedNodeIds.size === 0) return;

        deleteNodesAndEdges(selectedNodeIds);
      }
    },
    [anchorEl, edges, nodes, setEdges, setHistory, setNodes]
  );

  const deleteGroupNode = useCallback(() => {
    const groupId = String(anchorEl.getAttribute('data-id'));
    const allNodes = reactFlowInstance?.getNodes() || [];
    const allEdges = reactFlowInstance?.getEdges() || [];

    const childNodes = allNodes.filter((node) => node.parentId === groupId);
    const childNodeIds = childNodes.map((node) => node.id);

    const edgesToDelete = allEdges.filter(
      (edge) => childNodeIds.includes(edge.source) && childNodeIds.includes(edge.target)
    );
    const edgeIdsToDelete = edgesToDelete.map((edge) => edge.id);

    const newNodes = allNodes.filter(
      (node) => node.id !== groupId && !childNodeIds.includes(node.id)
    );

    const newEdges = allEdges.filter((edge) => !edgeIdsToDelete.includes(edge.id));

    reactFlowInstance?.setNodes(newNodes);
    reactFlowInstance?.setEdges(newEdges);

    setHistory({
      nodes: newNodes,
      edges: newEdges,
    });
  }, [anchorEl, reactFlowInstance, setHistory]);

  const groupNode = useCallback(() => {
    const currentNodes = reactFlowInstance.getNodes();
    const selectedNodes = currentNodes.filter((node) => node.selected && node.id !== 'start_node');

    if (selectedNodes.length === 0) return;

    const hasNonGroupedNode = selectedNodes.some((node) => !node.parentId && node.type !== 'group');
    const hasMoreThanOneGroup = selectedNodes.filter((node) => node.type === 'group').length > 1;
    if (!hasNonGroupedNode) {
      if (!hasMoreThanOneGroup) {
        return;
      }
    }

    const { minX, minY, maxX, maxY } = selectedNodes
      .filter((node) => !node.parentId)
      .reduce(
        (bounds, node) => ({
          minX: Math.min(bounds.minX, node.position.x),
          minY: Math.min(bounds.minY, node.position.y),
          maxX: Math.max(bounds.maxX, node.position.x + node.measured.width),
          maxY: Math.max(bounds.maxY, node.position.y + node.measured.height),
        }),
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
      );

    const groupId = `group_${getId()}`;
    const padding = 20;

    const newGroup = {
      id: groupId,
      type: 'group',
      data: { label: null },
      position: {
        x: minX - padding,
        y: minY - padding,
      },
      style: {
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2,
        zIndex: 3,
      },
    };

    const updatedNodes = currentNodes.map((node) => {
      if (selectedNodes.some((selected) => selected.id === node.id && !node.parentId)) {
        return {
          ...node,
          parentId: groupId,
          extent: 'parent',
          // draggable: false,
          // dragHandle: '.drag-handle__custom',
          selected: false,
          position: {
            x: node.position.x - (minX - padding),
            y: node.position.y - (minY - padding),
          },
          className: 'group-node',
        };
      }
      return node;
    });

    reactFlowInstance.setNodes([newGroup, ...updatedNodes]);

    setHistory({
      nodes: [newGroup, ...updatedNodes],
      edges,
    });
  }, [edges, reactFlowInstance, setHistory]);

  const unGroupNode = useCallback(
    (groupId) => {
      const parentNodeId = groupId ?? String(anchorEl.getAttribute('data-id'));

      const currentNodes = reactFlowInstance.getNodes();

      const groupedNode = currentNodes.find((node) => node.id === parentNodeId);

      if (!groupedNode) return;

      const groupPosition = groupedNode.position;

      const updatedNodes = currentNodes
        .filter((node) => node.id !== parentNodeId)
        .map((node) => {
          if (node.parentId === parentNodeId) {
            return {
              ...node,
              parentId: undefined,
              extent: undefined,
              position: {
                x: node.position.x + groupPosition.x,
                y: node.position.y + groupPosition.y,
              },
              // draggable: true,
              selected: true,
              className: '',
            };
          }
          return node;
        });

      reactFlowInstance.setNodes(updatedNodes);

      setHistory({
        nodes: updatedNodes,
        edges,
      });
    },
    [anchorEl, edges, reactFlowInstance, setHistory]
  );

  const optionsNode = useMemo(() => {
    let currentNode = null;

    if (anchorEl) {
      const nodeId = String(anchorEl.getAttribute('data-id'));

      const currentListNodes = reactFlowInstance.getNodes();

      currentNode = currentListNodes.find((node) => node.id === nodeId);
    }

    return [
      { label: 'Sao chép', icon: 'tabler:copy', action: handleCopyNode },
      { label: 'Nhân bản', icon: 'ion:duplicate-outline', action: duplicateNode },
      ...(currentNode?.parentId
        ? [
            {
              label: 'Tách nhóm',
              icon: 'fa6-regular:object-ungroup',
              action: () => unGroupNode(currentNode.parentId),
            },
          ]
        : []),
      { label: 'Xóa', icon: 'material-symbols-light:delete-outline', action: deleteNode },
    ];
  }, [anchorEl, deleteNode, duplicateNode, handleCopyNode, reactFlowInstance, unGroupNode]);

  const optionsGroup = useMemo(
    () => [
      { label: 'Sao chép', icon: 'tabler:copy', action: handleCopyNode },
      { label: 'Nhân bản', icon: 'ion:duplicate-outline', action: duplicateNode },
      {
        label: 'Tách nhóm',
        icon: 'fa6-regular:object-ungroup',
        action: unGroupNode,
      },
      { label: 'Xóa nhóm', icon: 'material-symbols-light:delete-outline', action: deleteGroupNode },
    ],
    [deleteGroupNode, duplicateNode, handleCopyNode, unGroupNode]
  );

  const optionsSelector = useMemo(
    () => [
      { label: 'Sao chép', icon: 'tabler:copy', action: () => handleCopyNode('multiple') },
      {
        label: 'Nhân bản',
        icon: 'ion:duplicate-outline',
        action: () => duplicateNode('multiple'),
      },
      {
        label: 'Sắp xếp',
        icon: 'uil:align',
        submenu: [
          {
            label: 'Hàng dọc hướng lên',
            action: () => alignNodes('BT'),
            icon: 'ep:top',
          },
          {
            label: 'Hàng dọc hướng xuống',
            action: () => alignNodes('TB'),
            icon: 'ep:bottom',
          },
          {
            label: 'Hàng ngang qua trái',
            action: () => alignNodes('RL'),
            icon: 'mingcute:arrow-left-line',
          },
          {
            label: 'Hàng ngang qua phải',
            action: () => alignNodes('LR'),
            icon: 'mingcute:arrow-right-line',
          },
        ],
      },
      {
        label: 'Nhóm',
        icon: 'material-symbols-light:ad-group-outline-rounded',
        action: groupNode,
      },
      {
        label: 'Xóa',
        icon: 'material-symbols-light:delete-outline',
        action: () => deleteNode('multiple'),
      },
    ],
    [handleCopyNode, duplicateNode, alignNodes, groupNode, deleteNode]
  );

  const optionsPane = useMemo(
    () => [
      { label: 'Paste', action: handlePasteNode, icon: 'clarity:paste-line' },
      { label: 'Undo', action: undo, icon: 'iconoir:undo', disabled: !canUndo },
      { label: 'Redo', action: redo, icon: 'iconoir:redo', disabled: !canRedo },
    ],
    [canRedo, canUndo, handlePasteNode, redo, undo]
  );

  useEffect(() => {
    eventBus.emit('responsiveSibarFlowchart', { data: sidebarAble });
  }, [sidebarAble]);

  const getDetail = useCallback(async () => {
    try {
      if (tabData?.hasData) {
        const res = await getWorkFlowDetail(workspaceId, tabData?.idFlowChart);
        updateWorkflowEdit(res?.data);
        setWfInfo(res?.data);
        updateVariableFlow({
          dataFlow: res?.data,
          status: 'editting',
        });
        return;
      }
      setFetching(true);
      const res = await getWorkFlowDetail(workspaceId, tabData?.idFlowChart);

      setWfInfo(res?.data);
      updateWorkflowEdit(res?.data);
      setTable(res?.data?.table || []);
      if (res?.data?.design_data) {
        setDesignData(res?.data?.design_data);
        eventBus.emit('update_ruleset_data', res?.data?.design_data);
      }

      updateVariableFlow({
        list: res?.data?.global_data,
        dataFlow: res?.data,
        status: 'editting',
      });

      if (!res?.data?.is_encrypted) {
        const listNode = res?.data?.content?.nodes ? JSON.parse(res?.data?.content.nodes) : [];
        const listEdge = (
          res?.data?.content?.edges && res?.data?.content?.edges !== ''
            ? JSON.parse(res?.data?.content?.edges)
            : []
        ).map((edge) => ({
          ...edge,
          animated: animatedEdge,
        }));

        const listNodeData = listNode.map((node) => ({
          ...node,
          data: {
            ...(flowchartOptions.find((item) => item.alias === node.data.alias) || node.data),
            isHighlighted: false,
            nodeOrder: node.id,
          },
          dataFields: {
            ...getFlowchartValue(node.data.alias),
            ...node.dataFields,
          },
          selected: false,
        }));

        setNodes(listNodeData);

        setEdges(listEdge);

        initHistory({
          nodes: listNodeData,
          edges: listEdge,
        });
      }

      setFetching(false);
    } catch (error) {
      /* empty */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabData?.hasData, tabData?.idFlowChart, workspaceId, setNodes, setEdges]);

  useEffect(() => {
    if (tabData?.idFlowChart) {
      getDetail();
    }
  }, [getDetail, tabData?.idFlowChart]);

  // useEffect(() => {
  //   if (nodes?.length > 0) {
  //     updateFlowAutomation({
  //       allCurrentFlowchart: nodes,
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   nodes?.length,
  //   flowAutomation.updateNodeForm,
  //   // updateFlowAutomation
  // ]);

  useEffect(() => {
    if (isElectron()) {
      window.ipcRenderer.on('profile-editor-close', () => {
        setRunStatus('idle');
      });
    }
    return () => {
      if (isElectron()) {
        window.ipcRenderer.removeAllListeners('profile-editor-close');
      }
    };
  }, []);

  useEffect(() => {
    const headerElement = document.getElementById('header-content');
    const mainElement = document.getElementById('main-content');
    if (headerElement) headerElement.style.height = '75px';
    const isVertical = settings.themeLayout === 'vertical';
    if (isVertical) {
      settings.onUpdate('themeLayout', 'mini');
    }

    return () => {
      if (isVertical) {
        settings.onUpdate('themeLayout', 'vertical');
      }
      settings.onUpdate('isFullScreen', false);
      handleHiddenLayout();

      if (headerElement) headerElement.style.height = '80px';
      if (mainElement) mainElement.style.paddingTop = '88px';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHiddenLayout = useCallback(() => {
    const headerElement = document.getElementById('header-content');
    const sidebarElement = document.getElementById('nav-content');
    const mainElement = document.getElementById('main-content');

    if (settings.isFullScreen) {
      if (headerElement) headerElement.style.display = 'none';
      if (sidebarElement) sidebarElement.style.display = 'none';
      if (mainElement) mainElement.style.paddingTop = '8px';
    } else {
      if (headerElement) headerElement.style.display = 'flex';
      if (sidebarElement) sidebarElement.style.display = 'block';
      if (mainElement) mainElement.style.paddingTop = '75px';
    }
  }, [settings.isFullScreen]);

  useEffect(() => {
    handleHiddenLayout();
  }, [handleHiddenLayout]);

  const handleResize = useCallback(() => {
    if (settings.themeLayout !== 'horizontal') {
      const maxHeight = window.screen.height;
      const maxWidth = window.screen.width;
      const curHeight = window.innerHeight;
      const curWidth = window.innerWidth;

      const isFullScreen = maxWidth === curWidth && maxHeight === curHeight;

      settings.onUpdate('isFullScreen', isFullScreen);

      const headerElement = document.getElementById('header-content');
      const sidebarElement = document.getElementById('nav-content');
      const mainElement = document.getElementById('main-content');

      if (isFullScreen) {
        if (headerElement) headerElement.classList.add('hidden');
        if (sidebarElement) sidebarElement.classList.add('hidden');
        if (mainElement) mainElement.classList.add('hidden');
      } else {
        if (headerElement) headerElement.classList.remove('hidden');
        if (sidebarElement) sidebarElement.classList.remove('hidden');
        if (mainElement) mainElement.classList.remove('hidden');
      }
    }
  }, [settings]);

  useEffect(() => {
    if (!isElectron()) {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (!isElectron()) {
        window.removeEventListener('resize', handleResize);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const traverseAndCheckReverse = useCallback(
    (nodeId) => {
      const currentNode = reactFlowInstance?.getInternalNode(nodeId);

      if (currentNode?.type === 'conditions') {
        return false;
      }

      if (['lap_co_dieu_kien', 'lap_phan_tu', 'lap_du_lieu'].includes(currentNode?.data?.alias)) {
        return true;
      }

      const parents = reactFlowInstance?.getEdges().filter((edge) => edge.target === nodeId);

      // eslint-disable-next-line no-restricted-syntax
      for (const child of parents) {
        if (['fallnext'].includes(child?.sourceHandle)) {
          return true;
        }

        const result = traverseAndCheckReverse(child?.source);
        if (result) {
          return true;
        }
      }

      return false;
    },
    [reactFlowInstance]
  );

  const onConnect = useCallback(
    (paramsmeter) => {
      const { source, target, sourceHandle } = paramsmeter;

      const findPath = (start, end, visited = {}) => {
        if (start === end) {
          return true;
        }
        visited[start] = true;
        const outgoingEdges = edges.filter((edge) => edge.source === start);
        // eslint-disable-next-line no-restricted-syntax
        for (const edge of outgoingEdges) {
          if (!visited[edge.target] && findPath(edge.target, end, visited)) {
            return true;
          }
        }
        return false;
      };

      if (findPath(target, source)) {
        enqueueSnackbar(t('systemNotify.error.reverseConnection'), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
          style: {
            minWidth: 'fit-content',
          },
          SnackbarProps: {
            style: {
              minWidth: 'fit-content',
            },
          },
        });
        return;
      }

      const targetNode = reactFlowInstance.getInternalNode(target);

      if (
        targetNode &&
        targetNode.data.alias === 'diem_cuoi_vong_lap' &&
        sourceHandle !== 'fallnext'
      ) {
        const isValidLoop = traverseAndCheckReverse(source);
        if (!isValidLoop) {
          enqueueSnackbar(t('systemNotify.error.invalidLoopConnection'), {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
            style: {
              minWidth: 'fit-content',
            },
            SnackbarProps: {
              style: {
                minWidth: 'fit-content',
              },
            },
          });
          return;
        }
      }

      setEdges((eds) => {
        const isStartNodeConnected = eds.find((i) => i.source === 'start_node');
        if (paramsmeter.source === 'start_node' && isStartNodeConnected) {
          enqueueSnackbar(t('systemNotify.error.startNodeConnected'), {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
            style: {
              minWidth: 'fit-content',
            },
            SnackbarProps: {
              style: {
                minWidth: 'fit-content',
              },
            },
          });
          return eds;
        }

        const newList = addEdge(
          {
            ...paramsmeter,
            animated: animatedEdge,
            sourceHandle: paramsmeter.sourceHandle,
            targetHandle: paramsmeter.targetHandle,
            style: {
              strokeWidth: 1.3,
              stroke:
                (paramsmeter.sourceHandle === 'error' && theme.palette.error.main) ||
                (['condition-else', 'outer'].includes(paramsmeter.sourceHandle) &&
                  theme.palette.warning.main) ||
                theme.palette.success.main,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color:
                (paramsmeter.sourceHandle === 'error' && theme.palette.error.main) ||
                (paramsmeter.sourceHandle === 'condition-else' && theme.palette.warning.main) ||
                theme.palette.success.main,
            },
            // type: 'smoothstep',
            type: 'custom',
          },
          eds
        );

        setHistory({
          nodes,
          edges: newList,
        });

        return newList;
      });
    },
    [
      animatedEdge,
      reactFlowInstance,
      setEdges,
      edges,
      nodes,
      setHistory,
      t,
      traverseAndCheckReverse,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.success.main,
    ]
  );

  const handleChangeEdgeType = useCallback(
    (type) => {
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          animated: type,
        }))
      );
    },
    [setEdges]
  );

  const onDragOver = useCallback(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      updataStatusEditingWF(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onDrop = useCallback(
    (event) => {
      try {
        event.preventDefault();

        const _recived = event.dataTransfer.getData('text/plain');
        const transferredData = JSON.parse(_recived);

        // check if the dropped element is valid
        if (typeof transferredData?.type === 'undefined' || !transferredData?.type) {
          return;
        }

        // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
        // and you don't need to subtract the reactFlowBounds.left/top anymore
        // details: https://reactflow.dev/whats-new/2023-11-10
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - 70,
          y: event.clientY - 10,
        });

        const _id = getId();

        const newNode = {
          id: _id,
          type: transferredData.type,
          position,
          data: { ...transferredData, nodeOrder: _id },
          dataFields: {
            ...generateFields(transferredData?.alias),
            breakpoint: false,
          },
        };

        let newEndLoop = null;

        if (['condition_loop', 'loop'].includes(newNode.type)) {
          const id = getId();
          newEndLoop = {
            id,
            type: 'end_loop',
            position: {
              x: position.x,
              y: position.y + 60,
            },
            dataFields: {
              loop_id: newNode.dataFields.loop_id,
              breakpoint: false,
            },
            data: {
              name: 'Điểm cuối vòng lặp',
              icon: 'material-symbols:line-end-circle-rounded',
              parameters: [
                {
                  key: 'loop_id',
                  type: 'string',
                  label: 'ID của vòng lặp',
                  is_required: true,
                },
              ],
              alias: 'diem_cuoi_vong_lap',
              display: true,
              isHighlighted: false,
              type: 'end_loop',
              nodeOrder: id,
            },
          };
        }

        setHistory({
          nodes: [...nodes, newNode, ...(newEndLoop ? [newEndLoop] : [])],
          edges,
        });

        setNodes((nds) => [...nds, newNode, ...(newEndLoop ? [newEndLoop] : [])]);

        updataStatusEditingWF(true);
      } catch (error) {
        /* empty */
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      edges,
      nodes,
      reactFlowInstance,
      setHistory,
      setNodes,
      // updataStatusEditingWF
    ]
  );

  const updateNodeFields = useCallback(
    (dataFields) => {
      if (dataFields?.idNode) {
        reactFlowInstance.updateNode(dataFields.idNode, (prevData) => ({
          ...prevData,
          dataFields: { ...prevData.dataFields, ...dataFields.data },
          data: {
            ...prevData.data,
            updated: Math.random(),
          },
        }));

        // updataStatusEditingWF(true);
      }
    },
    [reactFlowInstance]
  );

  const handleHighlightNode = useCallback(
    (nodeId) => {
      if (!reactFlowInstance) return;

      const nodes_list = reactFlowInstance.getNodes();

      const currentHighlightedNode = nodes_list.find((item) => item.data?.isHighlighted);

      if (currentHighlightedNode?.id !== nodeId) {
        const updatedNodes = nodes_list.map((node) => {
          if (node.id === currentHighlightedNode?.id) {
            return {
              ...node,
              data: {
                ...node.data,
                isHighlighted: false,
              },
            };
            // eslint-disable-next-line no-else-return
          } else if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                isHighlighted: true,
              },
            };
          }
          return node;
        });

        reactFlowInstance.setNodes(updatedNodes);
      }
    },
    [reactFlowInstance]
  );

  const removeNode = useCallback(
    (nodeId) => {
      const newNodes = reactFlowInstance?.getNodes().filter((i) => i.id !== nodeId);
      const newEdges = reactFlowInstance
        ?.getEdges()
        .filter((i) => i.source !== nodeId && i.target !== nodeId);

      reactFlowInstance?.setNodes(newNodes);
      reactFlowInstance?.setEdges(newEdges);

      setHistory({
        nodes: newNodes,
        edges: newEdges,
      });
      updataStatusEditingWF(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reactFlowInstance, setHistory]
  );

  const clickNode = useCallback((data) => {
    setAnchorEl(null);
    setAnchorElSelect(null);
    setAnchorElPane(null);
    updateFlowAutomation(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Listen for the custom event
    const handleUpdateNode = (dataFields) => {
      updateNodeFields(dataFields);
    };

    const handleRemoveNode = (nodeId) => {
      removeNode(nodeId);
    };

    const handleClickNode = (data) => {
      clickNode(data);
    };

    const handleRunAtNode = (nodeId) => {
      setTriggerId(nodeId);
      runningModal.onTrue();
    };

    eventBus.on('updateNode', handleUpdateNode);
    eventBus.on('removeNode', handleRemoveNode);
    eventBus.on('clickNode', handleClickNode);
    eventBus.on('run-script-at-node', handleRunAtNode);

    // Cleanup the event listener when the component unmounts
    return () => {
      eventBus.removeListener('updateNode', handleUpdateNode);
      eventBus.removeListener('removeNode', handleRemoveNode);
      eventBus.removeListener('clickNode', handleClickNode);
      eventBus.removeListener('run-script-at-node', handleRunAtNode);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateNodeFields, removeNode, clickNode]);

  const [lockScreen, setLockScreen] = useState(false);
  const timer = useRef(null);
  const [resetViewport, setResetViewport] = useState(1);

  useEffect(() => {
    const getWorkFlow = async () => {
      setTable(tabData?.table);
      setDesignData(tabData?.designData);
      if (tabData?.viewport) {
        setResetViewport(tabData?.viewport);
      }
      if (timer.current) {
        clearInterval(timer.current);
      }
      if (tabData?.nodes?.length > 30 || copiedNode?.length > 0) {
        let index = 0;
        const totalNodes = tabData?.nodes.length;
        // const batchSize = 100;

        setLockScreen(true);
        timer.current = setInterval(() => {
          if (index < totalNodes) {
            setNodes(tabData?.nodes);
            index = totalNodes;

            // const nextNodes = tabData?.nodes.slice(index, index + batchSize);
            // setNodes((currentNodes) => {
            //   if (index === 0) {
            //     return nextNodes;
            //   }
            //   return [...currentNodes, ...nextNodes];
            // });
            // index += batchSize;
          } else {
            setLockScreen(false);
            clearInterval(timer.current);
          }
        }, 0);
      } else {
        setLockScreen(false);
        setNodes(tabData?.nodes);
      }
      setEdges(tabData?.edges);
      initHistory({
        nodes: tabData?.nodes,
        edges: tabData?.edges,
      });
      setOutputLogs(tabData?.outputLogs);

      updateVariableFlow({
        list: tabData?.variables,
      });
      eventBus.emit('update_ruleset_data', tabData?.designData);
    };
    if (tabData?.hasData && tabId) {
      getWorkFlow();
    }

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId, tabData]);

  useEffect(() => {
    if (resetViewport) {
      reactFlowInstance?.setViewport(resetViewport);
    }
  }, [reactFlowInstance, resetViewport]);

  useEffect(() => {
    const handleSaveTabData = () => {
      setWfInfo(null);
      updataStatusEditingWF(false);
      updateWorkflowEdit(null);
      updateVariableFlow({
        list: [],
        dataFlow: null,
      });
      updateResources({
        list: [],
      });

      if (variableTemplateMode === 'designer') {
        eventBus.emit('update_design_data');
        setDesignData((prev) => ({ ...prev }));
      }

      eventBus.emit('saveTabData', {
        id: tabId,
        data: {
          ...tabData,
          nodes,
          edges,
          variables: variableFlow?.list,
          table,
          designData,
          outputLogs,
          hasData: true,
          viewport: reactFlowInstance?.getViewport(),
        },
      });
    };

    eventBus.on('change-tab', handleSaveTabData);
    return () => {
      eventBus.removeListener('change-tab', handleSaveTabData);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    designData,
    edges,
    nodes,
    outputLogs,
    tabData,
    tabId,
    table,
    variableFlow?.list,
    variableTemplateMode,
    copiedNode?.length,
  ]);

  const handleRecord = (data) => {
    console.log(data);
    // if (isElectron()) {
    //   window.rpaAPI.startRecorder({
    //     profileId: parseInt(data?.profile, 10),
    //   });
    //   recordModal.onFalse();
    // }
  };

  const validateFlowChart = useCallback(
    (listNode, listEdge, action = 'save') => {
      const connectedNode = getConnectedNodes('start_node', listNode, listEdge);

      if (connectedNode.length === 0) {
        enqueueSnackbar(t('systemNotify.warning.minimumAction'), {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
          style: {
            minWidth: 'fit-content',
          },
          SnackbarProps: {
            style: {
              minWidth: 'fit-content',
            },
          },
        });
        return false;
      }

      const errorStatus = NodeFlowchartValidation(connectedNode);
      if (errorStatus || connectedNode.length === 0) {
        enqueueSnackbar(
          t(
            action === 'save'
              ? 'systemNotify.warning.fullFillData.save'
              : 'systemNotify.warning.fullFillData.run'
          ),
          {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
            style: {
              minWidth: 'fit-content',
            },
            SnackbarProps: {
              style: {
                minWidth: 'fit-content',
              },
            },
          }
        );
        return false;
      }

      return true;
    },
    [t]
  );

  const handleOpenOutput = useCallback(() => {
    setAnchorElMore(null);
    setOpenOutput(true);
    setSizes(['60%', '40%']);
  }, []);

  const downloadBrowserIfNeeded = async (kernelVersion) => {
    const kernelVersionResponse = await getKernelVersionByIdApi(kernelVersion.id);
    if (kernelVersionResponse?.data) {
      window.ipcRenderer.send('download-browser', kernelVersionResponse.data);
      setStorage(IS_BROWSER_DOWNLOADING, 'yes');
    }
  };

  const handleRun = useCallback(
    async (data) => {
      try {
        const response = await checkRunWorkflowPermissionApi(workspaceId);
        if (!response?.data?.status) {
          throw new Error('Permission denied');
        }
      } catch (error) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.workflow.run'), {
          variant: 'error',
        });
        return;
      }

      const profileRespone = await getProfileByIdApi(workspaceId, data?.profile);
      const profile = profileRespone?.data;
      const isDownloaded = await window.ipcRenderer.invoke('check-browser-download', {
        browser_type: profile.kernel_version.type,
        kernel_version: profile.kernel_version.kernel,
      });

      if (!isDownloaded) {
        setBrowserDownloadName(transformKernelVersionToBrowserName(profile.kernel_version));
        setDownloading(true);
        await downloadBrowserIfNeeded(profile.kernel_version);
        return;
      }

      // eslint-disable-next-line consistent-return
      if (!validateFlowChart(nodes, edges, 'run')) return false;

      let nodes_list = nodes;
      let edges_list = edges;

      if (wfInfo?.is_encrypted) {
        const flow_data = await window.ipcRenderer.invoke('decrypt-flow', {
          nodes: wfInfo.content.nodes,
          edges: wfInfo.content.edges,
        });
        nodes_list = JSON.parse(flow_data.nodes);
        edges_list = JSON.parse(flow_data.edges);
      }
      const engine = new WorkflowEngine({
        drawflow: {
          nodes: nodes_list,
          edges: edges_list,
        },
        variables: variableFlow?.list,
        debugMode: !!debugMode,
        triggerId,
      });

      engine.init();

      removeStorage('variableState');
      setExecuteNode([startNode]);
      setExecuteFinish(false);

      if (isElectron()) {
        setRunStatus('loading');

        if (!openOutput) {
          handleOpenOutput();
        }

        let globalData = [];
        if (variableFlow?.list && variableFlow.list.length > 0) {
          globalData = variableFlow.list.map((i) => ({
            key: i.key,
            value: i.value,
            type: i.type,
            jsonValue: i.jsonValue,
            defaultValue: i.defaultValue,
          }));
        }

        runningModal.onFalse();
        setTriggerId(null);

        setTimeout(() => {
          setRunStatus((prev) => (prev === 'loading' ? 'running' : 'idle'));
        }, 3000);

        try {
          const { script } = engine;
          window.ipcRenderer.send('run-script-editor', {
            profileData: profileRespone?.data,
            script,
            global_data: globalData,
            isEncrypted: wfInfo?.is_encrypted,
            scriptConfig,
            isFlow: true,
            design_data: wfInfo?.design_data,
          });
        } catch (error) {
          console.log('error', error);
        }
      }
    },
    [
      t,
      debugMode,
      edges,
      handleOpenOutput,
      nodes,
      openOutput,
      runningModal,
      scriptConfig,
      triggerId,
      validateFlowChart,
      variableFlow?.list,
      workspaceId,
      wfInfo,
    ]
  );

  const stopScript = useCallback(async () => {
    if (isElectron()) {
      setRunStatus('loading');
      await window.ipcRenderer.invoke('stop-script-editor');
      setRunStatus('idle');
    }
  }, []);

  const onConfirmSave = (data) => {
    eventBus.emit('saveTabData', {
      id: tabId,
      data: {
        workflowName: data.name,
        idFlowChart: data.id,
        nodes,
        edges,
        variables: variableFlow?.list,
        table,
        designData: data.design_data,
        outputLogs,
      },
    });
  };

  // eslint-disable-next-line consistent-return
  const saveFlowChart = useCallback(
    async (ruleset) => {
      if (!validateFlowChart(nodes, edges)) return false;

      // const engine = new WorkflowEngine({
      //   drawflow: {
      //     nodes,
      //     edges,
      //   },
      // });

      // engine.init();

      // console.log(engine.script);

      let design_data = '';

      if (ruleset?.id) {
        design_data = ruleset;
      } else {
        design_data = designData;
      }

      let inputValidateError = [];
      let variableData = [];

      if (variableFlow?.dataFlow?.is_encrypted) {
        const addVariablesToMap = (children, acc) => {
          children.forEach((child) => {
            if (child.config?.variable?.id) {
              acc[child.config.variable.id] = {
                ...child.config,
                id: child.id,
              };
            }
          });
        };

        const handleGroupChildren = (group, acc) => {
          if (group.name === 'Group' && Array.isArray(group.children)) {
            addVariablesToMap(group.children, acc);
          }
        };

        const rulesetMap = (design_data?.children || []).reduce((acc, item) => {
          if (item.name === 'Group' && Array.isArray(item.children)) {
            addVariablesToMap(item.children, acc);
          } else if (item.name === 'Grid' && Array.isArray(item.children)) {
            item.children.forEach((child) => handleGroupChildren(child, acc));
          } else if (item.config?.variable?.id) {
            acc[item.config.variable.id] = {
              ...item.config,
              id: item.id,
            };
          }
          return acc;
        }, {});

        variableData = variableFlow?.list.map((item) => {
          const config = rulesetMap[item.id];
          if (config) {
            return {
              ...item,
              value: item?.type === 'number' ? Number(config?.defaultValue) : config?.defaultValue,
              ...(item?.type === 'range' && {
                value: {
                  min: Number(config?.defaultMin),
                  max: Number(config?.defaultMax),
                },
              }),
              rulesetId: config?.id,
              is_required: config?.isRequired,
            };
          }
          return item;
        });

        inputValidateError = variableData
          .map((item) =>
            item.is_required &&
            (typeof item.value === 'object' ? item.value.length === 0 : !item.value)
              ? item.rulesetId
              : ''
          )
          .filter((item) => item);
        setInputValidate(inputValidateError);
        if (inputValidateError.length > 0) return false;
      }

      let payload = {};

      if (variableFlow?.dataFlow?.is_encrypted) {
        payload = {
          global_data: design_data?.children?.length > 0 ? variableData : variableFlow?.list || [],
        };
      } else {
        payload = {
          config: workflowEditable?.config,
          name: workflowEditable?.name,
          content: {
            nodes:
              nodes.length > 0
                ? JSON.stringify(
                    nodes.map(({ data, ...item }) => ({
                      ...item,
                      data: {
                        alias: data.alias,
                      },
                      selected: false,
                    }))
                  )
                : '',
            edges: edges.length > 0 ? JSON.stringify(edges) : '',
          },
          global_data: [...(variableFlow?.list || [])],
          workflow_group: Number(workflowEditable?.workflow_group),
          table,
          design_data,
        };
      }

      try {
        setLoading(true);

        if (tabData?.idFlowChart) {
          await updateWorkFlow(workspaceId, tabData?.idFlowChart, payload);
          enqueueSnackbar(t('systemNotify.success.update'), {
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
            style: {
              minWidth: 'fit-content',
            },
            SnackbarProps: {
              style: {
                minWidth: 'fit-content',
              },
            },
          });

          if (variableFlow?.dataFlow?.is_encrypted) {
            updateVariableFlow({
              list: variableData,
            });
          }

          return true;
        }

        addForm.onTrue();
        setSavingPayload({
          config: WORKFLOW_CONFIG,
          content: {
            nodes:
              nodes.length > 0
                ? JSON.stringify(
                    nodes.map(({ data, ...item }) => ({
                      ...item,
                      data: {
                        alias: data.alias,
                      },
                      selected: false,
                    }))
                  )
                : '',
            edges: edges.length > 0 ? JSON.stringify(edges) : '',
          },
          table,
          design_data,
        });
        return false;
      } catch (error) {
        console.log('error', error);
        if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
          enqueueSnackbar(t('systemNotify.warning.notPermission.workflow.update'), {
            variant: 'error',
          });
        }
        return false;
      } finally {
        updataStatusEditingWF(false);
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      edges,
      tabData?.idFlowChart,
      nodes,
      t,
      table,
      designData,
      // updataStatusEditingWF,
      variableFlow?.list,
      workflowEditable?.config,
      workflowEditable?.id,
      workflowEditable?.name,
      workflowEditable?.workflow_group,
      workspaceId,
      debugMode,
    ]
  );

  useEventListener('keydown', (event) => {
    try {
      if (
        event.ctrlKey &&
        !['INPUT', 'TEXTAREA'].includes(event.target.nodeName) &&
        !event.target.className?.includes('simplebar-content-wrapper') &&
        !event.target.className?.includes('ql-editor')
      ) {
        if (event.key === 's') {
          // event.preventDefault();
          // event.stopPropagation();
          saveFlowChart();
        } else if (event.key === 'c') {
          // event.preventDefault();
          // event.stopPropagation();
          handleCopyNode('hotKey');
        } else if (event.key === 'v') {
          // event.preventDefault();
          // event.stopPropagation();
          handlePasteNode();
        }
      }
    } catch (error) {
      /* empty */
    }
  });

  const handleCloseOutput = useCallback(() => {
    setOpenOutput(false);
    setOutputLogs([]);
    setSizes(['100%', 0]);
  }, []);

  useEffect(() => {
    if (isElectron()) {
      window.ipcRenderer.on('log-runner-for-editor', (event, data) => {
        setOutputLogs((prev) => [...prev, data]);
      });
    }
  }, []);

  useEffect(
    () => () => {
      if (isElectron()) {
        window.ipcRenderer.send('kill-runner-editor');
      }
    },
    []
  );

  const handleFillScreen = (type) => {
    if (type === 'full') {
      setSizes([0, '100%']);
    } else {
      setSizes(['60%', '40%']);
    }
  };

  useEffect(() => {
    const handleEventOpenOutput = () => {
      handleOpenOutput();
    };
    eventBus.on('openOutput', handleEventOpenOutput);

    return () => {
      eventBus.removeListener('openOutput', handleEventOpenOutput);
    };
  }, [handleOpenOutput]);

  const applyDagreLayoutOnSelectedNodes = useCallback((listNodes, listEdges, direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph({ compound: true });
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({
      rankdir: direction,
    });

    const selectedNodes = listNodes.filter((node) => node.selected);
    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));

    const nodeGroups = selectedNodes.reduce((acc, node) => {
      const groupId = node.parentId || 'ungrouped';
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push(node);
      return acc;
    }, {});

    if (selectedNodes.length < 2) {
      return { nodes: listNodes, edges: listEdges };
    }

    Object.entries(nodeGroups).forEach(([groupId, groupNodes]) => {
      if (groupId === 'ungrouped') {
        groupNodes.forEach((node) => {
          dagreGraph.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 150,
            height: node.measured?.height ?? 40,
          });
        });
      } else {
        const groupedNode = listNodes.find((n) => n.id === groupId);
        if (groupedNode) {
          dagreGraph.setNode(groupId, {
            ...groupedNode,
            width: groupedNode.style?.width ?? 0,
            height: groupedNode.style?.height ?? 0,
          });
        }
      }
    });

    const sortEdges = sortEdgesForLayoutAttempt(listEdges);
    sortEdges.forEach((edge) => {
      const sourceGroupId = listNodes.find((n) => n.id === edge.source)?.parentId;
      const targetGroupId = listNodes.find((n) => n.id === edge.target)?.parentId;

      if (selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)) {
        const sourceId = sourceGroupId || edge.source;
        const targetId = targetGroupId || edge.target;
        if (sourceId !== targetId) {
          dagreGraph.setEdge(sourceId, targetId);
        }
      }
    });

    try {
      dagre.layout(dagreGraph);
    } catch (e) {
      return { nodes: listNodes, edges: listEdges };
    }

    const firstGroup = Object.values(nodeGroups)[0][0];
    const firstLayoutNode = dagreGraph.node(firstGroup.parentId || firstGroup.id);

    if (!firstLayoutNode) {
      return { nodes: listNodes, edges: listEdges };
    }

    const firstNodeWidth = firstGroup.parentId
      ? listNodes.find((n) => n.id === firstGroup.parentId).style?.width ?? 0
      : firstGroup.measured?.width ?? 150;
    const firstNodeHeight = firstGroup.parentId
      ? listNodes.find((n) => n.id === firstGroup.parentId).style?.height ?? 0
      : firstGroup.measured?.height ?? 40;

    const xOffset = firstGroup.position.x - (firstLayoutNode.x - firstNodeWidth / 2);
    const yOffset = firstGroup.position.y - (firstLayoutNode.y - firstNodeHeight / 2);

    const updatedNodes = listNodes.map((node) => {
      if (!node.selected) {
        return node;
      }

      if (node.type === 'group') {
        const layoutNode = dagreGraph.node(node.id);
        if (!layoutNode) return node;

        const newX = layoutNode.x - (node.style?.width ?? 0) / 2 + xOffset;
        const newY = layoutNode.y - (node.style?.height ?? 0) / 2 + yOffset;

        return { ...node, position: { x: newX, y: newY } };
      }

      if (!node.parentId) {
        const layoutNode = dagreGraph.node(node.id);
        if (!layoutNode) return node;

        const nodeWidth = node.measured?.width ?? 150;
        const nodeHeight = node.measured?.height ?? 40;

        const newX = layoutNode.x - nodeWidth / 2 + xOffset;
        const newY = layoutNode.y - nodeHeight / 2 + yOffset;

        return { ...node, position: { x: newX, y: newY } };
      }

      return node;
    });

    return {
      nodes: updatedNodes,
      edges: listEdges,
    };
  }, []);

  const [previewNodePosition, setPreviewNodePosition] = useState({});

  const [selectionMode, setSelectionMode] = useState(false);
  const [, setSelectedNodes] = useState(new Set());

  const onSelectionStart = useCallback((event) => {
    setSelectionMode(true);
  }, []);

  const onSelectionEnd = useCallback((event) => {
    setSelectionMode(false);
  }, []);

  const onSelectionChange = useCallback(
    ({ nodes: newSelectedNodes }) => {
      if (!selectionMode) {
        // If not in selection mode, just update with new nodes
        setSelectedNodes(new Set(newSelectedNodes.map((node) => node.id)));
        return;
      }

      // In selection mode, combine existing and new selections
      setSelectedNodes((prevSelected) => {
        const updatedSelection = new Set(prevSelected);
        newSelectedNodes.forEach((node) => {
          updatedSelection.add(node.id);
        });

        // Update node selection state
        setNodes((nod) =>
          nod.map((node) => ({
            ...node,
            selected: updatedSelection.has(node.id),
          }))
        );

        return updatedSelection;
      });
    },
    [selectionMode, setNodes]
  );

  const nodeDragStartPosition = useRef(null);

  const onNodeDragStart = useCallback(
    (event, currentNode) => {
      event.preventDefault();
      event.stopPropagation();
      reactFlowInstance?.updateNode(currentNode.id, (prevData) => ({
        ...prevData,
        extent: undefined,
      }));
      nodeDragStartPosition.current = {
        x: currentNode.position.x,
        y: currentNode.position.y,
      };
    },
    [reactFlowInstance]
  );

  const onNodeDrag = useCallback(
    (event, currentNode) => {
      event.preventDefault();
      event.stopPropagation();
      setPreviewNodePosition((prev) => {
        const updatedPositions = { ...prev };
        if (currentNode?.parentId && nodeDragStartPosition.current) {
          const parentNode = reactFlowInstance
            ?.getNodes()
            .find((node) => node.id === currentNode.parentId);
          if (parentNode) {
            updatedPositions[currentNode.parentId] = {
              x: parentNode.position.x + currentNode.position.x - nodeDragStartPosition.current.x,
              y: parentNode.position.y + currentNode.position.y - nodeDragStartPosition.current.y,
            };
          }
        } else {
          updatedPositions[currentNode.id] = {
            x: currentNode.position.x,
            y: currentNode.position.y,
          };
        }
        return updatedPositions;
      });
    },
    [reactFlowInstance]
  );

  const onNodeDragStop = useCallback(
    (event, node) => {
      event.preventDefault();
      event.stopPropagation();
      if (node.parentId && previewNodePosition[node.parentId]) {
        reactFlowInstance?.setNodes((nds) => {
          const newList = nds.map((n) =>
            n.id === node.parentId ? { ...n, position: previewNodePosition[node.parentId] } : n
          );
          setHistory({
            nodes: newList,
            edges,
          });

          return newList;
        });
      } else {
        reactFlowInstance?.setNodes((nds) => {
          const newList = nds.map((n) =>
            n.id === node.id ? { ...n, position: node.position } : n
          );
          setHistory({
            nodes: newList,
            edges,
          });

          return newList;
        });
      }

      setPreviewNodePosition({});

      reactFlowInstance?.updateNode(node.id, (prevData) => ({
        ...prevData,
        extent: 'parent',
      }));
      nodeDragStartPosition.current = null;
    },
    [previewNodePosition, reactFlowInstance, setHistory, edges]
  );

  const onSelectionDrag = useCallback((event, listNode) => {
    event.preventDefault();
    event.stopPropagation();
    setPreviewNodePosition((prev) => {
      const updatedPositions = { ...prev };
      listNode.forEach((node) => {
        updatedPositions[node.id] = node.position;
      });
      return updatedPositions;
    });
  }, []);

  const onSelectionDragStop = useCallback(
    (event, listNode) => {
      event.preventDefault();
      event.stopPropagation();
      setNodes((nds) =>
        nds.map((n) => {
          const nodeBeingUpdated = listNode.find((upd) => upd.id === n.id);
          if (nodeBeingUpdated) {
            return {
              ...n,
              position: nodeBeingUpdated.position,
            };
          }
          return n;
        })
      );

      // Dọn dẹp vị trí preview sau khi dừng kéo
      setPreviewNodePosition((prev) => {
        const updated = { ...prev };
        listNode.forEach((node) => {
          delete updated[node.id];
        });
        return updated;
      });
    },
    [setNodes]
  );

  const customNodes = useMemo(
    () =>
      nodes.map((node) => {
        const previewPosition = previewNodePosition[node.id];
        return {
          ...node,
          position: previewPosition || node.position,
          className: previewPosition
            ? 'node-preview'
            : (node.className || '').replace('node-preview', ''),
        };
      }),
    [nodes, previewNodePosition]
  );

  const handleNodesChange = useCallback(
    (changes) => {
      const filteredChanges = changes.filter((change) => change.type !== 'position');
      if (filteredChanges.length > 0) {
        onNodesChange(filteredChanges);
      }
    },
    [onNodesChange]
  );

  const handleEdgeChange = useCallback(
    (changes) => {
      const filteredChanges = changes.filter((change) => change.type !== 'position');
      if (filteredChanges.length > 0) {
        onEdgesChange(filteredChanges);
      }
    },
    [onEdgesChange]
  );

  const workflowEncrypted = useMemo(
    () => !wfInfo?.id || (wfInfo?.id && !wfInfo?.is_encrypted),
    [wfInfo?.id, wfInfo?.is_encrypted]
  );

  useEffect(
    () => () => {
      updataStatusEditingWF(false);
      updateWorkflowEdit(null);
      updateVariableFlow({
        list: [],
        dataFlow: null,
      });
      updateResources({
        list: [],
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const renderDialog = (
    <>
      <ShareWorkflowDialog
        open={shareModal.value}
        onClose={shareModal.onFalse}
        shareItem={workflowEditable}
      />
      <PublishWorkflowDialog
        open={publishModal.value}
        onClose={publishModal.onFalse}
        workflowInfo={wfInfo}
        handleReloadData={getDetail}
        type="flow"
      />
      <PendingWorkflowDialog
        open={pendingModal.value}
        onClose={pendingModal.onFalse}
        workflowInfo={wfInfo}
        handleReloadData={getDetail}
      />
      <RejectedWorkflowDialog
        open={rejectedModal.value}
        onClose={rejectedModal.onFalse}
        workflowInfo={wfInfo}
        handleReloadData={getDetail}
      />
      <UpdateVersionDialog
        open={uploadModal.value}
        onClose={uploadModal.onFalse}
        currentVersion={workflowEditable?.public_workflow?.current_version}
        publicWorkflowId={wfInfo?.public_workflow?.id}
        last_update={wfInfo?.public_workflow?.last_update}
      />
      <Resource open={resourceModal.value} onClose={resourceModal.onFalse} />
      <Variables
        open={variableModal.value}
        onClose={variableModal.onFalse}
        isFromMarket={Boolean(workflowEditable?.source_workflow)}
        hiddenUiSetting
      />
      <TableDialog
        open={tableModal.value}
        onClose={tableModal.onFalse}
        table={table}
        setTableData={setTable}
      />
      <DownloadDialog
        downloading={downloading}
        setDownloading={setDownloading}
        downloadProgressPercent={downloadProgressPercent}
        extractionStatus={extractionStatus}
        browserDownloadName={browserDownloadName}
      />
    </>
  );

  return (
    <>
      {variableTemplateMode === 'editor' && (
        <ButtonBar
          idFlowChart={tabData?.idFlowChart}
          wfInfo={wfInfo}
          onShareModel={shareModal.onTrue}
          handlePublishModel={publishModal.onTrue}
          handlePendingModel={pendingModal.onTrue}
          handleRejectModel={rejectedModal.onTrue}
          handleUploadModel={uploadModal.onTrue}
          handleVariableModel={variableModal.onTrue}
          onTableModal={tableModal.onTrue}
          runStatus={runStatus}
          loading={loading}
          stopScript={stopScript}
          handleRunningModel={runningModal.onTrue}
          saveFlowChart={saveFlowChart}
          anchorMore={anchorMore}
          setAnchorElMore={setAnchorElMore}
          handleOpenOutput={handleOpenOutput}
          openSettingVSCode={openSettingVSCode}
          canRedo={canRedo}
          canUndo={canUndo}
          redo={redo}
          undo={undo}
          reactFlowInstance={reactFlowInstance}
        />
      )}
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        sx={{
          height: 1,
          px: '0px!important',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* <AlertDialogAdvanced
          isBlocking={statusEditingWF}
          isSaveBeforeLeave
          onSave={saveFlowChart}
          isSaving={loading}
        /> */}

        {workflowEncrypted && !tabData?.isEncrypted && (
          <ToggleButtonGroup
            sx={{
              position: 'absolute',
              top: { sm: 60, md: 2 },
              right: {
                sm: `calc(50% - ${sidebarAble[0] / 2}px)`,
                // md: `calc(50% - ${sidebarAble[0] / 2}px + ${tabData?.idFlowChart ? 100 : 40}px + ${
                //   wfInfo?.is_public && wfInfo?.public_workflow?.status === 'approved' ? 16 : 0
                // }px)`,
                // xl: `calc(50% - ${sidebarAble[0] / (tabData?.idFlowChart ? 6 : 3)}px)`,
              },
              transform: 'translateX(50%)',
              zIndex: 99,
              borderRadius: '4px',
            }}
            value={variableTemplateMode}
            size="small"
            exclusive
            onChange={(_, newValue) => {
              if (newValue) {
                if (newValue === 'editor') {
                  eventBus.emit('update_design_data');
                } else {
                  eventBus.emit('update_ruleset_data', designData);
                }
                setVariableTemplateMode(newValue);
              }
            }}
            aria-label="text alignment"
          >
            <ToggleButton
              value="editor"
              sx={{
                py: 0.4,
                borderRadius: '4px!important',
              }}
            >
              <Iconify
                icon="fluent:flowchart-16-regular"
                width={18}
                height={18}
                sx={{
                  mr: 0.5,
                }}
              />
              Editor
            </ToggleButton>
            <ToggleButton
              value="designer"
              sx={{
                py: 0.4,
                borderRadius: '4px!important',
              }}
            >
              <Iconify
                icon="fluent:pen-sparkle-16-filled"
                width={18}
                height={18}
                sx={{
                  mr: 0.5,
                }}
              />
              Designer
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        {!(wfInfo?.id && wfInfo?.is_encrypted) && (
          <CreateVariablesTemplate
            variableTemplateMode={variableTemplateMode}
            wfInfo={wfInfo}
            saveFlowChart={saveFlowChart}
            loading={loading}
            designData={designData}
            setDesignData={setDesignData}
            onShareModal={shareModal.onTrue}
            onPublishModal={publishModal.onTrue}
            onPendingModal={pendingModal.onTrue}
            onRejectedModal={rejectedModal.onTrue}
            onUploadModal={uploadModal.onTrue}
            idWorkflow={tabData?.idFlowChart}
            onVariableModal={variableModal.onTrue}
            tabId={tabId}
          />
        )}

        <Stack
          className="dndflow"
          height={1}
          sx={{
            ...(variableTemplateMode === 'editor' && {
              transform: `translateY(-100%)`,
              ...(wfInfo?.id &&
                wfInfo?.is_encrypted && {
                  transform: `translateY(0)`,
                }),
            }),
          }}
        >
          <ReactFlowProvider>
            <Stack direction="row" style={{ height: '100%', position: 'relative' }}>
              {JSON.stringify(sidebarAble) === JSON.stringify([0, 'auto']) && (
                <Stack sx={{ position: 'absolute', top: 60, left: 0, zIndex: 10 }}>
                  <Tooltip title="Hiển thị thanh công cụ" arrow placement="top">
                    <IconButton
                      aria-label="share"
                      size="small"
                      sx={{
                        border: '1px solid',
                        borderLeft: 0,
                        borderRadius: 2,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        paddingX: '8px',
                        borderColor: alpha(theme.palette.grey[500], 0.32),
                        bgcolor: alpha(theme.palette.grey[600]),
                      }}
                      onClick={() => {
                        setStorage('sidebar-size', {
                          flowchart: xlUp ? [300, 'auto'] : [200, 'auto'],
                        });

                        setSidebarAble(xlUp ? [300, 'auto'] : [200, 'auto']);
                        setStorage(GROUP_INVISIBLE, {
                          ...defaultGroupInVisible,
                          flow: false,
                        });
                      }}
                    >
                      <Iconify
                        icon="lsicon:double-arrow-right-outline"
                        color="text.primary"
                        width={24}
                        height={24}
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
              <SplitPane
                split="vertical"
                sizes={workflowEncrypted && !tabData?.isEncrypted ? sidebarAble : [0, 'auto']}
                onChange={(values) => {
                  if (values?.[0] <= 120) {
                    setStorage('sidebar-size', { flowchart: [0, 'auto'] });
                    setSidebarAble([0, 'auto']);
                  } else if (values?.[0] >= 200) {
                    setStorage('sidebar-size', { flowchart: values });
                    setSidebarAble(values);
                  }
                }}
              >
                {(workflowEncrypted || !wfInfo?.id) && !tabData?.isEncrypted ? (
                  <Pane maxSize="50%">
                    <Stack
                      direction="column"
                      justifyContent="flex-start"
                      sx={{
                        width: '100%',
                        minWidth: '200px',
                        height: 1,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                        width={1}
                      >
                        {!tabData?.idFlowChart && wfInfo?.name && (
                          <Tooltip
                            title={wfInfo?.name ?? ''}
                            placement="top"
                            slotProps={{
                              popper: {
                                modifiers: [
                                  {
                                    name: 'offset',
                                    options: {
                                      offset: [0, -14],
                                    },
                                  },
                                ],
                              },
                            }}
                          >
                            <Typography
                              variant="h5"
                              lineHeight="36px"
                              className="no-select"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                pr: 2,
                              }}
                            >
                              {wfInfo?.name}
                            </Typography>
                          </Tooltip>
                        )}
                      </Stack>
                      <Stack height={1}>
                        <Sidebar
                          nodes={nodes}
                          setSidebarAble={setSidebarAble}
                          defaultGroupInVisible={defaultGroupInVisible}
                        />
                      </Stack>
                    </Stack>
                  </Pane>
                ) : (
                  <Pane minSize={0} maxSize="0%" />
                )}

                <Pane>
                  <Stack
                    sx={{
                      width: 'calc(100% - 16px)',
                      height: 1,
                      position: 'relative',
                      ml: 2,
                    }}
                    spacing={1}
                  >
                    <FlowButton
                      idFlowChart={tabData?.idFlowChart}
                      nodes={nodes}
                      wfInfo={wfInfo}
                      onFocusNode={(nodeId) => {
                        handleHighlightNode(nodeId);
                        reactFlowInstance?.fitView({
                          nodes: [{ id: nodeId }],
                          duration: 600,
                          padding: 0.1,
                          maxZoom: 1.2,
                        });
                      }}
                    />

                    <SplitPane
                      split="horizontal"
                      sizes={sizes}
                      onChange={setSizes}
                      allowResize={openOutput}
                    >
                      <Pane>
                        <Stack
                          className="reactflow-wrapper"
                          ref={reactFlowWrapper}
                          sx={{
                            overflow: 'hidden',
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.grey[500], 0.04),
                            border: `dashed 1px ${theme.palette.divider}`,
                            width: '100%',
                            height: '100%',
                            minWidth: '100px',
                            minHeight: '100px',
                            '& .react-flow__panel': {
                              borderRadius: 1,
                              overflow: 'hidden',
                              boxShadow: theme.customShadows.z8,
                              border: `dashed 1px ${theme.palette.divider}`,
                              '&.react-flow__attribution': {
                                display: 'none',
                              },
                              '& button': {
                                bgcolor: alpha(theme.palette.grey[500], 0.32),
                                color: 'text.primary',
                                borderBottom: 'none',
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                                },
                                path: {
                                  fill: 'currentColor',
                                },
                              },
                            },
                          }}
                        >
                          {fetching || lockScreen ? (
                            <LoadingScreen />
                          ) : (
                            <>
                              {workflowEncrypted ? (
                                <>
                                  <FlowChartView
                                    elementRef={elementRef}
                                    customNodes={customNodes}
                                    edges={edges}
                                    handleNodesChange={handleNodesChange}
                                    onEdgesChange={handleEdgeChange}
                                    onConnect={onConnect}
                                    setReactFlowInstance={setReactFlowInstance}
                                    ConnectionLine={ConnectionLine}
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                    nodeTypes={nodeTypes}
                                    edgeTypes={edgeTypes}
                                    onNodeDragStart={onNodeDragStart}
                                    onNodeDrag={onNodeDrag}
                                    onNodeDragStop={onNodeDragStop}
                                    onSelectionDrag={onSelectionDrag}
                                    onSelectionDragStop={onSelectionDragStop}
                                    onPaneClick={onPaneClick}
                                    onNodeContextMenu={onNodeContextMenu}
                                    onSelectionContextMenu={onSelectClick}
                                    handlePanelClick={handlePanelClick}
                                    onChartClick={onChartClick}
                                    setNodes={setNodes}
                                    onSelectionStart={onSelectionStart}
                                    onSelectionEnd={onSelectionEnd}
                                    onSelectionChange={onSelectionChange}
                                    // onMouseMove={onMouseMove}
                                  />{' '}
                                  {isElectronEnv && (
                                    <Tooltip
                                      title={
                                        settings.isFullScreen ? 'Exit fullscreen' : 'Fullscreen'
                                      }
                                    >
                                      <IconButton
                                        sx={{
                                          position: 'absolute',
                                          bottom: 10,
                                          right: 10,
                                          zIndex: 10,
                                          bgcolor: alpha(theme.palette.grey[500], 0.32),
                                          borderRadius: 1,
                                          p: 0.5,
                                          boxShadow: theme.customShadows.z8,
                                          border: `dashed 1px ${theme.palette.divider}`,
                                          '&:hover': {
                                            bgcolor: alpha(theme.palette.grey[500], 0.08),
                                          },
                                        }}
                                        onClick={() =>
                                          settings.onUpdate('isFullScreen', !settings.isFullScreen)
                                        }
                                      >
                                        <Iconify
                                          icon={
                                            settings.isFullScreen
                                              ? 'material-symbols:fullscreen-exit'
                                              : 'material-symbols:fullscreen'
                                          }
                                          width={18}
                                          color="text.primary"
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </>
                              ) : (
                                <Stack height={1} mt={6}>
                                  <Tabs
                                    value={currentTab}
                                    onChange={handleChangeTab}
                                    sx={{
                                      px: 2,
                                      boxShadow: `inset 0 -2px 0 0 ${alpha(
                                        theme.palette.grey[500],
                                        0.08
                                      )}`,
                                      bgcolor: 'transparent',
                                      '& .MuiButtonBase-root.MuiTabScrollButton-root.MuiTabScrollButton-horizontal.MuiTabs-scrollButtons':
                                        {
                                          display: 'none',
                                        },
                                    }}
                                  >
                                    {TABS.map((tab) => (
                                      <Tab
                                        sx={{
                                          '&.MuiButtonBase-root ': {
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                          },
                                        }}
                                        key={tab.value}
                                        label={tab.label}
                                        icon={tab.icon}
                                        value={tab.value}
                                      />
                                    ))}
                                  </Tabs>

                                  {currentTab === 'run_config' && (
                                    <>
                                      {designData && designData?.children?.length > 0 ? (
                                        <WorkflowRunningConfig
                                          ruleset={designData}
                                          setRuleset={setDesignData}
                                          inputValidate={inputValidate}
                                          setInputValidate={setInputValidate}
                                        />
                                      ) : (
                                        <RunConfigTab />
                                      )}
                                    </>
                                  )}

                                  {currentTab === 'readme' && <ReadmeTab readme={wfInfo?.readme} />}
                                </Stack>
                              )}
                            </>
                          )}
                        </Stack>
                      </Pane>
                      <Pane
                        style={{ border: '1px solid #3e3d3e', zIndex: 20, position: 'relative' }}
                      >
                        <TabFlowRunning
                          handleCloseOutput={handleCloseOutput}
                          handleFillScreen={handleFillScreen}
                          executeNode={executeNode}
                          onChangeExecuteNode={handleChangeSetExecuteNode}
                          executeFinish={executeFinish}
                          setExecuteFinish={setExecuteFinish}
                          sizes={sizes}
                          outputLogs={outputLogs}
                          clearOutputLogs={() => setOutputLogs([])}
                          table={table}
                          nodes={nodes}
                          edges={edges}
                          handleHighlightNode={handleHighlightNode}
                          onFocusNode={(nodeId, maxZoom = 1.2) => {
                            reactFlowInstance?.fitView({
                              nodes: [{ id: nodeId }],
                              duration: 600,
                              padding: 0.1,
                              maxZoom,
                            });
                          }}
                          nodeSelected={nodeSelected}
                          setNodeSelected={setNodeSelected}
                        />
                      </Pane>
                    </SplitPane>
                  </Stack>
                </Pane>
              </SplitPane>
            </Stack>
            <LogList open={logListModal.value} onClose={logListModal.onFalse} />
            <RunningAutomation
              open={recordModal.value}
              onClose={recordModal.onFalse}
              handleSubmitForm={handleRecord}
            />
            <RunningAutomation
              open={runningModal.value}
              onClose={() => {
                runningModal.onFalse();
                setTriggerId(null);
              }}
              handleSubmitForm={handleRun}
            />
            {/* {addForm.value && ( */}
            <AddNewWorkflow
              open={addForm.value}
              onClose={addForm.onFalse}
              payload={savingPayload}
              mode="flowchart"
              onConfirmSave={onConfirmSave}
            />
            {/* )} */}

            <CustomMenuContext
              anchorEl={anchorEl ?? anchorElPane ?? anchorElSelect}
              options={(() => {
                if (anchorEl) {
                  if (anchorEl?.classList.contains('react-flow__node-group')) {
                    return optionsGroup;
                  }
                  return optionsNode;
                }
                if (anchorElPane) {
                  return optionsPane;
                }
                if (anchorElSelect) return optionsSelector;
                return [];
              })()}
              onClose={() => {
                if (anchorEl) {
                  onClickOutsideNode();
                } else if (anchorElPane) {
                  onClickOutsidePane();
                } else {
                  onClickOutsideSelect();
                }
              }}
              anchorReference="anchorPosition"
              anchorPosition={{
                top: contextMenuPosition?.mouseY ?? 0,
                left: contextMenuPosition?.mouseX ?? 0,
              }}
              style={{ pointerEvent: 'none' }}
            />

            <SettingAutomation
              open={settingVSCode.value}
              onClose={settingVSCode.onFalse}
              handleChangeEdgeType={handleChangeEdgeType}
            />
          </ReactFlowProvider>
        </Stack>
        {renderDialog}
      </Container>
    </>
  );
}

FlowView.propTypes = {
  tabData: PropTypes.object,
  tabId: PropTypes.string,
};
