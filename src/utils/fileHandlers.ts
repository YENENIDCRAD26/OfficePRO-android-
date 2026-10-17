import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import JSZip from 'jszip';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  Header, 
  Footer,
  PageNumber,
  UnderlineType
} from 'docx';
import { ExcelSheet, WordDocumentState, PdfExportOptions } from '../types';
import { getPageBorderDecoratorHtml } from '../components/WordEditor/PageBorderDecorator';
import { 
  calculateUnifiedPaperDimensionsAndScale, 
  calculateUnifiedDocumentPages, 
  normalizePaperSize 
} from './paperDimensions';
import { colIndexToLetter, evaluateFormula, parseCellAddress, getExcelUsedRange, formatCellValue } from './excelCalculations';
import { customDocumentPrintHandler, buildUnifiedPrintWorksheetDomTree, PrintOptions } from './printHandler';

export { customDocumentPrintHandler, buildUnifiedPrintWorksheetDomTree };
export type { PrintOptions };

// Parse DOCX files cleanly using JSZip without loading binary zip junk
export async function parseDocxFile(file: File): Promise<{ title: string; html: string }> {
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const docXml = await contents.file('word/document.xml')?.async('text');
    if (!docXml) {
      return { title: file.name, html: '<p>محتوى المستند فارغ</p>' };
    }
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(docXml, 'text/xml');
    const paragraphs = xmlDoc.getElementsByTagName('w:p');
    const htmlParas: string[] = [];
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      const textNodes = p.getElementsByTagName('w:t');
      let pText = '';
      for (let j = 0; j < textNodes.length; j++) {
        pText += textNodes[j].textContent || '';
      }
      if (pText.trim()) {
        htmlParas.push(`<p style="margin-bottom: 12px; line-height: 1.8;">${pText.trim()}</p>`);
      }
    }
    return {
      title: file.name.replace(/\.docx$/i, ''),
      html: htmlParas.join('') || '<p>تم استيراد مستند Word بنجاح.</p>',
    };
  } catch (e) {
    console.error('Failed to parse docx:', e);
    return { title: file.name, html: '<p>تعذر قراءة محتوى المستند</p>' };
  }
}

