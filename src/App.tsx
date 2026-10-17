import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle2, HardDrive, Cloud, X, Sparkles } from 'lucide-react';
import { Keyboard } from '@capacitor/keyboard';
import { 
  AppMode, 
  WordDocumentState, 
  ExcelState, 
  VirtualKeyboardState, 
  CellData, 
  WordRibbonTab, 
  ExcelRibbonTab,
  SheetImage
} from './types';
import { initialWordDocument, initialExcelData } from './data/initialData';
import { TopHeader } from './components/TopHeader';
import { ArabVirtualKeyboard } from './components/ArabVirtualKeyboard';
import { StatusBar } from './components/StatusBar';
import { WordRibbon } from './components/WordEditor/WordRibbon';
import { WordEditor, WordEditorAction } from './components/WordEditor/WordEditor';
import { ExcelRibbon } from './components/ExcelEditor/ExcelRibbon';
import { ExcelGrid } from './components/ExcelEditor/ExcelGrid';
import { DocumentSimulatorModal } from './components/DocumentSimulatorModal';
import { ExcelSimulatorModal } from './components/ExcelEditor/ExcelSimulatorModal';
import { SaveAsModal } from './components/SaveAsModal';
import { PdfExportModal } from './components/PdfExportModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { ImageInsertModal } from './components/WordEditor/ImageInsertModal';
import { DocumentTemplatesModal } from './components/WordEditor/DocumentTemplatesModal';
import { LocalDocumentsModal } from './components/LocalDocumentsModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { AppPermissionsModal } from './components/AppPermissionsModal';
import { ShareDocumentModal } from './components/ShareDocumentModal';
import { CsvExportModal } from './components/CsvExportModal';
import { DocumentStatsModal } from './components/WordEditor/DocumentStatsModal';
import { WordFocusModeModal } from './components/WordEditor/WordFocusModeModal';
import { NewDocumentModal } from './components/WordEditor/NewDocumentModal';
import { VoiceTypingModal } from './components/WordEditor/VoiceTypingModal';
import { saveDocumentToFirestore } from './firebase';
import { ensureDefaultDownloadFolder } from './services/nativeExportService';
import { fileSystemService } from './services/FileSystemService';
import { 
  exportToWordDoc, 
  exportToHTML, 
  exportToText, 
  exportToMarkdown,
  exportToExcelXLSX, 
  exportToExcelXLS,
  exportToCSV, 
  exportWordAsDocx,
  exportWordAsDoc,
  exportWordAsPdf,
  exportExcelAsPdf,
  exportExcelAsXlsx,
  exportExcelAsXls,
  handlePrintDocument,
  printWordDocument,
  printExcelDocument,
  parseDocxFile,
  extractTextFromPdfRaw
} from './utils/fileHandlers';
import { 
  calculateUnifiedPaperDimensionsAndScale, 
  calculateUnifiedDocumentPages, 
  formatPaperDimensionsLabel 
} from './utils/paperDimensions';
import { PdfExportOptions } from './types';
import { 
  colIndexToLetter, 
  parseCellAddress 
} from './utils/excelCalculations';

