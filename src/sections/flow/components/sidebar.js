import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material';
import { useTheme } from '@emotion/react';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useAuthContext } from 'src/auth/hooks';

import eventBus from 'src/sections/script/event-bus';
import { useLocales } from 'src/locales';
import { removeVietnameseTones } from 'src/utils/format-string';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import { GROUP_INVISIBLE } from 'src/utils/constance';
import { flowchartOptions } from 'src/utils/flow-chart-optoins';
import { isElectron } from 'src/utils/commom';
import cloneDeep from 'lodash/cloneDeep';
import WaitForm from './wait-form';
import HttpRequestForm from './http-request-form';
import GetTextForm from './get-text-form';
import ClickMouseForm from './click-mouse-form';
import OpenLinkForm from './open-link-form';
import OpenTabForm from './open-tab-form';
import SpreadSheetForm from './spread-sheet-form';
import CloseTabForm from './close-tab-form';
import ScrollMouseForm from './scroll-mouse-form';
import SwitchTabsForm from './switch-tabs-form';
import TypingTextForm from './typing-text-form';
import GetURLForm from './get-url-form';
import EnterKeyboardForm from './key-board-form';
import GeneralFormDialog from './general-form-dialog';
import WhileLoopForm from './white-loop-form';
import LoopDataForm from './loop-data-form';
import LoopElementForm from './loop-element-form';
import LoopBreakForm from './loop-break-form';
import ConditionForm from './condition-form';
import ClipboardForm from './clipboard-form';
import SaveMediaForm from './save-media-form';
import ElementExistsForm from './element-exists-form';
import NotificationForm from './notification-form';
import ExportDataForm from './export-data-form';
import ScreenshotForm from './screenshot-form';
import GetResourceForm from './get-resource-form';
import ExecuteJavascriptForm from './execute-javascript-form';
import UpdateResourceForm from './update-resource-form';
import CookieForm from './cookie-form';
import GetHtmlContentForm from './get-html-content-form';
import Get2faOtpForm from './get-otp-form';
import WaitLoadForm from './wait-load-form';
import WriteFileForm from './write-file-form';
import DeleteFileForm from './delete-file-form';
import ReadFileForm from './read-file-form';
import SwitchFrameForm from './switch-frame-form';
import RandomForm from './random-form';
import ReadFolderForm from './read-folder-form';
import HandleVariableForm from './handle-variable-form';
import ElementDataForm from './element-data-form';
import UploadFileForm from './upload-file-form';
import AssignVariableForm from './assign-variable-form';
import GetTimeForm from './get-time-form';
import MoveMouseForm from './move-mouse-form';
import LogForm from './log-form';
import FacebookApiForm from './facebook-api-form';
import CodeJavascriptForm from './code-javascript-form';
import ChatGPTAiForm from './chatGPT-ai-form';
import GeminiAiForm from './gemini-ai-form';

const formComponents = {
  doi: WaitForm,
  http_request: HttpRequestForm,
  lay_van_ban: GetTextForm,
  nhan_chuot: ClickMouseForm,
  mo_url: OpenLinkForm,
  mo_tab_moi: OpenTabForm,
  bang_tinh: SpreadSheetForm,
  dong_tab: CloseTabForm,
  cuon_chuot: ScrollMouseForm,
  chuyen_tab: SwitchTabsForm,
  nhap_van_ban: TypingTextForm,
  lay_url: GetURLForm,
  nhan_phim: EnterKeyboardForm,
  lap_co_dieu_kien: WhileLoopForm,
  lap_du_lieu: LoopDataForm,
  lap_phan_tu: LoopElementForm,
  diem_cuoi_vong_lap: LoopBreakForm,
  dieu_kien: ConditionForm,
  bo_nho_tam: ClipboardForm,
  luu_media: SaveMediaForm,
  element_exists: ElementExistsForm,
  notification: NotificationForm,
  export_data: ExportDataForm,
  chup_man_hinh: ScreenshotForm,
  lay_tai_nguyen: GetResourceForm,
  cap_nhat_tai_nguyen: UpdateResourceForm,
  chay_ma_javascript: ExecuteJavascriptForm,
  cookies: CookieForm,
  lay_noi_dung_html: GetHtmlContentForm,
  lay_ma_otp_2fa: Get2faOtpForm,
  cho_tai_trang: WaitLoadForm,
  ghi_tep: WriteFileForm,
  xoa_tep: DeleteFileForm,
  doc_tep_txt: ReadFileForm,
  chuyen_frame: SwitchFrameForm,
  ngau_nhien: RandomForm,
  doc_thu_muc: ReadFolderForm,
  xu_ly_bien: HandleVariableForm,
  du_lieu_phan_tu: ElementDataForm,
  tai_tep_len: UploadFileForm,
  gan_bien: AssignVariableForm,
  lay_thoi_gian: GetTimeForm,
  di_chuyen_chuot: MoveMouseForm,
  log: LogForm,
  facebook_api: FacebookApiForm,
  code: CodeJavascriptForm,
  chatgpt: ChatGPTAiForm,
  gemini: GeminiAiForm,
};

