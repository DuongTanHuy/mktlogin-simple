import PropTypes from 'prop-types';
import { memo } from 'react';
// @mui
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';

// components
import { DialogTitle, Divider, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

function SettingAutomation({ onClose, handleChangeEdgeType, open }) {
  const { debugMode, animatedEdge, updateFlowSetting } = useSettingsContext();

  return (
    <Dialog fullWidth maxWidth="xs" onClose={() => onClose()} open={open}>
      <DialogTitle
        sx={{
          pb: 2,
        }}
      >
        <Stack spacing={1.5}>
          <Typography>Cài đặt</Typography>
          <Divider />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Stack>
          <FormControlLabel
            control={<Switch checked={!!debugMode ?? false} />}
            onChange={(event) => updateFlowSetting('debugMode', event.target.checked)}
            label="Chế độ gỡ lỗi"
            sx={{
              width: 'fit-content',
            }}
          />
          <FormControlLabel
            control={<Switch checked={!!animatedEdge ?? false} />}
            onChange={(event) => {
              updateFlowSetting('animatedEdge', event.target.checked);
              handleChangeEdgeType(event.target.checked);
            }}
            label="Kết nối Node chuyển động"
            sx={{
              width: 'fit-content',
            }}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

const areEqual = (prevProps, nextProps) => prevProps.open === nextProps.open;

export default memo(SettingAutomation, areEqual);

SettingAutomation.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleChangeEdgeType: PropTypes.func,
};
