import React, { useRef, useState } from 'react';
import { 
  FileText, 
  Table as TableIcon, 
  Save, 
  FolderOpen, 
  Printer, 
  Keyboard, 
  Download, 
  RotateCcw, 
  RotateCw, 
  CheckCircle2, 
  ChevronDown,
  Sparkles,
  Edit3,
  FilePlus,
  Trash2,
  BookOpen,
  ExternalLink,
  Maximize,
  Minimize,
  HardDrive,
  FileDown,
  Code,
  Share2,
  ShieldCheck
} from 'lucide-react';
import { AppMode } from '../types';

interface TopHeaderProps {
  mode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  documentTitle: string;
  onTitleChange: (newTitle: string) => void;
  onSave: () => void;
  onSaveAs?: () => void;
  onPrint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onToggleKeyboard: () => void;
  isKeyboardOpen: boolean;
  onExportDoc: () => void;
  onExportDocx?: () => void;
  onExportPdf: () => void;
  onExportHtml?: () => void;
  onExportTxt?: () => void;
  onExportXlsx?: () => void;
  onExportXls?: () => void;
  onExportCsv?: () => void;
  onOpenLocalDocsModal?: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  lastSavedText: string;
  onOpenSimulator?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onNewDocument: () => void;
  onOpenDocument: () => void;
  onClearDocument: () => void;
  isReadMode: boolean;
  onToggleReadMode: () => void;
  onToggleFloatingWindow: () => void;
  onOpenSourceCode?: () => void;
  onShareDocument?: () => void;
  onOpenPermissionsModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  mode,
  onSelectMode,
  documentTitle,
  onTitleChange,
  onSave,
  onSaveAs,
  onPrint,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onToggleKeyboard,
  isKeyboardOpen,
  onExportDoc,
  onExportDocx,
  onExportPdf,
  onExportHtml,
  onExportTxt,
  onExportXlsx,
  onExportXls,
  onExportCsv,
  onOpenLocalDocsModal,
  onImportFile,
  lastSavedText,
  onOpenSimulator,
  isDarkMode,
  onToggleDarkMode,
  isFocusMode,
  onToggleFocusMode,
  isFullscreen,
  onToggleFullscreen,
  onNewDocument,
  onOpenDocument,
  onClearDocument,
  isReadMode,
  onToggleReadMode,
  onToggleFloatingWindow,
  onOpenSourceCode,
  onShareDocument,
  onOpenPermissionsModal
}) => {
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFilePrintMenu, setShowFilePrintMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingTitle(false);
  };

  const closeAllMenus = () => {
    setShowSaveMenu(false);
    setShowExportMenu(false);
    setShowFilePrintMenu(false);
  };

  return (
    <header className="bg-[#1e293b] text-white border-b border-slate-700/80 select-none shadow-xs no-print sticky top-0 z-40 h-[28px] max-h-[28px] flex items-center">
      {/* Top Main Navigation Bar - Single Line (0.5cm) */}
      <div className="w-full flex items-center justify-between px-2 gap-1.5 overflow-x-auto overflow-y-hidden text-[11px]">
        {/* Right Section: Suite Mode Switcher, Title & Room Cloud Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Official Suite PRO Badge & App Icon */}
          <div className="flex items-center bg-[#0f172a] text-white rounded px-2 py-0.5 text-[10px] font-bold border border-blue-500/50 shadow-xs gap-1.5">
            <img src="/app-icon.svg" alt="أيقونة وورد وإكسل" className="w-4 h-4 rounded-xs shrink-0 shadow-xs object-contain" />
            <span className="text-amber-400 font-extrabold text-[9.5px] font-mono tracking-wide">DOCX&XLSX-Editor-(772492559)</span>
            <span className="text-[9px] bg-blue-600 text-white font-mono px-1 rounded font-bold border border-blue-400/40" title="الإصدار المحدث v3.0.0">v3.0.0</span>
            <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 rounded flex items-center gap-0.5 border border-emerald-400/40 shadow-2xs" title="جميع مزايا PRO مفعلة مجاناً 100% بدون أي قيود">
              <span>👑 PRO مجاني</span>
            </span>
            <span className="w-3.5 h-3.5 rounded bg-blue-500 text-white font-black flex items-center justify-center text-[9px] mr-0.5">
              {mode === 'word' ? 'W' : 'X'}
            </span>
          </div>

          {/* Word Switcher Tab */}
          <button
            id="mode-switch-word"
            onClick={() => onSelectMode('word')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
              mode === 'word'
                ? 'bg-[#2563eb] text-white shadow-xs ring-1 ring-blue-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3 text-blue-200" />
            <span>وورد</span>
          </button>

          {/* Excel Switcher Tab */}
          <button
            id="mode-switch-excel"
            onClick={() => onSelectMode('excel')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
              mode === 'excel'
                ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <TableIcon className="w-3 h-3 text-emerald-200" />
            <span>إكسل</span>
          </button>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs hover:bg-amber-400'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-amber-200 border border-slate-700'
            }`}
            title={isDarkMode ? 'الوضع الليلي مفعل (انقر للوضع الفاتح ☀️)' : 'تفعيل الوضع الليلي المريح للعين 🌙'}
          >
            <span>{isDarkMode ? '🌙 ليلي' : '☀️ فاتح'}</span>
          </button>

          {/* Focus Mode Toggle Button */}
          <button
            onClick={onToggleFocusMode}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-blue-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="وضع التركيز (إخفاء أشرطة الأدوات للكتابة بدون إزعاج 🎯)"
          >
            <span>🎯 تركيز</span>
          </button>

          {/* Fullscreen Mode Toggle Button */}
          <button
            onClick={onToggleFullscreen}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer border ${
              isFullscreen 
                ? 'bg-purple-600 text-white border-purple-400 font-black shadow-xs' 
                : 'bg-slate-800 text-purple-300 hover:bg-slate-700 hover:text-white border-slate-700'
            }`}
            title={isFullscreen ? 'خروج من وضع ملء الشاشة' : 'تفعيل وضع ملء الشاشة الكامل للمحرر (Fullscreen)'}
          >
            {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
            <span>{isFullscreen ? 'تصغير' : 'ملء الشاشة'}</span>
          </button>

          {/* New Document Button */}
          <button
            onClick={onNewDocument}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-xs"
            title="إنشاء مستند جديد فارغ 📄"
          >
            <FilePlus className="w-3 h-3" />
            <span>جديد</span>
          </button>

          {/* Open & Preview Document Button */}
          <button
            onClick={onOpenDocument}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-emerald-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="فتح ومعاينة مستند (وورد / بي دي إف / نص) 📂"
          >
            <FolderOpen className="w-3 h-3 text-emerald-400" />
            <span>فتح ومعاينة</span>
          </button>

          {/* Read / Write Mode Toggle Button */}
          <button
            onClick={onToggleReadMode}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
              isReadMode
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-800 text-purple-300 hover:bg-slate-700 border border-slate-700'
            }`}
            title={isReadMode ? 'وضع القراءة مفعل (انقر للعودة للتحرير والكتابة ✍️)' : 'وضع القراءة والمعاينة (قراءة المستند بتركيز 👓)'}
          >
            <BookOpen className="w-3 h-3" />
            <span>{isReadMode ? '👓 قراءة' : '✍️ تحرير'}</span>
          </button>

          {/* Source Code & HTML Viewer Button (< >) */}
          <button
            onClick={onOpenSourceCode}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-xs"
            title="نافذة الكود البرمجي وهيكل HTML/JSON (< >)"
          >
            <Code className="w-3 h-3" />
            <span>&lt;&gt; الكود</span>
          </button>

          {/* Delete Document Content Button */}
          <button
            onClick={onClearDocument}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-rose-300 hover:bg-rose-950 hover:text-rose-200 border border-slate-700 transition-all cursor-pointer"
            title="حذف محتوى المستند أو إعادة تعيينه 🗑️"
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span>حذف</span>
          </button>

          {/* Always on Top / Floating Window Mode (الظهور فوق التطبيقات) */}
          <button
            onClick={onToggleFloatingWindow}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-xs"
            title="الظهور فوق التطبيقات الأخرى (فتح في نافذة عائمة مستقلة PiP) 🪟"
          >
            <ExternalLink className="w-3 h-3" />
            <span>فوق التطبيقات</span>
          </button>

          <div className="h-3.5 w-px bg-slate-700 mx-0.5 hidden sm:block" />

          {/* Document Title Pill */}
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center">
              <input
                id="document-title-input"
                type="text"
                autoFocus
                value={documentTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                className="bg-slate-900 text-white border border-blue-400 rounded px-1.5 py-0 text-[11px] font-bold focus:outline-none"
              />
            </form>
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-100 bg-[#0f172a]/90 hover:bg-slate-900 border border-slate-600 px-2 py-0.5 rounded transition max-w-[170px] truncate"
              title="انقر لتعديل اسم المستند"
            >
              <span className="truncate">{documentTitle}</span>
              <Edit3 className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            </button>
          )}

          {/* Auto-save Status Indicator (Room Cloud) */}
          <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-300 bg-emerald-950/70 border border-emerald-700/60 px-2 py-0.2 rounded-full whitespace-nowrap">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
            <span>محفوظ تلقائياً (Room)</span>
          </div>
        </div>

        {/* Left Section: Merged Action Dropdown Menus */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Direct Share Button (مشاركة عبر واتساب، بلوتوث، وتطبيقات النظام) */}
          {onShareDocument && (
            <button
              id="header-share-button"
              onClick={onShareDocument}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold transition text-[11px] shadow-xs active:scale-95 cursor-pointer"
              title="مشاركة المستند عبر واتساب، بلوتوث، وتطبيقات أندرويد 📤"
            >
              <Share2 className="w-3 h-3 text-white" />
              <span>مشاركة 📤</span>
            </button>
          )}

          {/* Merged Save Dropdown (دمج ميزات الحفظ والحفظ باسم) */}
          <div className="relative">
            <button
              id="header-save-dropdown"
              onClick={() => {
                setShowSaveMenu(!showSaveMenu);
                setShowExportMenu(false);
                setShowFilePrintMenu(false);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition text-[11px] shadow-xs cursor-pointer"
              title="قائمة الحفظ والمزامنة (Ctrl+S / Save As)"
            >
              <Save className="w-3 h-3" />
              <span>حفظ</span>
              <ChevronDown className="w-2.5 h-2.5 text-emerald-200" />
            </button>

            {showSaveMenu && (
              <div 
                className="absolute left-0 mt-1 w-64 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-1 text-xs z-50 animate-in fade-in slide-in-from-top-1"
                onClick={closeAllMenus}
              >
                <div className="px-3 py-1 font-bold text-slate-400 border-b border-slate-100 text-[10px] uppercase tracking-wider">
                  خيارات الحفظ (ذاكرة التخزين المحلية)
                </div>
                
                {/* 1. Quick Save to Local Storage */}
                <button
                  onClick={onSave}
                  className="w-full text-right px-3 py-1.5 hover:bg-emerald-50 flex items-center justify-between text-slate-800 hover:text-emerald-800 transition font-bold"
                >
                  <div className="flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5 text-emerald-600" />
                    <span>حفظ في الذاكرة المحلية</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">Ctrl+S</span>
                </button>

                {/* 2. Direct PDF Save */}
                <button
                  onClick={onExportPdf}
                  className="w-full text-right px-3 py-1.5 hover:bg-rose-50 flex items-center justify-between text-slate-800 hover:text-rose-800 transition font-bold"
                >
                  <div className="flex items-center gap-1.5">
                    <FileDown className="w-3.5 h-3.5 text-rose-600" />
                    <span>حفظ كـ مستند PDF (.pdf)</span>
                  </div>
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono font-bold">PDF</span>
                </button>

                {/* 3. Word format saves */}
                {mode === 'word' ? (
                  <>
                    <button
                      onClick={onExportDocx || onExportDoc}
                      className="w-full text-right px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between text-slate-800 hover:text-blue-800 transition font-bold"
                    >
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>حفظ كـ Word حديث (.docx)</span>
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">DOCX</span>
                    </button>
                    <button
                      onClick={onExportDoc}
                      className="w-full text-right px-3 py-1.5 hover:bg-sky-50 flex items-center justify-between text-slate-800 hover:text-sky-800 transition font-bold"
                    >
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-sky-600" />
                        <span>حفظ كـ Word كلاسيكي (.doc)</span>
                      </div>
                      <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono font-bold">DOC</span>
                    </button>
                  </>
                ) : (
                  <>
                    {onExportXlsx && (
                      <button
                        onClick={onExportXlsx}
                        className="w-full text-right px-3 py-1.5 hover:bg-emerald-50 flex items-center justify-between text-slate-800 hover:text-emerald-800 transition font-bold"
                      >
                        <div className="flex items-center gap-1.5">
                          <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>حفظ كـ Excel حديث (.xlsx)</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">XLSX</span>
                      </button>
                    )}
                    {(onExportXls || onExportXlsx) && (
                      <button
                        onClick={onExportXls || onExportXlsx}
                        className="w-full text-right px-3 py-1.5 hover:bg-teal-50 flex items-center justify-between text-slate-800 hover:text-teal-800 transition font-bold"
                      >
                        <div className="flex items-center gap-1.5">
                          <TableIcon className="w-3.5 h-3.5 text-teal-600" />
                          <span>حفظ كـ Excel كلاسيكي (.xls)</span>
                        </div>
                        <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-mono font-bold">XLS</span>
                      </button>
                    )}
                  </>
                )}

                {/* 4. Save As Custom with Folders */}
                {onSaveAs && (
                  <button
                    onClick={onSaveAs}
                    className="w-full text-right px-3 py-1.5 hover:bg-indigo-50 flex items-center justify-between text-slate-800 hover:text-indigo-800 transition font-bold border-t border-slate-100 mt-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5 text-indigo-600" />
                      <span>حفظ باسم مخصص (Save As)...</span>
                    </div>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono">خيارات</span>
                  </button>
                )}

                {/* 5. Open Local Storage Manager */}
                {onOpenLocalDocsModal && (
                  <button
                    onClick={onOpenLocalDocsModal}
                    className="w-full text-right px-3 py-1.5 hover:bg-purple-50 flex items-center justify-between text-purple-900 transition font-bold border-t border-slate-100 bg-purple-50/30"
                  >
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-purple-600" />
                      <span>ذاكرة التخزين المحلية (المستندات)</span>
                    </div>
                    <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-bold">المكتبة</span>
                  </button>
                )}

                <div className="px-3 py-1 text-[10px] text-slate-500 bg-slate-50 border-t border-slate-100 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>{lastSavedText || 'المستند محفوظ تلقائياً'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Merged File & Print Menu (دمج الفتح والطباعة والكيبورد) */}
          <div className="relative">
            <button
              id="header-file-print-dropdown"
              onClick={() => {
                setShowFilePrintMenu(!showFilePrintMenu);
                setShowSaveMenu(false);
                setShowExportMenu(false);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition text-[11px]"
              title="قائمة المستندات الشاملة"
            >
              <FolderOpen className="w-3 h-3 text-amber-400" />
              <span>قائمة المستندات</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </button>

            {showFilePrintMenu && (
              <div 
                className="absolute left-0 mt-1 w-52 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-1 text-xs z-50 animate-in fade-in slide-in-from-top-1"
                onClick={closeAllMenus}
              >
                <div className="px-3 py-1 font-bold text-slate-400 border-b border-slate-100 text-[10px] uppercase tracking-wider">
                  الأدوات والملف
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-right px-3 py-1.5 hover:bg-amber-50 flex items-center justify-between text-slate-800 hover:text-amber-800 transition font-bold"
                >
                  <div className="flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                    <span>فتح أو استيراد ملف...</span>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-mono">Open</span>
                </button>
                <button
                  onClick={onPrint}
                  className="w-full text-right px-3 py-1.5 hover:bg-indigo-50 flex items-center justify-between text-slate-800 hover:text-indigo-800 transition font-bold"
                >
                  <div className="flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5 text-indigo-600" />
                    <span>معاينة وطباعة ورقية</span>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1 py-0.2 rounded font-mono">Print</span>
                </button>
                <button
                  onClick={onToggleKeyboard}
                  className="w-full text-right px-3 py-1.5 hover:bg-teal-50 flex items-center justify-between text-slate-800 hover:text-teal-800 transition font-bold"
                >
                  <div className="flex items-center gap-1.5">
                    <Keyboard className="w-3.5 h-3.5 text-teal-600" />
                    <span>لوحة المفاتيح الافتراضية</span>
                  </div>
                  <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${isKeyboardOpen ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {isKeyboardOpen ? 'مفعل' : 'إخفاء'}
                  </span>
                </button>
                {onOpenPermissionsModal && (
                  <button
                    onClick={onOpenPermissionsModal}
                    className="w-full text-right px-3 py-1.5 hover:bg-emerald-50 flex items-center justify-between text-slate-800 hover:text-emerald-800 transition font-bold"
                  >
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>أذونات وصلاحيات أندرويد 🛡️</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">تفعيل</span>
                  </button>
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportFile}
              accept=".doc,.docx,.pdf,.xlsx,.xls,.csv,.txt,.html"
              className="hidden"
            />
          </div>

          {/* Templates / Simulation Button */}
          {onOpenSimulator && (
            <button
              id="header-simulator-trigger"
              onClick={onOpenSimulator}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-bold transition text-[11px] shadow-xs ${
                mode === 'excel'
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title={mode === 'word' ? 'نماذج ومحاكاة مستند وورد' : 'محاكي وظائف وأدوات جداول إكسل'}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{mode === 'word' ? 'نماذج ومحاكاة' : 'محاكي إكسل ⚡'}</span>
            </button>
          )}

          {/* Merged Export & Download Menu (دمج التصدير وتحميل APK وحزمة الكود في قائمة واحدة) */}
          <div className="relative">
            <button
              id="header-export-dropdown"
              onClick={() => {
                setShowExportMenu(!showExportMenu);
                setShowSaveMenu(false);
                setShowFilePrintMenu(false);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#2563eb] hover:bg-blue-600 text-white text-[11px] font-bold shadow-xs transition"
              title="قائمة التصدير وتحميل التطبيق"
            >
              <Download className="w-3 h-3" />
              <span>تصدير وتحميل</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {showExportMenu && (
              <div 
                className="absolute left-0 mt-1 w-60 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-1 text-xs z-50 animate-in fade-in slide-in-from-top-1"
                onClick={closeAllMenus}
              >
                <div className="px-3 py-1 font-bold text-slate-400 border-b border-slate-100 text-[10px] uppercase tracking-wider">
                  خيارات التصدير السريع
                </div>

                {mode === 'word' ? (
                  <>
                    <button
                      onClick={onExportDocx || onExportDoc}
                      className="w-full text-right px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between text-slate-700 hover:text-blue-700 transition text-xs"
                    >
                      <span className="font-semibold">تصدير Word حديث (.docx)</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-mono">.docx</span>
                    </button>
                    <button
                      onClick={onExportDoc}
                      className="w-full text-right px-3 py-1.5 hover:bg-sky-50 flex items-center justify-between text-slate-700 hover:text-sky-700 transition text-xs"
                    >
                      <span className="font-semibold">تصدير Word كلاسيكي (.doc)</span>
                      <span className="text-[10px] bg-sky-100 text-sky-800 px-1 py-0.2 rounded font-mono">.doc</span>
                    </button>
                    <button
                      onClick={onExportPdf}
                      className="w-full text-right px-3 py-1.5 hover:bg-rose-50 flex items-center justify-between text-slate-700 hover:text-rose-700 transition text-xs font-semibold"
                    >
                      <span>تصدير PDF (إعدادات وهوامش وتخطيط)</span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-mono">PDF</span>
                    </button>
                    {onExportHtml && (
                      <button
                        onClick={onExportHtml}
                        className="w-full text-right px-3 py-1.5 hover:bg-amber-50 flex items-center justify-between text-slate-700 hover:text-amber-700 transition text-xs"
                      >
                        <span>صفحة ويب كاملة (.html)</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-mono">HTML</span>
                      </button>
                    )}
                    {onExportTxt && (
                      <button
                        onClick={onExportTxt}
                        className="w-full text-right px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between text-slate-700 transition text-xs"
                      >
                        <span>نص مجرد (.txt)</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1 py-0.2 rounded font-mono">TXT</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {onExportXlsx && (
                      <button
                        onClick={onExportXlsx}
                        className="w-full text-right px-3 py-1.5 hover:bg-emerald-50 flex items-center justify-between text-slate-700 hover:text-emerald-700 transition text-xs"
                      >
                        <span className="font-semibold">مصنف إكسل حديث (.xlsx)</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono">.xlsx</span>
                      </button>
                    )}
                    {(onExportXls || onExportXlsx) && (
                      <button
                        onClick={onExportXls || onExportXlsx}
                        className="w-full text-right px-3 py-1.5 hover:bg-teal-50 flex items-center justify-between text-slate-700 hover:text-teal-700 transition text-xs"
                      >
                        <span className="font-semibold">مصنف إكسل كلاسيكي (.xls)</span>
                        <span className="text-[10px] bg-teal-100 text-teal-800 px-1 py-0.2 rounded font-mono">.xls</span>
                      </button>
                    )}
                    {onExportCsv && (
                      <button
                        onClick={onExportCsv}
                        className="w-full text-right px-3 py-1.5 hover:bg-cyan-50 flex items-center justify-between text-slate-700 hover:text-cyan-700 transition text-xs"
                      >
                        <span>ملف جدول مفصول بفواصل (.csv)</span>
                        <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1 py-0.2 rounded font-mono">CSV</span>
                      </button>
                    )}
                    <button
                      onClick={onExportPdf}
                      className="w-full text-right px-3 py-1.5 hover:bg-rose-50 flex items-center justify-between text-slate-700 hover:text-rose-700 transition text-xs font-semibold"
                    >
                      <span>تصدير PDF (إعدادات وهوامش وتخطيط)</span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-mono">PDF</span>
                    </button>
                  </>
                )}

                {/* Merged Direct App & Source Downloads */}
                <div className="border-t border-slate-200 mt-1 pt-1 space-y-1">
                  <div className="px-3 py-0.5 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                    تحميل الحزم ومستودع الكود
                  </div>
                  <a
                    id="header-download-apk-btn"
                    href="https://github.com/YENENIDCRAD26/word-xlsx-mazen-docx/releases/download/apk-latest/Word-Excel-Suite.apk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-right px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-between rounded transition text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <span>📱 تحميل تطبيق الأندرويد (.apk)</span>
                    <span className="text-[10px] bg-white text-emerald-800 px-1.5 py-0.5 rounded font-mono font-black">APK</span>
                  </a>
                  <a
                    href="/api/download-app"
                    download="office-pro-project.zip"
                    className="w-full text-right px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-between transition text-xs font-bold rounded shadow-xs cursor-pointer"
                  >
                    <span>📦 تحميل مجلد التطبيق كاملاً (.zip)</span>
                    <span className="text-[10px] bg-white text-blue-800 px-1.5 py-0.5 rounded font-mono font-black">ZIP</span>
                  </a>
                  <a
                    href="https://github.com/YENENIDCRAD26/OfficePRO.git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-right px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-between transition text-xs font-medium rounded cursor-pointer"
                  >
                    <span>🔗 مستودع GitHub (OfficePRO)</span>
                    <span className="text-[10px] bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded font-mono">GIT</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Quick Undo Button (⟲) */}
          <button
            id="header-undo-button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition ${
              !canUndo ? 'opacity-40 cursor-not-allowed' : ''
            }`}
            title="تراجع (Ctrl+Z)"
          >
            <RotateCw className="w-3 h-3 transform -scale-x-100" />
          </button>
        </div>
      </div>
    </header>
  );
};