// Cleanly parse PDF files and decode UTF-16BE / Unicode Arabic text without binary gibberish
export function extractTextFromPdfRaw(rawContent: string): { title: string; html: string; restoredState?: Partial<WordDocumentState> } {
  // 1. Check for embedded Office Pro document state (lossless restoration)
  const stateMatch = rawContent.match(/%OFFICE_PRO_DOC_STATE_START%([\s\S]*?)%OFFICE_PRO_DOC_STATE_END%/);
  if (stateMatch && stateMatch[1]) {
    try {
      const decodedJson = decodeURIComponent(escape(atob(stateMatch[1].trim())));
      const parsed = JSON.parse(decodedJson);
      return {
        title: parsed.title || 'مستند مستعاد',
        html: parsed.contentHtml || '',
        restoredState: parsed,
      };
    } catch (e) {
      console.warn('Failed to parse embedded state:', e);
    }
  }

  // 2. Decode UTF-16BE / Unicode PDF text chunks without corrupted þ"þô characters
  const extractedLines: string[] = [];
  const textMatches = rawContent.match(/\((?:[^()\\]|\\.)*\)\s*T[jJ]/g) || [];
  
  if (textMatches.length > 0) {
    for (const match of textMatches) {
      let str = match.replace(/\)\s*T[jJ]$/, '').replace(/^\(/, '');
      // Unescape standard PDF octal and escape characters
      str = str.replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
               .replace(/\\n/g, '\n')
               .replace(/\\r/g, '\r')
               .replace(/\\t/g, '\t')
               .replace(/\\\\/g, '\\')
               .replace(/\\\(/g, '(')
               .replace(/\\\)/g, ')');

      // Decode UTF-16BE if begins with BOM (\xFE\xFF or þÿ)
      if (str.startsWith('\xfe\xff') || str.startsWith('þÿ')) {
        let decoded = '';
        for (let i = 2; i < str.length - 1; i += 2) {
          const code = (str.charCodeAt(i) << 8) | str.charCodeAt(i + 1);
          decoded += String.fromCharCode(code);
        }
        str = decoded;
      }
      if (str.trim()) {
        extractedLines.push(str.trim());
      }
    }
  }

  // 3. Fallback: filter out binary stream blocks and extract Arabic and text tokens
  let cleanText = extractedLines.join('\n');
  if (!cleanText.trim()) {
    let stripped = rawContent.replace(/stream[\s\S]*?endstream/gi, ' ');
    stripped = stripped.replace(/xref[\s\S]*?trailer/gi, ' ');
    stripped = stripped.replace(/<[0-9a-fA-F]+>/g, ' ');
    stripped = stripped.replace(/%PDF[\s\S]*?(\r|\n)/, ' ');
    const words = stripped.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9\s.,،؛:!؟()\-_\/]+/g) || [];
    cleanText = words
      .map(w => w.trim())
      .filter(w => w.length > 1 && !w.startsWith('obj') && !w.startsWith('endobj'))
      .join(' ');
  }

  const paragraphs = cleanText
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p style="margin-bottom: 12px; line-height: 1.8;">${p}</p>`)
    .join('');

  return {
    title: 'مستند PDF مستورد',
    html: paragraphs || '<p>تم استيراد محتوى المستند بنجاح.</p>',
  };
}

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

async function downloadBlob(blob: Blob, filename: string): Promise<string | void> {
  try {
    if (Capacitor.isNativePlatform()) {
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          const base64 = res.includes(',') ? res.split(',')[1] : res;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      try {
        const result = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true,
        });
        console.log('Saved via Capacitor Filesystem to Documents:', result.uri);
        return result.uri;
      } catch (docErr) {
        console.warn('Documents save failed, trying Cache/ExternalStorage:', docErr);
        try {
          const result2 = await Filesystem.writeFile({
            path: filename,
            data: base64Data,
            directory: Directory.Cache,
            recursive: true,
          });
          console.log('Saved via Capacitor Filesystem to Cache:', result2.uri);
          return result2.uri;
        } catch (cacheErr) {
          console.error('All native filesystem write attempts failed:', cacheErr);
          throw cacheErr;
        }
      }
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error('Filesystem / Download error:', err);
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {}
  }
}

export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':
      return 'application/msword';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'pdf':
      return 'application/pdf';
    case 'csv':
      return 'text/csv';
    case 'txt':
      return 'text/plain';
    case 'html':
      return 'text/html';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

export async function shareDocument(
  blob: Blob, 
  filename: string, 
  title: string = 'مشاركة المستند',
  targetApp?: 'system' | 'whatsapp' | 'bluetooth'
): Promise<{ success: boolean; cancelled?: boolean; method: string; error?: string }> {
  try {
    const mimeType = blob.type && blob.type !== 'application/octet-stream' ? blob.type : getMimeType(filename);
    const typedBlob = new Blob([blob], { type: mimeType });

    // 1. Native Capacitor on Android
    if (Capacitor.isNativePlatform()) {
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          const base64 = res.includes(',') ? res.split(',')[1] : res;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(typedBlob);
      });

      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      const dialogTitle = targetApp === 'whatsapp' 
        ? 'مشاركة المستند عبر واتساب' 
        : targetApp === 'bluetooth' 
          ? 'مشاركة المستند عبر البلوتوث / الإرسال القريب' 
          : 'مشاركة المستند عبر تطبيقات النظام';

      await Share.share({
        title: title,
        text: `مستند: ${filename}`,
        url: writeResult.uri,
        dialogTitle: dialogTitle,
      });

      return { success: true, method: 'capacitor-native-share' };
    }

    // 2. Web / Android Mobile Browser (Brave, Chrome on Android)
    const file = new File([typedBlob], filename, { type: mimeType, lastModified: Date.now() });

    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: title,
          text: `مستند: ${filename}`,
          files: [file],
        });
        return { success: true, method: 'web-share-files' };
      }
    } catch (err) {
      console.error('File share failed:', err);
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `مستند: ${filename}`,
        });
        return { success: true, method: 'web-share-text' };
      }
    } catch (err) {
      console.error('Text share failed:', err);
    }

    // 3. Fallback for Desktop/Non-share browsers: WhatsApp direct link or download
    if (targetApp === 'whatsapp') {
      const waText = encodeURIComponent(`${title}\nمستند: ${filename}\nتم إعداده عبر تطبيق محرر Word & Excel.`);
      window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
      await downloadBlob(typedBlob, filename);
      return { success: true, method: 'whatsapp-web' };
    }

    await downloadBlob(typedBlob, filename);
    return { success: true, method: 'download-fallback' };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { success: false, cancelled: true, method: 'user-cancelled' };
    }
    console.error('Share error:', err);
    try {
      await downloadBlob(blob, filename);
    } catch (e) {}
    return { success: false, method: 'error', error: err?.message };
  }
}

export async function generateDocumentBlob(
  mode: 'word' | 'excel',
  format: string,
  wordState: WordDocumentState,
  excelState: { title: string; sheets: ExcelSheet[] },
  customName?: string,
  csvOptions?: { delimiter: any; encoding: any }
): Promise<{ blob: Blob; filename: string }> {
  const finalName = (customName || (mode === 'word' ? wordState.title : excelState.title)).replace(/\.[^/.]+$/, '');
  
  if (mode === 'word') {
    switch (format) {
      case 'docx':
      case 'doc':
      case 'dotx':
      case 'dot':
      case 'docm': {
        const docxElements = htmlToDocxElements(wordState.contentHtml, wordState);
        const doc = new Document({ sections: [{ children: docxElements }] });
        const blob = await Packer.toBlob(doc);
        const ext = format === 'dotx' ? 'dotx' : format === 'dot' ? 'dot' : format === 'docm' ? 'docm' : format === 'doc' ? 'doc' : 'docx';
        return { blob, filename: `${finalName}.${ext}` };
      }
      case 'txt': {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = wordState.contentHtml;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        const blob = new Blob(['\ufeff', text], { type: 'text/plain;charset=utf-8' });
        return { blob, filename: `${finalName}.txt` };
      }
      case 'rtf': {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = wordState.contentHtml;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        const rtfContent = `{\\rtf1\\ansi\\ansicpg1256\\deff0\\nouicompat\\deflang1025{\\fonttbl{\\f0\\fnil\\fcharset178 Amiri;}}
{\\colortbl ;\\red0\\green0\\blue0;}
\\viewkind4\\uc1 
\\pard\\rtlpar\\qr\\lang1025\\f0\\fs${Math.round((wordState.fontSize || 14) * 2)} ${plainText}
\\par}`;
        const blob = new Blob([rtfContent], { type: 'application/rtf;charset=utf-8' });
        return { blob, filename: `${finalName}.rtf` };
      }
      case 'html': {
        const fullHtml = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${wordState.title}</title></head><body>${wordState.contentHtml}</body></html>`;
        const blob = new Blob(['\ufeff', fullHtml], { type: 'text/html;charset=utf-8' });
        return { blob, filename: `${finalName}.html` };
      }
      case 'pdf': {
        const blob = await generateWordPdfBlob(wordState);
        return { blob, filename: `${finalName}.pdf` };
      }
      default: {
        const docxElements = htmlToDocxElements(wordState.contentHtml, wordState);
        const doc = new Document({ sections: [{ children: docxElements }] });
        const blob = await Packer.toBlob(doc);
        return { blob, filename: `${finalName}.docx` };
      }
    }
  } else {
    const wb = buildExcelWorkbook(excelState.sheets);
    const activeSheet = excelState.sheets[0];
    switch (format) {
      case 'pdf': {
        const blob = await generateExcelPdfBlob(excelState.title, activeSheet);
        return { blob, filename: `${finalName}.pdf` };
      }
      case 'xlsx':
      case 'xltx': {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        return { blob, filename: `${finalName}.${format}` };
      }
      case 'xls': {
        const wbout = XLSX.write(wb, { bookType: 'biff8', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.ms-excel' });
        return { blob, filename: `${finalName}.xls` };
      }
      case 'xlsb': {
        const wbout = XLSX.write(wb, { bookType: 'xlsb', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.ms-excel.sheet.binary.macroEnabled.12' });
        return { blob, filename: `${finalName}.xlsb` };
      }
      case 'xlsm':
      case 'xltm': {
        const wbout = XLSX.write(wb, { bookType: 'xlsm', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.ms-excel.sheet.macroEnabled.12' });
        return { blob, filename: `${finalName}.${format}` };
      }
      case 'csv': {
        let csvContent = '\ufeff';
        let maxRow = 1;
        let maxCol = 1;
        Object.keys(activeSheet.data).forEach((addr) => {
          const p = parseCellAddress(addr);
          if (p) {
            if (p.row > maxRow) maxRow = p.row;
            if (p.colIndex + 1 > maxCol) maxCol = p.colIndex + 1;
          }
        });
        const delimiter = csvOptions?.delimiter || ';';
        for (let r = 1; r <= maxRow; r++) {
          const rowValues: string[] = [];
          for (let c = 0; c < maxCol; c++) {
            const addr = `${colIndexToLetter(c)}${r}`;
            const cell = activeSheet.data[addr];
            const val = cell ? (cell.formula?.startsWith('=') ? evaluateFormula(cell.formula, activeSheet.data) : (cell.value || '')) : '';
            rowValues.push(val.includes(delimiter) || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val);
          }
          csvContent += rowValues.join(delimiter) + '\r\n';
        }
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        return { blob, filename: `${finalName}_${activeSheet.name}.csv` };
      }
      default: {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        return { blob, filename: `${finalName}.xlsx` };
      }
    }
  }
}

// Convert HTML content into docx Paragraphs and Tables
function htmlToDocxElements(html: string, doc: WordDocumentState): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(html, 'text/html');
  const bodyNodes = Array.from(parsedDoc.body.childNodes);

  function getAlignment(alignStr: string): typeof AlignmentType[keyof typeof AlignmentType] {
    const s = alignStr.toLowerCase();
    if (s.includes('center')) return AlignmentType.CENTER;
    if (s.includes('left')) return AlignmentType.LEFT;
    if (s.includes('justify')) return AlignmentType.JUSTIFIED;
    return AlignmentType.RIGHT;
  }

  function parseTextRuns(node: Node, inheritStyle: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    color?: string;
    size?: number;
    font?: string;
  }): TextRun[] {
    const runs: TextRun[] = [];

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text) {
        runs.push(new TextRun({
          text,
          bold: inheritStyle.bold,
          italics: inheritStyle.italic,
          underline: inheritStyle.underline ? { type: UnderlineType.SINGLE } : undefined,
          strike: inheritStyle.strike,
          color: inheritStyle.color ? inheritStyle.color.replace('#', '') : undefined,
          size: inheritStyle.size ? inheritStyle.size * 2 : (doc.fontSize || 14) * 2, // docx uses half-points
          font: inheritStyle.font || 'Amiri',
          rightToLeft: true,
        }));
      }
      return runs;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      if (tagName === 'br') {
        runs.push(new TextRun({ break: 1 }));
        return runs;
      }

      const style = { ...inheritStyle };
      if (tagName === 'b' || tagName === 'strong') style.bold = true;
      if (tagName === 'i' || tagName === 'em') style.italic = true;
      if (tagName === 'u') style.underline = true;
      if (tagName === 's' || tagName === 'strike' || tagName === 'del') style.strike = true;

      // Extract inline styles
      if (el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight, 10) >= 700) style.bold = true;
      if (el.style.fontStyle === 'italic') style.italic = true;
      if (el.style.textDecoration?.includes('underline')) style.underline = true;
      if (el.style.textDecoration?.includes('line-through')) style.strike = true;
      if (el.style.color) {
        const hex = rgbOrNameToHex(el.style.color);
        if (hex) style.color = hex;
      }
      if (el.style.fontSize) {
        const parsedSize = parseFloat(el.style.fontSize);
        if (!isNaN(parsedSize)) style.size = parsedSize;
      }
      if (el.style.fontFamily) {
        style.font = el.style.fontFamily.replace(/['"]/g, '').split(',')[0].trim();
      }

      for (const child of Array.from(el.childNodes)) {
        runs.push(...parseTextRuns(child, style));
      }
    }

    return runs;
  }

  function rgbOrNameToHex(colorStr: string): string {
    if (colorStr.startsWith('#')) return colorStr.slice(1);
    if (colorStr.startsWith('rgb')) {
      const parts = colorStr.match(/\d+/g);
      if (parts && parts.length >= 3) {
        const r = parseInt(parts[0], 10).toString(16).padStart(2, '0');
        const g = parseInt(parts[1], 10).toString(16).padStart(2, '0');
        const b = parseInt(parts[2], 10).toString(16).padStart(2, '0');
        return `${r}${g}${b}`;
      }
    }
    return colorStr.replace(/[^a-zA-Z0-9]/g, '');
  }

  for (const node of bodyNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = node.textContent?.trim();
      if (txt) {
        elements.push(new Paragraph({
          children: [new TextRun({ text: txt, size: (doc.fontSize || 14) * 2, font: 'Amiri', rightToLeft: true })],
          alignment: getAlignment(doc.textAlign || 'right'),
          bidirectional: true,
        }));
      }
      continue;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if ((tag === 'div' && (el.getAttribute('data-page-break') === 'true' || el.classList.contains('word-page-break'))) || (tag === 'hr' && el.classList.contains('word-page-break'))) {
        elements.push(new Paragraph({
          children: [new TextRun({ text: '' })],
          pageBreakBefore: true,
        }));
        continue;
      }

      if (tag === 'table') {
        const rows: TableRow[] = [];
        const tableRows = el.querySelectorAll('tr');
        tableRows.forEach((tr) => {
          const cells: TableCell[] = [];
          const tds = tr.querySelectorAll('td, th');
          tds.forEach((td) => {
            const cellRuns = parseTextRuns(td, {});
            cells.push(new TableCell({
              children: [new Paragraph({ children: cellRuns, bidirectional: true, alignment: AlignmentType.RIGHT })],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
              },
            }));
          });
          if (cells.length > 0) {
            rows.push(new TableRow({ children: cells }));
          }
        });
        if (rows.length > 0) {
          elements.push(new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }));
        }
        continue;
      }

      let headingLevel: typeof HeadingLevel[keyof typeof HeadingLevel] | undefined;
      if (tag === 'h1') headingLevel = HeadingLevel.HEADING_1;
      else if (tag === 'h2') headingLevel = HeadingLevel.HEADING_2;
      else if (tag === 'h3') headingLevel = HeadingLevel.HEADING_3;

      const alignStyle = el.style.textAlign || doc.textAlign || 'right';
      const runs = parseTextRuns(el, {});

      elements.push(new Paragraph({
        children: runs.length > 0 ? runs : [new TextRun({ text: ' ' })],
        heading: headingLevel,
        alignment: getAlignment(alignStyle),
        bidirectional: true,
        spacing: {
          before: (doc.paragraphSpacingBefore ?? 4) * 20,
          after: (doc.paragraphSpacingAfter ?? 8) * 20,
          line: Math.round((doc.lineSpacing || 1.6) * 240),
        },
      }));
    }
  }

  if (elements.length === 0) {
    elements.push(new Paragraph({
      children: [new TextRun({ text: 'مستند وورد جديد', size: (doc.fontSize || 14) * 2, font: 'Amiri', rightToLeft: true })],
      bidirectional: true,
      alignment: AlignmentType.RIGHT,
    }));
  }

  return elements;
}

