import { CellData } from '../types';

export function colIndexToLetter(colIndex: number): string {
  let temp: number;
  let letter = '';
  let col = colIndex;
  while (col >= 0) {
    temp = col % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    col = Math.floor(col / 26) - 1;
  }
  return letter;
}

export function letterToColIndex(letter: string): number {
  let col = 0;
  for (let i = 0; i < letter.length; i++) {
    col = col * 26 + (letter.charCodeAt(i) - 64);
  }
  return col - 1;
}

export function parseCellAddress(address: string): { col: string; row: number; colIndex: number } | null {
  const match = address.trim().toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  const col = match[1];
  const row = parseInt(match[2], 10);
  return { col, row, colIndex: letterToColIndex(col) };
}

export function parseRange(rangeStr: string): string[] {
  const parts = rangeStr.split(':');
  if (parts.length === 1) return [parts[0].trim().toUpperCase()];
  if (parts.length !== 2) return [];

  const start = parseCellAddress(parts[0]);
  const end = parseCellAddress(parts[1]);
  if (!start || !end) return [];

  const startCol = Math.min(start.colIndex, end.colIndex);
  const endCol = Math.max(start.colIndex, end.colIndex);
  const startRow = Math.min(start.row, end.row);
  const endRow = Math.max(start.row, end.row);

  const cells: string[] = [];
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      cells.push(`${colIndexToLetter(c)}${r}`);
    }
  }
  return cells;
}

export function evaluateFormula(
  formula: string,
  data: Record<string, CellData>,
  visited: Set<string> = new Set()
): string {
  if (!formula.startsWith('=')) return formula;

  const raw = formula.substring(1).trim().toUpperCase();

  // Handle SUM
  const sumMatch = raw.match(/^SUM\(([^)]+)\)$/);
  if (sumMatch) {
    const rangeCells = parseRange(sumMatch[1]);
    let total = 0;
    for (const cell of rangeCells) {
      if (visited.has(cell)) continue; // prevent circular ref
      visited.add(cell);
      const val = getNumericCellValue(cell, data, visited);
      visited.delete(cell);
      total += val;
    }
    return total.toString();
  }

  // Handle AVERAGE
  const avgMatch = raw.match(/^(?:AVERAGE|AVG)\(([^)]+)\)$/);
  if (avgMatch) {
    const rangeCells = parseRange(avgMatch[1]);
    let total = 0;
    let count = 0;
    for (const cell of rangeCells) {
      if (visited.has(cell)) continue;
      visited.add(cell);
      const val = getNumericCellValue(cell, data, visited);
      visited.delete(cell);
      total += val;
      count++;
    }
    return count > 0 ? (total / count).toFixed(2) : '0';
  }

  // Handle COUNT
  const countMatch = raw.match(/^COUNT\(([^)]+)\)$/);
  if (countMatch) {
    const rangeCells = parseRange(countMatch[1]);
    let count = 0;
    for (const cell of rangeCells) {
      const item = data[cell];
      if (item && item.value && item.value.trim() !== '') {
        count++;
      }
    }
    return count.toString();
  }

  // Handle MAX
  const maxMatch = raw.match(/^MAX\(([^)]+)\)$/);
  if (maxMatch) {
    const rangeCells = parseRange(maxMatch[1]);
    const values = rangeCells.map(c => getNumericCellValue(c, data, visited));
    return values.length ? Math.max(...values).toString() : '0';
  }

  // Handle MIN
  const minMatch = raw.match(/^MIN\(([^)]+)\)$/);
  if (minMatch) {
    const rangeCells = parseRange(minMatch[1]);
    const values = rangeCells.map(c => getNumericCellValue(c, data, visited));
    return values.length ? Math.min(...values).toString() : '0';
  }

  // Handle simple arithmetic expressions e.g. D2+D3, A1*1.15
  try {
    const exprWithValues = raw.replace(/[A-Z]+\d+/g, (cellRef) => {
      if (visited.has(cellRef)) return '0';
      visited.add(cellRef);
      const num = getNumericCellValue(cellRef, data, visited);
      visited.delete(cellRef);
      return num.toString();
    });

    // Only allow safe math tokens
    if (/^[\d\s+\-*/().%]+$/.test(exprWithValues)) {
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${exprWithValues})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return Number.isInteger(result) ? result.toString() : result.toFixed(2);
      }
    }
  } catch (err) {
    return '#VALUE!';
  }

  return '#ERROR!';
}

export function getNumericCellValue(
  cellAddr: string,
  data: Record<string, CellData>,
  visited: Set<string>
): number {
  const cell = data[cellAddr];
  if (!cell) return 0;

  if (cell.formula && cell.formula.startsWith('=')) {
    const evalRes = evaluateFormula(cell.formula, data, visited);
    const parsed = parseFloat(evalRes.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }

  const rawVal = cell.value ?? '';
  const clean = rawVal.toString().replace(/[^\d.-]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export function formatCellValue(value: string | number, format?: CellData['format']): string {
  if (value === undefined || value === null) return '';
  const str = value.toString();
  if (!format || format === 'general') return str;

  const num = parseFloat(str.replace(/[^\d.-]/g, ''));
  if (isNaN(num)) return str;

  switch (format) {
    case 'currency_sar':
      return `${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ر.س`;
    case 'currency_yer':
      return `${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ر.ي`;
    case 'currency_usd':
      return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'percent':
      return `${(num * 100).toFixed(1)}%`;
    case 'number':
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    default:
      return str;
  }
}

export interface ExcelUsedRange {
  minCol: number;
  maxCol: number;
  minRow: number;
  maxRow: number;
  totalCols: number;
  totalRows: number;
  cols: string[];
}

export function getExcelUsedRange(sheet?: { data?: Record<string, CellData>; rowCount?: number; colCount?: number }): ExcelUsedRange {
  let minCol = Infinity;
  let maxCol = -1;
  let minRow = Infinity;
  let maxRow = -1;

  const data = sheet?.data || {};
  Object.entries(data).forEach(([key, cell]) => {
    if (cell) {
      const hasContent = Boolean(
        (cell.value !== undefined && cell.value !== null && String(cell.value).trim() !== '') ||
        (cell.formula !== undefined && cell.formula !== null && String(cell.formula).trim() !== '') ||
        (cell.bg && cell.bg !== '#ffffff' && cell.bg !== 'transparent') ||
        (cell.borderStyle && cell.borderStyle !== 'none') ||
        (cell.format && cell.format !== 'general')
      );
      if (hasContent) {
        const parsed = parseCellAddress(key);
        if (parsed) {
          if (parsed.colIndex < minCol) minCol = parsed.colIndex;
          if (parsed.colIndex > maxCol) maxCol = parsed.colIndex;
          if (parsed.row < minRow) minRow = parsed.row;
          if (parsed.row > maxRow) maxRow = parsed.row;
        }
      }
    }
  });

  if (maxRow === -1 || maxCol === -1) {
    minCol = 0;
    maxCol = 4;
    minRow = 1;
    maxRow = 6;
  } else {
    minCol = 0;
    minRow = 1;
  }

  const cols: string[] = [];
  for (let c = minCol; c <= maxCol; c++) {
    cols.push(colIndexToLetter(c));
  }

  return {
    minCol,
    maxCol,
    minRow,
    maxRow,
    totalCols: maxCol - minCol + 1,
    totalRows: maxRow - minRow + 1,
    cols,
  };
}

