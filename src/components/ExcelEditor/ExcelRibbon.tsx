import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignRight, 
  AlignCenter, 
  AlignLeft, 
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Indent,
  Outdent,
  Download, 
  Printer, 
  Plus, 
  Trash2, 
  Columns, 
  Rows, 
  Sigma, 
  Percent, 
  DollarSign, 
  FileSpreadsheet, 
  ChevronDown, 
  Check, 
  Layers, 
  Palette, 
  Type, 
  RotateCcw,
  Sparkles,
  Grid,
  Square,
  ArrowUpDown,
  Table as TableIcon,
  Scissors,
  Copy,
  Clipboard,
  Paintbrush,
  Save,
  FolderOpen,
  FilePlus,
  CheckCircle2,
  FileText,
  Sliders,
  Layout,
  Split,
  Maximize2,
  Scaling,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Image as ImageIcon,
  Shapes,
  HelpCircle,
  Search,
  Hash,
  X,
  FileDown,
  Calculator,
  ShieldCheck,
  Award,
  AlertTriangle,
  Lock,
  Pin
} from 'lucide-react';
import { CellData, ExcelRibbonTab, ExcelSheet, ExcelState } from '../../types';
import { DocumentManagementDropdown } from '../DocumentManagementDropdown';
import { ExcelFloatingDropdown } from './ExcelFloatingDropdown';
import { parseRange, parseCellAddress } from '../../utils/excelCalculations';

interface ExcelRibbonProps {
  activeTab: ExcelRibbonTab;
  onSelectTab: (tab: ExcelRibbonTab) => void;
  selectedCell: string;
  selectedCellData?: CellData;
  onSelectCell?: (cellAddr: string) => void;
  onSelectRange?: (range: { start: string; end: string } | null) => void;
  onUpdateSelectedCell: (partial: Partial<CellData>) => void;
  formulaInput: string;
  onFormulaInputChange: (val: string) => void;
  onFormulaInputSubmit: () => void;
  onInsertFormula: (formulaName: string) => void;
  onFreezePanes: (type: 'row' | 'col' | 'none') => void;
  onInsertRow: () => void;
  onDeleteRow: () => void;
  onInsertCol: () => void;
  onDeleteCol: () => void;
  onClearCell: () => void;
  onExportXlsx: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  activeSheet: ExcelSheet;
  onOpenSimulator?: () => void;
  onApplyTableStyle?: (styleType: string) => void;
  onSortColumn?: (col: string, dir: 'asc' | 'desc') => void;
  onCutCell?: () => void;
  onCopyCell?: () => void;
  onPasteCell?: () => void;
  onFormatPainter?: () => void;
  isFormatPainterActive?: boolean;
  onUpdateRowHeight?: (row: number, height: number) => void;
  selectedRange?: { start: string; end: string } | null;
  onMergeCells?: () => void;
  onSelectColumn?: () => void;
  onSelectRow?: () => void;
  onSelectAllCells?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  isAutoSave?: boolean;
  onToggleAutoSave?: () => void;
  onOpenFile?: () => void;
  onExportPdf?: () => void;
  onUpdateSheet?: (partial: Partial<ExcelSheet>) => void;
  onOpenPageSetup?: () => void;
  onOpenAdvancedExport?: () => void;
  excelState?: ExcelState;
  onOpenExcelDocument?: (state: ExcelState) => void;
  onNewExcelDocument?: () => void;
  onRenameCurrentTitle?: (newTitle: string) => void;
  onOpenPrintPreview?: () => void;
}