// Generate genuine Microsoft Word .docx binary file
export async function exportWordAsDocx(doc: WordDocumentState, customName?: string) {
  const docxElements = htmlToDocxElements(doc.contentHtml, doc);

  const docxDocument = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            orientation: doc.orientation === 'landscape' ? 'landscape' : 'portrait',
          },
          margin: {
            top: 1440, // 1 inch = 1440 twips (~2.5cm)
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
      headers: doc.showHeader !== false ? {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: doc.headerText || '',
                  size: 20, // 10pt
                  color: '666666',
                  font: 'Amiri',
                  rightToLeft: true,
                }),
              ],
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
            }),
          ],
        }),
      } : undefined,
      footers: doc.showFooter !== false ? {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: doc.footerText ? `${doc.footerText} | صفحة ` : 'صفحة ',
                  size: 18, // 9pt
                  color: '888888',
                  font: 'Amiri',
                  rightToLeft: true,
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                  color: '2563eb',
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              bidirectional: true,
            }),
          ],
        }),
      } : undefined,
      children: docxElements,
    }],
  });

  const blob = await Packer.toBlob(docxDocument);
  const rawTitle = (customName || doc.title).replace(/\.(docx|doc|html|txt)$/i, '');
  const filename = `${rawTitle}.docx`;
  downloadBlob(blob, filename);
}

// Export as Word Document (.doc / .docx)
// By default creates authentic .docx so mobile apps like Polaris Office open without mismatch error
export async function exportWordAsDoc(doc: WordDocumentState, customName?: string) {
  const docxElements = htmlToDocxElements(doc.contentHtml, doc);
  const docxDocument = new Document({
    sections: [{
      properties: {
        page: {
          size: { orientation: doc.orientation === 'landscape' ? 'landscape' : 'portrait' },
        },
      },
      children: docxElements,
    }],
  });
  const blob = await Packer.toBlob(docxDocument);
  const rawTitle = (customName || doc.title).replace(/\.(docx|doc|html|txt|rtf)$/i, '');
  downloadBlob(blob, `${rawTitle}.doc`);
}

// Export as RTF (Rich Text Format - supported on Android text readers)
export function exportWordAsRtf(doc: WordDocumentState, customName?: string) {
  const rawTitle = (customName || doc.title).replace(/\.(docx|doc|rtf|txt|html)$/i, '');
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = doc.contentHtml;
  const plainText = tempDiv.textContent || tempDiv.innerText || '';
  
  // Encode Arabic and special characters to RTF unicode escapes
  const rtfUnicode = plainText.split('').map((char) => {
    const code = char.charCodeAt(0);
    if (code > 127) {
      return `\\u${code}?`;
    }
    if (char === '\n') return '\\par\n';
    if (char === '\\' || char === '{' || char === '}') return `\\${char}`;
    return char;
  }).join('');

  const rtfContent = `{\\rtf1\\ansi\\ansicpg1256\\deff0\\nouicompat\\deflang1025{\\fonttbl{\\f0\\fnil\\fcharset178 Amiri;}{\\f1\\fnil\\fcharset178 Cairo;}}
{\\colortbl ;\\red0\\green0\\blue0;\\red30\\green58\\blue138;}
{\\*\\generator Office Pro Suite RTF Writer;}
\\viewkind4\\uc1 
\\pard\\rtlpar\\qr\\lang1025\\f1\\fs${Math.round((doc.fontSize || 14) * 2)} ${rtfUnicode}
\\par}`;
  const blob = new Blob([rtfContent], { type: 'application/rtf;charset=utf-8' });
  downloadBlob(blob, `${rawTitle}.rtf`);
}

// Export as Word Template (.dotx)
export async function exportWordAsDotx(doc: WordDocumentState, customName?: string) {
  const docxElements = htmlToDocxElements(doc.contentHtml, doc);
  const docxDocument = new Document({
    sections: [{
      properties: {
        page: {
          size: { orientation: doc.orientation === 'landscape' ? 'landscape' : 'portrait' },
        },
      },
      children: docxElements,
    }],
  });
  const blob = await Packer.toBlob(docxDocument);
  const rawTitle = (customName || doc.title).replace(/\.(docx|doc|dotx|dot|rtf|txt)$/i, '');
  downloadBlob(blob, `${rawTitle}.dotx`);
}

// Export as Classic Word Template (.dot)
export async function exportWordAsDot(doc: WordDocumentState, customName?: string) {
  const docxElements = htmlToDocxElements(doc.contentHtml, doc);
  const docxDocument = new Document({
    sections: [{
      properties: {
        page: {
          size: { orientation: doc.orientation === 'landscape' ? 'landscape' : 'portrait' },
        },
      },
      children: docxElements,
    }],
  });
  const blob = await Packer.toBlob(docxDocument);
  const rawTitle = (customName || doc.title).replace(/\.(docx|doc|dotx|dot|rtf|txt)$/i, '');
  downloadBlob(blob, `${rawTitle}.dot`);
}

// Export as Word Macro-Enabled Document (.docm)
export async function exportWordAsDocm(doc: WordDocumentState, customName?: string) {
  const docxElements = htmlToDocxElements(doc.contentHtml, doc);
  const docxDocument = new Document({
    sections: [{
      properties: {
        page: {
          size: { orientation: doc.orientation === 'landscape' ? 'landscape' : 'portrait' },
        },
      },
      children: docxElements,
    }],
  });
  const blob = await Packer.toBlob(docxDocument);
  const rawTitle = (customName || doc.title).replace(/\.(docx|doc|docm|dotx|dot|rtf|txt)$/i, '');
  downloadBlob(blob, `${rawTitle}.docm`);
}

