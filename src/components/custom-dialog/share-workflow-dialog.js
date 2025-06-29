import { memo, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// mui
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  alpha,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { shareWorkflow } from 'src/api/workflow.api';
import { enqueueSnackbar } from 'notistack';
import { useLocales } from 'src/locales';
import { ERROR_CODE } from 'src/utils/constance';
import Iconify from '../iconify';
import { RHFRadioGroup, RHFTextField } from '../hook-form';
import FormProvider from '../hook-form/form-provider';
import { useAuthContext } from '../../auth/hooks';

const ShareWorkflowDialog = ({ open, onClose, shareItem }) => {
  const { t } = useLocales();

  const FormSchema = Yup.object().shape({
    is_encrypted: Yup.string().required(t('validate.required')),
    is_limited: Yup.string().required(t('validate.required')),
    number_of_uses: Yup.number().when('is_limited', {
      is: (value) => value === 'true',
      then: (schema) =>
        schema
          .required(t('validate.required'))
          .min(1, t('validate.limit.min'))
          .typeError(t('validate.limit.valid')),
      otherwise: (schema) => schema.notRequired(),
    }),
    is_expiry_time: Yup.string().required(t('validate.required')),
    expiry_time: Yup.number().when('is_expiry_time', {
      is: (value) => value === 'true',
      then: (schema) =>
        schema
          .required(t('validate.required'))
          .min(1, t('validate.limit.min'))
          .typeError(t('validate.limit.valid')),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const { copy } = useCopyToClipboard();
  const [displayCopyTooltip, setDisplayCopyTooltip] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const { workspace_id } = useAuthContext();

  const handleClose = () => {
    onClose();
    setShareCode('');
  };

  const defaultValues = useMemo(
    () => ({
      is_encrypted: 'true',
      is_limited: 'true',
      is_expiry_time: 'true',
      expiry_time: 24,
      number_of_uses: 1,
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const watchIsLimited = watch('is_limited');
  const watchIsExpiryTime = watch('is_expiry_time');

  const onSubmit = handleSubmit(async (data) => {
    data.is_encrypted = data.is_encrypted === 'true';
    data.is_limited = data.is_limited === 'true';
    data.is_expiry_time = data.is_expiry_time === 'true';
    try {
      setShareCode('');

      const response = await shareWorkflow(workspace_id, data, shareItem?.id);
      if (response?.data) {
        const { activation_code } = response.data;
        setShareCode(activation_code);
      }
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.workflow.share'), {
          variant: 'error',
        });
      } else if (error?.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      } else {
        enqueueSnackbar(t('systemNotify.error.title'), { variant: 'error' });
      }
    }
  });

  return (
    <Dialog fullWidth maxWidth="xs" open={open}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle
          sx={{
            pb: 0,
          }}
        >
          {t('workflow.script.dialog.share.title')}
        </DialogTitle>
        <DialogContent
          sx={{
            '&.MuiDialogContent-root': {
              pt: 3,
            },
          }}
        >
          <Stack spacing={2}>
            <RHFRadioGroup
              row
              spacing={4}
              name="is_encrypted"
              label={t('dialog.publicWorkflow.labels.encrypted')}
              options={[
                { value: true, label: t('dialog.publicWorkflow.options.encrypted.yes') },
                { value: false, label: t('dialog.publicWorkflow.options.encrypted.no') },
              ]}
            />
            <Stack spacing={1}>
              <RHFRadioGroup
                row
                spacing={4}
                name="is_limited"
                label={t('dialog.publicWorkflow.labels.limitEnter')}
                options={[
                  { value: true, label: t('dialog.publicWorkflow.options.limited') },
                  { value: false, label: t('dialog.publicWorkflow.options.unlimited') },
                ]}
              />
              {watchIsLimited && watchIsLimited !== 'false' && (
                <RHFTextField
                  type="number"
                  name="number_of_uses"
                  label={t('dialog.publicWorkflow.labels.numOfEntry')}
                  size="small"
                />
              )}
            </Stack>

            <Stack spacing={1}>
              <RHFRadioGroup
                row
                spacing={4}
                name="is_expiry_time"
                label={t('dialog.publicWorkflow.labels.isExpiryTime')}
                options={[
                  { value: true, label: t('dialog.publicWorkflow.options.limited') },
                  { value: false, label: t('dialog.publicWorkflow.options.unlimited') },
                ]}
              />

              {watchIsExpiryTime && watchIsExpiryTime !== 'false' && (
                <RHFTextField
                  type="number"
                  name="expiry_time"
                  label={t('dialog.publicWorkflow.labels.numTime')}
                  size="small"
                />
              )}
            </Stack>

            <Divider sx={{ my: 1 }} />

            <TextField
              fullWidth
              size="small"
              value={shareCode}
              placeholder={t('workflow.script.dialog.share.label')}
              readOnly
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                pointerEvents: 'none',
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                borderRadius: 1,
              }}
              InputProps={{
                endAdornment: (
                  <Tooltip
                    onClose={() => setDisplayCopyTooltip(false)}
                    open={displayCopyTooltip}
                    title={t('workflow.script.dialog.share.copy')}
                    placement="top"
                  >
                    <IconButton
                      onClick={() => {
                        setDisplayCopyTooltip(true);
                        copy(shareCode);
                        enqueueSnackbar(t('systemNotify.success.copied'));
                      }}
                      sx={{
                        marginLeft: 1,
                        pointerEvents: 'auto',
                      }}
                    >
                      <Iconify icon="solar:copy-bold-duotone" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            {t('workflow.script.actions.close')}
          </Button>
          <LoadingButton
            loading={isSubmitting}
            disabled={isSubmitting}
            variant="contained"
            type="submit"
          >
            {t('workflow.script.actions.createCode')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default memo(ShareWorkflowDialog);

ShareWorkflowDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  shareItem: PropTypes.object,
};
