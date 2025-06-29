import PropTypes from 'prop-types';
// mui
import { Stack } from '@mui/material';
import { RHFTextField } from 'src/components/hook-form';

const InformationTab = ({ t }) => (
  <Stack mt={1} spacing={2}>
    <RHFTextField name="name" label={t('dialog.rpa.tabs.information.name')} />
    <RHFTextField name="note" label={t('dialog.rpa.tabs.information.note')} multiline rows={4} />
  </Stack>
);

export default InformationTab;

InformationTab.propTypes = {
  t: PropTypes.func,
};
