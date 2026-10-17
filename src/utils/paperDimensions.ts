/**
 * Unified Paper Dimensions, Scaling & Pagination System
 * النظام الموحد لقياسات الورق ونسبة العرض والتجزئة الرياضية للصفحات
 * 
 * Ensures 100% mathematical consistency across:
 * 1. WordEditor (Canvas, Rulers, Boundaries, Page Count)
 * 2. PrintPreviewModal (Preview Sheets, Margins, Total Pages)
 * 3. PdfExportModal (Paper Choice, Scale, Page Count Feedback)
 * 4. exportWordAsPdf (jsPDF & html2canvas page slicing)
 */

export type SupportedPaperKey = 'A4' | 'Letter' | 'A5' | 'A3' | 'Legal' | 'Executive' | 'B4' | 'B5' | 'A6' | 'A2';

export interface PaperSizeDefinition {
  id: SupportedPaperKey;
  nameAr: string;
  descAr: string;
  widthMm: number;
  heightMm: number;
  isPrimary?: boolean;
}

/**
 * Standard physical paper specifications in millimeters
 * A4, Letter, and A5 are the primary standard sizes
 */
export const UNIFIED_PAPER_SIZES: Record<SupportedPaperKey, PaperSizeDefinition> = {
  A4: {
    id: 'A4',
    nameAr: 'A4 (قياسي دولي)',
    descAr: '210 × 297 مم',
    widthMm: 210,
    heightMm: 297,
    isPrimary: true,
  },
  Letter: {
    id: 'Letter',
    nameAr: 'Letter (رسالة قياسي)',
    descAr: '215.9 × 279.4 مم',
    widthMm: 215.9,
    heightMm: 279.4,
    isPrimary: true,
  },
  A5: {
    id: 'A5',
    nameAr: 'A5 (دفاتر ومفكرات)',
    descAr: '148 × 210 مم',
    widthMm: 148,
    heightMm: 210,
    isPrimary: true,
  },
  A3: {
    id: 'A3',
    nameAr: 'A3 (كبير للمخططات)',
    descAr: '297 × 420 مم',
    widthMm: 297,
    heightMm: 420,
  },
  Legal: {
    id: 'Legal',
    nameAr: 'Legal (قانوني طويل)',
    descAr: '215.9 × 355.6 مم',
    widthMm: 215.9,
    heightMm: 355.6,
  },
  Executive: {
    id: 'Executive',
    nameAr: 'Executive (تنفيذي)',
    descAr: '184.15 × 266.7 مم',
    widthMm: 184.15,
    heightMm: 266.7,
  },
  B4: {
    id: 'B4',
    nameAr: 'B4 (مجلات وتقارير)',
    descAr: '250 × 353 مم',
    widthMm: 250,
    heightMm: 353,
  },
  B5: {
    id: 'B5',
    nameAr: 'B5 (كتيبات قياسية)',
    descAr: '176 × 250 مم',
    widthMm: 176,
    heightMm: 250,
  },
  A6: {
    id: 'A6',
    nameAr: 'A6 (بطاقات وملاحظات)',
    descAr: '105 × 148 مم',
    widthMm: 105,
    heightMm: 148,
  },
  A2: {
    id: 'A2',
    nameAr: 'A2 (لوحات ومخططات كبرى)',
    descAr: '420 × 594 مم',
    widthMm: 420,
    heightMm: 594,
  },
};

/**
 * Normalizes any string paper identifier (e.g. 'a4', 'LETTER', 'a5') to a canonical SupportedPaperKey
 */
export function normalizePaperSize(raw?: string): SupportedPaperKey {
  if (!raw) return 'A4';
  const clean = raw.trim().toLowerCase();
  if (clean === 'a4') return 'A4';
  if (clean === 'letter') return 'Letter';
  if (clean === 'a5') return 'A5';
  if (clean === 'a3') return 'A3';
  if (clean === 'legal') return 'Legal';
  if (clean === 'executive') return 'Executive';
  if (clean === 'b4') return 'B4';
  if (clean === 'b5') return 'B5';
  if (clean === 'a6') return 'A6';
  if (clean === 'a2') return 'A2';
  
  for (const key of Object.keys(UNIFIED_PAPER_SIZES) as SupportedPaperKey[]) {
    if (key.toLowerCase() === clean) return key;
  }
  return 'A4';
}