// Export as plain text
export function exportWordAsTxt(doc: WordDocumentState, customName?: string) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = doc.contentHtml;
  const text = tempDiv.textContent || tempDiv.innerText || '';
  const blob = new Blob(['\ufeff', text], { type: 'text/plain;charset=utf-8' });
  const rawTitle = (customName || doc.title).replace(/\.(docx|doc|html|txt)$/i, '');
  downloadBlob(blob, `${rawTitle}.txt`);
}

// Export as HTML
export function exportWordAsHtml(doc: WordDocumentState, customName?: string) {
  const fullHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>${doc.title}</title>
  <style>
    body {
      font-family: 'Amiri', 'Cairo', 'Arial', sans-serif;
      font-size: ${doc.fontSize}pt;
      line-height: ${doc.lineSpacing};
      color: ${doc.textColor};
      direction: rtl;
      text-align: ${doc.textAlign};
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    td, th { border: 1px solid #cbd5e1; padding: 8px 12px; }
  </style>
</head>
<body>
  ${doc.showHeader !== false && doc.headerText ? `<div style="border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 20px; color: #666;">${doc.headerText}</div>` : ''}
  ${doc.contentHtml}
  ${doc.showFooter !== false && doc.footerText ? `<div style="border-top: 1px solid #ccc; padding-top: 8px; margin-top: 30px; color: #888;">${doc.footerText}</div>` : ''}
</body>
</html>`;
  const blob = new Blob(['\ufeff', fullHtml], { type: 'text/html;charset=utf-8' });
  const rawTitle = (customName || doc.title).replace(/\.(docx|doc|html|txt)$/i, '');
  downloadBlob(blob, `${rawTitle}.html`);
}

export function printWordDocument(
  wordDoc: WordDocumentState, 
  options?: PrintOptions
) {
  return customDocumentPrintHandler(wordDoc, options);
}

export function printExcelDocument(
  title: string, 
  sheet: ExcelSheet, 
  options?: { paperSize?: string; orientation?: 'portrait' | 'landscape'; margins?: string }
) {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      const orientation = options?.orientation || (sheet.rowCount > 20 ? 'portrait' : 'landscape');
      const paperSize = options?.paperSize || 'A4';
      const marginVal = options?.margins || '1.2cm';

      // 1. Calculate actual populated range (no empty rows 5-50 or columns E-Z!)
      const usedRange = getExcelUsedRange(sheet);
      const { minRow, maxRow, cols } = usedRange;

      let tableHtml = `
        <table style="width: 100%; border-collapse: collapse; font-size: 10.5pt; text-align: right; margin-top: 10px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="border: 1px solid #cbd5e1; padding: 7px 5px; width: 36px; text-align: center; color: #475569; font-weight: bold; background: #e2e8f0;">#</th>
      `;

      cols.forEach((colLetter) => {
        tableHtml += `<th style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: center; color: #1e293b; font-weight: bold; background: #f8fafc;">${colLetter}</th>`;
      });
      tableHtml += `</tr></thead><tbody>`;

      for (let r = minRow; r <= maxRow; r++) {
        tableHtml += `<tr><td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; background: #f8fafc; font-weight: 600; color: #64748b; font-size: 9pt;">${r}</td>`;
        cols.forEach((colLetter) => {
          const addr = `${colLetter}${r}`;
          const cell = sheet.data[addr];
          let displayVal = '';
          if (cell) {
            if (cell.formula && cell.formula.startsWith('=')) {
              displayVal = evaluateFormula(cell.formula, sheet.data);
            } else {
              displayVal = cell.value || '';
            }
            if (cell.format && cell.format !== 'general' && displayVal) {
              displayVal = formatCellValue(displayVal, cell.format);
            }
          }

          const isBold = cell?.bold ? 'font-weight: bold;' : '';
          const isItalic = cell?.italic ? 'font-style: italic;' : '';
          const isUnderline = cell?.underline ? 'text-decoration: underline;' : '';
          const cellColor = cell?.color ? `color: ${cell.color};` : 'color: #1e293b;';
          const cellBg = cell?.bg ? `background-color: ${cell.bg};` : (r % 2 === 0 ? 'background-color: #fafbfc;' : 'background-color: #ffffff;');
          const cellAlign = cell?.align ? `text-align: ${cell.align};` : 'text-align: right;';
          let borderCss = 'border: 1px solid #cbd5e1;';
          if (cell?.borderStyle === 'double_bottom') {
            borderCss = 'border: 1px solid #cbd5e1; border-bottom: 3px double #0369a1; font-weight: bold;';
          } else if (cell?.borderStyle === 'box') {
            borderCss = 'border: 2px solid #15803d; font-weight: bold;';
          }

          tableHtml += `<td style="${borderCss} padding: 6px 10px; ${isBold} ${isItalic} ${isUnderline} ${cellColor} ${cellBg} ${cellAlign} white-space: normal; word-break: normal; overflow-wrap: break-word; line-height: 1.5;">${displayVal}</td>`;
        });
        tableHtml += `</tr>`;
      }
      tableHtml += `</tbody></table>`;

      doc.open();
      doc.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8">
<title>${title} - ${sheet.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
<style>
  @page {
    size: ${paperSize} ${orientation};
    margin: ${marginVal};
  }
  *, *::before, *::after {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    margin: 0;
    padding: 6mm;
    font-family: 'Cairo', 'Amiri', Arial, sans-serif;
    background: #ffffff;
    direction: rtl;
    text-align: right;
    color: #1e293b;
    -webkit-font-smoothing: antialiased;
  }
  .header {
    border-bottom: 2px solid #059669;
    padding-bottom: 8px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    page-break-after: avoid;
  }
  table {
    width: 100% !important;
    border-collapse: collapse !important;
    page-break-inside: auto;
  }
  tr {
    page-break-inside: avoid !important;
  }
  .footer {
    margin-top: 14px;
    border-top: 1px dashed #cbd5e1;
    padding-top: 6px;
    font-size: 8.5pt;
    color: #64748b;
    display: flex;
    justify-content: space-between;
    align-items: center;
    page-break-before: avoid;
  }
</style>
</head>
<body>
<div class="header">
  <div>
    <h2 style="margin: 0; font-size: 15pt; color: #1e293b; font-weight: bold;">${title}</h2>
    <span style="font-size: 10pt; color: #059669; font-weight: bold;">ورقة: ${sheet.name}</span>
  </div>
  <div style="font-size: 9pt; color: #64748b; font-family: sans-serif;">
    <span>${orientation === 'landscape' ? 'أفقي ↔' : 'عمودي ↕'} | ${paperSize}</span>
  </div>
</div>
${tableHtml}
<div class="footer">
  <span style="font-weight: 600; color: #475569;">DOCX&XLSX-Editor</span>
  <span style="font-family: sans-serif; font-weight: bold; color: #059669;">معتمد للطباعة</span>
  <span>${new Date().toLocaleDateString('ar-EG')}</span>
</div>
</body>
</html>`);
      doc.close();

      const triggerPrint = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          window.print();
        }
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);
      };

      if (doc.fonts && doc.fonts.ready) {
        doc.fonts.ready.then(() => setTimeout(triggerPrint, 250));
      } else {
        setTimeout(triggerPrint, 400);
      }
      return;
    }
    window.print();
  } catch (err) {
    console.warn('Excel print error:', err);
    window.print();
  }
}

export function printDocument(wordDoc?: WordDocumentState) {
  if (wordDoc) {
    printWordDocument(wordDoc);
  } else {
    window.print();
  }
}

// Generate workbook for Excel
function buildExcelWorkbook(sheets: ExcelSheet[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const sheetData: (string | number)[][] = [];
    let maxRow = Math.max(sheet.rowCount, 10);
    let maxCol = Math.max(sheet.colCount, 8);

    Object.keys(sheet.data).forEach((cellKey) => {
      const parsed = parseCellAddress(cellKey);
      if (parsed) {
        if (parsed.row > maxRow) maxRow = parsed.row;
        if (parsed.colIndex + 1 > maxCol) maxCol = parsed.colIndex + 1;
      }
    });

    for (let r = 1; r <= maxRow; r++) {
      const rowArr: (string | number)[] = [];
      for (let c = 0; c < maxCol; c++) {
        const addr = `${colIndexToLetter(c)}${r}`;
        const cell = sheet.data[addr];
        if (!cell) {
          rowArr.push('');
        } else if (cell.formula && cell.formula.startsWith('=')) {
          const evalVal = evaluateFormula(cell.formula, sheet.data);
          const num = parseFloat(evalVal);
          rowArr.push(isNaN(num) ? evalVal : num);
        } else {
          const num = parseFloat(cell.value || '');
          rowArr.push(!isNaN(num) && (cell.value || '').trim() !== '' && !(cell.value || '').startsWith('0') ? num : (cell.value || ''));
        }
      }
      sheetData.push(rowArr);
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!views'] = [{ rightToLeft: true }];
    if (sheet.merges && sheet.merges.length > 0) {
      ws['!merges'] = sheet.merges.map((m) => {
        const s = parseCellAddress(m.start);
        const e = parseCellAddress(m.end);
        if (!s || !e) return null;
        return {
          s: { r: Math.min(s.row, e.row) - 1, c: Math.min(s.colIndex, e.colIndex) },
          e: { r: Math.max(s.row, e.row) - 1, c: Math.max(s.colIndex, e.colIndex) }
        };
      }).filter(Boolean) as any;
    }
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 31));
  });

  return wb;
}

// Export modern .xlsx
export function exportExcelAsXlsx(title: string, sheets: ExcelSheet[], customName?: string) {
  const wb = buildExcelWorkbook(sheets);
  const rawTitle = (customName || title).replace(/\.(xlsx|xls|csv)$/i, '');
  const filename = `${rawTitle}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, filename);
}

