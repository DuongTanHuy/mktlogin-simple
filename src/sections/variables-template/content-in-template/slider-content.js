import { Slider, Stack, Typography } from '@mui/material';
import WithSectionAction from '../components/WithSelectionAction';

const PropTypes = require('prop-types');

const SliderContent = ({
  data,
  selectingItem,
  onDuplicate,
  onDelete,
  updateItemByField = () => {},
}) => (
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
        overflow: 'visible',
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

      <Slider
        valueLabelDisplay={data?.config?.tooltip ? 'auto' : 'off'}
        value={Number(data?.config?.defaultValue)}
        onChange={(e, value) => {
          updateItemByField(data, 'defaultValue', value);
        }}
        marks={
          // eslint-disable-next-line no-nested-ternary
          data?.config?.showMarks && data?.config?.step
            ? // eslint-disable-next-line no-nested-ternary
              data?.config?.marks?.length > 0
              ? data?.config?.marks
              : Array.from(
                  {
                    length:
                      Math.floor(
                        (Number(data?.config?.maxLength) - Number(data?.config?.minLength)) /
                          Number(data?.config?.step)
                      ) + 1,
                  },
                  (_, index) => {
                    const value = index * Number(data?.config?.step);
                    return { value, label: value };
                  }
                )
            : false
        }
        step={Number(data?.config?.step)}
        min={Number(data?.config?.minLength)}
        max={Number(data?.config?.maxLength)}
        sx={{
          transition: 'all 0.3s',
          m: 0,
          mx: 1,
          ...(data?.config?.showMarks && {
            py: 3,
          }),
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

SliderContent.propTypes = {
  data: PropTypes.object,
  selectingItem: PropTypes.object,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
  updateItemByField: PropTypes.func,
};

export default SliderContent;
