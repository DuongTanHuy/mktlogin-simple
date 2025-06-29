/* eslint-disable no-plusplus */
import React, { memo, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { bgGradient } from 'src/theme/css';

import Iconify from 'src/components/iconify';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import eventBus from 'src/sections/script/event-bus';
import { Checkbox, IconButton, alpha, useTheme } from '@mui/material';
import SvgColor from 'src/components/svg-color';

import { useSettingsContext } from 'src/components/settings';

const DEFAULT_HANDLE_STYLE = {
  width: 9,
  height: 9,
  bottom: -5,
};

function CustomCookieNode({ data, id, selected }) {
  const { debugMode } = useSettingsContext();
  const reactFlow = useReactFlow();
  const theme = useTheme();
  const [hasError, setHasError] = useState(false);

  const currentLoopData = useMemo(
    () => reactFlow.getNodes().find((i) => i.id === id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, reactFlow]
  );

  const handleChangeNumberSecond = (event) => {
    const { name, checked } = event.target;
    eventBus.emit('updateNode', {
      data: { [name]: checked },
      idNode: id,
    });
  };

  const handleonDoubleClick = (event) => {
    if (event.target.name === 'breakpoint') return;
    if (!event.ctrlKey && !event.shiftKey) {
      eventBus.emit('clickNode', {
        status: 'editting',
        typeForm: data,
        nodeId: id,
      });
    }
  };

  const removeNode = useCallback((node) => {
    eventBus.emit('removeNode', node.nodeOrder);
  }, []);

  const validateProcessChild = (option_values, currentForm, _key, boxErrors) => {
    for (let option = 0; option < option_values.length; option++) {
      if (option_values[option]?.component?.length > 0) {
        for (let compo = 0; compo < option_values[option].component.length; compo++) {
          const _isrequired = option_values[option].component[compo]?.is_required;
          const _keyCom = option_values[option].component[compo]?.key;

          if (
            _isrequired &&
            (currentForm?.dataFields[_keyCom] === '' ||
              currentForm?.dataFields[_keyCom] === undefined ||
              currentForm?.dataFields[_keyCom] === null) &&
            option_values[option].value === currentForm?.dataFields[_key]
          ) {
            if (
              !boxErrors.includes(`${option_values[option].component[compo].label} là bắt buộc`)
            ) {
              boxErrors.push(`${option_values[option].component[compo].label} là bắt buộc`);
            }
          }
          const { option_values: option_values_child } = option_values[option].component[compo];
          if (option_values_child) {
            validateProcessChild(option_values_child, currentForm, _keyCom, boxErrors);
          }
        }
      }
    }
  };

  const validateProcess = useMemo(() => {
    const boxErrors = [];
    const currentNodes = reactFlow.getNodes();
    const currentForm = currentNodes.find((i) => i.id === id);
    if (currentForm && data?.parameters) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < data.parameters.length; i++) {
        const _key = data.parameters[i]?.key;
        let goalField = null;
        // eslint-disable-next-line no-restricted-syntax, guard-for-in
        for (const property in currentForm?.dataFields) {
          if (String(property) === String(_key)) {
            goalField = currentForm?.dataFields[property];
          }
        }
        if (
          data.parameters[i].is_required &&
          (goalField === null || goalField === '' || goalField === undefined)
        ) {
          if (!boxErrors.includes(`${data.parameters[i].label} là bắt buộc`)) {
            boxErrors.push(`${data.parameters[i].label} là bắt buộc`);
          }
        }
        const { option_values } = data.parameters[i];
        if (option_values) {
          validateProcessChild(option_values, currentForm, _key, boxErrors);
        }
      }
    }
    if (boxErrors.length === 0) {
      setHasError(false);
      return '';
    }
    setHasError(true);
    return (
      <Tooltip
        title={
          <Stack>
            {boxErrors.map((item, index) => (
              <Typography key={index}>{item}</Typography>
            ))}
          </Stack>
        }
      >
        <Iconify
          sx={{ color: 'red', flexShrink: 0, cursor: 'pointer' }}
          width={12}
          icon="ph:warning"
        />
      </Tooltip>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.parameters, data.updated, id, reactFlow]);

  return (
    <Stack
      className={data?.className}
      // direction="row"
      justifyContent="center"
      alignItems="start"
      sx={[
        {
          bgcolor: () => {
            if (theme.palette.mode === 'light') {
              return '#ffffff';
            }
            return '#161616';
          },
          boxShadow: theme.customShadows.z8,
          borderRadius: '8px',
          padding: '8px 15px',
          gap: '6px',
          '&:hover': {
            cursor: 'pointer',
            '.default-option': {
              visibility: 'visible',
            },
          },
          ...(data?.isHighlighted && {
            boxShadow: `${alpha(theme.palette.primary.main, 0.6)} 0px 5px 15px`,
          }),
          border: '1px solid',
          borderColor: 'transparent',
          ...(selected && {
            borderColor: theme.palette.primary.main,
          }),
          maxWidth: '141px',
          minWidth: '141px',
          width: '100%',
          cursor: 'grab!important',
        },
      ]}
      onClick={(event) => {
        if (!event.shiftKey) {
          event.preventDefault();
          event.stopPropagation();
        }
        handleonDoubleClick(event);
      }}
    >
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        sx={{
          gap: '6px',
        }}
      >
        <Stack
          sx={{
            borderRadius: '2px',
            padding: '3px',
            ...bgGradient({
              direction: 'to top',
              startColor: alpha(theme.palette.primary.light, 0.6),
              endColor: alpha(theme.palette.primary.main, 0.6),
            }),
          }}
        >
          <Iconify width={12} icon={data?.icon} color="white" />
        </Stack>

        <Typography
          variant="body1"
          sx={{
            fontSize: '10px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: `${hasError ? '108px' : '135px'}`,
          }}
        >
          {data?.name}
        </Typography>

        {validateProcess}
      </Stack>

      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={1}
        sx={{
          borderRadius: '4px',
          px: 1,
          width: '100%',
          maxWidth: '120px',
          overflow: 'hidden',
          background: alpha(theme.palette.grey[600], 0.08),
        }}
      >
        <Typography
          variant="caption"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '10px',
            color: 'text.secondary',
            width: '100%',
            py: 0.5,
          }}
        >
          {`${
            // eslint-disable-next-line no-nested-ternary
            currentLoopData?.dataFields?.action_type === 'import'
              ? 'Nhập'
              : currentLoopData?.dataFields?.action_type === 'export'
                ? 'Xuất'
                : 'Xóa'
          } cookie`}
        </Typography>
      </Stack>

      <Stack
        className="default-option"
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          position: 'absolute',
          top: '-20px',
          right: '0',
          gap: '4px',
          visibility: 'hidden',
          width: '100%',
          padding: '2px',
          borderRadius: '2px',
          borderBottom: '2px solid transparent',
        }}
      >
        <Checkbox
          name="breakpoint"
          checked={currentLoopData?.dataFields?.breakpoint ?? false}
          icon={<Iconify icon="fa-regular:dot-circle" />}
          checkedIcon={<Iconify icon="fa-solid:dot-circle" color="red" />}
          onChange={handleChangeNumberSecond}
          sx={{
            p: 0,
            mt: '-4px',
            width: 12,
            height: 12,
            visibility: debugMode ? 'visible' : 'hidden',
          }}
        />
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Delete" placement="top">
            <IconButton
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                removeNode(data);
              }}
              sx={{
                p: 0.3,
                borderRadius: '4px',
                background: alpha(theme.palette.grey[600], 0.2),
                backdropFilter: 'blur(10px)',
                color: theme.palette.error.main,
              }}
            >
              <SvgColor
                src="/assets/icons/components/ic_delete.svg"
                sx={{ width: 10, height: 10 }}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Run" placement="top">
            <IconButton
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                eventBus.emit('run-script-at-node', currentLoopData?.id);
              }}
              sx={{
                p: 0.3,
                borderRadius: '4px',
                background: alpha(theme.palette.grey[600], 0.2),
                backdropFilter: 'blur(10px)',
              }}
            >
              <Iconify width={10} icon="solar:play-bold" color="primary.main" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Handle
        type="source"
        id="success"
        position={Position.Right}
        style={{
          ...DEFAULT_HANDLE_STYLE,
          background: '#00A76F',
          border: '1px solid',
          borderColor: 'white',
          top: '30%',
        }}
      />
      <Handle
        type="source"
        id="error"
        position={Position.Right}
        style={{
          ...DEFAULT_HANDLE_STYLE,
          background: '#FF5630',
          border: '1px solid',
          borderColor: 'white',
          top: '70%',
          transform: 'translate(50%,-50%)',
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="blue"
        style={{ ...DEFAULT_HANDLE_STYLE, background: theme.palette.primary.main }}
      />
    </Stack>
  );
}

export default memo(
  CustomCookieNode,
  (prevProps, nextProps) =>
    prevProps.data === nextProps.data && prevProps.selected === nextProps.selected
);

CustomCookieNode.propTypes = {
  data: PropTypes.object,
  id: PropTypes.string,
  selected: PropTypes.bool,
};