// Export legacy / classic .xls (Excel 97-2004 BIFF8 format)
export function exportExcelAsXls(title: string, sheets: ExcelSheet[], customName?: string) {
  const wb = buildExcelWorkbook(sheets);
  const rawTitle = (customName || title).replace(/\.(xlsx|xls|csv)$/i, '');
  const filename = `${rawTitle}.xls`;
  const wbout = XLSX.write(wb, { bookType: 'biff8', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, filename);
}

// Export Excel Binary Workbook (.xlsb - fast large binary format on Android)
export function exportExcelAsXlsb(title: string, sheets: ExcelSheet[], customName?: string) {
  const wb = buildExcelWorkbook(sheets);
  const rawTitle = (customName || title).replace(/\.(xlsx|xls|xlsb|csv|xlsm)$/i, '');
  const filename = `${rawTitle}.xlsb`;
  const wbout = XLSX.write(wb, { bookType: 'xlsb', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.ms-excel.sheet.binary.macroEnabled.12' });
  downloadBlob(blob, filename);
}

// Export Excel Macro-Enabled Workbook (.xlsm)
export function exportExcelAsXlsm(title: string, sheets: ExcelSheet[], customName?: string) {
  const wb = buildExcelWorkbook(sheets);
  const rawTitle = (customName || title).replace(/\.(xlsx|xls|xlsb|csv|xlsm)$/i, '');
  const filename = `${rawTitle}.xlsm`;
  const wbout = XLSX.write(wb, { bookType: 'xlsm', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.ms-excel.sheet.macroEnabled.12' });
  downloadBlob(blob, filename);
}

// Export Excel Template (.xltx)
export function exportExcelAsXltx(title: string, sheets: ExcelSheet[], customName?: string) {
  const wb = buildExcelWorkbook(sheets);
  const rawTitle = (customName || title).replace(/\.(xlsx|xls|xltx|csv)$/i, '');
  const filename = `${rawTitle}.xltx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template' });
  downloadBlob(blob, filename);
}

// Export Excel Macro Template (.xltm)
export function exportExcelAsXltm(title: string, sheets: ExcelSheet[], customName?: string) {
  const wb = buildExcelWorkbook(sheets);
  const rawTitle = (customName || title).replace(/\.(xlsx|xls|xltm|csv)$/i, '');
  const filename = `${rawTitle}.xltm`;
  const wbout = XLSX.write(wb, { bookType: 'xlsm', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.ms-excel.template.macroEnabled.12' });
  downloadBlob(blob, filename);
}

export interface CsvExportOptions {
  delimiter: ',' | ';' | '\t' | '|';
  encoding: 'utf-8-bom' | 'utf-8' | 'windows-1256' | 'iso-8859-6';
  exportScope?: 'active' | 'all';
}

// Export CSV with advanced options (delimiter, encoding)
export function exportExcelAsCsv(sheet: ExcelSheet, title: string, customName?: string, options?: CsvExportOptions) {
  const delimiter = options?.delimiter || ';';
  const encoding = options?.encoding || 'utf-8-bom';

  let csvContent = '';
  if (encoding === 'utf-8-bom') {
    csvContent = '\ufeff'; // UTF-8 BOM
  }

  let maxRow = 1;
  let maxCol = 1;

  Object.keys(sheet.data).forEach((addr) => {
    const p = parseCellAddress(addr);
    if (p) {
      if (p.row > maxRow) maxRow = p.row;
      if (p.colIndex + 1 > maxCol) maxCol = p.colIndex + 1;
    }
  });

  for (let r = 1; r <= maxRow; r++) {
    const rowValues: string[] = [];
    for (let c = 0; c < maxCol; c++) {
      const addr = `${colIndexToLetter(c)}${r}`;
      const cell = sheet.data[addr];
      let val = '';
      if (cell) {
        if (cell.formula && cell.formula.startsWith('=')) {
          val = evaluateFormula(cell.formula, sheet.data);
        } else {
          val = cell.value || '';
        }
      }
      const needsQuote = val.includes(delimiter) || val.includes('"') || val.includes('\n') || val.includes('\r');
      const escaped = needsQuote ? `"${val.replace(/"/g, '""')}"` : val;
      rowValues.push(escaped);
    }
    csvContent += rowValues.join(delimiter) + '\r\n';
  }

  let mimeType = 'text/csv;charset=utf-8;';
  if (encoding === 'windows-1256') {
    mimeType = 'text/csv;charset=windows-1256;';
  } else if (encoding === 'iso-8859-6') {
    mimeType = 'text/csv;charset=iso-8859-6;';
  }

  const blob = new Blob([csvContent], { type: mimeType });
  const rawTitle = (customName || title).replace(/\.(xlsx|xls|csv)$/i, '');
  downloadBlob(blob, `${rawTitle}_${sheet.name}.csv`);
}

export async function exportWordAsJpg(doc: WordDocumentState, customName?: string) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.backgroundColor = doc.pageBgColor || '#ffffff';
  container.style.padding = '40px';
  container.style.direction = doc.direction || 'rtl';
  container.style.fontFamily = `'${doc.fontFamily || 'Cairo'}', 'Amiri', Arial, sans-serif`;
  container.style.fontSize = `${doc.fontSize || 14}pt`;
  container.style.lineHeight = `${doc.lineSpacing || 1.6}`;
  container.style.color = doc.textColor || '#1e293b';
  container.style.textAlign = doc.textAlign || 'right';
  container.innerHTML = doc.contentHtml || '';
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: doc.pageBgColor || '#ffffff',
    });
    canvas.toBlob((blob) => {
      if (blob) {
        const rawTitle = (customName || doc.title).replace(/\.(docx|doc|pdf|jpg|jpeg|png|txt|html)$/i, '');
        downloadBlob(blob, `${rawTitle}.jpg`);
      }
    }, 'image/jpeg', 0.95);
  } finally {
    document.body.removeChild(container);
  }
}

export async function exportWordAsPng(doc: WordDocumentState, customName?: string) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.backgroundColor = doc.pageBgColor || '#ffffff';
  container.style.padding = '40px';
  container.style.direction = doc.direction || 'rtl';
  container.style.fontFamily = `'${doc.fontFamily || 'Cairo'}', 'Amiri', Arial, sans-serif`;
  container.style.fontSize = `${doc.fontSize || 14}pt`;
  container.style.lineHeight = `${doc.lineSpacing || 1.6}`;
  container.style.color = doc.textColor || '#1e293b';
  container.style.textAlign = doc.textAlign || 'right';
  container.innerHTML = doc.contentHtml || '';
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: doc.pageBgColor || '#ffffff',
    });
    canvas.toBlob((blob) => {
      if (blob) {
        const rawTitle = (customName || doc.title).replace(/\.(docx|doc|pdf|jpg|jpeg|png|txt|html)$/i, '');
        downloadBlob(blob, `${rawTitle}.png`);
      }
    }, 'image/png');
  } finally {
    document.body.removeChild(container);
  }
}

