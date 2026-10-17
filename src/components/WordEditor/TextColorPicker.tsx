import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, ChevronDown, Check } from 'lucide-react';

// مصفوفة الألوان السبعة القياسية المبسطة (The 7 Simplified Colors)
export const simplifiedColors = [
  { name: 'أسود داكن', hex: '#000000', desc: 'للنصوص الأساسية والرسمية' },
  { name: 'أزرق كلاسيكي', hex: '#1e40af', desc: 'للعناوين والملاحظات الهامة' },
  { name: 'أحمر ياقوتي', hex: '#dc2626', desc: 'للتنبيهات والبنود العاجلة' },
  { name: 'أخضر زمردي', hex: '#16a34a', desc: 'للموافقات والنقاط الإيجابية' },
  { name: 'برتقالي عنبري', hex: '#d97706', desc: 'للتحذيرات والتمييز البصري' },
  { name: 'أرجواني ملكي', hex: '#7c3aed', desc: 'للعناوين الفرعية الفاخرة' },
  { name: 'رمادي رصاصي', hex: '#475569', desc: 'للهوامش والشروح التوضيحية' },
];

export interface TextColorPickerProps {
  currentColor?: string;
  onSelectColor: (hex: string) => void;
  scope?: 'selected' | 'paragraph' | 'wholeDoc';
  onSelectScope?: (scope: 'selected' | 'paragraph' | 'wholeDoc') => void;
}

export const TextColorPickerDropdown: React.FC<TextColorPickerProps> = ({
  currentColor = '#000000',
  onSelectColor,
  scope,
  onSelectScope,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  // تحديث إحداثيات القائمة لتطفو بدقة أسفل الزر في الشاشة
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const top = rect.bottom + 6;
      let right = window.innerWidth - rect.right;
      if (right < 8) right = 8;
      if (right + 300 > window.innerWidth - 8) {
        right = Math.max(8, window.innerWidth - 308);
      }
      setDropdownPosition({ top, right });
    }
  };

  const handleToggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleApplyColor = (colorHex: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onSelectColor(colorHex);
    setIsOpen(false);
  };

  // مراقبة التمرير وتغيير حجم النافذة لتحديث موضع القائمة أو إغلاقها
  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => {
      updatePosition();
    };
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center" ref={buttonRef} dir="rtl">
      {/* زر شريط الأدوات المزدوج (زر التطبيق المباشر للون الحالي + زر فتح قائمة الـ 7 ألوان) */}
      <div className="flex items-center h-[26px] bg-white border border-slate-300 rounded shadow-2xs hover:bg-slate-50 transition">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => handleApplyColor(currentColor, e)}
          className="px-1.5 h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition"
          title={`تطبيق اللون الحالي (${currentColor}) على النص`}
        >
          <span className="font-black text-[12px] leading-tight" style={{ color: currentColor }}>
            A
          </span>
          <div className="w-3.5 h-1 rounded-xs shadow-2xs" style={{ backgroundColor: currentColor }} />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleToggleOpen}
          className={`px-1 h-full flex items-center justify-center hover:bg-slate-200/70 rounded-l transition cursor-pointer border-r border-slate-200 ${
            isOpen ? 'bg-blue-100 text-blue-900' : 'text-slate-500'
          }`}
          title="قائمة ألوان النص المبسطة (7 ألوان)"
        >
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* النافذة المنسدلة المبسطة عبر Portal لمنع أي تداخل أو قص من الأشرطة */}
      {isOpen && typeof document !== 'undefined' &&
        createPortal(
          <>
            {/* خلفية شفافة لالتقاط النقرات بالخارج وإغلاق القائمة */}
            <div
              className="fixed inset-0 z-[99998] bg-transparent cursor-default"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }}
            />

            {/* نافذة الألوان السبعة المختارة تطفو بحرية فوق كافة العناصر */}
            <div
              onMouseDown={(e) => e.preventDefault()}
              className="fixed bg-white p-3 rounded-2xl shadow-2xl border border-slate-300 z-[99999] w-72 max-w-[92vw] text-xs animate-in fade-in slide-in-from-top-1 select-none space-y-2.5 ring-1 ring-black/5"
              style={{
                top: `${dropdownPosition.top}px`,
                right: `${dropdownPosition.right}px`,
                filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.22))',
              }}
              dir="rtl"
            >
              {/* رأس القائمة */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <Palette className="w-3.5 h-3.5 text-blue-600" />
                  <span>قائمة ألوان النص</span>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  7 ألوان معتمدة
                </span>
              </div>

              {/* محدد نطاق التطبيق (المحدد / الفقرة / كامل المستند) */}
              {scope && onSelectScope && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-600 block">نطاق تطبيق اللون:</span>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onSelectScope('selected')}
                      className={`py-1 px-1 rounded text-[10px] font-bold transition cursor-pointer ${
                        scope === 'selected' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:bg-white/50'
                      }`}
                    >
                      المحدد
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onSelectScope('paragraph')}
                      className={`py-1 px-1 rounded text-[10px] font-bold transition cursor-pointer ${
                        scope === 'paragraph' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:bg-white/50'
                      }`}
                    >
                      الفقرة
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onSelectScope('wholeDoc')}
                      className={`py-1 px-1 rounded text-[10px] font-bold transition cursor-pointer ${
                        scope === 'wholeDoc' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:bg-white/50'
                      }`}
                    >
                      المستند
                    </button>
                  </div>
                </div>
              )}

              {/* شريط المربعات السريع للألوان السبعة */}
              <div className="grid grid-cols-7 gap-1.5 p-1.5 bg-slate-50/90 rounded-xl border border-slate-200">
                {simplifiedColors.map((item) => {
                  const isSelected = currentColor.toLowerCase() === item.hex.toLowerCase();
                  return (
                    <button
                      key={item.hex}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => handleApplyColor(item.hex, e)}
                      className={`h-7 rounded-md border flex items-center justify-center transition-all hover:scale-110 shadow-2xs relative cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-blue-600 ring-offset-1 border-white z-10 scale-105'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                      style={{ backgroundColor: item.hex }}
                      title={`${item.name} (${item.hex})`}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${item.hex === '#ffffff' ? 'text-black' : 'text-white'}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* قائمة الألوان السبعة التفصيلية والواضحة */}
              <div className="space-y-1">
                {simplifiedColors.map((item) => {
                  const isSelected = currentColor.toLowerCase() === item.hex.toLowerCase();
                  return (
                    <button
                      key={item.hex}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => handleApplyColor(item.hex, e)}
                      className={`w-full flex items-center justify-between p-1.5 rounded-lg border transition text-right cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-400 text-blue-950 font-bold shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border shadow-2xs shrink-0 flex items-center justify-center ${
                            isSelected ? 'ring-2 ring-blue-500' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: item.hex }}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-[11px] font-bold">{item.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};

export default TextColorPickerDropdown;
