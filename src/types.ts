export type AppMode = 'word' | 'excel';

export type WordRibbonTab = 
  | 'file' 
  | 'home' 
  | 'insert' 
  | 'design'
  | 'layout'
  | 'layout_design' 
  | 'table' 
  | 'options' 
  | 'view';

export type ExcelRibbonTab = 
  | 'file' 
  | 'home' 
  | 'insert' 
  | 'layout' 
  | 'formulas' 
  | 'data' 
  | 'review' 
  | 'view';

export type PageOrientation = 'portrait' | 'landscape';
export type PaperSize = 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'B0' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'Letter' | 'Legal' | 'Executive' | 'Custom';

export interface WordDocumentState {
  title: string;
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  textColor: string;
  highlightColor: string;
  paragraphBgColor?: string;
  textAlign: 'right' | 'center' | 'left' | 'justify';
  lineSpacing: number;
  direction: 'rtl' | 'ltr';
  margins: 'normal' | 'narrow' | 'moderate' | 'wide' | 'custom' | 'minimum' | 'ultra-narrow';
  customMargins?: { top: number; bottom: number; left: number; right: number };
  orientation: 'portrait' | 'landscape';
  paperSize: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'B0' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'Letter' | 'Legal' | 'Executive' | 'Custom';
  columns: 1 | 2 | 3;
  zoom: number;
  showRuler: boolean;
  showBorders: boolean;
  borderStyle?: 'none' | 'single' | 'double' | 'classic' | 'gold' | 'islamic' | 'royal' | 'court' | 'certificate' | 'triple' | 'dashed' | 'shadow';
  borderColor?: string;
  borderWidth?: number;
  pageBgColor?: string;
  watermarkText?: string;
  watermarkColor?: string;
  watermarkOpacity?: number;
  watermarkAngle?: number;
  pageShadow?: 'realistic' | 'soft' | 'flat' | 'elevated';
  showMarginGuides?: boolean;
  isReadingMode: boolean;
  viewLayoutMode?: 'continuous' | 'paginated';
  currentPage?: number;
  totalPages?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  headerText: string;
  footerText: string;
  pageNumbering?: {
    enabled: boolean;
    position?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
    format?: 'page_x_of_y' | 'x_of_y' | 'x_slash_y' | 'dash_x_dash' | 'arabic_indic';
  };
  paragraphSpacingBefore?: number;
  paragraphSpacingAfter?: number;
  firstLineIndent?: number;
  wordSpacing?: number;
  themeName?: string;
  contentHtml: string;
}

export interface CellComment {
  text: string;
  author?: string;
  date?: string;
}

export interface CellData {
  value?: string;
  formula?: string;
  formattedValue?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  fontFamily?: string;
  color?: string;
  bg?: string;
  align?: 'right' | 'center' | 'left' | string;
  valign?: 'top' | 'middle' | 'bottom' | string;
  format?: 'general' | 'currency_sar' | 'currency_usd' | 'currency_yer' | 'percent' | 'number' | 'date' | 'text' | string;
  border?: boolean;
  borderStyle?: 'all' | 'box' | 'bottom' | 'double_bottom' | 'none' | string;
  borderColor?: string;
  wrapText?: boolean;
  fontSize?: number;
  indent?: number;
  direction?: 'rtl' | 'ltr' | string;
  comment?: CellComment;
  dropdownOptions?: string[];
}

export interface SheetChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface SheetChart {
  id: string;
  type: 'bar' | 'column' | 'line' | 'pie' | 'area';
  title: string;
  range: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: SheetChartDataPoint[];
  color?: string;
}

export type ConditionalFormatRuleType = 
  | 'color_scale_green_yellow_red' // الأخضر للأعلى والأحمر للأدنى
  | 'color_scale_red_yellow_green' // الأحمر للأعلى والأخضر للأدنى
  | 'color_scale_blue_white'       // تدرج أزرق للأبيض
  | 'color_scale_emerald_light'    // تدرج زمردي للأعلى
  | 'greater_than'                // أكبر من
  | 'less_than'                   // أقل من
  | 'equal_to'                    // يساوي
  | 'highlight_positive'          // تمييز القيم الموجبة (أخضر)
  | 'highlight_negative';         // تمييز القيم السالبة (أحمر)