export async function exportExcelAsJpg(title: string, sheet: ExcelSheet, customName?: string) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1000px';
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '20px';
  container.style.direction = 'rtl';
  container.style.fontFamily = "'Cairo', 'Amiri', Arial, sans-serif";

  let maxRow = Math.max(sheet.rowCount, 10);
  let maxCol = Math.max(sheet.colCount, 8);
  Object.keys(sheet.data).forEach((cellKey) => {
    const parsed = parseCellAddress(cellKey);
    if (parsed) {
      if (parsed.row > maxRow) maxRow = parsed.row;
      if (parsed.colIndex + 1 > maxCol) maxCol = parsed.colIndex + 1;
    }
  });

  let tableHtml = `<h2 style="margin: 0 0 12px 0; font-size: 14pt; color: #1e293b;">${customName || title} - ${sheet.name}</h2>`;
  tableHtml += `<table style="width: 100%; border-collapse: collapse; font-size: 10pt; text-align: right; background: #fff;"><thead><tr style="background: #f1f5f9;"><th style="border: 1px solid #cbd5e1; padding: 6px; width: 35px; text-align: center;">#</th>`;
  for (let c = 0; c < maxCol; c++) {
    tableHtml += `<th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${colIndexToLetter(c)}</th>`;
  }
  tableHtml += `</tr></thead><tbody>`;

  for (let r = 1; r <= maxRow; r++) {
    tableHtml += `<tr><td style="border: 1px solid #cbd5e1; padding: 4px; text-align: center; background: #f8fafc;">${r}</td>`;
    for (let c = 0; c < maxCol; c++) {
      const addr = `${colIndexToLetter(c)}${r}`;
      const cell = sheet.data[addr];
      let displayVal = '';
      if (cell) {
        if (cell.formula && cell.formula.startsWith('=')) {
          displayVal = evaluateFormula(cell.formula, sheet.data);
        } else {
          displayVal = cell.value || '';
        }
      }
      const isBold = cell?.bold ? 'font-weight: bold;' : '';
      const isItalic = cell?.italic ? 'font-style: italic;' : '';
      const cellColor = cell?.color ? `color: ${cell.color};` : '';
      const cellBg = cell?.bg ? `background-color: ${cell.bg};` : '';
      const cellAlign = cell?.align ? `text-align: ${cell.align};` : '';
      tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 5px 8px; ${isBold} ${isItalic} ${cellColor} ${cellBg} ${cellAlign}">${displayVal}</td>`;
    }
    tableHtml += `</tr>`;
  }
  tableHtml += `</tbody></table>`;
  container.innerHTML = tableHtml;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    canvas.toBlob((blob) => {
      if (blob) {
        const resolvedName = typeof customName !== 'undefined' ? customName : (typeof title !== 'undefined' ? title : sheet.name);
        const rawTitle = resolvedName.replace(/\.(xlsx|xls|csv|jpg|jpeg|png)$/i, '');
        downloadBlob(blob, `${rawTitle}_${sheet.name}.jpg`);
      }
    }, 'image/jpeg', 0.95);
  } finally {
    document.body.removeChild(container);
  }
}

export async function exportExcelAsPng(title: string, sheet: ExcelSheet, customName?: string) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1000px';
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '20px';
  container.style.direction = 'rtl';
  container.style.fontFamily = "'Cairo', 'Amiri', Arial, sans-serif";

  let maxRow = Math.max(sheet.rowCount, 10);
  let maxCol = Math.max(sheet.colCount, 8);
  Object.keys(sheet.data).forEach((cellKey) => {
    const parsed = parseCellAddress(cellKey);
    if (parsed) {
      if (parsed.row > maxRow) maxRow = parsed.row;
      if (parsed.colIndex + 1 > maxCol) maxCol = parsed.colIndex + 1;
    }
  });

  let tableHtml = `<h2 style="margin: 0 0 12px 0; font-size: 14pt; color: #1e293b;">${customName || title} - ${sheet.name}</h2>`;
  tableHtml += `<table style="width: 100%; border-collapse: collapse; font-size: 10pt; text-align: right; background: #fff;"><thead><tr style="background: #f1f5f9;"><th style="border: 1px solid #cbd5e1; padding: 6px; width: 35px; text-align: center;">#</th>`;
  for (let c = 0; c < maxCol; c++) {
    tableHtml += `<th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${colIndexToLetter(c)}</th>`;
  }
  tableHtml += `</tr></thead><tbody>`;

  for (let r = 1; r <= maxRow; r++) {
    tableHtml += `<tr><td style="border: 1px solid #cbd5e1; padding: 4px; text-align: center; background: #f8fafc;">${r}</td>`;
    for (let c = 0; c < maxCol; c++) {
      const addr = `${colIndexToLetter(c)}${r}`;
      const cell = sheet.data[addr];
      let displayVal = '';
      if (cell) {
        if (cell.formula && cell.formula.startsWith('=')) {
          displayVal = evaluateFormula(cell.formula, sheet.data);
        } else {
          displayVal = cell.value || '';
        }
      }
      const isBold = cell?.bold ? 'font-weight: bold;' : '';
      const isItalic = cell?.italic ? 'font-style: italic;' : '';
      const cellColor = cell?.color ? `color: ${cell.color};` : '';
      const cellBg = cell?.bg ? `background-color: ${cell.bg};` : '';
      const cellAlign = cell?.align ? `text-align: ${cell.align};` : '';
      tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 5px 8px; ${isBold} ${isItalic} ${cellColor} ${cellBg} ${cellAlign}">${displayVal}</td>`;
    }
    tableHtml += `</tr>`;
  }
  tableHtml += `</tbody></table>`;
  container.innerHTML = tableHtml;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    canvas.toBlob((blob) => {
      if (blob) {
        const resolvedName = typeof customName !== 'undefined' ? customName : (typeof title !== 'undefined' ? title : sheet.name);
        const rawTitle = resolvedName.replace(/\.(xlsx|xls|csv|jpg|jpeg|png)$/i, '');
        downloadBlob(blob, `${rawTitle}_${sheet.name}.png`);
      }
    }, 'image/png');
  } finally {
    document.body.removeChild(container);
  }
}

