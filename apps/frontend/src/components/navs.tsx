import type { NavItem } from './DashboardShell';
import { Grid, Users, Shield, Book, Calendar, Chart, Bell, Star, User, Heart, Check, Settings, FileText, Folder, Award } from './icons';

type T = (key: string) => string;

const settingsItem = (lang: string, t: T): NavItem => ({ href: `/${lang}/settings`, label: t('nav.settings'), icon: <Settings width={18} height={18} /> });
const notesItem = (lang: string, t: T): NavItem => ({ href: `/${lang}/notes`, label: t('nav.notes'), icon: <FileText width={18} height={18} /> });

export function adminNav(lang: string, t: T): NavItem[] {
  return [
    { href: `/${lang}/admin`, label: t('nav.overview'), icon: <Grid width={18} height={18} /> },
    { href: `/${lang}/admin/users`, label: t('admin.users.title'), icon: <Users width={18} height={18} /> },
    { href: `/${lang}/admin/verification`, label: t('admin.verify.title'), icon: <Shield width={18} height={18} /> },
    { href: `/${lang}/admin/content`, label: t('admin.content.title'), icon: <Book width={18} height={18} /> },
    { href: `/${lang}/admin/analytics`, label: t('nav.analytics'), icon: <Chart width={18} height={18} /> },
    settingsItem(lang, t),
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
    { href: `/${lang}/student/homework`, label: t('nav.homework'), icon: <Check width={18} height={18} /> },
    { href: `/${lang}/student/quizzes`, label: t('nav.quizzes'), icon: <Chart width={18} height={18} /> },
    { href: `/${lang}/student/certificates`, label: t('nav.certificates'), icon: <Award width={18} height={18} /> },
    { href: `/${lang}/student/progress`, label: t('nav.progress'), icon: <Chart width={18} height={18} /> },
    notesItem(lang, t),
    settingsItem(lang, t),
  ];
}

export function parentNav(lang: string, t: T): NavItem[] {
  return [
    { href: `/${lang}/parent`, label: t('nav.overview'), icon: <Grid width={18} height={18} /> },
    { href: `/${lang}/parent/children`, label: t('nav.children'), icon: <Users width={18} height={18} /> },
    { href: `/${lang}/tutors`, label: t('nav.tutors'), icon: <Star width={18} height={18} /> },
    { href: `/${lang}/favorites`, label: t('nav.favorites'), icon: <Heart width={18} height={18} /> },
    notesItem(lang, t),
    settingsItem(lang, t),
  ];
}

export function tutorNav(lang: string, t: T): NavItem[] {
  return [
    { href: `/${lang}/tutor`, label: t('nav.overview'), icon: <Grid width={18} height={18} /> },
    { href: `/${lang}/tutor/profile`, label: t('nav.myprofile'), icon: <User width={18} height={18} /> },
    { href: `/${lang}/tutor/availability`, label: t('nav.availability'), icon: <Calendar width={18} height={18} /> },
    { href: `/${lang}/tutor/bookings`, label: t('nav.bookings'), icon: <Bell width={18} height={18} /> },
    { href: `/${lang}/tutor/homework`, label: t('nav.homework'), icon: <Book width={18} height={18} /> },
    { href: `/${lang}/tutor/quizzes`, label: t('nav.quizzes'), icon: <Chart width={18} height={18} /> },
    { href: `/${lang}/tutor/resources`, label: t('nav.resources'), icon: <Folder width={18} height={18} /> },
    { href: `/${lang}/tutor/certificates`, label: t('nav.certificates'), icon: <Award width={18} height={18} /> },
    notesItem(lang, t),
    settingsItem(lang, t),
  ];
}
