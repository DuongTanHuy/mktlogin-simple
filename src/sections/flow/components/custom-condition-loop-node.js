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
import { IconButton, alpha, useTheme } from '@mui/material';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import SvgColor from 'src/components/svg-color';

const DEFAULT_HANDLE_STYLE = {
  width: 9,
  height: 9,
  bottom: -5,
};

function CustomConditionLoopNode({ data, id, selected }) {
  const reactFlow = useReactFlow();
  const theme = useTheme();
  const { copy } = useCopyToClipboard();
  const [displayCopyTooltip, setDisplayCopyTooltip] = useState(false);

  const currentLoopData = useMemo(
    () => reactFlow.getNodes().find((i) => i.id === id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, reactFlow]
  );

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
        if (data.parameters[i].is_required && (goalField === null || goalField?.length === 0)) {
          boxErrors.push({ name: `${data.parameters[i].label} là bắt buộc` });
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
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
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
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          // maxWidth: `${hasError ? '108px' : '135px'}`,
        }}
      >
        {data?.name}
      </Typography>
      {validateProcess}

      <Stack
        className="default-option"
        direction="row"
        justifyContent="space-between"
        sx={{
          position: 'absolute',
          top: '-20px',
          right: '0',
          visibility: 'hidden',
          width: '100%',
          padding: '2px',
          borderRadius: '2px',
          borderBottom: '2px solid transparent',
        }}
      >
        <Tooltip
          onClose={() => setDisplayCopyTooltip(false)}
          open={displayCopyTooltip}
          title="Copied"
          placement="top"
        >
          <Typography
            sx={{
              fontSize: '10px',
              color: 'text.secondary',
              maxWidth: '100px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              '&:hover': {
                color: 'text.primary',
                textDecoration: 'underline',
              },
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDisplayCopyTooltip(true);
              copy(currentLoopData?.dataFields?.loop_id);
            }}
          >
            {currentLoopData?.dataFields?.loop_id}
          </Typography>
        </Tooltip>

        <Stack direction="row" spacing={0.5}>
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

      {/* <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} /> */}
      <Handle
        type="source"
        id="success"
        position={Position.Right}
        style={{
          ...DEFAULT_HANDLE_STYLE,
          background: '#00A76F',
          border: '1px solid',
          borderColor: 'white',
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
  CustomConditionLoopNode,
  (prevProps, nextProps) =>
    prevProps.data === nextProps.data && prevProps.selected === nextProps.selected
);

CustomConditionLoopNode.propTypes = {
  data: PropTypes.object,
  id: PropTypes.string,
  selected: PropTypes.bool,
};
