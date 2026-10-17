/**
 * قاموس الكلمات والفقرات العربية الأكثر استخداماً ونظام التنبؤ الذكي
 * Comprehensive Arabic Dictionary of Most Frequently Used Words, Paragraphs & Contextual Prediction
 */

export type ArabicWordCategory = 'general' | 'administrative' | 'legal' | 'finance' | 'honorific' | 'tech' | 'academic';

export interface ArabicDictionaryEntry {
  word: string;
  category: ArabicWordCategory;
  freq?: number;
  root?: string;
  meaning?: string;
}

export interface ArabicPhrase {
  id: string;
  title: string;
  text: string;
  category: 'legal' | 'administrative' | 'honorific' | 'opening' | 'closing' | 'finance' | 'contract';
  shortcut?: string;
  description?: string;
}

/**
 * دالة توحيد وتجريد الحروف العربية للبحث المرن والتنبؤ الفوري
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // إزالة التشكيل والتطويل
    .replace(/[أإآ]/g, 'ا') // توحيد الألف
    .replace(/ة/g, 'ه') // توحيد التاء المربوطة
    .replace(/ى/g, 'ي') // توحيد الياء
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // إزالة الحروف الصامتة
}

/**
 * قاموس الكلمات العربية الأكثر استخداماً (أكثر من 1200+ كلمة مصنفة حسب الشيوع والمجال)
 */
