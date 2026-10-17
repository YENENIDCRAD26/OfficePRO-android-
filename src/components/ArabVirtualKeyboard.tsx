import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Minus, 
  ChevronUp, 
  ChevronDown, 
  Globe, 
  Delete, 
  CornerDownLeft,
  Keyboard as KeyboardIcon,
  Smartphone,
  Sparkles,
  Bold,
  Italic,
  Underline,
  RotateCcw,
  RotateCw,
  Save,
  Printer,
  AlignRight,
  AlignCenter,
  AlignLeft,
  List,
  ListOrdered,
  DollarSign,
  Percent,
  Plus,
  Trash2,
  Strikethrough,
  Table,
  Palette,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  Zap
} from 'lucide-react';
import { VirtualKeyboardState } from '../types';
import { getPredictiveSuggestions, TextSuggestion } from '../utils/predictiveTextEngine';

interface ArabVirtualKeyboardProps {
  state: VirtualKeyboardState;
  onUpdateState: (partial: Partial<VirtualKeyboardState>) => void;
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onTab: () => void;
  onArrowKey?: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onCommand?: (cmd: string) => void;
  onInsertText?: (text: string, replaceLength?: number) => void;
  mode: 'word' | 'excel';
}

export const ArabVirtualKeyboard: React.FC<ArabVirtualKeyboardProps> = ({
  state,
  onUpdateState,
  onKeyPress,
  onBackspace,
  onEnter,
  onTab,
  onArrowKey,
  onCommand,
  onInsertText,
  mode
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showExtraMenu, setShowExtraMenu] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showShortcutsBar, setShowShortcutsBar] = useState(true);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Predictive Text State
  const [predictiveBuffer, setPredictiveBuffer] = useState<string>('');
  const [predictiveSuggestions, setPredictiveSuggestions] = useState<TextSuggestion[]>([]);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearPredictions = () => {
    setPredictiveBuffer('');
    setPredictiveSuggestions([]);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!predictiveBuffer.trim()) {
      setPredictiveSuggestions([]);
      return;
    }

    const suggestions = getPredictiveSuggestions(
      predictiveBuffer,
      state.language,
      mode,
      6
    );
    setPredictiveSuggestions(suggestions);

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      clearPredictions();
    }, 7000);

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [predictiveBuffer, state.language, mode]);

  if (!state.isOpen) return null;

  const isNative = state.preferredInputMode === 'native';
  const autoSwitchEnabled = state.autoSwitch !== false;
  const layoutMode = state.layoutMode || 'standard';
  const numberType = state.numberType || 'eastern';

  const toggleInputMode = () => {
    onUpdateState({ preferredInputMode: isNative ? 'virtual' : 'native' });
  };

  const toggleAutoSwitch = () => {
    onUpdateState({ autoSwitch: !autoSwitchEnabled });
  };

  const toggleLanguage = () => {
    clearPredictions();
    onUpdateState({ language: state.language === 'ar' ? 'en' : 'ar' });
  };

  const toggleShift = () => {
    onUpdateState({ shiftActive: !state.shiftActive });
  };

  const toggleAlt = () => {
    onUpdateState({ altActive: !state.altActive });
  };

  const toggleCtrl = () => {
    onUpdateState({ ctrlActive: !state.ctrlActive });
  };

  const toggleCaps = () => {
    onUpdateState({ capsActive: !state.capsActive });
  };

  const toggleLayoutMode = () => {
    onUpdateState({ layoutMode: layoutMode === 'standard' ? 'rtl' : 'standard' });
  };

  const toggleNumberType = () => {
    onUpdateState({ numberType: numberType === 'eastern' ? 'western' : 'eastern' });
  };

  const handleSelectSuggestion = (suggestion: TextSuggestion) => {
    const textToInsert = suggestion.text + (suggestion.text.endsWith(' ') || suggestion.text.endsWith('(') ? '' : ' ');
    const replaceLen = predictiveBuffer.length;

    if (onInsertText) {
      onInsertText(textToInsert, replaceLen);
    } else {
      for (let i = 0; i < replaceLen; i++) {
        onBackspace();
      }
      onKeyPress(textToInsert);
    }

    clearPredictions();
  };

  const handleKeyClick = (char: string) => {
    if (state.altActive) {
      if (char === '=' || char === '+') {
        onCommand?.('autoSum');
        onUpdateState({ altActive: false });
        clearPredictions();
        return;
      }
    }

    if (state.ctrlActive) {
      const lower = char.toLowerCase();
      if (lower === 'n' || char === 'ى') {
        onCommand?.('new');
      } else if (lower === 'o' || char === 'خ') {
        onCommand?.('open');
      } else if (lower === 's' || char === 'س') {
        onCommand?.('save');
      } else if (lower === 'p' || char === 'ح') {
        onCommand?.('print');
      } else if (lower === 'c' || char === 'ؤ') {
        onCommand?.('copy');
      } else if (lower === 'x' || char === 'ء') {
        onCommand?.('cut');
      } else if (lower === 'v' || char === 'ر') {
        onCommand?.('paste');
      } else if (lower === 'a' || char === 'ش') {
        onCommand?.('selectAll');
      } else if (lower === 'z' || char === 'ئ') {
        onCommand?.('undo');
      } else if (lower === 'y' || char === 'إ' || char === 'غ') {
        onCommand?.('redo');
      } else if (lower === 'f' || char === 'ب') {
        onCommand?.('find');
      } else if (lower === 'h' || char === 'ا' || char === 'أ') {
        onCommand?.('replace');
      } else if (lower === 'b' || char === 'لا') {
        onCommand?.('bold');
      } else if (lower === 'i' || char === 'ه') {
        onCommand?.('italic');
      } else if (lower === 'u' || char === 'ع') {
        onCommand?.('underline');
      } else if (lower === 'e' || char === 'ث') {
        onCommand?.('alignCenter');
      } else if (lower === 'r' || char === 'ق') {
        onCommand?.('alignRight');
      } else if (lower === 'l' || char === 'م') {
        if (state.shiftActive) {
          onCommand?.('toggleFilters');
        } else {
          onCommand?.('alignLeft');
        }
      } else if (lower === 'j' || char === 'ت') {
        onCommand?.('justify');
      } else if (char === ']' || char === 'د') {
        onCommand?.('increaseFontSize');
      } else if (char === '[' || char === 'ج') {
        onCommand?.('decreaseFontSize');
      } else if (char === '1' || char === '١') {
        onCommand?.('lineSpacing1');
      } else if (char === '2' || char === '٢') {
        onCommand?.('lineSpacing2');
      } else if (char === '5' || char === '٥') {
        onCommand?.('lineSpacing1_5');
      } else if (char === ';' || char === 'ك') {
        onCommand?.('insertDate');
      } else if (char === ':' || char === 'ط') {
        onCommand?.('insertTime');
      } else {
        onKeyPress(char);
      }
      onUpdateState({ ctrlActive: false, shiftActive: false, altActive: false });
      clearPredictions();
      return;
    }

    onKeyPress(char);

    if (char === ' ' || char === '\n' || char === '\t') {
      clearPredictions();
    } else {
      setPredictiveBuffer((prev) => prev + char);
    }
  };

  const handleBackspaceKey = () => {
    onBackspace();
    setPredictiveBuffer((prev) => {
      const next = prev.slice(0, -1);
      if (!next) setPredictiveSuggestions([]);
      return next;
    });
  };

  const handleEnterKey = () => {
    clearPredictions();
    onEnter();
  };

  const handleTabKey = () => {
    clearPredictions();
    onTab();
  };

  if (isNative) {
    return (
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 no-print select-none" dir="rtl">
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">لوحة مفاتيح الهاتف نشطة 📱</span>
          </div>
          <div className="w-px h-3.5 bg-slate-700" />
          <button
            onClick={toggleInputMode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition cursor-pointer"
          >
            <KeyboardIcon className="w-3.5 h-3.5" />
            <span>التبديل للكيبورد الملحق ⌨️</span>
          </button>
          <button
            onClick={() => onUpdateState({ isOpen: false })}
            className="p-1 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  const tashkeelList = [
    { label: 'َ فتحة', char: '\u064E' },
    { label: 'ً تنوين فتح', char: '\u064B' },
    { label: 'ُ ضمة', char: '\u064F' },
    { label: 'ٌ تنوين ضم', char: '\u064C' },
    { label: 'ِ كسرة', char: '\u0650' },
    { label: 'ٍ تنوين كسر', char: '\u064D' },
    { label: 'ْ سكون', char: '\u0652' },
    { label: 'ّ شدة', char: '\u0651' },
    { label: 'ـ تطويل', char: '\u0640' },
  ];

  const quickColors = [
    { name: 'أسود', hex: '#000000' },
    { name: 'أزرق', hex: '#0000FF' },
    { name: 'أحمر', hex: '#FF0000' },
    { name: 'أخضر', hex: '#008000' },
    { name: 'بنفسجي', hex: '#800080' },
    { name: 'وردي', hex: '#FF00FF' },
    { name: 'سماوي', hex: '#00FFFF' },
    { name: 'أصفر', hex: '#FFFF00' },
    { name: 'كحلي', hex: '#000080' },
    { name: 'رمادي', hex: '#808080' },
  ];

  const easternNumbers = [
    { char: 'ذ', shift: 'ّ', alt: '`' },
    { char: '١', shift: '!', alt: '1' },
    { char: '٢', shift: '@', alt: '2' },
    { char: '٣', shift: '#', alt: '3' },
    { char: '٤', shift: '$', alt: '4' },
    { char: '٥', shift: '%', alt: '5' },
    { char: '٦', shift: '^', alt: '6' },
    { char: '٧', shift: '&', alt: '7' },
    { char: '٨', shift: '*', alt: '8' },
    { char: '٩', shift: ')', alt: '9' },
    { char: '٠', shift: '(', alt: '0' },
    { char: '-', shift: '_', alt: 'ـ' },
    { char: '=', shift: '+', alt: '±' },
  ];

  const westernNumbers = [
    { char: 'ذ', shift: 'ّ', alt: '`' },
    { char: '1', shift: '!', alt: '١' },
    { char: '2', shift: '@', alt: '٢' },
    { char: '3', shift: '#', alt: '٣' },
    { char: '4', shift: '$', alt: '٤' },
    { char: '5', shift: '%', alt: '٥' },
    { char: '6', shift: '^', alt: '٦' },
    { char: '7', shift: '&', alt: '٧' },
    { char: '8', shift: '*', alt: '٨' },
    { char: '9', shift: '(', alt: '٩' },
    { char: '0', shift: ')', alt: '٠' },
    { char: '-', shift: '_', alt: 'ـ' },
    { char: '=', shift: '+', alt: '±' },
  ];

  const numRow = numberType === 'eastern' ? easternNumbers : westernNumbers;

  const arRowStandard1 = [
    { char: 'ض', shift: 'َ' },
    { char: 'ص', shift: 'ً' },
    { char: 'ث', shift: 'ُ' },
    { char: 'ق', shift: 'ٌ' },
    { char: 'ف', shift: 'لإ' },
    { char: 'غ', shift: 'إ' },
    { char: 'ع', shift: '‘' },
    { char: 'ه', shift: '÷' },
    { char: 'خ', shift: '×' },
    { char: 'ح', shift: '؛' },
    { char: 'ج', shift: '<' },
    { char: 'د', shift: '>' },
  ];

  const arRowStandard2 = [
    { char: 'ش', shift: 'ِ' },
    { char: 'س', shift: 'ٍ' },
    { char: 'ي', shift: ']' },
    { char: 'ب', shift: '[' },
    { char: 'ل', shift: 'لأ' },
    { char: 'ا', shift: 'أ' },
    { char: 'ت', shift: 'ـ' },
    { char: 'ن', shift: '،' },
    { char: 'م', shift: '/' },
    { char: 'ك', shift: ':' },
    { char: 'ط', shift: '"' },
  ];

  const arRowStandard3 = [
    { char: 'ئ', shift: '~' },
    { char: 'ء', shift: 'ْ' },
    { char: 'ؤ', shift: '}' },
    { char: 'ر', shift: '{' },
    { char: 'لا', shift: 'لآ' },
    { char: 'ى', shift: 'آ' },
    { char: 'ة', shift: '\'' },
    { char: 'و', shift: ',' },
    { char: 'ز', shift: '.' },
    { char: 'ظ', shift: '؟' },
  ];

  const arRowRTL1 = [...arRowStandard1].reverse();
  const arRowRTL2 = [...arRowStandard2].reverse();
  const arRowRTL3 = [...arRowStandard3].reverse();

  const activeArRow1 = layoutMode === 'standard' ? arRowStandard1 : arRowRTL1;
  const activeArRow2 = layoutMode === 'standard' ? arRowStandard2 : arRowRTL2;
  const activeArRow3 = layoutMode === 'standard' ? arRowStandard3 : arRowRTL3;

  const enRow1 = [
    { char: 'q', shift: 'Q' },
    { char: 'w', shift: 'W' },
    { char: 'e', shift: 'E' },
    { char: 'r', shift: 'R' },
    { char: 't', shift: 'T' },
    { char: 'y', shift: 'Y' },
    { char: 'u', shift: 'U' },
    { char: 'i', shift: 'I' },
    { char: 'o', shift: 'O' },
    { char: 'p', shift: 'P' },
    { char: '[', shift: '{' },
    { char: ']', shift: '}' },
  ];

  const enRow2 = [
    { char: 'a', shift: 'A' },
    { char: 's', shift: 'S' },
    { char: 'd', shift: 'D' },
    { char: 'f', shift: 'F' },
    { char: 'g', shift: 'G' },
    { char: 'h', shift: 'H' },
    { char: 'j', shift: 'J' },
    { char: 'k', shift: 'K' },
    { char: 'l', shift: 'L' },
    { char: ';', shift: ':' },
    { char: '\'', shift: '"' },
  ];

  const enRow3 = [
    { char: 'z', shift: 'Z' },
    { char: 'x', shift: 'X' },
    { char: 'c', shift: 'C' },
    { char: 'v', shift: 'V' },
    { char: 'b', shift: 'B' },
    { char: 'n', shift: 'N' },
    { char: 'm', shift: 'M' },
    { char: ',', shift: '<' },
    { char: '.', shift: '>' },
    { char: '/', shift: '?' },
  ];

  const getChar = (item: any) => {
    if (typeof item === 'string') {
      if (state.capsActive || state.shiftActive) {
        return item.toUpperCase();
      }
      return item;
    }
    if (state.shiftActive && item.shift) return item.shift;
    if (state.altActive && item.alt) return item.alt;
    if (state.capsActive && typeof item.char === 'string') {
      return item.char.toUpperCase();
    }
    return item.char;
  };

  return (
    <div 
      className={`select-none no-print transition-all z-50 ${
        state.isFloating 
          ? 'fixed top-14 left-1/2 -translate-x-1/2 w-full max-w-4xl px-2 shadow-2xl' 
          : 'fixed bottom-0 left-0 right-0 max-w-5xl mx-auto px-2 pb-1'
      }`}
      dir="ltr"
    >
      <div className="bg-slate-50/98 backdrop-blur-md rounded-t-2xl border border-slate-300 shadow-2xl overflow-hidden ring-1 ring-slate-900/10">
        
        {/* Top Header Bar */}
        <div 
          className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-b border-slate-300 px-2.5 flex items-center justify-between w-full select-none gap-1 overflow-x-auto scrollbar-none py-1.5"
          dir="rtl"
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <KeyboardIcon className="w-3 h-3" />
            </div>
            <span className="text-[11px] font-black text-slate-800 shrink-0">
              الكيبورد الملحق {mode === 'excel' ? '📊 إكسل' : '📝 وورد'}
            </span>
            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold border border-blue-200">
              {state.language === 'ar' ? 'العربية' : 'EN'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowColorPalette(!showColorPalette)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border transition cursor-pointer ${
                showColorPalette ? 'bg-blue-600 text-white border-blue-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <Palette className="w-3 h-3 text-amber-500" />
              <span>لون الخط</span>
            </button>

            <button
              onClick={toggleLayoutMode}
              className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[9px] font-bold cursor-pointer"
            >
              {layoutMode === 'standard' ? 'نسق: قياسي 101' : 'نسق: يميني RTL'}
            </button>

            <button
              onClick={toggleNumberType}
              className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[9px] font-bold cursor-pointer"
            >
              {numberType === 'eastern' ? 'أرقام: ١٢٣' : 'أرقام: 123'}
            </button>

            <button
              onClick={toggleInputMode}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[9px] font-bold border border-blue-300 cursor-pointer"
            >
              <Smartphone className="w-3 h-3 text-blue-600" />
              <span>📱 هاتف</span>
            </button>

            <button
              onClick={() => setShowExtraMenu(!showExtraMenu)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border transition cursor-pointer ${
                showExtraMenu ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>تشكيل {showExtraMenu ? '▲' : '▼'}</span>
            </button>

            <button
              onClick={() => setShowShortcutsBar(!showShortcutsBar)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border transition cursor-pointer ${
                showShortcutsBar ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white hover:bg-slate-100 text-indigo-700 border-indigo-200'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>اختصارات ⚡</span>
            </button>

            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            >
              {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onUpdateState({ isOpen: false })}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-rose-100 hover:text-rose-600 text-slate-600 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-2 space-y-1.5 bg-slate-100/95 text-xs">

            {predictiveSuggestions.length > 0 && (
              <div 
                className="bg-white/85 backdrop-blur-md border border-indigo-300/80 rounded-xl p-1.5 shadow-md flex items-center justify-between gap-1.5 select-none"
                dir="rtl"
              >
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none flex-1">
                  <div className="flex items-center gap-1 text-indigo-900 font-extrabold text-[10px] pl-1 border-l border-indigo-200 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    <span>اقتراحات ذكية:</span>
                  </div>

                  {predictiveSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5 border bg-white/95 hover:bg-indigo-50 border-indigo-200 text-slate-800"
                    >
                      <span>{suggestion.text}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={clearPredictions}
                  className="w-6 h-6 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            {showShortcutsBar && (
              <div className="bg-white/90 p-1 rounded-xl border border-indigo-200 shadow-xs flex items-center justify-between gap-1" dir="rtl">
                <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none text-[10px]">
                  <span className="font-bold text-indigo-900 shrink-0 flex items-center gap-1 pl-1 border-l border-indigo-100">
                    <span>⚡ اختصارات:</span>
                  </span>
                  <button onClick={() => onCommand?.('save')} className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg font-bold cursor-pointer">Ctrl+S حفظ</button>
                  <button onClick={() => onCommand?.('bold')} className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg font-bold cursor-pointer">Ctrl+B غامق</button>
                  <button onClick={() => onCommand?.('italic')} className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg font-bold cursor-pointer">Ctrl+I مائل</button>
                  <button onClick={() => onCommand?.('underline')} className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg font-bold cursor-pointer">Ctrl+U تسطير</button>
                  <button onClick={() => onCommand?.('undo')} className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-bold cursor-pointer">Ctrl+Z تراجع</button>
                  <button onClick={() => onCommand?.('copy')} className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-bold cursor-pointer">Ctrl+C نسخ</button>
                  <button onClick={() => onCommand?.('paste')} className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-bold cursor-pointer">Ctrl+V لصق</button>
                </div>
              </div>
            )}

            {showExtraMenu && (
              <div className="bg-amber-50/90 border border-amber-200 p-2 rounded-xl space-y-1.5" dir="rtl">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 border-b border-amber-200 pb-1">
                  <span>تشكيل الحروف العربية السريع:</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  {tashkeelList.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleKeyClick(item.char)}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-lg font-bold text-xs cursor-pointer shrink-0"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showColorPalette && (
              <div className="bg-blue-50/90 border border-blue-200 p-2 rounded-xl space-y-1.5" dir="rtl">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 border-b border-blue-200 pb-1">
                  <span>لوحة ألوان النص السريعة:</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                  {quickColors.map((col, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onCommand?.(`color_${col.hex}`);
                        setShowColorPalette(false);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-blue-100 text-slate-800 border border-blue-300 rounded-lg font-bold text-xs cursor-pointer shrink-0"
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-400 shrink-0" style={{ backgroundColor: col.hex }} />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Keyboard Keys Layout */}
            <div className="space-y-1 select-none" dir="ltr">
              <div className="flex gap-1 justify-center">
                {numRow.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeyClick(getChar(item))}
                    className="flex-1 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-lg py-1.5 border border-slate-300 text-xs flex flex-col items-center justify-center cursor-pointer"
                  >
                    <span>{state.shiftActive && item.shift ? item.shift : item.char}</span>
                  </button>
                ))}
                <button
                  onClick={handleBackspaceKey}
                  className="w-12 bg-slate-300 hover:bg-slate-400 text-slate-900 font-bold rounded-lg py-1.5 border border-slate-400 text-xs flex items-center justify-center cursor-pointer"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-1 justify-center">
                {(state.language === 'ar' ? activeArRow1 : enRow1).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeyClick(getChar(item))}
                    className="flex-1 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-lg py-2 border border-slate-300 text-sm flex flex-col items-center justify-center cursor-pointer"
                  >
                    <span>{getChar(item)}</span>
                  </button>
                ))}
                <button
                  onClick={handleTabKey}
                  className="w-12 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg py-2 border border-slate-300 text-xs flex items-center justify-center cursor-pointer"
                >
                  Tab
                </button>
              </div>

              <div className="flex gap-1 justify-center">
                <button
                  onClick={toggleCaps}
                  className={`w-11 rounded-lg py-2 text-xs font-bold border cursor-pointer flex items-center justify-center ${
                    state.capsActive ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                  }`}
                >
                  Caps
                </button>
                {(state.language === 'ar' ? activeArRow2 : enRow2).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeyClick(getChar(item))}
                    className="flex-1 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-lg py-2 border border-slate-300 text-sm flex flex-col items-center justify-center cursor-pointer"
                  >
                    <span>{getChar(item)}</span>
                  </button>
                ))}
                <button
                  onClick={handleEnterKey}
                  className="w-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-2 border border-blue-700 text-xs flex items-center justify-center cursor-pointer"
                >
                  <CornerDownLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-1 justify-center">
                <button
                  onClick={toggleShift}
                  className={`w-12 rounded-lg py-2 text-xs font-bold border cursor-pointer flex items-center justify-center ${
                    state.shiftActive ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                  }`}
                >
                  Shift
                </button>
                {(state.language === 'ar' ? activeArRow3 : enRow3).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeyClick(getChar(item))}
                    className="flex-1 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-lg py-2 border border-slate-300 text-sm flex flex-col items-center justify-center cursor-pointer"
                  >
                    <span>{getChar(item)}</span>
                  </button>
                ))}
                <button
                  onClick={toggleShift}
                  className={`w-12 rounded-lg py-2 text-xs font-bold border cursor-pointer flex items-center justify-center ${
                    state.shiftActive ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                  }`}
                >
                  Shift
                </button>
              </div>

              <div className="flex gap-1 justify-center items-center">
                <button
                  onClick={toggleCtrl}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border cursor-pointer ${
                    state.ctrlActive ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                  }`}
                >
                  Ctrl {state.ctrlActive ? 'ON' : ''}
                </button>

                <button
                  onClick={toggleAlt}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border cursor-pointer ${
                    state.altActive ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                  }`}
                >
                  Alt {state.altActive ? 'ON' : ''}
                </button>

                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg border border-slate-300 text-xs cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>{state.language === 'ar' ? 'EN 🌐' : 'عربي 🌐'}</span>
                </button>

                <button
                  onClick={() => handleKeyClick(' ')}
                  className="flex-1 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-lg py-2 border border-slate-300 text-xs flex items-center justify-center cursor-pointer"
                >
                  مسافة (Space)
                </button>

                <div className="flex items-center gap-1">
                  <button onClick={() => onArrowKey?.('right')} className="w-8 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg border border-slate-300 text-xs flex items-center justify-center cursor-pointer">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onArrowKey?.('up')} className="w-8 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg border border-slate-300 text-xs flex items-center justify-center cursor-pointer">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onArrowKey?.('down')} className="w-8 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg border border-slate-300 text-xs flex items-center justify-center cursor-pointer">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onArrowKey?.('left')} className="w-8 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg border border-slate-300 text-xs flex items-center justify-center cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
