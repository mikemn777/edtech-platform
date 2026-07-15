/** Static blog content (trilingual). Extend or wire to a CMS/backend later. */
export type Lang = 'en' | 'ar' | 'tr';
type L = Record<Lang, string>;

export interface Post {
  slug: string;
  date: string;
  readMins: number;
  title: L;
  excerpt: L;
  body: L[]; // paragraphs
}

export const POSTS: Post[] = [
  {
    slug: 'how-to-choose-a-private-tutor',
    date: '2026-05-12',
    readMins: 5,
    title: {
      en: 'How to choose the right private tutor',
      ar: 'كيف تختار المدرس الخصوصي المناسب',
      tr: 'Doğru özel öğretmen nasıl seçilir',
    },
    excerpt: {
      en: 'A practical checklist for picking a tutor who fits your goals, budget, and learning style.',
      ar: 'قائمة عملية لاختيار مدرس يناسب أهدافك وميزانيتك وأسلوب تعلمك.',
      tr: 'Hedeflerinize, bütçenize ve öğrenme tarzınıza uygun öğretmen seçmek için pratik bir kontrol listesi.',
    },
    body: [
      { en: 'Start with a clear goal: exam prep, catching up, or getting ahead. The right tutor for a Qudurat sprint is different from one for weekly follow-up.', ar: 'ابدأ بهدف واضح: التحضير لاختبار، أو تعويض ما فات، أو التقدّم. المدرس المناسب لاختبار القدرات يختلف عن مدرس المتابعة الأسبوعية.', tr: 'Net bir hedefle başlayın: sınav hazırlığı, açığı kapatmak veya öne geçmek. Yetenek sınavı için doğru öğretmen, haftalık takip için gerekenden farklıdır.' },
      { en: 'Check ratings and reviews, confirm the tutor is verified, and book a first session to test the fit before committing to a package.', ar: 'راجع التقييمات والمراجعات، وتأكد أن المدرس موثّق، واحجز جلسة أولى لتجربة التوافق قبل الالتزام بباقة.', tr: 'Puanları ve yorumları inceleyin, öğretmenin onaylı olduğundan emin olun ve pakete bağlanmadan önce uyumu test etmek için ilk dersi ayırtın.' },
    ],
  },
  {
    slug: 'online-vs-in-person-lessons',
    date: '2026-04-28',
    readMins: 4,
    title: {
      en: 'Online vs in-person lessons: which is better?',
      ar: 'الدروس أونلاين مقابل الحضورية: أيهما أفضل؟',
      tr: 'Online mı yüz yüze mi ders: hangisi daha iyi?',
    },
    excerpt: {
      en: 'Both work — the right choice depends on the subject, the student, and your schedule.',
      ar: 'كلاهما فعّال — الخيار الأنسب يعتمد على المادة والطالب وجدولك.',
      tr: 'İkisi de işe yarar — doğru seçim derse, öğrenciye ve programınıza bağlı.',
    },
    body: [
      { en: 'Online lessons save travel time, widen your choice of tutors, and are easy to record for revision. They suit motivated students and most academic subjects.', ar: 'الدروس أونلاين توفّر وقت التنقّل، وتوسّع خياراتك من المدرسين، ويسهل تسجيلها للمراجعة. تناسب الطلاب المتحمسين ومعظم المواد الأكاديمية.', tr: 'Online dersler yol süresini azaltır, öğretmen seçeneğinizi genişletir ve tekrar için kolayca kaydedilir. Motive öğrencilere ve çoğu akademik derse uygundur.' },
      { en: 'In-person lessons help younger learners and hands-on subjects where a tutor sitting beside the student makes a real difference.', ar: 'الدروس الحضورية تفيد المتعلمين الأصغر والمواد التطبيقية حيث يُحدث جلوس المدرس بجانب الطالب فرقًا حقيقيًا.', tr: 'Yüz yüze dersler, öğretmenin öğrencinin yanında oturmasının gerçek fark yarattığı küçük yaştaki öğrencilere ve uygulamalı derslere yardımcı olur.' },
    ],
  },
  {
    slug: 'ace-the-qudurat-exam',
    date: '2026-03-15',
    readMins: 6,
    title: {
      en: 'Five habits to ace the Qudurat (GAT) exam',
      ar: 'خمس عادات للتفوق في اختبار القدرات',
      tr: 'Yetenek sınavında başarılı olmak için beş alışkanlık',
    },
    excerpt: {
      en: 'Consistent practice beats cramming. Here is what top scorers do differently.',
      ar: 'الممارسة المنتظمة تتفوّق على الحفظ المكثّف. إليك ما يفعله المتفوقون بشكل مختلف.',
      tr: 'Düzenli çalışma, son dakika ezberinden iyidir. İşte yüksek puan alanların farkı.',
    },
    body: [
      { en: 'Practice timed sections daily, review every mistake, and learn the question patterns rather than memorizing answers.', ar: 'تدرّب على أقسام موقوتة يوميًا، وراجع كل خطأ، وتعلّم أنماط الأسئلة بدلًا من حفظ الإجابات.', tr: 'Her gün süreli bölümler çalışın, her hatayı gözden geçirin ve cevapları ezberlemek yerine soru kalıplarını öğrenin.' },
      { en: 'A tutor can spot your weak areas fast and build a focused plan for the weeks before the exam.', ar: 'يستطيع المدرس تحديد نقاط ضعفك بسرعة وبناء خطة مركّزة للأسابيع التي تسبق الاختبار.', tr: 'Bir öğretmen zayıf alanlarınızı hızla tespit edip sınavdan önceki haftalar için odaklı bir plan hazırlayabilir.' },
    ],
  },
];

export function postBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
