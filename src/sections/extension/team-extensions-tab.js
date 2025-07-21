import debounce from 'lodash/debounce';
import { useCallback, useEffect, useState } from 'react';

// mui
import { Button, Grid, InputAdornment, Stack, TextField } from '@mui/material';
// api
import { getExtensionOfWorkspaceApi } from 'src/api/extension.api';
// components
import Iconify from 'src/components/iconify';
import { TableNoData } from 'src/components/table';
import { useMultiBoolean } from 'src/hooks/use-multiple-boolean';
import { useAuthContext } from 'src/auth/hooks';
import { useLocales } from 'src/locales';
import ExtensionLoadingSkeleton from './extension-loading-skeleton';
import ExtensionItem from './extension-item';
import UploadFormDialog from './upload-form-dialog';
import CategoryFormDialog from './category-form-dialog';

// ----------------------------------------------------------------------

const TeamExtensionsTab = () => {
  const { t } = useLocales();
  const [listExtensions, setListExtension] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { workspace_id } = useAuthContext();
  const open = useMultiBoolean({
    upload: false,
    category: false,
  });

  const fetchData = useCallback(async () => {
    try {
      const params = {
        search,
      };
      setLoading(true);
      const response = await getExtensionOfWorkspaceApi(workspace_id, params);
      setListExtension(response.data);
    } catch (error) {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [search, workspace_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={2} direction="row">
            <Button
              onClick={() => open.onTrue('upload')}
              variant="contained"
              startIcon={<Iconify icon="material-symbols:upload" />}
            >
              {t('extension.actions.upload')}
            </Button>
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
                // endAdornment: <>{true ? <Iconify icon="svg-spinners:8-dots-rotate" /> : null}</>,
              }}
            />
          </Stack>
          <Button
            onClick={() => open.onTrue('category')}
            variant="outlined"
            startIcon={<Iconify icon="tabler:category" />}
          >
            {t('extension.actions.category')}
          </Button>
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
                    open={open.value.confirm}
                    onClose={() => open.onFalse('confirm')}
                    handleReload={fetchData}
                    moreOptions
                    data={extension}
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
        open={open.value.upload}
        onClose={() => open.onFalse('upload')}
        handleReload={fetchData}
      />
      <CategoryFormDialog open={open.value.category} onClose={() => open.onFalse('category')} />
    </>
  );
};

export default TeamExtensionsTab;
