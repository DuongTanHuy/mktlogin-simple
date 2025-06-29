/* eslint-disable no-plusplus */
import React, { memo, useCallback, useMemo } from 'react';
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

function CustomElementExistNode({ data, id, selected }) {
  const { debugMode } = useSettingsContext();
  const reactFlow = useReactFlow();
  const theme = useTheme();

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
          boxErrors.push({ name: `${data.parameters[i].label} là bắt buộc` });
        }
        const { option_values } = data.parameters[i];
        if (option_values) {
          for (let option = 0; option < option_values.length; option++) {
            if (option_values[option]?.component?.length > 0) {
              for (let compo = 0; compo < option_values[option].component.length; compo++) {
                const _isrequired = option_values[option].component[compo]?.is_required;
                const _keyCom = option_values[option].component[compo]?.key;
                if (
                  _isrequired &&
                  currentForm?.dataFields[_keyCom] === '' &&
                  option_values[option].value === currentForm?.dataFields[_key]
                ) {
                  boxErrors.push({
                    name: `${option_values[option].component[compo].label} là bắt buộc`,
                  });
                }
              }
            }
          }
        }
      }
    }
    if (boxErrors.length === 0) {
      return '';
    }
    return (
      <Tooltip
        title={
          <Stack>
            {boxErrors.map((item) => (
              <Typography key={item.name}>{item.name}</Typography>
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
      direction="column"
      justifyContent="flex-start"
      alignItems="start"
      sx={[
        {
          minWidth: 140,
          maxWidth: 140,
          bgcolor: () => {
            if (theme.palette.mode === 'light') {
              return '#ffffff';
            }
            return '#161616';
          },
          boxShadow: theme.customShadows.z8,
          // border: '1px solid',
          // borderColor: alpha(theme.palette.grey[500], 0.32),
          borderRadius: '8px',
          padding: '8px 15px',
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
        width={1}
        spacing={0.5}
      >
        <Stack
          sx={{
            borderRadius: '2px',
            padding: '3px',
            ...bgGradient({
              direction: 'to top',
              startColor: alpha(theme.palette.warning.light, 0.6),
              endColor: alpha(theme.palette.warning.main, 0.6),
            }),
          }}
        >
          <Iconify width={12} icon={data?.icon} color="white" />
        </Stack>
        <Typography
          variant="body1"
          sx={{
            fontSize: '10px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {data?.name}
        </Typography>
        {validateProcess}
      </Stack>

      <Stack mt={1} spacing={0.5} width={1}>
        <Stack direction="row" position="relative">
          <Typography
            variant="caption"
            textAlign="right"
            sx={{
              fontSize: '10px',
              color: 'text.secondary',
              width: '100%',
              px: 1,
              py: 0.5,
              borderRadius: '4px',
              background: alpha(theme.palette.grey[600], 0.08),
            }}
          >
            {currentLoopData?.dataFields?.element_selector || 'Element selector'}
          </Typography>
          <Handle
            type="source"
            id="inner"
            position={Position.Right}
            style={{
              ...DEFAULT_HANDLE_STYLE,
              background: theme.palette.success.main,
              border: '1px solid',
              borderColor: 'white',
              transform: 'translate(20px,-50%)',
            }}
          />
        </Stack>
        <Stack direction="row" position="relative">
          <Stack
            direction="row"
            spacing={0.2}
            alignItems="center"
            justifyContent="flex-end"
            width={1}
          >
            <Iconify icon="mingcute:warning-line" color="text.secondary" width={12} />
            <Typography variant="caption" color="text.secondary" fontSize={10}>
              Fallback
            </Typography>
          </Stack>
          <Handle
            type="source"
            id="outer"
            position={Position.Right}
            style={{
              ...DEFAULT_HANDLE_STYLE,
              background: theme.palette.warning.main,
              border: '1px solid',
              borderColor: 'white',
              transform: 'translate(20px,-50%)',
            }}
          />
        </Stack>
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
        type="target"
        position={Position.Left}
        id="blue"
        style={{ ...DEFAULT_HANDLE_STYLE, background: theme.palette.primary.main }}
      />
    </Stack>
  );
}

export default memo(
  CustomElementExistNode,
  (prevProps, nextProps) =>
    prevProps.data === nextProps.data && prevProps.selected === nextProps.selected
);

CustomElementExistNode.propTypes = {
  data: PropTypes.object,
  id: PropTypes.string,
  selected: PropTypes.bool,
};
