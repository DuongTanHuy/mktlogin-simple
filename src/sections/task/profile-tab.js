import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// mui
import {
  Button,
  Checkbox,
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
  alpha,
  tableCellClasses,
} from '@mui/material';
import { TableHeadCustom, TableNoData, TableSelectedAction, useTable } from 'src/components/table';
import Iconify from 'src/components/iconify';
import { some } from 'lodash';
import TextMaxLine from 'src/components/text-max-line';
import { useLocales } from 'src/locales';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';
import { useBoolean } from 'src/hooks/use-boolean';
import { removeTaskProfileApi } from 'src/api/task.api';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import AddProfileDialog from './add-profile-dialog';

// ----------------------------------------------------------------------

const ProfileTab = ({ tableData, setTableData, taskId }) => {
  const { workspace_id } = useAuthContext();
  const { t } = useLocales();
  const table = useTable();
  const [listSuggestion, setListSuggestion] = useState([]);
  const [search, setSearch] = useState('');
  const notFound = !listSuggestion.filter((item) => item.display).length;
  const open = useBoolean();
  const [nameRef, showName] = useTooltipNecessity(false);
  const [profileSelected, setProfileSelected] = useState([]);

  const TABLE_HEAD = [
    { id: 'id', label: 'ID', width: 60, align: 'center' },
    { id: 'name', label: t('task.editTask.profile.table.header.name') },
    { id: 'mode', label: t('task.editTask.profile.table.header.proxyType'), align: 'center' },
    { id: 'proxy', label: t('task.editTask.profile.table.header.proxy'), align: 'center' },
    { id: 'duration', label: t('form.label.duration'), align: 'center' },
    { id: 'action', label: t('task.editTask.profile.table.header.action'), align: 'center' },
  ];

  const handleDeleteProfile = async (profile) => {
    if (profile?.isNew) {
      setTableData((prev) => prev.filter((p) => p.id !== profile.id));
    } else {
      try {
        await removeTaskProfileApi(workspace_id, taskId, { profile_ids: [profile.id] });
        setTableData((prev) => prev.filter((p) => p.id !== profile.id));
      } catch (error) {
        /* empty */
      }
    }
  };

  const handleDeleteMulti = async () => {
    try {
      const newProfiles = table.selected.filter((p) => p?.isNew);
      const oldProfiles = table.selected.filter((p) => !p?.isNew);
      if (newProfiles.length > 0) {
        setTableData((prev) =>
          prev.filter((profile) => newProfiles.every((item) => item.id !== profile.id))
        );
      }
      if (oldProfiles.length > 0) {
        await removeTaskProfileApi(workspace_id, taskId, {
          profile_ids: oldProfiles.map((p) => p.id),
        });
        setTableData((prev) =>
          prev.filter((profile) => oldProfiles.every((item) => item.id !== profile.id))
        );
      }
      table.setSelected([]);
    } catch (error) {
      /* empty */
    }
  };

  useEffect(() => {
    setTableData((prev) => [
      ...prev,
      ...profileSelected.filter((profile) => prev.every((p) => p.id !== profile.id)),
    ]);
  }, [profileSelected, setTableData]);

  const handleFilters = (event) => {
    setSearch(event.target.value);
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
    setListSuggestion(tableData.map((item) => ({ ...item, display: true })));
  }, [tableData]);

  return (
    <Stack height="calc(100% - 230px)" spacing={0} mt={2}>
      <Stack direction="row" mb={2} spacing={2} justifyContent="flex-start" alignItems="center">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-fill" />}
          onClick={open.onTrue}
          sx={{
            minWidth: 'fit-content',
          }}
        >
          {t('task.editTask.actions.addProfile')}
        </Button>
        <TextField
          type="search"
          size="small"
          placeholder={`${t('actions.search')}...`}
          defaultValue={search}
          onChange={handleFilters}
          sx={{
            width: {
              xs: 1,
              md: 0.3,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <TableContainer
        sx={{
          position: 'relative',
          height: 1,
          overflow: 'unset',
        }}
      >
        <TableSelectedAction
          numSelected={table.selected.length}
          rowCount={tableData.length}
          onSelectAllRows={(checked) =>
            table.onSelectAllRows(
              checked,
              tableData.map((row) => row)
            )
          }
          action={
            <Tooltip title={t('task.actions.delete')}>
              <IconButton color="primary" onClick={handleDeleteMulti}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          }
          sx={{
            height: 56,
            borderRadius: 1.5,
            zIndex: 20,
          }}
        />
        <Scrollbar
          autoHide={false}
          sxRoot={{
            overflow: 'unset',
          }}
          sx={{
            height: 1,
            ...(notFound && {
              '& .simplebar-content': {
                height: 1,
              },
            }),
            '& .simplebar-track.simplebar-vertical': {
              position: 'absolute',
              right: '-12px',
              pointerEvents: 'auto',
            },
            '& .simplebar-track.simplebar-horizontal': {
              position: 'absolute',
              bottom: '-10px',
              pointerEvents: 'auto',
            },
          }}
        >
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960, height: 1 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={tableData.length}
              numSelected={table.selected.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row)
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
              {listSuggestion
                .filter((item) => item.display)
                .map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={some(table.selected, { id: row.id })}
                        onClick={() => table.onSelectRow(row)}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        typography: 'subtitle2',
                      }}
                    >
                      {row?.id}
                    </TableCell>
                    <TableCell
                      sx={{
                        typography: 'subtitle2',
                        maxWidth: 260,
                      }}
                    >
                      <Tooltip title={showName ? row?.name : ''}>
                        <TextMaxLine ref={nameRef} line={2}>
                          {row?.name}
                        </TextMaxLine>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      sx={{
                        typography: 'subtitle2',
                      }}
                      align="center"
                    >
                      {row?.proxy_type}
                    </TableCell>
                    <TableCell
                      sx={{
                        typography: 'subtitle2',
                      }}
                      align="center"
                    >
                      {(row?.proxy_type === 'token' && row.proxy_token) ||
                        (row?.proxy_host &&
                          `${row?.proxy_host}:${row?.proxy_port}:${row?.proxy_user}:${row?.proxy_password}`)}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        typography: 'subtitle2',
                      }}
                    >
                      {`${row?.duration} ${t('form.label.date')}`}
                    </TableCell>

                    <TableCell
                      sx={{
                        typography: 'subtitle2',
                      }}
                      align="center"
                    >
                      <Button
                        color="error"
                        onClick={() => handleDeleteProfile(row)}
                        startIcon={<Iconify icon="material-symbols:delete" />}
                      >
                        {t('task.actions.delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
      <AddProfileDialog
        open={open.value}
        onClose={open.onFalse}
        setProfileSelected={setProfileSelected}
        listProfile={tableData}
      />
    </Stack>
  );
};

export default ProfileTab;

ProfileTab.propTypes = {
  tableData: PropTypes.array,
  setTableData: PropTypes.func,
  taskId: PropTypes.number,
};
