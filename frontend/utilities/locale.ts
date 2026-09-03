'use server';

import {cookies} from 'next/headers';
import {Locale, defaultLocale} from '../i18n/config';

const COOKIE_NAME = 'locale';

export async function getUserLocale() {
  return (await cookies()).get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale, {
    maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
    path: '/',
    sameSite: 'lax'
  });
}
