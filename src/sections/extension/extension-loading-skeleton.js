import { Card, CardContent, CardHeader, Skeleton, Stack } from '@mui/material';

const ExtensionLoadingSkeleton = () => (
  <Card>
    <CardHeader
      avatar={<Skeleton sx={{ width: 48, height: 48 }} />}
      action={<Skeleton sx={{ width: 20, height: 20 }} />}
      title={<Skeleton sx={{ width: 1, height: 10 }} />}
      subheader={<Skeleton sx={{ width: 30, height: 10 }} />}
    />
    <CardContent>
      <Stack spacing={1}>
        <Skeleton sx={{ width: 1, height: 10 }} />
        <Skeleton sx={{ width: 1, height: 10 }} />
        <Skeleton sx={{ width: 1, height: 10 }} />
      </Stack>
      <Stack mt={2} direction="row" alignItems="center" justifyContent="space-between">
        <Skeleton sx={{ width: 0.3, height: 10 }} />
        <Skeleton sx={{ width: 10, height: 10 }} />
      </Stack>
    </CardContent>
  </Card>
);

export default ExtensionLoadingSkeleton;
