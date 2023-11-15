import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { cookies } from 'next/headers';
import './globals.css';
import { AppBar, Box, Typography } from '@mui/material';
import ThemeWrapper from 'jrgcomponents/theming/ThemeWrapper';
import themes from './theme';

import React from 'react';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JRG Next.js Boilerplate',
  description: 'Boilerplate for Next.JS Applications'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  return (
    <html lang='en'>
      <Head key={'env'}>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src='/__env.js' />
      </Head>
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
