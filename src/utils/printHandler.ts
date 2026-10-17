import { WordDocumentState } from '../types';

export interface PrintOptions {
  paperSize?: string;
  orientation?: 'portrait' | 'landscape';
  margins?: string;
  customMargins?: { top: number; bottom: number; left: number; right: number };
  colorMode?: 'color' | 'grayscale';
  showHeader?: boolean;
  showFooter?: boolean;
  headerText?: string;
  footerText?: string;
  watermarkText?: string;
  pageNumberFormat?: string;
  currentPage?: number;
  totalPages?: number;
  copies?: number;
  pageRangeMode?: 'all' | 'current' | 'custom';
  customPageRange?: string;
  duplexMode?: 'single' | 'duplex';
}

/**
 * Standard paper dimensions in mm
 */
const PAPER_DIMENSIONS: Record<string, { width: number; height: number }> = {
  A0: { width: 841, height: 1189 },
  A1: { width: 594, height: 841 },
  A2: { width: 420, height: 594 },
  A3: { width: 297, height: 420 },
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  A6: { width: 105, height: 148 },
  Letter: { width: 216, height: 279 },
  Legal: { width: 216, height: 356 },
  Executive: { width: 184, height: 267 },
};

/**
 * Convert margins preset or numbers to standard CSS margin string
 */
function resolveMarginCss(
  marginsType?: string,
  customMargins?: { top: number; bottom: number; left: number; right: number }
): string {
  if (customMargins && marginsType === 'custom') {
    const top = Math.max(0.1, customMargins.top || 2.54);
    const right = Math.max(0.1, customMargins.right || 2.54);
    const bottom = Math.max(0.1, customMargins.bottom || 2.54);
    const left = Math.max(0.1, customMargins.left || 2.54);
    return `${top}cm ${right}cm ${bottom}cm ${left}cm`;
  }

  switch (marginsType) {
    case 'narrow':
      return '1.27cm';
    case 'moderate':
      return '2.54cm 1.9cm';
    case 'wide':
      return '2.54cm 3.81cm';
    case 'minimum':
      return '0.5cm';
    case 'ultra-narrow':
      return '0.3cm';
    case 'normal':
    default:
      return '2.54cm';
  }
}

/**
 * Determines whether a DOM element is essentially empty
 * (e.g. empty paragraph, line break with no text, empty div)
 */
function isElementEmpty(el: Element): boolean {
  if (el.tagName === 'BR') return true;
  if (el.tagName === 'IMG' || el.tagName === 'TABLE' || el.tagName === 'HR' || el.tagName === 'IFRAME') {
    return false;
  }
  
  // If element contains image or table or canvas, it's not empty
  if (el.querySelector('img, table, hr, iframe, svg, canvas')) {
    return false;
  }

  const text = (el.textContent || '').replace(/[\s\u200B\u00A0\t\r\n]+/g, '');
  if (!text) {
    // Check if it has non-empty child elements
    const nonBrChildren = Array.from(el.children).filter((c) => c.tagName !== 'BR');
    return nonBrChildren.length === 0;
  }
  return false;
}

/**
 * Deep sanitization of the content DOM to remove editing controls,
 * redundant page breaks, and trailing empty whitespace that cause blank pages.
 */
