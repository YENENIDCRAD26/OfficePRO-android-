import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { WordDocumentState } from '../../types';
import { PageBorderDecorator } from './PageBorderDecorator';
import { WorkspaceScrollbars } from './WorkspaceScrollbars';
import { checkTextSpelling } from '../../utils/spellChecker';
import { 
  calculateUnifiedPaperDimensionsAndScale, 
  calculateUnifiedDocumentPages, 
  formatPaperDimensionsLabel 
} from '../../utils/paperDimensions';
import { 
  Plus, 
  Trash2, 
  Columns, 
  Rows, 
  Palette, 
  Edit2, 
  Check, 
  Maximize2, 
  Minimize2, 
  AlignRight, 
  AlignCenter, 
  AlignLeft,
  X,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  Move,
  WrapText,
  Copy,
  Scissors,
  Clipboard,
  CheckSquare
} from 'lucide-react';

export interface WordEditorAction {
  id: number;
  type: 'table' | 'image';
  action: string;
  value?: string;
}

interface WordEditorProps {
  docState: WordDocumentState;
  onUpdateContent: (html: string) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  onSelectTable?: (inTable: boolean) => void;
  onUpdateDoc?: (partial: Partial<WordDocumentState>) => void;
  lastAction?: WordEditorAction | null;
  activeTarget?: 'body' | 'header' | 'footer';
  onTargetFocus?: (target: 'body' | 'header' | 'footer') => void;
  isDarkMode?: boolean;
  isReadMode?: boolean;
  onAddNewPage?: (position?: 'end' | 'cursor') => void;
  onInsertPageBreak?: () => void;
  onDeletePage?: (pageIndex: number) => void;
}

