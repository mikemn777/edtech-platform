import type { ReactNode } from 'react';
import '../styles/globals.css';

/**
 * Root layout. Global design-system styles load here. The <html> lang/dir and the
 * no-flash theme are set in the per-language layout so RTL and dark mode are
 * first-class (Constitution Art. 3.3).
 */
export const metadata = {
  title: 'Eduspark — Find trusted tutors & learn anything',
  description: 'A modern, multi-language education platform connecting students, parents, and verified tutors.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}