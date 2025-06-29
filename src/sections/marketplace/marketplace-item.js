import React from 'react';
import PropTypes from 'prop-types';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// components
import Iconify from 'src/components/iconify';
import { CardContent, CardHeader, Divider, Tooltip, Typography } from '@mui/material';
import { fDate } from 'src/utils/format-time';
import TextMaxLine from 'src/components/text-max-line';
import Label from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import Image from 'src/components/image';
import { useLocales } from 'src/locales';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';
import { LOCALES } from 'src/utils/constance';
import i18n from 'src/locales/i18n';

// ----------------------------------------------------------------------

const MarketplaceItem = React.memo(({ data, category }) => {
  const { t } = useLocales();
  const {
    id,
    name,
    description,
    created_at,
    avatar_name,
    avatar_url,
    publish_user,
    count_of_downloads,
  } = data;
  const router = useRouter();

  const [titleRef, showTitle] = useTooltipNecessity(false);

  return (
    <Card
      onClick={() => router.push(String(id))}
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
        avatar={
          <Image
            alt={avatar_name}
            src={avatar_url}
            sx={{
              height: 50,
              width: 50,
            }}
          />
        }
        action={
          <Label variant="soft" color="primary">
            {category?.name || 'Other'}
          </Label>
        }
        title={
          <Tooltip title={showTitle ? name : ''}>
            <TextMaxLine variant="subtitle2" line={2} sx={{ mr: 0.5 }} ref={titleRef}>
              {name}
            </TextMaxLine>
          </Tooltip>
        }
      />
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 'calc(100% - 60px)',
        }}
      >
        <Stack spacing={1} flexGrow={1}>
          <TextMaxLine variant="body2" sx={{ color: 'text.secondary' }} line={3}>
            {description}
          </TextMaxLine>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {`${t('marketplace.publishedDate')}: ${fDate(created_at, 'dd MMMM yyyy', {
              locale: LOCALES[i18n.language],
            })}`}
          </Typography>
        </Stack>

        <Stack direction="column" justifyContent="center" spacing={1}>
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
            <Typography variant="caption">
              {`${t('marketplace.createBy')} `}
              <Typography
                component="span"
                variant="caption"
                textTransform="capitalize"
                color="primary"
              >
                {publish_user?.username}
              </Typography>
            </Typography>
            <Stack direction="row" alignItems="center">
              <Iconify icon="material-symbols:download-sharp" width={16} sx={{ mr: 0.5 }} />
              {count_of_downloads}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
});

export default MarketplaceItem;

MarketplaceItem.propTypes = {
  data: PropTypes.object,
  category: PropTypes.object,
};