export interface ConditionalFormatRule {
  id: string;
  type: ConditionalFormatRuleType;
  column?: string;                // e.g. 'D' or empty for all
  range?: string;                 // e.g. 'A1:H30' or 'sheet'
  threshold?: number;
  highlightBg?: string;
  highlightColor?: string;
}

export interface SheetImage {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SheetMerge {
  start: string;
  end: string;
}

export interface ExcelSheet {
  id: string;
  name: string;
  data: Record<string, CellData>;
  rowCount: number;
  colCount: number;
  freezeRow?: number;
  freezeCol?: number;
  colWidths?: Record<string, number>;
  rowHeights?: Record<number, number>;
  conditionalRules?: ConditionalFormatRule[];
  images?: SheetImage[];
  charts?: SheetChart[];
  merges?: SheetMerge[];
}

export interface ExcelState {
  title: string;
  sheets: ExcelSheet[];
  activeSheetId: string;
  selectedCell?: string; // e.g. "A1"
  selectedRange?: { start: string; end: string };
  isEditing?: boolean;
  formulaInput?: string;
  zoom?: number;
}

export interface VirtualKeyboardState {
  isOpen: boolean;
  isFloating: boolean;
  language: 'ar' | 'en';
  shiftActive: boolean;
  altActive: boolean;
  ctrlActive: boolean;
  capsActive: boolean;
  pinned: boolean;
  preferredInputMode?: 'virtual' | 'native';
  autoSwitch?: boolean;
  size?: 'small' | 'normal' | 'large';
  dockPosition?: 'bottom' | 'floating';
  numberFormat?: 'arabic' | 'western';
  wordTarget?: 'body' | 'header' | 'footer';
  keyboardMode?: 'standard' | 'oneHanded' | 'floating' | 'split';
  oneHandedSide?: 'right' | 'left';
  predictiveTextEnabled?: boolean;
  highContrast?: boolean;
  autoSpacing?: boolean;
}

export interface DocumentRevision {
  id: string;
  timestamp: number;
  dateStr: string;
  title: string;
  summary: string;
  preview?: string;
  wordCount: number;
  appMode: AppMode;
  docState?: WordDocumentState;
  excelState?: ExcelState;
}

export interface ProofreadCorrection {
  original: string;
  suggestion: string;
  type: 'spelling' | 'grammar' | 'punctuation' | 'style';
  explanation: string;
}

export interface ProofreadResult {
  originalText: string;
  correctedText: string;
  corrections: ProofreadCorrection[];
  source: 'gemini' | 'rules';
}

export interface PdfExportOptions {
  orientation?: 'portrait' | 'landscape';
  margins?: 'normal' | 'narrow' | 'wide' | 'moderate' | 'custom';
  paperSize?: 'a0' | 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6' | 'b0' | 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'letter' | 'legal' | 'executive';
  includeHeaderFooter?: boolean;
  pdfStandard?: 'standard' | 'interactive' | 'pdf_a' | 'pdf_x' | 'pdf_e';
  // خيارات متقدمة خاصة بجداول بيانات إكسل عند التصدير والطباعة
  excelFitMode?: 'fit-columns' | 'fit-sheet' | 'normal'; // تناسب الأعمدة مع الصفحة / ملاءمة الورقة بالكامل / الحجم الفعلي
  showGridlines?: boolean; // إظهار خطوط شبكة الجدول
  repeatHeaderRow?: boolean; // تكرار صف العناوين في كل صفحة
  printArea?: 'all' | 'selection' | 'active_sheet';
  multiPageLayout?: 'normal' | 'booklet' | 'brochure' | 'two-up'; // تخطيط الطباعة المتعدد (كتيب، مطوية، صفحتان)
}
