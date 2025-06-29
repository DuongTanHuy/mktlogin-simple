import { cloneDeep, map, omit, some } from 'lodash';
import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// mui
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useLocales } from 'src/locales';
import Iconify from '../iconify';

//----------------------------------------------------------------

const TYPE_OPTIONS = [
  { label: 'Any', value: 'any' },
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Array', value: 'array' },
];

//----------------------------------------------------------------

const TableDialog = ({ open, onClose, table, setTableData }) => {
  const [columnName, setColumnName] = useState('');
  const [listColumn, setListColumn] = useState([]);
  const [error, setError] = useState('');
  const { t } = useLocales();

  const addNewColumn = () => {
    if (columnName === '') {
      setError(t('workflow.script.dialog.table.error.required'));
      return;
    }
    setError('');

    const isAvailable = some(listColumn, { name: columnName });

    if (isAvailable) return;

    const _clone = cloneDeep(listColumn);
    _clone.push({
      name: columnName,
      type: 'text',
      error: '',
    });

    setListColumn(_clone);
    setColumnName('');
  };

  const updateColumn = (name, event, index) => {
    const _clone = cloneDeep(listColumn);
    _clone[index][name] = event.target.value;

    if (name === 'name') {
      if (event.target.value === '') {
        _clone[index].error = t('workflow.script.dialog.table.error.required');
      } else {
        const isAvailable = some(listColumn, { name: event.target.value });
        _clone[index].error = isAvailable ? t('workflow.script.dialog.table.error.exist') : '';
      }
    }
    setListColumn(_clone);
  };

  const deleteColumn = (index) => {
    const _clone = cloneDeep(listColumn);
    _clone.splice(index, 1);
    setListColumn(_clone);
  };

  const submitForm = async () => {
    const hasError = some(listColumn, (obj) => (obj?.error ? obj.error !== '' : false));
    if (hasError) return;

    const filteredData = map(listColumn, (column) => omit(column, 'error'));
    setTableData(filteredData);
    handleClose();
  };

  const handleClose = () => {
    setColumnName('');
    setError('');
    onClose();
  };

  useEffect(() => {
    setListColumn(table);
  }, [table]);

  return (
    <Dialog
      fullWidth
      open={open}
      sx={{
        '& .MuiDialog-container': {
          '& .MuiPaper-root': {
            width: '800px',
            maxWidth: '100%',
          },
        },
      }}
    >
      <DialogTitle>{t('workflow.script.dialog.table.title')}</DialogTitle>
      <Stack spacing={3} p={3} py={0}>
        <Stack direction="row" spacing={2} alignItems="start">
          <TextField
            fullWidth
            size="small"
            label={t('workflow.script.dialog.table.label.name')}
            value={columnName}
            onClick={() => setError('')}
            onChange={(event) => setColumnName(event.target.value)}
            error={!!error}
            helperText={error}
          />
          <Button variant="contained" onClick={addNewColumn}>
            {t('workflow.script.actions.add')}
          </Button>
        </Stack>
        {listColumn.length > 0 ? (
          <Stack
            spacing={2}
            sx={{
              border: '1px solid',
              borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
              borderRadius: 1,
              p: 1,
            }}
          >
            {listColumn.map((column, index) => (
              <Stack key={index} direction="row" spacing={2} alignItems="start">
                <TextField
                  fullWidth
                  error={!!column.error}
                  helperText={column.error}
                  size="small"
                  value={column.name}
                  placeholder={t('workflow.script.dialog.table.label.name')}
                  onChange={(event) => updateColumn('name', event, index)}
                />
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={column.type}
                  onChange={(event) => updateColumn('type', event, index)}
                >
                  {TYPE_OPTIONS.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Tooltip title="Xóa" placement="top" arrow>
                  <IconButton
                    sx={{
                      width: 39,
                      height: 39,
                    }}
                    onClick={() => deleteColumn(index)}
                  >
                    <Iconify icon="material-symbols:delete" />
                  </IconButton>
                </Tooltip>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography textAlign="center" color="text.secondary">
            {t('workflow.script.dialog.table.noData')}
          </Typography>
        )}
      </Stack>
      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={handleClose}>
          {t('workflow.script.actions.close')}
        </Button>
        <LoadingButton type="submit" variant="contained" color="primary" onClick={submitForm}>
          {t('workflow.script.actions.confirm')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default memo(TableDialog);

TableDialog.propTypes = {
  open: PropTypes.bool,
  table: PropTypes.array,
  onClose: PropTypes.func,
  setTableData: PropTypes.func,
};
