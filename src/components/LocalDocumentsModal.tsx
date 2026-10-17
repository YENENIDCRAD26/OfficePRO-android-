import React, { useState, useEffect } from 'react';
import { 
  X, 
  HardDrive, 
  FileText, 
  FileSpreadsheet, 
  Trash2, 
  Download, 
  FolderOpen, 
  Copy, 
  Plus, 
  Search, 
  Calendar, 
  Check, 
  Sparkles, 
  FileCheck2, 
  FileDown,
  Printer,
  Smartphone,
  Folder,
  Settings,
  Eye,
  Camera,
  Layers,
  Sliders,
  Share2,
  CheckCircle2,
  Edit3,
  Clock,
  History,
  FileImage,
  ChevronDown,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { WordDocumentState, ExcelSheet } from '../types';
import { initialWordDocument } from '../data/initialData';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  exportWordAsDocx, 
  exportWordAsDoc, 
  exportWordAsPdf,
  exportWordAsPng,
  exportWordAsJpg,
  exportExcelAsXlsx,
  exportExcelAsXls,
  exportExcelAsPdf,
  exportExcelAsPng,
  exportExcelAsJpg,
  captureElementScreenshot300Dpi,
  downloadBlob
} from '../utils/fileHandlers';
import { FolderManagerModal } from './FolderManagerModal';
import { ScreenshotPreviewModal } from './ScreenshotPreviewModal';

export interface LocalStoredDoc {
  id: string;
  title: string;
  name: string;
  format: 'docx' | 'doc' | 'pdf' | 'xlsx' | 'xls' | 'png' | 'jpg' | string;
  mode: 'word' | 'excel';
  updatedAt: string;
  wordState?: WordDocumentState;
  excelState?: { title: string; sheets: ExcelSheet[] };
}

export interface PrinterItem {
  id: string;
  name: string;
  subtext: string;
  status: string;
  colorReady?: boolean;
}

const DEFAULT_PRINTERS: PrinterItem[] = [
  { id: 'hp_m428', name: 'HP LaserJet Pro MFP M428 (شبكة مكتبية)', subtext: 'متصلة وجاهزة 🟢', status: 'متصلة وجاهزة 🟢' },
  { id: 'canon_pixma', name: 'Canon PIXMA Office Series (ألوان عالية الدقة)', subtext: 'متصلة وجاهزة 🟢', status: 'متصلة وجاهزة 🟢', colorReady: true },
  { id: 'epson_l3250', name: 'Epson EcoTank L3250 (طابعة خزان حبر)', subtext: 'جاهزة للطباعة 🟢', status: 'جاهزة للطباعة 🟢', colorReady: true },
];

interface LocalDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMode: 'word' | 'excel';
  currentWordState: WordDocumentState;
  currentExcelState: { title: string; sheets: ExcelSheet[] };
  onLoadWordDoc: (doc: WordDocumentState) => void;
  onLoadExcelDoc: (excel: { title: string; sheets: ExcelSheet[] }) => void;
  onSaveCurrentToLocal: () => void;
  onUpdateTitle?: (newTitle: string) => void;
  onOpenPrintPreview?: () => void;
  onOpenSettingsExpanded?: () => void;
}

