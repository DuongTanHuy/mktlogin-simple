import { IconButton, Stack, Tooltip } from '@mui/material';
import Iconify from 'src/components/iconify';
import { STYLE_ITEM } from '../constants';

const PropTypes = require('prop-types');

const WithSectionAction = ({ children, data, isActive, onDuplicate, onDelete }) => (
  <Stack
    id="wrapper-content"
    sx={{ ...STYLE_ITEM, borderColor: isActive ? '#0d936e' : 'lightgray' }}
  >
    {children}
    {isActive && (
      <Stack
        direction="row"
        sx={{
          position: 'absolute',
          bottom: '-5px',
          right: '0',
        }}
      >
        <Tooltip title="Nhân bản" placement="top">
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (data.id) {
                onDuplicate(data.id);
              }
            }}
          >
            <Iconify
              icon="humbleicons:duplicate"
              color="#0d936e"
              sx={{
                zIndex: -1,
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa" placement="top">
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (data.id) {
                onDelete(data.id);
              }
            }}
          >
            <Iconify
              icon="material-symbols-light:delete-outline"
              color="#0d936e"
              sx={{
                zIndex: -1,
              }}
            />
          </IconButton>
        </Tooltip>
      </Stack>
    )}
  </Stack>
);

WithSectionAction.propTypes = {
  data: PropTypes.object,
  children: PropTypes.node,
  isActive: PropTypes.bool,
  onDelete: PropTypes.func,
  onDuplicate: PropTypes.func,
};

export default WithSectionAction;
