import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  CheckCheck, 
  X, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeftRight,
  HelpCircle,
  FileText
} from 'lucide-react';

export interface ProofreadCorrection {
  original: string;
  suggestion: string;
  type: 'spelling' | 'grammar' | 'punctuation' | 'style';
  explanation: string;
}

interface ArabicProofreaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentText: string;
  onApplyCorrection: (original: string, suggestion: string) => void;
  onApplyAllCorrections: (corrections: ProofreadCorrection[]) => void;
}

export const ArabicProofreaderModal: React.FC<ArabicProofreaderModalProps> = ({
  isOpen,
  onClose,
  documentText,
  onApplyCorrection,
  onApplyAllCorrections,
}) => {
  const [inputText, setInputText] = useState(documentText);
  const [isLoading, setIsLoading] = useState(false);
  const [corrections, setCorrections] = useState<ProofreadCorrection[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [appliedIndices, setAppliedIndices] = useState<Set<number>>(new Set());
  const [engineSource, setEngineSource] = useState<'gemini' | 'rules'>('gemini');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      // Strip HTML tags for clean Arabic text inspection
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = documentText;
      const plainText = tempDiv.innerText || tempDiv.textContent || '';
      setInputText(plainText.trim());
      setAppliedIndices(new Set());
      setErrorMessage(null);
      if (plainText.trim().length > 0) {
        handleRunProofread(plainText.trim());
      }
    }
  }, [isOpen, documentText]);

  const handleRunProofread = async (textToScan: string) => {
    if (!textToScan || textToScan.trim().length === 0) {
      setCorrections([]);
      setHasScanned(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAppliedIndices(new Set());

    try {
      const response = await fetch('/api/proofread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToScan }),
      });

      if (!response.ok) {
        throw new Error('تعذر إتمام الفحص اللغوي');
      }

      const data = await response.json();
      setCorrections(data.corrections || []);
      setEngineSource(data.source || 'gemini');
      setHasScanned(true);
    } catch (err: any) {
      console.error('Proofread fetch error:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء الفحص');
      setHasScanned(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySingle = (c: ProofreadCorrection, index: number) => {
    onApplyCorrection(c.original, c.suggestion);
    setAppliedIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const handleApplyAll = () => {
    const unapplied = corrections.filter((_, idx) => !appliedIndices.has(idx));
    if (unapplied.length > 0) {
      onApplyAllCorrections(unapplied);
      const allSet = new Set(corrections.map((_, i) => i));
      setAppliedIndices(allSet);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-5 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                التدقيق اللغوي والإملائي العربي
                <span className="text-[11px] bg-emerald-400/30 text-emerald-200 border border-emerald-300/40 px-2 py-0.5 rounded-full font-medium">
                  محرك محلي مستقل (بدون مزامنة خارجية)
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                فحص الهمزات، التاء المربوطة، الأخطاء النحوية والإملائية وتصحيحها فورياً بدون استهلاك حصص
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Quick Rescan toolbar */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>عدد الكلمات المفحوصة: <b>{inputText.split(/\s+/).filter(Boolean).length}</b></span>
            </div>
            <button
              onClick={() => handleRunProofread(inputText)}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>إعادة الفحص الآن</span>
            </button>
          </div>

          {/* Error notice if any */}
          {errorMessage && (
            <div className="flex items-center gap-2 text-xs bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-medium">جاري فحص النص وتحليل التراكيب والهمزات...</p>
            </div>
          )}

          {/* Results List */}
          {!isLoading && hasScanned && (
            <div>
              {corrections.length === 0 ? (
                <div className="py-10 text-center space-y-2 bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-6">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">النص سليم وخالٍ من الأخطاء المكتشفة!</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    لم يتم العثور على أخطاء إملائية أو نحوية في محتوى المستند الحالي.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 pb-1">
                    <span>
                      تم العثور على <b className="text-blue-700">{corrections.length}</b> تصحيح مقترح:
                    </span>
                    <span className="text-slate-500">
                      (تم تطبيق {appliedIndices.size} من {corrections.length})
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {corrections.map((c, index) => {
                      const isApplied = appliedIndices.has(index);
                      return (
                        <div
                          key={index}
                          className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                            isApplied
                              ? 'bg-slate-50 border-slate-200 opacity-60'
                              : 'bg-white border-blue-100 hover:border-blue-300 shadow-xs'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="line-through text-rose-600 font-bold text-sm bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                {c.original}
                              </span>
                              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-emerald-700 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {c.suggestion}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border">
                                {c.type === 'spelling' ? 'إملائي' : c.type === 'grammar' ? 'نحوي' : 'ترقيم'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{c.explanation}</span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isApplied ? (
                              <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold px-2 py-1 bg-emerald-50 rounded-lg">
                                <Check className="w-3.5 h-3.5" />
                                تم التطبيق
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApplySingle(c, index)}
                                className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs transition"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>تطبيق</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            إغلاق
          </button>

          {corrections.length > 0 && (
            <button
              onClick={handleApplyAll}
              disabled={appliedIndices.size === corrections.length}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              <span>تطبيق جميع التصحيحات ({corrections.length - appliedIndices.size})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
