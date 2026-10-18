import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Indent,
  Outdent,
  Paintbrush,
  Eraser,
  Highlighter,
  PaintBucket,
  Type,
  Sparkles,
  Palette,
  ChevronDown,
  Check,
  Square,
  Scissors,
  Copy,
  Clipboard,
  Undo2,
  Redo2,
  Search,
  Table as TableIcon,
  BookmarkPlus,
  ArrowRightLeft,
  X,
  FilePlus,
  Quote,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import { WordDocumentState } from '../../types';
import { WORD_FONT_FAMILIES } from './WordRibbon';

export const FONT_GROUPS = [
  {
    category: '📜 خط النسخ الأصيل',
    fonts: [
      { name: 'خط النسخ الأصيل (Amiri)', shortName: 'النسخ الأصيل', value: "'Amiri', serif", sample: 'أحمد عبد الوهاب' },
      { name: 'نسخ طباعي (Noto Naskh)', shortName: 'النسخ الطباعي', value: "'Noto Naskh Arabic', serif", sample: 'أحمد عبد الوهاب' },
    ]
  },
  {
    category: '🖋️ خط الرقعة',
    fonts: [
      { name: 'خط الرقعة الأصيل (Aref Ruqaa)', shortName: 'الرقعة الأصيل', value: "'Aref Ruqaa', serif", sample: 'أحمد عبد الوهاب' },
      { name: 'رقعة الحبر بالقصبة (Aref Ruqaa Ink)', shortName: 'رقعة الحبر', value: "'Aref Ruqaa Ink', serif", sample: 'أحمد عبد الوهاب' },
    ]
  },
  {
    category: '🏛️ الخط الكوفي',
    fonts: [
      { name: 'الخط الكوفي البارز (Noto Kufi)', shortName: 'الكوفي البارز', value: "'Noto Kufi Arabic', sans-serif", sample: 'أحمد عبد الوهاب' },
      { name: 'الكوفي الفاطمي (Reem Kufi)', shortName: 'الكوفي الفاطمي', value: "'Reem Kufi', sans-serif", sample: 'أحمد عبد الوهاب' },
      { name: 'الكوفي المربع الهندسي (Reem Kufi Ink)', shortName: 'الكوفي المربع', value: "'Reem Kufi Ink', sans-serif", sample: 'أحمد عبد الوهاب' },
    ]
  },
  {
    category: '✒️ خط الثلث والمصاحف',
    fonts: [
      { name: 'خط الثلث والمصاحف (Amiri Quran)', shortName: 'الثلث والمصاحف', value: "'Amiri Quran', serif", sample: 'أحمد عبد الوهاب' },
      { name: 'شهرزاد المحقق (Scheherazade New)', shortName: 'شهرزاد المحقق', value: "'Scheherazade New', serif", sample: 'أحمد عبد الوهاب' },
    ]
  },
  {
    category: '🎨 الخط الفارسي / النستعليق',
    fonts: [
      { name: 'الفارسي النستعليق (Noto Nastaliq)', shortName: 'الفارسي النستعليق', value: "'Noto Nastaliq Urdu', serif", sample: 'أحمد عبد الوهاب' },
      { name: 'كلزار الفارسي (Gulzar)', shortName: 'كلزار الفارسي', value: "'Gulzar', serif", sample: 'أحمد عبد الوهاب' },
    ]
  },
  {
    category: '📜 الخط الديواني والزخرفي',
    fonts: [
      { name: 'الخط الديواني (Lateef)', shortName: 'الخط الديواني', value: "'Lateef', cursive", sample: 'أحمد عبد الوهاب' },
      { name: 'الديواني الجلي (Rakkas)', shortName: 'الديواني الجلي', value: "'Rakkas', cursive", sample: 'أحمد عبد الوهاب' },
      { name: 'مرحي الزخرفي (Marhey)', shortName: 'مرحي الزخرفي', value: "'Marhey', cursive", sample: 'أحمد عبد الوهاب' },
    ]
  },
  {
    category: '💻 الخطوط العصرية والحديثة',
    fonts: [
      { name: 'القاهرة (Cairo)', shortName: 'القاهرة (Cairo)', value: "'Cairo', sans-serif", sample: 'أحمد عبد الوهاب' },
      { name: 'تجوال (Tajawal)', shortName: 'تجوال (Tajawal)', value: "'Tajawal', sans-serif", sample: 'أحمد عبد الوهاب' },
      { name: 'المراعي (Almarai)', shortName: 'المراعي (Almarai)', value: "'Almarai', sans-serif", sample: 'أحمد عبد الوهاب' },
      { name: 'المسيري (El Messiri)', shortName: 'المسيري (El Messiri)', value: "'El Messiri', sans-serif", sample: 'أحمد عبد الوهاب' },
    ]
  },
  {
    category: '🌐 الخطوط اللاتينية',
    fonts: [
      { name: 'Arial', shortName: 'Arial', value: "Arial, sans-serif", sample: 'Office Pro 2026' },
      { name: 'Times New Roman', shortName: 'Times New Roman', value: "'Times New Roman', serif", sample: 'Office Pro 2026' },
    ]
  }
];

