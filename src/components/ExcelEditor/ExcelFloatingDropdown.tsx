import React, { useEffect, useRef } from 'react';
import {
  Check,
  Palette,
  Type,
  Square,
  Sigma,
  Hash,
  Sliders,
  Maximize2,
  FileText,
  X
} from 'lucide-react';
import { CellData, ExcelSheet } from '../../types';

export interface ExcelFloatingDropdownProps {
  activeDropdown: { id: string; rect: DOMRect } | null;
  onClose: () => void;
  selectedCellData?: CellData;
  onUpdateSelectedCell: (partial: Partial<CellData>) => void;
  bgColors: string[];
  textColors: string[];
  cellBorderOptions: { id: CellData['borderStyle']; label: string; borderColor?: string }[];
  numberFormats: { id: CellData['format']; label: string; example: string }[];
  formulasList: { name: string; label: string; syntax: string }[];
  onInsertFormula: (formulaName: string) => void;
  activeSheet: ExcelSheet;
  onUpdateSheet?: (partial: Partial<ExcelSheet>) => void;
  onFreezePanes: (type: 'row' | 'col' | 'none') => void;
  selectedRange?: { start: string; end: string } | null;
  selectedCell: string;
}

export const ExcelFloatingDropdown: React.FC<ExcelFloatingDropdownProps> = ({
  activeDropdown,
  onClose,
  selectedCellData,
  onUpdateSelectedCell,
  bgColors,
  textColors,
  cellBorderOptions,
  numberFormats,
  formulasList,
  onInsertFormula,
  activeSheet,
  onUpdateSheet,
  onFreezePanes,
  selectedRange,
  selectedCell,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeDropdown) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      onClose();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [activeDropdown, onClose]);

  if (!activeDropdown) return null;

  const { id, rect } = activeDropdown;
  const top = rect.bottom + 6;
  let right = window.innerWidth - rect.right;
  if (right < 8) right = 8;
  if (right > window.innerWidth - 300) {
    right = Math.max(8, window.innerWidth - 300);
  }

  return (
    <div
      ref={containerRef}
      className="excel-floating-dropdown fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-300 p-2.5 animate-in fade-in zoom-in-95 text-xs text-slate-800 font-sans select-none ring-1 ring-black/5"
      style={{
        top: `${top}px`,
        right: `${right}px`,
        maxWidth: '320px',
        maxHeight: '440px',
        overflowY: 'auto'
      }}
      dir="rtl"
    >
      {/* ─── 1. لون التعبئة والخلفية (Fill Background Color) ─── */}
      {id === 'bgColor' && (
        <div className="space-y-2 min-w-[240px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
              <Palette className="w-3.5 h-3.5 text-emerald-600" />
              <span>لون تعبئة الخلية</span>
            </div>
            <button
              onClick={onClose}
              className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              onUpdateSelectedCell({ bg: undefined });
              onClose();
            }}
            className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-center transition flex items-center justify-center gap-1.5"
          >
            <span>بلا تعبئة (شفاف)</span>
          </button>

          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {bgColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onUpdateSelectedCell({ bg: color });
                  onClose();
                }}
                className={`w-8 h-8 rounded-lg border transition-transform hover:scale-110 flex items-center justify-center ${
                  selectedCellData?.bg === color ? 'ring-2 ring-emerald-600 ring-offset-1' : 'border-slate-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              >
                {selectedCellData?.bg === color && <Check className="w-3.5 h-3.5 text-slate-900" />}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <label className="text-[10px] text-slate-500 font-medium">لون مخصص:</label>
            <input
              type="color"
              value={selectedCellData?.bg || '#ffffff'}
              onChange={(e) => onUpdateSelectedCell({ bg: e.target.value })}
              className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ─── 2. لون النص (Text Color) ─── */}
      {id === 'textColor' && (
        <div className="space-y-2 min-w-[240px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
              <Type className="w-3.5 h-3.5 text-emerald-600" />
              <span>لون خط النص</span>
            </div>
            <button
              onClick={onClose}
              className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              onUpdateSelectedCell({ color: '#000000' });
              onClose();
            }}
            className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-center transition flex items-center justify-center gap-1.5"
          >
            <span>تلقائي (أسود #000000)</span>
          </button>

          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {textColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onUpdateSelectedCell({ color });
                  onClose();
                }}
                className={`w-8 h-8 rounded-lg border transition-transform hover:scale-110 flex items-center justify-center ${
                  selectedCellData?.color === color ? 'ring-2 ring-emerald-600 ring-offset-1' : 'border-slate-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              >
                {selectedCellData?.color === color && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <label className="text-[10px] text-slate-500 font-medium">لون مخصص:</label>
            <input
              type="color"
              value={selectedCellData?.color || '#000000'}
              onChange={(e) => onUpdateSelectedCell({ color: e.target.value })}
              className="w-7 h-7 rounded border border-slate-300 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ─── 3. حدود الخلايا (Cell Borders) ─── */}
      {id === 'border' && (
        <div className="space-y-1 min-w-[220px]">
          <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-100 font-bold text-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Square className="w-3.5 h-3.5 text-emerald-600" />
              <span>حدود الخلايا</span>
            </div>
            <button onClick={onClose} className="p-0.5 rounded hover:bg-slate-100 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {cellBorderOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onUpdateSelectedCell({
                  border: opt.id !== 'none',
                  borderStyle: opt.id,
                  borderColor: opt.borderColor || '#94a3b8'
                });
                onClose();
              }}
              className={`w-full text-right px-2.5 py-1.5 rounded-lg transition flex items-center justify-between text-xs ${
                selectedCellData?.borderStyle === opt.id
                  ? 'bg-emerald-50 text-emerald-900 font-bold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>{opt.label}</span>
              {selectedCellData?.borderStyle === opt.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          ))}
        </div>
      )}

      {/* ─── 4. تنسيق الأرقام والعملات (Number Formats) ─── */}
      {id === 'format' && (
        <div className="space-y-1 min-w-[250px]">
          <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-100 font-bold text-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-emerald-600" />
              <span>تنسيق الأرقام والقيم</span>
            </div>
            <button onClick={onClose} className="p-0.5 rounded hover:bg-slate-100 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {numberFormats.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => {
                onUpdateSelectedCell({ format: fmt.id });
                onClose();
              }}
              className={`w-full text-right px-2.5 py-1.5 rounded-lg transition flex items-center justify-between text-xs ${
                selectedCellData?.format === fmt.id
                  ? 'bg-emerald-50 text-emerald-900 font-bold'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div>
                <div className="font-semibold">{fmt.label}</div>
                <div className="text-[10px] text-slate-400 font-mono" dir="ltr">{fmt.example}</div>
              </div>
              {selectedCellData?.format === fmt.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          ))}
        </div>
      )}

      {/* ─── 5. الصيغ والدوال الرياضية (Formulas) ─── */}
      {id === 'formula' && (
        <div className="space-y-1 min-w-[260px]">
          <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-100 font-bold text-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Sigma className="w-3.5 h-3.5 text-emerald-600" />
              <span>إدراج دالة رياضية سريعة</span>
            </div>
            <button onClick={onClose} className="p-0.5 rounded hover:bg-slate-100 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {formulasList.map((f) => (
            <button
              key={f.name}
              onClick={() => {
                onInsertFormula(f.name);
                onClose();
              }}
              className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-900 transition flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-800">{f.label}</span>
                <span className="block text-[10px] text-slate-400 font-mono" dir="ltr">{f.syntax}</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                {f.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ─── 6. هوامش الصفحة (Margins) ─── */}
      {id === 'margins' && (
        <div className="space-y-1 min-w-[200px]">
          <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-100 font-bold text-slate-800 text-[11px]">
            <span>هوامش ورقة العمل</span>
            <button onClick={onClose} className="p-0.5 rounded hover:bg-slate-100 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {[
            { label: 'عادي (0.75 بوصة)', desc: 'أعلى وأسفل: 1.9 سم' },
            { label: 'ضيق (0.25 بوصة)', desc: 'مناسب للجداول العريضة' },
            { label: 'عريض (1.0 بوصة)', desc: 'أعلى وأسفل: 2.5 سم' }
          ].map((m, idx) => (
            <button
              key={idx}
              onClick={() => onClose()}
              className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-slate-700 transition block text-xs"
            >
              <div className="font-bold">{m.label}</div>
              <div className="text-[10px] text-slate-400">{m.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* ─── 7. اتجاه الصفحة (Orientation) ─── */}
      {id === 'orientation' && (
        <div className="space-y-1 min-w-[180px]">
          <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-100 font-bold text-slate-800 text-[11px]">
            <span>اتجاه الطباعة</span>
            <button onClick={onClose} className="p-0.5 rounded hover:bg-slate-100 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onClose()}
            className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-slate-700 transition flex items-center gap-2 text-xs"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">عمودي (Portrait)</span>
          </button>

          <button
            onClick={() => onClose()}
            className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-slate-700 transition flex items-center gap-2 text-xs"
          >
            <Maximize2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">أفقي (Landscape)</span>
          </button>
        </div>
      )}

      {/* ─── 8. حجم الصفحة (Paper Size) ─── */}
      {id === 'size' && (
        <div className="space-y-1 min-w-[200px]">
          <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-100 font-bold text-slate-800 text-[11px]">
            <span>مقاس الورق</span>
            <button onClick={onClose} className="p-0.5 rounded hover:bg-slate-100 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {[
            { name: 'A4', desc: '210 × 297 مم (القياسي)' },
            { name: 'A3', desc: '297 × 420 مم (جداول كبرى)' },
            { name: 'Letter', desc: '8.5 × 11 بوصة' },
            { name: 'Legal', desc: '8.5 × 14 بوصة' }
          ].map((p) => (
            <button
              key={p.name}
              onClick={() => onClose()}
              className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-slate-700 transition flex items-center justify-between text-xs"
            >
              <span className="font-bold">{p.name}</span>
              <span className="text-[10px] text-slate-400">{p.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
