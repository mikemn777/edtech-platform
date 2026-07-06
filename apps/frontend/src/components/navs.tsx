import type { NavItem } from './DashboardShell';
import { Grid, Users, Shield, Book, Calendar, Chart, Bell, Star, User, Heart, Check } from './icons';

type T = (key: string) => string;

export function adminNav(lang: string, t: T): NavItem[] {
  return [
    { href: `/${lang}/admin`, label: t('nav.overview'), icon: <Grid width={18} height={18} /> },
    { href: `/${lang}/admin/users`, label: t('admin.users.title'), icon: <Users width={18} height={18} /> },
    { href: `/${lang}/admin/verification`, label: t('admin.verify.title'), icon: <Shield width={18} height={18} /> },
    { href: `/${lang}/admin/content`, label: t('admin.content.title'), icon: <Book width={18} height={18} /> },
    { href: `/${lang}/admin/analytics`, label: t('nav.analytics'), icon: <Chart width={18} height={18} /> },
  ];
}

export function studentNav(lang: string, t: T): NavItem[] {
  return [
    { href: `/${lang}/student`, label: t('nav.overview'), icon: <Grid width={18} height={18} /> },
    { href: `/${lang}/tutors`, label: t('nav.tutors'), icon: <Star width={18} height={18} /> },
    { href: `/${lang}/favorites`, label: t('nav.favorites'), icon: <Heart width={18} height={18} /> },
    { href: `/${lang}/student/bookings`, label: t('nav.bookings'), icon: <Calendar width={18} height={18} /> },
    { href: `/${lang}/student/goals`, label: t('nav.goals'), icon: <Check width={18} height={18} /> },
    { href: `/${lang}/student/courses`, label: t('nav.courses'), icon: <Book width={18} height={18} /> },
    { href: `/${lang}/student/progress`, label: t('nav.progress'), icon: <Chart width={18} height={18} /> },
  ];
}

export function parentNav(lang: string, t: T): NavItem[] {
  return [
    { href: `/${lang}/parent`, label: t('nav.overview'), icon: <Grid width={18} height={18} /> },
    { href: `/${lang}/parent/children`, label: t('nav.children'), icon: <Users width={18} height={18} /> },
    { href: `/${lang}/tutors`, label: t('nav.tutors'), icon: <Star width={18} height={18} /> },
    { href: `/${lang}/favorites`, label: t('nav.favorites'), icon: <Heart width={18} height={18} /> },
  ];
}

export function tutorNav(lang: string, t: T): NavItem[] {
  return [
    { href: `/${lang}/tutor`, label: t('nav.overview'), icon: <Grid width={18} height={18} /> },
    { href: `/${lang}/tutor/profile`, label: t('nav.myprofile'), icon: <User width={18} height={18} /> },
    { href: `/${lang}/tutor/availability`, label: t('nav.availability'), icon: <Calendar width={18} height={18} /> },
    { href: `/${lang}/tutor/bookings`, label: t('nav.bookings'), icon: <Bell width={18} height={18} /> },
  ];
}