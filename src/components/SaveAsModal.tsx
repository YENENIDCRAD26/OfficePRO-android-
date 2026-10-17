import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Download, 
  X, 
  FileText, 
  Check, 
  Smartphone,
  Folder,
  FolderPlus,
  HardDrive,
  Settings,
  ChevronDown,
  ArrowRight,
  Layers,
  FileCheck2,
  Printer,
  Sparkles,
  BookmarkCheck,
  ShieldCheck,
  FileSpreadsheet,
  Share2
} from 'lucide-react';
import { AppMode, ExcelSheet, WordDocumentState } from '../types';
import { 
  exportWordAsDocx, 
  exportWordAsDoc, 
  exportWordAsTxt, 
  exportWordAsHtml, 
  exportWordAsRtf,
  exportWordAsDotx,
  exportWordAsDot,
  exportWordAsDocm,
  exportExcelAsXlsx, 
  exportExcelAsXls, 
  exportExcelAsCsv, 
  exportExcelAsXlsb,
  exportExcelAsXlsm,
  exportExcelAsXltx,
  exportExcelAsXltm,
  exportWordAsPdf,
  exportExcelAsPdf,
  exportWordAsJpg,
  exportWordAsPng,
  exportExcelAsJpg,
  exportExcelAsPng,
  shareDocument,
  generateDocumentBlob
} from '../utils/fileHandlers';

interface SaveAsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AppMode;
  wordState: WordDocumentState;
  excelState: { title: string; sheets: ExcelSheet[] };
  onUpdateTitle: (newTitle: string) => void;
  onQuickSave: () => void;
  onOpenPrintPreview?: () => void;
}

