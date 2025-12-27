import React, { useEffect, useState } from 'react';
import { getUserLocale, setUserLocale } from '../../utilities/locale';
import { Locale } from '../../i18n/config';
import ToggleButton from '../atoms/ToggleButton';

const LanguageSelector = () => {
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    getUserLocale().then((cookieLanguage) => {
        if (cookieLanguage) {
            setLanguage(cookieLanguage);
        }
    });
  }, []);

  const handleToggle = async () => {
    const newLanguage = language === 'es' ? 'en' : 'es';
    setLanguage(newLanguage);
    await setUserLocale(newLanguage as Locale);
  };

  return (
    <div className="flex cursor-pointer gap-2 w-fit">
      ES
      <ToggleButton label={"Toggle"} value={language === 'en'} onChange={handleToggle}/>
      EN
    </div>
  );
};

export default LanguageSelector;