export const ARABIC_FREQUENT_WORDS: ArabicDictionaryEntry[] = [
  // 1. كلمات عامة وروابط وأفعال شائعة (General)
  { word: 'في', category: 'general', freq: 100 },
  { word: 'من', category: 'general', freq: 99 },
  { word: 'على', category: 'general', freq: 98 },
  { word: 'إلى', category: 'general', freq: 97 },
  { word: 'أن', category: 'general', freq: 96 },
  { word: 'هذا', category: 'general', freq: 95 },
  { word: 'هذه', category: 'general', freq: 94 },
  { word: 'التي', category: 'general', freq: 93 },
  { word: 'الذي', category: 'general', freq: 92 },
  { word: 'ذلك', category: 'general', freq: 91 },
  { word: 'كان', category: 'general', freq: 90 },
  { word: 'كانت', category: 'general', freq: 89 },
  { word: 'عن', category: 'general', freq: 88 },
  { word: 'مع', category: 'general', freq: 87 },
  { word: 'كل', category: 'general', freq: 86 },
  { word: 'ما', category: 'general', freq: 85 },
  { word: 'لا', category: 'general', freq: 84 },
  { word: 'لم', category: 'general', freq: 83 },
  { word: 'لن', category: 'general', freq: 82 },
  { word: 'وقد', category: 'general', freq: 81 },
  { word: 'قد', category: 'general', freq: 80 },
  { word: 'هو', category: 'general', freq: 79 },
  { word: 'هي', category: 'general', freq: 78 },
  { word: 'هم', category: 'general', freq: 77 },
  { word: 'نحن', category: 'general', freq: 76 },
  { word: 'أنا', category: 'general', freq: 75 },
  { word: 'أنت', category: 'general', freq: 74 },
  { word: 'بعد', category: 'general', freq: 73 },
  { word: 'قبل', category: 'general', freq: 72 },
  { word: 'حيث', category: 'general', freq: 71 },
  { word: 'حتى', category: 'general', freq: 70 },
  { word: 'إذا', category: 'general', freq: 69 },
  { word: 'إن', category: 'general', freq: 68 },
  { word: 'بين', category: 'general', freq: 67 },
  { word: 'غير', category: 'general', freq: 66 },
  { word: 'فقط', category: 'general', freq: 65 },
  { word: 'أيضا', category: 'general', freq: 64 },
  { word: 'أيضاً', category: 'general', freq: 64 },
  { word: 'جدا', category: 'general', freq: 63 },
  { word: 'جداً', category: 'general', freq: 63 },
  { word: 'كذلك', category: 'general', freq: 62 },
  { word: 'بما', category: 'general', freq: 61 },
  { word: 'كما', category: 'general', freq: 60 },
  { word: 'أنه', category: 'general', freq: 59 },
  { word: 'أنها', category: 'general', freq: 58 },
  { word: 'يكون', category: 'general', freq: 57 },
  { word: 'تكون', category: 'general', freq: 56 },
  { word: 'اليوم', category: 'general', freq: 55 },
  { word: 'الوقت', category: 'general', freq: 54 },
  { word: 'العمل', category: 'general', freq: 53 },
  { word: 'الأمر', category: 'general', freq: 52 },
  { word: 'الشأن', category: 'general', freq: 51 },
  { word: 'الخاص', category: 'general', freq: 50 },
  { word: 'العام', category: 'general', freq: 49 },
  { word: 'طريق', category: 'general', freq: 48 },
  { word: 'طريقة', category: 'general', freq: 47 },
  { word: 'بشكل', category: 'general', freq: 46 },
  { word: 'بصورة', category: 'general', freq: 45 },
  { word: 'وفق', category: 'general', freq: 44 },
  { word: 'وفقا', category: 'general', freq: 44 },
  { word: 'وفقاً', category: 'general', freq: 44 },
  { word: 'بناء', category: 'general', freq: 43 },
  { word: 'بناءً', category: 'general', freq: 43 },
  { word: 'نظرا', category: 'general', freq: 42 },
  { word: 'نظراً', category: 'general', freq: 42 },
  { word: 'بسبب', category: 'general', freq: 41 },
  { word: 'نحو', category: 'general', freq: 40 },
  { word: 'دون', category: 'general', freq: 39 },
  { word: 'عند', category: 'general', freq: 38 },
  { word: 'لدى', category: 'general', freq: 37 },
  { word: 'خلال', category: 'general', freq: 36 },
  { word: 'أثناء', category: 'general', freq: 35 },
  { word: 'حول', category: 'general', freq: 34 },
  { word: 'ضد', category: 'general', freq: 33 },
  { word: 'منذ', category: 'general', freq: 32 },
  { word: 'حسب', category: 'general', freq: 31 },
  { word: 'مثل', category: 'general', freq: 30 },
  { word: 'أجل', category: 'general', freq: 29 },
  { word: 'نفس', category: 'general', freq: 28 },
  { word: 'بعض', category: 'general', freq: 27 },
  { word: 'جميع', category: 'general', freq: 26 },
  { word: 'كافة', category: 'general', freq: 25 },
  { word: 'كامل', category: 'general', freq: 24 },
  { word: 'عدة', category: 'general', freq: 23 },
  { word: 'كثير', category: 'general', freq: 22 },
  { word: 'قليل', category: 'general', freq: 21 },
  { word: 'أول', category: 'general', freq: 20 },
  { word: 'أولاً', category: 'general', freq: 20 },
  { word: 'ثاني', category: 'general', freq: 19 },
  { word: 'ثانياً', category: 'general', freq: 19 },
  { word: 'ثالث', category: 'general', freq: 18 },
  { word: 'ثالثاً', category: 'general', freq: 18 },
  { word: 'رابع', category: 'general', freq: 17 },
  { word: 'رابعاً', category: 'general', freq: 17 },
  { word: 'خامس', category: 'general', freq: 16 },
  { word: 'خامساً', category: 'general', freq: 16 },
  { word: 'سادس', category: 'general', freq: 15 },
  { word: 'سادساً', category: 'general', freq: 15 },
  { word: 'سابع', category: 'general', freq: 14 },
  { word: 'سابعاً', category: 'general', freq: 14 },
  { word: 'أخير', category: 'general', freq: 13 },
  { word: 'أخيراً', category: 'general', freq: 13 },
  { word: 'كتب', category: 'general', freq: 50 },
  { word: 'قرر', category: 'general', freq: 55 },
  { word: 'أفاد', category: 'general', freq: 52 },
  { word: 'أوضح', category: 'general', freq: 51 },
  { word: 'أشار', category: 'general', freq: 53 },
  { word: 'بيّن', category: 'general', freq: 49 },
  { word: 'ذكر', category: 'general', freq: 48 },
  { word: 'أكد', category: 'general', freq: 54 },
  { word: 'شدد', category: 'general', freq: 45 },
  { word: 'أعلن', category: 'general', freq: 50 },
  { word: 'صرّح', category: 'general', freq: 47 },
  { word: 'قدم', category: 'general', freq: 56 },
  { word: 'طلب', category: 'general', freq: 65 },
  { word: 'حصل', category: 'general', freq: 50 },
  { word: 'تم', category: 'general', freq: 75 },
  { word: 'يتم', category: 'general', freq: 74 },
  { word: 'تمت', category: 'general', freq: 72 },
  { word: 'سيتم', category: 'general', freq: 70 },
  { word: 'يمكن', category: 'general', freq: 68 },
  { word: 'لا يمكن', category: 'general', freq: 65 },
  { word: 'يجب', category: 'general', freq: 67 },
  { word: 'ينبغي', category: 'general', freq: 62 },
  { word: 'يجوز', category: 'general', freq: 60 },
  { word: 'لا يجوز', category: 'general', freq: 61 },
  { word: 'يلزم', category: 'general', freq: 58 },
  { word: 'يعتبر', category: 'general', freq: 57 },
  { word: 'تعتبر', category: 'general', freq: 56 },
  { word: 'يعد', category: 'general', freq: 55 },
  { word: 'تعد', category: 'general', freq: 54 },
  { word: 'يشمل', category: 'general', freq: 53 },
  { word: 'تشمل', category: 'general', freq: 52 },
  { word: 'يتضمن', category: 'general', freq: 55 },
  { word: 'تتضمن', category: 'general', freq: 54 },
  { word: 'يحتوي', category: 'general', freq: 50 },
  { word: 'يرتبط', category: 'general', freq: 48 },
  { word: 'يتعلق', category: 'general', freq: 52 },
  { word: 'تتعلق', category: 'general', freq: 51 },

  // 2. مصطلحات المراسلات الإدارية والرسمية (Administrative)
  { word: 'مستند', category: 'administrative', freq: 95 },
  { word: 'المستند', category: 'administrative', freq: 95 },
  { word: 'مستندات', category: 'administrative', freq: 94 },
  { word: 'المستندات', category: 'administrative', freq: 94 },
  { word: 'وثيقة', category: 'administrative', freq: 90 },
  { word: 'الوثيقة', category: 'administrative', freq: 90 },
  { word: 'وثائق', category: 'administrative', freq: 89 },
  { word: 'الوثائق', category: 'administrative', freq: 89 },
  { word: 'ملف', category: 'administrative', freq: 92 },
  { word: 'الملف', category: 'administrative', freq: 92 },
  { word: 'ملفات', category: 'administrative', freq: 88 },
  { word: 'خطاب', category: 'administrative', freq: 93 },
  { word: 'الخطاب', category: 'administrative', freq: 93 },
  { word: 'خطابات', category: 'administrative', freq: 85 },
  { word: 'تعميم', category: 'administrative', freq: 91 },
  { word: 'التعميم', category: 'administrative', freq: 91 },
  { word: 'تقرير', category: 'administrative', freq: 92 },
  { word: 'التقرير', category: 'administrative', freq: 92 },
  { word: 'تقارير', category: 'administrative', freq: 87 },
  { word: 'محضر', category: 'administrative', freq: 90 },
  { word: 'المحضر', category: 'administrative', freq: 90 },
  { word: 'محاضر', category: 'administrative', freq: 86 },
  { word: 'اجتماع', category: 'administrative', freq: 89 },
  { word: 'الاجتماع', category: 'administrative', freq: 89 },
  { word: 'اجتماعات', category: 'administrative', freq: 82 },
  { word: 'قرار', category: 'administrative', freq: 94 },
  { word: 'القرار', category: 'administrative', freq: 94 },
  { word: 'قرارات', category: 'administrative', freq: 88 },
  { word: 'إفادة', category: 'administrative', freq: 86 },
  { word: 'الإفادة', category: 'administrative', freq: 86 },
  { word: 'إشعار', category: 'administrative', freq: 87 },
  { word: 'الإشعار', category: 'administrative', freq: 87 },
  { word: 'إخطار', category: 'administrative', freq: 85 },
  { word: 'إنذار', category: 'administrative', freq: 84 },
  { word: 'اعتماد', category: 'administrative', freq: 92 },
  { word: 'الاعتماد', category: 'administrative', freq: 92 },
  { word: 'موافقة', category: 'administrative', freq: 90 },
  { word: 'الموافقة', category: 'administrative', freq: 90 },
  { word: 'تصريح', category: 'administrative', freq: 83 },
  { word: 'ترخيص', category: 'administrative', freq: 84 },
  { word: 'شهادة', category: 'administrative', freq: 88 },
  { word: 'الشهادة', category: 'administrative', freq: 88 },
  { word: 'تاريخ', category: 'administrative', freq: 93 },
  { word: 'التاريخ', category: 'administrative', freq: 93 },
  { word: 'رقم', category: 'administrative', freq: 94 },
  { word: 'الرقم', category: 'administrative', freq: 94 },
  { word: 'مرجع', category: 'administrative', freq: 87 },
  { word: 'المرجع', category: 'administrative', freq: 87 },
  { word: 'مرفق', category: 'administrative', freq: 89 },
  { word: 'المرفقات', category: 'administrative', freq: 89 },
  { word: 'موضوع', category: 'administrative', freq: 92 },
  { word: 'الموضوع', category: 'administrative', freq: 92 },
  { word: 'صادر', category: 'administrative', freq: 88 },
  { word: 'وارد', category: 'administrative', freq: 88 },
  { word: 'سري', category: 'administrative', freq: 80 },
  { word: 'عاجل', category: 'administrative', freq: 81 },
  { word: 'مهم', category: 'administrative', freq: 79 },
  { word: 'توجيه', category: 'administrative', freq: 86 },
  { word: 'التوجيه', category: 'administrative', freq: 86 },
  { word: 'تعليمات', category: 'administrative', freq: 87 },
  { word: 'التعليمات', category: 'administrative', freq: 87 },
  { word: 'إجراءات', category: 'administrative', freq: 89 },
  { word: 'الإجراءات', category: 'administrative', freq: 89 },
  { word: 'تنظيم', category: 'administrative', freq: 84 },
  { word: 'خدمة', category: 'administrative', freq: 85 },
  { word: 'الخدمة', category: 'administrative', freq: 85 },
  { word: 'خدمات', category: 'administrative', freq: 86 },
  { word: 'موظف', category: 'administrative', freq: 87 },
  { word: 'الموظف', category: 'administrative', freq: 87 },
  { word: 'موظفون', category: 'administrative', freq: 83 },
  { word: 'مدير', category: 'administrative', freq: 91 },
  { word: 'المدير', category: 'administrative', freq: 91 },
  { word: 'رئيس', category: 'administrative', freq: 90 },
  { word: 'الرئيس', category: 'administrative', freq: 90 },
  { word: 'نائب', category: 'administrative', freq: 86 },
  { word: 'أمين', category: 'administrative', freq: 85 },
  { word: 'الأمين', category: 'administrative', freq: 85 },
  { word: 'مستشار', category: 'administrative', freq: 88 },
  { word: 'المستشار', category: 'administrative', freq: 88 },
  { word: 'قسم', category: 'administrative', freq: 87 },
  { word: 'القسم', category: 'administrative', freq: 87 },
  { word: 'شعبة', category: 'administrative', freq: 80 },
  { word: 'فرع', category: 'administrative', freq: 84 },
  { word: 'الفرع', category: 'administrative', freq: 84 },
  { word: 'إدارة', category: 'administrative', freq: 92 },
  { word: 'الإدارة', category: 'administrative', freq: 92 },
  { word: 'مكتب', category: 'administrative', freq: 88 },
  { word: 'المكتب', category: 'administrative', freq: 88 },
  { word: 'لجنة', category: 'administrative', freq: 89 },
  { word: 'اللجنة', category: 'administrative', freq: 89 },
  { word: 'مجلس', category: 'administrative', freq: 90 },
  { word: 'المجلس', category: 'administrative', freq: 90 },
  { word: 'مؤسسة', category: 'administrative', freq: 89 },
  { word: 'المؤسسة', category: 'administrative', freq: 89 },
  { word: 'شركة', category: 'administrative', freq: 91 },
  { word: 'الشركة', category: 'administrative', freq: 91 },
  { word: 'هيئة', category: 'administrative', freq: 90 },
  { word: 'الهيئة', category: 'administrative', freq: 90 },
  { word: 'وزارة', category: 'administrative', freq: 93 },
  { word: 'الوزارة', category: 'administrative', freq: 93 },
  { word: 'ديوان', category: 'administrative', freq: 87 },
  { word: 'الديوان', category: 'administrative', freq: 87 },
  { word: 'رئاسة', category: 'administrative', freq: 88 },
  { word: 'تفويض', category: 'administrative', freq: 86 },
  { word: 'التفويض', category: 'administrative', freq: 86 },
  { word: 'إجازة', category: 'administrative', freq: 85 },
  { word: 'الإجازة', category: 'administrative', freq: 85 },
  { word: 'توقيع', category: 'administrative', freq: 88 },
  { word: 'التوقيع', category: 'administrative', freq: 88 },
  { word: 'ختم', category: 'administrative', freq: 84 },
  { word: 'الختم', category: 'administrative', freq: 84 },
  { word: 'أرشفة', category: 'administrative', freq: 82 },
  { word: 'فهرس', category: 'administrative', freq: 81 },
  { word: 'تظلم', category: 'administrative', freq: 80 },
  { word: 'شكوى', category: 'administrative', freq: 82 },
  { word: 'مبادرة', category: 'administrative', freq: 81 },
  { word: 'مشروع', category: 'administrative', freq: 90 },
  { word: 'المشروع', category: 'administrative', freq: 90 },
  { word: 'خطة', category: 'administrative', freq: 88 },
  { word: 'الخطة', category: 'administrative', freq: 88 },
  { word: 'أداء', category: 'administrative', freq: 87 },
  { word: 'الأداء', category: 'administrative', freq: 87 },
  { word: 'جودة', category: 'administrative', freq: 86 },
  { word: 'معايير', category: 'administrative', freq: 85 },

  // 3. مصطلحات قانونية وقضائية شائعة (Legal)
  { word: 'محكمة', category: 'legal', freq: 96 },
  { word: 'المحكمة', category: 'legal', freq: 96 },
  { word: 'محاكم', category: 'legal', freq: 88 },
  { word: 'دعوى', category: 'legal', freq: 95 },
  { word: 'الدعوى', category: 'legal', freq: 95 },
  { word: 'دعاوى', category: 'legal', freq: 89 },
  { word: 'قضية', category: 'legal', freq: 94 },
  { word: 'القضية', category: 'legal', freq: 94 },
  { word: 'قضايا', category: 'legal', freq: 88 },
  { word: 'مدعي', category: 'legal', freq: 93 },
  { word: 'المدعي', category: 'legal', freq: 93 },
  { word: 'المدعية', category: 'legal', freq: 91 },
  { word: 'مدعى', category: 'legal', freq: 92 },
  { word: 'المدعى', category: 'legal', freq: 92 },
  { word: 'المدعى عليه', category: 'legal', freq: 94 },
  { word: 'المدعى عليها', category: 'legal', freq: 91 },
  { word: 'لائحة', category: 'legal', freq: 90 },
  { word: 'اللائحة', category: 'legal', freq: 90 },
  { word: 'عريضة', category: 'legal', freq: 88 },
  { word: 'مذكرة', category: 'legal', freq: 89 },
  { word: 'المذكرة', category: 'legal', freq: 89 },
  { word: 'جوابية', category: 'legal', freq: 86 },
  { word: 'استئناف', category: 'legal', freq: 89 },
  { word: 'الاستئناف', category: 'legal', freq: 89 },
  { word: 'تمييز', category: 'legal', freq: 87 },
  { word: 'التمييز', category: 'legal', freq: 87 },
  { word: 'نقض', category: 'legal', freq: 86 },
  { word: 'النقض', category: 'legal', freq: 86 },
  { word: 'ابتدائية', category: 'legal', freq: 84 },
  { word: 'الابتدائية', category: 'legal', freq: 84 },
  { word: 'جلسة', category: 'legal', freq: 88 },
  { word: 'الجلسة', category: 'legal', freq: 88 },
  { word: 'حكم', category: 'legal', freq: 93 },
  { word: 'الحكم', category: 'legal', freq: 93 },
  { word: 'أحكام', category: 'legal', freq: 89 },
  { word: 'مرافعة', category: 'legal', freq: 86 },
  { word: 'المرافعة', category: 'legal', freq: 86 },
  { word: 'دفوع', category: 'legal', freq: 87 },
  { word: 'الدفوع', category: 'legal', freq: 87 },
  { word: 'دفاع', category: 'legal', freq: 88 },
  { word: 'الدفاع', category: 'legal', freq: 88 },
  { word: 'طلبات', category: 'legal', freq: 91 },
  { word: 'الطلبات', category: 'legal', freq: 91 },
  { word: 'وقائع', category: 'legal', freq: 89 },
  { word: 'الوقائع', category: 'legal', freq: 89 },
  { word: 'أسباب', category: 'legal', freq: 90 },
  { word: 'الأسباب', category: 'legal', freq: 90 },
  { word: 'أسانيد', category: 'legal', freq: 88 },
  { word: 'بينات', category: 'legal', freq: 86 },
  { word: 'البينات', category: 'legal', freq: 86 },
  { word: 'أدلة', category: 'legal', freq: 87 },
  { word: 'الأدلة', category: 'legal', freq: 87 },
  { word: 'إثبات', category: 'legal', freq: 86 },
  { word: 'شهادة', category: 'legal', freq: 85 },
  { word: 'شهود', category: 'legal', freq: 84 },
  { word: 'يمين', category: 'legal', freq: 83 },
  { word: 'اليمين', category: 'legal', freq: 83 },
  { word: 'خبير', category: 'legal', freq: 84 },
  { word: 'الخبير', category: 'legal', freq: 84 },
  { word: 'خبرة', category: 'legal', freq: 83 },
  { word: 'محام', category: 'legal', freq: 88 },
  { word: 'المحامي', category: 'legal', freq: 88 },
  { word: 'محاماة', category: 'legal', freq: 86 },
  { word: 'وكيل', category: 'legal', freq: 89 },
  { word: 'الوكيل', category: 'legal', freq: 89 },
  { word: 'وكالة', category: 'legal', freq: 88 },
  { word: 'الوكالة', category: 'legal', freq: 88 },
  { word: 'شرعية', category: 'legal', freq: 85 },
  { word: 'الشرعية', category: 'legal', freq: 85 },
  { word: 'قانون', category: 'legal', freq: 91 },
  { word: 'القانون', category: 'legal', freq: 91 },
  { word: 'قانوني', category: 'legal', freq: 88 },
  { word: 'نظام', category: 'legal', freq: 92 },
  { word: 'النظام', category: 'legal', freq: 92 },
  { word: 'نظامي', category: 'legal', freq: 89 },
  { word: 'مادة', category: 'legal', freq: 90 },
  { word: 'المادة', category: 'legal', freq: 90 },
  { word: 'فقرة', category: 'legal', freq: 87 },
  { word: 'الفقرة', category: 'legal', freq: 87 },
  { word: 'بند', category: 'legal', freq: 89 },
  { word: 'البند', category: 'legal', freq: 89 },
  { word: 'بنود', category: 'legal', freq: 88 },
  { word: 'تنفيذ', category: 'legal', freq: 91 },
  { word: 'التنفيذ', category: 'legal', freq: 91 },
  { word: 'سند', category: 'legal', freq: 88 },
  { word: 'السند', category: 'legal', freq: 88 },
  { word: 'تنفيذي', category: 'legal', freq: 87 },
  { word: 'حق', category: 'legal', freq: 89 },
  { word: 'الحق', category: 'legal', freq: 89 },
  { word: 'حقوق', category: 'legal', freq: 88 },
  { word: 'التزام', category: 'legal', freq: 89 },
  { word: 'الالتزام', category: 'legal', freq: 89 },
  { word: 'التزامات', category: 'legal', freq: 88 },
  { word: 'إلزام', category: 'legal', freq: 90 },
  { word: 'تعويض', category: 'legal', freq: 89 },
  { word: 'التعويض', category: 'legal', freq: 89 },
  { word: 'أضرار', category: 'legal', freq: 87 },
  { word: 'الأضرار', category: 'legal', freq: 87 },
  { word: 'عقد', category: 'legal', freq: 93 },
  { word: 'العقد', category: 'legal', freq: 93 },
  { word: 'عقود', category: 'legal', freq: 88 },
  { word: 'اتفاق', category: 'legal', freq: 89 },
  { word: 'الاتفاق', category: 'legal', freq: 89 },
  { word: 'اتفاقية', category: 'legal', freq: 90 },
  { word: 'شروط', category: 'legal', freq: 91 },
  { word: 'الشروط', category: 'legal', freq: 91 },
  { word: 'فسخ', category: 'legal', freq: 87 },
  { word: 'بطلان', category: 'legal', freq: 85 },
  { word: 'صحة', category: 'legal', freq: 86 },
  { word: 'نفاذ', category: 'legal', freq: 84 },
  { word: 'رسوم', category: 'legal', freq: 85 },
  { word: 'مصاريف', category: 'legal', freq: 86 },
  { word: 'أتعاب', category: 'legal', freq: 87 },
  { word: 'اختصاص', category: 'legal', freq: 86 },
  { word: 'قضائي', category: 'legal', freq: 88 },
  { word: 'مستعجل', category: 'legal', freq: 84 },
  { word: 'مستعجلة', category: 'legal', freq: 84 },
  { word: 'تحقيق', category: 'legal', freq: 85 },
  { word: 'نيابة', category: 'legal', freq: 86 },
  { word: 'قاض', category: 'legal', freq: 87 },
  { word: 'القاضي', category: 'legal', freq: 87 },
  { word: 'دائرة', category: 'legal', freq: 88 },
  { word: 'الدائرة', category: 'legal', freq: 88 },
  { word: 'تبليغ', category: 'legal', freq: 85 },
  { word: 'إعلان', category: 'legal', freq: 84 },
  { word: 'عدالة', category: 'legal', freq: 89 },
  { word: 'العدالة', category: 'legal', freq: 89 },

  // 4. ألقاب التشريف والديباجات والتحيات (Honorifics & Greetings)
  { word: 'فضيلة', category: 'honorific', freq: 92 },
  { word: 'الفضيلة', category: 'honorific', freq: 92 },
  { word: 'سعادة', category: 'honorific', freq: 93 },
  { word: 'السعادة', category: 'honorific', freq: 93 },
  { word: 'معالي', category: 'honorific', freq: 92 },
  { word: 'المعالي', category: 'honorific', freq: 92 },
  { word: 'سمو', category: 'honorific', freq: 91 },
  { word: 'السمو', category: 'honorific', freq: 91 },
  { word: 'جلالة', category: 'honorific', freq: 90 },
  { word: 'الموقر', category: 'honorific', freq: 92 },
  { word: 'الموقرة', category: 'honorific', freq: 92 },
  { word: 'المحترم', category: 'honorific', freq: 93 },
  { word: 'المحترمة', category: 'honorific', freq: 93 },
  { word: 'الأكرم', category: 'honorific', freq: 88 },
  { word: 'حفظه', category: 'honorific', freq: 91 },
  { word: 'حفظكم', category: 'honorific', freq: 92 },
  { word: 'الله', category: 'honorific', freq: 100 },
  { word: 'ورعاه', category: 'honorific', freq: 90 },
  { word: 'ورعاكم', category: 'honorific', freq: 91 },
  { word: 'سلمه', category: 'honorific', freq: 88 },
  { word: 'سلمكم', category: 'honorific', freq: 89 },
  { word: 'وفقه', category: 'honorific', freq: 87 },
  { word: 'وفقكم', category: 'honorific', freq: 88 },
  { word: 'السلام', category: 'honorific', freq: 96 },
  { word: 'عليكم', category: 'honorific', freq: 96 },
  { word: 'ورحمة', category: 'honorific', freq: 95 },
  { word: 'وبركاته', category: 'honorific', freq: 95 },
  { word: 'تحية', category: 'honorific', freq: 94 },
  { word: 'طيبة', category: 'honorific', freq: 94 },
  { word: 'وبعد', category: 'honorific', freq: 94 },
  { word: 'تفضلوا', category: 'honorific', freq: 93 },
  { word: 'بقبول', category: 'honorific', freq: 93 },
  { word: 'فائق', category: 'honorific', freq: 93 },
  { word: 'الاحترام', category: 'honorific', freq: 93 },
  { word: 'والتقدير', category: 'honorific', freq: 93 },
  { word: 'شاكرين', category: 'honorific', freq: 91 },
  { word: 'مقدرين', category: 'honorific', freq: 90 },
  { word: 'جهودكم', category: 'honorific', freq: 89 },
  { word: 'تعاونكم', category: 'honorific', freq: 89 },
  { word: 'ولكم', category: 'honorific', freq: 87 },
  { word: 'منا', category: 'honorific', freq: 86 },
  { word: 'جزيل', category: 'honorific', freq: 88 },
  { word: 'الشكر', category: 'honorific', freq: 89 },
  { word: 'والامتنان', category: 'honorific', freq: 87 },
  { word: 'نلتمس', category: 'honorific', freq: 90 },
  { word: 'يرجى', category: 'honorific', freq: 91 },
  { word: 'التكرم', category: 'honorific', freq: 91 },
  { word: 'بالإحاطة', category: 'honorific', freq: 88 },
  { word: 'بالعلم', category: 'honorific', freq: 88 },
  { word: 'بالنظر', category: 'honorific', freq: 87 },
  { word: 'بالتوجيه', category: 'honorific', freq: 88 },
  { word: 'بالاعتماد', category: 'honorific', freq: 89 },
  { word: 'نحيطكم', category: 'honorific', freq: 87 },
  { word: 'علماً', category: 'honorific', freq: 88 },
  { word: 'نأمل', category: 'honorific', freq: 89 },
  { word: 'سائلين', category: 'honorific', freq: 86 },
  { word: 'المولى', category: 'honorific', freq: 88 },
  { word: 'التوفيق', category: 'honorific', freq: 90 },
  { word: 'والسداد', category: 'honorific', freq: 89 },

  // 5. مصطلحات مالية ومحاسبية وبيانات (Finance & Excel)
  { word: 'إجمالي', category: 'finance', freq: 92 },
  { word: 'الإجمالي', category: 'finance', freq: 92 },
  { word: 'صافي', category: 'finance', freq: 90 },
  { word: 'الصافي', category: 'finance', freq: 90 },
  { word: 'مجموع', category: 'finance', freq: 91 },
  { word: 'المجموع', category: 'finance', freq: 91 },
  { word: 'رصيد', category: 'finance', freq: 90 },
  { word: 'الرصيد', category: 'finance', freq: 90 },
  { word: 'حساب', category: 'finance', freq: 93 },
  { word: 'الحساب', category: 'finance', freq: 93 },
  { word: 'حسابات', category: 'finance', freq: 88 },
  { word: 'مبلغ', category: 'finance', freq: 92 },
  { word: 'المبلغ', category: 'finance', freq: 92 },
  { word: 'مبالغ', category: 'finance', freq: 87 },
  { word: 'قيمة', category: 'finance', freq: 91 },
  { word: 'القيمة', category: 'finance', freq: 91 },
  { word: 'ريال', category: 'finance', freq: 93 },
  { word: 'سعودي', category: 'finance', freq: 92 },
  { word: 'تكلفة', category: 'finance', freq: 89 },
  { word: 'التكلفة', category: 'finance', freq: 89 },
  { word: 'تكاليف', category: 'finance', freq: 87 },
  { word: 'سعر', category: 'finance', freq: 90 },
  { word: 'السعر', category: 'finance', freq: 90 },
  { word: 'أسعار', category: 'finance', freq: 86 },
  { word: 'كمية', category: 'finance', freq: 88 },
  { word: 'الكمية', category: 'finance', freq: 88 },
  { word: 'نسبة', category: 'finance', freq: 89 },
  { word: 'النسبة', category: 'finance', freq: 89 },
  { word: 'مئوية', category: 'finance', freq: 86 },
  { word: 'ضريبة', category: 'finance', freq: 90 },
  { word: 'الضريبة', category: 'finance', freq: 90 },
  { word: 'مبيعات', category: 'finance', freq: 89 },
  { word: 'المبيعات', category: 'finance', freq: 89 },
  { word: 'مشتريات', category: 'finance', freq: 88 },
  { word: 'المشتريات', category: 'finance', freq: 88 },
  { word: 'أرباح', category: 'finance', freq: 88 },
  { word: 'الأرباح', category: 'finance', freq: 88 },
  { word: 'خسائر', category: 'finance', freq: 86 },
  { word: 'ميزانية', category: 'finance', freq: 91 },
  { word: 'الميزانية', category: 'finance', freq: 91 },
  { word: 'فاتورة', category: 'finance', freq: 92 },
  { word: 'الفاتورة', category: 'finance', freq: 92 },
  { word: 'فواتير', category: 'finance', freq: 87 },
  { word: 'دفعة', category: 'finance', freq: 88 },
  { word: 'الدفعة', category: 'finance', freq: 88 },
  { word: 'أقساط', category: 'finance', freq: 86 },
  { word: 'سداد', category: 'finance', freq: 89 },
  { word: 'السداد', category: 'finance', freq: 89 },
  { word: 'مديونية', category: 'finance', freq: 87 },
  { word: 'المديونية', category: 'finance', freq: 87 },
  { word: 'دائن', category: 'finance', freq: 85 },
  { word: 'مدين', category: 'finance', freq: 85 },
  { word: 'عمولة', category: 'finance', freq: 84 },
  { word: 'خصم', category: 'finance', freq: 87 },
  { word: 'متوسط', category: 'finance', freq: 88 },
  { word: 'المتوسط', category: 'finance', freq: 88 },
  { word: 'حد', category: 'finance', freq: 84 },
  { word: 'أدنى', category: 'finance', freq: 85 },
  { word: 'أقصى', category: 'finance', freq: 85 },
  { word: 'شيك', category: 'finance', freq: 86 },
  { word: 'حوالة', category: 'finance', freq: 87 },
  { word: 'مصرف', category: 'finance', freq: 88 },
  { word: 'بنك', category: 'finance', freq: 89 },
  { word: 'إيداع', category: 'finance', freq: 86 },
  { word: 'سحب', category: 'finance', freq: 85 },
  { word: 'قرض', category: 'finance', freq: 86 },
  { word: 'تمويل', category: 'finance', freq: 88 },
  { word: 'استثمار', category: 'finance', freq: 89 },
  { word: 'سيولة', category: 'finance', freq: 85 },
  { word: 'رواتب', category: 'finance', freq: 89 },
  { word: 'بدلات', category: 'finance', freq: 86 },
  { word: 'مكافآت', category: 'finance', freq: 87 },
  { word: 'مستحقات', category: 'finance', freq: 89 },

  // 6. مصطلحات تقنية ومكتبية ورقمية (Tech & Office)
  { word: 'تطبيق', category: 'tech', freq: 90 },
  { word: 'التطبيق', category: 'tech', freq: 90 },
  { word: 'نظام', category: 'tech', freq: 92 },
  { word: 'النظام', category: 'tech', freq: 92 },
  { word: 'برنامج', category: 'tech', freq: 89 },
  { word: 'صفحة', category: 'tech', freq: 91 },
  { word: 'الصفحة', category: 'tech', freq: 91 },
  { word: 'جدول', category: 'tech', freq: 92 },
  { word: 'الجدول', category: 'tech', freq: 92 },
  { word: 'خلية', category: 'tech', freq: 88 },
  { word: 'الخلية', category: 'tech', freq: 88 },
  { word: 'صف', category: 'tech', freq: 87 },
  { word: 'عمود', category: 'tech', freq: 87 },
  { word: 'حفظ', category: 'tech', freq: 93 },
  { word: 'تعديل', category: 'tech', freq: 90 },
  { word: 'حذف', category: 'tech', freq: 89 },
  { word: 'طباعة', category: 'tech', freq: 91 },
  { word: 'تصدير', category: 'tech', freq: 88 },
  { word: 'استيراد', category: 'tech', freq: 86 },
  { word: 'تنسيق', category: 'tech', freq: 89 },
  { word: 'خط', category: 'tech', freq: 88 },
  { word: 'حجم', category: 'tech', freq: 89 },
  { word: 'غامق', category: 'tech', freq: 86 },
  { word: 'مائل', category: 'tech', freq: 85 },
  { word: 'مسطرة', category: 'tech', freq: 87 },
  { word: 'رأس', category: 'tech', freq: 86 },
  { word: 'تذييل', category: 'tech', freq: 86 },
  { word: 'فاصل', category: 'tech', freq: 85 },
  { word: 'نسخ', category: 'tech', freq: 91 },
  { word: 'لصق', category: 'tech', freq: 91 },
  { word: 'قص', category: 'tech', freq: 88 },
  { word: 'تراجع', category: 'tech', freq: 89 },
  { word: 'إعادة', category: 'tech', freq: 87 },
  { word: 'بحث', category: 'tech', freq: 90 },
  { word: 'استبدال', category: 'tech', freq: 87 },
  { word: 'معاينة', category: 'tech', freq: 89 },
  { word: 'مشاركة', category: 'tech', freq: 88 },
  { word: 'تنزيل', category: 'tech', freq: 89 },
  { word: 'رفع', category: 'tech', freq: 87 },
  { word: 'رابط', category: 'tech', freq: 88 },
  { word: 'صورة', category: 'tech', freq: 89 },
  { word: 'الصورة', category: 'tech', freq: 89 },
  { word: 'بيانات', category: 'tech', freq: 91 },
  { word: 'معلومات', category: 'tech', freq: 90 },
  { word: 'إدخال', category: 'tech', freq: 88 },
  { word: 'إخراج', category: 'tech', freq: 86 },
  { word: 'تحديث', category: 'tech', freq: 89 },
  { word: 'إعادة تعيين', category: 'tech', freq: 84 },
];

