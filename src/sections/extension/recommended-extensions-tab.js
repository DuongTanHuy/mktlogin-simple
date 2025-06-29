import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';
// mui
import { Button, Grid, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material';
// api
import { getListExtensionAPi } from 'src/api/extension.api';
// components
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { TableNoData } from 'src/components/table';
import { getStorage } from 'src/hooks/use-local-storage';
import { WORKSPACE_ID } from 'src/utils/constance';
import { useLocales } from 'src/locales';
import ExtensionItem from './extension-item';
import ExtensionLoadingSkeleton from './extension-loading-skeleton';
import UploadFormDialog from './upload-form-dialog';
import { isElectron } from '../../utils/commom';

const RecommendedExtensionsTab = () => {
  const { t } = useLocales();
  const [listExtensions, setListExtension] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [extensionInfo, setExtensionInfo] = useState({});
  const open = useBoolean();
  const workspaceId = getStorage(WORKSPACE_ID);

  const fetchData = useCallback(async () => {
    try {
      const param = {
        search,
      };
      setLoading(true);
      const response = await getListExtensionAPi(workspaceId, param);
      setListExtension(response.data);
    } catch (error) {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [search, workspaceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <TextField
            size="small"
            type="search"
            placeholder={`${t('extension.labels.search')}...`}
            defaultValue={search}
            onChange={debounce(
              (event) => {
                setSearch(event.target.value);
              },
              [500]
            )}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: <>{loading ? <Iconify icon="svg-spinners:8-dots-rotate" /> : null}</>,
            }}
          />
          <Typography variant="subtitle2">
            {`${t('extension.recommended.question')} `}
            <Link
              noWrap
              variant="body2"
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                if (isElectron()) {
                  window.ipcRenderer.send('open-external', 'https://chromewebstore.google.com/');
                } else {
                  window.open(
                    'https://chromewebstore.google.com/',
                    '_blank',
                    'noopener noreferrer'
                  );
                }
              }}
            >
              {t('extension.recommended.link')}
            </Link>
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          {loading
            ? Array(12)
                .fill(Math.random())
                .map((_, index) => (
                  <Grid item key={index} xs={12} sm={6} lg={4} xl={3}>
                    <ExtensionLoadingSkeleton />
                  </Grid>
                ))
            : listExtensions.map((extension) => (
                <Grid
                  sx={{
                    ...(!extension.is_display && {
                      display: 'none',
                    }),
                  }}
                  item
                  key={extension.id}
                  xs={12}
                  sm={6}
                  lg={4}
                  xl={3}
                >
                  <ExtensionItem
                    data={extension}
                    action={
                      <Button
                        disabled={extension.is_added}
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setExtensionInfo(extension);
                          open.onTrue();
                        }}
                      >
                        {t('extension.actions.add')}
                      </Button>
                    }
                  />
                </Grid>
              ))}
        </Grid>
        <TableNoData
          title={t('extension.nodata.title')}
          description={t('extension.nodata.subtitle')}
          sxCell={{
            display: 'block',
            p: 0,
          }}
          sx={{
            p: { xs: 10, lg: 20 },
          }}
          notFound={listExtensions.length === 0 && !loading}
        />
      </Stack>
      <UploadFormDialog
        open={open.value}
        onClose={() => {
          setExtensionInfo({});
          open.onFalse();
        }}
        extensionInfo={extensionInfo}
        handleReload={fetchData}
      />
    </>
  );
};

export default RecommendedExtensionsTab;
