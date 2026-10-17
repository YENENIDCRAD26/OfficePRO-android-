import React, { useState, useRef, useEffect } from 'react';
import { 
  WordDocumentState, 
  WordRibbonTab 
} from '../../types';
import { 
  COURT_APPEAL_MEMO_HTML, 
  SNIPPETS_LEGAL,
  generateCustomLegalSectionHtml
} from '../../data/initialData';
import { 
  exportWordAsDocx, 
  exportWordAsDoc, 
  exportWordAsTxt, 
  exportWordAsHtml, 
  exportWordAsRtf,
  exportWordAsDotx,
  exportWordAsDot,
  exportWordAsDocm,
  exportWordAsPdf
} from '../../utils/fileHandlers';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Subscript, 
  Superscript, 
  AlignRight, 
  AlignCenter, 
  AlignLeft, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Plus, 
  Minus, 
  FolderOpen, 
  Save, 
  Download, 
  Printer, 
  Table as TableIcon, 
  Image as ImageIcon, 
  Shapes, 
  Minus as DividerIcon, 
  Link2, 
  Columns, 
  Palette, 
  Check, 
  FilePlus, 
  BookOpen, 
  Sliders, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  Sparkles, 
  Layout, 
  Square,
  Stamp, 
  Tag, 
  Undo2,
  Redo2,
  Search,
  Sigma,
  Indent,
  Outdent,
  Type,
  FileCheck,
  ChevronUp,
  SlidersHorizontal,
  BookmarkPlus,
  Trash2,
  Eye,
  EyeOff,
  History,
  PaintBucket,
  Paintbrush,
  Scissors,
  FileText,
  Layers,
  Mic,
  Settings2,
  RotateCw,
  Hash,
  Share2,
  FileDown,
  FolderArchive,
  Smartphone,
  HardDrive,
  Copy,
  QrCode,
  Mail,
  Info,
  FileCode,
  Award,
  Scale,
  X,
  Eraser,
  Highlighter,
  ShieldCheck
} from 'lucide-react';
import { TextColorPickerDropdown } from './TextColorPicker';
import { WordHomeTab } from './WordHomeTab';

interface WordRibbonProps {
  activeTab: WordRibbonTab;
  onSelectTab: (tab: WordRibbonTab) => void;
  docState: WordDocumentState;
  activeHomeMenu?: { id: any; rect: DOMRect } | null;
  setActiveHomeMenu?: (menu: { id: any; rect: DOMRect } | null) => void;
  onUpdateDoc: (partial: Partial<WordDocumentState>) => void;
  onExecCommand: (cmd: string, val?: string) => void;
  onInsertTable: (rows: number, cols: number) => void;
  onInsertImage: () => void;
  onInsertShape: (shape: string) => void;
  onInsertSymbol?: (symbol: string) => void;
  onInsertLine: () => void;
  onInsertLink: () => void;
  onNewDocument: () => void;
  onOpenDocument: () => void;
  onSaveDocument: () => void;
  onSaveAsDocument?: () => void;
  onExportDoc: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  onAddNewPage?: (position?: 'end' | 'cursor') => void;
  onInsertPageBreak?: () => void;
  onTableAction?: (action: string, value?: string) => void;
  onImageAction?: (action: string, value?: string) => void;
  onOpenProofreader?: () => void;
  onOpenRevisionHistory?: () => void;
  onOpenSimulator?: () => void;
  onTriggerHeaderEdit?: () => void;
  onTriggerFooterEdit?: () => void;
  onOpenTemplates?: () => void;
  onShareDocument?: () => void;
  onOpenPermissionsModal?: () => void;
  onOpenVoiceTyping?: () => void;
}

export interface WordFontFamilyItem {
  name: string;
  shortName: string;
  value: string;
  primary: string;
  category: 'خط النسخ' | 'خط الرقعة' | 'الخط الكوفي' | 'خط الثلث' | 'الخط الفارسي' | 'الخط الديواني' | 'الخط المغربي والإجازة' | 'الخطوط العصرية' | 'الخطوط القياسية';
  scriptType: string;
  badge: string;
  preview: string;
  desc?: string;
}

export const WORD_FONT_FAMILIES: WordFontFamilyItem[] = [
  // 1. خط النسخ (Naskh)
  { 
    name: 'أميري (Amiri - خط النسخ الأصيل)', 
    shortName: 'خط النسخ (أميري)',
    value: "'Amiri', serif", 
    primary: 'Amiri',
    category: 'خط النسخ',
    scriptType: 'نسخ',
    badge: 'أميري أصيل',
    preview: 'الفوائد النحوية واللغوية الممتعة - خط النسخ الأصيل',
    desc: 'أشهر الخطوط للكتب والمصاحف والمطبوعات الرسمية ووضوح القراءة'
  },
  { 
    name: 'نوتو نسخ (Noto Naskh - طباعي معتمد)', 
    shortName: 'خط النسخ (نوتو)',
    value: "'Noto Naskh Arabic', serif", 
    primary: 'Noto Naskh Arabic',
    category: 'خط النسخ',
    scriptType: 'نسخ',
    badge: 'طباعي حديث',
    preview: 'أحمد عبد الوهاب - خط النسخ الطباعي الواضح',
    desc: 'خط النسخ المعياري للنشر المكتبي والصحفي بدقة عالية'
  },

  // 2. خط الرقعة (Ruq'ah)
  { 
    name: 'خط الرقعة (Aref Ruqaa - خط اليد الأصيل)', 
    shortName: 'خط الرقعة',
    value: "'Aref Ruqaa', serif", 
    primary: 'Aref Ruqaa',
    category: 'خط الرقعة',
    scriptType: 'رقعة',
    badge: 'رقعة أصيل',
    preview: 'الفوائد النحوية واللغوية الممتعة - خط الرقعة الأصيل',
    desc: 'خط اليد اليومي السريع والموجز، يمتاز بجمال حركة الحروف والتشابك'
  },
  { 
    name: 'رقعة الحبر (Aref Ruqaa Ink - خط القصبة)', 
    shortName: 'رقعة الحبر',
    value: "'Aref Ruqaa Ink', 'Aref Ruqaa', serif", 
    primary: 'Aref Ruqaa Ink',
    category: 'خط الرقعة',
    scriptType: 'رقعة',
    badge: 'قصبة وحبر',
    preview: 'أحمد عبد الوهاب - خط الرقعة بريشة الخطاط',
    desc: 'محاكاة دقيقة لكتابة خط الرقعة بقصبة الخط العربي وحبر المخطوطات'
  },

  // 3. الخط الكوفي (Kufic)
  { 
    name: 'خط الكوفي (Noto Kufi - للعناوين واللافتات)', 
    shortName: 'خط الكوفي',
    value: "'Noto Kufi Arabic', sans-serif", 
    primary: 'Noto Kufi Arabic',
    category: 'الخط الكوفي',
    scriptType: 'كوفي',
    badge: 'كوفي بارز',
    preview: 'الفوائد النحوية واللغوية الممتعة - الخط الكوفي',
    desc: 'أقدم الخطوط العربية، ذو طابع هندسي راسخ وفخامة تليق بالعناوين'
  },
  { 
    name: 'الكوفي الفاطمي (Reem Kufi - أصالة وتراث)', 
    shortName: 'الكوفي الفاطمي',
    value: "'Reem Kufi', 'Noto Kufi Arabic', sans-serif", 
    primary: 'Reem Kufi',
    category: 'الخط الكوفي',
    scriptType: 'كوفي',
    badge: 'كوفي فاطمي',
    preview: 'أحمد عبد الوهاب - الخط الكوفي الفاطمي التراثي',
    desc: 'طراز كوفي مميز بزخارف الحروف الأنيقة المستوحاة من العصر الفاطمي'
  },
  { 
    name: 'الكوفي المربع والهندسي (Reem Kufi Ink)', 
    shortName: 'الكوفي المربع',
    value: "'Reem Kufi Ink', 'Reem Kufi', sans-serif", 
    primary: 'Reem Kufi Ink',
    category: 'الخط الكوفي',
    scriptType: 'كوفي',
    badge: 'كوفي هندسي',
    preview: 'الخط الكوفي المربع - هندسة الحروف والزخرفة',
    desc: 'خط هندسي بديع يعتمد على التربيع والاتزان المعماري'
  },

  // 4. خط الثلث والمصاحف (Thuluth)
  { 
    name: 'خط الثلث والمصاحف (Amiri Quran - أم الخطوط)', 
    shortName: 'خط الثلث',
    value: "'Amiri Quran', 'Amiri', serif", 
    primary: 'Amiri Quran',
    category: 'خط الثلث',
    scriptType: 'ثلث',
    badge: 'أم الخطوط',
    preview: 'الفوائد النحوية واللغوية الممتعة - خط الثلث الشريف',
    desc: 'أصعب الخطوط وأجملها وأعلاها رتبة، يُستخدم في ترويسات المصاحف والمحاريب'
  },
  { 
    name: 'شهرزاد المحقق (Scheherazade New - ثلث ومصاحف)', 
    shortName: 'شهرزاد المحقق',
    value: "'Scheherazade New', serif", 
    primary: 'Scheherazade New',
    category: 'خط الثلث',
    scriptType: 'ثلث',
    badge: 'محقق قرآني',
    preview: 'أحمد عبد الوهاب - خط الثلث والنسخ المحقق',
    desc: 'خط قرآني جليل مخصص للنصوص الكلاسيكية والمخطوطات التراثية'
  },

  // 5. الخط الفارسي / النستعليق (Farsi / Nastaliq)
  { 
    name: 'الخط الفارسي النستعليق (Noto Nastaliq Urdu)', 
    shortName: 'الخط الفارسي',
    value: "'Noto Nastaliq Urdu', serif", 
    primary: 'Noto Nastaliq Urdu',
    category: 'الخط الفارسي',
    scriptType: 'فارسي',
    badge: 'نستعليق شاعري',
    preview: 'الفوائد النحوية واللغوية الممتعة - الخط الفارسي والتعليق',
    desc: 'خط انسيابي رقيق يجمع بين النسخ والتعليق، مشهور في الدواوين الشعرية'
  },
  { 
    name: 'كلزار الفارسي (Gulzar - فارسي زخرفي)', 
    shortName: 'كلزار الفارسي',
    value: "'Gulzar', serif", 
    primary: 'Gulzar',
    category: 'الخط الفارسي',
    scriptType: 'فارسي',
    badge: 'فارسي مطور',
    preview: 'أحمد عبد الوهاب - جمال الخط الفارسي والنستعليق',
    desc: 'خط نستعليق متطور بجماليات شرقية للمتون الرفيعة والأدبيات'
  },

  // 6. الخط الديواني والديواني الجلي (Diwani)
  { 
    name: 'الخط الديواني (Lateef - للمراسلات الملكية)', 
    shortName: 'الخط الديواني',
    value: "'Lateef', cursive", 
    primary: 'Lateef',
    category: 'الخط الديواني',
    scriptType: 'ديواني',
    badge: 'ديواني رسمي',
    preview: 'الفوائد النحوية واللغوية الممتعة - الخط الديواني',
    desc: 'خط المراسلات والأوامر السلطانية والبراءات الملكية بأقواس رشيقة'
  },
  { 
    name: 'الديواني الجلي والرقاص (Rakkas - زخرفي مميز)', 
    shortName: 'الديواني الجلي',
    value: "'Rakkas', cursive", 
    primary: 'Rakkas',
    category: 'الخط الديواني',
    scriptType: 'ديواني',
    badge: 'ديواني جلي',
    preview: 'الخط الديواني الجلي - الفخامة والأناقة والزخرفة',
    desc: 'نسخة مكثفة ومزخرفة من الديواني تملأ الفراغات بالنقاط والحركات التزيينية'
  },
  { 
    name: 'مرحي الزخرفي (Marhey - خط فني)', 
    shortName: 'مرحي الزخرفي',
    value: "'Marhey', cursive", 
    primary: 'Marhey',
    category: 'الخط الديواني',
    scriptType: 'زخرفي',
    badge: 'فني حيوي',
    preview: 'أحمد عبد الوهاب - خط فني زخرفي عصري',
    desc: 'خط عربي حديث مفعم بالحيوية والانحناءات الفنية المعبرة'
  },

  // 7. الخط المغربي وخط الإجازة (Maghrebi & Ejaza)
  { 
    name: 'الخط المغربي والأندلسي (Maghrebi / Andalusi)', 
    shortName: 'الخط المغربي',
    value: "'Scheherazade New', 'Amiri', serif", 
    primary: 'Scheherazade New',
    category: 'الخط المغربي والإجازة',
    scriptType: 'مغربي',
    badge: 'مغربي أندلسي',
    preview: 'أحمد عبد الوهاب - الخط المغربي والأندلسي العريق',
    desc: 'طراز عربي أصيل تطور في بلاد المغرب والأندلس باستدارات ونقاط خاصة'
  },
  { 
    name: 'خط الإجازة والتوقيع (Ejaza Signature)', 
    shortName: 'خط الإجازة',
    value: "'Amiri', 'Aref Ruqaa', serif", 
    primary: 'Amiri',
    category: 'الخط المغربي والإجازة',
    scriptType: 'إجازة',
    badge: 'إجازة وتوقيع',
    preview: 'خط الإجازة - تزاوج جمال الثلث وسرعة النسخ للتواقيع',
    desc: 'الخط المعتمد في منح إجازات الخط العربي وتواقيع كبار العلماء والخطاطين'
  },

  // 8. الخطوط العصرية والرقمية (Modern Digital Fonts)
  { 
    name: 'القاهرة (Cairo - خط الشاشات الأوضح)', 
    shortName: 'القاهرة (Cairo)',
    value: "'Cairo', sans-serif", 
    primary: 'Cairo',
    category: 'الخطوط العصرية',
    scriptType: 'عصري',
    badge: 'عصري مقروء',
    preview: 'القاهرة - خط مقروء وواضح للتقارير والشاشات والمستندات',
    desc: 'الخط المكتبي الحديث الأكثر انتشاراً، متوازن ومريح جداً للقراءة'
  },
  { 
    name: 'تجوال (Tajawal - انسيابي عصري مريح)', 
    shortName: 'تجوال (Tajawal)',
    value: "'Tajawal', sans-serif", 
    primary: 'Tajawal',
    category: 'الخطوط العصرية',
    scriptType: 'عصري',
    badge: 'انسيابي ناعم',
    preview: 'تجوال - قراءة سلسة للبحوث والمقالات والمراسلات',
    desc: 'تصميم هندسي سلس بحواف ناعمة ممتاز للمستندات الطويلة'
  },
  { 
    name: 'المراعي (Almarai - متوازن واحترافي)', 
    shortName: 'المراعي (Almarai)',
    value: "'Almarai', sans-serif", 
    primary: 'Almarai',
    category: 'الخطوط العصرية',
    scriptType: 'عصري',
    badge: 'مكتبي معتمد',
    preview: 'المراعي - خط احترافي للأعمال والشركات والمراسلات',
    desc: 'خط عصري منضبط، تم تصميمه خصيصاً للتطبيقات المكتبية وبيئات العمل'
  },
  { 
    name: 'المسيري (El Messiri - كلاسيكي أدبي فاخر)', 
    shortName: 'المسيري (El Messiri)',
    value: "'El Messiri', sans-serif", 
    primary: 'El Messiri',
    category: 'الخطوط العصرية',
    scriptType: 'عصري',
    badge: 'أدبي كلاسيكي',
    preview: 'المسيري - رونق أدبي وفني للروايات والافتتاحيات الفاخرة',
    desc: 'يمزج روح النسخ الكلاسيكي مع التقنية الرقمية الحديثة'
  },
  { 
    name: 'العربي التقليدي (Traditional Arabic)', 
    shortName: 'العربي التقليدي',
    value: "'Traditional Arabic', serif", 
    primary: 'Traditional Arabic',
    category: 'الخطوط العصرية',
    scriptType: 'تقليدي',
    badge: 'معتمد رسمياً',
    preview: 'العربي التقليدي - وثائق ومراسلات الدوائر الرسمية',
    desc: 'الخط المعتمد في الوثائق الحكومية والمراسلات الرسمية عبر العقود'
  },

  // 9. الخطوط القياسية واللاتينية (Standard & Mono)
  { 
    name: 'Arial (عالمي قياسي)', 
    shortName: 'Arial',
    value: 'Arial, sans-serif', 
    primary: 'Arial',
    category: 'الخطوط القياسية',
    scriptType: 'لاتيني قياسي',
    badge: 'عالمي',
    preview: 'Arial Standard - ثنائي اللغة عربي وإنجليزي متطابق',
    desc: 'خط قياسي متوفر على كافة أنظمة التشغيل حول العالم'
  },
  { 
    name: 'Times New Roman (صحفي وقانوني)', 
    shortName: 'Times New Roman',
    value: "'Times New Roman', serif", 
    primary: 'Times New Roman',
    category: 'الخطوط القياسية',
    scriptType: 'قانوني وصحفي',
    badge: 'صحفي وقانوني',
    preview: 'Times New Roman Legal - مذكرات قضائية ومعاهدات دولية',
    desc: 'الخط الأشهر عالمياً للمستندات القانونية والمجلات الأكاديمية'
  },
  { 
    name: 'Courier New (رموز وأكواد)', 
    shortName: 'Courier New',
    value: "'Courier New', monospace", 
    primary: 'Courier New',
    category: 'الخطوط القياسية',
    scriptType: 'أحادي المسافة',
    badge: 'رموز وأرقام',
    preview: 'Courier New 1234567890 - جداول بيانات وأكواد',
    desc: 'خط أحادي المسافة مناسب للمحاذاة الحسابية والأكواد والشيفرات'
  },
];

