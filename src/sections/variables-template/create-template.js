/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
import { ReactSortable } from 'react-sortablejs';
import cloneDeep from 'lodash/cloneDeep';
import {
  alpha,
  Stack,
  TextField,
  Button,
  Tooltip,
  IconButton,
  DialogContent,
  Divider,
  Dialog,
  DialogTitle,
  Typography,
  DialogActions,
  ButtonGroup,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useLocales } from 'src/locales';
import { enqueueSnackbar } from 'notistack';
import { useBoolean } from 'src/hooks/use-boolean';
import { useEventListener } from 'src/hooks/use-event-listener';
import useUndoRedoVariableUi from 'src/hooks/use-undo-redo-variable-ui';

import { useSettingsContext } from 'src/components/settings';
import OptionFields from './components/OptionFields';
import Sidebar from './components/Sidebar';

import { _OPTIONFIELDS } from './constants';

import './custom-style.css';
import {
  addColumnToGrid,
  duplicateItemById,
  findItemById,
  findParentAndRemove,
  showValueHasMinMax,
} from './utils';
import DividerContent from './content-in-template/divider-content';
import InputContent from './content-in-template/input-content';
import SelectContent from './content-in-template/select-content';
import CheckboxContent from './content-in-template/checkbox-content';
import SwitchContent from './content-in-template/switch-content';
import AlertContent from './content-in-template/alert-content';
import InlineContent from './content-in-template/inline-content';
import RadioContent from './content-in-template/radio-content';
import TextareaContent from './content-in-template/textarea-content';
import LinkContent from './content-in-template/link-content';
import TextContent from './content-in-template/text-content';
import InputNumberContent from './content-in-template/input-number-content';
import SliderContent from './content-in-template/slider-content';
import FileContent from './content-in-template/file-content';
import ImageContent from './content-in-template/image-content';
import HtmlContent from './content-in-template/html-content';
import Preview from './components/PreviewDialog';
import eventBus from '../script/event-bus';
import RangeContent from './content-in-template/range-content';

const getId = () => Math.floor(100000 + Math.random() * 900000);

export function dfs(obj, targetId) {
  if (obj.id === targetId) {
    return obj;
  }
  if (obj.type === 'GROUP') {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of obj.children) {
      const check = dfs(item, targetId);
      if (check) return check;
    }
  }
  return null;
}

export const contentMap = {
  Alert: AlertContent,
  Divider: DividerContent,
  Inline: InlineContent,
  Input: InputContent,
  'Input Number': InputNumberContent,
  Textarea: TextareaContent,
  Select: SelectContent,
  Checkbox: CheckboxContent,
  Radio: RadioContent,
  Switch: SwitchContent,
  Slider: SliderContent,
  Range: RangeContent,
  Link: LinkContent,
  Text: TextContent,
  File: FileContent,
  Image: ImageContent,
  Html: HtmlContent,
};