export interface UnifiedMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Standard CSS/physical conversions
 * Standard CSS resolution: 96 DPI (96 pixels per inch)
 * 1 inch = 25.4 mm = 2.54 cm = 72 pt (PDF points)
 */
export const CSS_PX_PER_MM = 96 / 25.4; // ~3.779527559 px/mm
export const CSS_PX_PER_CM = 96 / 2.54; // ~37.79527559 px/cm
export const PT_PER_MM = 72 / 25.4;     // ~2.834645669 pt/mm
export const PT_TO_PX = 96 / 72;        // ~1.333333333 px/pt

/**
 * Computes standard margins in centimeters
 */
export function getUnifiedMarginsCm(
  marginsPreset?: string,
  customMargins?: Partial<UnifiedMargins>
): UnifiedMargins {
  if (marginsPreset === 'custom' && customMargins) {
    return {
      top: Math.max(0.1, Number(customMargins.top) || 2.54),
      bottom: Math.max(0.1, Number(customMargins.bottom) || 2.54),
      left: Math.max(0.1, Number(customMargins.left) || 2.54),
      right: Math.max(0.1, Number(customMargins.right) || 2.54),
    };
  }
  switch (marginsPreset) {
    case 'minimum':
    case 'ultra-narrow':
      return { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 };
    case 'narrow':
      return { top: 1.27, bottom: 1.27, left: 1.27, right: 1.27 };
    case 'moderate':
      return { top: 2.54, bottom: 2.54, left: 1.9, right: 1.9 };
    case 'wide':
      return { top: 2.54, bottom: 2.54, left: 3.81, right: 3.81 };
    case 'normal':
    default:
      return { top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 };
  }
}

export interface UnifiedDimensionParams {
  paperSize?: string;
  orientation?: 'portrait' | 'landscape';
  zoom?: number; // Zoom percentage e.g. 100 for 100%
  margins?: string;
  customMargins?: Partial<UnifiedMargins>;
  showHeader?: boolean;
  showFooter?: boolean;
  headerHeightCm?: number;
  footerHeightCm?: number;
  fontSize?: number; // In points (default: 14)
  lineSpacing?: number; // Multiplier (default: 1.6)
  containerWidth?: number; // Optional viewport/container width in pixels
  containerHeight?: number;
}

export interface UnifiedPaperMetrics {
  paperSize: SupportedPaperKey;
  paperDef: PaperSizeDefinition;
  orientation: 'portrait' | 'landscape';
  isLandscape: boolean;

  // Millimeters
  widthMm: number;
  heightMm: number;

  // Centimeters (for Word CSS cm values & rulers)
  widthCm: number;
  heightCm: number;

  // Pixels (CSS at 96 DPI)
  widthPx: number;
  heightPx: number;

  // Points (PDF pt at 72 DPI)
  widthPt: number;
  heightPt: number;

  // Scale factor (1.0 = 100%)
  scale: number;
  zoom: number;
  fitWidthScale?: number;

  // Margins in cm and px
  marginsCm: UnifiedMargins;
  marginsPx: UnifiedMargins;

  // Header and Footer heights in cm and px
  headerHeightCm: number;
  footerHeightCm: number;
  headerHeightPx: number;
  footerHeightPx: number;

  // Printable Content Area
  printableWidthCm: number;
  printableHeightCm: number;
  printableWidthPx: number;
  printableHeightPx: number;

  // Mathematical capacity estimation
  capacity: {
    linesPerPage: number;
    wordsPerLine: number;
    wordsPerPage: number;
    lineHeightPx: number;
  };
}

/**
 * Unified mathematical calculation function for scale, dimensions, and capacity
 * Used across WordEditor, PrintPreviewModal, and PdfExportModal
 */
