import { Divider, Stack, Typography } from '@mui/material';
import WithSectionAction from '../components/WithSelectionAction';

const PropTypes = require('prop-types');

const DividerContent = ({ data, selectingItem, onDuplicate, onDelete }) => (
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
            flexShrink: 0,
          }}
        >
          {data?.config?.name}
        </Typography>
      )}

      <Divider
        sx={{
          borderStyle: data?.config?.isDashed ? 'dashed' : 'solid',
          transition: 'all 0.3s',
          ...(data?.config?.width
            ? {
                width: `${data?.config?.width}px`,
              }
            : {
                flex: 1,
              }),
        }}
      />
    </Stack>
  </WithSectionAction>
);

DividerContent.propTypes = {
  data: PropTypes.object,
  selectingItem: PropTypes.object,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
};

export default DividerContent;
