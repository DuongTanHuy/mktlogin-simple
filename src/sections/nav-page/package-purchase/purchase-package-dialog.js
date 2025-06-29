import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocales } from 'src/locales';
import { buyProfilePackagesApi, getListVoucherApi } from 'src/api/cms.api';
import { enqueueSnackbar } from 'notistack';
import { ERROR_CODE, LOCALES } from 'src/utils/constance';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  alpha,
  Button,
  Divider,
  IconButton,
  Radio,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import Label from 'src/components/label';
import { fCurrencyVND } from 'src/utils/format-number';
import i18n from 'src/locales/i18n';
import { format } from 'date-fns';
import ListVoucherDialog from './list-voucher-dialog';

const PurchasePackageDialog = ({
  confirm,
  packageSelected,
  setCurrentUse,
  updateRefreshBalance,
}) => {
  const { t } = useLocales();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [showListVoucher, setShowListVoucher] = useState(false);
  const [voucherCurrent, setVoucherCurrent] = useState(null);
  const [listVoucher, setListVoucher] = useState([]);

  const handleApplyCode = () => {
    if (!code) {
      return;
    }
    const voucher = listVoucher.find((item) => item.code === code);
    if (voucher) {
      setVoucherCurrent({
        ...voucher,
        maxDiscount:
          voucher.voucher_type === 'amount'
            ? voucher.discount
            : (voucher.discount * packageSelected.price) / 100,
      });
      enqueueSnackbar(t('systemNotify.success.applyVoucher'), { variant: 'success' });
      setCode('');
    } else {
      enqueueSnackbar(t('systemNotify.error.invalidVoucher'), { variant: 'error' });
    }
  };

  const handleBuyPackage = async () => {
    try {
      setLoading(true);
      const payload = {
        profile_package_id: packageSelected.id,
        ...(voucherCurrent?.code && { voucher_code: voucherCurrent?.code }),
      };
      await buyProfilePackagesApi(payload);
      setCurrentUse(packageSelected.id);
      enqueueSnackbar(t('systemNotify.success.buy'));
      updateRefreshBalance();
    } catch (error) {
      if (error?.error_code === ERROR_CODE.INSUFFICIENT_BALANCE) {
        enqueueSnackbar(t('systemNotify.warning.notEnoughBalance'), { variant: 'error' });
        return;
      }
      if (error?.error_fields?.voucher_code) {
        enqueueSnackbar(t('systemNotify.error.expiredVoucher'), { variant: 'error' });
        return;
      }
      enqueueSnackbar(t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setCode('');
    confirm.onFalse();
  };

  useEffect(() => {
    const fetchListVoucher = async () => {
      try {
        const response = await getListVoucherApi();
        setListVoucher(response.data.data);
        const maxDiscountVoucher = response.data.data.reduce(
          (prev, current) => {
            if (current.voucher_type === 'amount') {
              return {
                code: prev.maxDiscount < current.discount ? current.code : prev.code,
                maxDiscount: Math.max(prev.maxDiscount, current.discount),
              };
            }
            return {
              code:
                prev.maxDiscount < (current.discount * packageSelected.price) / 100
                  ? current.code
                  : prev.code,
              maxDiscount: Math.max(
                prev.maxDiscount,
                (current.discount * packageSelected.price) / 100
              ),
            };
          },
          {
            code: '',
            maxDiscount: 0,
          }
        );

        setVoucherCurrent({
          ...response.data.data.find((item) => item.code === maxDiscountVoucher.code),
          maxDiscount: maxDiscountVoucher.maxDiscount,
        });
      } catch (error) {
        setListVoucher([]);
        setVoucherCurrent(null);
      }
    };

    if (confirm.value && packageSelected?.price) {
      fetchListVoucher();
    }
  }, [confirm.value, packageSelected?.price]);

  return (
    <>
      <ConfirmDialog
        open={confirm.value}
        onClose={handleClose}
        closeButtonName={t('packages.actions.cancel')}
        title={
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h4">{`${t('packages.actions.buyPackage')}: ${
                packageSelected?.name
              }`}</Typography>
              <IconButton onClick={handleClose}>
                <Iconify icon="ic:round-close" />
              </IconButton>
            </Stack>
            <Divider />
          </Stack>
        }
        content={
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">{t('packages.discount.voucherCode')}</Typography>
              <Stack direction="row" spacing={0}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('packages.discount.placeholder')}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '8px 0 0 8px',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    whiteSpace: 'nowrap',
                    borderRadius: '0 8px 8px 0',
                    px: 3,
                  }}
                  onClick={handleApplyCode}
                >
                  {t('packages.actions.apply')}
                </Button>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" mt={1}>
              <Typography variant="subtitle1">{t('packages.discount.voucherInfo')}</Typography>
              <Divider
                sx={{
                  flexGrow: 1,
                }}
              />
              <Button
                variant="outlined"
                onClick={() => setShowListVoucher(true)}
                sx={{
                  py: 0.2,
                  px: 3,
                }}
              >
                {t('packages.actions.list')}
              </Button>
            </Stack>

            {voucherCurrent?.id ? (
              <Stack
                direction="row"
                alignItems="center"
                sx={{
                  cursor: 'pointer',
                  '& .discount-tab::before, .discount-tab::after': {
                    backgroundColor: 'background.paper',
                  },
                }}
              >
                <div className="discount-tab">
                  <span className="discount-text">% DISCOUNT</span>
                </div>
                <Stack
                  spacing={2}
                  width="100%"
                  sx={{
                    border: '1.5px solid',
                    borderColor: 'primary.main',
                    borderRadius: '0 10px 10px 0',
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    p: 2,
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="h6">{voucherCurrent.name}</Typography>
                      <Label color="info">{t('packages.discount.applied')}</Label>
                    </Stack>

                    <Radio
                      checked
                      value="a"
                      name="radio-buttons"
                      sx={{
                        p: 0.2,
                      }}
                    />
                  </Stack>

                  <Typography>
                    {`${t('packages.discount.voucherCode')}: `}
                    <Typography component="span" fontWeight={600}>
                      {voucherCurrent.code}
                    </Typography>
                  </Typography>

                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography>
                      {`${t('packages.discount.duration')}: `}
                      <Typography component="span" fontWeight={600}>
                        {voucherCurrent.date_expired &&
                          format(new Date(voucherCurrent.date_expired), 'dd MMMM yyyy', {
                            locale: LOCALES[i18n.language],
                          })}
                      </Typography>
                    </Typography>
                    <Typography color="error.main" fontWeight={600}>
                      {voucherCurrent?.voucher_type === 'amount'
                        ? `-${fCurrencyVND(voucherCurrent.discount)}đ`
                        : `-${voucherCurrent.discount}%`}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            ) : (
              <Typography
                sx={{
                  textAlign: 'center',
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                {t('packages.discount.noVoucher')}
              </Typography>
            )}

            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Typography variant="h6">{t('packages.discount.totalPayment')}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {voucherCurrent?.id && (
                  <Typography
                    fontWeight={600}
                    variant="h6"
                    sx={{ textDecoration: 'line-through' }}
                    color="text.secondary"
                  >
                    {fCurrencyVND(packageSelected?.price)}đ
                  </Typography>
                )}
                <Typography color="primary.main" variant="h6" fontWeight={600}>
                  {fCurrencyVND(
                    Math.max(
                      voucherCurrent?.id
                        ? packageSelected.price - (voucherCurrent?.maxDiscount ?? 0)
                        : packageSelected?.price,
                      0
                    )
                  ) || 0}
                  đ
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        }
        action={
          <LoadingButton
            loading={loading}
            variant="contained"
            color="primary"
            onClick={handleBuyPackage}
          >
            {t('packages.actions.confirm')}
          </LoadingButton>
        }
      />
      <ListVoucherDialog
        open={showListVoucher}
        onClose={() => setShowListVoucher(false)}
        voucherCurrent={voucherCurrent}
        setVoucherCurrent={(data) => {
          setVoucherCurrent({
            ...data,
            maxDiscount:
              data.voucher_type === 'amount'
                ? data.discount
                : (data.discount * packageSelected.price) / 100,
          });
        }}
        listVoucher={listVoucher}
      />
    </>
  );
};

export default PurchasePackageDialog;

PurchasePackageDialog.propTypes = {
  confirm: PropTypes.object.isRequired,
  packageSelected: PropTypes.object,
  setCurrentUse: PropTypes.func.isRequired,
  updateRefreshBalance: PropTypes.func.isRequired,
};