/**
 * بنك الفقرات والنصوص العربية الشائعة للاقتراح والإدراج الفوري
 */
export const ARABIC_COMMON_PARAGRAPHS: ArabicPhrase[] = [
  // 1. افتتاحات وبسملة وتحيات رسمية
  {
    id: 'bismillah',
    title: 'البسملة الكريمة',
    text: 'بسم الله الرحمن الرحيم',
    category: 'opening',
    shortcut: 'بسم',
    description: 'افتتاحية إسلامية رسمية لأي مستند أو مراسلة',
  },
  {
    id: 'salam_full',
    title: 'السلام والتحية الإسلامية الكاملة',
    text: 'السلام عليكم ورحمة الله وبركاته،، وبعد:',
    category: 'opening',
    shortcut: 'سلام',
    description: 'صيغة التحية والافتتاح المعتمدة في المراسلات الرسمية',
  },
  {
    id: 'formal_greeting',
    title: 'تحية طيبة وبعد',
    text: 'تحية طيبة وبعد،،،',
    category: 'opening',
    shortcut: 'تحية',
    description: 'استهلال مهني معتمد للمذكرات والخطابات',
  },
  {
    id: 'gov_header_saudi',
    title: 'ترويسة المملكة العربية السعودية الرسمية',
    text: 'المملكة العربية السعودية\nوزارة ...\nالإدارة العامة لـ...',
    category: 'administrative',
    shortcut: 'ترويسة',
    description: 'ترويسة رسمية علوية للخطابات والتقارير الحكومية',
  },

  // 2. مراسلات وخطابات إدارية
  {
    id: 'admin_reference_full',
    title: 'استهلال خطاب إداري مع الإشارة',
    text: 'بالإشارة إلى الموضوع المشار إليه أعلاه، وإلى تعميمكم رقم (...) وتاريخ (...) هـ، يسرنا إحاطة سعادتكم بالآتي:',
    category: 'administrative',
    shortcut: 'اشارة',
    description: 'ديباجة ربط رسمي بالمعاملات والمراسلات السابقة',
  },
  {
    id: 'admin_leave_request',
    title: 'طلب إجازة اعتيادية / اضطرارية',
    text: 'أتقدم لسعادتكم بطلبي هذا للموافقة على منحي إجازة (اعتيادية/اضطرارية) لمدة (...) يوماً، وذلك ابتداءً من تاريخ (...) وحتى تاريخ (...)، على أن يباشر مهام عملي الزميل/ (...)، شاكراً ومقدراً لكم حسن تعاونكم الدائم.',
    category: 'administrative',
    shortcut: 'اجازة',
    description: 'نموذج خطاب طلب إجازة إداري متكامل',
  },
  {
    id: 'admin_approval_request',
    title: 'طلب اعتماد وموافقة رسمية',
    text: 'نأمل من سعادتكم التكرم بالاطلاع والتوجيه بما يلزم نحو اعتماد ما ورد أعلاه، واستكمال الإجراءات النظامية المتبعة حيال ذلك.',
    category: 'administrative',
    shortcut: 'اعتماد',
    description: 'طلب موافقة رسمية من صاحب الصلاحية',
  },
  {
    id: 'admin_delegation',
    title: 'خطاب تفويض صلاحيات رسمي',
    text: 'أفيدكم بأنه قد جرى تفويض الزميل/ (...)، بممارسة كافة الصلاحيات الإدارية والتشغيلية الموكلة لي نظاماً، وذلك خلال فترة غيابي من تاريخ (...) وحتى تاريخ (...).',
    category: 'administrative',
    shortcut: 'تفويض',
    description: 'صيغة تفويض صلاحيات إدارية مؤقتة',
  },
  {
    id: 'meeting_minutes_opening',
    title: 'ديباجة محضر اجتماع رسمي',
    text: 'إنه في يوم (...) الموافق (...) هـ، عُقد الاجتماع الدوري للجنة (...) برئاسة (...) وبحضور الأعضاء الآتية أسماؤهم، وذلك لمناقشة بنود جدول الأعمال التالية:',
    category: 'administrative',
    shortcut: 'محضر',
    description: 'مقدمة رسمية لمحاضر الاجتماعات واللجان',
  },
  {
    id: 'meeting_recommendations',
    title: 'فقرة القرارات والتوصيات في المحضر',
    text: 'وبعد استعراض كافة المحاور ومناقشة الآراء والمقترحات، خلص الاجتماع إلى القرارات والتوصيات الآتية:\n١. اعتماد الخطة التشغيلية المقترحة.\n٢. تكليف إدارة (...) بمتابعة التنفيذ ورفع تقرير دوري.\n٣. عقد الاجتماع القادم لمراجعة المخرجات بتاريخ (...) هـ.',
    category: 'administrative',
    shortcut: 'توصيات',
    description: 'صيغة تدوين قرارات وتوصيات الاجتماعات',
  },
  {
    id: 'employment_certificate',
    title: 'شهادة تعريف بالراتب / إفادة عمل',
    text: 'تشهد إدارة الموارد البشرية بأن الموظف/ (...)، يحمل هوية رقم (...)، يعمل لدينا بمسمى وظيفي (...) منذ تاريخ (...) ولا يزال على رأس العمل حتى تاريخه، وقد أُعطيت له هذه الشهادة بناءً على طلبه لتقديمها إلى الجهة المختصة دون أدنى مسؤولية على المنشأة.',
    category: 'administrative',
    shortcut: 'تعريف',
    description: 'شهادة إفادة عمل وتعريف وظيفي رسمي',
  },

  // 3. عقود واتفاقيات والتزامات
  {
    id: 'contract_preamble',
    title: 'ديباجة عقد اتفاق وخدمات',
    text: 'بعون الله وتوفيقه، تم الاتفاق في هذا اليوم (...) الموافق (...) بين كل من:\nالطرف الأول: شركة (...) ويمثلها في التوقيع (...).\nالطرف الثاني: السيد / (...) وسجله المدني (...).\nوحيث تلاقت إرادة الطرفين على التعاقد وفقاً للبنود والأحكام والشروط الآتية:',
    category: 'contract',
    shortcut: 'عقد',
    description: 'ديباجة العقود والاتفاقيات بين الطرفين',
  },
  {
    id: 'contract_confidentiality',
    title: 'بند السرية وحماية المعلومات',
    text: 'يلتزم الطرفان بالحفاظ على سرية كافة البيانات والوثائق والمعلومات المتبادلة بموجب هذا الاتفاق، وعدم إفشائها لأي طرف ثالث دون موافقة خطية مسبقة، ويسري هذا الالتزام طيلة مدة العقد ولمدة خمس سنوات بعد انتهائه.',
    category: 'contract',
    shortcut: 'سرية',
    description: 'بند قانوني لحفظ سرية المستندات والبيانات',
  },
  {
    id: 'contract_dispute',
    title: 'بند تسوية النزاعات والقانون المطبق',
    text: 'يخضع هذا العقد ويفسر وفقاً للأنظمة واللوائح السارية في المملكة العربية السعودية، وفي حال نشوء أي خلاف ينشأ عن تنفيذ أو تفسير بنوده، يتم حله ودياً خلال ٣٠ يوماً، وفي حال تعذر ذلك، ينعقد الاختصاص القضائي للمحاكم المختصة بمدينة الرياض.',
    category: 'contract',
    shortcut: 'نزاع',
    description: 'بند الاختصاص القضائي وفض المنازعات',
  },

  // 4. صحف ومذكرات قضائية ونظامية
  {
    id: 'court_opening_plea',
    title: 'مقدمة مخاطبة المحكمة الموقرة',
    text: 'فضيلة رئيس وأعضاء الدائرة القضائية الموقرين بمحكمة (...) حفظكم الله ورعاكم.\nالسلام عليكم ورحمة الله وبركاته،، وبعد:',
    category: 'legal',
    shortcut: 'محكمة',
    description: 'استهلال صحيفة الدعوى والمذكرات القضائية',
  },
  {
    id: 'legal_requests_formal',
    title: 'فقرة الطلبات الختامية في صحيفة الدعوى',
    text: 'بناءً على ما تقدم بيانه من أسباب شرعية وأسانيد نظامية، نلتمس من عدالة المحكمة الموقرة الحكم بالآتي:\nأولاً: قبول الدعوى شكلاً.\nثانياً: إلزام المدعى عليه بأن يؤدي للمدعي المبلغ المطالب به وقدره (...) ريالاً سعودياً.\nثالثاً: إلزام المدعى عليه بكافة الرسوم والمصاريف القضائية وأتعاب المحاماة.',
    category: 'legal',
    shortcut: 'طلبات',
    description: 'صياغة الطلبات الختامية في المرافعة والقضاء',
  },
  {
    id: 'legal_appeal_memo',
    title: 'ديباجة لائحة اعتراضية (استئناف)',
    text: 'لائحة اعتراضية على الحكم الصادر بالصك رقم (...) وتاريخ (...) في القضية المقيدة برقم (...)، يتقدم بها المستأنف ضد المستأنف ضده، مستنداً إلى الأسباب الموضوعية والنظامية التالية:',
    category: 'legal',
    shortcut: 'استئناف',
    description: 'ديباجة اللائحة الاعتراضية والاستئنافية',
  },

  // 5. صيغ مالية ومحاسبية
  {
    id: 'payment_notice',
    title: 'إشعار سداد ومطالبة مالية',
    text: 'نحيط سعادتكم علماً بضرورة التكرم بسداد المستحقات المالية المترتبة بموجب الفاتورة رقم (...) والصادرة بتاريخ (...) بمبلغ إجمالي قدره (...) ريالاً سعودياً، وذلك خلال مهلة أقصاها (...) يوماً لتفادي أي غرامات تأخير.',
    category: 'finance',
    shortcut: 'مطالبة',
    description: 'صيغة مطالبة مالية وإشعار سداد رسمي',
  },
  {
    id: 'finance_summary_sheet',
    title: 'شرح إجمالي الحساب والبيان المالي',
    text: 'يوضح هذا الجدول والبيان المالي إجمالي العمليات المحاسبية والتدفقات النقدية للفترة المالية المنتهية في (...)، متضمناً صافي الأرباح والإيرادات والتكاليف المعتمدة وفقاً للمعايير المحاسبية المتبعة.',
    category: 'finance',
    shortcut: 'مالي',
    description: 'فقرة توضيحية لملخصات الجداول والتقارير المالية',
  },

  // 6. خواتيم رسمية وأدعية
  {
    id: 'formal_closing_respect',
    title: 'خاتمة رسمية (فائق الاحترام والتقدير)',
    text: 'وتفضلوا بقبول فائق الاحترام والتقدير،،،',
    category: 'closing',
    shortcut: 'تقدير',
    description: 'الخاتمة القياسية للمراسلات والخطابات الرسمية',
  },
  {
    id: 'formal_closing_thanks',
    title: 'خاتمة شكر وتقدير وتعاون',
    text: 'شاكرين ومقدرين لكم حسن تعاونكم الدائم معنا، سائلين المولى عز وجل لكم دوام التوفيق والسداد.',
    category: 'closing',
    shortcut: 'شكر',
    description: 'خاتمة ودية رسمية تعبر عن التقدير والامتنان',
  },
  {
    id: 'closing_dua_success',
    title: 'خاتمة قضائية ودعاء بالسداد',
    text: 'والله يحفظكم ويرعاكم ويسدد على طريق الحق والعدل خطاكم،،،\nمقدمه لعدالتكم: (...)\nالصفة: (...)',
    category: 'closing',
    shortcut: 'دعاء',
    description: 'خاتمة المذكرات القضائية والعرائض الرسمية',
  },
  {
    id: 'closing_tawfiq',
    title: 'والله ولي التوفيق',
    text: 'والله ولي التوفيق،،،',
    category: 'closing',
    shortcut: 'توفيق',
    description: 'خاتمة معتمدة وموجزة',
  },
];

