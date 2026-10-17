import { GoogleGenAI } from '@google/genai';

export interface ProofreadCorrection {
  original: string;
  suggestion: string;
  type: 'spelling' | 'grammar' | 'punctuation' | 'style';
  explanation: string;
}

export interface ProofreadResult {
  originalText: string;
  correctedText: string;
  corrections: ProofreadCorrection[];
  source: 'gemini' | 'rules';
}

const ARABIC_WORD_RULES: Array<{
  word: string;
  replacement: string;
  type: 'spelling' | 'grammar' | 'punctuation';
  explanation: string;
}> = [
  { word: 'هاذا', replacement: 'هذا', type: 'spelling', explanation: 'حذف ألف التنبيه الزائدة في اسم الإشارة' },
  { word: 'هاذه', replacement: 'هذه', type: 'spelling', explanation: 'حذف ألف التنبيه الزائدة في اسم الإشارة' },
  { word: 'هاؤلاء', replacement: 'هؤلاء', type: 'spelling', explanation: 'حذف ألف التنبيه الزائدة في اسم الإشارة' },
  { word: 'هاكذا', replacement: 'هكذا', type: 'spelling', explanation: 'كتابة اسم الإشارة الصحيح' },
  { word: 'ذالك', replacement: 'ذلك', type: 'spelling', explanation: 'حذف الألف بعد الذال في اسم الإشارة' },
  { word: 'لاكن', replacement: 'لكن', type: 'spelling', explanation: 'كتابة حرف الاستدراك بدون ألف' },
  { word: 'الى', replacement: 'إلى', type: 'spelling', explanation: 'همزة قطع مكسورة في حرف الجر' },
  { word: 'ان', replacement: 'أن', type: 'spelling', explanation: 'همزة قطع مفتوحة' },
  { word: 'انما', replacement: 'إنما', type: 'spelling', explanation: 'همزة قطع مكسورة في أداة الحصر' },
  { word: 'اذا', replacement: 'إذا', type: 'spelling', explanation: 'همزة قطع مكسورة في ظرفية الشرط' },
  { word: 'اكثر', replacement: 'أكثر', type: 'spelling', explanation: 'همزة قطع على وزن أفعل' },
  { word: 'اكبر', replacement: 'أكبر', type: 'spelling', explanation: 'همزة قطع على وزن أفعل' },
  { word: 'اصغر', replacement: 'أصغر', type: 'spelling', explanation: 'همزة قطع على وزن أفعل' },
  { word: 'افضل', replacement: 'أفضل', type: 'spelling', explanation: 'همزة قطع على وزن أفعل' },
  { word: 'اول', replacement: 'أول', type: 'spelling', explanation: 'همزة قطع مفتوحة' },
  { word: 'اخر', replacement: 'آخر', type: 'spelling', explanation: 'همزة مد ممدودة' },
  { word: 'انسان', replacement: 'إنسان', type: 'spelling', explanation: 'همزة قطع مكسورة' },
  { word: 'احسان', replacement: 'إحسان', type: 'spelling', explanation: 'همزة قطع مصدر رباعي' },
  { word: 'ابراهيم', replacement: 'إبراهيم', type: 'spelling', explanation: 'همزة قطع علم أعجمي' },
  { word: 'اسماعيل', replacement: 'إسماعيل', type: 'spelling', explanation: 'همزة قطع علم أعجمي' },
  { word: 'اسحاق', replacement: 'إسحاق', type: 'spelling', explanation: 'همزة قطع علم أعجمي' },
  { word: 'ايضا', replacement: 'أيضاً', type: 'spelling', explanation: 'همزة قطع وتنوين نصب' },
  { word: 'مدرسه', replacement: 'مدرسة', type: 'spelling', explanation: 'تاء مربوطة تنطق هاء عند الوقف وتاء عند الوصل' },
  { word: 'مكتبه', replacement: 'مكتبة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'جامعه', replacement: 'جامعة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'حياه', replacement: 'حياة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'وثيقه', replacement: 'وثيقة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'شرعيه', replacement: 'شرعية', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'قضائيه', replacement: 'قضائية', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'رسميه', replacement: 'رسمية', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'جمهوريه', replacement: 'جمهورية', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'اليمنيه', replacement: 'اليمنية', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'خاصه', replacement: 'خاصة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'عامه', replacement: 'عامة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'قوه', replacement: 'قوة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'صوره', replacement: 'صورة', type: 'spelling', explanation: 'تاء مربوطة' },
  { word: 'مستشفي', replacement: 'مستشفى', type: 'spelling', explanation: 'ألف مقصورة في نهاية الاسم المقصور' },
  { word: 'فتوي', replacement: 'فتوى', type: 'spelling', explanation: 'ألف مقصورة' },
  { word: 'دعاوي', replacement: 'دعاوى', type: 'spelling', explanation: 'ألف مقصورة في جمع دعوى' },
];

export function ruleBasedArabicProofread(text: string): ProofreadResult {
  const corrections: ProofreadCorrection[] = [];
  let corrected = text;

  // 1. Punctuation spacing
  corrected = corrected.replace(/\s+([،؛:؟!.\)])/g, (match, p1) => {
    corrections.push({
      original: match,
      suggestion: p1,
      type: 'punctuation',
      explanation: 'إزالة المسافة الزائدة قبل علامة الترقيم',
    });
    return p1;
  });

  // 2. Word by word replacement with Unicode boundary check
  for (const item of ARABIC_WORD_RULES) {
    const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])(${item.word})([^\\p{L}\\p{N}_]|$)`, 'gu');
    if (regex.test(corrected)) {
      corrections.push({
        original: item.word,
        suggestion: item.replacement,
        type: item.type,
        explanation: item.explanation,
      });
      corrected = corrected.replace(
        new RegExp(`(^|[^\\p{L}\\p{N}_])(${item.word})([^\\p{L}\\p{N}_]|$)`, 'gu'),
        `$1${item.replacement}$3`
      );
    }
  }

  return {
    originalText: text,
    correctedText: corrected,
    corrections,
    source: 'rules',
  };
}

export async function proofreadWithGemini(text: string): Promise<ProofreadResult> {
  // تم إيقاف أي مزامنة خارجية أو استدعاء لخدمات Gemini بناءً على طلب المستخدم
  // المحرك يعمل محلياً بنسبة 100% بدون أي استهلاك للحصص أو مزامنة عبر الإنترنت
  return ruleBasedArabicProofread(text);
}
