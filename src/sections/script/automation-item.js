import React from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDate } from 'src/utils/format-time';
import { useLocales } from 'src/locales';
import useTooltipNecessity from 'src/hooks/use-tooltip-necessity';

export default function AutomationItem({
  item,
  open,
  handleClick,
  showCategory,
  setUpdateWorkflowInfo,
}) {
  const { t } = useLocales();
  const router = useRouter();
  const [titleRef, showTitle] = useTooltipNecessity(false);
  const searchParams = useSearchParams();

  return (
    <Grid key={item.id} item xs={6} sm={6} md={4} lg={4} xl={3}>
      <Card
        onClick={() => {
          // if (!isElectron()) {
          //   enqueueSnackbar(t('openProfile.actionTitle'), {
          //     variant: 'error',
          //   });
          //   return;
          // }
          if (item?.last_version?.name && item?.current_version !== item?.last_version?.name) {
            setUpdateWorkflowInfo();
            return;
          }
          if (item.type === 'script') {
            router.push(`script/createOrEdit`);
          } else {
            // router.push(
            //   paths.dashboard.automation_createOrEdit(
            //     `${item.id}${
            //       // eslint-disable-next-line no-nested-ternary
            //       item?.is_encrypted
            //         ? window.location.search
            //           ? `${window.location.search}&is_encrypted=true`
            //           : '?is_encrypted=true'
            //         : window.location.search
            //           ? `${window.location.search}`
            //           : ''
            //     }`
            //   )
            // );
            if (item?.is_encrypted) {
              searchParams.set('is_encrypted', 'true');
            }

            const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
            const path = paths.dashboard.automation_createOrEdit(`${item?.id}${queryString}`);

            router.push(path);
          }
        }}
        variant="outlined"
        sx={{
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.03)',
          },
          transition: (theme) =>
            theme.transitions.create(['all'], {
              duration: theme.transitions.duration.shortest,
            }),
        }}
      >
        <CardHeader
          sx={{
            pt: 2,
          }}
          action={
            <IconButton
              aria-label="settings"
              id={`basic-button-${item.id}`}
              aria-controls={open ? `basic-menu-${item.id}` : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              value-index={item.id}
              onClick={handleClick}
            >
              <Iconify icon="mingcute:more-2-line" width={20} />
            </IconButton>
          }
          title={
            <Tooltip title={showTitle ? item.name : ''} placement="top">
              <Typography
                ref={titleRef}
                sx={{
                  cursor: 'pointer',
                  display: '-webkit-box',
                  WebkitLineClamp: '1',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  ':hover': {
                    textDecoration: 'underline',
                  },
                }}
                // title={item.name}
              >
                {item.name}
              </Typography>
            </Tooltip>
          }
          subheader={
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <Tooltip title={t('workflow.script.tooltip.lastUpdatedTime')}>
                <Typography
                  component="span"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 14,
                  }}
                >
                  <Iconify icon="ic:outline-update" width={16} mr={0.5} />
                  {fDate(new Date(item.updated_at), 'dd/MM/yyyy H:mm')}
                </Typography>
              </Tooltip>
              {item?.current_version && (
                <Tooltip title={t('workflow.script.tooltip.version')}>
                  <Label
                    sx={{
                      ml: 0.5,
                    }}
                    color="info"
                  >{`V ${item.current_version}`}</Label>
                </Tooltip>
              )}
            </Typography>
          }
        />
        <CardContent sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography
              sx={{
                fontSize: 14,
                fontStyle: 'italic',
                display: '-webkit-box',
                WebkitLineClamp: '1',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '22px',
                paddingRight: '5px',
              }}
              color="text.secondary"
            >
              {showCategory(item.workflow_group)}
            </Typography>
            <Label
              color={item.type === 'script' ? 'warning' : 'secondary'}
              sx={{
                flexShrink: 0,
              }}
            >
              {item.type === 'script'
                ? t('workflow.tabsBar.actions.script')
                : t('workflow.tabsBar.actions.flowchart')}
            </Label>
            {item.is_public && (
              <Label
                color="primary"
                sx={{
                  flexShrink: 0,
                }}
              >
                {t('workflow.isPublished')}
              </Label>
            )}
          </Stack>
          <Typography
            variant="body2"
            component="div"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: '1',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '22px',
            }}
          >
            {item.description}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

AutomationItem.propTypes = {
  item: PropTypes.object,
  open: PropTypes.bool,
  handleClick: PropTypes.func,
  showCategory: PropTypes.func,
  setUpdateWorkflowInfo: PropTypes.func,
};