export function calculateUnifiedPaperDimensionsAndScale(
  params: UnifiedDimensionParams
): UnifiedPaperMetrics {
  const normalizedKey = normalizePaperSize(params.paperSize);
  const paperDef = UNIFIED_PAPER_SIZES[normalizedKey] || UNIFIED_PAPER_SIZES.A4;
  const orientation = params.orientation === 'landscape' ? 'landscape' : 'portrait';
  const isLandscape = orientation === 'landscape';

  // Physical mm dimensions (swap width & height if landscape)
  const widthMm = isLandscape ? paperDef.heightMm : paperDef.widthMm;
  const heightMm = isLandscape ? paperDef.widthMm : paperDef.heightMm;

  // Centimeter dimensions
  const widthCm = Math.round((widthMm / 10) * 100) / 100;
  const heightCm = Math.round((heightMm / 10) * 100) / 100;

  // 96 DPI CSS Pixels
  const widthPx = Math.round(widthMm * CSS_PX_PER_MM);
  const heightPx = Math.round(heightMm * CSS_PX_PER_MM);

  // 72 DPI PDF Points
  const widthPt = Math.round(widthMm * PT_PER_MM * 100) / 100;
  const heightPt = Math.round(heightMm * PT_PER_MM * 100) / 100;

  // Zoom and scale
  const zoom = typeof params.zoom === 'number' && params.zoom > 0 ? params.zoom : 100;
  const scale = zoom / 100;

  let fitWidthScale: number | undefined;
  if (params.containerWidth && params.containerWidth > 100) {
    const availableW = params.containerWidth - 64; // subtract padding
    fitWidthScale = Math.min(1.5, Math.max(0.2, Math.round((availableW / widthPx) * 100) / 100));
  }

  // Margins
  const marginsCm = getUnifiedMarginsCm(params.margins, params.customMargins);
  const marginsPx = {
    top: Math.round(marginsCm.top * CSS_PX_PER_CM),
    bottom: Math.round(marginsCm.bottom * CSS_PX_PER_CM),
    left: Math.round(marginsCm.left * CSS_PX_PER_CM),
    right: Math.round(marginsCm.right * CSS_PX_PER_CM),
  };

  // Header and Footer
  const headerHeightCm = params.showHeader !== false
    ? (typeof params.headerHeightCm === 'number' ? params.headerHeightCm : Math.min(1.0, Math.max(0.4, marginsCm.top * 0.5)))
    : 0;
  const footerHeightCm = params.showFooter !== false
    ? (typeof params.footerHeightCm === 'number' ? params.footerHeightCm : Math.min(1.0, Math.max(0.4, marginsCm.bottom * 0.5)))
    : 0;

  const headerHeightPx = Math.round(headerHeightCm * CSS_PX_PER_CM);
  const footerHeightPx = Math.round(footerHeightCm * CSS_PX_PER_CM);

  // Printable dimensions
  const printableWidthCm = Math.max(2, Math.round((widthCm - marginsCm.left - marginsCm.right) * 100) / 100);
  const printableHeightCm = Math.max(3, Math.round((heightCm - marginsCm.top - marginsCm.bottom - headerHeightCm - footerHeightCm) * 100) / 100);

  const printableWidthPx = Math.max(100, widthPx - marginsPx.left - marginsPx.right);
  const printableHeightPx = Math.max(150, heightPx - marginsPx.top - marginsPx.bottom - headerHeightPx - footerHeightPx);

  // Capacity calculations based on font size and line spacing
  const ptSize = params.fontSize || 14;
  const lSpacing = params.lineSpacing || 1.6;
  const lineHeightPx = ptSize * PT_TO_PX * lSpacing;
  const linesPerPage = Math.max(6, Math.floor(printableHeightPx / lineHeightPx));

  // Arabic Cairo / Amiri average word width factor is approx 2.7 * font size
  const avgWordWidthPx = Math.max(22, ptSize * PT_TO_PX * 2.7);
  const wordsPerLine = Math.max(4, Math.floor(printableWidthPx / avgWordWidthPx));
  const wordsPerPage = Math.max(60, Math.floor(linesPerPage * wordsPerLine));

  return {
    paperSize: normalizedKey,
    paperDef,
    orientation,
    isLandscape,
    widthMm,
    heightMm,
    widthCm,
    heightCm,
    widthPx,
    heightPx,
    widthPt,
    heightPt,
    scale,
    zoom,
    fitWidthScale,
    marginsCm,
    marginsPx,
    headerHeightCm,
    footerHeightCm,
    headerHeightPx,
    footerHeightPx,
    printableWidthCm,
    printableHeightCm,
    printableWidthPx,
    printableHeightPx,
    capacity: {
      linesPerPage,
      wordsPerLine,
      wordsPerPage,
      lineHeightPx,
    },
  };
}

