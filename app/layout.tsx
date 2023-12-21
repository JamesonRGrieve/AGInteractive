import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import ThemeWrapper from 'jrgcomponents/theming/ThemeWrapper';
import themes from './theme';
import React from 'react';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();

  return (
    <html lang='en'>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <meta name='google-adsense-account' content={process.env.NEXT_PUBLIC_ADSENSE_ACCOUNT} />
        <meta property='og:url' content={process.env.NEXT_PUBLIC_APP_URI} />
        <meta property='og:type' content='website' />
        <meta property='og:title' content={process.env.NEXT_PUBLIC_APP_NAME} />
        <meta property='og:description' content={process.env.NEXT_PUBLIC_APP_DESCRIPTION} />
      </head>
      <body className={inter.className}>
        <ThemeWrapper
          themes={themes}
          defaultDark={cookieStore.get('dark')?.value === 'true'}
          defaultColorblind={cookieStore.get('colorblind')?.value === 'true'}
        >
          {children}
        </ThemeWrapper>
      </body>
    </html>
  );
}
