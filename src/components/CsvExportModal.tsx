import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Check, Settings, ShieldCheck, BookmarkCheck, Loader2 } from 'lucide-react';
import { ExcelSheet, ExcelState } from '../types';
import { exportExcelAsCsv, CsvExportOptions } from '../utils/fileHandlers';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  excelState: ExcelState;
  activeSheet: ExcelSheet;
}

export const CsvExportModal: React.FC<CsvExportModalProps> = ({
  isOpen,
  onClose,
  excelState,
  activeSheet,
}) => {
  const [fileName, setFileName] = useState(excelState.title.replace(/\.(xlsx|xls|csv)$/i, ''));
  const [delimiter, setDelimiter] = useState<',' | ';' | '\t' | '|'>(';'); // Default to semicolon for Arabic Excel compatibility
  const [encoding, setEncoding] = useState<'utf-8-bom' | 'utf-8' | 'windows-1256' | 'iso-8859-6'>('utf-8-bom');
  const [exportScope, setExportScope] = useState<'active' | 'all'>('active');
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: CsvExportOptions = {
        delimiter,
        encoding,
        exportScope,
      };

      if (saveAsDefault) {
        try {
          localStorage.setItem('office_default_csv_settings', JSON.stringify(options));
        } catch (e) {
          console.warn('Failed to save default CSV settings:', e);
        }
      }

      const finalName = fileName.trim() || 'table_export';
      if (exportScope === 'active') {
        exportExcelAsCsv(activeSheet, finalName, finalName, options);
      } else {
        // Export all sheets
        for (const sheet of excelState.sheets) {
          exportExcelAsCsv(sheet, finalName, `${finalName}_${sheet.name}`, options);
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      setSuccess(true);
      setTimeout(() => {
        setIsExporting(false);
        setSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('CSV export error:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans" dir="rtl">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-linear-to-l from-emerald-50 via-white to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                خيارات تصدير متقدمة لجداول CSV
              </h2>
              <p className="text-xs text-slate-500">
                تخصيص فاصل الأعمدة وترميز الملف لدعم اللغة العربية في إكسل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Filename */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              اسم الملف المصدر:
            </label>
            <div className="relative">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-hidden font-medium"
                placeholder="اسم الملف"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">
                .csv
              </span>
            </div>
          </div>

          {/* Delimiter Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              فاصل الحقول والفواصل (Delimiter / Separator):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: ';', label: 'فاصلة منقوطة ( ; )', desc: 'موصى بها بشدة لبرنامج إكسل مع اللغة العربية', badge: 'موصى به' },
                { id: ',', label: 'فاصلة عادية ( , )', desc: 'الفاصل القياسي العالمي لملفات CSV', badge: 'قياسي' },
                { id: '\t', label: 'علامة تبويب ( Tab - TSV )', desc: 'لفتح الجداول مباشرة بلصق مباشر في إكسل', badge: 'TSV' },
                { id: '|', label: 'خط عمودي ( | )', desc: 'للبيانات المتقدمة وقواعد البيانات', badge: 'متقدم' },
              ].map((del) => (
                <button
                  key={del.id}
                  type="button"
                  onClick={() => setDelimiter(del.id as any)}
                  className={`p-2.5 text-right rounded-xl border transition text-xs flex flex-col justify-between cursor-pointer ${
                    delimiter === del.id
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs font-bold ring-2 ring-emerald-400/40'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{del.label}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      {del.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal leading-tight">{del.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Encoding Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ترميز الملف (File Encoding):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { 
                  id: 'utf-8-bom', 
                  title: 'UTF-8 with BOM (الأفضل للعربية)', 
                  desc: 'يضمن ظهور الحروف العربية بدقة متناهية ودون رموز غريبة عند فتحه مباشرة في إكسل',
                  badge: 'موصى به'
                },
                { 
                  id: 'utf-8', 
                  title: 'UTF-8 قياسي (بدون BOM)', 
                  desc: 'للأنظمة والبرمجة وتحليل البيانات (Python / Web)',
                  badge: 'مبرمجين'
                },
                { 
                  id: 'windows-1256', 
                  title: 'Windows-1256 (CP1256)', 
                  desc: 'ترميز ويندوز العربي الكلاسيكي للأنظمة القديمة',
                  badge: 'كلاسيكي'
                },
                { 
                  id: 'iso-8859-6', 
                  title: 'ISO-8859-6 (Arabic)', 
                  desc: 'الترميز القياسي الدولي للغة العربية',
                  badge: 'دولي'
                },
              ].map((enc) => (
                <button
                  key={enc.id}
                  type="button"
                  onClick={() => setEncoding(enc.id as any)}
                  className={`p-2.5 text-right rounded-xl border transition text-xs flex flex-col justify-between cursor-pointer ${
                    encoding === enc.id
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs font-bold ring-2 ring-emerald-400/40'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{enc.title}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      {enc.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal leading-tight">{enc.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export Scope */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              نطاق التصدير (Export Scope):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportScope('active')}
                className={`p-2.5 rounded-xl border text-right text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                  exportScope === 'active'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div>الورقة النشطة فقط ({activeSheet.name})</div>
                  <div className="text-[10px] text-slate-500 font-normal">تصدير الورقة الحالية وحدها</div>
                </div>
                {exportScope === 'active' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => setExportScope('all')}
                className={`p-2.5 rounded-xl border text-right text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                  exportScope === 'all'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div>كافة أوراق العمل ({excelState.sheets.length} أوراق)</div>
                  <div className="text-[10px] text-slate-500 font-normal">تصدير كل ورقة كملف CSV منفصل</div>
                </div>
                {exportScope === 'all' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            </div>
          </div>

          {/* Save Defaults Checkbox */}
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>حفظ هذه الخيارات كافتراضية لعمليات تصدير CSV القادمة</span>
              </span>
            </label>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors disabled:opacity-50 ${
              success ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {success ? (
              <>
                <Check className="h-4 w-4" />
                <span>تم التصدير بنجاح ✓</span>
              </>
            ) : isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جارٍ المعالجة...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>تصدير ملف CSV المتقدم</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