export const WordRibbon: React.FC<WordRibbonProps> = ({
  activeTab,
  onSelectTab,
  docState,
  activeHomeMenu: propActiveHomeMenu,
  setActiveHomeMenu: propSetActiveHomeMenu,
  onUpdateDoc,
  onExecCommand,
  onInsertTable,
  onInsertImage,
  onInsertShape,
  onInsertSymbol,
  onInsertLine,
  onInsertLink,
  onNewDocument,
  onOpenDocument,
  onSaveDocument,
  onSaveAsDocument,
  onExportDoc,
  onExportPdf,
  onPrint,
  onAddNewPage,
  onInsertPageBreak,
  onTableAction,
  onImageAction,
  onOpenProofreader,
  onOpenRevisionHistory,
  onOpenSimulator,
  onTriggerHeaderEdit,
  onTriggerFooterEdit,
  onOpenTemplates,
  onShareDocument,
  onOpenPermissionsModal,
  onOpenVoiceTyping
}) => {
  const [isRibbonCollapsed, setIsRibbonCollapsed] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showParagraphShadingMenu, setShowParagraphShadingMenu] = useState(false);
  const [showPaperSizeMenu, setShowPaperSizeMenu] = useState(false);
  const [showCustomMarginsModal, setShowCustomMarginsModal] = useState(false);
  const [customMargins, setCustomMargins] = useState({
    top: docState.customMargins?.top ?? 2.54,
    bottom: docState.customMargins?.bottom ?? 2.54,
    left: docState.customMargins?.left ?? 2.54,
    right: docState.customMargins?.right ?? 2.54,
  });
  const [highlightMode, setHighlightMode] = useState<'text' | 'paragraph'>('text');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showSpacingMenu, setShowSpacingMenu] = useState(false);
  const [showParagraphSpacingMenu, setShowParagraphSpacingMenu] = useState(false);
  const [showTextEffectsMenu, setShowTextEffectsMenu] = useState(false);
  const [showArabicMarksMenu, setShowArabicMarksMenu] = useState(false);
  const [showDirectionMenu, setShowDirectionMenu] = useState(false);
  const [showMarginsMenu, setShowMarginsMenu] = useState(false);
  const [showOrientationMenu, setShowOrientationMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [showBreaksMenu, setShowBreaksMenu] = useState(false);
  const [showHeaderFooterMenu, setShowHeaderFooterMenu] = useState(false);
  const [showPageNumberMenu, setShowPageNumberMenu] = useState(false);
  const [showBorderMenu, setShowBorderMenu] = useState(false);
  const [showWatermarkMenu, setShowWatermarkMenu] = useState(false);
  const [showStampsMenu, setShowStampsMenu] = useState(false);
  const [showDocumentListMenu, setShowDocumentListMenu] = useState(false);
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [showSymbolsMenu, setShowSymbolsMenu] = useState(false);
  const [showThemesMenu, setShowThemesMenu] = useState(false);
  const [showFindModal, setShowFindModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');

  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isPageBordersModalOpen, setIsPageBordersModalOpen] = useState(false);
  const [isTextGradientModalOpen, setIsTextGradientModalOpen] = useState(false);
  const [isTextEffectsModalOpen, setIsTextEffectsModalOpen] = useState(false);
  const [isParagraphShadingModalOpen, setIsParagraphShadingModalOpen] = useState(false);
  const [isSpellCheckOpen, setIsSpellCheckOpen] = useState(false);
  const [isSaveStyleOpen, setIsSaveStyleOpen] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<any>(null);

  // Table Border Customization State
  const [showTableBorderMenu, setShowTableBorderMenu] = useState(false);
  const [tableBorderColor, setTableBorderColor] = useState('#334155');
  const [tableBorderWidth, setTableBorderWidth] = useState('1px');
  const [tableBorderStyle, setTableBorderStyle] = useState<'solid' | 'dashed' | 'dotted' | 'double' | 'groove'>('solid');
  const [tableBorderSides, setTableBorderSides] = useState({
    top: true,
    bottom: true,
    left: true,
    right: true,
    insideH: true,
    insideV: true
  });
  const [tableBorderTarget, setTableBorderTarget] = useState<'table' | 'cell'>('table');

  const handleApplyCustomTableBorder = (preset?: 'all' | 'outside' | 'inside' | 'top' | 'bottom' | 'left' | 'right' | 'horizontal' | 'vertical' | 'none') => {
    let sides = { ...tableBorderSides };
    if (preset === 'all') {
      sides = { top: true, bottom: true, left: true, right: true, insideH: true, insideV: true };
    } else if (preset === 'outside') {
      sides = { top: true, bottom: true, left: true, right: true, insideH: false, insideV: false };
    } else if (preset === 'inside') {
      sides = { top: false, bottom: false, left: false, right: false, insideH: true, insideV: true };
    } else if (preset === 'none') {
      sides = { top: false, bottom: false, left: false, right: false, insideH: false, insideV: false };
    } else if (preset === 'top') {
      sides = { ...sides, top: !sides.top };
    } else if (preset === 'bottom') {
      sides = { ...sides, bottom: !sides.bottom };
    } else if (preset === 'right') {
      sides = { ...sides, right: !sides.right };
    } else if (preset === 'left') {
      sides = { ...sides, left: !sides.left };
    } else if (preset === 'horizontal') {
      sides = { ...sides, insideH: !sides.insideH };
    } else if (preset === 'vertical') {
      sides = { ...sides, insideV: !sides.insideV };
    }

    setTableBorderSides(sides);

    if (onTableAction) {
      onTableAction('customBorder', JSON.stringify({
        sides,
        color: tableBorderColor,
        width: tableBorderWidth,
        style: tableBorderStyle,
        target: tableBorderTarget
      }));
    }
  };

  const handleOpenDropdown = (name: string, e: React.MouseEvent) => {
    if (name === 'fontFamily') toggleHomeMenu('fontFamily', e);
    else if (name === 'fontSize') toggleHomeMenu('fontSize', e);
    else if (name === 'textColor' || name === 'color') toggleHomeMenu('color', e);
    else if (name === 'highlight') toggleHomeMenu('highlight', e);
    else if (name === 'shading') toggleHomeMenu('shading', e);
    else if (name === 'quickPageColor') toggleHomeMenu('themes', e);
    else if (name === 'quickMargins') toggleHomeMenu('spacing', e);
    else if (name === 'coverPages') toggleHomeMenu('symbols', e);
    else if (name === 'modelElements') toggleHomeMenu('legalElements', e);
    else if (name === 'caseChange') toggleHomeMenu('textEffects', e);
    else if (name === 'underlineStyle') toggleHomeMenu('textEffects', e);
    else if (name === 'justify') toggleHomeMenu('spacing', e);
    else if (name === 'bullets' || name === 'numbering') toggleHomeMenu('spacing', e);
    else if (name === 'paragraphBorders') toggleHomeMenu('borders', e);
    else if (name === 'lineSpacing') toggleHomeMenu('spacing', e);
    else if (name === 'theme') toggleHomeMenu('themes', e);
    else if (name === 'direction') toggleHomeMenu('direction', e);
    else if (name === 'borders') toggleHomeMenu('borders', e);
    else if (name === 'tashkeel') toggleHomeMenu('arabicMarks', e);
    else toggleHomeMenu(name as any, e);
  };



  const handleApplyCourtTemplate = () => {
    onUpdateDoc({ contentHtml: COURT_APPEAL_MEMO_HTML });
  };

  const fontFamilies = WORD_FONT_FAMILIES;

  // Layout & Design specific popup states
  const [showLayoutMarginsMenu, setShowLayoutMarginsMenu] = useState(false);
  const [showLayoutSpacingMenu, setShowLayoutSpacingMenu] = useState(false);
  const [showLayoutParagraphSpacingMenu, setShowLayoutParagraphSpacingMenu] = useState(false);
  const [showLayoutPaperSizeMenu, setShowLayoutPaperSizeMenu] = useState(false);
  const [showLayoutColumnsMenu, setShowLayoutColumnsMenu] = useState(false);
  const [showGradientMenu, setShowGradientMenu] = useState(false);
  const [showAllPaperSizesModal, setShowAllPaperSizesModal] = useState(false);

  // Fixed positioning anchor for dropdowns to eliminate toolbar jumping and misalignment
  const [activeLayoutMenu, setActiveLayoutMenu] = useState<{
    id: 'margins' | 'paperSize' | 'columns' | 'spacing' | 'paragraphSpacing' | 'borders';
    rect: DOMRect;
  } | null>(null);

  // Active Home Tab Popup Menu State (Dynamic Visual Popups floating in front of document)
  type HomeMenuId = 
    | 'fontFamily'
    | 'fontSize'
    | 'color' 
    | 'highlight' 
    | 'shading' 
    | 'textEffects' 
    | 'gradient' 
    | 'arabicMarks' 
    | 'spacing' 
    | 'borders' 
    | 'themes'
    | 'direction'
    | 'symbols'
    | 'legalElements';

  const [internalActiveHomeMenu, setInternalActiveHomeMenu] = useState<{
    id: HomeMenuId;
    rect: DOMRect;
  } | null>(null);

  const activeHomeMenu = propActiveHomeMenu !== undefined ? propActiveHomeMenu : internalActiveHomeMenu;
  const setActiveHomeMenu = propSetActiveHomeMenu !== undefined ? propSetActiveHomeMenu : setInternalActiveHomeMenu;

  const [bordersTab, setBordersTab] = useState<'page' | 'paragraph'>('page');
  const [formatPainterActive, setFormatPainterActive] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState<{
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
  } | null>(null);

  const handleToggleFormatPainter = (e: React.MouseEvent) => {
    e.stopPropagation();
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const el = container.nodeType === 1 ? (container as HTMLElement) : container.parentElement;
      if (el) {
        const computed = window.getComputedStyle(el);
        setCopiedStyle({
          fontFamily: computed.fontFamily,
          fontSize: parseInt(computed.fontSize) || 14,
          color: computed.color,
          fontWeight: computed.fontWeight,
          fontStyle: computed.fontStyle,
          textDecoration: computed.textDecoration,
        });
        setFormatPainterActive(true);
      }
    } else {
      if (formatPainterActive) {
        setFormatPainterActive(false);
        setCopiedStyle(null);
      } else {
        setFormatPainterActive(true);
      }
    }
  };

  const applyFormatPainterToSelection = () => {
    if (!formatPainterActive || !copiedStyle) return;
    restoreSelection();
    const sel = window.getSelection();
    const editor = document.getElementById('word-body-editable');
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor && editor.contains(sel.anchorNode)) {
      try {
        const range = sel.getRangeAt(0);
        const span = document.createElement('span');
        if (copiedStyle.fontFamily) span.style.fontFamily = copiedStyle.fontFamily;
        if (copiedStyle.fontSize) span.style.fontSize = `${copiedStyle.fontSize}pt`;
        if (copiedStyle.color) span.style.color = copiedStyle.color;
        if (copiedStyle.fontWeight) span.style.fontWeight = copiedStyle.fontWeight;
        if (copiedStyle.fontStyle) span.style.fontStyle = copiedStyle.fontStyle;
        if (copiedStyle.textDecoration) span.style.textDecoration = copiedStyle.textDecoration;
        
        span.appendChild(range.extractContents());
        range.insertNode(span);

        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedSelectionRef.current = newRange.cloneRange();

        onUpdateDoc({ contentHtml: editor.innerHTML });
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (e) {}
      setFormatPainterActive(false);
      setCopiedStyle(null);
    }
  };

  const [customTextColor, setCustomTextColor] = useState(docState.textColor || '#000000');

  useEffect(() => {
    if (docState.textColor) {
      setCustomTextColor(docState.textColor);
    }
  }, [docState.textColor]);
  const [customHighlightColor, setCustomHighlightColor] = useState('#fef08a');
  const [customShadingColor, setCustomShadingColor] = useState('#f0fdf4');
  const [customBorderColor, setCustomBorderColor] = useState(docState.borderColor || '#1e3a8a');
  const [customFontSizeInput, setCustomFontSizeInput] = useState(String(docState.fontSize || 14));
  const [fontApplyScope, setFontApplyScope] = useState<'wholeDoc' | 'selected' | 'paragraph'>('selected');
  const [textColorApplyScope, setTextColorApplyScope] = useState<'wholeDoc' | 'selected' | 'paragraph'>('selected');
  const [colorPopupTab, setColorPopupTab] = useState<'solid' | 'gradient'>('solid');
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('office_recent_colors');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['#1e3a8a', '#b91c1c', '#047857', '#d97706', '#6d28d9', '#0f172a', '#2563eb', '#059669'];
  });
  const [gradientColor1, setGradientColor1] = useState('#2563eb');
  const [gradientColor2, setGradientColor2] = useState('#9333ea');
  const [gradientDirection, setGradientDirection] = useState('135deg');
  const [favoriteGradients, setFavoriteGradients] = useState<Array<{ id: string; name: string; gradient: string }>>(() => {
    try {
      const saved = localStorage.getItem('office_favorite_gradients');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const handleSaveFavoriteGradient = () => {
    const customGrad = `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2})`;
    const newItem = {
      id: Date.now().toString(),
      name: `تدرج ${favoriteGradients.length + 1}`,
      gradient: customGrad,
    };
    const updated = [newItem, ...favoriteGradients].slice(0, 12);
    setFavoriteGradients(updated);
    try {
      localStorage.setItem('office_favorite_gradients', JSON.stringify(updated));
    } catch {}
  };

  const handleRemoveFavoriteGradient = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favoriteGradients.filter((g) => g.id !== id);
    setFavoriteGradients(updated);
    try {
      localStorage.setItem('office_favorite_gradients', JSON.stringify(updated));
    } catch {}
  };
  const [showShortcutsGuideModal, setShowShortcutsGuideModal] = useState(false);
  const [showFontGalleryModal, setShowFontGalleryModal] = useState(false);
  const [fontGalleryCategory, setFontGalleryCategory] = useState<string>('all');
  const [fontTestText, setFontTestText] = useState('الفوائد النحوية واللغوية الممتعة - أحمد عبد الوهاب');
  const [fontSearchQuery, setFontSearchQuery] = useState('');
  const [legalElementsTab, setLegalElementsTab] = useState<'badges' | 'boxes' | 'custom' | 'frames'>('badges');
  const [customBadgeNumber, setCustomBadgeNumber] = useState('5');
  const [customBadgeTitle, setCustomBadgeTitle] = useState('خامساً: في شأن المرافعات والإجراءات:');
  const [customBadgeColor, setCustomBadgeColor] = useState('#15803d');

  const getFontFamilyDisplayName = (currentFont?: string) => {
    if (!currentFont) return 'أميري';
    const cleanCurrent = currentFont.replace(/['"]/g, '').toLowerCase().trim();
    const found = WORD_FONT_FAMILIES.find((f) => {
      const cleanVal = f.value.replace(/['"]/g, '').toLowerCase().trim();
      const primaryCurrent = cleanCurrent.split(',')[0].trim();
      const primaryVal = cleanVal.split(',')[0].trim();
      return (
        primaryCurrent === primaryVal ||
        cleanVal.includes(primaryCurrent) ||
        cleanCurrent.includes(primaryVal) ||
        f.primary.toLowerCase() === primaryCurrent
      );
    });
    if (found) {
      return found.shortName || found.name.split(' (')[0];
    }
    const fallback = currentFont.split(',')[0].replace(/['"]/g, '').trim();
    return fallback || 'أميري';
  };

  // Custom Styles storage & state
  const [customStyles, setCustomStyles] = useState<Array<{
    id: string;
    title: string;
    preview: string;
    cardClass: string;
    fontFamily?: string;
    fontSize?: number;
    isBold?: boolean;
    isItalic?: boolean;
    textColor?: string;
    backgroundColor?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('office_word_custom_styles');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [showSaveStyleModal, setShowSaveStyleModal] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');

  // Persistent selection range tracker so ribbon clicks never lose user's active document selection
  const savedSelectionRef = useRef<Range | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const editor = document.getElementById('word-body-editable');
        if (editor && editor.contains(sel.anchorNode)) {
          savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
        }
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const saveCurrentSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const editor = document.getElementById('word-body-editable');
      if (editor && editor.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    const editor = document.getElementById('word-body-editable');
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    } else if (editor) {
      editor.focus();
    }
  };

  const toggleHomeMenu = (id: HomeMenuId, e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    saveCurrentSelection();
    if (activeHomeMenu?.id === id) {
      setActiveHomeMenu(null);
    } else {
      closeAllDropdowns();
      const rect = e.currentTarget.getBoundingClientRect();
      setActiveHomeMenu({ id, rect });
    }
  };

  const applyFontFamily = (familyValue: string, explicitScope?: 'selected' | 'paragraph' | 'wholeDoc') => {
    const scope = explicitScope || fontApplyScope;
    console.log('[DEBUG] applyFontFamily executing:', { familyValue, scope });

    const editor = document.getElementById('word-body-editable');
    if (!editor) return;

    editor.focus();
    const sel = window.getSelection();
    const hasSelection = sel && sel.rangeCount > 0 && !sel.isCollapsed && editor.contains(sel.anchorNode);

    if (scope === 'wholeDoc') {
      editor.style.fontFamily = familyValue;
      onUpdateDoc({ fontFamily: familyValue, contentHtml: editor.innerHTML });
    } else if (scope === 'paragraph') {
      let node: Node | null = sel?.anchorNode || editor;
      let targetBlock: HTMLElement | null = null;
      while (node && node !== editor) {
        if (node.nodeType === 1 && ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'LI', 'TD', 'TH', 'BLOCKQUOTE'].includes(node.nodeName)) {
          targetBlock = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }
      if (!targetBlock || targetBlock === editor) {
        targetBlock = editor.querySelector('p, h1, h2, h3, div') as HTMLElement | null;
      }
      if (targetBlock && targetBlock !== editor) {
        targetBlock.style.fontFamily = familyValue;
      } else {
        editor.style.fontFamily = familyValue;
      }
      onUpdateDoc({ fontFamily: familyValue, contentHtml: editor.innerHTML });
    } else {
      if (hasSelection && sel) {
        try {
          const range = sel.getRangeAt(0);
          if (!range.collapsed) {
            const span = document.createElement('span');
            span.style.fontFamily = familyValue;
            span.appendChild(range.extractContents());
            range.insertNode(span);

            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            sel.removeAllRanges();
            sel.addRange(newRange);
            savedSelectionRef.current = newRange.cloneRange();
          }
        } catch (e) {
          try {
            document.execCommand('fontName', false, familyValue);
          } catch {}
        }
        onUpdateDoc({ fontFamily: familyValue, contentHtml: editor.innerHTML });
      } else {
        editor.style.fontFamily = familyValue;
        onUpdateDoc({ fontFamily: familyValue, contentHtml: editor.innerHTML });
      }
    }

    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveHomeMenu(null);
  };

  const handleApplyCourtAppealTemplate = () => {
    restoreSelection();
    onUpdateDoc({
      title: '0 - مذكرة دعوى_محكمة التمييز الإبتدائية.doc',
      fontFamily: "'Amiri', serif",
      fontSize: 14,
      textColor: '#0f172a',
      lineSpacing: 1.8,
      direction: 'rtl',
      borderStyle: 'royal',
      showBorders: true,
      borderColor: '#1e3a8a',
      borderWidth: 3,
      margins: 'normal',
      showHeader: false,
      showFooter: false,
      contentHtml: COURT_APPEAL_MEMO_HTML,
    });
    const editor = document.getElementById('word-body-editable');
    if (editor) {
      editor.innerHTML = COURT_APPEAL_MEMO_HTML;
      editor.focus();
    }
    setActiveHomeMenu(null);
  };

  const handleInsertLegalSnippet = (html: string) => {
    restoreSelection();
    const editor = document.getElementById('word-body-editable');
    if (!editor) return;

    editor.focus();
    restoreSelection();

    const sel = window.getSelection();
    let inserted = false;

    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
      try {
        inserted = document.execCommand('insertHTML', false, html);
      } catch (e) {
        inserted = false;
      }
    }

    if (!inserted) {
      // Clean fallback: append HTML block directly to editor
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      while (tempDiv.firstChild) {
        editor.appendChild(tempDiv.firstChild);
      }
    }

    onUpdateDoc({ contentHtml: editor.innerHTML });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveHomeMenu(null);
  };

  const handleInsertPage2Continuation = () => {
    handleInsertLegalSnippet(SNIPPETS_LEGAL.page2FullContinuation);
  };

  const applyFontSize = (size: number) => {
    restoreSelection();
    const editor = document.getElementById('word-body-editable');
    if (editor) editor.focus();
    restoreSelection();
    onUpdateDoc({ fontSize: size });
    setCustomFontSizeInput(String(size));
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor && editor.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = `${size}pt`;
      span.appendChild(range.extractContents());
      range.insertNode(span);
      
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedSelectionRef.current = newRange.cloneRange();
    } else if (editor) {
      let node: Node | null = sel?.anchorNode || editor;
      let target: HTMLElement | null = null;
      while (node && node !== editor) {
        if (node.nodeType === 1 && ['P', 'H1', 'H2', 'H3', 'H4', 'DIV', 'LI', 'TD'].includes(node.nodeName)) {
          target = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }
      if (target) {
        target.style.fontSize = `${size}pt`;
      } else {
        editor.style.fontSize = `${size}pt`;
      }
    }
    if (editor) {
      onUpdateDoc({ fontSize: size, contentHtml: editor.innerHTML });
    }
    setActiveHomeMenu(null);
  };

  const changeFontSize = (delta: number) => {
    const current = docState.fontSize || 14;
    const next = Math.max(8, Math.min(72, current + delta));
    applyFontSize(next);
  };

  const handleClearFormatting = () => {
    restoreSelection();
    const editor = document.getElementById('word-body-editable');
    if (editor) editor.focus();
    restoreSelection();
    document.execCommand('removeFormat', false);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor) {
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const parentEl = container.nodeType === 1 ? (container as HTMLElement) : container.parentElement;
      if (parentEl && parentEl !== editor && ['SPAN', 'FONT', 'B', 'I', 'U', 'EM', 'STRONG', 'MARK'].includes(parentEl.tagName)) {
        parentEl.removeAttribute('style');
        parentEl.removeAttribute('color');
        parentEl.removeAttribute('face');
        parentEl.removeAttribute('size');
      }
    }
    if (editor) {
      onUpdateDoc({ contentHtml: editor.innerHTML });
    }
  };

  const handleFormat = (command: string, value: string = '') => {
    console.log('[DEBUG] WordRibbon handleFormat clicked:', command, value);
    restoreSelection();
    const editor = document.getElementById('word-body-editable');
    if (editor) {
      editor.focus();
    }
    restoreSelection();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
    saveCurrentSelection();
    if (editor) {
      onUpdateDoc({ contentHtml: editor.innerHTML });
    }
  };

  const addRecentColor = (col: string) => {
    if (!col || col === 'inherit' || col === 'transparent') return;
    setRecentColors((prev) => {
      const next = [col, ...prev.filter((c) => c.toLowerCase() !== col.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem('office_recent_colors', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const applyTextGradient = (gradientCss: string) => {
    const editor = document.getElementById('word-body-editable');
    if (!editor) return;

    restoreSelection();
    const sel = window.getSelection();
    const hasSelection = sel && sel.rangeCount > 0 && !sel.isCollapsed && editor.contains(sel.anchorNode);

    if (hasSelection && sel) {
      try {
        const range = sel.getRangeAt(0);
        if (!range.collapsed) {
          const span = document.createElement('span');
          span.style.backgroundImage = gradientCss;
          span.style.setProperty('-webkit-background-image', gradientCss);
          span.style.webkitBackgroundClip = 'text';
          span.style.backgroundClip = 'text';
          span.style.webkitTextFillColor = 'transparent';
          span.style.display = 'inline-block';
          span.setAttribute('data-text-gradient', gradientCss);
          span.appendChild(range.extractContents());
          range.insertNode(span);

          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          sel.removeAllRanges();
          sel.addRange(newRange);
          savedSelectionRef.current = newRange.cloneRange();
        }
      } catch (err) {}
      saveCurrentSelection();
    } else {
      editor.style.backgroundImage = gradientCss;
      editor.style.setProperty('-webkit-background-image', gradientCss);
      editor.style.webkitBackgroundClip = 'text';
      editor.style.backgroundClip = 'text';
      editor.style.webkitTextFillColor = 'transparent';
    }

    onUpdateDoc({ contentHtml: editor.innerHTML });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveHomeMenu(null);
  };

  const applyTextColor = (color: string, explicitScope?: 'selected' | 'paragraph' | 'wholeDoc') => {
    const scope = explicitScope || textColorApplyScope;
    console.log('[DEBUG] WordRibbon applyTextColor executing:', { color, scope });
    const editor = document.getElementById('word-body-editable');
    if (!editor) return;

    addRecentColor(color);
    editor.focus();
    restoreSelection();

    const sel = window.getSelection();
    let hasSelection = sel && sel.rangeCount > 0 && !sel.isCollapsed && editor.contains(sel.anchorNode);

    // إذا لم يكن هناك نص محدد، نتأكد إذا كان المؤشر داخل كلمة لنحدد الكلمة ونقوم بتلوينها تلقائياً
    if (!hasSelection && sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
      try {
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        if (node && node.nodeType === Node.TEXT_NODE && node.textContent) {
          const text = node.textContent;
          const offset = range.startOffset;
          let start = offset;
          while (start > 0 && !/\s/.test(text[start - 1])) start--;
          let end = offset;
          while (end < text.length && !/\s/.test(text[end])) end++;
          if (end > start) {
            const wordRange = document.createRange();
            wordRange.setStart(node, start);
            wordRange.setEnd(node, end);
            sel.removeAllRanges();
            sel.addRange(wordRange);
            hasSelection = true;
          }
        }
      } catch (e) {}
    }

    if (scope === 'wholeDoc') {
      editor.style.color = color;
      editor.querySelectorAll('*').forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (!htmlEl.dataset.badge && !htmlEl.classList.contains('badge') && !htmlEl.closest('[data-badge]')) {
          htmlEl.style.color = color;
        }
      });
    } else if (scope === 'paragraph') {
      let node: Node | null = sel?.anchorNode || editor;
      let targetBlock: HTMLElement | null = null;
      while (node && node !== editor) {
        if (node.nodeType === 1 && ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'LI', 'TD', 'TH', 'BLOCKQUOTE'].includes(node.nodeName)) {
          if (!(node as HTMLElement).classList.contains('court-memo-document')) {
            targetBlock = node as HTMLElement;
            break;
          }
        }
        node = node.parentNode;
      }
      if (!targetBlock || targetBlock === editor) {
        targetBlock = editor.querySelector('p, h1, h2, h3, div:not(.court-memo-document)') as HTMLElement | null;
      }

      if (targetBlock && targetBlock !== editor) {
        targetBlock.style.color = color;
        targetBlock.querySelectorAll('*').forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (!htmlEl.dataset.badge && !htmlEl.closest('[data-badge]')) {
            htmlEl.style.color = color;
          }
        });
      } else {
        editor.style.color = color;
      }
    } else {
      // Scope === 'selected' (تلوين النص المحدد فورياً وبأعلى دقة متوافقة)
      if (hasSelection && sel) {
        document.execCommand('styleWithCSS', false, 'true');
        const applied = document.execCommand('foreColor', false, color);
        if (!applied) {
          try {
            const range = sel.getRangeAt(0);
            if (!range.collapsed) {
              const span = document.createElement('span');
              span.style.color = color;
              span.setAttribute('data-text-color', color);
              span.appendChild(range.extractContents());
              range.insertNode(span);
              const newRange = document.createRange();
              newRange.selectNodeContents(span);
              sel.removeAllRanges();
              sel.addRange(newRange);
            }
          } catch (err) {}
        }
      } else {
        editor.style.color = color;
      }
    }

    saveCurrentSelection();
    onUpdateDoc({ textColor: color, contentHtml: editor.innerHTML });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveHomeMenu(null);
  };

  const applyHighlightColor = (color: string) => {
    restoreSelection();
    const editor = document.getElementById('word-body-editable');
    if (editor) editor.focus();
    restoreSelection();
    const sel = window.getSelection();
    const hasSelection = sel && sel.rangeCount > 0 && !sel.isCollapsed && editor && editor.contains(sel.anchorNode);

    if (color === 'transparent' || !color) {
      if (hasSelection && sel) {
        try {
          const range = sel.getRangeAt(0);
          const parentMark = range.commonAncestorContainer.parentElement?.closest('mark');
          if (parentMark) {
            const parent = parentMark.parentNode;
            while (parentMark.firstChild) parent?.insertBefore(parentMark.firstChild, parentMark);
            parent?.removeChild(parentMark);
          } else {
            document.execCommand('removeFormat', false);
          }
        } catch {
          document.execCommand('removeFormat', false);
        }
      }
      if (editor) {
        editor.querySelectorAll('mark').forEach((m) => {
          const parent = m.parentNode;
          while (m.firstChild) parent?.insertBefore(m.firstChild, m);
          parent?.removeChild(m);
        });
      }
    } else {
      if (hasSelection && sel) {
        try {
          const range = sel.getRangeAt(0);
          if (!range.collapsed) {
            const mark = document.createElement('mark');
            mark.style.backgroundColor = color;
            mark.style.color = 'inherit';
            mark.appendChild(range.extractContents());
            range.insertNode(mark);

            const newRange = document.createRange();
            newRange.selectNodeContents(mark);
            sel.removeAllRanges();
            sel.addRange(newRange);
            savedSelectionRef.current = newRange.cloneRange();
          }
        } catch (e) {
          try {
            document.execCommand('styleWithCSS', false, 'true');
            document.execCommand('hiliteColor', false, color);
          } catch {}
        }
      } else if (editor) {
        let node: Node | null = sel?.anchorNode || editor;
        let targetBlock: HTMLElement | null = null;
        while (node && node !== editor) {
          if (node.nodeType === 1 && ['P', 'H1', 'H2', 'H3', 'H4', 'DIV', 'LI', 'TD'].includes(node.nodeName)) {
            if (!(node as HTMLElement).classList.contains('court-memo-document')) {
              targetBlock = node as HTMLElement;
              break;
            }
          }
          node = node.parentNode;
        }
        if (!targetBlock || targetBlock === editor) {
          targetBlock = editor.querySelector('p, h1, h2, h3, div:not(.court-memo-document)') as HTMLElement | null;
        }
        if (targetBlock && targetBlock !== editor) {
          const mark = document.createElement('mark');
          mark.style.backgroundColor = color;
          mark.style.color = 'inherit';
          mark.innerHTML = targetBlock.innerHTML;
          targetBlock.innerHTML = '';
          targetBlock.appendChild(mark);
        }
      }
    }
    if (editor) {
      onUpdateDoc({ highlightColor: color, contentHtml: editor.innerHTML });
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
    setActiveHomeMenu(null);
  };

  const applyParagraphShading = (color: string) => {
    restoreSelection();
    const editor = document.getElementById('word-body-editable');
    if (!editor) return;
    editor.focus();
    restoreSelection();

    const sel = window.getSelection();
    let targetBlock: HTMLElement | null = null;
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode;
      while (node && node !== editor) {
        if (node.nodeType === 1 && ['P', 'H1', 'H2', 'H3', 'H4', 'DIV', 'BLOCKQUOTE', 'LI', 'TD'].includes(node.nodeName)) {
          if (!(node as HTMLElement).classList.contains('court-memo-document')) {
            targetBlock = node as HTMLElement;
            break;
          }
        }
        node = node.parentNode;
      }
    }
    if (!targetBlock || targetBlock === editor) {
      targetBlock = editor.querySelector('p, h1, h2, h3, blockquote, li, .court-memo-document > div') as HTMLElement | null;
    }
    if (targetBlock && targetBlock !== editor) {
      if (color === 'transparent' || !color) {
        targetBlock.style.backgroundColor = '';
        targetBlock.style.padding = '';
        targetBlock.style.borderRadius = '';
      } else {
        targetBlock.style.backgroundColor = color;
        targetBlock.style.padding = '8px 14px';
        targetBlock.style.borderRadius = '6px';
      }
    }
    onUpdateDoc({ paragraphBgColor: color, contentHtml: editor.innerHTML });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveHomeMenu(null);
  };

  const applyTextEffect = (styleString: string) => {
    restoreSelection();
    const editor = document.getElementById('word-body-editable');
    if (!editor) return;
    editor.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor.contains(sel.anchorNode)) {
      try {
        const range = sel.getRangeAt(0);
        const span = document.createElement('span');
        span.setAttribute('style', styleString);
        span.appendChild(range.extractContents());
        range.insertNode(span);
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedSelectionRef.current = newRange.cloneRange();
      } catch (err) {}
    } else {
      let node: Node | null = sel?.anchorNode || editor;
      let targetHeading: HTMLElement | null = null;
      while (node && node !== editor) {
        if (node.nodeType === 1 && ['H1', 'H2', 'H3', 'H4', 'P', 'STRONG', 'B'].includes(node.nodeName)) {
          targetHeading = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }
      if (!targetHeading || targetHeading === editor) {
        targetHeading = editor.querySelector('h1, h2, h3, p') as HTMLElement | null;
      }
      if (targetHeading && targetHeading !== editor) {
        const existingStyle = targetHeading.getAttribute('style') || '';
        targetHeading.setAttribute('style', `${existingStyle}; ${styleString}`);
      } else {
        const html = `<span style="${styleString}">نص بتأثير بصري مميز</span>`;
        document.execCommand('insertHTML', false, html);
      }
    }
    onUpdateDoc({ contentHtml: editor.innerHTML });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveHomeMenu(null);
  };

  const applyDiacritic = (char: string) => {
    restoreSelection();
    onExecCommand('insertText', char);
    const editor = document.getElementById('word-body-editable');
    if (editor) {
      onUpdateDoc({ contentHtml: editor.innerHTML });
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const applyParagraphBorder = (borderType: 'all' | 'box' | 'bottom' | 'top' | 'right' | 'left' | 'double_bottom' | 'none') => {
    restoreSelection();
    const editor = document.getElementById('word-body-editable');
    if (!editor) return;
    editor.focus();
    restoreSelection();

    const sel = window.getSelection();
    let targetBlock: HTMLElement | null = null;
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode;
      while (node && node !== editor) {
        if (node.nodeType === 1 && ['P', 'H1', 'H2', 'H3', 'H4', 'DIV', 'BLOCKQUOTE', 'LI', 'TD'].includes(node.nodeName)) {
          if (!(node as HTMLElement).classList.contains('court-memo-document')) {
            targetBlock = node as HTMLElement;
            break;
          }
        }
        node = node.parentNode;
      }
    }
    if (!targetBlock || targetBlock === editor) {
      targetBlock = editor.querySelector('p, h1, h2, h3, blockquote, li, .court-memo-document > div') as HTMLElement | null;
    }
    if (targetBlock && targetBlock !== editor) {
      targetBlock.style.border = '';
      targetBlock.style.borderTop = '';
      targetBlock.style.borderBottom = '';
      targetBlock.style.borderRight = '';
      targetBlock.style.borderLeft = '';
      targetBlock.style.padding = '';

      if (borderType === 'none') {
        // already cleared
      } else if (borderType === 'all' || borderType === 'box') {
        targetBlock.style.border = '2px solid #1e3a8a';
        targetBlock.style.borderRadius = '6px';
        targetBlock.style.padding = '8px 12px';
      } else if (borderType === 'bottom') {
        targetBlock.style.borderBottom = '2px solid #3b82f6';
        targetBlock.style.paddingBottom = '6px';
      } else if (borderType === 'double_bottom') {
        targetBlock.style.borderBottom = '4px double #1e3a8a';
        targetBlock.style.paddingBottom = '6px';
      } else if (borderType === 'top') {
        targetBlock.style.borderTop = '2px solid #3b82f6';
        targetBlock.style.paddingTop = '6px';
      } else if (borderType === 'right') {
        targetBlock.style.borderRight = '4px solid #1e3a8a';
        targetBlock.style.paddingRight = '12px';
        targetBlock.style.paddingTop = '4px';
        targetBlock.style.paddingBottom = '4px';
        targetBlock.style.backgroundColor = 'rgba(239, 246, 255, 0.6)';
        targetBlock.style.borderRadius = '0 4px 4px 0';
      } else if (borderType === 'left') {
        targetBlock.style.borderLeft = '4px solid #1e3a8a';
        targetBlock.style.paddingLeft = '12px';
      }
    }
    onUpdateDoc({ contentHtml: editor.innerHTML });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveHomeMenu(null);
  };

  const applyAlignment = (align: 'right' | 'center' | 'left' | 'justify') => {
    restoreSelection();
    onUpdateDoc({ textAlign: align });
    const editor = document.getElementById('word-body-editable');
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editor) {
      let node: Node | null = sel.anchorNode;
      while (node && node !== editor) {
        if (node.nodeType === 1 && ['P', 'H1', 'H2', 'H3', 'H4', 'DIV', 'BLOCKQUOTE', 'LI', 'TD'].includes(node.nodeName)) {
          (node as HTMLElement).style.textAlign = align;
          break;
        }
        node = node.parentNode;
      }
    }
    const cmd = align === 'right' ? 'justifyRight' : align === 'center' ? 'justifyCenter' : align === 'left' ? 'justifyLeft' : 'justifyFull';
    document.execCommand(cmd, false);
    if (editor) {
      onUpdateDoc({ textAlign: align, contentHtml: editor.innerHTML });
    }
  };

  const applyListCommand = (cmd: 'insertUnorderedList' | 'insertOrderedList' | 'outdent' | 'indent') => {
    restoreSelection();
    const editor = document.getElementById('word-body-editable');
    if (editor) editor.focus();
    restoreSelection();
    document.execCommand(cmd, false);
    saveCurrentSelection();
    if (editor) {
      onUpdateDoc({ contentHtml: editor.innerHTML });
    }
  };

  // Apply Columns
  const applyColumns = (count: number) => {
    restoreSelection();
    const editor = document.getElementById('word-body-editable');
    if (!editor) return;
    editor.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor.contains(sel.anchorNode)) {
      try {
        const range = sel.getRangeAt(0);
        const div = document.createElement('div');
        div.style.columnCount = count.toString();
        div.style.columnGap = '16px';
        div.appendChild(range.extractContents());
        range.insertNode(div);
        
        const newRange = document.createRange();
        newRange.selectNodeContents(div);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedSelectionRef.current = newRange.cloneRange();
      } catch (e) {}
    } else {
        editor.style.columnCount = count.toString();
        editor.style.columnGap = '16px';
    }
    onUpdateDoc({ columns: count as any, contentHtml: editor.innerHTML });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const applyCustomStyle = (cs: {
    fontFamily?: string;
    fontSize?: number;
    isBold?: boolean;
    textColor?: string;
    backgroundColor?: string;
  }) => {
    restoreSelection();
    const editor = document.getElementById('word-body-editable');
    if (editor) editor.focus();
    restoreSelection();
    
    if (cs.fontFamily) applyFontFamily(cs.fontFamily);
    if (cs.fontSize) applyFontSize(cs.fontSize);
    if (cs.textColor) applyTextColor(cs.textColor);
    if (cs.backgroundColor) applyParagraphShading(cs.backgroundColor);
    if (cs.isBold) {
      document.execCommand('bold', false);
    }
    if (editor) {
      onUpdateDoc({
        contentHtml: editor.innerHTML,
        ...(cs.fontFamily ? { fontFamily: cs.fontFamily } : {}),
        ...(cs.fontSize ? { fontSize: cs.fontSize } : {}),
        ...(cs.textColor ? { textColor: cs.textColor } : {}),
        ...(cs.backgroundColor ? { paragraphBgColor: cs.backgroundColor } : {})
      });
    }
  };

  const handleSaveCurrentStyle = () => {
    const title = newStyleName.trim() || `نمط مخصص ${customStyles.length + 1}`;
    const newStyle = {
      id: `custom_${Date.now()}`,
      title,
      preview: 'Aa أب',
      cardClass: 'border-purple-500 bg-purple-50/70 text-purple-950 font-bold',
      fontFamily: docState.fontFamily,
      fontSize: docState.fontSize,
      isBold: docState.isBold,
      textColor: docState.textColor,
      backgroundColor: docState.paragraphBgColor,
    };
    const updated = [...customStyles, newStyle];
    setCustomStyles(updated);
    try {
      localStorage.setItem('office_word_custom_styles', JSON.stringify(updated));
    } catch {}
    setShowSaveStyleModal(false);
    setNewStyleName('');
  };

  const handleDeleteCustomStyle = (id: string) => {
    const updated = customStyles.filter((s) => s.id !== id);
    setCustomStyles(updated);
    try {
      localStorage.setItem('office_word_custom_styles', JSON.stringify(updated));
    } catch {}
  };

  const applyPageBorder = (
    style: 'none' | 'royal' | 'court' | 'islamic' | 'certificate' | 'double' | 'triple' | 'gold' | 'classic' | 'dashed' | 'shadow' | 'single' | any,
    color?: string,
    width?: number
  ) => {
    const isNone = style === 'none';
    const borderCol = color || (style === 'gold' ? '#b45309' : (style === 'islamic' || style === 'royal' || style === 'court' || style === 'double') ? '#1e3a8a' : '#334155');
    const borderW = width || (style === 'gold' || style === 'islamic' || style === 'royal' || style === 'court' ? 3 : 2);
    onUpdateDoc({
      showBorders: !isNone,
      borderStyle: style,
      borderColor: borderCol,
      borderWidth: borderW,
    });
    setActiveHomeMenu(null);
  };

  const applyTheme = (theme: {
    pageBgColor: string;
    textColor: string;
    fontFamily: string;
    showBorders: boolean;
    borderStyle: any;
    borderColor: string;
    borderWidth: number;
    lineSpacing: number;
  }) => {
    const editor = document.getElementById('word-body-editable');
    if (editor) {
      const pageSheet = document.getElementById('word-document-page');
      if (pageSheet) {
        pageSheet.style.backgroundColor = theme.pageBgColor;
      }
      editor.style.color = theme.textColor;
      editor.style.fontFamily = theme.fontFamily;
      editor.style.lineHeight = String(theme.lineSpacing);
      editor.querySelectorAll('p, h1, h2, h3, h4, li, .court-memo-document').forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (!htmlEl.dataset.badge && !htmlEl.closest('[data-badge]')) {
          htmlEl.style.color = theme.textColor;
        }
      });
      onUpdateDoc({
        ...theme,
        contentHtml: editor.innerHTML,
      });
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      onUpdateDoc(theme);
    }
    setActiveHomeMenu(null);
  };

  const toggleLayoutMenu = (
    id: 'margins' | 'paperSize' | 'columns' | 'spacing' | 'paragraphSpacing' | 'borders' | 'breaks' | 'pageColor' | 'watermark',
    e: React.MouseEvent<HTMLElement>
  ) => {
    e.stopPropagation();
    if (activeLayoutMenu?.id === id) {
      setActiveLayoutMenu(null);
    } else {
      closeAllDropdowns();
      const rect = e.currentTarget.getBoundingClientRect();
      setActiveLayoutMenu({ id, rect });
    }
  };

  const getDropdownFixedStyle = (rect: DOMRect | undefined, width: number = 360, zIndex: number = 250): React.CSSProperties => {
    if (!rect) return { display: 'none' };
    const top = rect.bottom + 6;
    let right = window.innerWidth - rect.right;
    if (right < 8) right = 8;
    if (right + width > window.innerWidth - 8) {
      right = Math.max(8, window.innerWidth - width - 8);
    }
    return {
      position: 'fixed',
      top: `${top}px`,
      right: `${right}px`,
      width: `${Math.min(width, window.innerWidth - 16)}px`,
      maxWidth: 'calc(100vw - 16px)',
      zIndex,
      backgroundColor: '#ffffff',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    };
  };

  // File Tab and Menu states (Matching User Screenshots 1 & 2)
  const [showFileMenuDrawer, setShowFileMenuDrawer] = useState(false);
  const [showDrawerOtherFormats, setShowDrawerOtherFormats] = useState(false);
  const [showOtherFormatsMenu, setShowOtherFormatsMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDocInfoModal, setShowDocInfoModal] = useState(false);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Ribbon Drag & Scroll Handling (ميزة سحب وتمرير الأشرطة وعدم تجميدها)
  const toolbarScrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleScrollBy = (offset: number) => {
    if (toolbarScrollRef.current) {
      toolbarScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, select, input, a, [role="button"]')) {
      return;
    }
    const el = toolbarScrollRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleToolbarMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !toolbarScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - toolbarScrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    toolbarScrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleToolbarMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleToolbarWheel = (e: React.WheelEvent) => {
    if (toolbarScrollRef.current && (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0)) {
      toolbarScrollRef.current.scrollLeft += (e.deltaY || e.deltaX);
    }
  };

  const closeAllDropdowns = () => {
    setActiveHomeMenu(null);
    setActiveLayoutMenu(null);
    setShowMarginsMenu(false);
    setShowOrientationMenu(false);
    setShowPaperSizeMenu(false);
    setShowColumnsMenu(false);
    setShowBreaksMenu(false);
    setShowHeaderFooterMenu(false);
    setShowPageNumberMenu(false);
    setShowColorPicker(false);
    setShowHighlightPicker(false);
    setShowParagraphShadingMenu(false);
    setShowSpacingMenu(false);
    setShowParagraphSpacingMenu(false);
    setShowTextEffectsMenu(false);
    setShowArabicMarksMenu(false);
    setShowDirectionMenu(false);
    setShowBorderMenu(false);
    setShowWatermarkMenu(false);
    setShowStampsMenu(false);
    setShowTablePicker(false);
    setShowThemeMenu(false);
    setShowDocumentListMenu(false);
    setShowShapesMenu(false);
    setShowSymbolsMenu(false);
    setShowLayoutMarginsMenu(false);
    setShowLayoutSpacingMenu(false);
    setShowLayoutParagraphSpacingMenu(false);
    setShowLayoutPaperSizeMenu(false);
    setShowLayoutColumnsMenu(false);
    setShowGradientMenu(false);
    setShowAllPaperSizesModal(false);
    setShowFileMenuDrawer(false);
    setShowDrawerOtherFormats(false);
    setShowOtherFormatsMenu(false);
    setShowShareModal(false);
    setShowDocInfoModal(false);
  };

  const isAnyDropdownOpen = Boolean(
    activeHomeMenu !== null ||
    activeLayoutMenu !== null ||
    showMarginsMenu || showOrientationMenu || showPaperSizeMenu || showColumnsMenu || 
    showBreaksMenu || showHeaderFooterMenu || showPageNumberMenu || showColorPicker || 
    showHighlightPicker || showParagraphShadingMenu || showSpacingMenu || 
    showParagraphSpacingMenu || showTextEffectsMenu || showArabicMarksMenu || 
    showDirectionMenu || showBorderMenu || showWatermarkMenu || showStampsMenu || 
    showTablePicker || showThemeMenu || showDocumentListMenu || showShapesMenu || 
    showSymbolsMenu || showLayoutMarginsMenu || showLayoutSpacingMenu || 
    showLayoutParagraphSpacingMenu || showLayoutPaperSizeMenu || showLayoutColumnsMenu || 
    showGradientMenu || showAllPaperSizesModal || showFileMenuDrawer || showOtherFormatsMenu
  );

  useEffect(() => {
    if (!isAnyDropdownOpen) return;
    const handleOutsideClick = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.home-ribbon-popover, .home-ribbon-trigger, .ribbon-popover, select, input, button, [role="button"]')) {
        return;
      }
      closeAllDropdowns();
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isAnyDropdownOpen]);

  const getDocStats = () => {
    const cleanText = docState.contentHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanText ? cleanText.split(/\s+/).length : 0;
    const charsWithSpaces = cleanText.length;
    const charsNoSpaces = cleanText.replace(/\s/g, '').length;
    const paragraphs = (docState.contentHtml.match(/<(p|h[1-6]|li|div)[^>]*>/gi) || []).length || 1;
    const estimatedPages = Math.max(1, Math.ceil(words / 300));
    const readingTimeMin = Math.max(1, Math.ceil(words / 200));
    const approxSizeKb = Math.max(1, Math.round(new Blob([docState.contentHtml]).size / 1024));

    return {
      words,
      charsWithSpaces,
      charsNoSpaces,
      paragraphs,
      estimatedPages,
      readingTimeMin,
      approxSizeKb,
    };
  };

  const handleExportMarkdown = () => {
    const text = docState.contentHtml
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    const clean = text.replace(/<[^>]*>/g, '');
    const blob = new Blob(['\ufeff', clean], { type: 'text/markdown;charset=utf-8' });
    const rawTitle = docState.title.replace(/\.(docx|doc|html|txt|md)$/i, '');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rawTitle}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePerformSave = async () => {
    onSaveDocument();
    try {
      // 1. Update saved documents library
      const deviceDocs = JSON.parse(localStorage.getItem('office_saved_device_documents') || '[]');
      const cleanName = docState.title.replace(/\.(docx|doc|html|txt|pdf)$/i, '');
      const existingIdx = deviceDocs.findIndex((d: any) => d.title === docState.title || d.name === cleanName);
      const newEntry = {
        title: docState.title.endsWith('.docx') ? docState.title : `${docState.title}.docx`,
        name: cleanName,
        format: 'docx',
        folder: 'Documents',
        storage: 'مساحة تخزين الجهاز',
        date: new Date().toISOString(),
        mode: 'word',
      };
      if (existingIdx >= 0) {
        deviceDocs[existingIdx] = newEntry;
      } else {
        deviceDocs.unshift(newEntry);
      }
      localStorage.setItem('office_saved_device_documents', JSON.stringify(deviceDocs.slice(0, 50)));

      // 2. Download genuine .docx file directly to device
      await exportWordAsDocx(docState);
    } catch (e) {
      console.error('Save error:', e instanceof Error ? e.message : String(e));
    }
    setSaveSuccessNotification(true);
    setTimeout(() => setSaveSuccessNotification(false), 3500);
  };

  // Helper calculations for Margins and Spacing matching the screenshots
  const currentVerticalMargin = (() => {
    if (docState.margins === 'custom' && docState.customMargins) {
      return Number(docState.customMargins.top) || 0.2;
    }
    switch (docState.margins) {
      case 'minimum': return 0.2;
      case 'ultra-narrow': return 0.5;
      case 'narrow': return 1.27;
      case 'moderate': return 2.54;
      case 'wide': return 2.54;
      case 'normal':
      default: return 2.54;
    }
  })();

  const currentSideMargin = (() => {
    if (docState.margins === 'custom' && docState.customMargins) {
      return Number(docState.customMargins.right) || 0.4;
    }
    switch (docState.margins) {
      case 'minimum': return 0.2;
      case 'ultra-narrow': return 0.5;
      case 'narrow': return 1.27;
      case 'moderate': return 1.9;
      case 'wide': return 3.81;
      case 'normal':
      default: return 2.54;
    }
  })();

  const handleUpdateVerticalMargin = (val: number) => {
    const clamped = Math.max(0.1, Math.min(5.0, Math.round(val * 100) / 100));
    onUpdateDoc({
      margins: 'custom',
      customMargins: {
        top: clamped,
        bottom: clamped,
        left: currentSideMargin,
        right: currentSideMargin,
      },
    });
  };

  const handleUpdateSideMargin = (val: number) => {
    const clamped = Math.max(0.1, Math.min(5.0, Math.round(val * 100) / 100));
    onUpdateDoc({
      margins: 'custom',
      customMargins: {
        top: currentVerticalMargin,
        bottom: currentVerticalMargin,
        left: clamped,
        right: clamped,
      },
    });
  };

  const currentLineSpacing = docState.lineSpacing || 1.05;

  const handleUpdateLineSpacing = (val: number) => {
    const clamped = Math.max(0.1, Math.min(3.0, Math.round(val * 100) / 100));
    onUpdateDoc({ lineSpacing: clamped });
  };

  // 1. Full Word Ribbon Tabs with separated "تصميم" and "تخطيط الصفحة"
  const tabs: { id: WordRibbonTab; label: string; badge?: string }[] = [
    { id: 'file', label: 'المستندات', badge: 'PRO' },
    { id: 'home', label: 'الرئيسية' },
    { id: 'insert', label: 'إدراج' },
    { id: 'design', label: 'تصميم' },
    { id: 'layout', label: 'تخطيط الصفحة' },
    { id: 'options', label: 'خيارات' },
    { id: 'view', label: 'عرض' },
  ];

  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 48, 72];
  const lineSpacings = [0.5, 1.0, 1.15, 1.3, 1.5, 1.8, 2.0, 2.5, 3.0];
  const wordSpacings = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0];
  const colors = [
    '#000000', '#1e293b', '#334155', '#475569', '#64748b', 
    '#1e3a8a', '#1d4ed8', '#0284c7', '#0891b2', '#065f46', 
    '#16a34a', '#65a30d', '#b45309', '#ea580c', '#dc2626', 
    '#991b1b', '#581c87', '#7c3aed', '#db2777', '#ffffff'
  ];
  
  // 15 Standard Word Highlight Colors matching user screenshot
  const highlightColors = [
    '#ffff00', // أصفر فاقع
    '#00ff00', // أخضر ناصع
    '#00ffff', // تركواز / سماوي
    '#ff00ff', // وردي فاقع
    '#0000ff', // أزرق ساطع
    '#ff0000', // أحمر ساطع
    '#000080', // أزرق كحلي داكن
    '#008080', // تركواز بترولي
    '#008000', // أخضر غامق
    '#800080', // بنفسجي أرجواني
    '#800000', // عنابي داكن
    '#808000', // خردلي / زيتوني
    '#808080', // رمادي متوسط
    '#c0c0c0', // فضي فاتح
    '#000000', // أسود
    'transparent', // بلا لون تمييز
  ];

  // Visual Text Effects matching "تأثيرات النصوص .jpg"
  const textEffectsList = [
    {
      id: 'shadow_3d',
      name: 'ظل ثلاثي الأبعاد 3D (ظل بارز)',
      style: 'text-shadow: 2px 2px 0px #94a3b8, 4px 4px 0px #cbd5e1; font-weight: bold;',
    },
    {
      id: 'gold_glow',
      name: 'توهج ذهبي فاخر (توهج ذهبي)',
      style: 'text-shadow: 0 0 8px #f59e0b, 0 0 16px #fbbf24; color: #78350f; font-weight: bold;',
    },
    {
      id: 'neon_blue',
      name: 'توهج أزرق نيون (توهج سماوي)',
      style: 'text-shadow: 0 0 8px #3b82f6, 0 0 16px #60a5fa; color: #1e3a8a; font-weight: bold;',
    },
    {
      id: 'bold_outline',
      name: 'تحديد خارجي عريض (تحديد داكن)',
      style: '-webkit-text-stroke: 1px #0f172a; color: #ffffff; font-weight: 900;',
    },
    {
      id: 'soft_emboss',
      name: 'نقش محفور هادئ (نقش هادئ)',
      style: 'text-shadow: 1px 1px 1px #ffffff, -1px -1px 1px #94a3b8; color: #475569; font-weight: bold;',
    },
  ];

  // Text Gradient Presets matching "تدرج لوني .jpg"
  const gradientPresets = [
    {
      id: 'navy_royal',
      name: 'كحلي ملكي أزرق',
      gradient: 'linear-gradient(90deg, #1e3a8a, #2563eb, #60a5fa)',
    },
    {
      id: 'gold_royal',
      name: 'ذهبي ديواني فاخر',
      gradient: 'linear-gradient(90deg, #b45309, #d97706, #fbbf24)',
    },
    {
      id: 'emerald_islamic',
      name: 'زمردي رسمي إسلامي',
      gradient: 'linear-gradient(90deg, #065f46, #059669, #34d399)',
    },
    {
      id: 'ruby_red',
      name: 'ياقوتي ملكي أحمر',
      gradient: 'linear-gradient(90deg, #881337, #dc2626, #f87171)',
    },
    {
      id: 'purple_tech',
      name: 'بنفسجي تقني حديث',
      gradient: 'linear-gradient(90deg, #4c1d95, #7c3aed, #a78bfa)',
    },
  ];

  // Official Borders List matching "إطارات المستند .jpg"
  const borderStylesList = [
    { id: 'royal', label: 'إطار أندلسي ملكي مزخرف (زوايا عربية مذهبة وكحلية كما في المذكرات)' },
    { id: 'court', label: 'إطار مذكرات المحاكم والدعاوى القضائية (رسمي معتمد)' },
    { id: 'islamic', label: 'إطار زخرفي إسلامي ديواني (مع حليات الرأس والتذييل ❖)' },
    { id: 'certificate', label: 'إطار شهادات التقدير والوثائق المعتمدة (Certificate)' },
    { id: 'double', label: 'إطار أزرق كحلي مزدوج (Double Navy) النمط الرسمي المعتمد' },
    { id: 'triple', label: 'إطار ثلاثي الخطوط فاخر (Triple Line)' },
    { id: 'gold', label: 'إطار ذهبي فاخر (للشهادات والوثائق التقديرية)' },
    { id: 'classic', label: 'إطار رفيع كلاسيكي (بسيط وهادئ لجميع الأغراض)' },
    { id: 'dashed', label: 'إطار مقطع / منقط (Dashed Line)' },
    { id: 'shadow', label: 'إطار مجسم مع ظل (3D Shadow Box)' },
    { id: 'single', label: 'إطار خط فردي بسيط (1pt Simple Line)' },
    { id: 'none', label: 'بدون إطار (صفحة حرة بدون حدود)' },
  ];

  // Quick style preset cards matching Screenshot 1 & 2
  

  const handleInsertOfficialStamp = (type: 'court' | 'approved' | 'signature') => {
    setShowStampsMenu(false);
    if (type === 'court') {
      const html = `
        <div style="display: inline-block; border: 2px double #1e3a8a; border-radius: 50%; width: 130px; height: 130px; text-align: center; padding: 12px; margin: 10px; color: #1e3a8a; font-family: 'Amiri', serif; vertical-align: middle; box-shadow: inset 0 0 0 1px #1e3a8a; transform: rotate(-5deg); background: rgba(239, 246, 255, 0.4);">
          <div style="font-size: 10px; font-weight: bold; border-bottom: 1px solid #1e3a8a; padding-bottom: 2px;">الجمهورية اليمنية</div>
          <div style="font-size: 11px; font-weight: bold; margin-top: 4px;">وزارة العدل</div>
          <div style="font-size: 12px; font-weight: 900; margin: 3px 0;">محكمة القفر</div>
          <div style="font-size: 9px; font-weight: bold; border-top: 1px solid #1e3a8a; padding-top: 2px;">قلم التوثيق الشرعي</div>
        </div>
      `;
      onExecCommand('insertHTML', html);
    } else if (type === 'approved') {
      const html = `
        <div style="display: inline-block; border: 2px solid #047857; border-radius: 8px; padding: 8px 16px; margin: 8px; color: #047857; font-weight: bold; text-align: center; transform: rotate(2deg); background: #ecfdf5;">
          <div style="font-size: 13px;">✓ صودق عليه بموجب الأصول</div>
          <div style="font-size: 10px; color: #065f46; margin-top: 2px;">سجل رسمي رقم: ${Math.floor(1000 + Math.random() * 9000)} / لسنة 1446هـ</div>
        </div>
      `;
      onExecCommand('insertHTML', html);
    } else if (type === 'signature') {
      const html = `
        <div style="display: flex; gap: 24px; margin: 20px 0; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 12px;">
          <div style="flex: 1;">
            <div style="font-weight: bold; font-size: 12px;">المقر بما فيه (الطرف الأول):</div>
            <div style="height: 50px; border: 1px dashed #cbd5e1; margin-top: 6px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 11px;">(البصمة والتوقيع)</div>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: bold; font-size: 12px;">توقيع الكاتب والأمين الشرعي:</div>
            <div style="height: 50px; border: 1px dashed #cbd5e1; margin-top: 6px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 11px;">(المصادقة والتوقيع)</div>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: bold; font-size: 12px;">خاتم وتوقيع رئيس المحكمة:</div>
            <div style="height: 50px; border: 1px dashed #cbd5e1; margin-top: 6px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 11px;">(الختم الرسمي)</div>
          </div>
        </div>
      `;
      onExecCommand('insertHTML', html);
    }
  };

  const handleFindReplace = () => {
    if (!searchQuery) return;
    const editor = document.getElementById('word-body-editable');
    if (!editor) return;

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      textNodes.push(currentNode as Text);
      currentNode = walker.nextNode();
    }

    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    textNodes.forEach((node) => {
      if (node.nodeValue && regex.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(regex, replaceQuery);
      }
    });

    onUpdateDoc({ contentHtml: editor.innerHTML });
    setShowFindModal(false);
  };

  return (
    <div className="relative z-40 bg-white border-b border-slate-300 select-none no-print shadow-2xs overflow-visible" dir="rtl">
      {/* 1. Tab Bar - Reduced to exact 0.5cm height (28px) */}
      <div className="h-[28px] max-h-[28px] min-h-[28px] flex items-center justify-between px-2 border-b border-slate-200 overflow-x-auto bg-[#f8fafc] text-xs">
        <div className="flex items-center h-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`h-[27px] px-2.5 font-semibold text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 ${
                  isActive
                    ? 'text-blue-700 bg-white font-bold border-t-2 border-t-blue-600 border-x border-slate-300 shadow-2xs -mb-px'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-200/50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status Indicators & Right-side Actions */}
        <div className="flex items-center gap-2 pr-2">
          {/* Quick Orientation Switcher */}
          <button
            onClick={() => onUpdateDoc({ orientation: docState.orientation === 'landscape' ? 'portrait' : 'landscape' })}
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border shadow-2xs transition active:scale-95 ${
              docState.orientation === 'landscape'
                ? 'bg-blue-50 border-blue-400 text-blue-700'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
            }`}
            title="تبديل اتجاه الصفحة الفعلي (عمودي ↕ / أفقي ↔)"
          >
            <span>{docState.orientation === 'landscape' ? 'أفقي ↔' : 'عمودي ↕'}</span>
          </button>

          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>محفوظ تلقائياً ✓</span>
          </div>

          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-[10px] shadow-2xs transition active:scale-95 border border-amber-400"
              title="محاكاة واختبار مستند وورد"
            >
              <Sparkles className="w-3 h-3 text-slate-950" />
              <span>محاكاة المستند 🚀</span>
            </button>
          )}

          <button
            onClick={() => setIsRibbonCollapsed(!isRibbonCollapsed)}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
            title={isRibbonCollapsed ? "إظهار شريط الأدوات" : "تصغير شريط الأدوات"}
          >
            {isRibbonCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* 2. Toolbar Row - Smooth Scrollable with Dedicated Side Chevrons (No Layer Overlap) */}
      {!isRibbonCollapsed && (
        <div className="flex items-center bg-[#f8fafc] border-b border-slate-300/80 w-full overflow-hidden">
          {/* Right Scroll Chevron */}
          <button
            type="button"
            onClick={() => handleScrollBy(250)}
            className="h-full px-1.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 border-l border-slate-300 shrink-0 transition cursor-pointer"
            title="تمرير الشريط لليمين"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            ref={toolbarScrollRef}
            className="min-h-[34px] px-2 py-0.5 flex items-center gap-1.5 bg-[#f8fafc] text-slate-800 text-xs w-full overflow-x-auto scrollbar-none touch-pan-x"
            style={{ scrollbarWidth: 'none' }}
          >
          
          {/* ================= HOME TAB (الرئيسية) ================= */}
          {activeTab === 'home' && (
            <WordHomeTab
              docState={docState}
              onUpdateDoc={onUpdateDoc}
              onExecCommand={onExecCommand}
              onOpenFontGallery={() => setShowFontGalleryModal(true)}
              onOpenFindReplace={(m) => {
                if (m === 'replace') {
                  setReplaceQuery('');
                }
                setShowFindModal(true);
              }}
              onOpenSaveStyle={() => setShowSaveStyleModal(true)}
              onAddNewPage={onAddNewPage}
              onInsertPageBreak={onInsertPageBreak}
              onInsertTable={onInsertTable}
              customStyles={customStyles}
              onApplyCustomStyle={applyCustomStyle}
              formatPainterActive={formatPainterActive}
              onToggleFormatPainter={handleToggleFormatPainter}
              onApplyFormatPainter={applyFormatPainterToSelection}
            />
          )}

          {/* ================= INSERT TAB (إدراج) ================= */}
          {activeTab === 'insert' && (
            <div className="flex items-center gap-2 flex-nowrap shrink-0 relative overflow-visible">
              
              {/* Pages & Breaks Group (إضافة صفحة جديدة وفاصل صفحات آلي) */}
              <div className="flex items-center bg-white border border-slate-300 rounded h-[26px] p-0.5 shadow-2xs gap-0.5">
                <button
                  type="button"
                  onClick={() => onAddNewPage ? onAddNewPage('end') : onInsertPageBreak?.()}
                  className="flex items-center gap-1 px-2 h-full bg-blue-50 hover:bg-blue-100 text-blue-900 rounded font-bold text-[11px] transition cursor-pointer"
                  title="إضافة صفحة جديدة ضمن المستند مع فاصل صفحات تلقائي"
                >
                  <FilePlus className="w-3.5 h-3.5 text-blue-600" />
                  <span>إضافة صفحة جديدة 📄➕</span>
                </button>

                <div className="w-px h-3.5 bg-slate-200 mx-0.5" />

                <button
                  type="button"
                  onClick={onInsertPageBreak}
                  className="flex items-center gap-1 px-2 h-full hover:bg-indigo-50 text-indigo-900 rounded font-bold text-[11px] transition cursor-pointer"
                  title="إدراج فاصل صفحات آلي في الموضع الحالي (Ctrl + Enter)"
                >
                  <Scissors className="w-3.5 h-3.5 text-indigo-600 rotate-90" />
                  <span>فاصل صفحات ⎘</span>
                </button>
              </div>

              <div className="w-px h-4 bg-slate-300 mx-0.5" />

              {/* Insert Table */}
              <div className="relative">
                <button
                  onClick={() => setShowTablePicker(!showTablePicker)}
                  className="flex items-center gap-1 px-2 h-[26px] bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 rounded font-bold text-[11px] shadow-2xs cursor-pointer"
                >
                  <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>إدراج جدول</span>
                  <ChevronDown className="w-2.5 h-2.5 text-blue-400" />
                </button>

                {showTablePicker && (
                  <div className="absolute top-full mt-1.5 right-0 bg-white p-2 rounded-lg shadow-2xl border border-slate-300 z-[100] w-48 animate-in fade-in slide-in-from-top-1">
                    <div className="font-bold text-slate-700 text-xs pb-1 border-b mb-2">إدراج جدول:</div>
                    <div className="grid gap-1">
                      {Array.from({ length: 8 }).map((_, r) => (
                        <div key={r} className="flex gap-1">
                          {Array.from({ length: 10 }).map((_, c) => (
                            <div
                              key={c}
                              className={`w-4 h-4 border border-slate-300 rounded-xs cursor-pointer ${
                                r <= (tableRows - 1) && c <= (tableCols - 1) ? 'bg-blue-500' : 'bg-slate-50 hover:bg-blue-200'
                              }`}
                              onMouseEnter={() => {
                                setTableRows(r + 1);
                                setTableCols(c + 1);
                              }}
                              onClick={() => {
                                onInsertTable(r + 1, c + 1);
                                setShowTablePicker(false);
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-[10px] text-slate-500 mt-2 font-bold">
                      {tableRows} × {tableCols}
                    </div>
                  </div>
                )}
              </div>

              {/* Merged Table Tools Section with Cell Size & Formatting Controls */}
              <div className="flex items-center bg-white border border-slate-300 rounded h-[26px] p-0.5 shadow-2xs gap-0.5">
                <span className="text-[10px] font-bold text-blue-700 px-1 border-l border-slate-200">الجدول:</span>
                
                {/* Cell Width */}
                <button
                  onClick={() => onTableAction && onTableAction('cellWidthPlus')}
                  className="px-1.5 h-full hover:bg-blue-50 text-blue-800 rounded text-[10px] font-bold"
                  title="زيادة عرض الخلية / العمود"
                >
                  عرض +
                </button>
                <button
                  onClick={() => onTableAction && onTableAction('cellWidthMinus')}
                  className="px-1.5 h-full hover:bg-blue-50 text-blue-800 rounded text-[10px] font-bold"
                  title="إنقاص عرض الخلية / العمود"
                >
                  عرض -
                </button>

                <div className="w-px h-3.5 bg-slate-200 mx-0.5" />

                {/* Cell Height */}
                <button
                  onClick={() => onTableAction && onTableAction('cellHeightPlus')}
                  className="px-1.5 h-full hover:bg-indigo-50 text-indigo-800 rounded text-[10px] font-bold"
                  title="زيادة ارتفاع الخلية / الصف"
                >
                  ارتفاع +
                </button>
                <button
                  onClick={() => onTableAction && onTableAction('cellHeightMinus')}
                  className="px-1.5 h-full hover:bg-indigo-50 text-indigo-800 rounded text-[10px] font-bold"
                  title="إنقاص ارتفاع الخلية / الصف"
                >
                  ارتفاع -
                </button>

                <div className="w-px h-3.5 bg-slate-200 mx-0.5" />

                {/* Distribute */}
                <button
                  onClick={() => onTableAction && onTableAction('distributeCols')}
                  className="px-1.5 h-full hover:bg-slate-100 rounded text-slate-700 text-[10px]"
                  title="توزيع الأعمدة بالتساوي"
                >
                  تساوي الأعمدة
                </button>
                <button
                  onClick={() => onTableAction && onTableAction('distributeRows')}
                  className="px-1.5 h-full hover:bg-slate-100 rounded text-slate-700 text-[10px]"
                  title="توزيع الصفوف بالتساوي"
                >
                  تساوي الصفوف
                </button>

                <div className="w-px h-3.5 bg-slate-200 mx-0.5" />

                {/* Cell Shading & Borders */}
                <button
                  onClick={() => onTableAction && onTableAction('setCellBg', '#f1f5f9')}
                  className="px-1.5 h-full hover:bg-amber-50 text-amber-900 rounded text-[10px] font-medium"
                  title="تظليل رمادي خفيف للخلية"
                >
                  تظليل
                </button>
                {/* Table Borders Customization Menu & Popover */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTableBorderMenu(!showTableBorderMenu);
                    }}
                    className={`flex items-center gap-1 px-2 h-full rounded text-[10px] font-bold transition cursor-pointer ${
                      showTableBorderMenu
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                    }`}
                    title="تخصيص حدود الجدول (اللون، السُمك، أطراف الخلايا)"
                  >
                    <Square className="w-3 h-3 text-blue-600" />
                    <span>حدود الجدول</span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                  </button>

                  {showTableBorderMenu && (
                    <div
                      className="absolute top-full mt-1.5 right-0 bg-white rounded-xl shadow-2xl border border-slate-300 p-3 z-[160] w-80 space-y-3 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 text-right"
                      dir="rtl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                          <Square className="w-4 h-4 text-blue-600" />
                          <span>تخصيص حدود الجدول والخلايا</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowTableBorderMenu(false)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 1. Target Scope */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-600">نطاق التطبيق:</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTableBorderTarget('table')}
                            className={`py-1 px-2 rounded-lg text-[11px] font-bold border transition ${
                              tableBorderTarget === 'table'
                                ? 'bg-blue-50 border-blue-400 text-blue-800'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            كامل الجدول ▦
                          </button>
                          <button
                            type="button"
                            onClick={() => setTableBorderTarget('cell')}
                            className={`py-1 px-2 rounded-lg text-[11px] font-bold border transition ${
                              tableBorderTarget === 'cell'
                                ? 'bg-blue-50 border-blue-400 text-blue-800'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            الخلية المحددة ▫
                          </button>
                        </div>
                      </div>

                      {/* 2. Quick Presets */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-600">قوالب سريعة للحدود:</div>
                        <div className="grid grid-cols-4 gap-1 text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleApplyCustomTableBorder('all')}
                            className="p-1 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded font-medium text-center"
                            title="تطبيق كافة الحدود"
                          >
                            كافة الحدود
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyCustomTableBorder('outside')}
                            className="p-1 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded font-medium text-center"
                            title="حدود خارجية فقط"
                          >
                            إطار خارجي
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyCustomTableBorder('inside')}
                            className="p-1 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded font-medium text-center"
                            title="شبكة داخلية فقط"
                          >
                            شبكة داخلية
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyCustomTableBorder('none')}
                            className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-medium text-center"
                            title="إزالة كافة الحدود"
                          >
                            بلا حدود
                          </button>
                        </div>
                      </div>

                      {/* 3. Interactive Cell Borders Toggle Map */}
                      <div className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <div className="text-[11px] font-bold text-slate-700 text-center">
                          تبديل أطراف الحدود يدوياً:
                        </div>
                        <div className="flex flex-col items-center gap-1 my-1">
                          {/* Top Button */}
                          <button
                            type="button"
                            onClick={() => handleApplyCustomTableBorder('top')}
                            className={`w-32 py-0.5 rounded text-[10px] font-bold border transition ${
                              tableBorderSides.top
                                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                : 'bg-white text-slate-500 border-slate-300'
                            }`}
                          >
                            ▲ الحد العلوي {tableBorderSides.top ? '✓' : '✗'}
                          </button>

                          <div className="flex items-center gap-1">
                            {/* Right Button */}
                            <button
                              type="button"
                              onClick={() => handleApplyCustomTableBorder('right')}
                              className={`h-16 px-1.5 rounded text-[10px] font-bold border flex flex-col items-center justify-center transition ${
                                tableBorderSides.right
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                  : 'bg-white text-slate-500 border-slate-300'
                              }`}
                            >
                              <span>أيمن</span>
                              <span>{tableBorderSides.right ? '✓' : '✗'}</span>
                            </button>

                            {/* Center Preview Box & Internal Lines */}
                            <div className="w-20 h-16 bg-white border border-slate-300 rounded flex flex-col justify-center items-center gap-1 p-1">
                              <button
                                type="button"
                                onClick={() => handleApplyCustomTableBorder('horizontal')}
                                className={`w-full py-0.5 rounded text-[9px] font-semibold border transition ${
                                  tableBorderSides.insideH
                                    ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}
                              >
                                أفقي {tableBorderSides.insideH ? '✓' : '✗'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApplyCustomTableBorder('vertical')}
                                className={`w-full py-0.5 rounded text-[9px] font-semibold border transition ${
                                  tableBorderSides.insideV
                                    ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}
                              >
                                عمودي {tableBorderSides.insideV ? '✓' : '✗'}
                              </button>
                            </div>

                            {/* Left Button */}
                            <button
                              type="button"
                              onClick={() => handleApplyCustomTableBorder('left')}
                              className={`h-16 px-1.5 rounded text-[10px] font-bold border flex flex-col items-center justify-center transition ${
                                tableBorderSides.left
                                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                  : 'bg-white text-slate-500 border-slate-300'
                              }`}
                            >
                              <span>أيسر</span>
                              <span>{tableBorderSides.left ? '✓' : '✗'}</span>
                            </button>
                          </div>

                          {/* Bottom Button */}
                          <button
                            type="button"
                            onClick={() => handleApplyCustomTableBorder('bottom')}
                            className={`w-32 py-0.5 rounded text-[10px] font-bold border transition ${
                              tableBorderSides.bottom
                                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                : 'bg-white text-slate-500 border-slate-300'
                            }`}
                          >
                            ▼ الحد السفلي {tableBorderSides.bottom ? '✓' : '✗'}
                          </button>
                        </div>
                      </div>

                      {/* 4. Border Thickness & Style */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">سُمك الخط:</label>
                          <select
                            value={tableBorderWidth}
                            onChange={(e) => {
                              setTableBorderWidth(e.target.value);
                              if (onTableAction) {
                                onTableAction('customBorder', JSON.stringify({
                                  sides: tableBorderSides,
                                  color: tableBorderColor,
                                  width: e.target.value,
                                  style: tableBorderStyle,
                                  target: tableBorderTarget
                                }));
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1 text-xs font-semibold"
                          >
                            <option value="0.5px">0.5 نقطة (رفيع جداً)</option>
                            <option value="1px">1.0 نقطة (افتراضي)</option>
                            <option value="1.5px">1.5 نقطة (متوسط)</option>
                            <option value="2px">2.0 نقطة (عريض)</option>
                            <option value="3px">3.0 نقطة (سميك)</option>
                            <option value="4px">4.0 نقطة (ثقيل)</option>
                            <option value="6px">6.0 نقطة (مضاعف)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">نمط الخط:</label>
                          <select
                            value={tableBorderStyle}
                            onChange={(e) => {
                              const s = e.target.value as any;
                              setTableBorderStyle(s);
                              if (onTableAction) {
                                onTableAction('customBorder', JSON.stringify({
                                  sides: tableBorderSides,
                                  color: tableBorderColor,
                                  width: tableBorderWidth,
                                  style: s,
                                  target: tableBorderTarget
                                }));
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1 text-xs font-semibold"
                          >
                            <option value="solid">مصمت ————</option>
                            <option value="dashed">متقطع - - - -</option>
                            <option value="dotted">منقط • • • •</option>
                            <option value="double">مزدوج ======</option>
                            <option value="groove">أخدود مجسم</option>
                          </select>
                        </div>
                      </div>

                      {/* 5. Border Color Picker */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-600">لون الحد:</label>
                          <span className="font-mono text-[10px] text-slate-400">{tableBorderColor}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[
                            '#000000', '#334155', '#64748b', '#cbd5e1', 
                            '#1e3a8a', '#2563eb', '#0284c7', '#059669', 
                            '#b45309', '#b91c1c', '#7c3aed'
                          ].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setTableBorderColor(c);
                                if (onTableAction) {
                                  onTableAction('customBorder', JSON.stringify({
                                    sides: tableBorderSides,
                                    color: c,
                                    width: tableBorderWidth,
                                    style: tableBorderStyle,
                                    target: tableBorderTarget
                                  }));
                                }
                              }}
                              style={{ backgroundColor: c }}
                              className={`w-5 h-5 rounded-md border transition ${
                                tableBorderColor === c ? 'ring-2 ring-blue-500 scale-110' : 'border-slate-300'
                              }`}
                            />
                          ))}
                          <input
                            type="color"
                            value={tableBorderColor}
                            onChange={(e) => {
                              setTableBorderColor(e.target.value);
                              if (onTableAction) {
                                onTableAction('customBorder', JSON.stringify({
                                  sides: tableBorderSides,
                                  color: e.target.value,
                                  width: tableBorderWidth,
                                  style: tableBorderStyle,
                                  target: tableBorderTarget
                                }));
                              }
                            }}
                            className="w-6 h-6 p-0 border border-slate-300 rounded cursor-pointer"
                            title="اختيار لون مخصص"
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleApplyCustomTableBorder();
                            setShowTableBorderMenu(false);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>تطبيق الحدود على الجدول</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTableBorderMenu(false)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                        >
                          تم
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-px h-3.5 bg-slate-200 mx-0.5" />

                {/* Rows & Columns */}
                <button
                  onClick={() => onTableAction && onTableAction('insertRowBelow')}
                  className="px-1 h-full hover:bg-slate-100 rounded text-slate-700 text-[10px]"
                  title="إدراج صف لأسفل"
                >
                  +صف
                </button>
                <button
                  onClick={() => onTableAction && onTableAction('insertColRight')}
                  className="px-1 h-full hover:bg-slate-100 rounded text-slate-700 text-[10px]"
                  title="إدراج عمود لليمين"
                >
                  +عمود
                </button>
                <button
                  onClick={() => onTableAction && onTableAction('deleteRow')}
                  className="px-1 h-full hover:bg-rose-50 text-rose-700 rounded text-[10px]"
                  title="حذف الصف الحالي"
                >
                  -صف
                </button>
                <button
                  onClick={() => onTableAction && onTableAction('deleteCol')}
                  className="px-1 h-full hover:bg-rose-50 text-rose-700 rounded text-[10px]"
                  title="حذف العمود الحالي"
                >
                  -عمود
                </button>
              </div>

              <div className="w-px h-4 bg-slate-300 mx-0.5" />

              {/* Insert Image & Controls */}
              <div className="flex items-center bg-white border border-slate-300 rounded h-[26px] p-0.5 shadow-2xs gap-0.5">
                <button
                  onClick={onInsertImage}
                  className="flex items-center gap-1 px-2 h-full hover:bg-emerald-50 rounded text-[11px] font-bold text-emerald-800"
                  title="إدراج صورة جديدة"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>إدراج صورة</span>
                </button>
                
                <div className="w-px h-3.5 bg-slate-200 mx-0.5" />
                <span className="text-[10px] text-slate-500">حجم:</span>
                <button
                  onClick={() => onImageAction && onImageAction('resize', '25%')}
                  className="px-1 h-full hover:bg-slate-100 rounded text-[10px] font-semibold text-slate-700"
                  title="حجم 25%"
                >
                  25%
                </button>
                <button
                  onClick={() => onImageAction && onImageAction('resize', '50%')}
                  className="px-1 h-full hover:bg-slate-100 rounded text-[10px] font-semibold text-slate-700"
                  title="حجم 50%"
                >
                  50%
                </button>
                <button
                  onClick={() => onImageAction && onImageAction('resize', '100%')}
                  className="px-1 h-full hover:bg-slate-100 rounded text-[10px] font-semibold text-slate-700"
                  title="حجم 100% كامل"
                >
                  100%
                </button>

                <div className="w-px h-3.5 bg-slate-200 mx-0.5" />
                <button
                  onClick={() => onImageAction && onImageAction('align', 'right')}
                  className="px-1 h-full hover:bg-slate-100 rounded text-[10px] text-slate-700"
                  title="محاذاة الصورة لليمين"
                >
                  يمين
                </button>
                <button
                  onClick={() => onImageAction && onImageAction('align', 'center')}
                  className="px-1 h-full hover:bg-slate-100 rounded text-[10px] text-slate-700"
                  title="توسيط الصورة"
                >
                  وسط
                </button>
                <button
                  onClick={() => onImageAction && onImageAction('wrap', 'float-right')}
                  className="px-1 h-full hover:bg-slate-100 rounded text-[10px] text-slate-700"
                  title="التفاف النص حول الصورة"
                >
                  التفاف
                </button>
              </div>

              <div className="w-px h-4 bg-slate-300 mx-0.5" />

              {/* AI Proofreader Button */}
              <button
                onClick={onOpenProofreader}
                className="flex items-center gap-1.5 px-2.5 h-[26px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded font-bold text-[11px] shadow-2xs transition"
                title="فحص وتدقيق الأخطاء الإملائية والنحوية باستخدام الذكاء الاصطناعي"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>التدقيق اللغوي 🪄</span>
              </button>

              {/* Official Stamps */}
              <div className="relative">
                <button
                  onClick={() => setShowStampsMenu(!showStampsMenu)}
                  className="flex items-center gap-1 px-2 h-[26px] bg-white hover:bg-amber-50 border border-slate-300 rounded text-[11px] font-bold text-slate-800 shadow-2xs"
                >
                  <Stamp className="w-3.5 h-3.5 text-amber-600" />
                  <span>أختام وتصاديق</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                {showStampsMenu && (
                  <div className="absolute top-full mt-1.5 right-0 bg-white rounded-xl shadow-2xl border border-slate-300 py-1.5 z-[100] w-60 space-y-0.5 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
                    <button
                      onClick={() => handleInsertOfficialStamp('court')}
                      className="w-full text-right px-2.5 py-1.5 hover:bg-blue-50 text-xs font-semibold text-slate-700"
                    >
                      ⚖ ختم محكمة القفر الإبتدائية
                    </button>
                    <button
                      onClick={() => handleInsertOfficialStamp('approved')}
                      className="w-full text-right px-2.5 py-1.5 hover:bg-emerald-50 text-xs font-semibold text-slate-700"
                    >
                      ✓ شارة تصديق ومطابقة شرعية
                    </button>
                    <button
                      onClick={() => handleInsertOfficialStamp('signature')}
                      className="w-full text-right px-2.5 py-1.5 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                    >
                      ✍ خانة تواقيع وبصمات ثلاثية
                    </button>
                  </div>
                )}
              </div>

              {/* Shapes & Symbols Dropdown Menus */}
              {/* Shapes */}
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !showShapesMenu;
                    closeAllDropdowns();
                    setShowShapesMenu(next);
                  }}
                  className="flex items-center gap-1 px-2 h-[26px] bg-white hover:bg-purple-50 border border-slate-300 rounded text-[11px] font-bold text-slate-800 shadow-2xs"
                  title="إدراج أشكال هندسية، مربعات نصية، ومخططات انسيابية"
                >
                  <Shapes className="w-3.5 h-3.5 text-purple-600" />
                  <span>أشكال ورسوم 🔶</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                {showShapesMenu && (
                  <div className="absolute top-full mt-1.5 right-0 bg-white rounded-xl shadow-2xl border border-slate-300 py-2 z-[100] w-64 text-xs space-y-1 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
                    <div className="px-3 pb-1 font-bold text-slate-500 text-[10px] border-b">إدراج أشكال رسمية وتوضيحية</div>
                    {[
                      { id: 'alert', label: 'تنبيه إداري / تحذير ⚠️' },
                      { id: 'quote', label: 'صندوق اقتباس رسمي 💬' },
                      { id: 'flowchart', label: 'مخطط انسيابي توضيحي 🔀' },
                      { id: 'rectangle', label: 'مربع نص تنظيمي ⏹️' },
                    ].map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => {
                          onInsertShape(shape.id);
                          setShowShapesMenu(false);
                        }}
                        className="w-full text-right px-3 py-1.5 hover:bg-purple-50 text-xs font-semibold text-slate-700 flex items-center justify-between transition"
                      >
                        <span>{shape.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Symbols Dropdown (رموز خاصة) */}
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !showSymbolsMenu;
                    closeAllDropdowns();
                    setShowSymbolsMenu(next);
                  }}
                  className="flex items-center gap-1 px-2 h-[26px] bg-white hover:bg-amber-50 border border-slate-300 rounded text-[11px] font-bold text-slate-800 shadow-2xs"
                  title="إدراج رموز رياضية، عملات، وعلامات خاصة"
                >
                  <Sigma className="w-3.5 h-3.5 text-amber-600" />
                  <span>رموز خاصة 🔣</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                {showSymbolsMenu && (
                  <div className="absolute top-full mt-1.5 right-0 bg-white rounded-xl shadow-2xl border border-slate-300 p-3 z-[100] w-68 text-xs ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
                    <div className="font-bold text-slate-500 text-[10px] border-b pb-1 mb-2">إدراج الرموز والعملات والرياضيات</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['±', '×', '÷', '≠', '√', '∞', 'Ω', '∑', '$', '€', '£', '¥', '©', '®', '™', '§', '¶', '•', '«', '»', '←', '↑', '→', '↓'].map((sym, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onInsertSymbol?.(sym);
                            setShowSymbolsMenu(false);
                          }}
                          className="h-8 bg-slate-50 hover:bg-amber-100 border border-slate-200 rounded font-bold text-slate-800 flex items-center justify-center transition text-sm"
                          title={`إدراج رمز ${sym}`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Horizontal Line */}
              <button
                onClick={onInsertLine}
                className="flex items-center gap-1 px-2 h-[26px] bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-bold text-slate-800 shadow-2xs"
              >
                <DividerIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>خط فاصل</span>
              </button>

              {/* Header & Footer Editing Trigger */}
              <button
                onClick={() => {
                  if (onTriggerHeaderEdit) {
                    onTriggerHeaderEdit();
                  } else {
                    const headerEl = document.querySelector('[data-header-area="true"]') as HTMLElement;
                    headerEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    headerEl?.click();
                  }
                }}
                className="flex items-center gap-1 px-2 h-[26px] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded font-bold text-[11px] shadow-2xs"
              >
                <span>تحرير رأس وتذييل 📄</span>
              </button>

              {/* Page Numbering Dynamic Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !showPageNumberMenu;
                    closeAllDropdowns();
                    setShowPageNumberMenu(next);
                  }}
                  className={`flex items-center gap-1 px-2 h-[26px] rounded text-[11px] font-bold shadow-2xs transition ${
                    docState.pageNumbering?.enabled !== false
                      ? 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900'
                      : 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-700'
                  }`}
                  title="خيارات ترقيم الصفحات الديناميكية"
                >
                  <Hash className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ترقيم الصفحات</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                {showPageNumberMenu && (
                  <div className="absolute top-full mt-1.5 right-0 bg-white rounded-xl shadow-2xl border border-slate-300 py-2 z-[100] w-72 space-y-2 animate-in fade-in slide-in-from-top-1 text-right ring-1 ring-black/5" dir="rtl">
                    <div className="px-3 pb-1 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-emerald-600" />
                        إعدادات ترقيم الصفحات
                      </span>
                      <button
                        onClick={() => {
                          const isEnabled = docState.pageNumbering?.enabled !== false;
                          onUpdateDoc({
                            pageNumbering: {
                              ...(docState.pageNumbering || { position: 'bottom-center', format: 'page_x_of_y' }),
                              enabled: !isEnabled,
                            },
                          });
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                          docState.pageNumbering?.enabled !== false
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {docState.pageNumbering?.enabled !== false ? 'مفعل ✓' : 'معطل ✕'}
                      </button>
                    </div>

                    {/* Position Selector */}
                    <div className="px-3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">موضع رقم الصفحة:</label>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        {[
                          { id: 'bottom-center', label: 'أسفل الوسط (افتراضي)' },
                          { id: 'bottom-right', label: 'أسفل اليمين' },
                          { id: 'bottom-left', label: 'أسفل اليسار' },
                          { id: 'top-center', label: 'أعلى الوسط (في الرأس)' },
                          { id: 'top-right', label: 'أعلى اليمين (في الرأس)' },
                          { id: 'top-left', label: 'أعلى اليسار (في الرأس)' },
                        ].map((pos) => (
                          <button
                            key={pos.id}
                            onClick={() => {
                              onUpdateDoc({
                                pageNumbering: {
                                  ...(docState.pageNumbering || { format: 'page_x_of_y' }),
                                  enabled: true,
                                  position: pos.id as any,
                                },
                              });
                            }}
                            className={`px-2 py-1 rounded text-right transition truncate ${
                              (docState.pageNumbering?.position || 'bottom-center') === pos.id
                                ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Format Selector */}
                    <div className="px-3 pt-1 border-t border-slate-100">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">نمط وصيغة الترقيم:</label>
                      <div className="space-y-0.5 text-xs">
                        {[
                          { id: 'page_x_of_y', label: 'صفحة X من Y', example: 'صفحة 1 من 3' },
                          { id: 'x_of_y', label: 'X من Y', example: '1 من 3' },
                          { id: 'x_slash_y', label: 'X / Y', example: '1 / 3' },
                          { id: 'dash_x_dash', label: '– X – (كلاسيكي)', example: '– 1 –' },
                          { id: 'arabic_indic', label: 'أرقام مشرقية (هندية)', example: 'صفحة ١ من ٣' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            onClick={() => {
                              onUpdateDoc({
                                pageNumbering: {
                                  ...(docState.pageNumbering || { position: 'bottom-center' }),
                                  enabled: true,
                                  format: fmt.id as any,
                                },
                              });
                              setShowPageNumberMenu(false);
                            }}
                            className={`w-full px-2 py-1 rounded flex items-center justify-between text-right transition ${
                              (docState.pageNumbering?.format || 'page_x_of_y') === fmt.id
                                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="text-[11px]">{fmt.label}</span>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1 rounded">{fmt.example}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Link */}
              <button
                onClick={onInsertLink}
                className="flex items-center gap-1 px-2 h-[26px] bg-white hover:bg-blue-50 border border-slate-300 rounded text-[11px] font-bold text-slate-800 shadow-2xs"
              >
                <Link2 className="w-3.5 h-3.5 text-blue-500" />
                <span>رابط تشعبي</span>
              </button>
            </div>
          )}

          {/* ================= LAYOUT & DESIGN TAB (تخطيط وتصميم) ================= */}
          {(activeTab === 'layout_design' || activeTab === 'layout') && (
            <div className="flex items-center gap-2 flex-nowrap shrink-0 overflow-visible py-0.5 relative z-30">
              {/* 1. Margins Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => toggleLayoutMenu('margins', e)}
                  className={`flex items-center gap-1.5 px-2.5 h-[28px] border rounded-lg text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer ${
                    activeLayoutMenu?.id === 'margins'
                      ? 'bg-blue-50 border-blue-400 text-blue-800'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                  title="هوامش ومسافات الصفحة (Margins)"
                >
                  <Layout className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-blue-700">هوامش:</span>
                  <span className="text-slate-600 font-normal">جانبي {currentSideMargin} سم</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600 font-normal">علوي/سفلي {currentVerticalMargin} سم</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </button>

                {activeLayoutMenu?.id === 'margins' && (
                  <div
                    style={getDropdownFixedStyle(activeLayoutMenu?.rect, 380)}
                    className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-3.5 z-[150] text-xs max-h-[85vh] overflow-y-auto space-y-3 animate-in fade-in slide-in-from-top-1 text-right ring-1 ring-black/5"
                    dir="rtl"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                        <Layout className="w-4 h-4 text-blue-600" />
                        <span>هوامش ومسافات الصفحة (Margins)</span>
                      </div>
                      <div className="flex items-center gap-1.5" dir="ltr">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold px-2 py-0.5 rounded-lg text-[10px]">
                          {currentVerticalMargin} ↕ سم
                        </span>
                        <span className="bg-blue-50 text-blue-700 border border-blue-300 font-bold px-2 py-0.5 rounded-lg text-[10px]">
                          {currentSideMargin} ↔ سم
                        </span>
                      </div>
                    </div>

                    {/* Section 1: Presets */}
                    <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-2.5 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-700 mb-1">
                        النماذج القياسية الجاهزة:
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            onUpdateDoc({
                              margins: 'normal',
                              customMargins: { top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 },
                            });
                            setActiveLayoutMenu(null);
                          }}
                          className={`text-right p-2 rounded-lg border flex flex-col justify-between transition cursor-pointer ${
                            docState.margins === 'normal'
                              ? 'bg-blue-50/90 border-blue-400 text-blue-900 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px]">عادي (Normal)</span>
                            {docState.margins === 'normal' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                          <span className="text-[9px] text-slate-500">2.54 سم من كل الجهات</span>
                        </button>

                        <button
                          onClick={() => {
                            onUpdateDoc({
                              margins: 'narrow',
                              customMargins: { top: 1.27, bottom: 1.27, left: 1.27, right: 1.27 },
                            });
                            setActiveLayoutMenu(null);
                          }}
                          className={`text-right p-2 rounded-lg border flex flex-col justify-between transition cursor-pointer ${
                            docState.margins === 'narrow'
                              ? 'bg-blue-50/90 border-blue-400 text-blue-900 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px]">ضيق (Narrow)</span>
                            {docState.margins === 'narrow' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                          <span className="text-[9px] text-slate-500">1.27 سم من كل الجهات</span>
                        </button>

                        {/* Columns Selector */}
                        <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-2.5 mb-2 space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-700 mb-1">
                            أعمدة الصفحة (Columns):
                          </div>
                          <div className="flex gap-2">
                            {[1, 2, 3].map((col) => (
                              <button
                                key={col}
                                onClick={() => {
                                  applyColumns(col);
                                  setActiveLayoutMenu(null);
                                }}
                                className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition ${
                                  (parseInt(docState.columnCount?.toString() || '1') === col)
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white border-slate-200 hover:bg-blue-50 text-slate-700'
                                }`}
                              >
                                {col === 1 ? 'عمود 1' : `${col} أعمدة`}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onUpdateDoc({
                              margins: 'moderate',
                              customMargins: { top: 2.54, bottom: 2.54, left: 1.9, right: 1.9 },
                            });
                            setActiveLayoutMenu(null);
                          }}
                          className={`text-right p-2 rounded-lg border flex flex-col justify-between transition cursor-pointer ${
                            docState.margins === 'moderate'
                              ? 'bg-blue-50/90 border-blue-400 text-blue-900 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px]">متوسط (Moderate)</span>
                            {docState.margins === 'moderate' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                          <span className="text-[9px] text-slate-500">علوي 2.54 | جانبي 1.9 سم</span>
                        </button>

                        <button
                          onClick={() => {
                            onUpdateDoc({
                              margins: 'wide',
                              customMargins: { top: 2.54, bottom: 2.54, left: 3.81, right: 3.81 },
                            });
                            setActiveLayoutMenu(null);
                          }}
                          className={`text-right p-2 rounded-lg border flex flex-col justify-between transition cursor-pointer ${
                            docState.margins === 'wide'
                              ? 'bg-blue-50/90 border-blue-400 text-blue-900 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px]">عريض (Wide)</span>
                            {docState.margins === 'wide' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                          <span className="text-[9px] text-slate-500">علوي 2.54 | جانبي 3.81 سم</span>
                        </button>

                        <button
                          onClick={() => {
                            onUpdateDoc({
                              margins: 'minimum',
                              customMargins: { top: 0.2, bottom: 0.2, left: 0.2, right: 0.2 },
                            });
                            setActiveLayoutMenu(null);
                          }}
                          className={`text-right p-2 rounded-lg border flex flex-col justify-between transition cursor-pointer ${
                            docState.margins === 'minimum'
                              ? 'bg-blue-50/90 border-blue-400 text-blue-900 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px]">الحد الأدنى (0.2 سم)</span>
                            {docState.margins === 'minimum' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                          <span className="text-[9px] text-slate-500">0.2 سم لجميع الجهات</span>
                        </button>

                        <button
                          onClick={() => {
                            onUpdateDoc({
                              margins: 'ultra-narrow',
                              customMargins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
                            });
                            setActiveLayoutMenu(null);
                          }}
                          className={`text-right p-2 rounded-lg border flex flex-col justify-between transition cursor-pointer ${
                            docState.margins === 'ultra-narrow'
                              ? 'bg-blue-50/90 border-blue-400 text-blue-900 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px]">ضيق جداً (0.5 سم)</span>
                            {docState.margins === 'ultra-narrow' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                          <span className="text-[9px] text-slate-500">0.5 سم لجميع الجهات</span>
                        </button>
                      </div>
                    </div>

                    {/* Section 2: Vertical Margins */}
                    <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between text-emerald-900 font-bold text-[11px]">
                        <span>↕ الهوامش العلوية والسفلية (أعلى وأسفل): 0.1 - 5.0 سم</span>
                      </div>

                      <div className="px-1">
                        <input
                          type="range"
                          min="0.1"
                          max="5.0"
                          step="0.05"
                          value={currentVerticalMargin}
                          onChange={(e) => handleUpdateVerticalMargin(parseFloat(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-emerald-200 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] text-emerald-700 mt-1 font-semibold" dir="ltr">
                          <span>0.1 سم</span>
                          <span>1.27 سم</span>
                          <span>2.54 سم</span>
                          <span>5.0 سم</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-1" dir="ltr">
                        <button
                          onClick={() => handleUpdateVerticalMargin(currentVerticalMargin - 0.1)}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                        >
                          - 0.1 سم
                        </button>
                        <div className="px-3 py-1 bg-white border border-emerald-300 text-emerald-900 rounded font-bold text-xs min-w-[75px] text-center shadow-inner">
                          {currentVerticalMargin} سم
                        </div>
                        <button
                          onClick={() => handleUpdateVerticalMargin(currentVerticalMargin + 0.1)}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                        >
                          + 0.1 سم
                        </button>
                      </div>

                      <div className="grid grid-cols-5 gap-1" dir="ltr">
                        {[0.1, 0.5, 1.0, 1.27, 1.5, 2.0, 2.54, 3.0, 4.0, 5.0].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleUpdateVerticalMargin(val)}
                            className={`py-1 text-center font-bold text-[10px] rounded border transition cursor-pointer ${
                              Math.abs(currentVerticalMargin - val) < 0.05
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Section 3: Side Margins */}
                    <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between text-blue-900 font-bold text-[11px]">
                        <span>↔ الهوامش الجانبية (يمين ويسار): 0.1 - 5.0 سم</span>
                      </div>

                      <div className="px-1">
                        <input
                          type="range"
                          min="0.1"
                          max="5.0"
                          step="0.05"
                          value={currentSideMargin}
                          onChange={(e) => handleUpdateSideMargin(parseFloat(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-blue-200 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] text-blue-700 mt-1 font-semibold" dir="ltr">
                          <span>0.1 سم</span>
                          <span>1.27 سم</span>
                          <span>2.54 سم</span>
                          <span>5.0 سم</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-1" dir="ltr">
                        <button
                          onClick={() => handleUpdateSideMargin(currentSideMargin - 0.1)}
                          className="px-2.5 py-1 bg-white hover:bg-blue-100 border border-blue-300 text-blue-800 rounded font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                        >
                          - 0.1 سم
                        </button>
                        <div className="px-3 py-1 bg-white border border-blue-300 text-blue-900 rounded font-bold text-xs min-w-[75px] text-center shadow-inner">
                          {currentSideMargin} سم
                        </div>
                        <button
                          onClick={() => handleUpdateSideMargin(currentSideMargin + 0.1)}
                          className="px-2.5 py-1 bg-white hover:bg-blue-100 border border-blue-300 text-blue-800 rounded font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                        >
                          + 0.1 سم
                        </button>
                      </div>

                      <div className="grid grid-cols-5 gap-1" dir="ltr">
                        {[0.1, 0.5, 1.0, 1.27, 1.5, 1.9, 2.54, 3.0, 3.81, 5.0].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleUpdateSideMargin(val)}
                            className={`py-1 text-center font-bold text-[10px] rounded border transition cursor-pointer ${
                              Math.abs(currentSideMargin - val) < 0.05
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-100'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Orientation Toggle */}
              <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[28px] p-0.5 shadow-2xs">
                <button
                  onClick={() => onUpdateDoc({ orientation: 'portrait' })}
                  className={`px-2.5 h-full rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    docState.orientation === 'portrait'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  title="اتجاه عمودي (Portrait)"
                >
                  <span>عمودي</span>
                  <span>↕</span>
                </button>
                <button
                  onClick={() => onUpdateDoc({ orientation: 'landscape' })}
                  className={`px-2.5 h-full rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    docState.orientation === 'landscape'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  title="اتجاه أفقي (Landscape)"
                >
                  <span>أفقي</span>
                  <span>↔</span>
                </button>
              </div>

              {/* 3. Paper Size Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => toggleLayoutMenu('paperSize', e)}
                  className={`flex items-center gap-1 px-2.5 h-[28px] border rounded-lg text-[11px] font-bold shadow-2xs transition cursor-pointer ${
                    activeLayoutMenu?.id === 'paperSize'
                      ? 'bg-blue-50 border-blue-400 text-blue-800'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                  title="حجم ومقاس الورق (Paper Size)"
                >
                  <span className="text-slate-500 font-normal">حجم:</span>
                  <span className="text-blue-700">{docState.paperSize}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </button>

                {activeLayoutMenu?.id === 'paperSize' && (
                  <div
                    style={getDropdownFixedStyle(activeLayoutMenu?.rect, 320)}
                    className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-2.5 z-[150] text-xs max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-top-1 text-right ring-1 ring-black/5"
                    dir="rtl"
                  >
                    <div className="px-3 py-1.5 font-bold text-slate-800 text-xs border-b border-slate-100 mb-1 flex items-center justify-between">
                      <span>حجم ومقاس الورق (Paper Size):</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {docState.paperSize}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {[
                        { id: 'A4', label: 'A4: 210 × 297 مم', desc: 'الحجم القياسي للمستندات والتقارير' },
                        { id: 'A3', label: 'A3: 297 × 420 مم', desc: 'للمخططات واللوحات والرسومات الكبيرة' },
                        { id: 'A5', label: 'A5: 148 × 210 مم', desc: 'للكتيبات والدفاتر والبطاقات' },
                        { id: 'A6', label: 'A6: 105 × 148 مم', desc: 'للبطاقات البريدية والملاحظات' },
                        { id: 'Letter', label: 'Letter: 216 × 279 مم', desc: 'شائع في المستندات والخطابات الأمريكية' },
                        { id: 'Legal', label: 'Legal: 216 × 356 مم', desc: 'للعقود والمستندات القانونية الطويلة' },
                        { id: 'Executive', label: 'Executive: 184 × 267 مم', desc: 'تقارير تنفيذية ومذكرات رسمية' },
                        { id: 'B4', label: 'B4: 250 × 353 مم', desc: 'حجم متوسط بين A3 و A4' },
                        { id: 'B5', label: 'B5: 176 × 250 مم', desc: 'حجم للكتب والمذكرات' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onUpdateDoc({ paperSize: p.id as any });
                            setActiveLayoutMenu(null);
                          }}
                          className={`w-full text-right p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                            docState.paperSize === p.id
                              ? 'bg-blue-50/90 border-blue-300 text-blue-900 font-bold shadow-2xs'
                              : 'border-transparent hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs">{p.label}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{p.desc}</div>
                          </div>
                          {docState.paperSize === p.id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 border-t mt-1.5 text-center">
                      <button
                        onClick={() => {
                          setActiveLayoutMenu(null);
                          setShowAllPaperSizesModal(true);
                        }}
                        className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>عرض جميع أحجام الورق (A0 - A6 & B0 - B5)...</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Columns Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => toggleLayoutMenu('columns', e)}
                  className={`flex items-center gap-1 px-2.5 h-[28px] border rounded-lg text-[11px] font-bold shadow-2xs transition cursor-pointer ${
                    activeLayoutMenu?.id === 'columns'
                      ? 'bg-blue-50 border-blue-400 text-blue-800'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                  title="عدد الأعمدة في الصفحة"
                >
                  <Columns className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>أعمدة ({docState.columns})</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </button>

                {activeLayoutMenu?.id === 'columns' && (
                  <div
                    style={getDropdownFixedStyle(activeLayoutMenu?.rect, 220)}
                    className="bg-white rounded-xl shadow-2xl border border-slate-300 p-1.5 z-[150] text-xs animate-in fade-in text-right ring-1 ring-black/5"
                    dir="rtl"
                  >
                    {[
                      { col: 1, label: 'عمود واحد (افتراضي)' },
                      { col: 2, label: 'عمودان (صحفي/مجلات)' },
                      { col: 3, label: 'ثلاثة أعمدة' },
                    ].map((item) => (
                      <button
                        key={item.col}
                        onClick={() => {
                          onUpdateDoc({ columns: item.col as any });
                          setActiveLayoutMenu(null);
                        }}
                        className={`w-full text-right p-2 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                          docState.columns === item.col ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{item.label}</span>
                        {docState.columns === item.col && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Page Borders Dropdown in Layout Tab (حدود وإطارات الصفحة) */}
              <div className="relative">
                <button
                  onClick={(e) => toggleLayoutMenu('borders', e)}
                  className={`flex items-center gap-1.5 px-2.5 h-[28px] border rounded-lg text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer ${
                    activeLayoutMenu?.id === 'borders' || (docState.showBorders && docState.borderStyle !== 'none')
                      ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                  title="حدود وإطارات الصفحة الرسمية والزخرفية (Page Borders)"
                >
                  <Square className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-blue-700">حدود الصفحة:</span>
                  <span className="text-slate-700 font-semibold truncate max-w-[90px]">
                    {docState.showBorders && docState.borderStyle && docState.borderStyle !== 'none'
                      ? borderStylesList.find(b => b.id === docState.borderStyle)?.label.split(' ')[0] || 'مفعل'
                      : 'بدون إطار'}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </button>

                {activeLayoutMenu?.id === 'borders' && (
                  <div
                    style={getDropdownFixedStyle(activeLayoutMenu?.rect, 390)}
                    className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-3.5 z-[150] text-xs max-h-[85vh] overflow-y-auto space-y-3 animate-in fade-in slide-in-from-top-1 text-right ring-1 ring-black/5"
                    dir="rtl"
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                        <Square className="w-4 h-4 text-blue-600" />
                        <span>حدود وإطارات الصفحة (Page Borders)</span>
                      </div>
                      <button
                        onClick={() => {
                          onUpdateDoc({ showBorders: false, borderStyle: 'none' });
                          setActiveLayoutMenu(null);
                        }}
                        className="text-[10px] text-rose-600 hover:underline font-bold px-2 py-0.5 bg-rose-50 rounded border border-rose-200"
                      >
                        إلغاء الإطار ✕
                      </button>
                    </div>

                    {/* Presets Grid */}
                    <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                      {borderStylesList.map((b) => {
                        const isSelected = docState.showBorders && docState.borderStyle === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => {
                              onUpdateDoc({
                                showBorders: b.id !== 'none',
                                borderStyle: b.id as any,
                              });
                              setActiveLayoutMenu(null);
                            }}
                            className={`w-full text-right p-2 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-2xs'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center text-[10px] bg-slate-100 shrink-0 font-serif">
                                {b.id === 'royal' || b.id === 'islamic' ? '❖' : b.id === 'court' ? '⚖️' : b.id === 'certificate' ? '🎖️' : '▢'}
                              </span>
                              <span className="text-[11px] font-medium">{b.label}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Border Color & Width */}
                    <div className="pt-2 border-t space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-700">لون الإطار:</span>
                        <div className="flex items-center gap-1">
                          {[
                            { name: 'كحلي ملكي', color: '#1e3a8a' },
                            { name: 'عنابي', color: '#991b1b' },
                            { name: 'زمردي', color: '#065f46' },
                            { name: 'ذهبي', color: '#b45309' },
                            { name: 'رمادي', color: '#334155' },
                            { name: 'أسود', color: '#000000' },
                          ].map((c) => (
                            <button
                              key={c.color}
                              onClick={() => onUpdateDoc({ borderColor: c.color, showBorders: true })}
                              style={{ backgroundColor: c.color }}
                              className={`w-5 h-5 rounded-full border transition cursor-pointer ${
                                docState.borderColor === c.color ? 'ring-2 ring-blue-500 scale-110' : 'border-slate-300'
                              }`}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-700">سماكة الإطار:</span>
                        <div className="flex items-center gap-1" dir="ltr">
                          {[1, 2, 3, 4.5, 6].map((w) => (
                            <button
                              key={w}
                              onClick={() => onUpdateDoc({ borderWidth: w, showBorders: true })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                                (docState.borderWidth || 3) === w
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {w}pt
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section Break Button */}
              <button
                onClick={() => {
                  const sectionBreakHtml = `
                    <div class="word-section-break my-6 py-2.5 border-y-2 border-dashed border-emerald-500 bg-emerald-50/90 rounded-xl text-center text-xs text-emerald-900 font-bold select-none no-print flex items-center justify-between px-4 shadow-xs" contenteditable="false" data-section-break="true">
                      <span class="flex items-center gap-1">📑 بداية قسم جديد</span>
                      <span class="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-mono shadow-2xs">=== فاصل قسم (Section Break - ترويسة وتذييل مستقل) ===</span>
                      <span class="flex items-center gap-1">قسم مستقل 📑</span>
                    </div>
                    <div class="document-section-content" style="padding-top: 10px;" data-section-id="sec-${Date.now()}">
                      <p><br></p>
                    </div>
                  `;
                  onExecCommand('insertHTML', sectionBreakHtml);
                }}
                className="flex items-center gap-1.5 px-2.5 h-[28px] bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-400 rounded-lg text-[11px] font-bold text-slate-700 hover:text-emerald-800 shadow-2xs transition active:scale-95 cursor-pointer"
                title="إدراج فاصل قسم (Section Break) لتقسيم المستند وترويسة/تذييل مستقل لكل قسم"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>فاصل قسم</span>
              </button>

              {/* 5. Line Spacing Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => toggleLayoutMenu('spacing', e)}
                  className={`flex items-center gap-1.5 px-2.5 h-[28px] border rounded-lg text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer ${
                    activeLayoutMenu?.id === 'spacing'
                      ? 'bg-blue-50 border-blue-400 text-blue-800'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                  title="تباعد الأسطر (Line Spacing)"
                >
                  <span className="text-blue-700 font-black text-xs">↑↓</span>
                  <span className="text-blue-700">تباعد:</span>
                  <span className="text-slate-700 font-semibold">{currentLineSpacing}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </button>

                {activeLayoutMenu?.id === 'spacing' && (
                  <div
                    style={getDropdownFixedStyle(activeLayoutMenu?.rect, 360)}
                    className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-3.5 z-[150] text-xs max-h-[85vh] overflow-y-auto space-y-3 animate-in fade-in slide-in-from-top-1 text-right ring-1 ring-black/5"
                    dir="rtl"
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                        <span className="text-blue-600 font-black">↑↓</span>
                        <span>تباعد الأسطر (Line Spacing)</span>
                      </div>
                      <span className="bg-blue-50 text-blue-700 border border-blue-300 font-bold px-2 py-0.5 rounded-lg text-[10px]" dir="ltr">
                        {currentLineSpacing}
                      </span>
                    </div>

                    {/* Presets Grid */}
                    <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-2.5 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-700 mb-1">
                        المقاسات القياسية لتباعد الأسطر:
                      </div>
                      <div className="grid grid-cols-4 gap-1" dir="ltr">
                        {[
                          { val: 1.0, label: '1.0 مفرد' },
                          { val: 1.15, label: '1.15 قياسي' },
                          { val: 1.25, label: '1.25 متوازن' },
                          { val: 1.5, label: '1.5 سطر ونصف' },
                          { val: 1.8, label: '1.8 واسع' },
                          { val: 2.0, label: '2.0 مزدوج' },
                          { val: 2.5, label: '2.5 عريض' },
                          { val: 3.0, label: '3.0 ثلاثي' },
                        ].map((item) => (
                          <button
                            key={item.val}
                            onClick={() => {
                              handleUpdateLineSpacing(item.val);
                            }}
                            className={`py-1.5 text-center font-bold text-[10px] rounded-lg border transition cursor-pointer ${
                              Math.abs(currentLineSpacing - item.val) < 0.04
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Slider & Steppers */}
                    <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-3 space-y-2">
                      <div className="text-slate-800 font-bold text-[11px]">
                        تدرج دقيق للتباعد: من 0.8 إلى 3.0
                      </div>

                      <div className="px-1">
                        <input
                          type="range"
                          min="0.8"
                          max="3.0"
                          step="0.05"
                          value={currentLineSpacing}
                          onChange={(e) => handleUpdateLineSpacing(parseFloat(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                        <div className="flex justify-between text-[9px] text-slate-600 mt-1 font-semibold" dir="ltr">
                          <span>0.8</span>
                          <span>1.15</span>
                          <span>1.5</span>
                          <span>2.0</span>
                          <span>3.0</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-1" dir="ltr">
                        <button
                          onClick={() => handleUpdateLineSpacing(currentLineSpacing - 0.1)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                        >
                          - 0.1
                        </button>
                        <div className="px-3 py-1 bg-white border border-slate-300 text-blue-900 rounded font-bold text-xs min-w-[75px] text-center shadow-inner">
                          {currentLineSpacing}
                        </div>
                        <button
                          onClick={() => handleUpdateLineSpacing(currentLineSpacing + 0.1)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                        >
                          + 0.1
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Paragraph Spacing & Indent Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => toggleLayoutMenu('paragraphSpacing', e)}
                  className={`flex items-center gap-1.5 px-2.5 h-[28px] border rounded-lg text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer ${
                    activeLayoutMenu?.id === 'paragraphSpacing'
                      ? 'bg-blue-50 border-blue-400 text-blue-800'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                  title="تباعد الفقرات والمسافة البادئة"
                >
                  <span className="text-slate-800">تباعد الفقرات</span>
                  <span className="text-blue-600 font-bold">⁞</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </button>

                {activeLayoutMenu?.id === 'paragraphSpacing' && (
                  <div
                    style={getDropdownFixedStyle(activeLayoutMenu?.rect, 340)}
                    className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-3.5 z-[150] text-xs max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-top-1 text-right ring-1 ring-black/5"
                    dir="rtl"
                  >
                    <div className="font-bold text-slate-800 text-xs border-b pb-2 mb-2.5 flex items-center justify-between">
                      <span>تباعد الفقرات والمسافة البادئة:</span>
                      <span className="text-[10px] text-blue-600 font-normal">
                        قبل: {docState.paragraphSpacingBefore ?? 0}pt | بعد: {docState.paragraphSpacingAfter ?? 6}pt
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Before */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-700">تباعد قبل الفقرة (Before):</div>
                        <div className="flex items-center gap-1.5" dir="ltr">
                          {[0, 4, 6, 8, 12, 18, 24].map((pt) => (
                            <button
                              key={pt}
                              onClick={() => onUpdateDoc({ paragraphSpacingBefore: pt })}
                              className={`flex-1 py-1 px-1 rounded-md font-bold text-[10px] border transition cursor-pointer ${
                                (docState.paragraphSpacingBefore ?? 0) === pt
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {pt}pt
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* After */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-700">تباعد بعد الفقرة (After):</div>
                        <div className="flex items-center gap-1.5" dir="ltr">
                          {[0, 4, 6, 8, 12, 18, 24].map((pt) => (
                            <button
                              key={pt}
                              onClick={() => onUpdateDoc({ paragraphSpacingAfter: pt })}
                              className={`flex-1 py-1 px-1 rounded-md font-bold text-[10px] border transition cursor-pointer ${
                                (docState.paragraphSpacingAfter ?? 6) === pt
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {pt}pt
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* First Line Indent */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-700">مسافة السطر الأول (First Line Indent):</div>
                        <div className="grid grid-cols-4 gap-1.5" dir="ltr">
                          {[
                            { val: 0, label: 'بلا (0)' },
                            { val: 0.5, label: '0.5 سم' },
                            { val: 1.0, label: '1.0 سم' },
                            { val: 1.27, label: '1.27 سم' },
                            { val: 1.5, label: '1.5 سم' },
                            { val: 2.0, label: '2.0 سم' },
                            { val: 2.5, label: '2.5 سم' },
                            { val: 3.0, label: '3.0 سم' },
                          ].map((item) => (
                            <button
                              key={item.val}
                              onClick={() => onUpdateDoc({ firstLineIndent: item.val })}
                              className={`py-1 px-2 rounded-md font-bold text-[10px] border transition cursor-pointer ${
                                (docState.firstLineIndent ?? 0) === item.val
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Word Spacing */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-700">تباعد الكلمات (Word Spacing):</div>
                        <div className="flex items-center gap-1.5" dir="ltr">
                          {[0, 1, 2, 3, 4, 6].map((pt) => (
                            <button
                              key={pt}
                              onClick={() => onUpdateDoc({ wordSpacing: pt })}
                              className={`flex-1 py-1 px-1 rounded-md font-bold text-[10px] border transition cursor-pointer ${
                                (docState.wordSpacing ?? 0) === pt
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {pt === 0 ? 'عادي' : `${pt}pt`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="w-px h-6 bg-slate-300 mx-1 shrink-0" />

              {/* 7. Page Breaks & Section Breaks Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => toggleLayoutMenu('breaks', e)}
                  className={`flex items-center gap-1.5 px-2.5 h-[28px] border rounded-lg text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer ${
                    activeLayoutMenu?.id === 'breaks'
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                  title="إدراج فواصل الصفحات والأقسام (Breaks)"
                >
                  <Scissors className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>الفواصل</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </button>

                {activeLayoutMenu?.id === 'breaks' && (
                  <div
                    style={getDropdownFixedStyle(activeLayoutMenu?.rect, 320)}
                    className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-2.5 z-[150] text-xs max-h-[85vh] overflow-y-auto space-y-1.5 animate-in fade-in slide-in-from-top-1 text-right ring-1 ring-black/5"
                    dir="rtl"
                  >
                    <div className="px-3 py-1.5 font-bold text-slate-800 text-xs border-b border-slate-100 flex items-center justify-between">
                      <span>فواصل الأقسام (Section Breaks):</span>
                    </div>

                    {/* Next Page Section Break */}
                    <button
                      onClick={() => {
                        const sectionBreakHtml = `
                          <div class="word-section-break my-5 py-2 border-y-2 border-dashed border-emerald-500 bg-emerald-50/90 rounded-lg text-center text-xs text-emerald-900 font-bold select-none no-print flex items-center justify-between px-3" contenteditable="false" data-section-break="true">
                            <span>📑 بداية قسم جديد</span>
                            <span class="bg-emerald-600 text-white px-2 py-0.5 rounded text-[9.5px] font-mono">=== فاصل قسم (الصفحة التالية) ===</span>
                            <span>قسم مستقل</span>
                          </div>
                          <div class="document-section-content" style="padding-top: 8px;" data-section-id="sec-${Date.now()}">
                            <p><br></p>
                          </div>
                        `;
                        onExecCommand('insertHTML', sectionBreakHtml);
                        setActiveLayoutMenu(null);
                      }}
                      className="w-full text-right p-2 rounded-xl border border-emerald-100 hover:bg-emerald-50/80 transition flex flex-col gap-0.5 cursor-pointer"
                    >
                      <div className="font-bold text-emerald-900 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-600" />
                          <span>فاصل قسم: الصفحة التالية (Next Page)</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        بدء قسم جديد بترويسة وهوامش وتذييل مستقل في الصفحة التالية
                      </span>
                    </button>

                    {/* Continuous Section Break */}
                    <button
                      onClick={() => {
                        const sectionBreakHtml = `
                          <div class="word-section-break my-4 py-1.5 border-y border-dashed border-teal-500 bg-teal-50/90 rounded text-center text-xs text-teal-900 font-bold select-none no-print flex items-center justify-between px-3" contenteditable="false" data-section-break="continuous">
                            <span>📑 فاصل قسم مستمر</span>
                            <span class="bg-teal-600 text-white px-2 py-0.5 rounded text-[9px] font-mono">=== فاصل قسم (مستمر في نفس الصفحة) ===</span>
                          </div>
                          <div class="document-section-content" style="padding-top: 6px;" data-section-id="sec-${Date.now()}">
                            <p><br></p>
                          </div>
                        `;
                        onExecCommand('insertHTML', sectionBreakHtml);
                        setActiveLayoutMenu(null);
                      }}
                      className="w-full text-right p-2 rounded-xl border border-teal-100 hover:bg-teal-50/80 transition flex flex-col gap-0.5 cursor-pointer"
                    >
                      <div className="font-bold text-teal-900 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-teal-600" />
                          <span>فاصل قسم: مستمر (Continuous)</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        بدء قسم جديد في نفس الصفحة (مثال لتغيير عدد الأعمدة)
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* 8. Page Background Color Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => toggleLayoutMenu('pageColor', e)}
                  className={`flex items-center gap-1.5 px-2.5 h-[28px] border rounded-lg text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer ${
                    activeLayoutMenu?.id === 'pageColor'
                      ? 'bg-amber-50 border-amber-400 text-amber-900'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                  title="لون خلفية صفحة المستند (Page Color)"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>لون الورقة</span>
                  <div
                    className="w-3 h-3 rounded-full border border-slate-400 shadow-2xs"
                    style={{ backgroundColor: docState.pageBgColor || '#ffffff' }}
                  />
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </button>

                {activeLayoutMenu?.id === 'pageColor' && (
                  <div
                    style={getDropdownFixedStyle(activeLayoutMenu?.rect, 260)}
                    className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-3 z-[150] text-xs space-y-2.5 animate-in fade-in slide-in-from-top-1 text-right ring-1 ring-black/5"
                    dir="rtl"
                  >
                    <div className="font-bold text-slate-800 text-xs border-b pb-1.5 flex items-center justify-between">
                      <span>لون خلفية الورقة (Page Color):</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { color: '#ffffff', label: 'أبيض قياسي' },
                        { color: '#fefce8', label: 'عاجي دافئ' },
                        { color: '#f8fafc', label: 'رمادي عصري' },
                        { color: '#f0f9ff', label: 'أزرق ثلجي' },
                        { color: '#fdf2f8', label: 'وردي ناعم' },
                        { color: '#f0fdf4', label: 'نعناعي هادئ' },
                        { color: '#1e293b', label: 'ليلي داكن' },
                      ].map((item) => (
                        <button
                          key={item.color}
                          onClick={() => {
                            onUpdateDoc({ pageBgColor: item.color });
                            setActiveLayoutMenu(null);
                          }}
                          className={`p-1.5 rounded-lg border text-right flex items-center gap-2 transition cursor-pointer ${
                            (docState.pageBgColor || '#ffffff') === item.color
                              ? 'border-blue-500 font-bold bg-blue-50/60 ring-1 ring-blue-400'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-slate-400 shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-[11px] truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700">لون مخصص:</span>
                      <input
                        type="color"
                        value={docState.pageBgColor || '#ffffff'}
                        onChange={(e) => onUpdateDoc({ pageBgColor: e.target.value })}
                        className="w-8 h-7 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 9. Watermark Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => toggleLayoutMenu('watermark', e)}
                  className={`flex items-center gap-1.5 px-2.5 h-[28px] border rounded-lg text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer ${
                    activeLayoutMenu?.id === 'watermark' || docState.watermarkText
                      ? 'bg-blue-50 border-blue-400 text-blue-900'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                  title="العلامة المائية للمستند (Watermark)"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>علامة مائية</span>
                  {docState.watermarkText && (
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-bold">
                      مفعلة
                    </span>
                  )}
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </button>

                {activeLayoutMenu?.id === 'watermark' && (
                  <div
                    style={getDropdownFixedStyle(activeLayoutMenu?.rect, 280)}
                    className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-3 z-[150] text-xs space-y-2 animate-in fade-in slide-in-from-top-1 text-right ring-1 ring-black/5"
                    dir="rtl"
                  >
                    <div className="font-bold text-slate-800 text-xs border-b pb-1.5 flex items-center justify-between">
                      <span>العلامة المائية (Watermark):</span>
                      {docState.watermarkText && (
                        <button
                          onClick={() => {
                            onUpdateDoc({ watermarkText: undefined });
                            setActiveLayoutMenu(null);
                          }}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          إزالة ✕
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {['مسودة', 'سري للغاية', 'نموذج', 'عاجل', 'معتمد'].map((wText) => (
                        <button
                          key={wText}
                          onClick={() => {
                            onUpdateDoc({ watermarkText: wText });
                            setActiveLayoutMenu(null);
                          }}
                          className={`w-full text-right p-2 rounded-lg border text-xs flex items-center justify-between transition cursor-pointer ${
                            docState.watermarkText === wText
                              ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                              : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{wText}</span>
                          {docState.watermarkText === wText && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">نص مخصص:</span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="اكتب العلامة المائية..."
                          defaultValue={docState.watermarkText || ''}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onUpdateDoc({ watermarkText: (e.target as HTMLInputElement).value });
                              setActiveLayoutMenu(null);
                            }
                          }}
                          className="flex-1 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                        />
                        <button
                          onClick={(e) => {
                            const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                            if (input) {
                              onUpdateDoc({ watermarkText: input.value });
                              setActiveLayoutMenu(null);
                            }
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs transition cursor-pointer"
                        >
                          تطبيق
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 10. Comprehensive Page Setup & Print Preview Button */}
              <button
                onClick={onPrint}
                className="flex items-center gap-1.5 px-3.5 h-[28px] bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 hover:from-blue-600 hover:to-indigo-500 text-white rounded-lg text-[11px] font-black shadow-md shadow-blue-950/30 transition active:scale-95 cursor-pointer ml-auto shrink-0"
                title="إعداد وتخطيط الصفحة والمعاينة الشاملة قبل الطباعة والتصدير"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span>إعداد الصفحة والطباعة 🖨️</span>
              </button>
            </div>
          )}

          {/* ================= DESIGN TAB (تصميم) ================= */}
          {activeTab === 'design' && (
            <div className="flex items-center gap-2 flex-nowrap shrink-0 overflow-visible py-0.5 relative z-30">
              {/* Orientation Toggle (عمودي / أفقي) */}
              <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[28px] p-0.5 shadow-2xs">
                <button
                  onClick={() => onUpdateDoc({ orientation: 'portrait' })}
                  className={`px-2.5 h-full rounded-md text-[10px] font-bold flex items-center gap-1 transition ${
                    docState.orientation === 'portrait'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  title="اتجاه عمودي (Portrait)"
                >
                  <span>عمودي</span>
                  <span>↕</span>
                </button>
                <button
                  onClick={() => onUpdateDoc({ orientation: 'landscape' })}
                  className={`px-2.5 h-full rounded-md text-[10px] font-bold flex items-center gap-1 transition ${
                    docState.orientation === 'landscape'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  title="اتجاه أفقي (Landscape)"
                >
                  <span>أفقي</span>
                  <span>↔</span>
                </button>
              </div>

              {/* 1. Page Borders Menu matching "إطارات المستند .jpg" */}
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !showBorderMenu;
                    closeAllDropdowns();
                    setShowBorderMenu(next);
                  }}
                  className={`flex items-center gap-1.5 px-3 h-[28px] rounded-lg font-bold text-[11px] shadow-2xs transition active:scale-95 border ${
                    docState.showBorders
                      ? 'bg-blue-50 border-blue-400 text-blue-800'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                  title="إطارات وحدود المستند الرسمية"
                >
                  <Layout className="w-3.5 h-3.5 text-blue-600" />
                  <span>إطارات المستند</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                {showBorderMenu && (
                  <div
                    className="absolute top-full mt-1.5 right-0 bg-white rounded-2xl shadow-2xl border border-slate-300 p-3 z-[100] w-80 sm:w-96 text-right ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 max-h-[85vh] overflow-y-auto space-y-2.5"
                    dir="rtl"
                  >
                    <div className="flex items-center justify-between pb-2 border-b">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Layout className="w-4 h-4 text-blue-600" />
                        <span>أنماط الإطارات والحدود الرسمية للمستند</span>
                      </span>
                      <button
                        onClick={() => {
                          onUpdateDoc({ showBorders: false, borderStyle: 'none' });
                          setShowBorderMenu(false);
                        }}
                        className="text-[10px] text-rose-600 hover:underline font-bold"
                      >
                        إلغاء الإطار ✕
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {borderStylesList.map((b) => {
                        const isSelected = docState.showBorders && docState.borderStyle === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => {
                              onUpdateDoc({
                                showBorders: b.id !== 'none',
                                borderStyle: b.id as any,
                              });
                              setShowBorderMenu(false);
                            }}
                            className={`w-full text-right p-2.5 rounded-xl border flex items-center justify-between transition ${
                              isSelected
                                ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-2xs'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded border border-slate-400 flex items-center justify-center text-[10px] bg-slate-50">
                                ❖
                              </div>
                              <span className="text-[11px] font-medium">{b.label}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Border Color & Width */}
                    <div className="pt-2 border-t space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600">لون الإطار:</span>
                        <div className="flex items-center gap-1">
                          {[
                            { name: 'كحلي رسمي', color: '#1e3a8a' },
                            { name: 'عنابي ملكي', color: '#991b1b' },
                            { name: 'زمردي إسلامي', color: '#065f46' },
                            { name: 'ذهبي فاخر', color: '#b45309' },
                            { name: 'رمادي داكن', color: '#334155' },
                            { name: 'أسود', color: '#000000' },
                          ].map((c) => (
                            <button
                              key={c.color}
                              onClick={() => onUpdateDoc({ borderColor: c.color, showBorders: true })}
                              className={`w-5 h-5 rounded-full border transition hover:scale-110 shadow-2xs ${
                                (docState.borderColor || '#1e3a8a') === c.color ? 'ring-2 ring-blue-500 scale-105' : 'border-slate-300'
                              }`}
                              style={{ backgroundColor: c.color }}
                              title={c.name}
                            />
                          ))}
                          <label className="cursor-pointer ml-1">
                            <input
                              type="color"
                              value={docState.borderColor || '#1e3a8a'}
                              onChange={(e) => onUpdateDoc({ borderColor: e.target.value, showBorders: true })}
                              className="w-5 h-5 rounded cursor-pointer border border-slate-300 p-0"
                              title="لون مخصص"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600">سُمك الإطار:</span>
                        <div className="flex items-center gap-1">
                          {[1, 1.5, 2, 3, 4.5].map((w) => (
                            <button
                              key={w}
                              onClick={() => onUpdateDoc({ borderWidth: w, showBorders: true })}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded border transition ${
                                (docState.borderWidth || 2) === w
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50'
                              }`}
                            >
                              {w}pt
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Document Page Color (لون وخلفية الصفحة) */}
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !showThemeMenu;
                    closeAllDropdowns();
                    setShowThemeMenu(next);
                  }}
                  className={`flex items-center gap-1.5 px-3 h-[28px] rounded-lg font-bold text-[11px] shadow-2xs transition active:scale-95 border ${
                    showThemeMenu
                      ? 'bg-blue-50 border-blue-400 text-blue-800'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                  title="ألوان وخلفيات المستند"
                >
                  <Palette className="w-3.5 h-3.5 text-purple-600" />
                  <span>لون وخلفية الصفحة</span>
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                    style={{ backgroundColor: docState.pageBgColor || '#ffffff' }}
                  />
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                {showThemeMenu && (
                  <div className="absolute top-full mt-1.5 right-0 bg-white rounded-2xl shadow-2xl border border-slate-300 p-3.5 z-[100] w-80 text-xs space-y-3 animate-in fade-in slide-in-from-top-1 ring-1 ring-black/5" dir="rtl">
                    <div className="flex items-center justify-between border-b pb-1 font-bold text-slate-800 text-[11px]">
                      <span>🎨 ألوان خلفية ورقة المستند:</span>
                      <button
                        onClick={() => {
                          onUpdateDoc({ pageBgColor: '#ffffff', textColor: '#000000' });
                          setShowThemeMenu(false);
                        }}
                        className="text-[10px] text-blue-600 hover:underline"
                      >
                        أبيض قياسي
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { name: 'أبيض ناصع', color: '#ffffff' },
                        { name: 'كريمي عاجي', color: '#fdfbf7' },
                        { name: 'ورق بردي', color: '#fefce8' },
                        { name: 'نعناعي هادئ', color: '#f0fdf4' },
                        { name: 'سماوي باستيل', color: '#f0f9ff' },
                        { name: 'وردي لطيف', color: '#fff1f2' },
                        { name: 'رمادي عصري', color: '#f8fafc' },
                        { name: 'ليلي داكن', color: '#0f172a' },
                      ].map((bg) => (
                        <button
                          key={bg.color}
                          onClick={() => {
                            onUpdateDoc({
                              pageBgColor: bg.color,
                              ...(bg.color === '#0f172a' ? { textColor: '#f8fafc' } : (docState.textColor === '#f8fafc' ? { textColor: '#000000' } : {}))
                            });
                          }}
                          className={`p-1.5 rounded-lg border flex flex-col items-center gap-0.5 transition shadow-2xs hover:scale-105 ${
                            (docState.pageBgColor || '#ffffff') === bg.color ? 'ring-2 ring-blue-500 border-transparent font-bold' : 'border-slate-200'
                          }`}
                          style={{ backgroundColor: bg.color }}
                        >
                          <div className="w-full h-3.5 rounded-xs border border-black/10" style={{ backgroundColor: bg.color }} />
                          <span className={`text-[8px] leading-tight ${bg.color === '#0f172a' ? 'text-white' : 'text-slate-700'}`}>
                            {bg.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer">
                        <span>لون مخصص:</span>
                        <input
                          type="color"
                          value={docState.pageBgColor || '#ffffff'}
                          onChange={(e) => onUpdateDoc({ pageBgColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                        />
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">{docState.pageBgColor || '#ffffff'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Watermark (العلامة المائية) */}
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !showWatermarkMenu;
                    closeAllDropdowns();
                    setShowWatermarkMenu(next);
                  }}
                  className={`flex items-center gap-1.5 px-3 h-[28px] rounded-lg font-bold text-[11px] shadow-2xs transition active:scale-95 border ${
                    docState.watermarkText
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                  title="العلامة المائية للصفحة"
                >
                  <Stamp className="w-3.5 h-3.5 text-amber-600" />
                  <span>{docState.watermarkText ? `علامة: ${docState.watermarkText}` : 'العلامة المائية'}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                {showWatermarkMenu && (
                  <div className="absolute top-full mt-1.5 right-0 bg-white rounded-2xl shadow-2xl border border-slate-300 p-3 z-[100] w-64 text-right ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 space-y-2" dir="rtl">
                    <div className="font-bold text-slate-800 text-xs border-b pb-1.5 flex items-center justify-between">
                      <span>العلامات المائية الرسمية:</span>
                      {docState.watermarkText && (
                        <button
                          onClick={() => {
                            onUpdateDoc({ watermarkText: '' });
                            setShowWatermarkMenu(false);
                          }}
                          className="text-[10px] text-rose-600 hover:underline"
                        >
                          إزالة
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {['مسودة رسمية', 'سري للغاية', 'معتمد ونهائي', 'صورة طبق الأصل', 'عاجل جداً'].map((w) => (
                        <button
                          key={w}
                          onClick={() => {
                            onUpdateDoc({ watermarkText: w });
                            setShowWatermarkMenu(false);
                          }}
                          className={`w-full text-right px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                            docState.watermarkText === w
                              ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{w}</span>
                          {docState.watermarkText === w && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-[10px] font-bold text-slate-600 mb-1">نص علامة مائية مخصص:</div>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="اكتب العلامة..."
                          defaultValue={docState.watermarkText || ''}
                          id="custom-watermark-input"
                          className="flex-1 border rounded px-2 py-1 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onUpdateDoc({ watermarkText: (e.target as HTMLInputElement).value });
                              setShowWatermarkMenu(false);
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            const inp = document.getElementById('custom-watermark-input') as HTMLInputElement;
                            if (inp) {
                              onUpdateDoc({ watermarkText: inp.value });
                              setShowWatermarkMenu(false);
                            }
                          }}
                          className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold"
                        >
                          تطبيق
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Document Themes (النسق والثيمات) */}
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !showThemesMenu;
                    closeAllDropdowns();
                    setShowThemesMenu(next);
                  }}
                  className={`flex items-center gap-1.5 px-3 h-[28px] border rounded-lg text-[11px] font-bold shadow-2xs transition ${
                    showThemesMenu ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>النسق والثيمات</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>
                {showThemesMenu && (
                  <div className="absolute top-full mt-1.5 right-0 bg-white rounded-xl shadow-2xl border border-slate-300 p-2.5 z-[100] w-64 text-right space-y-1 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1" dir="rtl">
                    <div className="px-2 py-1 font-bold text-[10px] text-slate-400 uppercase border-b">
                      تنسيقات وألوان وثيمات رسمية
                    </div>
                    {[
                      { name: 'النسق القياسي (Office Standard)', font: "'Amiri', serif", color: '#1e3a8a' },
                      { name: 'النسق الملكي المذهب (Royal Gold)', font: "'Traditional Arabic', serif", color: '#854d0e' },
                      { name: 'النسق الزمردي الرسمي (Emerald Executive)', font: "'Cairo', sans-serif", color: '#065f46' },
                      { name: 'النسق العصري (Modern Indigo)', font: "'Tajawal', sans-serif", color: '#4338ca' },
                    ].map((th, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onUpdateDoc({ fontFamily: th.font, fontColor: th.color });
                          setShowThemesMenu(false);
                        }}
                        className="w-full text-right p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition"
                      >
                        <div>
                          <div className="font-bold text-slate-800 text-[11px]">{th.name}</div>
                          <div className="text-[10px] text-slate-400">خط: {th.font.split(',')[0]}</div>
                        </div>
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: th.color }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Official Stamps (أختام وتوثيقات رسمية) */}
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !showStampsMenu;
                    closeAllDropdowns();
                    setShowStampsMenu(next);
                  }}
                  className="flex items-center gap-1.5 px-3 h-[28px] bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 shadow-2xs transition active:scale-95"
                  title="أختام وتوثيقات المحكمة والمصادقة الشرعية"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>أختام وتوثيقات رسمية</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                {showStampsMenu && (
                  <div className="absolute top-full mt-1.5 right-0 bg-white rounded-2xl shadow-2xl border border-slate-300 p-2.5 z-[100] w-72 text-right ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 space-y-1.5" dir="rtl">
                    <div className="text-[11px] font-bold text-slate-800 border-b pb-1">إدراج أختام وكليشيهات معتمدة:</div>
                    <button
                      onClick={() => handleInsertOfficialStamp('court')}
                      className="w-full text-right p-2 rounded-xl hover:bg-blue-50 border border-blue-100 transition flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-blue-900">🏛️ ختم محكمة القفر والتوثيق</div>
                        <div className="text-[10px] text-blue-600">خاتم دائري رسمي للجمهورية اليمنية</div>
                      </div>
                      <span className="text-xs">إدراج +</span>
                    </button>
                    <button
                      onClick={() => handleInsertOfficialStamp('approved')}
                      className="w-full text-right p-2 rounded-xl hover:bg-emerald-50 border border-emerald-100 transition flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-emerald-900">✓ كليشيه المصادقة الرسمية</div>
                        <div className="text-[10px] text-emerald-600">صودق عليه بالأصول مع رقم السجل</div>
                      </div>
                      <span className="text-xs">إدراج +</span>
                    </button>
                    <button
                      onClick={() => handleInsertOfficialStamp('signature')}
                      className="w-full text-right p-2 rounded-xl hover:bg-slate-100 border border-slate-200 transition flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-800">✍️ صندوق التوقيع والبصمة الشرعية</div>
                        <div className="text-[10px] text-slate-500">خانات للأطراف والكاتب ورئيس المحكمة</div>
                      </div>
                      <span className="text-xs">إدراج +</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Print Preview Shortcut */}
              <button
                onClick={onPrint}
                className="flex items-center gap-1.5 px-3 h-[28px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                title="معاينة المستند قبل الطباعة"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>معاينة قبل الطباعة</span>
              </button>
            </div>
          )}



           {/* ================= FILE TAB (قائمة المستندات) ================= */}
          {activeTab === 'file' && (
            <div className="flex items-center gap-2 flex-wrap shrink-0 relative overflow-visible z-30">
              
              {/* 1. File Menu Dropdown Button (قائمة المستندات) */}
              <div className="relative">
                <button
                  onClick={() => setShowFileMenuDrawer(!showFileMenuDrawer)}
                  className="flex items-center gap-1.5 px-3 h-[26px] bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                  title="فتح قائمة المستندات الرئيسية"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>قائمة المستندات</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Vertical File Menu Card */}
                {showFileMenuDrawer && (
                  <div className="absolute top-full mt-1.5 right-0 bg-white rounded-xl shadow-2xl border border-slate-300 py-3 z-[100] w-64 text-right animate-in fade-in slide-in-from-top-1 font-sans ring-1 ring-black/5">
                    <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">قائمة المستندات (PRO)</span>
                      <button
                        onClick={() => setShowFileMenuDrawer(false)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="py-1">
                      {/* New Blank Document (إنشاء مستند وورد جديد) */}
                      <button
                        onClick={() => {
                          setShowFileMenuDrawer(false);
                          onNewDocument();
                        }}
                        className="w-full text-right px-5 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-50 transition flex items-center justify-between group border-b border-slate-100"
                        title="إنشاء مستند وورد جديد (نافذة التخصيص والقوالب الرسمية)"
                      >
                        <div className="flex items-center gap-2">
                          <FilePlus className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span>إنشاء مستند وورد جديد (افتراضي خالي)</span>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">جديد</span>
                      </button>

                      {/* إنشاء من قالب (Create from Template) */}
                      <button
                        onClick={() => {
                          handleApplyCourtAppealTemplate();
                          setShowFileMenuDrawer(false);
                        }}
                        className="w-full text-right px-5 py-2.5 text-sm font-semibold text-purple-900 hover:bg-purple-50 transition flex items-center justify-between group border-b border-slate-100"
                        title="إنشاء مستند جديد باستخدام قالب مذكرة محكمة التمييز المعتمد"
                      >
                        <div className="flex items-center gap-2">
                          <Layout className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                          <span>إنشاء من قالب (محكمة التمييز)</span>
                        </div>
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">قالب</span>
                      </button>

                      {/* Document Templates Library */}
                      <button
                        onClick={() => {
                          onOpenTemplates?.();
                          setShowFileMenuDrawer(false);
                        }}
                        className="w-full text-right px-5 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-50 transition flex items-center justify-between group border-b border-slate-100"
                        title="فتح مكتبة قوالب المستندات الجاهزة (سيرة ذاتية، خطاب رسمي، جدول مهام...)"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                          <span>مكتبة القوالب الجاهزة (Templates)</span>
                        </div>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">مكتبة</span>
                      </button>

                      {/* Save */}
                      <button
                        onClick={() => {
                          handlePerformSave();
                          setShowFileMenuDrawer(false);
                        }}
                        className="w-full text-right px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                          <span>حفظ المستند</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Ctrl+S</span>
                      </button>

                      {/* Save As */}
                      <button
                        onClick={() => {
                          if (onSaveAsDocument) onSaveAsDocument();
                          setShowFileMenuDrawer(false);
                        }}
                        className="w-full text-right px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span>حفظ باسم...</span>
                        </div>
                        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">الجهاز</span>
                      </button>

                      {/* Save Formats Section (PDF, Word docx, Word doc) */}
                      <div className="border-t border-b border-slate-100 my-1 py-1 bg-slate-50/70 space-y-0.5">
                        <button
                          onClick={async () => {
                            setShowFileMenuDrawer(false);
                            try {
                              await exportWordAsPdf(docState);
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="w-full text-right px-5 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-50 transition flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <FileDown className="w-3.5 h-3.5 text-rose-600" />
                            <span>حفظ وتصدير PDF (.pdf)</span>
                          </div>
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">PDF</span>
                        </button>

                        <button
                          onClick={async () => {
                            setShowFileMenuDrawer(false);
                            try {
                              await exportWordAsDocx(docState);
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="w-full text-right px-5 py-1.5 text-xs font-bold text-blue-900 hover:bg-blue-50 transition flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>حفظ كـ Word حديث (.docx)</span>
                          </div>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">DOCX</span>
                        </button>

                        <button
                          onClick={async () => {
                            setShowFileMenuDrawer(false);
                            try {
                              await exportWordAsDoc(docState);
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="w-full text-right px-5 py-1.5 text-xs font-bold text-sky-900 hover:bg-sky-50 transition flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-sky-600" />
                            <span>حفظ كـ Word كلاسيكي (.doc)</span>
                          </div>
                          <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">DOC</span>
                        </button>
                      </div>

                      {/* Print */}
                      <button
                        onClick={() => {
                          onPrint();
                          setShowFileMenuDrawer(false);
                        }}
                        className="w-full text-right px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Printer className="w-4 h-4 text-indigo-600" />
                          <span>طباعة المستند</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Ctrl+P</span>
                      </button>

                    </div>
                  </div>
                )}
              </div>

              {/* 2. Direct New Document Button on Ribbon */}
              <button
                onClick={onNewDocument}
                className="flex items-center gap-1.5 px-2.5 h-[26px] bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                title="إنشاء مستند جديد (تخصيص كامل / قوالب / فارغ) 📄✨"
              >
                <FilePlus className="w-3.5 h-3.5 text-blue-600" />
                <span>مستند جديد 📄✨</span>
              </button>

              {/* Voice Typing / Speech-to-Text Button (إملاء صوتي) */}
              {onOpenVoiceTyping && (
                <button
                  onClick={onOpenVoiceTyping}
                  className="flex items-center gap-1.5 px-2.5 h-[26px] bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                  title="الإملاء الصوتي وتحويل الكلام إلى نص عربي مباشر 🎙️"
                >
                  <Mic className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  <span>إملاء صوتي 🎙️</span>
                </button>
              )}

              {/* 3. Print Preview */}
              <button
                onClick={onPrint}
                className="flex items-center gap-1.5 px-3 h-[26px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                title="معاينة الطباعة"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>معاينة الطباعة</span>
              </button>

              {/* 4. Share Document */}
              {onShareDocument && (
                <button
                  onClick={onShareDocument}
                  className="flex items-center gap-1.5 px-3 h-[26px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded text-[11px] font-black shadow-2xs transition active:scale-95 cursor-pointer"
                  title="مشاركة المستند عبر واتساب، بلوتوث، وتطبيقات أندرويد 📤"
                >
                  <Share2 className="w-3.5 h-3.5 text-white" />
                  <span>مشاركة المستند 📤</span>
                </button>
              )}

              {/* 5. Android Permissions */}
              {onOpenPermissionsModal && (
                <button
                  onClick={onOpenPermissionsModal}
                  className="flex items-center gap-1.5 px-2.5 h-[26px] bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                  title="إدارة وتفعيل أذونات أندرويد (تخزين، كاميرا، صوت) 🛡️"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>أذونات أندرويد 🛡️</span>
                </button>
              )}

            </div>
          )}

          {/* ================= OPTIONS TAB (خيارات) ================= */}
          {activeTab === 'options' && (
            <div className="flex items-center gap-2 flex-nowrap shrink-0 overflow-x-auto scrollbar-none">
              {/* Smart Proofreader & AI */}
              <button
                onClick={onOpenProofreader}
                className="flex items-center gap-1.5 px-3 h-[26px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded font-bold text-[11px] shadow-2xs transition shrink-0"
                title="فحص المستند وتصحيح الأخطاء الإملائية والنحوية بـ Gemini AI"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>التدقيق اللغوي الذكي (Gemini AI) 🪄</span>
              </button>

              {/* Revision History */}
              <button
                onClick={onOpenRevisionHistory}
                className="flex items-center gap-1.5 px-2.5 h-[26px] bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded font-bold text-[11px] shadow-2xs transition shrink-0"
                title="عرض سجل المراجعة واستعادة النسخ السابقة"
              >
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>سجل المراجعة 🕒</span>
              </button>

              {/* Word Count */}
              <button
                onClick={() => {
                  const clean = docState.contentHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                  const words = clean ? clean.split(/\s+/).length : 0;
                  const chars = clean.length;
                  alert(`إحصائيات المستند:\n- عدد الكلمات: ${words}\n- عدد الأحرف: ${chars}\n- عدد الصفحات التقريبية: ${Math.ceil(words / 350) || 1}`);
                }}
                className="flex items-center gap-1 px-2.5 h-[26px] bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-bold shadow-2xs shrink-0"
              >
                <span>إحصاء الكلمات</span>
              </button>

              <div className="w-px h-6 bg-slate-300 mx-1 shrink-0" />

              {/* Table of Contents */}
              <button
                onClick={() => {
                  const tocHtml = `
                    <div style="margin: 16px 0; padding: 14px 18px; border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 6px;">
                      <div style="font-weight: bold; font-size: 14px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">جدول المحتويات والفهارس</div>
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin: 4px 0;"><span>1. المقدمة والتمهيد</span><span>صفحة 1</span></div>
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin: 4px 0;"><span>2. الموضوعات الرئيسية</span><span>صفحة 1</span></div>
                      <div style="display: flex; justify-content: space-between; font-size: 12px; margin: 4px 0;"><span>3. الخاتمة والتوصيات</span><span>صفحة 2</span></div>
                    </div>
                  `;
                  onExecCommand('insertHTML', tocHtml);
                }}
                className="flex items-center gap-1 px-2 h-[26px] bg-white hover:bg-blue-50 border border-slate-300 rounded text-[11px] font-bold shadow-2xs shrink-0"
              >
                <span>جدول المحتويات</span>
              </button>

              {/* Footnote */}
              <button
                onClick={() => {
                  const fn = prompt('أدخل نص الحاشية السفلية:', 'انظر المرجع المعتمد ص 45.');
                  if (fn) {
                    onExecCommand('insertHTML', `<sup style="color: #2563eb; font-weight: bold;">[1]</sup>`);
                    onExecCommand('insertHTML', `<div style="font-size: 11px; color: #64748b; border-top: 1px solid #cbd5e1; margin-top: 12px; padding-top: 4px;">[1] ${fn}</div>`);
                  }
                }}
                className="flex items-center gap-1 px-2 h-[26px] bg-white hover:bg-blue-50 border border-slate-300 rounded text-[11px] font-bold shadow-2xs shrink-0"
              >
                <span>حاشية سفلية</span>
              </button>

              <div className="w-px h-6 bg-slate-300 mx-1 shrink-0" />

              {/* Mail Merge Field */}
              <button
                onClick={() => {
                  const field = prompt('اختر حقل الدمج (مثال: «الاسم»، «رقم_الهوية»، «التاريخ»):', '«الاسم»');
                  if (field) onExecCommand('insertHTML', `<span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${field}</span>`);
                }}
                className="flex items-center gap-1 px-2 h-[26px] bg-white hover:bg-blue-50 border border-slate-300 rounded text-[11px] font-bold shadow-2xs shrink-0"
              >
                <span>حقل دمج</span>
              </button>

              {/* Official Envelope Cover */}
              <button
                onClick={() => {
                  const envHtml = `
                    <div style="margin: 16px 0; padding: 20px; border: 2px dashed #94a3b8; background: #fafafa; border-radius: 8px; width: 340px;">
                      <div style="font-size: 10px; color: #64748b;">المرسل: الإدارة العامة</div>
                      <div style="margin-top: 24px; text-align: center; font-size: 14px; font-weight: bold; color: #1e293b;">إلى المكرم / .................................... المحترم</div>
                    </div>
                  `;
                  onExecCommand('insertHTML', envHtml);
                }}
                className="flex items-center gap-1 px-2 h-[26px] bg-white hover:bg-blue-50 border border-slate-300 rounded text-[11px] font-bold shadow-2xs shrink-0"
              >
                <span>غلاف رسمي</span>
              </button>

              <div className="w-px h-6 bg-slate-300 mx-1 shrink-0" />

              {/* Keyboard Shortcuts */}
              <button
                onClick={() => alert(`اختصارات لوحة المفاتيح:\nCtrl+B: غامق\nCtrl+I: مائل\nCtrl+U: تسطير\nCtrl+Z: تراجع\nCtrl+S: حفظ\nCtrl+P: طباعة`)}
                className="px-2 h-[26px] bg-white hover:bg-blue-50 border border-slate-300 rounded text-[11px] font-bold shadow-2xs shrink-0"
              >
                اختصارات الكيبورد ⌨
              </button>

              {/* Simulator */}
              {onOpenSimulator && (
                <button
                  onClick={onOpenSimulator}
                  className="flex items-center gap-1 px-2 h-[26px] bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-[11px] font-black shadow-2xs shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>محاكاة وفحص</span>
                </button>
              )}
            </div>
          )}

          {/* ================= VIEW TAB (عرض) ================= */}
          {activeTab === 'view' && (
            <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
              <button
                onClick={onPrint}
                className="flex items-center gap-1 px-2.5 h-[26px] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded text-[11px] font-bold shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>معاينة الطباعة A4</span>
              </button>

              <button
                onClick={() => onUpdateDoc({ showRuler: !docState.showRuler })}
                className={`flex items-center gap-1 px-2.5 h-[26px] rounded text-[11px] font-semibold border transition ${
                  docState.showRuler ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>المسطرة {docState.showRuler ? 'مفعلة ✓' : 'معطلة'}</span>
              </button>

              <button
                onClick={() => onUpdateDoc({ isReadingMode: !docState.isReadingMode })}
                className={`flex items-center gap-1 px-2.5 h-[26px] rounded text-[11px] font-semibold border transition ${
                  docState.isReadingMode ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>وضع القراءة</span>
              </button>

              <div className="w-px h-4 bg-slate-300 mx-0.5" />

              {/* Header & Footer Visibility Controls (إظهار وإخفاء الرأس والتذييل) */}
              <div className="flex items-center bg-white border border-slate-300 rounded h-[26px] p-0.5 shadow-2xs gap-1">
                <span className="text-[10px] font-bold text-slate-500 px-1 border-l border-slate-200">الرأس والتذييل:</span>
                
                {/* Toggle Header */}
                <button
                  onClick={() => onUpdateDoc({ showHeader: !(docState.showHeader !== false) })}
                  className={`flex items-center gap-1 px-2 h-full rounded text-[10px] font-bold transition ${
                    docState.showHeader !== false 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                  title={docState.showHeader !== false ? 'إخفاء رأس الصفحة' : 'إظهار رأس الصفحة'}
                >
                  {docState.showHeader !== false ? <Eye className="w-3 h-3 text-blue-600" /> : <EyeOff className="w-3 h-3 text-rose-500" />}
                  <span>رأس الصفحة: {docState.showHeader !== false ? 'ظاهر' : 'مخفي'}</span>
                </button>

                {/* Toggle Footer */}
                <button
                  onClick={() => onUpdateDoc({ showFooter: !(docState.showFooter !== false) })}
                  className={`flex items-center gap-1 px-2 h-full rounded text-[10px] font-bold transition ${
                    docState.showFooter !== false 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                  title={docState.showFooter !== false ? 'إخفاء تذييل الصفحة' : 'إظهار تذييل الصفحة'}
                >
                  {docState.showFooter !== false ? <Eye className="w-3 h-3 text-blue-600" /> : <EyeOff className="w-3 h-3 text-rose-500" />}
                  <span>تذييل الصفحة: {docState.showFooter !== false ? 'ظاهر' : 'مخفي'}</span>
                </button>

                {/* Batch Toggle */}
                <button
                  onClick={() => {
                    const hideBoth = docState.showHeader !== false || docState.showFooter !== false;
                    onUpdateDoc({
                      showHeader: !hideBoth,
                      showFooter: !hideBoth
                    });
                  }}
                  className="px-2 h-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                  title="إخفاء أو إظهار الرأس والتذييل دفعة واحدة"
                >
                  {docState.showHeader === false && docState.showFooter === false ? 'إظهار الرأس والتذييل 👁️' : 'إخفاء الرأس والتذييل 🙈'}
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center bg-white border border-slate-300 rounded h-[26px] shadow-2xs">
                <button
                  onClick={() => onUpdateDoc({ zoom: Math.max(docState.zoom - 10, 40) })}
                  className="px-1.5 h-full hover:bg-slate-100 text-slate-700"
                  title="تصغير"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-1.5 text-[11px] font-bold text-slate-800 min-w-[40px] text-center">
                  {docState.zoom}%
                </span>
                <button
                  onClick={() => onUpdateDoc({ zoom: Math.min(docState.zoom + 10, 200) })}
                  className="px-1.5 h-full hover:bg-slate-100 text-slate-700"
                  title="تكبير"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          </div>

          {/* Left Scroll Chevron */}
          <button
            type="button"
            onClick={() => handleScrollBy(-250)}
            className="h-full px-1.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 border-r border-slate-300 shrink-0 transition cursor-pointer"
            title="تمرير الشريط لليسار"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Find and Replace Modal */}
      {showFindModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-96 space-y-3" dir="rtl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-800">البحث والاستبدال في المستند</h3>
              <button onClick={() => setShowFindModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div>
              <label className="block text-xs text-slate-600 font-semibold mb-1">الكلمة أو العبارة المراد البحث عنها:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="أدخل النص..."
                className="w-full border rounded px-3 py-1.5 text-xs focus:outline-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 font-semibold mb-1">استبدال بـ:</label>
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="النص البديل الجديد..."
                className="w-full border rounded px-3 py-1.5 text-xs focus:outline-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowFindModal(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                onClick={handleFindReplace}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                استبدال الكل
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Save Style Modal */}
      {showSaveStyleModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-[460px] space-y-4 animate-in fade-in zoom-in-95" dir="rtl">
            <div className="flex justify-between items-center border-b pb-2.5">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-800">حفظ النمط الحالي في معرض الأنماط السريعة</h3>
              </div>
              <button 
                onClick={() => setShowSaveStyleModal(false)} 
                className="text-slate-400 hover:text-slate-600 w-6 h-6 rounded flex items-center justify-center hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              قم بتسمية النمط الجديد ليتم إضافته إلى شريط الأنماط السريعة للوصول السريع وتطبيقه على أي فقرة بنقرة واحدة:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم النمط الجديد:</label>
              <input
                type="text"
                value={newStyleName}
                onChange={(e) => setNewStyleName(e.target.value)}
                placeholder="مثال: عنوان رئيسي مخصص، ملاحظة هامة..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCurrentStyle();
                }}
              />
            </div>

            {/* Captured Style Attributes Overview */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 block text-[11px]">خصائص التنسيق الحالية المحفوظة:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="font-semibold">نوع الخط:</span>
                  <span className="font-bold text-purple-900 truncate">{docState.fontFamily}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="font-semibold">الحجم:</span>
                  <span className="font-bold text-purple-900">{docState.fontSize || 14} pt</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="font-semibold">لون النص:</span>
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: docState.textColor || '#000000' }} />
                  <span className="font-mono text-[10px]">{docState.textColor || '#000000'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="font-semibold">لون الخلفية:</span>
                  <div className="w-3.5 h-3.5 rounded border border-slate-300 shadow-2xs" style={{ backgroundColor: docState.paragraphBgColor || 'transparent' }} />
                  <span className="text-[10px]">{docState.paragraphBgColor && docState.paragraphBgColor !== 'transparent' ? docState.paragraphBgColor : 'بدون'}</span>
                </div>
              </div>
            </div>

            {/* Live Preview Box */}
            <div>
              <span className="block text-[11px] font-bold text-slate-600 mb-1">معاينة شكل النمط:</span>
              <div 
                className="p-3 rounded-xl border border-dashed border-purple-300 bg-white text-center shadow-inner"
                style={{
                  fontFamily: docState.fontFamily,
                  fontSize: `${Math.min(20, Math.max(12, docState.fontSize || 14))}px`,
                  fontWeight: docState.isBold ? 'bold' : 'normal',
                  color: docState.textColor || '#000000',
                  backgroundColor: docState.paragraphBgColor && docState.paragraphBgColor !== 'transparent' ? docState.paragraphBgColor : '#fdf4ff',
                }}
              >
                بسم الله الرحمن الرحيم - معاينة شكل النمط الجديد
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowSaveStyleModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold hover:bg-slate-100 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveCurrentStyle}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>حفظ وإضافة إلى الشريط</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Margins Modal */}
      {showCustomMarginsModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-[460px] space-y-4 animate-in fade-in zoom-in-95" dir="rtl">
            <div className="flex justify-between items-center border-b pb-2.5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-800">إعداد الهوامش المخصصة للمستند</h3>
              </div>
              <button 
                onClick={() => setShowCustomMarginsModal(false)} 
                className="text-slate-400 hover:text-slate-600 w-6 h-6 rounded flex items-center justify-center hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              قم بضبط مسافات الهوامش الأربعة بالسنتمتر بدقة. أقل حجم مسموح به هو 0.2 سم وما فوق:
            </p>

            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
              <span>📌</span>
              <span>الحد الأدنى المعتمد للهوامش هو 0.2 سم فما فوق لتحقيق أقصى مساحة للكتابة والطباعة الدقيقة.</span>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">الهامش العلوي (Top):</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="10"
                    value={customMargins.top}
                    onChange={(e) => setCustomMargins({ ...customMargins, top: Math.max(0.2, parseFloat(e.target.value) || 0.2) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-xs text-slate-500 font-bold">سم</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">الهامش السفلي (Bottom):</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="10"
                    value={customMargins.bottom}
                    onChange={(e) => setCustomMargins({ ...customMargins, bottom: Math.max(0.2, parseFloat(e.target.value) || 0.2) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-xs text-slate-500 font-bold">سم</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">الهامش الأيمن (Right):</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="10"
                    value={customMargins.right}
                    onChange={(e) => setCustomMargins({ ...customMargins, right: Math.max(0.2, parseFloat(e.target.value) || 0.2) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-xs text-slate-500 font-bold">سم</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">الهامش الأيسر (Left):</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="10"
                    value={customMargins.left}
                    onChange={(e) => setCustomMargins({ ...customMargins, left: Math.max(0.2, parseFloat(e.target.value) || 0.2) })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-xs text-slate-500 font-bold">سم</span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500">نماذج جاهزة:</span>
              <button
                onClick={() => setCustomMargins({ top: 0.2, bottom: 0.2, left: 0.2, right: 0.2 })}
                className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[10px] font-bold transition border border-emerald-300"
              >
                الحد الأدنى (0.2 سم) ★
              </button>
              <button
                onClick={() => setCustomMargins({ top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 })}
                className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded text-[10px] font-bold transition border border-blue-200"
              >
                فائق الضيق (0.5 سم)
              </button>
              <button
                onClick={() => setCustomMargins({ top: 1.27, bottom: 1.27, left: 1.27, right: 1.27 })}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold transition"
              >
                مكثف (1.27)
              </button>
              <button
                onClick={() => setCustomMargins({ top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 })}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold transition"
              >
                قياسي (2.54)
              </button>
              <button
                onClick={() => setCustomMargins({ top: 3.0, bottom: 3.0, left: 2.0, right: 2.0 })}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold transition"
              >
                ترويسة رسمية (3 سم)
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowCustomMarginsModal(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  const sanitized = {
                    top: Math.max(0.2, Number(customMargins.top) || 0.2),
                    bottom: Math.max(0.2, Number(customMargins.bottom) || 0.2),
                    left: Math.max(0.2, Number(customMargins.left) || 0.2),
                    right: Math.max(0.2, Number(customMargins.right) || 0.2),
                  };
                  onUpdateDoc({
                    margins: 'custom',
                    customMargins: sanitized
                  });
                  setShowCustomMarginsModal(false);
                }}
                className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
              >
                تطبيق الهوامش المخصصة ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive All Paper Sizes Modal (A0-A6 & B0-B5 & US Standards) */}
      {showAllPaperSizesModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 space-y-4 animate-in fade-in zoom-in-95 border border-slate-300 max-h-[90vh] flex flex-col" dir="rtl">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">دليل أحجام ومقاسات الورق العالمية (Paper Sizes)</h3>
              </div>
              <button
                onClick={() => setShowAllPaperSizesModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {/* Category 1: A-Series */}
              <div>
                <div className="font-bold text-xs text-blue-800 bg-blue-50/70 px-3 py-1.5 rounded-lg mb-2 flex items-center justify-between">
                  <span>سلسلة A العالمية (ISO 216 A-Series)</span>
                  <span className="text-[10px] text-blue-600 font-normal">الأكثر استخداماً للمستندات والخطابات والطباعة</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'A4', name: 'A4 (210 × 297 مم)', desc: 'الحجم العادي القياسي للمستندات والفواتير والتقارير اليومية' },
                    { id: 'A3', name: 'A3 (297 × 420 مم)', desc: 'يُستخدم للمخططات والجداول العريضة واللوحات الهندسية' },
                    { id: 'A5', name: 'A5 (148 × 210 مم)', desc: 'يُستخدم للكتيبات والدفاتر الصغيرة وكتب الجيب' },
                    { id: 'A6', name: 'A6 (105 × 148 مم)', desc: 'يُستخدم للبطاقات البريدية والملاحظات السريعة' },
                    { id: 'A2', name: 'A2 (420 × 594 مم)', desc: 'يُستخدم للبوسترات والرسومات والتقاويم الجدارية' },
                    { id: 'A1', name: 'A1 (594 × 841 مم)', desc: 'خرائط ومشاريع هندسية وتصاميم معمارية كبرى' },
                    { id: 'A0', name: 'A0 (841 × 1189 مم)', desc: 'أكبر أحجام السلسلة، للوحات الإعلانية والخرائط الكبرى' },
                  ].map((p) => {
                    const isCurrent = docState.paperSize === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onUpdateDoc({ paperSize: p.id as any });
                          setShowAllPaperSizesModal(false);
                        }}
                        className={`text-right p-2.5 rounded-xl border transition flex items-start justify-between ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-slate-50/70 hover:bg-blue-50/50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">{p.name}</div>
                          <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>
                            {p.desc}
                          </div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 2: B-Series */}
              <div>
                <div className="font-bold text-xs text-emerald-800 bg-emerald-50/70 px-3 py-1.5 rounded-lg mb-2 flex items-center justify-between">
                  <span>سلسلة B للمطابع ودور النشر (ISO 216 B-Series)</span>
                  <span className="text-[10px] text-emerald-600 font-normal">المقاسات المتوسطة للمجلات والكتب والملصقات</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'B5', name: 'B5 (176 × 250 مم)', desc: 'يُستخدم للكتب الجامعية والمذكرات والكتيبات الأكاديمية' },
                    { id: 'B4', name: 'B4 (250 × 353 مم)', desc: 'يُستخدم للمجلات الكبيرة والصحف الإقليمية وقوائم الطعام' },
                    { id: 'B3', name: 'B3 (353 × 500 مم)', desc: 'يُستخدم للمطبوعات الفنية والرسوم التوضيحية' },
                    { id: 'B2', name: 'B2 (500 × 707 مم)', desc: 'يُستخدم للملصقات الجدارية ولوحات العرض' },
                    { id: 'B1', name: 'B1 (707 × 1000 مم)', desc: 'خرائط جغرافية تفصيلية وبوسترات المعارض' },
                    { id: 'B0', name: 'B0 (1000 × 1414 مم)', desc: 'ملصقات تجارية وإعلانات الطرق الضخمة' },
                  ].map((p) => {
                    const isCurrent = docState.paperSize === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onUpdateDoc({ paperSize: p.id as any });
                          setShowAllPaperSizesModal(false);
                        }}
                        className={`text-right p-2.5 rounded-xl border transition flex items-start justify-between ${
                          isCurrent
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                            : 'bg-slate-50/70 hover:bg-emerald-50/50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">{p.name}</div>
                          <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {p.desc}
                          </div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 3: North American Standards */}
              <div>
                <div className="font-bold text-xs text-amber-800 bg-amber-50/70 px-3 py-1.5 rounded-lg mb-2 flex items-center justify-between">
                  <span>المقاسات الأمريكية والقانونية (US Standards)</span>
                  <span className="text-[10px] text-amber-600 font-normal">المستندات القانونية والعقود الرسمية</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Letter', name: 'Letter (216 × 279 مم)', desc: 'شائع جداً في طابعات أمريكا الشمالية' },
                    { id: 'Legal', name: 'Legal (216 × 356 مم)', desc: 'للعقود والوثائق القضائية والمحاكم' },
                    { id: 'Executive', name: 'Executive (184 × 267 مم)', desc: 'تقارير تنفيذية ومذكرات مجالس الإدارة' },
                  ].map((p) => {
                    const isCurrent = docState.paperSize === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onUpdateDoc({ paperSize: p.id as any });
                          setShowAllPaperSizesModal(false);
                        }}
                        className={`text-right p-2.5 rounded-xl border transition flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                            : 'bg-slate-50/70 hover:bg-amber-50/50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-xs">{p.name}</span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                        </div>
                        <div className={`text-[10px] mt-1 ${isCurrent ? 'text-amber-100' : 'text-slate-500'}`}>
                          {p.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t shrink-0">
              <span className="text-xs text-slate-500">
                المقاس المختار حالياً: <span className="font-bold text-blue-600">{docState.paperSize}</span>
              </span>
              <button
                onClick={() => setShowAllPaperSizesModal(false)}
                className="px-5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Arabic Calligraphy & Fonts Gallery Modal (معرض وأنواع الخطوط النصية العربية) */}
      {showFontGalleryModal && (
        <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 border border-slate-300 max-h-[90vh] flex flex-col font-sans" 
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3.5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                    <span>معرض وأنواع الخطوط النصية العربية</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                      أصالة الخط العربي ✒️
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    خط النسخ • خط الرقعة • الخط الكوفي • خط الثلث • الخط الفارسي • الخط الديواني • المغربي والإجازة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFontGalleryModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition font-bold"
                title="إغلاق المعرض"
              >
                ✕
              </button>
            </div>

            {/* Test Text & Scope Controls */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5 shrink-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    جملة المعاينة الحية (اكتب نصاً لتجربته على كافة الخطوط فورياً):
                  </label>
                  <input
                    type="text"
                    value={fontTestText}
                    onChange={(e) => setFontTestText(e.target.value)}
                    placeholder="أدخل نص المعاينة هنا..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
                  />
                </div>

                <div className="sm:w-64">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    نطاق تطبيق الخط المختار:
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-white p-0.5 rounded-lg border border-slate-300">
                    <button
                      type="button"
                      onClick={() => setFontApplyScope('selected')}
                      className={`py-1 text-[10px] font-bold rounded transition ${
                        fontApplyScope === 'selected'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      المحدد
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontApplyScope('paragraph')}
                      className={`py-1 text-[10px] font-bold rounded transition ${
                        fontApplyScope === 'paragraph'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      الفقرة
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontApplyScope('wholeDoc')}
                      className={`py-1 text-[10px] font-bold rounded transition ${
                        fontApplyScope === 'wholeDoc'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      المستند
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {[
                  { id: 'all', label: 'كافة الخطوط' },
                  { id: 'خط النسخ', label: '📜 خط النسخ' },
                  { id: 'خط الرقعة', label: '🖋️ خط الرقعة' },
                  { id: 'الخط الكوفي', label: '🏛️ الخط الكوفي' },
                  { id: 'خط الثلث', label: '✒️ خط الثلث' },
                  { id: 'الخط الفارسي', label: '🎨 الخط الفارسي' },
                  { id: 'الخط الديواني', label: '📜 الخط الديواني' },
                  { id: 'الخط المغربي والإجازة', label: '🌿 المغربي والإجازة' },
                  { id: 'الخطوط العصرية', label: '💻 الخطوط العصرية' },
                  { id: 'الخطوط القياسية', label: '🌐 القياسية' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFontGalleryCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap font-bold transition cursor-pointer ${
                      fontGalleryCategory === cat.id
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Cards Grid */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {WORD_FONT_FAMILIES
                  .filter((f) => fontGalleryCategory === 'all' || f.category === fontGalleryCategory)
                  .map((font) => {
                    const isSelected = (docState.fontFamily || "'Amiri', serif").includes(font.primary);
                    return (
                      <div
                        key={font.name}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/40 shadow-sm ring-1 ring-amber-400'
                            : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-slate-900 text-xs">{font.name}</span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                                {font.badge}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              {font.category}
                            </span>
                          </div>

                          {font.desc && (
                            <p className="text-[10px] text-slate-500 mb-2 leading-tight">
                              {font.desc}
                            </p>
                          )}

                          {/* Live Typographic Calligraphy Preview */}
                          <div 
                            className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-right leading-loose min-h-[56px] flex items-center justify-start text-slate-900"
                            style={{ 
                              fontFamily: font.value,
                              fontSize: font.category === 'الخط الفارسي' || font.category === 'خط الثلث' || font.category === 'الخط الديواني' ? '20px' : '17px'
                            }}
                          >
                            {fontTestText || font.preview}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[9.5px] font-mono text-slate-400">
                            {font.primary}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              applyFontFamily(font.value, fontApplyScope);
                              setShowFontGalleryModal(false);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                : 'bg-slate-900 hover:bg-amber-600 text-white'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>الخط الحالي ✓</span>
                              </>
                            ) : (
                              <span>تطبيق هذا الخط ✍️</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t shrink-0">
              <span className="text-xs text-slate-500">
                الخط النشط حالياً: <span className="font-bold text-amber-700">{getFontFamilyDisplayName(docState.fontFamily)}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowFontGalleryModal(false)}
                className="px-5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                إغلاق المعرض
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};
