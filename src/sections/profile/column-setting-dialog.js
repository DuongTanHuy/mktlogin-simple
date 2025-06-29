import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  formControlLabelClasses,
} from '@mui/material';
import { useLocales } from 'src/locales';

export default function ColumnSettingDialog({ open, onClose, options, values, setValues }) {
  const { t } = useLocales();
  const [columnVisible, setColumnVisible] = useState([]);

  const handleApply = () => {
    setValues(columnVisible);
    onClose();
  };

  const handleClose = () => {
    onClose();
    setColumnVisible(values || []);
  };

  useEffect(() => {
    setColumnVisible(values);
  }, [values]);

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: (theme) => theme.customShadows.z4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>{t('form.label.column-setting')}</DialogTitle>

      <DialogContent sx={{ typography: 'body2' }}>
        <FormGroup
          sx={{
            display: 'grid',
            whiteSpace: 'nowrap',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            [`& .${formControlLabelClasses.root}`]: {
              mr: 0,
            },
          }}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.id}
              control={
                <Checkbox
                  checked={!columnVisible.includes(option.id)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setColumnVisible((prev) => prev.filter((id) => id !== option.id));
                    } else {
                      setColumnVisible((prev) => [...prev, option.id]);
                    }
                  }}
                />
              }
              label={option.label}
            />
          ))}
        </FormGroup>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          {t('form.action.cancel')}
        </Button>
        <Button variant="contained" onClick={handleApply}>
          {t('form.action.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ColumnSettingDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  options: PropTypes.array,
  values: PropTypes.array,
  setValues: PropTypes.func,
};