function sanitizeContentDom(rawHtml: string): HTMLElement {
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(`<div>${rawHtml || ''}</div>`, 'text/html');
  const container = parsedDoc.body.firstElementChild as HTMLElement || parsedDoc.body;

  // 1. Remove all contenteditable and interactive attributes
  const allElements = container.querySelectorAll('*');
  allElements.forEach((el) => {
    el.removeAttribute('contenteditable');
    el.removeAttribute('spellcheck');
    el.removeAttribute('autocomplete');
    el.removeAttribute('tabindex');
    el.removeAttribute('data-word-target');
  });

  // 2. Remove all UI buttons, floating toolbars, and controls
  const unwantedSelectors = [
    'button',
    '.image-floating-toolbar',
    '.table-floating-toolbar',
    '.table-action-button',
    '.table-color-picker',
    '.ui-floating-tools',
    '.no-print',
    '[data-ui-element]',
    '#header-page-numbering',
    '#footer-page-numbering',
  ];
  unwantedSelectors.forEach((sel) => {
    container.querySelectorAll(sel).forEach((node) => node.remove());
  });

  // 3. Normalize & sanitize page-break elements
  const pageBreaks = container.querySelectorAll('.word-page-break, .word-section-break, [data-page-break="true"]');
  pageBreaks.forEach((pb) => {
    // Clear inner children (like "📄 نهاية الصفحة", "=== فاصل صفحات ===")
    pb.innerHTML = '';
    pb.className = 'print-page-break';
    pb.removeAttribute('contenteditable');
    pb.setAttribute(
      'style',
      'page-break-after: always !important; break-after: page !important; height: 0 !important; min-height: 0 !important; max-height: 0 !important; margin: 0 !important; padding: 0 !important; border: none !important; overflow: hidden !important; visibility: hidden !important; display: block !important;'
    );
  });

  // 4. Remove consecutive duplicate page breaks
  let prevIsPageBreak = false;
  const children = Array.from(container.children);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const isCurrentPageBreak = child.classList.contains('print-page-break');
    
    if (isCurrentPageBreak) {
      if (prevIsPageBreak) {
        child.remove();
        continue;
      }
      prevIsPageBreak = true;
    } else if (!isElementEmpty(child)) {
      prevIsPageBreak = false;
    }
  }

  // 5. Remove trailing empty paragraphs or page breaks from the end of the content
  // (Crucial: Prevents trailing empty pages in print output!)
  while (container.lastElementChild) {
    const last = container.lastElementChild;
    if (last.classList.contains('print-page-break')) {
      last.remove();
    } else if (isElementEmpty(last)) {
      last.remove();
    } else {
      break;
    }
  }

  // 6. Ensure proper styling for tables and table rows
  const tables = container.querySelectorAll('table');
  tables.forEach((t) => {
    t.style.width = '100%';
    t.style.borderCollapse = 'collapse';
    t.style.pageBreakInside = 'auto';
    t.style.margin = '12px 0';
    
    // Ensure table header repeats cleanly if present
    const thead = t.querySelector('thead');
    if (thead) {
      (thead as HTMLElement).style.display = 'table-header-group';
    }

    t.querySelectorAll('tr').forEach((tr) => {
      tr.style.pageBreakInside = 'avoid';
      (tr as HTMLElement).style.breakInside = 'avoid';
    });
  });

  // 7. Ensure images don't overflow or split mid-page
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.pageBreakInside = 'avoid';
    (img as HTMLElement).style.breakInside = 'avoid';
  });

  return container;
}

/**
 * Constructs a single connected DOM tree (Unified Worksheet) merging Header, Body, and Footer
 * with all controls removed and styles primed for printing.
 */
