import { Stack, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';

const CustomTooltip = ({ status, children, title, placement = 'top' }) => (
  <Tooltip title={status ? title : ''} arrow placement={placement}>
    <Stack
      sx={{
        cursor: 'pointer',
      }}
    >
      {children}
    </Stack>
  </Tooltip>
);

export default CustomTooltip;

CustomTooltip.propTypes = {
  status: PropTypes.bool,
  children: PropTypes.node,
  title: PropTypes.string,
  placement: PropTypes.string,
};
