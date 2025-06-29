import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
// utils
import { localStorageGetItem } from 'src/utils/storage-available';
// components
//
import { allLangs, defaultLang } from './config-lang';

// ----------------------------------------------------------------------

export default function useLocales() {
  const { i18n, t } = useTranslation();

  const langStorage = localStorageGetItem('i18nextLng');

  const currentLang = allLangs.find((lang) => lang.value === langStorage) || defaultLang;

  const onChangeLang = useCallback(
    (newlang) => {
      i18n.changeLanguage(newlang);
    },
    [i18n]
  );

  return {
    allLangs,
    t,
    currentLang,
    onChangeLang,
  };
}
