import { Stack, Switch, Typography, styled } from '@mui/material';
import WithSectionAction from '../components/WithSelectionAction';

const PropTypes = require('prop-types');

const MaterialUISwitch = styled(Switch)(({ theme, loading }) => ({
  width: 48,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    margin: 0,
    padding: 0,
    transform: 'translateY(2px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translate(22px, 2px)',
      '& .MuiSwitch-thumb:before': {
        ...(loading === 'true' && {
          backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0Ij48ZyBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIHN0cm9rZS1kYXNoYXJyYXk9IjE2IiBzdHJva2UtZGFzaG9mZnNldD0iMTYiIGQ9Ik0xMiAzYzQuOTcgMCA5IDQuMDMgOSA5Ij48YW5pbWF0ZSBmaWxsPSJmcmVlemUiIGF0dHJpYnV0ZU5hbWU9InN0cm9rZS1kYXNob2Zmc2V0IiBkdXI9IjAuM3MiIHZhbHVlcz0iMTY7MCIvPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgZHVyPSIxLjVzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgdHlwZT0icm90YXRlIiB2YWx1ZXM9IjAgMTIgMTI7MzYwIDEyIDEyIi8+PC9wYXRoPjxwYXRoIHN0cm9rZS1kYXNoYXJyYXk9IjY0IiBzdHJva2UtZGFzaG9mZnNldD0iNjQiIHN0cm9rZS1vcGFjaXR5PSIwLjMiIGQ9Ik0xMiAzYzQuOTcgMCA5IDQuMDMgOSA5YzAgNC45NyAtNC4wMyA5IC05IDljLTQuOTcgMCAtOSAtNC4wMyAtOSAtOWMwIC00Ljk3IDQuMDMgLTkgOSAtOVoiPjxhbmltYXRlIGZpbGw9ImZyZWV6ZSIgYXR0cmlidXRlTmFtZT0ic3Ryb2tlLWRhc2hvZmZzZXQiIGR1cj0iMS4ycyIgdmFsdWVzPSI2NDswIi8+PC9wYXRoPjwvZz48L3N2Zz4=')`,
        }),
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#fff',
    width: 20,
    height: 20,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      ...(loading === 'true' && {
        backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0Ij48ZyBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIHN0cm9rZS1kYXNoYXJyYXk9IjE2IiBzdHJva2UtZGFzaG9mZnNldD0iMTYiIGQ9Ik0xMiAzYzQuOTcgMCA5IDQuMDMgOSA5Ij48YW5pbWF0ZSBmaWxsPSJmcmVlemUiIGF0dHJpYnV0ZU5hbWU9InN0cm9rZS1kYXNob2Zmc2V0IiBkdXI9IjAuM3MiIHZhbHVlcz0iMTY7MCIvPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgZHVyPSIxLjVzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgdHlwZT0icm90YXRlIiB2YWx1ZXM9IjAgMTIgMTI7MzYwIDEyIDEyIi8+PC9wYXRoPjxwYXRoIHN0cm9rZS1kYXNoYXJyYXk9IjY0IiBzdHJva2UtZGFzaG9mZnNldD0iNjQiIHN0cm9rZS1vcGFjaXR5PSIwLjMiIGQ9Ik0xMiAzYzQuOTcgMCA5IDQuMDMgOSA5YzAgNC45NyAtNC4wMyA5IC05IDljLTQuOTcgMCAtOSAtNC4wMyAtOSAtOWMwIC00Ljk3IDQuMDMgLTkgOSAtOVoiPjxhbmltYXRlIGZpbGw9ImZyZWV6ZSIgYXR0cmlidXRlTmFtZT0ic3Ryb2tlLWRhc2hvZmZzZXQiIGR1cj0iMS4ycyIgdmFsdWVzPSI2NDswIi8+PC9wYXRoPjwvZz48L3N2Zz4=')`,
      }),
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: 'rgba(145, 158, 171, 0.48)',
    borderRadius: 12,
  },
}));

const SwitchContent = ({ data, selectingItem, onDuplicate, onDelete, updateItemByField }) => (
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
        }}
      >
        <MaterialUISwitch
          checked={data?.config?.defaultValue}
          onChange={(e) => {
            if (updateItemByField) {
              updateItemByField(data, 'defaultValue', e.target.checked);
            }
          }}
          inputProps={{
            readOnly: !updateItemByField,
          }}
          loading={`${data?.config?.loading}`}
        />
      </Stack>
    </Stack>
  </WithSectionAction>
);

SwitchContent.propTypes = {
  data: PropTypes.object,
  selectingItem: PropTypes.object,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
  updateItemByField: PropTypes.func,
};

export default SwitchContent;
