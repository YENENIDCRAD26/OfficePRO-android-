import React from 'react';
import { 
  History, 
  RotateCcw, 
  Clock, 
  FileText, 
  FileSpreadsheet, 
  X, 
  Check, 
  BookmarkPlus,
  AlertCircle
} from 'lucide-react';
import { DocumentRevision, AppMode } from '../types';

interface RevisionHistoryModalProps {
  isOpen: boolean;
  mode: AppMode;
  revisions: DocumentRevision[];
  onRestore: (revision: DocumentRevision) => void;
  onSaveSnapshot: () => void;
  onClose: () => void;
}

export const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  isOpen,
  mode,
  revisions,
  onRestore,
  onSaveSnapshot,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden text-right">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">سجل المراجعة والنسخ السابقة</h2>
              <p className="text-xs text-slate-300">
                حفظ تلقائي لآخر 5 نسخ من المستند مع إمكانية استعادة أي نسخة بضغطة زر
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-600 flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>النسخ المحفوظة: {revisions.length} من أصل 5 كحد أقصى</span>
          </div>

          <button
            onClick={onSaveSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>حفظ نسخة الآن</span>
          </button>
        </div>

        {/* List of Revisions */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {revisions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <History className="w-10 h-10 mx-auto text-slate-300 opacity-60" />
              <p className="text-sm font-semibold text-slate-600">لا توجد نسخ سابقة محفوظة بعد</p>
              <p className="text-xs text-slate-400">
                يتم حفظ نسخة تلقائياً عند التعديل، أو يمكنك الضغط على "حفظ نسخة الآن" أعلاه.
              </p>
            </div>
          ) : (
            revisions.map((rev, index) => {
              const isLatest = index === 0;
              return (
                <div
                  key={rev.id}
                  className={`p-4 rounded-xl border transition flex flex-col gap-2.5 ${
                    isLatest
                      ? 'bg-blue-50/40 border-blue-200 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {mode === 'word' ? (
                        <FileText className="w-4 h-4 text-blue-600" />
                      ) : (
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      )}
                      <span className="font-bold text-sm text-slate-800">
                        {rev.title || 'مستند بدون عنوان'}
                      </span>
                      {isLatest && (
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                          أحدث نسخة
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {rev.dateStr}
                    </span>
                  </div>

                  {rev.preview && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg line-clamp-2 leading-relaxed border border-slate-100 font-sans">
                      {rev.preview}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 text-xs">
                    <span className="text-slate-500">
                      {mode === 'word' ? `عدد الكلمات: ${rev.wordCount}` : 'بيانات الجدول والحسابات'}
                    </span>

                    <button
                      onClick={() => {
                        onRestore(rev);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium shadow-xs transition"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-400" />
                      <span>استعادة هذه النسخة</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>يتم تخزين النسخ في المتصفح محلياً لضمان سرعة الاسترجاع.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