// Generate Word Document as PDF Blob using jsPDF and html2canvas with full page-container compatibility
export async function generateWordPdfBlob(
  doc: WordDocumentState, 
  options?: PdfExportOptions,
  customName?: string
): Promise<Blob> {
  const orientation = options?.orientation || doc.orientation || 'portrait';
  const paperSize = options?.paperSize || doc.paperSize || 'A4';
  const margins = options?.margins || doc.margins || 'normal';

  // Exact unified mathematical calculations matching WordEditor, PrintPreviewModal & PdfExportModal
  const metrics = calculateUnifiedPaperDimensionsAndScale({
    paperSize,
    orientation,
    margins,
    customMargins: doc.customMargins,
    showHeader: doc.showHeader !== false && !!(doc.headerText || doc.title),
    showFooter: doc.showFooter !== false,
    fontSize: doc.fontSize || 14,
    lineSpacing: doc.lineSpacing || 1.6,
  });

  const widthMm = metrics.widthMm;
  const heightMm = metrics.heightMm;
  const widthPx = metrics.widthPx;
  const heightPx = metrics.heightPx;
  const marginTopPx = metrics.marginsPx.top;
  const marginBottomPx = metrics.marginsPx.bottom;
  const marginLeftPx = metrics.marginsPx.left;
  const marginRightPx = metrics.marginsPx.right;

  // Unified deterministic page splitting - 100% parity with WordEditor and PrintPreviewModal
  const pagesHtml = calculateUnifiedDocumentPages(doc.contentHtml || '', metrics);
  const totalPages = Math.max(1, pagesHtml.length);

  // Step 2: Initialize jsPDF
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
  });

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const borderDecoratorHtml = getPageBorderDecoratorHtml(doc);

  const watermarkHtml = doc.watermarkText ? `
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 68pt; font-weight: bold; color: rgba(148, 163, 184, 0.16); pointer-events: none; z-index: 0; white-space: nowrap; user-select: none;">
      ${doc.watermarkText}
    </div>
  ` : '';

  // Step 3: Render each page as an exact Word editor replica
  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageContainer = document.createElement('div');
    pageContainer.style.position = 'fixed';
    pageContainer.style.left = '0';
    pageContainer.style.top = '0';
    pageContainer.style.zIndex = '-9999';
    pageContainer.style.opacity = '0.01';
    pageContainer.style.pointerEvents = 'none';
    pageContainer.style.width = `${widthPx}px`;
    pageContainer.style.height = `${heightPx}px`;
    pageContainer.style.minHeight = `${heightPx}px`;
    pageContainer.style.maxHeight = `${heightPx}px`;
    pageContainer.style.backgroundColor = doc.pageBgColor || '#ffffff';
    pageContainer.style.direction = doc.direction || 'rtl';
    pageContainer.style.boxSizing = 'border-box';
    pageContainer.style.paddingTop = `${marginTopPx}px`;
    pageContainer.style.paddingBottom = `${marginBottomPx}px`;
    pageContainer.style.paddingLeft = `${marginLeftPx}px`;
    pageContainer.style.paddingRight = `${marginRightPx}px`;
    pageContainer.style.display = 'flex';
    pageContainer.style.flexDirection = 'column';
    pageContainer.style.justifyContent = 'space-between';
    pageContainer.style.overflow = 'hidden';
    pageContainer.style.position = 'relative';

    const headerHtml = doc.showHeader !== false && (doc.headerText || doc.title) ? `
      <div style="width: 100%; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; margin-bottom: 10px; font-size: 10pt; color: #64748b; display: flex; justify-content: space-between; align-items: center; z-index: 2; flex-shrink: 0;">
        <span style="font-weight: bold; color: #334155;">${doc.headerText || doc.title}</span>
        <span style="font-size: 8.5pt; color: #94a3b8;">${new Date().toLocaleDateString('ar-EG')}</span>
      </div>
    ` : '';

    const footerHtml = doc.showFooter !== false ? `
      <div style="width: 100%; border-top: 1px dashed #cbd5e1; padding-top: 5px; margin-top: 10px; font-size: 9.5pt; color: #64748b; display: flex; justify-content: space-between; align-items: center; z-index: 2; flex-shrink: 0;">
        <span>${doc.footerText || ''}</span>
        <span style="font-weight: bold; font-family: sans-serif; color: #475569;">صفحة ${pageIdx + 1} من ${totalPages}</span>
      </div>
    ` : '';

    pageContainer.innerHTML = `
      ${borderDecoratorHtml}
      ${watermarkHtml}
      ${headerHtml}
      <div class="pdf-word-content" style="flex: 1; width: 100%; overflow: hidden; word-break: break-word; position: relative; z-index: 1; font-family: '${doc.fontFamily || 'Cairo'}', 'Amiri', Arial, sans-serif; font-size: ${doc.fontSize || 14}pt; line-height: ${doc.lineSpacing || 1.6}; color: ${doc.textColor || '#1e293b'}; text-align: ${doc.textAlign || 'right'}; direction: ${doc.direction || 'rtl'}; word-spacing: ${doc.wordSpacing ?? 0}pt;">
        ${pagesHtml[pageIdx]}
      </div>
      ${footerHtml}
    `;

    document.body.appendChild(pageContainer);

    try {
      const canvas = await html2canvas(pageContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: doc.pageBgColor || '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);

      if (pageIdx === 0) {
        pdf.addImage(imgData, 'JPEG', 0, 0, widthMm, heightMm, undefined, 'FAST');
      } else {
        pdf.addPage([widthMm, heightMm], orientation);
        pdf.addImage(imgData, 'JPEG', 0, 0, widthMm, heightMm, undefined, 'FAST');
      }
    } finally {
      document.body.removeChild(pageContainer);
    }
  }

  // Step 4: Lossless document restoration metadata payload and download
  const rawTitle = (customName || doc.title).replace(/\.(docx|doc|html|txt|pdf)$/i, '');

  try {
    const statePayload = btoa(unescape(encodeURIComponent(JSON.stringify({
      title: doc.title,
      contentHtml: doc.contentHtml,
      headerText: doc.headerText,
      footerText: doc.footerText,
      paperSize: doc.paperSize,
      orientation: doc.orientation,
      margins: doc.margins,
      customMargins: doc.customMargins,
      fontSize: doc.fontSize,
      fontFamily: doc.fontFamily,
      lineSpacing: doc.lineSpacing,
      textAlign: doc.textAlign,
      textColor: doc.textColor,
      pageBgColor: doc.pageBgColor,
      borderStyle: doc.borderStyle,
      borderColor: doc.borderColor,
      borderWidth: doc.borderWidth,
      showBorders: doc.showBorders,
      showHeader: doc.showHeader,
      showFooter: doc.showFooter,
      watermarkText: doc.watermarkText,
      totalPages,
    }))));

    const pdfBlob = pdf.output('blob');
    return new Blob(
      [pdfBlob, `\n%OFFICE_PRO_DOC_STATE_START%${statePayload}%OFFICE_PRO_DOC_STATE_END%\n`], 
      { type: 'application/pdf' }
    );
  } catch (e) {
    return pdf.output('blob');
  }
}

// Export Word Document as PDF file download
export async function exportWordAsPdf(
  doc: WordDocumentState, 
  options?: PdfExportOptions, 
  customName?: string
): Promise<void> {
  const rawTitle = (customName || doc.title).replace(/\.[^/.]+$/, '');
  const blob = await generateWordPdfBlob(doc, options, customName);
  await downloadBlob(blob, `${rawTitle}.pdf`);
}

