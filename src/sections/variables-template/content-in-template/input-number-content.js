import { ButtonGroup, IconButton, Stack, TextField, Typography } from '@mui/material';
import Iconify from 'src/components/iconify';
import WithSectionAction from '../components/WithSelectionAction';

const PropTypes = require('prop-types');

const InputNumberContent = ({
  data,
  selectingItem,
  onDuplicate,
  onDelete,
  updateItemByField,
  validateError,
}) => {
  const handleIncrement = () => {
    const newValue = Number(data?.config?.defaultValue) + 1;
    updateItemByField(data, 'defaultValue', newValue);
  };

  const handleDecrement = () => {
    const newValue = Number(data?.config?.defaultValue) - 1;
    updateItemByField(data, 'defaultValue', newValue);
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

        <TextField
          error={validateError}
          value={data?.config?.defaultValue}
          onChange={(e) => updateItemByField(data, 'defaultValue', e.target.value)}
          size="small"
          type="number"
          fullWidth
          sx={{
            transition: 'all 0.3s',
            ...(data?.config?.width && {
              width: `${data?.config?.width}px`,
            }),
          }}
          inputProps={{
            readOnly: !updateItemByField || data?.config?.readOnly,
          }}
          placeholder={data?.config?.placeholder}
          onWheel={(e) => {
            e.target.blur();
          }}
          InputProps={{
            endAdornment: (
              <ButtonGroup
                variant="outlined"
                sx={{
                  ...(!data?.config?.showButton && {
                    display: 'none',
                  }),
                }}
              >
                <IconButton
                  onClick={handleDecrement}
                  disabled={!updateItemByField || data?.config?.readOnly}
                >
                  <Iconify icon="ic:round-minus" />
                </IconButton>
                <IconButton
                  onClick={handleIncrement}
                  disabled={!updateItemByField || data?.config?.readOnly}
                >
                  <Iconify icon="ic:round-plus" />
                </IconButton>
              </ButtonGroup>
            ),
          }}
        />
      </Stack>
    </WithSectionAction>
  );
};

InputNumberContent.propTypes = {
  data: PropTypes.object,
  selectingItem: PropTypes.object,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
  updateItemByField: PropTypes.func,
  validateError: PropTypes.bool,
};

export default InputNumberContent;
