import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileDown, 
  Layout, 
  AlignJustify, 
  Check, 
  Loader2,
  FileText,
  Printer,
  Table as TableIcon,
  ShieldCheck,
  BookmarkCheck,
  Sparkles,
  Layers,
  Ratio,
  Share2
} from 'lucide-react';
import { PdfExportOptions, WordDocumentState } from '../types';
import { generateWordPdfBlob, shareDocument } from '../utils/fileHandlers';
import { 
  calculateUnifiedPaperDimensionsAndScale, 
  calculateUnifiedDocumentPages, 
  formatPaperDimensionsLabel,
  UNIFIED_PAPER_SIZES 
} from '../utils/paperDimensions';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  type: 'word' | 'excel';
  onExport: (options: PdfExportOptions, customFilename: string) => Promise<void>;
  onPrintDirect?: () => void;
  wordState?: WordDocumentState;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  type,
  onExport,
  onPrintDirect,
  wordState,
}) => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    wordState?.orientation || (type === 'excel' ? 'landscape' : 'portrait')
  );
  const [margins, setMargins] = useState<'normal' | 'narrow' | 'wide'>(
    wordState?.margins === 'narrow' || wordState?.margins === 'wide' ? wordState.margins : 'normal'
  );
  const [paperSize, setPaperSize] = useState<'a3' | 'a4' | 'a5' | 'letter' | 'legal'>(
    (wordState?.paperSize?.toLowerCase() as any) || 'a4'
  );
  const [pdfStandard, setPdfStandard] = useState<'standard' | 'interactive' | 'pdf_a' | 'pdf_x' | 'pdf_e'>('standard');
  const [excelFitMode, setExcelFitMode] = useState<'fit-columns' | 'fit-sheet' | 'normal'>('fit-columns');
  const [showGridlines, setShowGridlines] = useState(true);
  const [repeatHeaderRow, setRepeatHeaderRow] = useState(true);
  const [filename, setFilename] = useState(documentTitle);
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Synchronized Unified Paper Dimensions & Mathematical Metrics
  const unifiedMetrics = useMemo(() => {
    return calculateUnifiedPaperDimensionsAndScale({
      paperSize,
      orientation,
      margins,
      customMargins: wordState?.customMargins,
      showHeader: wordState?.showHeader !== false,
      showFooter: wordState?.showFooter !== false,
      fontSize: wordState?.fontSize || 14,
      lineSpacing: wordState?.lineSpacing || 1.6,
    });
  }, [paperSize, orientation, margins, wordState]);

  // Synchronized Total Page Count (Exact 100% parity with WordEditor & PrintPreviewModal)
  const documentPages = useMemo(() => {
    if (type !== 'word' || !wordState) return 1;
    const pages = calculateUnifiedDocumentPages(wordState.contentHtml || '', unifiedMetrics);
    return Math.max(1, pages.length);
  }, [type, wordState, unifiedMetrics]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (saveAsDefault) {
        try {
          const defaults = {
            orientation,
            margins,
            paperSize,
            pdfStandard,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('office_default_pdf_settings', JSON.stringify(defaults));
        } catch (e) {
          console.warn('Failed to save default PDF settings:', e);
        }
      }

      await onExport(
        {
          orientation,
          margins,
          paperSize: paperSize as any,
          pdfStandard,
          includeHeaderFooter: true,
          excelFitMode,
          showGridlines,
          repeatHeaderRow,
        },
        filename
      );
      onClose();
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSharePdf = async () => {
    setIsExporting(true);
    try {
      const options: PdfExportOptions = {
        orientation,
        margins,
        paperSize: paperSize as any,
        pdfStandard,
        includeHeaderFooter: true,
        excelFitMode,
        showGridlines,
        repeatHeaderRow,
      };
      const cleanName = filename.trim() || documentTitle;
      if (wordState) {
        const blob = await generateWordPdfBlob(wordState, options);
        await shareDocument(blob, `${cleanName}.pdf`, `مشاركة مستند PDF: ${cleanName}`);
      } else {
        await handleExport();
      }
      onClose();
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.error('Share PDF error:', e);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleDirectPrint = () => {
    if (onPrintDirect) {
      onClose();
      onPrintDirect();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div 
        id="pdf-export-modal"
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200 font-sans"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-linear-to-l from-red-50 via-white to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-xs">
              <FileDown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                تصدير PDF أو طباعة مباشرة
              </h2>
              <p className="text-xs text-slate-500">
                {type === 'word' ? 'تخطيط ومعاينة مستند وورد عالي الدقة' : 'جدول إكسل مع التنسيقات والخلايا'}
              </p>
            </div>
          </div>
          <button
            id="close-pdf-modal-btn"
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
                id="pdf-filename-input"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-hidden font-medium"
                placeholder="اسم الملف"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">
                .pdf
              </span>
            </div>
          </div>

          {/* PDF Standard Profile */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              معيار وتوافق ملف PDF (نظام أندرويد والأجهزة):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { 
                  id: 'standard', 
                  title: 'Standard PDF (القياسي)', 
                  desc: 'مدعوم 100% عبر أي متصفح وقارئ PDF على أندرويد',
                  tag: 'توافق 100%'
                },
                { 
                  id: 'interactive', 
                  title: 'Interactive PDF (تفاعلي)', 
                  desc: 'تعبئة استمارات وكتابة مباشرة (Adobe Acrobat)',
                  tag: 'تفاعلي'
                },
                { 
                  id: 'pdf_a', 
                  title: 'PDF/A (أرشفة وحفظ محمي)', 
                  desc: 'حفظ مستندي طويل الأمد للقراءة الموثقة',
                  tag: 'أرشيف محمي'
                },
                { 
                  id: 'pdf_x', 
                  title: 'PDF/X (مطابع وتجهيز تجاري)', 
                  desc: 'دقة ألوان وطباعة عالية للمطابع التجارية',
                  tag: 'مطابع'
                },
                { 
                  id: 'pdf_e', 
                  title: 'PDF/E (رسوم هندسية)', 
                  desc: 'مخططات وتطبيقات هندسية متخصصة',
                  tag: 'هندسي'
                },
              ].map((std) => (
                <button
                  key={std.id}
                  type="button"
                  onClick={() => setPdfStandard(std.id as any)}
                  className={`p-2.5 text-right rounded-xl border transition text-xs flex flex-col justify-between ${
                    pdfStandard === std.id
                      ? 'border-red-600 bg-red-50/70 text-red-900 shadow-2xs font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{std.title}</span>
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                      {std.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal leading-tight">{std.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Excel Specific Print & Fit Options */}
          {type === 'excel' && (
            <div className="space-y-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <TableIcon className="w-4 h-4 text-emerald-700" />
                  <span>خيارات تناسب وتخطيط جدول Excel:</span>
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  إكسل 📊
                </span>
              </div>

              {/* Column Fit Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-950 block">
                  تناسب الصفحة والتحجيم (Scaling):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setExcelFitMode('fit-columns')}
                    className={`p-2 rounded-xl border text-right transition cursor-pointer ${
                      excelFitMode === 'fit-columns'
                        ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100/50'
                    }`}
                  >
                    <div className="text-[11px] font-bold">تناسب الأعمدة 🎯</div>
                    <div className={`text-[9px] ${excelFitMode === 'fit-columns' ? 'text-emerald-100' : 'text-slate-500'}`}>
                      ملاءمة كافة الأعمدة في الصفحة
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExcelFitMode('fit-sheet')}
                    className={`p-2 rounded-xl border text-right transition cursor-pointer ${
                      excelFitMode === 'fit-sheet'
                        ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100/50'
                    }`}
                  >
                    <div className="text-[11px] font-bold">ملاءمة الورقة 📄</div>
                    <div className={`text-[9px] ${excelFitMode === 'fit-sheet' ? 'text-emerald-100' : 'text-slate-500'}`}>
                      كامل الجدول في صفحة واحدة
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExcelFitMode('normal')}
                    className={`p-2 rounded-xl border text-right transition cursor-pointer ${
                      excelFitMode === 'normal'
                        ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100/50'
                    }`}
                  >
                    <div className="text-[11px] font-bold">الحجم الفعلي 📏</div>
                    <div className={`text-[9px] ${excelFitMode === 'normal' ? 'text-emerald-100' : 'text-slate-500'}`}>
                      الحجم الطبيعي 100%
                    </div>
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-emerald-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-emerald-950">
                  <input
                    type="checkbox"
                    checked={showGridlines}
                    onChange={(e) => setShowGridlines(e.target.checked)}
                    className="accent-emerald-600 rounded cursor-pointer"
                  />
                  <span>إظهار خطوط شبكة الجدول (Gridlines)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-emerald-950">
                  <input
                    type="checkbox"
                    checked={repeatHeaderRow}
                    onChange={(e) => setRepeatHeaderRow(e.target.checked)}
                    className="accent-emerald-600 rounded cursor-pointer"
                  />
                  <span>تكرار صف العناوين في كل صفحة</span>
                </label>
              </div>
            </div>
          )}

          {/* Orientation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                اتجاه الصفحة:
              </label>
              {type === 'excel' && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  موصى به لجداول البيانات: أفقي (Landscape) ↔
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="pdf-orient-portrait"
                onClick={() => setOrientation('portrait')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  orientation === 'portrait'
                    ? 'border-red-600 bg-red-50/60 text-red-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="h-4 w-3.5 border-2 border-current rounded-xs" />
                <span>عمودي (Portrait) ↕</span>
                {orientation === 'portrait' && <Check className="h-3.5 w-3.5 text-red-600 mr-auto" />}
              </button>

              <button
                type="button"
                id="pdf-orient-landscape"
                onClick={() => setOrientation('landscape')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  orientation === 'landscape'
                    ? 'border-red-600 bg-red-50/60 text-red-700 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="h-3 w-4.5 border-2 border-current rounded-xs" />
                <span>أفقي (Landscape) ↔</span>
                {orientation === 'landscape' && <Check className="h-3.5 w-3.5 text-red-600 mr-auto" />}
              </button>
            </div>
          </div>

          {/* Paper Size with focus on A4, Letter, A5 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                حجم الورق الرياضي (A4, Letter, A5):
              </label>
              <span className="text-[10px] font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 font-bold">
                {unifiedMetrics.paperSize}: {unifiedMetrics.widthMm} × {unifiedMetrics.heightMm} مم
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'a4', label: 'A4', desc: '210×297 مم', tag: 'قياسي' },
                { id: 'letter', label: 'Letter', desc: '216×279 مم', tag: 'أمريكي' },
                { id: 'a5', label: 'A5', desc: '148×210 مم', tag: 'كتيب' },
                { id: 'a3', label: 'A3', desc: '297×420 مم', tag: 'كبير' },
                { id: 'legal', label: 'Legal', desc: '216×356 مم', tag: 'قانوني' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  id={`pdf-paper-${p.id}`}
                  onClick={() => setPaperSize(p.id as any)}
                  className={`p-2 text-center rounded-xl border transition-all cursor-pointer ${
                    paperSize === p.id
                      ? 'border-red-600 bg-red-50/70 text-red-800 shadow-xs font-bold ring-2 ring-red-400/40'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold">{p.label}</p>
                    <span className="text-[8px] bg-slate-100 text-slate-500 rounded px-1">{p.tag}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Unified Dimensions & Page Count Live Metric Indicator */}
          <div className="rounded-xl border border-red-200/80 bg-linear-to-l from-red-50/60 via-amber-50/30 to-blue-50/40 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span className="flex items-center gap-1.5 text-red-700">
                <Ratio className="w-3.5 h-3.5 text-red-600" />
                <span>حسابات المقاس والصفحات الموحدة (100% تطابق):</span>
              </span>
              <span className="bg-red-600 text-white font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                {documentPages} {documentPages === 1 ? 'صفحة واحدة' : 'صفحات'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div className="bg-white/80 border border-slate-200/80 p-2 rounded-lg">
                <span className="text-[9px] text-slate-400 block">المقاس الفعلي:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {unifiedMetrics.widthMm} × {unifiedMetrics.heightMm} مم
                </span>
              </div>
              <div className="bg-white/80 border border-slate-200/80 p-2 rounded-lg">
                <span className="text-[9px] text-slate-400 block">الأبعاد (سم و px):</span>
                <span className="font-bold text-slate-800 font-mono">
                  {unifiedMetrics.widthCm}×{unifiedMetrics.heightCm} سم
                </span>
              </div>
              <div className="bg-white/80 border border-slate-200/80 p-2 rounded-lg col-span-2 sm:col-span-1">
                <span className="text-[9px] text-slate-400 block">تطابق العرض والطباعة:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>تطابق متكافئ تماماً</span>
                </span>
              </div>
            </div>
          </div>

          {/* Margins */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              هوامش الصفحة:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: 'عادي', desc: '20 مم' },
                { id: 'narrow', label: 'ضيق', desc: '10 مم' },
                { id: 'wide', label: 'واسع', desc: '30 مم' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  id={`pdf-margin-${m.id}`}
                  onClick={() => setMargins(m.id as any)}
                  className={`p-2 text-center rounded-xl border transition-all ${
                    margins === m.id
                      ? 'border-red-600 bg-red-50/60 text-red-700 shadow-xs font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold">{m.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Save Defaults Checkbox */}
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <BookmarkCheck className="w-3.5 h-3.5 text-red-600" />
                <span>حفظ هذه الإعدادات كافتراضية لعمليات التصدير القادمة</span>
              </span>
            </label>
          </div>
        </div>

        {/* Footer actions with Direct Print and Export */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3.5">
          <button
            type="button"
            onClick={handleDirectPrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-100 transition-colors"
            title="طباعة مباشرة عبر طابعة النظام"
          >
            <Printer className="h-4 w-4 text-blue-600" />
            <span>طباعة مباشرة 🖨️</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="cancel-pdf-btn"
              onClick={onClose}
              disabled={isExporting}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-white transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              id="share-pdf-btn"
              onClick={handleSharePdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-emerald-500 hover:to-teal-500 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              <span>مشاركة PDF 📤</span>
            </button>
            <button
              type="button"
              id="confirm-pdf-export-btn"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جارٍ المعالجة...</span>
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  <span>تصدير ملف PDF الآن</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
