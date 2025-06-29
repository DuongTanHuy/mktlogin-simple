import { useCallback, useState } from 'react';

// ----------------------------------------------------------------------

export default function useMultiPopover() {
  const [popovers, setPopovers] = useState({});

  const onOpen = useCallback((event, productId) => {
    setPopovers((prevPopovers) => ({
      ...prevPopovers,
      [productId]: event.currentTarget,
    }));
  }, []);

  const onClose = useCallback((productId) => {
    setPopovers((prevPopovers) => {
      const newPopovers = { ...prevPopovers };
      delete newPopovers[productId];
      return newPopovers;
    });
  }, []);

  return {
    popovers,
    onOpen,
    onClose,
  };
}
