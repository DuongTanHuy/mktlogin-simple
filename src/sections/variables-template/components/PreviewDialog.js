import { Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { showValueHasMinMax, updateItemConfigById } from '../utils';

const PropTypes = require('prop-types');

function Preview({ group, level = 0, contentMap, updateGroupOrder, inputValidate = [], ...other }) {
  const { children, config } = group;

  const updateItemByField = useCallback(
    (item, fieldName, content) => {
      const afterUpdated = updateItemConfigById(group, item.id, fieldName, content);

      updateGroupOrder(afterUpdated.id, afterUpdated.group, item.id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [group, updateGroupOrder]
  );

  return (
    <Stack
      className="item-flow-template"
      sx={{
        height: 'auto',
        overflow: 'auto',
        ...other?.sx,
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ width: '100%', position: 'relative' }}>
        {level > 0 && !config?.hideLabel && (
          <Typography
            sx={{
              minWidth: '100px',
              width: `${config?.labelWidth}px`,
              transition: 'all 0.3s',
              flexShrink: 0,
            }}
          >
            {config?.name}
          </Typography>
        )}
        <Stack
          sx={{
            flex: '1',
            borderRadius: level !== 0 ? 1 : 0,
            border: level !== 0 && config?.showBorder && '1px solid lightgray',
            // padding: level !== 0 && '10px',
            height: (level !== 0 && showValueHasMinMax([100, 1000], config?.height)) || 'auto',
            minHeight: '100px',
            maxWidth: showValueHasMinMax([100, 1000], config?.width),
            '& > div:first-of-type': {
              gap: group.name === 'Grid' && (config?.gap || 1),
            },
          }}
          className={group.name === 'Grid' && 'grid-option'}
        >
          <Stack>
            {children.map((c) => {
              let content;

              if (c.type === 'GROUP')
                content = (
                  <Preview
                    group={c}
                    level={level + 1}
                    contentMap={contentMap}
                    updateGroupOrder={updateGroupOrder}
                    inputValidate={inputValidate}
                  />
                );
              if (c.type === 'ITEM') {
                const ContentComponent = contentMap[c.name];
                content = (
                  <Stack
                    className={`${c.class} shared item`}
                    sx={{
                      width: '100%',
                      '& #wrapper-content': {
                        border: 'none!important',
                      },
                    }}
                  >
                    {ContentComponent && (
                      <ContentComponent
                        data={c}
                        updateItemByField={updateItemByField}
                        validateError={inputValidate.includes(c.id)}
                      />
                    )}
                  </Stack>
                );
              }

              return (
                <Stack
                  key={c.id}
                  className={`common-item ${level > 0 ? c.class : ''} ${
                    c.isChildGrid && 'is-child-grid'
                  }`}
                  sx={{
                    ...(level !== 0 && {
                      alignItems: 'center',
                      justifyContent: 'center',
                      // px: '10px',
                    }),
                    '& div': {
                      mb: '0px!important',
                    },
                    // '& .MuiStack-root': {
                    //   py: '4px!important',
                    //   justifyContent: 'flex-start',
                    // },
                  }}
                >
                  {content}
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

export default Preview;

Preview.propTypes = {
  group: PropTypes.object,
  level: PropTypes.number,
  contentMap: PropTypes.object,
  updateGroupOrder: PropTypes.func,
  inputValidate: PropTypes.array,
};
