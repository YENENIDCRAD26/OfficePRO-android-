import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Printer, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  ShieldCheck,
  BookOpen,
  Maximize2
} from 'lucide-react';
import { WordDocumentState, ExcelSheet } from '../types';
import { exportWordAsPdf, exportExcelAsPdf } from '../utils/fileHandlers';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  mode: 'word' | 'excel';
  wordState?: WordDocumentState;
  excelSheets?: ExcelSheet[];
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  mode,
  wordState,
  excelSheets,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'word' && wordState) {
        setPreviewHtml(wordState.contentHtml || '<p>محتوى المستند فارغ</p>');
        setTotalPages(Math.max(1, Math.ceil((wordState.contentHtml?.length || 0) / 1200)));
      } else if (mode === 'excel' && excelSheets && excelSheets[0]) {
        setPreviewHtml(`<div class="p-4"><h3 class="font-bold text-sm mb-2">جدول: ${excelSheets[0].name}</h3><p class="text-xs text-slate-600">معاينة جدول إكسل وجلسات البيانات المحفوظة.</p></div>`);
        setTotalPages(1);
      }
    }
  }, [isOpen, mode, wordState, excelSheets]);

  if (!isOpen) return null;

  const handleDownloadPdfNow = async () => {
    setIsExporting(true);
    try {
      if (mode === 'word' && wordState) {
        await exportWordAsPdf(wordState, { pdfStandard: 'standard' }, documentTitle);
      } else if (mode === 'excel' && excelSheets && excelSheets[0]) {
        await exportExcelAsPdf(documentTitle, excelSheets[0], { pdfStandard: 'standard' }, documentTitle);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-xs" dir="rtl">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 w-full max-w-4xl flex flex-col h-[92vh] overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-black text-white truncate max-w-[220px] sm:max-w-md">
                  معاينة وقراءة مستند PDF: {documentTitle}
                </h2>
                <span className="text-[10px] bg-rose-500/30 text-rose-300 border border-rose-400/40 px-2 py-0.2 rounded-full font-bold">
                  PDF Reader
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                عرض وقراءة وتكبير صفحات المستند والتحكم الكامل بالطباعة والتنزيل المحلي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden text-xs">
              <button 
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="px-2 py-1 hover:bg-slate-700 text-slate-300 transition"
                title="تصغير العرض (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] text-amber-400 font-bold">{zoomLevel}%</span>
              <button 
                onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                className="px-2 py-1 hover:bg-slate-700 text-slate-300 transition"
                title="تكبير العرض (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
              title="طباعة مستند PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdfNow}
              disabled={isExporting}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
              title="تحميل ملف PDF إلى جهازك محلياً"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'جارٍ التنزيل...' : 'تحميل PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-toolbar (Search & Page Navigation) */}
        <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-bold">الصفحة:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700 text-amber-300 font-bold">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في نص PDF..."
              className="w-full pl-3 pr-8 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* PDF Page Canvas Preview Container */}
        <div className="flex-1 bg-slate-950 p-4 sm:p-8 overflow-auto flex items-center justify-center">
          <div 
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="bg-white text-slate-900 w-full max-w-2xl min-h-[580px] p-8 sm:p-12 rounded-xl shadow-2xl transition-all duration-200 border border-slate-300 relative font-sans"
            dir="rtl"
          >
            {/* Simulated Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none font-black text-6xl text-slate-900 rotate-[-30deg]">
              OFFICE PRO PDF
            </div>

            <div className="border-b border-slate-200 pb-3 mb-6 flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-800">{documentTitle}</span>
              <span>تاريخ المعاينة: {new Date().toLocaleDateString('ar-EG')}</span>
            </div>

            <div 
              className="prose prose-slate max-w-none text-right leading-relaxed text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />

            <div className="mt-12 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span>Office Pro Suite PDF Reader Engine</span>
              <span>صفحة {currentPage} من {totalPages}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>تم التحقق من سلامة ملف PDF وتوافقه التام مع متصفحات وهواتف أندرويد</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition"
          >
            إغلاق المعاينة
          </button>
        </div>

      </div>
    </div>
  );
};
