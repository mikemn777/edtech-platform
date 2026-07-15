/**
 * Shared public catalog: tutoring subjects and school grade stages.
 * Names are trilingual (EN default / AR RTL / TR) so per-subject landing pages
 * and the resources library render correctly in every language.
 */
export type Lang = 'en' | 'ar' | 'tr';
type L = Record<Lang, string>;

export interface SubjectDef {
  slug: string;      // URL segment, e.g. "physics"
  api: string;       // value sent to marketplace/tutors?subject=
  name: L;
}

export const SUBJECTS: SubjectDef[] = [
  { slug: 'mathematics',     api: 'mathematics',     name: { en: 'Mathematics',     ar: 'الرياضيات',            tr: 'Matematik' } },
  { slug: 'physics',         api: 'physics',         name: { en: 'Physics',         ar: 'الفيزياء',             tr: 'Fizik' } },
  { slug: 'chemistry',       api: 'chemistry',       name: { en: 'Chemistry',       ar: 'الكيمياء',             tr: 'Kimya' } },
  { slug: 'biology',         api: 'biology',         name: { en: 'Biology',         ar: 'الأحياء',              tr: 'Biyoloji' } },
  { slug: 'english',         api: 'english',         name: { en: 'English',         ar: 'اللغة الإنجليزية',      tr: 'İngilizce' } },
  { slug: 'arabic',          api: 'arabic',          name: { en: 'Arabic',          ar: 'اللغة العربية',        tr: 'Arapça' } },
  { slug: 'computer-science',api: 'computer science',name: { en: 'Computer Science',ar: 'علوم الحاسب',          tr: 'Bilgisayar Bilimi' } },
  { slug: 'programming',     api: 'programming',     name: { en: 'Programming',     ar: 'البرمجة',              tr: 'Programlama' } },
  { slug: 'ielts',           api: 'ielts',           name: { en: 'IELTS',           ar: 'الآيلتس',              tr: 'IELTS' } },
  { slug: 'sat',             api: 'sat',             name: { en: 'SAT',             ar: 'السات',                tr: 'SAT' } },
  { slug: 'qudurat',         api: 'qudurat',         name: { en: 'Qudurat (GAT)',   ar: 'القدرات',              tr: 'Yetenek Sınavı' } },
  { slug: 'tahsili',         api: 'tahsili',         name: { en: 'Tahsili',         ar: 'التحصيلي',             tr: 'Tahsili' } },
  { slug: 'statistics',      api: 'statistics',      name: { en: 'Statistics',      ar: 'الإحصاء',              tr: 'İstatistik' } },
  { slug: 'economics',       api: 'economics',       name: { en: 'Economics',       ar: 'الاقتصاد',             tr: 'Ekonomi' } },
  { slug: 'islamic-studies', api: 'islamic studies', name: { en: 'Islamic Studies', ar: 'الدراسات الإسلامية',   tr: 'İslami Çalışmalar' } },
  { slug: 'french',          api: 'french',          name: { en: 'French',          ar: 'اللغة الفرنسية',       tr: 'Fransızca' } },
  { slug: 'cybersecurity',   api: 'cybersecurity',   name: { en: 'Cybersecurity',   ar: 'الأمن السيبراني',      tr: 'Siber Güvenlik' } },
  { slug: 'excel',           api: 'excel',           name: { en: 'Excel',           ar: 'إكسل',                 tr: 'Excel' } },
];

export function subjectBySlug(slug: string): SubjectDef | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

export function subjectName(s: SubjectDef, lang: string): string {
  return s.name[(lang as Lang)] ?? s.name.en;
}

/** SEO/marketing blurb for a subject, generated per language (DRY). */
export function subjectBlurb(name: string, lang: string): string {
  if (lang === 'ar') return `احجز مدرس ${name} خصوصي معتمد — دروس فردية أونلاين أو حضوري، مصمّمة لمنهجك وأهدافك.`;
  if (lang === 'tr') return `Onaylı özel ${name} öğretmeni ile ders al — birebir, online veya yüz yüze, müfredatına ve hedeflerine göre.`;
  return `Book a vetted private ${name} tutor — one-on-one lessons, online or in person, matched to your curriculum and goals.`;
}

export interface GradeStage {
  key: string;
  name: L;
  grades: { n: number; label: L }[];
}


export const STAGES: GradeStage[] = [
  {
    key: 'primary',
    name: { en: 'Primary', ar: 'المرحلة الابتدائية', tr: 'İlkokul' },
    grades: [1, 2, 3, 4, 5, 6].map((n) => ({
      n,
      label: {
        en: `Grade ${n}`,
        ar: `الصف ${['','الأول','الثاني','الثالث','الرابع','الخامس','السادس'][n]} الابتدائي`,
        tr: `${n}. Sınıf`,
      },
    })),
  },
  {
    key: 'middle',
    name: { en: 'Middle', ar: 'المرحلة المتوسطة', tr: 'Ortaokul' },
    grades: [1, 2, 3].map((n) => ({
      n,
      label: {
        en: `Grade ${n}`,
        ar: `الصف ${['','الأول','الثاني','الثالث'][n]} المتوسط`,
        tr: `${n}. Sınıf`,
      },
    })),
  },
  {
    key: 'secondary',
    name: { en: 'Secondary', ar: 'المرحلة الثانوية', tr: 'Lise' },
    grades: [1, 2, 3].map((n) => ({
      n,
      label: {
        en: `Grade ${n}`,
        ar: `الصف ${['','الأول','الثاني','الثالث'][n]} الثانوي`,
        tr: `${n}. Sınıf`,
      },
    })),
  },
];
