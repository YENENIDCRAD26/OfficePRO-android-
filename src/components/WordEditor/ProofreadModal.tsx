import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Check, 
  CheckCheck, 
  X, 
  AlertCircle, 
  RotateCw, 
  SpellCheck,
  BookOpen,
  ArrowLeft,
  Info
} from 'lucide-react';
import { ProofreadResult, ProofreadCorrection } from '../../types';

interface ProofreadModalProps {
  isOpen: boolean;
  contentHtml: string;
  onApplyCorrection: (original: string, suggestion: string) => void;
  onApplyAllCorrections: (correctedText: string) => void;
  onClose: () => void;
}

export const ProofreadModal: React.FC<ProofreadModalProps> = ({
  isOpen,
  contentHtml,
  onApplyCorrection,
  onApplyAllCorrections,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ProofreadResult | null>(null);
  const [appliedIndices, setAppliedIndices] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extract clean plain text from HTML
  const getCleanText = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.innerText.trim();
  };

  const handleRunProofread = async () => {
    const text = getCleanText(contentHtml);
    if (!text) {
      setErrorMsg('المستند فارغ! اكتب بعض النصوص أولاً لتتمكن من فحصها وتدقيقها.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setAppliedIndices(new Set());

    try {
      const res = await fetch('/api/proofread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error(`خطأ في استجابة الخادم: ${res.status}`);
      }

      const data: ProofreadResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Proofread fetch error:', err);
      setErrorMsg('تعذر الاتصال بخدمة التدقيق الذكي حالياً. يرجى المحاولة بعد لحظات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleRunProofread();
    } else {
      setResult(null);
      setAppliedIndices(new Set());
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const corrections = result?.corrections || [];
  const spellingCount = corrections.filter((c) => c.type === 'spelling').length;
  const grammarCount = corrections.filter((c) => c.type === 'grammar').length;
  const punctuationCount = corrections.filter((c) => c.type === 'punctuation').length;

  const handleApplySingle = (index: number, original: string, suggestion: string) => {
    onApplyCorrection(original, suggestion);
    setAppliedIndices((prev) => new Set(prev).add(index));
  };

  const handleApplyAll = () => {
    if (result?.correctedText) {
      onApplyAllCorrections(result.correctedText);
      const allIdx = new Set(corrections.map((_, i) => i));
      setAppliedIndices(allIdx);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-right">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                التدقيق اللغوي والنحوي الذكي
                <span className="text-[10px] font-normal bg-white/20 text-blue-100 px-2 py-0.5 rounded-full">
                  محرك التدقيق العربي المحلي
                </span>
              </h2>
              <p className="text-xs text-blue-200">
                فحص الهمزات، التاءات، القواعد الإملائية، النحو وعلامات الترقيم
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRunProofread}
              disabled={loading}
              title="إعادة الفحص"
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <RotateCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-700">جاري التدقيق وفحص المستند عبر الذكاء الاصطناعي...</p>
              <p className="text-xs text-slate-400">نحلل القواعد الإملائية وعلامات الترقيم وتراكيب الجمل</p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">{errorMsg}</p>
                <p className="text-amber-700">تأكد من وجود نص داخل المستند ثم أعد المحاولة.</p>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Summary Badges */}
              <div className="grid grid-cols-4 gap-2 text-center select-none">
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <span className="block text-[11px] text-slate-500 font-medium">إجمالي الملاحظات</span>
                  <span className="text-lg font-bold text-slate-800 font-mono">{corrections.length}</span>
                </div>
                <div className="bg-rose-50/70 border border-rose-200 p-2.5 rounded-xl">
                  <span className="block text-[11px] text-rose-600 font-medium">أخطاء إملائية</span>
                  <span className="text-lg font-bold text-rose-700 font-mono">{spellingCount}</span>
                </div>
                <div className="bg-indigo-50/70 border border-indigo-200 p-2.5 rounded-xl">
                  <span className="block text-[11px] text-indigo-600 font-medium">قواعد ونحو</span>
                  <span className="text-lg font-bold text-indigo-700 font-mono">{grammarCount}</span>
                </div>
                <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-xl">
                  <span className="block text-[11px] text-amber-600 font-medium">علامات ترقيم</span>
                  <span className="text-lg font-bold text-amber-700 font-mono">{punctuationCount}</span>
                </div>
              </div>

              {corrections.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCheck className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">مستندك سليم وخالٍ من الأخطاء!</p>
                  <p className="text-xs text-slate-500">لم يتم رصد أخطاء إملائية أو نحوية في النص الحالي.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium px-1">
                    <span>قائمة الاقتراحات والتصحيحات:</span>
                    <button
                      onClick={handleApplyAll}
                      className="flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>تطبيق كافة الاقتراحات ({corrections.length})</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {corrections.map((item, idx) => {
                      const isApplied = appliedIndices.has(idx);
                      const typeLabel = 
                        item.type === 'spelling' ? 'إملاء' :
                        item.type === 'grammar' ? 'نحو' :
                        item.type === 'punctuation' ? 'ترقيم' : 'أسلوب';

                      return (
                        <div 
                          key={idx} 
                          className={`p-3.5 flex items-center justify-between gap-3 transition ${
                            isApplied ? 'bg-slate-50 opacity-60' : 'hover:bg-blue-50/30'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="line-through text-red-500 font-medium px-1.5 py-0.5 bg-red-50 rounded">
                                {item.original}
                              </span>
                              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-emerald-700 font-bold px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                                {item.suggestion}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                {typeLabel}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Info className="w-3 h-3 text-slate-400" />
                              <span>{item.explanation}</span>
                            </p>
                          </div>

                          <button
                            onClick={() => handleApplySingle(idx, item.original, item.suggestion)}
                            disabled={isApplied}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                              isApplied
                                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isApplied ? 'تم التطبيق' : 'تطبيق'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>يمكنك مراجعة كل كلمة واختيار تطبيقها بشكل فردي أو جماعي.</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
