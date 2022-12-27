export const replaceBaseUrl = (url: URL, baseUrl: URL): URL => {
  if (url.origin === baseUrl.origin) {
    return new URL(url.pathname + url.search + url.hash, baseUrl);
  }
  return url;
}
