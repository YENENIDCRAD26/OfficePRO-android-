import React, { useMemo } from 'react';
import { 
  Keyboard, 
  ZoomIn, 
  ZoomOut, 
  BookOpen, 
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { AppMode } from '../types';

interface StatusBarProps {
  mode: AppMode;
  wordCount: number;
  charCount: number;
  rawText?: string;
  selectedCell?: string;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  isKeyboardOpen: boolean;
  onToggleKeyboard: () => void;
  isReadingMode: boolean;
  onToggleReadingMode: () => void;
  viewLayoutMode?: 'paginated' | 'continuous';
  onToggleViewLayoutMode?: () => void;
  paperSize?: string;
  syncStatus?: 'synced' | 'syncing' | 'offline' | 'local';
  onSyncNow?: () => void;
  onOpenProofreadAssistant?: () => void;
  onAddPageBreak?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  mode,
  wordCount,
  charCount,
  rawText = '',
  selectedCell,
  zoom,
  onZoomChange,
  isKeyboardOpen,
  onToggleKeyboard,
  isReadingMode,
  onToggleReadingMode,
  viewLayoutMode = 'paginated',
  onToggleViewLayoutMode,
  paperSize = 'A4',
  syncStatus = 'local',
  onSyncNow,
  onOpenProofreadAssistant,
  onAddPageBreak
}) => {
  // Advanced Word Document Detailed Statistics
  const { 
    pageCount, 
    readingTimeMinutes, 
    wordDensityPercent,
    paragraphCount,
    sentenceCount,
    charsWithSpaces,
    charsNoSpaces
  } = useMemo(() => {
    if (mode !== 'word' || (!wordCount && !rawText)) {
      return { 
        pageCount: 1, 
        readingTimeMinutes: 1, 
        wordDensityPercent: 0,
        paragraphCount: 0,
        sentenceCount: 0,
        charsWithSpaces: 0,
        charsNoSpaces: 0
      };
    }
    // Standard Arabic reading speed ~180-200 words per minute
    const readTime = Math.max(1, Math.ceil(wordCount / 180));
    // Standard A4 document contains ~250-300 words per page
    const pages = Math.max(1, Math.ceil(wordCount / 280));
    
    // Lexical density (ratio of unique tokens to total words)
    const tokens = rawText
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 1)
      .map((w) => w.toLowerCase());
    const uniqueTokens = new Set(tokens);
    const density = tokens.length > 0 ? Math.round((uniqueTokens.size / tokens.length) * 100) : 100;

    // Detailed counts
    const paragraphs = rawText.split(/\n+/).filter((p) => p.trim().length > 0).length || (rawText.trim() ? 1 : 0);
    const sentences = rawText.split(/[.!?؟؛]+/).filter((s) => s.trim().length > 0).length || (rawText.trim() ? 1 : 0);
    const cWithSpaces = rawText.length;
    const cNoSpaces = rawText.replace(/\s/g, '').length;

    return {
      pageCount: pages,
      readingTimeMinutes: readTime,
      wordDensityPercent: Math.min(100, Math.max(20, density)),
      paragraphCount: paragraphs,
      sentenceCount: sentences,
      charsWithSpaces: cWithSpaces,
      charsNoSpaces: cNoSpaces
    };
  }, [mode, wordCount, rawText]);

  const [showStatsModal, setShowStatsModal] = React.useState(false);

  return (
    <footer 
      className="bg-slate-800 text-slate-300 border-t border-slate-700 px-3 flex items-center justify-between text-[11px] select-none no-print z-30 overflow-hidden leading-none shadow-inner"
      style={{ height: '0.8cm', minHeight: '0.8cm', maxHeight: '0.8cm' }}
    >
      {/* Left Details */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
        {mode === 'word' ? (
          <>
            <div className="flex items-center gap-1.5 font-semibold text-blue-300 shrink-0">
              <FileText className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px]">DOCX&XLSX-Editor-(772492559)</span>
            </div>
            
            <div className="h-3 w-px bg-slate-600 hidden sm:block shrink-0" />
            
            {/* Detailed Word, Sentence, Paragraph & Char Counts */}
            <button 
              onClick={() => setShowStatsModal(true)}
              className="text-slate-300 hover:text-white hidden sm:flex items-center gap-1.5 shrink-0 bg-slate-900/50 hover:bg-slate-700/60 px-2 py-0.5 rounded border border-slate-700/60 transition cursor-pointer"
              title="انقر لعرض إحصائيات المستند المفصلة (الكلمات، الفقرات، الجمل، الحروف)"
            >
              <span>الكلمات: <b className="text-blue-300 font-mono">{wordCount}</b></span>
              <span className="text-slate-600">•</span>
              <span>الفقرات: <b className="text-emerald-300 font-mono">{paragraphCount}</b></span>
              <span className="text-slate-600">•</span>
              <span>الجمل: <b className="text-amber-300 font-mono">{sentenceCount}</b></span>
              <span className="text-slate-600">•</span>
              <span>الحروف: <b className="text-purple-300 font-mono">{charsWithSpaces}</b></span>
              <span className="text-slate-400 text-[9px]">(بدون مسافات: <b className="text-slate-200 font-mono">{charsNoSpaces}</b>)</span>
            </button>

            <div className="h-3 w-px bg-slate-600 hidden md:block shrink-0" />

            <div className="text-slate-400 hidden lg:flex items-center gap-1.5 shrink-0">
              <span>مقاس الورق: <b className="text-blue-300 font-mono">{paperSize}</b></span>
            </div>

            <div className="h-3 w-px bg-slate-600 hidden md:block shrink-0" />

            {/* Page Count & Document Navigator Controls */}
            <div className="flex items-center gap-1.5 shrink-0 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700">
              <Layers className="w-3 h-3 text-sky-400" />
              <span className="text-slate-300">صفحات المستند:</span>
              <span className="bg-blue-600 text-white px-1.5 py-0.2 rounded font-mono font-bold text-[10px]">
                {pageCount} {pageCount === 1 ? 'صفحة' : 'صفحات'}
              </span>



              {onToggleViewLayoutMode && (
                <button
                  onClick={onToggleViewLayoutMode}
                  className={`flex items-center gap-0.5 px-1.5 py-0.2 rounded font-bold transition text-[10px] border ${
                    viewLayoutMode === 'paginated'
                      ? 'bg-slate-700 text-sky-300 border-slate-600'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title="التبديل بين صفحات منفصلة وعرض مستمر"
                >
                  <span>{viewLayoutMode === 'paginated' ? 'صفحات منفصلة 📑' : 'عرض مستمر 📄'}</span>
                </button>
              )}

              {/* Insert New Page Button in Status Bar */}
              {onAddPageBreak && (
                <button
                  onClick={onAddPageBreak}
                  className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition text-[10px] shadow-2xs shrink-0 cursor-pointer"
                  title="إدراج صفحة جديدة ضمن المستند الحالي"
                >
                  <span>إدراج صفحة جديدة 📄+</span>
                </button>
              )}
            </div>

            {/* Proofread Assistant Button */}
            {onOpenProofreadAssistant && (
              <button
                onClick={onOpenProofreadAssistant}
                className="flex items-center gap-1 px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold transition text-[10px] shadow-2xs shrink-0 cursor-pointer"
                title="مساعد التدقيق الذكي (نقطة النهاية /api/proofread)"
              >
                <Sparkles className="w-3 h-3 text-amber-200" />
                <span>مساعد التدقيق</span>
              </button>
            )}

            {/* Estimated Reading Time */}
            <div 
              className="text-slate-300 hidden lg:flex items-center gap-1 bg-slate-700/50 px-1.5 py-0.5 rounded shrink-0 cursor-default"
              title="وقت القراءة التقديري (بمعدل 180 كلمة بالدقيقة)"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>القراءة: <b className="text-amber-300 font-mono">{readingTimeMinutes} د</b></span>
            </div>

            {/* Word Density */}
            {wordCount > 5 && (
              <div 
                className="text-slate-300 hidden xl:flex items-center gap-1 bg-slate-700/50 px-1.5 py-0.5 rounded shrink-0 cursor-default"
                title="كثافة الكلمات وتنوع المفردات اللغوية في النص"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>كثافة الكلمات: <b className="text-emerald-300 font-mono">{wordDensityPercent}%</b></span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-300 shrink-0">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>معالج جداول إكسل PRO</span>
            </div>
            <div className="h-3 w-px bg-slate-600 hidden sm:block shrink-0" />
            <div className="text-slate-400 hidden sm:flex items-center gap-2 shrink-0">
              <span>الخلية: <b className="text-emerald-400 font-mono">{selectedCell || 'A1'}</b></span>
              <span>•</span>
              <span>وضع الحساب: <b className="text-slate-200">تلقائي</b></span>
            </div>
          </>
        )}

        <div className="h-3 w-px bg-slate-600 hidden md:block shrink-0" />

        {/* Firebase Sync Status Indicator */}
        <button
          onClick={onSyncNow}
          className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer border ${
            syncStatus === 'synced'
              ? 'bg-emerald-900/60 text-emerald-300 border-emerald-500'
              : syncStatus === 'syncing'
              ? 'bg-amber-900/60 text-amber-300 border-amber-500 animate-pulse'
              : syncStatus === 'offline'
              ? 'bg-rose-900/60 text-rose-300 border-rose-500'
              : 'bg-slate-700 text-slate-300 border-slate-600'
          }`}
          title="حالة مزامنة المستند سحابياً مع Firebase Firestore (انقر للمزامنة الفورية)"
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>
            {syncStatus === 'synced' && 'متزامن مع Firestore ☁️'}
            {syncStatus === 'syncing' && 'جاري المزامنة... ⏳'}
            {syncStatus === 'offline' && 'غير متصل بالشبكة ⚠️'}
            {syncStatus === 'local' && 'محفوظ محلياً 💻'}
          </span>
        </button>

        <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 shrink-0">
          <CheckCircle2 className="w-3 h-3" />
          <span>محفوظ</span>
        </div>
      </div>

      {/* Right Controls: Keyboard, View Mode & Zoom */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Virtual Keyboard Toggle */}
        <button
          onClick={onToggleKeyboard}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition border ${
            isKeyboardOpen
              ? 'bg-teal-600 text-white border-teal-400'
              : 'hover:bg-slate-700 text-teal-300 border-slate-600'
          }`}
          title="لوحة المفاتيح الملحقة مع التشكيل والأوامر السريعة"
        >
          <Keyboard className="w-3 h-3" />
          <span className="hidden xs:inline">لوحة المفاتيح</span>
        </button>

        {/* Reading mode */}
        {mode === 'word' && (
          <button
            onClick={onToggleReadingMode}
            className={`p-1 rounded hover:bg-slate-700 transition ${
              isReadingMode ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
            title="تبديل وضع القراءة"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Version & Free PRO Status */}
        <span className="text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-1.5 py-0.5 rounded font-bold hidden md:inline" title="إصدار التطبيق ومزايا PRO مفعلة مجاناً">
          v3.0.0 (PRO مجاني)
        </span>

        {/* Language Badge */}
        <span className="text-[10px] text-slate-400 bg-slate-700/60 px-1.5 py-0.5 rounded font-medium hidden sm:inline">
          العربية (SA)
        </span>

        {/* Zoom Slider */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <button
            onClick={() => onZoomChange(Math.max(zoom - 10, 40))}
            className="p-0.5 hover:text-white rounded"
            title="تصغير"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min={50}
            max={150}
            step={5}
            value={zoom}
            onChange={(e) => onZoomChange(parseInt(e.target.value, 10))}
            className="w-16 sm:w-20 accent-blue-500 h-1 bg-slate-600 rounded-lg cursor-pointer"
          />

          <button
            onClick={() => onZoomChange(Math.min(zoom + 10, 200))}
            className="p-0.5 hover:text-white rounded"
            title="تكبير"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-[11px] w-9 text-left text-slate-200">
            {zoom}%
          </span>
        </div>
      </div>

      {showStatsModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowStatsModal(false)}
          dir="rtl"
        >
          <div 
            className="bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-5 w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>إحصائيات المستند المفصلة</span>
              </h3>
              <button 
                onClick={() => setShowStatsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">الكلمات:</span>
                <span className="font-bold font-mono text-blue-700">{wordCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">الفقرات:</span>
                <span className="font-bold font-mono text-emerald-700">{paragraphCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">الجمل:</span>
                <span className="font-bold font-mono text-amber-700">{sentenceCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">الحروف (مع مسافات):</span>
                <span className="font-bold font-mono text-purple-700">{charsWithSpaces}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">الحروف (بدون مسافات):</span>
                <span className="font-bold font-mono text-indigo-700">{charsNoSpaces}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">الصفحات التقديرية:</span>
                <span className="font-bold font-mono text-sky-700">{pageCount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">وقت القراءة التقديري:</span>
                <span className="font-bold font-mono text-rose-700">{readingTimeMinutes} دقيقة</span>
              </div>
            </div>
            <button 
              onClick={() => setShowStatsModal(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
