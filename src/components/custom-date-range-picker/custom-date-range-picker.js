import PropTypes from 'prop-types';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
import { useEffect, useState } from 'react';
import { fDate } from 'src/utils/format-time';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function CustomDateRangePicker({
  title = 'Chọn khoảng thời gian',
  variant = 'input',
  //
  startDate,
  endDate,
  //
  onChangeStartDate,
  onChangeEndDate,
  setCompareDateFilter,
  options,
  //
  open,
  onClose,
  //
  error,
}) {
  const { t } = useLocales();
  const mdUp = useResponsive('up', 'md');

  const isCalendarView = variant === 'calendar';

  const [startValue, setStartValue] = useState(startDate);
  const [endValue, setEndValue] = useState(endDate);
  const [compareValue, setCompareValue] = useState({
    startDate: null,
    endDate: null,
  });

  const handleChangeDateFilter = () => {
    onChangeStartDate(startValue);
    onChangeEndDate(endValue);
    if (typeof setCompareDateFilter === 'function') {
      setCompareDateFilter(compareValue);
    }
    onClose();
  };

  useEffect(() => {
    setStartValue(startDate);
    setEndValue(endDate);
  }, [endDate, startDate]);

  return (
    <Dialog
      fullWidth
      maxWidth={isCalendarView ? false : 'xs'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          ...(isCalendarView && {
            maxWidth: 720,
          }),
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      <DialogContent
        sx={{
          ...(isCalendarView &&
            mdUp && {
              overflow: 'unset',
            }),
        }}
      >
        <Stack spacing={1}>
          {typeof options === 'function' && options()}
          <Stack
            justifyContent="center"
            spacing={isCalendarView ? 3 : 2}
            direction={isCalendarView && mdUp ? 'row' : 'column'}
            sx={{ pt: 1 }}
          >
            {isCalendarView ? (
              <>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: 'divider',
                    borderStyle: 'dashed',
                    '&.MuiPaper-root': {
                      width: 1,
                    },
                    '& .MuiDateCalendar-root': {
                      width: 1,
                      maxHeight: 290,
                    },
                  }}
                >
                  <DateCalendar
                    value={startValue}
                    onChange={(value) => {
                      const oneDay = 24 * 60 * 60 * 1000;
                      let diffDays;
                      let startDateTmp;
                      let endDateTmp;

                      if (new Date(value).getTime() > new Date(endValue).getTime()) {
                        diffDays = Math.round(Math.abs((value - startValue) / oneDay));
                        startDateTmp = new Date(startValue);
                        startDateTmp.setDate(startDateTmp.getDate() - diffDays - 1);
                        endDateTmp = new Date(startValue);
                        endDateTmp.setDate(endDateTmp.getDate() - 1);

                        setEndValue(value);
                      } else {
                        diffDays = Math.round(Math.abs((endValue - value) / oneDay));
                        startDateTmp = new Date(value);
                        startDateTmp.setDate(startDateTmp.getDate() - diffDays - 1);
                        endDateTmp = new Date(value);
                        endDateTmp.setDate(endDateTmp.getDate() - 1);

                        setStartValue(value);
                      }
                      setCompareValue({
                        startDate: fDate(startDateTmp, 'yyyy-MM-dd'),
                        endDate: fDate(endDateTmp, 'yyyy-MM-dd'),
                      });
                    }}
                  />
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: 'divider',
                    borderStyle: 'dashed',
                    '&.MuiPaper-root': {
                      width: 1,
                    },
                    '& .MuiDateCalendar-root': {
                      width: 1,
                      maxHeight: 290,
                    },
                  }}
                >
                  <DateCalendar
                    value={endValue}
                    onChange={(value) => {
                      const oneDay = 24 * 60 * 60 * 1000;
                      let diffDays;
                      let startDateTmp;
                      let endDateTmp;

                      if (new Date(startValue).getTime() > new Date(value).getTime()) {
                        diffDays = Math.round(Math.abs((endValue - value) / oneDay));
                        startDateTmp = new Date(value);
                        startDateTmp.setDate(startDateTmp.getDate() - diffDays - 1);
                        endDateTmp = new Date(value);
                        endDateTmp.setDate(endDateTmp.getDate() - 1);

                        setStartValue(value);
                      } else {
                        diffDays = Math.round(Math.abs((value - startValue) / oneDay));
                        startDateTmp = new Date(startValue);
                        startDateTmp.setDate(startDateTmp.getDate() - diffDays - 1);
                        endDateTmp = new Date(startValue);
                        endDateTmp.setDate(endDateTmp.getDate() - 1);

                        setEndValue(value);
                      }
                      setCompareValue({
                        startDate: fDate(startDateTmp, 'yyyy-MM-dd'),
                        endDate: fDate(endDateTmp, 'yyyy-MM-dd'),
                      });
                    }}
                  />
                </Paper>
              </>
            ) : (
              <>
                <DatePicker label="Start date" value={startDate} onChange={onChangeStartDate} />

                <DatePicker label="End date" value={endDate} onChange={onChangeEndDate} />
              </>
            )}
          </Stack>
        </Stack>

        {error && (
          <FormHelperText error sx={{ px: 2 }}>
            Ngày kết thúc phải lớn hơn ngày bắt đầu
          </FormHelperText>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          {t('actions.cancel')}
        </Button>

        <Button disabled={error} variant="contained" onClick={handleChangeDateFilter}>
          {t('actions.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CustomDateRangePicker.propTypes = {
  error: PropTypes.bool,
  onChangeEndDate: PropTypes.func,
  onChangeStartDate: PropTypes.func,
  setCompareDateFilter: PropTypes.func,
  options: PropTypes.func,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string,
  variant: PropTypes.oneOf(['input', 'calendar']),
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
};
