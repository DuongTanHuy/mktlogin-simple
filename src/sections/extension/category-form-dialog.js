import PropTypes from 'prop-types';

// mui
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
  tableCellClasses,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import {
  emptyRows,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  useTable,
} from 'src/components/table';
import { useEffect, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useLocales } from 'src/locales';
import NewCategoryFormDialog from './new-category-form-dialog';

//----------------------------------------------------------------

const CategoryFormDialog = ({ open, onClose }) => {
  const { t } = useLocales();

  const TABLE_HEAD = [
    { id: 'name', label: t('dialog.extension.category.header.name'), align: 'left' },
    { id: 'remark', label: t('dialog.extension.category.header.remark'), align: 'center' },
    { id: 'extension', label: t('dialog.extension.category.header.extension'), align: 'center' },
    { id: 'operation', label: t('dialog.extension.category.header.operation'), align: 'center' },
  ];

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const openAddNew = useBoolean();
  const table = useTable({
    defaultOrderBy: 'Id',
  });
  const denseHeight = table.dense ? 34 : 54;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setTableData([]);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiPaper-root.MuiPaper-elevation': {
            boxShadow: (theme) => theme.customShadows.z4,
          },
        }}
      >
        <DialogTitle sx={{ pb: 5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">{t('dialog.extension.category.title')}</Typography>
            <IconButton onClick={onClose}>
              <Iconify icon="ic:round-close" />
            </IconButton>
          </Stack>
          <Divider
            sx={{
              mt: 1,
            }}
          />
        </DialogTitle>
        <DialogContent sx={{ typography: 'body2' }}>
          <Stack spacing={2}>
            <Stack spacing={2} direction="row">
              <Button
                onClick={openAddNew.onTrue}
                variant="contained"
                startIcon={<Iconify icon="gala:add" />}
              >
                {t('dialog.extension.category.newCategory')}
              </Button>
              <TextField
                size="small"
                type="search"
                placeholder={`${t('dialog.extension.category.search')}...`}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                  // endAdornment: <>{true ? <Iconify icon="svg-spinners:8-dots-rotate" /> : null}</>,
                }}
              />
            </Stack>
            <TableContainer
              sx={{
                position: 'relative',
                overflow: 'unset',
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
            >
              <Scrollbar autoHide={false}>
                <Table size={table.dense ? 'small' : 'medium'}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={tableData?.length}
                    numSelected={table.selected.length}
                  />

                  <TableBody>
                    <>
                      {dataFiltered &&
                        dataFiltered.length > 0 &&
                        dataFiltered
                          .slice(
                            table.page * table.rowsPerPage,
                            table.page * table.rowsPerPage + table.rowsPerPage
                          )
                          .map((row) => (
                            <TableRow hover key={row.id}>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.remark}</TableCell>
                              <TableCell>{row.extension}</TableCell>
                              <TableCell>{row.operation}</TableCell>
                            </TableRow>
                          ))}
                    </>

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={
                        emptyRows(table.page, table.rowsPerPage, tableData?.length) && !loading
                      }
                    />
                    {!dataFiltered ||
                      (!dataFiltered.length > 0 && (
                        <TableNoData
                          sx={{
                            p: 6,
                          }}
                          notFound
                        />
                      ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Stack>
        </DialogContent>
      </Dialog>
      <NewCategoryFormDialog open={openAddNew.value} onClose={openAddNew.onFalse} />
    </>
  );
};

export default CategoryFormDialog;

CategoryFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator }) {
  const stabilizedThis = inputData?.map((el, index) => [el, index]);

  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);

    if (order !== 0) return order;

    return a[1] - b[1];
  });

  inputData = stabilizedThis?.map((el) => el[0]);

  return inputData;
}
