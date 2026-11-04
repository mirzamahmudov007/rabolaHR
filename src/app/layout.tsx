import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, htmlLang, isLocale } from '@/shared/i18n/config';
import type { Locale } from '@/shared/i18n/config';
import { LocaleProvider } from '@/shared/i18n/LocaleProvider';
import { ThemeProvider } from '@/shared/hooks/useTheme';
import type { Theme } from '@/shared/hooks/useTheme';
import './globals.css';

/** Runs before first paint: puts the stored (or OS) theme on <html> so no page ever flashes light→dark. */
const THEME_PRELOAD_SCRIPT = `
try{var c=document.cookie.split('; ').find(function(p){return p.indexOf('att-theme=')===0});var t=c&&c.slice(10);if(t!=='dark'&&t!=='light'){t=localStorage.getItem('att-theme')}if(t!=='dark'&&t!=='light'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}`;

export const metadata: Metadata = {
  title: 'ATT Davomat',
  description: 'ATT davomat tizimi — shared UI komponentlari (Next.js App Router)',
};

function resolveLocale(): Locale {
  const stored = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = resolveLocale();
  const storedTheme = cookies().get('att-theme')?.value;
  const theme: Theme = storedTheme === 'dark' ? 'dark' : 'light';
  return (
    <html lang={htmlLang[locale]} className={theme === 'dark' ? 'dark' : undefined} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_PRELOAD_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider initialTheme={theme}>
          <LocaleProvider initial={locale}>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
