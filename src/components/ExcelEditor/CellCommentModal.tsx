import React, { useState } from 'react';
import { MessageSquare, Trash2, Check, X, User } from 'lucide-react';
import { CellComment } from '../../types';

interface CellCommentModalProps {
  isOpen: boolean;
  cellCoord: string;
  initialComment?: CellComment;
  onSave: (comment: CellComment) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const CellCommentModal: React.FC<CellCommentModalProps> = ({
  isOpen,
  cellCoord,
  initialComment,
  onSave,
  onDelete,
  onClose,
}) => {
  const [text, setText] = useState(initialComment?.text || '');
  const [author, setAuthor] = useState(initialComment?.author || 'مستخدم النظام');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      onDelete();
      return;
    }
    onSave({
      text: text.trim(),
      author: author.trim() || 'مستخدم النظام',
      date: new Date().toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-right">
        {/* Header */}
        <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>تعليق الخلية: <span className="font-mono text-amber-700">{cellCoord}</span></span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              اسم الكاتب / المراجع:
            </label>
            <div className="relative">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
                placeholder="اسم الكاتب"
              />
              <User className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              نص التعليق والملاحظات:
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب ملاحظاتك أو تعليقك حول هذه الخلية هنا..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none resize-none leading-relaxed"
              autoFocus
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {initialComment ? (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف التعليق</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ التعليق</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
