import React from 'react';
import PropTypes from 'prop-types';
import { alpha, Radio, Stack, Typography } from '@mui/material';
import Label from 'src/components/label';
import { useLocales } from 'src/locales';
import { format } from 'date-fns';
import { LOCALES } from 'src/utils/constance';
import i18n from 'src/locales/i18n';
import { fCurrencyVND } from 'src/utils/format-number';

const VoucherItem = ({ voucher, isCurrent, onClick, isSelected }) => {
  const { t } = useLocales();
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        cursor: 'pointer',
        '& .discount-tab::before, .discount-tab::after': {
          backgroundColor: 'background.paper',
        },
      }}
      onClick={onClick}
    >
      <div className="discount-tab">
        <span className="discount-text">% DISCOUNT</span>
      </div>
      <Stack
        spacing={2}
        width="100%"
        sx={{
          border: '1.5px solid',
          borderRadius: '0 8px 8px 0',
          borderColor: 'divider',
          backgroundColor: 'background.neutral',
          ...(isSelected && {
            borderColor: 'primary.main',
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
          }),
          p: 2,
          transition: 'all 0.3s linear',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">{voucher?.name}</Typography>
            {isCurrent && <Label color="info">{t('packages.inUse')}</Label>}
          </Stack>

          <Radio
            checked={isSelected}
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
            {voucher?.code}
          </Typography>
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography>
            {`${t('packages.discount.duration')}: `}
            <Typography component="span" fontWeight={600}>
              {voucher?.date_expired &&
                format(new Date(voucher.date_expired), 'dd MMMM yyyy', {
                  locale: LOCALES[i18n.language],
                })}
            </Typography>
          </Typography>
          <Typography color="error.main" fontWeight={600}>
            {voucher?.voucher_type === 'amount'
              ? `-${fCurrencyVND(voucher.discount)}đ`
              : `-${voucher.discount}%`}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default VoucherItem;

VoucherItem.propTypes = {
  voucher: PropTypes.object,
  onClick: PropTypes.func,
  isCurrent: PropTypes.bool,
  isSelected: PropTypes.bool,
};
