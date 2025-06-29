import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Button, Divider, IconButton, Stack, Typography } from '@mui/material';
import Iconify from 'src/components/iconify';
import VoucherItem from './voucher-item';

const ListVoucherDialog = ({ open, onClose, voucherCurrent, setVoucherCurrent, listVoucher }) => {
  const { t } = useTranslation();
  const [selectedVoucher, setSelectedVoucher] = React.useState(voucherCurrent);

  const handleSubmit = () => {
    setVoucherCurrent(selectedVoucher);
    onClose();
  };

  const handleClose = () => {
    setSelectedVoucher(voucherCurrent);
    onClose();
  };

  useEffect(() => {
    if (open) {
      setSelectedVoucher(voucherCurrent);
    }
  }, [open, voucherCurrent]);

  return (
    <ConfirmDialog
      open={open}
      onClose={handleClose}
      closeButtonName={t('packages.actions.cancel')}
      title={
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">{t('packages.discount.listVoucher')}</Typography>
            <IconButton onClick={handleClose}>
              <Iconify icon="ic:round-close" />
            </IconButton>
          </Stack>
          <Divider />
        </Stack>
      }
      sx={{
        '& .MuiDialogContent-root': {
          pr: listVoucher.length > 3 ? 1 : 3,
        },
      }}
      content={
        <Stack
          spacing={2}
          sx={{ maxHeight: '600px', overflow: listVoucher.length > 3 ? 'auto' : 'hidden' }}
        >
          {listVoucher.length > 0 ? (
            listVoucher.map((voucher) => (
              <VoucherItem
                key={voucher.id}
                isCurrent={voucher.id === voucherCurrent?.id}
                voucher={voucher}
                onClick={() => setSelectedVoucher(voucher)}
                isSelected={selectedVoucher?.id === voucher.id}
              />
            ))
          ) : (
            <Typography
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              {t('packages.discount.noVoucher')}
            </Typography>
          )}
        </Stack>
      }
      action={
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {t('packages.actions.confirm')}
        </Button>
      }
    />
  );
};

export default ListVoucherDialog;

ListVoucherDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  voucherCurrent: PropTypes.object,
  setVoucherCurrent: PropTypes.func,
  listVoucher: PropTypes.array,
};
