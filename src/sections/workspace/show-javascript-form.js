import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Editor } from '@monaco-editor/react';
import { useSettingsContext } from 'src/components/settings';
import { useCallback, useEffect, useState } from 'react';
import { LoadingScreen } from 'src/components/loading-screen';
import {
  alpha,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { bgGradient } from 'src/theme/css';
import Scrollbar from 'src/components/scrollbar';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export default function ShowJavascriptForm({ open, onClose, scriptContent }) {
  const { themeMode } = useSettingsContext();
  const theme = useTheme();
  const openFull = useBoolean();
  const [editorRef, setEditorRef] = useState(null);

  const handleEditorDidMount = useCallback((editor, monaco) => {
    setEditorRef(editor);
  }, []);

  useEffect(() => {
    const handleFormatCode = () => {
      editorRef
        ?.getAction('editor.action.formatDocument')
        ?.run()
        ?.then(() => {
          editorRef.setScrollTop(0);
        });
    };
    if (open && scriptContent && editorRef) {
      handleFormatCode();
    }
  }, [scriptContent, editorRef, open]);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
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
              <Iconify icon="ant-design:code-twotone" width={26} />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Typography variant="h5">Javascript Code</Typography>
            </Stack>
          </Stack>
          <IconButton onClick={onClose}>
            <Iconify icon="ion:close" />
          </IconButton>
        </Stack>
      </DialogTitle>

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
          <Stack sx={{ height: '470px' }} spacing={1}>
            <Stack
              height={1}
              mb={2}
              sx={{
                position: 'relative',
                borderRadius: 1,
                overflow: 'hidden',
                boxShadow: theme.customShadows.z8,
              }}
            >
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 20,
                  zIndex: 1,
                  borderRadius: 1,
                  padding: 0.5,
                }}
                onClick={openFull.onTrue}
              >
                <Iconify icon="mdi-light:fullscreen" width={24} />
              </IconButton>
              {!openFull.value && (
                <Editor
                  language="javascript"
                  theme={`vs-${themeMode}`}
                  value={scriptContent ?? ''}
                  loading={<LoadingScreen />}
                  onMount={handleEditorDidMount}
                />
              )}
            </Stack>

            <Dialog open={openFull.value} onClose={openFull.onFalse} fullScreen>
              <DialogTitle sx={{ pb: 2 }}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5">Javascript code</Typography>
                    <IconButton onClick={onClose}>
                      <Iconify icon="ic:round-close" />
                    </IconButton>
                  </Stack>
                  <Divider />
                </Stack>
              </DialogTitle>
              <DialogContent sx={{ pb: 3 }}>
                <Stack
                  sx={{
                    height: 1,
                    borderRadius: 1,
                    overflow: 'hidden',
                    boxShadow: theme.customShadows.z8,
                  }}
                >
                  {openFull.value && (
                    <Editor
                      language="javascript"
                      theme={`vs-${themeMode}`}
                      value={scriptContent ?? ''}
                      loading={<LoadingScreen />}
                      onMount={handleEditorDidMount}
                    />
                  )}
                </Stack>
              </DialogContent>
            </Dialog>
          </Stack>
        </Scrollbar>
      </DialogContent>
    </Dialog>
  );
}

ShowJavascriptForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  scriptContent: PropTypes.string,
};
