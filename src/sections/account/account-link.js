import { useGoogleLogin } from '@react-oauth/google';
import { useCallback, useEffect, useState } from 'react';
import { MenuItem, Stack, TextField, Typography } from '@mui/material';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import { useTable } from 'src/components/table';
import { useBoolean } from 'src/hooks/use-boolean';
import {
  deleteLinkAppAccountApi,
  getListAppAccountApi,
  linkToAppAccountApi,
} from 'src/api/app-account.api';
import { enqueueSnackbar } from 'notistack';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import { useLocales } from 'src/locales';
import AccountLinkTable from './account-link-table';

const OPTIONS = [
  { value: 'google_sheets', label: 'Google Sheets', icon: 'mdi:google-spreadsheet' },
  // { value: 'google_drive', label: 'Google Drive', icon: 'logos:google-drive' },
];

const AccountLink = () => {
  const table = useTable({ defaultRowsPerPage: 10 });
  const [tableData, setTableData] = useState([]);
  const [select, setSelect] = useState('google_sheets');
  const confirm = useBoolean();
  const [totalRecord, setTotalRecord] = useState(0);
  const loading = useMultiBoolean({
    authorization: false,
    fetchData: true,
  });
  const { t } = useLocales();

  const notFound = !tableData.length;

  const handleChangeSelect = useCallback((event) => {
    setSelect(event.target.value);
  }, []);

  const handleFetchData = useCallback(async () => {
    try {
      loading.onTrue('fetchData');
      const params = {
        app_type: select,
        page_size: table.rowsPerPage,
        page_num: table.page + 1,
      };

      const response = await getListAppAccountApi(params);
      if (response?.data) {
        setTableData(response.data?.data);
        setTotalRecord(response.data?.total_record);
      }
    } catch (error) {
      /* empty */
    } finally {
      loading.onFalse('fetchData');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [select, table.page, table.rowsPerPage]);

  useEffect(() => {
    try {
      handleFetchData();
    } catch (error) {
      /* empty */
    }
  }, [handleFetchData]);

  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      try {
        loading.onTrue('authorization');
        const { code } = codeResponse;
        const payload = {
          code,
          app_type: select,
          redirect_uri: process.env.REACT_APP_REDIRECT_URI,
        };
        await linkToAppAccountApi(payload);
        handleFetchData();
        enqueueSnackbar(t('systemNotify.success.authority'), { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(t('systemNotify.error.authority'), {
          variant: 'error',
        });
      } finally {
        loading.onFalse('authorization');
      }
    },
    onError: (errorResponse) => console.log(errorResponse),
    scope: 'https://www.googleapis.com/auth/spreadsheets',
  });

  const handleDeleteAppAccount = async (accountId) => {
    try {
      await deleteLinkAppAccountApi(accountId);
      handleFetchData();
      enqueueSnackbar(t('systemNotify.success.delete'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('systemNotify.error.delete'), {
        variant: 'error',
      });
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{
          xs: 'column',
          md: 'row',
        }}
        spacing={{
          xs: 3,
        }}
      >
        <TextField
          select
          fullWidth
          size="small"
          label={t('accSetting.tabs.accLink.fields.app')}
          value={select}
          onChange={handleChangeSelect}
          sx={{
            maxWidth: { md: '300px' },
          }}
        >
          {OPTIONS.map((option) => (
            <MenuItem key={option.icon} value={option.value}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon={option.icon} color="#00A76F" width={24} />
                <Typography>{option.label}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </TextField>
        <LoadingButton
          loading={loading.value.authorization}
          color="primary"
          variant="contained"
          onClick={handleGoogleLogin}
        >
          {t('accSetting.tabs.accLink.actions.authorization')}
        </LoadingButton>
      </Stack>

      <AccountLinkTable
        count={totalRecord}
        table={table}
        tableData={tableData}
        onDeleteRow={handleDeleteAppAccount}
        notFound={notFound}
        onOpenConfirm={confirm.onTrue}
        dataLoading={loading.value.fetchData}
        t={t}
      />
    </Stack>
  );
};

export default AccountLink;
