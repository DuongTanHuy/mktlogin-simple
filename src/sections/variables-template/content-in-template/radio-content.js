import { FormControlLabel, FormGroup, Radio, Stack, Typography } from '@mui/material';
import WithSectionAction from '../components/WithSelectionAction';

const PropTypes = require('prop-types');

const RadioContent = ({ data, selectingItem, onDuplicate, onDelete, updateItemByField }) => (
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

      <Stack
        sx={{
          transition: 'all 0.3s',
          flex: 1,
          ml: `${data?.config?.width}px`,
          pl: 1,
        }}
      >
        <FormGroup row>
          {data?.config?.options.map((option) => (
            <FormControlLabel
              key={option.id}
              control={
                <Radio
                  checked={option.value === data?.config?.defaultValue}
                  onChange={(e) => {
                    if (updateItemByField) {
                      updateItemByField(data, 'defaultValue', option.value);
                    }
                  }}
                  inputProps={{
                    readOnly: !updateItemByField,
                  }}
                />
              }
              label={option.label}
            />
          ))}
        </FormGroup>
      </Stack>
    </Stack>
  </WithSectionAction>
);

RadioContent.propTypes = {
  data: PropTypes.object,
  selectingItem: PropTypes.object,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
  updateItemByField: PropTypes.func,
};

export default RadioContent;
