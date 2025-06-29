import PropTypes from 'prop-types';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';

import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import SplitPane, { Pane } from 'split-pane-react';
import { useAuthContext } from 'src/auth/hooks';
import { useSettingsContext } from 'src/components/settings';
import { Tab, Tabs, alpha } from '@mui/material';
import { LoadingScreen } from 'src/components/loading-screen';
import { useLocales } from 'src/locales';
import WorkflowRunningConfig from 'src/sections/flow/workflow-running-config';
import { isElectron } from '../../../utils/commom';
import eventBus from '../event-bus';
import RunConfigTab from '../run-config-tab';
import ReadmeTab from '../readme-tab';
import TabsScriptRunning from './tab-script-running';

function MonacoEditor({
  setScriptContent,
  linePosition,
  scriptContent,
  settings,
  table,
  isEncrypted,
  hasDesignData,
  readme,
  ruleset,
  setRuleset,
  inputValidate,
  setInputValidate,
}) {
  const { t } = useLocales();
  const TABS = useMemo(
    () => [
      {
        value: 'run_config',
        label: t('workflow.script.tab.runConfig'),
      },
      ...(readme
        ? [
            {
              value: 'readme',
              label: t('workflow.script.tab.readme'),
            },
          ]
        : []),
    ],
    [readme, t]
  );

  const [currentTab, setCurrentTab] = useState('run_config');
  const [outputLogs, setOutputLogs] = useState([]);
  const editorRef = useRef(null);
  const [openOutput, setOpenOutput] = useState(false);
  const [focusPosition, setFocusPosition] = useState({
    startLineNumber: linePosition,
    startColumn: 1,
    endLineNumber: linePosition,
    endColumn: 1,
  });
  const [codeFromRecord, setCodeFromRecord] = useState(null);
  const [sizes, setSizes] = useState(['100%', 0]);

  const { updataStatusEditingWF } = useAuthContext();
  const { themeMode } = useSettingsContext();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (linePosition) {
      setFocusPosition({
        startLineNumber: linePosition,
        startColumn: 1,
        endLineNumber: linePosition,
        endColumn: 1,
      });
    }
  }, [linePosition]);

  useEffect(() => {
    if (isElectron()) {
      window.ipcRenderer.on('log-runner-for-editor', (event, data) => {
        setOutputLogs((prev) => [...prev, data]);
      });
      window.ipcRenderer.on('insert-action-code', (event, data) => {
        setCodeFromRecord({ code: data.code, key: Date.now() });
      });
    }
  }, []);

  useEffect(() => {
    if (codeFromRecord && editorRef.current) {
      const { code } = codeFromRecord;
      const positionCurrent = editorRef.current.getPosition();
      const positionToUse = isFocused
        ? {
            startLineNumber: positionCurrent.lineNumber,
            startColumn: positionCurrent.column,
            endLineNumber: positionCurrent.lineNumber,
            endColumn: positionCurrent.column,
          }
        : focusPosition;
      applyCodeAtPosition(`${code}\n`, positionToUse);
      formatCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFromRecord]);

  const handleChangeTab = (_, newValue) => {
    setCurrentTab(newValue);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.onDidFocusEditorText((e) => {
      setIsFocused(true);
    });
    editor.onDidChangeCursorPosition((e) => {
      const cursorPosition = editor.getPosition();
      setFocusPosition({
        startLineNumber: cursorPosition.lineNumber,
        startColumn: cursorPosition.column,
        endLineNumber: cursorPosition.lineNumber,
        endColumn: cursorPosition.column,
      });
    });
  };

  const onChangeEditer = (value) => {
    setScriptContent(value);
    updataStatusEditingWF(true);
  };

  const applyCodeAtPosition = (codeToApply, position) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const edits = [
        {
          range: position,
          text: `${codeToApply}`,
          forceMoveMarkers: false, // This ensures markers move with the text
        },
      ];

      editor.executeEdits('my-source', edits);
      // const lengtLine = codeToApply.split(/\r\n|\r|\n/).length;

      setFocusPosition((prev) => ({
        ...prev,
        startLineNumber: prev.startLineNumber,
        endLineNumber: prev.startLineNumber,
      }));
      formatCode();
      updataStatusEditingWF(true);
    }
  };

  const formatCode = () => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.getAction('editor.action.formatDocument').run();
      updataStatusEditingWF(true);
    }
  };

  const handleFillScreen = (type) => {
    if (type === 'full') {
      setSizes([0, '100%']);
    } else {
      setSizes(['60%', '40%']);
    }
  };

  const handleOpenOutput = () => {
    setOpenOutput(true);
    setSizes(['60%', '40%']);
  };

  const handleCloseOutput = () => {
    setOpenOutput(false);
    setOutputLogs([]);
    setSizes(['100%', 0]);
  };

  useEffect(() => {
    // Listen for the custom event
    const handleEventApplyCode = (code) => {
      applyCodeAtPosition(code, focusPosition);
    };

    const handleEventFormatCode = () => {
      formatCode();
    };

    const handleEventOpenOutput = () => {
      handleOpenOutput();
    };

    eventBus.on('applyToCode', handleEventApplyCode);
    eventBus.on('formatCode', handleEventFormatCode);
    eventBus.on('openOutput', handleEventOpenOutput);

    // Cleanup the event listener when the component unmounts
    return () => {
      eventBus.removeListener('applyToCode', handleEventApplyCode);
      eventBus.removeListener('formatCode', handleEventFormatCode);
      eventBus.removeListener('openOutput', handleEventOpenOutput);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusPosition]);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
      }}
    >
      <SplitPane split="horizontal" sizes={sizes} onChange={setSizes} allowResize={openOutput}>
        <Pane>
          {!isEncrypted ? (
            <Editor
              language="javascript"
              theme={`vs-${themeMode}`}
              options={settings}
              value={scriptContent}
              onMount={handleEditorDidMount}
              onChange={onChangeEditer}
              loading={<LoadingScreen />}
            />
          ) : (
            <Stack height={1}>
              <Tabs
                value={currentTab}
                onChange={handleChangeTab}
                sx={{
                  px: 2,
                  boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
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
                  {hasDesignData ? (
                    <WorkflowRunningConfig
                      ruleset={ruleset}
                      setRuleset={setRuleset}
                      inputValidate={inputValidate}
                      setInputValidate={setInputValidate}
                    />
                  ) : (
                    <RunConfigTab />
                  )}
                </>
              )}

              {currentTab === 'readme' && <ReadmeTab readme={readme} />}
            </Stack>
          )}
        </Pane>
        <Pane>
          {openOutput && (
            <Stack
              sx={{
                position: 'relative',
                background: themeMode === 'dark' ? '#1e1e1e' : '#fffffe',
                height: '100%',
                borderLeft: '1px solid',
                borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
              }}
            >
              <TabsScriptRunning
                handleCloseOutput={handleCloseOutput}
                handleFillScreen={handleFillScreen}
                sizes={sizes}
                outputLogs={outputLogs}
                setOutputLogs={setOutputLogs}
                table={table}
              />
            </Stack>
          )}
        </Pane>
      </SplitPane>
    </Box>
  );
}

export default MonacoEditor;

MonacoEditor.propTypes = {
  setScriptContent: PropTypes.func,
  scriptContent: PropTypes.string,
  readme: PropTypes.string,
  settings: PropTypes.object,
  table: PropTypes.array,
  isEncrypted: PropTypes.bool,
  hasDesignData: PropTypes.bool,
  linePosition: PropTypes.number,
  ruleset: PropTypes.object,
  setRuleset: PropTypes.func,
  inputValidate: PropTypes.array,
  setInputValidate: PropTypes.func,
};
