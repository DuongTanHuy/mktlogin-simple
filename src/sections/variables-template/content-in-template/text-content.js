import { Stack, Typography } from '@mui/material';
import WithSectionAction from '../components/WithSelectionAction';

const PropTypes = require('prop-types');

const TextContent = ({ data, selectingItem, onDuplicate, onDelete }) => (
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

      <Typography
        sx={{
          transition: 'all 0.3s',
          color: 'text.secondary',
          ...(data?.config?.customColor && {
            color: `${data?.config?.color}`,
          }),
          ...(data?.config?.strong && {
            fontWeight: 'bold',
          }),
          ...(data?.config?.italic && {
            fontStyle: 'italic',
          }),
          ...(data?.config?.underline && {
            textDecoration: 'underline',
          }),
          ...(data?.config?.delete && {
            textDecoration: 'line-through',
          }),
          ...(data?.config?.width
            ? {
                width: `${data?.config?.width}px`,
              }
            : {
                flex: 1,
              }),
        }}
      >
        {data?.config?.defaultValue}
      </Typography>
    </Stack>
  </WithSectionAction>
);

TextContent.propTypes = {
  data: PropTypes.object,
  selectingItem: PropTypes.object,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
};

export default TextContent;
