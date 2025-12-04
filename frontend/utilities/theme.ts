'use server';

import {cookies} from 'next/headers';
import {Theme, defaultTheme} from './themeConfig';

const COOKIE_NAME = 'theme';

export async function getUserTheme(): Promise<Theme> {
  const theme = cookies().get(COOKIE_NAME)?.value as Theme | undefined;
  return theme || defaultTheme;
}

export async function setUserTheme(theme: Theme) {
  cookies().set(COOKIE_NAME, theme);
}