export default function App() {
  // App Mode: 'word' or 'excel'
  const [mode, setMode] = useState<AppMode>('word');
  const [isReadMode, setIsReadMode] = useState<boolean>(false);

  const [isNewDocumentModalOpen, setIsNewDocumentModalOpen] = useState(false);
  const [isVoiceTypingModalOpen, setIsVoiceTypingModalOpen] = useState(false);

  const handleNewDocument = () => {
    setIsNewDocumentModalOpen(true);
  };

  const handleInsertVoiceText = (text: string) => {
    handleExecCommand('insertHTML', `<p>${text}</p>`);
    setLastSavedText('تم إدراج النص الصوتي بنجاح 🎙️✓');
    setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2000);
  };

  const handleCreateWordDocFromModal = (config: {
    title: string;
    paperSize: any;
    orientation: any;
    fontFamily: string;
    fontSize: number;
    margins: any;
    pageBgColor: string;
    contentHtml: string;
    headerText?: string;
    footerText?: string;
  }) => {
    let defaults = {};
    try {
      const savedDefaults = localStorage.getItem('office_default_document_settings');
      if (savedDefaults) defaults = JSON.parse(savedDefaults);
    } catch (e) {}

    setWordState({
      ...initialWordDocument,
      ...defaults,
      title: config.title,
      paperSize: config.paperSize,
      orientation: config.orientation,
      fontFamily: config.fontFamily,
      fontSize: config.fontSize,
      margins: config.margins,
      pageBgColor: config.pageBgColor,
      contentHtml: config.contentHtml,
      headerText: config.headerText || 'رأس المستند',
      footerText: config.footerText || 'تذييل المستند',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      textAlign: 'right',
      textColor: '#0f172a',
      lineSpacing: 1.6,
      wordSpacing: 0,
    });
    setMode('word');
    setLastSavedText(`تم إنشاء المستند (${config.title}) بنجاح ✨`);
    setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2000);
  };

  const handleCreateExcelDocFromModal = (title: string, templateType?: string) => {
    setExcelState({
      ...initialExcelData,
      title,
    });
    setMode('excel');
    setLastSavedText(`تم إنشاء مصنف إكسيل (${title}) بنجاح 📊`);
    setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2000);
  };

  const handleOpenDocument = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx,.doc,.pdf,.txt,.html,.xlsx,.xls,.csv';
    input.onchange = (e) => {
      if ((e.target as HTMLInputElement).files?.[0]) {
        handleImportFile(e as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    };
    input.click();
  };

  const handleClearDocument = () => {
    if (confirm('هل أنت متأكد من رغبتك في حذف أو إعادة تعيين محتوى المستند الحالي؟')) {
      if (mode === 'word') {
        setWordState((prev) => ({
          ...prev,
          contentHtml: '<p></p>',
          headerText: '',
          footerText: ''
        }));
      } else {
        setExcelState((prev) => ({
          ...prev,
          sheets: prev.sheets.map(sh => ({ ...sh, cells: {} }))
        }));
      }
    }
  };

  const handleToggleFloatingWindow = () => {
    window.open(window.location.href, '_blank', 'width=950,height=750,top=50,left=50,resizable=yes,scrollbars=yes');
  };

  // Word Document State
  const [wordState, setWordState] = useState<WordDocumentState>(() => {
    let defaults = {};
    try {
      const savedDefaults = localStorage.getItem('office_default_document_settings');
      if (savedDefaults) defaults = JSON.parse(savedDefaults);
    } catch (e) {}

    const saved = localStorage.getItem('office_word_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title === '0 - Mazen.doc' || !parsed.contentHtml || parsed.contentHtml.includes('محكمة القفر')) {
          return { ...initialWordDocument, ...defaults };
        }
        return { ...initialWordDocument, ...defaults, ...parsed };
      } catch (e) {
        // Fallback
      }
    }
    return { ...initialWordDocument, ...defaults };
  });

  // Word Ribbon Active Tab & Central Dropdown Menu State
  const [wordActiveTab, setWordActiveTab] = useState<WordRibbonTab>('home');
  const [centralActiveHomeMenu, setCentralActiveHomeMenu] = useState<{ id: any; rect: DOMRect } | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // Excel State
  const [excelState, setExcelState] = useState<ExcelState>(() => {
    const saved = localStorage.getItem('office_excel_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return initialExcelData;
  });

  // Excel Ribbon Active Tab
  const [excelActiveTab, setExcelActiveTab] = useState<ExcelRibbonTab>('home');

  // Excel Selected Cell, Range & Formula state
  const [selectedCell, setSelectedCell] = useState<string>('B2');
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);
  const [formulaInput, setFormulaInput] = useState<string>('');
  const [isCellEditing, setIsCellEditing] = useState<boolean>(false);
  const [inlineCellValue, setInlineCellValue] = useState<string>('');

  // Virtual Keyboard State & Word Document Active Target (Body / Header / Footer)
  const [wordActiveTarget, setWordActiveTarget] = useState<'body' | 'header' | 'footer'>('body');
  const [wordLastAction, setWordLastAction] = useState<WordEditorAction | null>(null);
  const [keyboardState, setKeyboardState] = useState<VirtualKeyboardState>({
    isOpen: true, // Open by default as per screenshots
    language: 'ar',
    shiftActive: false,
    altActive: true, // Highlighted alt as in screenshots
    ctrlActive: false,
    isFloating: false,
    pinned: false,
    capsActive: false,
    numberFormat: 'arabic',
    wordTarget: 'body'
  });

  const getActiveWordTargetElement = (): { element: HTMLElement | null; type: 'body' | 'header' | 'footer' } => {
    const activeEl = document.activeElement as HTMLElement | null;
    if (activeEl?.id === 'word-header-editable' || activeEl?.closest('[data-word-target="header"]')) {
      return { element: document.getElementById('word-header-editable'), type: 'header' };
    }
    if (activeEl?.id === 'word-footer-editable' || activeEl?.closest('[data-word-target="footer"]')) {
      return { element: document.getElementById('word-footer-editable'), type: 'footer' };
    }
    if (activeEl?.id === 'word-body-editable' || activeEl?.closest('[data-word-target="body"]')) {
      return { element: document.getElementById('word-body-editable') || wordEditorRef.current, type: 'body' };
    }

    if (wordActiveTarget === 'header') {
      return { element: document.getElementById('word-header-editable'), type: 'header' };
    }
    if (wordActiveTarget === 'footer') {
      return { element: document.getElementById('word-footer-editable'), type: 'footer' };
    }
    return { element: document.getElementById('word-body-editable') || wordEditorRef.current, type: 'body' };
  };

  const handleSelectWordTarget = (target: 'body' | 'header' | 'footer') => {
    setWordActiveTarget(target);
    setKeyboardState((prev) => ({ ...prev, wordTarget: target }));
    let el: HTMLElement | null = null;
    if (target === 'header') {
      el = document.getElementById('word-header-editable');
    } else if (target === 'footer') {
      el = document.getElementById('word-footer-editable');
    } else {
      el = document.getElementById('word-body-editable') || wordEditorRef.current;
    }
    if (el) {
      el.focus();
      try {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch (err) {
        console.error(err);
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Auto-saved message timer & state
  const [lastSavedText, setLastSavedText] = useState<string>('محفوظ تلقائياً (Room)');
  const [canUndo, setCanUndo] = useState(true);
  const [canRedo, setCanRedo] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isExcelSimulatorOpen, setIsExcelSimulatorOpen] = useState(false);
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocalDocsModalOpen, setIsLocalDocsModalOpen] = useState(false);
  const [isPdfPreviewReaderOpen, setIsPdfPreviewReaderOpen] = useState(false);
  const [isAppPermissionsOpen, setIsAppPermissionsOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'local'>('local');
  const [toastInfo, setToastInfo] = useState<{
    show: boolean;
    message: string;
    location: 'local' | 'cloud' | 'both';
  }>({ show: false, message: '', location: 'both' });

  const showToast = useCallback((message: string, location: 'local' | 'cloud' | 'both' = 'both') => {
    setToastInfo({ show: true, message, location });
    setTimeout(() => {
      setToastInfo((prev) => ({ ...prev, show: false }));
    }, 4000);
  }, []);

  // Ensure default Android download folder ('/storage/emulated/0/Download documents Word excel/') exists on startup
  useEffect(() => {
    const initStorage = async () => {
      try {
        await fileSystemService.initAppDirectories();
        await ensureDefaultDownloadFolder();
      } catch (err) {
        console.warn('Startup storage initialization notice:', err);
      }
    };
    initStorage();
  }, []);

  // Auto-Backup Timer (Every 60 minutes automatically creates cloud backup)
  useEffect(() => {
    const autoBackupInterval = setInterval(async () => {
      try {
        const docId = wordState.title.replace(/\s+/g, '_') || 'auto_backup_doc';
        const success = await saveDocumentToFirestore(docId, wordState.title, wordState.contentHtml);
        if (success) {
          showToast('تم إنشاء نسخة احتياطية سحابية تلقائية (Auto-Backup) بنجاح', 'cloud');
        }
      } catch (e) {
        console.warn('Auto-backup interval error:', e);
      }
    }, 60 * 60 * 1000); // 1 Hour
    return () => clearInterval(autoBackupInterval);
  }, [wordState.title, wordState.contentHtml, showToast]);

  const handleSyncNow = async () => {
    setSyncStatus('syncing');
    const docId = wordState.title.replace(/\s+/g, '_') || 'current_document';
    const success = await saveDocumentToFirestore(docId, wordState.title, wordState.contentHtml);
    setSyncStatus(success ? 'synced' : 'offline');
    if (success) {
      showToast('تمت المزامنة السحابية بنجاح', 'cloud');
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      setSyncStatus('syncing');
      const docId = wordState.title.replace(/\s+/g, '_') || 'current_document';
      const success = await saveDocumentToFirestore(docId, wordState.title, wordState.contentHtml);
      setSyncStatus(success ? 'synced' : 'offline');
    }, 30000);
    return () => clearInterval(interval);
  }, [wordState.title, wordState.contentHtml]);

  const handleOpenPrintPreview = () => {
    setIsPrintPreviewOpen(true);
  };

  // PDF Export Handler with Page Settings (Margins, Orientation, Paper Size)
  const handleExportPdf = async (options?: PdfExportOptions, customFilename?: string) => {
    if (mode === 'word') {
      await exportWordAsPdf(wordState, options || { pdfStandard: 'standard' }, customFilename || wordState.title || 'مستند.pdf');
    } else {
      await exportExcelAsPdf(excelState.title, currentSheet, options, customFilename);
    }
  };

  const handleExportPdfWithOptions = async (options: PdfExportOptions, customFilename: string) => {
    if (mode === 'word') {
      await exportWordAsPdf(wordState, options, customFilename);
    } else {
      await exportExcelAsPdf(excelState.title, currentSheet, options, customFilename);
    }
  };

  // Reference to Word ContentEditable Div
  const wordEditorRef = useRef<HTMLDivElement | null>(null);

  // Active Excel Sheet
  const currentSheet = excelState.sheets.find((s) => s.id === excelState.activeSheetId) || excelState.sheets[0];

  // Sync formula input when selected cell changes
  useEffect(() => {
    const cell = currentSheet?.data[selectedCell];
    if (cell) {
      setFormulaInput(cell.formula || cell.value || '');
      setInlineCellValue(cell.formula || cell.value || '');
    } else {
      setFormulaInput('');
      setInlineCellValue('');
    }
    setIsCellEditing(false);
  }, [selectedCell, currentSheet]);

  // Persist Word state to localStorage
  useEffect(() => {
    localStorage.setItem('office_word_state', JSON.stringify(wordState));
    setLastSavedText('محفوظ الآن ✓');
    const timer = setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 3000);
    return () => clearTimeout(timer);
  }, [wordState]);

  // Persist Excel state to localStorage
  useEffect(() => {
    localStorage.setItem('office_excel_state', JSON.stringify(excelState));
    setLastSavedText('محفوظ الآن ✓');
    const timer = setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 3000);
    return () => clearTimeout(timer);
  }, [excelState]);

  // Auto-hide native mobile software keyboard when the app virtual keyboard is active/chosen
  useEffect(() => {
    const isVirtualActive = keyboardState.isOpen && keyboardState.preferredInputMode !== 'native';

    const hideNativeKeyboard = async () => {
      try {
        if (typeof (window as any).Capacitor !== 'undefined') {
          await Keyboard.hide();
        }
      } catch {
        // Browser environment fallback
      }
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
        active.setAttribute('inputmode', 'none');
      }
    };

    if (isVirtualActive) {
      hideNativeKeyboard();

      const setInputModeNone = () => {
        const editableElements = document.querySelectorAll<HTMLElement>(
          'input, textarea, [contenteditable="true"]'
        );
        editableElements.forEach((el) => {
          el.setAttribute('inputmode', 'none');
        });
      };

      setInputModeNone();

      const handleFocusIn = (e: FocusEvent) => {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          target.setAttribute('inputmode', 'none');
          hideNativeKeyboard();
        }
      };

      const handleTouchStart = (e: TouchEvent) => {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          target.setAttribute('inputmode', 'none');
          hideNativeKeyboard();
        }
      };

      document.addEventListener('focusin', handleFocusIn, true);
      document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });

      return () => {
        document.removeEventListener('focusin', handleFocusIn, true);
        document.removeEventListener('touchstart', handleTouchStart, true);
      };
    } else {
      // Restore native keyboard capabilities
      const editableElements = document.querySelectorAll<HTMLElement>(
        'input, textarea, [contenteditable="true"]'
      );
      editableElements.forEach((el) => {
        el.removeAttribute('inputmode');
      });
      if (keyboardState.isOpen && keyboardState.preferredInputMode === 'native') {
        try {
          if (typeof (window as any).Capacitor !== 'undefined') {
            Keyboard.show();
          }
        } catch {
          // ignore
        }
      }
    }
  }, [keyboardState.isOpen, keyboardState.preferredInputMode]);

  // Continuous Debounced Auto-Save to Room / LocalStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('office_word_state', JSON.stringify(wordState));
        localStorage.setItem('office_excel_state', JSON.stringify(excelState));
      } catch (e) {
        console.warn('Auto-save to localStorage failed', e);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [wordState, excelState]);

  // Execute formatting command in Word contentEditable or Header/Footer
  const handleExecCommand = useCallback((command: string, value: string = '') => {
    console.log('[DEBUG] handleExecCommand triggered:', {
      command,
      value,
      activeElement: document.activeElement,
      activeElementTag: document.activeElement?.tagName,
      activeElementId: document.activeElement?.id,
      isContentEditable: (document.activeElement as HTMLElement | null)?.isContentEditable
    });
    const activeEl = document.activeElement as HTMLElement | null;
    let targetEditable: HTMLElement | null = null;

    if (activeEl?.id === 'word-header-editable' || activeEl?.closest('[data-word-target="header"]')) {
      targetEditable = document.getElementById('word-header-editable');
    } else if (activeEl?.id === 'word-footer-editable' || activeEl?.closest('[data-word-target="footer"]')) {
      targetEditable = document.getElementById('word-footer-editable');
    } else if (activeEl?.isContentEditable || activeEl?.getAttribute('contenteditable') === 'true' || activeEl?.closest('[contenteditable="true"]')) {
      targetEditable = (activeEl.closest('[contenteditable="true"]') as HTMLElement) || activeEl;
    }

    if (!targetEditable) {
      targetEditable = (document.getElementById('word-body-editable') as HTMLElement | null) || wordEditorRef.current;
    }

    if (targetEditable) {
      targetEditable.focus();
    }

    try {
      document.execCommand('styleWithCSS', false, 'true');
      const success = document.execCommand(command, false, value);
      console.log('[DEBUG] execCommand result:', command, success);
    } catch (err) {
      console.warn('execCommand failed:', err);
    }

    const headerEl = document.querySelector('[data-header-area="true"] [contenteditable="true"]') as HTMLElement | null;
    const footerEl = document.querySelector('[data-footer-area="true"] [contenteditable="true"]') as HTMLElement | null;
    const bodyEl = document.getElementById('word-body-editable') as HTMLElement | null;

    setWordState((prev) => ({
      ...prev,
      contentHtml: bodyEl ? bodyEl.innerHTML : prev.contentHtml,
      headerText: headerEl ? headerEl.innerText : prev.headerText,
      footerText: footerEl ? footerEl.innerText : prev.footerText,
      ...(command === 'bold' ? { isBold: document.queryCommandState('bold') } : {}),
      ...(command === 'italic' ? { isItalic: document.queryCommandState('italic') } : {}),
      ...(command === 'underline' ? { isUnderline: document.queryCommandState('underline') } : {}),
    }));
  }, []);

  // Quick Save (حفظ يدوي فوري مع إشعار نجاح وحفظ الإعدادات الافتراضية)
  const handleQuickSave = useCallback(async () => {
    try {
      localStorage.setItem('office_word_state', JSON.stringify(wordState));
      localStorage.setItem('office_excel_state', JSON.stringify(excelState));

      // Save default document settings for last saved document
      if (mode === 'word') {
        const defaultSettings = {
          orientation: wordState.orientation,
          paperSize: wordState.paperSize,
          margins: wordState.margins,
          customMargins: wordState.customMargins,
          fontFamily: wordState.fontFamily,
          fontSize: wordState.fontSize,
          lineSpacing: wordState.lineSpacing,
          pageBgColor: wordState.pageBgColor,
          borderStyle: wordState.borderStyle,
          showBorders: wordState.showBorders,
          showHeader: wordState.showHeader,
          showFooter: wordState.showFooter,
          headerText: wordState.headerText,
          footerText: wordState.footerText,
        };
        localStorage.setItem('office_default_document_settings', JSON.stringify(defaultSettings));
      }

      // Save into office_local_documents library (ذاكرة التخزين المحلية)
      try {
        const isWord = mode === 'word';
        const docId = Date.now().toString();
        const cleanTitle = isWord ? wordState.title : excelState.title;
        
        // Save to Firestore
        if (isWord) {
            await saveDocumentToFirestore(docId, cleanTitle, wordState.contentHtml);
        }

        const baseName = cleanTitle.replace(/\.[^/.]+$/, '');
        const ext = isWord ? 'docx' : 'xlsx';
        const fullTitle = cleanTitle.includes('.') ? cleanTitle : `${cleanTitle}.${ext}`;

        const localDocs = JSON.parse(localStorage.getItem('office_local_documents') || '[]');
        const docEntry = {
          id: docId,
          title: fullTitle,
          name: baseName,
          format: ext,
          mode,
          updatedAt: new Date().toISOString(),
          wordState: isWord ? { ...wordState, title: fullTitle } : undefined,
          excelState: !isWord ? { ...excelState, title: fullTitle } : undefined,
        };
        const filtered = localDocs.filter((d: any) => d.title !== fullTitle && d.name !== baseName);
        localStorage.setItem('office_local_documents', JSON.stringify([docEntry, ...filtered].slice(0, 60)));
      } catch (err) {
        console.error(err);
      }

      setLastSavedText('تم حفظ المستند في الذاكرة المحلية بنجاح ✓');
      showToast('تم الحفظ اليدوي الفوري بنجاح', 'both');
      setTimeout(() => {
        setLastSavedText('محفوظ تلقائياً (Room)');
      }, 3500);
    } catch (e) {
      setLastSavedText('تعذر الحفظ في الذاكرة');
    }
  }, [wordState, excelState, mode]);

  // Update Word State partial
  const handleUpdateWordState = (partial: Partial<WordDocumentState>) => {
    setWordState((prev) => ({ ...prev, ...partial }));
  };

  // Update Excel Selected Cell Data (supports single cell or multi-cell selectedRange)
  const handleUpdateSelectedCell = (partial: Partial<CellData>) => {
    const sheetId = excelState.activeSheetId;
    setExcelState((prev) => {
      const updatedSheets = prev.sheets.map((sheet) => {
        if (sheet.id !== sheetId) return sheet;

        const targetAddrs = new Set<string>();
        if (selectedRange && selectedRange.start && selectedRange.end) {
          const s = parseCellAddress(selectedRange.start);
          const e = parseCellAddress(selectedRange.end);
          if (s && e) {
            const minCol = Math.min(s.colIndex, e.colIndex);
            const maxCol = Math.max(s.colIndex, e.colIndex);
            const minRow = Math.min(s.row, e.row);
            const maxRow = Math.max(s.row, e.row);
            for (let r = minRow; r <= maxRow; r++) {
              for (let c = minCol; c <= maxCol; c++) {
                targetAddrs.add(`${colIndexToLetter(c)}${r}`);
              }
            }
          }
        }
        if (targetAddrs.size === 0 && selectedCell) {
          targetAddrs.add(selectedCell);
        }

        const newData = { ...sheet.data };
        targetAddrs.forEach((addr) => {
          const currentCell = newData[addr] || { value: '' };
          newData[addr] = {
            ...currentCell,
            ...partial,
          };
        });

        return {
          ...sheet,
          data: newData,
        };
      });
      return { ...prev, sheets: updatedSheets };
    });
  };

  // Update any cell directly
  const handleUpdateCell = (cellAddr: string, partial: Partial<CellData>) => {
    const sheetId = excelState.activeSheetId;
    setExcelState((prev) => {
      const updatedSheets = prev.sheets.map((sheet) => {
        if (sheet.id !== sheetId) return sheet;
        const currentCell = sheet.data[cellAddr] || { value: '' };
        return {
          ...sheet,
          data: {
            ...sheet.data,
            [cellAddr]: {
              ...currentCell,
              ...partial,
            },
          },
        };
      });
      return { ...prev, sheets: updatedSheets };
    });
  };

  // Commit Formula Input from formula bar
  const handleFormulaInputSubmit = () => {
    const isFormula = formulaInput.trim().startsWith('=');
    handleUpdateSelectedCell({
      value: isFormula ? '' : formulaInput,
      formula: isFormula ? formulaInput : undefined,
    });
  };

  // Commit Inline Editing from cell
  const handleCommitInlineEdit = () => {
    setIsCellEditing(false);
    const isFormula = inlineCellValue.trim().startsWith('=');
    handleUpdateSelectedCell({
      value: isFormula ? '' : inlineCellValue,
      formula: isFormula ? inlineCellValue : undefined,
    });
    setFormulaInput(inlineCellValue);
  };

  // Insert Formula helper (supports full formulas or function names)
  const handleInsertFormula = (formulaArg: string) => {
    let formulaStr = formulaArg;
    if (!formulaArg.includes('(')) {
      const parsed = parseCellAddress(selectedCell);
      const col = parsed ? parsed.col : 'D';
      formulaStr = `=${formulaArg}(${col}2:${col}6)`;
    } else if (!formulaArg.startsWith('=')) {
      formulaStr = `=${formulaArg}`;
    }
    setFormulaInput(formulaStr);
    handleUpdateSelectedCell({
      formula: formulaStr,
      value: '',
    });
  };

  // Freeze Panes
  const handleFreezePanes = (type: 'row' | 'col' | 'none') => {
    const sheetId = excelState.activeSheetId;
    setExcelState((prev) => ({
      ...prev,
      sheets: prev.sheets.map((s) => {
        if (s.id !== sheetId) return s;
        return {
          ...s,
          freezeRow: type === 'row' ? 1 : undefined,
          freezeCol: type === 'col' ? 1 : undefined,
        };
      }),
    }));
  };

  // Insert Row in Excel
  const handleInsertRow = () => {
    const parsed = parseCellAddress(selectedCell);
    const rowNum = parsed ? parsed.row : 1;
    const sheetId = excelState.activeSheetId;

    setExcelState((prev) => {
      const updatedSheets = prev.sheets.map((s) => {
        if (s.id !== sheetId) return s;
        const newData: Record<string, CellData> = {};
        Object.entries(s.data).forEach(([addr, cell]) => {
          const p = parseCellAddress(addr);
          if (!p) return;
          if (p.row >= rowNum) {
            newData[`${p.col}${p.row + 1}`] = cell;
          } else {
            newData[addr] = cell;
          }
        });
        return {
          ...s,
          rowCount: s.rowCount + 1,
          data: newData,
        };
      });
      return { ...prev, sheets: updatedSheets };
    });
  };

  // Delete Row in Excel
  const handleDeleteRow = () => {
    const parsed = parseCellAddress(selectedCell);
    if (!parsed) return;
    const rowNum = parsed.row;
    const sheetId = excelState.activeSheetId;

    setExcelState((prev) => {
      const updatedSheets = prev.sheets.map((s) => {
        if (s.id !== sheetId) return s;
        const newData: Record<string, CellData> = {};
        Object.entries(s.data).forEach(([addr, cell]) => {
          const p = parseCellAddress(addr);
          if (!p) return;
          if (p.row === rowNum) return; // drop deleted row
          if (p.row > rowNum) {
            newData[`${p.col}${p.row - 1}`] = cell;
          } else {
            newData[addr] = cell;
          }
        });
        return {
          ...s,
          rowCount: Math.max(s.rowCount - 1, 10),
          data: newData,
        };
      });
      return { ...prev, sheets: updatedSheets };
    });
  };

  // Insert Column in Excel
  const handleInsertCol = () => {
    const sheetId = excelState.activeSheetId;
    setExcelState((prev) => {
      const updatedSheets = prev.sheets.map((s) => {
        if (s.id !== sheetId) return s;
        return {
          ...s,
          colCount: s.colCount + 1,
        };
      });
      return { ...prev, sheets: updatedSheets };
    });
  };

  // Delete Column in Excel
  const handleDeleteCol = () => {
    const sheetId = excelState.activeSheetId;
    setExcelState((prev) => {
      const updatedSheets = prev.sheets.map((s) => {
        if (s.id !== sheetId) return s;
        return {
          ...s,
          colCount: Math.max(s.colCount - 1, 5),
        };
      });
      return { ...prev, sheets: updatedSheets };
    });
  };

  // Update Column Width in Excel Sheet
  const handleUpdateColWidth = (col: string, width: number) => {
    const sheetId = excelState.activeSheetId;
    setExcelState((prev) => ({
      ...prev,
      sheets: prev.sheets.map((s) => {
        if (s.id !== sheetId) return s;
        return {
          ...s,
          colWidths: {
            ...(s.colWidths || {}),
            [col]: Math.max(width, 35),
          },
        };
      }),
    }));
  };

  // Update Row Height in Excel Sheet
  const handleUpdateRowHeight = (row: number, height: number) => {
    const sheetId = excelState.activeSheetId;
    setExcelState((prev) => ({
      ...prev,
      sheets: prev.sheets.map((s) => {
        if (s.id !== sheetId) return s;
        return {
          ...s,
          rowHeights: {
            ...(s.rowHeights || {}),
            [row]: Math.max(height, 20),
          },
        };
      }),
    }));
  };

  // Add new sheet tab
  const handleAddSheet = () => {
    const newId = `sheet_${Date.now()}`;
    const newName = `ورقة ${excelState.sheets.length + 1}`;
    setExcelState((prev) => ({
      ...prev,
      activeSheetId: newId,
      sheets: [
        ...prev.sheets,
        {
          id: newId,
          name: newName,
          rowCount: 40,
          colCount: 15,
          data: {},
        },
      ],
    }));
  };

  // Rename sheet tab
  const handleRenameSheet = (id: string, newName: string) => {
    setExcelState((prev) => ({
      ...prev,
      sheets: prev.sheets.map((s) => (s.id === id ? { ...s, name: newName } : s)),
    }));
  };

  // Sort rows based on column and direction
  const handleSortColumn = (col: string, direction: 'asc' | 'desc') => {
    const sheetId = excelState.activeSheetId;
    setExcelState((prev) => {
      const updatedSheets = prev.sheets.map((sheet) => {
        if (sheet.id !== sheetId) return sheet;

        const rowIndices: number[] = [];
        for (let r = 2; r <= sheet.rowCount; r++) {
          const aVal = sheet.data[`A${r}`]?.value || '';
          if (aVal.includes('∑') || sheet.data[`B${r}`]?.value?.includes('الإجمالي')) {
            continue;
          }
          let hasContent = false;
          for (let c = 0; c < sheet.colCount; c++) {
            const letter = colIndexToLetter(c);
            if (sheet.data[`${letter}${r}`]?.value || sheet.data[`${letter}${r}`]?.formula) {
              hasContent = true;
              break;
            }
          }
          if (hasContent) {
            rowIndices.push(r);
          }
        }

        rowIndices.sort((rA, rB) => {
          const cellA = sheet.data[`${col}${rA}`]?.value || '';
          const cellB = sheet.data[`${col}${rB}`]?.value || '';
          const numA = parseFloat(cellA.replace(/[^\d.-]/g, ''));
          const numB = parseFloat(cellB.replace(/[^\d.-]/g, ''));

          if (!isNaN(numA) && !isNaN(numB)) {
            return direction === 'asc' ? numA - numB : numB - numA;
          }
          return direction === 'asc' 
            ? cellA.localeCompare(cellB, 'ar') 
            : cellB.localeCompare(cellA, 'ar');
        });

        const rowsDataSnapshot = rowIndices.map((origR) => {
          const rowData: Record<string, CellData> = {};
          for (let c = 0; c < sheet.colCount; c++) {
            const letter = colIndexToLetter(c);
            const key = `${letter}${origR}`;
            if (sheet.data[key]) {
              rowData[letter] = { ...sheet.data[key] };
            }
          }
          return rowData;
        });

        const newData = { ...sheet.data };
        rowIndices.forEach((_, idx) => {
          const targetRow = idx + 2;
          const sourceData = rowsDataSnapshot[idx];

          for (let c = 0; c < sheet.colCount; c++) {
            const letter = colIndexToLetter(c);
            delete newData[`${letter}${targetRow}`];
          }

          for (const [letter, cellVal] of Object.entries(sourceData)) {
            newData[`${letter}${targetRow}`] = {
              ...cellVal,
              value: letter === 'A' ? `${idx + 1}` : cellVal.value,
            };
          }
        });

        return { ...sheet, data: newData };
      });

      return { ...prev, sheets: updatedSheets };
    });
  };

  // Apply visual theme to Excel table
  const handleApplyTableStyle = (styleType: string) => {
    const sheetId = excelState.activeSheetId;
    setExcelState((prev) => {
      const updatedSheets = prev.sheets.map((sheet) => {
        if (sheet.id !== sheetId) return sheet;

        const isNavy = styleType === 'navy';
        const headerBg = isNavy ? '#1e3a8a' : '#15803d';
        const stripeBg = isNavy ? '#f0f9ff' : '#f8fafc';
        const borderColor = isNavy ? '#93c5fd' : '#cbd5e1';

        const newData = { ...sheet.data };
        for (let r = 1; r <= 15; r++) {
          for (let c = 0; c < Math.min(sheet.colCount, 8); c++) {
            const letter = colIndexToLetter(c);
            const addr = `${letter}${r}`;
            const cell = newData[addr] || { value: '' };

            if (r === 1) {
              newData[addr] = {
                ...cell,
                bg: headerBg,
                color: '#ffffff',
                bold: true,
                align: 'center',
                borderStyle: 'all',
                borderColor,
              };
            } else if (cell.value && (cell.value.includes('∑') || cell.value.includes('الإجمالي'))) {
              newData[addr] = {
                ...cell,
                bold: true,
                borderStyle: 'double_bottom',
                borderColor: isNavy ? '#1e3a8a' : '#0369a1',
              };
            } else if (r % 2 === 1) {
              newData[addr] = {
                ...cell,
                bg: stripeBg,
                borderStyle: 'all',
                borderColor,
              };
            } else {
              newData[addr] = {
                ...cell,
                borderStyle: 'all',
                borderColor,
              };
            }
          }
        }

        return { ...sheet, data: newData };
      });
      return { ...prev, sheets: updatedSheets };
    });
  };

  // Merge cells in selected range
  const handleMergeCells = (range?: { start: string; end: string }) => {
    const targetRange = range || selectedRange;
    if (!targetRange) return;
    const s = parseCellAddress(targetRange.start);
    const e = parseCellAddress(targetRange.end);
    if (!s || !e) return;

    const minCol = Math.min(s.colIndex, e.colIndex);
    const maxCol = Math.max(s.colIndex, e.colIndex);
    const minRow = Math.min(s.row, e.row);
    const maxRow = Math.max(s.row, e.row);

    if (minCol === maxCol && minRow === maxRow) {
      return; // Single cell, nothing to merge
    }

    const startAddr = `${colIndexToLetter(minCol)}${minRow}`;
    const endAddr = `${colIndexToLetter(maxCol)}${maxRow}`;

    const sheetId = excelState.activeSheetId;
    setExcelState((prev) => {
      const updatedSheets = prev.sheets.map((sheet) => {
        if (sheet.id !== sheetId) return sheet;

        // Remove any existing merges that overlap with this range
        const filteredMerges = (sheet.merges || []).filter((m) => {
          const ms = parseCellAddress(m.start);
          const me = parseCellAddress(m.end);
          if (!ms || !me) return false;
          const mMinCol = Math.min(ms.colIndex, me.colIndex);
          const mMaxCol = Math.max(ms.colIndex, me.colIndex);
          const mMinRow = Math.min(ms.row, me.row);
          const mMaxRow = Math.max(ms.row, me.row);

          const overlap = !(
            maxCol < mMinCol ||
            minCol > mMaxCol ||
            maxRow < mMinRow ||
            minRow > mMaxRow
          );
          return !overlap;
        });

        // Center align the top-left master cell
        const firstCell = sheet.data[startAddr] || { value: '' };
        const updatedData = { ...sheet.data };
        updatedData[startAddr] = {
          ...firstCell,
          align: 'center',
          valign: 'middle',
        };

        return {
          ...sheet,
          data: updatedData,
          merges: [...filteredMerges, { start: startAddr, end: endAddr }],
        };
      });

      return { ...prev, sheets: updatedSheets };
    });
  };

  // Unmerge cells in current selection or active cell
  const handleUnmergeCells = () => {
    const activeAddr = selectedCell;
    const sheetId = excelState.activeSheetId;

    setExcelState((prev) => {
      const updatedSheets = prev.sheets.map((sheet) => {
        if (sheet.id !== sheetId) return sheet;

        const filteredMerges = (sheet.merges || []).filter((m) => {
          const s = parseCellAddress(m.start);
          const e = parseCellAddress(m.end);
          if (!s || !e) return true;
          const minCol = Math.min(s.colIndex, e.colIndex);
          const maxCol = Math.max(s.colIndex, e.colIndex);
          const minRow = Math.min(s.row, e.row);
          const maxRow = Math.max(s.row, e.row);

          const cur = parseCellAddress(activeAddr);
          if (!cur) return true;

          const isInside =
            cur.colIndex >= minCol &&
            cur.colIndex <= maxCol &&
            cur.row >= minRow &&
            cur.row <= maxRow;

          return !isInside;
        });

        return {
          ...sheet,
          merges: filteredMerges,
        };
      });

      return { ...prev, sheets: updatedSheets };
    });
  };

  // Check if current active cell is inside any merged cell block
  const isCurrentMerged = React.useMemo(() => {
    const cur = parseCellAddress(selectedCell);
    if (!cur || !currentSheet.merges) return false;
    return currentSheet.merges.some((m) => {
      const s = parseCellAddress(m.start);
      const e = parseCellAddress(m.end);
      if (!s || !e) return false;
      const minCol = Math.min(s.colIndex, e.colIndex);
      const maxCol = Math.max(s.colIndex, e.colIndex);
      const minRow = Math.min(s.row, e.row);
      const maxRow = Math.max(s.row, e.row);
      return (
        cur.colIndex >= minCol &&
        cur.colIndex <= maxCol &&
        cur.row >= minRow &&
        cur.row <= maxRow
      );
    });
  }, [selectedCell, currentSheet.merges]);

  // Insert table into Word document
  const handleInsertTable = (rows: number, cols: number) => {
    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-family: 'Cairo', sans-serif; font-size: 14px; border: 2px solid #334155;">
      <thead>
        <tr style="background-color: #1e293b; color: #ffffff;">`;
    for (let c = 1; c <= cols; c++) {
      tableHtml += `<th style="border: 1px solid #475569; padding: 10px; font-weight: bold; text-align: right;">العمود ${c}</th>`;
    }
    tableHtml += `</tr></thead>
      <tbody>`;
    for (let r = 1; r <= rows; r++) {
      tableHtml += '<tr style="background-color: #ffffff;">';
      for (let c = 1; c <= cols; c++) {
        tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 10px; color: #334155;">&nbsp;</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';
    handleExecCommand('insertHTML', tableHtml);
  };

  // Insert image into Word document
  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgUrl = event.target?.result as string;
          const imgHtml = `<div style="text-align: center; margin: 16px 0;"><img src="${imgUrl}" alt="صورة مدرجة" style="max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" /></div><p><br></p>`;
          handleExecCommand('insertHTML', imgHtml);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Insert Shape or Box
  const handleInsertShape = (shapeType: string) => {
    let shapeHtml = '';
    if (shapeType === 'alert') {
      shapeHtml = `
        <div style="margin: 16px 0; padding: 14px 18px; border-right: 4px solid #f59e0b; background: #fffbeb; border-radius: 4px; font-weight: 500; color: #92400e;">
          <strong>تنبيه هام:</strong><br />يرجى الالتزام بالتعليمات التنظيمية واللوائح المعمول بها.
        </div>
        <p><br></p>
      `;
    } else if (shapeType === 'quote') {
      shapeHtml = `
        <blockquote style="margin: 16px 0; padding: 12px 20px; border-right: 4px solid #2563eb; background: #f8fafc; font-style: italic; color: #334155; border-radius: 4px;">
          "اقتباس نصي رسمي أو مرجع قانوني معتمد داخل المستند."
        </blockquote>
        <p><br></p>
      `;
    } else if (shapeType === 'flowchart') {
      shapeHtml = `
        <div style="margin: 16px auto; padding: 16px; border: 2px dashed #3b82f6; background: #eff6ff; text-align: center; border-radius: 8px; font-weight: bold; color: #1e40af;">
          [مخطط انسيابي: بداية العمل ➔ المعالجة والتنفيذ ➔ الاعتماد النهائي]
        </div>
        <p><br></p>
      `;
    } else {
      shapeHtml = `
        <div style="margin: 16px 0; padding: 14px 18px; border-right: 4px solid #2563eb; background: #eff6ff; border-radius: 4px; font-weight: 500; color: #1e3a8a;">
          <strong>مربع نص تنظيمي:</strong><br />محتوى تنظيمي مدرج داخل إطار رسمي.
        </div>
        <p><br></p>
      `;
    }
    handleExecCommand('insertHTML', shapeHtml);
  };

  // Insert Symbol
  const handleInsertSymbol = (symbol: string) => {
    handleExecCommand('insertHTML', `<span style="font-size: 1.1em; font-weight: bold; padding: 0 2px;">${symbol}</span>`);
  };

  // Helper to generate a clean page break element adhering strictly to document margins and 0.9cm height
  const createPageBreakHtml = () => {
    return `<div class="word-page-break" contenteditable="false" data-page-break="true" role="separator" aria-label="فاصل صفحات" style="display: block; break-after: page; page-break-after: always; clear: both; height: 0.9cm; min-height: 0.9cm; max-height: 0.9cm; margin: 0; padding: 0; user-select: none; pointer-events: none; overflow: hidden; box-sizing: border-box; width: 100%;"></div><p><br></p>`;
  };

  // Add New Page with Automatic Page Break
  const handleAddNewPage = (position: 'end' | 'cursor' = 'end') => {
    if (mode === 'word') {
      const pageBreakHtml = createPageBreakHtml();

      if (position === 'cursor') {
        const { element } = getActiveWordTargetElement();
        if (element && element.getAttribute('data-word-target') === 'body') {
          handleExecCommand('insertHTML', pageBreakHtml);
          setLastSavedText('تمت إضافة صفحة جديدة مع فاصل صفحات تلقائي 📄');
          setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2000);
          return;
        }
      }

      // Collect latest HTML from all body pages if present
      const bodyEls = document.querySelectorAll('[data-word-target="body"]');
      let baseContent = (wordState.contentHtml || '').trim();
      if (bodyEls.length > 0) {
        const chunks: string[] = [];
        bodyEls.forEach((el) => {
          chunks.push((el as HTMLElement).innerHTML || '<p><br></p>');
        });
        baseContent = chunks.join('<div class="word-page-break" contenteditable="false" data-page-break="true"></div>');
      }

      const newContent = baseContent 
        ? `${baseContent}<div class="word-page-break" contenteditable="false" data-page-break="true"></div><p><br></p>`
        : `<p><br></p><div class="word-page-break" contenteditable="false" data-page-break="true"></div><p><br></p>`;

      handleUpdateWordState({ contentHtml: newContent });
      setLastSavedText('تمت إضافة صفحة جديدة مع فاصل صفحات تلقائي 📄');
      setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2000);

      // Focus and smooth scroll to newly created page
      setTimeout(() => {
        const allPages = document.querySelectorAll('.page-sheet-wrapper');
        const lastPage = allPages[allPages.length - 1];
        if (lastPage) {
          lastPage.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const editable = lastPage.querySelector('[data-word-target="body"]') as HTMLElement;
          if (editable) {
            editable.focus();
          }
        }
      }, 80);
    }
  };

  // Insert Horizontal Rule Line adhering to page margins
  const handleInsertLine = () => {
    const hrHtml = `<hr class="word-document-divider" contenteditable="false" style="border-top: 1.5px solid #475569; border-bottom: none; border-left: none; border-right: none; margin: 18px 0; width: 100%; box-sizing: border-box; clear: both;" /><p><br></p>`;
    handleExecCommand('insertHTML', hrHtml);
  };

  // Insert Link
  const handleInsertLink = () => {
    const url = prompt('أدخل رابط الموقع الإلكتروني (URL):', 'https://');
    if (url) {
      handleExecCommand('createLink', url);
    }
  };

  // Virtual Keyboard Input Handlers
  const handleVirtualKeyPress = (char: string) => {
    if (mode === 'word') {
      const { element, type } = getActiveWordTargetElement();
      if (element) {
        if (document.activeElement !== element) {
          element.focus();
        }
        document.execCommand('insertText', false, char);
        if (type === 'header') {
          setWordState((prev) => ({ ...prev, headerText: element.innerText }));
        } else if (type === 'footer') {
          setWordState((prev) => ({ ...prev, footerText: element.innerText }));
        } else {
          setWordState((prev) => ({
            ...prev,
            contentHtml: element.innerHTML,
          }));
        }
      }
    } else {
      if (isCellEditing) {
        setInlineCellValue((prev) => prev + char);
      } else {
        setIsCellEditing(true);
        setInlineCellValue(char);
      }
      setFormulaInput((prev) => prev + char);
    }
  };

  const handleInsertFullText = (text: string) => {
    if (mode === 'word') {
      const { element, type } = getActiveWordTargetElement();
      if (element) {
        if (document.activeElement !== element) {
          element.focus();
        }
        if (text.includes('\n')) {
          const htmlParagraphs = text
            .split('\n')
            .map((line) => line.trim() ? `<p>${line}</p>` : '<p><br/></p>')
            .join('');
          document.execCommand('insertHTML', false, htmlParagraphs);
        } else {
          document.execCommand('insertText', false, text);
        }
        if (type === 'header') {
          setWordState((prev) => ({ ...prev, headerText: element.innerText }));
        } else if (type === 'footer') {
          setWordState((prev) => ({ ...prev, footerText: element.innerText }));
        } else {
          setWordState((prev) => ({
            ...prev,
            contentHtml: element.innerHTML,
          }));
        }
      }
    } else {
      if (isCellEditing) {
        setInlineCellValue((prev) => prev + text);
      } else {
        setIsCellEditing(true);
        setInlineCellValue(text);
      }
      setFormulaInput((prev) => prev + text);
    }
  };

  const handleVirtualBackspace = () => {
    if (mode === 'word') {
      const { element, type } = getActiveWordTargetElement();
      if (element) {
        if (document.activeElement !== element) {
          element.focus();
        }
        document.execCommand('delete');
        if (type === 'header') {
          setWordState((prev) => ({ ...prev, headerText: element.innerText }));
        } else if (type === 'footer') {
          setWordState((prev) => ({ ...prev, footerText: element.innerText }));
        } else {
          setWordState((prev) => ({
            ...prev,
            contentHtml: element.innerHTML,
          }));
        }
      }
    } else {
      if (isCellEditing) {
        setInlineCellValue((prev) => prev.slice(0, -1));
      } else {
        handleUpdateSelectedCell({ value: '', formula: undefined });
      }
    }
  };

  const handleVirtualEnter = () => {
    if (mode === 'word') {
      const { element, type } = getActiveWordTargetElement();
      if (element) {
        if (document.activeElement !== element) {
          element.focus();
        }
        if (type === 'header' || type === 'footer') {
          document.execCommand('insertLineBreak');
          if (type === 'header') setWordState((prev) => ({ ...prev, headerText: element.innerText }));
          else setWordState((prev) => ({ ...prev, footerText: element.innerText }));
        } else {
          handleExecCommand('insertParagraph');
        }
      }
    } else {
      if (isCellEditing) {
        handleCommitInlineEdit();
      }
      const parsed = parseCellAddress(selectedCell);
      if (parsed && parsed.row < currentSheet.rowCount) {
        setSelectedCell(`${parsed.col}${parsed.row + 1}`);
      }
    }
  };

  const handleVirtualTab = () => {
    if (mode === 'word') {
      const { element, type } = getActiveWordTargetElement();
      if (element) {
        if (document.activeElement !== element) {
          element.focus();
        }
        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        if (type === 'header') setWordState((prev) => ({ ...prev, headerText: element.innerText }));
        else if (type === 'footer') setWordState((prev) => ({ ...prev, footerText: element.innerText }));
        else setWordState((prev) => ({ ...prev, contentHtml: element.innerHTML }));
      }
    } else {
      if (isCellEditing) {
        handleCommitInlineEdit();
      }
      const parsed = parseCellAddress(selectedCell);
      if (parsed && parsed.colIndex + 1 < currentSheet.colCount) {
        setSelectedCell(`${colIndexToLetter(parsed.colIndex + 1)}${parsed.row}`);
      }
    }
  };

  // Keyboard shortcut command executor linked to Word and Excel editors
  const handleKeyboardCommand = (cmd: string) => {
    if (mode === 'word') {
      const { element, type } = getActiveWordTargetElement();
      if (element && document.activeElement !== element) {
        element.focus();
      }

      if (
        cmd === 'bold' || 
        cmd === 'italic' || 
        cmd === 'underline' || 
        cmd === 'strikeThrough' ||
        cmd === 'justifyRight' ||
        cmd === 'justifyCenter' ||
        cmd === 'justifyLeft' ||
        cmd === 'justifyFull' ||
        cmd === 'insertUnorderedList' ||
        cmd === 'insertOrderedList' ||
        cmd === 'undo' || 
        cmd === 'redo' ||
        cmd === 'selectAll' ||
        cmd === 'removeFormat' ||
        cmd === 'subscript' ||
        cmd === 'superscript'
      ) {
        handleExecCommand(cmd);
        if (type === 'header' && element) {
          setWordState((prev) => ({ ...prev, headerText: element.innerText }));
        } else if (type === 'footer' && element) {
          setWordState((prev) => ({ ...prev, footerText: element.innerText }));
        }
      } else if (cmd === 'fontSizeUp') {
        const nextSize = Math.min(72, (wordState.fontSize || 14) + 2);
        setWordState((prev) => ({ ...prev, fontSize: nextSize }));
        setLastSavedText(`حجم الخط: ${nextSize}pt`);
        setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 1500);
      } else if (cmd === 'fontSizeDown') {
        const nextSize = Math.max(8, (wordState.fontSize || 14) - 2);
        setWordState((prev) => ({ ...prev, fontSize: nextSize }));
        setLastSavedText(`حجم الخط: ${nextSize}pt`);
        setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 1500);
      } else if (cmd === 'pageBreak') {
        const pageBreakHtml = createPageBreakHtml();
        handleExecCommand('insertHTML', pageBreakHtml);
        setLastSavedText('تم إدراج فاصل صفحات 📄');
        setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 1500);
      } else if (cmd === 'arrowRight') {
        const sel = window.getSelection();
        if (sel && (sel as any).modify) {
          (sel as any).modify('move', 'backward', 'character');
        }
      } else if (cmd === 'arrowLeft') {
        const sel = window.getSelection();
        if (sel && (sel as any).modify) {
          (sel as any).modify('move', 'forward', 'character');
        }
      } else if (cmd === 'arrowUp') {
        const sel = window.getSelection();
        if (sel && (sel as any).modify) {
          (sel as any).modify('move', 'backward', 'line');
        }
      } else if (cmd === 'arrowDown') {
        const sel = window.getSelection();
        if (sel && (sel as any).modify) {
          (sel as any).modify('move', 'forward', 'line');
        }
      } else if (cmd === 'deleteForward') {
        document.execCommand('forwardDelete');
        if (type === 'header' && element) {
          setWordState((prev) => ({ ...prev, headerText: element.innerText }));
        } else if (type === 'footer' && element) {
          setWordState((prev) => ({ ...prev, footerText: element.innerText }));
        } else if (element) {
          setWordState((prev) => ({ ...prev, contentHtml: element.innerHTML }));
        }
      } else if (cmd === 'escape') {
        const sel = window.getSelection();
        sel?.removeAllRanges();
      } else if (cmd === 'save') {
        localStorage.setItem('office_word_state', JSON.stringify(wordState));
        setLastSavedText('تم حفظ المستند بنجاح ✓');
        setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2500);
      } else if (cmd === 'print') {
        handleOpenPrintPreview();
      } else if (cmd === 'copy') {
        const sel = window.getSelection();
        if (sel && sel.toString()) {
          navigator.clipboard?.writeText(sel.toString());
        } else {
          document.execCommand('copy');
        }
        setLastSavedText('تم نسخ النص المحدد ✓');
        setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2000);
      } else if (cmd === 'cut') {
        document.execCommand('cut');
        setLastSavedText('تم قص العنصر المحدد ✓');
        setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2000);
      } else if (cmd === 'paste') {
        navigator.clipboard?.readText().then((text) => {
          if (text) {
            handleExecCommand('insertText', text);
            setLastSavedText('تم لصق النص بنجاح ✓');
            setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2000);
          }
        }).catch(() => {
          document.execCommand('paste');
        });
      } else if (cmd === 'find') {
        // Trigger Word ribbon Find & Replace modal if available
        const findButton = document.querySelector('[title*="بحث"]') as HTMLElement | null;
        if (findButton) {
          findButton.click();
        } else {
          const q = prompt('البحث داخل المستند:');
          if (q && (window as any).find) {
            (window as any).find(q);
          }
        }
      } else if (cmd === 'permanentDelete') {
        if (confirm('تنبيه: هل تريد حذف العنصر المحدد نهائياً دون نقله إلى سلة المهملات؟')) {
          const sel = window.getSelection();
          if (sel && !sel.isCollapsed) {
            document.execCommand('delete');
          } else {
            handleExecCommand('delete');
          }
          setLastSavedText('تم الحذف النهائي بنجاح ✓');
          setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2500);
        }
      }
    } else {
      // Excel Commands
      const currentCell = currentSheet?.data[selectedCell] || {};
      const parsed = parseCellAddress(selectedCell);

      if (cmd === 'arrowRight') {
        if (isCellEditing) handleCommitInlineEdit();
        if (parsed && parsed.colIndex > 0) {
          setSelectedCell(`${colIndexToLetter(parsed.colIndex - 1)}${parsed.row}`);
        }
      } else if (cmd === 'arrowLeft') {
        if (isCellEditing) handleCommitInlineEdit();
        if (parsed && parsed.colIndex + 1 < currentSheet.colCount) {
          setSelectedCell(`${colIndexToLetter(parsed.colIndex + 1)}${parsed.row}`);
        }
      } else if (cmd === 'arrowUp') {
        if (isCellEditing) handleCommitInlineEdit();
        if (parsed && parsed.row > 1) {
          setSelectedCell(`${parsed.col}${parsed.row - 1}`);
        }
      } else if (cmd === 'arrowDown') {
        if (isCellEditing) handleCommitInlineEdit();
        if (parsed && parsed.row < currentSheet.rowCount) {
          setSelectedCell(`${parsed.col}${parsed.row + 1}`);
        }
      } else if (cmd === 'escape') {
        setIsCellEditing(false);
        setInlineCellValue('');
        setFormulaInput(currentCell.formula || String(currentCell.value || ''));
      } else if (cmd === 'deleteForward') {
        handleUpdateSelectedCell({ value: '', formula: undefined });
        setInlineCellValue('');
        setFormulaInput('');
      } else if (cmd === 'bold') {
        handleUpdateSelectedCell({ bold: !currentCell.bold });
      } else if (cmd === 'italic') {
        handleUpdateSelectedCell({ italic: !currentCell.italic });
      } else if (cmd === 'underline') {
        handleUpdateSelectedCell({ underline: !currentCell.underline });
      } else if (cmd === 'alignLeft' || cmd === 'alignCenter' || cmd === 'alignRight') {
        handleUpdateSelectedCell({ align: cmd.replace('align', '').toLowerCase() as any });
      } else if (cmd === 'sum') {
        handleInsertFormula('SUM');
      } else if (cmd === 'average') {
        handleInsertFormula('AVERAGE');
      } else if (cmd === 'count') {
        handleInsertFormula('COUNT');
      } else if (cmd === 'min') {
        handleInsertFormula('MIN');
      } else if (cmd === 'max') {
        handleInsertFormula('MAX');
      } else if (cmd === 'currency') {
        const val = parseFloat(String(currentCell.value || '0').replace(/[^0-9.-]+/g, ''));
        const formatted = isNaN(val) ? currentCell.value : `$${val.toFixed(2)}`;
        handleUpdateSelectedCell({ value: formatted });
      } else if (cmd === 'percent') {
        const val = parseFloat(String(currentCell.value || '0').replace(/[^0-9.-]+/g, ''));
        const formatted = isNaN(val) ? currentCell.value : `${(val * 100).toFixed(0)}%`;
        handleUpdateSelectedCell({ value: formatted });
      } else if (cmd === 'clear') {
        handleUpdateSelectedCell({ value: '', formula: undefined });
      } else if (cmd === 'insertRow') {
        handleInsertRow();
      } else if (cmd === 'deleteRow') {
        handleDeleteRow();
      } else if (cmd === 'insertCol') {
        handleInsertCol();
      } else if (cmd === 'deleteCol') {
        handleDeleteCol();
      } else if (cmd === 'save') {
        localStorage.setItem('office_excel_state', JSON.stringify(excelState));
        setLastSavedText('تم حفظ جدول البيانات بنجاح ✓');
        setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2500);
      } else if (cmd === 'print') {
        handleOpenPrintPreview();
      } else if (cmd === 'undo') {
        // Excel undo
        handleExecCommand('undo');
      } else if (cmd === 'redo') {
        // Excel redo
        handleExecCommand('redo');
      } else if (cmd === 'selectAll') {
        // Select full sheet range
        setSelectedRange({ start: 'A1', end: `${colIndexToLetter(currentSheet.colCount - 1)}${currentSheet.rowCount}` });
        setLastSavedText('تم تحديد كافة خلايا الورقة (Ctrl+A) ✓');
        setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2000);
      } else if (cmd === 'copy') {
        const val = currentCell.formula || String(currentCell.value || '');
        navigator.clipboard?.writeText(val);
        setLastSavedText(`تم نسخ الخلية (${selectedCell}) ✓`);
        setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2000);
      } else if (cmd === 'cut') {
        const val = currentCell.formula || String(currentCell.value || '');
        navigator.clipboard?.writeText(val);
        handleUpdateSelectedCell({ value: '', formula: undefined });
        setLastSavedText(`تم قص الخلية (${selectedCell}) ✓`);
        setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2000);
      } else if (cmd === 'paste') {
        navigator.clipboard?.readText().then((text) => {
          if (text !== undefined) {
            handleUpdateSelectedCell({ value: text });
            setLastSavedText(`تم اللصق في الخلية (${selectedCell}) ✓`);
            setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2000);
          }
        });
      } else if (cmd === 'find') {
        const q = prompt('البحث داخل جدول البيانات:');
        if (q) {
          const found = Object.entries(currentSheet.data).find(([_, c]) => {
            const cell = c as CellData;
            return (
              String(cell?.value || '').toLowerCase().includes(q.toLowerCase()) ||
              String(cell?.formula || '').toLowerCase().includes(q.toLowerCase())
            );
          });
          if (found) {
            setSelectedCell(found[0]);
            setLastSavedText(`تم العثور على الخلية: ${found[0]} ✓`);
            setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2500);
          } else {
            alert('لم يتم العثور على أي تطابق في خلايا هذا الجدول.');
          }
        }
      } else if (cmd === 'permanentDelete') {
        if (confirm(`تنبيه: هل تريد حذف بيانات الخلية (${selectedCell}) نهائياً دون نقل لسلة المهملات؟`)) {
          handleUpdateSelectedCell({ value: '', formula: undefined, bg: undefined, color: undefined, bold: false, italic: false, underline: false });
          setLastSavedText('تم الحذف النهائي ✓');
          setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2500);
        }
      }
    }
  };

  // Global Hardware / Physical Keyboard Shortcuts Listener with universal e.code & Arabic e.key mapping
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      const code = e.code;

      // Shift + Delete: Permanent deletion without trash
      if (e.shiftKey && (e.key === 'Delete' || code === 'Delete')) {
        e.preventDefault();
        handleKeyboardCommand('permanentDelete');
        return;
      }

      if (isCtrlOrCmd) {
        // Formatting: Bold (Ctrl+B / Code KeyB / Arabic 'لا')
        if (code === 'KeyB' || key === 'b' || e.key === 'لا') {
          e.preventDefault();
          handleKeyboardCommand('bold');
          return;
        }
        // Formatting: Italic (Ctrl+I / Code KeyI / Arabic 'ه')
        if (code === 'KeyI' || key === 'i' || e.key === 'ه') {
          e.preventDefault();
          handleKeyboardCommand('italic');
          return;
        }
        // Formatting: Underline (Ctrl+U / Code KeyU / Arabic 'ع')
        if (code === 'KeyU' || key === 'u' || e.key === 'ع') {
          e.preventDefault();
          handleKeyboardCommand('underline');
          return;
        }
        // Alignment: Center (Ctrl+E / Code KeyE / Arabic 'ث')
        if (code === 'KeyE' || key === 'e' || e.key === 'ث') {
          e.preventDefault();
          handleKeyboardCommand('justifyCenter');
          return;
        }
        // Alignment: Right (Ctrl+R / Code KeyR / Arabic 'ق')
        if (code === 'KeyR' || key === 'r' || e.key === 'ق') {
          e.preventDefault();
          handleKeyboardCommand('justifyRight');
          return;
        }
        // Alignment: Left (Ctrl+L / Code KeyL / Arabic 'م')
        if (code === 'KeyL' || key === 'l' || e.key === 'م') {
          e.preventDefault();
          handleKeyboardCommand('justifyLeft');
          return;
        }
        // Alignment: Justify (Ctrl+J / Code KeyJ / Arabic 'ت')
        if (code === 'KeyJ' || key === 'j' || e.key === 'ت') {
          e.preventDefault();
          handleKeyboardCommand('justifyFull');
          return;
        }
        // Font Size Up (Ctrl+] / Code BracketRight / Arabic 'د' / Ctrl+Shift+>)
        if (code === 'BracketRight' || key === ']' || e.key === 'د' || (e.shiftKey && (key === '>' || key === '.' || code === 'Period'))) {
          e.preventDefault();
          handleKeyboardCommand('fontSizeUp');
          return;
        }
        // Font Size Down (Ctrl+[ / Code BracketLeft / Arabic 'ج' / Ctrl+Shift+<)
        if (code === 'BracketLeft' || key === '[' || e.key === 'ج' || (e.shiftKey && (key === '<' || key === ',' || code === 'Comma'))) {
          e.preventDefault();
          handleKeyboardCommand('fontSizeDown');
          return;
        }
        // Page Break (Ctrl+Enter)
        if (e.key === 'Enter' || code === 'Enter' || code === 'NumpadEnter') {
          e.preventDefault();
          handleKeyboardCommand('pageBreak');
          return;
        }

        // Copy (Ctrl+C / Code KeyC / Arabic 'ؤ')
        if (code === 'KeyC' || key === 'c' || e.key === 'ؤ') {
          if (mode === 'excel' && document.activeElement?.tagName !== 'INPUT' && !isCellEditing) {
            e.preventDefault();
            handleKeyboardCommand('copy');
          }
        } else if (code === 'KeyX' || key === 'x' || e.key === 'ء') {
          // Cut (Ctrl+X / Code KeyX / Arabic 'ء')
          if (mode === 'excel' && document.activeElement?.tagName !== 'INPUT' && !isCellEditing) {
            e.preventDefault();
            handleKeyboardCommand('cut');
          }
        } else if (code === 'KeyV' || key === 'v' || e.key === 'ر') {
          // Paste (Ctrl+V / Code KeyV / Arabic 'ر')
          if (mode === 'excel' && document.activeElement?.tagName !== 'INPUT' && !isCellEditing) {
            e.preventDefault();
            handleKeyboardCommand('paste');
          }
        } else if (code === 'KeyA' || key === 'a' || e.key === 'ش') {
          // Select All (Ctrl+A / Code KeyA / Arabic 'ش')
          if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            e.preventDefault();
            handleKeyboardCommand('selectAll');
          }
        } else if (code === 'KeyS' || key === 's' || e.key === 'س') {
          // Save (Ctrl+S / Code KeyS / Arabic 'س')
          e.preventDefault();
          if (e.shiftKey) {
            setIsSaveAsOpen(true);
          } else {
            handleQuickSave();
          }
        } else if (code === 'KeyZ' || key === 'z' || e.key === 'ئ') {
          // Undo / Redo (Ctrl+Z / Ctrl+Shift+Z / Arabic 'ئ')
          e.preventDefault();
          if (e.shiftKey) {
            handleKeyboardCommand('redo');
          } else {
            handleKeyboardCommand('undo');
          }
        } else if (code === 'KeyY' || key === 'y' || e.key === 'إ') {
          // Redo (Ctrl+Y / Code KeyY / Arabic 'إ')
          e.preventDefault();
          handleKeyboardCommand('redo');
        } else if (code === 'KeyF' || key === 'f' || e.key === 'ب') {
          // Find (Ctrl+F / Code KeyF / Arabic 'ب')
          e.preventDefault();
          handleKeyboardCommand('find');
        } else if (code === 'KeyP' || key === 'p' || e.key === 'ح') {
          // Print (Ctrl+P / Code KeyP / Arabic 'ح')
          e.preventDefault();
          handleOpenPrintPreview();
        } else if (code === 'KeyN' || key === 'n' || e.key === 'ى') {
          // New Document (Ctrl+N / Code KeyN / Arabic 'ى')
          e.preventDefault();
          handleNewDocument();
        } else if (code === 'KeyO' || key === 'o' || e.key === 'خ') {
          // Open Document (Ctrl+O / Code KeyO / Arabic 'خ')
          e.preventDefault();
          handleOpenDocument();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [mode, wordState, excelState, currentSheet, selectedCell, isCellEditing]);

  // File Import handler with robust PDF, DOCX, Excel and text parsing
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      setMode('excel');
      setExcelState((prev) => ({ ...prev, title: file.name }));
      setLastSavedText(`تم استيراد جدول البيانات (${file.name}) بنجاح ✓`);
      setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2500);
    } else if (fileName.endsWith('.docx')) {
      setMode('word');
      try {
        const { title, html } = await parseDocxFile(file);
        setWordState((prev) => ({
          ...prev,
          title: title || file.name,
          contentHtml: html || prev.contentHtml,
        }));
        setLastSavedText(`تم فتح مستند Word (${file.name}) بنجاح ✓`);
        setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2500);
      } catch (err) {
        console.error('Error opening docx:', err);
      }
    } else if (fileName.endsWith('.pdf')) {
      setMode('word');
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawContent = event.target?.result as string;
        const { title, html, restoredState } = extractTextFromPdfRaw(rawContent);
        if (restoredState) {
          setWordState((prev) => ({
            ...prev,
            ...restoredState,
            title: restoredState.title || file.name.replace(/\.pdf$/i, ''),
          }));
        } else {
          setWordState((prev) => ({
            ...prev,
            title: title || file.name.replace(/\.pdf$/i, ''),
            contentHtml: html || prev.contentHtml,
          }));
        }
        setLastSavedText(`تم استيراد ومعاينة ملف PDF (${file.name}) بنجاح ✓`);
        setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2500);
      };
      reader.readAsBinaryString ? reader.readAsBinaryString(file) : reader.readAsText(file);
    } else {
      setMode('word');
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setWordState((prev) => ({
          ...prev,
          title: file.name,
          contentHtml: content || prev.contentHtml,
        }));
        setLastSavedText(`تم فتح المستند (${file.name}) بنجاح ✓`);
        setTimeout(() => setLastSavedText('محفوظ تلقائياً'), 2500);
      };
      reader.readAsText(file);
    }
  };

  const handleInsertExcelImage = (url: string) => {
    const newImage: SheetImage = {
      id: 'img_' + Date.now(),
      url,
      x: 80,
      y: 50,
      width: 220,
      height: 160,
    };
    setExcelState((prev) => ({
      ...prev,
      sheets: prev.sheets.map((s) => {
        if (s.id === prev.activeSheetId) {
          return {
            ...s,
            images: [...(s.images || []), newImage],
          };
        }
        return s;
      }),
    }));
  };

  const handleUpdateSheetImages = (images: SheetImage[]) => {
    setExcelState((prev) => ({
      ...prev,
      sheets: prev.sheets.map((s) => {
        if (s.id === prev.activeSheetId) {
          return {
            ...s,
            images,
          };
        }
        return s;
      }),
    }));
  };

  // Calculate word & character counts for Word mode
  const cleanWordText = wordState.contentHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = cleanWordText ? cleanWordText.split(/\s+/).length : 0;
  const charCount = cleanWordText.length;

  // Synchronized Unified Paper Dimensions & Page Count for Word mode
  const unifiedWordMetrics = useMemo(() => {
    return calculateUnifiedPaperDimensionsAndScale({
      paperSize: wordState.paperSize,
      orientation: wordState.orientation,
      zoom: wordState.zoom,
      margins: wordState.margins,
      customMargins: wordState.customMargins,
      showHeader: wordState.showHeader !== false,
      showFooter: wordState.showFooter !== false,
      fontSize: wordState.fontSize || 14,
      lineSpacing: wordState.lineSpacing || 1.6,
    });
  }, [
    wordState.paperSize,
    wordState.orientation,
    wordState.zoom,
    wordState.margins,
    wordState.customMargins,
    wordState.showHeader,
    wordState.showFooter,
    wordState.fontSize,
    wordState.lineSpacing,
  ]);

  const unifiedWordPagesCount = useMemo(() => {
    const pages = calculateUnifiedDocumentPages(wordState.contentHtml || '', unifiedWordMetrics);
    return Math.max(1, pages.length);
  }, [wordState.contentHtml, unifiedWordMetrics]);

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors ${isDarkMode ? 'bg-[#0f172a] text-slate-100 dark' : 'bg-slate-100 text-slate-900'}`} dir="rtl">
      {isFullscreen && (
        <div className="absolute top-3 left-3 z-[200] bg-slate-900/90 text-white px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 border border-purple-500 text-xs font-bold animate-in fade-in no-print">
          <span>وضع ملء الشاشة الكامل (Fullscreen)</span>
          <button
            onClick={() => setIsFullscreen(false)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-0.5 rounded text-[11px] font-black transition cursor-pointer"
          >
            خروج ✕
          </button>
        </div>
      )}

      {/* 1. Universal Top Header */}
      {!isFullscreen && (
        <TopHeader
          mode={mode}
          onSelectMode={setMode}
          documentTitle={mode === 'word' ? wordState.title : excelState.title}
          onTitleChange={(newTitle) => {
            if (mode === 'word') {
              setWordState((prev) => ({ ...prev, title: newTitle }));
            } else {
              setExcelState((prev) => ({ ...prev, title: newTitle }));
            }
          }}
          onSave={handleQuickSave}
          onSaveAs={() => setIsSaveAsOpen(true)}
          onPrint={handleOpenPrintPreview}
          onUndo={() => {
            if (mode === 'word') handleExecCommand('undo');
          }}
          onRedo={() => {
            if (mode === 'word') handleExecCommand('redo');
          }}
          canUndo={canUndo}
          canRedo={canRedo}
          onToggleKeyboard={() => setKeyboardState((prev) => ({ ...prev, isOpen: !prev.isOpen }))}
          isKeyboardOpen={keyboardState.isOpen}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isFocusMode={isFocusMode}
          onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onExportDoc={() => exportWordAsDoc(wordState)}
          onExportDocx={() => exportWordAsDocx(wordState)}
          onExportPdf={() => setIsPdfModalOpen(true)}
          onExportHtml={() => exportToHTML(wordState)}
          onExportTxt={() => exportToText(wordState)}
          onExportMd={() => exportToMarkdown(wordState)}
          onExportXlsx={() => exportExcelAsXlsx(excelState.title, excelState.sheets)}
          onExportXls={() => exportExcelAsXls(excelState.title, excelState.sheets)}
          onExportCsv={() => exportToCSV(currentSheet)}
          onOpenLocalDocsModal={() => setIsLocalDocsModalOpen(true)}
          onImportFile={handleImportFile}
          lastSavedText={lastSavedText}
          onOpenSimulator={() => {
            if (mode === 'word') {
              setIsSimulatorOpen(true);
            } else {
              setIsExcelSimulatorOpen(true);
            }
          }}
          onNewDocument={handleNewDocument}
          onOpenDocument={handleOpenDocument}
          onClearDocument={handleClearDocument}
          isReadMode={isReadMode}
          onToggleReadMode={() => setIsReadMode(!isReadMode)}
          onToggleFloatingWindow={handleToggleFloatingWindow}
          onShareDocument={() => setIsShareModalOpen(true)}
          onOpenPermissionsModal={() => setIsAppPermissionsOpen(true)}
        />
      )}

      {/* 2. Ribbon & Command Toolbar for Active Suite Mode - Floating dropdowns above workspace */}
      {!isFullscreen && (
        <div className="relative z-50 overflow-visible">
          {mode === 'word' ? (
          <WordRibbon
            activeTab={wordActiveTab}
            onSelectTab={setWordActiveTab}
            docState={wordState}
            activeHomeMenu={centralActiveHomeMenu}
            setActiveHomeMenu={setCentralActiveHomeMenu}
            onUpdateDoc={handleUpdateWordState}
            onExecCommand={handleExecCommand}
            onInsertTable={handleInsertTable}
            onInsertImage={() => setIsImageModalOpen(true)}
            onInsertShape={handleInsertShape}
            onInsertSymbol={handleInsertSymbol}
            onInsertLine={handleInsertLine}
            onAddNewPage={handleAddNewPage}
            onInsertPageBreak={() => handleAddNewPage('cursor')}
            onInsertLink={handleInsertLink}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onOpenTemplates={() => setIsTemplatesModalOpen(true)}
            onNewDocument={handleNewDocument}
            onOpenDocument={() => {
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              input?.click();
            }}
            onSaveDocument={handleQuickSave}
            onSaveAsDocument={() => setIsSaveAsOpen(true)}
            onExportDoc={() => exportToWordDoc(wordState)}
            onExportPdf={() => setIsPdfModalOpen(true)}
            onPrint={handleOpenPrintPreview}
            onShareDocument={() => setIsShareModalOpen(true)}
            onOpenPermissionsModal={() => setIsAppPermissionsOpen(true)}
            onOpenVoiceTyping={() => setIsVoiceTypingModalOpen(true)}
            onTriggerHeaderEdit={() => {
              setWordState((prev) => ({ ...prev, showHeader: true }));
              setTimeout(() => {
                const headerEl = document.querySelector('[data-header-area="true"] [contenteditable="true"]') as HTMLElement | null;
                if (headerEl) {
                  headerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  headerEl.focus();
                }
              }, 60);
            }}
            onTriggerFooterEdit={() => {
              setWordState((prev) => ({ ...prev, showFooter: true }));
              setTimeout(() => {
                const footerEl = document.querySelector('[data-footer-area="true"] [contenteditable="true"]') as HTMLElement | null;
                if (footerEl) {
                  footerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  footerEl.focus();
                }
              }, 60);
            }}
            onTableAction={(action, value) => {
              setWordLastAction({
                id: Date.now(),
                type: 'table',
                action,
                value
              });
              if (action === 'insertRowBelow' || action === 'insertRowAbove') {
                handleExecCommand('insertHTML', '<tr><td style="border: 1px solid #cbd5e1; padding: 8px;">خلية جديدة</td><td style="border: 1px solid #cbd5e1; padding: 8px;">بيان جديد</td></tr>');
              }
            }}
          />
        ) : (
          <ExcelRibbon
            activeTab={excelActiveTab}
            onSelectTab={setExcelActiveTab}
            selectedCell={selectedCell}
            selectedCellData={currentSheet.data[selectedCell]}
            onUpdateSelectedCell={handleUpdateSelectedCell}
            formulaInput={formulaInput}
            onFormulaInputChange={setFormulaInput}
            onFormulaInputSubmit={handleFormulaInputSubmit}
            onInsertFormula={handleInsertFormula}
            onFreezePanes={handleFreezePanes}
            onInsertRow={handleInsertRow}
            onDeleteRow={handleDeleteRow}
            onInsertCol={handleInsertCol}
            onDeleteCol={handleDeleteCol}
            onClearCell={() => handleUpdateSelectedCell({ value: '', formula: undefined })}
            onExportXlsx={() => exportToExcelXLSX(excelState)}
            onExportCsv={() => setIsCsvModalOpen(true)}
            onExportPdf={() => setIsPdfModalOpen(true)}
            onPrint={handleOpenPrintPreview}
            activeSheet={currentSheet}
            onOpenSimulator={() => setIsExcelSimulatorOpen(true)}
            onApplyTableStyle={handleApplyTableStyle}
            onSortColumn={handleSortColumn}
            onInsertImage={handleInsertExcelImage}
            selectedRange={selectedRange}
            onMergeCells={handleMergeCells}
            onUnmergeCells={handleUnmergeCells}
            isCurrentMerged={isCurrentMerged}
          />
        )}
      </div>
      )}

      {/* 3. Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden relative z-10">
        {mode === 'word' ? (
          <WordEditor
            docState={wordState}
            onUpdateContent={(html) => handleUpdateWordState({ contentHtml: html })}
            editorRef={wordEditorRef}
            onUpdateDoc={handleUpdateWordState}
            lastAction={wordLastAction}
            activeTarget={wordActiveTarget}
            onTargetFocus={(target) => setWordActiveTarget(target)}
            isDarkMode={isDarkMode}
            isReadMode={isReadMode}
            onAddNewPage={handleAddNewPage}
            onInsertPageBreak={() => handleAddNewPage('cursor')}
            onSelectTable={(inTable) => {
              if (inTable && wordActiveTab !== 'table') {
                // Table context active
              }
            }}
          />
        ) : (
          <ExcelGrid
            sheet={currentSheet}
            sheets={excelState.sheets}
            activeSheetId={excelState.activeSheetId}
            onSelectSheet={(id) => setExcelState((prev) => ({ ...prev, activeSheetId: id }))}
            onAddSheet={handleAddSheet}
            onRenameSheet={handleRenameSheet}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
            selectedRange={selectedRange}
            onSelectRange={setSelectedRange}
            onMergeCells={handleMergeCells}
            onUnmergeCells={handleUnmergeCells}
            isCurrentMerged={isCurrentMerged}
            isDarkMode={isDarkMode}
            onUpdateCell={handleUpdateCell}
            onCellDoubleClick={(cellAddr) => {
              setSelectedCell(cellAddr);
              const cell = currentSheet.data[cellAddr];
              setInlineCellValue(cell?.formula || cell?.value || '');
              setIsCellEditing(true);
            }}
            isEditing={isCellEditing}
            setIsEditing={setIsCellEditing}
            inlineValue={inlineCellValue}
            setInlineValue={setInlineCellValue}
            onCommitInlineEdit={handleCommitInlineEdit}
            zoom={excelState.zoom ?? 100}
            onZoomChange={(newZoom) => setExcelState((prev) => ({ ...prev, zoom: newZoom }))}
            onUpdateColWidth={handleUpdateColWidth}
            onUpdateRowHeight={handleUpdateRowHeight}
            onUpdateSheetImages={handleUpdateSheetImages}
            isKeyboardOpen={keyboardState.isOpen}
            onToggleKeyboard={() => setKeyboardState((prev) => ({ ...prev, isOpen: !prev.isOpen }))}
          />
        )}

        {/* 4. Arab Virtual Keyboard */}
        <ArabVirtualKeyboard
          state={keyboardState}
          onUpdateState={(partial) => setKeyboardState((prev) => ({ ...prev, ...partial }))}
          onKeyPress={handleVirtualKeyPress}
          onBackspace={handleVirtualBackspace}
          onEnter={handleVirtualEnter}
          onTab={handleVirtualTab}
          onCommand={handleKeyboardCommand}
          onInsertText={handleInsertFullText}
          mode={mode}
          wordTarget={wordActiveTarget}
          onSelectWordTarget={handleSelectWordTarget}
          selectedCell={selectedCell}
        />
      </main>

      {/* 5. Bottom Status Bar (Word Mode - Merged directly to 0.5cm) */}
      {mode === 'word' && (
        <StatusBar
          mode={mode}
          wordCount={wordCount}
          charCount={charCount}
          rawText={cleanWordText}
          selectedCell={selectedCell}
          zoom={wordState.zoom}
          onZoomChange={(newZoom) => {
            handleUpdateWordState({ zoom: newZoom });
          }}
          isKeyboardOpen={keyboardState.isOpen}
          onToggleKeyboard={() => setKeyboardState((prev) => ({ ...prev, isOpen: !prev.isOpen }))}
          isReadingMode={wordState.isReadingMode}
          onToggleReadingMode={() => handleUpdateWordState({ isReadingMode: !wordState.isReadingMode })}
          onAddPageBreak={() => {
            const pageBreakHtml = createPageBreakHtml();
            handleUpdateWordState({ contentHtml: wordState.contentHtml + pageBreakHtml });
          }}
          viewLayoutMode={wordState.viewLayoutMode || 'paginated'}
          onToggleViewLayoutMode={() => handleUpdateWordState({ viewLayoutMode: wordState.viewLayoutMode === 'paginated' ? 'continuous' : 'paginated' })}
          paperSize={wordState.paperSize}
          pageCount={unifiedWordPagesCount}
          syncStatus={syncStatus}
          onSyncNow={handleSyncNow}
        />
      )}

      {/* 6. Comprehensive Word & Document Simulator Modal */}
      <DocumentSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        docState={wordState}
        onUpdateDoc={handleUpdateWordState}
        onSave={() => {
          localStorage.setItem('office_word_state', JSON.stringify(wordState));
          setLastSavedText('تم الحفظ ✓');
        }}
        onPrint={handlePrintDocument}
        onExportDoc={() => exportToWordDoc(wordState)}
        onExportPdf={handlePrintDocument}
        onExportHtml={() => exportToHTML(wordState)}
        onExportTxt={() => exportToText(wordState)}
      />

      {/* 7. Comprehensive Excel Simulator & Table/Cell Control Modal */}
      <ExcelSimulatorModal
        isOpen={isExcelSimulatorOpen}
        onClose={() => setIsExcelSimulatorOpen(false)}
        excelState={excelState}
        onUpdateExcelState={setExcelState}
        activeSheet={currentSheet}
        selectedCell={selectedCell}
        onSelectCell={setSelectedCell}
        onUpdateCell={handleUpdateCell}
        onInsertRow={handleInsertRow}
        onDeleteRow={handleDeleteRow}
        onInsertCol={handleInsertCol}
        onDeleteCol={handleDeleteCol}
        onFreezePanes={handleFreezePanes}
        onExportXlsx={() => exportToExcelXLSX(excelState)}
        onExportCsv={() => exportToCSV(currentSheet)}
        onPrint={handlePrintDocument}
      />

      {/* 8. Save As & Format Export Modal (.docx, .doc, .xlsx, .xls, .pdf, etc.) */}
      <SaveAsModal
        isOpen={isSaveAsOpen}
        onClose={() => setIsSaveAsOpen(false)}
        mode={mode}
        wordState={wordState}
        excelState={{
          title: excelState.title,
          sheets: excelState.sheets,
        }}
        onUpdateTitle={(newTitle) => {
          if (mode === 'word') {
            setWordState((prev) => ({ ...prev, title: newTitle }));
          } else {
            setExcelState((prev) => ({ ...prev, title: newTitle }));
          }
        }}
        onQuickSave={handleQuickSave}
        onOpenPrintPreview={() => setIsPrintPreviewOpen(true)}
      />

      {/* Advanced CSV Export Modal */}
      <CsvExportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        excelState={excelState}
        activeSheet={currentSheet}
      />

      {/* 9. Direct PDF Export Modal with Page Settings (Margins, Orientation, Paper Size) */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        documentTitle={(mode === 'word' ? wordState.title : excelState.title).replace(/\.[^/.]+$/, '')}
        type={mode}
        onExport={handleExportPdfWithOptions}
        onPrintDirect={handlePrintDocument}
        wordState={mode === 'word' ? wordState : undefined}
      />

      {/* 10. Print Preview Modal (معاينة قبل الطباعة مع تعديل الهوامش وحجم الورق والاتجاه فورياً) */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        mode={mode}
        wordState={wordState}
        onUpdateWordState={handleUpdateWordState}
        activeSheet={currentSheet}
        excelTitle={excelState.title}
        onClose={() => setIsPrintPreviewOpen(false)}
        onPrint={() => {
          if (mode === 'word') {
            printWordDocument(wordState);
          } else {
            printExcelDocument(excelState.title, currentSheet);
          }
        }}
        onExportPdf={handleExportPdfWithOptions}
      />

      {/* Image Insert & Formatting Modal */}
      <ImageInsertModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsertImageHtml={(html) => handleExecCommand('insertHTML', html)}
      />

      {/* New Document Modal (إنشاء مستند وورد أو إكسل جديد مع قوالب وإعدادات متقدمة) */}
      <NewDocumentModal
        isOpen={isNewDocumentModalOpen}
        onClose={() => setIsNewDocumentModalOpen(false)}
        currentMode={mode}
        hasUnsavedChanges={false}
        onSaveCurrentDocument={handleQuickSave}
        onCreateWordDoc={handleCreateWordDocFromModal}
        onCreateExcelDoc={handleCreateExcelDocFromModal}
      />

      {/* Voice Typing / Speech-to-Text Modal */}
      <VoiceTypingModal
        isOpen={isVoiceTypingModalOpen}
        onClose={() => setIsVoiceTypingModalOpen(false)}
        onInsertText={handleInsertVoiceText}
      />

      {/* Document Templates Library Modal */}
      <DocumentTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onApplyTemplate={(partial) => handleUpdateWordState(partial)}
      />

      {/* Local Storage Documents Manager Modal */}
      <LocalDocumentsModal
        isOpen={isLocalDocsModalOpen}
        onClose={() => setIsLocalDocsModalOpen(false)}
        activeMode={mode}
        currentWordState={wordState}
        currentExcelState={excelState}
        onLoadWordDoc={(doc) => {
          setWordState(doc);
          setMode('word');
        }}
        onLoadExcelDoc={(excel) => {
          setExcelState(excel);
          setMode('excel');
        }}
        onSaveCurrentToLocal={handleQuickSave}
      />

      {/* PDF Preview & Reader Modal */}
      <PdfPreviewModal
        isOpen={isPdfPreviewReaderOpen}
        onClose={() => setIsPdfPreviewReaderOpen(false)}
        documentTitle={(mode === 'word' ? wordState.title : excelState.title).replace(/\.[^/.]+$/, '')}
        mode={mode}
        wordState={wordState}
        excelSheets={excelState.sheets}
      />

      {/* App Permissions & Storage Settings Modal */}
      <AppPermissionsModal
        isOpen={isAppPermissionsOpen}
        onClose={() => setIsAppPermissionsOpen(false)}
        onToast={showToast}
      />

      {/* Share Document Modal (واتساب، بلوتوث، وتطبيقات النظام ومسار أندرويد المعتمد) */}
      <ShareDocumentModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        mode={mode}
        wordState={wordState}
        excelState={excelState}
        activeSheet={currentSheet}
        onToast={showToast}
      />

      {/* Advanced Document Statistics Dashboard Modal */}
      <DocumentStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        title={wordState.title}
        contentHtml={wordState.contentHtml}
      />

      {/* Enhanced Full-Screen Focus Mode Modal */}
      <WordFocusModeModal
        isOpen={isFocusMode}
        onClose={() => setIsFocusMode(false)}
        wordState={wordState}
        onUpdateContent={(html) => handleUpdateWordState({ contentHtml: html })}
        onUpdateSettings={(settings) => handleUpdateWordState(settings)}
      />

      {/* Elegantly Designed Floating Toast Notification for Auto/Manual Save */}
      {toastInfo.show && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/60 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs pointer-events-auto transition-all transform animate-fade-in">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-emerald-200 flex items-center gap-1.5">
                <span>{toastInfo.message}</span>
                <span className="text-[10px] bg-emerald-600/30 text-emerald-300 px-1.5 py-0.2 rounded-full font-mono">
                  تم بنجاح ✓
                </span>
              </div>
              <div className="text-[10px] text-slate-300 flex items-center gap-3 mt-0.5 font-mono">
                {(toastInfo.location === 'local' || toastInfo.location === 'both') && (
                  <span className="flex items-center gap-1 text-blue-300">
                    <HardDrive className="w-3 h-3" /> Local Storage (التخزين المحلي)
                  </span>
                )}
                {(toastInfo.location === 'cloud' || toastInfo.location === 'both') && (
                  <span className="flex items-center gap-1 text-teal-300">
                    <Cloud className="w-3 h-3" /> Cloud Storage (السحابة)
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setToastInfo((prev) => ({ ...prev, show: false }))}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