// Generate Excel Sheet as PDF Blob with full layout, colors, and styling
export async function generateExcelPdfBlob(
  title: string,
  sheet: ExcelSheet,
  options?: PdfExportOptions,
  customName?: string
): Promise<Blob> {
  const orientation = options?.orientation || (sheet.rowCount > 20 ? 'portrait' : 'landscape');
  const rawPaper = (options?.paperSize || 'a4').toLowerCase();
  const fitMode = options?.excelFitMode || 'fit-columns';
  const showGridlines = options?.showGridlines !== false;
  
  const paperDimsMm: Record<string, [number, number]> = {
    a0: [841, 1189],
    a1: [594, 841],
    a2: [420, 594],
    a3: [297, 420],
    a4: [210, 297],
    a5: [148, 210],
    a6: [105, 148],
    b0: [1000, 1414],
    b1: [707, 1000],
    b2: [500, 707],
    b3: [353, 500],
    b4: [250, 353],
    b5: [176, 250],
    letter: [216, 279],
    legal: [216, 356],
    executive: [184, 267],
  };

  const [pW, pH] = paperDimsMm[rawPaper] || [210, 297];
  const widthMm = orientation === 'landscape' ? Math.max(pW, pH) : Math.min(pW, pH);
  const heightMm = orientation === 'landscape' ? Math.min(pW, pH) : Math.max(pW, pH);

  const marginPreset = options?.margins || 'normal';
  const marginMm = marginPreset === 'narrow' ? 8 : marginPreset === 'wide' ? 20 : 12;
  const marginPx = Math.round(marginMm * 3.7795);

  const baseWidthPx = Math.round(widthMm * 3.7795);

  // 1. Calculate actual populated bounds (no empty rows or columns!)
  const usedRange = getExcelUsedRange(sheet);
  const { minRow, maxRow, cols, totalCols, totalRows } = usedRange;

  // Calculate typography and cell sizes
  let fontSizePt = 10;
  let cellPadding = '7px 10px';
  if (totalCols > 12) {
    fontSizePt = 7.5;
    cellPadding = '4px 6px';
  } else if (totalCols > 8) {
    fontSizePt = 8.5;
    cellPadding = '5px 8px';
  } else if (totalCols <= 5) {
    fontSizePt = 11;
    cellPadding = '8px 12px';
  }

  const borderStyle = showGridlines ? '1px solid #cbd5e1' : '1px solid transparent';

  // Available height calculation
  const headerHeightPx = 65;
  const footerHeightPx = 40;
  const estimatedRowHeightPx = fontSizePt * 2.8 + 18;
  const availableHeightPerPage = Math.round(heightMm * 3.7795) - (marginPx * 2) - headerHeightPx - footerHeightPx;
  
  let rowsPerPage = Math.max(10, Math.floor(availableHeightPerPage / estimatedRowHeightPx));
  // If totalRows fits on 1 page (up to 25 rows in portrait or 18 in landscape), fit on 1 page!
  if (fitMode === 'fit-sheet' || totalRows <= (orientation === 'landscape' ? 18 : 25)) {
    rowsPerPage = totalRows;
  }

  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
  });

  // Ensure fonts are loaded before capturing
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const startRow = minRow + pageIdx * rowsPerPage;
    const endRow = Math.min(maxRow, startRow + rowsPerPage - 1);

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.zIndex = '-9999';
    container.style.opacity = '0.01'; // Visible to layout engine so font shaping & HarfBuzz runs!
    container.style.pointerEvents = 'none';
    container.style.width = `${baseWidthPx}px`;
    container.style.minHeight = `${Math.round(heightMm * 3.7795)}px`;
    container.style.backgroundColor = '#ffffff';
    container.style.padding = `${marginPx}px`;
    container.style.direction = 'rtl';
    container.style.fontFamily = "'Cairo', 'Amiri', 'Tajawal', Arial, sans-serif";
    container.style.boxSizing = 'border-box';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'space-between';

    let tableHtml = `
      <div>
        <div style="margin-bottom: 14px; border-bottom: 2px solid #059669; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: baseline;">
          <div>
            <h1 style="margin: 0; font-size: 15pt; font-weight: bold; color: #1e293b; font-family: 'Cairo', Arial, sans-serif;">${customName || title}</h1>
            <span style="font-size: 10pt; color: #059669; font-weight: bold;">ورقة: ${sheet.name}</span>
          </div>
          <div style="text-align: left; font-size: 9pt; color: #64748b; font-family: sans-serif;">
            <span>${orientation === 'landscape' ? 'أفقي ↔' : 'عمودي ↕'} | ${rawPaper.toUpperCase()}</span>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: ${fontSizePt}pt; text-align: right; background: #fff; border: ${borderStyle};">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="border: ${borderStyle}; padding: ${cellPadding}; width: 38px; text-align: center; color: #475569; font-weight: bold; background: #e2e8f0;">#</th>
    `;

    cols.forEach((colLetter) => {
      tableHtml += `<th style="border: ${borderStyle}; padding: ${cellPadding}; text-align: center; color: #1e293b; font-weight: bold; background: #f8fafc;">${colLetter}</th>`;
    });
    tableHtml += `</tr></thead><tbody>`;

    for (let r = startRow; r <= endRow; r++) {
      tableHtml += `<tr><td style="border: ${borderStyle}; padding: ${cellPadding}; text-align: center; color: #64748b; font-weight: 600; background: #f8fafc; font-size: ${Math.max(7, fontSizePt - 1)}pt;">${r}</td>`;
      cols.forEach((colLetter) => {
        const addr = `${colLetter}${r}`;
        const cell = sheet.data[addr];
        let displayVal = '';
        if (cell) {
          if (cell.formula && cell.formula.startsWith('=')) {
            displayVal = evaluateFormula(cell.formula, sheet.data);
          } else {
            displayVal = cell.value || '';
          }
          if (cell.format && cell.format !== 'general' && displayVal) {
            displayVal = formatCellValue(displayVal, cell.format);
          }
        }

        const isBold = cell?.bold ? 'font-weight: bold;' : '';
        const isItalic = cell?.italic ? 'font-style: italic;' : '';
        const isUnderline = cell?.underline ? 'text-decoration: underline;' : '';
        const cellColor = cell?.color ? `color: ${cell.color};` : 'color: #1e293b;';
        const cellBg = cell?.bg ? `background-color: ${cell.bg};` : (r % 2 === 0 ? 'background-color: #fafbfc;' : 'background-color: #ffffff;');
        const cellAlign = cell?.align ? `text-align: ${cell.align};` : 'text-align: right;';
        let cellBorder = `border: ${borderStyle};`;
        if (cell?.borderStyle === 'double_bottom') {
          cellBorder = `border: ${borderStyle}; border-bottom: 3px double #0369a1; font-weight: bold;`;
        } else if (cell?.borderStyle === 'box') {
          cellBorder = 'border: 2px solid #15803d; font-weight: bold;';
        }

        tableHtml += `<td style="${cellBorder} padding: ${cellPadding}; ${isBold} ${isItalic} ${isUnderline} ${cellColor} ${cellBg} ${cellAlign} white-space: normal; word-break: normal; overflow-wrap: break-word; line-height: 1.45;">${displayVal}</td>`;
      });
      tableHtml += `</tr>`;
    }

    tableHtml += `</tbody></table>
      </div>
      <div style="margin-top: 14px; border-top: 1px dashed #cbd5e1; padding-top: 6px; font-size: 8.5pt; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; color: #475569;">DOCX&XLSX-Editor</span>
        <span style="font-family: sans-serif; font-weight: bold; color: #059669;">صفحة ${pageIdx + 1} من ${totalPages}</span>
        <span>${new Date().toLocaleDateString('ar-EG')}</span>
      </div>
    `;

    container.innerHTML = tableHtml;
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);

      if (pageIdx === 0) {
        pdf.addImage(imgData, 'JPEG', 0, 0, widthMm, heightMm, undefined, 'FAST');
      } else {
        pdf.addPage([widthMm, heightMm], orientation);
        pdf.addImage(imgData, 'JPEG', 0, 0, widthMm, heightMm, undefined, 'FAST');
      }
    } finally {
      document.body.removeChild(container);
    }
  }

  return pdf.output('blob');
}

// Export Excel Sheet as PDF file download
export async function exportExcelAsPdf(
  title: string,
  sheet: ExcelSheet,
  options?: PdfExportOptions,
  customName?: string
): Promise<void> {
  const rawTitle = (customName || title).replace(/\.(xlsx|xls|csv|pdf)$/i, '');
  const blob = await generateExcelPdfBlob(title, sheet, options, customName);
  await downloadBlob(blob, `${rawTitle}_${sheet.name}.pdf`);
}

// Export as Markdown
export function exportWordAsMd(doc: WordDocumentState, customName?: string) {
  let md = doc.contentHtml || '';
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n')
         .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n')
         .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n')
         .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n')
         .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
         .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
         .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
         .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
         .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
         .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
         .replace(/<br\s*[\/]?>/gi, '\n')
         .replace(/<[^>]+>/g, '');

  const blob = new Blob(['\ufeff', md], { type: 'text/markdown;charset=utf-8' });
  const rawTitle = (customName || doc.title).replace(/\.(docx|doc|html|txt|md)$/i, '');
  downloadBlob(blob, `${rawTitle}.md`);
}

// Aliases
export const exportToWordDoc = exportWordAsDoc;
export const exportToHTML = exportWordAsHtml;
export const exportToText = exportWordAsTxt;
export const exportToMarkdown = exportWordAsMd;
export const handlePrintDocument = printDocument;

export function exportToExcelXLSX(stateOrTitle: { title: string; sheets: ExcelSheet[] } | string, sheets?: ExcelSheet[]) {
  if (typeof stateOrTitle === 'string') {
    exportExcelAsXlsx(stateOrTitle, sheets || []);
  } else {
    exportExcelAsXlsx(stateOrTitle.title, stateOrTitle.sheets);
  }
}

export function exportToExcelXLS(stateOrTitle: { title: string; sheets: ExcelSheet[] } | string, sheets?: ExcelSheet[]) {
  if (typeof stateOrTitle === 'string') {
    exportExcelAsXls(stateOrTitle, sheets || []);
  } else {
    exportExcelAsXls(stateOrTitle.title, stateOrTitle.sheets);
  }
}

export function exportToCSV(sheet: ExcelSheet, title: string = 'بيانات_الجدول') {
  exportExcelAsCsv(sheet, title);
}

// 300 DPI High Resolution Screenshot Capture Tool (لقطة شاشة الصفحة المعاينة بدقة 300 نقطة في البوصة)
export async function captureElementScreenshot300Dpi(
  element: HTMLElement,
  options?: {
    format?: 'png' | 'jpeg';
    quality?: number;
    backgroundColor?: string;
  }
): Promise<{ dataUrl: string; blob: Blob; width: number; height: number }> {
  const scale = 2; // Optimized scale 2 to prevent text scattering and overlapping on mobile
  
  // Temporarily hide page boundary dots, crop marks, and handles during capture
  const originalStyles = new Map<HTMLElement, string>();
  const unwantedElements = element.querySelectorAll('.resize-handle, .page-boundary-dot, .crop-mark');
  unwantedElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    originalStyles.set(htmlEl, htmlEl.style.display);
    htmlEl.style.display = 'none';
  });

  try {
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: options?.backgroundColor || '#ffffff',
      onclone: (clonedDoc) => {
        const clonedBody = clonedDoc.body;
        if (clonedBody) {
          clonedBody.style.fontFamily = "'Cairo', 'Amiri', Arial, sans-serif";
          clonedBody.style.lineHeight = '1.6';
        }
      }
    });

    const format = options?.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = options?.quality ?? (options?.format === 'jpeg' ? 0.95 : 1);
    const dataUrl = canvas.toDataURL(format, quality);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), format, quality);
    });

    return {
      dataUrl,
      blob,
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    unwantedElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (originalStyles.has(htmlEl)) {
        htmlEl.style.display = originalStyles.get(htmlEl)!;
      }
    });
  }
}

export { downloadBlob };
