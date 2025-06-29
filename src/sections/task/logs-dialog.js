import PropTypes from 'prop-types';
// mui
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  tableCellClasses,
} from '@mui/material';
// components
import Scrollbar from 'src/components/scrollbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSkeleton,
  useTable,
} from 'src/components/table';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useLocales } from 'src/locales';
import { getNumSkeleton } from 'src/utils/commom';

const LogsDialog = ({ open, onClose, taskData, taskLogData, loading }) => {
  const { t } = useLocales();
  const table = useTable();
  const router = useRouter();
  const notFound = !taskLogData.length && !loading;

  const TABLE_HEAD = [
    { id: 'no', label: t('task.logs.table.header.no'), align: 'center' },
    { id: 'created_at', label: t('task.logs.table.header.startAt') },
    { id: 'finishedAt', label: t('task.logs.table.header.endAt') },
    { id: 'duration', label: t('task.logs.table.header.duration'), align: 'center' },
    { id: 'status', label: t('task.logs.table.header.status'), align: 'center' },
    { id: 'action', label: t('task.logs.table.header.action'), align: 'center' },
  ];

  const handleClose = () => {
    onClose();
  };

  const displayStatus = (status) => {
    switch (status) {
      case 'Done':
        return 'Hoàn thành';
      case 'Running':
        return 'Đang chạy';
      case 'Error':
        return 'Lỗi';
      default:
        return '';
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root.MuiPaper-elevation': {
          boxShadow: (theme) => theme.customShadows.z4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" marginRight="auto">
            {`${t('task.logs.title')} ${taskData.name}`}
          </Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="ic:round-close" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ typography: 'body2' }}>
        <TableContainer
          sx={{
            overflow: 'unset',
            position: 'relative',
            height: 1,
          }}
        >
          <Scrollbar
            autoHide={false}
            sxRoot={{
              overflow: 'unset',
            }}
            sx={{
              maxHeight: 500,
              '& .simplebar-track.simplebar-vertical': {
                position: 'absolute',
                right: '-16px',
                pointerEvents: 'auto',
              },
            }}
          >
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 840, width: 1 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                sx={{
                  [`& .${tableCellClasses.head}`]: {
                    '&:first-of-type': {
                      borderTopLeftRadius: 12,
                      borderBottomLeftRadius: 12,
                    },
                    '&:last-of-type': {
                      borderTopRightRadius: 12,
                      borderBottomRightRadius: 12,
                    },
                  },
                }}
              />

              <TableBody>
                {loading ? (
                  [...Array(getNumSkeleton(table.rowsPerPage, taskLogData.length))].map(
                    (_, index) => <TableSkeleton key={index} hasAction={false} />
                  )
                ) : (
                  <>
                    {taskLogData.map((row, index) => (
                      <TableRow hover key={row.id}>
                        <TableCell align="center">{index + 1}</TableCell>

                        <TableCell>{row.created_at}</TableCell>

                        <TableCell>{row.finish_at}</TableCell>

                        <TableCell align="center">{row.duration}</TableCell>

                        <TableCell align="center">
                          <Label
                            variant="soft"
                            color={
                              (row.status === 'Done' && 'success') ||
                              (row.status === 'Running' && 'warning') ||
                              (row.status === 'Error' && 'error') ||
                              'default'
                            }
                          >
                            {displayStatus(row.status)}
                          </Label>
                        </TableCell>

                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            startIcon={<Iconify icon="gg:details-more" />}
                            onClick={() => {
                              router.push(paths.task.log(taskData.id, row.id));
                            }}
                          >
                            {t('task.logs.action.detail')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                <TableNoData
                  sx={{
                    py: 2,
                    mx: -2,
                  }}
                  notFound={notFound}
                />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
        <TablePaginationCustom
          count={taskLogData.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          //
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LogsDialog;

LogsDialog.propTypes = {
  open: PropTypes.bool,
  loading: PropTypes.bool,
  onClose: PropTypes.func,
  taskData: PropTypes.object,
  taskLogData: PropTypes.array,
};
