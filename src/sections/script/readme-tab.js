import PropTypes from 'prop-types';

import { Fab, Stack, Zoom } from '@mui/material';
import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { useLocales } from 'src/locales';

const LazyEditor = lazy(() => import('src/components/editor'));

export default function ReadmeTab({ readme }) {
  const { t } = useLocales();
  const scrollRef = useRef(null);
  const [show, setShow] = useState(false);

  const handleScroll = useCallback(() => {
    if (scrollRef.current.scrollTop > 500) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, []);

  useEffect(() => {
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  return (
    <Stack spacing={2} mt={2} width={1} height={1} mx={2}>
      <Scrollbar
        ref={scrollRef}
        sxRoot={{
          overflow: 'unset',
        }}
        sx={{
          height: 'calc(100% - 60px)',
          '& .simplebar-track.simplebar-vertical': {
            position: 'absolute',
            right: -16,
            pointerEvents: 'auto',
          },
        }}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <LazyEditor
            sx={{
              backgroundColor: 'transparent',
              '& .ql-editor': {
                p: 0,
                backgroundColor: 'transparent',
                maxHeight: 'fit-content',
              },
              border: 'none',
            }}
            id="simple-editor"
            value={readme}
            readOnly
            placeholder={t('workflow.script.tab.noContent')}
          />
        </Suspense>
      </Scrollbar>
      <Zoom in={show} timeout={300} unmountOnExit>
        <Fab
          aria-label="top-up"
          sx={{
            position: 'absolute',
            bottom: 30,
            right: 30,
            width: 40,
            height: 40,
          }}
          color="default"
          onClick={() => {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{
            transitionDelay: `${show ? 300 : 0}ms`,
          }}
        >
          <Iconify icon="mingcute:up-fill" />
        </Fab>
      </Zoom>
    </Stack>
  );
}

ReadmeTab.propTypes = {
  readme: PropTypes.string,
};
