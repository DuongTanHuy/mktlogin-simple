import PropTypes from 'prop-types';

import { Box, Table, TableBody, tableCellClasses, TableContainer } from '@mui/material';
import { TableHeadCustom, TableNoData } from 'src/components/table';
import { useLocales } from 'src/locales';
import { useResponsive } from 'src/hooks/use-responsive';
import RewardTableRow from './reward-table-row';

// ----------------------------------------------------------------------

const TABLE_DATA = [
  { id: 1, name: 'Novice', commissionPercentage: 10, buyer: 0 },
  { id: 2, name: 'Rookie', commissionPercentage: 20, buyer: 3 },
  { id: 3, name: 'Pro', commissionPercentage: 21, buyer: 10 },
  { id: 4, name: 'Expert', commissionPercentage: 22, buyer: 20 },
  { id: 5, name: 'Strategist', commissionPercentage: 23, buyer: 30 },
  { id: 6, name: 'Ambassador', commissionPercentage: 24, buyer: 40 },
  { id: 7, name: 'Leader', commissionPercentage: 25, buyer: 50 },
  { id: 8, name: 'Specialist', commissionPercentage: 26, buyer: 100 },
  { id: 9, name: 'Pioneer', commissionPercentage: 27, buyer: 200 },
  { id: 10, name: 'Optimizer', commissionPercentage: 28, buyer: 300 },
  { id: 11, name: 'Gold', commissionPercentage: 29, buyer: 400 },
  { id: 12, name: 'Warrior', commissionPercentage: 30, buyer: 500 },
  { id: 13, name: 'Guru', commissionPercentage: 31, buyer: 600 },
  { id: 14, name: 'Analyst', commissionPercentage: 32, buyer: 700 },
  { id: 15, name: 'Multi', commissionPercentage: 33, buyer: 800 },
  { id: 16, name: 'Social', commissionPercentage: 34, buyer: 900 },
  { id: 17, name: 'Diamond', commissionPercentage: 35, buyer: 1000 },
  { id: 18, name: 'Strategic', commissionPercentage: 40, buyer: 2000 },
  { id: 19, name: 'Manager', commissionPercentage: 45, buyer: 3000 },
  { id: 20, name: 'Master', commissionPercentage: 50, buyer: 5000 },
];

// ----------------------------------------------------------------------

const RewardTable = ({ affiliateLevel }) => {
  const mdUp = useResponsive('up', 'md');
  const { t } = useLocales();

  const TABLE_HEAD = [
    { id: 'name', label: t('affiliateProgram.level') },
    {
      id: 'commission-percentage',
      label: t('affiliateProgram.commissionPercentage'),
      align: 'center',
    },
    { id: 'buyer', label: t('affiliateProgram.condition'), align: 'center' },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        // m: theme.spacing(-2, -3, -3, -3),
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <TableContainer
        sx={{
          // p: theme.spacing(0, 3, 0, 3),
          pr: 1,
          maxHeight: `calc(100vh - ${mdUp ? 300 : 640}px)`,
        }}
      >
        <Table
          size="medium"
          sx={{
            borderCollapse: 'separate',
            borderSpacing: '0 16px',
          }}
          stickyHeader
          aria-label="sticky table"
        >
          <TableHeadCustom
            headLabel={TABLE_HEAD}
            sx={{
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
            {TABLE_DATA.map((row) => (
              <RewardTableRow
                key={row.id}
                row={row}
                // affiliateLevel={affiliateLevel === null || affiliateLevel === row.id}
                affiliateLevel={
                  (affiliateLevel === null && row.id === 1) || affiliateLevel === row.id
                }
              />
            ))}
            <TableNoData />
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RewardTable;

RewardTable.propTypes = {
  affiliateLevel: PropTypes.any,
};
