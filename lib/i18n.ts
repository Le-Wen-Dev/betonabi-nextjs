export const locales = ['vi', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'vi';

export const localeToLang = { vi: 'VN', ja: 'JP' } as const;
export const langToLocale = { VN: 'vi', JP: 'ja' } as const;

export type Language = 'VN' | 'JP';
