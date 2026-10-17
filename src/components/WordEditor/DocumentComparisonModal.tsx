import React, { useState } from 'react';
import { X, FileDiff, Sparkles, Check, ArrowRight, Upload } from 'lucide-react';

interface DocumentComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocumentText: string;
}

export const DocumentComparisonModal: React.FC<DocumentComparisonModalProps> = ({
  isOpen,
  onClose,
  currentDocumentText,
}) => {
  const [docA, setDocA] = useState(currentDocumentText);
  const [docB, setDocB] = useState('مذكرة اعتراضية مقدمة من المستأنف ضد الحكم الصادر عن محكمة القفر الابتدائية.\n\nوبعد الاطلاع على الأوراق وسماع المرافعات، تبين أن الحكم الصادر غير مسبب بما فيه الكفاية، ونطلب نقض الحكم وإعادة الأوراق لفصلها من جديد.');
  const [diffResult, setDiffResult] = useState<Array<{ type: 'equal' | 'added' | 'deleted'; text: string }>>([]);
  const [isCompared, setIsCompared] = useState(false);

  if (!isOpen) return null;

  const handleCompare = () => {
    const wordsA = docA.split(/\s+/);
    const wordsB = docB.split(/\s+/);
    
    const result: Array<{ type: 'equal' | 'added' | 'deleted'; text: string }> = [];
    let i = 0, j = 0;
    while (i < wordsA.length || j < wordsB.length) {
      if (i < wordsA.length && j < wordsB.length && wordsA[i] === wordsB[j]) {
        result.push({ type: 'equal', text: wordsA[i] + ' ' });
        i++;
        j++;
      } else {
        if (i < wordsA.length) {
          result.push({ type: 'deleted', text: wordsA[i] + ' ' });
          i++;
        }
        if (j < wordsB.length) {
          result.push({ type: 'added', text: wordsB[j] + ' ' });
          j++;
        }
      }
    }
    setDiffResult(result);
    setIsCompared(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <FileDiff className="w-5 h-5 text-blue-400" />
            <span>مقارنة المستندات وعرض الفروقات (Document Comparison)</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-right">
          <p className="text-xs text-slate-600">
            قارن بين نسختين من المستندات القانونية أو الإدارية لتحديد التعديلات، الإضافات، والحذف بشكل مرئي دقيق.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">المستند الأول (الأصلي / النسخة أ):</label>
              <textarea
                value={docA}
                onChange={(e) => setDocA(e.target.value)}
                className="w-full h-36 p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-sans resize-none"
                placeholder="أدخل النص الأصلي هنا..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">المستند الثاني (المعدل / النسخة ب):</label>
              <textarea
                value={docB}
                onChange={(e) => setDocB(e.target.value)}
                className="w-full h-36 p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-sans resize-none"
                placeholder="أدخل النص المعدل هنا..."
              />
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleCompare}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <FileDiff className="w-4 h-4" />
              <span>بدء تحليل ومقارنة الفروقات</span>
            </button>
          </div>

          {isCompared && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">نتيجة ومخرجات المقارنة البصرية:</span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> تمت إضافته
                  </span>
                  <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> تم حذفه
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed max-h-60 overflow-y-auto font-sans text-slate-800">
                {diffResult.map((part, idx) => {
                  if (part.type === 'added') {
                    return (
                      <span key={idx} className="bg-emerald-100 text-emerald-900 px-1 rounded font-semibold underline decoration-emerald-400">
                        {part.text}
                      </span>
                    );
                  }
                  if (part.type === 'deleted') {
                    return (
                      <span key={idx} className="bg-rose-100 text-rose-900 px-1 rounded line-through opacity-75">
                        {part.text}
                      </span>
                    );
                  }
                  return <span key={idx}>{part.text}</span>;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-300 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
