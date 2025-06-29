export const formatErrors = (errorObject, setError, t) => {
  if (!errorObject) return null;
  return Object.keys(errorObject).forEach((key) => {
    setError(key, {
      type: 'manual',
      message: t ? t(`systemNotify.error.${errorObject[key][0]}`) : errorObject[key][0],
    });
  });
};

export const formatErrorFields = (errorObject, setError, t) => {
  const messages = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const key in errorObject) {
    if (Array.isArray(errorObject[key])) {
      messages.push(...errorObject[key]);
    }
  }
  if (messages.length > 0) {
    if (t) {
      setError(t(messages[0]));
    } else {
      setError(messages[0]);
    }
  }
};
