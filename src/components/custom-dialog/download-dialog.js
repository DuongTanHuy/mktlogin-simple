import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { Stack, Typography } from '@mui/material';
import { CircularProgressWithLabel } from 'src/utils/profile';
import { useLocales } from 'src/locales';
import ConfirmDialog from './confirm-dialog';

const DownloadDialog = ({
  downloading,
  setDownloading,
  downloadProgressPercent,
  extractionStatus,
  browserDownloadName,
}) => {
  const { t } = useLocales();
  return (
    <ConfirmDialog
      open={downloading}
      onClose={() => setDownloading(false)}
      onlyButton
      content={
        <Stack direction="column" spacing={3} alignItems="center">
          <CircularProgressWithLabel value={downloadProgressPercent} variant="determinate" />
          <Typography variant="h6">
            {extractionStatus === 'pending'
              ? t('dialog.downloadBrowser.title', { browserName: browserDownloadName })
              : t('dialog.downloadBrowser.extracting')}
          </Typography>
        </Stack>
      }
    />
  );
};

export default memo(DownloadDialog);

DownloadDialog.propTypes = {
  downloading: PropTypes.bool,
  setDownloading: PropTypes.func,
  downloadProgressPercent: PropTypes.number,
  extractionStatus: PropTypes.string,
  browserDownloadName: PropTypes.string,
};
