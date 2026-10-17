// Arabic & Multilingual spell checker utility

export interface SpellCheckResult {
  word: string;
  suggestions: string[];
}

// Common Arabic spelling mistakes and typo corrections dictionary
const ARABIC_TYPO_MAP: Record<string, string[]> = {
  'انشاء': ['إنشاء'],
  'اللة': ['الله'],
  'هاذا': ['هذا'],
  'هاذه': ['هذه'],
  'لكن': ['لكن', 'ولكن'],
  'لاكن': ['لكن'],
  'مسؤل': ['مسؤول'],
  'شئ': ['شيء'],
  'دفء': ['دفء'],
  'بدء': ['بدء'],
  'مسئولية': ['مسؤولية'],
  'أمرءة': ['امرأة'],
  'امرءة': ['امرأة'],
  'رأيس': ['رئيس'],
  'فؤاد': ['فؤاد'],
  'هيأة': ['هيئة'],
  'خطاء': ['خطأ'],
  'مبتدء': ['مبتدئ'],
  'قارء': ['قارئ'],
  'شاطء': ['شاطئ'],
  'ضوء': ['ضوء'],
  'سوء': ['سوء'],
  'هدوء': ['هدوء'],
  'بيئة': ['بيئة'],
  'بريئ': ['بريء'],
  'أستمارة': ['استمارة'],
  'إستمارة': ['استمارة'],
  'أجتماع': ['اجتماع'],
  'إجتماع': ['اجتماع'],
  'أقتصاد': ['اقتصاد'],
  'إقتصاد': ['اقتصاد'],
  'أستخدام': ['استخدام'],
  'إستخدام': ['استخدام'],
  'أعلان': ['إعلان'],
  'اعلان': ['إعلان'],
  'انجاز': ['إنجاز'],
  'أنجاز': ['إنجاز'],
  'ارسال': ['إرسال'],
  'أرسال': ['إرسال'],
  'إمرأة': ['امرأة'],
  'أبن': ['ابن'],
  'إبن': ['ابن'],
  'أبنة': ['ابنة'],
  'إبنة': ['ابنة'],
  'أسم': ['اسم'],
  'إسم': ['اسم'],
  'اثنان': ['اثنان'],
  'إثنان': ['اثنان'],
  'أثنان': ['اثنان'],
  'اثنين': ['اثنين'],
  'إثنين': ['اثنين'],
  'أثنين': ['اثنين'],
};

export function checkTextSpelling(word: string): SpellCheckResult[] {
  if (!word || word.trim().length <= 1) return [];
  const cleanWord = word.trim().replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»]/g, '');
  if (!cleanWord) return [];

  // Direct dictionary lookup
  if (ARABIC_TYPO_MAP[cleanWord]) {
    return [{
      word: cleanWord,
      suggestions: ARABIC_TYPO_MAP[cleanWord]
    }];
  }

  // Common Hamza and Ta Marbuta checks
  const suggestions: string[] = [];

  // Check ending with haa instead of taa marbuta
  if (cleanWord.endsWith('ه') && cleanWord.length > 3) {
    // could be taa marbuta
    const candidate = cleanWord.slice(0, -1) + 'ة';
    if (['مدرسة', 'جامعة', 'مكتبة', 'شركة', 'وزارة', 'محكمة', 'قضية', 'جلسة', 'عريضة', 'وثيقة', 'لائحة', 'مذكرة', 'صفحة'].includes(candidate)) {
      suggestions.push(candidate);
    }
  }

  // Check ending with taa marbuta when it should be haa
  if (cleanWord.endsWith('ة') && ['وجه', 'فقه', 'شبه', 'منبه', 'سفيه', 'مكروه', 'جنيه', 'إله', 'الله'].includes(cleanWord.slice(0, -1) + 'ه')) {
    suggestions.push(cleanWord.slice(0, -1) + 'ه');
  }

  // Check alif with hamza vs wasl
  if (cleanWord.startsWith('ا') && cleanWord.length > 3) {
    if (['إلى', 'إن', 'أن', 'إذا', 'إذ', 'إلا', 'أو', 'أم', 'أي'].includes('أ' + cleanWord.slice(1)) || ['إلى', 'إن', 'أن', 'إذا', 'إذ', 'إلا'].includes('إ' + cleanWord.slice(1))) {
      // hamza suggestions
    }
  }

  if (suggestions.length > 0) {
    return [{
      word: cleanWord,
      suggestions: Array.from(new Set(suggestions))
    }];
  }

  return [];
}