export function buildUnifiedPrintWorksheetDomTree(
  wordDoc: WordDocumentState,
  options?: PrintOptions
): { container: HTMLElement; fullHtml: string } {
  const orientation = options?.orientation || wordDoc.orientation || 'portrait';
  const paperSize = options?.paperSize || wordDoc.paperSize || 'A4';
  const isGrayscale = options?.colorMode === 'grayscale';
  const showHeader = options?.showHeader ?? (wordDoc.showHeader !== false);
  const showFooter = options?.showFooter ?? (wordDoc.showFooter !== false);
  const headerText = options?.headerText ?? (wordDoc.headerText || '');
  const footerText = options?.footerText ?? (wordDoc.footerText || '');
  const watermarkText = options?.watermarkText ?? wordDoc.watermarkText;
  const direction = wordDoc.direction || 'rtl';
  const marginCss = resolveMarginCss(options?.margins || wordDoc.margins, options?.customMargins || wordDoc.customMargins);

  // Border styles
  let borderCss = '';
  if (wordDoc.showBorders && wordDoc.borderStyle && wordDoc.borderStyle !== 'none') {
    const color = wordDoc.borderColor || '#1e3a8a';
    const width = wordDoc.borderWidth || 2;
    if (wordDoc.borderStyle === 'double') {
      borderCss = `border: ${Math.max(width, 3)}px double ${color}; padding: 14px;`;
    } else if (wordDoc.borderStyle === 'dashed') {
      borderCss = `border: ${Math.max(width, 2)}px dashed ${color}; padding: 14px;`;
    } else if (wordDoc.borderStyle === 'gold') {
      borderCss = `border: ${Math.max(width, 3)}px solid #b45309; outline: 2px solid #fde047; outline-offset: -5px; padding: 14px;`;
    } else if (wordDoc.borderStyle === 'islamic') {
      borderCss = `border: ${Math.max(width, 3)}px solid #065f46; outline: 2px dashed #10b981; outline-offset: -5px; padding: 14px;`;
    } else {
      borderCss = `border: ${width}px solid ${color}; padding: 14px;`;
    }
  }

  // Create unified worksheet root element
  const worksheet = document.createElement('div');
  worksheet.className = 'unified-print-worksheet';
  worksheet.setAttribute('dir', direction);
  worksheet.style.position = 'relative';
  worksheet.style.boxSizing = 'border-box';
  worksheet.style.width = '100%';
  worksheet.style.backgroundColor = wordDoc.pageBgColor || '#ffffff';
  worksheet.style.color = isGrayscale ? '#000000' : (wordDoc.textColor || '#000000');
  worksheet.style.fontFamily = `'${wordDoc.fontFamily || 'Cairo'}', 'Amiri', 'Tajawal', Arial, sans-serif`;
  worksheet.style.fontSize = `${wordDoc.fontSize || 13}pt`;
  worksheet.style.lineHeight = `${wordDoc.lineSpacing || 1.6}`;
  worksheet.style.textAlign = wordDoc.textAlign || 'right';
  worksheet.style.direction = direction;

  // 1. Watermark if configured
  if (watermarkText) {
    const watermarkEl = document.createElement('div');
    watermarkEl.className = 'print-watermark';
    watermarkEl.innerText = watermarkText;
    worksheet.appendChild(watermarkEl);
  }

  // 2. Header Element
  if (showHeader && (headerText || wordDoc.title)) {
    const headerEl = document.createElement('header');
    headerEl.className = 'print-worksheet-header';
    headerEl.innerHTML = `
      <div class="header-main-text">${headerText || wordDoc.title}</div>
      <div class="header-sub-info">${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
    `;
    worksheet.appendChild(headerEl);
  }

  // 3. Sanitized Content Body
  const contentWrapper = document.createElement('main');
  contentWrapper.className = 'print-worksheet-content';
  contentWrapper.style.position = 'relative';
  contentWrapper.style.zIndex = '1';
  contentWrapper.style.wordSpacing = `${wordDoc.wordSpacing ?? 0}pt`;

  const sanitizedBody = sanitizeContentDom(wordDoc.contentHtml || '');
  while (sanitizedBody.firstChild) {
    contentWrapper.appendChild(sanitizedBody.firstChild);
  }
  worksheet.appendChild(contentWrapper);

  // 4. Footer Element
  if (showFooter && (footerText || wordDoc.pageNumbering?.enabled !== false)) {
    const footerEl = document.createElement('footer');
    footerEl.className = 'print-worksheet-footer';
    
    const pageNumText = options?.currentPage && options?.totalPages 
      ? `صفحة ${options.currentPage} من ${options.totalPages}`
      : (wordDoc.title ? `${wordDoc.title}` : '');

    footerEl.innerHTML = `
      <div class="footer-main-text">${footerText}</div>
      <div class="footer-page-number">${pageNumText}</div>
    `;
    worksheet.appendChild(footerEl);
  }

  // Generate complete pristine HTML document string with print stylesheet
  const fullHtml = `<!DOCTYPE html>
<html dir="${direction}" lang="ar">
<head>
  <meta charset="utf-8">
  <title>${wordDoc.title || 'مستند وورد'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700;800&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: ${paperSize} ${orientation};
      margin: ${marginCss};
      duplex: ${options?.duplexMode === 'duplex' ? 'two-sided-long-edge' : 'one-sided'};
    }
    
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: ${wordDoc.pageBgColor || '#ffffff'} !important;
      color: ${isGrayscale ? '#000000' : (wordDoc.textColor || '#000000')};
      font-family: '${wordDoc.fontFamily || 'Cairo'}', 'Amiri', 'Tajawal', Arial, sans-serif;
      font-size: ${wordDoc.fontSize || 13}pt;
      line-height: ${wordDoc.lineSpacing || 1.6};
      direction: ${direction};
      text-align: ${wordDoc.textAlign || 'right'};
      ${isGrayscale ? 'filter: grayscale(100%);' : ''}
    }

    .unified-print-worksheet {
      width: 100%;
      margin: 0;
      padding: 0;
      ${borderCss}
    }

    .print-watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 72pt;
      font-weight: 800;
      color: rgba(148, 163, 184, 0.16);
      pointer-events: none;
      z-index: 0;
      white-space: nowrap;
      text-transform: uppercase;
      user-select: none;
    }

    .print-worksheet-header {
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 6px;
      margin-bottom: 16px;
      font-size: 10pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      page-break-after: avoid;
      break-after: avoid;
    }

    .print-worksheet-header .header-main-text {
      font-weight: 700;
      color: #334155;
    }

    .print-worksheet-content {
      position: relative;
      z-index: 1;
      line-height: ${wordDoc.lineSpacing || 1.6};
      word-spacing: ${wordDoc.wordSpacing ?? 0}pt;
    }

    .print-worksheet-content p,
    .print-worksheet-content div:not(.print-page-break):not(.print-worksheet-header):not(.print-worksheet-footer) {
      margin-top: ${wordDoc.paragraphSpacingBefore ?? 0}pt;
      margin-bottom: ${wordDoc.paragraphSpacingAfter ?? 6}pt;
      text-indent: ${(wordDoc.firstLineIndent ?? 0) <= 5 && (wordDoc.firstLineIndent ?? 0) > 0 ? `${wordDoc.firstLineIndent}cm` : `${wordDoc.firstLineIndent ?? 0}pt`};
    }

    .print-worksheet-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
      margin-top: 20px;
      font-size: 9pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      page-break-before: avoid;
      break-before: avoid;
    }

    .print-page-break {
      page-break-after: always !important;
      break-after: page !important;
      height: 0 !important;
      min-height: 0 !important;
      max-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      overflow: hidden !important;
      visibility: hidden !important;
      display: block !important;
      clear: both !important;
    }

    table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 12px 0 !important;
      page-break-inside: auto;
    }

    thead {
      display: table-header-group;
    }

    tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    th, td {
      border: 1px solid #94a3b8;
      padding: 6px 10px;
    }

    img {
      max-width: 100% !important;
      height: auto !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid !important;
      break-after: avoid !important;
      margin-top: 14pt;
      margin-bottom: 6pt;
    }

    blockquote {
      margin: 12px 0;
      padding: 8px 16px;
      border-right: 4px solid #3b82f6;
      background: #f8fafc;
    }

    .no-print, button, [contenteditable] {
      display: none !important;
    }
  </style>
</head>
<body>
  ${worksheet.outerHTML}
</body>
</html>`;

  return { container: worksheet, fullHtml };
}

/**
 * Dedicated Custom Print Handler (دالة طباعة مخصصة)
 * Merges Header, Body, and Footer into a single unified DOM tree,
 * cleans all interactive controls, and delivers flawless printing without empty or duplicate pages.
 */
export async function customDocumentPrintHandler(
  wordDoc: WordDocumentState,
  options?: PrintOptions
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const { fullHtml } = buildUnifiedPrintWorksheetDomTree(wordDoc, options);

      // Create hidden iframe for isolated clean printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        window.print();
        resolve(true);
        return;
      }

      iframeDoc.open();
      iframeDoc.write(fullHtml);
      iframeDoc.close();

      const triggerPrint = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (printErr) {
          console.warn('Iframe print error, falling back to window.print():', printErr);
          window.print();
        }

        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve(true);
        }, 3000);
      };

      // Ensure images and fonts are loaded before triggering print
      if (iframeDoc.readyState === 'complete') {
        setTimeout(triggerPrint, 350);
      } else {
        iframe.onload = () => {
          setTimeout(triggerPrint, 350);
        };
        // Fallback safety timeout
        setTimeout(triggerPrint, 1200);
      }
    } catch (err) {
      console.error('Critical print handler error:', err);
      window.print();
      resolve(false);
    }
  });
}
