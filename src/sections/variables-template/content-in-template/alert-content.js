import { Alert, AlertTitle, Stack, Typography } from '@mui/material';
import WithSectionAction from '../components/WithSelectionAction';

const PropTypes = require('prop-types');

const AlertContent = ({ data, selectingItem, onDuplicate, onDelete }) => (
  <WithSectionAction
    isActive={data.id === selectingItem?.id}
    data={data}
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

      <Alert
        variant="outlined"
        severity={data?.config?.type}
        sx={{
          minWidth: 200,
          minHeight: 56,
          transition: 'all 0.3s',
          height: `${data?.config?.height}px`,
          borderWidth: 1.5,
          ...(!data?.config?.showBorder && {
            borderColor: 'transparent',
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
        <AlertTitle>{data?.config?.title}</AlertTitle>
        {data?.config?.content}
      </Alert>
    </Stack>
  </WithSectionAction>
);

AlertContent.propTypes = {
  data: PropTypes.object,
  selectingItem: PropTypes.object,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
};

export default AlertContent;
