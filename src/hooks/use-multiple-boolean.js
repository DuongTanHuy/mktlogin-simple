import { useCallback, useState } from 'react';

// ----------------------------------------------------------------------

export function useMultiBoolean(defaultValue) {
  const [value, setValue] = useState(defaultValue);

  const onTrue = useCallback((name) => {
    setValue((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const onFalse = useCallback((name) => {
    setValue((prev) => ({
      ...prev,
      [name]: false,
    }));
  }, []);

  const onToggle = useCallback((name) => {
    setValue((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }, []);

  return {
    value,
    onTrue,
    onFalse,
    onToggle,
    setValue,
  };
}
