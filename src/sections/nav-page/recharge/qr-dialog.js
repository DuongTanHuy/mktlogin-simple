import PropTypes from 'prop-types';
// mui
import { Alert, IconButton, Stack, Tooltip, tooltipClasses, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import { BANK_ACCOUNT } from 'src/utils/constance';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { useLocales } from 'src/locales';

const LightTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

const QRDialog = ({ open, onClose, qr, type, username }) => {
  const { t } = useLocales();

  const {
    accountName,
    type: { acb, vietcombank },
  } = BANK_ACCOUNT;

  const { copy } = useCopyToClipboard();

  const displayCopyTooltip = useMultiBoolean({
    accountNum: false,
    transactionDes: false,
  });

  return (
    <ConfirmDialog
      maxWidth="md"
      open={open}
      onClose={onClose}
      closeButtonName={t('dialog.bank.actions.close')}
      title={t('dialog.bank.title')}
      content={
        <Stack spacing={3}>
          <Alert severity="info">{t('dialog.bank.info')}</Alert>
          <Image
            alt="qrcode"
            src={qr}
            ratio="1/1"
            sx={{
              borderRadius: 1,
              cursor: 'pointer',
              width: '400px',
              height: '400px',
              mx: 'auto',
            }}
          />
          <Stack justifyContent="center" alignItems="center" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>{`${t('dialog.bank.accountNumber')}: `}</Typography>
              <Typography fontWeight={700}>
                {type === 'acb' ? acb.accountNo : vietcombank.accountNo}
              </Typography>
              <LightTooltip
                onClose={() => displayCopyTooltip.onFalse('accountNum')}
                open={displayCopyTooltip.value.accountNum}
                title="Copied"
                placement="top"
              >
                <IconButton
                  onClick={() => {
                    copy(type === 'acb' ? acb.accountNo : vietcombank.accountNo);
                    displayCopyTooltip.onTrue('accountNum');
                  }}
                >
                  <Iconify icon="solar:copy-bold-duotone" />
                </IconButton>
              </LightTooltip>
            </Stack>
            <Typography>
              {`${t('dialog.bank.accountHolder')}: `}
              <Typography component="span" fontWeight={700}>
                {accountName}
              </Typography>
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>{`${t('dialog.bank.transferContent')}: `}</Typography>
              <Typography fontWeight={700}>{`mktlogin ${username}`}</Typography>
              <LightTooltip
                onClose={() => displayCopyTooltip.onFalse('transactionDes')}
                open={displayCopyTooltip.value.transactionDes}
                title="Copied"
                placement="top"
              >
                <IconButton
                  onClick={() => {
                    copy(`mktlogin ${username}`);
                    displayCopyTooltip.onTrue('transactionDes');
                  }}
                >
                  <Iconify icon="solar:copy-bold-duotone" />
                </IconButton>
              </LightTooltip>
            </Stack>
            <Typography>{type === 'acb' ? acb.bankName : vietcombank.bankName}</Typography>
          </Stack>
        </Stack>
      }
    />
  );
};

export default QRDialog;

QRDialog.propTypes = {
  type: PropTypes.oneOf(['acb', 'vietcombank']).isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  qr: PropTypes.string,
  username: PropTypes.string,
};
