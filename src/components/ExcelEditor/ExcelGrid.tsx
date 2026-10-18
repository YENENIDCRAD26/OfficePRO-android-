import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Sheet as SheetIcon, ZoomIn, ZoomOut, Trash2, Move, Maximize2, Minimize2, Combine, Split, Copy, X, Bold, Palette, Grid, AlignCenter } from 'lucide-react';
import { CellData, ConditionalFormatRule, ExcelSheet, SheetChart, SheetImage } from '../../types';
import { 
  colIndexToLetter, 
  evaluateFormula, 
  formatCellValue, 
  parseCellAddress 
} from '../../utils/excelCalculations';
import { ExcelChartOverlay } from './ExcelChartOverlay';

interface ExcelGridProps {
  sheet: ExcelSheet;
  sheets: ExcelSheet[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  onAddSheet: () => void;
  onRenameSheet: (id: string, newName: string) => void;
  selectedCell: string;
  onSelectCell: (cellAddr: string) => void;
  onUpdateCell: (cellAddr: string, partial: Partial<CellData>) => void;
  onCellDoubleClick: (cellAddr: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  inlineValue: string;
  setInlineValue: (val: string) => void;
  onCommitInlineEdit: () => void;
  zoom?: number;
  onZoomChange?: (newZoom: number) => void;
  onUpdateColWidth?: (col: string, width: number) => void;
  onUpdateRowHeight?: (row: number, height: number) => void;
  onUpdateSheetImages?: (images: SheetImage[]) => void;
  onUpdateSheetCharts?: (charts: SheetChart[]) => void;
  onOpenCommentModal?: (cellAddr: string) => void;
  isKeyboardOpen?: boolean;
  onToggleKeyboard?: () => void;
  selectedRange?: { start: string; end: string } | null;
  onSelectRange?: (range: { start: string; end: string } | null) => void;
  onMergeCells?: (range?: { start: string; end: string }) => void;
  onUnmergeCells?: (cellAddr: string) => void;
  isCurrentMerged?: boolean;
  isDarkMode?: boolean;
}

export const ExcelGrid: React.FC<ExcelGridProps> = ({
  sheet,
  sheets,
  activeSheetId,
  onSelectSheet,
  onAddSheet,
  onRenameSheet,
  selectedCell,
  onSelectCell,
  onUpdateCell,
  onCellDoubleClick,
  isEditing,
  setIsEditing,
  inlineValue,
  setInlineValue,
  onCommitInlineEdit,
  zoom = 100,
  onZoomChange,
  onUpdateColWidth,
  onUpdateRowHeight,
  onUpdateSheetImages,
  onUpdateSheetCharts,
  onOpenCommentModal,
  isKeyboardOpen,
  onToggleKeyboard,
  selectedRange,
  onSelectRange,
  onMergeCells,
  onUnmergeCells,
  isCurrentMerged,
  isDarkMode = false
}) => {
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [tempSheetName, setTempSheetName] = useState('');
  const inlineInputRef = useRef<HTMLInputElement>(null);

  // Resize state for columns and rows
  const [resizingCol, setResizingCol] = useState<{ col: string; startX: number; startWidth: number } | null>(null);
  const [resizingRow, setResizingRow] = useState<{ row: number; startY: number; startHeight: number } | null>(null);

  // Drag selection state for touch / mouse range selection
  const [dragSelectState, setDragSelectState] = useState<{ startAddr: string; currentAddr: string } | null>(null);

  // Fill handle state for bottom-right (+) handle drag copy & fill
  const [fillHandleState, setFillHandleState] = useState<{ startRange: { start: string; end: string }; currentAddr: string } | null>(null);

  // Right-click context menu state
  const [contextMenuState, setContextMenuState] = useState<{ x: number; y: number; addr: string } | null>(null);

  // Dynamic visible pop-up dropdown state
  const [dropdownOpenCell, setDropdownOpenCell] = useState<string | null>(null);

  // Image manipulation state
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [dragImageState, setDragImageState] = useState<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [resizeImageState, setResizeImageState] = useState<{ id: string; startX: number; startY: number; origW: number; origH: number } | null>(null);

  const zoomFactor = Math.max(0.4, Math.min(2.0, (zoom || 100) / 100));

  // Virtual List state for ExcelGrid performance optimization
  const [scrollTop, setScrollTop] = useState<number>(0);
  const avgRowHeight = Math.round(28 * zoomFactor);
  const rows = Array.from({ length: sheet.rowCount }, (_, i) => i + 1);
  const cols = Array.from({ length: sheet.colCount }, (_, i) => colIndexToLetter(i));
  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / avgRowHeight) - 4);
  const visibleEndIndex = Math.min(rows.length, visibleStartIndex + 45);
  const topSpacerHeight = visibleStartIndex * avgRowHeight;
  const bottomSpacerHeight = (rows.length - visibleEndIndex) * avgRowHeight;

  const getColBaseWidth = (col: string): number => {
    if (sheet.colWidths && sheet.colWidths[col]) {
      return sheet.colWidths[col];
    }
    return col === 'A' ? 60 : col === 'B' ? 260 : col === 'C' ? 180 : 140;
  };

  const getRowBaseHeight = (rowNum: number): number => {
    if (sheet.rowHeights && sheet.rowHeights[rowNum]) {
      return sheet.rowHeights[rowNum];
    }
    return 28;
  };

  // Pre-calculate merged cells map and covered cells set for clean HTML table spanning
  const mergesInfo = useMemo(() => {
    const masterMap = new Map<string, { start: string; end: string; rowspan: number; colspan: number; width: number; height: number }>();
    const coveredSet = new Set<string>();

    (sheet.merges || []).forEach((merge) => {
      const s = parseCellAddress(merge.start);
      const e = parseCellAddress(merge.end);
      if (!s || !e) return;
      const minCol = Math.min(s.colIndex, e.colIndex);
      const maxCol = Math.max(s.colIndex, e.colIndex);
      const minRow = Math.min(s.row, e.row);
      const maxRow = Math.max(s.row, e.row);

      const masterAddr = `${colIndexToLetter(minCol)}${minRow}`;
      const colspan = maxCol - minCol + 1;
      const rowspan = maxRow - minRow + 1;

      let totalW = 0;
      for (let c = minCol; c <= maxCol; c++) {
        totalW += Math.round(getColBaseWidth(colIndexToLetter(c)) * zoomFactor);
      }
      let totalH = 0;
      for (let r = minRow; r <= maxRow; r++) {
        totalH += Math.round(getRowBaseHeight(r) * zoomFactor);
      }

      masterMap.set(masterAddr, {
        start: merge.start,
        end: merge.end,
        colspan,
        rowspan,
        width: totalW,
        height: totalH,
      });

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const a = `${colIndexToLetter(c)}${r}`;
          if (a !== masterAddr) {
            coveredSet.add(a);
          }
        }
      }
    });

