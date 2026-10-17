/**
 * Predictive Text Engine for ArabVirtualKeyboard
 * Provides fast contextual word completion, phrase suggestions, and formula auto-complete.
 */
import { 
  ARABIC_FREQUENT_WORDS, 
  ARABIC_COMMON_PARAGRAPHS, 
  normalizeArabic 
} from './arabicDictionary';

export interface TextSuggestion {
  text: string;
  category?: string;
  source?: 'dictionary' | 'context' | 'formula' | 'phrase' | 'history';
  confidence?: number;
  displayText?: string;
}

// Common Excel Formulas for Spreadsheet mode
const EXCEL_FORMULAS = [
  { text: '=SUM(', label: '=SUM(مجموع)', category: 'math' },
  { text: '=AVERAGE(', label: '=AVERAGE(متوسط)', category: 'math' },
  { text: '=COUNT(', label: '=COUNT(عد)', category: 'math' },
  { text: '=IF(', label: '=IF(شرط)', category: 'logic' },
  { text: '=MAX(', label: '=MAX(أكبر قيمة)', category: 'math' },
  { text: '=MIN(', label: '=MIN(أصغر قيمة)', category: 'math' },
  { text: '=VLOOKUP(', label: '=VLOOKUP(بحث)', category: 'lookup' },
  { text: '=CONCATENATE(', label: '=CONCATENATE(دمج)', category: 'text' },
  { text: '=ROUND(', label: '=ROUND(تقريب)', category: 'math' },
  { text: '=TODAY()', label: '=TODAY(تاريخ اليوم)', category: 'date' },
  { text: '=NOW()', label: '=NOW(الوقت الآن)', category: 'date' },
];

const EXCEL_ARABIC_TERMS = [
  'المجموع',
  'الإجمالي',
  'المعدل',
  'النسبة المئوية',
  'الرصيد الافتتاحي',
  'الرصيد الختامي',
  'البيان',
  'التاريخ',
  'مدين',
  'دائن',
  'الملاحظات',
  'الكمية',
  'السعر الإفرادي',
  'القيمة الإجمالية',
  'الضريبة المضافة',
  'صافي الربح',
  'المصروفات',
  'الإيرادات'
];

// Common Arabic next-word collocations
const ARABIC_COLLOCATIONS: Record<string, string[]> = {
  'السلام': ['عليكم ورحمة الله وبركاته'],
  'تحية': ['طيبة وبعد،', 'طيبة وتقدير،'],
  'بناء': ['على ما تقدم', 'على توجيهاتكم', 'على مقتضيات المصلحة العامة'],
  'يرجى': ['التكرم بالعلم والإحاطة', 'التوجيه بما يلزم', 'الموافقة على الطلب'],
  'وتفضلوا': ['بقبول فائق الاحترام والتقدير', 'بقبول أطيب التحيات'],
  'شاكرين': ['ومقدرين حسن تعاونكم', 'لكم اهتمامكم الكريم'],
  'إشارة': ['إلى الموضوع أعلاه', 'إلى خطابكم المؤرخ في'],
  'نود': ['إفادتكم بأن', 'إحاطتكم علماً بأن'],
  'الموضوع:': ['طلب موافقة رسمية', 'تقرير دوري', 'إشعار إداري'],
  'وفقا': ['للأنظمة واللوائح المعتمدة', 'للشروط المتفق عليها'],
  'وفقاً': ['للأنظمة واللوائح المعتمدة', 'للشروط المتفق عليها'],
  'السيد': ['المدير العام المحترم', 'رئيس مجلس الإدارة المحترم'],
  'المحترم': ['تحية طيبة وبعد،', 'حفظه الله ورعاه'],
};

// Common English words and phrases
const ENGLISH_FREQUENT_WORDS = [
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'are', 'not',
  'document', 'report', 'office', 'service', 'client', 'project', 'company',
  'meeting', 'summary', 'please', 'regards', 'sincerely', 'approval', 'review',
  'total', 'average', 'balance', 'account', 'invoice', 'payment', 'date', 'amount'
];

const ENGLISH_PHRASES = [
  'Dear Sir/Madam,',
  'Please find attached',
  'Thank you for your cooperation.',
  'Best regards,',
  'Sincerely yours,',
  'In reference to your inquiry',
  'As per our discussion'
];

/**
 * Main prediction function called by ArabVirtualKeyboard
 */
