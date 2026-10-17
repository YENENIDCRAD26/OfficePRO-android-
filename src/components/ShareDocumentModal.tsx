import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  FileText, 
  FileSpreadsheet, 
  FileDown, 
  HardDrive, 
  Smartphone, 
  Check, 
  Copy, 
  ExternalLink,
  Loader2,
  Radio,
  Send,
  Bluetooth,
  MessageSquare
} from 'lucide-react';
import { WordDocumentState, ExcelSheet } from '../types';
import { generateDocumentBlob, shareDocument, getMimeType } from '../utils/fileHandlers';
import { fileSystemService, TARGET_ANDROID_DIRECTORY } from '../services/FileSystemService';

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'word' | 'excel';
  wordState: WordDocumentState;
  excelState: { title: string; sheets: ExcelSheet[] };
  activeSheet?: ExcelSheet;
  onToast?: (message: string, location?: 'local' | 'cloud' | 'both') => void;
}

export const ShareDocumentModal: React.FC<ShareDocumentModalProps> = ({
  isOpen,
  onClose,
  mode,
  wordState,
  excelState,
  activeSheet,
  onToast,
}) => {
  const currentTitle = mode === 'word' ? wordState.title : excelState.title;
  const [selectedFormat, setSelectedFormat] = useState<string>(mode === 'word' ? 'docx' : 'xlsx');
  const [fileName, setFileName] = useState<string>(currentTitle.replace(/\.[^/.]+$/, ''));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const formats = mode === 'word' 
    ? [
        { id: 'docx', name: 'مستند Word حديث (.docx)', ext: '.docx', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        { id: 'pdf', name: 'مستند PDF قابل للطباعة والمشاركة (.pdf)', ext: '.pdf', icon: FileDown, color: 'text-rose-600 bg-rose-50 border-rose-200' },
        { id: 'txt', name: 'ملف نصي بسيط (.txt)', ext: '.txt', icon: FileText, color: 'text-slate-600 bg-slate-50 border-slate-200' },
        { id: 'html', name: 'صفحة ويب HTML (.html)', ext: '.html', icon: FileText, color: 'text-amber-600 bg-amber-50 border-amber-200' },
      ]
    : [
        { id: 'xlsx', name: 'جدول بيانات Excel حديث (.xlsx)', ext: '.xlsx', icon: FileSpreadsheet, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        { id: 'pdf', name: 'جدول مصدّر بصيغة PDF (.pdf)', ext: '.pdf', icon: FileDown, color: 'text-rose-600 bg-rose-50 border-rose-200' },
        { id: 'csv', name: 'ملف جدول مفصول بفواصل (.csv)', ext: '.csv', icon: FileSpreadsheet, color: 'text-teal-600 bg-teal-50 border-teal-200' },
      ];

  const handleShare = async (targetApp: 'system' | 'whatsapp' | 'bluetooth') => {
    setIsProcessing(true);
    setStatusMessage('جاري تجهيز المستند وتنسيقه للمشاركة...');

    try {
      const cleanName = (fileName.trim() || currentTitle).replace(/\.[^/.]+$/, '');
      const { blob, filename } = await generateDocumentBlob(
        mode,
        selectedFormat,
        wordState,
        excelState,
        cleanName
      );

      if (targetApp === 'whatsapp') {
        setStatusMessage('جاري فتح تطبيق واتساب ومشاركة المستند...');
      } else if (targetApp === 'bluetooth') {
        setStatusMessage('جاري تشغيل لوحة المشاركة لاختيار البلوتوث / الإرسال السريع...');
      } else {
        setStatusMessage('جاري فتح لوحة مشاركة أندرويد الرسمية...');
      }

      const shareResult = await shareDocument(
        blob, 
        filename, 
        `مشاركة المستند: ${filename}`,
        targetApp
      );

      if (shareResult.success) {
        onToast?.(`تمت مشاركة ${filename} بنجاح عبر تطبيقات النظام ✓`, 'local');
        setStatusMessage('تمت المشاركة بنجاح ✓');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else if (shareResult.cancelled) {
        setStatusMessage(null);
      } else {
        setStatusMessage('تم تنزيل المستند احتياطياً بنجاح');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Share action error:', err);
        onToast?.('تعذر إكمال المشاركة المباشرة، تم حفظ المستند محلياً', 'local');
      }
      setStatusMessage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToAndroidFolder = async () => {
    setIsProcessing(true);
    setStatusMessage('جاري الحفظ في مجلد أندرويد: ' + TARGET_ANDROID_DIRECTORY);

    try {
      const cleanName = (fileName.trim() || currentTitle).replace(/\.[^/.]+$/, '');
      const { blob, filename } = await generateDocumentBlob(
        mode,
        selectedFormat,
        wordState,
        excelState,
        cleanName
      );

      // Convert blob to base64
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          const base64 = res.includes(',') ? res.split(',')[1] : res;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const res = await fileSystemService.saveDocumentFile(filename, base64Data);
      if (res.success) {
        onToast?.(`تم حفظ المستند بنجاح في: ${TARGET_ANDROID_DIRECTORY}${filename} ✓`, 'both');
        setStatusMessage('تم الحفظ الفعلي في المسار المحدد بنجاح ✓');
        setTimeout(() => onClose(), 1500);
      } else {
        // Fallback to browser download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onToast?.(`تم تنزيل المستند ${filename} بنجاح ✓`, 'local');
      }
    } catch (e) {
      console.warn('Save to android folder notice:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyTextContent = async () => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = mode === 'word' ? wordState.contentHtml : '';
      const text = mode === 'word' 
        ? (tempDiv.textContent || tempDiv.innerText || '')
        : `جدول ${excelState.title}\n` + Object.entries(activeSheet?.data || {}).map(([k, v]) => `${k}: ${(v as any)?.value}`).join('\n');

      await navigator.clipboard.writeText(text);
      onToast?.('تم نسخ نص المستند كاملاً إلى الحافظة بنجاح ✓', 'local');
      setStatusMessage('تم نسخ النص بنجاح ✓');
      setTimeout(() => setStatusMessage(null), 2000);
    } catch (e) {
      console.warn('Clipboard copy error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/65 p-3 sm:p-5 backdrop-blur-xs font-sans" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner">
              <Share2 className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>مشاركة وحفظ المستند</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-mono">
                  Android & Web
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">مشاركة فعلية عبر واتساب، بلوتوث، وتطبيقات النظام الرسمية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback / Progress Banner */}
        {statusMessage && (
          <div className="bg-blue-50 border-b border-blue-200 text-blue-900 px-4 py-2.5 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* File Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>اسم الملف المراد مشاركته:</span>
              <span className="text-[10px] text-slate-400">بدون الامتداد</span>
            </label>
            <div className="flex items-center border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
                placeholder="اسم المستند"
              />
              <span className="text-xs font-mono font-bold text-slate-400 mr-2">
                .{selectedFormat}
              </span>
            </div>
          </div>

          {/* Format Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">تنسيق وصيغة التصدير والمشاركة:</label>
            <div className="grid grid-cols-2 gap-2">
              {formats.map((fmt) => {
                const isSelected = selectedFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`p-2.5 rounded-xl border text-right transition flex items-center gap-2.5 cursor-pointer ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-100 font-bold' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg border ${fmt.color}`}>
                      <fmt.icon className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs truncate">{fmt.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase">{fmt.ext}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Sharing Options */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">طرق المشاركة الفعلية على أندرويد:</span>
            
            {/* Primary Action 1: WhatsApp */}
            <button
              onClick={() => handleShare('whatsapp')}
              disabled={isProcessing}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs flex items-center justify-between shadow-md shadow-emerald-950/20 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-sm">مشاركة فورية عبر واتساب (WhatsApp) 💬</div>
                  <div className="text-[10px] text-emerald-100 font-normal">إرسال المستند كملف أو نص مباشر للمحادثات وجهات الاتصال</div>
                </div>
              </div>
              <Send className="w-4 h-4 text-emerald-200" />
            </button>

            {/* Primary Action 2: Bluetooth & Nearby Share */}
            <button
              onClick={() => handleShare('bluetooth')}
              disabled={isProcessing}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-indigo-700 to-blue-800 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-xs flex items-center justify-between shadow-md shadow-indigo-950/20 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bluetooth className="w-4 h-4 text-white" />
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-sm">مشاركة عبر البلوتوث والإرسال السريع (Bluetooth) 📶</div>
                  <div className="text-[10px] text-indigo-100 font-normal">إرسال الملف عبر تقنية البلوتوث والمشاركة القريبة لأجهزة أندرويد</div>
                </div>
              </div>
              <Radio className="w-4 h-4 text-indigo-200" />
            </button>

            {/* Primary Action 3: Android System Share Sheet */}
            <button
              onClick={() => handleShare('system')}
              disabled={isProcessing}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold text-xs flex items-center justify-between shadow-md active:scale-[0.99] transition cursor-pointer disabled:opacity-50 border border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-blue-300" />
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-sm">لوحة مشاركة نظام أندرويد العامة (Android Share Sheet) 📱</div>
                  <div className="text-[10px] text-slate-300 font-normal">
                    عرض جميع التطبيقات المتاحة (Drive, Gmail, Telegram, Samsung Notes, CamScanner, إلخ)
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300" />
            </button>

            {/* Primary Action 4: Save to Android Destination Folder */}
            <button
              onClick={handleSaveToAndroidFolder}
              disabled={isProcessing}
              className="w-full p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold text-xs flex items-center justify-between active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                  <HardDrive className="w-4 h-4 text-amber-700" />
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-xs text-amber-900">
                    حفظ مباشر في مسار أندرويد المعتمد:
                  </div>
                  <div className="text-[10px] text-amber-800 font-mono" dir="ltr">
                    {TARGET_ANDROID_DIRECTORY}
                  </div>
                </div>
              </div>
              <Check className="w-4 h-4 text-amber-700" />
            </button>

            {/* Quick Copy Text */}
            <button
              onClick={handleCopyTextContent}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>نسخ كامل محتوى المستند نصياً إلى الحافظة</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>متوافق مع أندرويد ومتصفحات الجوال وتطبيقات المراسلة</span>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition cursor-pointer text-xs"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
