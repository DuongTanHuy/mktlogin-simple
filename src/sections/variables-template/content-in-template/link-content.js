import { Stack, Typography } from '@mui/material';
import WithSectionAction from '../components/WithSelectionAction';

const PropTypes = require('prop-types');

const LinkContent = ({ data, selectingItem, onDuplicate, onDelete }) => (
  <WithSectionAction
    data={data}
    isActive={data.id === selectingItem?.id}
    onDuplicate={onDuplicate}
    onDelete={onDelete}
  >
    <Stack
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      sx={{
        ...data?.styleDefault,
        width: '100%',
        overflow: 'hidden',
        height: `${data?.config?.height}px`,
        transition: 'all 0.3s',
      }}
    >
      {!data?.config?.hideLabel && (
        <Typography
          sx={{
            minWidth: '100px',
            width: `${data?.config?.labelWidth}px`,
            transition: 'all 0.3s',
          }}
        >
          {data?.config?.name}
        </Typography>
      )}

      <Typography
        sx={{
          transition: 'all 0.3s',
          color: 'primary.main',
          ...(data?.config?.width
            ? {
                width: `${data?.config?.width}px`,
              }
            : {
                flex: 1,
              }),
        }}
      >
        {data?.config?.displayText}
      </Typography>
    </Stack>
  </WithSectionAction>
);

LinkContent.propTypes = {
  data: PropTypes.object,
  selectingItem: PropTypes.object,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
};

export default LinkContent;