export function getPredictiveSuggestions(
  rawBuffer: string,
  language: 'ar' | 'en' | string = 'ar',
  mode: 'word' | 'excel' = 'word',
  limit: number = 6
): TextSuggestion[] {
  const buffer = rawBuffer ? rawBuffer.trim() : '';
  if (!buffer) return [];

  const results: TextSuggestion[] = [];
  const addedTexts = new Set<string>();

  const addSuggestion = (suggestion: TextSuggestion) => {
    if (!addedTexts.has(suggestion.text) && results.length < limit) {
      addedTexts.add(suggestion.text);
      results.push(suggestion);
    }
  };

  // 1. Excel Formula and Table Header handling
  if (mode === 'excel') {
    if (buffer.startsWith('=')) {
      const formulaPrefix = buffer.toUpperCase();
      for (const formula of EXCEL_FORMULAS) {
        if (formula.text.toUpperCase().startsWith(formulaPrefix)) {
          addSuggestion({
            text: formula.text,
            category: formula.category,
            source: 'formula',
            confidence: 0.95
          });
        }
      }
    } else {
      const upper = buffer.toUpperCase();
      for (const formula of EXCEL_FORMULAS) {
        const pureName = formula.text.replace('=', '').replace('(', '');
        if (pureName.startsWith(upper)) {
          addSuggestion({
            text: formula.text,
            category: formula.category,
            source: 'formula',
            confidence: 0.9
          });
        }
      }
      // Excel Arabic terms matching
      const normBuf = normalizeArabic(buffer);
      for (const term of EXCEL_ARABIC_TERMS) {
        if (normalizeArabic(term).startsWith(normBuf)) {
          addSuggestion({
            text: term,
            category: 'finance',
            source: 'context',
            confidence: 0.85
          });
        }
      }
    }
  }

  // 2. Arabic Language Handling
  if (language === 'ar') {
    const normBuffer = normalizeArabic(buffer);

    // A. Check Collocations / Next word predictions
    for (const [key, nextPhrases] of Object.entries(ARABIC_COLLOCATIONS)) {
      const normKey = normalizeArabic(key);
      if (normKey === normBuffer || normKey.startsWith(normBuffer)) {
        for (const phrase of nextPhrases) {
          addSuggestion({
            text: key === normBuffer ? phrase : `${key} ${phrase}`,
            category: 'honorific',
            source: 'phrase',
            confidence: 0.98
          });
        }
      }
    }

    // B. Check Paragraph Templates from ARABIC_COMMON_PARAGRAPHS
    if (buffer.length >= 2) {
      for (const p of ARABIC_COMMON_PARAGRAPHS) {
        const normTitle = normalizeArabic(p.title);
        const normShortcut = p.shortcut ? normalizeArabic(p.shortcut) : '';
        if (normShortcut === normBuffer || normTitle.includes(normBuffer)) {
          addSuggestion({
            text: p.text.length > 60 ? p.text.slice(0, 57) + '...' : p.text,
            category: p.category,
            source: 'phrase',
            confidence: 0.9
          });
        }
      }
    }

    // C. Word Completion from ARABIC_FREQUENT_WORDS
    const lastWord = buffer.split(/\s+/).pop() || '';
    const normLastWord = normalizeArabic(lastWord);

    if (normLastWord.length > 0) {
      for (const entry of ARABIC_FREQUENT_WORDS) {
        const normEntryWord = normalizeArabic(entry.word);
        if (normEntryWord.startsWith(normLastWord) && normEntryWord !== normLastWord) {
          addSuggestion({
            text: entry.word,
            category: entry.category,
            source: 'dictionary',
            confidence: (entry.freq || 50) / 100
          });
        }
        if (results.length >= limit) break;
      }
    }
  }

  // 3. English Language Handling
  if (language === 'en') {
    const lowerBuffer = buffer.toLowerCase();

    // Check English phrases
    for (const phrase of ENGLISH_PHRASES) {
      if (phrase.toLowerCase().startsWith(lowerBuffer)) {
        addSuggestion({
          text: phrase,
          category: 'phrase',
          source: 'phrase',
          confidence: 0.9
        });
      }
    }

    // Check English frequent words
    const lastWord = lowerBuffer.split(/\s+/).pop() || '';
    if (lastWord.length > 0) {
      for (const word of ENGLISH_FREQUENT_WORDS) {
        if (word.startsWith(lastWord) && word !== lastWord) {
          addSuggestion({
            text: word,
            category: 'general',
            source: 'dictionary',
            confidence: 0.8
          });
        }
        if (results.length >= limit) break;
      }
    }
  }

  return results;
}