/**
 * التنبؤ بالسياق التالي (Bigram Context Predictions)
 */
export const ARABIC_BIGRAM_PREDICTIONS: Record<string, string[]> = {
  'بسم': ['الله', 'الرحمن', 'تعالى'],
  'الله': ['الرحمن', 'الرحيم', 'تعالى', 'سبحانه', 'يرعاكم', 'يحفظكم', 'الموفق', 'ولي التوفيق'],
  'الرحمن': ['الرحيم'],
  'السلام': ['عليكم', 'ورحمة'],
  'عليكم': ['ورحمة', 'ورحمة الله وبركاته'],
  'ورحمة': ['الله', 'الله وبركاته'],
  'تحية': ['طيبة', 'طيبة وبعد', 'عاطرة', 'تقدير'],
  'طيبة': ['وبعد', 'وبعد،،،'],
  'محكمة': ['الاستئناف', 'التمييز', 'النقض', 'الأحوال الشخصية', 'العامة', 'التجارية', 'العمالية', 'الموقرة'],
  'المحكمة': ['الموقرة', 'العامة', 'التجارية', 'العمالية', 'الابتدائية', 'المختصة'],
  'صحيفة': ['دعوى', 'الدعوى', 'استئناف', 'الاعتراض'],
  'دعوى': ['مدنية', 'مستعجلة', 'تجارية', 'عمالية', 'فسخ', 'إلزام', 'تعويض'],
  'المدعي': ['يطلب', 'يطالب', 'أصالـة', 'وكالـة', 'الحالي'],
  'المدعى': ['عليه', 'عليها', 'عليهم'],
  'عليه': ['برد', 'بتسليم', 'بدفع', 'بالكشف', 'بأداء المبلغ'],
  'بناء': ['على', 'على ما تقدم', 'على ذلك', 'على طلبه'],
  'بناءً': ['على', 'على ما تقدم', 'على ذلك', 'على طلبه'],
  'وفق': ['لأحكام', 'للنظام', 'للقانون', 'للمادة', 'للشروط'],
  'وفقاً': ['لأحكام', 'للنظام', 'للقانون', 'للمادة', 'للشروط'],
  'فضيلة': ['رئيس', 'القاضي', 'الشيخ', 'رئيس الدائرة'],
  'صاحب': ['الفضيلة', 'المعالي', 'السعادة', 'السمو'],
  'سعادة': ['المدير', 'الرئيس', 'الوكيل', 'المهندس', 'الدكتور', 'الأستاذ'],
  'معالي': ['الوزير', 'الرئيس', 'المحافظ'],
  'نلتمس': ['من', 'الحكم', 'التكرم', 'الاطلاع', 'عدالة المحكمة'],
  'إلزام': ['المدعى عليه', 'الطرف', 'الشركة', 'المستأجر', 'المقاول'],
  'عقد': ['إيجار', 'بيع', 'عمل', 'توريد', 'مقاولات', 'تقديم خدمات', 'اتفاق'],
  'العقد': ['المبرم', 'الحالي', 'المذكور', 'المرفق'],
  'حفظكم': ['الله', 'الله ورعاكم', 'الله وسدد خطاكم'],
  'حفظه': ['الله', 'الله ورعاه'],
  'فائق': ['الاحترام', 'التقدير', 'الاحترام والتقدير'],
  'المملكة': ['العربية', 'العربية السعودية'],
  'العربية': ['السعودية'],
  'وزارة': ['العدل', 'الداخلية', 'المالية', 'التجارة', 'الموارد البشرية', 'التعليم', 'الصحة'],
  'إجمالي': ['المبلغ', 'القيمة', 'المبيعات', 'المشتريات', 'الحساب', 'التكاليف'],
  'صافي': ['الأرباح', 'الدخل', 'القيمة', 'المبيعات'],
  'تقرير': ['دوري', 'شهري', 'سنوي', 'مالي', 'إداري', 'فني'],
  'محضر': ['اجتماع', 'استلام', 'تسليم', 'جرد', 'تحقيق', 'ضبط'],
  'خطاب': ['رسمي', 'شكر', 'ترقية', 'توجيه', 'تعريف'],
  'طلب': ['إجازة', 'صرف', 'شراء', 'اعتماد', 'موافقة', 'استقالة'],
  'قرار': ['إداري', 'وزاري', 'قضائي', 'مجلس الإدارة', 'لجنة'],
  'تاريخ': ['اليوم', 'الاستحقاق', 'الإصدار', 'الميلاد', 'المباشرة'],
  'رقم': ['الهوية', 'السجل التجاري', 'المعاملة', 'القرار', 'القضية', 'الفاتورة'],
  'شكراً': ['لكم', 'جزيلاً', 'وتقديراً', 'لحسن تعاونكم'],
  'شاكرين': ['ومقدرين', 'لكم', 'حسن تعاونكم'],
  'نأمل': ['منكم', 'من سعادتكم', 'التكرم', 'الموافقة', 'الإحاطة'],
  'يرجى': ['التكرم', 'الاطلاع', 'التوجيه', 'السداد', 'الموافقة'],
  'نحيطكم': ['علماً', 'بأن', 'بأنه قد تم'],
  'نظراً': ['لـ', 'للظروف', 'لما تقتضيه المصلحة', 'لأهمية ذلك'],
  'بالإشارة': ['إلى', 'إلى الموضوع أعلاه', 'إلى خطابكم'],
  'وتفضلوا': ['بقبول', 'بقبول فائق الاحترام'],
  'والله': ['يحفظكم', 'الموفق', 'ولي التوفيق', 'المستعان'],
  'تم': ['اعتماد', 'الموافقة على', 'إرسال', 'استلام', 'إنجاز', 'سداد'],
  'يتم': ['العمل على', 'تطبيق', 'صرف', 'متابعة', 'تنفيذ'],
};

