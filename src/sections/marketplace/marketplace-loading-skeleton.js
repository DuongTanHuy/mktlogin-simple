import { Card, CardContent, CardHeader, Divider, Skeleton, Stack } from '@mui/material';

const MarketplaceLoadingSkeleton = () => (
  <Card
    sx={{
      height: 1,
      cursor: 'pointer',
    }}
  >
    <CardHeader
      sx={{
        alignItems: 'start',
        '& .MuiCardHeader-action': {
          marginTop: 0,
        },
      }}
      avatar={<Skeleton sx={{ width: 50, height: 50, borderRadius: 0.5 }} />}
      action={<Skeleton sx={{ width: 60, height: 20, borderRadius: 0.5 }} />}
      title={<Skeleton sx={{ width: 0.8, height: 16, borderRadius: 0.5 }} />}
      subheader={<Skeleton sx={{ width: 0.4, height: 16, borderRadius: 0.5 }} />}
    />
    <CardContent
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100% - 60px)',
      }}
    >
      <Stack spacing={2} flexGrow={1}>
        <Skeleton sx={{ width: 1, height: 12, borderRadius: 0.5 }} />
        <Skeleton sx={{ width: 1, height: 12, borderRadius: 0.5 }} />
        <Skeleton sx={{ width: 1, height: 12, borderRadius: 0.5 }} />
        <Skeleton sx={{ width: 0.6, height: 10, borderRadius: 0.5 }} />
      </Stack>

      <Stack direction="column" justifyContent="center" spacing={0.5}>
        <Divider />
        <Stack
          spacing={1.5}
          flexGrow={1}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            typography: 'caption',
            color: 'text.disabled',
          }}
        >
          <Skeleton sx={{ width: 0.2, height: 10, borderRadius: 0.5 }} />
          <Stack direction="row" alignItems="center" spacing={1}>
            <Skeleton sx={{ width: 16, height: 18 }} />
            <Skeleton sx={{ width: 20, height: 10, borderRadius: 0.5 }} />
          </Stack>
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

export default MarketplaceLoadingSkeleton;
