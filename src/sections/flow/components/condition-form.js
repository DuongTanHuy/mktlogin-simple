import PropTypes from 'prop-types';

import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  ListItemButton,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import Iconify from 'src/components/iconify';
import eventBus from 'src/sections/script/event-bus';
import { useBoolean } from 'src/hooks/use-boolean';
import cloneDeep from 'lodash/cloneDeep';
import PositionedMenu from 'src/components/list-click';
import Variables from 'src/components/variable';
import ConditionPathDialog from './condition-path-dialog';

export default function ConditionForm({ formData, IdNode }) {
  const [listPath, setListPath] = useState([]);
  const getId = () => String(Date.now());
  const showConditionPathDialog = useBoolean();
  const [currentPath, setCurrentPath] = useState({});
  const [showSetting, setShowSetting] = useState(false);
  const variableModal = useBoolean();

  const handleCloseConditionPathDialog = () => {
    showConditionPathDialog.onFalse();
    setCurrentPath({});
  };

  const handleAddPath = () => {
    const _clone = cloneDeep(listPath);
    _clone.push({ id: `condition-${getId()}`, name: `Nhánh ${_clone.length + 1}`, conditions: [] });

    setListPath(_clone);

    eventBus.emit('updateNode', { data: { conditions: _clone }, idNode: IdNode });
  };

  const handleUpdatePath = (data) => {
    const newPath = listPath.map((item) => (item.id === data.id ? data : item));
    setListPath(newPath);
    eventBus.emit('updateNode', { data: { conditions: newPath }, idNode: IdNode });
  };

  const handleDeletePath = (id) => {
    const newPath = listPath.filter((item) => item.id !== id);
    setListPath(newPath);
    eventBus.emit('updateNode', { data: { conditions: newPath }, idNode: IdNode });
  };

  const handleChangeNumberSecond = (event) => {
    const { name, value, type, checked } = event.target;
    eventBus.emit('updateNode', {
      data: { [name]: type === 'checkbox' ? checked : value },
      idNode: IdNode,
    });
  };

  const getVariable = (name, item) => {
    eventBus.emit('updateNode', { data: { [name]: `\${${item?.key}}` }, idNode: IdNode });
  };

  useEffect(() => {
    if (formData?.dataFields?.conditions) {
      setListPath(formData.dataFields.conditions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [IdNode]);

  return (
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Button variant="contained" onClick={handleAddPath}>
          Thêm nhánh
        </Button>
        <IconButton
          onClick={() => setShowSetting((prev) => !prev)}
          sx={{
            borderRadius: 1,
            background: (theme) => alpha(theme.palette.grey[600], 0.2),
          }}
        >
          <Iconify icon={showSetting ? 'mingcute:close-fill' : 'uil:setting'} color="back" />
        </IconButton>
      </Stack>
      {!showSetting ? (
        listPath.map((item, index) => (
          <ListItemButton
            key={item.id}
            sx={{
              borderRadius: 1,
              py: 0,
              padding: '0 0 0 15px',
              minHeight: '40px',
            }}
            onClick={() => {
              showConditionPathDialog.onTrue();
              setCurrentPath(item);
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" width={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="ph:flow-arrow-bold" />
                <Typography
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 400,
                  }}
                >
                  {item.name}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton
                  onClick={() => {
                    showConditionPathDialog.onTrue();
                    setCurrentPath(item);
                  }}
                >
                  <Iconify icon="iconamoon:edit" />
                </IconButton>
                <IconButton
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeletePath(item.id);
                  }}
                >
                  <Iconify icon="material-symbols:delete-outline" color="error.main" />
                </IconButton>
              </Stack>
            </Stack>
          </ListItemButton>
        ))
      ) : (
        <Stack spacing={2}>
          <FormControlLabel
            name="retry"
            control={<Checkbox checked={formData?.dataFields?.retry || false} />}
            onChange={handleChangeNumberSecond}
            label="Retry if no conditions are met"
            sx={{
              width: 'fit-content',
              // '& .MuiButtonBase-root': {
              //   padding: '2px',
              //   ml: 1,
              // },
            }}
          />

          {formData?.dataFields?.retry && (
            <>
              <TextField
                onChange={handleChangeNumberSecond}
                value={formData?.dataFields?.try_for || ''}
                name="try_for"
                label="Try for"
                InputProps={{
                  endAdornment: (
                    <PositionedMenu
                      name="try_for"
                      getVariable={getVariable}
                      openVariableModal={variableModal.onTrue}
                    />
                  ),
                }}
              />
              <TextField
                onChange={handleChangeNumberSecond}
                value={formData?.dataFields?.timeout || ''}
                name="timeout"
                label="Timeout"
                InputProps={{
                  endAdornment: (
                    <PositionedMenu
                      name="timeout"
                      getVariable={getVariable}
                      openVariableModal={variableModal.onTrue}
                    />
                  ),
                }}
                sx={{
                  mt: 1,
                }}
              />
            </>
          )}
        </Stack>
      )}
      <ConditionPathDialog
        open={showConditionPathDialog.value}
        onClose={handleCloseConditionPathDialog}
        IdNode={IdNode}
        conditionPath={currentPath}
        handleUpdatePath={handleUpdatePath}
      />
      <Variables addOne open={variableModal.value} onClose={variableModal.onFalse} />
    </Stack>
  );
}

ConditionForm.propTypes = {
  formData: PropTypes.object,
  IdNode: PropTypes.string,
};
