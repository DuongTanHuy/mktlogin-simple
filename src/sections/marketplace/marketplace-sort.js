import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Stack, Typography } from '@mui/material';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export default function MarketplaceSort({ sort, onSort, totalWorkflow }) {
  const { t } = useLocales();
  const popover = usePopover();

  const SORT_OPTIONS = [
    { value: 'latest', label: t('marketplace.options.latest') },
    { value: 'popular', label: t('marketplace.options.popular') },
    { value: 'oldest', label: t('marketplace.options.oldest') },
  ];

  return (
    <>
      <Stack>
        <Button
          disableRipple
          color="inherit"
          onClick={popover.onOpen}
          endIcon={
            <Iconify
              icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
            />
          }
          sx={{ fontWeight: 'fontWeightSemiBold' }}
        >
          {`${t('marketplace.sortBy')}:`}
          <Box
            component="span"
            sx={{
              ml: 0.5,
              fontWeight: 'fontWeightBold',
              textTransform: 'capitalize',
            }}
          >
            {sort.label}
          </Box>
        </Button>
        <Typography
          variant="overline"
          color="text.secondary"
          textAlign="right"
          sx={{
            pr: 2,
          }}
        >
          {`${totalWorkflow} ${t('marketplace.workflow')}`}
        </Typography>
      </Stack>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 140 }}>
        {SORT_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === sort.value}
            onClick={() => {
              popover.onClose();
              onSort(option);
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}

MarketplaceSort.propTypes = {
  onSort: PropTypes.func,
  sort: PropTypes.object,
  totalWorkflow: PropTypes.number,
};