    return { masterMap, coveredSet };
  }, [sheet.merges, sheet.colWidths, sheet.rowHeights, zoomFactor]);

  // Current active selection range bounds calculation
  const activeRange = selectedRange || (selectedCell ? { start: selectedCell, end: selectedCell } : null);

  const rangeBounds = useMemo(() => {
    if (!activeRange) return null;
    const s = parseCellAddress(activeRange.start);
    const e = parseCellAddress(activeRange.end);
    if (!s || !e) return null;
    const minCol = Math.min(s.colIndex, e.colIndex);
    const maxCol = Math.max(s.colIndex, e.colIndex);
    const minRow = Math.min(s.row, e.row);
    const maxRow = Math.max(s.row, e.row);
    const count = (maxCol - minCol + 1) * (maxRow - minRow + 1);
    return {
      minCol,
      maxCol,
      minRow,
      maxRow,
      startAddr: `${colIndexToLetter(minCol)}${minRow}`,
      endAddr: `${colIndexToLetter(maxCol)}${maxRow}`,
      count,
    };
  }, [activeRange]);

  // Column Resizing handlers (Touch & Mouse)
  const handleColResizeStart = (col: string, clientX: number) => {
    const currentWidth = getColBaseWidth(col);
    setResizingCol({ col, startX: clientX, startWidth: currentWidth });
  };

  // Row Resizing handlers (Touch & Mouse)
  const handleRowResizeStart = (row: number, clientY: number) => {
    const currentHeight = getRowBaseHeight(row);
    setResizingRow({ row, startY: clientY, startHeight: currentHeight });
  };

  // Select entire column by clicking header
  const handleSelectCol = (col: string) => {
    if (isEditing) onCommitInlineEdit();
    const start = `${col}1`;
    const end = `${col}${sheet.rowCount}`;
    onSelectCell(start);
    onSelectRange?.({ start, end });
  };

  // Select entire row by clicking row number
  const handleSelectRow = (rowNum: number) => {
    if (isEditing) onCommitInlineEdit();
    const lastCol = colIndexToLetter(sheet.colCount - 1);
    const start = `A${rowNum}`;
    const end = `${lastCol}${rowNum}`;
    onSelectCell(start);
    onSelectRange?.({ start, end });
  };

  // Handle pointer listeners for drag selection and fill handle (+)
  useEffect(() => {
    if (!dragSelectState && !fillHandleState) return;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0]?.clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY : (e as MouseEvent).clientY;
      if (clientX == null || clientY == null) return;

      const elem = document.elementFromPoint(clientX, clientY);
      const cellTd = elem?.closest('[id^="excel-cell-"]');
      if (cellTd) {
        const targetAddr = cellTd.id.replace('excel-cell-', '');
        if (targetAddr) {
          if (dragSelectState && targetAddr !== dragSelectState.currentAddr) {
            setDragSelectState((prev) => (prev ? { ...prev, currentAddr: targetAddr } : null));
            onSelectRange?.({ start: dragSelectState.startAddr, end: targetAddr });
          } else if (fillHandleState && targetAddr !== fillHandleState.currentAddr) {
            setFillHandleState((prev) => (prev ? { ...prev, currentAddr: targetAddr } : null));
            onSelectRange?.({ start: fillHandleState.startRange.start, end: targetAddr });
          }
        }
      }
    };

    const onPointerUp = () => {
      if (fillHandleState) {
        const s = parseCellAddress(fillHandleState.startRange.start);
        const e = parseCellAddress(fillHandleState.startRange.end);
        const t = parseCellAddress(fillHandleState.currentAddr);
        if (s && e && t) {
          const sourceVal = sheet.data[fillHandleState.startRange.start]?.value || '';
          const sourceFormula = sheet.data[fillHandleState.startRange.start]?.formula;
          const minCol = Math.min(s.colIndex, e.colIndex, t.colIndex);
          const maxCol = Math.max(e.colIndex, t.colIndex, s.colIndex, e.colIndex);
          const minRow = Math.min(s.row, e.row, t.row);
          const maxRow = Math.max(e.row, t.row, s.row, e.row);

          for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
              const addr = `${colIndexToLetter(c)}${r}`;
              onUpdateCell(addr, { value: sourceVal, formula: sourceFormula });
            }
          }
        }
        setFillHandleState(null);
      }
      setDragSelectState(null);
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchcancel', onPointerUp);

    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('touchcancel', onPointerUp);
    };
  }, [dragSelectState, fillHandleState, onSelectRange, onUpdateCell, sheet.data]);

  // Global listeners for drag resizing
  useEffect(() => {
    const handlePointerMove = (clientX: number, clientY: number) => {
      if (resizingCol) {
        // In RTL, moving left (decreasing clientX) increases width
        const deltaX = (resizingCol.startX - clientX) / zoomFactor;
        const newWidth = Math.max(40, Math.round(resizingCol.startWidth + deltaX));
        if (onUpdateColWidth) {
          onUpdateColWidth(resizingCol.col, newWidth);
        }
      } else if (resizingRow) {
        // Moving down (increasing clientY) increases row height
        const deltaY = (clientY - resizingRow.startY) / zoomFactor;
        const newHeight = Math.max(20, Math.round(resizingRow.startHeight + deltaY));
        if (onUpdateRowHeight) {
          onUpdateRowHeight(resizingRow.row, newHeight);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol || resizingRow) {
        handlePointerMove(e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if ((resizingCol || resizingRow) && e.touches[0]) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handlePointerUp = () => {
      setResizingCol(null);
      setResizingRow(null);
    };

    if (resizingCol || resizingRow) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
      window.addEventListener('touchcancel', handlePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('touchcancel', handlePointerUp);
    };
  }, [resizingCol, resizingRow, zoomFactor, onUpdateColWidth, onUpdateRowHeight]);

  // Image drag & resize handlers
  useEffect(() => {
    const handleImagePointerMove = (clientX: number, clientY: number) => {
      if (dragImageState && onUpdateSheetImages && sheet.images) {
        const dx = clientX - dragImageState.startX;
        const dy = clientY - dragImageState.startY;
        const newX = Math.max(0, Math.round(dragImageState.origX + dx));
        const newY = Math.max(0, Math.round(dragImageState.origY + dy));
        const nextImgs = sheet.images.map((img) =>
          img.id === dragImageState.id ? { ...img, x: newX, y: newY } : img
        );
        onUpdateSheetImages(nextImgs);
      } else if (resizeImageState && onUpdateSheetImages && sheet.images) {
        const dx = clientX - resizeImageState.startX;
        const dy = clientY - resizeImageState.startY;
        const newW = Math.max(40, Math.round(resizeImageState.origW + dx));
        const newH = Math.max(40, Math.round(resizeImageState.origH + dy));
        const nextImgs = sheet.images.map((img) =>
          img.id === resizeImageState.id ? { ...img, width: newW, height: newH } : img
        );
        onUpdateSheetImages(nextImgs);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (dragImageState || resizeImageState) {
        handleImagePointerMove(e.clientX, e.clientY);
      }
    };

    const onMouseUp = () => {
      setDragImageState(null);
      setResizeImageState(null);
    };

    if (dragImageState || resizeImageState) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragImageState, resizeImageState, sheet.images, onUpdateSheetImages]);

  const handleScaleImage = (id: string, factor: number) => {
    if (!sheet.images || !onUpdateSheetImages) return;
    const next = sheet.images.map((img) => {
      if (img.id === id) {
        return {
          ...img,
          width: Math.max(40, Math.round(img.width * factor)),
          height: Math.max(40, Math.round(img.height * factor)),
        };
      }
      return img;
    });
    onUpdateSheetImages(next);
  };

  const handleDeleteImage = (id: string) => {
    if (!sheet.images || !onUpdateSheetImages) return;
    const next = sheet.images.filter((img) => img.id !== id);
    onUpdateSheetImages(next);
    if (selectedImageId === id) setSelectedImageId(null);
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inlineInputRef.current) {
      inlineInputRef.current.focus();
    }
  }, [isEditing]);

  // Handle keyboard navigation between cells
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onCommitInlineEdit();
        // Move to row below
        const parsed = parseCellAddress(selectedCell);
        if (parsed && parsed.row < sheet.rowCount) {
          onSelectCell(`${parsed.col}${parsed.row + 1}`);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        onCommitInlineEdit();
        // Move to next column
        const parsed = parseCellAddress(selectedCell);
        if (parsed && parsed.colIndex + 1 < sheet.colCount) {
          onSelectCell(`${colIndexToLetter(parsed.colIndex + 1)}${parsed.row}`);
        }
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
      return;
    }

    const parsed = parseCellAddress(selectedCell);
    if (!parsed) return;

    if (e.key === 'ArrowUp' && parsed.row > 1) {
      e.preventDefault();
      onSelectCell(`${parsed.col}${parsed.row - 1}`);
    } else if (e.key === 'ArrowDown' && parsed.row < sheet.rowCount) {
      e.preventDefault();
      onSelectCell(`${parsed.col}${parsed.row + 1}`);
    } else if (e.key === 'ArrowLeft') {
      // In RTL, ArrowLeft moves to next column index
      e.preventDefault();
      if (parsed.colIndex + 1 < sheet.colCount) {
        onSelectCell(`${colIndexToLetter(parsed.colIndex + 1)}${parsed.row}`);
      }
    } else if (e.key === 'ArrowRight') {
      // In RTL, ArrowRight moves to previous column index
      e.preventDefault();
      if (parsed.colIndex > 0) {
        onSelectCell(`${colIndexToLetter(parsed.colIndex - 1)}${parsed.row}`);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onCellDoubleClick(selectedCell);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onUpdateCell(selectedCell, { value: '', formula: undefined });
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Start typing directly into active cell
      setInlineValue(e.key);
      setIsEditing(true);
    }
  };

  // Calculate live statistics for bottom bar and column min/max for conditional formatting
  let cellCount = 0;
  let sumTotal = 0;
  let numericCount = 0;

  // Track numeric values per column to calculate min/max for color scale
  const colNumericStats: Record<string, { min: number; max: number; count: number }> = {};

  Object.entries(sheet.data).forEach(([addr, c]: [string, CellData]) => {
    if (c.value || c.formula) {
      cellCount++;
      const val = c.formula ? evaluateFormula(c.formula, sheet.data) : (c.value || '');
      const num = parseFloat(String(val).replace(/[^\d.-]/g, ''));
      if (!isNaN(num)) {
        sumTotal += num;
        numericCount++;

        const parsed = parseCellAddress(addr);
        if (parsed) {
          const colLetter = parsed.col;
          if (!colNumericStats[colLetter]) {
            colNumericStats[colLetter] = { min: num, max: num, count: 1 };
          } else {
            colNumericStats[colLetter].min = Math.min(colNumericStats[colLetter].min, num);
            colNumericStats[colLetter].max = Math.max(colNumericStats[colLetter].max, num);
            colNumericStats[colLetter].count++;
          }
        }
      }
    }
  });

  // Helper function to interpolate RGB colors for color scales
  const interpolateColor = (color1: [number, number, number], color2: [number, number, number], factor: number) => {
    const r = Math.round(color1[0] + factor * (color2[0] - color1[0]));
    const g = Math.round(color1[1] + factor * (color2[1] - color1[1]));
    const b = Math.round(color1[2] + factor * (color2[2] - color1[2]));
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Compute conditional format style for a cell if applicable
  const getConditionalStyle = (addr: string, cell?: CellData): { bg?: string; color?: string } => {
    if (!sheet.conditionalRules || sheet.conditionalRules.length === 0) return {};
    const parsed = parseCellAddress(addr);
    if (!parsed) return {};

    const cellValStr = cell?.formula ? evaluateFormula(cell.formula, sheet.data) : (cell?.value || '');
    const num = parseFloat(String(cellValStr).replace(/[^\d.-]/g, ''));
    if (isNaN(num)) return {};

    for (const rule of sheet.conditionalRules) {
      // Check column scope
      if (rule.column && rule.column !== parsed.col) {
        continue;
      }

      if (rule.type === 'color_scale_green_yellow_red') {
        const stats = colNumericStats[parsed.col] || { min: 0, max: 100 };
        const range = stats.max - stats.min;
        if (range <= 0) return { bg: '#fef08a' }; // yellow midpoint
        const ratio = Math.max(0, Math.min(1, (num - stats.min) / range));

        // 0.0 = Red (#f87171 = 248, 113, 113), 0.5 = Yellow (#fef08a = 254, 240, 138), 1.0 = Green (#86efac = 134, 239, 172)
        if (ratio < 0.5) {
          const factor = ratio / 0.5;
          const bg = interpolateColor([254, 202, 202], [254, 240, 138], factor);
          return { bg, color: '#7f1d1d' };
        } else {
          const factor = (ratio - 0.5) / 0.5;
          const bg = interpolateColor([254, 240, 138], [187, 247, 208], factor);
          return { bg, color: '#14532d' };
        }
      } else if (rule.type === 'color_scale_red_yellow_green') {
        const stats = colNumericStats[parsed.col] || { min: 0, max: 100 };
        const range = stats.max - stats.min;
        if (range <= 0) return { bg: '#fef08a' };
        const ratio = Math.max(0, Math.min(1, (num - stats.min) / range));
        if (ratio < 0.5) {
          const factor = ratio / 0.5;
          const bg = interpolateColor([187, 247, 208], [254, 240, 138], factor);
          return { bg, color: '#14532d' };
        } else {
          const factor = (ratio - 0.5) / 0.5;
          const bg = interpolateColor([254, 240, 138], [254, 202, 202], factor);
          return { bg, color: '#7f1d1d' };
        }
      } else if (rule.type === 'color_scale_blue_white') {
        const stats = colNumericStats[parsed.col] || { min: 0, max: 100 };
        const range = stats.max - stats.min;
        const ratio = range <= 0 ? 0.5 : Math.max(0, Math.min(1, (num - stats.min) / range));
        const bg = interpolateColor([239, 246, 255], [147, 197, 253], ratio);
        return { bg, color: '#1e3a8a' };
      } else if (rule.type === 'color_scale_emerald_light') {
        const stats = colNumericStats[parsed.col] || { min: 0, max: 100 };
        const range = stats.max - stats.min;
        const ratio = range <= 0 ? 0.5 : Math.max(0, Math.min(1, (num - stats.min) / range));
        const bg = interpolateColor([240, 253, 244], [134, 239, 172], ratio);
        return { bg, color: '#064e3b' };
      } else if (rule.type === 'greater_than') {
        const threshold = rule.threshold ?? 0;
        if (num > threshold) {
          return { bg: rule.highlightBg || '#dcfce7', color: rule.highlightColor || '#166534' };
        }
      } else if (rule.type === 'less_than') {
        const threshold = rule.threshold ?? 0;
        if (num < threshold) {
          return { bg: rule.highlightBg || '#fee2e2', color: rule.highlightColor || '#991b1b' };
        }
      } else if (rule.type === 'highlight_positive') {
        if (num > 0) return { bg: '#dcfce7', color: '#166534' };
      } else if (rule.type === 'highlight_negative') {
        if (num < 0) return { bg: '#fee2e2', color: '#991b1b' };
      }
    }
    return {};
  };

  const avgValue = numericCount > 0 ? (sumTotal / numericCount).toFixed(2) : '0';

  return (
    <div 
      className={`flex-1 flex flex-col overflow-hidden select-none outline-none relative transition-colors ${
        isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
      onKeyDown={handleKeyDown}
      onClick={() => setContextMenuState(null)}
      tabIndex={0}
      dir="rtl"
    >
      {/* Right Side Border / Margin Edge Strip (0.4 cm) for Excel - شريط حافة جانبية جهة اليمين */}
      <div
        id="excel-right-border-edge-strip"
        className="absolute top-0 bottom-0 right-0 z-40 pointer-events-none select-none border-l border-emerald-500/50 bg-gradient-to-l from-emerald-600/15 via-emerald-700/5 to-transparent flex flex-col justify-between py-6 items-center"
        style={{ width: '0.4cm', minWidth: '0.4cm', maxWidth: '0.4cm' }}
        title="شريط حافة حدود جانبية جهة اليمين لمعالج الجداول (0.4 cm)"
      >
        <div className="w-1 h-8 rounded-full bg-emerald-600/60 opacity-80" />
        <div className="text-[7px] font-mono text-emerald-800 font-black rotate-90 whitespace-nowrap tracking-wider select-none">
          0.4 cm
        </div>
        <div className="w-1 h-8 rounded-full bg-emerald-600/60 opacity-80" />
      </div>

      {/* Scrollable Spreadsheet Table */}
      <div 
        onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
        className="flex-1 overflow-auto bg-white relative"
      >
        <table 
          className="border-collapse table-fixed min-w-full text-xs font-sans border-spacing-0"
          style={{ fontSize: `${Math.round(12 * zoomFactor)}px` }}
        >
          <thead>
            <tr 
              className="bg-slate-100 sticky top-0 z-20 shadow-2xs"
              style={{ height: `${Math.round(28 * zoomFactor)}px` }}
            >
              {/* Top-Right Row Header Corner */}
              <th 
                className="bg-slate-200 border-b border-l border-slate-300 text-slate-500 font-bold text-center select-none sticky right-0 z-30"
                style={{ width: `${Math.round(48 * zoomFactor)}px` }}
              >
                #
              </th>
              {/* Column Letters (A, B, C...) with Selection & Touch Resizing Handles */}
              {cols.map((col, colIdx) => {
                const colWidth = Math.round(getColBaseWidth(col) * zoomFactor);
                const isColResizing = resizingCol?.col === col;
                const isColInRange = rangeBounds ? (colIdx >= rangeBounds.minCol && colIdx <= rangeBounds.maxCol) : selectedCell.startsWith(col);

                return (
                  <th
                    key={col}
                    onClick={() => handleSelectCol(col)}
                    className={`px-2 border-b border-l border-slate-300 font-bold text-center select-none relative group cursor-pointer transition-colors ${
                      isColInRange ? 'bg-emerald-200/80 text-emerald-900 font-black ring-1 ring-emerald-400 inset-0' : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                    }`}
                    style={{ width: `${colWidth}px`, minWidth: `${colWidth}px`, maxWidth: `${colWidth}px` }}
                    title={`انقر لتحديد العمود ${col} بالكامل`}
                  >
                    <span>{col}</span>

                    {/* Touch & Mouse Interactive Column Resizing Handle (Left border in RTL) */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleColResizeStart(col, e.clientX);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        if (e.touches[0]) {
                          handleColResizeStart(col, e.touches[0].clientX);
                        }
                      }}
                      className={`absolute left-0 top-0 bottom-0 w-3 -ml-1.5 cursor-col-resize z-40 flex items-center justify-center transition-colors ${
                        isColResizing ? 'bg-emerald-600 w-1' : 'hover:bg-emerald-400/80 active:bg-emerald-600'
                      }`}
                      title={`سحب لتعديل عرض العمود ${col} (Touch/Drag to resize)`}
                    >
                      <div className="w-0.5 h-3 bg-slate-400 group-hover:bg-white rounded-full pointer-events-none" />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {topSpacerHeight > 0 && (
              <tr style={{ height: `${topSpacerHeight}px` }}>
                <td colSpan={cols.length + 1} style={{ border: 0, padding: 0, background: 'transparent' }} />
              </tr>
            )}
            {rows.slice(visibleStartIndex, visibleEndIndex).map((rowNum) => {
              const isRowInRange = rangeBounds ? (rowNum >= rangeBounds.minRow && rowNum <= rangeBounds.maxRow) : selectedCell.endsWith(rowNum.toString());
              const rowHeight = Math.round(getRowBaseHeight(rowNum) * zoomFactor);
              const isRowResizing = resizingRow?.row === rowNum;

              return (
                <tr 
                  key={rowNum} 
                  className="hover:bg-slate-50/50"
                  style={{ height: `${rowHeight}px` }}
                >
                  {/* Row Number Header (1, 2, 3...) with Selection & Touch Resizing Handle */}
                  <td 
                    onClick={() => handleSelectRow(rowNum)}
                    className={`border-b border-l border-slate-300 font-medium text-center select-none sticky right-0 z-10 relative group cursor-pointer transition-colors ${
                      isRowInRange ? 'bg-emerald-200/80 text-emerald-900 font-black ring-1 ring-emerald-400' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                    style={{ 
                      width: `${Math.round(48 * zoomFactor)}px`,
                      height: `${rowHeight}px`
                    }}
                    title={`انقر لتحديد الصف ${rowNum} بالكامل`}
                  >
                    <span>{rowNum}</span>

                    {/* Touch & Mouse Interactive Row Resizing Handle (Bottom border) */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRowResizeStart(rowNum, e.clientY);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        if (e.touches[0]) {
                          handleRowResizeStart(rowNum, e.touches[0].clientY);
                        }
                      }}
                      className={`absolute bottom-0 left-0 right-0 h-3 -mb-1.5 cursor-row-resize z-30 flex items-center justify-center transition-colors ${
                        isRowResizing ? 'bg-emerald-600 h-1' : 'hover:bg-emerald-400/80 active:bg-emerald-600'
                      }`}
                      title={`سحب لتعديل ارتفاع الصف ${rowNum} (Touch/Drag to resize)`}
                    >
                      <div className="h-0.5 w-3 bg-slate-400 group-hover:bg-white rounded-full pointer-events-none" />
                    </div>
                  </td>

                  {/* Row Cells */}
                  {cols.map((col, colIdx) => {
                    const addr = `${col}${rowNum}`;

                    // If this cell is spanned and covered by a master merged cell, skip rendering
                    if (mergesInfo.coveredSet.has(addr)) {
                      return null;
                    }

                    const mergeMaster = mergesInfo.masterMap.get(addr);
                    const cell = sheet.data[addr];
                    const isSelected = selectedCell === addr;
                    const isCellEditing = isSelected && isEditing;

                    // Range calculation
                    const isInRange = rangeBounds && rangeBounds.count > 1 &&
                      colIdx >= rangeBounds.minCol && colIdx <= rangeBounds.maxCol &&
                      rowNum >= rangeBounds.minRow && rowNum <= rangeBounds.maxRow;

                    // In RTL, the leftmost column of the selection is maxCol and bottom row is maxRow:
                    const isHandleCell = rangeBounds && rangeBounds.count > 1
                      ? (colIdx === rangeBounds.maxCol && rowNum === rangeBounds.maxRow)
                      : isSelected;

                    const colWidth = mergeMaster ? mergeMaster.width : Math.round(getColBaseWidth(col) * zoomFactor);
                    const cellHeight = mergeMaster ? mergeMaster.height : rowHeight;

                    // Compute displayed value
                    let displayVal = '';
                    if (cell) {
                      if (cell.formula && cell.formula.startsWith('=')) {
                        const calculated = evaluateFormula(cell.formula, sheet.data);
                        displayVal = formatCellValue(calculated, cell.format);
                      } else {
                        displayVal = formatCellValue(cell.value || '', cell.format);
                      }
                    }

                    // Calculate custom border styling
                    let customBorderStyle: React.CSSProperties = {};
                    if (cell?.borderStyle === 'double_bottom') {
                      customBorderStyle = { borderBottom: `3px double ${cell.borderColor || '#0369a1'}` };
                    } else if (cell?.borderStyle === 'box') {
                      const colColor = cell.borderColor || '#15803d';
                      customBorderStyle = { borderTop: `2px solid ${colColor}`, borderBottom: `2px solid ${colColor}`, borderLeft: `2px solid ${colColor}`, borderRight: `2px solid ${colColor}` };
                    } else if (cell?.borderStyle === 'all') {
                      const colColor = cell.borderColor || '#94a3b8';
                      customBorderStyle = { borderTop: `1px solid ${colColor}`, borderBottom: `1px solid ${colColor}`, borderLeft: `1px solid ${colColor}`, borderRight: `1px solid ${colColor}` };
                    } else if (cell?.borderStyle === 'bottom') {
                      customBorderStyle = { borderBottom: `2px solid ${cell.borderColor || '#334155'}` };
                    }

                    // Range perimeter borders in RTL
                    const rangeBorders: React.CSSProperties = {};
                    if (isInRange) {
                      if (rowNum === rangeBounds.minRow) rangeBorders.borderTop = '2px solid #059669';
                      if (rowNum === rangeBounds.maxRow) rangeBorders.borderBottom = '2px solid #059669';
                      if (colIdx === rangeBounds.minCol) rangeBorders.borderRight = '2px solid #059669'; // minCol is Right in RTL
                      if (colIdx === rangeBounds.maxCol) rangeBorders.borderLeft = '2px solid #059669';  // maxCol is Left in RTL
                    }

                    // Get conditional formatting style if any
                    const condStyle = getConditionalStyle(addr, cell);

                    return (
                      <td
                        key={addr}
                        id={`excel-cell-${addr}`}
                        colSpan={mergeMaster ? mergeMaster.colspan : 1}
                        rowSpan={mergeMaster ? mergeMaster.rowspan : 1}
                        onClick={(e) => {
                          if (isEditing && selectedCell !== addr) onCommitInlineEdit();
                          if (e.shiftKey && selectedCell) {
                            onSelectRange?.({ start: selectedCell, end: addr });
                          } else {
                            onSelectCell(addr);
                            onSelectRange?.({ start: addr, end: addr });
                          }
                        }}
                        onMouseDown={(e) => {
                          if (e.button !== 0) return;
                          if (isEditing && selectedCell !== addr) onCommitInlineEdit();
                          if (e.shiftKey && selectedCell) {
                            onSelectRange?.({ start: selectedCell, end: addr });
                          } else {
                            onSelectCell(addr);
                            onSelectRange?.({ start: addr, end: addr });
                            setDragSelectState({ startAddr: addr, currentAddr: addr });
                          }
                        }}
                        onTouchStart={() => {
                          if (isEditing && selectedCell !== addr) onCommitInlineEdit();
                          onSelectCell(addr);
                          onSelectRange?.({ start: addr, end: addr });
                          setDragSelectState({ startAddr: addr, currentAddr: addr });
                        }}
                        onDoubleClick={() => onCellDoubleClick(addr)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenuState({ x: e.clientX, y: e.clientY, addr });
                        }}
                        className={`px-1.5 border-b border-l border-slate-300 relative group transition-colors select-none ${
                          isSelected && !isInRange ? 'ring-2 ring-emerald-600 ring-inset z-10' : ''
                        } ${isInRange ? 'bg-emerald-500/10' : ''}`}
                        style={{
                          width: `${colWidth}px`,
                          maxWidth: `${colWidth}px`,
                          height: `${cellHeight}px`,
                          backgroundColor: cell?.bg || condStyle.bg || (isInRange ? 'rgba(16, 185, 129, 0.12)' : (isDarkMode ? '#1e293b' : 'transparent')),
                          color: cell?.color || condStyle.color || (isDarkMode ? '#f1f5f9' : '#0f172a'),
                          fontWeight: cell?.bold ? 'bold' : 'normal',
                          fontStyle: cell?.italic ? 'italic' : 'normal',
                          textDecoration: [
                            cell?.underline ? 'underline' : '',
                            cell?.strike ? 'line-through' : ''
                          ].filter(Boolean).join(' ') || 'none',
                          fontFamily: cell?.fontFamily || undefined,
                          textAlign: (cell?.align as any) || (mergeMaster ? 'center' : (displayVal.match(/^[\d,.\s]+/) ? 'left' : 'right')),
                          verticalAlign: cell?.valign || 'middle',
                          direction: (cell?.direction as any) || undefined,
                          paddingRight: cell?.indent ? `${Math.round((cell.indent * 12 + 6) * zoomFactor)}px` : undefined,
                          whiteSpace: cell?.wrapText ? 'normal' : 'nowrap',
                          overflow: cell?.wrapText ? 'visible' : 'hidden',
                          textOverflow: cell?.wrapText ? 'clip' : 'ellipsis',
                          fontSize: cell?.fontSize ? `${Math.round(cell.fontSize * zoomFactor)}px` : undefined,
                          ...customBorderStyle,
                          ...rangeBorders,
                        }}
                      >
                        {/* Cell Comment Marker (مثلث برتقالي في زاوية الخلية) */}
                        {cell?.comment && (
                          <>
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenCommentModal?.(addr);
                              }}
                              className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-r-[8px] border-t-amber-500 border-r-transparent cursor-pointer z-15 hover:border-t-red-600"
                              title={`تعليق: ${cell.comment.author || 'المستخدم'}`}
                            />
                            {/* Hover Preview Tooltip */}
                            <div className="hidden group-hover:block absolute bottom-full right-0 mb-1 z-50 bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-xl border border-slate-700 w-52 pointer-events-none animate-in fade-in" dir="rtl">
                              <div className="font-bold text-[10px] text-amber-400 border-b border-slate-700 pb-1 mb-1 flex items-center justify-between">
                                <span>💬 {cell.comment.author || 'المستخدم'}</span>
                                <span className="text-[9px] text-slate-400 font-mono">{cell.comment.date ? new Date(cell.comment.date).toLocaleDateString('ar-EG') : ''}</span>
                              </div>
                              <div className="text-[11px] text-slate-200 leading-snug whitespace-normal break-words">
                                {cell.comment.text}
                              </div>
                              <div className="text-[9px] text-amber-300/80 mt-1 text-left">انقر باليمين للتعديل</div>
                            </div>
                          </>
                        )}

                        {/* Interactive Fill Handle (+) in the bottom corner of selected cell or range for auto-fill and copying data */}
                        {isHandleCell && !isEditing && (
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setFillHandleState({ 
                                startRange: rangeBounds ? { start: rangeBounds.startAddr, end: rangeBounds.endAddr } : { start: addr, end: addr }, 
                                currentAddr: addr 
                              });
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              setFillHandleState({ 
                                startRange: rangeBounds ? { start: rangeBounds.startAddr, end: rangeBounds.endAddr } : { start: addr, end: addr }, 
                                currentAddr: addr 
                              });
                            }}
                            className="absolute -bottom-2 -left-2 w-4 h-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-[2px] shadow-md cursor-crosshair z-30 flex items-center justify-center select-none font-black text-[13px] leading-none transition-transform hover:scale-125 ring-1.5 ring-white"
                            title="مقبض التعبئة والتنسيق التلقائي (+)"
                          >
                            +
                          </div>
                        )}

                        {/* Merge badge indicator for merged cell */}
                        {mergeMaster && (
                          <span className="absolute top-0.5 left-0.5 px-1 py-0.2 bg-emerald-100 text-emerald-800 text-[8px] font-bold rounded opacity-0 group-hover:opacity-80 transition-opacity pointer-events-none">
                            ⛶ مدمجة ({mergeMaster.colspan}×{mergeMaster.rowspan})
                          </span>
                        )}

                        {/* Dynamic Visible Dropdown Arrow & Popup Menu */}
                        {cell?.dropdownOptions && cell.dropdownOptions.length > 0 && (
                          <>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setDropdownOpenCell(dropdownOpenCell === addr ? null : addr);
                              }}
                              className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-[2px] flex items-center justify-center text-[9px] font-bold cursor-pointer z-25 shadow-xs transition"
                              title="قائمة منسدلة ديناميكية"
                            >
                              ▼
                            </div>

                            {dropdownOpenCell === addr && (
                              <div className="absolute top-full left-0 z-60 bg-white border border-emerald-500 rounded-lg shadow-2xl py-1.5 min-w-[160px] max-w-[240px] max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150" dir="rtl">
                                <div className="px-3 py-1 bg-emerald-50 text-emerald-900 font-bold text-[11px] border-b border-emerald-100 flex items-center justify-between">
                                  <span>📌 قائمة منسدلة ({addr})</span>
                                  <button onClick={() => setDropdownOpenCell(null)} className="text-slate-400 hover:text-slate-700 font-bold">×</button>
                                </div>
                                <div className="py-1">
                                  {cell.dropdownOptions.map((opt, optIdx) => (
                                    <button
                                      key={optIdx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateCell(addr, { value: opt });
                                        setDropdownOpenCell(null);
                                      }}
                                      className={`w-full text-right px-3 py-1.5 text-xs hover:bg-emerald-100 transition flex items-center justify-between ${
                                        cell.value === opt ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                                      }`}
                                    >
                                      <span>{opt}</span>
                                      {cell.value === opt && <span className="text-emerald-600 font-black">✓</span>}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {isCellEditing ? (
                          <input
                            ref={inlineInputRef}
                            type="text"
                            value={inlineValue}
                            onChange={(e) => setInlineValue(e.target.value)}
                            onBlur={onCommitInlineEdit}
                            className="absolute inset-0 w-full h-full px-1.5 bg-white text-slate-900 font-medium focus:outline-none border-2 border-emerald-600 z-20"
                            style={{ fontSize: `${Math.round(12 * zoomFactor)}px` }}
                            dir="auto"
                          />
                        ) : (
                          <span className="block truncate">{displayVal}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {bottomSpacerHeight > 0 && (
              <tr style={{ height: `${bottomSpacerHeight}px` }}>
                <td colSpan={cols.length + 1} style={{ border: 0, padding: 0, background: 'transparent' }} />
              </tr>
            )}
          </tbody>
        </table>

        {/* Floating Quick Actions Bar for Selected Cell Range */}
        {rangeBounds && rangeBounds.count > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-2xl border border-slate-700 flex items-center gap-1.5 z-40 text-xs animate-in fade-in slide-in-from-bottom-2 max-w-[95vw] overflow-x-auto scrollbar-none">
            <span className="font-bold text-emerald-400 font-mono text-[11px] px-1 shrink-0">
              ⛶ {rangeBounds.startAddr}:{rangeBounds.endAddr} ({rangeBounds.count})
            </span>

            <div className="w-px h-4 bg-slate-700 shrink-0" />

            {/* Format Bold */}
            <button
              onClick={() => {
                const firstBold = sheet.data[rangeBounds.startAddr]?.bold;
                for (let r = rangeBounds.minRow; r <= rangeBounds.maxRow; r++) {
                  for (let c = rangeBounds.minCol; c <= rangeBounds.maxCol; c++) {
                    onUpdateCell(`${colIndexToLetter(c)}${r}`, { bold: !firstBold });
                  }
                }
              }}
              className="p-1 hover:bg-slate-800 text-slate-200 rounded font-bold transition shrink-0"
              title="تنسيق غامق للخلايا المحددة"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            {/* Align Center */}
            <button
              onClick={() => {
                for (let r = rangeBounds.minRow; r <= rangeBounds.maxRow; r++) {
                  for (let c = rangeBounds.minCol; c <= rangeBounds.maxCol; c++) {
                    onUpdateCell(`${colIndexToLetter(c)}${r}`, { align: 'center' });
                  }
                }
              }}
              className="p-1 hover:bg-slate-800 text-slate-200 rounded transition shrink-0"
              title="توسيط النص في الخلايا المحددة"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>

            {/* Border All */}
            <button
              onClick={() => {
                for (let r = rangeBounds.minRow; r <= rangeBounds.maxRow; r++) {
                  for (let c = rangeBounds.minCol; c <= rangeBounds.maxCol; c++) {
                    onUpdateCell(`${colIndexToLetter(c)}${r}`, { borderStyle: 'all', borderColor: '#94a3b8' });
                  }
                }
              }}
              className="flex items-center gap-1 px-2 py-0.5 hover:bg-slate-800 text-slate-200 rounded text-[11px] font-semibold border border-slate-700 transition shrink-0"
              title="تطبيق كافة الحدود للنطاق المحدد"
            >
              <Grid className="w-3 h-3 text-slate-400" />
              <span>حدود</span>
            </button>

            {/* Highlight Background */}
            <button
              onClick={() => {
                const colors = ['#dcfce7', '#fef9c3', '#e0f2fe', ''];
                const curBg = sheet.data[rangeBounds.startAddr]?.bg || '';
                const nextIdx = (colors.indexOf(curBg) + 1) % colors.length;
                const nextBg = colors[nextIdx];
                for (let r = rangeBounds.minRow; r <= rangeBounds.maxRow; r++) {
                  for (let c = rangeBounds.minCol; c <= rangeBounds.maxCol; c++) {
                    onUpdateCell(`${colIndexToLetter(c)}${r}`, { bg: nextBg });
                  }
                }
              }}
              className="flex items-center gap-1 px-2 py-0.5 hover:bg-slate-800 text-slate-200 rounded text-[11px] font-semibold border border-slate-700 transition shrink-0"
              title="تلوين تعبئة الخلايا المحددة"
            >
              <Palette className="w-3 h-3 text-amber-400" />
              <span>تلوين</span>
            </button>

            {/* Currency Format */}
            <button
              onClick={() => {
                for (let r = rangeBounds.minRow; r <= rangeBounds.maxRow; r++) {
                  for (let c = rangeBounds.minCol; c <= rangeBounds.maxCol; c++) {
                    onUpdateCell(`${colIndexToLetter(c)}${r}`, { format: 'currency_yer' });
                  }
                }
              }}
              className="px-2 py-0.5 hover:bg-slate-800 text-slate-200 rounded text-[11px] font-bold border border-slate-700 transition shrink-0"
              title="تنسيق الأرقام كعملة ريال يمني (ر.ي)"
            >
              ر.ي
            </button>

            {/* Merge & Center Cells */}
            <button
              onClick={() => onMergeCells?.({ start: rangeBounds.startAddr, end: rangeBounds.endAddr })}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-[11px] shadow-xs transition shrink-0 whitespace-nowrap"
              title="دمج الخلايا المحددة وتوسيط النص"
            >
              <Combine className="w-3.5 h-3.5" />
              <span>دمج وتوسيط</span>
            </button>

            {/* Fill Value Down */}
            <button
              onClick={() => {
                const firstVal = sheet.data[rangeBounds.startAddr]?.value || '';
                const firstFormula = sheet.data[rangeBounds.startAddr]?.formula;
                for (let r = rangeBounds.minRow; r <= rangeBounds.maxRow; r++) {
                  for (let c = rangeBounds.minCol; c <= rangeBounds.maxCol; c++) {
                    const a = `${colIndexToLetter(c)}${r}`;
                    onUpdateCell(a, { value: firstVal, formula: firstFormula });
                  }
                }
              }}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-medium text-[11px] border border-slate-600 transition shrink-0 whitespace-nowrap"
              title="تعبئة أول قيمة في جميع الخلايا المحددة"
            >
              <Copy className="w-3 h-3 text-emerald-400" />
              <span>تعبئة</span>
            </button>

            {/* Clear Range */}
            <button
              onClick={() => {
                for (let r = rangeBounds.minRow; r <= rangeBounds.maxRow; r++) {
                  for (let c = rangeBounds.minCol; c <= rangeBounds.maxCol; c++) {
                    const a = `${colIndexToLetter(c)}${r}`;
                    onUpdateCell(a, { value: '', formula: undefined });
                  }
                }
              }}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-rose-900/60 text-slate-200 hover:text-rose-200 rounded-full font-medium text-[11px] border border-slate-600 transition shrink-0 whitespace-nowrap"
              title="مسح محتويات النطاق المحدد"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              <span>مسح</span>
            </button>

            {/* Cancel Selection */}
            <button
              onClick={() => onSelectRange?.(null)}
              className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition shrink-0"
              title="إلغاء التحديد"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Movable & Resizable Spreadsheet Images */}
        {(sheet.images || []).map((img) => {
          const isSelected = selectedImageId === img.id;
          return (
            <div
              key={img.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageId(img.id);
              }}
              style={{
                position: 'absolute',
                top: `${img.y}px`,
                left: `${img.x}px`,
                width: `${img.width}px`,
                height: `${img.height}px`,
                zIndex: isSelected ? 35 : 25,
              }}
              className={`group select-none transition-shadow ${
                isSelected ? 'ring-2 ring-blue-600 shadow-xl' : 'hover:ring-1 hover:ring-blue-400'
              }`}
            >
              {/* Floating control bar for active image */}
              {isSelected && (
                <div 
                  className="absolute -top-7 right-0 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-md shadow-lg px-1.5 py-0.5 flex items-center gap-1 text-[10px] z-40 no-print"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDragImageState({
                        id: img.id,
                        startX: e.clientX,
                        startY: e.clientY,
                        origX: img.x,
                        origY: img.y,
                      });
                    }}
                    className="p-1 hover:bg-slate-100 rounded cursor-move text-slate-700"
                    title="سحب وتحريك الصورة"
                  >
                    <Move className="w-3 h-3" />
                  </div>
                  <button
                    onClick={() => handleScaleImage(img.id, 1.2)}
                    className="p-0.5 hover:bg-blue-50 text-blue-700 font-bold px-1 rounded"
                    title="تكبير +"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleScaleImage(img.id, 0.8)}
                    className="p-0.5 hover:bg-blue-50 text-blue-700 font-bold px-1 rounded"
                    title="تصغير -"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                    title="حذف الصورة"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* The image */}
              <img
                src={img.url}
                alt="Spreadsheet element"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* Resize Handle on bottom-left */}
              {isSelected && (
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setResizeImageState({
                      id: img.id,
                      startX: e.clientX,
                      startY: e.clientY,
                      origW: img.width,
                      origH: img.height,
                    });
                  }}
                  className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-blue-600 rounded-tr cursor-nesw-resize z-40 shadow-xs"
                  title="تغيير أبعاد الصورة"
                />
              )}
            </div>
          );
        })}

        {/* Interactive Charts Overlay (المخططات البيانية التفاعلية) */}
        <ExcelChartOverlay
          charts={sheet.charts || []}
          onUpdateChart={(chartId, updates) => {
            const updated = (sheet.charts || []).map((c) => (c.id === chartId ? { ...c, ...updates } : c));
            onUpdateSheetCharts?.(updated);
          }}
          onDeleteChart={(chartId) => {
            const updated = (sheet.charts || []).filter((c) => c.id !== chartId);
            onUpdateSheetCharts?.(updated);
          }}
        />
      </div>

      {/* Unified Excel Bottom Status Bar - Exactly 0.8 cm Height */}
      <div 
        className="bg-slate-200 border-t border-slate-300 flex items-center justify-between px-3 text-[11px] select-none shadow-2xs overflow-hidden leading-none z-30"
        style={{ height: '0.8cm', minHeight: '0.8cm', maxHeight: '0.8cm' }}
      >
        {/* Sheet Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto h-full py-0.5 no-scrollbar">
          {sheets.map((s) => {
            const isActive = s.id === activeSheetId;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSheet(s.id)}
                onDoubleClick={() => {
                  setEditingSheetId(s.id);
                  setTempSheetName(s.name);
                }}
                className={`flex items-center gap-1.5 px-2.5 h-[calc(100%-2px)] rounded-t border-t border-x cursor-pointer transition font-medium text-[11px] ${
                  isActive
                    ? 'bg-white text-emerald-800 border-slate-300 font-bold shadow-2xs'
                    : 'bg-slate-300/80 text-slate-700 hover:bg-slate-300 border-transparent'
                }`}
              >
                <SheetIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                {editingSheetId === s.id ? (
                  <input
                    type="text"
                    autoFocus
                    value={tempSheetName}
                    onChange={(e) => setTempSheetName(e.target.value)}
                    onBlur={() => {
                      if (tempSheetName.trim()) {
                        onRenameSheet(s.id, tempSheetName.trim());
                      }
                      setEditingSheetId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (tempSheetName.trim()) {
                          onRenameSheet(s.id, tempSheetName.trim());
                        }
                        setEditingSheetId(null);
                      }
                    }}
                    className="w-20 px-1 text-[11px] border rounded bg-white h-full"
                  />
                ) : (
                  <span className="truncate max-w-[100px]">{s.name}</span>
                )}
              </div>
            );
          })}

          {/* Add Sheet Button */}
          <button
            onClick={onAddSheet}
            className="p-1 hover:bg-slate-300 rounded text-slate-700 transition"
            title="إضافة ورقة عمل جديدة"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Calculation Statistics & Unified Controls */}
        <div className="flex items-center gap-2 text-slate-600 text-[11px] font-mono font-medium shrink-0">
          <div className="bg-white/80 px-2 py-0.5 rounded border border-slate-300 hidden md:block">
            خلايا: <span className="font-bold text-slate-900">{cellCount}</span>
          </div>
          <div className="bg-white/80 px-2 py-0.5 rounded border border-slate-300 hidden sm:block">
            ∑: <span className="font-bold text-emerald-700">{sumTotal.toLocaleString('en-US')}</span>
          </div>
          <div className="bg-white/80 px-2 py-0.5 rounded border border-slate-300 hidden sm:block">
            AVG: <span className="font-bold text-blue-700">{avgValue}</span>
          </div>

          {/* Virtual Keyboard Toggle */}
          {onToggleKeyboard && (
            <button
              onClick={onToggleKeyboard}
              className={`px-2 py-0.5 rounded border text-[10px] font-bold transition ${
                isKeyboardOpen ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title="لوحة المفاتيح الرياضية الافتراضية"
            >
              ⌨
            </button>
          )}

          {/* Interactive Zoom Control */}
          <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-300 shadow-2xs">
            <button
              onClick={() => onZoomChange && onZoomChange(Math.max(50, Math.round(zoom - 10)))}
              className="p-0.5 hover:bg-slate-100 rounded text-slate-600"
              title="تصغير Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>

            <span 
              onClick={() => onZoomChange && onZoomChange(100)}
              className="px-1 font-bold text-[10px] text-slate-800 cursor-pointer hover:text-emerald-700 select-none min-w-[32px] text-center"
              title="إعادة التكبير إلى 100%"
            >
              {Math.round(zoom)}%
            </span>

            <button
              onClick={() => onZoomChange && onZoomChange(Math.min(200, Math.round(zoom + 10)))}
              className="p-0.5 hover:bg-slate-100 rounded text-slate-600"
              title="تكبير Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          <span className="text-[10px] text-slate-500 font-bold px-1">جاهز</span>
        </div>
      </div>

      {/* Right-Click Context Menu Popup */}
      {contextMenuState && (
        <div 
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-300 py-1.5 w-64 text-right animate-in fade-in"
          style={{ top: `${Math.min(window.innerHeight - 320, contextMenuState.y)}px`, left: `${Math.min(window.innerWidth - 270, contextMenuState.x)}px` }}
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          <div className="px-3 py-1.5 bg-slate-100 font-bold text-slate-700 border-b border-slate-200 text-xs flex items-center justify-between">
            <span>⚙️ الخلية ({contextMenuState.addr})</span>
            <button onClick={() => setContextMenuState(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
          </div>
          <div className="py-1">
            <button
              onClick={() => {
                navigator.clipboard.writeText(sheet.data[contextMenuState.addr]?.value || '');
                setContextMenuState(null);
              }}
              className="w-full text-right px-3 py-2 hover:bg-emerald-50 text-xs font-semibold text-slate-700 transition flex items-center justify-between"
            >
              <span>نسخ المحتوى (Copy)</span>
              <span className="text-[10px] text-slate-400 font-mono">Ctrl+C</span>
            </button>
            <button
              onClick={() => {
                onOpenCommentModal?.(contextMenuState.addr);
                setContextMenuState(null);
              }}
              className="w-full text-right px-3 py-2 hover:bg-emerald-50 text-xs font-semibold text-slate-700 transition flex items-center justify-between"
            >
              <span>إضافة / تعديل تعليق (Comment)</span>
              <span className="text-[10px] text-amber-600 font-bold">💬</span>
            </button>
            <button
              onClick={() => {
                onUpdateCell(contextMenuState.addr, { bold: !sheet.data[contextMenuState.addr]?.bold });
                setContextMenuState(null);
              }}
              className="w-full text-right px-3 py-2 hover:bg-emerald-50 text-xs font-semibold text-slate-700 transition flex items-center justify-between"
            >
              <span>تنسيق غامق (Bold)</span>
              <span className="text-[10px] text-blue-600 font-bold">B</span>
            </button>
            <button
              onClick={() => {
                onUpdateCell(contextMenuState.addr, { value: '', formula: undefined });
                setContextMenuState(null);
              }}
              className="w-full text-right px-3 py-2 hover:bg-rose-50 text-xs font-semibold text-rose-700 transition flex items-center justify-between border-t border-slate-100 mt-1 pt-1"
            >
              <span>مسح الخلية (Clear Content)</span>
              <span className="text-[10px] text-rose-500 font-bold">🗑️</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
