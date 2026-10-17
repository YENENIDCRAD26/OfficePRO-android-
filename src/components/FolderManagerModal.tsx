import React, { useState, useEffect } from 'react';
import { 
  X, 
  Folder, 
  FolderPlus, 
  Smartphone, 
  HardDrive, 
  Trash2, 
  Edit2, 
  Check, 
  Plus, 
  ArrowRight, 
  FolderOpen,
  ShieldCheck,
  FileCheck2,
  Lock,
  Sparkles
} from 'lucide-react';
import { getNativeDirectoryList, createNativDirectory } from '../utils/capacitorStorage';

export interface FolderItem {
  id: string;
  name: string;
  storage: 'internal' | 'sd';
  path: string;
  fileCount?: number;
  createdAt: string;
  permission?: 'read-write' | 'read-only';
  type?: string;
}

interface FolderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolder: string;
  currentStorage: 'internal' | 'sd';
  onSelectFolder: (folderName: string, storage: 'internal' | 'sd') => void;
}

export const FolderManagerModal: React.FC<FolderManagerModalProps> = ({
  isOpen,
  onClose,
  currentFolder,
  currentStorage,
  onSelectFolder
}) => {
  const [storageType, setStorageType] = useState<'internal' | 'sd'>(currentStorage);
  const [selectedFolder, setSelectedFolder] = useState<string>(currentFolder);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const [folders, setFolders] = useState<FolderItem[]>(() => {
    try {
      const saved = localStorage.getItem('office_folders_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', name: 'مجلد التنزيلات (Download)', storage: 'internal', path: '/storage/emulated/0/Download', fileCount: 24, createdAt: 'اليوم' },
      { id: '2', name: 'سطح المكتب (Desktop)', storage: 'internal', path: '/storage/emulated/0/Desktop', fileCount: 12, createdAt: 'أمس' },
      { id: '3', name: 'المستندات الرسمية (Documents)', storage: 'internal', path: '/storage/emulated/0/Documents', fileCount: 38, createdAt: '15 سبتمبر' },
      { id: '4', name: 'Al-Bayan Docs', storage: 'internal', path: '/storage/emulated/0/Al-Bayan Docs', fileCount: 8, createdAt: '20 سبتمبر' },
      { id: '5', name: 'العقود والاتفاقيات', storage: 'internal', path: '/storage/emulated/0/العقود والاتفاقيات', fileCount: 14, createdAt: '18 سبتمبر' },
      { id: '6', name: 'بطاقة SD (النسخ الاحتياطي للمكتب)', storage: 'sd', path: '/storage/sdcard1/Office_Backup', fileCount: 52, createdAt: '10 سبتمبر' },
      { id: '7', name: 'أرشيف القضايا (SD Card)', storage: 'sd', path: '/storage/sdcard1/Archive_Docs', fileCount: 19, createdAt: '5 سبتمبر' },
    ];
  });

  useEffect(() => {
    setSelectedFolder(currentFolder);
    setStorageType(currentStorage);
    if (isOpen) {
      // Sync with Capacitor filesystem
      getNativeDirectoryList().then((items) => {
        if (items && items.length > 0) {
          const nativeFolders: FolderItem[] = items
            .filter(i => i.type === 'directory')
            .map((f, idx) => ({
              id: `native_${idx}_${f.name}`,
              name: f.name,
              storage: 'internal',
              path: `/storage/emulated/0/Documents/${f.name}`,
              fileCount: 0,
              createdAt: 'عبر Capacitor'
            }));
          if (nativeFolders.length > 0) {
            setFolders(prev => {
              const existingNames = new Set(prev.map(p => p.name));
              const merged = [...nativeFolders.filter(nf => !existingNames.has(nf.name)), ...prev];
              return merged;
            });
          }
        }
      }).catch(err => console.warn('Native dir read error:', err));
    }
  }, [isOpen, currentFolder, currentStorage]);

  const saveFolders = (newFolders: FolderItem[]) => {
    setFolders(newFolders);
    try {
      localStorage.setItem('office_folders_list', JSON.stringify(newFolders));
    } catch {}
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const folderName = newFolderName.trim();
    await createNativDirectory(folderName);

    const item: FolderItem = {
      id: Date.now().toString(),
      name: folderName,
      storage: storageType,
      path: storageType === 'internal' ? `/storage/emulated/0/Documents/${folderName}` : `/storage/sdcard1/${folderName}`,
      fileCount: 0,
      createdAt: 'الآن'
    };
    saveFolders([item, ...folders]);
    setSelectedFolder(item.name);
    setNewFolderName('');
    setIsCreating(false);
  };


  const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا المجلد؟')) {
      const updated = folders.filter((f) => f.id !== id);
      saveFolders(updated);
    }
  };

  const handleStartRename = (folder: FolderItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingName.trim()) return;
    const updated = folders.map((f) => f.id === id ? { ...f, name: editingName.trim() } : f);
    saveFolders(updated);
    setEditingFolderId(null);
  };

  const filteredFolders = folders.filter((f) => f.storage === storageType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 select-none font-sans" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-slate-100">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">إدارة المجلدات ووحدات التخزين ⚙️</h3>
              <p className="text-[11px] text-slate-400">إنشاء وتحرير وحذف واختيار مسارات حفظ المستندات</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Storage Type Quick Switcher */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStorageType('internal')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                storageType === 'internal'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-1 ring-blue-400/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>ذاكرة الجوال 📱 (التخزين الداخلي)</span>
            </button>

            <button
              onClick={() => setStorageType('sd')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                storageType === 'sd'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md ring-1 ring-amber-400/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
            >
              <HardDrive className="w-4 h-4 text-amber-300" />
              <span>بطاقة الذاكرة SD 💾 (النسخ الاحتياطي)</span>
            </button>
          </div>

          {/* Permissions Status Pill (صلاحيات القراءة والكتابة والإنشاء والتعديل) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>حالة صلاحيات التخزين:</span>
              <span className="text-emerald-400 font-bold">قراءة وكتابة كاملة (Read/Write) ✓</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-sans">
                إنشاء • تعديل • حذف
              </span>
            </div>
          </div>
        </div>

        {/* Create Folder Box */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          {isCreating ? (
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                autoFocus
                placeholder="اسم المجلد الجديد..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="flex-1 bg-slate-800 border border-blue-500 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
              />
              <button
                onClick={handleCreateFolder}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
              >
                إنشاء
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-2 py-1 text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-400 font-medium">
                المجلدات المتاحة في: {storageType === 'internal' ? 'الذاكرة الداخلية' : 'بطاقة SD'}
              </span>
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ إنشاء مجلد جديد</span>
              </button>
            </div>
          )}
        </div>

        {/* Folders List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[45vh]">
          {filteredFolders.map((f) => {
            const isSelected = selectedFolder === f.name;
            const isEditing = editingFolderId === f.id;

            return (
              <div
                key={f.id}
                onClick={() => setSelectedFolder(f.name)}
                className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer select-none ${
                  isSelected
                    ? 'bg-blue-950/80 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    <Folder className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="bg-slate-900 border border-blue-400 px-2 py-0.5 rounded text-xs text-white"
                        />
                        <button onClick={(e) => handleSaveRename(f.id, e)} className="p-1 text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold truncate">{f.name}</h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-mono font-medium">
                            قراءة وكتابة ✓
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-slate-400 font-mono truncate">{f.path}</p>
                          <span className="text-[9px] text-slate-400 shrink-0">• {f.fileCount ?? 12} ملف</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 mr-2">
                  {isSelected && (
                    <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" />
                      <span>محدد</span>
                    </span>
                  )}
                  <button
                    onClick={(e) => handleStartRename(f, e)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700"
                    title="تعديل اسم المجلد"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteFolder(f.id, e)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/50"
                    title="حذف المجلد"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-slate-400">
            المجلد النشط: <strong className="text-blue-400">{selectedFolder}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              onClick={() => {
                onSelectFolder(selectedFolder, storageType);
                onClose();
              }}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md"
            >
              اختيار وتطبيق المجلد ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
