import PropTypes from 'prop-types';
import Carousel from 'react-slick';
// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
// theme
import { bgBlur } from 'src/theme/css';
// hooks
import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Logo from 'src/components/logo';
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';
//
import Image from 'src/components/image';
import { useCarousel } from 'src/components/carousel';
import { isElectron } from 'src/utils/commom';
import { useRouter } from 'src/routes/hooks';
import { useState } from 'react';
import { HEADER, NAV } from '../config-layout';
import {
  // Searchbar,
  AccountPopover,
  LanguagePopover,
  // NotificationsPopover,
  SettingsButton,
} from '../_common';
import Workspace from './workspace';
import UpdateSystemPopover from '../_common/update-system-popover';

// ----------------------------------------------------------------------

export default function Header({ onOpenNav }) {
  const theme = useTheme();
  const route = useRouter();
  const [isDragging, setIsDragging] = useState(false);

  const carousel = useCarousel({
    autoplay: true,
    slickGap: 40,
    pauseOnHover: true,
    autoplaySpeed: 10000,
    beforeChange: () => {
      setIsDragging(true);
    },
    afterChange: () => {
      setIsDragging(false);
    },
  });

  const settings = useSettingsContext();

  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  const renderContent = (
    <Stack width={1} direction="row" alignItems="center" justifyContent="space-between">
      {lgUp && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {!lgUp && (
        <IconButton onClick={onOpenNav}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}

      {/* <Searchbar /> */}
      <Workspace />

      <Stack
        sx={{
          width: '100%',
          maxWidth: '500px',
          overflow: 'hidden',
          height: '60px',
          justifyContent: 'center',
          alignItems: 'center',
          px: 2,
          '& > .slick-slider': {
            width: '100%',
          },
        }}
      >
        <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
          {[
            {
              id: 1,
              title: 'banner 1',
              coverUrl: '/assets/images/banner.png',
              href: 'https://mkt.city',
            },
            {
              id: 2,
              title: 'banner 2',
              coverUrl: '/assets/images/banner_2.jpg',
              href: 'https://mkt.city',
            },
            {
              id: 3,
              title: 'banner 3',
              coverUrl: '/assets/images/banner_3.jpg',
              href: 'https://mkt.city',
            },
          ].map((item) => (
            <Image
              onClick={() => {
                if (isDragging) return;
                if (item.link_type === 'inside') {
                  const paths = item.link.split('/');
                  const path = paths.slice(3);
                  route.push(path.join('/'));
                } else if (isElectron()) {
                  window.ipcRenderer.send('open-external', item.link);
                } else {
                  window.open(item.link, '_blank', 'noopener noreferrer');
                }
              }}
              key={item.id}
              alt={item.title}
              src={item.coverUrl}
              sx={{
                width: 1,
                height: '50px',
                objectFit: 'contain',
                borderRadius: 1,
                cursor: 'pointer',
              }}
            />
          ))}
        </Carousel>
      </Stack>

      <Stack
        // flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 2 }}
      >
        <LanguagePopover />

        {/* <NotificationsPopover /> */}

        {/* <ContactsPopover /> */}

        <UpdateSystemPopover />

        <SettingsButton />

        <AccountPopover />
      </Stack>
    </Stack>
  );

  return (
    <AppBar
      id="header-content"
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          height: HEADER.H_DESKTOP,
          ...(offsetTop && {
            height: HEADER.H_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            height: HEADER.H_DESKTOP_OFFSET,
            borderBottom: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  onOpenNav: PropTypes.func,
};
