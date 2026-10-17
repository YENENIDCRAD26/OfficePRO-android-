import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Share2, 
  Check, 
  Camera, 
  Sparkles, 
  Maximize2,
  FileImage,
  ShieldCheck
} from 'lucide-react';
import { downloadBlob, shareDocument, dataURLToBlob } from '../utils/fileHandlers';

interface ScreenshotPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshotDataUrl: string;
  screenshotBlob?: Blob | null;
  documentTitle: string;
  pageNumber?: number;
  width?: number;
  height?: number;
}

export const ScreenshotPreviewModal: React.FC<ScreenshotPreviewModalProps> = ({
  isOpen,
  onClose,
  screenshotDataUrl,
  screenshotBlob,
  documentTitle,
  pageNumber = 1,
  width = 2480,
  height = 3508
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen || !screenshotDataUrl) return null;

  const cleanTitle = documentTitle.replace(/\.[^/.]+$/, '');
  const baseFilename = `${cleanTitle}_صفحة_${pageNumber}_لقطة_شاشة_300dpi`;

  const handleDownloadPng = () => {
    try {
      const link = document.createElement('a');
      link.href = screenshotDataUrl;
      link.download = `${baseFilename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess('PNG');
      setTimeout(() => setDownloadSuccess(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadJpg = () => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || width;
        canvas.height = img.naturalHeight || height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              downloadBlob(blob, `${baseFilename}.jpg`);
              setDownloadSuccess('JPG');
              setTimeout(() => setDownloadSuccess(null), 2500);
            }
          }, 'image/jpeg', 0.95);
        }
      };
      img.src = screenshotDataUrl;
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrintScreenshot = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <title>${cleanTitle} - لقطة شاشة 300 DPI</title>
          <style>
            @page { margin: 0; size: auto; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; background: #fff; }
            img { max-width: 100vw; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${screenshotDataUrl}" onload="window.print(); window.close();" />
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      if (screenshotBlob && navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({
            'image/png': screenshotBlob
          })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        const response = await fetch(screenshotDataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({
            'image/png': blob
          })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const handleShare = async () => {
    try {
      const blob = screenshotBlob || dataURLToBlob(screenshotDataUrl);
      await shareDocument(blob, `${baseFilename}.png`, cleanTitle);
    } catch (e) {
      console.warn('Share error or canceled', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 select-none animate-in fade-in" dir="rtl">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-white">
                  معاينة لقطة شاشة الصفحة (دقة 300 نقطة في البوصة 📸)
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded-full font-bold">
                  300 DPI مقصوصة تماماً
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                مقصوصة على مقاس وإطار الورقة بالكامل دون أي عناصر خارجية • صفحة {pageNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {width} × {height} px
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Preview Canvas */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-950 flex items-center justify-center relative min-h-[300px]">
          <div className="relative group shadow-2xl rounded-sm overflow-hidden border border-slate-700/80 bg-white">
            <img 
              src={screenshotDataUrl} 
              alt="لقطة شاشة الصفحة المعاينة" 
              className="max-h-[62vh] max-w-full object-contain mx-auto block select-none"
            />
            {/* Watermark badge of 300 DPI */}
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded-md font-mono flex items-center gap-1 border border-white/10 pointer-events-none">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>300 DPI Ultra HD</span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          {/* Direct Download Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download PNG Direct */}
            <button
              onClick={handleDownloadPng}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-md cursor-pointer ${
                downloadSuccess === 'PNG' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
              }`}
              title="تحميل فوري بصيغة PNG فائقة النقاء 300 DPI"
            >
              {downloadSuccess === 'PNG' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{downloadSuccess === 'PNG' ? 'تم تنزيل PNG ✓' : 'تحميل PNG فوري (نقية 300 DPI) 🖼️'}</span>
            </button>

            {/* Download JPG Direct */}
            <button
              onClick={handleDownloadJpg}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-md cursor-pointer ${
                downloadSuccess === 'JPG' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/50'
              }`}
              title="تحميل فوري بصيغة JPG خفيفة وعالية الوضوح"
            >
              {downloadSuccess === 'JPG' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{downloadSuccess === 'JPG' ? 'تم تنزيل JPG ✓' : 'تحميل JPG فوري (خفيفة واضحة) 📸'}</span>
            </button>

            {/* Print Screenshot */}
            <button
              onClick={handlePrintScreenshot}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition active:scale-95 cursor-pointer"
              title="طباعة لقطة الشاشة مباشرة"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>طباعة 🖨️</span>
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2">
            {/* Copy to Clipboard */}
            <button
              onClick={handleCopyToClipboard}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition active:scale-95 cursor-pointer ${
                copied 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="نسخ الصورة للحافظة للصق في برامج أخرى"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'تم النسخ ✓' : 'نسخ للصورة 📋'}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition active:scale-95 cursor-pointer"
              title="مشاركة الصورة"
            >
              <Share2 className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">مشاركة 🔗</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