export const getFontDisplayName = (val?: string) => {
  if (!val) return 'النسخ الأصيل (Amiri)';
  for (const group of FONT_GROUPS) {
    for (const f of group.fonts) {
      const primaryKey = f.value.split(',')[0].replace(/['"]/g, '');
      if (val.includes(primaryKey) || f.value === val) {
        return f.shortName;
      }
    }
  }
  return 'النسخ الأصيل';
};

interface WordHomeTabProps {
  docState: WordDocumentState;
  onUpdateDoc: (partial: Partial<WordDocumentState>) => void;
  onExecCommand: (cmd: string, val?: string) => void;
  onOpenFontGallery: () => void;
  onOpenFindReplace: (initialMode?: 'find' | 'replace') => void;
  onOpenSaveStyle: () => void;
  onAddNewPage?: () => void;
  onInsertPageBreak?: () => void;
  onInsertTable?: (rows: number, cols: number) => void;
  customStyles?: Array<{
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
  }>;
  onApplyCustomStyle?: (style: any) => void;
  formatPainterActive: boolean;
  onToggleFormatPainter: (e: React.MouseEvent) => void;
  onApplyFormatPainter: () => void;
}

export const WordHomeTab: React.FC<WordHomeTabProps> = ({
  docState,
  onUpdateDoc,
  onExecCommand,
  onOpenFontGallery,
  onOpenFindReplace,
  onOpenSaveStyle,
  onAddNewPage,
  onInsertPageBreak,
  onInsertTable,
  customStyles = [],
  onApplyCustomStyle,
  formatPainterActive,
  onToggleFormatPainter,
  onApplyFormatPainter,
}) => {
  // Popover State (Only one open at a time, positioned via fixed coordinates so no layer clipping)
  type ActiveDropdownType =
    | null
    | 'fontFamily'
    | 'fontSize'
    | 'textColor'
    | 'highlight'
    | 'tashkeel'
    | 'lineSpacing'
    | 'textEffects'
    | 'paragraphShading'
    | 'paragraphBorders'
    | 'stylesGallery'
    | 'quickTable'
    | 'pasteMenu'
    | 'underlineStyles';

  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdownType>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  // Custom table dimension picker inside Home tab
  const [quickTableRows, setQuickTableRows] = useState(3);
  const [quickTableCols, setQuickTableCols] = useState(3);

  // Text color scopes & recent colors
  const [textColorScope, setTextColorScope] = useState<'selected' | 'paragraph' | 'wholeDoc'>('selected');
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('office_recent_colors');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['#0f172a', '#1e3a8a', '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#475569'];
  });

  // Font Family state & scopes
  const [fontScope, setFontScope] = useState<'selected' | 'paragraph' | 'wholeDoc'>('selected');
  const [fontSearchQuery, setFontSearchQuery] = useState<string>('');

  const filteredFontGroups = useMemo(() => {
    if (!fontSearchQuery.trim()) return FONT_GROUPS;
    const q = fontSearchQuery.trim().toLowerCase();
    return FONT_GROUPS.map((g) => ({
      ...g,
      fonts: g.fonts.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.shortName.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
      ),
    })).filter((g) => g.fonts.length > 0);
  }, [fontSearchQuery]);

  // Hovered font for live typographic preview on the actual page
  const [hoveredFont, setHoveredFont] = useState<string | null>(null);

  const handleFontHover = (familyValue: string) => {
    setHoveredFont(familyValue);
    const allEditors = document.querySelectorAll<HTMLElement>('[data-doc-editor="true"]');
    allEditors.forEach((ed) => {
      ed.style.fontFamily = familyValue;
    });
  };

  const handleFontHoverEnd = () => {
    setHoveredFont(null);
    const allEditors = document.querySelectorAll<HTMLElement>('[data-doc-editor="true"]');
    allEditors.forEach((ed) => {
      ed.style.fontFamily = docState.fontFamily || "'Amiri', serif";
    });
  };

  const handleFontSelect = (familyValue: string) => {
    setHoveredFont(null);
    applyFontFamily(familyValue, fontScope);
    setActiveDropdown(null);
  };

  // Track selection in document across any page
  const savedSelectionRef = useRef<Range | null>(null);

  const isInsideEditor = (node: Node | null) => {
    if (!node) return false;
    const el = node.nodeType === 1 ? (node as HTMLElement) : node.parentElement;
    return Boolean(el?.closest('[data-doc-editor="true"]') || el?.closest('[data-word-target]'));
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (isInsideEditor(range.commonAncestorContainer)) {
          savedSelectionRef.current = range.cloneRange();
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
      if (isInsideEditor(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedSelectionRef.current && sel) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
        const container = savedSelectionRef.current.commonAncestorContainer;
        const targetEl = container.nodeType === 1 ? (container as HTMLElement) : container.parentElement;
        targetEl?.focus();
        return;
      } catch (e) {}
    }
    const defaultEditor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || (document.querySelector('[data-doc-editor="true"]') as HTMLElement)
      || document.getElementById('word-body-editable');
    defaultEditor?.focus();
  };

  const handleBtnMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    saveCurrentSelection();
  };

  // Close dropdown on outside click without blocking user clicks
  useEffect(() => {
    if (!activeDropdown) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.home-ribbon-popover, .home-ribbon-trigger')) {
        return;
      }
      setActiveDropdown(null);
      if (hoveredFont) {
        handleFontHoverEnd();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [activeDropdown, hoveredFont]);

  // Open / Toggle dropdown with calculated fixed coordinates
  const toggleDropdown = (id: ActiveDropdownType, e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    saveCurrentSelection();

    if (activeDropdown === id) {
      setActiveDropdown(null);
      return;
    }

    // Auto-detect font scope if text is selected
    if (id === 'fontFamily') {
      const sel = window.getSelection();
      const hasSel = (sel && sel.rangeCount > 0 && !sel.isCollapsed) || (savedSelectionRef.current && !savedSelectionRef.current.collapsed);
      if (!hasSel) {
        setFontScope('wholeDoc');
      }
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const top = rect.bottom + 6;
    let right = window.innerWidth - rect.right;
    if (right + 250 > window.innerWidth) {
      right = Math.max(8, window.innerWidth - 250);
    }
    if (right < 8) right = 8;
    setDropdownCoords({ top, right });
    setActiveDropdown(id);
  };

  // Helper to get full multi-page document HTML
  const getFullDocHtml = () => {
    const pages = document.querySelectorAll<HTMLElement>('[data-doc-editor="true"]');
    if (pages.length === 0) {
      const single = document.getElementById('word-body-editable');
      return single ? single.innerHTML : '';
    }
    if (pages.length === 1) {
      return pages[0].innerHTML;
    }
    const chunks: string[] = [];
    pages.forEach((p) => {
      chunks.push(p.innerHTML);
    });
    return chunks.join('<div class="word-page-break" contenteditable="false" data-page-break="true"></div>');
  };

  // Execute standard formatting
  const handleFormat = (command: string, value: string = '') => {
    restoreSelection();
    const editor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || (document.querySelector('[data-doc-editor="true"]') as HTMLElement)
      || document.getElementById('word-body-editable');
    if (editor) editor.focus();
    restoreSelection();

    try {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand(command, false, value);
    } catch (err) {}
    saveCurrentSelection();

    if (editor) {
      onUpdateDoc({ contentHtml: getFullDocHtml() });
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  // Clear all formatting
  const handleClearFormatting = () => {
    restoreSelection();
    const editor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || (document.querySelector('[data-doc-editor="true"]') as HTMLElement)
      || document.getElementById('word-body-editable');
    if (editor) editor.focus();
    restoreSelection();

    document.execCommand('removeFormat', false);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const parentEl = container.nodeType === 1 ? (container as HTMLElement) : container.parentElement;
      if (parentEl && ['SPAN', 'FONT', 'B', 'I', 'U', 'EM', 'STRONG', 'MARK'].includes(parentEl.tagName)) {
        parentEl.removeAttribute('style');
        parentEl.removeAttribute('color');
        parentEl.removeAttribute('face');
        parentEl.removeAttribute('size');
      }
    }
    if (editor) {
      onUpdateDoc({ contentHtml: getFullDocHtml() });
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
    setActiveDropdown(null);
  };

  // Apply Font Family cleanly to selection, paragraph, or whole document
  const applyFontFamily = (familyValue: string, explicitScope?: 'selected' | 'paragraph' | 'wholeDoc') => {
    const scope = explicitScope || fontScope;
    restoreSelection();
    const sel = window.getSelection();
    const effectiveRange = (sel && sel.rangeCount > 0 && !sel.isCollapsed) 
      ? sel.getRangeAt(0) 
      : (savedSelectionRef.current && !savedSelectionRef.current.collapsed ? savedSelectionRef.current : null);
    const hasSelection = Boolean(effectiveRange && !effectiveRange.collapsed);

    const allEditors = document.querySelectorAll<HTMLElement>('[data-doc-editor="true"]');

    if (scope === 'wholeDoc' || (!hasSelection && scope === 'selected')) {
      // 1. Whole Document: Apply to all pages and clear inline overrides
      allEditors.forEach((ed) => {
        ed.style.fontFamily = familyValue;
        const elements = ed.querySelectorAll('span, p, div, h1, h2, h3, h4, h5, h6, li, td, th');
        elements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style && htmlEl.style.fontFamily) {
            htmlEl.style.fontFamily = familyValue;
          }
        });
      });
      onUpdateDoc({ fontFamily: familyValue, contentHtml: getFullDocHtml() });
    } else if (scope === 'paragraph') {
      // 2. Current Paragraph
      let node: Node | null = sel?.anchorNode || (effectiveRange?.commonAncestorContainer || null);
      let targetBlock: HTMLElement | null = null;
      while (node && !(node instanceof HTMLElement && node.hasAttribute('data-doc-editor'))) {
        if (node.nodeType === 1 && ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'LI', 'TD'].includes((node as HTMLElement).tagName)) {
          targetBlock = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }
      if (targetBlock) {
        targetBlock.style.fontFamily = familyValue;
        targetBlock.querySelectorAll('span').forEach((s) => {
          s.style.fontFamily = familyValue;
        });
      } else {
        allEditors.forEach((ed) => {
          ed.style.fontFamily = familyValue;
        });
      }
      onUpdateDoc({ fontFamily: familyValue, contentHtml: getFullDocHtml() });
    } else {
      // 3. Selected Text
      if (hasSelection && effectiveRange) {
        try {
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(effectiveRange);
          }
          const span = document.createElement('span');
          span.style.fontFamily = familyValue;
          span.appendChild(effectiveRange.extractContents());
          effectiveRange.insertNode(span);

          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          sel?.removeAllRanges();
          sel?.addRange(newRange);
          savedSelectionRef.current = newRange.cloneRange();
        } catch (e) {
          try {
            document.execCommand('styleWithCSS', false, 'true');
            document.execCommand('fontName', false, familyValue);
          } catch {}
        }
        onUpdateDoc({ fontFamily: familyValue, contentHtml: getFullDocHtml() });
      } else {
        allEditors.forEach((ed) => {
          ed.style.fontFamily = familyValue;
        });
        onUpdateDoc({ fontFamily: familyValue, contentHtml: getFullDocHtml() });
      }
    }

    const activeEditor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || document.getElementById('word-body-editable');
    if (activeEditor) {
      activeEditor.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  // Apply Font Size
  const applyFontSize = (size: number) => {
    restoreSelection();
    const editor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || (document.querySelector('[data-doc-editor="true"]') as HTMLElement)
      || document.getElementById('word-body-editable');
    if (!editor) return;

    editor.focus();
    restoreSelection();
    const sel = window.getSelection();

    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      try {
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
      } catch (e) {
        document.execCommand('fontSize', false, '4');
      }
    } else {
      document.querySelectorAll<HTMLElement>('[data-doc-editor="true"]').forEach((ed) => {
        ed.style.fontSize = `${size}pt`;
      });
    }

    onUpdateDoc({ fontSize: size, contentHtml: getFullDocHtml() });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveDropdown(null);
  };

  const changeFontSize = (delta: number) => {
    const current = docState.fontSize || 14;
    const next = Math.max(8, Math.min(72, current + delta));
    applyFontSize(next);
  };

  // Apply Text Color
  const applyTextColor = (color: string) => {
    const editor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || (document.querySelector('[data-doc-editor="true"]') as HTMLElement)
      || document.getElementById('word-body-editable');
    if (!editor) return;

    // Add to recent colors
    setRecentColors((prev) => [color, ...prev.filter((c) => c.toLowerCase() !== color.toLowerCase())].slice(0, 8));
    try {
      localStorage.setItem('office_recent_colors', JSON.stringify([color, ...recentColors.filter((c) => c.toLowerCase() !== color.toLowerCase())].slice(0, 8)));
    } catch {}

    editor.focus();
    restoreSelection();
    const sel = window.getSelection();
    const hasSelection = sel && sel.rangeCount > 0 && !sel.isCollapsed;

    if (textColorScope === 'wholeDoc') {
      document.querySelectorAll<HTMLElement>('[data-doc-editor="true"]').forEach((ed) => {
        ed.style.color = color;
        ed.querySelectorAll('*').forEach((el) => {
          (el as HTMLElement).style.color = color;
        });
      });
    } else if (textColorScope === 'paragraph') {
      let node: Node | null = sel?.anchorNode || editor;
      let targetBlock: HTMLElement | null = null;
      while (node && !(node instanceof HTMLElement && node.hasAttribute('data-doc-editor'))) {
        if (node.nodeType === 1 && ['P', 'H1', 'H2', 'H3', 'H4', 'DIV', 'LI', 'TD'].includes((node as HTMLElement).tagName)) {
          targetBlock = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }
      if (targetBlock) {
        targetBlock.style.color = color;
        targetBlock.querySelectorAll('*').forEach((el) => {
          (el as HTMLElement).style.color = color;
        });
      } else {
        editor.style.color = color;
      }
    } else {
      if (hasSelection && sel) {
        document.execCommand('styleWithCSS', false, 'true');
        const applied = document.execCommand('foreColor', false, color);
        if (!applied) {
          try {
            const range = sel.getRangeAt(0);
            const span = document.createElement('span');
            span.style.color = color;
            span.appendChild(range.extractContents());
            range.insertNode(span);
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            sel.removeAllRanges();
            sel.addRange(newRange);
          } catch (e) {}
        }
      } else {
        editor.style.color = color;
      }
    }

    saveCurrentSelection();
    onUpdateDoc({ textColor: color, contentHtml: getFullDocHtml() });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveDropdown(null);
  };

  // Apply Highlight Color
  const applyHighlightColor = (color: string) => {
    restoreSelection();
    const editor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || (document.querySelector('[data-doc-editor="true"]') as HTMLElement)
      || document.getElementById('word-body-editable');
    if (!editor) return;
    editor.focus();
    restoreSelection();

    const sel = window.getSelection();
    const hasSelection = sel && sel.rangeCount > 0 && !sel.isCollapsed;

    if (color === 'transparent' || !color) {
      if (hasSelection && sel) {
        document.execCommand('removeFormat', false);
      }
      document.querySelectorAll<HTMLElement>('[data-doc-editor="true"] mark').forEach((m) => {
        const parent = m.parentNode;
        while (m.firstChild) parent?.insertBefore(m.firstChild, m);
        parent?.removeChild(m);
      });
    } else {
      if (hasSelection && sel) {
        try {
          const range = sel.getRangeAt(0);
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
        } catch (e) {
          document.execCommand('hiliteColor', false, color);
        }
      }
    }

    onUpdateDoc({ highlightColor: color, contentHtml: getFullDocHtml() });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveDropdown(null);
  };

  // Apply Tashkeel Diacritic
  const applyDiacritic = (char: string) => {
    restoreSelection();
    onExecCommand('insertText', char);
    const editor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || (document.querySelector('[data-doc-editor="true"]') as HTMLElement)
      || document.getElementById('word-body-editable');
    if (editor) {
      onUpdateDoc({ contentHtml: getFullDocHtml() });
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  // Remove All Tashkeel
  const handleRemoveAllTashkeel = () => {
    restoreSelection();
    const editor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || (document.querySelector('[data-doc-editor="true"]') as HTMLElement)
      || document.getElementById('word-body-editable');
    if (!editor) return;

    const sel = window.getSelection();
    const tashkeelRegex = /[\u064B-\u065F\u0670\u0640]/g;

    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const text = range.toString();
      const stripped = text.replace(tashkeelRegex, '');
      document.execCommand('insertText', false, stripped);
    } else {
      document.querySelectorAll<HTMLElement>('[data-doc-editor="true"]').forEach((ed) => {
        ed.innerHTML = ed.innerHTML.replace(tashkeelRegex, '');
      });
    }

    onUpdateDoc({ contentHtml: getFullDocHtml() });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveDropdown(null);
  };

  // Apply Paragraph Shading
  const applyParagraphShading = (color: string) => {
    restoreSelection();
    const editor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || (document.querySelector('[data-doc-editor="true"]') as HTMLElement)
      || document.getElementById('word-body-editable');
    if (!editor) return;
    editor.focus();

    const sel = window.getSelection();
    let targetBlock: HTMLElement | null = null;
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode;
      while (node && !(node instanceof HTMLElement && node.hasAttribute('data-doc-editor'))) {
        if (node.nodeType === 1 && ['P', 'H1', 'H2', 'H3', 'H4', 'DIV', 'BLOCKQUOTE', 'LI', 'TD'].includes((node as HTMLElement).tagName)) {
          targetBlock = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }
    }
    if (!targetBlock) {
      targetBlock = editor.querySelector('p, h1, h2, h3, div') as HTMLElement | null;
    }

    if (targetBlock) {
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

    onUpdateDoc({ paragraphBgColor: color, contentHtml: getFullDocHtml() });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveDropdown(null);
  };

  // Apply Paragraph Border
  const applyParagraphBorder = (borderType: 'all' | 'box' | 'bottom' | 'top' | 'right' | 'left' | 'double_bottom' | 'none') => {
    restoreSelection();
    const editor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || (document.querySelector('[data-doc-editor="true"]') as HTMLElement)
      || document.getElementById('word-body-editable');
    if (!editor) return;
    editor.focus();

    const sel = window.getSelection();
    let targetBlock: HTMLElement | null = null;
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode;
      while (node && !(node instanceof HTMLElement && node.hasAttribute('data-doc-editor'))) {
        if (node.nodeType === 1 && ['P', 'H1', 'H2', 'H3', 'H4', 'DIV', 'BLOCKQUOTE', 'LI', 'TD'].includes((node as HTMLElement).tagName)) {
          targetBlock = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }
    }
    if (!targetBlock) {
      targetBlock = editor.querySelector('p, h1, h2, h3, div') as HTMLElement | null;
    }

    if (targetBlock) {
      targetBlock.style.border = '';
      targetBlock.style.borderTop = '';
      targetBlock.style.borderBottom = '';
      targetBlock.style.borderRight = '';
      targetBlock.style.borderLeft = '';
      targetBlock.style.padding = '';

      if (borderType === 'none') {
        // cleared
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

    onUpdateDoc({ contentHtml: getFullDocHtml() });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveDropdown(null);
  };

  // Apply Alignment
  const applyAlignment = (align: 'right' | 'center' | 'left' | 'justify') => {
    restoreSelection();
    onUpdateDoc({ textAlign: align });
    const editor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || (document.querySelector('[data-doc-editor="true"]') as HTMLElement)
      || document.getElementById('word-body-editable');
    const sel = window.getSelection();

    if (sel && sel.rangeCount > 0 && editor) {
      let node: Node | null = sel.anchorNode;
      while (node && !(node instanceof HTMLElement && node.hasAttribute('data-doc-editor'))) {
        if (node.nodeType === 1 && ['P', 'H1', 'H2', 'H3', 'H4', 'DIV', 'BLOCKQUOTE', 'LI', 'TD'].includes((node as HTMLElement).tagName)) {
          (node as HTMLElement).style.textAlign = align;
          break;
        }
        node = node.parentNode;
      }
    }
    const cmd = align === 'right' ? 'justifyRight' : align === 'center' ? 'justifyCenter' : align === 'left' ? 'justifyLeft' : 'justifyFull';
    try {
      document.execCommand(cmd, false);
    } catch (e) {}
    if (editor) {
      onUpdateDoc({ textAlign: align, contentHtml: getFullDocHtml() });
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  // Apply Heading Style
  const applyHeadingStyle = (tag: 'h1' | 'h2' | 'h3' | 'p' | 'blockquote' | 'callout') => {
    restoreSelection();
    const editor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || (document.querySelector('[data-doc-editor="true"]') as HTMLElement)
      || document.getElementById('word-body-editable');
    if (!editor) return;
    editor.focus();

    if (tag === 'callout') {
      const calloutHtml = `
        <div style="background-color: #eff6ff; border-right: 4px solid #2563eb; border-radius: 6px; padding: 10px 14px; margin: 10px 0; color: #1e3a8a; font-weight: bold;">
          💡 ملاحظة هامة: أدخل تفاصيل التنبيه هنا...
        </div>
      `;
      document.execCommand('insertHTML', false, calloutHtml);
    } else if (tag === 'blockquote') {
      const quoteHtml = `
        <blockquote style="border-right: 3px solid #b45309; padding-right: 14px; margin: 12px 0; font-family: 'Amiri', serif; font-size: 16px; color: #78350f; font-style: italic;">
          «بسم الله الرحمن الرحيم - نص الاقتباس المعتمد»
        </blockquote>
      `;
      document.execCommand('insertHTML', false, quoteHtml);
    } else {
      document.execCommand('formatBlock', false, tag);
    }

    onUpdateDoc({ contentHtml: getFullDocHtml() });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveDropdown(null);
  };

  // Text Effects
  const textEffectsList = [
    { id: 'shadow_3d', name: 'ظل ثلاثي الأبعاد 3D', style: 'text-shadow: 2px 2px 0px #94a3b8, 3px 3px 0px #cbd5e1; font-weight: bold;' },
    { id: 'gold_glow', name: 'توهج ذهبي فاخر', style: 'text-shadow: 0 0 8px #f59e0b, 0 0 16px #fbbf24; color: #78350f; font-weight: bold;' },
    { id: 'neon_blue', name: 'توهج نيون أزرق', style: 'text-shadow: 0 0 8px #3b82f6, 0 0 16px #60a5fa; color: #1e3a8a; font-weight: bold;' },
    { id: 'bold_outline', name: 'تحديد خارجي داكن', style: '-webkit-text-stroke: 1px #0f172a; color: #ffffff; font-weight: 900;' },
    { id: 'soft_emboss', name: 'نقش محفور هادئ', style: 'text-shadow: 1px 1px 1px #ffffff, -1px -1px 1px #94a3b8; color: #475569; font-weight: bold;' },
    { id: 'grad_navy', name: 'تدرج كحلي ملكي', style: 'background: linear-gradient(90deg, #1e3a8a, #2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold;' },
    { id: 'grad_gold', name: 'تدرج ذهبي ديواني', style: 'background: linear-gradient(90deg, #b45309, #d97706, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold;' },
  ];

  const applyTextEffect = (styleString: string) => {
    restoreSelection();
    const editor = (document.querySelector('[data-doc-editor="true"]:focus') as HTMLElement)
      || (document.querySelector('[data-doc-editor="true"]') as HTMLElement)
      || document.getElementById('word-body-editable');
    if (!editor) return;
    editor.focus();

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
      const html = `<span style="${styleString}">نص بتأثير مميز</span>`;
      document.execCommand('insertHTML', false, html);
    }
    onUpdateDoc({ contentHtml: editor.innerHTML });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveDropdown(null);
  };

  // Underline styles
  const applyUnderlineStyle = (style: 'single' | 'double' | 'dotted' | 'wavy' | 'none') => {
    restoreSelection();
    const editor = document.getElementById('word-body-editable');
    if (!editor) return;
    editor.focus();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed && editor.contains(sel.anchorNode)) {
      try {
        const range = sel.getRangeAt(0);
        const span = document.createElement('span');
        if (style === 'none') {
          span.style.textDecoration = 'none';
        } else if (style === 'double') {
          span.style.textDecoration = 'underline double';
        } else if (style === 'dotted') {
          span.style.textDecoration = 'underline dotted';
        } else if (style === 'wavy') {
          span.style.textDecoration = 'underline wavy';
        } else {
          span.style.textDecoration = 'underline';
        }
        span.appendChild(range.extractContents());
        range.insertNode(span);
      } catch (e) {}
    } else {
      handleFormat('underline');
    }

    onUpdateDoc({ contentHtml: editor.innerHTML });
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    setActiveDropdown(null);
  };

  return (
    <div className="flex items-center gap-1.5 flex-nowrap shrink-0 text-slate-800 text-xs py-0.5" dir="rtl">
      
      {/* ================= 1. الحافظة (CLIPBOARD GROUP) ================= */}
      <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[28px] p-0.5 shadow-2xs gap-0.5 shrink-0">
        {/* Paste */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => {
            navigator.clipboard?.readText().then((clipText) => {
              if (clipText) {
                onExecCommand('insertText', clipText);
              } else {
                document.execCommand('paste');
              }
            }).catch(() => {
              document.execCommand('paste');
            });
          }}
          className="flex items-center gap-1 px-2 h-full hover:bg-slate-100 rounded text-[11px] font-bold text-slate-700 transition cursor-pointer"
          title="لصق المحتوى من الحافظة (Ctrl+V)"
        >
          <Clipboard className="w-3.5 h-3.5 text-blue-600" />
          <span>لصق</span>
        </button>

        {/* Cut */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => {
            document.execCommand('cut');
          }}
          className="p-1 h-full hover:bg-slate-100 rounded text-slate-600 transition cursor-pointer"
          title="قص النص المحدد (Ctrl+X)"
        >
          <Scissors className="w-3.5 h-3.5" />
        </button>

        {/* Copy */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => {
            const sel = window.getSelection();
            if (sel && sel.toString()) {
              navigator.clipboard?.writeText(sel.toString());
            } else {
              document.execCommand('copy');
            }
          }}
          className="p-1 h-full hover:bg-slate-100 rounded text-slate-600 transition cursor-pointer"
          title="نسخ النص المحدد (Ctrl+C)"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-slate-200" />

        {/* Format Painter */}
        <button
          type="button"
          onClick={onToggleFormatPainter}
          className={`flex items-center gap-1 px-1.5 h-full rounded text-[11px] font-bold transition cursor-pointer ${
            formatPainterActive ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-500' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="نسخ التنسيق (Format Painter)"
        >
          <Paintbrush className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="hidden sm:inline">نسخ التنسيق</span>
        </button>
        {formatPainterActive && (
          <button
            type="button"
            onClick={onApplyFormatPainter}
            className="px-1.5 h-full bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold"
          >
            تطبيق ✓
          </button>
        )}

        <div className="w-px h-3.5 bg-slate-200" />

        {/* Clear All Formatting */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={handleClearFormatting}
          className="p-1 h-full hover:bg-slate-100 rounded text-slate-600 transition cursor-pointer"
          title="مسح كافة تنسيقات النص المحدد والعودة للوضع الافتراضي"
        >
          <Eraser className="w-3.5 h-3.5 text-rose-500" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-300 mx-0.5 shrink-0" />

      {/* ================= 2. الخط والطباعة (FONT & TYPOGRAPHY GROUP) ================= */}
      <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[28px] p-0.5 shadow-2xs gap-1 shrink-0">
        
        {/* Font Family Selector Custom Trigger Button */}
        <div className="relative inline-block px-0.5">
          <button
            type="button"
            onClick={(e) => toggleDropdown('fontFamily', e)}
            className={`home-ribbon-trigger flex items-center justify-between gap-1.5 px-2 h-[24px] rounded-md border text-[11px] font-bold transition shadow-2xs cursor-pointer ${
              activeDropdown === 'fontFamily'
                ? 'bg-blue-50 text-blue-800 border-blue-400 ring-1 ring-blue-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300 hover:text-blue-700'
            }`}
            title="نوع الخط العربي واللاتيني"
          >
            <div className="flex items-center gap-1.5 truncate max-w-[125px] sm:max-w-[145px]">
              <Type className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate" style={{ fontFamily: docState.fontFamily || "'Amiri', serif" }}>
                {getFontDisplayName(docState.fontFamily)}
              </span>
            </div>
            <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${activeDropdown === 'fontFamily' ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {/* Translucent Glassmorphism Dropdown Menu (بحجم أصغر وخلفية شبه شفافة تُظهر المستند وتغير الخط) */}
          {activeDropdown === 'fontFamily' && (
            <div
              style={{
                top: dropdownCoords.top,
                right: Math.min(Math.max(8, dropdownCoords.right), Math.max(8, window.innerWidth - 245)),
              }}
              className="fixed z-[9999] w-[235px] max-h-[310px] flex flex-col rounded-2xl border border-white/60 bg-white/75 dark:bg-slate-900/80 backdrop-blur-md shadow-2xl text-xs home-ribbon-popover animate-in fade-in zoom-in-95 ring-1 ring-black/10 overflow-hidden"
              onMouseLeave={handleFontHoverEnd}
            >
              {/* Header */}
              <div className="px-2.5 py-1.5 border-b border-slate-200/50 bg-slate-50/60 dark:bg-slate-800/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">الخطوط العربية (معاينة حية)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleFontHoverEnd();
                    setActiveDropdown(null);
                  }}
                  className="p-0.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                  title="إغلاق القائمة"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scope Selector: Selected text vs Paragraph vs Whole Document */}
              <div className="p-1.5 border-b border-slate-200/50 bg-slate-100/40 dark:bg-slate-800/40 shrink-0">
                <div className="grid grid-cols-3 gap-1 bg-white/80 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/60 text-[9.5px] font-bold">
                  <button
                    type="button"
                    onClick={() => setFontScope('selected')}
                    className={`py-0.5 rounded text-center transition cursor-pointer ${
                      fontScope === 'selected'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-blue-700'
                    }`}
                  >
                    المحدد
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontScope('paragraph')}
                    className={`py-0.5 rounded text-center transition cursor-pointer ${
                      fontScope === 'paragraph'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-blue-700'
                    }`}
                  >
                    الفقرة
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontScope('wholeDoc')}
                    className={`py-0.5 rounded text-center transition cursor-pointer ${
                      fontScope === 'wholeDoc'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-blue-700'
                    }`}
                  >
                    المستند
                  </button>
                </div>
              </div>

              {/* Quick Filter Search */}
              <div className="p-1.5 border-b border-slate-200/50 bg-white/40 dark:bg-slate-900/40 shrink-0">
                <div className="relative">
                  <Search className="w-3 h-3 absolute right-2 top-1.5 text-slate-400" />
                  <input
                    type="text"
                    value={fontSearchQuery}
                    onChange={(e) => setFontSearchQuery(e.target.value)}
                    placeholder="ابحث (نسخ، رقعة، كوفي...)"
                    className="w-full pl-2 pr-6 py-0.5 text-[10.5px] bg-white/80 dark:bg-slate-800/80 border border-slate-300/70 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                  />
                  {fontSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setFontSearchQuery('')}
                      className="absolute left-1.5 top-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable List of Font Categories & Items with Live Typographic Hover Preview */}
              <div className="flex-1 overflow-y-auto p-1 space-y-1.5 scrollbar-thin">
                {filteredFontGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-0.5">
                    <div className="px-1.5 py-0.5 text-[9px] font-black text-slate-400 tracking-wider">
                      {group.category}
                    </div>
                    {group.fonts.map((f, fIdx) => {
                      const primaryKey = f.value.split(',')[0].replace(/['"]/g, '');
                      const isCurrent = docState.fontFamily === f.value || docState.fontFamily?.includes(primaryKey);
                      const isHovered = hoveredFont === f.value;
                      return (
                        <button
                          key={fIdx}
                          type="button"
                          onMouseEnter={() => handleFontHover(f.value)}
                          onClick={() => handleFontSelect(f.value)}
                          className={`w-full text-right px-2 py-1 rounded-lg transition flex items-center justify-between group cursor-pointer ${
                            isCurrent || isHovered
                              ? 'bg-blue-600/15 text-blue-900 dark:text-blue-200 font-bold border border-blue-400/50 shadow-2xs'
                              : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex flex-col text-right truncate">
                            <span className="text-[10.5px] font-bold leading-tight">{f.shortName}</span>
                            <span
                              className="text-[12px] text-slate-600 dark:text-slate-300 leading-tight pt-0.5"
                              style={{ fontFamily: f.value }}
                            >
                              {f.sample || 'أحمد عبد الوهاب'}
                            </span>
                          </div>
                          {isCurrent && (
                            <Check className="w-3 h-3 text-blue-600 shrink-0 mr-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Footer: Quick Gallery Button */}
              <div className="p-1 border-t border-slate-200/60 bg-slate-50/60 dark:bg-slate-800/60 flex items-center justify-between shrink-0">
                <span className="text-[9.5px] text-slate-500 truncate max-w-[120px]">
                  الخط: <strong className="text-blue-700">{getFontDisplayName(docState.fontFamily)}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleFontHoverEnd();
                    setActiveDropdown(null);
                    onOpenFontGallery?.();
                  }}
                  className="px-1.5 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 text-[9.5px] font-bold flex items-center gap-0.5 transition cursor-pointer"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  <span>معرض الخطوط</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Font Gallery Visual Button */}
          <button
            type="button"
            onClick={onOpenFontGallery}
            className="px-1 py-0.5 rounded hover:bg-amber-50 text-amber-700 text-[10px] font-bold inline-flex items-center gap-0.5 transition cursor-pointer mr-1"
            title="معرض الخطوط العربية 🎨"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="hidden md:inline">معرض الخطوط</span>
          </button>
        </div>

        <div className="w-px h-3.5 bg-slate-200" />

        {/* Font Size & Steppers */}
        <div className="flex items-center gap-0.5 px-0.5">
          <select
            value={docState.fontSize || 14}
            onMouseDown={handleBtnMouseDown}
            onChange={(e) => applyFontSize(Number(e.target.value))}
            className="bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer w-[48px] text-center"
            title="حجم الخط"
          >
            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 48, 72].map((sz) => (
              <option key={sz} value={sz}>{sz} pt</option>
            ))}
          </select>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => changeFontSize(2)}
            className="px-1 h-full hover:bg-slate-100 rounded text-[11px] font-black text-slate-700 transition cursor-pointer"
            title="تكبير حجم الخط (A+)"
          >
            A+
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => changeFontSize(-2)}
            className="px-1 h-full hover:bg-slate-100 rounded text-[10px] font-bold text-slate-600 transition cursor-pointer"
            title="تصغير حجم الخط (A-)"
          >
            A-
          </button>
        </div>

        <div className="w-px h-3.5 bg-slate-200" />

        {/* Character Formatting Buttons: B, I, U, S, X2, X^2 */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => handleFormat('bold')}
            className={`px-1.5 h-full rounded flex items-center justify-center transition cursor-pointer ${
              docState.isBold ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-400 font-bold' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="عريض (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => handleFormat('italic')}
            className={`px-1.5 h-full rounded flex items-center justify-center transition cursor-pointer ${
              docState.isItalic ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-400 font-bold' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="مائل (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Underline with styles dropdown */}
          <div className="relative inline-flex items-center">
            <button
              type="button"
              onMouseDown={handleBtnMouseDown}
              onClick={() => handleFormat('underline')}
              className={`px-1.5 h-full rounded-r flex items-center justify-center transition cursor-pointer ${
                docState.isUnderline ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-400 font-bold' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="تسطير (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => toggleDropdown('underlineStyles', e)}
              className="px-0.5 h-full hover:bg-slate-200 rounded-l text-slate-500 home-ribbon-trigger transition cursor-pointer"
              title="خيارات وأنماط التسطير"
            >
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {/* Underline Styles Popover */}
            {activeDropdown === 'underlineStyles' && (
              <div
                style={{ top: dropdownCoords.top, right: dropdownCoords.right }}
                className="fixed bg-white rounded-xl shadow-2xl border border-slate-300 p-2 z-[9999] w-48 space-y-1 text-xs home-ribbon-popover animate-in fade-in ring-1 ring-black/5"
              >
                <div className="font-bold text-slate-700 text-[11px] pb-1 border-b">أنماط التسطير:</div>
                <button
                  type="button"
                  onClick={() => applyUnderlineStyle('single')}
                  className="w-full text-right px-2 py-1 hover:bg-slate-100 rounded flex items-center justify-between"
                >
                  <span className="underline font-medium">خط مفرد عادي</span>
                  <span>⎯⎯⎯⎯</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyUnderlineStyle('double')}
                  className="w-full text-right px-2 py-1 hover:bg-slate-100 rounded flex items-center justify-between"
                >
                  <span className="font-medium">خط مزدوج</span>
                  <span>════</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyUnderlineStyle('dotted')}
                  className="w-full text-right px-2 py-1 hover:bg-slate-100 rounded flex items-center justify-between"
                >
                  <span className="font-medium">منقط</span>
                  <span>••••</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyUnderlineStyle('wavy')}
                  className="w-full text-right px-2 py-1 hover:bg-slate-100 rounded flex items-center justify-between"
                >
                  <span className="font-medium">متموج</span>
                  <span>~~~~</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyUnderlineStyle('none')}
                  className="w-full text-right px-2 py-1 hover:bg-rose-50 text-rose-600 rounded font-bold border-t pt-1"
                >
                  بلا تسطير ✕
                </button>
              </div>
            )}
          </div>

          {/* Strikethrough */}
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => handleFormat('strikeThrough')}
            className="p-1 h-full hover:bg-slate-100 rounded text-slate-600 transition cursor-pointer"
            title="يتوسطه خط (Strikethrough)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          {/* Subscript X2 */}
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => handleFormat('subscript')}
            className="p-1 h-full hover:bg-slate-100 rounded text-slate-600 transition cursor-pointer"
            title="منخفض (Subscript - X₂)"
          >
            <Subscript className="w-3.5 h-3.5" />
          </button>

          {/* Superscript X^2 */}
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => handleFormat('superscript')}
            className="p-1 h-full hover:bg-slate-100 rounded text-slate-600 transition cursor-pointer"
            title="مرتفع (Superscript - X²)"
          >
            <Superscript className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-3.5 bg-slate-200" />

        {/* Text Effects Menu Trigger ✨ */}
        <div className="relative inline-flex items-center">
          <button
            type="button"
            onClick={(e) => toggleDropdown('textEffects', e)}
            className={`flex items-center gap-1 px-1.5 h-full rounded text-[11px] font-bold home-ribbon-trigger transition cursor-pointer ${
              activeDropdown === 'textEffects' ? 'bg-indigo-100 text-indigo-900 ring-1 ring-indigo-400' : 'hover:bg-slate-100 text-indigo-700'
            }`}
            title="تأثيرات النصوص البصرية (توهج، ظل، تدرج)"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">تأثيرات</span>
            <ChevronDown className="w-2.5 h-2.5 text-indigo-400" />
          </button>

          {/* Text Effects Popover */}
          {activeDropdown === 'textEffects' && (
            <div
              style={{ top: dropdownCoords.top, right: dropdownCoords.right }}
              className="fixed bg-white rounded-xl shadow-2xl border border-slate-300 p-2.5 z-[9999] w-64 space-y-1.5 text-xs home-ribbon-popover animate-in fade-in ring-1 ring-black/5"
            >
              <div className="font-bold text-slate-800 text-[11px] pb-1 border-b flex items-center justify-between">
                <span>تأثيرات وتنسيقات النصوص:</span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="space-y-1">
                {textEffectsList.map((eff) => (
                  <button
                    key={eff.id}
                    type="button"
                    onClick={() => applyTextEffect(eff.style)}
                    className="w-full text-right p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between transition"
                  >
                    <span className="text-slate-800 font-semibold">{eff.name}</span>
                    <span style={{ ...parseInlineCss(eff.style) }} className="text-xs">أبجد</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-3.5 bg-slate-200" />

        {/* Text Color Picker Trigger */}
        <div className="relative inline-flex items-center">
          <div className="flex items-center h-full">
            <button
              type="button"
              onMouseDown={handleBtnMouseDown}
              onClick={() => applyTextColor(docState.textColor || '#000000')}
              className="px-1.5 h-full flex flex-col items-center justify-center hover:bg-slate-100 rounded-r transition cursor-pointer"
              title={`تطبيق اللون الحالي (${docState.textColor || '#000000'})`}
            >
              <span className="font-black text-[12px] leading-tight" style={{ color: docState.textColor || '#000000' }}>
                A
              </span>
              <div className="w-3.5 h-1 rounded-xs shadow-2xs" style={{ backgroundColor: docState.textColor || '#000000' }} />
            </button>
            <button
              type="button"
              onClick={(e) => toggleDropdown('textColor', e)}
              className="px-0.5 h-full hover:bg-slate-200 rounded-l text-slate-500 home-ribbon-trigger transition cursor-pointer"
              title="لوحة ألوان النص"
            >
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Text Color Popover */}
          {activeDropdown === 'textColor' && (
            <div
              style={{ top: dropdownCoords.top, right: dropdownCoords.right }}
              className="fixed bg-white rounded-xl shadow-2xl border border-slate-300 p-3 z-[9999] w-72 space-y-2.5 text-xs home-ribbon-popover animate-in fade-in ring-1 ring-black/5"
            >
              <div className="flex items-center justify-between pb-1.5 border-b">
                <span className="font-bold text-slate-800 text-xs">ألوان النص</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">لوحة متكاملة</span>
              </div>

              {/* Scope */}
              <div className="flex items-center justify-between bg-slate-100 p-1 rounded-lg text-[10px] font-bold">
                <span className="text-slate-600 px-1">النطاق:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setTextColorScope('selected')}
                    className={`px-2 py-0.5 rounded ${textColorScope === 'selected' ? 'bg-blue-600 text-white' : 'text-slate-700'}`}
                  >
                    المحدد
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextColorScope('paragraph')}
                    className={`px-2 py-0.5 rounded ${textColorScope === 'paragraph' ? 'bg-blue-600 text-white' : 'text-slate-700'}`}
                  >
                    الفقرة
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextColorScope('wholeDoc')}
                    className={`px-2 py-0.5 rounded ${textColorScope === 'wholeDoc' ? 'bg-blue-600 text-white' : 'text-slate-700'}`}
                  >
                    المستند
                  </button>
                </div>
              </div>

              {/* Standard Colors Grid */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-600">الألوان القياسية:</span>
                <div className="grid grid-cols-7 gap-1.5">
                  {[
                    '#000000', '#1e293b', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#ffffff',
                    '#1e3a8a', '#2563eb', '#0284c7', '#0891b2', '#065f46', '#16a34a', '#84cc16',
                    '#b45309', '#ea580c', '#dc2626', '#991b1b', '#581c87', '#7c3aed', '#db2777'
                  ].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => applyTextColor(hex)}
                      className={`w-7 h-7 rounded-md border transition hover:scale-110 flex items-center justify-center ${
                        docState.textColor === hex ? 'ring-2 ring-blue-500 shadow-sm' : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    >
                      {docState.textColor === hex && (
                        <Check className={`w-3.5 h-3.5 ${hex === '#ffffff' || hex === '#cbd5e1' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Picker */}
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">لون مخصص:</span>
                <input
                  type="color"
                  value={docState.textColor || '#000000'}
                  onChange={(e) => applyTextColor(e.target.value)}
                  className="w-8 h-7 rounded cursor-pointer border border-slate-300 p-0"
                  title="اختر أي لون مخصص"
                />
              </div>
            </div>
          )}
        </div>

        {/* Highlight Color Trigger 🖍️ */}
        <div className="relative inline-flex items-center">
          <div className="flex items-center h-full">
            <button
              type="button"
              onMouseDown={handleBtnMouseDown}
              onClick={() => applyHighlightColor('#fef08a')}
              className="px-1.5 h-full flex items-center gap-1 hover:bg-slate-100 rounded-r text-[11px] font-bold text-slate-700 transition cursor-pointer"
              title="تمييز النص بالأصفر"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-500" />
            </button>
            <button
              type="button"
              onClick={(e) => toggleDropdown('highlight', e)}
              className="px-0.5 h-full hover:bg-slate-200 rounded-l text-slate-500 home-ribbon-trigger transition cursor-pointer"
              title="ألوان تمييز النص (15 لوناً)"
            >
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Highlight Color Popover */}
          {activeDropdown === 'highlight' && (
            <div
              style={{ top: dropdownCoords.top, right: dropdownCoords.right }}
              className="fixed bg-white rounded-xl shadow-2xl border border-slate-300 p-2.5 z-[9999] w-64 space-y-2 text-xs home-ribbon-popover animate-in fade-in ring-1 ring-black/5"
            >
              <div className="font-bold text-slate-800 text-[11px] pb-1 border-b">ألوان تمييز النص (Highlighter):</div>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { name: 'أصفر', hex: '#ffff00' },
                  { name: 'أخضر', hex: '#00ff00' },
                  { name: 'سماوي', hex: '#00ffff' },
                  { name: 'وردي', hex: '#ff00ff' },
                  { name: 'أزرق', hex: '#60a5fa' },
                  { name: 'أحمر', hex: '#f87171' },
                  { name: 'كحلي', hex: '#3b82f6' },
                  { name: 'بترولي', hex: '#14b8a6' },
                  { name: 'بنفسجي', hex: '#c084fc' },
                  { name: 'رمادي', hex: '#cbd5e1' },
                ].map((item) => (
                  <button
                    key={item.hex}
                    type="button"
                    onClick={() => applyHighlightColor(item.hex)}
                    style={{ backgroundColor: item.hex }}
                    className="h-7 rounded-md border border-slate-300 transition hover:scale-105"
                    title={item.name}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => applyHighlightColor('transparent')}
                className="w-full text-center py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs"
              >
                بلا لون تمييز ✕
              </button>
            </div>
          )}
        </div>

      </div>

      <div className="w-px h-5 bg-slate-300 mx-0.5 shrink-0" />

      {/* ================= 3. التشكيل العربي والحركات (TASHKEEL GROUP) ================= */}
      <div className="relative inline-flex items-center shrink-0">
        <button
          type="button"
          onClick={(e) => toggleDropdown('tashkeel', e)}
          className={`flex items-center gap-1.5 px-2.5 h-[28px] border rounded-lg text-[11px] font-bold home-ribbon-trigger shadow-2xs transition cursor-pointer ${
            activeDropdown === 'tashkeel'
              ? 'bg-amber-100 text-amber-900 border-amber-400'
              : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
          }`}
          title="التشكيل والحركات العربية (فتحة، ضمة، كسرة، شدة، كشيدة)"
        >
          <span className="font-serif font-black text-amber-700 text-sm">َ ً ُ ّ</span>
          <span>التشكيل</span>
          <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
        </button>

        {/* Tashkeel Popover */}
        {activeDropdown === 'tashkeel' && (
          <div
            style={{ top: dropdownCoords.top, right: dropdownCoords.right }}
            className="fixed bg-white rounded-xl shadow-2xl border border-slate-300 p-3 z-[9999] w-72 space-y-2 text-xs home-ribbon-popover animate-in fade-in ring-1 ring-black/5"
          >
            <div className="flex items-center justify-between pb-1.5 border-b">
              <span className="font-bold text-slate-800 text-xs">حركات وتشكيل اللغة العربية:</span>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">عربي أصيل</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'فتحة', char: 'َ', symbol: 'ـَ' },
                { label: 'تنوين فتح', char: 'ً', symbol: 'ـً' },
                { label: 'ضمة', char: 'ُ', symbol: 'ـُ' },
                { label: 'تنوين ضم', char: 'ٌ', symbol: 'ـٌ' },
                { label: 'كسرة', char: 'ِ', symbol: 'ـِ' },
                { label: 'تنوين كسر', char: 'ٍ', symbol: 'ـٍ' },
                { label: 'سكون', char: 'ْ', symbol: 'ـْ' },
                { label: 'شدة', char: 'ّ', symbol: 'ـّ' },
                { label: 'شدة وفتحة', char: 'َّ', symbol: 'ـَّ' },
                { label: 'شدة وضمة', char: 'ُّ', symbol: 'ـُّ' },
                { label: 'شدة وكسرة', char: 'ِّ', symbol: 'ـِّ' },
                { label: 'تطويل (كشيدة)', char: 'ـ', symbol: 'ـــ' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => applyDiacritic(item.char)}
                  className="p-1.5 bg-slate-50 hover:bg-amber-100 hover:text-amber-900 border border-slate-200 rounded-lg flex flex-col items-center justify-center transition cursor-pointer"
                  title={item.label}
                >
                  <span className="text-base font-serif font-bold text-slate-900">{item.symbol}</span>
                  <span className="text-[9px] text-slate-500 font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t">
              <button
                type="button"
                onClick={handleRemoveAllTashkeel}
                className="w-full py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <span>حذف كافة حركات التشكيل من النص ✕</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-slate-300 mx-0.5 shrink-0" />

      {/* ================= 4. الفقرة والمحاذاة (PARAGRAPH & ALIGNMENT GROUP) ================= */}
      <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[28px] p-0.5 shadow-2xs gap-0.5 shrink-0">
        {/* Alignments */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => applyAlignment('right')}
          className={`px-1.5 h-full rounded transition cursor-pointer ${
            docState.textAlign === 'right' ? 'bg-blue-100 text-blue-900 font-bold ring-1 ring-blue-400' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="محاذاة لليمين"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => applyAlignment('center')}
          className={`px-1.5 h-full rounded transition cursor-pointer ${
            docState.textAlign === 'center' ? 'bg-blue-100 text-blue-900 font-bold ring-1 ring-blue-400' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="توسيط"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => applyAlignment('left')}
          className={`px-1.5 h-full rounded transition cursor-pointer ${
            docState.textAlign === 'left' ? 'bg-blue-100 text-blue-900 font-bold ring-1 ring-blue-400' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="محاذاة لليسار"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => applyAlignment('justify')}
          className={`px-1.5 h-full rounded transition cursor-pointer ${
            docState.textAlign === 'justify' ? 'bg-blue-100 text-blue-900 font-bold ring-1 ring-blue-400' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="ضبط كلي متساوي"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-slate-200" />

        {/* Text Direction RTL / LTR */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => {
            const nextDir = docState.direction === 'ltr' ? 'rtl' : 'ltr';
            onUpdateDoc({ direction: nextDir });
            const editor = document.getElementById('word-body-editable');
            if (editor) {
              editor.dir = nextDir;
              editor.style.direction = nextDir;
            }
          }}
          className={`px-1.5 h-full rounded flex items-center gap-0.5 text-[10px] font-bold transition cursor-pointer ${
            docState.direction === 'ltr' ? 'bg-indigo-100 text-indigo-900' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title={`اتجاه النص الحالي: ${docState.direction === 'ltr' ? 'يسار ليمين (LTR)' : 'يمين ليسار (RTL)'}`}
        >
          <ArrowRightLeft className="w-3 h-3 text-indigo-600" />
          <span>{docState.direction === 'ltr' ? 'LTR' : 'RTL'}</span>
        </button>

        <div className="w-px h-3.5 bg-slate-200" />

        {/* Line Spacing Selector */}
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] font-bold text-slate-500">تباعد:</span>
          <select
            value={docState.lineSpacing || 1.6}
            onChange={(e) => onUpdateDoc({ lineSpacing: Number(e.target.value) })}
            className="bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer"
            title="تباعد الأسطر"
          >
            <option value={1.0}>1.0</option>
            <option value={1.15}>1.15</option>
            <option value={1.25}>1.25</option>
            <option value={1.5}>1.5</option>
            <option value={1.6}>1.6 (افتراضي)</option>
            <option value={1.8}>1.8</option>
            <option value={2.0}>2.0</option>
            <option value={2.5}>2.5</option>
            <option value={3.0}>3.0</option>
          </select>
        </div>

        <div className="w-px h-3.5 bg-slate-200" />

        {/* Lists & Indents */}
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => onExecCommand('insertUnorderedList')}
          className="p-1 h-full hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
          title="قائمة نقطية"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => onExecCommand('insertOrderedList')}
          className="p-1 h-full hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
          title="قائمة رقمية"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => onExecCommand('outdent')}
          className="p-1 h-full hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
          title="إنقاص المسافة البادئة"
        >
          <Outdent className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => onExecCommand('indent')}
          className="p-1 h-full hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
          title="زيادة المسافة البادئة"
        >
          <Indent className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-slate-200" />

        {/* Paragraph Shading (Fill) Trigger 🪣 */}
        <div className="relative inline-flex items-center">
          <button
            type="button"
            onClick={(e) => toggleDropdown('paragraphShading', e)}
            className={`p-1 h-full rounded home-ribbon-trigger transition cursor-pointer ${
              activeDropdown === 'paragraphShading' ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-400' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="تظليل وتعبئة خلفية الفقرة"
          >
            <PaintBucket className="w-3.5 h-3.5 text-amber-600" />
          </button>

          {/* Shading Popover */}
          {activeDropdown === 'paragraphShading' && (
            <div
              style={{ top: dropdownCoords.top, right: dropdownCoords.right }}
              className="fixed bg-white rounded-xl shadow-2xl border border-slate-300 p-2.5 z-[9999] w-64 space-y-2 text-xs home-ribbon-popover animate-in fade-in ring-1 ring-black/5"
            >
              <div className="font-bold text-slate-800 text-[11px] pb-1 border-b">تظليل وخلفية الفقرة:</div>
              <div className="grid grid-cols-6 gap-1.5">
                {[
                  '#f8fafc', '#f1f5f9', '#e2e8f0', '#fefce8', '#fef08a', '#fde047',
                  '#ecfdf5', '#d1fae5', '#a7f3d0', '#eff6ff', '#dbeafe', '#bfdbfe',
                  '#fdf2f8', '#fce7f3', '#fbcfe8', '#faf5ff', '#f3e8ff', '#e9d5ff'
                ].map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => applyParagraphShading(bg)}
                    style={{ backgroundColor: bg }}
                    className="h-6 rounded border border-slate-300 transition hover:scale-105"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => applyParagraphShading('transparent')}
                className="w-full text-center py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs"
              >
                بلا تعبئة ✕
              </button>
            </div>
          )}
        </div>

        {/* Paragraph Borders Trigger ▦ */}
        <div className="relative inline-flex items-center">
          <button
            type="button"
            onClick={(e) => toggleDropdown('paragraphBorders', e)}
            className={`p-1 h-full rounded home-ribbon-trigger transition cursor-pointer ${
              activeDropdown === 'paragraphBorders' ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-400' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="حدود وإطارات الفقرة"
          >
            <Square className="w-3.5 h-3.5 text-blue-600" />
          </button>

          {/* Borders Popover */}
          {activeDropdown === 'paragraphBorders' && (
            <div
              style={{ top: dropdownCoords.top, right: dropdownCoords.right }}
              className="fixed bg-white rounded-xl shadow-2xl border border-slate-300 p-2 z-[9999] w-52 space-y-1 text-xs home-ribbon-popover animate-in fade-in ring-1 ring-black/5"
            >
              <div className="font-bold text-slate-800 text-[11px] pb-1 border-b">حدود الفقرة:</div>
              <button
                type="button"
                onClick={() => applyParagraphBorder('bottom')}
                className="w-full text-right px-2 py-1 hover:bg-slate-100 rounded flex items-center justify-between"
              >
                <span>حد سفلي</span>
                <span className="border-b-2 border-slate-800 w-4 inline-block" />
              </button>
              <button
                type="button"
                onClick={() => applyParagraphBorder('top')}
                className="w-full text-right px-2 py-1 hover:bg-slate-100 rounded flex items-center justify-between"
              >
                <span>حد علوي</span>
                <span className="border-t-2 border-slate-800 w-4 inline-block" />
              </button>
              <button
                type="button"
                onClick={() => applyParagraphBorder('right')}
                className="w-full text-right px-2 py-1 hover:bg-slate-100 rounded flex items-center justify-between"
              >
                <span>حد أيمن (شريط جانبي)</span>
                <span className="border-r-4 border-blue-600 h-3 inline-block" />
              </button>
              <button
                type="button"
                onClick={() => applyParagraphBorder('box')}
                className="w-full text-right px-2 py-1 hover:bg-slate-100 rounded flex items-center justify-between"
              >
                <span>إطار خارجي كامل</span>
                <Square className="w-3.5 h-3.5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => applyParagraphBorder('double_bottom')}
                className="w-full text-right px-2 py-1 hover:bg-slate-100 rounded flex items-center justify-between"
              >
                <span>خط سفلي مزدوج</span>
                <span className="border-b-4 border-double border-slate-800 w-4 inline-block" />
              </button>
              <button
                type="button"
                onClick={() => applyParagraphBorder('none')}
                className="w-full text-right px-2 py-1 hover:bg-rose-50 text-rose-600 rounded font-bold border-t pt-1"
              >
                بلا حدود ✕
              </button>
            </div>
          )}
        </div>

      </div>

      <div className="w-px h-5 bg-slate-300 mx-0.5 shrink-0" />

      {/* ================= 5. الأنماط السريعة (QUICK STYLES) ================= */}
      <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[28px] p-0.5 shadow-2xs gap-1 shrink-0">
        <button
          type="button"
          onClick={() => applyHeadingStyle('p')}
          className="px-2 h-full hover:bg-slate-100 rounded text-[11px] font-medium text-slate-700 transition cursor-pointer"
          title="نص عادي"
        >
          عادي
        </button>
        <button
          type="button"
          onClick={() => applyHeadingStyle('h1')}
          className="px-2 h-full hover:bg-blue-50 text-blue-800 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-0.5"
          title="عنوان رئيسي 1"
        >
          <Heading1 className="w-3 h-3" />
          <span>عنوان 1</span>
        </button>
        <button
          type="button"
          onClick={() => applyHeadingStyle('h2')}
          className="px-2 h-full hover:bg-indigo-50 text-indigo-800 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-0.5"
          title="عنوان فرعي 2"
        >
          <Heading2 className="w-3 h-3" />
          <span>عنوان 2</span>
        </button>
        <button
          type="button"
          onClick={() => applyHeadingStyle('blockquote')}
          className="px-1.5 h-full hover:bg-amber-50 text-amber-800 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-0.5"
          title="اقتباس متميز"
        >
          <Quote className="w-3 h-3" />
          <span>اقتباس</span>
        </button>

        {/* Save Style Button */}
        <button
          type="button"
          onClick={onOpenSaveStyle}
          className="p-1 h-full hover:bg-purple-50 text-purple-700 rounded transition cursor-pointer"
          title="حفظ النمط الحالي في المعرض"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-300 mx-0.5 shrink-0" />

      {/* ================= 6. التحرير والبحث (EDITING & SEARCH) ================= */}
      <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[28px] p-0.5 shadow-2xs gap-0.5 shrink-0">
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => onExecCommand('undo')}
          className="p-1 h-full hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
          title="تراجع (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => onExecCommand('redo')}
          className="p-1 h-full hover:bg-slate-100 rounded text-slate-700 transition cursor-pointer"
          title="إعادة (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-slate-200" />

        <button
          type="button"
          onClick={() => onOpenFindReplace('find')}
          className="flex items-center gap-1 px-1.5 h-full hover:bg-blue-50 text-blue-700 rounded text-[11px] font-bold transition cursor-pointer"
          title="بحث داخل المستند (Ctrl+F)"
        >
          <Search className="w-3.5 h-3.5" />
          <span>بحث</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenFindReplace('replace')}
          className="px-1.5 h-full hover:bg-slate-100 text-slate-700 rounded text-[11px] font-bold transition cursor-pointer"
          title="استبدال النص (Ctrl+H)"
        >
          <span>استبدال</span>
        </button>

        <button
          type="button"
          onMouseDown={handleBtnMouseDown}
          onClick={() => {
            const editor = document.getElementById('word-body-editable');
            if (editor) {
              const range = document.createRange();
              range.selectNodeContents(editor);
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
          }}
          className="px-1.5 h-full hover:bg-slate-100 text-slate-600 rounded text-[10px] font-medium transition cursor-pointer"
          title="تحديد الكل (Ctrl+A)"
        >
          تحديد الكل
        </button>
      </div>

      <div className="w-px h-5 bg-slate-300 mx-0.5 shrink-0" />

      {/* ================= 7. الإدراج السريع الشائع (QUICK INSERT) ================= */}
      <div className="flex items-center bg-white border border-slate-300 rounded-lg h-[28px] p-0.5 shadow-2xs gap-0.5 shrink-0">
        {/* Quick Table */}
        <div className="relative inline-flex items-center">
          <button
            type="button"
            onClick={(e) => toggleDropdown('quickTable', e)}
            className={`flex items-center gap-1 px-2 h-full rounded text-[11px] font-bold home-ribbon-trigger transition cursor-pointer ${
              activeDropdown === 'quickTable' ? 'bg-blue-100 text-blue-900' : 'hover:bg-slate-100 text-blue-700'
            }`}
            title="إدراج جدول سريع"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>جدول</span>
            <ChevronDown className="w-2.5 h-2.5" />
          </button>

          {/* Quick Table Popover */}
          {activeDropdown === 'quickTable' && (
            <div
              style={{ top: dropdownCoords.top, right: dropdownCoords.right }}
              className="fixed bg-white rounded-xl shadow-2xl border border-slate-300 p-3 z-[9999] w-56 space-y-2 text-xs home-ribbon-popover animate-in fade-in ring-1 ring-black/5"
            >
              <div className="font-bold text-slate-800 text-xs border-b pb-1">أبعاد الجدول:</div>
              <div className="flex items-center justify-between text-xs">
                <span>صفوف:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={quickTableRows}
                  onChange={(e) => setQuickTableRows(parseInt(e.target.value) || 1)}
                  className="w-16 border rounded px-1.5 py-0.5 text-center"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>أعمدة:</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={quickTableCols}
                  onChange={(e) => setQuickTableCols(parseInt(e.target.value) || 1)}
                  className="w-16 border rounded px-1.5 py-0.5 text-center"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onInsertTable) {
                    onInsertTable(quickTableRows, quickTableCols);
                  }
                  setActiveDropdown(null);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-xs font-bold transition cursor-pointer"
              >
                إدراج ({quickTableRows} × {quickTableCols})
              </button>
            </div>
          )}
        </div>

        {/* Quick Page Break */}
        {onInsertPageBreak && (
          <button
            type="button"
            onClick={onInsertPageBreak}
            className="flex items-center gap-1 px-1.5 h-full hover:bg-slate-100 rounded text-[10px] font-bold text-slate-700 transition cursor-pointer"
            title="إدراج فاصل صفحات (Ctrl+Enter)"
          >
            <FilePlus className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden lg:inline">فاصل صفحات</span>
          </button>
        )}
      </div>

    </div>
  );
};

// Helper to convert inline CSS text into React style object for preview
function parseInlineCss(styleStr: string): React.CSSProperties {
  const styleObj: any = {};
  styleStr.split(';').forEach((rule) => {
    const [key, val] = rule.split(':');
    if (key && val) {
      const camelKey = key.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      styleObj[camelKey] = val.trim();
    }
  });
  return styleObj;
}