export const WordEditor: React.FC<WordEditorProps> = ({
  docState,
  onUpdateContent,
  editorRef,
  onSelectTable,
  onUpdateDoc,
  lastAction,
  activeTarget = 'body',
  onTargetFocus,
  isDarkMode = false,
  isReadMode = false,
  onAddNewPage,
  onInsertPageBreak,
  onDeletePage,
}) => {
  const isUpdatingFromState = useRef(false);
  const [pageToDelete, setPageToDelete] = useState<number | null>(null);

  // Direct In-place Header and Footer Editable Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Table Floating Controls
  const [activeTableNode, setActiveTableNode] = useState<HTMLTableElement | null>(null);
  const [activeCellNode, setActiveCellNode] = useState<HTMLTableCellElement | null>(null);
  const [showTableColorMenu, setShowTableColorMenu] = useState(false);

  // Image Floating Controls
  const [activeImageNode, setActiveImageNode] = useState<HTMLImageElement | null>(null);

  // Spell Checker state & handlers
  const [isSpellCheckActive, setIsSpellCheckActive] = useState<boolean>(true);
  const [spellMenu, setSpellMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    word: string;
    suggestions: string[];
    targetNode?: HTMLElement;
  }>({ show: false, x: 0, y: 0, word: '', suggestions: [] });

  const handleApplySpellSuggestion = (suggestion: string) => {
    if (spellMenu.targetNode && spellMenu.targetNode.parentNode) {
      const textNode = document.createTextNode(suggestion);
      spellMenu.targetNode.parentNode.replaceChild(textNode, spellMenu.targetNode);
      handleInput();
    }
    setSpellMenu({ show: false, x: 0, y: 0, word: '', suggestions: [] });
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    handleSelectionOrClick(e);
    const target = (e.target as HTMLElement).closest('.spellcheck-error') as HTMLElement;
    if (target) {
      e.stopPropagation();
      const word = target.getAttribute('data-word') || target.textContent || '';
      const suggestionsStr = target.getAttribute('data-suggestions') || '';
      const suggestions = suggestionsStr ? suggestionsStr.split('|') : ['تصحيح إملائي'];
      const rect = target.getBoundingClientRect();
      setSpellMenu({
        show: true,
        x: rect.left,
        y: rect.bottom + 6,
        word,
        suggestions,
        targetNode: target,
      });
    } else {
      if (spellMenu.show) {
        setSpellMenu(prev => ({ ...prev, show: false }));
      }
    }
  };

  // Real-time spell check highlight effect pass
  useEffect(() => {
    if (!isSpellCheckActive || !editorRef.current || isUpdatingFromState.current) return;
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let n: Node | null;
    while ((n = walker.nextNode())) {
      if (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()) {
        if (n.parentElement && n.parentElement.tagName !== 'A' && !n.parentElement.classList.contains('spellcheck-error')) {
          textNodes.push(n as Text);
        }
      }
    }

    for (const textNode of textNodes) {
      const text = textNode.nodeValue || '';
      const words = text.match(/[\u0600-\u06FFa-zA-Z]+/g) || [];
      let modified = false;
      let newHtml = text;

      for (const w of words) {
        if (w.length <= 1) continue;
        const errors = checkTextSpelling(w);
        if (errors.length > 0) {
          const suggestions = errors[0].suggestions.join('|');
          const regex = new RegExp(`\\b${w}\\b`, 'g');
          newHtml = newHtml.replace(regex, `<span class="spellcheck-error" data-word="${w}" data-suggestions="${suggestions}" title="خطأ إملائي: انقر للاقتراحات">${w}</span>`);
          modified = true;
        }
      }

      if (modified && textNode.parentNode) {
        const span = document.createElement('span');
        span.innerHTML = newHtml;
        textNode.parentNode.replaceChild(span, textNode);
      }
    }
  }, [docState.contentHtml, isSpellCheckActive]);

  // Context Menu & Long Press state for mobile text selection / copy / cut / paste
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    selectedText: string;
  }>({ show: false, x: 0, y: 0, selectedText: '' });

  const longPressTimerRef = useRef<any>(null);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    longPressTimerRef.current = setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection ? selection.toString().trim() : '';
      setContextMenu({
        show: true,
        x: clientX,
        y: Math.max(20, clientY - 80),
        selectedText,
      });
    }, 550);
  };

  const handleTouchEndOrMove = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleContextMenuEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';
    setContextMenu({
      show: true,
      x: e.clientX,
      y: Math.max(20, e.clientY - 80),
      selectedText,
    });
  };

  const handleCopySelection = async () => {
    try {
      const selection = window.getSelection();
      const text = selection ? selection.toString() : contextMenu.selectedText;
      if (text) {
        await navigator.clipboard.writeText(text);
      } else {
        document.execCommand('copy');
      }
    } catch (e) {
      console.error(e);
    }
    setContextMenu({ show: false, x: 0, y: 0, selectedText: '' });
  };

  const handleCutSelection = async () => {
    try {
      document.execCommand('cut');
    } catch (e) {
      console.error(e);
    }
    setContextMenu({ show: false, x: 0, y: 0, selectedText: '' });
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        document.execCommand('insertText', false, text);
      }
    } catch (e) {
      try {
        const text = await navigator.clipboard.readText();
        if (text && editorRef.current) {
          editorRef.current.focus();
          document.execCommand('insertText', false, text);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setContextMenu({ show: false, x: 0, y: 0, selectedText: '' });
  };

  const handleSelectAllText = () => {
    try {
      if (editorRef.current) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else {
        document.execCommand('selectAll');
      }
    } catch (e) {
      console.error(e);
    }
    setContextMenu({ show: false, x: 0, y: 0, selectedText: '' });
  };

  // Array of refs for each discrete page sheet
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Unified mathematical dimensions, scale, margins and capacity
  const paperMetrics = useMemo(() => {
    return calculateUnifiedPaperDimensionsAndScale({
      paperSize: docState.paperSize,
      orientation: docState.orientation,
      zoom: docState.zoom,
      margins: docState.margins,
      customMargins: docState.customMargins,
      showHeader: docState.showHeader !== false,
      showFooter: docState.showFooter !== false,
      fontSize: docState.fontSize || 14,
      lineSpacing: docState.lineSpacing || 1.6,
    });
  }, [
    docState.paperSize,
    docState.orientation,
    docState.zoom,
    docState.margins,
    docState.customMargins,
    docState.showHeader,
    docState.showFooter,
    docState.fontSize,
    docState.lineSpacing,
  ]);

  const isLandscape = paperMetrics.isLandscape;
  const pageWidthCm = paperMetrics.widthCm;
  const pageHeightCm = paperMetrics.heightCm;
  const cmTicks = Array.from({ length: Math.ceil(pageWidthCm) + 1 }, (_, i) => i);
  const verticalCmTicks = Array.from({ length: Math.ceil(pageHeightCm) + 1 }, (_, i) => i);

  // Unified Document Pages (Exact mathematical parity across WordEditor, PrintPreviewModal & PDF Export)
  const unifiedPages = useMemo(() => {
    return calculateUnifiedDocumentPages(docState.contentHtml, paperMetrics);
  }, [docState.contentHtml, paperMetrics]);

  // Sync initial content once or when contentHtml changes externally
  useEffect(() => {
    if (isUpdatingFromState.current) return;
    const activeEl = document.activeElement;
    const isEditorFocused = pageRefs.current.some(ref => ref && (ref === activeEl || ref.contains(activeEl))) || 
                            Boolean(editorRef.current && (editorRef.current === activeEl || editorRef.current.contains(activeEl)));
    if (!isEditorFocused) {
      if (unifiedPages.length <= 1) {
        if (editorRef.current) {
          const cleanHtml = (docState.contentHtml || '').replace(/<div([^>]*class="[^"]*word-page-break[^"]*"[^>]*)>[\s\S]*?<\/div>/gi, '<div$1 contenteditable="false" data-page-break="true"></div>');
          if (editorRef.current.innerHTML.trim() !== cleanHtml.trim()) {
            editorRef.current.innerHTML = cleanHtml;
          }
        }
      } else {
        unifiedPages.forEach((sliceHtml, idx) => {
          const el = pageRefs.current[idx] || (idx === 0 ? editorRef.current : null);
          if (el && el.innerHTML.trim() !== sliceHtml.trim()) {
            el.innerHTML = sliceHtml;
          }
        });
      }
    }
  }, [docState.contentHtml, unifiedPages]);

  // Prevent internal scroll in contentEditable page body to avoid receding/disappearing content
  const resetInternalScroll = useCallback(() => {
    pageRefs.current.forEach((el) => {
      if (el) {
        if (el.scrollTop !== 0) el.scrollTop = 0;
        if (el.scrollLeft !== 0) el.scrollLeft = 0;
      }
    });
    if (editorRef.current) {
      if (editorRef.current.scrollTop !== 0) editorRef.current.scrollTop = 0;
      if (editorRef.current.scrollLeft !== 0) editorRef.current.scrollLeft = 0;
    }
  }, []);

  useEffect(() => {
    resetInternalScroll();
    const timer = setTimeout(resetInternalScroll, 30);
    return () => clearTimeout(timer);
  }, [docState.contentHtml, resetInternalScroll]);

  useEffect(() => {
    if (headerRef.current && document.activeElement !== headerRef.current) {
      if (headerRef.current.innerText !== docState.headerText) {
        headerRef.current.innerText = docState.headerText;
      }
    }
  }, [docState.headerText]);

  useEffect(() => {
    if (footerRef.current && document.activeElement !== footerRef.current) {
      if (footerRef.current.innerText !== docState.footerText) {
        footerRef.current.innerText = docState.footerText;
      }
    }
  }, [docState.footerText]);

  const handleInput = () => {
    isUpdatingFromState.current = true;
    if (unifiedPages.length <= 1) {
      if (editorRef.current) {
        onUpdateContent(editorRef.current.innerHTML);
      }
    } else {
      const chunks: string[] = [];
      for (let i = 0; i < unifiedPages.length; i++) {
        const el = pageRefs.current[i] || (i === 0 ? editorRef.current : null);
        chunks.push(el ? el.innerHTML : (unifiedPages[i] || ''));
      }
      const combined = chunks.join('<div class="word-page-break" contenteditable="false" data-page-break="true"></div>');
      onUpdateContent(combined);
    }
    setTimeout(() => {
      isUpdatingFromState.current = false;
    }, 50);
  };

  const handleSelectionOrClick = (e?: React.SyntheticEvent) => {
    const target = e?.target as HTMLElement | null;
    
    // Check if clicked an image
    if (target && target.tagName === 'IMG') {
      setActiveImageNode(target as HTMLImageElement);
    } else if (activeImageNode && target && !target.closest('.image-floating-toolbar')) {
      setActiveImageNode(null);
    }

    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return;
    
    // Check if selection is within a table
    let node: Node | null = selection.anchorNode;
    let foundTable: HTMLTableElement | null = null;
    let foundCell: HTMLTableCellElement | null = null;

    while (node && node !== editorRef.current) {
      if (node.nodeName === 'TD' || node.nodeName === 'TH') {
        foundCell = node as HTMLTableCellElement;
      }
      if (node.nodeName === 'TABLE') {
        foundTable = node as HTMLTableElement;
        break;
      }
      node = node.parentNode;
    }

    setActiveTableNode(foundTable);
    setActiveCellNode(foundCell);

    if (onSelectTable) {
      onSelectTable(Boolean(foundTable));
    }
  };

  // Table Manipulation Functions
  const handleAddRow = (position: 'above' | 'below') => {
    if (!activeTableNode || !activeCellNode) return;
    const currentRow = activeCellNode.parentElement as HTMLTableRowElement | null;
    if (!currentRow) return;

    const colCount = currentRow.cells.length;
    const newRow = document.createElement('tr');
    for (let i = 0; i < colCount; i++) {
      const td = document.createElement('td');
      td.style.border = '1px solid #cbd5e1';
      td.style.padding = '8px';
      td.innerHTML = 'خلية جديدة';
      newRow.appendChild(td);
    }

    if (position === 'above') {
      currentRow.parentNode?.insertBefore(newRow, currentRow);
    } else {
      currentRow.parentNode?.insertBefore(newRow, currentRow.nextSibling);
    }
    handleInput();
  };

  const handleDeleteRow = () => {
    if (!activeTableNode || !activeCellNode) return;
    const currentRow = activeCellNode.parentElement as HTMLTableRowElement | null;
    if (!currentRow) return;
    currentRow.remove();
    handleInput();
    setActiveCellNode(null);
  };

  const handleAddColumn = (position: 'left' | 'right') => {
    if (!activeTableNode || !activeCellNode) return;
    const colIndex = activeCellNode.cellIndex;
    const rows = activeTableNode.rows;

    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i].cells[colIndex];
      const newCell = rows[i].insertCell(position === 'left' ? colIndex : colIndex + 1);
      newCell.style.border = '1px solid #cbd5e1';
      newCell.style.padding = '8px';
      newCell.innerHTML = i === 0 ? 'عمود جديد' : 'بيان جديد';
      if (i === 0) newCell.style.fontWeight = 'bold';
    }
    handleInput();
  };

  const handleDeleteColumn = () => {
    if (!activeTableNode || !activeCellNode) return;
    const colIndex = activeCellNode.cellIndex;
    const rows = activeTableNode.rows;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i].cells.length > colIndex) {
        rows[i].deleteCell(colIndex);
      }
    }
    handleInput();
    setActiveCellNode(null);
  };

  const handleSetCellBg = (color: string) => {
    if (activeCellNode) {
      activeCellNode.style.backgroundColor = color;
      handleInput();
      setShowTableColorMenu(false);
    }
  };

  const handleDeleteTable = () => {
    if (activeTableNode) {
      activeTableNode.remove();
      handleInput();
      setActiveTableNode(null);
      setActiveCellNode(null);
      if (onSelectTable) onSelectTable(false);
    }
  };

  const handleAdjustCellWidth = (deltaPx: number) => {
    const table = activeTableNode || editorRef.current?.querySelector('table');
    const cell = activeCellNode || table?.querySelector('td, th') as HTMLTableCellElement | null;
    if (!cell || !table) return;

    const colIndex = cell.cellIndex;
    const currentW = cell.getBoundingClientRect().width;
    const newW = Math.max(35, Math.round(currentW + deltaPx));

    for (let i = 0; i < table.rows.length; i++) {
      const c = table.rows[i].cells[colIndex];
      if (c) {
        c.style.width = `${newW}px`;
        c.style.minWidth = `${newW}px`;
      }
    }
    handleInput();
  };

  const handleAdjustCellHeight = (deltaPx: number) => {
    const table = activeTableNode || editorRef.current?.querySelector('table');
    const cell = activeCellNode || table?.querySelector('td, th') as HTMLTableCellElement | null;
    if (!cell) return;

    const row = cell.parentElement as HTMLTableRowElement | null;
    if (!row) return;

    const currentH = row.getBoundingClientRect().height;
    const newH = Math.max(26, Math.round(currentH + deltaPx));
    row.style.height = `${newH}px`;
    for (let i = 0; i < row.cells.length; i++) {
      row.cells[i].style.height = `${newH}px`;
    }
    handleInput();
  };

  const handleDistributeCols = () => {
    const table = activeTableNode || editorRef.current?.querySelector('table');
    if (!table || table.rows.length === 0) return;
    const colsCount = table.rows[0].cells.length;
    if (colsCount === 0) return;
    const pct = (100 / colsCount).toFixed(2);
    for (let i = 0; i < table.rows.length; i++) {
      for (let j = 0; j < table.rows[i].cells.length; j++) {
        table.rows[i].cells[j].style.width = `${pct}%`;
      }
    }
    handleInput();
  };

  const handleDistributeRows = () => {
    const table = activeTableNode || editorRef.current?.querySelector('table');
    if (!table || table.rows.length === 0) return;
    for (let i = 0; i < table.rows.length; i++) {
      table.rows[i].style.height = '36px';
      for (let j = 0; j < table.rows[i].cells.length; j++) {
        table.rows[i].cells[j].style.height = '36px';
      }
    }
    handleInput();
  };

  const handleSetTableBorder = (style: 'all' | 'outline' | 'none') => {
    const table = activeTableNode || editorRef.current?.querySelector('table');
    if (!table) return;
    if (style === 'none') {
      table.style.border = 'none';
      for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
          table.rows[i].cells[j].style.border = 'none';
        }
      }
    } else if (style === 'outline') {
      table.style.border = '2px solid #0f172a';
      for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
          table.rows[i].cells[j].style.border = 'none';
        }
      }
    } else {
      table.style.border = '1px solid #94a3b8';
      for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
          table.rows[i].cells[j].style.border = '1px solid #cbd5e1';
        }
      }
    }
    handleInput();
  };

  const handleCustomTableBorder = (configStr?: string) => {
    const table = activeTableNode || editorRef.current?.querySelector('table');
    if (!table) return;

    let config: any = {
      sides: { top: true, bottom: true, left: true, right: true, insideH: true, insideV: true },
      color: '#334155',
      width: '1px',
      style: 'solid',
      target: 'table'
    };

    if (configStr) {
      try {
        config = { ...config, ...JSON.parse(configStr) };
      } catch (e) {
        console.warn('Failed to parse border config:', e);
      }
    }

    const { sides, color, width, style: bStyle, target } = config;
    const borderCss = `${width} ${bStyle} ${color}`;
    const noneCss = 'none';

    if (target === 'cell' && activeCellNode) {
      if (sides.top !== undefined) activeCellNode.style.borderTop = sides.top ? borderCss : noneCss;
      if (sides.bottom !== undefined) activeCellNode.style.borderBottom = sides.bottom ? borderCss : noneCss;
      if (sides.right !== undefined) activeCellNode.style.borderRight = sides.right ? borderCss : noneCss;
      if (sides.left !== undefined) activeCellNode.style.borderLeft = sides.left ? borderCss : noneCss;
    } else {
      table.style.borderCollapse = 'collapse';
      if (sides.top !== undefined) table.style.borderTop = sides.top ? borderCss : noneCss;
      if (sides.bottom !== undefined) table.style.borderBottom = sides.bottom ? borderCss : noneCss;
      if (sides.right !== undefined) table.style.borderRight = sides.right ? borderCss : noneCss;
      if (sides.left !== undefined) table.style.borderLeft = sides.left ? borderCss : noneCss;

      const totalRows = table.rows.length;
      for (let r = 0; r < totalRows; r++) {
        const row = table.rows[r];
        const isFirstRow = r === 0;
        const isLastRow = r === totalRows - 1;
        const totalCols = row.cells.length;

        for (let c = 0; c < totalCols; c++) {
          const cell = row.cells[c];
          const isFirstCol = c === 0;
          const isLastCol = c === totalCols - 1;

          if (isFirstRow) {
            if (sides.top !== undefined) cell.style.borderTop = sides.top ? borderCss : noneCss;
          } else {
            if (sides.insideH !== undefined) cell.style.borderTop = sides.insideH ? borderCss : noneCss;
          }

          if (isLastRow) {
            if (sides.bottom !== undefined) cell.style.borderBottom = sides.bottom ? borderCss : noneCss;
          } else {
            if (sides.insideH !== undefined) cell.style.borderBottom = sides.insideH ? borderCss : noneCss;
          }

          if (isFirstCol) {
            if (sides.right !== undefined) cell.style.borderRight = sides.right ? borderCss : noneCss;
          } else {
            if (sides.insideV !== undefined) cell.style.borderRight = sides.insideV ? borderCss : noneCss;
          }

          if (isLastCol) {
            if (sides.left !== undefined) cell.style.borderLeft = sides.left ? borderCss : noneCss;
          } else {
            if (sides.insideV !== undefined) cell.style.borderLeft = sides.insideV ? borderCss : noneCss;
          }
        }
      }
    }
    handleInput();
  };

  // Image manipulation
  const handleResizeImage = (widthPercent: string) => {
    const img = activeImageNode || editorRef.current?.querySelector('img');
    if (img) {
      img.style.width = widthPercent;
      img.style.maxWidth = '100%';
      handleInput();
    }
  };

  const handleAlignImage = (alignment: 'right' | 'center' | 'left') => {
    const img = activeImageNode || editorRef.current?.querySelector('img');
    if (img) {
      const parent = img.parentElement;
      if (parent) {
        parent.style.textAlign = alignment;
      }
      handleInput();
    }
  };

  const handleWrapImage = (wrap: 'inline' | 'float-right' | 'float-left') => {
    const img = activeImageNode || editorRef.current?.querySelector('img');
    if (!img) return;
    if (wrap === 'float-right') {
      img.style.float = 'right';
      img.style.margin = '0 0 12px 16px';
      img.style.display = 'inline';
    } else if (wrap === 'float-left') {
      img.style.float = 'left';
      img.style.margin = '0 16px 12px 0';
      img.style.display = 'inline';
    } else {
      img.style.float = 'none';
      img.style.margin = '8px auto';
      img.style.display = 'block';
    }
    handleInput();
  };

  const handleMoveImage = (direction: 'up' | 'down') => {
    const img = activeImageNode || editorRef.current?.querySelector('img');
    if (!img) return;
    const parent = (img.parentElement && img.parentElement !== editorRef.current) ? img.parentElement : img;
    if (direction === 'up' && parent.previousElementSibling) {
      parent.parentElement?.insertBefore(parent, parent.previousElementSibling);
    } else if (direction === 'down' && parent.nextElementSibling) {
      parent.parentElement?.insertBefore(parent.nextElementSibling, parent);
    }
    handleInput();
  };

  const handleDeleteImage = () => {
    const img = activeImageNode || editorRef.current?.querySelector('img');
    if (img) {
      const parent = img.parentElement;
      img.remove();
      if (parent && parent.childNodes.length === 0) parent.remove();
      handleInput();
      setActiveImageNode(null);
    }
  };

  // Listen to remote actions from WordRibbon (Insert Tab)
  useEffect(() => {
    if (!lastAction) return;
    const { type, action, value } = lastAction;

    if (type === 'table') {
      switch (action) {
        case 'insertRowAbove': handleAddRow('above'); break;
        case 'insertRowBelow': handleAddRow('below'); break;
        case 'insertColRight': handleAddColumn('right'); break;
        case 'insertColLeft': handleAddColumn('left'); break;
        case 'deleteRow': handleDeleteRow(); break;
        case 'deleteCol': handleDeleteColumn(); break;
        case 'deleteTable': handleDeleteTable(); break;
        case 'cellWidthPlus': handleAdjustCellWidth(25); break;
        case 'cellWidthMinus': handleAdjustCellWidth(-25); break;
        case 'cellHeightPlus': handleAdjustCellHeight(10); break;
        case 'cellHeightMinus': handleAdjustCellHeight(-10); break;
        case 'distributeCols': handleDistributeCols(); break;
        case 'distributeRows': handleDistributeRows(); break;
        case 'setCellBg': handleSetCellBg(value || '#f1f5f9'); break;
        case 'setTableBorder': handleSetTableBorder((value as any) || 'all'); break;
        case 'customBorder': handleCustomTableBorder(value); break;
      }
    } else if (type === 'image') {
      switch (action) {
        case 'resize': handleResizeImage(value || '50%'); break;
        case 'align': handleAlignImage((value as any) || 'center'); break;
        case 'wrap': handleWrapImage((value as any) || 'inline'); break;
        case 'moveUp': handleMoveImage('up'); break;
        case 'moveDown': handleMoveImage('down'); break;
        case 'delete': handleDeleteImage(); break;
      }
    }
  }, [lastAction]);

  // Exact Dynamic Synchronization between Paper Page and Rulers
  const workspaceRef = useRef<HTMLDivElement>(null);
  const horizontalRulerRef = useRef<HTMLDivElement>(null);
  const [cursorYCm, setCursorYCm] = useState<number | null>(null);
  const [cursorXCm, setCursorXCm] = useState<number | null>(null);
  
  const [pageBounds, setPageBounds] = useState<{
    top: number;
    right: number;
    left: number;
    width: number;
    height: number;
  }>({
    top: 0,
    right: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const updateRulerAlignment = useCallback(() => {
    const pageEl = document.getElementById('word-document-page');
    const ws = workspaceRef.current;
    if (!pageEl || !ws) return;

    const pageRect = pageEl.getBoundingClientRect();
    const wsRect = ws.getBoundingClientRect();

    setPageBounds({
      top: Math.round(pageRect.top - wsRect.top),
      right: Math.max(0, Math.round(wsRect.right - pageRect.right)),
      left: Math.max(0, Math.round(pageRect.left - wsRect.left)),
      width: Math.round(pageRect.width),
      height: Math.round(pageRect.height),
    });
  }, []);

  useEffect(() => {
    updateRulerAlignment();
    const id1 = requestAnimationFrame(() => {
      updateRulerAlignment();
      const id2 = requestAnimationFrame(() => {
        updateRulerAlignment();
      });
      return () => cancelAnimationFrame(id2);
    });
    window.addEventListener('resize', updateRulerAlignment);
    return () => {
      cancelAnimationFrame(id1);
      window.removeEventListener('resize', updateRulerAlignment);
    };
  }, [updateRulerAlignment, docState.zoom, docState.paperSize, docState.orientation, docState.margins, pageWidthCm, pageHeightCm]);

  useEffect(() => {
    const ws = workspaceRef.current;
    const pageEl = document.getElementById('word-document-page');
    if (!ws || !pageEl || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      updateRulerAlignment();
    });
    ro.observe(ws);
    ro.observe(pageEl);
    return () => ro.disconnect();
  }, [updateRulerAlignment]);

  const handleWorkspaceMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const pageEl = document.getElementById('word-document-page');
    if (pageEl) {
      const rect = pageEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const relYPx = e.clientY - rect.top;
        const relXPx = rect.right - e.clientX; // In RTL, right edge is 0cm
        
        const cmX = (relXPx / rect.width) * pageWidthCm;
        const totalHeightCm = pageHeightCm * (computedTotalPages || 1);
        const cmY = (relYPx / rect.height) * totalHeightCm;

        if (cmY >= 0 && cmY <= totalHeightCm) {
          const pageRelativeCm = cmY % pageHeightCm;
          setCursorYCm(Math.round(pageRelativeCm * 10) / 10);
        } else {
          setCursorYCm(null);
        }

        if (cmX >= 0 && cmX <= pageWidthCm) {
          setCursorXCm(Math.round(cmX * 10) / 10);
        } else {
          setCursorXCm(null);
        }
      }
    }
  };

  // Dynamic Paper Dimensions based on unified paperMetrics
  const getPageDimensions = () => {
    return { 
      width: `${paperMetrics.widthCm}cm`, 
      minWidth: `${paperMetrics.widthCm}cm`,
      minHeight: `${paperMetrics.heightCm}cm`,
      flexShrink: 0
    };
  };

  const activeMargins = paperMetrics.marginsCm;
  const headerHeight = paperMetrics.headerHeightCm;
  const footerHeight = paperMetrics.footerHeightCm;

  // Dynamic Page Border Styling
  const getBorderInlineStyles = (): React.CSSProperties => {
    return {
      border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
      boxShadow: isDarkMode 
        ? '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
        : '0 4px 20px -2px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.08)',
    };
  };

  const computedTotalPages = Math.max(1, unifiedPages.length);

  const toIndicNumerals = (num: number) => {
    const indicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/\d/g, (d) => indicDigits[parseInt(d, 10)]);
  };

  const getFormattedPageNumber = (pageIndex: number = 0) => {
    const opts = docState.pageNumbering;
    if (opts && opts.enabled === false) return null;
    const fmt = opts?.format || 'page_x_of_y';
    const pageNum = pageIndex + 1;
    switch (fmt) {
      case 'x_of_y':
        return `${pageNum} من ${computedTotalPages}`;
      case 'x_slash_y':
        return `${pageNum} / ${computedTotalPages}`;
      case 'dash_x_dash':
        return `– ${pageNum} –`;
      case 'arabic_indic':
        return `صفحة ${toIndicNumerals(pageNum)} من ${toIndicNumerals(computedTotalPages)}`;
      case 'page_x_of_y':
      default:
        return `صفحة ${pageNum} من ${computedTotalPages}`;
    }
  };

  const formattedPageNumber = getFormattedPageNumber(0);

  const handleJumpToCaret = () => {
    const sel = window.getSelection();
    const ws = workspaceRef.current;
    if (sel && sel.rangeCount > 0 && ws) {
      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect && rect.top !== 0) {
          ws.scrollBy({ top: rect.top - ws.clientHeight / 2, behavior: 'smooth' });
          return;
        }
      } catch {}
    }
    const editor = document.getElementById('word-body-editable');
    if (editor && ws) {
      ws.scrollTo({ top: editor.offsetTop - 50, behavior: 'smooth' });
    }
  };

  // Sync computedTotalPages with docState
  useEffect(() => {
    if (onUpdateDoc && docState.totalPages !== computedTotalPages) {
      onUpdateDoc({ totalPages: computedTotalPages });
    }
  }, [computedTotalPages, docState.totalPages, onUpdateDoc]);

  return (
    <div className={`flex-1 flex flex-col overflow-hidden relative ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#e2e8f0]'}`} dir="rtl">
      {/* Top-Right Corner Junction Box (0.0 cm) */}
      {docState.showRuler && (
        <div 
          className="absolute top-0 right-0 w-[24px] bg-slate-100 border-b border-l border-slate-300 z-40 flex items-center justify-center font-mono text-[8px] font-bold text-slate-700 shadow-2xs select-none no-print cursor-pointer hover:bg-slate-200 transition-colors"
          style={{ height: 'calc(28px + 0.3cm)' }}
          title="نقطة الصفر الموحدة للزاوية العليا اليمنى (0.0 سم)"
        >
          0.0
        </div>
      )}

      {/* Interactive Vertical Ruler (المسطرة القياسية التفاعلية العمودية في الحافة الجانبية اليمنى) */}
      {docState.showRuler ? (
        <div 
          className="absolute bottom-0 right-0 w-[24px] bg-slate-100 border-l border-slate-300 select-none shadow-2xs z-30 overflow-hidden no-print flex flex-col items-center"
          style={{ top: 'calc(28px + 0.3cm)' }}
          title="المسطرة العمودية التفاعلية بالسنتيمتر (تتزامن تلقائياً مع مقاس واتجاه وموضع الصفحة)"
        >
          {/* Synchronized Vertical Ruler Track */}
          <div
            className="w-full relative shrink-0 cursor-default transition-transform duration-75 flex flex-col"
            style={{
              transform: `translateY(${pageBounds.top}px)`,
              transformOrigin: 'top right',
            }}
            title="المسطرة العمودية القياسية بالسنتيمتر (دليل القياس وموقع المؤشر)"
          >
            {/* Live Cursor Indicator Line */}
            {cursorYCm !== null && (
              <div 
                className="absolute right-0 left-0 z-40 pointer-events-none flex items-center justify-between"
                style={{ top: `${(cursorYCm / pageHeightCm) * 100}%` }}
              >
                <div className="w-full h-px bg-rose-500 shadow-xs" />
                <span className="absolute left-0.5 -top-2 bg-rose-600 text-white font-mono text-[7px] px-0.5 rounded-xs leading-none shadow-xs">
                  {cursorYCm.toFixed(1)}
                </span>
              </div>
            )}

            {/* Render Vertical Track for each page */}
            {Array.from({ length: computedTotalPages }).map((_, pageIdx) => {
              const singlePageHeightPx = pageHeightCm * 37.79527559 * (docState.zoom / 100);

              return (
                <div
                  key={pageIdx}
                  className="w-full bg-white border-y border-slate-300 relative shrink-0 shadow-xs"
                  style={{
                    height: `${singlePageHeightPx}px`,
                    minHeight: `${singlePageHeightPx}px`,
                    marginBottom: '1.0cm',
                  }}
                >
                  {/* Top Margin Guide Zone */}
                  <div 
                    className="absolute top-0 right-0 left-0 bg-slate-200/80 border-b border-slate-400/80 z-10 hover:bg-blue-100/90 transition-colors pointer-events-none"
                    style={{ height: `${(activeMargins.top / pageHeightCm) * 100}%` }}
                    title={`الهامش العلوي (صفحة ${pageIdx + 1}): ${activeMargins.top} سم`}
                  >
                    <div className="absolute bottom-0 right-0 left-0 h-1 bg-blue-500/40" />
                  </div>

                  {/* Bottom Margin Guide Zone */}
                  <div 
                    className="absolute bottom-0 right-0 left-0 bg-slate-200/80 border-t border-slate-400/80 z-10 hover:bg-blue-100/90 transition-colors pointer-events-none"
                    style={{ height: `${(activeMargins.bottom / pageHeightCm) * 100}%` }}
                    title={`الهامش السفلي (صفحة ${pageIdx + 1}): ${activeMargins.bottom} سم`}
                  >
                    <div className="absolute top-0 right-0 left-0 h-1 bg-blue-500/40" />
                  </div>

                  {/* Millimeter Sub-ticks (every 0.1cm) */}
                  {Array.from({ length: Math.floor(pageHeightCm) * 10 }).map((_, mi) => {
                    const mm = (mi + 1) / 10;
                    if (mm % 0.5 === 0 || mm >= pageHeightCm) return null;
                    const pct = (mm / pageHeightCm) * 100;
                    return (
                      <div
                        key={`v-mm-${mi}`}
                        className="absolute left-0 select-none pointer-events-none opacity-30"
                        style={{
                          top: `${pct}%`,
                          transform: 'translateY(-50%)',
                        }}
                      >
                        <div className="h-[0.5px] w-1 bg-slate-400" />
                      </div>
                    );
                  })}

                  {/* Vertical Half-Centimeters */}
                  {Array.from({ length: Math.floor(pageHeightCm) }).map((_, i) => {
                    const halfCm = i + 0.5;
                    if (halfCm >= pageHeightCm) return null;
                    const pct = (halfCm / pageHeightCm) * 100;
                    return (
                      <div
                        key={`vh-${i}`}
                        className="absolute left-0 select-none pointer-events-none"
                        style={{
                          top: `${pct}%`,
                          transform: 'translateY(-50%)',
                        }}
                      >
                        <div className="h-[1px] w-1.5 bg-slate-400" />
                      </div>
                    );
                  })}

                  {/* Vertical Full Centimeters (All numbers 0.0, 1, 2, ... maxIntCm, and end mark) */}
                  {(() => {
                    const maxIntCm = Math.floor(pageHeightCm);
                    const items = [];
                    for (let cm = 0; cm <= maxIntCm; cm++) {
                      items.push(cm);
                    }
                    const hasDecimal = Math.abs(pageHeightCm - maxIntCm) > 0.15;

                    return (
                      <>
                        {items.map((cm) => {
                          const pct = (cm / pageHeightCm) * 100;
                          const isZero = cm === 0;

                          return (
                            <div
                              key={`v-cm-${cm}`}
                              className="absolute right-0 left-0 flex items-center justify-between select-none pointer-events-none px-0.5"
                              style={{
                                top: isZero ? '1.5px' : `${pct}%`,
                                transform: isZero ? 'none' : 'translateY(-50%)',
                              }}
                            >
                              <span className="text-[7px] font-mono font-medium text-slate-700 leading-none">
                                {isZero ? '0.0' : cm}
                              </span>
                              <div
                                className={`h-[1px] bg-slate-600 ${
                                  cm % 5 === 0 ? 'w-2 bg-slate-900 font-bold' : 'w-1.5 bg-slate-500'
                                }`}
                              />
                            </div>
                          );
                        })}

                        {/* Bottom End Mark */}
                        <div
                          className="absolute right-0 left-0 flex items-center justify-between select-none pointer-events-none px-0.5"
                          style={{
                            bottom: '1.5px',
                          }}
                        >
                          <span className="text-[7px] font-mono font-semibold text-slate-700 leading-none">
                            {hasDecimal ? Math.round(pageHeightCm).toFixed(1) : `${maxIntCm}.0`}
                          </span>
                          <div className="h-[1.5px] w-2 bg-slate-800" />
                        </div>
                      </>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Lateral Peripheral Spaces (المساحة الجانبية المحيطية: 2 سم بالجنب الأيسر و 2 سم بالجنب الأيمن) */}
      {/* Left Lateral Peripheral Space (2.0 cm) */}
      <div 
        className="absolute top-0 bottom-0 left-0 w-[2.0cm] bg-transparent pointer-events-none z-20 no-print"
        style={{ width: '2.0cm' }}
        title="المساحة المحيطية الجانبية اليسرى (2.0 سم)" 
      />

      {/* Right Lateral Peripheral Space (2.0 cm) */}
      <div 
        className="absolute top-0 bottom-0 bg-transparent pointer-events-none z-20 no-print"
        style={{ right: docState.showRuler ? '24px' : '0px', width: '2.0cm' }}
        title="المساحة المحيطية الجانبية اليمنى (2.0 سم)" 
      />

      {/* Horizontal Ruler (المسطرة الأفقية القياسية المتزامنة تلقائياً) */}
      {docState.showRuler && (
        <div 
          ref={horizontalRulerRef}
          className="bg-slate-100 border-b border-slate-300 h-7 select-none shadow-2xs overflow-hidden no-print shrink-0 relative"
          style={{
            marginRight: '24px',
            marginLeft: '24px',
          }}
        >
          {(() => {
            const effectivePageWidthPx = pageBounds.width > 0 
              ? pageBounds.width 
              : pageWidthCm * 37.79527559 * (docState.zoom / 100);

            return (
              <div 
                className="flex items-end h-full text-[9px] font-mono text-slate-500 border-x border-slate-300 absolute top-0 bg-white shrink-0 cursor-default transition-all duration-75"
                style={{ 
                  width: `${effectivePageWidthPx}px`, 
                  minWidth: `${effectivePageWidthPx}px`,
                  right: pageBounds.right > 0 ? `${pageBounds.right}px` : `max(0px, calc(50% - (${effectivePageWidthPx}px / 2)))`,
                }}
                title="المسطرة الأفقية القياسية بالسنتيمتر (دليل القياس وموقع المؤشر)"
              >
                {/* Margin Guides */}
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-slate-200/80 border-r border-slate-400/80 hover:bg-blue-100/90 transition-colors z-20 pointer-events-none" 
                  style={{ width: `${(activeMargins.left / pageWidthCm) * 100}%` }}
                  title={`الهامش الأيسر: ${activeMargins.left} سم (انقر للتعديل)`}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500/40" />
                  {/* Downward triangle marker indicator */}
                  <div className="absolute right-0 bottom-0 translate-x-1/2 flex flex-col items-center">
                    <div className="w-2.5 h-2 bg-slate-600 border border-slate-800 rounded-t-xs shadow-xs" />
                    <div className="w-0 h-0 border-x-[4px] border-x-transparent border-t-[5px] border-t-slate-800" />
                  </div>
                </div>

                <div 
                  className="absolute top-0 bottom-0 right-0 bg-slate-200/80 border-l border-slate-400/80 hover:bg-blue-100/90 transition-colors z-20 pointer-events-none" 
                  style={{ width: `${(activeMargins.right / pageWidthCm) * 100}%` }}
                  title={`الهامش الأيمن: ${activeMargins.right} سم (انقر للتعديل)`}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/40" />
                  {/* Upward triangle marker indicator */}
                  <div className="absolute left-0 bottom-0 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-2.5 h-2 bg-slate-600 border border-slate-800 rounded-t-xs shadow-xs" />
                    <div className="w-0 h-0 border-x-[4px] border-x-transparent border-t-[5px] border-t-slate-800" />
                  </div>
                </div>

                {/* Live Cursor Indicator Line on Horizontal Ruler */}
                {cursorXCm !== null && (
                  <div 
                    className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
                    style={{ right: `${(cursorXCm / pageWidthCm) * 100}%`, transform: 'translateX(50%)' }}
                  >
                    <div className="w-px h-full bg-rose-500 shadow-xs" />
                    <span className="absolute -top-1 bg-rose-600 text-white font-mono text-[7px] px-0.5 rounded-xs leading-none shadow-xs">
                      {cursorXCm.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Millimeter Sub-ticks (0.1, 0.2, 0.3...) */}
                {Array.from({ length: Math.floor(pageWidthCm) * 10 }).map((_, mi) => {
                  const mm = (mi + 1) / 10;
                  if (mm % 0.5 === 0 || mm >= pageWidthCm) return null;
                  const pct = (mm / pageWidthCm) * 100;
                  return (
                    <div
                      key={`mm-${mi}`}
                      className="absolute bottom-0 select-none pointer-events-none opacity-30"
                      style={{
                        right: `${pct}%`,
                        transform: 'translateX(50%)',
                      }}
                    >
                      <div className="w-[1px] h-1 bg-slate-500" />
                    </div>
                  );
                })}

                {/* Half-Centimeter Ticks (0.5, 1.5, 2.5...) */}
                {Array.from({ length: Math.floor(pageWidthCm) }).map((_, i) => {
                  const halfCm = i + 0.5;
                  if (halfCm >= pageWidthCm) return null;
                  const pct = (halfCm / pageWidthCm) * 100;
                  return (
                    <div
                      key={`half-${i}`}
                      className="absolute bottom-0 select-none pointer-events-none"
                      style={{
                        right: `${pct}%`,
                        transform: 'translateX(50%)',
                      }}
                    >
                      <div className="w-[1px] h-1.5 bg-slate-600" />
                    </div>
                  );
                })}

                {/* Full Centimeter Ticks & Numbers (0, 1, 2, ... maxIntCm, and end mark) */}
                {(() => {
                  const maxIntCm = Math.floor(pageWidthCm);
                  const items = [];
                  for (let cm = 0; cm <= maxIntCm; cm++) {
                    items.push(cm);
                  }
                  const hasDecimal = Math.abs(pageWidthCm - maxIntCm) > 0.15;

                  return (
                    <>
                      {items.map((cm) => {
                        const pct = (cm / pageWidthCm) * 100;
                        return (
                          <div
                            key={`h-cm-${cm}`}
                            className="absolute top-0 bottom-0 flex flex-col items-center select-none pointer-events-none"
                            style={{
                              right: `${pct}%`,
                              transform: 'translateX(50%)',
                            }}
                          >
                            <span className="text-[7.5px] font-mono font-medium text-slate-700 leading-none mt-1">
                              {cm}
                            </span>
                            <div
                              className={`w-[1px] mt-auto bg-slate-600 ${
                                cm % 5 === 0 ? 'h-3 bg-slate-900 font-bold' : 'h-2 bg-slate-600'
                              }`}
                            />
                          </div>
                        );
                      })}

                      {/* Final edge mark if non-integer width */}
                      {hasDecimal && (
                        <div
                          className="absolute top-0 bottom-0 flex flex-col items-center select-none pointer-events-none"
                          style={{
                            right: '100%',
                            transform: 'translateX(50%)',
                          }}
                        >
                          <span className="text-[7.5px] font-mono font-bold text-slate-800 leading-none mt-1">
                            {pageWidthCm.toFixed(1)}
                          </span>
                          <div className="w-[1.5px] mt-auto h-3 bg-slate-900" />
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            );
          })()}
        </div>
      )}

      {/* Top Peripheral Separating Space Line between Horizontal Ruler and Editor Container Box (سطر المساحة المحيطة الفاصلة = 1.0 cm) */}
      <div 
        className="top-peripheral-separator-strip w-full shrink-0 select-none no-print border-b border-slate-300/80 shadow-2xs z-20 transition-colors"
        style={{
          height: '1.0cm',
          minHeight: '1.0cm',
          maxHeight: '1.0cm',
          backgroundColor: isDarkMode ? '#1e293b' : '#cbd5e1',
          marginRight: docState.showRuler ? '24px' : '0px',
          marginLeft: docState.showRuler ? '24px' : '0px',
        }}
        title="سطر المساحة المحيطة الفاصلة بين شريط المسطرة الأفقية في الأعلى وصفحة حاوية المحرر (1.0 سم)"
      />

      {/* Floating Table Tools Bar (عند تحديد جدول) */}
      {activeTableNode && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-xl border border-slate-300 shadow-2xl px-3 py-1.5 z-40 flex items-center gap-1 text-xs no-print animate-in fade-in slide-in-from-top-2 flex-wrap max-w-[95vw] justify-center">
          <span className="font-bold text-blue-700 ml-1">أدوات الجدول:</span>
          
          {/* Cell width */}
          <button
            onClick={() => handleAdjustCellWidth(25)}
            className="flex items-center gap-0.5 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded font-bold transition"
            title="زيادة عرض الخلية والعمود"
          >
            <ArrowLeftRight className="w-3 h-3 text-blue-600" />
            <span>عرض +</span>
          </button>
          <button
            onClick={() => handleAdjustCellWidth(-25)}
            className="flex items-center gap-0.5 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded font-bold transition"
            title="إنقاص عرض الخلية والعمود"
          >
            <span>عرض -</span>
          </button>

          {/* Cell height */}
          <button
            onClick={() => handleAdjustCellHeight(10)}
            className="flex items-center gap-0.5 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded font-bold transition"
            title="زيادة ارتفاع الخلية والصف"
          >
            <ArrowUp className="w-3 h-3 text-indigo-600" />
            <span>ارتفاع +</span>
          </button>
          <button
            onClick={() => handleAdjustCellHeight(-10)}
            className="flex items-center gap-0.5 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded font-bold transition"
            title="إنقاص ارتفاع الخلية والصف"
          >
            <span>ارتفاع -</span>
          </button>

          <button
            onClick={handleDistributeCols}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
            title="توزيع الأعمدة بالتساوي"
          >
            تساوي الأعمدة
          </button>

          <div className="w-px h-4 bg-slate-300 mx-0.5" />
          
          <button
            onClick={() => handleAddRow('above')}
            className="flex items-center gap-0.5 px-2 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded transition"
            title="إدراج صف لأعلى"
          >
            <Plus className="w-3 h-3 text-blue-600" />
            <span>صف ↑</span>
          </button>

          <button
            onClick={() => handleAddRow('below')}
            className="flex items-center gap-0.5 px-2 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded transition"
            title="إدراج صف لأسفل"
          >
            <Plus className="w-3 h-3 text-blue-600" />
            <span>صف ↓</span>
          </button>

          <button
            onClick={() => handleAddColumn('right')}
            className="flex items-center gap-0.5 px-2 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded transition"
            title="إدراج عمود لليمين"
          >
            <Columns className="w-3 h-3 text-emerald-600" />
            <span>عمود ⇦</span>
          </button>

          <button
            onClick={() => handleAddColumn('left')}
            className="flex items-center gap-0.5 px-2 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded transition"
            title="إدراج عمود لليسار"
          >
            <Columns className="w-3 h-3 text-emerald-600" />
            <span>عمود ⇨</span>
          </button>

          <div className="w-px h-4 bg-slate-300 mx-0.5" />

          {/* Cell Color */}
          <div className="relative">
            <button
              onClick={() => setShowTableColorMenu(!showTableColorMenu)}
              className="flex items-center gap-0.5 px-2 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 rounded transition"
              title="تلوين الخلية الحالية"
            >
              <Palette className="w-3 h-3 text-amber-600" />
              <span>لون الخلية</span>
            </button>

            {showTableColorMenu && (
              <div className="absolute top-8 right-0 bg-white p-2 rounded-lg shadow-xl border border-slate-200 z-50 flex gap-1 w-44 flex-wrap">
                {['#ffffff', '#f8fafc', '#f1f5f9', '#dcfce7', '#bae6fd', '#fef08a', '#fee2e2', '#f3e8ff'].map((c) => (
                  <button
                    key={c}
                    onClick={() => handleSetCellBg(c)}
                    className="w-5 h-5 rounded border border-slate-300 hover:scale-110 transition"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleDeleteRow}
            className="flex items-center gap-0.5 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded transition"
            title="حذف الصف الحالي"
          >
            <Trash2 className="w-3 h-3" />
            <span>حذف صف</span>
          </button>

          <button
            onClick={handleDeleteColumn}
            className="flex items-center gap-0.5 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded transition"
            title="حذف العمود الحالي"
          >
            <Trash2 className="w-3 h-3" />
            <span>حذف عمود</span>
          </button>

          <button
            onClick={handleDeleteTable}
            className="flex items-center gap-0.5 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition mr-1"
            title="حذف الجدول كاملاً"
          >
            <X className="w-3 h-3" />
            <span>حذف الجدول</span>
          </button>
        </div>
      )}

      {/* Floating Image Tools Bar (عند تحديد صورة) */}
      {activeImageNode && (
        <div className="image-floating-toolbar absolute top-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-xl border border-slate-300 shadow-2xl px-3 py-1.5 z-40 flex items-center gap-1 text-xs no-print animate-in fade-in slide-in-from-top-2 flex-wrap justify-center">
          <span className="font-bold text-emerald-700 ml-1">التحكم بالصورة:</span>
          
          <button
            onClick={() => handleResizeImage('25%')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
          >
            25%
          </button>
          <button
            onClick={() => handleResizeImage('50%')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
          >
            50%
          </button>
          <button
            onClick={() => handleResizeImage('75%')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
          >
            75%
          </button>
          <button
            onClick={() => handleResizeImage('100%')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
          >
            100%
          </button>

          <div className="w-px h-4 bg-slate-300 mx-0.5" />

          {/* Move in Document */}
          <button
            onClick={() => handleMoveImage('up')}
            className="flex items-center gap-0.5 px-1.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-bold transition"
            title="نقل الصورة لأعلى المستند"
          >
            <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>نقل ↑</span>
          </button>
          <button
            onClick={() => handleMoveImage('down')}
            className="flex items-center gap-0.5 px-1.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-bold transition"
            title="نقل الصورة لأسفل المستند"
          >
            <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
            <span>نقل ↓</span>
          </button>

          <div className="w-px h-4 bg-slate-300 mx-0.5" />

          {/* Wrap text */}
          <button
            onClick={() => handleWrapImage('float-right')}
            className="flex items-center gap-0.5 px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
            title="التفاف النص مع الصورة لليمين"
          >
            <WrapText className="w-3.5 h-3.5 text-blue-600" />
            <span>التفاف يمين</span>
          </button>
          <button
            onClick={() => handleWrapImage('inline')}
            className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
            title="مضمن مع النص سطر بسطر"
          >
            مضمن
          </button>

          <div className="w-px h-4 bg-slate-300 mx-0.5" />

          <button
            onClick={() => handleAlignImage('right')}
            className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
            title="محاذاة يمين"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleAlignImage('center')}
            className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
            title="توسيط"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleAlignImage('left')}
            className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
            title="محاذاة يسار"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDeleteImage}
            className="flex items-center gap-0.5 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded transition mr-1 font-bold"
            title="حذف الصورة"
          >
            <Trash2 className="w-3 h-3" />
            <span>حذف</span>
          </button>
        </div>
      )}

      {/* Main Workspace Scrolling Area */}
      <div 
        ref={workspaceRef}
        className={`flex-1 overflow-auto pb-16 flex justify-center items-start transition-colors relative ${
          isDarkMode ? 'bg-[#0f172a]' : 'bg-[#e2e8f0]'
        }`}
        style={{
          paddingTop: '0px',
          paddingLeft: '2.0cm',
          paddingRight: '2.0cm',
          marginRight: docState.showRuler ? '24px' : '0px',
          marginLeft: docState.showRuler ? '24px' : '0px',
        }}
        onScroll={() => {
          updateRulerAlignment();
        }}
        onMouseMove={handleWorkspaceMouseMove}
        onMouseLeave={() => {
          setCursorYCm(null);
          setCursorXCm(null);
        }}
        onClick={handleEditorClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEndOrMove}
        onTouchMove={handleTouchEndOrMove}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEndOrMove}
        onContextMenu={handleContextMenuEvent}
      >
        {/* Realistic Multi-Page Canvas Sheets with Real-Time Page Boundaries, Margins, Headers and Footers (صندوق حاوية المحرر موسط بدقة ومتوافق مع مقاسات الورق) */}
        <div 
          id="word-editor-container-box"
          className="editor-container-box flex flex-col items-center shrink-0 pb-12 mx-auto self-start justify-start w-full" 
          style={{ 
            gap: '0px',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingTop: '0px',
          }}
        >
          {unifiedPages.map((pageHtml, pageIdx) => {
            const isFirst = pageIdx === 0;
            const isLast = pageIdx === unifiedPages.length - 1;
            const pageNum = pageIdx + 1;
            const pageFormattedNum = getFormattedPageNumber(pageIdx);

            return (
              <React.Fragment key={`page-wrapper-${pageIdx}`}>
                <div
                  className="page-sheet-wrapper relative flex justify-center items-start shrink-0"
                  style={{
                    width: `${paperMetrics.widthCm * paperMetrics.scale}cm`,
                    minWidth: `${paperMetrics.widthCm * paperMetrics.scale}cm`,
                    height: `${pageHeightCm * paperMetrics.scale}cm`,
                    margin: '0 auto',
                    padding: 0,
                    boxSizing: 'border-box',
                    overflow: 'visible',
                  }}
                >
                  <div
                    id={isFirst ? "word-document-page" : `word-document-page-${pageIdx}`}
                    className={`page-sheet transition-all rounded-[2px] relative flex flex-col justify-between shadow-2xl shrink-0 ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-900'
                    }`}
                    style={{
                      ...getPageDimensions(),
                      height: `${pageHeightCm}cm`,
                      minHeight: `${pageHeightCm}cm`,
                      maxHeight: `${pageHeightCm}cm`,
                      padding: 0,
                      boxSizing: 'border-box',
                      backgroundColor: isDarkMode ? '#1e293b' : (docState.pageBgColor || '#ffffff'),
                      color: isDarkMode ? '#f8fafc' : (docState.textColor || '#0f172a'),
                      transform: `scale(${paperMetrics.scale})`,
                      transformOrigin: 'top center',
                      fontFamily: docState.fontFamily,
                      fontSize: `${docState.fontSize || 14}pt`,
                      lineHeight: docState.lineSpacing || 1.6,
                      textAlign: docState.textAlign,
                      direction: docState.direction,
                      overflow: 'hidden',
                      ...getBorderInlineStyles(),
                    }}
                  >
                  {/* Authentic Page Border & Decorative Frame */}
                  <PageBorderDecorator 
                    docState={docState} 
                    pageWidthCm={pageWidthCm} 
                    pageHeightCm={pageHeightCm} 
                    totalPages={computedTotalPages}
                    pageNumber={pageNum}
                  />

                  {/* Watermark */}
                  {docState.watermarkText && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
                      <span className="text-slate-300/40 text-7xl font-bold -rotate-45 font-serif uppercase tracking-widest">
                        {docState.watermarkText}
                      </span>
                    </div>
                  )}

                  {/* Header Area (Real-Time Header per page) */}
                  {docState.showHeader !== false && (
                    <div 
                      data-header-area="true"
                      className={`border-b border-dashed transition-all select-text relative rounded-t-xs group mx-auto ${
                        activeTarget === 'header'
                          ? 'border-blue-500 ring-2 ring-blue-400/40 bg-blue-50/25'
                          : 'border-slate-300 hover:border-blue-400 focus-within:border-blue-500'
                      }`}
                      style={{
                        width: '100%',
                        paddingLeft: `${activeMargins.left}cm`,
                        paddingRight: `${activeMargins.right}cm`,
                        paddingTop: `${docState.showBorders ? '0.85cm' : '0.55cm'}`,
                        paddingBottom: '0.25cm',
                        height: `${Math.max(1.5, headerHeight)}cm`,
                        minHeight: `${Math.max(1.5, headerHeight)}cm`,
                        maxHeight: `${Math.max(1.5, headerHeight)}cm`,
                        boxSizing: 'border-box',
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-between overflow-hidden px-1">
                        <div
                          ref={isFirst ? headerRef : undefined}
                          id={isFirst ? "word-header-editable" : undefined}
                          data-word-target="header"
                          contentEditable={isFirst && !isReadMode}
                          suppressContentEditableWarning
                          onFocus={() => onTargetFocus?.('header')}
                          onClick={() => onTargetFocus?.('header')}
                          onInput={() => {
                            if (headerRef.current && onUpdateDoc) {
                              onUpdateDoc({ headerText: headerRef.current.innerText });
                            }
                          }}
                          onKeyUp={handleSelectionOrClick}
                          onMouseUp={handleSelectionOrClick}
                          className="flex-1 focus:outline-none transition-colors overflow-hidden leading-normal"
                          style={{
                            fontFamily: docState.fontFamily,
                            color: docState.textColor || '#1e293b',
                            fontSize: `${Math.max(10, (docState.fontSize || 14) - 2)}pt`,
                            textAlign: docState.textAlign || 'right',
                            direction: docState.direction || 'rtl',
                          }}
                        >
                          {isFirst ? (docState.headerText || '') : (docState.headerText || '')}
                        </div>

                        {pageFormattedNum && docState.pageNumbering?.position?.startsWith('top') && (
                          <div 
                            className="flex items-center gap-1 font-bold text-slate-600 text-[11px] shrink-0 bg-slate-100/95 px-2.5 py-0.5 rounded-full border border-slate-300 select-none mr-3 shadow-2xs"
                            title={`ترقيم الصفحات في الرأس: ${pageFormattedNum}`}
                          >
                            <span className="text-blue-700 font-bold font-sans">{pageFormattedNum}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Document Body Content (Editable across all pages) */}
                  <div
                    ref={(el) => {
                      if (isFirst) {
                        (editorRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                      }
                      pageRefs.current[pageIdx] = el;
                    }}
                    id={isFirst ? "word-body-editable" : `word-body-editable-${pageIdx}`}
                    data-word-target="body"
                    data-page-index={pageIdx}
                    contentEditable={!isReadMode}
                    suppressContentEditableWarning
                    onScroll={(e) => {
                      if (e.currentTarget.scrollTop !== 0) {
                        e.currentTarget.scrollTop = 0;
                      }
                      if (e.currentTarget.scrollLeft !== 0) {
                        e.currentTarget.scrollLeft = 0;
                      }
                    }}
                    onFocus={() => {
                      resetInternalScroll();
                      onTargetFocus?.('body');
                    }}
                    onClick={() => {
                      resetInternalScroll();
                      onTargetFocus?.('body');
                    }}
                    onInput={handleInput}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        if (onInsertPageBreak) {
                          onInsertPageBreak();
                        } else if (onAddNewPage) {
                          onAddNewPage('cursor');
                        }
                      }
                    }}
                    onKeyUp={handleSelectionOrClick}
                    onMouseUp={handleSelectionOrClick}
                    data-doc-editor="true"
                    className={`flex-1 focus:outline-none max-w-none z-10 transition-all ${
                      activeTarget === 'body' ? 'ring-1 ring-transparent' : ''
                    } ${
                      docState.columns === 2 ? 'columns-2 gap-8' : docState.columns === 3 ? 'columns-3 gap-6' : ''
                    }`}
                    style={{
                      fontFamily: docState.fontFamily,
                      color: docState.textColor,
                      fontSize: `${docState.fontSize || 14}pt`,
                      lineHeight: docState.lineSpacing || 1.6,
                      textAlign: docState.textAlign || 'right',
                      paddingLeft: `${activeMargins.left}cm`,
                      paddingRight: `${activeMargins.right}cm`,
                      paddingTop: `${docState.showHeader !== false ? Math.max(0.4, activeMargins.top - Math.max(1.5, headerHeight)) : (docState.showBorders ? Math.max(activeMargins.top, 1.8) : activeMargins.top)}cm`,
                      paddingBottom: `${docState.showFooter !== false ? Math.max(0.4, activeMargins.bottom - footerHeight) : (docState.showBorders ? Math.max(activeMargins.bottom, 1.8) : activeMargins.bottom)}cm`,
                      height: `calc(${pageHeightCm}cm - ${(docState.showHeader !== false ? Math.max(1.5, headerHeight) : 0) + (docState.showFooter !== false ? footerHeight : 0)}cm)`,
                      minHeight: `calc(${pageHeightCm}cm - ${(docState.showHeader !== false ? Math.max(1.5, headerHeight) : 0) + (docState.showFooter !== false ? footerHeight : 0)}cm)`,
                      overflow: 'visible',
                      boxSizing: 'border-box',
                    }}
                    {...(!isFirst ? { dangerouslySetInnerHTML: { __html: pageHtml } } : {})}
                  />

                  {/* Footer Area (Real-Time Footer per page) */}
                  {docState.showFooter !== false && (
                    <div 
                      data-footer-area="true"
                      className={`border-t border-dashed transition-all select-text relative text-xs rounded-b-xs group mx-auto ${
                        activeTarget === 'footer'
                          ? 'border-blue-500 ring-2 ring-blue-400/40 bg-blue-50/25'
                          : 'border-slate-300 hover:border-blue-400 focus-within:border-blue-500'
                      }`}
                      style={{
                        width: '100%',
                        paddingLeft: `${activeMargins.left}cm`,
                        paddingRight: `${activeMargins.right}cm`,
                        height: `${footerHeight}cm`,
                        minHeight: `${footerHeight}cm`,
                        maxHeight: `${footerHeight}cm`,
                        boxSizing: 'border-box',
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-between overflow-hidden px-3">
                        <div
                          ref={isFirst ? footerRef : undefined}
                          id={isFirst ? "word-footer-editable" : undefined}
                          data-word-target="footer"
                          contentEditable={isFirst && !isReadMode}
                          suppressContentEditableWarning
                          onFocus={() => onTargetFocus?.('footer')}
                          onClick={() => onTargetFocus?.('footer')}
                          onInput={() => {
                            if (footerRef.current && onUpdateDoc) {
                              onUpdateDoc({ footerText: footerRef.current.innerText });
                            }
                          }}
                          onKeyUp={handleSelectionOrClick}
                          onMouseUp={handleSelectionOrClick}
                          className="flex-1 focus:outline-none leading-normal transition-colors"
                          style={{
                            fontFamily: docState.fontFamily,
                            color: docState.textColor || '#475569',
                            fontSize: `${Math.max(10, (docState.fontSize || 14) - 3)}pt`,
                            textAlign: docState.textAlign || 'right',
                            direction: docState.direction || 'rtl',
                          }}
                        >
                          {docState.footerText || ''}
                        </div>

                        {pageFormattedNum && !docState.pageNumbering?.position?.startsWith('top') && (
                          <div 
                            className="flex items-center gap-1 font-bold text-slate-600 text-[11px] shrink-0 bg-slate-100/95 px-2.5 py-0.5 rounded-full border border-slate-300 select-none mr-3 shadow-2xs"
                            title={`ترقيم الصفحات الرسمي: ${pageFormattedNum}`}
                          >
                            <span className="text-blue-700 font-bold font-sans">{pageFormattedNum}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Styles for Line Spacing, Paragraph Spacing, Word Spacing, Indent & Page Breaks */}
                  <style>{`
                    @media print {
                      @page {
                        size: ${pageWidthCm}cm ${pageHeightCm}cm ${isLandscape ? 'landscape' : 'portrait'};
                        margin: 0;
                      }
                      body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                      }
                      .no-print, button:not(.page-sheet *), [contenteditable="false"]:not(.page-sheet *) {
                        display: none !important;
                      }
                      #word-document-page {
                        width: ${pageWidthCm}cm !important;
                        min-height: ${pageHeightCm}cm !important;
                        height: auto !important;
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        page-break-after: avoid;
                      }
                      table {
                        width: 100% !important;
                        page-break-inside: auto;
                      }
                      tr, img, blockquote {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                      }
                      h1, h2, h3, h4, h5, h6 {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                      }
                    }
                    [data-doc-editor="true"],
                    [data-doc-editor="true"] *,
                    [data-doc-editor="true"] p, 
                    [data-doc-editor="true"] div,
                    [data-doc-editor="true"] span,
                    [data-doc-editor="true"] li {
                      line-height: ${docState.lineSpacing || 1.6} !important;
                    }
                    [data-doc-editor="true"] {
                      font-family: ${docState.fontFamily || "'Amiri', serif"};
                      color: ${docState.textColor || '#000000'};
                      font-size: ${docState.fontSize || 14}pt;
                      word-spacing: ${docState.wordSpacing ?? 0}pt;
                    }
                    [data-doc-editor="true"] p, 
                    [data-doc-editor="true"] div:not([data-header-area]):not([data-footer-area]):not(.word-page-break),
                    [data-doc-editor="true"] .court-memo-document p,
                    [data-doc-editor="true"] .court-memo-document > div,
                    [data-doc-editor="true"] h1,
                    [data-doc-editor="true"] h2,
                    [data-doc-editor="true"] h3,
                    [data-doc-editor="true"] h4,
                    [data-doc-editor="true"] blockquote {
                      margin-top: ${docState.paragraphSpacingBefore ?? 0}pt !important;
                      margin-bottom: ${docState.paragraphSpacingAfter ?? 6}pt !important;
                      text-indent: ${(docState.firstLineIndent ?? 0) <= 5 && (docState.firstLineIndent ?? 0) > 0 ? `${docState.firstLineIndent}cm` : `${docState.firstLineIndent ?? 0}pt`};
                      word-spacing: ${docState.wordSpacing ?? 0}pt !important;
                    }
                    .word-page-break {
                      display: block;
                      page-break-after: always;
                      break-after: page;
                      clear: both;
                      position: relative;
                      height: 0.9cm !important;
                      min-height: 0.9cm !important;
                      max-height: 0.9cm !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      background: transparent !important;
                      border: none !important;
                      user-select: none !important;
                      pointer-events: none;
                      color: transparent !important;
                      font-size: 0 !important;
                      line-height: 0 !important;
                      overflow: hidden !important;
                    }
                    .word-page-break::before {
                      content: '';
                      position: absolute;
                      top: 50%;
                      left: 0;
                      right: 0;
                      height: 1px;
                      border-bottom: 1.5px dashed #94a3b8;
                      opacity: 0.85;
                      transform: translateY(-50%);
                    }
                    .word-section-break {
                      page-break-before: always;
                      break-before: page;
                      clear: both;
                      margin: 0 !important;
                      height: 0.9cm !important;
                    }
                    .document-section-content {
                      position: relative;
                      margin-top: 12px;
                    }
                    @media print {
                      .word-page-break {
                        page-break-after: always !important;
                        break-after: page !important;
                        display: block !important;
                        visibility: hidden !important;
                        height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                      }
                      .word-page-break::before {
                        display: none !important;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}</style>
                </div>
              </div>

              {/* Clean Page Boundary Separator with subtle automatic break indicator */}
              {!isLast && (
                <div 
                  className="no-print select-none flex items-center justify-center relative shrink-0"
                  style={{ 
                    width: `${paperMetrics.widthCm * paperMetrics.scale}cm`,
                    maxWidth: '100%',
                    height: '0.9cm', 
                    minHeight: '0.9cm', 
                    maxHeight: '0.9cm', 
                    margin: '0',
                    padding: '0',
                    boxSizing: 'border-box',
                  }}
                  role="separator"
                  aria-label="فاصل صفحات"
                >
                  <div 
                    className="w-full h-px border-t border-dashed border-slate-300 dark:border-slate-600 absolute inset-x-0" 
                    style={{
                      margin: 0,
                      padding: 0,
                    }}
                  />
                  <div className="relative z-10 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-3 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs pointer-events-none">
                    <span>فاصل صفحات آلي ⎘</span>
                    <span className="text-slate-300 dark:text-slate-600 font-normal">|</span>
                    <span className="font-sans text-[9px] text-blue-600 dark:text-blue-400 font-bold">صفحة {pageNum} من {computedTotalPages}</span>
                  </div>
                </div>
              )}
              </React.Fragment>
            );
          })}

          {/* Add New Page Quick Action Button at Document Bottom */}
          {!isReadMode && (
            <div className="no-print flex flex-col items-center justify-center py-6 gap-2 w-full">
              <button
                type="button"
                onClick={() => onAddNewPage ? onAddNewPage('end') : onInsertPageBreak?.()}
                className="group flex items-center gap-2.5 px-6 py-2.5 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl font-bold text-xs shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer"
                title="إضافة صفحة جديدة فارغة إلى نهاية المستند مع فاصل صفحات تلقائي"
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center font-bold text-xs transition-colors">
                  +
                </span>
                <span>إضافة صفحة جديدة ضمن المستند (مع فاصل صفحات تلقائي)</span>
                <span className="text-[10px] bg-blue-100/80 text-blue-800 px-2.5 py-0.5 rounded-full font-sans">
                  صفحة {unifiedPages.length + 1}
                </span>
              </button>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 select-none">
                <span>💡 تلميح: يمكنك أيضاً الضغط على</span>
                <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-mono text-[10px] font-bold">Ctrl + Enter</kbd>
                <span>لإدراج فاصل صفحات فوري</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu Popup for Mobile / Desktop Selection, Copy, Cut, Paste */}
      {contextMenu.show && (
        <div 
          className="fixed z-50 bg-slate-900 text-white shadow-2xl rounded-xl border border-slate-700 py-1.5 px-2 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150"
          style={{ top: `${contextMenu.y}px`, left: `${Math.min(window.innerWidth - 240, Math.max(10, contextMenu.x - 100))}px` }}
        >
          <button
            onClick={handleCopySelection}
            className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-semibold transition text-slate-100 cursor-pointer"
            title="نسخ النص المحدد"
          >
            <Copy className="w-3.5 h-3.5 text-blue-400" />
            <span>نسخ</span>
          </button>
          <button
            onClick={handleCutSelection}
            className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-semibold transition text-slate-100 cursor-pointer"
            title="قص النص المحدد"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>قص</span>
          </button>
          <button
            onClick={handlePasteClipboard}
            className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-semibold transition text-slate-100 cursor-pointer"
            title="لصق من الحافظة"
          >
            <Clipboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>لصق</span>
          </button>
          <button
            onClick={handleSelectAllText}
            className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-semibold transition text-slate-100 cursor-pointer"
            title="تحديد كل المستند"
          >
            <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
            <span>تحديد الكل</span>
          </button>
          <div className="w-[1px] h-5 bg-slate-700 mx-0.5"></div>
          <button
            onClick={() => setContextMenu({ show: false, x: 0, y: 0, selectedText: '' })}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            title="إغلاق القائمة"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Spell Check Suggestions Context Menu */}
      {spellMenu.show && (
        <div 
          className="fixed z-50 bg-white text-slate-900 shadow-2xl rounded-xl border border-slate-200 py-2 px-3 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150 min-w-[200px]"
          style={{ top: `${spellMenu.y}px`, left: `${Math.min(window.innerWidth - 240, Math.max(10, spellMenu.x - 50))}px` }}
          dir="rtl"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-xs">
            <span className="font-bold text-rose-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              خطأ إملائي: "{spellMenu.word}"
            </span>
            <button
              onClick={() => setSpellMenu(prev => ({ ...prev, show: false }))}
              className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-[11px] text-slate-500 font-medium px-0.5">
            اقتراحات التصحيح:
          </div>
          <div className="flex flex-col gap-1">
            {spellMenu.suggestions.map((sugg, idx) => (
              <button
                key={`sugg-${idx}`}
                onClick={() => handleApplySpellSuggestion(sugg)}
                className="w-full text-right px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg transition flex items-center justify-between group cursor-pointer"
              >
                <span>{sugg}</span>
                <Check className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Horizontal and Vertical Scrollbars matching the attached screenshot */}
      <WorkspaceScrollbars workspaceRef={workspaceRef} showRuler={docState.showRuler} />

    </div>
  );
};