export const ExcelRibbon: React.FC<ExcelRibbonProps> = ({
  activeTab,
  onSelectTab,
  selectedCell,
  selectedCellData,
  onSelectCell,
  onSelectRange,
  onUpdateSelectedCell,
  formulaInput,
  onFormulaInputChange,
  onFormulaInputSubmit,
  onInsertFormula,
  onFreezePanes,
  onInsertRow,
  onDeleteRow,
  onInsertCol,
  onDeleteCol,
  onClearCell,
  onExportXlsx,
  onExportCsv,
  onPrint,
  activeSheet,
  onOpenSimulator,
  onApplyTableStyle,
  onSortColumn,
  onCutCell,
  onCopyCell,
  onPasteCell,
  onFormatPainter,
  isFormatPainterActive,
  onUpdateRowHeight,
  selectedRange,
  onMergeCells,
  onSelectColumn,
  onSelectRow,
  onSelectAllCells,
  onSave,
  onSaveAs,
  isAutoSave = true,
  onToggleAutoSave,
  onOpenFile,
  onExportPdf,
  onUpdateSheet,
  onOpenPageSetup,
  onOpenAdvancedExport,
  excelState,
  onOpenExcelDocument,
  onNewExcelDocument,
  onRenameCurrentTitle,
  onOpenPrintPreview,
}) => {
  const [activeExcelDropdown, setActiveExcelDropdown] = useState<{ id: string; rect: DOMRect } | null>(null);
  const [showRowHeightModal, setShowRowHeightModal] = useState(false);
  const [customRowHeightInput, setCustomRowHeightInput] = useState<number>(28);

  // Name Box interactive editing state (مربع الاسم)
  const [nameBoxEditing, setNameBoxEditing] = useState(false);
  const [nameBoxValue, setNameBoxValue] = useState('');

  const handleNameBoxSubmit = () => {
    setNameBoxEditing(false);
    const cleaned = nameBoxValue.trim().toUpperCase();
    if (!cleaned) return;

    if (cleaned.includes(':')) {
      const parts = cleaned.split(':');
      if (parts.length === 2) {
        const start = parseCellAddress(parts[0]);
        const end = parseCellAddress(parts[1]);
        if (start && end) {
          onSelectCell?.(parts[0]);
          onSelectRange?.({ start: parts[0], end: parts[1] });
        }
      }
    } else {
      const parsed = parseCellAddress(cleaned);
      if (parsed) {
        onSelectCell?.(cleaned);
        onSelectRange?.(null);
      }
    }
  };

  // Modals for Insert Tab features
  const [showChartModal, setShowChartModal] = useState<boolean>(false);
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [showShapesDropdown, setShowShapesDropdown] = useState<boolean>(false);
  const [showSymbolsDropdown, setShowSymbolsDropdown] = useState<boolean>(false);
  const [showFinancialTablesMenu, setShowFinancialTablesMenu] = useState<boolean>(false);
  const [showAutoSumMenu, setShowAutoSumMenu] = useState<boolean>(false);
  const [showFreezeMenu, setShowFreezeMenu] = useState<boolean>(false);
  const [showBordersMenu, setShowBordersMenu] = useState<boolean>(false);
  const [showClearMenu, setShowClearMenu] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDropdown = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeExcelDropdown?.id === id) {
      setActiveExcelDropdown(null);
    } else {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setActiveExcelDropdown({ id, rect });
    }
  };

  // Close dropdowns when clicking outside
  const handleCloseAllDropdowns = () => {
    setActiveExcelDropdown(null);
    setShowShapesDropdown(false);
    setShowSymbolsDropdown(false);
    setShowFinancialTablesMenu(false);
    setShowAutoSumMenu(false);
    setShowFreezeMenu(false);
    setShowBordersMenu(false);
    setShowClearMenu(false);
  };

  // Extract selected row number for row height adjustments
  const selectedRowNum = parseInt(selectedCell.replace(/^[A-Z]+/, ''), 10) || 1;
  const currentRowHeight = (activeSheet.rowHeights && activeSheet.rowHeights[selectedRowNum]) || 28;

  // Tabs list
  const tabs: { id: ExcelRibbonTab; label: string }[] = [
    { id: 'file', label: 'ملف' },
    { id: 'home', label: 'الرئيسية' },
    { id: 'insert', label: 'إدراج' },
    { id: 'layout', label: 'تخطيط الصفحة' },
    { id: 'formulas', label: 'الصيغ' },
    { id: 'data', label: 'البيانات' },
    { id: 'review', label: 'مراجعة' },
    { id: 'view', label: 'عرض' },
  ];

  const bgColors = [
    '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1',
    '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e',
    '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6',
    '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b',
    '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444',
  ];

  const textColors = [
    '#000000', '#1e293b', '#475569', '#64748b', '#94a3b8',
    '#166534', '#15803d', '#16a34a', '#22c55e', '#86efac',
    '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#93c5fd',
    '#92400e', '#b45309', '#d97706', '#f59e0b', '#fde68a',
    '#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#fca5a5',
  ];

  const numberFormats: { id: CellData['format']; label: string; example: string }[] = [
    { id: 'general', label: 'عام (General)', example: '1234.5' },
    { id: 'number', label: 'رقم بفواصل آلاف', example: '1,234.50' },
    { id: 'currency_sar', label: 'ريال سعودي (ر.س)', example: '1,234.50 ر.س' },
    { id: 'currency_yer', label: 'ريال يمني (ر.ي)', example: '1,234.50 ر.ي' },
    { id: 'currency_usd', label: 'دولار أمريكي ($)', example: '$1,234.50' },
    { id: 'percent', label: 'نسبة مئوية (%)', example: '15.00%' },
    { id: 'date', label: 'تاريخ (يوم/شهر/سنة)', example: '2026/10/12' },
    { id: 'text', label: 'نص صريح (Text)', example: 'نص' },
  ];

  const cellBorderOptions: { id: CellData['borderStyle']; label: string; borderColor?: string }[] = [
    { id: 'all', label: 'كافة الحدود (All Borders)', borderColor: '#94a3b8' },
    { id: 'box', label: 'إطار خارجي سميك (Thick Box)', borderColor: '#15803d' },
    { id: 'double_bottom', label: 'حد سفلي مزدوج (للمجاميع)', borderColor: '#0369a1' },
    { id: 'bottom', label: 'حد سفلي عادي', borderColor: '#334155' },
    { id: 'none', label: 'بلا حدود (No Border)' },
  ];

  const formulasList = [
    { name: 'SUM', label: 'مجموع (SUM ∑)', syntax: '=SUM(D2:D6)' },
    { name: 'AVERAGE', label: 'متوسط حسابي (AVERAGE)', syntax: '=AVERAGE(D2:D6)' },
    { name: 'COUNT', label: 'عدد الخلايا (COUNT)', syntax: '=COUNT(A2:A6)' },
    { name: 'MAX', label: 'أعلى قيمة (MAX)', syntax: '=MAX(D2:D6)' },
    { name: 'MIN', label: 'أدنى قيمة (MIN)', syntax: '=MIN(D2:D6)' },
  ];

  const excelFonts = [
    { name: 'افتراضي (أميري)', value: "'Amiri', serif" },
    { name: 'القاهرة (Cairo)', value: "'Cairo', sans-serif" },
    { name: 'تجوال (Tajawal)', value: "'Tajawal', sans-serif" },
    { name: 'نسخ (Noto Naskh)', value: "'Noto Naskh Arabic', serif" },
    { name: 'كوفي (Noto Kufi)', value: "'Noto Kufi Arabic', sans-serif" },
    { name: 'Arial', value: "Arial, sans-serif" },
    { name: 'Calibri', value: "Calibri, sans-serif" },
    { name: 'Times New Roman', value: "'Times New Roman', serif" },
  ];

  const excelFontSizes = [9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36];

  // Financial Table Templates Generators
  const applyFinancialTemplate = (type: 'estate' | 'legal' | 'payroll' | 'receipts') => {
    if (!onUpdateSheet) return;
    handleCloseAllDropdowns();

    if (type === 'estate') {
      onUpdateSheet({
        name: 'حصر التركات والأنصبة',
        data: {
          'A1': { value: 'م', bold: true, align: 'center', bg: '#065f46', color: '#ffffff', borderStyle: 'all' },
          'B1': { value: 'بيان العقار / المال المورث', bold: true, align: 'center', bg: '#047857', color: '#ffffff', borderStyle: 'all' },
          'C1': { value: 'القيمة التقديرية (ريال)', bold: true, align: 'center', bg: '#047857', color: '#ffffff', borderStyle: 'all' },
          'D1': { value: 'نسبة النصيب الشرعي', bold: true, align: 'center', bg: '#047857', color: '#ffffff', borderStyle: 'all' },
          'E1': { value: 'قيمة النصيب المستحق (ريال)', bold: true, align: 'center', bg: '#047857', color: '#ffffff', borderStyle: 'all' },
          'A2': { value: '1', align: 'center', borderStyle: 'all' },
          'B2': { value: 'عقار عمارة سكنية - صنعاء', align: 'right', borderStyle: 'all' },
          'C2': { value: '120000000', format: 'currency_yer', align: 'left', borderStyle: 'all' },
          'D2': { value: '50%', format: 'percent', align: 'center', borderStyle: 'all' },
          'E2': { formula: '=C2*0.5', format: 'currency_yer', align: 'left', borderStyle: 'all', bold: true },
          'A3': { value: '2', align: 'center', borderStyle: 'all' },
          'B3': { value: 'أرضية تجارية - مساحة 6 لِبن', align: 'right', borderStyle: 'all' },
          'C3': { value: '85000000', format: 'currency_yer', align: 'left', borderStyle: 'all' },
          'D3': { value: '50%', format: 'percent', align: 'center', borderStyle: 'all' },
          'E3': { formula: '=C3*0.5', format: 'currency_yer', align: 'left', borderStyle: 'all', bold: true },
          'A4': { value: '∑', bold: true, align: 'center', bg: '#ecfdf5', color: '#065f46', borderStyle: 'double_bottom' },
          'B4': { value: 'إجمالي التركة المقدرة', bold: true, align: 'right', bg: '#f0fdf4', color: '#065f46', borderStyle: 'double_bottom' },
          'C4': { formula: '=SUM(C2:C3)', format: 'currency_yer', bold: true, align: 'left', bg: '#ecfdf5', borderStyle: 'double_bottom' },
          'D4': { value: '100%', format: 'percent', bold: true, align: 'center', bg: '#ecfdf5', borderStyle: 'double_bottom' },
          'E4': { formula: '=SUM(E2:E3)', format: 'currency_yer', bold: true, align: 'left', bg: '#ecfdf5', color: '#065f46', borderStyle: 'double_bottom' },
        }
      });
    } else if (type === 'legal') {
      onUpdateSheet({
        name: 'بيان المصاريف القضائية',
        data: {
          'A1': { value: 'م', bold: true, align: 'center', bg: '#0369a1', color: '#ffffff', borderStyle: 'all' },
          'B1': { value: 'البند / الرسوم القضائية', bold: true, align: 'center', bg: '#0284c7', color: '#ffffff', borderStyle: 'all' },
          'C1': { value: 'الجهة المنفذة', bold: true, align: 'center', bg: '#0284c7', color: '#ffffff', borderStyle: 'all' },
          'D1': { value: 'المبلغ المستحق (ريال)', bold: true, align: 'center', bg: '#0284c7', color: '#ffffff', borderStyle: 'all' },
          'A2': { value: '1', align: 'center', borderStyle: 'all' },
          'B2': { value: 'رسوم المحكمة وقيد الدعوى', align: 'right', borderStyle: 'all' },
          'C2': { value: 'قلم المحكمة الإبتدائية', align: 'right', borderStyle: 'all' },
          'D2': { value: '150000', format: 'currency_yer', align: 'left', borderStyle: 'all' },
          'A3': { value: '2', align: 'center', borderStyle: 'all' },
          'B3': { value: 'أتعاب الخبير العدلي الهندسي ومسح الأراضي', align: 'right', borderStyle: 'all' },
          'C3': { value: 'مكتب المساحة العدلي', align: 'right', borderStyle: 'all' },
          'D3': { value: '450000', format: 'currency_yer', align: 'left', borderStyle: 'all' },
          'A4': { value: '3', align: 'center', borderStyle: 'all' },
          'B4': { value: 'أجور الإعلانات والنشر القضائي', align: 'right', borderStyle: 'all' },
          'C4': { value: 'الصحيفة الرسمية', align: 'right', borderStyle: 'all' },
          'D4': { value: '80000', format: 'currency_yer', align: 'left', borderStyle: 'all' },
          'A5': { value: '∑', bold: true, align: 'center', bg: '#e0f2fe', color: '#0369a1', borderStyle: 'double_bottom' },
          'B5': { value: 'إجمالي الرسوم التقديرية', bold: true, align: 'right', bg: '#f0f9ff', color: '#0369a1', borderStyle: 'double_bottom' },
          'C5': { value: 'معتمد للمطالبة', bold: true, align: 'center', bg: '#f0f9ff', color: '#0369a1', borderStyle: 'double_bottom' },
          'D5': { formula: '=SUM(D2:D4)', format: 'currency_yer', bold: true, align: 'left', bg: '#e0f2fe', color: '#0369a1', borderStyle: 'double_bottom' },
        }
      });
    } else if (type === 'payroll') {
      onUpdateSheet({
        name: 'مسير الرواتب والبدلات',
        data: {
          'A1': { value: 'م', bold: true, align: 'center', bg: '#92400e', color: '#ffffff', borderStyle: 'all' },
          'B1': { value: 'اسم الموظف / الوظيفة', bold: true, align: 'center', bg: '#b45309', color: '#ffffff', borderStyle: 'all' },
          'C1': { value: 'الراتب الأساسي', bold: true, align: 'center', bg: '#b45309', color: '#ffffff', borderStyle: 'all' },
          'D1': { value: 'البدلات والمكافآت', bold: true, align: 'center', bg: '#b45309', color: '#ffffff', borderStyle: 'all' },
          'E1': { value: 'صافي المستحق', bold: true, align: 'center', bg: '#b45309', color: '#ffffff', borderStyle: 'all' },
          'A2': { value: '1', align: 'center', borderStyle: 'all' },
          'B2': { value: 'محمد أحمد - مدير إداري', align: 'right', borderStyle: 'all' },
          'C2': { value: '8000', format: 'currency_sar', align: 'left', borderStyle: 'all' },
          'D2': { value: '2000', format: 'currency_sar', align: 'left', borderStyle: 'all' },
          'E2': { formula: '=C2+D2', format: 'currency_sar', align: 'left', borderStyle: 'all', bold: true },
          'A3': { value: '2', align: 'center', borderStyle: 'all' },
          'B3': { value: 'خالد عبدالله - محاسب مالي', align: 'right', borderStyle: 'all' },
          'C3': { value: '6000', format: 'currency_sar', align: 'left', borderStyle: 'all' },
          'D3': { value: '1500', format: 'currency_sar', align: 'left', borderStyle: 'all' },
          'E3': { formula: '=C3+D3', format: 'currency_sar', align: 'left', borderStyle: 'all', bold: true },
          'A4': { value: '∑', bold: true, align: 'center', bg: '#fef3c7', color: '#92400e', borderStyle: 'double_bottom' },
          'B4': { value: 'إجمالي المسير الشهري', bold: true, align: 'right', bg: '#fffbeb', color: '#92400e', borderStyle: 'double_bottom' },
          'C4': { formula: '=SUM(C2:C3)', format: 'currency_sar', bold: true, align: 'left', bg: '#fef3c7', borderStyle: 'double_bottom' },
          'D4': { formula: '=SUM(D2:D3)', format: 'currency_sar', bold: true, align: 'left', bg: '#fef3c7', borderStyle: 'double_bottom' },
          'E4': { formula: '=SUM(E2:E3)', format: 'currency_sar', bold: true, align: 'left', bg: '#fef3c7', color: '#92400e', borderStyle: 'double_bottom' },
        }
      });
    } else if (type === 'receipts') {
      onUpdateSheet({
        name: 'سندات المقبوضات والمدفوعات',
        data: {
          'A1': { value: 'رقم السند', bold: true, align: 'center', bg: '#1e3a8a', color: '#ffffff', borderStyle: 'all' },
          'B1': { value: 'البيان والتفاصيل', bold: true, align: 'center', bg: '#1d4ed8', color: '#ffffff', borderStyle: 'all' },
          'C1': { value: 'مقبوضات (وارد)', bold: true, align: 'center', bg: '#1d4ed8', color: '#ffffff', borderStyle: 'all' },
          'D1': { value: 'مدفوعات (صادر)', bold: true, align: 'center', bg: '#1d4ed8', color: '#ffffff', borderStyle: 'all' },
          'E1': { value: 'الرصيد التراكمي', bold: true, align: 'center', bg: '#1d4ed8', color: '#ffffff', borderStyle: 'all' },
          'A2': { value: 'REC-101', align: 'center', borderStyle: 'all' },
          'B2': { value: 'دفعة مقدمة - عقد استشارات', align: 'right', borderStyle: 'all' },
          'C2': { value: '50000', format: 'currency_sar', align: 'left', borderStyle: 'all' },
          'D2': { value: '0', format: 'currency_sar', align: 'left', borderStyle: 'all' },
          'E2': { formula: '=C2-D2', format: 'currency_sar', align: 'left', borderStyle: 'all', bold: true },
          'A3': { value: 'PAY-102', align: 'center', borderStyle: 'all' },
          'B3': { value: 'مصاريف تشغيل وتجهيز', align: 'right', borderStyle: 'all' },
          'C3': { value: '0', format: 'currency_sar', align: 'left', borderStyle: 'all' },
          'D3': { value: '12000', format: 'currency_sar', align: 'left', borderStyle: 'all' },
          'E3': { formula: '=E2-D3', format: 'currency_sar', align: 'left', borderStyle: 'all', bold: true },
        }
      });
    }
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateSelectedCell({
          value: `[صورة: ${file.name}]`,
          bold: true,
          bg: '#f8fafc',
          color: '#0284c7',
          borderStyle: 'box',
          align: 'center',
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Calculations for charts from current sheet
  const chartDataSummary = () => {
    const sheetData = activeSheet.data || {};
    const items: { label: string; value: number }[] = [];
    // Extract rows 2 to 10 for label (col B) and value (col C or D or E)
    for (let r = 2; r <= 8; r++) {
      const labelCell = sheetData[`B${r}`]?.value;
      const valCell = sheetData[`C${r}`]?.value || sheetData[`D${r}`]?.value || sheetData[`E${r}`]?.value;
      if (labelCell && valCell) {
        const num = parseFloat(valCell.replace(/[^\d.-]/g, ''));
        if (!isNaN(num) && num > 0) {
          items.push({ label: labelCell.slice(0, 18), value: num });
        }
      }
    }
    if (items.length === 0) {
      return [
        { label: 'الربع الأول', value: 45000 },
        { label: 'الربع الثاني', value: 72000 },
        { label: 'الربع الثالث', value: 58000 },
        { label: 'الربع الرابع', value: 91000 },
      ];
    }
    return items;
  };

  return (
    <div className="bg-white border-b border-slate-300 select-none no-print shadow-2xs text-slate-800" dir="rtl">
      {/* ─── 1. شريط التبويبات العلوي (Tab Navigation Strip) ─── */}
      <div className="flex items-center px-2 border-b border-slate-200 overflow-x-auto bg-slate-50 text-[11px] h-[30px] scrollbar-none gap-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 h-full font-bold relative whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'text-emerald-800 bg-white border-t-2 border-t-emerald-600 border-x border-slate-200 shadow-2xs -mb-px'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── 2. مساحة أشرطة الأدوات المرنة والمتجاوبة (Ribbon Controls Container) ─── */}
      <div className="px-2 py-1 min-h-[46px] flex items-center overflow-x-auto bg-slate-50/90 text-slate-800 text-xs scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="flex items-center gap-2 flex-nowrap shrink-0 h-full"
          >
            {/* =========================================================================
                FILE TAB (ملف)
            ========================================================================= */}
            {activeTab === 'file' && (
              <div className="flex items-center gap-2 flex-nowrap shrink-0">
                <DocumentManagementDropdown
                  currentMode="excel"
                  currentTitle={excelState?.title || 'مصنف_حسابات_جديد.xlsx'}
                  onOpenExcelDocument={onOpenExcelDocument}
                  onNewExcelDocument={onNewExcelDocument}
                  onSaveCurrentDocument={onSave}
                  onSaveAsNewDocument={onSaveAs}
                  onRenameCurrentTitle={onRenameCurrentTitle}
                  currentExcelState={excelState}
                  onOpenFile={onOpenFile}
                  onOpenPrintPreview={() => onOpenPrintPreview ? onOpenPrintPreview() : (onExportPdf ? onExportPdf() : onPrint?.())}
                  onPrint={onPrint}
                  onExportPdf={onExportPdf}
                  onExportXlsx={onExportXlsx}
                  onExportCsv={onExportCsv}
                  onOpenPageSetup={onOpenPageSetup}
                  onOpenAdvancedExport={onOpenAdvancedExport}
                />

                <div className="h-6 w-px bg-slate-300 mx-0.5 shrink-0" />

                <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-1">
                  <button
                    onClick={() => onOpenPrintPreview ? onOpenPrintPreview() : (onExportPdf ? onExportPdf() : onPrint?.())}
                    className="px-2.5 h-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md font-bold text-xs flex items-center gap-1.5 transition border border-emerald-200 cursor-pointer"
                    title="معاينة مصنف إكسل قبل الطباعة والتصدير"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>معاينة الطباعة</span>
                  </button>

                  <button
                    onClick={onSave}
                    className="px-2.5 h-full hover:bg-slate-100 text-slate-700 rounded-md font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    title="حفظ المصنف الحالي"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-600" />
                    <span>حفظ سريع</span>
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================================
                1️⃣ HOME TAB (الرئيسية) - مرتبة من الأساسي إلى الثانوي
            ========================================================================= */}
            {activeTab === 'home' && (
              <div className="flex items-center gap-2 flex-nowrap shrink-0">
                {/* 1. مجموعة الحافظة (Clipboard - أساسي) */}
                <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-0.5 shrink-0" title="الحافظة">
                  <button
                    onClick={onCutCell}
                    className="px-2 h-full hover:bg-slate-100 rounded text-slate-700 transition flex items-center gap-1 text-xs font-semibold"
                    title="قص الخلية (Ctrl+X)"
                  >
                    <Scissors className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="hidden sm:inline">قص</span>
                  </button>
                  <button
                    onClick={onCopyCell}
                    className="px-2 h-full hover:bg-slate-100 rounded text-slate-700 transition flex items-center gap-1 text-xs font-semibold"
                    title="نسخ الخلية (Ctrl+C)"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="hidden sm:inline">نسخ</span>
                  </button>
                  <button
                    onClick={onPasteCell}
                    className="px-2 h-full hover:bg-slate-100 rounded text-slate-700 transition flex items-center gap-1 text-xs font-semibold"
                    title="لصق الخلية (Ctrl+V)"
                  >
                    <Clipboard className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="hidden sm:inline">لصق</span>
                  </button>
                  <button
                    onClick={onFormatPainter}
                    className={`px-2 h-full rounded transition flex items-center gap-1 text-xs font-semibold ${
                      isFormatPainterActive ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                    title="نسخ التنسيق (Format Painter)"
                  >
                    <Paintbrush className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="hidden md:inline">نسخ التنسيق</span>
                  </button>
                </div>

                <div className="w-px h-6 bg-slate-300 mx-0.5 shrink-0" />

                {/* 2. مجموعة الخط والتعبئة والحدود (Font, Fill & Borders - أساسي) */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* نوع وحجم الخط */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] px-1.5 shadow-2xs gap-1">
                    <select
                      value={selectedCellData?.fontFamily || "'Amiri', serif"}
                      onChange={(e) => onUpdateSelectedCell({ fontFamily: e.target.value })}
                      className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer max-w-[110px]"
                      title="نوع الخط للخلية"
                    >
                      {excelFonts.map((f, i) => (
                        <option key={i} value={f.value}>
                          {f.name}
                        </option>
                      ))}
                    </select>

                    <div className="w-px h-4 bg-slate-200" />

                    <select
                      value={selectedCellData?.fontSize || 12}
                      onChange={(e) => onUpdateSelectedCell({ fontSize: parseInt(e.target.value, 10) })}
                      className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer"
                      title="حجم الخط"
                    >
                      {excelFontSizes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* تكبير/تصغير الخط */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] shadow-2xs overflow-hidden">
                    <button
                      onClick={() => {
                        const curr = selectedCellData?.fontSize || 12;
                        onUpdateSelectedCell({ fontSize: Math.min(curr + 2, 48) });
                      }}
                      className="px-2 h-full hover:bg-slate-100 text-slate-700 font-bold border-l border-slate-200 text-xs"
                      title="تكبير حجم الخط (A+)"
                    >
                      A+
                    </button>
                    <button
                      onClick={() => {
                        const curr = selectedCellData?.fontSize || 12;
                        onUpdateSelectedCell({ fontSize: Math.max(curr - 2, 8) });
                      }}
                      className="px-2 h-full hover:bg-slate-100 text-slate-700 font-bold text-xs"
                      title="تصغير حجم الخط (A-)"
                    >
                      A-
                    </button>
                  </div>

                  {/* أنماط الخط: غامق، مائل، تسطير، يتوسطه خط */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-0.5">
                    <button
                      onClick={() => onUpdateSelectedCell({ bold: !selectedCellData?.bold })}
                      className={`px-2 h-full rounded transition ${
                        selectedCellData?.bold ? 'bg-emerald-100 text-emerald-900 font-black' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="غامق (Bold - Ctrl+B)"
                    >
                      <Bold className="w-3.5 h-3.5 shrink-0" />
                    </button>
                    <button
                      onClick={() => onUpdateSelectedCell({ italic: !selectedCellData?.italic })}
                      className={`px-2 h-full rounded transition ${
                        selectedCellData?.italic ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="مائل (Italic - Ctrl+I)"
                    >
                      <Italic className="w-3.5 h-3.5 shrink-0" />
                    </button>
                    <button
                      onClick={() => onUpdateSelectedCell({ underline: !selectedCellData?.underline })}
                      className={`px-2 h-full rounded transition ${
                        selectedCellData?.underline ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="تسطير (Underline - Ctrl+U)"
                    >
                      <Underline className="w-3.5 h-3.5 shrink-0" />
                    </button>
                    <button
                      onClick={() => onUpdateSelectedCell({ strike: !selectedCellData?.strike })}
                      className={`px-2 h-full rounded transition ${
                        selectedCellData?.strike ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="يتوسطه خط (Strikethrough)"
                    >
                      <Strikethrough className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>

                  {/* ألوان الخط والتعبئة */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-1">
                    <button
                      onClick={(e) => handleOpenDropdown('bgColor', e)}
                      className="flex items-center gap-1.5 px-2 h-full hover:bg-slate-100 rounded text-slate-700 transition"
                      title="لون تعبئة الخلية (Fill Color)"
                    >
                      <Palette className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span 
                        className="w-3.5 h-3.5 rounded-xs border border-slate-400 shadow-2xs shrink-0" 
                        style={{ backgroundColor: selectedCellData?.bg || '#ffffff' }} 
                      />
                      <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    </button>

                    <button
                      onClick={(e) => handleOpenDropdown('textColor', e)}
                      className="flex items-center gap-1.5 px-2 h-full hover:bg-slate-100 rounded text-slate-700 transition"
                      title="لون الخط (Text Color)"
                    >
                      <Type className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      <span 
                        className="w-3.5 h-3.5 rounded-xs border border-slate-400 shadow-2xs shrink-0" 
                        style={{ backgroundColor: selectedCellData?.color || '#000000' }} 
                      />
                      <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    </button>
                  </div>

                  {/* حدود الخلايا (Borders) */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-0.5">
                    <button
                      onClick={() => onUpdateSelectedCell({ borderStyle: 'all', borderColor: '#94a3b8' })}
                      className={`px-2 h-full rounded text-xs font-semibold transition flex items-center gap-1 ${
                        selectedCellData?.borderStyle === 'all' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="كافة الحدود (All Borders)"
                    >
                      <Grid className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      <span>كافة الحدود</span>
                    </button>
                    <button
                      onClick={(e) => handleOpenDropdown('border', e)}
                      className="px-1.5 h-full hover:bg-slate-100 rounded text-slate-500"
                      title="خيارات الحدود الإضافية"
                    >
                      <ChevronDown className="w-3 h-3 shrink-0" />
                    </button>
                  </div>
                </div>

                <div className="w-px h-6 bg-slate-300 mx-0.5 shrink-0" />

                {/* 3. مجموعة المحاذاة والاتجاه (Alignment & Direction - أساسي) */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* محاذاة أفقية */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-0.5">
                    <button
                      onClick={() => onUpdateSelectedCell({ align: 'right' })}
                      className={`px-1.5 h-full rounded ${selectedCellData?.align === 'right' ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-slate-100 text-slate-700'}`}
                      title="محاذاة لليمين"
                    >
                      <AlignRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                    <button
                      onClick={() => onUpdateSelectedCell({ align: 'center' })}
                      className={`px-1.5 h-full rounded ${selectedCellData?.align === 'center' ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-slate-100 text-slate-700'}`}
                      title="توسيط"
                    >
                      <AlignCenter className="w-3.5 h-3.5 shrink-0" />
                    </button>
                    <button
                      onClick={() => onUpdateSelectedCell({ align: 'left' })}
                      className={`px-1.5 h-full rounded ${selectedCellData?.align === 'left' ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-slate-100 text-slate-700'}`}
                      title="محاذاة لليسار"
                    >
                      <AlignLeft className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>

                  {/* محاذاة رأسية */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-0.5">
                    <button
                      onClick={() => onUpdateSelectedCell({ valign: 'top' })}
                      className={`px-1.5 h-full rounded ${selectedCellData?.valign === 'top' ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-slate-100 text-slate-700'}`}
                      title="محاذاة للأعلى"
                    >
                      <AlignVerticalJustifyStart className="w-3 h-3 shrink-0" />
                    </button>
                    <button
                      onClick={() => onUpdateSelectedCell({ valign: 'middle' })}
                      className={`px-1.5 h-full rounded ${(selectedCellData?.valign === 'middle' || !selectedCellData?.valign) ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-slate-100 text-slate-700'}`}
                      title="محاذاة للوسط"
                    >
                      <AlignVerticalJustifyCenter className="w-3 h-3 shrink-0" />
                    </button>
                    <button
                      onClick={() => onUpdateSelectedCell({ valign: 'bottom' })}
                      className={`px-1.5 h-full rounded ${selectedCellData?.valign === 'bottom' ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-slate-100 text-slate-700'}`}
                      title="محاذاة للأسفل"
                    >
                      <AlignVerticalJustifyEnd className="w-3 h-3 shrink-0" />
                    </button>
                  </div>

                  {/* التفاف النص */}
                  <button
                    onClick={() => onUpdateSelectedCell({ wrapText: !selectedCellData?.wrapText })}
                    className={`px-2.5 h-[32px] rounded-lg text-xs font-semibold border shadow-2xs transition shrink-0 flex items-center gap-1 ${
                      selectedCellData?.wrapText ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                    title="التفاف النص داخل الخلية (Wrap Text)"
                  >
                    <span>التفاف النص</span>
                  </button>

                  {/* دمج وتوسيط */}
                  <button
                    onClick={onMergeCells}
                    className={`flex items-center gap-1.5 px-2.5 h-[32px] rounded-lg text-xs font-bold border shadow-2xs transition shrink-0 ${
                      selectedCellData?.colSpan && selectedCellData.colSpan > 1
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-emerald-50 hover:text-emerald-900'
                    }`}
                    title="دمج الخلايا المحددة وتوسيط محتواها، أو إلغاء الدمج (Merge & Center)"
                  >
                    <Columns className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{selectedCellData?.colSpan && selectedCellData.colSpan > 1 ? 'إلغاء الدمج' : 'دمج وتوسيط'}</span>
                  </button>

                  {/* اتجاه النص RTL / LTR */}
                  <button
                    onClick={() => {
                      const nextDir = selectedCellData?.direction === 'ltr' ? 'rtl' : 'ltr';
                      onUpdateSelectedCell({ direction: nextDir });
                    }}
                    className="px-2 h-[32px] bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-2xs shrink-0"
                    title="تبديل اتجاه كتابة الخلية (RTL / LTR)"
                  >
                    <span>اتجاه {selectedCellData?.direction === 'ltr' ? 'LTR' : 'RTL'}</span>
                  </button>
                </div>

                <div className="w-px h-6 bg-slate-300 mx-0.5 shrink-0" />

                {/* 4. مجموعة الأرقام والتنسيق (Number Formatting - ثانوي) */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* قائمة تنسيق الأرقام المنسدلة */}
                  <button
                    onClick={(e) => handleOpenDropdown('format', e)}
                    className="flex items-center gap-1.5 px-2.5 h-[32px] bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs"
                    title="تنسيق الأرقام والعملات"
                  >
                    <span>تنسيق: {numberFormats.find(f => f.id === selectedCellData?.format)?.label.split(' ')[0] || 'عام'}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>

                  {/* أزرار العملات والأرقام السريعة والمثبتة */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-0.5">
                    {/* ريال سعودي */}
                    <button
                      onClick={() => onUpdateSelectedCell({ format: 'currency_sar' })}
                      className={`px-2 h-full rounded text-xs font-bold transition ${
                        selectedCellData?.format === 'currency_sar' ? 'bg-emerald-100 text-emerald-900 font-black' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="تنسيق ريال سعودي (ر.س)"
                    >
                      ر.س
                    </button>

                    {/* ريال يمني */}
                    <button
                      onClick={() => onUpdateSelectedCell({ format: 'currency_yer' })}
                      className={`px-2 h-full rounded text-xs font-bold transition ${
                        selectedCellData?.format === 'currency_yer' ? 'bg-emerald-100 text-emerald-900 font-black' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="تنسيق ريال يمني (ر.ي)"
                    >
                      ر.ي
                    </button>

                    {/* دولار أمريكي */}
                    <button
                      onClick={() => onUpdateSelectedCell({ format: 'currency_usd' })}
                      className={`px-2 h-full rounded text-xs font-bold transition ${
                        selectedCellData?.format === 'currency_usd' ? 'bg-emerald-100 text-emerald-900 font-black' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="تنسيق دولار أمريكي ($)"
                    >
                      $
                    </button>

                    {/* نسبة مئوية */}
                    <button
                      onClick={() => onUpdateSelectedCell({ format: 'percent' })}
                      className={`px-2 h-full rounded text-xs font-bold transition ${
                        selectedCellData?.format === 'percent' ? 'bg-emerald-100 text-emerald-900 font-black' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="نسبة مئوية (%)"
                    >
                      %
                    </button>

                    {/* فاصلة الآلاف */}
                    <button
                      onClick={() => onUpdateSelectedCell({ format: 'number' })}
                      className={`px-2 h-full rounded text-xs font-bold font-mono transition ${
                        selectedCellData?.format === 'number' ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="فاصلة الآلاف (,)"
                    >
                      ,
                    </button>

                    {/* زيادة المنازل العشرية */}
                    <button
                      onClick={() => {
                        const cur = selectedCellData?.decimals !== undefined ? selectedCellData.decimals : 2;
                        onUpdateSelectedCell({ decimals: Math.min(6, cur + 1) });
                      }}
                      className="px-1.5 h-full hover:bg-slate-100 rounded text-[11px] font-bold text-slate-700 font-mono"
                      title="زيادة المنازل العشرية (.00)"
                    >
                      .00+
                    </button>

                    {/* إنقاص المنازل العشرية */}
                    <button
                      onClick={() => {
                        const cur = selectedCellData?.decimals !== undefined ? selectedCellData.decimals : 2;
                        onUpdateSelectedCell({ decimals: Math.max(0, cur - 1) });
                      }}
                      className="px-1.5 h-full hover:bg-slate-100 rounded text-[11px] font-bold text-slate-700 font-mono"
                      title="إنقاص المنازل العشرية (.0)"
                    >
                      .0-
                    </button>
                  </div>
                </div>

                <div className="w-px h-6 bg-slate-300 mx-0.5 shrink-0" />

                {/* 5. مجموعة الخلايا والتحرير المتقدم (Cells & Editing - ثانوي/شامل) */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* إدراج وحذف صفوف وأعمدة */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-1">
                    <button
                      onClick={onInsertRow}
                      className="px-2 h-full hover:bg-emerald-50 text-slate-800 rounded text-xs font-bold transition flex items-center gap-1"
                      title="إدراج صف جديد أسفل الخلية"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>+ صف</span>
                    </button>
                    <button
                      onClick={onDeleteRow}
                      className="px-2 h-full hover:bg-rose-50 text-rose-700 rounded text-xs font-bold transition flex items-center gap-1"
                      title="حذف الصف الحالي"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>حذف صف</span>
                    </button>
                    <div className="w-px h-4 bg-slate-200" />
                    <button
                      onClick={onInsertCol}
                      className="px-2 h-full hover:bg-blue-50 text-slate-800 rounded text-xs font-bold transition flex items-center gap-1"
                      title="إدراج عمود جديد يسار الخلية"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>+ عمود</span>
                    </button>
                    <button
                      onClick={onDeleteCol}
                      className="px-2 h-full hover:bg-rose-50 text-rose-700 rounded text-xs font-bold transition flex items-center gap-1"
                      title="حذف العمود الحالي"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>حذف عمود</span>
                    </button>
                  </div>

                  {/* الجمع التلقائي AutoSum ∑ مع قائمة سريعة */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs">
                    <button
                      onClick={() => onInsertFormula('SUM')}
                      className="px-2.5 h-full hover:bg-emerald-50 rounded text-xs font-bold text-slate-800 flex items-center gap-1.5 transition"
                      title="جمع تلقائي فوري (AutoSum ∑)"
                    >
                      <Sigma className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>جمع تلقائي</span>
                    </button>
                    <button
                      onClick={(e) => handleOpenDropdown('formula', e)}
                      className="px-1.5 h-full hover:bg-slate-100 rounded text-slate-500"
                      title="المزيد من الدوال الشائعة (متوسط، عدد، أعلى، أدنى)"
                    >
                      <ChevronDown className="w-3 h-3 shrink-0" />
                    </button>
                  </div>

                  {/* تجميد الألواح Freeze Panes */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-0.5">
                    <button
                      onClick={() => onFreezePanes('row')}
                      className={`px-2 h-full rounded text-xs font-semibold transition flex items-center gap-1 ${
                        activeSheet.freezeRow ? 'bg-blue-100 text-blue-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="تجميد الصف العلوي ليبقى ثابتاً أثناء التمرير"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>تجميد الصف</span>
                    </button>
                    <button
                      onClick={() => onFreezePanes(activeSheet.freezeRow || activeSheet.freezeCol ? 'none' : 'row')}
                      className="px-1.5 h-full hover:bg-slate-100 rounded text-slate-500"
                      title="خيارات وإلغاء تجميد الألواح"
                    >
                      <ChevronDown className="w-3 h-3 shrink-0" />
                    </button>
                  </div>

                  {/* الفرز السريع والمسح */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-0.5">
                    <button
                      onClick={() => onSortColumn && onSortColumn('B', 'asc')}
                      className="px-2 h-full hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 flex items-center gap-1"
                      title="فرز تصاعدي (أ - ي)"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>فرز أ-ي</span>
                    </button>
                    <button
                      onClick={onClearCell}
                      className="px-2 h-full hover:bg-rose-50 rounded text-xs font-semibold text-rose-700 flex items-center gap-1"
                      title="مسح محتوى الخلية المحددة"
                    >
                      <span>مسح</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                2️⃣ INSERT TAB (إدراج) - جداول، رسوم توضيحية، مخططات ورموز
            ========================================================================= */}
            {activeTab === 'insert' && (
              <div className="flex items-center gap-2 flex-nowrap shrink-0">
                {/* 1. مجموعة الجداول والبيانات (Tables - أساسي) */}
                <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-1 shrink-0">
                  <button
                    onClick={() => onApplyTableStyle && onApplyTableStyle('emerald')}
                    className="px-2.5 h-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded font-bold text-xs flex items-center gap-1.5 transition"
                    title="إدراج وتنسيق جدول بنمط زمردي مع عناوين واضحة"
                  >
                    <TableIcon className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>إدراج جدول منسق</span>
                  </button>

                  <div className="w-px h-4 bg-slate-200" />

                  {/* جداول ومطالبات مالية وقضائية جاهزة */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFinancialTablesMenu(!showFinancialTablesMenu)}
                      className="px-2.5 h-full bg-slate-100 hover:bg-emerald-50 text-slate-800 rounded font-bold text-xs flex items-center gap-1.5 transition"
                      title="قوالب الجداول المالية والمطالبات القضائية الجاهزة"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>جداول ومطالبات مالية</span>
                      <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>

                    {showFinancialTablesMenu && (
                      <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-slate-300 rounded-xl shadow-xl z-50 p-1.5 text-xs">
                        <div className="font-bold text-slate-500 px-2.5 py-1 text-[11px] border-b mb-1">
                          اختر جدول مالي جاهز للإدراج:
                        </div>
                        <button
                          onClick={() => applyFinancialTemplate('estate')}
                          className="w-full text-right px-2.5 py-2 hover:bg-emerald-50 rounded-lg flex flex-col gap-0.5 transition"
                        >
                          <span className="font-bold text-emerald-900">🏛 كشف حصر التركات والأنصبة</span>
                          <span className="text-[10px] text-slate-500">حصر العقارات والأموال وتوزيع الحصص الشرعية</span>
                        </button>
                        <button
                          onClick={() => applyFinancialTemplate('legal')}
                          className="w-full text-right px-2.5 py-2 hover:bg-blue-50 rounded-lg flex flex-col gap-0.5 transition"
                        >
                          <span className="font-bold text-blue-900">⚖ بيان المصاريف والرسوم القضائية</span>
                          <span className="text-[10px] text-slate-500">توثيق بنود المطالبة وأتعاب الخبراء وأجور النشر</span>
                        </button>
                        <button
                          onClick={() => applyFinancialTemplate('payroll')}
                          className="w-full text-right px-2.5 py-2 hover:bg-amber-50 rounded-lg flex flex-col gap-0.5 transition"
                        >
                          <span className="font-bold text-amber-900">💼 مسير رواتب وبدلات الموظفين</span>
                          <span className="text-[10px] text-slate-500">كشف شهري يضم الراتب الأساسي والبدلات والصافي</span>
                        </button>
                        <button
                          onClick={() => applyFinancialTemplate('receipts')}
                          className="w-full text-right px-2.5 py-2 hover:bg-indigo-50 rounded-lg flex flex-col gap-0.5 transition"
                        >
                          <span className="font-bold text-indigo-900">📑 سندات المقبوضات والمدفوعات</span>
                          <span className="text-[10px] text-slate-500">حركة الوارد والمنصرف مع الرصيد التراكمي</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-px h-6 bg-slate-300 mx-0.5 shrink-0" />

                {/* 2. مجموعة الرسوم التوضيحية (Illustrations - أساسي) */}
                <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-1 shrink-0">
                  {/* إدراج صورة */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 h-full hover:bg-slate-100 rounded text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="إدراج صورة توضيحية أو مستند في الخلية الحالية"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>إدراج صورة</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* أشكال هندسية */}
                  <div className="relative">
                    <button
                      onClick={() => setShowShapesDropdown(!showShapesDropdown)}
                      className="px-2.5 h-full hover:bg-slate-100 rounded text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
                      title="إدراج أشكال هندسية ورموز بيانية"
                    >
                      <Shapes className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>أشكال هندسية</span>
                      <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>

                    {showShapesDropdown && (
                      <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-300 rounded-xl shadow-xl z-50 p-2 grid grid-cols-2 gap-1.5 text-xs">
                        {[
                          { label: 'مستطيل ▭', val: '▭ مستطيل', bg: '#f1f5f9' },
                          { label: 'دائرة ●', val: '● دائرة', bg: '#fee2e2' },
                          { label: 'سهم ➔', val: '➔ سهم', bg: '#dcfce7' },
                          { label: 'خط فاصل ──', val: '──────────', bg: '#ffffff' },
                          { label: 'نجمة ★', val: '★ مميز', bg: '#fef3c7' },
                          { label: 'علامة صح ✔', val: '✔ مؤكد', bg: '#e0f2fe' },
                        ].map((shape, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              onUpdateSelectedCell({ value: shape.val, bg: shape.bg, bold: true, align: 'center', borderStyle: 'box' });
                              setShowShapesDropdown(false);
                            }}
                            className="p-1.5 text-right hover:bg-slate-100 rounded border border-slate-200 text-slate-800 font-bold transition text-xs"
                          >
                            {shape.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-px h-4 bg-slate-200" />

                  {/* أختام وأيقونات توضيحية سريعة */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => onUpdateSelectedCell({ value: '✓ معتمد رسمياً', bold: true, bg: '#dcfce7', color: '#166534', borderStyle: 'box', align: 'center' })}
                      className="px-2 h-[26px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold shadow-2xs transition"
                      title="ختم اعتماد رسمي"
                    >
                      ✓ معتمد
                    </button>
                    <button
                      onClick={() => onUpdateSelectedCell({ value: '⚖ مصادق عليه قضائياً', bold: true, bg: '#dbeafe', color: '#1e40af', borderStyle: 'box', align: 'center' })}
                      className="px-2 h-[26px] bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded text-[11px] font-bold shadow-2xs transition"
                      title="ختم مصادقة قضائية"
                    >
                      ⚖ مصادقة
                    </button>
                    <button
                      onClick={() => onUpdateSelectedCell({ value: '★ مسدد بالكامل', bold: true, bg: '#fef3c7', color: '#92400e', borderStyle: 'box', align: 'center' })}
                      className="px-2 h-[26px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[11px] font-bold shadow-2xs transition"
                      title="ختم سداد كامل"
                    >
                      ★ مسدد
                    </button>
                  </div>
                </div>

                <div className="w-px h-6 bg-slate-300 mx-0.5 shrink-0" />

                {/* 3. مجموعة المخططات والرموز (Charts & Symbols - ثانوي) */}
                <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-1 shrink-0">
                  {/* المخططات البيانية */}
                  <button
                    onClick={() => {
                      setSelectedChartType('bar');
                      setShowChartModal(true);
                    }}
                    className="px-2.5 h-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-bold text-xs flex items-center gap-1.5 transition"
                    title="توليد ومعاينة مخططات بيانية (أعمدة، خطوط، دوائر)"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>مخططات بيانية</span>
                  </button>

                  <div className="w-px h-4 bg-slate-200" />

                  {/* الرموز والمعادلات الرياضية */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSymbolsDropdown(!showSymbolsDropdown)}
                      className="px-2.5 h-full hover:bg-slate-100 rounded text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
                      title="إدراج رموز رياضية وقانونية خاصة"
                    >
                      <Hash className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>رموز ومعادلات</span>
                      <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>

                    {showSymbolsDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-300 rounded-xl shadow-xl z-50 p-2.5 text-xs">
                        <div className="font-bold text-slate-600 mb-1.5 text-[11px]">رموز رياضية وحسابية:</div>
                        <div className="grid grid-cols-7 gap-1 mb-2.5">
                          {['∑', '√', '%', '÷', '×', '±', '≠', '≈', '∞', 'π', '≤', '≥', '°', '‰'].map((sym) => (
                            <button
                              key={sym}
                              onClick={() => {
                                onUpdateSelectedCell({ value: `${selectedCellData?.value || ''}${sym}` });
                                setShowSymbolsDropdown(false);
                              }}
                              className="h-7 bg-slate-50 hover:bg-emerald-100 font-bold border rounded flex items-center justify-center text-sm transition"
                            >
                              {sym}
                            </button>
                          ))}
                        </div>
                        <div className="font-bold text-slate-600 mb-1.5 text-[11px]">رموز رسمية وقانونية:</div>
                        <div className="grid grid-cols-6 gap-1">
                          {['§', '©', '®', '™', '¶', '№'].map((sym) => (
                            <button
                              key={sym}
                              onClick={() => {
                                onUpdateSelectedCell({ value: `${selectedCellData?.value || ''}${sym}` });
                                setShowSymbolsDropdown(false);
                              }}
                              className="h-7 bg-slate-50 hover:bg-blue-100 font-bold border rounded flex items-center justify-center text-sm transition"
                            >
                              {sym}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                3️⃣ PAGE LAYOUT TAB (تخطيط الصفحة)
            ========================================================================= */}
            {activeTab === 'layout' && (() => {
              const currentSideMargin = activeSheet.margins === 'custom' && activeSheet.customMargins
                ? activeSheet.customMargins.right
                : activeSheet.margins === 'narrow'
                ? 0.64
                : activeSheet.margins === 'wide'
                ? 2.5
                : 1.78;

              const handleUpdateSideMargin = (val: number) => {
                const clamped = Math.max(0.1, Math.min(2.5, Math.round(val * 10) / 10));
                const currentTop = activeSheet.customMargins?.top || (activeSheet.margins === 'narrow' ? 1.27 : activeSheet.margins === 'wide' ? 2.54 : 1.91);
                const currentBottom = activeSheet.customMargins?.bottom || currentTop;
                onUpdateSheet?.({
                  margins: 'custom',
                  customMargins: {
                    top: currentTop,
                    bottom: currentBottom,
                    left: clamped,
                    right: clamped,
                  },
                });
              };

              return (
                <div className="flex items-center gap-2 flex-nowrap shrink-0">
                  {/* 1. مجموعة إعداد الصفحة (Page Setup - أساسي) */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-1 shrink-0">
                    {/* الهوامش وقائمتها */}
                    <button
                      onClick={(e) => handleOpenDropdown('margins', e)}
                      className="flex items-center gap-1.5 px-2.5 h-full hover:bg-slate-100 rounded text-xs font-bold text-slate-800 transition"
                      title="تحديد هوامش الصفحة للطباعة"
                    >
                      <Layout className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>الهوامش: {activeSheet.margins === 'wide' ? 'عريض' : activeSheet.margins === 'narrow' ? 'ضيق' : `${currentSideMargin} سم`}</span>
                      <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    </button>

                    {/* مقبض زيادة وإنقاص الهامش بالسنتيمتر مباشرة */}
                    <div className="flex items-center gap-0.5 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                      <button
                        type="button"
                        onClick={() => handleUpdateSideMargin(currentSideMargin - 0.1)}
                        disabled={currentSideMargin <= 0.1}
                        className="w-4 h-5 flex items-center justify-center text-[11px] font-bold bg-white text-emerald-900 border border-emerald-300 rounded hover:bg-emerald-100 disabled:opacity-30"
                        title="إنقاص الهامش بمقدار 0.1 سم"
                      >
                        -
                      </button>
                      <span className="text-[10px] font-mono font-bold text-emerald-900 px-1 whitespace-nowrap">
                        {currentSideMargin} سم
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateSideMargin(currentSideMargin + 0.1)}
                        disabled={currentSideMargin >= 2.5}
                        className="w-4 h-5 flex items-center justify-center text-[11px] font-bold bg-white text-emerald-900 border border-emerald-300 rounded hover:bg-emerald-100 disabled:opacity-30"
                        title="زيادة الهامش بمقدار 0.1 سم"
                      >
                        +
                      </button>
                    </div>

                    <div className="w-px h-4 bg-slate-200" />

                    {/* الاتجاه عمودي / أفقي */}
                    <button
                      onClick={(e) => handleOpenDropdown('orientation', e)}
                      className="flex items-center gap-1.5 px-2.5 h-full hover:bg-slate-100 rounded text-xs font-bold text-slate-800 transition"
                      title="تغيير اتجاه الصفحة (عمودي / أفقي)"
                    >
                      <span>الاتجاه: {activeSheet.orientation === 'landscape' ? 'أفقي ↔' : 'عمودي ↕'}</span>
                      <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    </button>

                    <div className="w-px h-4 bg-slate-200" />

                    {/* مقاس الورقة A4 / Letter */}
                    <button
                      onClick={(e) => handleOpenDropdown('size', e)}
                      className="flex items-center gap-1.5 px-2.5 h-full hover:bg-slate-100 rounded text-xs font-bold text-slate-800 transition"
                      title="تحديد حجم الورق للطباعة (A4 / Letter)"
                    >
                      <span>المقاس: {activeSheet.paperSize || 'A4'}</span>
                      <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    </button>

                    <div className="w-px h-4 bg-slate-200" />

                    {/* فواصل الصفحات */}
                    <button
                      onClick={() => onUpdateSheet?.({ pageBreaks: !activeSheet.pageBreaks })}
                      className={`flex items-center gap-1 px-2 h-full rounded text-xs font-semibold transition ${
                        activeSheet.pageBreaks ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                      title="إظهار أو إخفاء فواصل الصفحات"
                    >
                      <Split className="w-3.5 h-3.5 shrink-0" />
                      <span>فواصل الصفحات</span>
                    </button>

                    {/* إعداد الصفحة الشامل */}
                    {onOpenPageSetup && (
                      <button
                        onClick={onOpenPageSetup}
                        className="flex items-center gap-1 px-2.5 h-full bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs transition border border-slate-300"
                        title="فتح نافذة إعداد الصفحة المتقدمة"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                        <span>إعداد الصفحة ⚙</span>
                      </button>
                    )}
                  </div>

                  <div className="w-px h-6 bg-slate-300 mx-0.5 shrink-0" />

                  {/* 2. مجموعة خيارات ورقة العمل (Sheet Options - ثانوي) */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-2 px-2.5 shrink-0">
                    {/* اتجاه الورقة بالكامل RTL / LTR */}
                    <button
                      onClick={() => onUpdateSheet?.({ direction: activeSheet.direction === 'ltr' ? 'rtl' : 'ltr' })}
                      className={`px-2.5 py-0.5 rounded text-xs font-bold transition flex items-center gap-1 ${
                        activeSheet.direction === 'ltr'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                      title="تبديل اتجاه الورقة بالكامل بين اليمين واليسار (RTL / LTR)"
                    >
                      <span>{activeSheet.direction === 'ltr' ? 'ورقة LTR ➔' : 'ورقة RTL ➔'}</span>
                    </button>

                    <div className="w-px h-4 bg-slate-200" />

                    {/* خطوط الشبكة عرض / طباعة */}
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                      <span className="font-bold text-slate-900">الشبكة:</span>
                      <label className="flex items-center gap-1 cursor-pointer hover:text-emerald-800">
                        <input
                          type="checkbox"
                          checked={activeSheet.showGridlines !== false}
                          onChange={(e) => onUpdateSheet?.({ showGridlines: e.target.checked })}
                          className="w-3.5 h-3.5 accent-emerald-600 rounded"
                        />
                        <span>عرض</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer hover:text-emerald-800">
                        <input
                          type="checkbox"
                          checked={activeSheet.printGridlines !== false}
                          onChange={(e) => onUpdateSheet?.({ printGridlines: e.target.checked })}
                          className="w-3.5 h-3.5 accent-emerald-600 rounded"
                        />
                        <span>طباعة</span>
                      </label>
                    </div>

                    <div className="w-px h-4 bg-slate-200" />

                    {/* عناوين الصفوف والأعمدة عرض / طباعة */}
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                      <span className="font-bold text-slate-900">العناوين:</span>
                      <label className="flex items-center gap-1 cursor-pointer hover:text-emerald-800">
                        <input
                          type="checkbox"
                          checked={activeSheet.showHeadings !== false}
                          onChange={(e) => onUpdateSheet?.({ showHeadings: e.target.checked })}
                          className="w-3.5 h-3.5 accent-emerald-600 rounded"
                        />
                        <span>عرض</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer hover:text-emerald-800">
                        <input
                          type="checkbox"
                          checked={activeSheet.printHeadings !== false}
                          onChange={(e) => onUpdateSheet?.({ printHeadings: e.target.checked })}
                          className="w-3.5 h-3.5 accent-emerald-600 rounded"
                        />
                        <span>طباعة</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* =========================================================================
                FORMULAS TAB (الصيغ)
            ========================================================================= */}
            {activeTab === 'formulas' && (
              <div className="flex items-center gap-2 flex-nowrap shrink-0">
                <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-1">
                  {formulasList.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => onInsertFormula(f.name)}
                      className="px-2.5 h-full hover:bg-emerald-50 rounded text-xs font-bold text-slate-800 flex items-center gap-1 transition"
                      title={f.syntax}
                    >
                      <Sigma className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================================
                DATA TAB (البيانات)
            ========================================================================= */}
            {activeTab === 'data' && (
              <div className="flex items-center gap-2 flex-nowrap shrink-0">
                <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-1">
                  <span className="text-xs font-bold text-slate-600 px-1">فرز البيانات:</span>
                  <button
                    onClick={() => onSortColumn && onSortColumn('B', 'asc')}
                    className="flex items-center gap-1 px-2.5 h-full hover:bg-slate-100 rounded text-slate-800 font-bold text-xs"
                    title="فرز تصاعدي من أ إلى ي"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>تصاعدي (أ - ي)</span>
                  </button>
                  <button
                    onClick={() => onSortColumn && onSortColumn('B', 'desc')}
                    className="flex items-center gap-1 px-2.5 h-full hover:bg-slate-100 rounded text-slate-800 font-bold text-xs"
                    title="فرز تنازلي من ي إلى أ"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 rotate-180 shrink-0" />
                    <span>تنازلي (ي - أ)</span>
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================================
                REVIEW TAB (مراجعة)
            ========================================================================= */}
            {activeTab === 'review' && (
              <div className="flex items-center gap-2 flex-nowrap shrink-0">
                <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-1">
                  <button
                    onClick={() => {
                      const note = prompt('أدخل نص الملاحظة أو التعليق للخلية:', 'ملاحظة تدقيق');
                      if (note) onUpdateSelectedCell({ value: `[ملاحظة: ${note}]`, italic: true, color: '#475569' });
                    }}
                    className="px-2.5 h-full hover:bg-slate-100 rounded text-slate-800 font-bold text-xs flex items-center gap-1"
                  >
                    <span>+ إضافة تعليق</span>
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================================
                VIEW TAB (عرض)
            ========================================================================= */}
            {activeTab === 'view' && (
              <div className="flex items-center gap-2 flex-nowrap shrink-0">
                <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[32px] p-0.5 shadow-2xs gap-1">
                  <button
                    onClick={onOpenPrintPreview}
                    className="px-3 h-full bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5 shrink-0" />
                    <span>معاينة صفحة الطباعة</span>
                  </button>

                  <button
                    onClick={() => onFreezePanes('row')}
                    className="px-2.5 h-full hover:bg-slate-100 text-slate-800 rounded font-bold text-xs flex items-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>تجميد الصفوف</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── 3. شريط الصيغ المتقدم (Excel Formula Bar) ─── */}
      <div className="flex items-center px-3 py-1 bg-slate-100 border-t border-slate-200 gap-2 text-xs">
        {/* مرجع الخلية النشطة أو النطاق المحدد (Name Box) */}
        <div className="flex items-center gap-1 shrink-0">
          {nameBoxEditing ? (
            <input
              type="text"
              autoFocus
              value={nameBoxValue}
              onChange={(e) => setNameBoxValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameBoxSubmit();
                else if (e.key === 'Escape') setNameBoxEditing(false);
              }}
              onBlur={handleNameBoxSubmit}
              className="bg-emerald-800 text-white font-mono font-bold px-2 py-0.5 rounded text-xs text-center border-2 border-emerald-400 focus:outline-none w-28 shadow-inner"
              placeholder="A1 أو A1:D10"
              dir="ltr"
            />
          ) : (
            <button
              onClick={() => {
                setNameBoxValue(selectedRange ? `${selectedRange.start}:${selectedRange.end}` : selectedCell);
                setNameBoxEditing(true);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-mono font-bold px-2.5 py-0.5 rounded shadow-2xs text-center text-xs flex items-center gap-1.5 transition select-none cursor-pointer"
              title="مربع الاسم: انقر لكتابة عنوان خلية أو نطاق والانتقال إليه مباشرة (مثال: A1:C10)"
            >
              <span>{selectedRange ? `${selectedRange.start}:${selectedRange.end}` : selectedCell}</span>
              {selectedRange && (
                <span className="text-[10px] bg-emerald-800/90 px-1 py-0.2 rounded text-emerald-200 font-sans font-medium">
                  {parseRange(`${selectedRange.start}:${selectedRange.end}`).length} خلية
                </span>
              )}
            </button>
          )}
        </div>

        {/* زر الدالة fx */}
        <button
          onClick={() => onInsertFormula('SUM')}
          className="p-1 hover:bg-slate-200 rounded text-emerald-800 font-bold font-serif italic text-xs transition"
          title="إدراج دالة رياضية (fx)"
        >
          ƒx
        </button>

        {/* حقل إدخال الصيغة والقيم */}
        <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-lg px-2.5 py-1 shadow-inner">
          <input
            id="formula-bar-input"
            type="text"
            value={formulaInput}
            onChange={(e) => onFormulaInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onFormulaInputSubmit();
              }
            }}
            placeholder="أدخل قيمة أو صيغة رياضية (مثال: =SUM(D2:D6) أو =C2+D2 أو نص)..."
            className="w-full bg-transparent focus:outline-none text-xs font-medium text-slate-800"
            dir="auto"
          />
        </div>
      </div>

      {/* ─── 4. القوائم المنسدلة العائمة (Floating Dropdown Portals) ─── */}
      <ExcelFloatingDropdown
        activeDropdown={activeExcelDropdown}
        onClose={handleCloseAllDropdowns}
        selectedCellData={selectedCellData}
        onUpdateSelectedCell={onUpdateSelectedCell}
        bgColors={bgColors}
        textColors={textColors}
        cellBorderOptions={cellBorderOptions}
        numberFormats={numberFormats}
        formulasList={formulasList}
        onInsertFormula={onInsertFormula}
        activeSheet={activeSheet}
        onUpdateSheet={onUpdateSheet}
        onFreezePanes={onFreezePanes}
        selectedRange={selectedRange}
        selectedCell={selectedCell}
      />

      {/* ─── 5. نافذة المعاينة التفاعلية للمخططات البيانية (Chart Preview Modal) ─── */}
      {showChartModal && (() => {
        const dataItems = chartDataSummary();
        const maxVal = Math.max(...dataItems.map(d => d.value), 1);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 select-none" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
              <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-200" />
                  <h3 className="text-sm font-bold">معاينة وتوليد المخططات البيانية</h3>
                </div>
                <button
                  onClick={() => setShowChartModal(false)}
                  className="text-white/80 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* مفاتيح التبديل بين أنواع المخططات */}
                <div className="flex items-center justify-center gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setSelectedChartType('bar')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                      selectedChartType === 'bar' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>أعمدة (Bar)</span>
                  </button>
                  <button
                    onClick={() => setSelectedChartType('line')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                      selectedChartType === 'line' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LineChart className="w-4 h-4 text-blue-600" />
                    <span>خطي (Line)</span>
                  </button>
                  <button
                    onClick={() => setSelectedChartType('pie')}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                      selectedChartType === 'pie' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PieChart className="w-4 h-4 text-amber-600" />
                    <span>دائري (Pie)</span>
                  </button>
                </div>

                {/* رسم توضيحي بياني متفاعل */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[190px] flex items-end justify-around gap-2">
                  {selectedChartType === 'bar' && (
                    <div className="w-full flex items-end justify-around h-36 gap-2">
                      {dataItems.map((item, idx) => {
                        const hPct = Math.round((item.value / maxVal) * 100);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                            <span className="text-[10px] font-mono font-bold text-slate-700">{item.value.toLocaleString()}</span>
                            <div
                              className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-500 transition-all duration-300 shadow-xs"
                              style={{ height: `${Math.max(15, hPct)}%` }}
                            />
                            <span className="text-[10px] font-bold text-slate-600 truncate max-w-[70px] text-center">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedChartType === 'line' && (
                    <div className="w-full h-36 flex flex-col justify-between py-2">
                      <div className="flex items-center justify-between border-b pb-1 text-[10px] text-slate-500 font-mono">
                        <span>الحد الأعلى: {maxVal.toLocaleString()}</span>
                        <span>المتوسط: {Math.round(maxVal / 2).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 h-20 px-2">
                        {dataItems.map((item, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-1">
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                            <span className="text-[10px] font-bold text-slate-700">{item.label}</span>
                            <span className="text-[9px] font-mono text-blue-700 font-bold">{item.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedChartType === 'pie' && (
                    <div className="w-full flex items-center justify-around py-2">
                      <div className="w-28 h-28 rounded-full border-8 border-emerald-500 bg-amber-100 flex items-center justify-center font-bold text-xs text-emerald-900 shadow-md">
                        مخطط نسبي
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {dataItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                            <span className="font-medium text-slate-700">{item.label}:</span>
                            <span className="font-mono font-bold text-slate-900">{item.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <button
                    onClick={() => {
                      onUpdateSelectedCell({
                        value: `[مخطط بياني: ${selectedChartType === 'bar' ? 'أعمدة' : selectedChartType === 'line' ? 'خطي' : 'دائري'}]`,
                        bold: true,
                        bg: '#ecfdf5',
                        color: '#065f46',
                        borderStyle: 'box',
                        align: 'center',
                      });
                      setShowChartModal(false);
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs text-center"
                  >
                    إدراج بطاقة المخطط في الخلية ({selectedCell})
                  </button>
                  <button
                    onClick={() => setShowChartModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── 6. نافذة تحديد ارتفاع الصفوف ─── */}
      {showRowHeightModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 select-none" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-200" />
                <h3 className="text-sm font-bold">تحديد حجم ارتفاع الصفوف</h3>
              </div>
              <button
                onClick={() => setShowRowHeightModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ارتفاع الصف بالبكسل (Pixel):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={16}
                    max={240}
                    value={customRowHeightInput}
                    onChange={(e) => setCustomRowHeightInput(parseInt(e.target.value, 10) || 28)}
                    className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-lg text-center font-bold text-slate-800 focus:outline-emerald-600 text-sm"
                  />
                  <span className="text-slate-500 font-medium">بكسل (الافتراضي 28px)</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-600 mb-1.5">مقاسات سريعة جاهزة:</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'مضغوط (22px)', val: 22 },
                    { label: 'قياسي (28px)', val: 28 },
                    { label: 'متوسط (36px)', val: 36 },
                    { label: 'عريض (48px)', val: 48 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => setCustomRowHeightInput(preset.val)}
                      className={`py-1.5 px-2 rounded-lg font-bold border transition text-center ${
                        customRowHeightInput === preset.val
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                          : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t flex flex-col gap-2">
                <div className="text-[11px] font-bold text-slate-600">اختر نطاق التطبيق:</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (onUpdateRowHeight) {
                        onUpdateRowHeight(selectedRowNum, customRowHeightInput);
                      }
                      setShowRowHeightModal(false);
                    }}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs text-center"
                  >
                    تطبيق على الصف ({selectedRowNum}) فقط
                  </button>
                  <button
                    onClick={() => {
                      if (onUpdateRowHeight) {
                        for (let r = 1; r <= activeSheet.rowCount; r++) {
                          onUpdateRowHeight(r, customRowHeightInput);
                        }
                      }
                      setShowRowHeightModal(false);
                    }}
                    className="flex-1 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold transition shadow-xs text-center"
                  >
                    تطبيق على كافة الصفوف (1-{activeSheet.rowCount})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