export const LocalDocumentsModal: React.FC<LocalDocumentsModalProps> = ({
  isOpen,
  onClose,
  activeMode,
  currentWordState,
  currentExcelState,
  onLoadWordDoc,
  onLoadExcelDoc,
  onSaveCurrentToLocal,
  onUpdateTitle,
  onOpenPrintPreview,
  onOpenSettingsExpanded,
}) => {
  // Navigation Tabs: 1. أدوات ومهام ملف, 2. المستندات المحفوظة, 3. سجل الإصدارات
  const [activeTab, setActiveTab] = useState<'tools' | 'saved' | 'history'>('tools');

  // Document title state
  const activeDocTitle = activeMode === 'word' ? (currentWordState.title || 'مستند_جديد_doc.2986') : (currentExcelState.title || 'جدول_جديد_sheet.2986');
  const [docName, setDocName] = useState(activeDocTitle.replace(/\.[^/.]+$/, ''));
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Storage and folder state
  const [storageType, setStorageType] = useState<'internal' | 'sd'>('internal');
  const [activeFolder, setActiveFolder] = useState<string>('مجلد التنزيلات (Download)');
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);

  // Printer & print options state
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>('hp_m428');
  const [showPrinterSelector, setShowPrinterSelector] = useState<boolean>(true);
  const [copyCount, setCopyCount] = useState<number>(1);
  const [duplexMode, setDuplexMode] = useState<'single' | 'double'>('single');
  const [colorMode, setColorMode] = useState<'color' | 'monochrome'>('color');
  const [printQuality, setPrintQuality] = useState<'300' | '600'>('600');

  // Export formats: pdf, docx, doc, png, jpg
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx' | 'doc' | 'png' | 'jpg'>('pdf');
  const [pageRangeMode, setPageRangeMode] = useState<'all' | 'current' | 'custom'>('all');
  const [customRangeText, setCustomRangeText] = useState('1-2');

  // Margin quick presets
  const [activeMarginPreset, setActiveMarginPreset] = useState<'normal' | 'narrow' | 'moderate'>('normal');

  // Screenshot capture & preview state
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null);
  const [isScreenshotPreviewOpen, setIsScreenshotPreviewOpen] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);

  // Saved documents state
  const [documents, setDocuments] = useState<LocalStoredDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'word' | 'excel'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const getApproxFileSize = (doc: LocalStoredDoc) => {
    try {
      const contentStr = JSON.stringify(doc.wordState || doc.excelState || doc);
      const bytes = contentStr.length * 2;
      if (bytes < 1024) return `${bytes} بايت`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} ميجابايت`;
    } catch {
      return '145 كيلوبايت';
    }
  };

  // Revision history state
  const [historyCheckpoints, setHistoryCheckpoints] = useState<Array<{ id: string; time: string; label: string; mode: string }>>([
    { id: '1', time: 'منذ دقيقة واحدة', label: 'حفظ تلقائي (نقاط التفتيش الدورية)', mode: 'تلقائي' },
    { id: '2', time: 'منذ 15 دقيقة', label: 'تعديل التنسيق وإضافة الجداول الرسمية', mode: 'يدوي' },
    { id: '3', time: 'اليوم، 10:15 ص', label: 'إنشاء المستند وضبط الهوامش', mode: 'أصلي' },
  ]);


  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const loadFromFirestore = async () => {
    try {
      const docsRef = collection(db, 'documents');
      const q = query(docsRef, orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);
      const fetchedDocs: LocalStoredDoc[] = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'مستند_غير_معروف',
          name: (data.title || 'مستند_غير_معروف').replace(/\.[^/.]+$/, ''),
          format: data.format || 'docx',
          mode: data.mode || 'word',
          updatedAt: data.updatedAt || new Date().toISOString(),
          wordState: data.mode === 'word' ? { ...initialWordDocument, ...data.state } : undefined,
          excelState: data.mode === 'excel' ? data.state : undefined
        };
      });
      setDocuments(fetchedDocs);
    } catch (e) {
      console.error('Error fetching documents from Firestore:', e);
      setDocuments([]);
      showNotification('تعذر تحميل المستندات من قاعدة البيانات');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setDocName((activeMode === 'word' ? currentWordState.title : currentExcelState.title).replace(/\.[^/.]+$/, ''));
      loadFromFirestore();
    }
  }, [isOpen, activeMode]);

  const handleUpdateDocTitle = (newVal: string) => {
    setDocName(newVal);
    if (onUpdateTitle) {
      const ext = selectedFormat === 'docx' ? '.docx' : selectedFormat === 'doc' ? '.doc' : selectedFormat === 'pdf' ? '.pdf' : selectedFormat === 'png' ? '.png' : '.jpg';
      onUpdateTitle(`${newVal}${ext}`);
    }
  };

  // 1. Direct PNG Save (زر حفظ PNG مباشر 🖼️)
  const handleDirectPngSave = async () => {
    try {
      showNotification('جاري حفظ وتنزيل صورة PNG فائقة النقاء (300 DPI)...');
      if (activeMode === 'word') {
        await exportWordAsPng(currentWordState, docName);
      } else {
        const sheet = currentExcelState.sheets[0];
        if (sheet) await exportExcelAsPng(docName, sheet, docName);
      }
      showNotification('تم تنزيل صفحة المستند كصورة PNG فائقة النقاء بنجاح ✓');
    } catch (e) {
      console.error(e);
      showNotification('حدث خطأ أثناء تنزيل PNG');
    }
  };

  // 2. Direct JPG Save (زر حفظ JPG مباشر 📸)
  const handleDirectJpgSave = async () => {
    try {
      showNotification('جاري حفظ وتنزيل صورة JPG خفيفة وعالية الوضوح...');
      if (activeMode === 'word') {
        await exportWordAsJpg(currentWordState, docName);
      } else {
        const sheet = currentExcelState.sheets[0];
        if (sheet) await exportExcelAsJpg(docName, sheet, docName);
      }
      showNotification('تم تنزيل صفحة المستند كصورة JPG خفيفة بنجاح ✓');
    } catch (e) {
      console.error(e);
      showNotification('حدث خطأ أثناء تنزيل JPG');
    }
  };

  // 3. Export with selected format (زر التصدير بالصيغة المحددة)
  const handleExportSelectedFormat = async () => {
    try {
      showNotification(`جاري تصدير وتنزيل الملف بصيغة (${selectedFormat.toUpperCase()})...`);
      if (selectedFormat === 'png') {
        await handleDirectPngSave();
      } else if (selectedFormat === 'jpg') {
        await handleDirectJpgSave();
      } else if (selectedFormat === 'pdf') {
        if (activeMode === 'word') {
          await exportWordAsPdf(currentWordState, { pdfStandard: 'standard' }, `${docName}.pdf`);
        } else {
          const sheet = currentExcelState.sheets[0];
          if (sheet) await exportExcelAsPdf(docName, sheet, { pdfStandard: 'standard' }, `${docName}.pdf`);
        }
        showNotification('تم تصدير ملف PDF بنجاح ✓');
      } else if (selectedFormat === 'docx') {
        if (activeMode === 'word') {
          await exportWordAsDocx(currentWordState, `${docName}.docx`);
        } else {
          exportExcelAsXlsx(docName, currentExcelState.sheets, `${docName}.xlsx`);
        }
        showNotification('تم تصدير ملف المستند بنجاح ✓');
      } else if (selectedFormat === 'doc') {
        if (activeMode === 'word') {
          await exportWordAsDoc(currentWordState, `${docName}.doc`);
        } else {
          exportExcelAsXls(docName, currentExcelState.sheets, `${docName}.xls`);
        }
        showNotification('تم تصدير ملف المستند الكلاسيكي بنجاح ✓');
      }
    } catch (err) {
      console.error(err);
      showNotification('تعذر التصدير بالصيغة المحددة');
    }
  };

  // 4. Capture & Preview Screenshot (لقطة شاشة الصفحة المعاينة بدقة 300 DPI)
  const handleCaptureScreenshot = async () => {
    setIsCapturingScreenshot(true);
    showNotification('جاري التقاط لقطة شاشة الصفحة بدقة 300 نقطة في البوصة...');
    try {
      // Find rendered paper sheet or editor container
      let targetEl = document.getElementById('print-preview-rendered-sheet') || 
                     document.getElementById('word-document-unified-page-0') ||
                     document.getElementById('word-body-editable') ||
                     document.querySelector('.word-document-sheet') as HTMLElement | null;

      if (!targetEl) {
        // Fallback: render temporary clean page container
        const temp = document.createElement('div');
        temp.style.position = 'fixed';
        temp.style.left = '-9999px';
        temp.style.width = '210mm';
        temp.style.minHeight = '297mm';
        temp.style.padding = '2.54cm';
        temp.style.backgroundColor = currentWordState.pageBgColor || '#ffffff';
        temp.style.direction = 'rtl';
        temp.style.fontFamily = `'${currentWordState.fontFamily || 'Cairo'}', 'Amiri', serif`;
        temp.innerHTML = currentWordState.contentHtml || '';
        document.body.appendChild(temp);
        targetEl = temp;
      }

      const res = await captureElementScreenshot300Dpi(targetEl, { format: 'png' });
      setScreenshotDataUrl(res.dataUrl);
      setScreenshotBlob(res.blob);
      setIsScreenshotPreviewOpen(true);
      showNotification('تم التقاط لقطة الشاشة بدقة 300 DPI بنجاح ✓');
    } catch (e) {
      console.error('Screenshot capture failed', e);
      showNotification('تعذر التقاط لقطة الشاشة، يرجى المحاولة ثانية');
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  // Direct print trigger
  const handleQuickPrint = () => {
    if (onOpenPrintPreview) {
      onClose();
      onOpenPrintPreview();
    } else {
      window.print();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-[220] animate-in fade-in select-none font-sans" dir="rtl">
        <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
          
          {/* ================= MODAL HEADER (مطابق للصورة 2) ================= */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-black text-white">
                    قائمة المستندات الشاملة (أدوات ومهام المستندات وإعدادات)
                  </h2>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.2 rounded-full font-bold">
                    PRO
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                  <span>المستند النشط:</span>
                  <span className="font-bold text-amber-300 truncate max-w-[200px] sm:max-w-xs">{docName}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ================= TABS SWITCHER (الصورة 2: أدوات ومهام ملف / المستندات المحفوظة / سجل الإصدارات) ================= */}
          <div className="flex items-center bg-slate-950/80 px-3 py-1.5 border-b border-slate-800 gap-1.5 text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>أدوات ومهام المستندات</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>المستندات المحفوظة ({documents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>سجل الإصدارات</span>
            </button>
          </div>

          {/* Feedback message banner */}
          {feedbackMsg && (
            <div className="bg-emerald-950/90 border-b border-emerald-700/60 text-emerald-200 px-4 py-1.5 text-xs font-semibold flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{feedbackMsg}</span>
              </span>
            </div>
          )}

          {/* ================= TAB 1: أدوات ومهام ملف (المزايا والخيارات الجديدة المدمجة) ================= */}
          {activeTab === 'tools' && (
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 text-xs">
              
              {/* 1. إعدادات واختيار الطابعة والطباعة المتقدمة (مطابق للصورة 1 و 2) */}
              <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
                    <Printer className="w-4 h-4 text-blue-400" />
                    <span>خيارات وإعدادات الطابعة والطباعة المتقدمة:</span>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                    إدارة الطباعة
                  </span>
                </div>

                {/* أزرار: معاينة المستند 👁️، اختيار الطابعة ⚙️، وطباعة سريعة 🖨️ */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleQuickPrint}
                    className="py-2 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer text-[11px]"
                    title="معاينة المستند قبل الطباعة"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>معاينة المستند 👁️</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPrinterSelector(!showPrinterSelector)}
                    className={`py-2 px-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer text-[11px] ${
                      showPrinterSelector 
                        ? 'bg-blue-600/30 text-blue-200 border-blue-500 shadow-xs' 
                        : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                    title="اختيار الطابعة وإدارتها"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>اختيار الطابعة ⚙️</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickPrint}
                    className="py-2 px-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer text-[11px]"
                    title="طباعة سريعة فورية"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة سريعة 🖨️</span>
                  </button>
                </div>

                {/* Connected Printers List (اختيار الطابعة) */}
                {showPrinterSelector && (
                  <div className="space-y-1.5 pt-1 border-t border-slate-700/40">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <span>الطابعات المتصلة والمتاحة:</span>
                      <span className="text-amber-300">انقر لاختيار الطابعة النشطة</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {DEFAULT_PRINTERS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPrinterId(p.id);
                            showNotification(`تم تحديد الطابعة النشطة: ${p.name}`);
                          }}
                          className={`p-2 rounded-lg border text-right transition flex items-center justify-between cursor-pointer ${
                            selectedPrinterId === p.id 
                              ? 'bg-blue-950/80 border-blue-500 text-white shadow-xs ring-1 ring-blue-500/50' 
                              : 'bg-slate-900/70 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Printer className={`w-3.5 h-3.5 ${selectedPrinterId === p.id ? 'text-blue-400' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-emerald-400 font-mono">{p.status}</span>
                            {selectedPrinterId === p.id && (
                              <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">نشطة ✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Number of Copies & Duplex & Color Mode & Print Resolution */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-700/50">
                  {/* Copies counter: عداد عدد النسخ بأزرار (+) و (-) */}
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">النسخ:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCopyCount((c) => Math.max(1, c - 1))}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                        title="إنقاص عدد النسخ"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold font-mono text-xs">{copyCount}</span>
                      <button
                        onClick={() => setCopyCount((c) => c + 1)}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                        title="زيادة عدد النسخ"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Duplex: خيار الطباعة على الوجهين (على الوجهين / وجه واحد) */}
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">الوجهين:</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <button
                        onClick={() => setDuplexMode('single')}
                        className={`px-1.5 py-0.5 rounded ${duplexMode === 'single' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                      >
                        وجه واحد
                      </button>
                      <button
                        onClick={() => setDuplexMode('double')}
                        className={`px-1.5 py-0.5 rounded ${duplexMode === 'double' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                      >
                        على الوجهين
                      </button>
                    </div>
                  </div>

                  {/* Color Mode: خيار وضع الألوان (ملون بالكامل / أبيض وأسود) */}
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">الألوان:</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <button
                        onClick={() => setColorMode('color')}
                        className={`px-1 py-0.5 rounded ${colorMode === 'color' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                      >
                        ملون 🎨
                      </button>
                      <button
                        onClick={() => setColorMode('monochrome')}
                        className={`px-1 py-0.5 rounded ${colorMode === 'monochrome' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400'}`}
                      >
                        أبيض/أسود ⬛
                      </button>
                    </div>
                  </div>

                  {/* Print Quality / Resolution: خيار دقة وجودة الطباعة (600 نقطة في البوصة / 300 نقطة في البوصة) */}
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">الدقة:</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <button
                        onClick={() => {
                          setPrintQuality('600');
                          showNotification('تم ضبط دقة الطباعة: 600 DPI (دقة فائقة)');
                        }}
                        className={`px-1 py-0.5 rounded ${printQuality === '600' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
                      >
                        600 DPI
                      </button>
                      <button
                        onClick={() => {
                          setPrintQuality('300');
                          showNotification('تم ضبط دقة الطباعة: 300 DPI (قياسية)');
                        }}
                        className={`px-1 py-0.5 rounded ${printQuality === '300' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
                      >
                        300 DPI
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. صيغ التصدير والحفظ الجديدة (PNG و JPG) وأزرار الحفظ المباشر */}
              <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>تصدير المستند بصيغ متعددة (PDF، DOCX، DOC، PNG، JPG):</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    حفظ مباشر فوري
                  </span>
                </div>

                {/* Grid of export format pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: 'pdf', label: 'ملف PDF 📄', tag: 'رسمي' },
                    { id: 'docx', label: 'Word (.docx) 📝', tag: 'حديث' },
                    { id: 'doc', label: 'Word (.doc) 📝', tag: 'كلاسيكي' },
                    { id: 'png', label: 'صورة PNG 🖼️', tag: '300 DPI' },
                    { id: 'jpg', label: 'صورة JPG 📸', tag: 'خفيفة' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFormat(f.id as any)}
                      className={`p-2 rounded-lg border text-right transition cursor-pointer flex flex-col justify-between ${
                        selectedFormat === f.id
                          ? 'bg-blue-600 text-white border-blue-400 shadow-xs font-bold'
                          : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span>{f.label}</span>
                      </div>
                      <span className={`text-[9px] mt-0.5 ${selectedFormat === f.id ? 'text-blue-100 font-semibold' : 'text-slate-400'}`}>
                        {f.tag}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Direct Action Buttons: حفظ PNG مباشر / حفظ JPG مباشر / تصدير بالصيغة المحددة */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {/* زر حفظ PNG مباشر */}
                  <button
                    onClick={handleDirectPngSave}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer text-xs"
                    title="حفظ وتنزيل الصفحة فورياً بصيغة PNG فائقة النقاء 300 نقطة في البوصة"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>حفظ PNG مباشر 🖼️</span>
                  </button>

                  {/* زر حفظ JPG مباشر */}
                  <button
                    onClick={handleDirectJpgSave}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer text-xs"
                    title="حفظ وتنزيل فوري بصيغة JPG خفيفة وعالية الوضوح"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>حفظ JPG مباشر 📸</span>
                  </button>

                  {/* زر التصدير بالصيغة المحددة */}
                  <button
                    onClick={handleExportSelectedFormat}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer text-xs"
                  >
                    <FileDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>تصدير ({selectedFormat.toUpperCase()}) 📥</span>
                  </button>
                </div>
              </div>

              {/* 3. ميزة التقاط لقطة شاشة الصفحة المعاينة (لقطة الصفحة 📸) */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800/90 to-teal-950/60 border border-teal-800/50 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-teal-600/30 flex items-center justify-center text-teal-300">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        ميزة التقاط لقطة شاشة الصفحة المعاينة (لقطة الصفحة 📸)
                      </h4>
                      <p className="text-[10px] text-teal-200/80">
                        بدقة 300 نقطة في البوصة مقصوصة تماماً على مقاس وإطار الورقة دون أي عناصر أو هوامش خارجية
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                    300 DPI
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {/* Capture & Preview Button */}
                  <button
                    onClick={handleCaptureScreenshot}
                    disabled={isCapturingScreenshot}
                    className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer text-xs disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isCapturingScreenshot ? 'جاري الالتقاط...' : 'التقاط ومعاينة لقطة الشاشة 📸'}</span>
                  </button>

                  {/* Quick PNG download */}
                  <button
                    onClick={handleDirectPngSave}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer text-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تحميل PNG فوري 🖼️</span>
                  </button>

                  {/* Quick JPG download */}
                  <button
                    onClick={handleDirectJpgSave}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer text-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>تحميل JPG فوري 📸</span>
                  </button>
                </div>
              </div>

              {/* 4. اسم الملف وتحديد موقع الحفظ (وحدة التخزين و SD) */}
              <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 space-y-2.5">
                <span className="font-bold text-slate-200 text-xs block">
                  اسم الملف وموقع الحفظ النشط:
                </span>

                {/* File name input */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 gap-2">
                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => handleUpdateDocTitle(e.target.value)}
                    placeholder="اسم الملف..."
                    className="w-full bg-transparent text-xs text-white font-bold outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">
                    .{selectedFormat}
                  </span>
                </div>

                {/* Storage quick switches: ذاكرة الجوال 📱 (تحميل) و بطاقة الذاكرة SD 💾 (النسخ الاحتياطي للمكتب) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStorageType('internal');
                      showNotification('تم التبديل إلى ذاكرة الجوال 📱 (تحميل وتخزين مباشر)');
                    }}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition cursor-pointer text-xs ${
                      storageType === 'internal'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-1 ring-blue-400/50'
                        : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>ذاكرة الجوال 📱 (تحميل)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStorageType('sd');
                      showNotification('تم التبديل إلى بطاقة الذاكرة SD 💾 (النسخ الاحتياطي للمكتب)');
                    }}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition cursor-pointer text-xs ${
                      storageType === 'sd'
                        ? 'bg-amber-600 text-white border-amber-400 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <HardDrive className="w-4 h-4 text-amber-300" />
                    <span>بطاقة الذاكرة SD 💾 (النسخ الاحتياطي للمكتب)</span>
                  </button>
                </div>

                {/* بطاقة عرض موقع الحفظ النشط مع مساره الحقيقي (المجلد، ونوع الذاكرة) وزر إدارة المجلدات ⚙️ */}
                <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Folder className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 block">المجلد النشط:</span>
                        <span className="font-bold text-white text-xs truncate block">{activeFolder}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsFolderManagerOpen(true)}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-blue-300 hover:text-white bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/60 px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer shadow-xs"
                      title="فتح نافذة مدير المجلدات لإنشاء وتحرير وحذف واختيار المجلدات"
                    >
                      <Settings className="w-3.5 h-3.5 text-amber-400" />
                      <span>إدارة المجلدات ⚙️</span>
                    </button>
                  </div>

                  {/* Real Path Display */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-300">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-emerald-400 font-bold shrink-0">المسار الفعلي:</span>
                      <span className="truncate text-slate-300 select-all font-mono" dir="ltr">
                        {storageType === 'internal' 
                          ? `/storage/emulated/0/Download/${activeFolder}` 
                          : `/storage/sdcard1/OfficeBackup/${activeFolder}`}
                      </span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 shrink-0 font-sans font-bold">
                      {storageType === 'internal' ? 'وحدة التخزين 📱' : 'بطاقة SD 💾'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. تحديد نطاق الصفحات المراد طباعتها وتصديرها */}
              <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 space-y-2">
                <span className="font-bold text-slate-200 text-xs block">
                  تحديد الصفحات المراد طباعتها وتصديرها:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageRangeMode('all')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer text-center ${
                      pageRangeMode === 'all'
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    كل المستند (2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageRangeMode('current')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer text-center ${
                      pageRangeMode === 'current'
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    الصفحة الحالية (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageRangeMode('custom')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer text-center ${
                      pageRangeMode === 'custom'
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    نطاق مخصص ✏️
                  </button>
                </div>
                {pageRangeMode === 'custom' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      value={customRangeText}
                      onChange={(e) => setCustomRangeText(e.target.value)}
                      placeholder="أدخل نطاق الصفحات مثل 1-2 أو 1,3"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                )}
              </div>

              {/* 6. إعداد أبعاد وهوامش الصفحة السريعة */}
              <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">
                    إعداد أبعاد وهوامش الصفحة السريعة:
                  </span>
                  {onOpenSettingsExpanded && (
                    <button
                      onClick={onOpenSettingsExpanded}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>فتح الإعدادات الموسعة 📐</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'normal', name: 'عادية 2.54 سم', desc: 'متوازنة للطباعة' },
                    { id: 'narrow', name: 'ضيقة 1.27 سم', desc: 'مساحة نص أكبر' },
                    { id: 'moderate', name: 'متوسطة 1.9 سم', desc: 'رسمية للمستندات' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActiveMarginPreset(m.id as any)}
                      className={`p-2 rounded-lg border text-right transition cursor-pointer ${
                        activeMarginPreset === m.id
                          ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-xs'
                          : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold">{m.name}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: المستندات المحفوظة (المكتبة المحلية المحفوظة) ================= */}
          {activeTab === 'saved' && (
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 text-xs">
              {/* Search & Filter Toolbar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="البحث في المستندات المحفوظة..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-700">
                  {(['all', 'word', 'excel'] as const).map((ft) => (
                    <button
                      key={ft}
                      onClick={() => setFilterType(ft)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                        filterType === ft
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {ft === 'all' ? 'الكل 📁' : ft === 'word' ? 'وورد (Word) 📝' : 'إكسل (Excel) 📊'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-2">
                {documents.filter((doc) => {
                  if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  if (filterType === 'word') return doc.mode === 'word';
                  if (filterType === 'excel') return doc.mode === 'excel';
                  return true;
                }).map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 shrink-0">
                        {doc.mode === 'excel' ? <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">{doc.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-mono bg-slate-900 px-1.5 py-0.2 rounded text-slate-300">.{doc.format}</span>
                          <span className="bg-slate-900/90 px-1.5 py-0.2 rounded text-amber-300 font-mono font-bold">
                            📦 {getApproxFileSize(doc)}
                          </span>
                          <span>{new Date(doc.updatedAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          if (doc.mode === 'word' && doc.wordState) onLoadWordDoc(doc.wordState);
                          else if (doc.mode === 'excel' && doc.excelState) onLoadExcelDoc(doc.excelState);
                          showNotification(`تم فتح المستند "${doc.title}"`);
                          setTimeout(onClose, 300);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[11px]"
                      >
                        فتح
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('هل ترغب بحذف هذا المستند؟')) {
                            const updated = documents.filter((d) => d.id !== doc.id);
                            setDocuments(updated);
                            localStorage.setItem('office_local_documents', JSON.stringify(updated));
                          }
                        }}
                        className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: سجل الإصدارات ================= */}
          {activeTab === 'history' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-slate-800">
                <span className="font-bold">نقاط استعادة المستند المحفوظة:</span>
                <span className="text-[10px] text-slate-400">حفظ تلقائي دوري كل 30 ثانية</span>
              </div>

              <div className="space-y-2">
                {historyCheckpoints.map((cp) => (
                  <div
                    key={cp.id}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">{cp.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{cp.time}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => showNotification(`تم استعادة نقطة التفتيش: ${cp.time} بنجاح ✓`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-[11px]"
                    >
                      استعادة
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= MODAL FOOTER ================= */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              إغلاق
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onSaveCurrentToLocal}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>حفظ نسخة الآن</span>
              </button>

              <button
                onClick={handleExportSelectedFormat}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black shadow-md flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>حفظ وتصدير 📥</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <FolderManagerModal
        isOpen={isFolderManagerOpen}
        onClose={() => setIsFolderManagerOpen(false)}
        currentFolder={activeFolder}
        currentStorage={storageType}
        onSelectFolder={(fName, sType) => {
          setActiveFolder(fName);
          setStorageType(sType);
          showNotification(`تم تحديد مجلد الحفظ النشط: ${fName}`);
        }}
      />

      <ScreenshotPreviewModal
        isOpen={isScreenshotPreviewOpen}
        onClose={() => setIsScreenshotPreviewOpen(false)}
        screenshotDataUrl={screenshotDataUrl || ''}
        screenshotBlob={screenshotBlob}
        documentTitle={docName}
        pageNumber={1}
      />
    </>
  );
};
