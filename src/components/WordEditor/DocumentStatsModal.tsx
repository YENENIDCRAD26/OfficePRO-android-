import React, { useMemo } from 'react';
import { 
  X, 
  BarChart3, 
  FileText, 
  Clock, 
  AlignRight, 
  Layers, 
  Hash, 
  CheckCircle2, 
  BookOpen, 
  Type 
} from 'lucide-react';

interface DocumentStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  contentHtml: string;
}

export const DocumentStatsModal: React.FC<DocumentStatsModalProps> = ({
  isOpen,
  onClose,
  title,
  contentHtml,
}) => {
  const stats = useMemo(() => {
    const temp = document.createElement('div');
    temp.innerHTML = contentHtml || '';
    const text = temp.innerText || temp.textContent || '';
    const trimmed = text.trim();

    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const charCountWithSpaces = text.length;
    const charCountWithoutSpaces = text.replace(/\s/g, '').length;

    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    const paragraphCount = Math.max(paragraphs.length, wordCount > 0 ? 1 : 0);

    const sentences = text.split(/[.!?؟؛\n]+/).filter(s => s.trim().length > 0);
    const sentenceCount = Math.max(sentences.length, wordCount > 0 ? 1 : 0);

    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));
    const speakingTimeMinutes = Math.max(1, Math.ceil(wordCount / 130));

    // Estimate pages based on standard A4 page (approx. 250 words per page)
    const estimatedPages = Math.max(1, Math.ceil(wordCount / 250));

    return {
      wordCount,
      charCountWithSpaces,
      charCountWithoutSpaces,
      paragraphCount,
      sentenceCount,
      readingTimeMinutes,
      speakingTimeMinutes,
      estimatedPages,
    };
  }, [contentHtml]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-xl">
              <BarChart3 className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-sm font-bold">إحصائيات وبيانات المستند</h2>
              <p className="text-[10px] text-blue-200 truncate max-w-[220px]">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-700 font-bold mb-1">
                <span>عدد الكلمات:</span>
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-blue-900 font-mono">{stats.wordCount.toLocaleString('ar-EG')}</span>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-indigo-700 font-bold mb-1">
                <span>الأحرف (مع مسافات):</span>
                <Type className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black text-indigo-900 font-mono">{stats.charCountWithSpaces.toLocaleString('ar-EG')}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-slate-600 font-bold text-[11px] mb-0.5">
                <span>الأحرف (بدون مسافات):</span>
                <Hash className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-base font-bold text-slate-800 font-mono">{stats.charCountWithoutSpaces.toLocaleString('ar-EG')}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-slate-600 font-bold text-[11px] mb-0.5">
                <span>عدد الفقرات:</span>
                <AlignRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-base font-bold text-slate-800 font-mono">{stats.paragraphCount.toLocaleString('ar-EG')}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-slate-600 font-bold text-[11px] mb-0.5">
                <span>عدد الجمل:</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-base font-bold text-slate-800 font-mono">{stats.sentenceCount.toLocaleString('ar-EG')}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-slate-600 font-bold text-[11px] mb-0.5">
                <span>الصفحات التقديرية:</span>
                <Layers className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-base font-bold text-slate-800 font-mono">{stats.estimatedPages.toLocaleString('ar-EG')}</span>
            </div>
          </div>

          {/* Time metrics */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <div>
                <span className="font-bold block">الوقت التقديري للقراءة:</span>
                <span className="text-[10px] text-amber-800">حوالي {stats.readingTimeMinutes} دقيقة قراءة صامتة</span>
              </div>
            </div>
            <div className="text-left font-mono font-bold text-amber-900 text-sm">
              ~{stats.speakingTimeMinutes} دقيقة إلقاء
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
