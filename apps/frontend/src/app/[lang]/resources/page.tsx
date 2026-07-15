'use client';

import ContentPage from '@/components/ContentPage';
import { getTranslator } from '@/lib/i18n';
import { STAGES, SUBJECTS, subjectName, type Lang } from '@/lib/catalog';
import { Folder, ArrowRight, FileText } from '@/components/icons';

type L = Record<Lang, string>;
interface Download { file: string; title: L; meta: L }

const DOWNLOADS: Download[] = [
  { file: 'math-primary-worksheet.pdf',
    title: { en: 'Mathematics Practice Worksheet', ar: 'ورقة عمل الرياضيات', tr: 'Matematik Alıştırma Kağıdı' },
    meta:  { en: 'Primary · PDF', ar: 'ابتدائي · PDF', tr: 'İlkokul · PDF' } },
  { file: 'english-grammar-middle.pdf',
    title: { en: 'English Grammar Pack', ar: 'حزمة قواعد الإنجليزية', tr: 'İngilizce Dilbilgisi Paketi' },
    meta:  { en: 'Middle · PDF', ar: 'متوسط · PDF', tr: 'Ortaokul · PDF' } },
  { file: 'physics-secondary-fundamentals.pdf',
    title: { en: 'Physics Fundamentals', ar: 'أساسيات الفيزياء', tr: 'Fizik Temelleri' },
    meta:  { en: 'Secondary · PDF', ar: 'ثانوي · PDF', tr: 'Lise · PDF' } },
  { file: 'qudurat-gat-prep.pdf',
    title: { en: 'Qudurat (GAT) Prep Sheet', ar: 'ورقة تحضير القدرات', tr: 'Yetenek Sınavı Hazırlık' },
    meta:  { en: 'Exam prep · PDF', ar: 'تحضير اختبار · PDF', tr: 'Sınav hazırlığı · PDF' } },
  { file: 'study-skills-guide.pdf',
    title: { en: 'Study Skills Guide', ar: 'دليل مهارات الدراسة', tr: 'Çalışma Becerileri Rehberi' },
    meta:  { en: 'All levels · PDF', ar: 'كل المستويات · PDF', tr: 'Tüm seviyeler · PDF' } },
];

/** Public learning-resources library: free downloads + browse by stage/grade. */
export default function ResourcesPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const l = (lang as Lang);
  const t = getTranslator(lang);
  return (
    <ContentPage lang={lang} title={t('resources.title')} lead={t('resources.lead')} wide>
      <div className="stack gap-4">
        {/* Free downloads */}
        <div className="card card-pad-lg">
          <div className="row between wrap gap-2">
            <h2 className="mb-0">{t('resources.downloads')}</h2>
            <span className="badge badge-ok">{t('resources.free')}</span>
          </div>
          <p className="muted mt-1">{t('resources.downloadsLead')}</p>
          <div className="grid cols-3 mt-3">
            {DOWNLOADS.map((d) => (
              <a key={d.file} href={`/resources/${d.file}`} download className="card card-hover">
                <div className="brand-mark" style={{ width: 40, height: 40, borderRadius: 12 }}><FileText /></div>
                <h3 className="mt-2 mb-0" style={{ fontSize: '1.05rem' }}>{d.title[l] ?? d.title.en}</h3>
                <div className="soft small mt-1">{d.meta[l] ?? d.meta.en}</div>
                <span className="btn btn-outline btn-sm mt-2">{t('resources.download')} <ArrowRight width={14} height={14} /></span>
              </a>
            ))}
          </div>
        </div>

        {/* Browse by stage / grade */}
        {STAGES.map((stage) => (
          <div key={stage.key} className="card card-pad-lg">
            <div className="row between wrap gap-2">
              <h2 className="mb-0">{stage.name[l] ?? stage.name.en}</h2>
              <span className="badge badge-neutral">{stage.grades.length} {t('resources.grades')}</span>
            </div>
            <div className="grid cols-3 mt-3">
              {stage.grades.map((g) => (
                <a key={g.n} href={`/${lang}/subjects`} className="card card-hover">
                  <div className="brand-mark" style={{ width: 38, height: 38, borderRadius: 10 }}><Folder /></div>
                  <h3 className="mt-2 mb-0">{g.label[l] ?? g.label.en}</h3>
                  <span className="row gap-1 mt-1 small" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    {t('resources.browse')} <ArrowRight width={14} height={14} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}

        <div className="card card-pad-lg">
          <h3 className="mt-0">{t('resources.bySubject')}</h3>
          <div className="row wrap gap-1 mt-2">
            {SUBJECTS.map((s) => (
              <a key={s.slug} href={`/${lang}/subjects/${s.slug}`} className="btn btn-outline btn-sm btn-pill">{subjectName(s, lang)}</a>
            ))}
          </div>
        </div>
      </div>
    </ContentPage>
  );
}
