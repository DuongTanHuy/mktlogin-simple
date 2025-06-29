import { Box, Chip, MenuItem, OutlinedInput, Select, Stack, Typography } from '@mui/material';
import WithSectionAction from '../components/WithSelectionAction';

const PropTypes = require('prop-types');

const SelectContent = ({
  data,
  selectingItem,
  onDuplicate,
  onDelete,
  updateItemByField,
  validateError,
}) => {
  const { config } = data;

  const renderValues = (selectedValues) => {
    const selectedItems = config.options.filter((item) => selectedValues.includes(item.value));

    if (!selectedItems.length && config.placeholder) {
      return (
        <Box component="em" sx={{ color: 'text.disabled' }}>
          {config.placeholder}
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selectedItems.map((item) => (
          <Chip
            variant="soft"
            color="primary"
            key={item.id}
            size="small"
            label={item.label}
            onDelete={() => {}}
          />
        ))}
      </Box>
    );
  };

  return (
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

        {config?.isMulti ? (
          <Select
            multiple={config?.isMulti}
            size="small"
            error={validateError}
            displayEmpty={!!data?.config?.placeholder}
            input={<OutlinedInput fullWidth />}
            renderValue={renderValues}
            value={typeof config?.defaultValue === 'string' ? [] : config?.defaultValue || []}
            onChange={(e) => {
              updateItemByField(data, 'defaultValue', e.target.value);
            }}
            inputProps={{
              readOnly: !updateItemByField,
            }}
            sx={{
              transition: 'all 0.3s',
              ...(data?.config?.width && {
                width: `${data?.config?.width}px`,
              }),
            }}
          >
            {config?.placeholder && (
              <MenuItem disabled value="">
                <em> {config.placeholder} </em>
              </MenuItem>
            )}

            {config?.options.length > 0 &&
              config?.options.map((option) => (
                <MenuItem key={option.id} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
          </Select>
        ) : (
          <Select
            size="small"
            error={validateError}
            displayEmpty={!!data?.config?.placeholder}
            input={<OutlinedInput fullWidth />}
            value={(typeof config?.defaultValue === 'object' ? '' : config?.defaultValue || '')}
            onChange={(e) => {
              updateItemByField(data, 'defaultValue', e.target.value);
            }}
            inputProps={{
              readOnly: !updateItemByField,
            }}
            sx={{
              transition: 'all 0.3s',
              ...(data?.config?.width && {
                width: `${data?.config?.width}px`,
              }),
            }}
          >
            {config?.placeholder && (
              <MenuItem disabled value="">
                <em> {config.placeholder} </em>
              </MenuItem>
            )}

            {config?.options.length > 0 &&
              config?.options.map((option) => (
                <MenuItem key={option.id} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
          </Select>
        )}
      </Stack>
    </WithSectionAction>
  );
};

SelectContent.propTypes = {
  data: PropTypes.object,
  selectingItem: PropTypes.object,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
  updateItemByField: PropTypes.func,
  validateError: PropTypes.bool,
};

export default SelectContent;