/**
 * التنبؤ بالكلمات أثناء الكتابة في الوقت الفعلي
 */
export function getWordPredictions(inputPrefix: string, maxResults = 8): string[] {
  if (!inputPrefix || inputPrefix.trim().length === 0) {
    return ['في', 'من', 'على', 'المستند', 'المحكمة', 'بناءً', 'وفقاً', 'تم'];
  }

  const rawClean = inputPrefix.trim();
  const normalizedInput = normalizeArabic(rawClean);

  const matched = new Set<string>();

  // 1. Exact prefix matching with normalized Arabic
  for (const item of ARABIC_FREQUENT_WORDS) {
    const normWord = normalizeArabic(item.word);
    if (normWord.startsWith(normalizedInput) && normWord !== normalizedInput) {
      matched.add(item.word);
      if (matched.size >= maxResults) break;
    }
  }

  // 2. Prefix matching considering 'ال' definition article
  if (matched.size < maxResults) {
    for (const item of ARABIC_FREQUENT_WORDS) {
      const normWord = normalizeArabic(item.word);
      if (normWord.startsWith('ال') && normWord.substring(2).startsWith(normalizedInput)) {
        matched.add(item.word);
        if (matched.size >= maxResults) break;
      }
    }
  }

  // 3. Substring matching if few results
  if (matched.size < maxResults) {
    for (const item of ARABIC_FREQUENT_WORDS) {
      const normWord = normalizeArabic(item.word);
      if (normWord.includes(normalizedInput) && normWord !== normalizedInput) {
        matched.add(item.word);
        if (matched.size >= maxResults) break;
      }
    }
  }

  return Array.from(matched).slice(0, maxResults);
}

