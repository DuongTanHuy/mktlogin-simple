import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Link,
  ListItemText,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import { useLocales } from 'src/locales';
import { ZaLoIcon } from 'src/assets/icons';
import Scrollbar from 'src/components/scrollbar';
import { LINK_USER_MANUAL_DOC } from 'src/utils/constance';

// ----------------------------------------------------------------------

const ICONS_CHANEL = [
  { id: 'cn_01', icon: 'arcticons:zalo', name: 'zalo_link' },
  { id: 'cn_02', icon: 'logos:telegram', name: 'telegram_link' },
  { id: 'cn_03', icon: 'logos:facebook', name: 'fb_page_link' },
];

const ICONS_COMMUNITY = [
  { id: 'cm_01', icon: 'logos:facebook', name: 'fb_group_link' },
  { id: 'cm_02', icon: 'logos:youtube-icon', name: 'youtube_link' },
];

// ----------------------------------------------------------------------

export default function SupportGroupView({ chanelInfo }) {
  const settings = useSettingsContext();
  const { t } = useLocales();

  return (
    <Container
      maxWidth={settings.themeStretch ? 'xl' : 'md'}
      sx={{
        height: 1,
        pt: 3,
        pb: 1,
        px: '0px!important',
      }}
    >
      <Scrollbar
        sxRoot={{
          overflow: 'unset',
        }}
        sx={{
          height: 1,
          '& .simplebar-track.simplebar-vertical': {
            position: 'absolute',
            right: '-8px',
            pointerEvents: 'auto',
            width: 12,
          },
        }}
      >
        <Grid container spacing={6}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
                <Stack
                  width={1}
                  flexDirection="row"
                  spacing={{ xs: 3, md: 3.5 }}
                  justifyContent="space-between"
                  flexWrap="wrap"
                >
                  <Stack spacing={2} width={{ xs: 1, md: 0.48 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {t('nav.supportGroup')}
                    </Typography>
                    {ICONS_CHANEL.map((icon, index) => (
                      <Link
                        component={Button}
                        key={icon.id}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={chanelInfo?.[icon.name]}
                        color="text.primary"
                        size="large"
                        startIcon={index === 0 ? <ZaLoIcon /> : <Iconify icon={icon.icon} />}
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          columnGap: 1,
                          pl: index === 0 ? 2.1 : 2.5,
                          border: '1px solid',
                          borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                          ...(icon.name === 'fb_page_link' && {
                            display: 'none',
                          }),
                        }}
                      >
                        <Typography
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {chanelInfo?.[icon.name] || '...'}
                        </Typography>
                      </Link>
                    ))}
                  </Stack>
                  <Stack spacing={2} width={{ xs: 1, md: 0.48 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {t('nav.communityLink')}
                    </Typography>
                    {ICONS_COMMUNITY.map((icon) => (
                      <Link
                        component={Button}
                        key={icon.id}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={chanelInfo?.[icon.name]}
                        color="text.primary"
                        size="large"
                        startIcon={<Iconify icon={icon.icon} />}
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          columnGap: 1,
                          pl: 2.5,
                          border: '1px solid',
                          borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                          ...(icon.name === 'fb_group_link' && {
                            display: 'none',
                          }),
                        }}
                      >
                        <Typography
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {chanelInfo?.[icon.name] || '...'}
                        </Typography>
                      </Link>
                    ))}
                  </Stack>
                  <Stack spacing={2} width={{ xs: 1, md: 0.48 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {t('nav.doc')}
                    </Typography>
                    <Link
                      component={Button}
                      target="_blank"
                      rel="noopener noreferrer"
                      href={LINK_USER_MANUAL_DOC}
                      color="text.primary"
                      size="large"
                      startIcon={<img src="/logo/logo_single.svg" alt="logo" />}
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        columnGap: 1,
                        pl: 2.5,
                        border: '1px solid',
                        borderColor: (theme) => alpha(theme.palette.grey[500], 0.32),
                        '& img': {
                          width: '20px',
                          height: '20px',
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {LINK_USER_MANUAL_DOC}
                      </Typography>
                    </Link>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent sx={{ paddingTop: '15px', paddingBottom: '15px' }}>
                <Stack width={1} spacing={2}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {t('nav.hotLine')}
                  </Typography>
                  {chanelInfo?.hotline?.map((item, index) => (
                    <Stack key={index} spacing={1.5} direction="row">
                      <Iconify icon="carbon:skill-level-basic" />
                      <ListItemText
                        primary={item.name}
                        secondary={item.phone}
                        primaryTypographyProps={{
                          typography: 'body2',
                          color: 'text.secondary',
                          mb: 0.5,
                        }}
                        secondaryTypographyProps={{
                          typography: 'subtitle2',
                          color: 'text.primary',
                          component: 'span',
                        }}
                      />
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Scrollbar>
    </Container>
  );
}

SupportGroupView.propTypes = {
  chanelInfo: PropTypes.object,
};
