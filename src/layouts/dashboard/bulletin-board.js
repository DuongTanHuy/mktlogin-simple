import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { IconButton, Stack, Typography } from '@mui/material';
import { ConfirmDialog } from '../../components/custom-dialog';
import { isElectron } from '../../utils/commom';
import Iconify from '../../components/iconify';

export default function BulletinBoard() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isElectron()) {
      window.ipcRenderer.on('show-dialog-close-all-profile', () => {
        setOpen(true);
      });
      setTitle(
        <Typography
          variant="h6"
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Iconify
            icon="bi:exclamation-triangle"
            color="error.main"
            sx={{
              marginRight: 1,
            }}
          />
          CẢNH BÁO
        </Typography>
      );
      setContent('Vui lòng đóng tất cả hồ sơ trước khi đóng ứng dụng, nếu không dữ liệu sẽ không được sao lưu lại.');
    }
  }, [open]);

  const handleClose = (event, reason) => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  }

  return (
    <ConfirmDialog
      disableEscapeKeyDown
      open={open}
      onClose={handleClose}
      title={title}
      closeIcon={
        <IconButton
          aria-label="close"
          onClick={() => {
            setOpen(false);
          }}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Iconify icon="bi:x" width={30} height={30} />
        </IconButton>
      }
      disableButtonAction
      content={
        <>
          <Stack spacing={3} marginTop={3}>
            <Typography variant="body1">{content}</Typography>
          </Stack>
          <LoadingButton
            loading={loading}
            variant="contained"
            color="error"
            sx={{
              marginTop: 3,
            }}
            onClick={() => {
              setLoading(true);
              if (isElectron()) {
                window.ipcRenderer.send('close-all-profile');
              }
              setTimeout(() => {
                setLoading(false);
              }, 5000);
            }}
          >
            Xác nhận đóng ứng dụng
          </LoadingButton>
        </>
      }
    />
  );
}
