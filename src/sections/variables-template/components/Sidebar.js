import PropTypes from 'prop-types';

import { useMemo } from 'react';
import { Card, IconButton, Stack, Typography } from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useAuthContext } from 'src/auth/hooks';
import { findItemById, updateItemConfigById } from '../utils';

import Group from '../forms/Group';
import Grid from '../forms/Grid';
import Divider from '../forms/Divider';
import Select from '../forms/Select';
import Alert from '../forms/Alert';
import Input from '../forms/Input';
import SwitchMode from '../forms/Switch';
import Checkbox from '../forms/Checkbox';
import Inline from '../forms/Inline';
import RadioTemplate from '../forms/Radio';
import Textarea from '../forms/Textarea';
import Link from '../forms/Link';
import Text from '../forms/Text';
import InputNumber from '../forms/InputNumber';
import Slider from '../forms/Slider';
import File from '../forms/File';
import Image from '../forms/Image';
import Html from '../forms/html';
import Range from '../forms/Range';

const componentMap = {
  Group,
  Grid,
  Divider,
  Inline,
  Alert,
  Input,
  'Input Number': InputNumber,
  Textarea,
  SelectDropdown: Select,
  Switch: SwitchMode,
  Checkbox,
  Radio: RadioTemplate,
  Select,
  Slider,
  Range,
  Link,
  Text,
  File,
  Image,
  Html,
};

const Sidebar = ({
  selectingItem,
  ruleset,
  updateGroupOrder,
  setSelectingItem,
  assignedVariable,
  setAssignedVariable,
}) => {
  const { variableFlow } = useAuthContext();
  const SelectedComponent = componentMap[selectingItem.name];

  // console.log(assignedVariable);

  const fetchVariables = useMemo(() => {
    if (variableFlow?.list === null || variableFlow?.list?.length === 0) return [];

    return variableFlow?.list
      ?.filter((item) => !assignedVariable.includes(item.id))
      .map((i, index) => ({
        ...i,
        lastItem: index + 1 === variableFlow.list.length,
      }));
  }, [assignedVariable, variableFlow.list]);

  function removeNumberOnce(array, n) {
    const index = array.indexOf(n);
    if (index !== -1) array.splice(index, 1);

    return array;
  }

  const updateItemByField = (item, fieldName, content) => {
    if (fieldName === 'variable') {
      let newAssignedVariable = [...assignedVariable];
      if (content) {
        if (item?.config?.variable?.id)
          newAssignedVariable = removeNumberOnce(newAssignedVariable, item?.config?.variable?.id);

        setAssignedVariable([...newAssignedVariable, content?.id]);
      } else {
        newAssignedVariable = removeNumberOnce(newAssignedVariable, item?.config?.variable?.id);

        setAssignedVariable(newAssignedVariable);
      }
    }

    const afterUpdated = updateItemConfigById(ruleset, item.id, fieldName, content);
    updateGroupOrder(afterUpdated.id, afterUpdated.group);
  };

  const currentTemplate = useMemo(
    () => findItemById(ruleset, selectingItem.id),
    [ruleset, selectingItem]
  );

  return (
    <Card
      sx={{
        py: 1,
        borderRadius: 1,
        height: '100%',
      }}
    >
      <Scrollbar
        sx={{
          height: '100%',
          px: 2,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography sx={{ fontSize: '18px' }}>Component Attribute</Typography>
          <IconButton onClick={() => setSelectingItem(null)}>
            <Iconify icon="mingcute:close-fill" />
          </IconButton>
        </Stack>
        {SelectedComponent && (
          <SelectedComponent
            template={currentTemplate}
            updateItemByField={updateItemByField}
            variableOptions={fetchVariables}
          />
        )}
      </Scrollbar>
    </Card>
  );
};

Sidebar.propTypes = {
  selectingItem: PropTypes.object,
  ruleset: PropTypes.object,
  updateGroupOrder: PropTypes.func,
  setSelectingItem: PropTypes.func,
  assignedVariable: PropTypes.array,
  setAssignedVariable: PropTypes.func,
};

export default Sidebar;
