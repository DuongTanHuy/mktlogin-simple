import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
// mui
import { alpha, Stack, Table, TableBody, tableCellClasses, TableContainer } from '@mui/material';
import { getSendListApi } from 'src/api/invite.api';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSkeleton,
  useTable,
} from 'src/components/table';
import { useLocales } from 'src/locales';
import { getNumSkeleton } from 'src/utils/commom';
import { ROWS_PER_PAGE_CONFIG } from 'src/utils/constance';
import { getStorage, setStorage } from 'src/hooks/use-local-storage';
import InvitedTableRow from './invited-table-row';

// ----------------------------------------------------------------------

const Invited = ({ currentGroup }) => {
  const { t } = useLocales();
  const rowNum = getStorage(ROWS_PER_PAGE_CONFIG)?.list_invite;

  const TABLE_HEAD = [
    { id: 'name', label: t('member.invited.headers.name'), whiteSpace: 'nowrap' },
    { id: 'email', label: t('member.invited.headers.email'), whiteSpace: 'nowrap' },
    {
      id: 'inviteDate',
      label: t('member.invited.headers.inviteDate'),
      whiteSpace: 'nowrap',
      align: 'left',
    },
    { id: 'role', label: t('member.invited.headers.role'), whiteSpace: 'nowrap', align: 'center' },
    { id: 'note', label: t('member.invited.headers.note'), whiteSpace: 'nowrap', align: 'left' },
    {
      id: 'action',
      label: t('member.invited.headers.actions'),
      whiteSpace: 'nowrap',
      align: 'center',
      width: 60,
    },
  ];

  const table = useTable({
    defaultOrderBy: 'name',
    defaultOrder: 'asc',
    defaultRowsPerPage: rowNum ?? 50,
  });
  const { workspace_id } = useAuthContext();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchData = useRef();

  fetchData.current = async () => {
    try {
      setLoading(true);
      const response = await getSendListApi(workspace_id, {
        status: 'pending',
      });
      if (response?.data?.data) {
        setTableData(
          response.data.data.filter((item) => item.meta.workgroup_id === currentGroup.id)
        );
      }
    } catch (error) {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData.current();
  }, [workspace_id, currentGroup]);

  return (
    <Stack justifyContent="space-between" height={1}>
      <TableContainer sx={{ position: 'relative', overflow: 'auto', height: 1 }}>
        <Scrollbar
          autoHide={false}
          sx={{
            height: 1,
            pr: 2,
            ...(tableData.length === 0 &&
              !loading && {
                '& .simplebar-content': {
                  height: 1,
                },
              }),
          }}
        >
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960, height: 1 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
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
              {loading ? (
                [...Array(getNumSkeleton(table.rowsPerPage, tableData.length))].map((i, index) => (
                  <TableSkeleton hasAction={false} cols={6} key={index} sx={{ height: '70px' }} />
                ))
              ) : (
                <>
                  {tableData
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row, index) => (
                      <InvitedTableRow
                        key={index}
                        data={row}
                        workspaceId={workspace_id}
                        handleResetData={fetchData.current}
                      />
                    ))}
                </>
              )}

              <TableNoData
                sx={{
                  py: 20,
                }}
                notFound={tableData.length === 0 && !loading}
              />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <TablePaginationCustom
        count={tableData.length}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={(event) => {
          table.onChangeRowsPerPage(event);
          setStorage(ROWS_PER_PAGE_CONFIG, {
            ...getStorage(ROWS_PER_PAGE_CONFIG),
            list_invite: event.target.value,
          });
        }}
        //
        dense={table.dense}
        onChangeDense={table.onChangeDense}
      />
    </Stack>
  );
};

export default Invited;

Invited.propTypes = {
  currentGroup: PropTypes.object,
};
