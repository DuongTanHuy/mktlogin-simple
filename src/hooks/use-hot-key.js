import { useEffect, useCallback } from 'react';

const useHotkey = (keyCombination, callback, isActive = true) => {
  const handleKeyPress = useCallback(
    (event) => {
      if (!keyCombination) return;
      try {
        const keys = keyCombination.toLowerCase().split('+');
        const { key, ctrlKey, shiftKey, altKey, metaKey } = event;

        const keyLower = key ? key.toLowerCase() : null;

        const isCtrlPressed = keys.includes('ctrl') ? ctrlKey : true;
        const isShiftPressed = keys.includes('shift') ? shiftKey : true;
        const isAltPressed = keys.includes('alt') ? altKey : true;
        const isMetaPressed = keys.includes('meta') ? metaKey : true;
        const isKeyPressed = keyLower ? keys.includes(keyLower) : false;

        if (isCtrlPressed && isShiftPressed && isAltPressed && isMetaPressed && isKeyPressed) {
          event.preventDefault();
          callback(event);
        }
      } catch (error) {
        /* empty */
      }
    },
    [keyCombination, callback]
  );

  useEffect(() => {
    if (isActive) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, isActive]);
};

export default useHotkey;
