'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import AppLayout from '@/components/layout/app-layout';

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AppLayout />
    </ThemeProvider>
  );
}
