import React, { useState, useEffect, useRef } from 'react';
import { WordDocumentState } from '../../types';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Coffee, 
  Type, 
  Clock, 
  FileText,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';

interface WordFocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordState: WordDocumentState;
  onUpdateContent: (html: string) => void;
  onUpdateSettings?: (settings: Partial<WordDocumentState>) => void;
}

type FocusTheme = 'dark' | 'light' | 'sepia';

export const WordFocusModeModal: React.FC<WordFocusModeModalProps> = ({
  isOpen,
  onClose,
  wordState,
  onUpdateContent,
}) => {
  const [theme, setTheme] = useState<FocusTheme>('dark');
  const [fontSize, setFontSize] = useState<number>(18);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);
  const [wordCount, setWordCount] = useState<number>(0);
  const editorRef = useRef<HTMLDivElement>(null);

  // Timer for focused writing session
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setElapsedMinutes(m => m + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Calculate word count
  useEffect(() => {
    if (!wordState.contentHtml) {
      setWordCount(0);
      return;
    }
    const temp = document.createElement('div');
    temp.innerHTML = wordState.contentHtml;
    const text = temp.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, [wordState.contentHtml]);

  if (!isOpen) return null;

  const themeClasses: Record<FocusTheme, { bg: string; text: string; editorBg: string; border: string }> = {
    dark: {
      bg: 'bg-slate-950 text-slate-100',
      text: 'text-slate-100',
      editorBg: 'bg-slate-900/60',
      border: 'border-slate-800'
    },
    light: {
      bg: 'bg-slate-50 text-slate-900',
      text: 'text-slate-900',
      editorBg: 'bg-white shadow-lg',
      border: 'border-slate-200'
    },
    sepia: {
      bg: 'bg-[#fbf0d9] text-[#433422]',
      text: 'text-[#433422]',
      editorBg: 'bg-[#f4e4c1]/60 shadow-md',
      border: 'border-[#dfcca5]'
    }
  };

  const currentTheme = themeClasses[theme];

  return (
    <div 
      className={`fixed inset-0 z-[200] flex flex-col ${currentTheme.bg} transition-colors duration-300 font-sans select-text`}
      dir="rtl"
    >
      {/* Top Floating Control Bar */}
      <header className="h-14 px-6 flex items-center justify-between border-b backdrop-blur-md opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>وضع التركيز والكتابة الهادئة</span>
          </span>
          <span className="text-xs opacity-60">| {wordState.title || 'مستند بدون عنوان'}</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {/* Stats */}
          <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-black/10 dark:bg-white/10">
            <span className="flex items-center gap-1 font-mono">
              <FileText className="w-3.5 h-3.5 opacity-70" />
              <span>{wordCount} كلمة</span>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 opacity-70" />
              <span>{elapsedMinutes} دقيقة</span>
            </span>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1 border rounded-lg px-2 py-0.5 border-current/20">
            <button 
              onClick={() => setFontSize(s => Math.max(14, s - 2))}
              className="px-1 font-bold hover:opacity-75"
              title="تصغير الخط"
            >
              A-
            </button>
            <span className="font-mono text-[11px] px-1">{fontSize}px</span>
            <button 
              onClick={() => setFontSize(s => Math.min(32, s + 2))}
              className="px-1 font-bold hover:opacity-75"
              title="تكبير الخط"
            >
              A+
            </button>
          </div>

          {/* Theme switcher */}
          <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 p-1 rounded-xl">
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg transition ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'opacity-60 hover:opacity-100'}`}
              title="الوضع الليلي الهادئ"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded-lg transition ${theme === 'sepia' ? 'bg-amber-700 text-white' : 'opacity-60 hover:opacity-100'}`}
              title="وضع القراءة الدافئ (Sepia)"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg transition ${theme === 'light' ? 'bg-blue-600 text-white' : 'opacity-60 hover:opacity-100'}`}
              title="الوضع النهاري المضيء"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Exit focus button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>إنهاء وضع التركيز</span>
          </button>
        </div>
      </header>

      {/* Main Focused Editor Canvas */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 flex justify-center">
        <div 
          className={`w-full max-w-3xl min-h-[85vh] p-8 md:p-14 rounded-2xl ${currentTheme.editorBg} border ${currentTheme.border} transition-all duration-200 outline-none focus:ring-1 focus:ring-blue-500/30`}
        >
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            dir="rtl"
            style={{ 
              fontSize: `${fontSize}px`, 
              lineHeight: 1.8,
              fontFamily: wordState.fontFamily || "'Amiri', serif"
            }}
            dangerouslySetInnerHTML={{ __html: wordState.contentHtml || '<p>ابدأ الكتابة بتركيز تام هنا...</p>' }}
            onInput={(e) => {
              onUpdateContent((e.target as HTMLDivElement).innerHTML);
            }}
            className="outline-none min-h-[70vh] focus:outline-none"
          />
        </div>
      </main>
    </div>
  );
};
