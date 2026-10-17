import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { fileSystemService, FileSystemService } from './FileSystemService';

export { fileSystemService, FileSystemService };

/**
 * Ensures that the default download and documents directories exist on native Android devices.
 * Uses Capacitor Filesystem safely wrapped in try-catch to prevent any crash.
 * Creates '/storage/emulated/0/Download documents Word excel/' on Android startup.
 */
export async function ensureDefaultDownloadFolder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Initialize target directory '/storage/emulated/0/Download documents Word excel/'
    await fileSystemService.initAppDirectories();

    // Ensure Documents/OfficeSuites folder also exists for backwards compatibility
    await Filesystem.mkdir({
      path: 'OfficeSuites',
      directory: Directory.Documents,
      recursive: true
    }).catch(() => {
      // Ignore if folder already exists
    });

    // Ensure Cache folder exists for export & share operations
    await Filesystem.mkdir({
      path: 'temp_exports',
      directory: Directory.Cache,
      recursive: true
    }).catch(() => {
      // Ignore if exists
    });
  } catch (error) {
    console.warn('Native folder initialization notice:', error);
  }
}

