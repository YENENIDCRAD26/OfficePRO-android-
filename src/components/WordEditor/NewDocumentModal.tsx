import React, { useState } from 'react';
import { 
  X, 
  FilePlus, 
  FileText, 
  FileSpreadsheet, 
  Sparkles, 
  Check, 
  Layout, 
  Compass, 
  Type, 
  Palette, 
  ArrowRight,
  ShieldAlert,
  Save
} from 'lucide-react';
import { WordDocumentState, ExcelState, PaperSize, PageOrientation } from '../../types';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: 'word' | 'excel';
  hasUnsavedChanges?: boolean;
  onSaveCurrentDocument?: () => void;
  onCreateWordDoc: (config: {
    title: string;
    paperSize: PaperSize;
    orientation: PageOrientation;
    fontFamily: string;
    fontSize: number;
    margins: 'normal' | 'narrow' | 'wide' | 'custom';
    pageBgColor: string;
    contentHtml: string;
    headerText?: string;
    footerText?: string;
  }) => void;
  onCreateExcelDoc: (title: string, templateType?: string) => void;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  hasUnsavedChanges = false,
  onSaveCurrentDocument,
  onCreateWordDoc,
  onCreateExcelDoc,
}) => {
  const [activeTab, setActiveTab] = useState<'blank' | 'templates' | 'excel'>('blank');
  const [docTitle, setDocTitle] = useState(`مستند_جديد_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.docx`);
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [fontFamily, setFontFamily] = useState('Amiri, serif');
  const [fontSize, setFontSize] = useState(14);
  const [margins, setMargins] = useState<'normal' | 'narrow' | 'wide' | 'custom'>('normal');
  const [pageBgColor, setPageBgColor] = useState('#ffffff');
  const [showSaveWarning, setShowSaveWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  if (!isOpen) return null;

  const handleProceedWithAction = (action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => action);
      setShowSaveWarning(true);
    } else {
      action();
      onClose();
    }
  };

  const handleCreateBlankDoc = () => {
    handleProceedWithAction(() => {
      // Ensure we clear any existing document state before creating a new one.
      // Assuming onCreateWordDoc resets state in the parent.
      onCreateWordDoc({
        title: docTitle.trim() || `مستند_جديد_${Date.now()}.docx`,
        paperSize,
        orientation,
        fontFamily,
        fontSize,
        margins,
        pageBgColor,
        contentHtml: '<p>ابدأ الكتابة هنا...</p>', // Start with a hint
        headerText: '',
        footerText: '',
      });
    });
  };

  const templates = [
    {
      id: 'legal_memo',
      title: 'مذكرة دفاع ودفوع قضائية',
      subtitle: 'قالب قانوني رسمي معتمد للمحاكم والنيابات',
      badge: 'قانوني',
      icon: '⚖️',
      color: 'border-blue-500 bg-blue-50/40 text-blue-950',
      apply: () => {
        onCreateWordDoc({
          title: 'مذكرة_دفاع_قضائية.docx',
          paperSize: 'A4',
          orientation: 'portrait',
          fontFamily: 'Amiri, serif',
          fontSize: 15,
          margins: 'normal',
          pageBgColor: '#ffffff',
          contentHtml: `
            <div style="text-align: center; margin-bottom: 24px; line-height: 1.8;">
              <h2 style="margin: 0; font-size: 16pt; color: #1e293b;">بسم الله الرحمن الرحيم</h2>
              <h3 style="margin: 8px 0; font-size: 14pt; color: #334155;">لدى محكمة استئناف الأمانة الموقرة</h3>
              <p style="margin: 0; font-size: 12pt; color: #64748b;">الدائرة المدنية / التجارية</p>
            </div>
            <div style="border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; padding: 12px 0; margin-bottom: 20px;">
              <p><strong>الموضوع:</strong> مذكرة جوابية ودفوع قانونية موضوعية</p>
              <p><strong>مقدمة من:</strong> المستأنف / المدعى عليه</p>
              <p><strong>ضد:</strong> المستأنف ضده / المدعي</p>
              <p><strong>في القضية رقم:</strong> ( ..... / لسنة 1447هـ )</p>
            </div>
            <h3 style="color: #1e3a8a; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px;">أولاً: الوقائع الموجزة</h3>
            <p>نحيط عدالة المحكمة علماً بالوقائع الثابتة التالية وفقاً للأوراق والمستندات المرفقة...</p>
            <h3 style="color: #1e3a8a; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin-top: 18px;">ثانياً: الأسانيد والدفوع القانونية</h3>
            <p>تأسيساً على نصوص القانون والمبادئ القضائية المستقرة نوجز أوجه الدفاع فيما يلي:</p>
            <h3 style="color: #1e3a8a; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin-top: 18px;">الطلبات الختامية</h3>
            <p>بناءً على ما تقدم نلتمس من عدالة المحكمة الموقرة التكرم بالحكم بـ:</p>
            <p>1- قبول المذكرة شكلاً وموضوعاً.<br>2- رفض دعوى المستأنف ضده لعدم الصحة والثبوت.</p>
          `,
          headerText: 'مذكرة قضائية - محكمة الاستئناف',
          footerText: 'صفحة مذكرة دفاع قانونية',
        });
      }
    },
    {
      id: 'official_letter',
      title: 'خطاب رسمي ومراسلة إدارية',
      subtitle: 'ترويسة رسمية، مرجع، تحية ختامية، وتوقيعات',
      badge: 'إداري',
      icon: '🏛️',
      color: 'border-emerald-500 bg-emerald-50/40 text-emerald-950',
      apply: () => {
        onCreateWordDoc({
          title: 'خطاب_رسمي_صادر.docx',
          paperSize: 'A4',
          orientation: 'portrait',
          fontFamily: 'Cairo, sans-serif',
          fontSize: 14,
          margins: 'normal',
          pageBgColor: '#ffffff',
          contentHtml: `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
              <div style="text-align: right;">
                <p style="margin: 0; font-weight: bold;">الجمهورية اليمنية</p>
                <p style="margin: 0; font-weight: bold;">الإدارة العامة للشؤون الإدارية</p>
                <p style="margin: 0; color: #64748b;">الرقم المرجعي: ص / 1447 / 098</p>
              </div>
              <div style="text-align: left;">
                <p style="margin: 0;">التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
                <p style="margin: 0;">الموافق: ${new Date().toLocaleDateString('en-GB')}</p>
              </div>
            </div>
            <div style="text-align: center; margin: 24px 0;">
              <h2 style="margin: 0; color: #0f172a;">الأخ المحترم / مدير عام المؤسسة العامة &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; حياكم الله</h2>
              <p style="margin: 8px 0; font-weight: bold; font-size: 13pt;">السلام عليكم ورحمة الله وبركاته،،،</p>
            </div>
            <p><strong>الموضوع:</strong> إشعار رسمي ببدء تنفيذ الخطة التنفيذية السنوية</p>
            <p>إشارة إلى الموضوع أعلاه، وبالنظر إلى متطلبات تطوير العمل ورفع كفاءة الأداء المؤسسي، نود إحاطتكم علماً بأنه قد تقرر البدء في تنفيذ مراحل المشروع...</p>
            <p>شاكرين ومقدرين حسن تعاونكم الدائم لما فيه المصلحة العامة.</p>
            <div style="margin-top: 40px; text-align: left; padding-left: 30px;">
              <p style="margin: 0; font-weight: bold;">وتفضلوا بقبول فائق الاحترام والتقدير،،،</p>
              <br><br>
              <p style="margin: 0; font-weight: bold;">المدير العام التنفيذي</p>
              <p style="margin: 0; color: #64748b;">(الختم والتوقيع الرسمي)</p>
            </div>
          `,
          headerText: 'خطاب رسمي صادر - الجمهورية اليمنية',
          footerText: 'سري للاستعمال الرسمي فقط',
        });
      }
    },
    {
      id: 'business_report',
      title: 'تقرير عمل إداري وإحصائي',
      subtitle: 'تقرير مهني مفصل مع جداول ملخصة ومؤشرات أداء',
      badge: 'أعمال',
      icon: '📊',
      color: 'border-purple-500 bg-purple-50/40 text-purple-950',
      apply: () => {
        onCreateWordDoc({
          title: 'تقرير_إنجاز_الأعمال.docx',
          paperSize: 'A4',
          orientation: 'portrait',
          fontFamily: 'Cairo, sans-serif',
          fontSize: 13,
          margins: 'normal',
          pageBgColor: '#ffffff',
          contentHtml: `
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #4338ca; margin: 0;">تقرير الإنجاز الإداري الدوري</h1>
              <p style="color: #64748b;">الفترة من 01 يناير حتى 30 يونيو | إعداد فريق التطوير والجودة</p>
            </div>
            <hr style="border: 1px solid #e2e8f0; margin: 16px 0;">
            <h3>1. الملخص التنفيذي للأداء</h3>
            <p>حققت الإدارة نسبة إنجاز بلغت 94% من الأهداف المخططة خلال النصف الأول، مع زيادة ملحوظة في مؤشرات الرضا وسرعة الإنجاز.</p>
            <h3>2. جدول الإحصائيات والمؤشرات</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;" border="1">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">المؤشر</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">المستهدف</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">المحقق</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">نسبة الإنجاز</th>
                </tr>
              </thead>
              <tbody>
                <tr style="text-align: center;">
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">معالجة المعاملات</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">1,200</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">1,280</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; color: #16a34a; font-weight: bold;">106%</td>
                </tr>
                <tr style="text-align: center;">
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">تقليص زمن الانتظار</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">15 دقيقة</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">11 دقيقة</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; color: #16a34a; font-weight: bold;">ممتاز</td>
                </tr>
              </tbody>
            </table>
            <h3>3. التوصيات والمقترحات</h3>
            <p>نوصي بالاستمرار في أتمتة الإجراءات وتكثيف برامج التدريب التخصصي للكوادر الميدانية.</p>
          `,
          headerText: 'تقرير الإنجاز الإداري والدوري',
          footerText: 'إدارة التطوير والتخطيط',
        });
      }
    },
    {
      id: 'meeting_minutes',
      title: 'محضر اجتماع رسمي وقرارات',
      subtitle: 'حضور، جدول أعمال، نقاشات، والقرارات المتخذة',
      badge: 'اجتماعات',
      icon: '🤝',
      color: 'border-amber-500 bg-amber-50/40 text-amber-950',
      apply: () => {
        onCreateWordDoc({
          title: 'محضر_اجتماع_رسمي.docx',
          paperSize: 'A4',
          orientation: 'portrait',
          fontFamily: 'Cairo, sans-serif',
          fontSize: 14,
          margins: 'normal',
          pageBgColor: '#ffffff',
          contentHtml: `
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #b45309; margin: 0;">محضر اجتماع مجلس الإدارة رقم (4)</h2>
              <p style="color: #78716c;">تاريخ الانعقاد: ${new Date().toLocaleDateString('ar-EG')} | قاعة الاجتماعات الرئيسية</p>
            </div>
            <p><strong>رئيس الاجتماع:</strong> الأستاذ / رئيس مجلس الإدارة</p>
            <p><strong>أمين السر والمقرر:</strong> المهندس / المستشار الإداري</p>
            <p><strong>الأعضاء الحاضرون:</strong> كافة أعضاء المجلس باستثناء اعتذار عضو واحد لظرف رسمي.</p>
            <hr style="border: 1px solid #e7e5e4; margin: 16px 0;">
            <h3>بنود جدول الأعمال:</h3>
            <ol>
              <li>مناقشة تقرير المبيعات والأرباح للنصف السنوي المنصرم.</li>
              <li>اعتماد الميزانية التقديرية لتطوير البنية التقنية.</li>
              <li>ما يستجد من أعمال.</li>
            </ol>
            <h3>القرارات والتوصيات المتخذة بالإجماع:</h3>
            <p>1- الموافقة التامة على اعتماد التقرير المالي وإقراره رسمياً.<br>2- تكليف الإدارة الفنية بالبدء في إجراءات التعاقد والتنفيذ الفوري.</p>
          `,
          headerText: 'محضر اجتماع مجلس الإدارة المعتمد',
          footerText: 'محضر رسمي موثق',
        });
      }
    },
    {
      id: 'cv_resume',
      title: 'سيرة ذاتية مهنية حديثة (CV)',
      subtitle: 'تنسيق عصري متناسق للبيانات والخبرات والمؤهلات',
      badge: 'توظيف',
      icon: '📑',
      color: 'border-sky-500 bg-sky-50/40 text-sky-950',
      apply: () => {
        onCreateWordDoc({
          title: 'سيرة_ذاتية_مهنية.docx',
          paperSize: 'A4',
          orientation: 'portrait',
          fontFamily: 'Cairo, sans-serif',
          fontSize: 13,
          margins: 'narrow',
          pageBgColor: '#ffffff',
          contentHtml: `
            <div style="text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px;">
              <h1 style="color: #0369a1; margin: 0;">عبدالرحمن خالد المنصوري</h1>
              <p style="color: #475569; margin: 4px 0;">أخصائي نظم معلومات وإدارة مشاريع تقنية | صنعاء، اليمن</p>
              <p style="color: #64748b; font-size: 10pt; margin: 0;">هاتف: +967 770000000 | بريد: info@example.com</p>
            </div>
            <h3 style="color: #0369a1; border-bottom: 1px solid #e0f2fe; padding-bottom: 2px;">الهدف المهني</h3>
            <p>مهندس طموح يمتلك خبرة تفوق 6 سنوات في قيادة الفرق وتطوير الحلول البرمجية المؤسسية الحديثة.</p>
            <h3 style="color: #0369a1; border-bottom: 1px solid #e0f2fe; padding-bottom: 2px; margin-top: 14px;">الخبرات الوظيفية</h3>
            <p><strong>مدير مشاريع تقنية</strong> - الشركة الرائدة للحلول الرقمية (2021 - الآن)<br>إدارة دورة حياة المشاريع البرمجية وضمان تسليمها بجودة عالية وفي الموعد المحدد.</p>
            <h3 style="color: #0369a1; border-bottom: 1px solid #e0f2fe; padding-bottom: 2px; margin-top: 14px;">المؤهلات العلمية</h3>
            <p>بكالوريوس هندسة برمجيات - امتياز مع مرتبة الشرف (2016 - 2020).</p>
          `,
          headerText: 'السيرة الذاتية المهنية - Curriculum Vitae',
          footerText: 'الملف المهني الشخصي',
        });
      }
    },
    {
      id: 'certificate',
      title: 'شهادة تقدير وإفادة رسمية',
      subtitle: 'تصميم أنيق متقن للشهادات والإفادات والتكريمات',
      badge: 'شهادات',
      icon: '📜',
      color: 'border-amber-600 bg-amber-50/40 text-amber-950',
      apply: () => {
        onCreateWordDoc({
          title: 'شهادة_تقدير_وتكريم.docx',
          paperSize: 'A4',
          orientation: 'landscape',
          fontFamily: 'Amiri, serif',
          fontSize: 16,
          margins: 'normal',
          pageBgColor: '#fffdfa',
          contentHtml: `
            <div style="border: 4px double #d97706; padding: 30px; text-align: center; border-radius: 8px;">
              <h1 style="color: #b45309; font-size: 26pt; margin: 0;">شهادة شكر وتقدير</h1>
              <p style="color: #78716c; font-size: 14pt; margin: 12px 0;">يسر إدارة المركز وقيادة المؤسسة أن تمنح هذه الشهادة للأخ / الأخت:</p>
              <h2 style="color: #1e293b; font-size: 22pt; margin: 16px 0; border-bottom: 2px dashed #d97706; display: inline-block; padding: 0 40px 8px 40px;">
                ...................................................
              </h2>
              <p style="font-size: 15pt; line-height: 1.8; color: #334155; margin: 20px 40px;">
                تقديراً للجهود المتميزة والمثمرة المبذولة خلال العام التدريبي، وتفانيه الملحوظ في إنجاز المهام المسندة إليه بكل كفاءة وإخلاص. متمنين له دوام التوفيق والنجاح.
              </p>
              <div style="display: flex; justify-content: space-between; margin-top: 40px; padding: 0 50px;">
                <div style="text-align: center;">
                  <p style="font-weight: bold; margin: 0;">المشرف العام</p>
                  <br><p style="color: #94a3b8;">........................</p>
                </div>
                <div style="text-align: center;">
                  <p style="font-weight: bold; margin: 0;">المدير التنفيذي</p>
                  <br><p style="color: #94a3b8;">........................</p>
                </div>
              </div>
            </div>
          `,
          headerText: 'شهادة تقدير وإفادة تميز',
          footerText: 'رقم القيد والتسجيل الرسمي',
        });
      }
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden ring-1 ring-black/10 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-5 py-3.5 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <FilePlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>إنشاء مستند جديد</span>
                <span className="text-[10px] bg-blue-500/40 text-blue-100 px-2 py-0.5 rounded-full font-mono">
                  New Document
                </span>
              </h2>
              <p className="text-xs text-blue-100 opacity-90">
                اختر مستنداً فارغاً بإعدادات مخصصة، أو ابدأ مباشرة بأحد القوالب المعتمدة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-100 px-5 pt-2 border-b border-slate-200 shrink-0 gap-2">
          <button
            onClick={() => setActiveTab('blank')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition cursor-pointer border-t border-x ${
              activeTab === 'blank'
                ? 'bg-white text-blue-700 border-slate-300 shadow-xs -mb-px'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>مستند وورد فارغ</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition cursor-pointer border-t border-x ${
              activeTab === 'templates'
                ? 'bg-white text-blue-700 border-slate-300 shadow-xs -mb-px'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>قوالب رسمية جاهزة ({templates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('excel')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition cursor-pointer border-t border-x ${
              activeTab === 'excel'
                ? 'bg-white text-emerald-700 border-slate-300 shadow-xs -mb-px'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>مصنف إكسيل جديد 📊</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: BLANK DOCUMENT */}
          {activeTab === 'blank' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              {/* Document Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم المستند الجديد:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="مستند_جديد.docx"
                    className="flex-1 bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-medium transition"
                  />
                  <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2.5 py-2 rounded-xl border border-slate-200">
                    .docx
                  </span>
                </div>
              </div>

              {/* Grid: Paper Size & Orientation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Paper Size */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Layout className="w-4 h-4 text-blue-600" />
                    <span>حجم الصفحة والورقة:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'A4', label: 'A4 (قياسي)', dim: '210 × 297 مم' },
                      { id: 'Letter', label: 'Letter (خطابات)', dim: '216 × 279 مم' },
                      { id: 'Legal', label: 'Legal (قانوني)', dim: '216 × 356 مم' },
                      { id: 'A3', label: 'A3 (كبير)', dim: '297 × 420 مم' },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setPaperSize(sz.id as PaperSize)}
                        className={`p-2 rounded-lg border text-right transition cursor-pointer ${
                          paperSize === sz.id
                            ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="font-semibold">{sz.label}</div>
                        <div className={`text-[10px] ${paperSize === sz.id ? 'text-blue-100' : 'text-slate-400'}`}>
                          {sz.dim}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orientation */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>اتجاه المستند:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setOrientation('portrait')}
                      className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                        orientation === 'portrait'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="w-5 h-7 border-2 border-current rounded-xs" />
                      <span>عمودي (Portrait)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation('landscape')}
                      className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                        orientation === 'landscape'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="w-7 h-5 border-2 border-current rounded-xs" />
                      <span>أفقي (Landscape)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid: Font & Margins */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Initial Font */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Type className="w-4 h-4 text-blue-600" />
                    <span>الخط العربي الافتراضي:</span>
                  </div>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
                  >
                    <option value="Amiri, serif">الخط الأميري (Amiri - كلاسيكي رسمي)</option>
                    <option value="Cairo, sans-serif">خط كايرو (Cairo - حديث وعصري)</option>
                    <option value="'Traditional Arabic', serif">Traditional Arabic (نسخ تقليدي)</option>
                    <option value="'Arabic Typesetting', serif">Arabic Typesetting (مطبعي رسمي)</option>
                    <option value="Arial, sans-serif">Arial (قياسي متوافق)</option>
                  </select>
                </div>

                {/* Margins Preset */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Layout className="w-4 h-4 text-blue-600" />
                    <span>الهوامش الافتراضية:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {[
                      { id: 'normal', label: 'عادي (2.5 سم)' },
                      { id: 'narrow', label: 'ضيق (1.27 سم)' },
                      { id: 'wide', label: 'عريض (3.18 سم)' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMargins(m.id as any)}
                        className={`p-1.5 rounded-lg border text-center transition cursor-pointer text-[11px] ${
                          margins === m.id
                            ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCreateBlankDoc}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>إنشاء المستند الفارغ الآن 📄✨</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  اختر من النماذج الرسمية أدناه للبدء بمستند منسق بالكامل مع ترويسة، جداول، وهوامش معتمدة:
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className={`border rounded-xl p-3.5 transition-all hover:shadow-md flex flex-col justify-between ${tpl.color}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{tpl.icon}</span>
                          <h3 className="font-bold text-sm text-slate-900">{tpl.title}</h3>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700">
                          {tpl.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3">{tpl.subtitle}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleProceedWithAction(tpl.apply)}
                      className="w-full py-2 bg-white hover:bg-blue-600 hover:text-white border border-slate-300 hover:border-blue-600 text-slate-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <span>استخدام هذا النموذج</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EXCEL SPREADSHEET */}
          {activeTab === 'excel' && (
            <div className="space-y-5 max-w-xl mx-auto py-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-950">
                  إنشاء مصنف إكسيل وجداول بيانات جديد
                </h3>
                <p className="text-xs text-emerald-800">
                  أنشئ جدول بيانات جديد مع دعم كامل للمعادلات المحاسبية (SUM, AVERAGE, IF...)، الخلايا الملونة، والرسوم البيانية.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleProceedWithAction(() => {
                      onCreateExcelDoc(`جدول_بيانات_جديد_${Date.now().toString().slice(-4)}.xlsx`, 'blank');
                    });
                  }}
                  className="p-3.5 bg-white hover:bg-emerald-50 border-2 border-emerald-300 rounded-xl text-right transition flex flex-col justify-between gap-2 shadow-xs cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-xs text-emerald-900 group-hover:text-emerald-700">
                      مصنف إكسيل فارغ 📊
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      جدول بيانات خالي جاهز لإدخال البيانات والأرقام والمعادلات.
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">إنشاء الآن ←</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleProceedWithAction(() => {
                      onCreateExcelDoc(`كشف_حساب_محاسبي_${Date.now().toString().slice(-4)}.xlsx`, 'accounting');
                    });
                  }}
                  className="p-3.5 bg-white hover:bg-emerald-50 border-2 border-emerald-300 rounded-xl text-right transition flex flex-col justify-between gap-2 shadow-xs cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-xs text-emerald-900 group-hover:text-emerald-700">
                      قالب كشف حساب مالي 💰
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      جدول جاهز مع أعمدة المدين، الدائن، الرصيد، والبيان.
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">إنشاء الآن ←</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save Warning Sub-Modal */}
        {showSaveWarning && (
          <div className="fixed inset-0 z-[220] bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-5 max-w-md w-full space-y-4 text-right">
              <div className="flex items-center gap-2.5 text-amber-600">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-bold text-slate-900">
                  هل ترغب بحفظ المستند الحالي؟
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                يحتوي المستند المفتوح حالياً على نصوص وتعديلات. هل ترغب بحفظه سريعاً قبل الانتقال لإنشاء المستند الجديد حتى لا تفقد عملك؟
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onSaveCurrentDocument?.();
                    setShowSaveWarning(false);
                    if (pendingAction) pendingAction();
                    onClose();
                  }}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ ومتابعة</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveWarning(false);
                    if (pendingAction) pendingAction();
                    onClose();
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  متابعة دون حفظ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveWarning(false);
                    setPendingAction(null);
                  }}
                  className="px-3 py-2 text-slate-400 hover:text-slate-600 rounded-xl text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-2.5 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>💡 تلميح: يمكنك الضغط على</span>
            <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-mono text-[10px] font-bold">
              Ctrl + N
            </kbd>
            <span>في أي وقت لفتح هذه النافذة فوراً</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
