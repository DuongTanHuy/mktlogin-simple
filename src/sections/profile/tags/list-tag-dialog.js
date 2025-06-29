import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// mui
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  tableCellClasses,
} from '@mui/material';
// components
import Scrollbar from 'src/components/scrollbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  TableSkeleton,
  useTable,
} from 'src/components/table';
import Iconify from 'src/components/iconify';
import { getNumSkeleton } from 'src/utils/commom';
import { useAuthContext } from 'src/auth/hooks';
import { deleteTagApi, getListTagApi } from 'src/api/tags.api';
import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';
import { enqueueSnackbar } from 'notistack';
import { useLocales } from 'src/locales';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingButton } from '@mui/lab';
import AddEditTagDialog from './add-edit-tag-dialog';

export default function ListTagDialog({ open, onClose, handleReLoadData }) {
  const { t } = useLocales();
  const { workspace_id } = useAuthContext();
  const table = useTable({
    defaultRowsPerPage: 30,
  });
  const [loading, setLoading] = useState(true);

  const openForm = useBoolean();
  const [editData, setEditData] = useState(null);
  const confirm = useBoolean();
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [listSuggestion, setListSuggestion] = useState([]);

  const notFound = !listSuggestion.filter((item) => item.display).length && !loading;

  const TABLE_HEAD = useMemo(
    () => [
      { id: 'name', label: t('dialog.setTag.tagName') },
      { id: 'action', label: '', width: 120 },
    ],
    [t]
  );

  const handleClose = () => {
    onClose();
    table.setSelected([]);
  };

  const handleFetchData = useCallback(async () => {
    try {
      table.setSelected([]);
      setLoading(true);
      const response = await getListTagApi(workspace_id);
      const { data: listTagData } = response;

      if (listTagData) {
        setListSuggestion(listTagData.map((item) => ({ ...item, display: true })));
      }
    } catch (error) {
      setListSuggestion([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace_id]);

  const handleDeleteTag = useCallback(async () => {
    try {
      setDeleting(true);
      await deleteTagApi(workspace_id, deleteId);
      setListSuggestion((prev) => prev.filter((item) => item.id !== deleteId));
      handleReLoadData();
      enqueueSnackbar(t('systemNotify.success.delete'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error?.message || t('systemNotify.error.title'), { variant: 'error' });
    } finally {
      setDeleting(false);
      setDeleteId(null);
      confirm.onFalse();
    }
  }, [confirm, deleteId, handleReLoadData, t, workspace_id]);

  const handleFilters = (event) => {
    const newList = [];
    for (let i = 0; i < listSuggestion.length; i += 1) {
      const item = {
        ...listSuggestion[i],
        display: listSuggestion[i].name.toLowerCase().includes(event.target.value.toLowerCase()),
      };
      newList.push(item);
    }
    setListSuggestion(newList);
  };

  useEffect(() => {
    if (workspace_id && open) {
      handleFetchData();
    }
  }, [handleFetchData, open, workspace_id]);

  return (
    <>
      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
        sx={{
          '& .MuiPaper-root.MuiPaper-elevation': {
            boxShadow: (theme) => theme.customShadows.z4,
          },
        }}
        PaperProps={{
          sx: {
            maxWidth: 720,
          },
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" marginRight="auto">
              {t('dialog.setTag.listTag')}
            </Typography>
            <IconButton onClick={handleClose}>
              <Iconify icon="ic:round-close" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ typography: 'body2' }}>
          <Stack
            direction="row"
            spacing={2}
            mb={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <TextField
              type="search"
              placeholder={`${t('actions.search')}...`}
              onChange={handleFilters}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 300,
              }}
            />
            <Button
              startIcon={<Iconify icon="ic:round-add" />}
              variant="contained"
              color="primary"
              onClick={openForm.onTrue}
            >
              {t('dialog.setTag.actions.newTag')}
            </Button>
          </Stack>
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
              <TableSelectedAction
                numSelected={table.selected.length}
                rowCount={listSuggestion.filter((item) => item.display).length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    listSuggestion.filter((item) => item.display).map((row) => row.id)
                  )
                }
                sx={{
                  height: 56,
                  borderRadius: 1.5,
                  zIndex: 20,
                }}
              />
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 400, width: 1 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={listSuggestion.filter((item) => item.display).length}
                  numSelected={table.selected.length}
                  // onSelectAllRows={(checked) =>
                  //   table.onSelectAllRows(
                  //     checked,
                  //     tableData.map((row) => row.id)
                  //   )
                  // }
                  sx={{
                    position: 'sticky',
                    top: 0,
                    bgcolor: (theme) => alpha(theme.palette.grey[800], 1),
                    zIndex: 10,
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
                  {loading
                    ? [
                        ...Array(
                          getNumSkeleton(4, listSuggestion.filter((item) => item.display).length)
                        ),
                      ].map((i, index) => (
                        <TableSkeleton
                          key={index}
                          cols={TABLE_HEAD.length}
                          sx={{ height: 70 }}
                          hasAction={false}
                        />
                      ))
                    : listSuggestion
                        .filter((item) => item.display)
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row, index) => (
                          <TableRow hover key={row?.id}>
                            {/* <TableCell padding="checkbox">
                              <Checkbox
                                checked={table.selected.includes(row.id)}
                                onClick={() => table.onSelectRow(row.id)}
                              />
                            </TableCell> */}
                            <TableCell
                              sx={{
                                '& > span': {
                                  background: (theme) => alpha(theme.palette.primary.main, 0.2),
                                  color: (theme) => alpha(theme.palette.primary.main, 1),
                                  px: 1.5,
                                  py: 1,
                                },
                              }}
                            >
                              <Label
                                sx={{
                                  textTransform: 'none',
                                }}
                              >
                                {row?.name}
                              </Label>
                            </TableCell>

                            <TableCell align="center">
                              <Stack direction="row">
                                <Tooltip title={t('dialog.setTag.actions.edit')}>
                                  <IconButton
                                    onClick={() => {
                                      setEditData(row);
                                      openForm.onTrue();
                                    }}
                                  >
                                    <Iconify icon="akar-icons:edit" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t('dialog.setTag.actions.delete')}>
                                  <IconButton
                                    onClick={() => {
                                      setDeleteId(row.id);
                                      confirm.onTrue();
                                    }}
                                  >
                                    <Iconify icon="fluent:delete-16-filled" color="error.main" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}

                  <TableNoData
                    sx={{
                      py: 2,
                    }}
                    notFound={notFound}
                  />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          <TablePaginationCustom
            count={listSuggestion.filter((item) => item.display).length}
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

      <AddEditTagDialog
        open={openForm.value}
        onClose={() => {
          openForm.onFalse();
          setEditData(null);
        }}
        setTableData={setListSuggestion}
        data={editData}
        handleReLoadData={handleReLoadData}
      />

      <ConfirmDialog
        maxWidth="xs"
        open={confirm.value}
        onClose={confirm.onFalse}
        closeButtonName={t('actions.cancel')}
        title={t('dialog.setTag.deleteTag')}
        content={<Typography color="text.secondary">{t('dialog.setTag.subDeleteTag')}</Typography>}
        action={
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleDeleteTag}
            loading={deleting}
          >
            {t('actions.delete')}
          </LoadingButton>
        }
      />
    </>
  );
}

ListTagDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleReLoadData: PropTypes.func,
};
