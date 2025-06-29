import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Stack, Typography } from '@mui/material';
import { useLocales } from 'src/locales';
import { enqueueSnackbar } from 'notistack';
import Scrollbar from 'src/components/scrollbar';
import { useAuthContext } from 'src/auth/hooks';
import { getValueRuleset } from 'src/utils/profile';
import { LoadingScreen } from 'src/components/loading-screen';
import Preview from '../variables-template/components/PreviewDialog';
import { contentMap, dfs } from '../variables-template/create-template';
import { findItemById } from '../variables-template/utils';

export default function WorkflowRunningConfig({
  ruleset,
  setRuleset,
  inputValidate,
  setInputValidate,
}) {
  const { t } = useLocales();
  const { variableFlow } = useAuthContext();
  const [loading, setLoading] = useState(true);

  const updateGroupOrder = (id, group, fieldId) => {
    if (fieldId) {
      setInputValidate((prevState) => prevState.filter((i) => i !== fieldId));
    }

    const _findParrent = findItemById(ruleset, id);

    if (_findParrent?.name === 'Group') {
      const checkAnyGrids = group.find((i) => i.name === 'Grid');
      if (checkAnyGrids) {
        enqueueSnackbar('The maximum number of grid is 1', { variant: 'warning' });
        return false;
      }
    }

    setRuleset((prevState) => {
      const newRuleset = { ...prevState }; // Sao chép state hiện tại

      const toUpdate = dfs(newRuleset, id); // Tìm nhóm cần cập nhật

      if (toUpdate?.type === 'GROUP') {
        toUpdate.children = group; // Cập nhật children của nhóm đó
      }

      return newRuleset; // Trả về state đã cập nhật
    });

    return true;
  };

  useEffect(() => {
    if (ruleset) {
      setLoading(true);
      const variableMap = variableFlow?.list?.reduce((acc, item) => {
        acc[item.id] = item.value;
        return acc;
      }, {});
      const designData = variableFlow?.dataFlow?.design_data;
      setRuleset({
        ...designData,
        children: designData?.children.map((item) => {
          if (item?.name === 'Group' && item?.children?.length > 0) {
            return {
              ...item,
              children: item.children.map((child) => ({
                ...child,
                config: {
                  ...child.config,
                  ...getValueRuleset(null, variableMap, child),
                },
              })),
            };
          }
          if (item?.name === 'Grid' && item?.children?.length > 0) {
            return {
              ...item,
              children: item.children.map((child) => {
                if (child?.name === 'Group' && child?.children?.length > 0) {
                  return {
                    ...child,
                    children: child.children.map((subChild) => ({
                      ...subChild,
                      config: {
                        ...subChild.config,
                        ...getValueRuleset(null, variableMap, subChild),
                      },
                    })),
                  };
                }
                return {
                  ...child,
                };
              }),
            };
          }
          return {
            ...item,
            config: {
              ...item.config,
              ...getValueRuleset(null, variableMap, item),
            },
          };
        }),
      });
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRuleset, variableFlow?.dataFlow?.design_data, variableFlow?.list]);

  return (
    <Stack
      sx={{
        overflow: 'auto',
        height: 'calc(100% - 100px)',
      }}
    >
      {loading ? (
        <LoadingScreen />
      ) : (
        <Scrollbar autoHide={false}>
          {ruleset?.id && ruleset?.children?.length > 0 ? (
            <Preview
              group={ruleset}
              contentMap={contentMap}
              updateGroupOrder={updateGroupOrder}
              inputValidate={inputValidate}
              setInputValidate={setInputValidate}
            />
          ) : (
            <Typography textAlign="center" color="text.secondary">
              {t('dialog.rpa.tabs.input.noData')}
            </Typography>
          )}
        </Scrollbar>
      )}
    </Stack>
  );
}

WorkflowRunningConfig.propTypes = {
  ruleset: PropTypes.object,
  inputValidate: PropTypes.array,
  setRuleset: PropTypes.func,
  setInputValidate: PropTypes.func,
};
