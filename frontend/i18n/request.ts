import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from './config';
import { getUserLocale } from '../utilities/locale';

export default getRequestConfig(async () => {
  const locale = await getUserLocale() || defaultLocale;
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