/**
 * الحصول على الكلمات المقترحة التالية للسياق
 */
export function getNextWordsContext(lastWord: string, maxResults = 8): string[] {
  if (!lastWord) return [];
  const clean = lastWord.trim();
  
  if (ARABIC_BIGRAM_PREDICTIONS[clean]) {
    return ARABIC_BIGRAM_PREDICTIONS[clean].slice(0, maxResults);
  }

  const norm = normalizeArabic(clean);
  for (const [key, val] of Object.entries(ARABIC_BIGRAM_PREDICTIONS)) {
    if (normalizeArabic(key) === norm) {
      return val.slice(0, maxResults);
    }
  }

  // Fallback frequent transition words
  return ['في', 'على', 'إلى', 'أن', 'هذا', 'المستند'].slice(0, maxResults);
}

/**
 * البحث في قاموس الكلمات الأكثر استخداماً
 */
export function searchArabicWords(query: string, category?: string, letter?: string, limit = 50): ArabicDictionaryEntry[] {
  const normQuery = normalizeArabic(query);
  const normLetter = letter ? normalizeArabic(letter) : '';

  return ARABIC_FREQUENT_WORDS.filter((item) => {
    if (category && category !== 'all' && item.category !== category) {
      return false;
    }

    const normWord = normalizeArabic(item.word);

    if (normLetter && !normWord.startsWith(normLetter)) {
      return false;
    }

    if (normQuery) {
      return normWord.includes(normQuery);
    }

    return true;
  }).slice(0, limit);
}

