import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

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

const STORAGE_KEY = 'office_app_custom_folders';

export async function getNativeDirectoryList(): Promise<FolderItem[]> {
  const defaultFolders: FolderItem[] = [
    {
      id: 'docs-default',
      name: 'Documents',
      storage: 'internal',
      path: 'Documents',
      fileCount: 5,
      createdAt: new Date().toISOString().split('T')[0],
      permission: 'read-write',
    },
    {
      id: 'downloads-default',
      name: 'Downloads',
      storage: 'internal',
      path: 'Download',
      fileCount: 12,
      createdAt: new Date().toISOString().split('T')[0],
      permission: 'read-write',
    },
    {
      id: 'legal-docs',
      name: 'مستندات قانونية ومذكرات',
      storage: 'internal',
      path: 'Documents/Legal',
      fileCount: 8,
      createdAt: new Date().toISOString().split('T')[0],
      permission: 'read-write',
    },
    {
      id: 'excel-sheets',
      name: 'جداول الميزانيات والحسابات',
      storage: 'internal',
      path: 'Documents/Sheets',
      fileCount: 4,
      createdAt: new Date().toISOString().split('T')[0],
      permission: 'read-write',
    },
    {
      id: 'download-docs-word-excel',
      name: 'Download documents Word excel',
      storage: 'internal',
      path: '/storage/emulated/0/Download documents Word excel/',
      fileCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      permission: 'read-write',
    },
    {
      id: 'sd-archive',
      name: 'أرشيف بطاقة الذاكرة الخارجية',
      storage: 'sd',
      path: 'SDCard/OfficeArchive',
      fileCount: 20,
      createdAt: new Date().toISOString().split('T')[0],
      permission: 'read-write',
    }
  ];

  try {
    // If native, try to read or ensure folders via Capacitor Filesystem
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.mkdir({
          path: 'Download documents Word excel',
          directory: Directory.ExternalStorage,
          recursive: true
        });
      } catch {
        // ignore already exists
      }
      try {
        await Filesystem.mkdir({
          path: '/storage/emulated/0/Download documents Word excel/',
          recursive: true
        });
      } catch {
        // ignore already exists
      }
      try {
        await Filesystem.mkdir({
          path: 'Documents/OfficeSuites',
          directory: Directory.Documents,
          recursive: true
        });
      } catch {
        // ignore already exists
      }
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: FolderItem[] = JSON.parse(saved);
      return [...defaultFolders, ...parsed];
    }
  } catch (err) {
    console.warn('Error reading directory list:', err);
  }

  return defaultFolders;
}

export async function createNativDirectory(folderName: string, storage: 'internal' | 'sd' = 'internal'): Promise<boolean> {
  try {
    const cleanName = folderName.trim();
    if (!cleanName) return false;

    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.mkdir({
          path: `Documents/${cleanName}`,
          directory: Directory.Documents,
          recursive: true
        });
      } catch (nativeErr) {
        console.warn('Native mkdir error (may already exist):', nativeErr);
      }
    }

    // Persist to local custom list
    const newFolder: FolderItem = {
      id: 'folder-' + Date.now(),
      name: cleanName,
      storage,
      path: storage === 'sd' ? `SDCard/${cleanName}` : `Documents/${cleanName}`,
      fileCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      permission: 'read-write',
    };

    const saved = localStorage.getItem(STORAGE_KEY);
    const existing: FolderItem[] = saved ? JSON.parse(saved) : [];
    existing.push(newFolder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    return true;
  } catch (err) {
    console.error('Failed to create directory:', err);
    return false;
  }
}