/**
 * Paginates an individual continuous HTML section based on mathematical word capacity
 */
function paginateSection(
  sectionHtml: string,
  metrics: UnifiedPaperMetrics
): string[] {
  if (!sectionHtml || !sectionHtml.trim()) {
    return ['<p><br></p>'];
  }

  const clean = sectionHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean ? clean.split(/\s+/).length : 0;

  // Single-page threshold: allow 15% tolerance before breaking a normal single page document
  // This prevents 1-page documents in the editor from breaking into 2 pages in PDF or Preview
  const singlePageThreshold = Math.round(metrics.capacity.wordsPerPage * 1.15);
  if (words <= singlePageThreshold) {
    return [sectionHtml];
  }

  // Split at top-level block boundaries
  const paragraphs = sectionHtml.split(/(?=<(?:p|h[1-6]|table|ul|ol|blockquote|div)\b)/gi).filter(Boolean);
  if (paragraphs.length <= 1) {
    return [sectionHtml];
  }

  const pages: string[] = [];
  let currentChunk = '';
  let currentWords = 0;
  const targetPerPage = metrics.capacity.wordsPerPage;

  for (const p of paragraphs) {
    const pClean = p.replace(/<[^>]*>/g, ' ').trim();
    const pWords = pClean ? pClean.split(/\s+/).filter(Boolean).length : 0;

    if (currentWords + pWords > targetPerPage && currentChunk) {
      pages.push(currentChunk);
      currentChunk = p;
      currentWords = pWords;
    } else {
      currentChunk += p;
      currentWords += pWords;
    }
  }

  if (currentChunk) {
    pages.push(currentChunk);
  }

  return pages.length > 0 ? pages : [sectionHtml];
}

/**
 * Unified document page splitting algorithm
 * Guarantees identical page count and slicing in WordEditor, PrintPreviewModal, PdfExportModal, and PDF Export
 */
export function calculateUnifiedDocumentPages(
  html: string,
  metrics: UnifiedPaperMetrics
): string[] {
  if (!html || !html.trim()) {
    return ['<p><br></p>'];
  }

  // 1. Detect explicit page breaks (div or hr with data-page-break or word-page-break class)
  const pageBreakRegex = /<div[^>]*data-page-break="true"[^>]*>[\s\S]*?<\/div>|<hr[^>]*class="[^"]*word-page-break[^"]*"[^>]*\/?>|<div[^>]*class="[^"]*word-page-break[^"]*"[^>]*>[\s\S]*?<\/div>/gi;

  pageBreakRegex.lastIndex = 0;
  if (pageBreakRegex.test(html)) {
    pageBreakRegex.lastIndex = 0;
    const explicitSections = html.split(pageBreakRegex);
    if (explicitSections.length > 1) {
      const result: string[] = [];
      for (let i = 0; i < explicitSections.length; i++) {
        const rawSec = explicitSections[i];
        const sec = rawSec && rawSec.trim().length > 0 ? rawSec : '<p><br></p>';
        const subPages = paginateSection(sec, metrics);
        result.push(...(subPages.length > 0 ? subPages : ['<p><br></p>']));
      }
      return result.length > 0 ? result : ['<p><br></p>'];
    }
  }

  return paginateSection(html, metrics);
}

/**
 * Human-readable Arabic label for paper dimensions
 */
export function formatPaperDimensionsLabel(metrics: UnifiedPaperMetrics): string {
  const orient = metrics.isLandscape ? 'أفقي' : 'عمودي';
  return `${metrics.paperSize} (${metrics.widthMm} × ${metrics.heightMm} مم - ${orient})`;
}
