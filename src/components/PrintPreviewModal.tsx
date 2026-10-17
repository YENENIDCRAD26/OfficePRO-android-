import React, { useState, useMemo, useEffect } from 'react';
import { 
  Printer, 
  ChevronRight, 
  ChevronLeft, 
  ZoomIn, 
  ZoomOut, 
  X, 
  Maximize2,
  Minimize2,
  FileText,
  Settings2,
  Download,
  Check,
  Sliders,
  Eye,
  RotateCw,
  Palette,
  Layers,
  LayoutGrid,
  CheckCircle2,
  FileCheck,
  Sparkles,
  Table,
  Camera,
  Folder,
  Smartphone,
  HardDrive,
  Settings,
  Share2
} from 'lucide-react';
import { ScreenshotPreviewModal } from './ScreenshotPreviewModal';
import { FolderManagerModal } from './FolderManagerModal';
import { 
  captureElementScreenshot300Dpi, 
  downloadBlob, 
  generateWordPdfBlob, 
  generateExcelPdfBlob, 
  shareDocument 
} from '../utils/fileHandlers';
import { AppMode, WordDocumentState, ExcelSheet, PdfExportOptions } from '../types';
import { customDocumentPrintHandler } from '../utils/printHandler';
import { parseCellAddress, colIndexToLetter, evaluateFormula, getExcelUsedRange, formatCellValue } from '../utils/excelCalculations';
import { 
  calculateUnifiedPaperDimensionsAndScale, 
  calculateUnifiedDocumentPages, 
  normalizePaperSize,
  formatPaperDimensionsLabel,
  UNIFIED_PAPER_SIZES,
  UnifiedPaperMetrics
} from '../utils/paperDimensions';

function parsePageRangeString(rangeStr: string, totalPages: number): number[] {
  const result = new Set<number>();
  const parts = rangeStr.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          if (i >= 1 && i <= totalPages) {
            result.add(i);
          }
        }
      }
    } else {
      const pageNum = parseInt(trimmed, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        result.add(pageNum);
      }
    }
  }
  return Array.from(result).sort((a, b) => a - b);
}

export interface PaperSpecification {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  description: string;
  badge?: string;
}

export const PAPER_SIZES: PaperSpecification[] = [
  {
    id: 'A4',
    name: 'A4: 210 × 297 مم',
    widthMm: 210,
    heightMm: 297,
    description: 'الحجم العادي للمستندات والخطابات والتقارير اليومية',
    badge: 'القياسي'
  },
  {
    id: 'A3',
    name: 'A3: 297 × 420 مم',
    widthMm: 297,
    heightMm: 420,
    description: 'يُستخدم للمخططات والجداول الكبيرة واللوحات الرسمية',
    badge: 'كبير'
  },
  {
    id: 'A5',
    name: 'A5: 148 × 210 مم',
    widthMm: 148,
    heightMm: 210,
    description: 'يُستخدم للكتيبات والدفاتر والمذكرات الرسمية',
    badge: 'كتيب'
  },
  {
    id: 'A6',
    name: 'A6: 105 × 148 مم',
    widthMm: 105,
    heightMm: 148,
    description: 'يُستخدم للبطاقات البريدية والملاحظات الشخصية',
    badge: 'بطاقة'
  },
  {
    id: 'Letter',
    name: 'Letter (رسالة): 216 × 279 مم',
    widthMm: 216,
    heightMm: 279,
    description: 'شائع جداً في طابعات أمريكا الشمالية (8.5 × 11 بوصة)',
    badge: 'أمريكي'
  },
  {
    id: 'Legal',
    name: 'Legal (قانوني): 216 × 356 مم',
    widthMm: 216,
    heightMm: 356,
    description: 'يُستخدم للعقود والمستندات القانونية الطويلة',
    badge: 'عقود'
  },
  {
    id: 'Executive',
    name: 'Executive: 184 × 267 مم',
    widthMm: 184,
    heightMm: 267,
    description: 'يُستخدم للتقارير التنفيذية والمراسلات الرسمية',
  }
];

export interface MarginPreset {
  id: string;
  name: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
  desc: string;
}

export const MARGIN_PRESETS: MarginPreset[] = [
  { id: 'normal', name: 'عادي (Normal)', top: 2.54, bottom: 2.54, left: 2.54, right: 2.54, desc: '2.54 سم من كل الجهات' },
  { id: 'narrow', name: 'ضيق (Narrow)', top: 1.27, bottom: 1.27, left: 1.27, right: 1.27, desc: '1.27 سم لمحتوى أكبر' },
  { id: 'moderate', name: 'متوسط (Moderate)', top: 2.54, bottom: 2.54, left: 1.9, right: 1.9, desc: 'علوي 2.54 | جانبي 1.9 سم' },
  { id: 'wide', name: 'عريض (Wide)', top: 2.54, bottom: 2.54, left: 3.81, right: 3.81, desc: 'علوي 2.54 | جانبي 3.81 سم' },
  { id: 'minimum', name: 'الحد الأدنى (Minimum)', top: 0.5, bottom: 0.5, left: 0.5, right: 0.5, desc: '0.5 سم لأقصى مساحة' },
];

export interface PrinterDevice {
  id: string;
  name: string;
  type: 'system' | 'pdf' | 'network' | 'usb';
  status: string;
  isDefault?: boolean;
}

const PRINTERS_LIST: PrinterDevice[] = [
  { id: 'system_default', name: 'طابعة النظام الافتراضية (System Printer)', type: 'system', status: 'جاهزة للطباعة 🟢', isDefault: true },
  { id: 'pdf_printer', name: 'حفظ كملف PDF (Microsoft / Adobe PDF)', type: 'pdf', status: 'تصدير وحفظ فوري 📄' },
  { id: 'laserjet_pro', name: 'HP LaserJet Pro MFP M428 (شبكة مكتبية)', type: 'network', status: 'متصلة وجاهزة 🟢' },
  { id: 'canon_pixma', name: 'Canon PIXMA Office Series (ألوان عالية الدقة)', type: 'network', status: 'متصلة وجاهزة 🟢' },
  { id: 'epson_ecotank', name: 'Epson EcoTank L3250 (طابعة خزان حبر)', type: 'usb', status: 'جاهزة للطباعة 🟢' },
];

