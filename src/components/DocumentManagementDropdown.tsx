import React, { useState, useRef, useEffect } from 'react';
import {
  FolderOpen,
  ChevronDown,
  FilePlus,
  Save,
  FileDown,
  Printer,
  FileSpreadsheet,
  FileText,
  Sliders,
  Eye,
  X,
  Sparkles,
  Download
} from 'lucide-react';
import { ExcelState } from '../types';

export interface DocumentManagementDropdownProps {
  currentMode: 'word' | 'excel';
  currentTitle: string;
  onOpenExcelDocument?: (state: ExcelState) => void;
  onNewExcelDocument?: () => void;
  onSaveCurrentDocument?: () => void;
  onSaveAsNewDocument?: () => void;
  onRenameCurrentTitle?: (newTitle: string) => void;
  currentExcelState?: ExcelState;
  onOpenFile?: () => void;
  onOpenPrintPreview?: () => void;
  onPrint?: () => void;
  onExportPdf?: () => void;
  onExportXlsx?: () => void;
  onExportCsv?: () => void;
  onOpenPageSetup?: () => void;
  onOpenAdvancedExport?: () => void;
}

export const DocumentManagementDropdown: React.FC<DocumentManagementDropdownProps> = ({
  currentMode,
  currentTitle,
  onOpenExcelDocument,
  onNewExcelDocument,
  onSaveCurrentDocument,
  onSaveAsNewDocument,
  onOpenFile,
  onOpenPrintPreview,
  onPrint,
  onExportPdf,
  onExportXlsx,
  onExportCsv,
  onOpenPageSetup,
  onOpenAdvancedExport,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleAction = (cb?: () => void) => {
    setIsOpen(false);
    if (cb) cb();
  };

  return (
    <div className="relative inline-block text-right" ref={containerRef} dir="rtl">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 h-[28px] bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer select-none"
        title="فتح قائمة إدارة الملف والمستندات"
      >
        <FolderOpen className="w-3.5 h-3.5 text-emerald-200" />
        <span>قائمة الملف</span>
        <ChevronDown className={`w-3 h-3 text-emerald-200 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full mt-1.5 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 w-72 text-right animate-in fade-in zoom-in-95 font-sans ring-1 ring-black/5"
          style={{ minWidth: '280px' }}
        >
          <div className="px-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                {currentTitle || 'مصنف حسابات إكسل'}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-1 max-h-[420px] overflow-y-auto divide-y divide-slate-100/60">
            {/* New Document */}
            <button
              type="button"
              onClick={() => handleAction(onNewExcelDocument)}
              className="w-full text-right px-3.5 py-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 transition flex items-center justify-between group cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">إنشاء مصنف جديد (فارغ)</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                جديد
              </span>
            </button>

            {/* Open Document */}
            <button
              type="button"
              onClick={() => handleAction(onOpenFile)}
              className="w-full text-right px-3.5 py-2 hover:bg-blue-50 text-slate-700 hover:text-blue-900 transition flex items-center justify-between group cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">فتح ملف من الجهاز...</span>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                فتح
              </span>
            </button>

            {/* Save */}
            <div className="py-1">
              <button
                type="button"
                onClick={() => handleAction(onSaveCurrentDocument)}
                className="w-full text-right px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer text-xs"
              >
                <Save className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">حفظ التغييرات (Ctrl+S)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction(onSaveAsNewDocument)}
                className="w-full text-right px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer text-xs"
              >
                <FileDown className="w-4 h-4 text-teal-600" />
                <span className="font-semibold">حفظ باسم جديد...</span>
              </button>
            </div>

            {/* Print & Preview */}
            <div className="py-1">
              <button
                type="button"
                onClick={() => handleAction(onOpenPrintPreview)}
                className="w-full text-right px-3.5 py-2 hover:bg-amber-50 text-slate-700 hover:text-amber-900 transition flex items-center justify-between group cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">معاينة قبل الطباعة</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                  معاينة
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleAction(onPrint)}
                className="w-full text-right px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer text-xs"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span className="font-semibold">طباعة المصنف فوراً</span>
              </button>
            </div>

            {/* Export Section */}
            <div className="py-1">
              <button
                type="button"
                onClick={() => handleAction(onExportPdf)}
                className="w-full text-right px-3.5 py-2 hover:bg-rose-50 text-slate-700 hover:text-rose-900 transition flex items-center gap-2 cursor-pointer text-xs"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span className="font-semibold">تصدير إلى ملف PDF عالي الجودة</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction(onExportXlsx)}
                className="w-full text-right px-3.5 py-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 transition flex items-center gap-2 cursor-pointer text-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">تصدير كملف إكسل (XLSX)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction(onExportCsv)}
                className="w-full text-right px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition flex items-center gap-2 cursor-pointer text-xs"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span className="font-semibold">تصدير كجدول CSV مفصول بفواصل</span>
              </button>
            </div>

            {/* Advanced Settings */}
            {(onOpenPageSetup || onOpenAdvancedExport) && (
              <div className="py-1 bg-slate-50/60">
                {onOpenPageSetup && (
                  <button
                    type="button"
                    onClick={() => handleAction(onOpenPageSetup)}
                    className="w-full text-right px-3.5 py-2 hover:bg-slate-100 text-slate-700 transition flex items-center gap-2 cursor-pointer text-xs"
                  >
                    <Sliders className="w-4 h-4 text-slate-600" />
                    <span className="font-semibold">إعدادات وهوامش الصفحة</span>
                  </button>
                )}
                {onOpenAdvancedExport && (
                  <button
                    type="button"
                    onClick={() => handleAction(onOpenAdvancedExport)}
                    className="w-full text-right px-3.5 py-2 hover:bg-slate-100 text-slate-700 transition flex items-center gap-2 cursor-pointer text-xs"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold">خيارات التصدير المتقدمة</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