function SidebarFlow({ nodes, setSidebarAble, defaultGroupInVisible }) {
  const { t } = useLocales();
  const theme = useTheme();

  const { flowAutomation } = useAuthContext();
  const [ActiveForm, setActiveForm] = useState(null);
  const listFlowOption = useMemo(() => {
    const list = cloneDeep(flowchartOptions);
    const pinnedNodes = getStorage('pinned-nodes') ?? [];
    list[1].options = pinnedNodes;
    return list;
  }, []);

  const [listSuggestion, setListSuggestion] = useState([]);

  const [search, setSearch] = useState('');

  const [responsiveSidebar, setResponsiveSidebar] = useState(null);

  useEffect(() => {
    const getScriptOptions = async () => {
      const list = [];

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < listFlowOption.length; i++) {
        if (listFlowOption[i].parent === null) {
          let item = listFlowOption[i];
          const filterChild = listFlowOption.filter((op) => op.parent === item.id);
          if (filterChild.length > 0) {
            item = {
              ...item,
              options: filterChild.map((chil) => ({
                ...chil,
                display: !['notification', 'export_data', 'element_exists'].includes(chil.alias),
              })),
            };
          }
          list.push(item);
        }
      }
      setListSuggestion(list);
    };

    getScriptOptions();
  }, [listFlowOption]);

  const onDragStart = (event, data) => {
    event.dataTransfer.setData('text/plain', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  const getNodeActive = useMemo(() => {
    const findIndex = nodes.findIndex((i) => i.id === flowAutomation?.nodeId);

    return findIndex > -1 ? nodes[findIndex] : {};
  }, [nodes, flowAutomation?.nodeId]);

  const handleFilters = (event) => {
    setSearch(event.target.value);
    const newList = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < listSuggestion.length; i++) {
      const item = { ...listSuggestion[i] };
      if (item?.options) {
        item.options = item?.options.map((op) => ({
          ...op,
          display:
            !['notification', 'export_data', 'element_exists'].includes(op.alias) &&
            removeVietnameseTones(op.keyWord)
              .toLowerCase()
              .includes(removeVietnameseTones(event.target.value).toLowerCase()),
        }));
      }
      newList.push(item);
    }
    setListSuggestion(newList);
  };

  const collapsedSidebar = useCallback(() => {
    setSidebarAble([0, 'auto']);
    setStorage(GROUP_INVISIBLE, {
      ...defaultGroupInVisible,
      flow: true,
    });
  }, [setSidebarAble, defaultGroupInVisible]);

  useEffect(() => {
    const handleResponsiveSibarFlowchart = (event) => {
      if (event?.data) {
        setResponsiveSidebar(event?.data);
      }
    };

    eventBus.on('responsiveSibarFlowchart', handleResponsiveSibarFlowchart);

    return () => {
      eventBus.removeListener('responsiveSibarFlowchart', handleResponsiveSibarFlowchart);
    };
  }, []);

  useEffect(() => {
    const alias = flowAutomation?.typeForm?.alias;
    if (alias in formComponents) {
      setActiveForm(() => formComponents[alias]);
    } else {
      setActiveForm(null);
    }
  }, [flowAutomation?.typeForm?.alias]);

  return (
    <Stack direction="row" gap="8px" flexWrap="wrap" sx={{ height: `calc(100% - 46px)` }}>
      <Stack direction="row" gap={2} sx={{ width: '100%', pr: 1 }}>
        <TextField
          type="search"
          placeholder={`${t('workflow.script.actions.search')}...`}
          size="small"
          value={search}
          onChange={handleFilters}
          className="no-select"
          sx={{ width: '100%' }}
        />
        <Tooltip title="Thu gọn thanh công cụ" arrow placement="top">
          <IconButton
            aria-label="share"
            size="small"
            sx={{
              border: '1px solid',
              borderRadius: 1,
              paddingX: '8px',
              borderColor: alpha(theme.palette.grey[500], 0.32),
            }}
            onClick={collapsedSidebar}
          >
            <Iconify
              icon="lsicon:double-arrow-left-outline"
              color="text.primary"
              width={24}
              height={24}
            />
          </IconButton>
        </Tooltip>
      </Stack>
      <Scrollbar
        sx={{
          pr: 1,
        }}
      >
        <Stack sx={{ height: '100%' }}>
          <GeneralFormDialog
            open={flowAutomation?.status === 'editting'}
            IdNode={flowAutomation?.nodeId}
            OptionsTab={ActiveForm}
            formData={getNodeActive}
            nodes={flowAutomation?.typeForm?.alias === 'nhan_phim' ? nodes : null}
          />

          {listSuggestion.map(
            (item) =>
              item?.options.filter((option) => option?.display)?.length > 0 && (
                <Accordion
                  key={item.id}
                  sx={{
                    marginBottom: '5px',
                    '&.Mui-expanded': {
                      marginBottom: '2.5px',
                    },
                    userSelect: 'none!important',
                  }}
                  defaultExpanded
                >
                  <AccordionSummary
                    expandIcon={<Iconify icon="icon-park-outline:down" width={20} />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography variant="body2">{item.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      // display: 'flex',
                      // flexWrap: 'wrap',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                      gap: '8px',
                      padding: '0 6px 6px 6px',
                    }}
                  >
                    {item.options.map(
                      (trig) =>
                        trig.display && (
                          <Stack
                            key={trig.alias}
                            sx={{
                              border: '1px solid',
                              borderColor: alpha(theme.palette.grey[500], 0.6),
                              boxShadow: theme.customShadows.z4,
                              borderRadius: 1,
                            }}
                            className={
                              responsiveSidebar !== null && responsiveSidebar[0] < 233
                                ? `sidebar-item-flow sidebar-flow-responsive`
                                : `sidebar-item-flow`
                            }
                            direction="column"
                            justifyContent="flex-start"
                            onDragStart={(event) =>
                              onDragStart(event, {
                                ...trig,
                                isHighlighted: false,
                                type:
                                  (['lap_du_lieu', 'lap_phan_tu'].includes(trig.alias) && 'loop') ||
                                  (trig.alias === 'lap_co_dieu_kien' && 'condition_loop') ||
                                  (trig.alias === 'cookies' && 'cookies') ||
                                  (trig.alias === 'element_exists' && 'element_exists') ||
                                  // (trig.alias === 'lap_co_dieu_kien' && 'while_loop') ||
                                  (trig.alias === 'diem_cuoi_vong_lap' && 'end_loop') ||
                                  (trig.alias === 'dieu_kien' && 'conditions') ||
                                  'custom',
                              })
                            }
                            draggable
                          >
                            <Iconify icon={trig?.icon} width={18} />
                            <Typography variant="body2">{trig.name}</Typography>
                            <Stack
                              className="sidebar-item-more"
                              sx={{
                                cursor: 'pointer',
                              }}
                            >
                              <Tooltip title="Mở tài liệu">
                                <Iconify
                                  color="text.secondary"
                                  icon="ri:information-line"
                                  onClick={() => {
                                    if (isElectron()) {
                                      window.ipcRenderer.send('open-external', trig.guildUrl);
                                    } else {
                                      window.open(trig.guildUrl, '_blank', 'noopener noreferrer');
                                    }
                                  }}
                                />
                              </Tooltip>
                              <Tooltip title="Ghim">
                                <Iconify
                                  color="text.secondary"
                                  icon={
                                    listSuggestion[0].options.some(
                                      (option) => option.id === trig.id
                                    )
                                      ? 'mage:pin-fill'
                                      : 'mage:pin'
                                  }
                                  onClick={() => {
                                    const index = listSuggestion[0].options.findIndex(
                                      (option) => option.id === trig.id
                                    );
                                    if (index > -1) {
                                      listSuggestion[0].options.splice(index, 1);
                                    } else {
                                      listSuggestion[0].options.push(trig);
                                    }
                                    setStorage(
                                      'pinned-nodes',
                                      listSuggestion[0].options.map((op) => ({
                                        ...op,
                                        display: true,
                                      }))
                                    );
                                    setListSuggestion([...listSuggestion]);
                                  }}
                                />
                              </Tooltip>
                            </Stack>
                          </Stack>
                        )
                    )}
                  </AccordionDetails>
                </Accordion>
              )
          )}
        </Stack>
      </Scrollbar>
    </Stack>
  );
}

const areEqual = (prevProps, nextProps) => {
  if (prevProps.nodes.length !== nextProps.nodes.length) {
    return false;
  }

  return prevProps.nodes.every((prevNode, index) => {
    const nextNode = nextProps.nodes[index];

    return JSON.stringify(prevNode.dataFields) === JSON.stringify(nextNode.dataFields);
  });
};

export default memo(SidebarFlow, areEqual);

SidebarFlow.propTypes = {
  nodes: PropTypes.array,
  setSidebarAble: PropTypes.func,
  defaultGroupInVisible: PropTypes.object,
};
