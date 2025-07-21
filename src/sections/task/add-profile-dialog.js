import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// mui
import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
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
import concat from 'lodash/concat';
import debounce from 'lodash/debounce';
import some from 'lodash/some';
import { getNumSkeleton, objectToQueryString } from 'src/utils/commom';
import { getListProfileApi } from 'src/api/profile.api';
import { useAuthContext } from 'src/auth/hooks';
import { useLocales } from 'src/locales';
import { isSubset } from 'src/utils/format-number';
import TextMaxLine from 'src/components/text-max-line';
import { ID_GROUP_ALL } from 'src/utils/constance';
import { getListGroupProfileApi } from 'src/api/profile-group.api';

export default function AddProfileDialog({ open, onClose, setProfileSelected, listProfile }) {
  const { workspace_id } = useAuthContext();
  const { t } = useLocales();
  const table = useTable();
  const [listGroup, setListGroup] = useState([
    {
      id: ID_GROUP_ALL,
      name: 'group.all',
      num_profile: 'default_group',
    },
  ]);
  const [tableData, setTableData] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [search, setSearch] = useState('');
  const [searchGroup, setSearchGroup] = useState({
    id: ID_GROUP_ALL,
    name: 'group.all',
    num_profile: 'default_group',
  });
  const [loading, setLoading] = useState(true);
  const notFound = !tableData.length;

  const TABLE_HEAD = useMemo(
    () => [
      { id: 'id', label: 'ID', align: 'center' },
      { id: 'name', label: t('task.dialog.addProfile.header.name') },
      {
        id: 'group_name',
        label: t('task.dialog.addProfile.header.group'),
        align: 'center',
      },
      { id: 'updated_at', label: t('task.dialog.addProfile.header.duration'), align: 'center' },
    ],
    [t]
  );

  const handleClose = () => {
    onClose();
    table.setSelected([]);
  };

  const handleAdd = () => {
    setProfileSelected(
      table.selected.map((profile) => ({
        ...profile,
        isNew: true,
      }))
    );
    handleClose();
  };

  const handleFetchData = useCallback(async () => {
    const fields =
      'id,name,group_name,updated_at,proxy_type,proxy_host,proxy_token,proxy_port,proxy_user,proxy_password,browser_type,duration';

    const params = {
      search,
      page_size: table.rowsPerPage,
      page_num: table.page + 1,
      fields,
      resource_type: 'profile',
      profile_group: searchGroup.id !== ID_GROUP_ALL ? searchGroup.id : undefined,
    };

    const queryString = objectToQueryString(params);

    try {
      table.setSelected([]);
      setLoading(true);
      const response = await getListProfileApi(workspace_id, queryString);
      const { data: profileData } = response;

      if (profileData) {
        setTableData(profileData.data);
        setTotalRecord(profileData.total_record);
      }
    } catch (error) {
      setTableData([]);
      setTotalRecord(0);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, searchGroup?.id, table.page, table.rowsPerPage, workspace_id]);

  const handleFetchProfileGroup = useCallback(async () => {
    try {
      if (workspace_id) {
        const response = await getListGroupProfileApi(workspace_id);
        if (response.data) {
          const defaultGroup = [
            {
              id: ID_GROUP_ALL,
              name: 'group.all',
              num_profile: 'default_group',
            },
          ];
          setListGroup(concat(defaultGroup, response.data.data));
        }
      }
    } catch (error) {
      /* empty */
    }
  }, [workspace_id]);

  useEffect(() => {
    if (workspace_id && open) {
      handleFetchData();
    }
  }, [handleFetchData, open, workspace_id]);

  useEffect(() => {
    if (workspace_id && open) {
      handleFetchProfileGroup();
    }
  }, [handleFetchProfileGroup, open, workspace_id]);

  return (
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
            {t('task.dialog.addProfile.title')}
          </Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="ic:round-close" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ typography: 'body2' }}>
        <Stack direction="row" spacing={2} mb={2}>
          <TextField
            fullWidth
            defaultValue={search}
            onChange={debounce((event) => setSearch(event.target.value), 500)}
            placeholder={`${t('task.actions.search')}...`}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <Autocomplete
            disableClearable
            size="small"
            value={searchGroup}
            options={listGroup}
            getOptionLabel={(option) =>
              (option?.id === 0 && t('group.ungrouped')) ||
              (option?.name === 'group.all' && t('group.all')) ||
              option?.name
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <TextField {...params} />}
            onChange={(event, newValue) => {
              setSearchGroup(newValue);
            }}
            sx={{
              width: 300,
            }}
          />
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
              rowCount={tableData.length}
              disabled={isSubset(tableData, listProfile)}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.filter((row) => row?.duration >= 0)
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
                disabled={isSubset(tableData, listProfile)}
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.filter((row) => row?.duration >= 0)
                  )
                }
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
                  ? [...Array(getNumSkeleton(table.rowsPerPage, tableData.length))].map(
                      (i, index) => (
                        <TableSkeleton key={index} cols={TABLE_HEAD.length} sx={{ height: 70 }} />
                      )
                    )
                  : tableData.map((row, index) => (
                      <TableRow hover key={row?.id}>
                        <TableCell padding="checkbox">
                          <Tooltip
                            title={
                              (listProfile.some((profile) => profile.id === row.id) &&
                                t('task.editTask.profile.alreadyAdded')) ||
                              (row?.duration < 0 && t('task.editTask.profile.expired')) ||
                              ''
                            }
                            placement="top"
                          >
                            <span>
                              <Checkbox
                                disabled={
                                  listProfile.some((profile) => profile.id === row.id) ||
                                  row?.duration < 0
                                }
                                checked={
                                  listProfile.some((profile) => profile.id === row.id) ||
                                  some(table.selected, { id: row.id })
                                }
                                onClick={() => table.onSelectRow(row)}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">{row?.id}</TableCell>

                        <TableCell
                          sx={{
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row?.name}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            maxWidth: 120,
                          }}
                        >
                          <TextMaxLine line={1}>{row?.group_name}</TextMaxLine>
                        </TableCell>

                        <TableCell align="center">
                          <Typography variant="body2" color={row.duration < 0 && 'error.main'}>
                            {`${row?.duration} ${t('form.label.date')}`}
                          </Typography>
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
          count={totalRecord}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          //
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </DialogContent>
      <DialogActions sx={{ pt: 1 }}>
        <Button variant="outlined" onClick={handleClose}>
          {t('task.actions.close')}
        </Button>
        <Button variant="contained" color="primary" onClick={handleAdd}>
          {t('task.actions.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddProfileDialog.propTypes = {
  open: PropTypes.bool,
  listProfile: PropTypes.array,
  onClose: PropTypes.func,
  setProfileSelected: PropTypes.func,
};
