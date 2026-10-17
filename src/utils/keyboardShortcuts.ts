/**
 * إدارة وتخزين اختصارات النصوص والفقرات للكيبورد الملحق
 * Text Shortcuts & Snippets Manager matching Samsung Keyboard style
 */

import { ARABIC_COMMON_PARAGRAPHS, ArabicPhrase } from './arabicDictionary';

export interface TextShortcutItem {
  id: string;
  shortcut: string;
  fullText: string;
  category?: string;
  timestamp?: string;
}

const STORAGE_KEY = 'office_keyboard_text_shortcuts_v1';

export const DEFAULT_SHORTCUTS: TextShortcutItem[] = [
  {
    id: 'sc-1',
    shortcut: 'بسم',
    fullText: 'بسم الله الرحمن الرحيم',
    category: 'إسلامي ورسمي',
  },
  {
    id: 'sc-2',
    shortcut: 'سلام',
    fullText: 'السلام عليكم ورحمة الله وبركاته،، وبعد:',
    category: 'تحية',
  },
  {
    id: 'sc-3',
    shortcut: 'تحية',
    fullText: 'تحية طيبة وبعد،،،',
    category: 'تحية رسمية',
  },
  {
    id: 'sc-4',
    shortcut: 'صلعم',
    fullText: 'ﷺ',
    category: 'رموز تشريفية',
  },
  {
    id: 'sc-5',
    shortcut: 'طلب',
    fullText: 'بناءً على ما تقدم بيانه، نلتمس من عدالة المحكمة الموقرة الحكم بإلزام المدعى عليه بالمطلوبات والمصاريف القضائية وأتعاب المحاماة.',
    category: 'قضائي',
  },
  {
    id: 'sc-6',
    shortcut: 'تقدير',
    fullText: 'وتفضلوا بقبول فائق الاحترام والتقدير،،،',
    category: 'خاتمة رسمية',
  },
  {
    id: 'sc-7',
    shortcut: 'ايميل',
    fullText: 'example@samsung.com',
    category: 'بيانات اتصال',
  },
  {
    id: 'sc-8',
    shortcut: 'دعوى',
    fullText: 'صحيفة دعوى مدنية مستعجلة قيد النظر أمام عدالة المحكمة الموقرة',
    category: 'قضائي',
  },
  {
    id: 'sc-9',
    shortcut: 'اشارة',
    fullText: 'بالإشارة إلى الموضوع المذكور أعلاه، وإلى المعاملة المقيدة لديكم، نفيدكم بالآتي:',
    category: 'إداري',
  },
  {
    id: 'sc-10',
    shortcut: 'مملكة',
    fullText: 'المملكة العربية السعودية - وزارة العدل',
    category: 'رسمي حكومي',
  },
];

export function loadTextShortcuts(): TextShortcutItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading text shortcuts:', e);
  }
  return DEFAULT_SHORTCUTS;
}

export function saveTextShortcuts(shortcuts: TextShortcutItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
  } catch (e) {
    console.error('Error saving text shortcuts:', e);
  }
}
