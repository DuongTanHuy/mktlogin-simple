import React, { lazy, Suspense, useEffect, useState } from 'react';
import {
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { getSystemNotifyApi, hideSystemNotifyApi } from 'src/api/system-notify.api';
import Iconify from 'src/components/iconify';
import { useLocales } from 'src/locales';
import Image from 'src/components/image';
import { useRouter } from 'src/routes/hooks';
import { isElectron } from 'src/utils/commom';

const LazyEditor = lazy(() => import('src/components/editor/editor'));

export default function SystemNotifyDialog() {
  const { t } = useLocales();
  const route = useRouter();
  const [open, setOpen] = useState(false);
  const [notify, setNotify] = useState({});
  const [hide, setHide] = useState(false);
  const theme = useTheme();
  const matches = useMediaQuery('(min-width:740px)');
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    setOpen(false);
    if (hide) {
      try {
        await hideSystemNotifyApi(notify?.id);
      } catch (error) {
        /* empty */
      }
    }
  };

  useEffect(() => {
    let timer;

    const handleFetchNotify = async () => {
      try {
        setLoading(true);
        const response = await getSystemNotifyApi();
        const { data } = response.data;
        if (data) {
          setNotify(data);
          setOpen(true);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setOpen(false);
      } finally {
        timer = setTimeout(handleFetchNotify, 300000);
      }
    };

    handleFetchNotify();

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open && !loading}
      onClose={() => setOpen(false)}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: theme.customShadows.z4,
        },
      }}
    >
      {notify.type === 'text' ? (
        <DialogContent
          sx={{
            height: '540px',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundImage: `url("/assets/background/notification/${theme.palette.primary.main
              .replace('#', '')
              .toLowerCase()}.png")`,
            position: 'relative',
            p: 0,
          }}
        >
          <Stack
            zIndex={1}
            color="black"
            alignItems="center"
            sx={{
              position: 'absolute',
              top: 180,
              left: matches ? 140 : 20,
              right: matches ? 140 : 20,
              bottom: 136,
              textAlign: 'justify',
            }}
          >
            <Typography variant="h3" color="primary" textAlign="center">
              {notify?.title}
            </Typography>
            <Suspense fallback={<div>Loading...</div>}>
              <LazyEditor
                sx={{
                  backgroundColor: 'transparent',
                  '& .ql-editor': {
                    p: 0,
                    backgroundColor: 'transparent',
                    maxHeight: 'fit-content',
                  },
                  width: 1,
                  border: 'none',
                  height: 'calc(100% - 44px)',
                  overflow: 'auto',
                }}
                id="simple-editor"
                value={notify?.content}
                placeholder="Nội dung thông báo..."
                readOnly
              />
            </Suspense>
          </Stack>
        </DialogContent>
      ) : (
        <Image
          alt={notify?.title}
          src={notify?.image_url}
          onClick={() => {
            if (notify?.link_type === 'inside') {
              handleClose();
              const paths = notify?.link.split('/');
              const path = paths.slice(3);
              route.push(path.join('/'));
            } else if (isElectron()) {
              window.ipcRenderer.send('open-external', notify?.link);
            } else {
              window.open(notify?.link, '_blank', 'noopener noreferrer');
            }
          }}
          sx={{
            minHeight: '579px',
            height: 1,
            width: 1,
            cursor: 'pointer',
            borderRadius: 1,
            '& img': {
              objectFit: 'contain',
            },
          }}
        />
      )}
      <IconButton
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          boxShadow: theme.customShadows.z8,
          p: 0,
        }}
        onClick={handleClose}
      >
        <Iconify icon="carbon:close-filled" color="white" width={30} />
      </IconButton>
      <FormControlLabel
        sx={{
          position: 'absolute',
          top: 15,
          right: 36,
          '& .MuiButtonBase-root.MuiCheckbox-root': {
            background: 'white',
            borderRadius: '4px',
            p: 0,
            mr: 1,
          },
        }}
        control={<Checkbox checked={hide} onChange={(event) => setHide(event.target.checked)} />}
        label={t('systemNotify.dontShow')}
      />
    </Dialog>
  );
}
