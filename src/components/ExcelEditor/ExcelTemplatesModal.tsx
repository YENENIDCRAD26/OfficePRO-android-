import React from 'react';
import { X, FileSpreadsheet } from 'lucide-react';
import { EXCEL_TEMPLATES } from '../../data/excelTemplates';

interface ExcelTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTemplate: (template: any) => void;
}

export const ExcelTemplatesModal: React.FC<ExcelTemplatesModalProps> = ({ isOpen, onClose, onInsertTemplate }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">قوالب جداول البيانات</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500 hover:text-slate-800" /></button>
        </div>
        <div className="grid gap-4">
          {EXCEL_TEMPLATES.map(template => (
            <button 
              key={template.id}
              onClick={() => { onInsertTemplate(template); onClose(); }}
              className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition"
            >
              <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-800">{template.name}</h3>
                <p className="text-sm text-slate-600">{template.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
