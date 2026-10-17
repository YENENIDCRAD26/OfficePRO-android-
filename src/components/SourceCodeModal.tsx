import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Code, RefreshCw, FileText, Database } from 'lucide-react';
import { WordDocumentState, ExcelState } from '../types';

interface SourceCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'word' | 'excel';
  wordState: WordDocumentState;
  excelState: ExcelState;
  onUpdateWordHtml: (html: string) => void;
  onUpdateExcelState: (state: ExcelState) => void;
}

export const SourceCodeModal: React.FC<SourceCodeModalProps> = ({
  isOpen,
  onClose,
  mode,
  wordState,
  excelState,
  onUpdateWordHtml,
  onUpdateExcelState
}) => {
  const [codeContent, setCodeContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'word') {
        setCodeContent(
          `<!-- Word Document Source HTML (${wordState.title}) -->\n` +
          `<!DOCTYPE html>\n<html dir="rtl" lang="ar">\n<head>\n  <meta charset="UTF-8">\n  <title>${wordState.title}</title>\n</head>\n<body>\n` +
          `  <!-- Header -->\n  <div class="header">${wordState.headerText || ''}</div>\n\n` +
          `  <!-- Body Content -->\n  <main>\n${wordState.contentHtml}\n  </main>\n\n` +
          `  <!-- Footer -->\n  <div class="footer">${wordState.footerText || ''}</div>\n</body>\n</html>`
        );
      } else {
        setCodeContent(JSON.stringify(excelState, null, 2));
      }
      setError(null);
    }
  }, [isOpen, mode, wordState, excelState]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    try {
      if (mode === 'word') {
        const match = codeContent.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
        const htmlToApply = match ? match[1] : codeContent;
        onUpdateWordHtml(htmlToApply);
        alert('تم تحديث كود المستند بنجاح!');
        onClose();
      } else {
        const parsed = JSON.parse(codeContent);
        onUpdateExcelState(parsed);
        alert('تم تحديث جدول البيانات بنجاح!');
        onClose();
      }
    } catch (err: any) {
      setError('خطأ في صيغة الكود: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">نافذة الكود البرمجي وهيكل البيانات (Source Code & HTML)</h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'word' ? 'عرض وتعديل كود HTML للمستند' : 'عرض وتعديل هيكل JSON لبيانات جداول الإكسل'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            {mode === 'word' ? (
              <span className="flex items-center gap-1.5 text-blue-400 font-mono">
                <FileText className="w-3.5 h-3.5" /> HTML5 / Rich Text Source
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <Database className="w-3.5 h-3.5" /> JSON Spreadsheet Schema
              </span>
            )}
            {error && <span className="text-red-400 font-medium mr-3">{error}</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg font-medium shadow-lg transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تطبيق التعديلات</span>
            </button>
          </div>
        </div>

        {/* Code Editor Area */}
        <div className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs text-indigo-200 leading-relaxed">
          <textarea
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            className="w-full h-[55vh] bg-slate-900/80 text-slate-200 border border-slate-800 rounded-xl p-4 font-mono text-xs focus:outline-none focus:border-indigo-500 resize-none selection:bg-indigo-600/40"
            spellCheck={false}
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>حجم الكود: {codeContent.length} حرف</span>
          <span className="text-amber-400">💡 يمكنك تعديل الكود مباشرة وتطبيق التغييرات لينعكس فوراً على المستند.</span>
        </div>

      </div>
    </div>
  );
};
