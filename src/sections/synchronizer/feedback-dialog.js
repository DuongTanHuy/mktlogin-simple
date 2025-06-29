import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFRating, RHFTextField } from 'src/components/hook-form';
import { LoadingButton } from '@mui/lab';
import { useLocales } from 'src/locales';

const FeedbackDialog = ({ open, onClose }) => {
  const { t } = useLocales();
  const FeedbackSchema = Yup.object().shape({});

  const defaultValues = {
    score: 0,
    content: '',
    phone: '',
  };

  const methods = useForm({
    resolver: yupResolver(FeedbackSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data);
    } catch (error) {
      /* empty */
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: (theme) => theme.customShadows.z4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4" marginRight="auto">
              {t('synchronizer.dialog.feedback.title')}
            </Typography>
            <IconButton onClick={handleClose}>
              <Iconify icon="ic:round-close" />
            </IconButton>
          </Stack>
          <Divider />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ typography: 'body2' }}>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2} mb={3}>
            <FeedbackTab title={t('synchronizer.dialog.feedback.labels.score')}>
              <Stack direction="row" spacing={1} alignItems="center">
                <RHFRating name="score" />
                <Typography color="text.secondary">
                  {t('synchronizer.dialog.feedback.placeholder.score')}
                </Typography>
              </Stack>
            </FeedbackTab>
            <FeedbackTab
              title={
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="end">
                  <Typography>{t('synchronizer.dialog.feedback.labels.feedback')}</Typography>
                  <Tooltip
                    title=""
                    sx={{
                      cursor: 'pointer',
                    }}
                  >
                    <Iconify icon="ph:warning-circle" />
                  </Tooltip>
                </Stack>
              }
            >
              <RHFTextField
                name="content"
                placeholder={t('synchronizer.dialog.feedback.placeholder.feedback')}
                multiline
                rows={4}
              />
            </FeedbackTab>
            <FeedbackTab title={t('synchronizer.dialog.feedback.labels.phone')}>
              <Stack>
                <RHFTextField
                  name="phone"
                  placeholder={t('synchronizer.dialog.feedback.placeholder.phone')}
                />
                <Typography color="text.secondary" variant="body2">
                  {t('synchronizer.dialog.feedback.note')}
                </Typography>
              </Stack>
            </FeedbackTab>
            <Stack direction="row" spacing={1} justifyContent="end">
              <Button onClick={handleClose} variant="contained">
                {t('synchronizer.actions.cancel')}
              </Button>
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                variant="contained"
                color="primary"
              >
                {t('synchronizer.actions.ok')}
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;

FeedbackDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

//-------------------------------------------------------------------------

function FeedbackTab({ title, children }) {
  return (
    <Grid container spacing={3}>
      <Grid
        item
        xs={3}
        textAlign="right"
        // style={{
        //   paddingTop: '30px',
        // }}
      >
        {title}
      </Grid>
      <Grid item xs={9}>
        {children}
      </Grid>
    </Grid>
  );
}

FeedbackTab.propTypes = {
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  children: PropTypes.node,
};