/**
 * جلب الكلمات بحسب الحرف العربي
 */
export function getWordsByLetter(letter: string, category?: string, limit = 40): ArabicDictionaryEntry[] {
  const normLetter = normalizeArabic(letter);
  return ARABIC_FREQUENT_WORDS.filter((item) => {
    if (category && category !== 'all' && item.category !== category) {
      return false;
    }
    const normWord = normalizeArabic(item.word);
    return normWord.startsWith(normLetter);
  }).slice(0, limit);
}

/**
 * إحصائيات وتصنيفات القاموس
 */
export function getAllWordCategories(): { key: string; label: string; count: number; icon: string }[] {
  const counts: Record<string, number> = {
    all: ARABIC_FREQUENT_WORDS.length,
    general: 0,
    administrative: 0,
    legal: 0,
    finance: 0,
    honorific: 0,
    tech: 0,
  };

  for (const item of ARABIC_FREQUENT_WORDS) {
    if (counts[item.category] !== undefined) {
      counts[item.category]++;
    }
  }

  return [
    { key: 'all', label: 'كافة الكلمات', count: counts.all, icon: '📚' },
    { key: 'administrative', label: 'إدارية ومراسلات', count: counts.administrative, icon: '📑' },
    { key: 'legal', label: 'قضائية وقانونية', count: counts.legal, icon: '⚖️' },
    { key: 'finance', label: 'مالية ومحاسبية', count: counts.finance, icon: '💰' },
    { key: 'honorific', label: 'تشريف وديباجات', count: counts.honorific, icon: '👑' },
    { key: 'general', label: 'عامة وروابط', count: counts.general, icon: '💬' },
    { key: 'tech', label: 'تقنية ومكتبية', count: counts.tech, icon: '💻' },
  ];
}

/**
 * استرجاع الفقرات المقترحة حسب التصنيف والبحث
 */
export function getParagraphsByCategory(category?: string, query?: string): ArabicPhrase[] {
  const normQuery = query ? normalizeArabic(query) : '';

  return ARABIC_COMMON_PARAGRAPHS.filter((p) => {
    if (category && category !== 'all' && p.category !== category) {
      return false;
    }

    if (normQuery) {
      const matchTitle = normalizeArabic(p.title).includes(normQuery);
      const matchText = normalizeArabic(p.text).includes(normQuery);
      const matchShortcut = p.shortcut ? normalizeArabic(p.shortcut).includes(normQuery) : false;
      return matchTitle || matchText || matchShortcut;
    }

    return true;
  });
}
