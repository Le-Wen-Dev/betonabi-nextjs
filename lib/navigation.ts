export function localePath(locale: string, path: string) {
  return `/${locale}${path.startsWith('/') ? path : '/' + path}`;
}
