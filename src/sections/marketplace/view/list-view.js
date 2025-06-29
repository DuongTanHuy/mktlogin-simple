import { concat, debounce } from 'lodash';
import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import {
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
// components
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { useLocales } from 'src/locales';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';
import { publish_workflow_list, workflow_category } from 'src/utils/mock';
import MarketplaceList from '../marketplace-list';
import MarketplaceSort from '../marketplace-sort';

// ----------------------------------------------------------------------

const CustomTypography = React.forwardRef((props, ref) => (
  <Typography
    {...props}
    ref={ref}
    sx={{
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: '0.875rem!important',
      fontWeight: '600!important',
      textTransform: 'capitalize',
      color: 'text.secondary',
      display: 'inline-block',
    }}
  />
));

export default function MarketplaceListView() {
  const { t } = useLocales();
  const settings = useSettingsContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupName = searchParams.get('group');
  const [pageNum, setPageNum] = useState(1);
  const [totalPage, setTotalPage] = useState(0);

  const [data, setData] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [sortBy, setSortBy] = useState({ value: 'latest', label: t('marketplace.options.latest') });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(groupName || 'all');

  const [loading, setLoading] = useState({
    category: true,
    list: true,
  });
  const notFound = !data.length && !loading.list;

  const handleSortBy = useCallback((newValue) => {
    setSortBy(newValue);
  }, []);

  const handleSelectCategory = (name) => {
    setCategory(name);
    setPageNum(1);
    router.push(`${paths.dashboard.marketplace}?group=${name}`);
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading((prev) => ({
          ...prev,
          category: true,
        }));
        const response = workflow_category;
        setCategoryOptions(
          concat([{ id: 'cat_01', name: t('marketplace.options.all'), value: 'all' }], response, [
            { id: 'cat_other', name: t('marketplace.options.other'), value: 'other' },
          ])
        );
      } catch (error) {
        /* empty */
      } finally {
        setLoading((prev) => ({
          ...prev,
          category: false,
        }));
      }
    };
    fetchCategory();
  }, [t]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading((prev) => ({
          ...prev,
          list: true,
        }));

        const params = {
          name: search,
          ...(category !== 'all' && {
            category,
          }),
          fields:
            'id,name,description,created_at,avatar_name,avatar_url,publish_user,workflow_category,count_of_downloads',
          page_size: 30,
          page_num: pageNum,
        };
        console.log('params', params);
        const response = publish_workflow_list;
        if (response?.data) {
          setData(response.data);
          setTotalPage(response.page_total);
        }
      } catch (error) {
        /* empty */
      } finally {
        setLoading((prev) => ({
          ...prev,
          list: false,
        }));
      }
    };
    fetchData();
  }, [category, pageNum, search]);

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      <TextField
        placeholder={`${t('actions.search')}...`}
        autoComplete="off"
        defaultValue={search}
        onChange={debounce((event) => setSearch(event.target.value), 500)}
        sx={{ width: { xs: 1, sm: 260 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      <MarketplaceSort sort={sortBy} onSort={handleSortBy} totalWorkflow={data.length} />
    </Stack>
  );

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{
        height: '100%',
        px: '0px!important',
      }}
    >
      <Stack direction="row" height={1}>
        <Stack
          sx={{
            flexBasis: '240px',
            padding: '10px',
            height: 1,
          }}
        >
          <Typography variant="h6">{t('marketplace.categories')}</Typography>
          <Scrollbar
            sx={{
              height: 'calc(100%)',
              py: 1,
              pr: 2,
            }}
          >
            <List component="nav">
              {loading.category ? (
                <Stack>
                  {[...Array(categoryOptions?.length || 14)].map((_, index) => (
                    <Skeleton
                      key={index}
                      sx={{ width: 1, height: 24, my: 1, borderRadius: '4px' }}
                    />
                  ))}
                </Stack>
              ) : (
                categoryOptions.map((option) => (
                  <CategoryItem
                    key={option.id}
                    name={option.name}
                    isSelected={category === option.value || category === option.name}
                    handleSelectCategory={() => {
                      handleSelectCategory(option?.value || option.name);
                      setPageNum(1);
                    }}
                  />
                ))
              )}
            </List>
          </Scrollbar>
        </Stack>
        <Stack sx={{ width: '100%', overflow: 'hidden' }}>
          <Stack
            spacing={2}
            sx={{
              mb: 3,
              pl: 1,
            }}
          >
            {renderFilters}
          </Stack>

          <Scrollbar
            sx={{
              height: 1,
              px: 1,
            }}
          >
            {notFound && <EmptyContent filled title="No Data" sx={{ py: 20 }} />}
            <MarketplaceList
              data={data}
              pageNum={pageNum}
              loading={loading.list}
              categoryList={categoryOptions}
              setPageNum={setPageNum}
              totalPage={totalPage}
            />
          </Scrollbar>
        </Stack>
      </Stack>
    </Container>
  );
}

// ----------------------------------------------------------------------

const CategoryItem = ({ name, isSelected, handleSelectCategory }) => {
  const [nameRef, showName] = useTooltipNecessity(false);

  return (
    <ListItemButton
      sx={{
        borderRadius: 1,
        py: 0,
        padding: '0 10px 0 15px',
        minHeight: '40px',
        ...(isSelected && {
          boxShadow: (theme) => theme.customShadows.z4,
        }),
      }}
      selected={isSelected}
      onClick={handleSelectCategory}
    >
      <Tooltip title={showName ? name : ''}>
        <ListItemText
          primary={name}
          primaryTypographyProps={{ component: CustomTypography, ref: nameRef }}
        />
      </Tooltip>
    </ListItemButton>
  );
};

CategoryItem.propTypes = {
  name: PropTypes.string,
  isSelected: PropTypes.bool,
  handleSelectCategory: PropTypes.func,
};