interface PrintPreviewModalProps {
  isOpen: boolean;
  mode: AppMode;
  wordState?: WordDocumentState;
  onUpdateWordState?: (partial: Partial<WordDocumentState>) => void;
  activeSheet?: ExcelSheet;
  excelTitle?: string;
  onClose: () => void;
  onPrint?: () => void;
  onExportPdf?: (options: PdfExportOptions, filename: string) => Promise<void>;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  mode,
  wordState,
  onUpdateWordState,
  activeSheet,
  excelTitle = 'جدول بيانات إكسل',
  onClose,
  onPrint,
  onExportPdf,
}) => {
  // Navigation tabs in sidebar
  const [activeSidebarTab, setActiveSidebarTab] = useState<'printer' | 'layout'>('printer');

  // View Mode: Single page vs Full Document
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');

  // Layout states editable directly inside preview
  const [paperSizeId, setPaperSizeId] = useState<string>(wordState?.paperSize || 'A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    mode === 'excel' ? 'landscape' : (wordState?.orientation || 'portrait')
  );
  const [excelFitMode, setExcelFitMode] = useState<'fit-columns' | 'fit-sheet' | 'normal'>('fit-columns');
  const [showGridlines, setShowGridlines] = useState<boolean>(true);
  const [repeatHeaderRow, setRepeatHeaderRow] = useState<boolean>(true);
  const [marginPresetId, setMarginPresetId] = useState<string>(
    wordState?.margins === 'custom' ? 'custom' : (wordState?.margins || 'normal')
  );
  const [customMargins, setCustomMargins] = useState<{ top: number; bottom: number; left: number; right: number }>({
    top: wordState?.customMargins?.top ?? 2.54,
    bottom: wordState?.customMargins?.bottom ?? 2.54,
    left: wordState?.customMargins?.left ?? 2.54,
    right: wordState?.customMargins?.right ?? 2.54,
  });

  const [showHeader, setShowHeader] = useState<boolean>(wordState?.showHeader ?? true);
  const [showFooter, setShowFooter] = useState<boolean>(wordState?.showFooter ?? true);
  const [headerText, setHeaderText] = useState<string>(wordState?.headerText || wordState?.title || 'عنوان المستند');
  const [footerText, setFooterText] = useState<string>(wordState?.footerText || 'صفحة [رقم] - محرر المستندات PRO');
  const [pageBgColor, setPageBgColor] = useState<string>(wordState?.pageBgColor || '#ffffff');
  const [multiPageLayout, setMultiPageLayout] = useState<'normal' | 'booklet' | 'brochure' | 'two-up'>('normal');

  // Printer Settings ("تحديد الطابعة")
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>('system_default');
  const [copies, setCopies] = useState<number>(1);
  const [pageRangeMode, setPageRangeMode] = useState<'all' | 'current' | 'custom'>('all');
  const [customPageRange, setCustomPageRange] = useState<string>('1');
  const [colorMode, setColorMode] = useState<'color' | 'grayscale'>('color');
  const [printQuality, setPrintQuality] = useState<'high' | 'normal' | 'draft'>('high');
  const [duplexMode, setDuplexMode] = useState<'single' | 'duplex'>('single');

  // Preview viewing controls
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(85);
  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(true);
  const [showSettingsSidebar, setShowSettingsSidebar] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [appliedNotification, setAppliedNotification] = useState<boolean>(false);

  // Preview page screenshot states (لقطة شاشة الصفحة المعاينة بدقة 300 DPI)
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null);
  const [isScreenshotPreviewOpen, setIsScreenshotPreviewOpen] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [screenshotToast, setScreenshotToast] = useState<string | null>(null);

  // Storage Location & Folder Selection states (تحديد واختيار مجلد الحفظ في وحدة التخزين أو SD)
  const [storageType, setStorageType] = useState<'internal' | 'sd'>(() => {
    try {
      return (localStorage.getItem('office_save_storage_type') as 'internal' | 'sd') || 'internal';
    } catch {
      return 'internal';
    }
  });
  const [activeFolder, setActiveFolder] = useState<string>(() => {
    try {
      return localStorage.getItem('office_save_active_folder') || 'مجلد التنزيلات (Download)';
    } catch {
      return 'مجلد التنزيلات (Download)';
    }
  });
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState<boolean>(false);

  const handleSelectSaveDestination = (folderName: string, storage: 'internal' | 'sd') => {
    setActiveFolder(folderName);
    setStorageType(storage);
    try {
      localStorage.setItem('office_save_active_folder', folderName);
      localStorage.setItem('office_save_storage_type', storage);
    } catch {}
    setScreenshotToast(`تم تحديد مجلد الحفظ: ${folderName} (${storage === 'internal' ? 'وحدة التخزين الداخلية 📱' : 'بطاقة الذاكرة SD 💾'}) ✓`);
    setTimeout(() => setScreenshotToast(null), 3000);
  };

  // Capture current preview sheet cleanly at 300 DPI
  const handleCapturePreviewScreenshot = async () => {
    setIsCapturingScreenshot(true);
    setScreenshotToast('جاري التقاط لقطة شاشة الصفحة بدقة 300 نقطة في البوصة...');
    try {
      const target = document.getElementById('print-preview-rendered-sheet');
      if (!target) {
        throw new Error('Preview sheet element not found');
      }

      const res = await captureElementScreenshot300Dpi(target, { format: 'png' });
      setScreenshotDataUrl(res.dataUrl);
      setScreenshotBlob(res.blob);
      setIsScreenshotPreviewOpen(true);
      setScreenshotToast('تم التقاط لقطة الشاشة بدقة 300 DPI مقصوصة تماماً على مقاس الورقة بنجاح ✓');
    } catch (e) {
      console.error('Failed to capture preview sheet screenshot', e);
      setScreenshotToast('تعذر التقاط لقطة الشاشة، يرجى إعادة المحاولة');
    } finally {
      setIsCapturingScreenshot(false);
      setTimeout(() => setScreenshotToast(null), 3000);
    }
  };

  // Instant direct PNG download (300 DPI)
  const handleDirectPngSave = async () => {
    try {
      setScreenshotToast('جاري تنزيل صورة PNG فائقة النقاء (300 DPI)...');
      const target = document.getElementById('print-preview-rendered-sheet');
      if (target) {
        const res = await captureElementScreenshot300Dpi(target, { format: 'png' });
        const docTitle = (mode === 'word' ? wordState?.title : excelTitle) || 'مستند';
        const cleanName = docTitle.replace(/\.[^/.]+$/, '');
        downloadBlob(res.blob, `${cleanName}_صفحة_${currentPage}_300dpi.png`);
        setScreenshotToast('تم تنزيل صفحة المعاينة كصورة PNG فائقة النقاء بنجاح ✓');
      }
    } catch (e) {
      console.error(e);
      setScreenshotToast('حدث خطأ أثناء تنزيل PNG');
    } finally {
      setTimeout(() => setScreenshotToast(null), 3000);
    }
  };

  // Instant direct JPG download (Lightweight)
  const handleDirectJpgSave = async () => {
    try {
      setScreenshotToast('جاري تنزيل صورة JPG خفيفة وعالية الوضوح...');
      const target = document.getElementById('print-preview-rendered-sheet');
      if (target) {
        const res = await captureElementScreenshot300Dpi(target, { format: 'jpeg', quality: 0.95 });
        const docTitle = (mode === 'word' ? wordState?.title : excelTitle) || 'مستند';
        const cleanName = docTitle.replace(/\.[^/.]+$/, '');
        downloadBlob(res.blob, `${cleanName}_صفحة_${currentPage}.jpg`);
        setScreenshotToast('تم تنزيل صفحة المعاينة كصورة JPG خفيفة بنجاح ✓');
      }
    } catch (e) {
      console.error(e);
      setScreenshotToast('حدث خطأ أثناء تنزيل JPG');
    } finally {
      setTimeout(() => setScreenshotToast(null), 3000);
    }
  };

  // Synchronize when modal opens or document changes
  useEffect(() => {
    if (isOpen && wordState) {
      setPaperSizeId(wordState.paperSize || 'A4');
      setOrientation(wordState.orientation || 'portrait');
      setMarginPresetId(wordState.margins === 'custom' ? 'custom' : (wordState.margins || 'normal'));
      if (wordState.customMargins) {
        setCustomMargins(wordState.customMargins);
      }
      setShowHeader(wordState.showHeader !== false);
      setShowFooter(wordState.showFooter !== false);
      setHeaderText(wordState.headerText || wordState.title || 'عنوان المستند');
      setFooterText(wordState.footerText || 'محرر Word & Excel الاحترافي');
      setPageBgColor(wordState.pageBgColor || '#ffffff');
    }
  }, [isOpen, wordState]);

  // Unified mathematical calculation of dimensions, scale, margins, and capacity
  const unifiedPaperMetrics = useMemo(() => {
    return calculateUnifiedPaperDimensionsAndScale({
      paperSize: paperSizeId,
      orientation,
      zoom,
      margins: marginPresetId,
      customMargins,
      showHeader,
      showFooter,
      fontSize: wordState?.fontSize || 14,
      lineSpacing: wordState?.lineSpacing || 1.6,
    });
  }, [
    paperSizeId,
    orientation,
    zoom,
    marginPresetId,
    customMargins,
    showHeader,
    showFooter,
    wordState?.fontSize,
    wordState?.lineSpacing,
  ]);

  // Current active paper spec from unified system
  const currentPaper = useMemo(() => {
    return PAPER_SIZES.find((p) => p.id.toLowerCase() === paperSizeId.toLowerCase()) || PAPER_SIZES[0];
  }, [paperSizeId]);

  // Effective Margins in Centimeters from unified metrics
  const effectiveMargins = unifiedPaperMetrics.marginsCm;

  // Multi-page content slices for Word mode - uses unified calculation for 100% parity with WordEditor & PDF Export
  const pageContents = useMemo(() => {
    if (mode !== 'word' || !wordState) return [wordState?.contentHtml || ''];
    return calculateUnifiedDocumentPages(wordState.contentHtml || '', unifiedPaperMetrics);
  }, [mode, wordState, unifiedPaperMetrics]);

  // Compute total pages estimate
  const totalPages = useMemo(() => {
    if (mode === 'word') {
      return Math.max(1, pageContents.length);
    }
    if (mode === 'excel' && activeSheet) {
      const used = getExcelUsedRange(activeSheet);
      if (excelFitMode === 'fit-sheet' || used.totalRows <= (orientation === 'landscape' ? 18 : 25)) return 1;
      const rowsPerPage = orientation === 'portrait' ? (paperSizeId === 'A3' ? 42 : 24) : 16;
      return Math.max(1, Math.ceil(used.totalRows / rowsPerPage));
    }
    return 1;
  }, [mode, pageContents.length, activeSheet, orientation, paperSizeId, excelFitMode]);

  if (!isOpen) return null;

  const isPortrait = orientation === 'portrait';

  // Paper dimensions in millimeters from unified metrics
  const paperWidthMm = unifiedPaperMetrics.widthMm;
  const paperHeightMm = unifiedPaperMetrics.heightMm;

  // Apply layout changes back to document
  const handleApplyToDocument = () => {
    if (onUpdateWordState && mode === 'word') {
      onUpdateWordState({
        paperSize: paperSizeId as any,
        orientation,
        margins: marginPresetId === 'custom' ? 'custom' : (marginPresetId as any),
        customMargins: effectiveMargins,
        showHeader,
        showFooter,
        headerText,
        footerText,
        pageBgColor,
      });
      setAppliedNotification(true);
      setTimeout(() => setAppliedNotification(false), 2500);
    }
  };

  // Direct print action
  const handleExecutePrint = () => {
    handleApplyToDocument();

    // If PDF printer selected, route directly to PDF export
    if (selectedPrinterId === 'pdf_printer') {
      handleExecuteExportPdf();
      return;
    }

    if (onPrint) {
      onPrint();
      return;
    }

    if (wordState) {
      let htmlToPrint = wordState.contentHtml;
      if (pageRangeMode === 'current') {
        htmlToPrint = pageContents[currentPage - 1] || pageContents[0] || wordState.contentHtml;
      } else if (pageRangeMode === 'custom' && customPageRange) {
        const selectedIndices = parsePageRangeString(customPageRange, pageContents.length);
        if (selectedIndices.length > 0) {
          htmlToPrint = selectedIndices.map(idx => pageContents[idx - 1]).filter(Boolean).join('<div class="word-page-break" data-page-break="true"></div>');
        }
      }

      customDocumentPrintHandler({
        ...wordState,
        contentHtml: htmlToPrint,
      }, {
        paperSize: paperSizeId,
        orientation,
        customMargins: effectiveMargins,
        colorMode,
        showHeader,
        showFooter,
        headerText,
        footerText,
        watermarkText: wordState.watermarkText,
        currentPage,
        totalPages: pageRangeMode === 'current' ? 1 : totalPages,
        copies,
        pageRangeMode,
        customPageRange,
        duplexMode,
      });
      return;
    }
  };

  // Direct PDF Export from Preview
  const handleExecuteExportPdf = async () => {
    setIsExporting(true);
    handleApplyToDocument();
    try {
      if (onExportPdf) {
        const options: PdfExportOptions = {
          orientation,
          margins: (marginPresetId === 'custom' ? 'normal' : marginPresetId) as any,
          paperSize: (paperSizeId.toLowerCase() as any),
          includeHeaderFooter: showHeader || showFooter,
          excelFitMode,
          showGridlines,
          repeatHeaderRow,
          multiPageLayout,
        };
        const title = (mode === 'word' ? (wordState?.title || 'مستند') : excelTitle).replace(/\.[^/.]+$/, '');
        await onExportPdf(options, `${title}_معاينة_طباعة`);
      } else {
        handleExecutePrint();
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Direct PDF Share Action (واتساب، بلوتوث، لوحة مشاركة أندرويد)
  const handleSharePdfNow = async () => {
    setIsExporting(true);
    handleApplyToDocument();
    try {
      const options: PdfExportOptions = {
        orientation,
        margins: (marginPresetId === 'custom' ? 'normal' : marginPresetId) as any,
        paperSize: (paperSizeId.toLowerCase() as any),
        includeHeaderFooter: showHeader || showFooter,
        excelFitMode,
        showGridlines,
        repeatHeaderRow,
        multiPageLayout,
      };
      const title = (mode === 'word' ? (wordState?.title || 'مستند') : excelTitle).replace(/\.[^/.]+$/, '');
      const filename = `${title}_معاينة_طباعة.pdf`;
      let blob: Blob;
      if (mode === 'word' && wordState) {
        blob = await generateWordPdfBlob(wordState, options);
      } else {
        blob = await generateExcelPdfBlob(excelTitle, activeSheet, options);
      }
      await shareDocument(blob, filename, `مشاركة مستند PDF: ${filename}`);
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.error('Share PDF error:', e);
      }
    } finally {
      setIsExporting(false);
    }
  };


  // Border styles for page sheet
  const getPreviewBorderStyles = (): React.CSSProperties => {
    if (!wordState?.showBorders || wordState.borderStyle === 'none') {
      return {};
    }
    const color = wordState.borderColor || '#1e3a8a';
    const width = wordState.borderWidth || 2;
    switch (wordState.borderStyle) {
      case 'double':
        return { border: `${Math.max(width, 3)}px double ${color}` };
      case 'dashed':
        return { border: `${Math.max(width, 2)}px dashed ${color}` };
      case 'gold':
        return { border: `${Math.max(width, 3)}px solid #b45309`, outline: '2px solid #fde047', outlineOffset: '-5px' };
      case 'islamic':
        return { border: `${Math.max(width, 3)}px solid #065f46`, outline: '2px dashed #10b981', outlineOffset: '-5px' };
      default:
        return { border: `${width}px solid ${color}` };
    }
  };

  // Render content of specific page
  const renderDocumentPageContent = (pageIdx: number) => {
    if (mode === 'word' && wordState) {
      const pageHtml = pageContents[pageIdx] || pageContents[0] || wordState.contentHtml;
      return (
        <div 
          className="prose max-w-none text-right font-sans leading-relaxed break-words"
          style={{
            fontFamily: wordState.fontFamily || 'Cairo, sans-serif',
            fontSize: `${wordState.fontSize || 13}pt`,
            lineHeight: wordState.lineSpacing || 1.6,
            direction: wordState.direction || 'rtl',
            color: wordState.textColor || '#000000',
          }}
          dangerouslySetInnerHTML={{ __html: pageHtml }}
        />
      );
    }

    if (mode === 'excel' && activeSheet) {
      const usedRange = getExcelUsedRange(activeSheet);
      const { minRow, maxRow, cols, totalCols, totalRows } = usedRange;

      const rowsPerPage = (excelFitMode === 'fit-sheet' || totalRows <= (orientation === 'landscape' ? 18 : 25))
        ? totalRows
        : (orientation === 'portrait' ? (paperSizeId === 'A3' ? 42 : 24) : 16);
      
      const startRow = minRow + pageIdx * rowsPerPage;
      const endRow = Math.min(maxRow, startRow + rowsPerPage - 1);
      const rowCountThisPage = Math.max(1, endRow - startRow + 1);

      // Typography scaling based on columns and fitMode
      const fontSizeStyle = totalCols > 12 
        ? '7.5pt' 
        : totalCols > 8 
        ? '8.5pt' 
        : totalCols <= 5
        ? '10.5pt'
        : '9.5pt';

      const cellPadding = totalCols > 12 ? '3px 4px' : '5px 8px';

      return (
        <div className="overflow-hidden flex flex-col h-full justify-between">
          <div>
            <div className="mb-2.5 border-b-2 border-emerald-600 pb-1.5 flex justify-between items-baseline">
              <div>
                <h1 className="text-sm font-bold text-slate-900">{excelTitle}</h1>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ورقة: {activeSheet.name} (صفحة {pageIdx + 1} من {totalPages})
                </span>
              </div>
              <div className="text-[9.5px] font-mono text-slate-500 flex items-center gap-2">
                <span>{orientation === 'landscape' ? 'أفقي ↔' : 'عمودي ↕'}</span>
                <span className="bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                  {excelFitMode === 'fit-columns' ? 'تناسب الأعمدة 🎯' : excelFitMode === 'fit-sheet' ? 'ملاءمة الورقة 📄' : 'الحجم الطبيعي 📏'}
                </span>
              </div>
            </div>

            <table 
              className={`w-full border-collapse text-right border ${showGridlines ? 'border-slate-300' : 'border-transparent'}`}
              style={{ fontSize: fontSizeStyle }}
            >
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className={`p-1.5 border-l ${showGridlines ? 'border-slate-300' : 'border-transparent'} w-8 text-center font-mono text-slate-600 font-bold bg-slate-200/80`}>#</th>
                  {cols.map((col) => (
                    <th key={col} className={`p-1.5 border-l ${showGridlines ? 'border-slate-300' : 'border-transparent'} font-bold text-slate-800 bg-slate-50 text-center`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rowCountThisPage }).map((_, rIdx) => {
                  const rowNum = startRow + rIdx;
                  return (
                    <tr key={rowNum} className={`border-b ${showGridlines ? 'border-slate-200' : 'border-transparent'} hover:bg-slate-50`}>
                      <td className={`p-1 border-l ${showGridlines ? 'border-slate-300' : 'border-transparent'} text-center font-mono text-slate-500 bg-slate-50 text-[8pt]`}>
                        {rowNum}
                      </td>
                      {cols.map((col) => {
                        const cell = activeSheet.data[`${col}${rowNum}`];
                        let val = '';
                        if (cell) {
                          if (cell.formula && cell.formula.startsWith('=')) {
                            val = evaluateFormula(cell.formula, activeSheet.data);
                          } else {
                            val = cell.formattedValue ?? cell.value ?? '';
                          }
                          if (cell.format && cell.format !== 'general' && val) {
                            val = formatCellValue(val, cell.format);
                          }
                        }
                        return (
                          <td 
                            key={col} 
                            className={`border-l ${showGridlines ? 'border-slate-200' : 'border-transparent'}`}
                            style={{
                              padding: cellPadding,
                              fontWeight: cell?.bold ? 'bold' : 'normal',
                              fontStyle: cell?.italic ? 'italic' : 'normal',
                              textDecoration: cell?.underline ? 'underline' : 'none',
                              backgroundColor: cell?.bg,
                              color: cell?.color || '#000000',
                              textAlign: (cell?.align as any) || 'right',
                              whiteSpace: 'normal',
                              wordBreak: 'normal',
                              overflowWrap: 'break-word',
                              lineHeight: 1.45,
                            }}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
            <span>DOCX&XLSX-Editor</span>
            <span>صفحة {pageIdx + 1} من {totalPages}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 select-none animate-in fade-in overflow-hidden ${isFullscreen ? 'p-0' : ''}`}
      dir="rtl"
    >
      {/* 1. Top Unified Header & Actions Bar with Horizontal Scroll Support */}
      <header className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between shrink-0 shadow-md overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 gap-3 min-w-0">
        {/* Right Section: Branding & Document Info */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-900/40 shrink-0">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xs font-black text-white whitespace-nowrap">
                معاينة قبل الطباعة وإعدادات الطابعة والتصدير
              </h1>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                <span>جاهز 100%</span>
              </span>
              <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                {paperWidthMm} × {paperHeightMm} مم
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-sm">
              {mode === 'word' ? wordState?.title : excelTitle}
            </p>
          </div>
        </div>

        {/* Center: View Mode Switcher, Pagination & Zoom Bar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Switcher: Single Page vs All Pages */}
          <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 text-xs border border-slate-700 shrink-0">
            <button
              onClick={() => setViewMode('single')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition text-xs whitespace-nowrap ${
                viewMode === 'single'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="معاينة الصفحة الحالية بتكبير دقيق"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>معاينة صفحة</span>
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition text-xs whitespace-nowrap ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="معاينة كافة صفحات المستند بالكامل"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>كافة الصفحات ({totalPages})</span>
            </button>
          </div>

          {/* Pagination (for Single Page mode) */}
          {viewMode === 'single' && (
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 text-xs border border-slate-700 shrink-0">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                title="الصفحة السابقة"
                className="p-1 text-slate-300 hover:text-white disabled:opacity-30 rounded hover:bg-slate-700 transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-bold text-slate-200 text-[11px] whitespace-nowrap">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                title="الصفحة التالية"
                className="p-1 text-slate-300 hover:text-white disabled:opacity-30 rounded hover:bg-slate-700 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Zoom Bar */}
          <div className="flex items-center gap-1 bg-slate-800/90 rounded-lg px-1.5 py-0.5 text-xs border border-slate-700 shrink-0">
            <button
              onClick={() => setZoom((z) => Math.max(30, z - 10))}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
              title="تصغير المعاينة"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="font-mono font-bold text-slate-200 w-9 text-center text-[11px]">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(160, z + 10))}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
              title="تكبير المعاينة"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <div className="w-px h-3 bg-slate-700 mx-0.5" />
            <button
              onClick={() => setZoom(viewMode === 'all' ? 45 : 85)}
              className="px-1.5 py-0.5 rounded text-[10px] text-slate-300 hover:text-white hover:bg-slate-700 transition whitespace-nowrap"
            >
              ملائمة
            </button>
            <button
              onClick={() => setZoom(100)}
              className="px-1.5 py-0.5 rounded text-[10px] text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              100%
            </button>
          </div>

          {/* Toggle Margin Guidelines */}
          {viewMode === 'single' && (
            <button
              onClick={() => setShowMarginGuides(!showMarginGuides)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition shrink-0 whitespace-nowrap ${
                showMarginGuides 
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-700 shadow-inner' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="إظهار أو إخفاء حدود الهوامش المنقطة على الورقة"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">حدود الهوامش</span>
            </button>
          )}
        </div>

        {/* Left Actions: Print, PDF, Settings, Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Toggle Settings Sidebar */}
          <button
            onClick={() => setShowSettingsSidebar(!showSettingsSidebar)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition whitespace-nowrap shrink-0 ${
              showSettingsSidebar
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="إظهار / إخفاء لوحة إعدادات الطابعة والتخطيط"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">الإعدادات</span>
          </button>

          {/* Screenshot Capture Button (لقطة الصفحة 📸) */}
          <button
            onClick={handleCapturePreviewScreenshot}
            disabled={isCapturingScreenshot}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-black transition active:scale-95 shadow-md shadow-teal-950/40 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
            title="التقاط لقطة شاشة الصفحة المعاينة بدقة 300 DPI مقصوصة تماماً"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{isCapturingScreenshot ? 'التقاط...' : 'لقطة الصفحة 📸'}</span>
            <span className="hidden sm:inline text-[9px] bg-teal-800/80 px-1 py-0.2 rounded font-mono font-bold">300 DPI</span>
          </button>

          {/* Direct Print Button */}
          <button
            id="print-preview-execute-button"
            onClick={handleExecutePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-900/40 transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            title="إرسال المستند مباشرة إلى الطابعة"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة 🖨️</span>
          </button>

          {/* Direct PDF Export */}
          <button
            onClick={handleExecuteExportPdf}
            disabled={isExporting}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 border border-rose-600/50 text-white text-xs font-bold transition active:scale-95 shadow-md shadow-rose-950/40 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
            title="حفظ وتصدير المستند كملف PDF عالي الجودة"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>{isExporting ? 'جاري...' : 'تصدير PDF'}</span>
          </button>

          {/* Direct PDF Share via WhatsApp / Bluetooth */}
          <button
            onClick={handleSharePdfNow}
            disabled={isExporting}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/50 text-white text-xs font-black transition active:scale-95 shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
            title="مشاركة ملف PDF مباشرة عبر واتساب، بلوتوث، وتطبيقات أندرويد"
          >
            <Share2 className="w-3.5 h-3.5 text-white" />
            <span>مشاركة PDF 📤</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition shrink-0"
            title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close Modal */}
          <button
            id="print-preview-close-button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-900/50 hover:text-rose-200 rounded-lg transition shrink-0"
            title="إغلاق المعاينة والعودة للمحرر"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Content Split: Settings Sidebar + Realistic WYSIWYG Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop when Sidebar is Open */}
        {showSettingsSidebar && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs animate-in fade-in"
            onClick={() => setShowSettingsSidebar(false)}
          />
        )}

        {/* ================= SETTINGS SIDEBAR ================= */}
        {showSettingsSidebar && (
          <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-[340px] sm:max-w-sm md:relative md:w-84 lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4 shadow-2xl md:shadow-xl text-xs animate-in slide-in-from-right-4 md:animate-none">
            {/* Mobile Header with Close Button */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 md:hidden">
              <span className="font-bold text-slate-200 text-xs">إعدادات الطباعة والتصدير</span>
              <button
                onClick={() => setShowSettingsSidebar(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Sidebar Tabs Switcher: "تحديد الطابعة والطباعة" vs "تخطيط الصفحة والورق" */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700 shrink-0">
              <button
                onClick={() => setActiveSidebarTab('printer')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                  activeSidebarTab === 'printer'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>تحديد الطابعة</span>
              </button>
              <button
                onClick={() => setActiveSidebarTab('layout')}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                  activeSidebarTab === 'layout'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>إعدادات الورق والتخطيط</span>
              </button>
            </div>

            {appliedNotification && (
              <div className="bg-emerald-950 border border-emerald-700 text-emerald-200 px-3 py-2 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>تم تحديث إعدادات المستند بنجاح!</span>
              </div>
            )}

            {/* TAB 1: PRINTER SELECTION & PRINT SETTINGS (تحديد الطابعة) */}
            {activeSidebarTab === 'printer' && (
              <div className="space-y-3.5 animate-in fade-in">
                {/* 1. Printer Device Selector matching "تحديد الطابعة.jpg" */}
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <Printer className="w-4 h-4 text-blue-400" />
                      <span>تحديد الطابعة (Select Printer):</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      جاهزة 🟢
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {PRINTERS_LIST.map((pr) => {
                      const isSelected = selectedPrinterId === pr.id;
                      return (
                        <button
                          key={pr.id}
                          onClick={() => setSelectedPrinterId(pr.id)}
                          className={`w-full text-right p-2.5 rounded-xl border transition text-xs flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-1 ring-blue-300'
                              : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-blue-700 text-white' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {pr.type === 'pdf' ? <FileText className="w-4 h-4 text-rose-300" /> : <Printer className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-bold text-[11px]">{pr.name}</div>
                              <div className={`text-[9px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                {pr.status}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Copies & Duplex */}
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs">عدد النسخ (Copies):</span>
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg p-1">
                      <button
                        onClick={() => setCopies((c) => Math.max(1, c - 1))}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={copies}
                        onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-10 text-center bg-transparent font-mono font-bold text-white text-xs focus:outline-none"
                      />
                      <button
                        onClick={() => setCopies((c) => Math.min(99, c + 1))}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Duplex Printing */}
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-300">الطباعة على الوجهين:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDuplexMode('single')}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                          duplexMode === 'single'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        وجه واحد
                      </button>
                      <button
                        onClick={() => setDuplexMode('duplex')}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                          duplexMode === 'duplex'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        على الوجهين
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Page Range (نطاق الصفحات) */}
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 space-y-2">
                  <span className="font-bold text-slate-200 text-xs block">نطاق الصفحات المراد طباعتها:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setPageRangeMode('all')}
                      className={`p-2 rounded-xl border text-center transition font-bold text-[10px] ${
                        pageRangeMode === 'all'
                          ? 'bg-blue-600 text-white border-blue-400 shadow-2xs'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      كافة الصفحات
                      <div className="text-[8px] opacity-80">(1 إلى {totalPages})</div>
                    </button>
                    <button
                      onClick={() => setPageRangeMode('current')}
                      className={`p-2 rounded-xl border text-center transition font-bold text-[10px] ${
                        pageRangeMode === 'current'
                          ? 'bg-blue-600 text-white border-blue-400 shadow-2xs'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      الصفحة الحالية
                      <div className="text-[8px] opacity-80">(صفحة {currentPage})</div>
                    </button>
                    <button
                      onClick={() => setPageRangeMode('custom')}
                      className={`p-2 rounded-xl border text-center transition font-bold text-[10px] ${
                        pageRangeMode === 'custom'
                          ? 'bg-blue-600 text-white border-blue-400 shadow-2xs'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      نطاق مخصص
                      <div className="text-[8px] opacity-80">(مثال: 1-2)</div>
                    </button>
                  </div>

                  {pageRangeMode === 'custom' && (
                    <div className="pt-1">
                      <input
                        type="text"
                        value={customPageRange}
                        onChange={(e) => setCustomPageRange(e.target.value)}
                        placeholder="أدخل أرقام الصفحات (مثال: 1, 2-3)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500 text-left font-mono"
                        dir="ltr"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Color Mode & Quality */}
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs">نمط الألوان:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setColorMode('color')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                          colorMode === 'color'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>🎨 ملون كامل</span>
                      </button>
                      <button
                        onClick={() => setColorMode('grayscale')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                          colorMode === 'grayscale'
                            ? 'bg-slate-700 text-white shadow-2xs border border-slate-500'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>⚪ أسود وأبيض</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-300">دقة وجودة الطباعة:</span>
                    <select
                      value={printQuality}
                      onChange={(e) => setPrintQuality(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="high">عالية الدقة (600 DPI)</option>
                      <option value="normal">قياسية (300 DPI)</option>
                      <option value="draft">مسودة سريعة (150 DPI)</option>
                    </select>
                  </div>
                </div>

                {/* 5. ميزة التقاط لقطة شاشة الصفحة المعاينة (لقطة الصفحة 📸) */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800/90 to-teal-950/60 border border-teal-800/60 rounded-2xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-600/30 flex items-center justify-center text-teal-300">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>لقطة شاشة الورقة المعاينة للطباعة 📸</span>
                        </h4>
                        <p className="text-[10px] text-teal-200/80">
                          بدقة 300 نقطة في البوصة مقصوصة تماماً على مقاس الورقة
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                      300 DPI
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={handleCapturePreviewScreenshot}
                      disabled={isCapturingScreenshot}
                      className="py-2 px-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer text-xs disabled:opacity-50"
                      title="فتح نافذة المعاينة مع أدوات التنزيل والمشاركة والطباعة"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isCapturingScreenshot ? 'جاري الالتقاط...' : 'معاينة اللقطة 📸'}</span>
                    </button>

                    <button
                      onClick={handleDirectPngSave}
                      className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer text-xs"
                      title="حفظ وتنزيل فوري بصيغة PNG فائقة النقاء 300 DPI"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تحميل PNG فوري 🖼️</span>
                    </button>

                    <button
                      onClick={handleDirectJpgSave}
                      className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer text-xs"
                      title="حفظ وتنزيل فوري بصيغة JPG خفيفة"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>تحميل JPG فوري 📸</span>
                    </button>
                  </div>
                </div>

                {/* 6. تحديد واختيار مجلد الحفظ في وحدة التخزين أندرويد للهاتف الجوال أو SD */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-amber-400" />
                      <span>موقع ومجلد الحفظ والتصدير النشط:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFolderManagerOpen(true)}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-700/60 px-2 py-1 rounded-lg transition cursor-pointer"
                      title="فتح نافذة مدير المجلدات لإنشاء وتحرير وحذف واختيار المجلدات"
                    >
                      <Settings className="w-3 h-3 text-amber-400" />
                      <span>تحديد المجلد ⚙️</span>
                    </button>
                  </div>

                  {/* Storage Type Quick Switches */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStorageType('internal');
                        try {
                          localStorage.setItem('office_save_storage_type', 'internal');
                        } catch {}
                        setScreenshotToast('تم التبديل إلى وحدة التخزين الداخلية للهاتف الجوال 📱');
                        setTimeout(() => setScreenshotToast(null), 2500);
                      }}
                      className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition cursor-pointer text-[11px] ${
                        storageType === 'internal'
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-1 ring-blue-400/50'
                          : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ذاكرة الجوال 📱</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStorageType('sd');
                        try {
                          localStorage.setItem('office_save_storage_type', 'sd');
                        } catch {}
                        setScreenshotToast('تم التبديل إلى بطاقة الذاكرة SD 💾 (النسخ الاحتياطي للمكتب)');
                        setTimeout(() => setScreenshotToast(null), 2500);
                      }}
                      className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition cursor-pointer text-[11px] ${
                        storageType === 'sd'
                          ? 'bg-amber-600 text-white border-amber-400 shadow-md ring-1 ring-amber-400/50'
                          : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <HardDrive className="w-3.5 h-3.5 text-amber-300" />
                      <span>بطاقة الذاكرة SD 💾</span>
                    </button>
                  </div>

                  {/* Active Folder & Real Path Card */}
                  <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <Folder className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 block">المجلد المختار:</span>
                          <span className="font-bold text-white text-xs truncate block">{activeFolder}</span>
                        </div>
                      </div>
                      <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold shrink-0">
                        قراءة/كتابة ✓
                      </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 flex items-center justify-between gap-1.5 text-[10px] font-mono text-slate-300">
                      <span className="truncate select-all text-slate-300" dir="ltr">
                        {storageType === 'internal'
                          ? `/storage/emulated/0/Download/${activeFolder}`
                          : `/storage/sdcard1/OfficeBackup/${activeFolder}`}
                      </span>
                      <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-sans font-bold shrink-0">
                        {storageType === 'internal' ? 'داخلي 📱' : 'SD 💾'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleExecutePrint}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-900/40 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>إرسال أمر الطباعة إلى {PRINTERS_LIST.find(p => p.id === selectedPrinterId)?.name.split('(')[0]}</span>
                  </button>

                  <button
                    onClick={handleExecuteExportPdf}
                    disabled={isExporting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-600 hover:to-rose-700 text-white font-black text-xs shadow-lg shadow-rose-950/40 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting ? 'جاري حفظ وتصدير PDF...' : 'حفظ وتصدير بتنسيق PDF الآن'}</span>
                  </button>

                  <button
                    onClick={handleSharePdfNow}
                    disabled={isExporting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-950/40 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة PDF عبر واتساب وبلوتوث (Share) 📤</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PAGE LAYOUT & PAPER SETTINGS */}
            {activeSidebarTab === 'layout' && (
              <div className="space-y-3.5 animate-in fade-in">
                {/* Excel Specific Print & Fit Options */}
                {mode === 'excel' && (
                  <div className="space-y-2.5 bg-emerald-950/60 p-3 rounded-2xl border border-emerald-600/60 shadow-inner">
                    <div className="flex items-center justify-between border-b border-emerald-800/80 pb-1.5">
                      <span className="font-bold text-emerald-200 text-xs flex items-center gap-1.5">
                        <Table className="w-3.5 h-3.5 text-emerald-400" />
                        <span>خيارات تناسب وتخطيط جدول Excel:</span>
                      </span>
                      <span className="text-[9px] font-bold bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded">
                        إكسل
                      </span>
                    </div>

                    {/* Column Fit Mode */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-200 block">
                        تناسب الصفحة والتحجيم (Scaling):
                      </span>
                      <div className="space-y-1">
                        <button
                          onClick={() => setExcelFitMode('fit-columns')}
                          className={`w-full text-right p-2 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                            excelFitMode === 'fit-columns'
                              ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-2xs'
                              : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-[11px]">تناسب الأعمدة مع الصفحة (Fit Columns) 🎯</div>
                            <div className={`text-[9px] ${excelFitMode === 'fit-columns' ? 'text-emerald-100' : 'text-slate-400'}`}>
                              ملاءمة كافة الأعمدة عرضياً على صفحة واحدة لمنع التشتت
                            </div>
                          </div>
                          {excelFitMode === 'fit-columns' && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>

                        <button
                          onClick={() => setExcelFitMode('fit-sheet')}
                          className={`w-full text-right p-2 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                            excelFitMode === 'fit-sheet'
                              ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-2xs'
                              : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-[11px]">ملاءمة الورقة على صفحة واحدة (Fit Sheet) 📄</div>
                            <div className={`text-[9px] ${excelFitMode === 'fit-sheet' ? 'text-emerald-100' : 'text-slate-400'}`}>
                              تصغير الأعمدة والصفوف لتناسب صفحة واحدة فقط
                            </div>
                          </div>
                          {excelFitMode === 'fit-sheet' && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>

                        <button
                          onClick={() => setExcelFitMode('normal')}
                          className={`w-full text-right p-2 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                            excelFitMode === 'normal'
                              ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-2xs'
                              : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-[11px]">الحجم الفعلي 100% (Actual Size) 📏</div>
                            <div className={`text-[9px] ${excelFitMode === 'normal' ? 'text-emerald-100' : 'text-slate-400'}`}>
                              الطباعة بالحجم الطبيعي بدون ضغط أو تحجيم
                            </div>
                          </div>
                          {excelFitMode === 'normal' && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>
                      </div>
                    </div>

                    {/* Gridlines & Header toggles */}
                    <div className="pt-2 border-t border-emerald-900/80 space-y-1.5">
                      <label className="flex items-center justify-between text-slate-200 cursor-pointer">
                        <span className="text-[11px] font-semibold">إظهار خطوط شبكة الجدول (Gridlines):</span>
                        <input
                          type="checkbox"
                          checked={showGridlines}
                          onChange={(e) => setShowGridlines(e.target.checked)}
                          className="accent-emerald-500 rounded cursor-pointer"
                        />
                      </label>
                      <label className="flex items-center justify-between text-slate-200 cursor-pointer">
                        <span className="text-[11px] font-semibold">تكرار صف رؤوس الأعمدة (Repeat Header):</span>
                        <input
                          type="checkbox"
                          checked={repeatHeaderRow}
                          onChange={(e) => setRepeatHeaderRow(e.target.checked)}
                          className="accent-emerald-500 rounded cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* 1. Paper Size Selector */}
                <div className="space-y-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>حجم الورق (Paper Size):</span>
                    </label>
                    <span className="text-[10px] font-mono text-blue-300 font-bold bg-blue-950 px-2 py-0.5 rounded border border-blue-900">
                      {paperSizeId}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {PAPER_SIZES.map((paper) => {
                      const isSelected = paperSizeId.toLowerCase() === paper.id.toLowerCase();
                      return (
                        <button
                          key={paper.id}
                          onClick={() => setPaperSizeId(paper.id)}
                          className={`w-full text-right p-2.5 rounded-xl border transition text-xs flex flex-col gap-0.5 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-1 ring-blue-300'
                              : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              <span>{paper.name}</span>
                              {paper.badge && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                  isSelected ? 'bg-blue-800 text-white' : 'bg-slate-700 text-slate-300'
                                }`}>
                                  {paper.badge}
                                </span>
                              )}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <p className={`text-[10px] leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {paper.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Orientation Toggle */}
                <div className="space-y-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  <label className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>اتجاه الورقة (Orientation):</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOrientation('portrait')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        isPortrait
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md font-bold'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                      }`}
                    >
                      <div className="w-5 h-7 border-2 border-current rounded-xs" />
                      <span className="text-xs">عمودي (Portrait)</span>
                      <span className="text-[9px] opacity-75">{paperWidthMm} × {paperHeightMm} مم</span>
                    </button>

                    <button
                      onClick={() => setOrientation('landscape')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        !isPortrait
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md font-bold'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                      }`}
                    >
                      <div className="w-7 h-5 border-2 border-current rounded-xs" />
                      <span className="text-xs">أفقي (Landscape)</span>
                      <span className="text-[9px] opacity-75">{paperHeightMm} × {paperWidthMm} مم</span>
                    </button>
                  </div>
                </div>

                {/* Multi-page Print Layout Option (تخطيط الطباعة المتعدد) */}
                <div className="space-y-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  <label className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>تخطيط الطباعة المتعدد (Multi-Page Layout):</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'normal', name: 'عادي (Normal)', desc: 'صفحة واحدة لكل ورقة' },
                      { id: 'booklet', name: 'كتيب (Booklet)', desc: 'صفحتان لكل ورقة مطوية' },
                      { id: 'brochure', name: 'مطوية (Brochure)', desc: 'تخطيط ثلاثي الطيات' },
                      { id: 'two-up', name: 'صفحتان معا (2-Up)', desc: 'صفحتان جانباً لجانب' },
                    ].map((item) => {
                      const isSelected = multiPageLayout === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setMultiPageLayout(item.id as any)}
                          className={`text-right p-2 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-amber-600 text-white border-amber-400 shadow-md font-bold'
                              : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold">{item.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-[9px] ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Margins Settings */}
                <div className="space-y-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      <span>هوامش الصفحة (Margins):</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      علوي: {effectiveMargins.top} سم | جانبي: {effectiveMargins.right} سم
                    </span>
                  </div>

                  {/* Presets Grid */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {MARGIN_PRESETS.map((preset) => {
                      const isSelected = marginPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setMarginPresetId(preset.id)}
                          className={`text-right p-2 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-bold'
                              : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold">{preset.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-[9px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {preset.desc}
                          </span>
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setMarginPresetId('custom')}
                      className={`text-right p-2 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                        marginPresetId === 'custom'
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-bold'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold">هوامش مخصصة</span>
                        {marginPresetId === 'custom' && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-[9px] ${marginPresetId === 'custom' ? 'text-emerald-100' : 'text-slate-400'}`}>
                        تحكم دقيق بالأشرطة
                      </span>
                    </button>
                  </div>

                  {/* Custom Margins Sliders */}
                  {marginPresetId === 'custom' && (
                    <div className="pt-2 border-t border-slate-700 space-y-2 animate-in fade-in">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                            <span>أعلى:</span>
                            <span className="font-mono text-emerald-400">{customMargins.top} سم</span>
                          </div>
                          <input
                            type="range"
                            min="0.2"
                            max="5.0"
                            step="0.1"
                            value={customMargins.top}
                            onChange={(e) => setCustomMargins({ ...customMargins, top: parseFloat(e.target.value) })}
                            className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                            <span>أسفل:</span>
                            <span className="font-mono text-emerald-400">{customMargins.bottom} سم</span>
                          </div>
                          <input
                            type="range"
                            min="0.2"
                            max="5.0"
                            step="0.1"
                            value={customMargins.bottom}
                            onChange={(e) => setCustomMargins({ ...customMargins, bottom: parseFloat(e.target.value) })}
                            className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                            <span>أيمن:</span>
                            <span className="font-mono text-emerald-400">{customMargins.right} سم</span>
                          </div>
                          <input
                            type="range"
                            min="0.2"
                            max="5.0"
                            step="0.1"
                            value={customMargins.right}
                            onChange={(e) => setCustomMargins({ ...customMargins, right: parseFloat(e.target.value) })}
                            className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                            <span>أيسر:</span>
                            <span className="font-mono text-emerald-400">{customMargins.left} سم</span>
                          </div>
                          <input
                            type="range"
                            min="0.2"
                            max="5.0"
                            step="0.1"
                            value={customMargins.left}
                            onChange={(e) => setCustomMargins({ ...customMargins, left: parseFloat(e.target.value) })}
                            className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Header & Footer Settings */}
                <div className="space-y-2.5 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  <span className="font-bold text-slate-200 text-xs block">رأس وتذييل الصفحة:</span>

                  <div className="space-y-1">
                    <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                      <span className="text-[11px] font-semibold">تضمين رأس الصفحة (Header):</span>
                      <input
                        type="checkbox"
                        checked={showHeader}
                        onChange={(e) => setShowHeader(e.target.checked)}
                        className="accent-blue-600 rounded cursor-pointer"
                      />
                    </label>
                    {showHeader && (
                      <input
                        type="text"
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        placeholder="نص رأس الصفحة..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                      />
                    )}
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-700/60">
                    <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                      <span className="text-[11px] font-semibold">تضمين تذييل الصفحة (Footer):</span>
                      <input
                        type="checkbox"
                        checked={showFooter}
                        onChange={(e) => setShowFooter(e.target.checked)}
                        className="accent-blue-600 rounded cursor-pointer"
                      />
                    </label>
                    {showFooter && (
                      <input
                        type="text"
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        placeholder="نص تذييل الصفحة..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                      />
                    )}
                  </div>
                </div>

                {/* 5. Page Background Color */}
                <div className="space-y-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                  <label className="font-bold text-slate-200 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      <span>لون خلفية الورقة:</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{pageBgColor}</span>
                  </label>

                  <div className="flex items-center gap-2">
                    {[
                      { color: '#ffffff', label: 'أبيض قياسي' },
                      { color: '#fefce8', label: 'عاجي دافئ' },
                      { color: '#f8fafc', label: 'رمادي عصري' },
                      { color: '#f0f9ff', label: 'أزرق ثلجي' },
                      { color: '#fdf2f8', label: 'وردي ناعم' },
                    ].map((item) => (
                      <button
                        key={item.color}
                        onClick={() => setPageBgColor(item.color)}
                        style={{ backgroundColor: item.color }}
                        className={`w-7 h-7 rounded-lg border transition cursor-pointer ${
                          pageBgColor === item.color ? 'ring-2 ring-blue-500 scale-110 border-white' : 'border-slate-600'
                        }`}
                        title={item.label}
                      />
                    ))}
                    <label className="cursor-pointer">
                      <input
                        type="color"
                        value={pageBgColor}
                        onChange={(e) => setPageBgColor(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border border-slate-600 bg-transparent p-0"
                        title="اختر لون مخصص"
                      />
                    </label>
                  </div>
                </div>

                {/* Apply to Original Document */}
                <div className="pt-2">
                  <button
                    onClick={handleApplyToDocument}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>تطبيق التخطيط على المستند الأصلي</span>
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ================= REALISTIC WYSIWYG PREVIEW CANVAS ================= */}
        <main className="flex-1 overflow-auto p-6 md:p-10 flex flex-col items-center justify-start bg-slate-950/90 relative">
          {/* VIEW MODE 1: SINGLE PAGE PREVIEW */}
          {viewMode === 'single' ? (
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
                filter: colorMode === 'grayscale' ? 'grayscale(100%)' : 'none',
              }}
              className="my-4"
            >
              {/* Single Physical Paper Sheet */}
              <div
                id="print-preview-rendered-sheet"
                style={{
                  width: `${paperWidthMm}mm`,
                  minHeight: `${paperHeightMm}mm`,
                  height: `${paperHeightMm}mm`,
                  boxSizing: 'border-box',
                  backgroundColor: pageBgColor,
                  padding: 0,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  ...getPreviewBorderStyles(),
                }}
                className="text-slate-900 rounded-xs relative flex flex-col justify-between overflow-hidden transition-all duration-200"
              >
                {/* Watermark Overlay */}
                {wordState?.watermarkText && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
                    <span className="text-slate-300/35 text-6xl font-bold -rotate-45 font-serif uppercase tracking-widest whitespace-nowrap">
                      {wordState.watermarkText}
                    </span>
                  </div>
                )}

                {/* Optional Dashed Margin Guides */}
                {showMarginGuides && !isCapturingScreenshot && (
                  <div
                    style={{
                      top: `${effectiveMargins.top}cm`,
                      bottom: `${effectiveMargins.bottom}cm`,
                      right: `${effectiveMargins.right}cm`,
                      left: `${effectiveMargins.left}cm`,
                    }}
                    className="absolute pointer-events-none border border-dashed border-indigo-400/50 z-20 no-print"
                  >
                    <span className="absolute -top-4 right-0 text-[9px] font-mono text-indigo-500 bg-white/90 px-1 rounded no-print">
                      حد الهامش: {effectiveMargins.top} سم
                    </span>
                  </div>
                )}

                {/* Page Header */}
                {showHeader && (
                  <div 
                    style={{ 
                      width: '100%',
                      paddingLeft: `${effectiveMargins.left}cm`,
                      paddingRight: `${effectiveMargins.right}cm`,
                      height: `${Math.max(1.5, unifiedPaperMetrics.headerHeightCm)}cm`,
                      minHeight: `${Math.max(1.5, unifiedPaperMetrics.headerHeightCm)}cm`,
                      maxHeight: `${Math.max(1.5, unifiedPaperMetrics.headerHeightCm)}cm`,
                      boxSizing: 'border-box',
                    }}
                    className="border-b border-dashed border-slate-300 pb-1 flex items-center justify-between text-xs text-slate-500 shrink-0 relative z-10"
                  >
                    <span className="font-bold text-slate-800 text-xs truncate max-w-[65%]">
                      {headerText}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {paperSizeId} {isPortrait ? 'عمودي' : 'أفقي'}
                      </span>
                      <span>
                        {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Content View */}
                <div 
                  className="flex-1 overflow-hidden relative z-10"
                  style={{
                    paddingLeft: `${effectiveMargins.left}cm`,
                    paddingRight: `${effectiveMargins.right}cm`,
                    paddingTop: `${showHeader !== false ? Math.max(0.4, effectiveMargins.top - Math.max(1.5, unifiedPaperMetrics.headerHeightCm)) : effectiveMargins.top}cm`,
                    paddingBottom: `${showFooter !== false ? Math.max(0.4, effectiveMargins.bottom - unifiedPaperMetrics.footerHeightCm) : effectiveMargins.bottom}cm`,
                    height: `calc(${paperHeightMm}mm - ${(showHeader !== false ? Math.max(1.5, unifiedPaperMetrics.headerHeightCm) : 0) + (showFooter !== false ? unifiedPaperMetrics.footerHeightCm : 0)}cm)`,
                    minHeight: `calc(${paperHeightMm}mm - ${(showHeader !== false ? Math.max(1.5, unifiedPaperMetrics.headerHeightCm) : 0) + (showFooter !== false ? unifiedPaperMetrics.footerHeightCm : 0)}cm)`,
                    boxSizing: 'border-box',
                  }}
                >
                  {renderDocumentPageContent(currentPage - 1)}
                </div>

                {/* Page Footer */}
                {showFooter && (
                  <div 
                    style={{ 
                      width: '100%',
                      paddingLeft: `${effectiveMargins.left}cm`,
                      paddingRight: `${effectiveMargins.right}cm`,
                      height: `${unifiedPaperMetrics.footerHeightCm}cm`,
                      minHeight: `${unifiedPaperMetrics.footerHeightCm}cm`,
                      maxHeight: `${unifiedPaperMetrics.footerHeightCm}cm`,
                      boxSizing: 'border-box',
                    }}
                    className="border-t border-dashed border-slate-300 pt-1 flex items-center justify-between text-xs text-slate-500 shrink-0 relative z-10"
                  >
                    <span className="truncate max-w-[65%]">{footerText}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {paperWidthMm} × {paperHeightMm} مم
                      </span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        صفحة {currentPage} من {totalPages}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* VIEW MODE 2: ALL PAGES MULTI-PAGE GRID */
            <div 
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
                filter: colorMode === 'grayscale' ? 'grayscale(100%)' : 'none',
              }}
              className="my-4 flex flex-wrap justify-center gap-8 max-w-7xl"
            >
              {Array.from({ length: totalPages }).map((_, pIdx) => {
                const pageNumber = pIdx + 1;
                const isSelected = currentPage === pageNumber;
                return (
                  <div 
                    key={pageNumber} 
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                    onClick={() => {
                      setCurrentPage(pageNumber);
                      setViewMode('single');
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold group-hover:text-blue-400 transition no-print">
                      <span>صفحة {pageNumber} من {totalPages}</span>
                      {isSelected && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[10px]">الحالية</span>
                      )}
                    </div>

                    <div
                      style={{
                        width: `${paperWidthMm}mm`,
                        minHeight: `${paperHeightMm}mm`,
                        height: `${paperHeightMm}mm`,
                        boxSizing: 'border-box',
                        backgroundColor: pageBgColor,
                        paddingTop: `${effectiveMargins.top}cm`,
                        paddingBottom: `${effectiveMargins.bottom}cm`,
                        paddingRight: `${effectiveMargins.right}cm`,
                        paddingLeft: `${effectiveMargins.left}cm`,
                        boxShadow: isSelected 
                          ? '0 0 0 3px #3b82f6, 0 20px 40px -10px rgba(0, 0, 0, 0.8)' 
                          : '0 15px 35px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                        ...getPreviewBorderStyles(),
                      }}
                      className="text-slate-900 rounded-xs relative flex flex-col justify-between overflow-hidden transition group-hover:scale-[1.01]"
                    >
                      {/* Watermark Overlay */}
                      {wordState?.watermarkText && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
                          <span className="text-slate-300/35 text-5xl font-bold -rotate-45 font-serif uppercase tracking-widest whitespace-nowrap">
                            {wordState.watermarkText}
                          </span>
                        </div>
                      )}

                      {/* Page Header */}
                      {showHeader && (
                        <div 
                          style={{ height: '1.2cm', minHeight: '1.2cm', maxHeight: '1.2cm' }}
                          className="border-b border-dashed border-slate-300 pb-1 flex items-center justify-between text-xs text-slate-500 shrink-0 relative z-10"
                        >
                          <span className="font-bold text-slate-800 text-xs truncate max-w-[65%]">
                            {headerText}
                          </span>
                          <span className="font-mono text-[9px] bg-slate-100 px-1 rounded text-slate-600">
                            {paperSizeId} {isPortrait ? 'عمودي' : 'أفقي'}
                          </span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 overflow-hidden py-3 relative z-10">
                        {renderDocumentPageContent(pIdx)}
                      </div>

                      {/* Page Footer */}
                      {showFooter && (
                        <div 
                          style={{ height: '1.2cm', minHeight: '1.2cm', maxHeight: '1.2cm' }}
                          className="border-t border-dashed border-slate-300 pt-1 flex items-center justify-between text-xs text-slate-500 shrink-0 relative z-10"
                        >
                          <span className="truncate max-w-[65%]">{footerText}</span>
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            صفحة {pageNumber} من {totalPages}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Screenshot Preview Modal (نافذة معاينة لقطة الشاشة مع أدوات التحميل والطباعة والمشاركة) */}
      <ScreenshotPreviewModal
        isOpen={isScreenshotPreviewOpen}
        onClose={() => setIsScreenshotPreviewOpen(false)}
        screenshotDataUrl={screenshotDataUrl || ''}
        screenshotBlob={screenshotBlob}
        documentTitle={(mode === 'word' ? wordState?.title : excelTitle) || 'مستند'}
        pageNumber={currentPage}
      />

      {/* Folder Manager Modal (نافذة اختيار وإدارة مجلدات الحفظ في وحدة التخزين أو SD) */}
      <FolderManagerModal
        isOpen={isFolderManagerOpen}
        onClose={() => setIsFolderManagerOpen(false)}
        currentFolder={activeFolder}
        currentStorage={storageType}
        onSelectFolder={handleSelectSaveDestination}
      />

      {/* Toast notification banner */}
      {screenshotToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 border border-teal-500/80 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{screenshotToast}</span>
        </div>
      )}
    </div>
  );
};