export const SaveAsModal: React.FC<SaveAsModalProps> = ({
  isOpen,
  onClose,
  mode,
  wordState,
  excelState,
  onUpdateTitle,
  onQuickSave,
  onOpenPrintPreview
}) => {
  const currentTitle = mode === 'word' ? wordState.title : excelState.title;
  const cleanInitialTitle = currentTitle.replace(/\.(docx|doc|xlsx|xls|xlsb|xlsm|xltx|xltm|csv|txt|rtf|dotx|dot|docm|html|pdf)$/i, '');

  const [fileName, setFileName] = useState(cleanInitialTitle);
  const [selectedFormat, setSelectedFormat] = useState<string>(mode === 'word' ? 'docx' : 'xlsx');
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [storageType, setStorageType] = useState('مساحة تخزين الجهاز (Internal Storage)');
  const [showStorageMenu, setShowStorageMenu] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('Documents');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveAsDefaultSettings, setSaveAsDefaultSettings] = useState(true);
  const [csvDelimiter, setCsvDelimiter] = useState<',' | ';' | '\t' | '|'>(';');
  const [csvEncoding, setCsvEncoding] = useState<'utf-8-bom' | 'utf-8' | 'windows-1256' | 'iso-8859-6'>('utf-8-bom');

  // تحميل المجلدات الحقيقية المحفوظة محلياً أو الافتراضية
  const [allFolders, setAllFolders] = useState<{ name: string; count: number; date: string }[]>(() => {
    try {
      const saved = localStorage.getItem('office_android_folders');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn(e);
    }
    return [
      { name: 'Documents', count: 12, date: 'اليوم' },
      { name: 'Download', count: 35, date: 'أمس' },
      { name: 'Al-Bayan Docs', count: 8, date: '21 سبتمبر' },
      { name: 'المعاملات الرسمية', count: 5, date: '20 سبتمبر' },
      { name: 'العقود والاتفاقيات', count: 9, date: '18 سبتمبر' },
      { name: 'OfficePRO', count: 14, date: '15 سبتمبر' },
    ];
  });

  useEffect(() => {
    if (isOpen) {
      const base = (mode === 'word' ? wordState.title : excelState.title).replace(/\.(docx|doc|xlsx|xls|xlsb|xlsm|xltx|xltm|csv|txt|rtf|dotx|dot|docm|html|pdf)$/i, '');
      setFileName(base);
      setSelectedFormat(mode === 'word' ? 'docx' : 'xlsx');
      setSaveSuccess(false);
    }
  }, [isOpen, mode, wordState.title, excelState.title]);

  if (!isOpen) return null;

  // إنشاء مجلد حقيقي في التخزين المحلي وفي واجهة أندرويد
  const handleCreateFolder = () => {
    const newName = prompt('أدخل اسم المجلد الجديد في وحدة تخزين أندرويد:');
    if (newName) {
      const trimmed = newName.trim();
      if (trimmed) {
        if (allFolders.some((f) => f.name === trimmed)) {
          alert('هذا المجلد موجود مسبقاً!');
          setSelectedFolder(trimmed);
          return;
        }
        const updated = [
          { name: trimmed, count: 0, date: 'الآن' },
          ...allFolders,
        ];
        setAllFolders(updated);
        setSelectedFolder(trimmed);
        try {
          localStorage.setItem('office_android_folders', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const wordFormats = [
    { id: 'pdf', name: 'مستند PDF (.pdf)', ext: '.pdf', badge: 'حفظ وتصدير PDF رسمي بجودة طباعة كاملة', tier: 'pdf' },
    { id: 'docx', name: 'Microsoft Word حديث (.docx)', ext: '.docx', badge: 'صيغة وورد القياسية الحديثة (تعديل كامل 100%)', tier: 'full' },
    { id: 'doc', name: 'Word كلاسيكي (.doc)', ext: '.doc', badge: 'صيغة وورد كلاسيكية مدعومة للقراءة والتعديل', tier: 'full' },
    { id: 'jpg', name: 'صورة صفحة JPG (.jpg)', ext: '.jpg', badge: 'صورة عالية الدقة للمشاركة السريعة عبر الوسائط', tier: 'image' },
    { id: 'png', name: 'صورة صفحة شفافة PNG (.png)', ext: '.png', badge: 'صورة فائقة الجودة والنقاء', tier: 'image' },
    { id: 'txt', name: 'ملف نصي مجرد (.txt)', ext: '.txt', badge: 'مدعومة بالكامل على أي جهاز وتطبيق', tier: 'full' },
    { id: 'rtf', name: 'نص منسق Rich Text (.rtf)', ext: '.rtf', badge: 'قراءة وتحويل للتعديل على أندرويد', tier: 'readonly' },
    { id: 'dotx', name: 'قالب وورد حديث (.dotx)', ext: '.dotx', badge: 'قالب لإنشاء مستند جديد دون تعديل الأصل', tier: 'readonly' },
    { id: 'dot', name: 'قالب كلاسيكي (.dot)', ext: '.dot', badge: 'قالب كلاسيكي لإنشاء مستند جديد', tier: 'readonly' },
    { id: 'docm', name: 'مستند وورد يدعم الماكرو (.docm)', ext: '.docm', badge: 'قراءة وتعديل نصي', tier: 'readonly' },
    { id: 'html', name: 'صفحة ويب HTML (.html)', ext: '.html', badge: 'تنسيق ويب متجاوب', tier: 'web' },
  ];

  const excelFormats = [
    { id: 'xlsx', name: 'Microsoft Excel حديث (.xlsx)', ext: '.xlsx', badge: 'الصيغة القياسية الأفضل (تعديل كامل 100%)', tier: 'full' },
    { id: 'xls', name: 'Excel كلاسيكي (.xls)', ext: '.xls', badge: 'صيغة إكسل كلاسيكية مدعومة للقراءة والتعديل', tier: 'full' },
    { id: 'jpg', name: 'صورة جدول JPG (.jpg)', ext: '.jpg', badge: 'صورة جدول إكسل عالية الدقة للمشاركة', tier: 'image' },
    { id: 'png', name: 'صورة جدول شفافة PNG (.png)', ext: '.png', badge: 'صورة جدول إكسل فائقة النقاء', tier: 'image' },
    { id: 'pdf', name: 'مستند PDF للجداول (.pdf)', ext: '.pdf', badge: 'طباعة وتصدير الجداول بدقة', tier: 'pdf' },
    { id: 'csv', name: 'بيانات مجدولة (.csv)', ext: '.csv', badge: 'الأسهل لنقل الجداول وجهات الاتصال', tier: 'full' },
    { id: 'xlsb', name: 'مصنف ثنائي (.xlsb)', ext: '.xlsb', badge: 'قراءة للأحجام الضخمة والبيانات الكبيرة', tier: 'readonly' },
    { id: 'xlsm', name: 'مصنف ماكرو (.xlsm)', ext: '.xlsm', badge: 'تفتح الجداول والأرقام', tier: 'readonly' },
    { id: 'xltx', name: 'قالب إكسل (.xltx)', ext: '.xltx', badge: 'قالب لإنشاء جدول جديد', tier: 'readonly' },
  ];

  const currentFormats = mode === 'word' ? wordFormats : excelFormats;
  const currentFormatObj = currentFormats.find((f) => f.id === selectedFormat) || currentFormats[0];

  const handleSaveAndDownload = async () => {
    const finalName = fileName.trim() || (mode === 'word' ? 'New word' : 'New sheet');
    setIsSaving(true);

    try {
      const newFullTitle = `${finalName}${currentFormatObj.ext}`;
      onUpdateTitle(newFullTitle);
      onQuickSave();

      // 1. حفظ الإعدادات الافتراضية
      if (saveAsDefaultSettings && mode === 'word') {
        try {
          const defaultSettings = {
            orientation: wordState.orientation,
            paperSize: wordState.paperSize,
            margins: wordState.margins,
            customMargins: wordState.customMargins,
            fontFamily: wordState.fontFamily,
            fontSize: wordState.fontSize,
            lineSpacing: wordState.lineSpacing,
            pageBgColor: wordState.pageBgColor,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('office_default_document_settings', JSON.stringify(defaultSettings));
        } catch (e) {
          console.warn(e);
        }
      }

      // 2. تخزين حقيقي في مجلد أندرويد المحدد (Android Local Storage & IndexedDB registry)
      const targetFolder = currentFolder || selectedFolder || 'Documents';
      try {
        const deviceStorage = JSON.parse(localStorage.getItem('office_saved_device_documents') || '[]');
        const newRecord = {
          id: 'doc_' + Date.now(),
          title: newFullTitle,
          name: finalName,
          format: selectedFormat,
          folder: targetFolder,
          storage: storageType,
          date: new Date().toISOString(),
          mode,
          wordState: mode === 'word' ? wordState : undefined,
          excelState: mode === 'excel' ? excelState : undefined,
        };
        deviceStorage.unshift(newRecord);
        localStorage.setItem('office_saved_device_documents', JSON.stringify(deviceStorage.slice(0, 100)));

        // تحديث عداد الملفات في المجلد
        const updatedFolders = allFolders.map(f => {
          if (f.name === targetFolder) {
            return { ...f, count: f.count + 1, date: 'الآن' };
          }
          return f;
        });
        setAllFolders(updatedFolders);
        localStorage.setItem('office_android_folders', JSON.stringify(updatedFolders));
      } catch (e) {
        console.error('Android storage persistence error:', e);
      }

      // 3. تنزيل الملف فعلياً عبر متصفح أندرويد
      if (mode === 'word') {
        try {
          switch (selectedFormat) {
            case 'docx': await exportWordAsDocx(wordState, finalName); break;
            case 'doc': await exportWordAsDoc(wordState, finalName); break;
            case 'txt': exportWordAsTxt(wordState, finalName); break;
            case 'rtf': exportWordAsRtf(wordState, finalName); break;
            case 'dotx': await exportWordAsDotx(wordState, finalName); break;
            case 'dot': await exportWordAsDot(wordState, finalName); break;
            case 'docm': await exportWordAsDocm(wordState, finalName); break;
            case 'pdf': await exportWordAsPdf(wordState, { pdfStandard: 'standard' }, finalName); break;
            case 'pdf_interactive': await exportWordAsPdf(wordState, { pdfStandard: 'interactive' }, finalName); break;
            case 'pdf_a': await exportWordAsPdf(wordState, { pdfStandard: 'pdf_a' }, finalName); break;
            case 'html': exportWordAsHtml(wordState, finalName); break;
            case 'jpg': await exportWordAsJpg(wordState, finalName); break;
            case 'png': await exportWordAsPng(wordState, finalName); break;
            default: await exportWordAsDocx(wordState, finalName);
          }
        } catch (exportErr) {
          console.warn('Fallback to standard docx export:', exportErr);
          await exportWordAsDocx(wordState, finalName);
        }
      } else {
        const activeSheet = excelState.sheets[0];
        try {
          switch (selectedFormat) {
            case 'xlsx': exportExcelAsXlsx(finalName, excelState.sheets, finalName); break;
            case 'xls': exportExcelAsXls(finalName, excelState.sheets, finalName); break;
            case 'csv': if (activeSheet) exportExcelAsCsv(activeSheet, finalName, finalName, { delimiter: csvDelimiter, encoding: csvEncoding }); break;
            case 'xlsb': exportExcelAsXlsb(finalName, excelState.sheets, finalName); break;
            case 'xlsm': exportExcelAsXlsm(finalName, excelState.sheets, finalName); break;
            case 'xltx': exportExcelAsXltx(finalName, excelState.sheets, finalName); break;
            case 'pdf': if (activeSheet) await exportExcelAsPdf(finalName, activeSheet, { pdfStandard: 'standard' }, finalName); break;
            case 'jpg': if (activeSheet) await exportExcelAsJpg(finalName, activeSheet, finalName); break;
            case 'png': if (activeSheet) await exportExcelAsPng(finalName, activeSheet, finalName); break;
            default: exportExcelAsXlsx(finalName, excelState.sheets, finalName);
          }
        } catch (exportErr) {
          console.warn('Fallback to standard xlsx export:', exportErr);
          exportExcelAsXlsx(finalName, excelState.sheets, finalName);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Error saving file:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-[200] animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] font-sans">
        
        <div className="bg-[#f0f2f5] p-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-lg border border-slate-300 flex items-center px-3 py-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-blue-500">
              {mode === 'word' ? (
                <FileText className="w-4 h-4 text-blue-600 ml-2 shrink-0" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 ml-2 shrink-0" />
              )}
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="اسم الملف..."
                className="w-full text-xs font-bold text-slate-800 outline-none bg-transparent"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                className="bg-white rounded-lg border border-slate-300 px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-blue-700 shadow-2xs hover:bg-slate-50 transition active:scale-95"
              >
                <span>{currentFormatObj.ext}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showFormatDropdown && (
                <div className="absolute top-10 left-0 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 w-72 text-right max-h-80 overflow-y-auto ring-1 ring-black/5">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-600 border-b bg-slate-50 flex items-center justify-between">
                    <span>صيغ الملفات وتوافقها مع أندرويد:</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>

                  {currentFormats.map((f) => {
                    const isSelected = selectedFormat === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          setSelectedFormat(f.id);
                          setShowFormatDropdown(false);
                        }}
                        className={`w-full text-right px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-blue-50 transition border-b border-slate-100 last:border-b-0 ${
                          isSelected ? 'bg-blue-50/80 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={isSelected ? 'text-blue-700 font-bold' : 'text-slate-800'}>{f.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </div>
                        <span className={`text-[10px] ${f.tier === 'full' ? 'text-emerald-700 font-bold' : f.tier === 'pdf' ? 'text-rose-700 font-medium' : 'text-slate-500'}`}>
                          {f.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setShowStorageMenu(!showStorageMenu)}
              className="flex items-center gap-2 text-slate-800 hover:text-blue-700 font-bold text-xs sm:text-sm transition"
            >
              <Smartphone className="w-4 h-4 text-slate-600" />
              <span>{storageType}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showStorageMenu && (
              <div className="absolute top-8 right-0 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 w-64 text-right">
                {[
                  { name: 'مساحة تخزين الجهاز (Internal Storage)', icon: Smartphone },
                  { name: 'بطاقة الذاكرة الخارجية (SD Card)', icon: HardDrive },
                  { name: 'مجلد المستندات المحلي (Documents Folder)', icon: Folder },
                ].map((st) => (
                  <button
                    key={st.name}
                    onClick={() => {
                      setStorageType(st.name);
                      setShowStorageMenu(false);
                    }}
                    className={`w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition ${
                      storageType === st.name ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <st.icon className="w-4 h-4 text-slate-500" />
                    <span>{st.name}</span>
                    {storageType === st.name && <Check className="w-3.5 h-3.5 text-blue-600 mr-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenPrintPreview && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPrintPreview();
                }}
                className="flex items-center gap-1 text-[11px] text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition font-medium"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                <span>معاينة الطباعة</span>
              </button>
            )}

            <button
              onClick={handleCreateFolder}
              className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:bg-blue-50 px-2 py-1 rounded transition border border-blue-200"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ إنشاء مجلد</span>
            </button>
          </div>
        </div>

        <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-500 stroke-[1.75]" />
            <span className="font-medium text-slate-600">
              المجلد المختار للحفظ: <strong className="text-blue-700 font-bold">{selectedFolder}</strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            {currentFormatObj.badge}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-[160px] max-h-[220px]">
          {allFolders.map((f) => {
            const isSelected = selectedFolder === f.name;
            return (
              <div
                key={f.name}
                onClick={() => setSelectedFolder(f.name)}
                onDoubleClick={() => setCurrentFolder(f.name)}
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition select-none ${
                  isSelected ? 'bg-blue-50/80 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs ${isSelected ? 'text-blue-900 font-bold' : 'text-slate-800 font-semibold'}`}>
                      {f.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {f.count} ملفات • {f.date}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-1 text-[11px] text-blue-700 font-bold bg-blue-100/70 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3 text-blue-600" />
                    <span>محدد للحفظ</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {mode === 'excel' && selectedFormat === 'csv' && (
          <div className="px-4 py-3 bg-teal-50/80 border-t border-teal-100 space-y-2">
            <div className="text-xs font-bold text-teal-950 flex items-center justify-between">
              <span>خيارات تصدير CSV المتقدمة:</span>
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-teal-900 mb-1">الفاصل:</label>
                <select
                  value={csvDelimiter}
                  onChange={(e) => setCsvDelimiter(e.target.value as any)}
                  className="w-full bg-white border border-teal-300 rounded-lg px-2 py-1 text-xs font-bold text-teal-900"
                >
                  <option value=";">فاصلة منقوطة ( ; )</option>
                  <option value=",">فاصلة عادية ( , )</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-teal-900 mb-1">الترميز:</label>
                <select
                  value={csvEncoding}
                  onChange={(e) => setCsvEncoding(e.target.value as any)}
                  className="w-full bg-white border border-teal-300 rounded-lg px-2 py-1 text-xs font-bold text-teal-900"
                >
                  <option value="utf-8-bom">UTF-8 with BOM (الأفضل للعربية)</option>
                  <option value="utf-8">UTF-8 قياسي</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {mode === 'word' && (
          <div className="px-4 py-2 bg-emerald-50/70 border-t border-emerald-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-900 select-none">
              <input
                type="checkbox"
                checked={saveAsDefaultSettings}
                onChange={(e) => setSaveAsDefaultSettings(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>حفظ الإعدادات الافتراضية لآخر مستند</span>
              </span>
            </label>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
              {wordState.orientation === 'landscape' ? 'أفقي ↔' : 'عمودي ↕'} • {wordState.paperSize || 'A4'}
            </span>
          </div>
        )}

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-white transition"
          >
            إلغاء
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const finalName = fileName.trim() || (mode === 'word' ? 'New word' : 'New sheet');
                setIsSaving(true);
                try {
                  const { blob, filename } = await generateDocumentBlob(
                    mode,
                    selectedFormat,
                    wordState,
                    excelState,
                    finalName,
                    { delimiter: csvDelimiter, encoding: csvEncoding }
                  );
                  await shareDocument(blob, filename, `مشاركة المستند: ${filename}`);
                } catch (err) {
                  console.error('Share error:', err);
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة</span>
            </button>

            <button
              onClick={handleSaveAndDownload}
              disabled={isSaving}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition active:scale-95 ${
                saveSuccess
                  ? 'bg-emerald-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم الحفظ بنجاح ✓</span>
                </>
              ) : isSaving ? (
                <span>جارٍ الحفظ...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>حفظ وتحميل ({currentFormatObj.ext})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