export function SortableGroup({
  group,
  updateGroupOrder,
  level = 0,
  selectingItem,
  clickOnItem,
  onDuplicate,
  onDelete,
  onExtraColumn,
  gutter = true,
  setHistory,
}) {
  const { children, id, config } = group;

  const handleChoose = (evt) => {
    const clickedItemId = evt.item.getAttribute('data-id');
    clickOnItem(clickedItemId);
  };

  return (
    <Stack
      className={`item-flow-template ${selectingItem?.id === id ? 'isSelecting' : ''}`}
      sx={{
        border: '1px solid lightgray',
        borderColor: 'text.secondary',
        borderStyle: level > 0 ? 'dashed' : '',
        height: 1,
        overflow: 'auto',
        ...(!gutter && {
          mb: '0px!important',
        }),
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ width: '100%', position: 'relative' }}>
        {level > 0 && !config?.hideLabel && (
          <Typography
            sx={{
              minWidth: '100px',
              width: `${config?.labelWidth}px`,
              transition: 'all 0.3s',
              flexShrink: 0,
            }}
          >
            {config?.name}
          </Typography>
        )}
        <Stack
          sx={{
            flex: '1',
            borderRadius: level !== 0 ? 1 : 0,
            border: level !== 0 && config?.showBorder && '1px solid lightgray',
            padding: level !== 0 && '10px',
            height: (level !== 0 && showValueHasMinMax([100, 1000], config?.height)) || 'auto',
            minHeight: '100px',
            maxWidth: showValueHasMinMax([100, 1000], config?.width),
            '& > div:first-of-type': {
              gap: group.name === 'Grid' && (config?.gap || 1),
            },
          }}
          className={group.name === 'Grid' && 'grid-option'}
        >
          <ReactSortable
            style={{
              height: level === 0 && 'calc(100vh - 240px)',
            }}
            onChoose={handleChoose}
            list={children ?? []}
            setList={(newChildren, _, { dragging }) => {
              // Clone item vào ruleset
              const updatedChildren = newChildren.map((child) => {
                if (child.clone) {
                  // Xóa thuộc tính clone khi item được kéo vào ruleset
                  return { ...child, clone: undefined };
                }
                return child;
              });

              updateGroupOrder(id, updatedChildren); // Cập nhật group order

              if (dragging && level === 0) {
                setHistory(updatedChildren);
              }
            }}
            group={{
              name: 'nested',
              pull: true, // Cho phép kéo từ ruleset
              put: group.name !== 'Grid', // Cho phép thả vào ruleset
            }}
            animation={150}
            fallbackOnBody
            dragHandleClass="drag-handle"
            swapThreshold={6.5}
          >
            {children.map((c) => {
              let content;

              if (c.type === 'GROUP')
                content = (
                  <SortableGroup
                    group={c}
                    updateGroupOrder={updateGroupOrder}
                    level={level + 1}
                    selectingItem={selectingItem}
                    clickOnItem={clickOnItem}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    onExtraColumn={onExtraColumn}
                    setHistory={setHistory}
                  />
                );
              if (c.type === 'ITEM') {
                const ContentComponent = contentMap[c.name];
                content = (
                  <Stack
                    className={`${c.class} shared item ${selectingItem} ${
                      (level + 1) % 2 === 0 ? 'bg' : ''
                    } `}
                  >
                    {ContentComponent && (
                      <ContentComponent
                        data={c}
                        selectingItem={selectingItem}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                      />
                    )}
                  </Stack>
                );
              }

              return (
                <Stack
                  key={c.id}
                  className={`common-item ${level > 0 ? c.class : ''} ${
                    c.isChildGrid && 'is-child-grid'
                  }`}
                >
                  {content}
                </Stack>
              );
            })}
          </ReactSortable>
        </Stack>
        {selectingItem?.id === id && (
          <Stack
            direction="row"
            sx={{
              position: 'absolute',
              bottom: '-10px',
              right: '0',
            }}
          >
            {group.type === 'GROUP' && group.name === 'Grid' && (
              <Tooltip title="Tạo cột" placement="top">
                <IconButton
                  onClick={(e) => {
                    e.preventDefault();
                    if (id) {
                      onExtraColumn(id);
                    }
                  }}
                >
                  <Iconify
                    icon="humbleicons:plus"
                    color="#0d936e"
                    sx={{
                      zIndex: -1,
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Nhân bản" placement="top">
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  if (id) {
                    onDuplicate(id);
                  }
                }}
              >
                <Iconify
                  icon="humbleicons:duplicate"
                  color="#0d936e"
                  sx={{
                    zIndex: -1,
                  }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xóa" placement="top">
              <IconButton onClick={() => onDelete(id)}>
                <Iconify
                  icon="material-symbols-light:delete-outline"
                  color="#0d936e"
                  sx={{
                    zIndex: -1,
                  }}
                />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

const CreateVariablesTemplate = React.memo(
  ({
    idWorkflow,
    variableTemplateMode,
    wfInfo,
    loading,
    saveFlowChart,
    designData,
    setDesignData,
    onShareModal,
    onPublishModal,
    onPendingModal,
    onRejectedModal,
    onUploadModal,
    onVariableModal,
    tabId,
  }) => {
    const { t } = useLocales();
    const theme = useTheme();
    const { themeLayout, isFullScreen } = useSettingsContext();
    const preview = useBoolean();
    const [assignedVariable, setAssignedVariable] = useState([]);

    // OTPIONS
    const [options, setOptions] = useState(_OPTIONFIELDS);

    const [search, setSearch] = useState('');

    // TEMPLATE
    const [ruleset, setRuleset] = useState(designData);

    const [selectingItem, setSelectingItem] = useState(null);

    const {
      initHistory,
      canUndo,
      canRedo,
      set: setHistory,
      undo,
      redo,
      elementRef,
    } = useUndoRedoVariableUi(ruleset, setRuleset, setSelectingItem);

    const clickOnItem = (id) => {
      const _find = findItemById(ruleset, Number(id));
      setSelectingItem(_find);
    };

    const handleFilters = (event) => {
      setSearch(event.target.value);
      const newList = [];
      for (let i = 0; i < options.length; i += 1) {
        const item = {
          ...options[i],
          display: options[i].name.toLowerCase().includes(event.target.value.toLowerCase()),
        };
        newList.push(item);
      }
      setOptions(newList);
    };

    const updateGroupOrder = (id, group) => {
      const _findParrent = findItemById(ruleset, id);

      if (_findParrent?.name === 'Group') {
        const checkAnyGrids = group.find((i) => i.name === 'Grid');
        if (checkAnyGrids) {
          enqueueSnackbar('The maximum number of grid is 1', { variant: 'warning' });
          return false;
        }
      }

      setRuleset((prevState) => {
        const newRuleset = { ...prevState }; // Sao chép state hiện tại

        const toUpdate = dfs(newRuleset, id); // Tìm nhóm cần cập nhật

        if (toUpdate?.type === 'GROUP') {
          toUpdate.children = group; // Cập nhật children của nhóm đó
        }

        setOptions(
          options.map((i) => ({
            ...i,
            id: getId(),
            children: i?.children ? i.children.map((j) => ({ ...j, id: getId() })) : [],
            display: i.name.toLowerCase().includes(search.toLowerCase()),
          }))
        );

        return newRuleset; // Trả về state đã cập nhật
      });

      return true;
    };

    const [updateHistory, setUpdateHistory] = useState(1);

    const onDuplicate = (id) => {
      const afterDuplicated = duplicateItemById(ruleset, id);
      updateGroupOrder(afterDuplicated?.id, afterDuplicated?.group);
      setUpdateHistory((prev) => prev + 1);
    };

    const onDelete = (id) => {
      const _afterDeleted = findParentAndRemove(ruleset, id, (variableId) => {
        setAssignedVariable((prev) => prev.filter((i) => i !== variableId));
      });
      updateGroupOrder(_afterDeleted?.id, _afterDeleted?.group);
      setSelectingItem(null);
      setUpdateHistory((prev) => prev + 1);
    };

    const onExtraColumn = (id) => {
      const afterAdded = addColumnToGrid(ruleset, id);
      updateGroupOrder(afterAdded?.id, afterAdded?.group);
    };

    const getTooltipTitle = useCallback(() => {
      let title = '';
      if (wfInfo?.source_workflow) {
        title = t('workflow.script.tooltip.noAvailableForDownload');
      } else if (wfInfo?.is_encrypted) {
        title = t('workflow.script.tooltip.noAvailableForEncrypt');
      }
      return title;
    }, [t, wfInfo?.is_encrypted, wfInfo?.source_workflow]);

    useEffect(() => {
      setHistory(cloneDeep(ruleset));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateHistory]);

    useEffect(() => {
      const handleUpdateRulesetData = (data) => {
        initHistory(data);
        setRuleset(data);
      };

      const handleUpdateDesignData = () => {
        setDesignData(ruleset);
      };
      eventBus.on('update_ruleset_data', handleUpdateRulesetData);
      eventBus.on('update_design_data', handleUpdateDesignData);

      return () => {
        eventBus.removeListener('update_ruleset_data', handleUpdateRulesetData);
        eventBus.removeListener('update_design_data', handleUpdateDesignData);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ruleset, setDesignData]);

    useEventListener('keydown', (event) => {
      if (event.key === 'Delete' && selectingItem?.id && variableTemplateMode === 'designer') {
        onDelete(selectingItem?.id);
      }
    });

    useEffect(() => {
      if (designData?.children?.length > 0 && assignedVariable.length === 0) {
        const getAssignedVariable = (data) => {
          if (data.type === 'GROUP') {
            data.children.forEach((item) => {
              if (item.type === 'ITEM') {
                if (item.config?.variable?.id) {
                  setAssignedVariable((prev) => [...prev, item.config.variable.id]);
                }
              } else {
                getAssignedVariable(item);
              }
            });
          } else if (data.type === 'GRID') {
            data.children.forEach((item) => {
              getAssignedVariable(item);
            });
          } else if (data.type === 'ITEM') {
            if (data.config?.variable?.id) {
              setAssignedVariable((prev) => [...prev, data.config.variable.id]);
            }
          }
        };
        getAssignedVariable(designData);
      }
    }, [assignedVariable.length, designData, designData?.children?.length]);

    useEffect(() => {
      const handleSaveTabData = () => {
        setSelectingItem(null);
        if (variableTemplateMode === 'designer') {
          eventBus.emit('saveTabData', {
            id: tabId,
            data: {
              designData: ruleset,
            },
          });
        }
      };

      eventBus.on('change-tab', handleSaveTabData);
      return () => {
        eventBus.removeListener('change-tab', handleSaveTabData);
      };
    }, [ruleset, setDesignData, tabId, variableTemplateMode]);

    return (
      <Stack
        gap={1}
        height={1}
        sx={{
          ...(variableTemplateMode === 'editor' && {
            transform: 'translateX(-100%)',
          }),
          zIndex: 999,
        }}
        direction="row"
      >
        <Stack
          direction="row"
          gap="8px"
          flexWrap="wrap"
          sx={{ width: '300px' }}
          // sx={{ height: `calc(100% - ${isEditFlow ? '80px' : '46px'})` }}
        >
          <TextField
            type="search"
            placeholder={`${t('workflow.script.actions.search')}...`}
            size="small"
            value={search}
            onChange={handleFilters}
            className="no-select"
            sx={{ width: '100%', pr: 2 }}
          />
          <Scrollbar
            sx={{
              mr: 1,
              pr: 1,
              height: 'calc(100% - 46px)',
            }}
          >
            <OptionFields options={options} />
          </Scrollbar>
        </Stack>
        <Stack sx={{ width: 1, height: 1, overflow: 'hidden' }} spacing={1}>
          <Stack
            direction="row"
            justifyContent="flex-end"
            sx={{
              // bgcolor: alpha(theme.palette.grey[600], 0.2),
              // padding: '10px',
              py: 0.5,
              borderRadius: 1,
              overflow: 'hidden',
              minHeight: '40px',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <ButtonGroup
                sx={{
                  border: '1px solid',
                  borderColor: alpha(theme.palette.grey[500], 0.32),
                  paddingX: '8px',
                  height: '34px',
                }}
              >
                <Tooltip title={t('workflow.script.actions.undo')} arrow placement="top">
                  <span>
                    <IconButton
                      aria-label="undo"
                      size="small"
                      sx={{
                        borderRadius: 1,
                        paddingX: '8px',
                        height: '34px',
                      }}
                      onClick={() => {
                        undo();
                      }}
                      disabled={!canUndo}
                    >
                      <Iconify
                        icon="lucide:undo-2"
                        color={canUndo ? 'text.primary' : 'text.disable'}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t('workflow.script.actions.redo')} arrow placement="top">
                  <span>
                    <IconButton
                      aria-label="redo"
                      size="small"
                      sx={{
                        borderRadius: 1,
                        paddingX: '8px',
                        height: '34px',
                      }}
                      onClick={() => {
                        redo();
                      }}
                      disabled={!canRedo}
                    >
                      <Iconify
                        icon="lucide:redo-2"
                        color={canRedo ? 'text.primary' : 'text.disable'}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
              </ButtonGroup>

              {wfInfo && (
                <Tooltip title={getTooltipTitle()} arrow placement="top">
                  <ButtonGroup
                    sx={{
                      border: '1px solid',
                      borderColor: alpha(theme.palette.grey[500], 0.32),
                      paddingX: '8px',
                      height: '34px',
                    }}
                  >
                    <Tooltip
                      title={
                        !wfInfo?.source_workflow &&
                        !wfInfo?.is_encrypted &&
                        t('workflow.script.actions.share')
                      }
                      arrow
                      placement="top"
                    >
                      <span
                        style={{
                          paddingTop: '2px',
                        }}
                      >
                        <IconButton
                          aria-label="share"
                          size="small"
                          sx={{
                            borderRadius: 1,
                            paddingX: '8px',
                            opacity:
                              wfInfo?.source_workflow ||
                              (!wfInfo?.source_workflow && wfInfo?.is_encrypted)
                                ? 0.5
                                : 1,
                          }}
                          onClick={onShareModal}
                          disabled={
                            wfInfo?.source_workflow !== null ||
                            (!wfInfo?.source_workflow && wfInfo?.is_encrypted)
                          }
                        >
                          <Iconify icon="material-symbols:share" color="text.primary" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip
                      title={
                        !wfInfo?.source_workflow &&
                        !wfInfo?.is_encrypted &&
                        // eslint-disable-next-line no-nested-ternary
                        (wfInfo?.is_public
                          ? // eslint-disable-next-line no-nested-ternary
                            wfInfo?.public_workflow?.status === 'pending'
                            ? t('workflow.script.actions.pending')
                            : wfInfo?.public_workflow?.status === 'rejected'
                              ? t('workflow.script.actions.rejected')
                              : t('workflow.script.actions.published')
                          : t('workflow.script.actions.publish'))
                      }
                      arrow
                      placement="top"
                    >
                      <span
                        style={{
                          paddingTop: '2px',
                        }}
                      >
                        <IconButton
                          aria-label="publish"
                          size="small"
                          sx={{
                            borderRadius: 1,
                            paddingX: '8px',
                            opacity:
                              wfInfo?.source_workflow ||
                              (!wfInfo?.source_workflow && wfInfo?.is_encrypted)
                                ? 0.5
                                : 1,
                          }}
                          disabled={
                            wfInfo?.source_workflow !== null ||
                            (!wfInfo?.source_workflow && wfInfo?.is_encrypted)
                          }
                          onClick={() => {
                            if (wfInfo?.public_workflow?.status === 'pending') {
                              onPendingModal();
                            } else if (wfInfo?.public_workflow?.status === 'rejected') {
                              onRejectedModal();
                            } else {
                              onPublishModal();
                            }
                          }}
                        >
                          <Iconify
                            icon="material-symbols:publish"
                            color={
                              // eslint-disable-next-line no-nested-ternary
                              wfInfo?.is_public
                                ? // eslint-disable-next-line no-nested-ternary
                                  wfInfo?.public_workflow?.status === 'pending'
                                  ? 'warning.main'
                                  : wfInfo?.public_workflow?.status === 'rejected'
                                    ? 'error.main'
                                    : 'primary.main'
                                : 'text.primary'
                            }
                          />
                        </IconButton>
                      </span>
                    </Tooltip>
                    {wfInfo?.is_public && wfInfo?.public_workflow?.status === 'approved' && (
                      <Tooltip
                        title={t('workflow.script.actions.uploadVersion')}
                        arrow
                        placement="top"
                      >
                        <IconButton
                          aria-label="update-version"
                          size="small"
                          sx={{
                            borderRadius: 1,
                            paddingX: '8px',
                          }}
                          onClick={onUploadModal}
                        >
                          <Iconify icon="grommet-icons:cloud-upload" color="text.primary" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ButtonGroup>
                </Tooltip>
              )}
              {(!idWorkflow || (wfInfo?.id && !wfInfo?.is_encrypted)) && (
                <Tooltip title={t('workflow.script.actions.variable')} arrow placement="top">
                  <IconButton
                    aria-label="variables"
                    size="small"
                    sx={{
                      border: '1px solid',
                      borderColor: alpha(theme.palette.grey[500], 0.32),
                      paddingX: '8px',
                      height: '34px',
                      borderRadius: 1,
                    }}
                    onClick={onVariableModal}
                  >
                    <Iconify icon="fluent:braces-variable-20-filled" color="text.primary" />
                  </IconButton>
                </Tooltip>
              )}
              <Button
                variant="outlined"
                sx={{ flex: 'row', gap: 1, height: '34px' }}
                onClick={preview.onTrue}
              >
                Xem trước
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={
                  <Iconify icon={loading ? 'line-md:loading-loop' : 'ri:save-line'} width={20} />
                }
                disabled={loading}
                onClick={() => saveFlowChart(ruleset)}
                sx={{
                  height: '33px',
                  transform: 'translateY(-1px)',
                }}
              >
                {wfInfo?.id
                  ? t('workflow.script.actions.saveChange')
                  : t('workflow.script.actions.create')}
              </Button>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            justifyContent="center"
            gap={2}
            sx={{
              width: '100%',
              height: 'calc(100% - 50px)',
              // border: '1px solid',
              // borderStyle: 'solid',
              // borderRadius: 1,
              // borderColor: '#292929',
              // padding: '10px',
            }}
          >
            <Stack
              ref={elementRef}
              id="variable-template"
              sx={{
                width: '100%',
                maxWidth: {
                  md: `calc(100vw - 254px - ${selectingItem?.name ? 324 : 0}px)`,
                  lg: `calc(100vw - 254px - ${selectingItem?.name ? 324 : 0}px - ${
                    themeLayout === 'mini' ? 120 : 272
                  }px + ${isFullScreen ? 82 : 0}px)`,
                },
                overflowX: 'hidden',
                overflowY: 'auto',
                p: 0,
                margin: '0 auto',
              }}
            >
              <SortableGroup
                group={ruleset}
                updateGroupOrder={updateGroupOrder}
                selectingItem={selectingItem}
                clickOnItem={clickOnItem}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onExtraColumn={onExtraColumn}
                gutter={false}
                setHistory={(newChildren) =>
                  setHistory({
                    ...cloneDeep(ruleset),
                    children: cloneDeep(newChildren),
                  })
                }
              />
            </Stack>
            {selectingItem && (
              <Stack sx={{ flexBasis: '400px', height: 1, borderRadius: 1, overflow: 'hidden' }}>
                <Sidebar
                  setSelectingItem={setSelectingItem}
                  selectingItem={selectingItem}
                  ruleset={ruleset}
                  updateGroupOrder={updateGroupOrder}
                  assignedVariable={assignedVariable}
                  setAssignedVariable={setAssignedVariable}
                />
              </Stack>
            )}
          </Stack>
        </Stack>

        <Dialog open={preview.value} onClose={preview.onFalse} fullWidth maxWidth="md">
          <DialogTitle
            sx={{
              pb: 2,
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h5">Xem trước</Typography>
                <IconButton onClick={preview.onFalse}>
                  <Iconify icon="ic:round-close" />
                </IconButton>
              </Stack>
              <Divider />
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ pb: 3, minHeight: '400px', maxHeight: '60vh' }}>
            <Stack
              sx={{
                height: 1,
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Preview
                group={ruleset}
                contentMap={contentMap}
                updateGroupOrder={updateGroupOrder}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={preview.onFalse} variant="contained">
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    );
  },
  (prevProps, nextProps) =>
    prevProps.variableTemplateMode === nextProps.variableTemplateMode &&
    prevProps.loading === nextProps.loading &&
    prevProps.designData === nextProps.designData &&
    prevProps.idWorkflow === nextProps.idWorkflow &&
    prevProps.tabId === nextProps.tabId &&
    prevProps.wfInfo === nextProps.wfInfo
  // prevProps.saveFlowChart === nextProps.saveFlowChart
);

export default CreateVariablesTemplate;
