import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
// mui
import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import Label, { CustomLabel } from 'src/components/label';
// apis
import { ERROR_CODE, NUM_ID_DISPLAY } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import groupBy from 'lodash/groupBy';
import { useGetKernelVersions } from 'src/api/cms.api';
import { updateMultiKernelApi } from 'src/api/profile.api';
import BrowserKernelButton from './browser-kernel-button';

const UpdateMultiBrowserKernelDialog = ({
  open,
  onClose,
  cProfileIds,
  fProfileIds,
  handleReLoadData,
}) => {
  const { workspace_id } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [numCItem, setNumCItem] = useState(NUM_ID_DISPLAY);
  const [numFItem, setNumFItem] = useState(NUM_ID_DISPLAY);
  const { t } = useLocales();
  const [chromeOptions, setChromeOption] = useState([]);
  const [firefoxOptions, setFirefoxOptions] = useState([]);
  const [cVersion, setCVersion] = useState('');
  const [fVersion, setFVersion] = useState('');
  const [errors, setErrors] = useState({
    cVersion: '',
    fVersion: '',
  });
  const { kernelData } = useGetKernelVersions();

  const handleClose = () => {
    onClose();
    setCVersion('');
    setFVersion('');
    setErrors({
      cVersion: '',
      fVersion: '',
    });
    setNumCItem(NUM_ID_DISPLAY);
    setNumFItem(NUM_ID_DISPLAY);
  };

  const handleUpdateBrowserKernel = async () => {
    if (!cVersion && cProfileIds.length > 0) {
      setErrors((prev) => ({ ...prev, cVersion: t('validate.required') }));
    }
    if (!fVersion && fProfileIds.length > 0) {
      setErrors((prev) => ({ ...prev, fVersion: t('validate.required') }));
    }
    if ((!cVersion && cProfileIds.length > 0) || (!fVersion && fProfileIds.length > 0)) {
      return;
    }
    setErrors({
      cVersion: '',
      fVersion: '',
    });
    try {
      setLoading(true);

      const payload = {
        ...(cProfileIds.length > 0 && {
          chrome_profile_ids: cProfileIds,
          chrome_kernel_version_id: cVersion,
        }),
        ...(fProfileIds.length > 0 && {
          firefox_profile_ids: fProfileIds,
          firefox_kernel_version_id: fVersion,
        }),
      };

      await updateMultiKernelApi(workspace_id, payload);

      handleReLoadData();
      enqueueSnackbar(t('systemNotify.success.update'), { variant: 'success' });
    } catch (error) {
      if (error?.http_code === ERROR_CODE.NOT_PERMISSION) {
        enqueueSnackbar(t('systemNotify.warning.notPermission.group.move'), {
          variant: 'error',
        });
      } else enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  useEffect(() => {
    async function fetchBrowserData() {
      try {
        if (kernelData) {
          const grouped = groupBy(kernelData, 'type');
          const chromeKernels = grouped.cbrowser || [];
          const firefoxKernels = grouped.fbrowser || [];
          setChromeOption([...chromeKernels].sort((a, b) => b.id - a.id));
          setFirefoxOptions([...firefoxKernels].sort((a, b) => b.id - a.id));
          // const latestChromeKernel = chromeKernels.find((item) => item.is_last);
          // if (latestChromeKernel ) {
          //   const { id, kernel } = latestChromeKernel;
          //   setValue('kernelVersionId', id);
          //   setValue('kernel', kernel);
          // }
        }
      } catch (error) {
        console.error('Error fetching kernel versions:', error);
      }
    }

    if (open) {
      fetchBrowserData();
    }
  }, [open, kernelData]);

  return (
    <ConfirmDialog
      open={open}
      onClose={handleClose}
      closeButtonName={t('dialog.moveGroup.actions.cancel')}
      title={t('dialog.updateKernel.title')}
      content={
        <Stack spacing={3}>
          {cProfileIds.length > 0 || fProfileIds.length > 0 ? (
            <Stack spacing={1}>
              <Typography variant="body1">{t('dialog.updateKernel.subTitle')}</Typography>
              <Stack spacing={1} mt={1}>
                {cProfileIds?.length > 0 && (
                  <Stack width={1} spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Chrome Browser
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={2}
                      flexWrap="wrap"
                      mb={1}
                      sx={{
                        typography: 'body2',
                        color: 'error.main',
                      }}
                    >
                      {cProfileIds.slice(0, numCItem).map((profileId) => (
                        <Label
                          key={profileId}
                          color="primary"
                          sx={{
                            p: 2,
                          }}
                        >
                          {profileId}
                        </Label>
                      ))}
                      {cProfileIds.length > NUM_ID_DISPLAY && (
                        <CustomLabel
                          length={cProfileIds.length}
                          numItem={numCItem}
                          setNumItem={setNumCItem}
                        />
                      )}
                    </Stack>
                  </Stack>
                )}
                {fProfileIds?.length > 0 && (
                  <Stack width={1} spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Firefox Browser
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={2}
                      flexWrap="wrap"
                      mb={1}
                      sx={{
                        typography: 'body2',
                        color: 'error.main',
                      }}
                    >
                      {fProfileIds.slice(0, numFItem).map((profileId) => (
                        <Label
                          key={profileId}
                          color="primary"
                          sx={{
                            p: 2,
                          }}
                        >
                          {profileId}
                        </Label>
                      ))}
                      {fProfileIds.length > NUM_ID_DISPLAY && (
                        <CustomLabel
                          length={fProfileIds.length}
                          numItem={numFItem}
                          setNumItem={setNumFItem}
                        />
                      )}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </Stack>
          ) : (
            <Typography variant="body2" color="error.main">
              {t('quickAction.expiredProfile')}
            </Typography>
          )}
          <Stack direction="row" spacing={2} width={1}>
            {cProfileIds.length > 0 && (
              <BrowserKernelButton
                error={errors.cVersion}
                options={chromeOptions}
                version={cVersion}
                setVersion={setCVersion}
                label={t('dialog.updateKernel.selectChromeVersion')}
                icon="teenyicons:chrome-solid"
                button="Chrome Browser"
                resetErrors={() => setErrors({ ...errors, cVersion: '' })}
              />
            )}
            {fProfileIds.length > 0 && (
              <BrowserKernelButton
                error={errors.fVersion}
                options={firefoxOptions}
                version={fVersion}
                setVersion={setFVersion}
                label={t('dialog.updateKernel.selectFirefoxVersion')}
                icon="devicon-plain:firefox"
                button="Firefox Browser"
                resetErrors={() => setErrors({ ...errors, fVersion: '' })}
              />
            )}
          </Stack>
        </Stack>
      }
      action={
        <LoadingButton
          loading={loading}
          variant="contained"
          color="primary"
          onClick={handleUpdateBrowserKernel}
          disabled={cProfileIds?.length === 0 && fProfileIds.length === 0}
        >
          {t('quickAction.actions.update')}
        </LoadingButton>
      }
    />
  );
};

export default UpdateMultiBrowserKernelDialog;

UpdateMultiBrowserKernelDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReLoadData: PropTypes.func,
  cProfileIds: PropTypes.array,
  fProfileIds: PropTypes.array,
};
