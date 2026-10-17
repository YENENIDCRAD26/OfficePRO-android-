import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Check, 
  CheckCheck, 
  X, 
  AlertCircle, 
  RotateCw, 
  BookOpen,
  ArrowLeft,
  Info,
  Copy,
  Scissors
} from 'lucide-react';
import { ProofreadResult } from '../../types';

interface ProofreadAssistantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedText?: string;
  onApplyCorrection?: (original: string, suggestion: string) => void;
  onReplaceSelection?: (correctedText: string) => void;
}

export const ProofreadAssistantSidebar: React.FC<ProofreadAssistantSidebarProps> = ({
  isOpen,
  onClose,
  initialSelectedText = '',
  onApplyCorrection,
  onReplaceSelection,
}) => {
  const [textInput, setTextInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ProofreadResult | null>(null);
  const [appliedIndices, setAppliedIndices] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Update textInput when initialSelectedText changes or sidebar opens
  useEffect(() => {
    if (isOpen) {
      // Get current selection from window if initialSelectedText is empty
      const sel = window.getSelection()?.toString()?.trim();
      const textToUse = sel || initialSelectedText || '';
      setTextInput(textToUse);
      setResult(null);
      setAppliedIndices(new Set());
      setErrorMsg(null);

      if (textToUse) {
        handleRunProofread(textToUse);
      }
    }
  }, [isOpen, initialSelectedText]);

  const handleRunProofread = async (textToCheck?: string) => {
    const targetText = textToCheck !== undefined ? textToCheck : textInput;
    if (!targetText.trim()) {
      setErrorMsg('يرجى تحديد نص في المحرر أو إدخال نص لفحصه.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setAppliedIndices(new Set());

    try {
      const res = await fetch('/api/proofread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: targetText }),
      });

      if (!res.ok) {
        throw new Error(`خطأ في خادم التدقيق: ${res.status}`);
      }

      const data: ProofreadResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Proofread assistant error:', err);
      setErrorMsg('تعذر الاتصال بنقطة النهاية /api/proofread. يرجى التأكد من تشغيل الخادم.');
    } finally {
      setLoading(false);
    }
  };

  const handleGrabCurrentSelection = () => {
    const sel = window.getSelection()?.toString()?.trim();
    if (sel) {
      setTextInput(sel);
      handleRunProofread(sel);
    } else {
      setErrorMsg('لم يتم تحديد أي نص في المستند حالياً. قم بتظليل نص في المحرر أولاً.');
    }
  };

  if (!isOpen) return null;

  const corrections = result?.corrections || [];
  const spellingCount = corrections.filter((c) => c.type === 'spelling').length;
  const grammarCount = corrections.filter((c) => c.type === 'grammar').length;
  const punctuationCount = corrections.filter((c) => c.type === 'punctuation').length;

  const handleApplySingle = (index: number, original: string, suggestion: string) => {
    if (onApplyCorrection) {
      onApplyCorrection(original, suggestion);
    }
    setAppliedIndices((prev) => new Set(prev).add(index));
  };

  const handleApplyAll = () => {
    if (result?.correctedText && onReplaceSelection) {
      onReplaceSelection(result.correctedText);
      const allIdx = new Set(corrections.map((_, i) => i));
      setAppliedIndices(allIdx);
    }
  };

  const handleCopyCorrected = () => {
    if (result?.correctedText) {
      navigator.clipboard.writeText(result.correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside 
      className="fixed top-0 left-0 bottom-0 w-96 bg-white shadow-2xl border-r border-slate-200 z-50 flex flex-col overflow-hidden text-right animate-in slide-in-from-left duration-200"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="font-bold text-sm flex items-center gap-1.5">
              مساعد التدقيق الذكي
              <span className="text-[9px] font-normal bg-white/20 text-blue-100 px-1.5 py-0.5 rounded-full font-mono">
                /api/proofread
              </span>
            </h2>
            <p className="text-[11px] text-blue-200">تدقيق إملائي ونحوي فوري للنص المحدد</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleRunProofread()}
            disabled={loading}
            title="إعادة الفحص"
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            title="إغلاق النافذة الجانبية"
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toolbar / Selection Grabber */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5 text-blue-600" />
            <span>النص المراد تدقيقه:</span>
          </span>
          <button
            onClick={handleGrabCurrentSelection}
            className="text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition"
          >
            استيراد النص المظلل حالياً
          </button>
        </div>

        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="حدد نصاً في المستند أو ألصقه هنا للتدقيق..."
          rows={3}
          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 resize-none font-sans leading-relaxed"
        />

        <div className="flex justify-end">
          <button
            onClick={() => handleRunProofread()}
            disabled={loading || !textInput.trim()}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>فحص وتدقيق النص</span>
          </button>
        </div>
      </div>

      {/* Body Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-100/50">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <RotateCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-700">جاري إرسال النص إلى نقطة النهاية /api/proofread...</p>
            <p className="text-[11px] text-slate-400">تحليل الأخطاء الإملائية والنحوية وعلامات الترقيم</p>
          </div>
        ) : errorMsg ? (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-medium">{errorMsg}</p>
          </div>
        ) : result ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center select-none">
              <div className="bg-white border border-slate-200 p-2 rounded-lg shadow-2xs">
                <span className="block text-[10px] text-slate-500">ملاحظات</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{corrections.length}</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg shadow-2xs">
                <span className="block text-[10px] text-rose-600">إملاء</span>
                <span className="text-sm font-bold text-rose-700 font-mono">{spellingCount}</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 p-2 rounded-lg shadow-2xs">
                <span className="block text-[10px] text-indigo-600">نحو وترقيم</span>
                <span className="text-sm font-bold text-indigo-700 font-mono">{grammarCount + punctuationCount}</span>
              </div>
            </div>

            {corrections.length === 0 ? (
              <div className="py-12 text-center space-y-2 bg-white rounded-xl border border-slate-200 p-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCheck className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">النص سليم تماماً وخالٍ من الأخطاء!</p>
                <p className="text-[11px] text-slate-500">لم يتم رصد أي تعديلات مطلوبة في النص المحدد.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium px-1">
                  <span>الاقتراحات التصحيحية:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyCorrected}
                      title="نسخ النص بعد التصحيح"
                      className="flex items-center gap-1 text-slate-700 hover:text-blue-700 bg-white hover:bg-slate-50 px-2.5 py-1 rounded border border-slate-300 transition text-[10px] font-bold"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'تم النسخ!' : 'نسخ الكل'}</span>
                    </button>
                    {onReplaceSelection && (
                      <button
                        onClick={handleApplyAll}
                        className="flex items-center gap-1 text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded border border-blue-200 transition text-[10px] font-bold"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>تطبيق الكل</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {corrections.map((item, idx) => {
                    const isApplied = appliedIndices.has(idx);
                    const typeLabel = 
                      item.type === 'spelling' ? 'إملاء' :
                      item.type === 'grammar' ? 'نحو' :
                      item.type === 'punctuation' ? 'ترقيم' : 'أسلوب';

                    return (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-xl border transition bg-white space-y-2 shadow-2xs ${
                          isApplied ? 'opacity-50 bg-slate-50 border-slate-200' : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs flex-wrap">
                            <span className="line-through text-red-600 font-medium px-1 bg-red-50 rounded">
                              {item.original}
                            </span>
                            <ArrowLeft className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="text-emerald-700 font-bold px-1.5 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                              {item.suggestion}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full">
                              {typeLabel}
                            </span>
                          </div>

                          {onApplyCorrection && (
                            <button
                              onClick={() => handleApplySingle(idx, item.original, item.suggestion)}
                              disabled={isApplied}
                              className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded font-semibold transition shrink-0 ${
                                isApplied
                                  ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>{isApplied ? 'تم' : 'تطبيق'}</span>
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 flex items-start gap-1 leading-relaxed">
                          <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span>{item.explanation}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center space-y-2 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-xs">اضغط على "فحص وتدقيق النص" أو استيراد النص المظلل للبدء.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white px-4 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
        <span className="text-[10px] text-slate-500 font-mono">
          مُتصل بنقطة النهاية: /api/proofread
        </span>
        <button
          onClick={onClose}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
        >
          إغلاق النافذة
        </button>
      </div>
    </aside>
  );
};
