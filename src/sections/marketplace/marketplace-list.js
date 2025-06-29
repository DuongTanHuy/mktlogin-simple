import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
//
import { getNumSkeleton } from 'src/utils/commom';
import MarketplaceItem from './marketplace-item';
import MarketplaceLoadingSkeleton from './marketplace-loading-skeleton';

// ----------------------------------------------------------------------

export default function MarketplaceList({
  data,
  categoryList,
  loading,
  pageNum,
  setPageNum,
  totalPage,
}) {
  return (
    <>
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
      >
        {loading
          ? [...Array(getNumSkeleton(30, data.length, 30))]
              .fill(Math.random())
              .map((_, index) => <MarketplaceLoadingSkeleton key={index} />)
          : data.map((item) => (
              <MarketplaceItem
                key={item.id}
                data={item}
                category={categoryList.find((i) => i?.id === item?.workflow_category)}
              />
            ))}
      </Box>

      {data.length > 0 && (
        <Pagination
          count={totalPage}
          page={pageNum}
          onChange={(_, value) => {
            setPageNum(value);
          }}
          sx={{
            my: 4,
            [`& .${paginationClasses.ul}`]: {
              justifyContent: 'center',
            },
          }}
        />
      )}
    </>
  );
}

MarketplaceList.propTypes = {
  data: PropTypes.array,
  categoryList: PropTypes.array,
  loading: PropTypes.bool,
  pageNum: PropTypes.number,
  setPageNum: PropTypes.func,
  totalPage: PropTypes.number,
};
