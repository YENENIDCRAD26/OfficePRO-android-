import React from 'react';
import { X, FileText, Briefcase, Award, CheckSquare, FileSpreadsheet, Sparkles, ArrowLeft } from 'lucide-react';
import { WordDocumentState } from '../../types';

interface DocumentTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (templateState: Partial<WordDocumentState>) => void;
}

export const DocumentTemplatesModal: React.FC<DocumentTemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
}) => {
  if (!isOpen) return null;

  const templates = [
    {
      id: 'cv',
      title: 'سيرة ذاتية مهنية (Professional CV)',
      description: 'نموذج سيرة ذاتية مرتب ومهني يتضمن البيانات الشخصية، الخبرات، المؤهلات والمهارات.',
      icon: Briefcase,
      color: 'from-blue-600 to-indigo-600',
      badge: 'توظيف',
      state: {
        title: 'سيرة_ذاتية_مهنية.docx',
        fontFamily: 'Cairo, sans-serif',
        fontSize: 14,
        lineSpacing: 1.6,
        contentHtml: `
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1e3a8a; margin-bottom: 4px;">محمد بن أحمد القفري</h1>
            <p style="color: #64748b; font-size: 11pt;">مهندس برمجيات ومستشار تقني | صنعاء، اليمن | phone: +967 770000000</p>
          </div>
          <hr style="border: 1px solid #cbd5e1; margin: 15px 0;">
          <h2 style="color: #1e3a8a; font-size: 13pt; border-bottom: 2px solid #3b82f6; padding-bottom: 4px;">الملخص المهني</h2>
          <p>مهندس برمجيات ذو خبرة واسعة في تطوير تطبيقات الويب والأنظمة المؤسسية وتصميم قواعد البيانات.</p>
          <h2 style="color: #1e3a8a; font-size: 13pt; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; margin-top: 15px;">الخبرات المهنية</h2>
          <p><strong>مطور أنظمة أول</strong> - شركة التقنية الرقمية (2022 - حتى الآن)<br>إدارة وتطوير المنصات السحابية والأنظمة المالية.</p>
          <h2 style="color: #1e3a8a; font-size: 13pt; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; margin-top: 15px;">التعليم والأكاديمية</h2>
          <p>بكالوريوس علوم حاسب وتكنولوجيا معلومات - جامعة صنعاء (2018 - 2022).</p>
        `,
      },
    },
    {
      id: 'official_letter',
      title: 'خطاب رسمي إداري (Official Letter)',
      description: 'خطاب رسمي حكومي أو مؤسسي مع ترويسة وتاريخ وجهة مستهدفة وخاتم توقيع.',
      icon: Award,
      color: 'from-emerald-600 to-teal-600',
      badge: 'إداري',
      state: {
        title: 'خطاب_رسمي_صادر.docx',
        fontFamily: 'Amiri, serif',
        fontSize: 15,
        lineSpacing: 1.8,
        contentHtml: `
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold;">
            <div>الجمهورية اليمنية<br>وزارة العدل والتوثيق</div>
            <div>التاريخ: ${new Date().toLocaleDateString('ar-YE')}<br>الرقم: 458 / 2026م</div>
          </div>
          <h2 style="text-align: center; color: #065f46; text-decoration: underline; margin: 25px 0;">الموضوع: تعميم إداري وقانوني هام</h2>
          <p><strong>المكرمون / كافة رؤساء وأمناء وموثقي المحاكم الابتدائية والاستئنافية المحترمون،،،</strong></p>
          <p>السلام عليكم ورحمة الله وبركاته، وبعد،،،</p>
          <p>تستناداً إلى التوجيهات الرسمية وحرصاً على ضبط وتوثيق المعاملات والإجراءات الشرعية والقانونية بدقة وأمانة، يُحتم على الجميع الالتزام الصارم باللوائح المنظمة والمدد الزمنية المحددة.</p>
          <p style="margin-top: 40px; text-align: left; font-weight: bold;">
            رئيس مجلس القضاء الأعلى<br>
            ختم وتوقيع معتمد 🏛️
          </p>
        `,
      },
    },
    {
      id: 'task_schedule',
      title: 'جدول مهام ومتابعة المشاريع (Task Schedule)',
      description: 'جدول منظم لجدولة المهام اليومية، الأولويات، وتتبع نسب الإنجاز ومسؤول التنفيذ.',
      icon: CheckSquare,
      color: 'from-amber-600 to-orange-600',
      badge: 'إنتاجية',
      state: {
        title: 'جدول_مهام_المشروع.docx',
        fontFamily: 'Cairo, sans-serif',
        fontSize: 13,
        lineSpacing: 1.5,
        contentHtml: `
          <h1 style="color: #b45309; text-align: center; margin-bottom: 15px;">جدول متابعة المهام والأنشطة التشغيلية</h1>
          <p>متابعة إنجاز المهام الأسبوعية للفريق التقني والإداري:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;" border="1">
            <thead>
              <tr style="background-color: #fef3c7; color: #92400e;">
                <th style="padding: 8px; text-align: right;">م</th>
                <th style="padding: 8px; text-align: right;">المهمة أو النشاط</th>
                <th style="padding: 8px; text-align: right;">المسؤول</th>
                <th style="padding: 8px; text-align: right;">الموعد النهائي</th>
                <th style="padding: 8px; text-align: right;">الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px;">1</td>
                <td style="padding: 8px;">مراجعة الصياغة القانونية للعقود</td>
                <td style="padding: 8px;">أ. عبدالرحمن القفري</td>
                <td style="padding: 8px;">2026/10/10</td>
                <td style="padding: 8px; color: #047857; font-weight: bold;">قيد التنفيذ</td>
              </tr>
              <tr>
                <td style="padding: 8px;">2</td>
                <td style="padding: 8px;">تحديث وتدقيق سجل المحاكم</td>
                <td style="padding: 8px;">محمد أحمد</td>
                <td style="padding: 8px;">2026/10/15</td>
                <td style="padding: 8px; color: #b45309; font-weight: bold;">جديد</td>
              </tr>
            </tbody>
          </table>
        `,
      },
    },
    {
      id: 'court_memo',
      title: 'مذكرة دعوى ومرافعة قضائية (Court Memo)',
      description: 'قالب قانوني رسمي معتمد للمذكرات القانونية أمام المحاكم والجهات القضائية.',
      icon: FileText,
      color: 'from-purple-600 to-indigo-700',
      badge: 'قانوني',
      state: {
        title: 'مذكرة_دفاع_وقانونية.docx',
        fontFamily: 'Amiri, serif',
        fontSize: 16,
        lineSpacing: 2.0,
        contentHtml: `
          <div style="text-align: center; font-weight: bold; margin-bottom: 20px;">
            <p>بسم الله الرحمن الرحيم</p>
            <p>فضيلة رئيس وأعضاء محكمة استئناف الإحاطة المحترمون،،،</p>
          </div>
          <p><strong>الموضوع:</strong> مذكرة دفاع ومرافعة في القضية المدنية رقم (45) لسنة 2026م.</p>
          <p><strong>مقدمة من /</strong> المستأنف ضده (المدعي)، ضد / المستأنف (المدعى عليه).</p>
          <h3 style="color: #581c87; margin-top: 15px;">أولاً: الوقائع</h3>
          <p>تتلخص وقائع النزاع بالقدر اللازم لإصدار الحكم في كون الموكل قد تقدم بدعوى ابتدائية يطالب فيها بحق ثابت وموثق...</p>
          <h3 style="color: #581c87; margin-top: 15px;">ثانياً: الرد القانوني والأسانيد الشرعية</h3>
          <p>إن ما ورد في عريضة الاستئناف لا يعدو عن كونها محاولة يائسة للتهرب من الالتزامات القانونية الثابتة بالأوراق الرسمية...</p>
          <p style="margin-top: 40px; text-align: left; font-weight: bold;">ولكم جزيل الشكر والاحترام،،،<br>محامي المستأنف ضده</p>
        `,
      },
    },
    {
      id: 'invoice',
      title: 'فاتورة تجارية (Commercial Invoice)',
      description: 'فاتورة احترافية تشمل البنود، الكميات، الأسعار، والإجمالي.',
      icon: FileText,
      color: 'from-rose-600 to-red-600',
      badge: 'مالي',
      state: {
        title: 'فاتورة_مبيعات.docx',
        fontFamily: 'Cairo, sans-serif',
        fontSize: 12,
        lineSpacing: 1.2,
        contentHtml: `
          <h1 style="text-align: center;">فاتورة</h1>
          <table style="width:100%; border-collapse: collapse;" border="1">
            <tr><th>المنتج</th><th>الكمية</th><th>السعر</th></tr>
            <tr><td>منتج 1</td><td>1</td><td>100</td></tr>
          </table>
        `,
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>مكتبة قوالب المستندات الجاهزة (Document Templates Gallery)</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-right">
          <p className="text-xs text-slate-600">
            اختر قالباً احترافياً جاهزاً لتطبيق التنسيق، الخطوط، والهيكل الهيكلي للمستند فوراً في محرر الوورد:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => {
              const IconComp = tpl.icon;
              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    onApplyTemplate(tpl.state);
                    onClose();
                  }}
                  className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xl rounded-2xl p-5 transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r ${tpl.color}" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tpl.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                        {tpl.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                        {tpl.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>استخدام القالب وتطبيق التنسيق</span>
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-300 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
